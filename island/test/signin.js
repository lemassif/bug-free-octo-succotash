/* Island Dreams: staying signed in on an iPhone Home Screen app.

   Run it:
     npx http-server -p 8099 -s -c-1 .     (from the repo root)
     node island/test/signin.js            (takes about two minutes)

   Uses a fake Supabase, so it needs no real project. Checks the two
   ways the Home Screen app used to ask for a new code every time:

   1. Leaving for Mail to fetch the code. iOS often closes the app
      meanwhile; it must still be waiting for the code when reopened.
   2. Opening the app an hour later, before the phone's connection is
      up. The saved sign-in can't be renewed yet; that is not a
      sign-out, so the app must wait and then open the journal. */

const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8099/island/';

let failures = 0;
function check(cond, msg) {
  console.log((cond ? '  ok   ' : '  FAIL ') + msg);
  if (!cond) failures++;
}

const now = () => Math.floor(Date.now() / 1000);
const fakeSession = () => ({
  access_token: 'h.' + Buffer.from(JSON.stringify({ exp: now() + 3600, sub: 'u1', email: 'family@x.com' })).toString('base64url') + '.s',
  token_type: 'bearer', expires_in: 3600, expires_at: now() + 3600, refresh_token: 'r' + Math.random(),
  user: { id: 'u1', email: 'family@x.com', aud: 'authenticated' }
});

/* A page wired to a fake Supabase. net.up = false makes renewals fail as if offline. */
async function openApp(ctx, net) {
  const p = await ctx.newPage();
  await p.route('**/island/config.js*', (r) => r.fulfill({ contentType: 'text/javascript',
    body: "window.ISLAND_CONFIG = { supabaseUrl: 'https://fake.supabase.co', supabaseAnonKey: 'k' };" }));
  const json = (r, body) => r.fulfill({ status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
  await p.route('https://fake.supabase.co/**', (r) => {
    const req = r.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === 'OPTIONS') return r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*',
      'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    if (path.endsWith('/token')) return net.up ? json(r, fakeSession()) : r.abort('internetdisconnected');
    if (path.endsWith('/verify')) return json(r, fakeSession());
    if (path.endsWith('/rpc/is_member')) return json(r, true);
    if (path.includes('/rest/v1/')) return json(r, []);
    return json(r, {});
  });
  await p.goto(BASE);
  return p;
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  const net = { up: true };

  // ---- 1. the app is closed while you're in Mail
  let p = await openApp(ctx, net);
  await p.fill('#signinEmail', 'family@x.com');
  await p.click('button[type=submit]');
  await p.waitForSelector('#signinCode');
  await p.close();
  p = await openApp(ctx, net);
  const step = await Promise.race([
    p.waitForSelector('#signinCode').then(() => 'code'),
    p.waitForSelector('#signinEmail').then(() => 'email')
  ]);
  check(step === 'code', 'reopened after a trip to Mail, it is still waiting for the code');
  await p.fill('#signinCode', '123456');
  await p.click('button[type=submit]');
  await p.waitForSelector('.welcome');
  check(true, 'the code signs in');

  // ---- 2. an hour later, opened before the connection is up
  await p.evaluate(() => {
    const k = Object.keys(localStorage).find((x) => x.startsWith('sb-') && x.endsWith('-auth-token'));
    const v = JSON.parse(localStorage.getItem(k));
    v.expires_at = Math.floor(Date.now() / 1000) - 3600;
    localStorage.setItem(k, JSON.stringify(v));
  });
  await p.close();
  net.up = false;
  p = await openApp(ctx, net);
  const first = await Promise.race([
    p.waitForSelector('#reconnecting', { timeout: 90000 }).then(() => 'connecting'),
    p.waitForSelector('#signinEmail', { timeout: 90000 }).then(() => 'sign-in')
  ]);
  check(first === 'connecting', 'with no connection yet it says "Connecting", not "sign in"');
  net.up = true;
  await p.waitForSelector('.welcome', { timeout: 120000 });
  check(true, 'once connected, the journal opens with no new code');

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
