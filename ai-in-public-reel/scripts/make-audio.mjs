// Synthesizes public/music.wav (24s, 44.1kHz stereo, 16-bit). No samples, everything is math.
// Every event time comes from src/timing.js so sounds land on their visual frame.
import fs from 'fs';
import { FPS, BOUNDS, HITS, KINETIC, LOCK, TERM, typeFrames, EASE, NN, SCENES } from '../src/timing.js';

const SR = 44100, DUR = 24, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N); // dry
const SL = new Float32Array(N), SRr = new Float32Array(N); // reverb send
const fr = (f) => f / FPS;

function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rng = mulberry32(1337);
const nz = () => rng() * 2 - 1;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;

class BQ {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; this.b0 = 1; this.b1 = this.b2 = this.a1 = this.a2 = 0; }
  set(type, f, q = 0.707) {
    f = Math.max(10, Math.min(f, SR * 0.45));
    const w = (TAU * f) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * c) / a0; this.a2 = (1 - al) / a0;
    return this;
  }
  p(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}
function saw(ph, dt) {
  let v = 2 * ph - 1;
  if (ph < dt) { const t = ph / dt; v -= t + t - t * t - 1; }
  else if (ph > 1 - dt) { const t = (ph - 1) / dt; v -= t * t + t + t + 1; }
  return v;
}
// Write a voice. gen(t, k) returns a mono sample, t = seconds since start.
function voice(t0, dur, { gain = 1, pan = 0, send = 0 }, gen) {
  const i0 = Math.max(0, Math.round(t0 * SR)), i1 = Math.min(N, Math.round((t0 + dur) * SR));
  const a = ((pan + 1) * Math.PI) / 4, gl = Math.cos(a) * gain, gr = Math.sin(a) * gain;
  for (let i = i0; i < i1; i++) {
    const s = gen((i - i0) / SR, i - i0);
    L[i] += s * gl; R[i] += s * gr;
    SL[i] += s * gl * send; SRr[i] += s * gr * send;
  }
}
const expDecay = (t, tau) => Math.exp(-t / tau);
const smooth = (x) => x * x * (3 - 2 * x);

