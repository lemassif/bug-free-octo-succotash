/* ============================================================
   Spelling Rocket, end to end

   Run it:
     npx http-server -p 8099 -s .          (from the repo root)
     node chance/test/rocket.js

   Walks the whole week the way Chance and a grown-up would:

     🚀 tile -> type the week's words -> grown-up check -> save
       -> blast off -> steer the rocket to the spoken word (a real
          finger drag) -> say it -> spell it on the keyboard (a miss
          first, then right) -> LAUNCH -> next word
       -> after five words, the soccer break with real swipes
       -> back to space -> finish the list -> stars and the report
       -> leaving halfway saves his place

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

  /* A stand-in for the iPad's speech recogniser: it "hears" whatever
     the test puts in window.__heard. */
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
  await page.evaluate(() => App.go('home'));
  check('home tile counts the words', await page.evaluate(() => document.getElementById('tileRocketCount').textContent) === '7');
  await page.click('[data-go="rocket"]');
  await wait(150);

  console.log('FLY');
  const starsBefore = await page.evaluate(() => Progress.data.totals.stars);
  await page.click('.rk-go');
  await wait(400);
  const g1 = await page.evaluate(() => { const g = Rocket._game(); return { word: g.word, words: g.bubbles.map(b => b.word) }; });
  check('four words race across the sky', g1.words.length === 4, g1.words.join(','));
  check('the target is up there exactly once', g1.words.filter(w => w === g1.word).length === 1, g1.word);
  check('the target word is not printed in the prompt',
    !(await page.evaluate(() => document.querySelector('.rk-prompt').textContent)).includes(g1.word));
  check('the floating Stop stays out of the game', await page.evaluate(() => {
    const f = document.querySelector('.float-stop'); return !f || f.hidden;
  }));

  // fly there with a real finger drag, chasing the moving word
  const canvasBox = await page.$eval('.rk-canvas', c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top }; });
  let pos = await page.evaluate(() => { const r = Rocket._game().rocket; return { x: r.x, y: r.y }; });
  await page.mouse.move(canvasBox.x + pos.x, canvasBox.y + pos.y);
  await page.mouse.down();
  let found = false;
  for (let i = 0; i < 160 && !found; i++) {
    const t = await page.evaluate(() => {
      const g = Rocket._game(), b = g.bubbles.find(x => x.target);
      return { x: b.x, y: b.y + 70 * g.S + 10, mode: g.mode };
    });
    if (t.mode !== 'fly') { found = true; break; }
    await page.mouse.move(canvasBox.x + t.x, canvasBox.y + t.y, { steps: 2 });
    await wait(50);
  }
  await page.mouse.up();
  check('steering the rocket into the word docks it', (await mode()) === 'say', await mode());

  console.log('SAY');
  check('the found word is shown to read aloud', (await page.evaluate(() => document.querySelector('.rk-word').textContent)) === g1.word);
  check('there is a microphone and an I-said-it button', await page.evaluate(() =>
    !!document.querySelector('.rk-card .mic-btn') && [...document.querySelectorAll('.rk-card button')].some(b => b.textContent.includes('I said it'))));
  await tapIn('.rk-card button', 'I said it');
  await wait(150);
  check('then it asks him to spell it', (await mode()) === 'spell');

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
  await wait(200);
  check('right spelling -> ready to launch', (await mode()) === 'ready');
  check('the launch button is there', await page.evaluate(() => !!document.querySelector('.rk-launch') && document.querySelector('.rk-launch').textContent.includes('LAUNCH')));
  check('his place is saved', await page.evaluate(() => Rocket._state().pos) === 1);

  console.log('LAUNCH');
  await page.click('.rk-launch');
  check('countdown, blast off, next word', await until(() => Rocket._game().mode === 'fly' && Rocket._state().pos === 1, null, 6000));
  const g2 = await page.evaluate(() => Rocket._game().word);
  check('a new word to find', g2 !== g1.word, g1.word + ' -> ' + g2);

  // words 2 to 5, quickly: find, say, spell, launch
  async function oneWord(expectButton) {
    await page.evaluate(() => Rocket._found());
    await wait(80);
    await tapIn('.rk-card button', 'I said it');
    await wait(80);
    const w = await page.evaluate(() => Rocket._game().word);
    await page.keyboard.type(w);
    await page.keyboard.press('Enter');
    await wait(120);
    const label = await page.evaluate(() => document.querySelector('.rk-launch') && document.querySelector('.rk-launch').textContent);
    return label || '';
  }
  console.log('MICROPHONE');
  await page.evaluate(() => Rocket._found());
  await wait(80);
  const spokenBefore = await page.evaluate(() => Progress.data.totals.wordsSpoken);
  await page.evaluate(() => { window.__heard = 'banana'; });
  await page.click('.rk-card .mic-btn');
  await until(() => /I heard/.test(document.querySelector('.rk-card .heard').textContent), null, 4000);
  const heardText = await page.evaluate(() => document.querySelector('.rk-card .heard').textContent);
  check('saying the wrong word coaches and stays put', (await mode()) === 'say' && heardText.includes('I heard: banana'), heardText);
  await page.evaluate((w) => { window.__heard = w; }, g2);
  await until(() => !document.querySelector('.rk-card .mic-btn.live'), null, 4000);
  await page.click('.rk-card .mic-btn');
  check('saying it right moves on to spelling', await until(() => Rocket._game().mode === 'spell', null, 15000), await mode());
  check('it counts as a word read aloud', (await page.evaluate(() => Progress.data.totals.wordsSpoken)) === spokenBefore + 1);
  await page.keyboard.type(g2);
  await page.keyboard.press('Enter');
  await wait(120);
  check('word 2 -> LAUNCH', (await page.evaluate(() => document.querySelector('.rk-launch').textContent)).includes('LAUNCH'));
  await page.click('.rk-launch');
  await until(() => Rocket._game().mode === 'fly' && Rocket._state().pos === 2, null, 6000);

  for (let k = 3; k <= 4; k++) {
    const label = await oneWord();
    check('word ' + k + ' -> LAUNCH', label.includes('LAUNCH'), label);
    await page.click('.rk-launch');
    await until(() => Rocket._game().mode === 'fly', null, 6000);
  }
  const fifth = await oneWord();
  check('after five words: soccer break', fifth.includes('Soccer'), fifth);
  const pips = await page.evaluate(() => document.querySelectorAll('.rk-pips i.on').length);
  check('the round shows five stars', pips === 5, String(pips));

  console.log('SOCCER');
  await page.click('.rk-launch');
  await wait(200);
  check('soccer break starts', (await mode()) === 'soccer');
  const cb = await page.$eval('.rk-canvas', c => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const results = [];
  for (let s = 0; s < 5; s++) {
    await until(() => Rocket._soccer() && Rocket._soccer().phase === 'aim', null, 5000);
    const spot = await page.evaluate(() => Rocket._soccer().spot);
    // aim alternately at the left and right side of the goal
    const dx = (s % 2 ? 1 : -1) * cb.w * 0.12;
    await page.mouse.move(cb.x + spot.x, cb.y + spot.y);
    await page.mouse.down();
    await page.mouse.move(cb.x + spot.x + dx * 0.5, cb.y + spot.y - 120, { steps: 3 });
    await page.mouse.move(cb.x + spot.x + dx, cb.y + spot.y - 260, { steps: 3 });
    await page.mouse.up();
    await wait(60);
    const phase = await page.evaluate(() => Rocket._soccer() && Rocket._soccer().phase);
    results.push(phase);
    await until(() => !Rocket._soccer() || Rocket._soccer().phase !== 'flight', null, 3000);
  }
  check('a finger swipe kicks the ball', results.every(p => p === 'flight' || p === 'result'), results.join(','));
  check('five shots, then back to space', await until(() => {
    const b = document.querySelector('.rk-launch'); return !!b && b.textContent.includes('Back to space');
  }, null, 6000));
  const goals = await page.evaluate(() => Rocket._soccer().goals);
  console.log('       (' + goals + ' goals out of 5)');
  await page.click('.rk-launch');
  check('back in space for word 6', await until(() => Rocket._game().mode === 'fly' && Rocket._state().pos === 5, null, 4000));

  console.log('FINISH');
  const sixth = await oneWord();
  check('word 6 -> LAUNCH', sixth.includes('LAUNCH'), sixth);
  await page.click('.rk-launch');
  await until(() => Rocket._game().mode === 'fly', null, 6000);
  const last = await oneWord();
  check('the last word -> Finish', last.includes('Finish'), last);
  await page.click('.rk-launch');
  await wait(200);
  check('mission complete card', (await mode()) === 'done' &&
    (await page.evaluate(() => document.querySelector('.rk-panel').textContent)).includes('Mission complete'));
  const summary = await page.evaluate(() => document.querySelector('.rk-sum').textContent);
  check('the summary names the word to practise', summary.includes(g1.word), summary);
  const starsAfter = await page.evaluate(() => Progress.data.totals.stars);
  check('one star for each round of words', starsAfter - starsBefore === 2, starsBefore + ' -> ' + starsAfter);

  await tapIn('.rk-panel button', 'Home');
  await wait(200);
  check('Home leaves the game', await page.evaluate(() => !document.querySelector('.rk-layer') && !document.getElementById('screen-home').hidden));

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
  check('leaving halfway saves his place', resume.includes('Word 2 of 7'), resume);
  check('home tile counts what is left', await page.evaluate(() => { App.go('home'); return document.getElementById('tileRocketCount').textContent; }) === '6');

  console.log('\nCONSOLE ERRORS: ' + (errors.length ? errors.join('\n  ') : 'none'));
  if (errors.length) failures++;
  console.log(failures ? '\n' + failures + ' FAILED' : '\nall checks passed');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
