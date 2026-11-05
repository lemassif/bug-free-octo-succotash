/* ============================================================
   My Body (blood, tonsils, Finn's Tonsil Adventure), end to end

   Run it:
     npx http-server -p 8099 -s .          (from the repo root)
     node chance/test/body.js

   Opens each book the way Chance would: taps real cells in the
   microscope photos (using the dataset's own cell positions), plays
   the blood detective game, finds the tonsils in the mouth picture,
   taps the operating-room pictures, reads the two-week calendar with
   and without a surgery date, earns the stars, and checks every line
   is in the recording booth. No console errors allowed.
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
    if (m.type() === 'error' && !/favicon|Failed to load resource/i.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  const wait = (ms) => page.waitForTimeout(ms);
  const action = (label) => page.evaluate((l) => {
    const b = [...document.querySelectorAll('.actions button')].find(x => x.textContent.includes(l));
    if (!b) throw new Error('no action "' + l + '"');
    b.click();
  }, label);
  const says = () => page.evaluate(() => { const s = document.querySelector('.bd-says'); return s ? s.textContent : ''; });
  const title = () => page.evaluate(() => document.querySelector('.bd-title').textContent);

  // remember what the voice was asked to say
  await page.addInitScript(() => {
    window.__said = [];
    const hook = () => {
      if (!window.Voice || Voice.__hooked) return;
      const say = Voice.say;
      Voice.say = function (t, o) { window.__said.push(t); return say.call(Voice, t, o); };
      Voice.__hooked = true;
    };
    document.addEventListener('DOMContentLoaded', hook);
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  console.log('HOME');
  check('home has a My Body tile', !!(await page.$('[data-go="body"]')));
  await page.click('[data-go="body"]');
  await wait(150);
  const books = await page.evaluate(() => [...document.querySelectorAll('.bd-book b')].map(b => b.textContent));
  check('three books', books.join('|') === "My Amazing Blood|My Tonsils|Finn's Tonsil Adventure", books.join('|'));

  console.log('BLOOD');
  await page.click('.bd-book');
  await wait(150);
  check('opens on the blood test page', (await title()) === 'The blood test');
  check('the page is read aloud', await page.evaluate(() => window.__said.some(t => t.indexOf('phlebotomist') !== -1)));
  await page.evaluate(() => [...document.querySelectorAll('.bd-tap')].find(b => b.textContent.includes('spoonful')).click());
  await wait(50);
  check('tapping a picture says what it is', (await says()).includes('seven cups'), await says());
  await action('Next page'); await wait(100);
  check('page 2: why shake the tube', (await title()) === 'Why shake the tube?');
  await action('Next page'); await wait(100);

  // tap real cells by the dataset's own boxes
  async function tapCell(kind, nth) {
    return page.evaluate(([k, n]) => {
      const pg = BodyLab._books[0].pages[BodyLab._page().page];
      const ph = BODY_PHOTOS[pg.photo];
      const c = ph.cells.filter(x => x[0] === k)[n || 0];
      const img = document.querySelector('.bd-micro img'), r = img.getBoundingClientRect();
      const x = r.left + (c[1] + c[3]) / 2 / ph.w * r.width, y = r.top + (c[2] + c[4]) / 2 / ph.h * r.height;
      return { x, y };
    }, [kind, nth]);
  }
  check('a real microscope photo', await page.evaluate(() => {
    const i = document.querySelector('.bd-micro img'); return !!i && i.naturalWidth === 640;
  }));
  for (const [kind, word] of [['red', 'red blood cell'], ['white', 'germ fighter'], ['platelet', 'platelet']]) {
    const p = await tapCell(kind);
    await page.mouse.click(p.x, p.y);
    await wait(60);
    check('tap a ' + kind + ' cell', (await says()).toLowerCase().includes(word), await says());
  }
  check('the tapped cell is ringed', await page.evaluate(() => !document.querySelector('.bd-ring').hidden));
  await action('Next page'); await wait(100);
  let p = await tapCell('white');
  await page.mouse.click(p.x, p.y); await wait(60);
  check('page 4: the lymphocyte', (await says()).includes('lymphocyte'), await says());
  await action('Next page'); await wait(100);
  const whites = await page.evaluate(() => BODY_PHOTOS.smear3.cells.filter(c => c[0] === 'white').length);
  const heard = [];
  for (let i = 0; i < whites; i++) { p = await tapCell('white', i); await page.mouse.click(p.x, p.y); await wait(60); heard.push(await says()); }
  check('page 5: the eosinophil and the other white cell', heard.some(h => h.includes('eosinophil')) && heard.some(h => h.includes('germ fighter')), heard.join(' / '));

  console.log('BLOOD IN 3D');
  await action('Next page'); await wait(150);
  check('a real electron-microscope photo across the top', await page.evaluate(() => {
    const i = document.querySelector('.bd-hero img'); return !!i && i.naturalWidth > 200;
  }));
  await page.click('.bd-hero'); await wait(50);
  check('tapping the photo says its caption', (await says()).includes('electron microscope'), await says());

  console.log('DETECTIVE');
  await action('Next page'); await wait(150);
  check('the find game asks for the white cell', (await page.evaluate(() => document.querySelector('.bd-ask').textContent)).includes('white blood cell'));
  p = await tapCell('red'); await page.mouse.click(p.x, p.y); await wait(50);
  check('a wrong cell does not count', await page.evaluate(() => BodyLab._game().goal) === 0);
  p = await tapCell('white'); await page.mouse.click(p.x, p.y); await wait(50);
  check('white cell found', await page.evaluate(() => BodyLab._game().goal) === 1);
  for (let i = 0; i < 3; i++) { p = await tapCell('platelet', i); await page.mouse.click(p.x, p.y); await wait(50); }
  check('three platelets found', await page.evaluate(() => BodyLab._game().goal) === 2,
    String(await page.evaluate(() => BodyLab._game().got.length)));
  for (let i = 0; i < 5; i++) { p = await tapCell('red', i); await page.mouse.click(p.x, p.y); await wait(50); }
  check('five red cells: detective done', await page.evaluate(() => !!BodyLab._game().done));
  check('checkmarks on the found cells', await page.evaluate(() => document.querySelectorAll('.bd-mark').length) === 9);

  await action('Next page'); await wait(100);
  await action('Next page'); await wait(100);
  check('his own question: do I get my blood back', (await title()) === 'Do I get my blood back?');
  check('the answer is honest: no, but the body makes new blood', await page.evaluate(() =>
    document.querySelector('.bd-text').textContent.includes('The answer is no') && document.querySelector('.bd-text').textContent.includes('brand new blood')));
  const stars0 = await page.evaluate(() => Progress.data.totals.stars);
  await action('Finish'); await wait(150);
  check('finishing the book earns a star', (await page.evaluate(() => Progress.data.totals.stars)) === stars0 + 1);
  check('and offers the next book', await page.evaluate(() => document.getElementById('sheet').textContent.includes('Next: My Tonsils')));
  await page.evaluate(() => [...document.querySelectorAll('#sheet button')].find(b => b.textContent.includes('Next: My Tonsils')).click());
  await wait(150);

  console.log('TONSILS');
  check('the mouth picture', !!(await page.$('.bd-mouth svg')));
  await page.click('.bd-mouth path[data-part="tonsil"]');
  await wait(50);
  check('tap a tonsil', (await says()).includes('These are your tonsils'), await says());
  await page.click('.bd-mouth path[data-part="uvula"]');
  await wait(50);
  check('tap the uvula: it stays', (await says()).includes('It stays'), await says());

  console.log('FINN');
  await page.evaluate(() => BodyLab.openBook('story', 0));
  await wait(100);
  check('Finn is seven and loves fishing and soccer', await page.evaluate(() => {
    const t = document.querySelector('.bd-text').textContent; return t.includes('seven') && t.includes('fishing') && t.includes('soccer');
  }));
  const titles = await page.evaluate(() => BodyLab._books[2].pages.map(p => p.title));
  const or = titles.indexOf('The operating room'), wear = titles.indexOf('What everyone wears');
  await page.evaluate((i) => BodyLab.openBook('story', i), or); await wait(80);
  const orTaps = await page.evaluate(() => [...document.querySelectorAll('.bd-tap-name')].map(x => x.textContent));
  check('a real operating room photo', await page.evaluate(() => !!document.querySelector('.bd-hero img')));
  const withPhotos = await page.evaluate(() => [...document.querySelectorAll('.bd-tap')].filter(b => b.querySelector('img')).map(b => b.textContent));
  check('real photos on the lights, bed, monitor and sleep machine', ['Big lights', 'The bed', 'Heart monitor', 'Sleep machine'].every(t => withPhotos.includes(t)), withPhotos.join(', '));
  check('operating room: lights, bed, monitor, mask, laser', ['Big lights', 'The bed', 'Heart monitor', 'Sleep mask', 'Laser machine'].every(t => orTaps.includes(t)), orTaps.join(', '));
  await page.evaluate((i) => BodyLab.openBook('story', i), wear); await wait(80);
  await page.evaluate(() => [...document.querySelectorAll('.bd-tap')].find(b => b.textContent.includes('Mask')).click());
  await wait(50);
  check('why the doctor wears a mask', (await says()).includes('breath'), await says());
  check('real photos of the cap, mask, gown, gloves and goggles', await page.evaluate(() =>
    ['Hat', 'Mask', 'Gown', 'Gloves', 'Goggles'].every(n => [...document.querySelectorAll('.bd-tap')].some(b => b.textContent === n && b.querySelector('img')))));
  check('every photo has a credit', await page.evaluate(() => Object.keys(BODY_PHOTOS).filter(k => !k.startsWith('smear')).every(k => /Wikimedia Commons/.test(BODY_PHOTOS[k].credit))));
  await page.evaluate((i) => BodyLab.openBook('story', i), titles.indexOf('How the laser works')); await wait(80);
  check('how the laser works', await page.evaluate(() => document.querySelector('.bd-text').textContent.includes('very thin, very strong beam')));

  console.log('CALENDAR');
  const cal = titles.indexOf('Two weeks to heal');
  await page.evaluate((i) => BodyLab.openBook('story', i), cal); await wait(80);
  check('fourteen days and Thanksgiving', await page.evaluate(() => document.querySelectorAll('.bd-day').length) === 15);
  await page.click('.bd-day');
  await wait(50);
  check('tap a day', (await says()).includes('Day 1'), await says());
  // with the surgery date set 3 days ago, today is day 3
  await page.evaluate(() => {
    const d = new Date(Progress.today() + 'T12:00:00'); d.setDate(d.getDate() - 3);
    BodyLab._state().surgery = d.toISOString().slice(0, 10);
  });
  await page.evaluate((i) => BodyLab.openBook('story', i), cal); await wait(80);
  check('with a date: today is ringed on day 3', await page.evaluate(() => document.querySelector('.bd-day.today .n').textContent) === '3');
  await page.evaluate((i) => BodyLab.openBook('story', i), titles.length - 1); await wait(80);
  await action('Finish'); await wait(150);
  check('finishing Finn earns a star', (await page.evaluate(() => Progress.data.totals.stars)) === stars0 + 2);
  await page.evaluate(() => App.closeSheet());

  console.log('GROWN-UPS');
  await page.evaluate(() => {
    const d = new Date(Progress.today() + 'T12:00:00'); d.setDate(d.getDate() + 5);
    BodyLab._state().surgery = d.toISOString().slice(0, 10);
    App.go('body');
  });
  await wait(100);
  check('countdown to surgery day', (await page.evaluate(() => document.querySelector('.bd-countdown').textContent)).includes('5 days until surgery'));
  check('finished books show a star', await page.evaluate(() => document.querySelectorAll('.bd-done').length) === 2);
  await page.evaluate(() => [...document.querySelectorAll('#bodyBody button')].find(b => b.textContent.includes('own voice')).click());
  await wait(150);
  check('the booth opens on the My Body group', await page.evaluate(() => document.getElementById('studioBody').textContent.includes('My Body: your voice')));
  const lines = await page.evaluate(() => Recordings.inventory().find(g => g.id === 'body').lines.map(l => l.text));
  check('every story line is recordable', lines.includes('This is Finn. Finn is seven years old.') &&
    lines.some(t => t.includes('The mask keeps the doctor')) && lines.some(t => t.startsWith('These are your tonsils')), lines.length + ' lines');

  console.log('\nCONSOLE ERRORS: ' + (errors.length ? errors.join('\n  ') : 'none'));
  if (errors.length) failures++;
  console.log(failures ? '\n' + failures + ' FAILED' : '\nall checks passed');
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