// ---------------------------------------------------------------- instruments
function sineSweep(t0, dur, f0, f1, tau, o, curve = 'exp') {
  let ph = 0;
  voice(t0, dur, o, (t) => {
    const k = curve === 'exp' ? 1 - Math.exp(-t / tau) : clamp(t / dur);
    const f = f0 + (f1 - f0) * k; ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.min(1, t / 0.002) * expDecay(t, dur / 4);
  });
}
function boom(t, { level = 1, len = 2.2, f0 = 95, f1 = 30, rumble = 0.6, send = 0.35, crack = 1 }) {
  // sub body with pitch drop (slightly saturated so it reads on small speakers)
  let ph = 0;
  voice(t, len, { gain: level, send: send * 0.5 }, (tt) => {
    const f = f1 + (f0 - f1) * Math.exp(-tt / 0.16); ph += (TAU * f) / SR;
    const env = Math.min(1, tt / 0.0015) * Math.exp(-tt / (len * 0.28));
    return Math.tanh(1.8 * Math.sin(ph)) * 0.9 * env;
  });
  // rumble tail
  const lp = new BQ(), lp2 = new BQ();
  voice(t, len, { gain: level * rumble, send }, (tt, k) => {
    if ((k & 31) === 0) { lp.set('lp', lerp(900, 120, clamp(tt / 1.4)), 0.7); lp2.set('lp', 300, 0.7); }
    return lp2.p(lp.p(nz())) * 3 * Math.min(1, tt / 0.004) * Math.exp(-tt / (len * 0.3));
  });
  // top transient crack
  const hp = new BQ().set('hp', 1500, 0.7);
  voice(t, 0.25, { gain: level * 0.5 * crack, send: send * 0.8 }, (tt) => hp.p(nz()) * Math.exp(-tt / 0.03));
}
function whoosh(tPeak, { pre = 0.30, post = 0.22, level = 0.35, fLo = 250, fHi = 6500, pan = -0.5, panTo = 0.5, send = 0.3 } = {}) {
  const bp = new BQ(), hp = new BQ().set('hp', 120, 0.7);
  const t0 = tPeak - pre, dur = pre + post;
  voice(Math.max(0, t0), dur, { gain: level, send }, (t, k) => {
    const tt = t + (t0 < 0 ? -t0 : 0);
    const x = tt < pre ? tt / pre : 1 - (tt - pre) / post;
    if ((k & 15) === 0) bp.set('bp', fLo * Math.pow(fHi / fLo, clamp(tt < pre ? Math.pow(tt / pre, 1.6) : 1 - 0.5 * ((tt - pre) / post))), 0.9);
    const env = tt < pre ? Math.pow(tt / pre, 2.2) : Math.exp(-(tt - pre) / (post * 0.35));
    return hp.p(bp.p(nz())) * 2.2 * env;
  });
  // pan sweep: re-pan by post-adjusting gains is costly; use a second pass light layer instead
}
function hat(t, { level = 0.2, tau = 0.022, f = 7500, pan = 0, send = 0.1, open = false }) {
  const hp = new BQ().set('hp', f, 0.8), bp = new BQ().set('bp', 9500, 1.4);
  const d = open ? 0.16 : tau;
  voice(t, d * 6, { gain: level, pan, send }, (tt) => (hp.p(nz()) * 0.6 + bp.p(nz()) * 0.8) * Math.min(1, tt / 0.0006) * Math.exp(-tt / d));
}
function heart(t, level) {
  let p1 = 0;
  voice(t, 0.5, { gain: level, send: 0.05 }, (tt) => {
    const f = 38 + 30 * Math.exp(-tt / 0.045); p1 += (TAU * f) / SR;
    return Math.tanh(1.5 * Math.sin(p1)) * Math.min(1, tt / 0.002) * Math.exp(-tt / 0.13);
  });
  let p2 = 0;
  voice(t + 0.15, 0.4, { gain: level * 0.6, send: 0.05 }, (tt) => {
    const f = 36 + 22 * Math.exp(-tt / 0.04); p2 += (TAU * f) / SR;
    return Math.tanh(1.3 * Math.sin(p2)) * Math.min(1, tt / 0.002) * Math.exp(-tt / 0.1);
  });
  const lp = new BQ().set('lp', 220, 0.7);
  voice(t, 0.06, { gain: level * 0.35 }, (tt) => lp.p(nz()) * 3 * Math.exp(-tt / 0.012));
}
function tick(t, { f = 2400, level = 0.2, pan = 0, send = 0.08 }) {
  const bp = new BQ().set('bp', f, 7);
  let ph = 0;
  voice(t, 0.06, { gain: level, pan, send }, (tt) => {
    ph += (TAU * f * 0.75) / SR;
    return (bp.p(nz()) * 5 + Math.sin(ph) * 0.5) * Math.exp(-tt / 0.006);
  });
}
function key(t, i, { level = 0.22, space = false }) {
  const h = Math.abs(Math.sin((i + 3) * 78.233) * 43758.5453) % 1;
  const f = (space ? 2200 : 3200 + h * 2400);
  const bp = new BQ().set('bp', f, 1.6);
  const pan = (h - 0.5) * 0.5;
  voice(t, 0.05, { gain: level, pan, send: 0.1 }, (tt) => bp.p(nz()) * 3 * Math.exp(-tt / 0.005));
  let ph = 0;
  voice(t, 0.05, { gain: level * 0.8, pan }, (tt) => { ph += (TAU * (space ? 110 : 170 + h * 50)) / SR; return Math.sin(ph) * Math.exp(-tt / 0.009); });
}
function blip(t, freqs, { level = 0.2, tau = 0.12, pan = 0, send = 0.3, gap = 0.07 }) {
  freqs.forEach((f, j) => {
    let ph = 0;
    voice(t + j * gap, tau * 6, { gain: level, pan, send }, (tt) => {
      ph += (TAU * f) / SR;
      return (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * Math.min(1, tt / 0.001) * Math.exp(-tt / tau);
    });
  });
}
function hit(t, k, level) {
  boom(t, { level: level * 0.8, len: 0.9, f0: 120 + k * 8, f1: 42, rumble: 0.4, send: 0.3, crack: 1.4 });
  const bp = new BQ().set('bp', 1900, 0.9);
  voice(t, 0.25, { gain: level * 0.45, send: 0.35 }, (tt) => bp.p(nz()) * 3 * Math.exp(-tt / 0.07));
  // tonal stab: A1, C2, E2, A2 saw through closing lowpass
  const f = [55, 65.41, 82.41, 110][k];
  const lp = new BQ(); let p1 = 0, p2 = 0;
  voice(t, 0.8, { gain: level * 0.5, send: 0.3 }, (tt, kk) => {
    if ((kk & 15) === 0) lp.set('lp', lerp(2600, 200, clamp(tt / 0.5)), 1.2);
    p1 = (p1 + f / SR) % 1; p2 = (p2 + (f * 1.008) / SR) % 1;
    return lp.p(saw(p1, f / SR) + saw(p2, (f * 1.008) / SR)) * Math.min(1, tt / 0.002) * Math.exp(-tt / 0.3);
  });
}
function pad(t0, t1, freqs, level, { att = 1.2, rel = 1.4, lpf = 2800 } = {}) {
  freqs.forEach((f, vi) => {
    for (let d = -1; d <= 1; d++) {
      const fd = f * Math.pow(2, (d * 6) / 1200);
      let ph = rng();
      const lp = new BQ(), hp = new BQ().set('hp', 260, 0.7);
      const pan = ((vi % 3) - 1) * 0.45 + d * 0.25;
      let vib = rng() * TAU;
      voice(t0, t1 - t0 + rel, { gain: level, pan, send: 0.5 }, (t, k) => {
        if ((k & 31) === 0) lp.set('lp', lpf * (0.7 + 0.3 * Math.sin(t * 0.6 + vi)), 0.8);
        vib += (TAU * 5.1) / SR;
        const fv = fd * (1 + 0.004 * Math.sin(vib) * clamp(t / 1.5));
        ph = (ph + fv / SR) % 1;
        const env = Math.min(1, t / att) * (t < t1 - t0 ? 1 : Math.max(0, 1 - (t - (t1 - t0)) / rel));
        return hp.p(lp.p(saw(ph, fv / SR))) * env * env;
      });
    }
  });
}

// ---------------------------------------------------------------- score
// 0-3s: dark drone + ticking clock
function drone(t0, t1, level, lfoRate = 1 / 6) {
  const lp = new BQ(); let p1 = Math.random() * 0, p2 = 0.3, ps = 0, ps2 = 0;
  voice(t0, t1 - t0, { gain: level, send: 0.2 }, (t, k) => {
    const T = t + t0;
    if ((k & 31) === 0) {
      const rise = T > 19 && T < 22 ? (T - 19) / 3 : 0;
      lp.set('lp', 150 + 170 * (0.5 + 0.5 * Math.sin(TAU * lfoRate * T - 1.2)) + rise * rise * 1600, 1.6);
    }
    p1 = (p1 + 55 / SR) % 1; p2 = (p2 + 55.4 / SR) % 1; ps += (TAU * 55) / SR; ps2 += (TAU * 27.5) / SR;
    const env =
      Math.min(1, T / 1.2) *
      (T < 3 ? 1 : T < 19 ? lerp(1, 0.55, clamp((T - 3) / 0.8)) : lerp(0.55, 1, clamp((T - 19) / 3))) *
      (T > 22 ? clamp(1 - (T - 22.2) / 0.6, 0.0, 1) * 0.0 + 1 : 1);
    return (lp.p(saw(p1, 55 / SR) * 0.5 + saw(p2, 55.4 / SR) * 0.5) * 0.9 + Math.sin(ps) * 0.5 + Math.sin(ps2) * 0.35) * env;
  });
}
drone(0, 23.6, 0.34);
// clock: every 0.5s until 2s, every 0.25s 2-3s
for (let t = 0.5, j = 0; t < 3.0; j++) {
  tick(t, { f: j % 2 ? 1700 : 2500, level: 0.16 + (t > 2 ? 0.08 : 0), pan: j % 2 ? 0.2 : -0.2 });
  t += t >= 2 ? 0.25 : 0.5;
}

// scene transition whooshes, peak exactly on the boundary frame
BOUNDS.forEach((b, i) => {
  if (b.at === 180) return; // covered by riser + boom
  const big = b.type === 'zoom' || b.at === 120;
  whoosh(fr(b.at), { pre: b.len / FPS + 0.18, post: 0.24, level: big ? 0.4 : 0.33, fHi: big ? 7500 : 5200, send: 0.3 });
  tick(fr(b.at), { f: 900, level: 0.12 });
});
// 2-3s riser: noise + pitch sweep, cut 15ms before the boom
{
  const bp = new BQ(), hp = new BQ().set('hp', 200, 0.7);
  voice(2.0, 0.985, { gain: 0.5, send: 0.3 }, (t, k) => {
    if ((k & 15) === 0) bp.set('bp', 300 * Math.pow(9000 / 300, Math.pow(t / 1.0, 1.4)), 1.1);
    return hp.p(bp.p(nz())) * 3 * Math.pow(t / 0.985, 2.0);
  });
  let ph = 0;
  voice(2.0, 0.985, { gain: 0.3, send: 0.3 }, (t) => {
    const f = 110 * Math.pow(2600 / 110, Math.pow(t / 0.985, 1.3)); ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.pow(t / 0.985, 1.6) * (t > 0.96 ? Math.max(0, (0.985 - t) / 0.025) : 1);
  });
}
// title slam boom
boom(fr(180), { level: 1.0, len: 2.6, f0: 100, f1: 30, rumble: 0.65, send: 0.4 });

// 3-19s: heartbeat 120 BPM, hats, pad
for (let t = 3.0, k = 0; t < 19.0 - 1e-6; t += 0.5, k++) heart(t, 0.55 + 0.45 * clamp((t - 3) / 14));
for (let t = 3.0, k = 0; t < 19.0 - 1e-6; t += 0.25, k++) {
  const off = k % 2 === 1;
  hat(t, { level: off ? 0.16 : 0.09, pan: k % 4 < 2 ? -0.25 : 0.25, open: off && t > 17.5 && k % 4 === 3 });
}
const CH = [
  [440, 523.25, 659.25, 987.77],
  [349.23, 440, 523.25, 659.25, 987.77],
  [587.33, 698.46, 880, 659.25],
  [659.25, 880, 987.77, 1174.66],
  [440, 523.25, 659.25, 880],
];
[3, 7, 11, 15].forEach((t, i) => pad(t, t + 4.0, CH[i], 0.018 * (1 + i * 0.12), { att: 1.4, rel: 1.4 }));
pad(19, 21.9, CH[4].map((f) => f * 2), 0.014, { att: 1.0, rel: 0.1 });

// terminal: keyboard clicks synced to each typed character
const tf = typeFrames();
const TF0 = TERM.from;
tf.forEach((f, i) => {
  let t = fr(TF0 + f);
  if (i > 0 && tf[i] === tf[i - 1]) t += 0.012;
  key(t, i, { level: 0.2, space: false });
});
key(fr(TF0 + TERM.enter), 99, { level: 0.3, space: true });
TERM.logs.forEach((f, i) => blip(fr(TF0 + f), [1400 + i * 120], { level: 0.07, tau: 0.03, send: 0.2 }));
for (let b = 0; b < 12; b++) {
  const f = TERM.barStart + Math.round((b / 12) * (TERM.barEnd - TERM.barStart));
  blip(fr(TF0 + f + 4), [700 + b * 90], { level: 0.04, tau: 0.02, send: 0.1 });
}
blip(fr(TF0 + TERM.shipped), [1174.66, 1760], { level: 0.2, tau: 0.22, gap: 0.075, send: 0.5 });

// easing arrivals + network layer pings (soft, ascending)
for (let i = 0; i < 6; i++) blip(fr(EASE.from + EASE.rowStart(i) + EASE.dur), [523.25 * Math.pow(2, i / 6)], { level: 0.08, tau: 0.09, send: 0.35, pan: -0.4 + i * 0.16 });
for (let i = 0; i < 5; i++) blip(fr(NN.from + NN.layerAt(i)), [329.63 * Math.pow(2, i / 5)], { level: 0.07, tau: 0.2, send: 0.5, pan: -0.5 + i * 0.25 });

// 17.5-19s: hard hits on each kinetic word, building
KINETIC.words.forEach((w, i) => hit(fr(KINETIC.from + i * KINETIC.step), i, 0.65 + i * 0.12));

// 19-22s: long riser, accelerating pulses, swirl sparkles, then the lock boom
{
  const bp = new BQ(), hp = new BQ().set('hp', 150, 0.7);
  const dur = 2.93; // ends 15ms before the lock boom
  voice(19.0, dur, { gain: 0.5, send: 0.35 }, (t, k) => {
    if ((k & 15) === 0) bp.set('bp', 200 * Math.pow(12000 / 200, Math.pow(t / 3, 1.3)), 0.9);
    const fade = t > dur - 0.06 ? Math.max(0, (dur - t) / 0.06) : 1;
    return hp.p(bp.p(nz())) * 3 * Math.pow(t / 3, 1.8) * fade;
  });
  [0, 7, 12].forEach((semi, s) => {
    let ph = 0;
    voice(19.0, dur, { gain: 0.12, send: 0.4, pan: (s - 1) * 0.4 }, (t) => {
      const f = 110 * Math.pow(2, semi / 12) * Math.pow(32, Math.pow(t / 3, 1.5)); ph += (TAU * f) / SR;
      const fade = t > dur - 0.06 ? Math.max(0, (dur - t) / 0.06) : 1;
      return Math.sin(ph) * Math.pow(t / 3, 1.2) * fade;
    });
  });
  // accelerating pulse
  for (let t = 19.0, step = 0.5; t < 21.9; ) {
    const x = (t - 19) / 3;
    tick(t, { f: 1500 + 2500 * x, level: 0.12 + 0.16 * x });
    heart(t, 0.45 + 0.5 * x);
    step = lerp(0.5, 0.07, Math.pow(x, 0.8));
    t += step;
  }
  // swirl sparkles gathering
  for (let i = 0, t = 19.3; t < 21.85; i++) {
    const x = (t - 19) / 3;
    const f = [1318.5, 1568, 1760, 2093, 2637, 3136][i % 6] * (1 + (i % 2));
    blip(t, [f], { level: 0.025 + 0.04 * x, tau: 0.08, send: 0.6, pan: Math.sin(i * 2.1) * 0.7 });
    t += lerp(0.16, 0.035, x);
  }
}
// lock boom + shimmer
boom(fr(LOCK), { level: 1.25, len: 4.2, f0: 85, f1: 27, rumble: 0.8, send: 0.55, crack: 1.1 });
[1318.5, 1760, 2217.5, 2637, 3520, 4435].forEach((f, i) => {
  let ph = 0, vib = i;
  voice(fr(LOCK), 3.0, { gain: 0.05, pan: (i % 2 ? 1 : -1) * (0.2 + i * 0.1), send: 0.7 }, (t) => {
    vib += (TAU * (4 + i * 0.3)) / SR; ph += (TAU * f * (1 + 0.002 * Math.sin(vib))) / SR;
    return Math.sin(ph) * Math.min(1, t / 0.004) * Math.exp(-t / (1.4 - i * 0.1));
  });
});
// finale accents: title wipe + tagline sparkle
whoosh(fr(LOCK + 30), { pre: 0.25, post: 0.3, level: 0.2, fLo: 600, fHi: 9000 });
blip(fr(LOCK + 66), [1760, 2349.3, 2637], { level: 0.07, tau: 0.25, gap: 0.06, send: 0.6 });

// 22-24s: resolve to a calm held chord (A major add9) and fade
{
  const notes = [110, 164.81, 220, 277.18, 329.63, 493.88];
  notes.forEach((f, i) => {
    let ph = 0, vib = i * 1.3;
    const lp = new BQ().set('lp', 1800, 0.7);
    voice(22.0, 2.0, { gain: 0.085, pan: (i - 2.5) * 0.25, send: 0.6 }, (t) => {
      vib += (TAU * 4.6) / SR; ph += (TAU * f * (1 + 0.0025 * Math.sin(vib))) / SR;
      const env = Math.min(1, t / 0.5) * (t > 0.9 ? 1 - 0.0 : 1);
      return (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * saw(((ph / TAU) % 1 + 1) % 1, 0.01)) * env;
    });
  });
}

// ---------------------------------------------------------------- reverb (stereo Schroeder/FDN-lite)
function reverb(inL, inR, size = 1) {
  const combsL = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116].map((d) => Math.round(d * size));
  const combsR = combsL.map((d) => d + 23);
  const mk = (sizes, fb, damp) => sizes.map((d) => ({ buf: new Float32Array(d), i: 0, d, lp: 0, fb, damp }));
  const apDs = [556, 441, 341, 225];
  const run = (inp, combs, apOff) => {
    const out = new Float32Array(N);
    const aps = apDs.map((d) => ({ buf: new Float32Array(d + apOff), i: 0 }));
    for (let n = 0; n < N; n++) {
      let s = 0; const x = inp[n] * 0.12;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.lp = y * (1 - c.damp) + c.lp * c.damp;
        c.buf[c.i] = x + c.lp * c.fb;
        if (++c.i >= c.d) c.i = 0;
        s += y;
      }
      for (const a of aps) {
        const b = a.buf[a.i], y = -s + b;
        a.buf[a.i] = s + b * 0.5; s = y;
        if (++a.i >= a.buf.length) a.i = 0;
      }
      out[n] = s;
    }
    return out;
  };
  return [run(inL, mk(combsL, 0.885, 0.35), 0), run(inR, mk(combsR, 0.885, 0.35), 17)];
}
const [wL, wR] = reverb(SL, SRr);
const hpMaster = [new BQ().set('hp', 28, 0.7), new BQ().set('hp', 28, 0.7)];
const mL = new Float32Array(N), mR = new Float32Array(N);
for (let i = 0; i < N; i++) {
  mL[i] = hpMaster[0].p(L[i] + wL[i] * 0.8);
  mR[i] = hpMaster[1].p(R[i] + wR[i] * 0.8);
}
// final fade-out (22.9 -> 24.0) and a tiny fade-in
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = (t > 22.9 ? Math.pow(Math.cos(clamp((t - 22.9) / 1.1) * Math.PI / 2), 2) : 1) * Math.min(1, t / 0.4);
  mL[i] *= g; mR[i] *= g;
}

