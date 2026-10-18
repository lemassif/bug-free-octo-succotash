import React from 'react';
import { Img, spring, staticFile, useCurrentFrame } from 'remotion';
import { Bloom, C, CX, CY, F, Fill, clamp, eInOut3, eOutExpo, inv, lerp } from '../lib';

const circle = () => 1;
const tri = (th: number) => {
  const phi = (((th + Math.PI / 2) % ((2 * Math.PI) / 3)) + (2 * Math.PI) / 3) % ((2 * Math.PI) / 3);
  return 0.5 / Math.cos(phi - Math.PI / 3);
};
const star = (th: number) => Math.pow(Math.pow(Math.abs(Math.cos(th)), 0.55) + Math.pow(Math.abs(Math.sin(th)), 0.55), -1 / 0.55);
const SHAPES = [circle, tri, star];
const NAMES = ['CIRCLE', 'TRIANGLE', 'SPARKLE', 'THE MARK'];

// radial interpolation between two shape functions
const blend = (m: number) => {
  const i = Math.min(1, Math.floor(m)), t = m - i;
  const a = SHAPES[i], b = SHAPES[i + 1];
  return (th: number) => lerp(a(th), b(th), t);
};
const poly = (fn: (t: number) => number, R: number, rot: number, n = 120) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = fn(th + Math.PI / 2 * 0) * R; // shape function takes the unrotated angle
    const a = th + rot;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  }
  return d + 'Z';
};

export const Morph: React.FC = () => {
  const f = useCurrentFrame();
  const intro = spring({ frame: f, fps: 60, config: { damping: 11, stiffness: 120, mass: 0.8 } });
  const m = eInOut3(inv(f, 30, 52)) + eInOut3(inv(f, 62, 84)); // 0 -> 1 -> 2
  const fn = blend(Math.min(m, 1.9999));
  const shapeScale = Math.max(0, intro) * (1 - eInOut3(inv(f, 96, 112)));
  const logo = spring({ frame: f - 92, fps: 60, config: { damping: 10, stiffness: 110, mass: 0.9 } });
  const idx = f < 40 ? 0 : f < 72 ? 1 : f < 92 ? 2 : 3;
  const orbitRot = f * 0.9;
  const pulse = 1 + 0.03 * Math.sin(f * 0.2);
  return (
    <Fill>
      <Bloom size={1300} opacity={0.3 * Math.max(0, intro)} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g transform={`translate(${CX} ${CY})`}>
          <circle r={270} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={2} strokeDasharray="6 16" transform={`rotate(${f * 0.5})`} opacity={clamp(intro)} />
          <circle r={385} fill="none" stroke={C.ice} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="2 12" transform={`rotate(${-f * 0.35})`} opacity={clamp(intro)} />
          {/* orbit of matching mini-shapes */}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + (orbitRot * Math.PI) / 180;
            const s = Math.max(0, spring({ frame: f - 10 - i * 2, fps: 60, config: { damping: 12, stiffness: 150, mass: 0.6 } })) * (1 - eInOut3(inv(f, 92, 106)));
            return (
              <g key={i} transform={`translate(${Math.cos(a) * 322} ${Math.sin(a) * 322}) scale(${s})`} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))' }}>
                <path d={poly(fn, 30, a)} fill={i % 2 ? C.ice : '#fff'} />
              </g>
            );
          })}
          {/* the main glowing shape */}
          <g transform={`scale(${shapeScale * pulse})`} style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.85))' }}>
            <path d={poly(fn, 215, f * 0.004)} fill="#fff" />
          </g>
        </g>
      </svg>
      {/* resolve into the real logo */}
      <div style={{ position: 'absolute', left: CX - 260, top: CY - 260, width: 520, height: 520, transform: `scale(${Math.max(0, logo)})`, opacity: clamp(logo * 2), filter: 'drop-shadow(0 0 34px rgba(255,255,255,0.8))' }}>
        <Img src={staticFile('logo-mark.png')} style={{ width: 520, height: 520 }} />
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {(() => { const t = inv(f, 92, 130); return <circle cx={CX} cy={CY} r={200 + 560 * eOutExpo(t)} fill="none" stroke="#fff" strokeWidth={5 * (1 - t) + 0.5} opacity={(1 - t) * clamp(inv(f, 92, 94))} />; })()}
      </svg>
      <div style={{ position: 'absolute', left: 0, top: 912, width: 1920, textAlign: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.3em', color: '#fff', opacity: clamp(intro) }}>
        {NAMES.map((n, i) => <span key={n} style={{ margin: '0 22px', opacity: i === idx ? 1 : 0.3 }}>{i === idx ? '● ' : ''}{n}</span>)}
      </div>
    </Fill>
  );
};
