// Shared by the Remotion scenes AND the audio synthesizer so every sound lands on its visual frame.
export const FPS = 60;
export const TOTAL = 1440;

export const SCENES = [
  { id: 1, name: 'SIGNAL', from: 0, dur: 120 },
  { id: 2, name: 'WARP', from: 120, dur: 60 },
  { id: 3, name: 'TITLE SLAM', from: 180, dur: 120 },
  { id: 4, name: 'PROMPT', from: 300, dur: 180 },
  { id: 5, name: 'EASING', from: 480, dur: 120 },
  { id: 6, name: 'NEURAL NET', from: 600, dur: 150 },
  { id: 7, name: 'MORPH', from: 750, dur: 120 },
  { id: 8, name: 'TRUCHET', from: 870, dur: 90 },
  { id: 9, name: 'DEPTH', from: 960, dur: 90 },
  { id: 10, name: 'KINETIC TYPE', from: 1050, dur: 90 },
  { id: 11, name: 'FINALE', from: 1140, dur: 300 },
];

// Designed transitions. Out phase = [at-len, at), in phase = [at, at+len). Fully covered exactly at `at`.
export const BOUNDS = [
  { at: 120, type: 'flash', len: 12 },
  { at: 180, type: 'flash', len: 10 },
  { at: 300, type: 'whip', len: 12 },
  { at: 480, type: 'iris', len: 12 },
  { at: 600, type: 'zoom', len: 10 },
  { at: 750, type: 'flash', len: 8 },
  { at: 870, type: 'whip', len: 12 },
  { at: 960, type: 'iris', len: 12 },
  { at: 1050, type: 'zoom', len: 10 },
  { at: 1140, type: 'flash', len: 10 },
];

// Camera hits (shake + sound). amp is a multiplier of the 14px base.
export const HITS = [
  { f: 180, amp: 1.0 },
  { f: 1050, amp: 0.8 },
  { f: 1072, amp: 0.9 },
  { f: 1094, amp: 1.0 },
  { f: 1116, amp: 1.1 },
  { f: 1320, amp: 1.25 },
];
export const KINETIC = { from: 1050, step: 22, words: ['EMPOWER', 'EMPLOY', 'UNITE', 'FLOURISH'] };
export const LOCK = 1320; // finale logo lock (22.0s)
export const FINALE_FROM = 1140;

// Terminal scene (local frames, scene starts at 300)
export const TERM = {
  from: 300,
  typeStart: 20,
  enter: 90,
  logs: [94, 102, 110, 118],
  barStart: 96,
  barEnd: 132,
  shipped: 136,
};
export const PROMPT_PREFIX = 'ai › ';
export const TYPED = 'make a launch video for The Kennedy Collective. go big.';
export const LOG_TEXT = ['reading brand', 'studying reference', 'writing scenes', 'composing score'];
export function typeFrames() {
  const out = [];
  let f = TERM.typeStart;
  for (let i = 0; i < TYPED.length; i++) {
    const h = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
    f += 0.8 + 0.6 * h + (TYPED[i - 1] === ' ' ? 0.3 : 0);
    out.push(Math.round(f));
  }
  return out;
}

// Easing study
export const EASE = { from: 480, rowStart: (i) => 14 + 7 * i, dur: 46 };
// Neural net
export const NN = { from: 600, layerAt: (i) => 6 + 14 * i };