// ---------------------------------------------------------------- master: compression, loudness (-14 LUFS, BS.1770), limiter
function compress(a, b, thr = 0.2, ratio = 2.6) {
  const att = Math.exp(-1 / (0.008 * SR)), rel = Math.exp(-1 / (0.25 * SR));
  let env = 0;
  const g = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = Math.max(Math.abs(a[i]), Math.abs(b[i]));
    env = x > env ? att * env + (1 - att) * x : rel * env + (1 - rel) * x;
    g[i] = env > thr ? Math.pow(env / thr, 1 / ratio - 1) : 1;
  }
  for (let i = 0; i < N; i++) { a[i] *= g[i]; b[i] *= g[i]; }
}
compress(mL, mR);

function kfilter(x) {
  const out = new Float32Array(N);
  const sh = (() => {
    const f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
    const K = Math.tan((Math.PI * f0) / SR), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.499666774155);
    const a0 = 1 + K / Q + K * K;
    return { b: [(Vh + (Vb * K) / Q + K * K) / a0, (2 * (K * K - Vh)) / a0, (Vh - (Vb * K) / Q + K * K) / a0], a: [1, (2 * (K * K - 1)) / a0, (1 - K / Q + K * K) / a0] };
  })();
  const hpf = (() => {
    const f0 = 38.13547087602444, Q = 0.5003270373238773;
    const K = Math.tan((Math.PI * f0) / SR), a0 = 1 + K / Q + K * K;
    return { b: [1, -2, 1], a: [1, (2 * (K * K - 1)) / a0, (1 - K / Q + K * K) / a0] };
  })();
  const run = (src, f) => { const o = new Float32Array(N); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < N; i++) { const y = f.b[0] * src[i] + f.b[1] * x1 + f.b[2] * x2 - f.a[1] * y1 - f.a[2] * y2; x2 = x1; x1 = src[i]; y2 = y1; y1 = y; o[i] = y; } return o; };
  return run(run(x, sh), hpf);
}
function lufs(a, b) {
  const ka = kfilter(a), kb = kfilter(b);
  const blk = Math.round(0.4 * SR), hop = Math.round(0.1 * SR), ms = [];
  for (let s = 0; s + blk <= N; s += hop) {
    let sa = 0, sb = 0;
    for (let i = s; i < s + blk; i++) { sa += ka[i] * ka[i]; sb += kb[i] * kb[i]; }
    ms.push((sa + sb) / blk);
  }
  const l = (m) => -0.691 + 10 * Math.log10(m);
  const g1 = ms.filter((m) => l(m) > -70);
  const rel = l(g1.reduce((x, y) => x + y, 0) / g1.length) - 10;
  const g2 = g1.filter((m) => l(m) > rel);
  return l(g2.reduce((x, y) => x + y, 0) / g2.length);
}
function limit(a, b, ceil = 0.7943) { // -2.0 dBFS sample peak keeps true peak under -1, lookahead 3ms, no clipping
  const LA = Math.round(0.003 * SR);
  const gr = new Float32Array(N);
  for (let i = 0; i < N; i++) { const p = Math.max(Math.abs(a[i]), Math.abs(b[i])); gr[i] = p > ceil ? ceil / p : 1; }
  const m = new Float32Array(N);
  const dq = []; // monotonic deque min over [i, i+LA-1]
  for (let i = N - 1; i >= 0; i--) {
    while (dq.length && gr[dq[dq.length - 1]] >= gr[i]) dq.pop();
    dq.push(i);
    while (dq[0] > i + LA - 1) dq.shift();
    m[i] = gr[dq[0]];
  }
  let sum = 0;
  const oa = new Float32Array(N), ob = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    sum += m[i]; if (i >= LA) sum -= m[i - LA];
    const cnt = Math.min(LA, i + 1);
    const g = sum / cnt;
    oa[i] = a[i] * g; ob[i] = b[i] * g;
  }
  return [oa, ob];
}
let gain = 1, outL, outR;
for (let it = 0; it < 8; it++) {
  const a = mL.map((x) => x * gain), b = mR.map((x) => x * gain);
  [outL, outR] = limit(a, b);
  const l = lufs(outL, outR);
  console.log(`iter ${it}: gain ${gain.toFixed(3)} -> ${l.toFixed(2)} LUFS`);
  if (Math.abs(l + 14) < 0.15) break;
  gain *= Math.pow(10, (-14 - l) / 20);
}

