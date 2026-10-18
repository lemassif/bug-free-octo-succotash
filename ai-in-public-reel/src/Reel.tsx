import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { BOUNDS, FPS, HITS, SCENES, TOTAL } from './timing.js';
import { C, CX, CY, F, H, W, MB, clamp, eIn2, eIn3, eInExpo, eInOut3, eOut3, hash, inv, lerp } from './lib';
import { Signal } from './scenes/Signal';
import { Warp } from './scenes/Warp';
import { Title } from './scenes/Title';
import { Terminal } from './scenes/Terminal';
import { Easing } from './scenes/Easing';
import { Neural } from './scenes/Neural';
import { Morph } from './scenes/Morph';
import { Truchet } from './scenes/Truchet';
import { Depth } from './scenes/Depth';
import { Kinetic } from './scenes/Kinetic';
import { Finale } from './scenes/Finale';

const COMPS = [Signal, Warp, Title, Terminal, Easing, Neural, Morph, Truchet, Depth, Kinetic, Finale];

// Smooth camera shake: sums of slow sine waves under a 20-frame decay. No per-frame randomness.
function shakeAt(f: number) {
  let x = 0, y = 0, r = 0;
  for (const h of HITS) {
    const t = f - h.f;
    if (t < 0 || t >= 20) continue;
    const k = t / 20, env = (1 - k) * (1 - k), a = 14 * h.amp * env;
    x += a * (0.6 * Math.sin(f * 0.52 + h.f) + 0.4 * Math.sin(f * 0.91 + 2));
    y += a * (0.6 * Math.sin(f * 0.61 + 1.7) + 0.4 * Math.sin(f * 1.13));
    r += 0.35 * h.amp * env * Math.sin(f * 0.44);
  }
  return { x, y, r };
}

// Living blue background: dark edges, bright center glow, slow drifting light spot.
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const sx = CX + 560 * Math.sin(f * 0.0105) + 160 * Math.sin(f * 0.023 + 1);
  const sy = CY + 250 * Math.sin(f * 0.0079 + 1.1);
  const breathe = 1 + 0.05 * Math.sin(f * 0.02);
  return (
    <div style={{ position: 'absolute', left: -120, top: -120, width: W + 240, height: H + 240, background: C.blue }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 62% 66% at 50% 50%, rgba(42,45,224,0) 35%, rgba(42,45,224,1) 100%)' }} />
      <div style={{ position: 'absolute', left: W / 2 + 120 - 1100, top: H / 2 + 120 - 1100, width: 2200, height: 2200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,77,255,1) 0%, rgba(74,77,255,0.55) 28%, rgba(74,77,255,0) 62%)', transform: `scale(${breathe})` }} />
      <div style={{ position: 'absolute', left: sx + 120 - 650, top: sy + 120 - 650, width: 1300, height: 1300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,202,255,0.30) 0%, rgba(201,202,255,0.12) 35%, rgba(201,202,255,0) 65%)' }} />
    </div>
  );
};

// Scene wrapper that plays the designed transition out of / into neighbouring scenes.
const TransitionWrap: React.FC<{ from: number; dur: number; children: React.ReactNode }> = ({ from, dur, children }) => {
  const f = useCurrentFrame();
  const inB = BOUNDS.find((b) => b.at === from);
  const outB = BOUNDS.find((b) => b.at === from + dur);
  let c = 0, phase: 'in' | 'out' | null = null, type = '';
  if (outB && f >= dur - outB.len) { c = (f - (dur - outB.len) + 1) / outB.len; phase = 'out'; type = outB.type; }
  else if (inB && f < inB.len) { c = 1 - f / inB.len; phase = 'in'; type = inB.type; }
  c = clamp(c);
  const style: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: W, height: H };
  if (phase && c > 0) {
    if (type === 'flash') style.transform = `scale(${1 + 0.07 * eIn3(c)})`;
    if (type === 'zoom') {
      style.transform = phase === 'out' ? `scale(${lerp(1, 3.4, eIn3(c))})` : `scale(${lerp(1, 0.55, eIn3(c))})`;
      style.opacity = 1 - eIn2(c);
    }
    if (type === 'whip') {
      const x = 2300 * eInExpo(c) * (phase === 'out' ? -1 : 1);
      style.transform = `translateX(${x}px)`;
      style.filter = `blur(${(7 * c).toFixed(2)}px)`;
    }
    if (type === 'iris') style.clipPath = `circle(${1300 * (1 - eIn3(c))}px at 50% 50%)`;
  }
  return <div style={style}><MB on={type === 'whip' && c > 0.02}>{children}</MB></div>;
};

