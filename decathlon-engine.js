/* Decathlon rules engine: events, World Athletics points tables, performance models and
   computer athletes. Pure logic, no DOM. Browser: window.Deca. Node: module.exports. */
(function (root) {
  'use strict';

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  /* Points: track  A*(B-T)^C (T in seconds) · jumps A*(M-B)^C (M in cm) · throws A*(D-B)^C (D in metres).
     Coefficients are the official men's decathlon tables. */
  const EVENTS = [
    { id: '100',  name: '100 Metres',      day: 1, kind: 'race',   unit: 'time', A: 25.4347, B: 18,   C: 1.81, dist: 100,  vmax: 11.0, lo: .22, acc: 1.15, dec: .9, scale: 1 },
    { id: 'lj',   name: 'Long Jump',       day: 1, kind: 'jump',   unit: 'cm',   A: 0.14354, B: 220,  C: 1.4,  pmax: 7.96, p: 1.3,  runup: 32, vmax: 11.0, lo: .22, acc: 1.15, dec: .9, opt: 22, span: 26, attempts: 3 },
    { id: 'sp',   name: 'Shot Put',        day: 1, kind: 'throw',  unit: 'm',    A: 51.39,   B: 1.5,  C: 1.05, pmax: 19.19, p: 2.23, opt: 40, span: 38, window: 2.0, attempts: 3, lo: .22 },
    { id: 'hj',   name: 'High Jump',       day: 1, kind: 'height', unit: 'cm',   A: 0.8465,  B: 75,   C: 1.42, pmax: 2.36, p: 1.15, runup: 14, vmax: 8.0, lo: .22, acc: 1.3, dec: .9, start: 1.55, step: .05 },
    { id: '400',  name: '400 Metres',      day: 1, kind: 'race',   unit: 'time', A: 1.53775, B: 82,   C: 1.81, dist: 400,  vmax: 9.65, lo: 0, acc: 1.1, dec: .7, scale: 2.4, sustain: .92, drain: .6, rec: .12 },
    { id: '110h', name: '110m Hurdles',    day: 2, kind: 'race',   unit: 'time', A: 5.74352, B: 28.5, C: 1.92, dist: 110,  vmax: 8.93, lo: .01, acc: 1.15, dec: .9, scale: 1, hurdles: true },
    { id: 'dt',   name: 'Discus Throw',    day: 2, kind: 'throw',  unit: 'm',    A: 12.91,   B: 4,    C: 1.1,  pmax: 58.6, p: 2.16, opt: 36, sector: 17, window: 2.0, attempts: 3, lo: .22 },
    { id: 'pv',   name: 'Pole Vault',      day: 2, kind: 'height', unit: 'cm',   A: 0.2797,  B: 100,  C: 1.35, pmax: 5.45, p: 1.51, runup: 28, vmax: 9.6, lo: .22, acc: 1.15, dec: .9, start: 3.00, step: .10 },
    { id: 'jt',   name: 'Javelin Throw',   day: 2, kind: 'throw',  unit: 'm',    A: 10.14,   B: 7,    C: 1.08, pmax: 80.4, p: 2.13, runup: 22, vmax: 8.0, lo: .22, acc: 1.3, dec: .9, opt: 34, span: 30, attempts: 3 },
    { id: '1500', name: '1500 Metres',     day: 2, kind: 'race',   unit: 'time', A: 0.03768, B: 480,  C: 1.85, dist: 1500, vmax: 6.81, lo: 0, acc: .8, dec: .6, scale: 8, sustain: .92, drain: .15, rec: .05 }
  ];
  const EV = {}; EVENTS.forEach((e, i) => { e.idx = i; EV[e.id] = e; });
  const HURDLES = [];
  for (let i = 0; i < 10; i++) HURDLES.push(13.72 + i * 9.14);

  function points(ev, perf) {
    if (perf == null || !isFinite(perf)) return 0;
    if (ev.unit === 'time') return perf < ev.B ? Math.floor(ev.A * Math.pow(ev.B - perf, ev.C)) : 0;
    const M = ev.unit === 'cm' ? perf * 100 : perf;
    return M > ev.B ? Math.floor(ev.A * Math.pow(M - ev.B, ev.C)) : 0;
  }

  /* Effort f (0..1, from tap rate or computer skill) to a fraction of top speed or power. */
  function g(ev, f) { if (f <= 0) return 0; const lo = ev.lo == null ? .22 : ev.lo; return (lo + (1 - lo) * Math.min(1, f)) * Math.min(1, f / .3); }
  const RMAX = 10;                                    // taps per second for full effort
  const tapEffort = rate => Math.sqrt(clamp(rate / RMAX, 0, 1));

  /* One step of running. st = { x, v, S (stamina 0..1), t } */
  function runStep(ev, st, f, dt) {
    let sf = 1;
    if (ev.drain) {
      const d = f - ev.sustain;
      st.S = clamp(st.S - (d > 0 ? d * ev.drain : d * ev.rec) * dt, 0, 1);
      sf = st.S >= .25 ? 1 : .68 + .32 * st.S / .25;
    }
    const target = ev.vmax * g(ev, f) * sf;
    const k = target > st.v ? ev.acc : ev.dec;
    st.v += (target - st.v) * Math.min(1, k * dt);
    st.x += st.v * dt; st.t += dt;
    return st;
  }

  /* Field performance from effective power (0..1) and execution quality (0..1). */
  const perfFrom = (ev, gEff, Q) => ev.pmax * Math.pow(clamp(gEff, 0, 1.02), ev.p) * clamp(Q, 0, 1);
  const angleQ = (ev, deg) => clamp(1 - Math.pow((deg - ev.opt) / ev.span, 2), .45, 1);
  const sectorQ = dev => 1 - Math.pow(Math.min(1, Math.abs(dev) / 17), 2) * .2;

  /* ---------------- computer athletes ---------------- */
  const DIFF = { rookie: { name: 'Rookie', lo: .68, hi: .78 }, pro: { name: 'Pro', lo: .78, hi: .86 }, olympian: { name: 'Olympian', lo: .86, hi: .935 } };
  function rngFrom(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const gauss = rng => (rng() + rng() + rng() - 1.5) * 2;

  function runupSpeed(ev, f, dist) { const st = { x: 0, v: 0, S: 1, t: 0 }; while (st.x < dist && st.t < 30) runStep(ev, st, f, .02); return st.v; }

  /* Race simulation for a computer athlete. Returns time and a position trace (every 0.05 s). */
  function cpuRace(ev, skill, rng) {
    const st = { x: 0, v: 0, S: 1, t: 0 }, trace = [0], dt = .05;
    const react = .13 + (1 - skill) * .3 + rng() * .06;
    const f0 = clamp(skill + gauss(rng) * .02, .4, 1);
    let tNext = dt, hitPlan = [];
    if (ev.hurdles) hitPlan = HURDLES.map(() => rng() < .03 + .5 * (1 - skill));
    let h = 0;
    while (st.x < ev.dist && st.t < 600) {
      let f = st.t < react ? 0 : f0;
      if (ev.drain) {   // pace below the sustainable effort, then kick
        const kickAt = ev.dist * (ev.dist > 1000 ? .8 : .72);
        f = st.t < react ? 0 : st.x < kickAt ? Math.min(f0, ev.sustain - .01) : f0;
      }
      const before = st.x; runStep(ev, st, f, dt);
      if (ev.hurdles) while (h < HURDLES.length && st.x >= HURDLES[h]) { if (hitPlan[h] && before < HURDLES[h]) st.v *= .55; h++; }
      if (st.t >= tNext - 1e-9) { trace.push(Math.min(st.x, ev.dist + 5)); tNext += dt; }
    }
    const over = st.x - ev.dist, time = st.t - (st.v > 0 ? over / st.v : 0);
    return { perf: Math.round(time * 100) / 100, trace, hits: hitPlan.filter(Boolean).length };
  }

  /* Field attempt for a computer athlete: returns a mark or null (foul). */
  function cpuAttempt(ev, skill, rng) {
    const f = clamp(skill + gauss(rng) * .025, .4, 1);
    const Q = clamp(1 - Math.abs(gauss(rng)) * (1.05 - skill) * .22, .6, 1);
    if ((ev.kind === 'jump' || ev.kind === 'throw') && rng() < .04 + .18 * (1 - skill)) return null;
    let gEff;
    if (ev.runup) gEff = runupSpeed(ev, f, ev.runup) / ev.vmax; else gEff = g(ev, f);
    return Math.round(perfFrom(ev, gEff, Q) * 100) / 100;
  }

  /* Heights for a computer athlete: open below their ability, three tries per height. */
  function cpuHeights(ev, skill, rng) {
    const ability = cpuAttempt(Object.assign({}, ev, { kind: 'x' }), skill, rng) || ev.start;
    let bar = ev.start; while (bar + ev.step < ability - ev.step * 3) bar += ev.step;
    bar = Math.round(bar * 100) / 100;
    const log = []; let best = null, fails = 0;
    while (fails < 3 && log.length < 40) {
      const jump = ev.pmax * Math.pow(clamp(skill + gauss(rng) * .02, .4, 1), ev.p) * clamp(1 - Math.abs(gauss(rng)) * (1.05 - skill) * .22, .6, 1);
      const ok = jump >= bar;
      log.push({ h: bar, ok });
      if (ok) { best = bar; fails = 0; bar = Math.round((bar + ev.step) * 100) / 100; } else fails++;
    }
    return { perf: best, log };
  }

  function makeCpuSkill(diff, rng) { const d = DIFF[diff] || DIFF.pro; return d.lo + rng() * (d.hi - d.lo); }
  function eventSkill(base, rng) { return clamp(base + gauss(rng) * .03, .55, 1); }

  function fmt(ev, perf) {
    if (perf == null) return ev.kind === 'race' ? 'DNF' : 'NM';
    if (ev.unit === 'time') {
      if (perf >= 60) { const m = Math.floor(perf / 60), s = perf - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); }
      return perf.toFixed(2);
    }
    return perf.toFixed(2) + ' m';
  }

  const api = { EVENTS, EV, HURDLES, DIFF, RMAX, points, g, tapEffort, runStep, perfFrom, angleQ, sectorQ, runupSpeed, cpuRace, cpuAttempt, cpuHeights, makeCpuSkill, eventSkill, rngFrom, gauss, fmt, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Deca = api;
})(typeof window !== 'undefined' ? window : globalThis);
