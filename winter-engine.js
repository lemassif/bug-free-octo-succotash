/* Powder Cup rules engine: courses, race physics, moguls, halfpipe geometry, trick names and
   scoring, computer riders. Pure logic, no DOM. Browser: window.Snow. Node: module.exports. */
(function (root) {
  'use strict';

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const G = 9.81, D2R = Math.PI / 180;
  const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  function rngFrom(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const gauss = rng => (rng() + rng() + rng() - 1.5) * 2;

  const EVENTS = [
    { id: 'downhill', name: 'Downhill', kind: 'race', unit: 'time' },
    { id: 'gs', name: 'Giant Slalom', kind: 'race', unit: 'time' },
    { id: 'slalom', name: 'Slalom', kind: 'race', unit: 'time' },
    { id: 'moguls', name: 'Moguls', kind: 'moguls', unit: 'score' },
    { id: 'halfpipe', name: 'Halfpipe', kind: 'pipe', unit: 'score' },
    { id: 'bigair', name: 'Big Air', kind: 'air', unit: 'score' }
  ];
  const EV = {}; EVENTS.forEach((e, i) => { e.idx = i; EV[e.id] = e; });

  /* ---------------- races ----------------
     x: metres across the slope (0 = centre), y: metres down the course.
     grip: how fast the direction of travel follows the skis (rad/s). Low grip = ice: you drift and skid. */
  const RACE = {
    slalom:   { slope: 10, len: 420,  gap: [10, 12], off: 3.4, gw: 4.6, grip: 7,   turn: 3.4, turnLoss: .2,  mu: .03,  drag: .0030, tuckDrag: .0020, skidLoss: .7,  half: 11, start: 8,  ice: false },
    gs:       { slope: 15, len: 900,  gap: [22, 27], off: 6.5, gw: 7,   grip: 4.5, turn: 2.5, turnLoss: .18, mu: .03,  drag: .0026, tuckDrag: .0014, skidLoss: .7,  half: 19, start: 10, ice: false },
    downhill: { slope: 21, len: 1900, gap: [55, 75], off: 10,  gw: 11,  grip: 1.7, turn: 1.6, turnLoss: .06, mu: .018, drag: .0021, tuckDrag: .0011, skidLoss: .45, half: 25, start: 12, ice: true, jumps: [.31, .66, .87] }
  };
  function slopeAt(c, y) {
    if (c.id === 'slalom') return c.slope + Math.sin(y / 60) * .8;
    if (c.id === 'gs') return c.slope + Math.sin(y / 95) * 3;
    return c.slope + Math.sin(y / 170) * 6 + Math.sin(y / 61) * 2;
  }
  // sheet-ice bands on the downhill: grip drops even further
  function iceAt(c, y) { if (!c.ice) return 0; const k = (y % 150) / 150; return k > .55 && k < .75 ? 1 : 0; }

  function makeCourse(id, seed) {
    const base = RACE[id], rng = rngFrom(seed), c = Object.assign({ id }, base), gates = [];
    let y = 45, side = rng() < .5 ? -1 : 1, drift = 0;
    while (y < c.len - 35) {
      drift = clamp(drift + (rng() - .5) * c.off * .5, -c.half * .3, c.half * .3);
      const x = clamp(drift + side * c.off * (.75 + rng() * .5), -c.half + c.gw / 2 + 1, c.half - c.gw / 2 - 1);
      gates.push({ y, x, w: c.gw, side, n: gates.length });
      side = -side; y += c.gap[0] + rng() * (c.gap[1] - c.gap[0]);
    }
    c.gates = gates;
    c.jumps = (base.jumps || []).map(f => {
      const y0 = Math.round(f * c.len), near = gates.reduce((a, g) => Math.abs(g.y - y0) < Math.abs(a.y - y0) ? g : a, gates[0]);
      return { y: y0 + (Math.abs(near.y - y0) < 12 ? 16 : 0) };
    });
    c.par = botRun(c).t;
    return c;
  }

  function newRacer(c) { return { x: 0, y: 0, vx: 0, vy: c.start, th: 0, t: 0, air: 0, airMax: 0, skid: 0, missed: 0, gi: 0, bump: 0, finished: false }; }

  /* one physics step. inp: { steer: -1|0|1, tuck: bool } */
  function raceStep(c, s, inp, dt) {
    s.t += dt; if (s.bump > 0) s.bump -= dt;
    if (s.air > 0) { s.air -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += G * Math.sin(slopeAt(c, s.y) * D2R) * dt * .6; gatesCheck(c, s); return s; }
    const sl = slopeAt(c, s.y) * D2R, tuck = !!inp.tuck;
    const turn = c.turn * (tuck ? .5 : 1);
    if (inp.steer) s.th += inp.steer * turn * dt; else s.th -= Math.sign(s.th) * Math.min(Math.abs(s.th), 1.1 * dt);
    s.th = clamp(s.th, -1.45, 1.45);
    s.vy += G * Math.sin(sl) * dt;
    let v = Math.hypot(s.vx, s.vy), phi = Math.atan2(s.vx, s.vy);
    const grip = c.grip * (iceAt(c, s.y) ? .45 : 1) * (tuck ? .8 : 1);
    const diff = wrap(s.th - phi); phi += Math.sign(diff) * Math.min(Math.abs(diff), grip * dt);
    const skid = Math.abs(Math.sin(wrap(s.th - phi)));
    v -= (c.mu * G * Math.cos(sl) + (tuck ? c.tuckDrag : c.drag) * v * v + (skid * c.skidLoss + (inp.steer ? c.turnLoss : 0)) * v) * dt;
    v = Math.max(1, v);
    s.vx = Math.sin(phi) * v; s.vy = Math.cos(phi) * v; s.skid = skid;
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.abs(s.x) > c.half) { s.x = Math.sign(s.x) * c.half; s.vx *= -.3; s.vy *= .72; s.th *= .3; s.bump = .5; }
    for (const j of c.jumps) if (!j.done && s.y >= j.y && s.y - s.vy * dt < j.y) { s.air = s.airMax = clamp(v * .028, .45, 1.15); s.jumpY = j.y; }
    gatesCheck(c, s);
    if (s.y >= c.len) s.finished = true;
    return s;
  }
  function gatesCheck(c, s) {
    while (s.gi < c.gates.length && s.y >= c.gates[s.gi].y) {
      const g = c.gates[s.gi]; g.res = g.res || {};
      const ok = Math.abs(s.x - g.x) <= g.w / 2 + .15; s.lastGate = { n: s.gi, ok };
      if (!ok) s.missed++;
      s.gi++;
    }
  }
  const MISS_PENALTY = 3;
  const raceTime = s => Math.round((s.t + s.missed * MISS_PENALTY) * 100) / 100;

  /* computer line: aim through the middle of the next gate (also gives the course's par time) */
  function botSteer(c, s, skill) {
    const g = c.gates[s.gi]; let tx = 0, ty = s.y + 30;
    if (g) { tx = g.x + (c.gates[s.gi + 1] ? (c.gates[s.gi + 1].x - g.x) * .12 : 0); ty = g.y; }
    const want = clamp(Math.atan2(tx - s.x, Math.max(4, ty - s.y)) * 1.15, -1.3, 1.3);
    const err = want - s.th, dz = .04 + (1 - (skill == null ? 1 : skill)) * .2;
    return { steer: Math.abs(err) < dz ? 0 : Math.sign(err), tuck: c.id !== 'slalom' && Math.abs(s.th) < .18 && Math.abs(err) < .15 };
  }
  function botRun(c, skill) {
    const s = newRacer(c), saved = c.jumps.map(j => j.done);
    let guard = 0; while (!s.finished && guard++ < 20000) raceStep(c, s, botSteer(c, s, skill), 1 / 60);
    return { t: raceTime(s), missed: s.missed, vmax: 0 };
  }

  /* ---------------- moguls ---------------- */
  const MOG = { len: 230, slope: 27, spacing: 3.9, base: 8.6, airs: [.3, .82] };
  function makeMoguls(seed) {
    const rng = rngFrom(seed), bumps = [], kick = MOG.airs.map(f => f * MOG.len);
    let y = 14, side = rng() < .5 ? -1 : 1;
    while (y < MOG.len - 8) {
      if (kick.some(k => y > k - 9 && y < k + 14)) { y += MOG.spacing; continue; }
      bumps.push({ y, side }); side = -side; y += MOG.spacing;
    }
    return { bumps, kickers: kick.map(y => ({ y })), len: MOG.len, par: MOG.len / 8.2 };
  }
  // real judging split: turns 60%, air 20%, speed 20%
  function mogulsScore(turnQ, airPts, time, par) {
    const turns = 60 * (turnQ.length ? turnQ.reduce((a, b) => a + b, 0) / turnQ.length : 0);
    const air = airPts.slice(0, 2).reduce((a, p) => a + Math.min(10, p / 9), 0);
    const speed = 20 * clamp((par * 1.45 - time) / (par * .45), 0, 1);
    return { turns: Math.round(turns * 10) / 10, air: Math.round(air * 10) / 10, speed: Math.round(speed * 10) / 10, total: Math.round((turns + air + speed) * 10) / 10 };
  }

  /* ---------------- halfpipe (cross-section, metres) ---------------- */
  const PIPE = { F: 3.3, R: 6.7, H: 6.7, hits: 6, maxUp: 11.2 };
  PIPE.T = Math.PI * PIPE.R / 2; PIPE.L = 2 * PIPE.T + 2 * PIPE.F; PIPE.W = PIPE.F + PIPE.R;
  // position on the surface for arc length s (0 = left lip, L = right lip); ang = surface tilt (rad, + = right wall)
  function pipeAt(s) {
    const { F, R, T } = PIPE;
    if (s <= T) { const b = Math.PI / 2 - s / R; return { x: -F - R * Math.sin(b), y: R - R * Math.cos(b), ang: -b, dy: -Math.sin(b) }; }
    if (s <= T + 2 * F) return { x: -F + (s - T), y: 0, ang: 0, dy: 0 };
    const b = (s - T - 2 * F) / R; return { x: F + R * Math.sin(b), y: R - R * Math.cos(b), ang: b, dy: Math.sin(b) };
  }
  function pipeStep(st, dt) {   // st: { s, v } on the surface
    const p = pipeAt(st.s);
    st.v += -G * p.dy * dt - Math.sign(st.v) * (.1 + .0022 * st.v * st.v) * dt;
    st.s += st.v * dt;
    return st;
  }

  /* ---------------- tricks ---------------- */
  const SPIN_RATE = 1000, FLIP_RATE = 450;   // degrees per second while the button is held
  const GRABS = { board: [['Indy', 'Mute'], ['Melon', 'Method']], ski: [['Japan', 'Mute'], ['Safety', 'Tail Grab']] };
  function landing(spin, flip) {
    const se = Math.abs(spin) % 180, sErr = Math.min(se, 180 - se);
    const fm = ((flip % 360) + 360) % 360, fErr = Math.min(fm, 360 - fm);
    if (sErr <= 38 && fErr <= 38) return 'clean';
    if (sErr <= 62 && fErr <= 62) return 'sketchy';
    return 'crash';
  }
  const MULT = ['', '', 'Double ', 'Triple ', 'Quad '];
  /* t: { spin, flip, grabT, grab, equip, height } -> { name, rot, flips, pts (before execution) } */
  function trick(t) {
    const rot = Math.round(Math.abs(t.spin) / 180) * 180, flips = Math.max(0, Math.round(t.flip / 360));
    let core;
    const m = MULT[flips] != null ? MULT[flips] : flips + 'x ';
    if (flips && rot >= 360) core = m + 'Cork ' + rot;
    else if (flips) core = m + 'Backflip' + (rot ? ' ' + rot : '');
    else if (rot) core = String(rot);
    else core = 'Straight Air';
    let dir = '';
    if (rot) dir = t.equip === 'board' ? (t.spin > 0 ? 'Frontside ' : 'Backside ') : (t.spin > 0 ? 'Right ' : 'Left ');
    const grabbed = t.grabT >= .25 && t.grab;
    const name = dir + core + (grabbed ? ' ' + t.grab : '');
    const pts = rot / 180 * 9 + flips * 22 + (flips && rot ? 6 : 0) + (grabbed ? 8 + Math.min(6, t.grabT * 8) : 0) + (t.height ? Math.min(12, t.height * 1.6) : 0);
    return { name, rot, flips, grabbed, pts: Math.round(pts * 10) / 10, key: dir + core };
  }
  const EXEC = { clean: 1, sketchy: .55, crash: 0 };
  const PIPE_SCALE = .17, AIR_SCALE = .56;
  // halfpipe run: repeats of the same trick count half
  function pipeScore(list) {
    const seen = {}; let sum = 0;
    for (const t of list) { const rep = seen[t.key] ? .5 : 1; seen[t.key] = 1; sum += t.pts * EXEC[t.land] * rep; }
    return Math.min(99, Math.round(sum * PIPE_SCALE * 10) / 10);
  }
  const jumpScore = t => Math.min(100, Math.round(t.pts * EXEC[t.land] * AIR_SCALE * 10) / 10);

  /* ---------------- computer riders ---------------- */
  const DIFF = { rookie: { name: 'Rookie', lo: .45, hi: .62 }, pro: { name: 'Pro', lo: .66, hi: .8 }, legend: { name: 'Legend', lo: .84, hi: .95 } };
  function makeSkill(diff, rng) { const d = DIFF[diff] || DIFF.pro; return d.lo + rng() * (d.hi - d.lo); }
  function cpuResult(ev, skill, rng, course) {
    const s = clamp(skill + gauss(rng) * .03, .3, 1);
    if (ev.kind === 'race') {
      const miss = rng() < (1 - s) * .5 ? 1 + (rng() < (1 - s) * .4 ? 1 : 0) : 0;
      const t = course.par * (1 + (1 - s) * .32 + gauss(rng) * .012) + miss * MISS_PENALTY;
      return { perf: Math.round(t * 100) / 100, missed: miss };
    }
    if (ev.kind === 'moguls') return { perf: Math.round(clamp(28 + s * 62 + gauss(rng) * 3 - (rng() < (1 - s) * .25 ? 18 : 0), 5, 97) * 10) / 10 };
    if (ev.kind === 'pipe') return { perf: Math.round(clamp(100 * Math.pow(s, 1.6) + gauss(rng) * 4 - (rng() < (1 - s) * .35 ? 25 : 0), 5, 98) * 10) / 10 };
    const j = () => clamp(100 * Math.pow(s, 1.6) + gauss(rng) * 6 - (rng() < (1 - s) * .3 ? 50 : 0), 4, 99);
    const a = [j(), j(), j()].sort((p, q) => q - p);
    return { perf: Math.round((a[0] + a[1]) * 10) / 10 };
  }

  const CUP_POINTS = [100, 80, 60, 50, 45, 40];
  function fmt(ev, perf) {
    if (perf == null) return ev.unit === 'time' ? 'DNF' : '0.0';
    if (ev.unit === 'time') { if (perf >= 60) { const m = Math.floor(perf / 60), s = perf - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); } return perf.toFixed(2); }
    return perf.toFixed(1);
  }
  // better result first: lower time, higher score
  const better = (ev, a, b) => a == null ? 1 : b == null ? -1 : ev.unit === 'time' ? a - b : b - a;

  const api = { EVENTS, EV, RACE, MOG, PIPE, DIFF, SPIN_RATE, FLIP_RATE, GRABS, CUP_POINTS, MISS_PENALTY, EXEC,
    clamp, wrap, rngFrom, gauss, slopeAt, iceAt, makeCourse, newRacer, raceStep, raceTime, botSteer, botRun,
    makeMoguls, mogulsScore, pipeAt, pipeStep, landing, trick, pipeScore, jumpScore, makeSkill, cpuResult, fmt, better };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Snow = api;
})(typeof window !== 'undefined' ? window : globalThis);
