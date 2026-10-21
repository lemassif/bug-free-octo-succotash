// Synthesized sound effects, so there are no audio files to download.

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let master: GainNode | null = null;
export let volume = 0.5;

export function initAudio() {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  try {
    ctx = new AudioContext();
  } catch {
    return;
  }
  master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

export function setVolume(v: number) {
  volume = v;
  if (master) master.gain.value = v;
}

function burst(dur: number, freq: number, gain: number, q = 0.8, pan = 0) {
  if (!ctx || !noise || !master) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.15), t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  src.connect(f).connect(g).connect(p).connect(master);
  src.start(t, Math.random() * 0.5, dur + 0.05);
}

function tone(freq: number, dur: number, gain: number, type: OscillatorType = "sine", slide = 1, delay = 0) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  rifle(dist = 0, pan = 0) {
    const g = 0.5 / (1 + dist * 0.08);
    burst(0.09, 5000, g, 0.7, pan);
    tone(140, 0.08, g * 0.6, "triangle", 0.5);
  },
  sniper(dist = 0, pan = 0) {
    const g = 0.8 / (1 + dist * 0.05);
    burst(0.35, 7000, g, 0.5, pan);
    tone(90, 0.3, g * 0.8, "triangle", 0.4);
  },
  empty() { tone(1800, 0.03, 0.15, "square"); },
  reload() { tone(900, 0.04, 0.12, "square"); tone(600, 0.05, 0.12, "square", 1, 0.25); },
  hit(head: boolean) { tone(head ? 2400 : 1500, 0.06, 0.18, "square", 1.1); },
  /** Cash register on a confirmed knockout. */
  kill() {
    tone(1318, 0.09, 0.2, "square");
    tone(1760, 0.25, 0.18, "square", 1, 0.08);
    burst(0.25, 9000, 0.12, 2);
  },
  hurt() { tone(220, 0.15, 0.2, "sawtooth", 0.6); },
  step() { burst(0.04, 900, 0.05); },
};