// White flash / iris ring overlays for the transitions (computed from the same BOUNDS table).
const TransitionFx: React.FC = () => {
  const f = useCurrentFrame();
  let flash = 0, ring: { r: number; o: number } | null = null;
  for (const b of BOUNDS) {
    let c = 0;
    if (f >= b.at - b.len && f < b.at) c = (f - (b.at - b.len) + 1) / b.len;
    else if (f >= b.at && f < b.at + b.len) c = 1 - (f - b.at) / b.len;
    c = clamp(c);
    if (c <= 0) continue;
    if (b.type === 'flash') flash = Math.max(flash, 0.94 * eIn3(c));
    if (b.type === 'zoom') flash = Math.max(flash, 0.35 * eIn2(c));
    if (b.type === 'iris') ring = { r: 1300 * (1 - eIn3(c)), o: Math.min(1, c * 6) };
  }
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, background: '#fff', opacity: flash }} />
      {ring && ring.r > 2 && (
        <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: ring.o, filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.9))' }}>
          <circle cx={CX} cy={CY} r={ring.r} fill="none" stroke="#fff" strokeWidth={7} />
        </svg>
      )}
    </>
  );
};

const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const off = Math.floor(hash(f * 1.31) * 256), offY = Math.floor(hash(f * 2.17 + 9) * 256);
  return (
    <>
      <div style={{ position: 'absolute', left: -256, top: -256, width: W + 512, height: H + 512, backgroundImage: `url(${staticFile('grain.png')})`, backgroundSize: '256px 256px', opacity: 0.05, transform: `translate(${off}px, ${offY}px)` }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, background: 'repeating-linear-gradient(0deg, rgba(10,11,61,0.9) 0px, rgba(10,11,61,0.9) 1px, rgba(10,11,61,0) 1px, rgba(10,11,61,0) 4px)', opacity: 0.04 }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, background: 'radial-gradient(ellipse 75% 78% at 50% 50%, rgba(10,11,61,0) 52%, rgba(10,11,61,0.6) 100%)' }} />
    </>
  );
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const sc = [...SCENES].reverse().find((s) => f >= s.from)!;
  const local = f - sc.from;
  const e = eOut3(inv(local, 0, 14));
  const sec = Math.floor(f / FPS), ff = f % FPS;
  const rec = 0.3 + 0.7 * (0.5 + 0.5 * Math.cos((f / 60) * Math.PI * 2));
  const fade = 1 - 0.55 * inv(f, 1405, 1440);
  const base: React.CSSProperties = { position: 'absolute', fontFamily: F.mono, fontSize: 17, letterSpacing: '0.2em', color: '#fff', textShadow: '0 0 12px rgba(255,255,255,0.55)', whiteSpace: 'nowrap' };
  const arm = (style: React.CSSProperties) => <div style={{ position: 'absolute', background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.7)', ...style }} />;
  const m = 72, L = 44, T = 3;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: fade }}>
      {arm({ left: m, top: m, width: L, height: T })}{arm({ left: m, top: m, width: T, height: L })}
      {arm({ left: W - m - L, top: m, width: L, height: T })}{arm({ left: W - m - T, top: m, width: T, height: L })}
      {arm({ left: m, top: H - m - T, width: L, height: T })}{arm({ left: m, top: H - m - L, width: T, height: L })}
      {arm({ left: W - m - L, top: H - m - T, width: L, height: T })}{arm({ left: W - m - T, top: H - m - L, width: T, height: L })}
      <div style={{ ...base, left: m + 22, top: m + 14 }}>AI IN PUBLIC · MOTION REEL · 2026</div>
      <div style={{ ...base, right: m + 22, top: m + 14, textAlign: 'right', opacity: e, transform: `translateY(${(1 - e) * 10}px)` }}>{pad2(sc.id)} — {sc.name}</div>
      <div style={{ ...base, left: m + 22, bottom: m + 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ opacity: rec, color: '#fff', fontSize: 20 }}>●</span>
        <span>REC {pad2(Math.floor(sec / 60))}:{pad2(sec % 60)}:{pad2(ff)}</span>
      </div>
      <div style={{ ...base, right: m + 22, bottom: m + 22 }}>BUILDING IN PUBLIC</div>
      <div style={{ position: 'absolute', left: m, top: H - m - 4, width: W - 2 * m, height: 2, background: 'rgba(255,255,255,0.22)' }} />
      <div style={{ position: 'absolute', left: m, top: H - m - 5, width: W - 2 * m, height: 4, background: '#fff', transformOrigin: '0 50%', transform: `scaleX(${f / (TOTAL - 1)})`, boxShadow: '0 0 14px 2px rgba(255,255,255,0.85)', borderRadius: 2 }} />
    </div>
  );
};

export const Reel: React.FC = () => {
  const f = useCurrentFrame();
  const s = shakeAt(f);
  const fadeNavy = eInOut3(inv(f, 1400, 1440));
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, background: C.navy, overflow: 'hidden' }}>
      <Audio src={staticFile('music.wav')} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(1.03)` }}>
        <Background />
        {SCENES.map((sc, i) => {
          const Comp = COMPS[i];
          return (
            <Sequence key={sc.id} from={sc.from} durationInFrames={sc.dur} layout="none">
              <TransitionWrap from={sc.from} dur={sc.dur}><Comp /></TransitionWrap>
            </Sequence>
          );
        })}
        <div style={{ position: 'absolute', left: -60, top: -60, width: W + 120, height: H + 120, background: C.navy, opacity: fadeNavy }} />
      </div>
      <TransitionFx />
      <Finish />
      <Hud />
    </div>
  );
};
