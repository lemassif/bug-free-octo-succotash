/* ============================================================
   Chance Academy regression suite

   Run it:
     npx http-server -p 8099 -s .          (from the repo root)
     node chance/test/regress.js
     BASE=http://127.0.0.1:8099/dist/chance-academy.html node chance/test/regress.js

   It drives a real browser the way a seven-year-old would and
   checks the things that have actually broken before:

     - every one of the 60 days is well formed, and every wrong
       answer carries a misconception tag
     - no invented phonemes, no circular anchors, no silent chunks
     - Stop and Home are reachable at every point in a mission
     - a wrong answer coaches instead of scolding
     - a full day can be completed and earns the right rewards
     - homework photos generate correct questions and do not
       consume course progress
     - the updater compares versions correctly and version.json
       matches the version baked into the app
     - all 180 day/station combinations render without crashing

   Buttons are clicked BY LABEL, never by position — the bottom
   bar has gained buttons before now, which silently broke
   position-based clicking.
   ============================================================ */

const { chromium } = require(process.env.PW ||
  '/opt/node22/lib/node_modules/playwright');
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
  page.on('console', m => {
    // the browser asks for /favicon.ico on its own; dist/ has none
    if (m.type() === 'error' && !/favicon|Failed to load resource/i.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  const bar = () => page.evaluate(() =>
    [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent));

  const tap = (label) => page.evaluate((l) => {
    const b = [...document.querySelectorAll('.actions .btn-big')].find(x => x.textContent.includes(l));
    if (!b) throw new Error('no action "' + l + '"; bar has: ' +
      [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent).join(' | '));
    b.click();
  }, label);

  const tapSheet = (label) => page.evaluate((l) => {
    const b = [...document.querySelectorAll('#sheet .share-btn')].find(x => x.textContent.includes(l));
    if (!b) throw new Error('no sheet button "' + l + '"');
    b.click();
  }, label);

  // exact text: "24 spins" contains the substring "4 spins"
  const pickExact = (text) => page.evaluate((t) => {
    const b = [...document.querySelectorAll('.choice')]
      .find(x => x.querySelector('.txt').textContent.trim() === t.trim());
    if (!b) throw new Error('no choice "' + t + '"');
    b.click();
  }, text);

  await page.goto(BASE, { waitUntil: 'networkidle' });

  /* ---------------------- content ---------------------- */
  console.log('\nCONTENT');
  const audit = await page.evaluate(() => {
    const bad = [];
    Curriculum.allDays().forEach(d => {
      const push = m => bad.push(d.id + ': ' + m);
      if (!d.title || !d.icon) push('missing title/icon');
      if (!d.discover.intro || d.discover.intro.length < 2) push('thin intro');
      [d.discover.check, ...d.numbers.problems, d.reading.comp].forEach((it, n) => {
        if (!it.q) push('item ' + n + ' has no question');
        if (it.choices.filter(c => c.correct).length !== 1) push('item ' + n + ' needs exactly 1 correct');
        it.choices.filter(c => !c.correct && !c.tag).forEach(() => push('item ' + n + ' untagged wrong answer'));
      });
      if (d.numbers.problems.length !== 3) push('needs 3 math problems');
      d.numbers.problems.forEach((p, i) => {
        if (!p.hint) push('math ' + i + ' has no hint');
        if (!p.show) push('math ' + i + ' has no worked answer');
      });
      if (d.reading.words.length < 3) push('needs 3 reading words');
      d.reading.words.forEach(w => {
        if (w.parts.join('').toLowerCase().replace(/-/g, '') !== w.w.toLowerCase().replace(/-/g, ''))
          push('word ' + w.w + ' chunks spell "' + w.parts.join('') + '"');
        if (w.parts.some(p => !p || !String(p).trim())) push('word ' + w.w + ' has an empty chunk');
      });
      if (!d.reading.sentence) push('no sentence');
    });
    const known = Object.keys(Evaluate.allTags());
    const used = new Set();
    Curriculum.allDays().forEach(d => [d.discover.check, ...d.numbers.problems, d.reading.comp]
      .forEach(it => it.choices.forEach(c => { if (c.tag) used.add(c.tag); })));
    [...used].forEach(t => { if (!known.includes(t)) bad.push('UNKNOWN TAG: ' + t); });
    return { days: Curriculum.count, words: Curriculum.wordWall().length, problems: bad, tags: used.size };
  });
  check('60 days of curriculum', audit.days === 60, audit.days + ' days, ' + audit.words + ' words');
  check('every day well formed', audit.problems.length === 0, audit.problems.slice(0, 5).join('; '));
  // "letter-look" and "vowel-swap" come from the microphone check at
  // runtime, not from written questions, so not every tag appears in
  // content. The invariant is that no content uses an unknown tag —
  // enforced inside "every day well formed" above.
  check('content uses a broad spread of tags', audit.tags >= 12, audit.tags + ' distinct tags in use');

  /* ------------------- reading words ------------------ */
  console.log('\nREADING WORDS (grade 2)');
  const rw = await page.evaluate(() => {
    const all = Curriculum.allDays();
    const words = [].concat.apply([], all.map(d => d.reading.words.map(w => w.w.toLowerCase())));
    // the first-grade set this replaced — none of it may come back
    const old = ['spin', 'sun', 'rock', 'hot', 'map', 'gas', 'tilt', 'warm', 'east', 'west', 'shape', 'side', 'globe'];
    return {
      day1: Curriculum.day('d01').reading.words.map(w => w.w).join(', '),
      oldLeft: old.filter(w => words.includes(w)),
      wordsInSentence: all.every(d =>
        d.reading.words.filter(w => d.reading.sentence.toLowerCase().includes(w.w.toLowerCase())).length >= 2),
      noSwitch: typeof Curriculum.setReadingLevel === 'undefined'
    };
  });
  check('day 1 is grade-2 vocabulary', rw.day1 === 'sunset, sunrise, rotate', rw.day1);
  check('no first-grade words left', rw.oldLeft.length === 0, rw.oldLeft.join(', '));
  check('every sentence uses the day\'s words', rw.wordsInSentence);
  check('no way to switch back to the old words', rw.noSwitch);

  /* ---------------------- phonics ---------------------- */
  console.log('\nPHONICS');
  const ph = await page.evaluate(() => ({
    problems: Phonics.audit(),
    chunks: Phonics.allChunks().length,
    far: Phonics.script('far', ['f', 'ar']).map(s => s.phrase),
    split: Phonics.split('circle'),
    fake: (() => {
      const bad = [];
      Curriculum.allDays().forEach(d => d.reading.words.forEach(w =>
        Phonics.script(w.w, w.parts).forEach(s => {
          if (/f{3,}|r{3,}|s{3,}|m{3,}|n{3,}|l{3,}|z{3,}|o{3,}|e{3,}/i.test(s.phrase)) bad.push(w.w);
        })));
      return bad;
    })()
  }));
  check('no anchor/chunk problems', ph.problems.length === 0, ph.problems.slice(0, 5).join('; '));
  check('no invented phonemes', ph.fake.length === 0, ph.fake.slice(0, 5).join(', '));
  check('"far" sounds out correctly',
    ph.far[1] === 'f, like in fan.' && /car/.test(ph.far[2]), JSON.stringify(ph.far));
  check('word splitter handles r-controlled', ph.split.join('|') === 'c|ir|cle', ph.split.join('|'));

  /* ---------------------- updater ---------------------- */
  console.log('\nUPDATER');
  const up = await page.evaluate(async () => {
    const cmp = [
      Updater.compare('1.10.0', '1.9.0'),   // must be 1, not -1
      Updater.compare('1.4.0', '1.4.0'),
      Updater.compare('1.3.9', '1.4.0')
    ];
    let served = null;
    try { served = await (await fetch('version.json?t=' + Date.now(), { cache: 'no-store' })).json(); }
    catch (e) { served = { error: String(e.message || e) }; }
    return { cmp, current: Updater.current(), served };
  });
  check('version compare is numeric', up.cmp[0] === 1 && up.cmp[1] === 0 && up.cmp[2] === -1, JSON.stringify(up.cmp));
  if (!BASE.includes('/dist/')) {
    check('version.json matches the built app',
      up.served && up.served.version === up.current.version,
      'app ' + up.current.version + ' vs served ' + (up.served && (up.served.version || up.served.error)));
  }

  await page.evaluate(() => Voice.setMuted(true));

  /* ------------------ exits in a mission ---------------- */
  console.log('\nEXITS');
  await page.click('#todayCard');
  await page.waitForTimeout(350);
  const lessonBar = await bar();
  check('Stop + Home while the lesson reads',
    lessonBar.some(x => /Stop/.test(x)) && lessonBar.some(x => /Home/.test(x)), lessonBar.join(' | '));
  await tap('Question time');
  await page.waitForTimeout(350);
  const qBar = await bar();
  check('Stop + Home with a question on screen',
    qBar.some(x => /Stop/.test(x)) && qBar.some(x => /Home/.test(x)), qBar.join(' | '));

  /* ------------------ coaching, not scolding ------------ */
  console.log('\nCOACHING');
  await page.evaluate(() => {
    const c = Progress.nextDay().discover.check.choices.find(x => x.correct).t;
    [...document.querySelectorAll('.choice')].find(x => x.querySelector('.txt').textContent.trim() !== c.trim()).click();
  });
  await page.waitForTimeout(250);
  const coach = await page.evaluate(() => ({
    shown: !document.getElementById('coach').hidden,
    text: document.getElementById('coachText').textContent
  }));
  check('owl appears on a wrong answer', coach.shown);
  check('never says "wrong"', !/\bwrong\b|\bincorrect\b/i.test(coach.text), coach.text.slice(0, 50));

  /* ------------------ a whole day ----------------------- */
  console.log('\nFULL DAY');
  await pickExact(await page.evaluate(() => Progress.nextDay().discover.check.choices.find(c => c.correct).t));
  await page.waitForTimeout(250);
  const afterBar = await bar();
  check('Stop + Home + Next after answering', afterBar.length === 3, afterBar.join(' | '));
  await tap('Next'); await page.waitForTimeout(300);
  await tapSheet('Keep going'); await page.waitForTimeout(300);
  for (let i = 0; i < 3; i++) {
    await pickExact(await page.evaluate(n => Progress.nextDay().numbers.problems[n].choices.find(c => c.correct).t, i));
    await page.waitForTimeout(200);
    await tap('Next'); await page.waitForTimeout(250);
  }
  await tapSheet('Keep going'); await page.waitForTimeout(300);
  for (let i = 0; i < 3; i++) { await tap('I said it'); await page.waitForTimeout(200); }
  await tap('I read it'); await page.waitForTimeout(300);
  await pickExact(await page.evaluate(() => Progress.nextDay().reading.comp.choices.find(c => c.correct).t));
  await page.waitForTimeout(200);
  await tap('Next'); await page.waitForTimeout(500);
  const done = await page.evaluate(() => ({
    dayDone: Progress.isDayDone('d01'),
    stars: Progress.data.totals.stars,
    badges: Progress.badgeList().length
  }));
  check('day completes and awards 3 stars', done.dayDone && done.stars === 3, JSON.stringify(done));
  check('first badge earned', done.badges >= 1);

  const card = await page.evaluate(async () => {
    const b = [...document.querySelectorAll('#sheet .share-btn')].find(x => /Share it/.test(x.textContent));
    if (!b) return 'no share button';
    b.click();
    await new Promise(r => setTimeout(r, 400));
    const c = document.querySelector('#sheet canvas');
    if (!c) return 'no canvas';
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    return c.width + 'x' + c.height + ' ' + Math.round(blob.size / 1024) + 'kb';
  });
  check('reward card renders as a PNG', /^1080x1350/.test(card), card);
  await page.evaluate(() => App.closeSheet());

  /* ------------------ homework -------------------------- */
  console.log('\nHOMEWORK');
  const hw = await page.evaluate(async () => {
    const pack = await Homework.createPack('Test sheet');
    const c = document.createElement('canvas');
    c.width = 2400; c.height = 1800;                   // oversized on purpose
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 2400, 1800);
    g.fillStyle = '#000'; g.font = 'bold 90px sans-serif'; g.fillText('7 x 8 =', 100, 300);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
    await Homework.addPhoto(pack, new File([blob], 's.jpg', { type: 'image/jpeg' }));
    const res = await Homework.addMany(pack, '7x8, 6x7, 24/3, 15-8, nonsense');
    await Homework.addItem(pack, Homework.wordItem('shadow'));
    const rec = await Homework.photo(pack.photoIds[0]);
    const m = pack.items[0];
    return {
      made: res.made.length, skipped: res.skipped,
      photoW: rec.w, photoKb: Math.round(rec.blob.size / 1024),
      q: m.q, spoken: m.spoken,
      correct: m.choices.find(c => c.correct).t,
      tags: m.choices.filter(c => c.tag).map(c => c.tag),
      wordParts: pack.items[4].parts
    };
  });
  check('4 of 5 lines became questions', hw.made === 4 && hw.skipped.length === 1, JSON.stringify(hw.skipped));
  check('photo downscaled', hw.photoW === 1600 && hw.photoKb < 400, hw.photoW + 'px ' + hw.photoKb + 'kb');
  check('7x8 generates the right answer', hw.correct === '56', hw.q + ' -> ' + hw.correct);
  check('distractors carry misconception tags',
    hw.tags.includes('additive-for-multiplicative'), hw.tags.join(', '));
  check('× is spoken as "times"', /times/.test(hw.spoken), hw.spoken);
  check('spelling word gets chunked', hw.wordParts.join('|') === 'sh|a|d|ow', hw.wordParts.join('|'));

  const coursePre = await page.evaluate(() => Progress.countDone());
  await page.evaluate(() => App.go('mission', { day: Homework.packs()[0], station: 'homework' }));
  await page.waitForTimeout(800);
  const study = await page.evaluate(() => ({
    order: [...document.querySelectorAll('#stage > *')].map(n => n.className),
    photo: !!document.querySelector('.hw-photo'),
    exits: [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent)
  }));
  check('worksheet photo sits above the question',
    study.photo && study.order.indexOf('hw-photos') < study.order.indexOf('card'), study.order.join(' > '));
  check('Stop + Home work in homework too', study.exits.length === 2, study.exits.join(' | '));

  for (let i = 0; i < 4; i++) {
    await page.evaluate((idx) => {
      const right = Homework.packs()[0].items[idx].choices.find(c => c.correct).t;
      const b = [...document.querySelectorAll('.choice')].find(x => x.querySelector('.txt').textContent.trim() === right);
      if (b) b.click();
    }, i);
    await page.waitForTimeout(220);
    await tap('Next'); await page.waitForTimeout(280);
  }
  await tap('I said it');
  await page.waitForTimeout(600);
  const hwDone = await page.evaluate(() => ({
    done: Progress.stationDone(Homework.packs()[0].id, 'homework'),
    course: Progress.countDone()
  }));
  check('homework completes', hwDone.done);
  check('homework does not consume course days', hwDone.course === coursePre, 'before ' + coursePre + ', after ' + hwDone.course);
  await page.evaluate(() => App.closeSheet());

  /* ------------------ render sweep ---------------------- */
  console.log('\nSWEEP');
  const sweep = await page.evaluate(() => {
    const bad = [];
    Curriculum.allDays().forEach(d => ['discover', 'numbers', 'reading'].forEach(s => {
      try { App.go('mission', { day: d, station: s }); } catch (e) { bad.push(d.id + '/' + s + ': ' + e.message); }
    }));
    return bad;
  });
  await page.waitForTimeout(400);
  check('180 day/station screens render', sweep.length === 0, sweep.slice(0, 3).join('; '));

  /* ------------------ grown-up surfaces ----------------- */
  console.log('\nGROWN-UPS');
  await page.evaluate(() => App.go('grownup'));
  await page.waitForTimeout(500);
  const report = await page.evaluate(() => document.getElementById('grownupBody').textContent);
  check('report renders', report.length > 400);
  check('report offers homework', /Homework from school/i.test(report));
  check('report offers the update command', /Update the app/i.test(report));
  check('report offers voice recording', /own voice/i.test(report));
  await page.evaluate(() => App.go('studio'));
  await page.waitForTimeout(400);
  const groups = await page.evaluate(() =>
    [...document.querySelectorAll('#studioBody .report-item b')].map(b => b.textContent.trim()));
  check('recording booth lists letter sounds', groups.some(g => /Letter sounds/.test(g)), groups.slice(0, 3).join(' | '));

  console.log('\nCONSOLE ERRORS: ' + (errors.length ? errors.join('; ') : 'none'));
  if (errors.length) failures++;

  console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'all checks passed'));
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASHED:', e.message); process.exit(1); });
