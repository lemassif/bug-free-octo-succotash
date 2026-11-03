/* ============================================================
   Spelling Rocket, end to end

   Run it:
     npx http-server -p 8099 -s .          (from the repo root)
     node chance/test/rocket.js

   Walks the whole journey the way Chance and a grown-up would:

     🚀 tile -> type the week's words -> grown-up check -> save
       -> build a rocket -> tap the planet or star with the spoken
          word (a real tap; a wrong one first) -> say it (fake
          microphone) -> spell it on the keyboard (a miss first,
          then right) -> a rocket piece flies onto the pad
       -> five pieces -> LAUNCH -> Venus -> soccer break with real
          swipes -> new rocket -> Saturn -> galaxy -> beyond
       -> stars, the report, and leaving halfway saves the rocket
       -> the recording booth lists every rocket line, and a
          recorded line plays instead of the computer voice

   Also checks the things that would quietly ruin it on an iPad:
   autocorrect and friends switched off on the spelling box, the
   word hidden while he spells it, and no console errors.
   ============================================================ */

const { chromium } = require(process.env.PW ||
  '/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8099/chance/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const WORDS = ['light', 'night', 'bright', 'right', 'sight', 'float', 'boat'];

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 834, height: 1112 } });
  const errors = [];
  page.on('console', m => {
    if (m.type() === 'error' && !/favicon|Failed to load resource/i.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const wait = (ms) => page.waitForTimeout(ms);
  const until = async (fn, arg, ms) => {
    const end = Date.now() + (ms || 8000);
    while (Date.now() < end) {
      if (await page.evaluate(fn, arg)) return true;
      await wait(60);
    }
    return false;
  };
  const tapAction = (label) => page.evaluate((l) => {
    const b = [...document.querySelectorAll('.actions .btn-big')].find(x => x.textContent.includes(l));
    if (!b) throw new Error('no action "' + l + '"');
    b.click();
  }, label);
  const tapIn = (sel, label) => page.evaluate(([s, l]) => {
    const b = [...document.querySelectorAll(s)].find(x => x.textContent.includes(l));
    if (!b) throw new Error('no button "' + l + '" in ' + s);
    b.click();
  }, [sel, label]);
  const mode = () => page.evaluate(() => Rocket._game() ? Rocket._game().mode : null);
  const built = () => page.evaluate(() => Rocket._state().journey.built);

  /* A stand-in for the iPad's speech recogniser: it "hears" whatever
     the test puts in window.__heard. Also counts which lines were
     played from a recording. */
  await page.addInitScript(() => {
    window.__heard = '';
    window.SpeechRecognition = window.webkitSpeechRecognition = function () {
      const r = this;
      r.start = () => setTimeout(() => {
        const t = window.__heard;
        if (!t) { if (r.onend) r.onend(); return; }
        const res = [{ transcript: t }]; res.isFinal = true;
        if (r.onresult) r.onresult({ resultIndex: 0, results: [res] });
      }, 120);
      r.stop = () => {}; r.abort = () => {};
    };
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('SETUP');
  const tile = await page.$('[data-go="rocket"]');
  check('home has a Spelling Rocket tile', !!tile);
  await tile.click();
  await wait(200);
  check('setup offers the camera', await page.evaluate(() => !!document.querySelector('#rocketBody .scan-hero')));
  await tapIn('#rocketBody button', 'Type the words');
  await wait(150);
  for (const w of WORDS) {
    await page.fill('.scan-row input[placeholder="Add a word…"]', w);
    await page.press('.scan-row input[placeholder="Add a word…"]', 'Enter');
  }
  check('grown-up check has no math section', await page.evaluate(() => !document.getElementById('rocketBody').textContent.includes('MATH PROBLEMS')));
  await tapAction('Save this week');
  await wait(200);
  const chips = await page.evaluate(() => [...document.querySelectorAll('.rk-chip')].map(c => c.textContent));
  check('the week\'s words are saved', chips.join(',') === WORDS.join(','), chips.join(','));
  const trail = await page.evaluate(() => [...document.querySelectorAll('.rk-stop')].map(s => s.textContent));
  check('the trail shows Venus, Saturn, galaxy, beyond', trail.length === 4 && trail[0].includes('Venus') && trail[1].includes('Saturn') &&
    trail[2].includes('galaxy') && trail[3].includes('beyond'), trail.join(' | '));
  check('the go button says build a rocket', (await page.evaluate(() => document.querySelector('.rk-go').textContent)).includes('Build a rocket'));
  await page.evaluate(() => App.go('home'));
  check('home tile counts words to the first launch', await page.evaluate(() => document.getElementById('tileRocketCount').textContent) === '5');

  console.log('RECORDING BOOTH');
  await page.click('[data-go="rocket"]');
  await wait(150);
  await tapIn('#rocketBody button', 'Record your voice for the rocket');
  await wait(200);
  const booth = await page.evaluate(() => ({
    shown: !document.getElementById('screen-studio').hidden,
    text: document.getElementById('studioBody').textContent
  }));
  check('the button opens the rocket group in the booth', booth.shown && booth.text.includes('Spelling Rocket: your voice'), booth.text.slice(0, 80));
  check('the first line to record is the welcome', booth.text.includes(await page.evaluate(() => Rocket.LINES.start)));
  const inv = await page.evaluate(() => {
    const g = Recordings.inventory().find(x => x.id === 'rocket');
    return { n: g.lines.length, texts: g.lines.map(l => l.text) };
  });
  check('every rocket line and every word is recordable', inv.texts.includes('Great job Chance! Now we can build a rocket to go to Venus!') &&
    inv.texts.includes('Great job Chance! Now we can build a rocket to go to Saturn!') &&
    inv.texts.includes('Great job Chance! Now we can build a rocket to go beyond the galaxy!') &&
    WORDS.every(w => inv.texts.includes(w)), inv.n + ' lines');
  check('the old rocket phrases are gone from the app group', await page.evaluate(() =>
    !Recordings.inventory().find(x => x.id === 'app').lines.some(l => /Amazing flying|Back to space for more/.test(l.text))));

  /* Pretend Grandpa recorded the "find" line: from now on it must
     come from the recording, not the computer voice. */
  await page.evaluate(() => {
    window.__played = [];
    const has = Recordings.has, play = Recordings.play;
    Recordings.has = (t, k) => t === Rocket.LINES.find || has(t, k);
    Recordings.play = (t, k) => { if (t === Rocket.LINES.find) { window.__played.push(t); return Promise.resolve(true); } return play(t, k); };
  });

  await page.evaluate(() => App.go('rocket'));
  await wait(150);

  console.log('FIND');
  const starsBefore = await page.evaluate(() => Progress.data.totals.stars);
  await page.click('.rk-go');
  await wait(500);
  const g1 = await page.evaluate(() => { const g = Rocket._game(); return { word: g.word, words: g.bodies.map(b => b.word), kinds: g.bodies.map(b => b.kind) }; });
  check('four planets and stars carry words', g1.words.length === 4, g1.words.join(',') + ' / ' + g1.kinds.join(','));
  check('there are planets and stars', g1.kinds.includes('planet') && g1.kinds.includes('star'), g1.kinds.join(','));
  check('the target is up there exactly once', g1.words.filter(w => w === g1.word).length === 1, g1.word);
  check('the target word is not printed in the prompt',
    !(await page.evaluate(() => document.querySelector('.rk-prompt').textContent)).includes(g1.word));
  check('the floating Stop stays out of the game', await page.evaluate(() => {
    const f = document.querySelector('.float-stop'); return !f || f.hidden;
  }));
  check('"Find this word" played from Grandpa\'s recording', await until(() => window.__played.length > 0, null, 6000));
  check('the pad shows 0 of 5 pieces', (await built()) === 0 &&
    await page.evaluate(() => document.querySelectorAll('.rk-pips i.off').length + document.querySelectorAll('.rk-pips i.now').length === 5));

  const cb = await page.$eval('.rk-canvas', c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await until(() => Rocket._game().bodies.every(b => b.alpha > 0.9), null, 3000);
  // a wrong planet first: nothing bad happens, it just reads it to him
  const wrongB = await page.evaluate(() => { const b = Rocket._game().bodies.find(x => !x.target); return { x: b.x, y: b.y, w: b.word }; });
  await page.mouse.click(cb.x + wrongB.x, cb.y + wrongB.y);
  await wait(100);
  check('a wrong tap keeps him looking', (await mode()) === 'find');
  const findEv = await page.evaluate(() => Progress.data.log.filter(e => e.domain === 'rocket-find').slice(-1)[0]);
  check('the wrong tap is logged', findEv && findEv.correct === false, findEv && findEv.word);
  const tgt = await page.evaluate(() => { const b = Rocket._game().bodies.find(x => x.target); return { x: b.x, y: b.y }; });
  await page.mouse.click(cb.x + tgt.x, cb.y + tgt.y);
  await wait(100);
  check('tapping the right planet or star finds it', (await mode()) === 'say', await mode());

  console.log('SAY');
  check('the found word is shown to read aloud', (await page.evaluate(() => document.querySelector('.rk-word').textContent)) === g1.word);
  await page.evaluate(() => { window.__heard = 'banana'; });
  await page.click('.rk-card .mic-btn');
  await until(() => /I heard/.test(document.querySelector('.rk-card .heard').textContent), null, 4000);
  const heardText = await page.evaluate(() => document.querySelector('.rk-card .heard').textContent);
  check('saying the wrong word coaches and stays put', (await mode()) === 'say' && heardText.includes('I heard: banana'), heardText);
  await page.evaluate((w) => { window.__heard = w; }, g1.word);
  await until(() => !document.querySelector('.rk-card .mic-btn.live'), null, 4000);
  await page.click('.rk-card .mic-btn');
  check('saying it right moves on to spelling', await until(() => Rocket._game().mode === 'spell', null, 15000), await mode());

  console.log('SPELL');
  const attrs = await page.$eval('.rk-input', i => ({
    ac: i.getAttribute('autocorrect'), cap: i.getAttribute('autocapitalize'), sc: i.getAttribute('spellcheck'),
    comp: i.getAttribute('autocomplete'), focused: document.activeElement === i
  }));
  check('iPad autocorrect is off', attrs.ac === 'off' && attrs.cap === 'none' && attrs.sc === 'false' && attrs.comp === 'off', JSON.stringify(attrs));
  check('the keyboard is up (spelling box focused)', attrs.focused);
  check('the word is hidden while he spells it', !(await page.evaluate(() => document.querySelector('.rk-panel').textContent)).includes(g1.word));
  const wrong = await page.evaluate((w) => Homework.misspellings(w)[0].t, g1.word);
  await page.keyboard.type(wrong.toUpperCase());     // capitals arrive as lower case
  await page.keyboard.press('Enter');
  await wait(150);
  const marks = await page.evaluate(() => [...document.querySelectorAll('.rk-box')].map(b => b.className.replace('rk-box', '').trim() || '-'));
  check('a miss marks letters green and orange', marks.includes('fix'), wrong + ' -> ' + marks.join(' '));
  check('still spelling after a miss', (await mode()) === 'spell');
  const ev = await page.evaluate(() => Progress.data.log.filter(e => e.domain === 'rocket-spelling').slice(-1)[0]);
  check('the miss is logged with its habit', ev && ev.correct === false && !!ev.tag && ev.typed === wrong, ev && (ev.tag + ' ' + ev.typed));
  await page.fill('.rk-input', '');
  await page.keyboard.type(g1.word);
  await page.keyboard.press('Enter');
  await wait(100);
  check('right spelling -> a rocket piece', (await mode()) === 'piece');
  check('the piece flies onto the pad, then the next word', await until(() => Rocket._game().mode === 'find' && Rocket._state().journey.built === 1, null, 5000));
  check('the HUD shows 1 piece built', await page.evaluate(() => document.querySelectorAll('.rk-pips i.on').length) === 1);
  const g2 = await page.evaluate(() => Rocket._game().word);
  check('a new word to find', g2 !== g1.word, g1.word + ' -> ' + g2);

  // the rest, quickly: find, say, spell, wait for the piece
  async function oneWord() {
    await until(() => Rocket._game() && Rocket._game().mode === 'find', null, 6000);
    await page.evaluate(() => Rocket._found());
    await wait(60);
    await tapIn('.rk-card button', 'I said it');
    await wait(60);
    const w = await page.evaluate(() => Rocket._game().word);
    await page.keyboard.type(w);
    await page.keyboard.press('Enter');
    await until(() => ['find', 'ready'].includes(Rocket._game().mode), null, 5000);
    return w;
  }
  for (let k = 2; k <= 5; k++) await oneWord();
  check('five words -> rocket built', (await mode()) === 'ready' && (await built()) === 5, await mode());
  check('the launch button names Venus', (await page.evaluate(() => document.querySelector('.rk-launch').textContent)).includes('LAUNCH to Venus'));
  check('the whole rocket is on the pad', await page.evaluate(() => document.querySelectorAll('.rk-pips i.on').length) === 5);

  console.log('LAUNCH');
  await page.click('.rk-launch');
  check('countdown, blast off, arrive at Venus', await until(() => Rocket._game().mode === 'arrive', null, 10000), await mode());
  check('Venus is on screen', await page.evaluate(() => Rocket._game().dest.leg === 0 && document.querySelector('.rk-panel').textContent.includes('Venus')));
  check('a star for reaching Venus', (await page.evaluate(() => Progress.data.totals.stars)) - starsBefore === 1);
  check('the next rocket starts empty', (await built()) === 0 && await page.evaluate(() => Rocket._state().journey.leg) === 1);

  console.log('SOCCER');
  await tapIn('.rk-panel button', 'Soccer');
  await wait(200);
  check('soccer break starts', (await mode()) === 'soccer');
  const results = [];
  for (let s = 0; s < 5; s++) {
    await until(() => Rocket._soccer() && Rocket._soccer().phase === 'aim', null, 5000);
    const spot = await page.evaluate(() => Rocket._soccer().spot);
    const dx = (s % 2 ? 1 : -1) * cb.w * 0.12;
    await page.mouse.move(cb.x + spot.x, cb.y + spot.y);
    await page.mouse.down();
    await page.mouse.move(cb.x + spot.x + dx * 0.5, cb.y + spot.y - 120, { steps: 3 });
    await page.mouse.move(cb.x + spot.x + dx, cb.y + spot.y - 260, { steps: 3 });
    await page.mouse.up();
    await wait(60);
    results.push(await page.evaluate(() => Rocket._soccer() && Rocket._soccer().phase));
    await until(() => !Rocket._soccer() || Rocket._soccer().phase !== 'flight', null, 3000);
  }
  check('a finger swipe kicks the ball', results.every(p => p === 'flight' || p === 'result'), results.join(','));
  check('five shots, then back to space', await until(() => {
    const b = document.querySelector('.rk-launch'); return !!b && b.textContent.includes('Back to space');
  }, null, 6000));
  console.log('       (' + (await page.evaluate(() => Rocket._soccer().goals)) + ' goals out of 5)');
  await page.click('.rk-launch');
  check('back in space building the Saturn rocket', await until(() => Rocket._game().mode === 'find', null, 4000) &&
    (await page.evaluate(() => Rocket._game().layer.querySelector('.rk-label').textContent)).includes('Saturn'));

  console.log('SATURN, GALAXY, BEYOND');
  async function leg(name) {
    for (let k = 0; k < 5; k++) await oneWord();
    const label = await page.evaluate(() => document.querySelector('.rk-launch') && document.querySelector('.rk-launch').textContent);
    check('5 more words -> LAUNCH to ' + name, (label || '').includes(name), label);
    await page.click('.rk-launch');
    return until(() => Rocket._game().mode === 'arrive', null, 10000);
  }
  check('arrive at Saturn', await leg('Saturn'));
  await tapIn('.rk-panel button', 'Soccer');
  await until(() => Rocket._soccer() && Rocket._soccer().phase === 'aim', null, 3000);
  // skip the shots: straight back to space
  await page.evaluate(() => { const s = Rocket._soccer(); s.shots = 5; s.phase = 'result'; s.msgT = 0; });
  await until(() => !!document.querySelector('.rk-launch') && document.querySelector('.rk-launch').textContent.includes('Back to space'), null, 3000);
  await page.click('.rk-launch');
  check('arrive at a new galaxy', await leg('a new galaxy'));
  await tapIn('.rk-panel button', 'Soccer');
  await until(() => Rocket._soccer() && Rocket._soccer().phase === 'aim', null, 3000);
  await page.evaluate(() => { const s = Rocket._soccer(); s.shots = 5; s.phase = 'result'; s.msgT = 0; });
  await until(() => !!document.querySelector('.rk-launch') && document.querySelector('.rk-launch').textContent.includes('Back to space'), null, 3000);
  await page.click('.rk-launch');
  check('arrive beyond the galaxy', await leg('beyond the galaxy'));
  check('the last stop offers Finish', (await page.evaluate(() => document.querySelector('.rk-launch').textContent)).includes('Finish'));
  check('20 words spelled', await page.evaluate(() => Rocket._state().journey.spelled) === 20);
  await page.click('.rk-launch');
  await wait(200);
  check('super speller card', (await mode()) === 'done' &&
    (await page.evaluate(() => document.querySelector('.rk-panel').textContent)).includes('beyond the galaxy'));
  const summary = await page.evaluate(() => document.querySelector('.rk-sum').textContent);
  check('the summary names the word to practise', summary.includes(g1.word), summary);
  const starsAfter = await page.evaluate(() => Progress.data.totals.stars);
  check('one star for each stop', starsAfter - starsBefore === 4, starsBefore + ' -> ' + starsAfter);

  await tapIn('.rk-panel button', 'Home');
  await wait(200);
  check('Home leaves the game', await page.evaluate(() => !document.querySelector('.rk-layer') && !document.getElementById('screen-home').hidden));
  check('home tile is quiet after the whole journey', await page.evaluate(() => document.getElementById('tileRocketCount').textContent) !== '5');

  console.log('REPORT');
  await page.evaluate(() => App.go('grownup'));
  await wait(150);
  const report = await page.evaluate(() => document.getElementById('grownupBody').textContent);
  check('the report has a Spelling Rocket section', report.includes('SPELLING ROCKET'));
  check('it lists the word to practise', report.includes('Practice these: ' + g1.word), report.slice(report.indexOf('SPELLING ROCKET'), report.indexOf('SPELLING ROCKET') + 120));
  check('it names the subjects', report.includes('Spelling Rocket: typing the spelling') && report.includes('Spelling Rocket: finding the word'));

  console.log('RESUME');
  await page.evaluate(() => App.go('rocket'));
  await wait(150);
  await page.click('.rk-go');
  await wait(300);
  await oneWord();
  await page.click('.rk-hbtn');               // 🏠 in the game
  await wait(100);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#sheet button')].find(x => x.textContent.includes('Yes, go home')); b.click();
  });
  await wait(150);
  await page.evaluate(() => App.go('rocket'));
  await wait(150);
  const resume = await page.evaluate(() => document.querySelector('.rk-go').textContent);
  check('leaving halfway saves the rocket', resume.includes('Keep building') && resume.includes('1 of 5'), resume);
  check('home tile counts words to the launch', await page.evaluate(() => { App.go('home'); return document.getElementById('tileRocketCount').textContent; }) === '4');

  console.log('\nCONSOLE ERRORS: ' + (errors.length ? errors.join('\n  ') : 'none'));
  if (errors.length) failures++;
  console.log(failures ? '\n' + failures + ' FAILED' : '\nall checks passed');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
