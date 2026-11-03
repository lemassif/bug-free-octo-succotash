/* ============================================================
   Sound-reliability tests.

   A headless browser has no voices, so this installs a fake speech
   engine that behaves like iOS where it matters: it can be paused
   (as iOS pauses it when the app is backgrounded), a paused engine
   accepts speak() and then never plays anything, and it records
   every call so we can see what the app actually asked it to do.

   Each test is one of the real ways the sound used to vanish.

   Run:  node chance/test/sound.js   (with the server from regress.js)
   ============================================================ */

const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8099/chance/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 834, height: 1112 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.addInitScript(() => {
    const log = [];
    const fake = {
      paused: false, speaking: false, pending: false,
      speak(u) {
        log.push({ op: 'speak', text: u.text, paused: this.paused });
        if (this.paused) return;                       // iOS: accepted, never plays
        setTimeout(() => {
          u.onstart && u.onstart();
          setTimeout(() => { log.push({ op: 'spoke', text: u.text }); u.onend && u.onend(); }, 15);
        }, 5);
      },
      cancel() { log.push({ op: 'cancel' }); },
      resume() { log.push({ op: 'resume' }); this.paused = false; },
      pause() { this.paused = true; },
      getVoices() { return []; },
      addEventListener() {}
    };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
    window.__synthLog = log;
    window.__synth = fake;
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const spoken = () => page.evaluate(() => window.__synthLog.filter(e => e.op === 'spoke').map(e => e.text));
  const reset = () => page.evaluate(() => { window.__synthLog.length = 0; Voice.stop(); });

  /* 1. one failing line must not silence everything after it */
  console.log('\nONE BAD LINE');
  await reset();
  await page.evaluate(async () => {
    // make the recorded-voice path blow up for one specific line
    const realHas = Recordings.has, realPlay = Recordings.play;
    Recordings.has = (t) => t === 'BROKEN' || realHas(t);
    Recordings.play = (t, k) => t === 'BROKEN' ? Promise.reject(new Error('db closed')) : realPlay(t, k);
    Voice.say('before');
    Voice.say('BROKEN');
    await Voice.say('after');
    Recordings.has = realHas; Recordings.play = realPlay;
  });
  await page.waitForTimeout(400);
  const s1 = await spoken();
  check('lines after a failure still play', s1.includes('after'), JSON.stringify(s1));

  /* 2. Stop means stop: nothing queued before the tap plays after it */
  console.log('\nSTOP');
  await reset();
  await page.evaluate(() => {
    Voice.say('one'); Voice.say('two'); Voice.say('three');
    Voice.stop();
  });
  await page.waitForTimeout(600);
  const s2 = await spoken();
  check('queued lines do not play after Stop', !s2.includes('two') && !s2.includes('three'), JSON.stringify(s2));
  await page.evaluate(() => Voice.say('fresh'));
  await page.waitForTimeout(500);
  check('a new line after Stop plays normally', (await spoken()).includes('fresh'));

  /* 3. iOS paused the engine while the app was in the background */
  console.log('\nPAUSED BY iOS');
  await reset();
  await page.evaluate(async () => { window.__synth.paused = true; await Voice.say('wake up'); });
  await page.waitForTimeout(300);
  const log3 = await page.evaluate(() => window.__synthLog.map(e => e.op + (e.text ? ':' + e.text : '') + (e.paused ? '(paused)' : '')));
  const resumedFirst = log3.indexOf('resume') !== -1 && log3.indexOf('resume') < log3.findIndex(x => x.startsWith('speak'));
  check('engine is resumed before speaking', resumedFirst, log3.join(' > '));
  check('the line actually plays', (await spoken()).includes('wake up'));

  /* 4. coming back from the background re-arms everything */
  console.log('\nBACK FROM THE BACKGROUND');
  await reset();
  const back = await page.evaluate(() => {
    Voice.unlock();
    Voice.say('stale line from before the screen locked');
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    return Voice.diagnose();
  });
  await page.waitForTimeout(400);
  const s4 = await spoken();
  check('stale line is dropped on return', !s4.includes('stale line from before the screen locked'), JSON.stringify(s4));
  check('unlock is re-armed for the next tap', back.unlocked === false);

  /* 5. a wedged engine (accepts speak, never starts) recovers */
  console.log('\nWEDGED ENGINE');
  await reset();
  await page.evaluate(() => {
    // wedge: speak() is swallowed but resume() does NOT clear it
    window.__realSpeak = window.__synth.speak;
    window.__synth.speak = function (u) { window.__synthLog.push({ op: 'speak', text: u.text, wedged: true }); };
    Voice.say('swallowed');
  });
  await page.waitForTimeout(3000);           // past the 2.5s stall detector
  await page.evaluate(() => { window.__synth.speak = window.__realSpeak; window.__synthLog.length = 0; Voice.say('after the wedge'); });
  await page.waitForTimeout(600);
  const log5 = await page.evaluate(() => window.__synthLog.map(e => e.op));
  const cancelAt = log5.indexOf('cancel'), speakAt = log5.indexOf('speak');
  check('a stalled line triggers a cancel before the next one',
    cancelAt !== -1 && cancelAt < speakAt, log5.join(' > '));
  check('speech works again after the wedge', (await spoken()).includes('after the wedge'));

  /* 6. the 🔊 button repairs before it replays */
  console.log('\nSPEAKER BUTTON');
  await page.evaluate(() => App.go('mission', { day: Curriculum.dayByNumber(1), station: 'discover' }));
  await page.waitForTimeout(400);
  await reset();
  await page.evaluate(() => { window.__synth.paused = true; document.getElementById('btnReplay').click(); });
  await page.waitForTimeout(1500);
  const s6 = await spoken();
  check('tapping 🔊 brings the sound back', s6.length > 0, s6.slice(0, 2).join(' / '));

  /* 7. Stop is findable: 🛑 in lessons, floating everywhere else */
  console.log('\nSTOP BUTTONS');
  const barStop = await page.evaluate(() => {
    const b = [...document.querySelectorAll('.actions .btn-big')].find(x => /Stop/.test(x.textContent));
    return b ? b.textContent : null;
  });
  check('lesson bar Stop is a stop sign', barStop && barStop.includes('🛑'), barStop);
  check('no floating Stop inside a lesson', await page.evaluate(() => document.querySelector('.float-stop').hidden));

  await page.evaluate(() => App.go('wordwall'));
  await page.waitForTimeout(300);
  await reset();
  check('floating Stop hidden while quiet', await page.evaluate(() => document.querySelector('.float-stop').hidden));
  await page.evaluate(() => { document.querySelector('#wordwallBody .badge').click(); });
  await page.waitForTimeout(80);
  check('floating Stop appears when the Word Wall talks', await page.evaluate(() => !document.querySelector('.float-stop').hidden));
  await page.evaluate(() => document.querySelector('.float-stop').click());
  await page.waitForTimeout(100);
  check('tapping it stops and hides it', await page.evaluate(() =>
    document.querySelector('.float-stop').hidden && !Voice.isTalking()));

  /* 8. the grown-up sound check */
  console.log('\nSOUND CHECK');
  await page.evaluate(() => App.go('grownup'));
  await page.waitForTimeout(400);
  const hasFix = await page.evaluate(() => {
    const b = [...document.querySelectorAll('#grownupBody .share-btn')].find(x => /Fix the sound/.test(x.textContent));
    if (!b) return false;
    b.click();
    return true;
  });
  check('grown-ups has a Fix the sound button', hasFix);
  await page.waitForTimeout(800);
  check('it says a test sentence', (await spoken()).some(t => /If you can hear me/.test(t)));

  console.log('\nPAGE ERRORS: ' + (errors.length ? errors.join('; ') : 'none'));
  if (errors.length) failures++;
  console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'all sound checks passed'));
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASHED:', e.message); process.exit(1); });