// 16-bit WAV with TPDF dither
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
let peak = 0;
for (let i = 0; i < N; i++) {
  for (const [ch, arr] of [[0, outL], [1, outR]]) {
    const d = (rng() - rng()) / 32768;
    const v = Math.max(-1, Math.min(1, arr[i] + d));
    peak = Math.max(peak, Math.abs(arr[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 4 + ch * 2);
  }
}
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/music.wav', buf);
console.log(`wrote public/music.wav  peak ${(20 * Math.log10(peak)).toFixed(2)} dBFS`);

// event onset audit: RMS in the 8ms before vs after each key frame
const rms = (s, e) => { let a = 0; for (let i = s; i < e; i++) a += outL[i] * outL[i] + outR[i] * outR[i]; return Math.sqrt(a / Math.max(1, e - s) / 2); };
const audit = [['title slam', 180], ...KINETIC.words.map((w, i) => [w, KINETIC.from + i * KINETIC.step]), ['logo lock', LOCK], ['shipped', TERM.from + TERM.shipped]];
for (const [name, f] of audit) {
  const s = Math.round(fr(f) * SR);
  console.log(`${name.padEnd(12)} frame ${f}: rms before ${rms(s - 400, s).toFixed(4)}  after ${rms(s, s + 400).toFixed(4)}`);
}
