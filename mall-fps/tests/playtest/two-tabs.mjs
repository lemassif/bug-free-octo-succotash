// Automated 2-tab playtest against a real server.
//   1. npm run dev (client) and BFB_TEST=1 npm run dev -w server
//   2. node tests/playtest/two-tabs.mjs [clientUrl] [outDir]
// Two tabs join one bot-free room, get staged 10 m apart, and tab A shoots
// tab B. Checks roster sync, interpolation, hits, knockout, respawn and
// prediction corrections. Exits non-zero on failure.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:5173/";
const out = process.argv[3] ?? "playtest-output";
fs.mkdirSync(out, { recursive: true });
const failures = [];
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failures.push(msg); };

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ viewport: { width: 480, height: 270 } });
const open = async (name, char) => {
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log(`[${name} pageerror]`, e.message));
  p.on("console", (m) => { if (m.type() === "error") console.log(`[${name}]`, m.text()); });
  await p.goto(`${base}?autojoin=online&nobots&name=${name}&char=${char}`);
  await p.waitForFunction(() => window.__bfb?.net?.welcome, null, { timeout: 30000 });
  await p.evaluate(() => {
    const b = window.__bfb;
    b.game.controls.forceActive = true;
    b.log = { hits: [], kills: [], hurts: [] };
    b.net.transport.on("hit", (e) => b.log.hits.push(e));
    b.net.transport.on("kill", (e) => b.log.kills.push(e));
    b.net.transport.on("hurt", (e) => b.log.hurts.push(e));
  });
  return p;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const A = await open("Alice", 0);
const B = await open("Bob", 1);
await wait(1000);

const info = async (p) => p.evaluate(() => {
  const { net, game } = window.__bfb;
  return { id: net.welcome.id, team: net.myTeam, roster: net.roster.length, me: [game.me.x, game.me.y, game.me.z], alive: game.me.alive, hp: net.hp, rtt: net.rtt, corrections: net.corrections };
});
let a = await info(A), b = await info(B);
check(a.roster === 2 && b.roster === 2, `both tabs see 2 players (A ${a.roster}, B ${b.roster})`);
check(a.team !== b.team, `players are on opposite teams (A ${a.team}, B ${b.team})`);

// Stage the duel in the floor 1 north corridor.
await A.evaluate(() => window.__bfb.net.transport.raw("tp", [-5, 0, 8, -Math.PI / 2]));
await B.evaluate(() => window.__bfb.net.transport.raw("tp", [5, 0, 8, Math.PI / 2]));
await wait(1200);
a = await info(A); b = await info(B);
check(Math.abs(a.me[0] + 5) < 0.2 && Math.abs(b.me[0] - 5) < 0.2, `teleports applied (A x=${a.me[0].toFixed(2)}, B x=${b.me[0].toFixed(2)})`);
const seen = await A.evaluate((id) => { const p = window.__bfb.net.poses.get(id); return p && [p.x, p.y, p.z]; }, b.id);
check(seen && Math.hypot(seen[0] - 5, seen[2] - 8) < 0.3, `tab A sees B where B is (${seen?.map((v) => v.toFixed(2))})`);
await A.screenshot({ path: `${out}/a-sees-b.png` });

// Movement: B strafes for 1 s; A should see it with about 100 ms delay, and
// B's own prediction should need no corrections.
const c0 = b.corrections;
await B.evaluate(() => { window.__bfb.game.controls.yaw = Math.PI / 2; window.__bfb.game.controls.testKeys = 4; });
await wait(1000);
await B.evaluate(() => { window.__bfb.game.controls.testKeys = 0; });
await wait(400);
b = await info(B);
const seen2 = await A.evaluate((id) => { const p = window.__bfb.net.poses.get(id); return p && [p.x, p.z]; }, b.id);
check(Math.abs(b.me[2] - 8) > 3, `B moved (z ${b.me[2].toFixed(2)})`);
check(seen2 && Math.hypot(seen2[0] - b.me[0], seen2[1] - b.me[2]) < 0.3, `A's view of B caught up after moving (${seen2?.map((v) => v.toFixed(2))} vs ${b.me[0].toFixed(2)},${b.me[2].toFixed(2)})`);
check(b.corrections - c0 <= 2, `B's prediction matched the server (${b.corrections - c0} corrections while moving)`);

// Shooting: A turns to face B and holds fire.
await A.evaluate(([bx, bz]) => {
  const g = window.__bfb.game;
  const dx = bx - g.me.x, dz = bz - g.me.z;
  g.controls.yaw = Math.atan2(-dx, -dz);
  g.controls.pitch = Math.atan2(1.15 - 1.6, Math.hypot(dx, dz));
  g.controls.testKeys = 64;
}, [b.me[0], b.me[2]]);
await wait(1500);
await A.evaluate(() => { window.__bfb.game.controls.testKeys = 0; });
const logA = await A.evaluate(() => window.__bfb.log);
const logB = await B.evaluate(() => window.__bfb.log);
check(logA.hits.length >= 4, `A got ${logA.hits.length} server-confirmed hits`);
check(logB.hurts.length >= 4, `B got ${logB.hurts.length} hurt events`);
const kill = logA.kills.find((k) => k.v === b.id);
check(!!kill && kill.k === a.id, `A knocked out B: ${kill ? kill.labels.map((l) => `${l[0]} +${l[1]}`).join(", ") : "none"}`);
check(!!kill?.line, `voice line: "${kill?.line}"`);
check(logB.kills.some((k) => k.v === b.id), "B's tab also got the knockout");
b = await info(B);
check(!b.alive, "B is down");
await A.screenshot({ path: `${out}/a-after-kill.png` });
await wait(3600);
b = await info(B);
check(b.alive && b.me[0] > 25, `B respawned at the team 1 spawn (x=${b.me[0].toFixed(1)})`);
a = await info(A);
console.log(`round trip: A ${a.rtt.toFixed(0)} ms, B ${b.rtt.toFixed(0)} ms`);
await browser.close();
if (failures.length) { console.log(`\n${failures.length} check(s) failed`); process.exit(1); }
console.log("\nall checks passed");
