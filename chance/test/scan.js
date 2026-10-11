/* ============================================================
   Homework scan, end to end

   Run it:
     npx http-server -p 8099 -s .          (from the repo root)
     node chance/test/scan.js

   Draws a realistic printed spelling worksheet (two-column numbered
   list, a header, instructions, a row of math), "photographs" it,
   and walks the whole path a grandparent would:

     📷 photo -> the app reads the words -> grown-up check
       -> Start the lesson -> Chance reads each word
       -> spelling test (no photo on screen, choices not read aloud)
       -> math -> done

   Kept separate from regress.js because the text reader takes a
   few seconds and does not exist in the single-file build.
   ============================================================ */

const { chromium } = require(process.env.PW ||
  '/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8099/chance/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const LIST = ['light', 'night', 'bright', 'right', 'sight', 'float', 'boat', 'coast', 'road', 'toast'];

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

  const tap = (label) => page.evaluate((l) => {
    const b = [...document.querySelectorAll('.actions .btn-big')].find(x => x.textContent.includes(l));
    if (!b) throw new Error('no action "' + l + '"; bar has: ' +
      [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent).join(' | '));
    b.click();
  }, label);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  // run under the service worker, as the installed app does, so the
  // 6 MB reader download goes through it
  await page.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  const controlled = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
  await page.evaluate(() => {
    Voice.setMuted(true);
    // record everything the owl would say
    window.__said = [];
    const say = Voice.say, lines = Voice.sayLines;
    Voice.say = function (t) { window.__said.push(String(t)); return say.apply(Voice, arguments); };
    Voice.sayLines = function (l) { window.__said.push([].concat(l).join(' ')); return lines.apply(Voice, arguments); };
  });

  /* ------------------- the Homework screen ------------------- */
  console.log('\nHOMEWORK SCREEN');
  const home = await page.evaluate(() => ({
    tile: [...document.querySelectorAll('.tile-hw .tile-label')].map(x => x.textContent).join(''),
  }));
  check('home tile says Scan Homework', home.tile === 'Scan Homework', home.tile);
  await page.evaluate(() => App.go('homework'));
  await page.waitForTimeout(300);
  const picker = await page.evaluate(() => {
    const first = document.querySelector('#homeworkBody > *');
    return {
      first: first && first.className,
      text: first && first.textContent,
      camera: !!document.querySelector('.scan-hero')
    };
  });
  check('the camera is the first thing on the screen', picker.first === 'scan-hero', picker.first);
  check('it says what it does', /Take a picture/.test(picker.text), picker.text);

  /* camera input really opens the back camera */
  const capture = await page.evaluate(() => new Promise((resolve) => {
    const orig = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      HTMLInputElement.prototype.click = orig;
      const r = { type: this.type, accept: this.accept, capture: this.getAttribute('capture') };
      this.remove();
      resolve(r);
    };
    document.querySelector('.scan-hero').click();
  }));
  check('camera button opens the back camera', capture.capture === 'environment' && capture.accept === 'image/*',
    JSON.stringify(capture));

  /* --------------------- reading the photo -------------------- */
  console.log('\nREADING THE PHOTO');
  const t0 = Date.now();
  await page.evaluate(async (LIST) => {
    const c = document.createElement('canvas'); c.width = 1700; c.height = 2200;
    const g = c.getContext('2d');
    g.fillStyle = '#e9e6df'; g.fillRect(0, 0, 1700, 2200);     // greyish paper
    g.fillStyle = '#222';
    g.font = 'bold 64px Arial'; g.fillText('Spelling Words - Week 4', 120, 170);
    g.font = '44px Arial'; g.fillText('Name: ______________   Date: ________', 120, 270);
    g.font = '48px Arial';
    LIST.slice(0, 5).forEach((w, i) => g.fillText((i + 1) + '. ' + w, 160, 430 + i * 120));
    LIST.slice(5).forEach((w, i) => g.fillText((i + 6) + '. ' + w, 900, 430 + i * 120));
    g.font = '40px Arial'; g.fillText('Write each word three times in your notebook.', 120, 1120);
    g.font = '52px Arial'; g.fillText('7 x 8 =        6 x 7 =        24 - 9 =', 120, 1320);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
    HWUI._readPhoto(document.getElementById('homeworkBody'), new File([blob], 'sheet.jpg', { type: 'image/jpeg' }));
  }, LIST);

  const progress = await page.evaluate(() => !!document.querySelector('#homeworkBody .bar'));
  check('shows a progress bar while reading', progress);
  await page.waitForSelector('.scan-list', { timeout: 60000 });
  const secs = (Date.now() - t0) / 1000;
  check('reads the page in under 30 seconds', secs < 30, secs.toFixed(1) + 's');
  if (BASE.indexOf('dist/') === -1) {
    const cached = await page.evaluate(async () => {
      const keys = await caches.keys();
      const c = await caches.open(keys.find(k => k.startsWith('chance-academy-')));
      return (await c.keys()).map(r => r.url).filter(u => /vendor/.test(u)).length;
    });
    check('works through the service worker, and saves the reader for offline', controlled && cached >= 3,
      'controlled=' + controlled + ', ' + cached + ' reader files saved');
  }

  const found = await page.evaluate(() => ({
    head: document.querySelector('#homeworkBody .card h3').textContent,
    rows: [...document.querySelectorAll('.scan-row')].map(r => ({
      v: r.querySelector('input').value, off: r.classList.contains('off')
    })),
    photo: !!document.querySelector('#homeworkBody .hw-photo img'),
    bar: [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent)
  }));
  const words = found.rows.map(r => r.v).filter(v => /^[a-z]+$/.test(v));
  check('found every spelling word, in the teacher\'s order',
    LIST.every((w, i) => words[i] === w), words.join(', '));
  check('skipped the header and instructions',
    !words.some(w => /spelling|name|date|write|notebook|three/.test(w)), words.join(', '));
  const math = found.rows.map(r => r.v).filter(v => /\d/.test(v));
  check('found the math problems', ['7 x 8', '6 x 7', '24 - 9'].every(m => math.includes(m)), math.join(' | '));
  check('shows the photo for checking', found.photo);
  check('offers Start the lesson with a count', found.bar.some(b => /Start the lesson \(13\)/.test(b)), found.bar.join(' | '));

  /* ------------------- the grown-up check -------------------- */
  console.log('\nGROWN-UP CHECK');
  // untick "toast", fix a word, add one
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.scan-row')];
    rows.find(r => r.querySelector('input').value === 'toast').querySelector('.scan-tick').click();
    const road = rows.find(r => r.querySelector('input').value === 'road').querySelector('input');
    road.value = 'roads'; road.dispatchEvent(new Event('input'));
    const add = [...document.querySelectorAll('.scan-row input')].find(i => i.placeholder === 'Add a word…');
    add.value = 'shadow';
    add.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });
  const edited = await page.evaluate(() => [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent));
  check('untick / fix / add update the count', edited.some(b => /Start the lesson \(13\)/.test(b)), edited.join(' | '));

  await tap('Start the lesson');
  await page.waitForTimeout(800);

  const pack = await page.evaluate(() => {
    const p = Homework.packs()[0];
    return { title: p.title, kinds: p.items.map(i => i.kind), words: p.items.filter(i => i.kind === 'word').map(i => i.word),
             spell: p.items.filter(i => i.kind === 'spell'), photos: (p.photoIds || []).length };
  });
  check('lesson saved with the photo', pack.photos === 1);
  check('lesson uses the corrected list',
    pack.words.join(',') === 'light,night,bright,right,sight,float,boat,coast,roads,shadow', pack.words.join(','));
  const order = pack.kinds.join(',');
  check('read every word, then spell every word, then math',
    /^(word,){10}(spell,){10}math,math,math$/.test(order), order);
  const realistic = pack.spell.every(s => s.choices.length === 3 &&
    s.choices.filter(c => c.correct).length === 1 &&
    s.choices.filter(c => !c.correct).every(c => c.tag && c.t !== s.word && /^[a-z]+$/.test(c.t)));
  check('every spelling question has 2 tagged misspellings', realistic,
    pack.spell.slice(0, 4).map(s => s.choices.map(c => c.t).join('/')).join('  '));
  const light = pack.spell.find(s => s.word === 'light');
  check('misspellings are the ones a 7-year-old makes', light && light.choices.some(c => c.t === 'lite'),
    light && light.choices.map(c => c.t).join('/'));

  /* ------------------------ the lesson ------------------------ */
  console.log('\nTHE LESSON');
  const first = await page.evaluate(() => ({
    screen: document.querySelector('.screen:not([hidden])').dataset.screen,
    photo: !!document.querySelector('#stage .hw-photos'),
    tag: document.querySelector('#stage .tag') && document.querySelector('#stage .tag').textContent,
    bar: [...document.querySelectorAll('.actions .btn-big')].map(x => x.textContent)
  }));
  check('lesson opens straight away', first.screen === 'mission', first.screen);
  check('starts by reading the first word', /HOMEWORK/.test(first.tag || '') && first.bar.some(b => /I said it/.test(b)),
    (first.tag || '') + ' — ' + first.bar.join(' | '));
  check('Stop + Home are there', first.bar.some(b => /Stop/.test(b)) && first.bar.some(b => /Home/.test(b)), first.bar.join(' | '));

  for (let i = 0; i < 10; i++) { await tap('I said it'); await page.waitForTimeout(250); }

  const spell = await page.evaluate(() => {
    window.__said.length = 0;
    return {
      photo: !!document.querySelector('#stage .hw-photos'),
      q: document.querySelector('#stage .card h3, #stage h3.q, #stage .q') ? document.querySelector('#stage').textContent : '',
      choices: [...document.querySelectorAll('.choice .txt')].map(x => x.textContent.trim())
    };
  });
  check('spelling test hides the photo (it is the answer key)', !spell.photo);
  const target = await page.evaluate(() => {
    const p = Homework.packs()[0];
    const n = parseInt(/(\d+) OF/.exec(document.querySelector('#stage .tag').textContent)[1], 10) - 1;
    return p.items[n].word;
  });
  check('spelling question shows 3 spellings', spell.choices.length === 3 && spell.choices.includes(target), target + ': ' + spell.choices.join(' / '));
  await page.evaluate(() => document.getElementById('btnReplay').click());
  await page.waitForTimeout(200);
  const said = await page.evaluate(() => window.__said.join(' || '));
  const readsChoices = spell.choices.filter(c => c !== target).some(c => said.includes(c));
  check('the owl says the word but never reads the wrong spellings aloud', said.includes(target) && !readsChoices, said.slice(0, 160));

  // a wrong answer (after a real look, not a speedy guess) is coached
  await page.waitForTimeout(2000);
  await page.evaluate((target) => {
    const p = Homework.packs()[0];
    const item = p.items.find(i => i.kind === 'spell' && i.word === target);
    const sound = item.choices.find(c => c.tag === 'sound-spelling');
    const pick = sound ? sound.t : item.choices.find(c => !c.correct).t;
    [...document.querySelectorAll('.choice')].find(x => x.querySelector('.txt').textContent.trim() === pick).click();
  }, target);
  await page.waitForTimeout(300);
  const coach = await page.evaluate(() => {
    const c = document.querySelector('.coach:not([hidden])');
    return c ? c.textContent : '';
  });
  check('a wrong spelling gets coached, not scolded', /sound|letters|spell/i.test(coach), coach.slice(0, 120));

  // finish: answer every remaining question correctly
  for (let guard = 0; guard < 40; guard++) {
    const state = await page.evaluate(() => {
      if (document.querySelector('.screen:not([hidden])').dataset.screen !== 'mission') return 'left';
      if (!document.getElementById('overlay').hidden) return 'sheet';
      return 'q';
    });
    if (state !== 'q') break;
    await page.evaluate(() => {
      const p = Homework.packs()[0];
      const tag = document.querySelector('#stage .tag').textContent;
      const n = parseInt(/(\d+) OF/.exec(tag)[1], 10) - 1;
      const right = p.items[n].choices.find(c => c.correct).t;
      const b = [...document.querySelectorAll('.choice')].find(x => x.querySelector('.txt').textContent.trim() === right);
      if (b && !b.disabled) b.click();
    });
    await page.waitForTimeout(220);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('.actions .btn-big')].find(x => /Next/.test(x.textContent));
      if (b) b.click();
    });
    await page.waitForTimeout(260);
  }
  const done = await page.evaluate(() => ({
    done: Progress.stationDone(Homework.packs()[0].id, 'homework'),
    sheet: !document.getElementById('overlay').hidden
  }));
  check('the lesson finishes and earns its star', done.done && done.sheet, JSON.stringify(done));

  console.log('\nCONSOLE ERRORS: ' + (errors.length ? errors.join('; ') : 'none'));
  if (errors.length) failures++;
  console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'all checks passed'));
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('SUITE CRASHED:', e.message); process.exit(1); });
