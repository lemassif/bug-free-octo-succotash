/* Island Dreams smoke test (this-device mode).

   Run it:
     npx http-server -p 8099 -s -c-1 .     (from the repo root)
     node island/test/smoke.js

   Drives a phone-sized browser through writing, reading, editing,
   searching and deleting an entry, the two multi-select drop-downs
   (including adding a new choice), photo upload, the unsaved-draft
   rescue and the settings lists. Screenshots go to $SHOTS if set. */

const path = require('path');
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8099/island/';
const SHOTS = process.env.SHOTS || '';
const PHOTO = path.join(__dirname, '..', 'icon-512.png');

let failures = 0;
function check(cond, msg) {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg);
  if (!cond) failures++;
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', (d) => d.accept());
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); };

  await page.goto(BASE);
  await page.waitForSelector('.welcome');
  check(await page.isVisible('#localBanner'), 'this-device banner shows when config.js is blank');
  check(await page.isVisible('#fabNew'), 'New entry button shows on the journal');
  await shot('01-empty');

  // ---- write an entry
  await page.click('#fabNew');
  await page.waitForSelector('form.edit');
  const today = await page.inputValue('#fDate');
  check(/^\d{4}-\d{2}-\d{2}$/.test(today), 'date starts as today');
  check(/^\d{2}:\d{2}$/.test(await page.inputValue('#fTime')), 'time starts as now');
  await page.fill('#fDate', '2024-07-14');
  await page.fill('#fTime', '16:30');

  await page.click('#msPeople');
  const people = await page.$$eval('.ms-panel .ms-opt span', (els) => els.map((e) => e.textContent));
  check(people.join(',') === 'PAPA,MEMA,Susan,Joshua,Jackie,Rebekah,Satomi,Sora,Katie,Lorenzo,Haru,Chance,Tatiana',
    'Who list has all 13 family members in order');
  await page.check('.ms-opt:has-text("PAPA") input');
  await page.check('.ms-opt:has-text("Chance") input');
  await page.fill('.ms-panel .ms-add input', 'Uncle Bob');
  await page.click('.ms-panel .ms-add button');
  await page.waitForSelector('.ms-opt:has-text("Uncle Bob") input:checked');
  check(true, 'a new person can be added from inside the drop-down, and is ticked');
  await shot('02-who-open');
  await page.click('.ms-panel .ms-done');

  await page.click('#msActivities');
  const acts = await page.$$eval('.ms-panel .ms-opt span', (els) => els.map((e) => e.textContent.replace(/^\S+ /, '')));
  check(acts.join(',') === 'Fish caught,Campfires,Boat sightings,Tubing,Swimming,Cooking on the boat,Geocaching,Sightseeing,Fireworks',
    'What list has the 9 starting activities in order');
  await page.check('.ms-opt:has-text("Swimming") input');
  await page.click('.ms-panel .ms-done');
  const chipCount = await page.$$eval('.ms .chip', (els) => els.length);
  check(chipCount === 4, 'ticked choices show as chips (3 people + 1 activity)');

  // ---- two fish: a tiny one with a photo, a big one without
  await page.click('button:has-text("Add a fish")');
  check(await page.isVisible('.ms .chip.activity:has-text("Fish caught")'), 'adding a fish ticks "Fish caught"');
  await page.setInputFiles('.fish-edit:nth-child(1) input[type=file]:not([capture])', PHOTO);
  await page.waitForSelector('.fish-edit:nth-child(1) .fish-photo img');
  await page.selectOption('#fishWho1', 'Chance');
  await page.fill('#fishKind1', 'Yellow perch');
  await page.fill('#fishLen1', '2.5');
  await page.click('button:has-text("Add a fish")');
  await page.selectOption('#fishWho2', 'PAPA');
  await page.fill('#fishKind2', 'Northern pike');
  await page.fill('#fishLen2', '31');
  await page.click('button:has-text("Add a fish")');
  await page.fill('#fishLen3', '-4');
  await page.click('button[type=submit]');
  await page.waitForTimeout(300);
  check(await page.isVisible('form.edit') && await page.$eval('#fishLen3', (i) => !i.validity.valid),
    'a nonsense fish length is refused before saving');
  await page.click('.fish-edit:nth-child(3) button:has-text("Remove")');
  check(await page.$$eval('.fish-edit', (e) => e.length) === 2, 'a fish can be removed from the form');

  await page.fill('#fTitle', 'Chance’s first pike');
  await page.fill('#fBody', 'Calm morning off the dock.\nChance reeled in a pike by himself.');
  await page.setInputFiles('input[type=file][multiple]', [PHOTO, PHOTO]);
  await page.waitForFunction(() => document.querySelectorAll('.photo-grid.edit .thumb').length === 2);
  check(true, 'two photos chosen from the library show before saving');
  await shot('03-form');

  await page.click('button[type=submit]');
  await page.waitForSelector('article.entry');
  const viewText = await page.textContent('article.entry');
  check(viewText.includes('Chance’s first pike') && viewText.includes('reeled in a pike'), 'saved entry shows its headline and text');
  check(/July 14, 2024/.test(viewText), 'saved entry shows its date');
  check(await page.$$eval('article .chip.person', (e) => e.map((x) => x.textContent).join(',')) === 'PAPA,Chance,Uncle Bob', 'people show in list order');
  check((await page.textContent('article')).includes('Fish caught (2)'), 'entry lists its two fish');
  check(await page.isVisible('.fish-tile:has-text("Chance") .badge.king'), 'Chance’s 2.5″ perch is crowned King of the Little Fish');
  check(await page.isVisible('.fish-tile:has-text("PAPA") .badge.big'), 'PAPA’s pike is marked biggest fish');
  await page.waitForFunction(() => [...document.querySelectorAll('article .photo-grid img')].filter((i) => i.complete && i.naturalWidth).length === 2);
  check(true, 'both photos load on the entry');
  await shot('04-entry');

  // ---- lightbox
  await page.click('article .photo-grid .thumb');
  await page.waitForFunction(() => { const i = document.getElementById('lbImg'); return i.complete && i.naturalWidth > 0; });
  check((await page.textContent('#lbCount')) === '1 of 2', 'tapping a photo opens it full screen');
  await page.click('#lbNext');
  check((await page.textContent('#lbCount')) === '2 of 2', 'next photo works');
  await page.click('#lbClose');

  // ---- share
  await page.click('button:has-text("Share")');
  const mailto = await page.getAttribute('.share-box a[href^="mailto:"]', 'href');
  const mailBody = decodeURIComponent(mailto.split('body=')[1]);
  check(mailBody.includes('Who: PAPA, Chance, Uncle Bob') && mailBody.includes('What: Fish caught, Swimming'), 'email share includes who and what');
  check(mailBody.includes('Fish: 2.5″ Yellow perch — Chance; 31″ Northern pike — PAPA'), 'email share lists the fish');

  // ---- Fish Board
  await page.click('#btnBack');
  await page.click('#tabs a[data-tab=fish]');
  await page.waitForSelector('.card.crown');
  check((await page.textContent('.card.crown')).includes('Caught by Chance'), 'Fish Board crowns the smallest fish');
  const order = await page.$$eval('section:has(h2:has-text("giant to smallest")) .fish-size', (e) => e.map((x) => x.textContent));
  check(order.join(',') === '31″,2.5″', 'Fish Board ranks giant to smallest');
  check(await page.isVisible('#fabNew') && await page.isVisible('#tabs'), 'tabs and New entry show on the Fish Board');
  await page.click('.card.crown .thumb');
  await page.waitForFunction(() => { const i = document.getElementById('lbImg'); return i.complete && i.naturalWidth > 0; });
  check(true, 'the king’s fish photo opens full screen');
  await page.click('#lbClose');
  await shot('04b-fishboard');
  await page.selectOption('.filters select', '');
  check((await page.textContent('.kings')).includes('2024: Chance'), 'All summers lists every year’s king');
  await page.click('#tabs a[data-tab=journal]');

  // ---- list and search
  await page.waitForSelector('.entry-card');
  check((await page.textContent('.year')).startsWith('2024'), 'entries are grouped by year');
  await page.fill('.filters input', 'pike');
  check(await page.$$eval('.entry-card', (e) => e.length) === 1, 'search finds the entry');
  await page.fill('.filters input', 'perch');
  check(await page.$$eval('.entry-card', (e) => e.length) === 1, 'search finds fish species');
  await page.fill('.filters input', 'tubing');
  check(await page.isVisible('text=No entries match.'), 'search with no match says so');
  await page.fill('.filters input', '');
  await shot('05-list');

  // ---- edit: remove a photo, change text
  await page.click('.entry-card');
  await page.click('a:has-text("Edit")');
  await page.waitForSelector('form.edit');
  check(await page.$$eval('.photo-grid.edit .thumb', (e) => e.length) === 2, 'edit shows saved photos');
  check(await page.inputValue('#fishLen2') === '31', 'edit shows saved fish');
  await page.fill('#fishLen2', '33.5');
  await page.click('.photo-grid.edit .thumb .remove');
  await page.fill('#fBody', 'Calm morning off the dock. Changed.');
  await page.click('button[type=submit]');
  await page.waitForSelector('article.entry');
  check((await page.textContent('article .body')).includes('Changed.'), 'edits are saved');
  check(await page.$$eval('article .photo-grid .thumb', (e) => e.length) === 1, 'removed photo is gone');
  check((await page.textContent('article')).includes('33.5″'), 'fish length edit is saved');

  // ---- survives a reload
  await page.reload();
  await page.waitForSelector('article.entry');
  check((await page.textContent('article .body')).includes('Changed.'), 'entry is still there after reloading');

  // ---- unsaved draft is rescued
  await page.goto(BASE + '#/new');
  await page.waitForSelector('form.edit');
  await page.fill('#fBody', 'Half-written thought');
  await page.click('#btnBack'); // the leave-without-saving prompt is accepted
  await page.waitForSelector('.entry-card');
  await page.click('#fabNew');
  await page.waitForSelector('form.edit');
  check((await page.inputValue('#fBody')) === 'Half-written thought', 'an unfinished new entry comes back');
  await page.click('button:has-text("Start over")');
  check((await page.inputValue('#fBody')) === '', 'Start over clears it');

  // ---- settings lists
  await page.goto(BASE + '#/settings');
  await page.waitForSelector('section.card');
  check(await page.isVisible('.chip.person:has-text("Uncle Bob")'), 'added person appears in the settings list');
  await page.click('.chip.person:has-text("Uncle Bob")');
  await page.waitForFunction(() => !document.body.textContent.includes('Uncle Bob'));
  check(true, 'a person can be taken off the list');
  await page.fill('section:has(h2:has-text("What did we do")) .ms-add input', 'Kayaking');
  await page.click('section:has(h2:has-text("What did we do")) .ms-add button');
  await page.waitForSelector('.chip.activity:has-text("Kayaking")');
  check(true, 'a new activity can be added from settings');
  await shot('06-settings');

  // the removed person is still on the old entry
  await page.goto(BASE);
  await page.waitForSelector('.entry-card');
  check(await page.isVisible('.entry-card .chip:has-text("Uncle Bob")'), 'old entries keep a choice taken off the list');

  // ---- delete
  await page.click('.entry-card');
  await page.click('a:has-text("Edit")');
  await page.click('button:has-text("Delete this entry")');
  await page.waitForSelector('.welcome');
  check(true, 'entry can be deleted');

  // ---- narrow phone: nothing wider than the screen
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check(!overflow, 'no sideways scrolling on a phone');

  check(errors.length === 0, 'no errors in the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
