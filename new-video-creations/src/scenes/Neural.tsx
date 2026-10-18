import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { NN } from '../timing.js';
import { Bloom, C, F, Fill, clamp, eInOut3, eOutExpo, hash, inv, lerp } from '../lib';

const COUNTS = [3, 6, 8, 6, 3];
const XS = [260, 610, 960, 1310, 1660];
const EXT = [340, 460, 540, 460, 340];
const CYN = 500;
const nodeY = (l: number, j: number) => (COUNTS[l] === 1 ? CYN : CYN + (j - (COUNTS[l] - 1) / 2) * (EXT[l] / (COUNTS[l] - 1)));
const WAVES = 5, ROUTES = 3, HOP = 11, W0 = 54, WGAP = 11;
// deterministic routes: for wave w, route r -> node index per layer
const route = (w: number, r: number) => COUNTS.map((c, l) => Math.floor(hash(w * 31 + r * 7 + l * 3.3) * c));
const startOf = (w: number) => W0 + w * WGAP + 0;

export const Neural: React.FC = () => {
  const f = useCurrentFrame();
  const fires: { l: number; j: number; t: number }[] = [];
  const hopsHi: { l: number; a: number; b: number; t0: number }[] = [];
  for (let w = 0; w < WAVES; w++) for (let r = 0; r < ROUTES; r++) {
    const rt = route(w, r);
    for (let l = 0; l < 5; l++) fires.push({ l, j: rt[l], t: startOf(w) + r * 2 + l * HOP });
    for (let l = 0; l < 4; l++) hopsHi.push({ l, a: rt[l], b: rt[l + 1], t0: startOf(w) + r * 2 + l * HOP });
  }
  const labelIn = eOutExpo(inv(f, 4, 24));
  const cap = spring({ frame: f - 100, fps: 60, config: { damping: 16, stiffness: 100, mass: 0.9 } });
  return (
    <Fill>
      <Bloom x={960} y={CYN} size={1700} opacity={0.14} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* base edges, drawn layer by layer */}
        {COUNTS.slice(0, 4).map((c, l) => {
          const p = eOutExpo(inv(f, NN.layerAt(l) + 6, NN.layerAt(l) + 26));
          return Array.from({ length: c }, (_, a) => Array.from({ length: COUNTS[l + 1] }, (_, b) => {
            const x1 = XS[l], y1 = nodeY(l, a), x2 = XS[l + 1], y2 = nodeY(l + 1, b);
            return <line key={`${l}-${a}-${b}`} x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={C.light} strokeOpacity={0.38} strokeWidth={1.6} />;
          }));
        })}
        {/* highlighted edges + travelling pulses */}
        {hopsHi.map((h, i) => {
          const p = inv(f, h.t0, h.t0 + HOP);
          if (p <= 0 || f > h.t0 + HOP + 16) return null;
          const x1 = XS[h.l], y1 = nodeY(h.l, h.a), x2 = XS[h.l + 1], y2 = nodeY(h.l + 1, h.b);
          const e = eInOut3(p);
          const fade = 1 - inv(f, h.t0 + HOP, h.t0 + HOP + 16);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={3} opacity={0.85 * fade * clamp(p * 3)} style={{ filter: 'drop-shadow(0 0 6px #fff)' }} />
              {p < 1 && Array.from({ length: 6 }, (_, k) => {
                const pe = eInOut3(clamp(p - k * 0.05));
                return <circle key={k} cx={lerp(x1, x2, pe)} cy={lerp(y1, y2, pe)} r={9 - k * 1.1} fill="#fff" opacity={1 - k * 0.15} />;
              })}
              {p < 1 && <circle cx={lerp(x1, x2, e)} cy={lerp(y1, y2, e)} r={22} fill="#fff" opacity={0.25} />}
            </g>
          );
        })}
        {/* nodes */}
        {COUNTS.map((c, l) => Array.from({ length: c }, (_, j) => {
          const s = spring({ frame: f - NN.layerAt(l) - j * 1.5, fps: 60, config: { damping: 11, stiffness: 190, mass: 0.6 } });
          const x = XS[l], y = nodeY(l, j);
          let glow = 0;
          for (const e of fires) if (e.l === l && e.j === j && f >= e.t) glow = Math.max(glow, Math.exp(-(f - e.t) / 14));
          return (
            <g key={`${l}-${j}`} transform={`translate(${x} ${y}) scale(${Math.max(0, s) * (1 + 0.22 * glow)})`}>
              {glow > 0.02 && <circle r={42} fill="#fff" opacity={0.28 * glow} />}
              {glow > 0.02 && <circle r={26} fill="#fff" opacity={0.5 * glow} />}
              <circle r={16} fill={glow > 0.25 ? '#fff' : C.navy} fillOpacity={glow > 0.25 ? 1 : 0.8} stroke="#fff" strokeWidth={3} style={{ filter: glow > 0.25 ? 'drop-shadow(0 0 12px #fff)' : undefined }} />
            </g>
          );
        }))}
      </svg>
      <div style={{ position: 'absolute', left: XS[0] - 150, top: 168, width: 300, textAlign: 'center', fontFamily: F.mono, fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', color: '#fff', opacity: labelIn, transform: `translateY(${(1 - labelIn) * -14}px)`, textShadow: '0 0 12px rgba(255,255,255,0.5)' }}>INPUT · YOU</div>
      <div style={{ position: 'absolute', left: XS[4] - 180, top: 168, width: 360, textAlign: 'center', fontFamily: F.mono, fontSize: 22, fontWeight: 700, letterSpacing: '0.18em', color: '#fff', opacity: labelIn, transform: `translateY(${(1 - labelIn) * -14}px)`, textShadow: '0 0 12px rgba(255,255,255,0.5)' }}>OUTPUT · EVERYONE</div>
      <div style={{ position: 'absolute', left: 0, top: 856, width: 1920, textAlign: 'center', fontFamily: F.serif, fontSize: 56, color: '#fff', opacity: clamp(cap * 2), transform: `translateY(${(1 - cap) * 30}px)`, textShadow: '0 0 24px rgba(255,255,255,0.4)' }}>Collective impact grows when we build it together.</div>
    </Fill>
  );
};
