/* ============================================================
   A real take-home spelling sheet, end to end

   Run it:
     npx http-server -p 8099 -s .          (from the repo root)
     node chance/test/sheet.js

   fixtures/spelling-sheet-contractions.jpg is a phone photo of a
   school "Take-Home" sheet: a letter to the caregiver, then a table
   of contractions ("it is | it's") and a Tricky Word. The reader
   must ignore the letter and come back with exactly the ten
   spelling words, in order. Then the Spelling Rocket plays them the
   way the teacher asks: it shows and says the two words ("it is"),
   he types the contraction, with an apostrophe key on screen.
   ============================================================ */

const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8099/chance/';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WANT = ["it's", "that's", "she's", "isn't", "aren't", "wasn't", "i'll", "you'll", "she'll", 'their'];

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (detail ? '  ' + detail : ''));
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 834, height: 1112 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/i.test(m.text())) errors.push(m.text()); });
  const wait = (ms) => page.waitForTimeout(ms);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  if (await page.evaluate(() => Scan.available())) {
    console.log('READ THE SHEET');
    const b64 = fs.readFileSync(path.join(__dirname, 'fixtures', 'spelling-sheet-contractions.jpg')).toString('base64');
    const got = await page.evaluate(async (b64) => {
      const bin = atob(b64), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const res = await Scan.read(new File([u], 'sheet.jpg', { type: 'image/jpeg' }));
      const ex = Scan.extract(res);
      return { words: ex.words.map(w => w.word), sheet: !!ex.sheet, table: !!res.table };
    }, b64);
    check('recognised as a spelling sheet and the table read again on its own', got.sheet && got.table);
    check('exactly the ten spelling words, in order, none of the letter', JSON.stringify(got.words) === JSON.stringify(WANT), got.words.join(', '));
  } else {
    console.log('  (word reader not in this build: skipping the photo)');
  }

  console.log('THE GROWN-UP CHECK KEEPS CURLY APOSTROPHES');
  await page.evaluate(() => App.go('rocket'));
  await wait(150);
  await page.evaluate(() => [...document.querySelectorAll('#rocketBody button')].find(b => b.textContent.includes('Type the words')).click());
  await wait(150);
  for (const w of ['it’s', 'I’ll', 'their']) {
    await page.fill('.scan-row input[placeholder="Add a word…"]', w);
    await page.press('.scan-row input[placeholder="Add a word…"]', 'Enter');
  }
  await page.evaluate(() => [...document.querySelectorAll('.actions .btn-big')].find(b => b.textContent.includes('Save this week')).click());
  await wait(150);
  const chips = await page.evaluate(() => [...document.querySelectorAll('.rk-chip')].map(c => c.textContent));
  check('typed with the iPad’s curly apostrophe, saved as it\'s and I\'ll', chips.join(',') === "it's,I'll,their", chips.join(','));

  console.log('PLAY A CONTRACTION');
  await page.evaluate(() => { Rocket._setWords(["it's", "I'll", "you'll", "isn't", 'their']); App.go('rocket'); });
  await wait(100);
  // line the queue up so the first word is I'll
  await page.evaluate(() => { const s = Rocket._state(); s.order = ["I'll", "it's", "you'll", "isn't", 'their']; s.pos = 0; });
  await page.click('.rk-go');
  await wait(300);
  check('the word to find is I\'ll, with a capital I', await page.evaluate(() => Rocket._game().word) === "I'll");
  await page.evaluate(() => Rocket._found()); await wait(60);
  await page.evaluate(() => [...document.querySelectorAll('.rk-card button')].find(b => b.textContent.includes('I said it')).click());
  await wait(100);
  check('spelling shows the two words: I will ➜ ?', await page.evaluate(() => {
    const p = document.querySelector('.rk-pair'); return !!p && p.textContent.includes('I will') && !p.textContent.includes("I'll");
  }));
  check('there is an apostrophe key', !!(await page.$('.rk-apo')));
  await page.keyboard.type('il');
  await page.keyboard.press('Enter');
  await wait(100);
  const ev = await page.evaluate(() => Progress.data.log.filter(e => e.domain === 'rocket-spelling').slice(-1)[0]);
  check('leaving out the apostrophe is a miss', ev && ev.correct === false && ev.typed === 'il', ev && ev.typed);
  await page.fill('.rk-input', '');
  await page.keyboard.type('i');
  await page.click('.rk-apo');
  await page.keyboard.type('ll');
  check('the apostrophe key types an apostrophe', await page.evaluate(() => document.querySelector('.rk-input').value) === "i'll");
  await page.keyboard.press('Enter');
  await wait(100);
  check('i\'ll (lower case, as typed) is right for I\'ll', ['piece', 'find', 'ready'].includes(await page.evaluate(() => Rocket._game().mode)));
  const booth = await page.evaluate(() => {
    const t = Rocket.voiceLines().map(l => l.text);
    return t.includes('I will') && t.includes('it is') && t.includes(Rocket.LINES.squeeze) && t.includes(Rocket.LINES.apostrophe);
  });
  check('"I will" and the squeeze line are in the recording booth', booth);
  check('isnt and is\'nt are the practice traps for isn\'t', await page.evaluate(() => Homework.misspellings("isn't").map(m => m.t).join(',')) === "isnt,is'nt");

  console.log('\nCONSOLE ERRORS: ' + (errors.length ? errors.join('\n  ') : 'none'));
  if (errors.length) failures++;
  console.log(failures ? '\n' + failures + ' FAILED' : '\nall checks passed');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
