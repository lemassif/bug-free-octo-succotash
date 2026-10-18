import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { Bloom, C, F, Fill, clamp, eInOut3, eOutExpo, hash, inv, lerp } from '../lib';

const S = 92, COLS = 18, ROWS = 8, X0 = 132, Y0 = 186, h = S / 2;
const ARC0 = [`M${h} 0 A${h} ${h} 0 0 1 0 ${h}`, `M${h} ${S} A${h} ${h} 0 0 1 ${S} ${h}`];
const ARC1 = [`M${h} 0 A${h} ${h} 0 0 0 ${S} ${h}`, `M0 ${h} A${h} ${h} 0 0 1 ${h} ${S}`];
const WAVE0 = 36, WAVE1 = 78;

export const Truchet: React.FC = () => {
  const f = useCurrentFrame();
  const front = X0 + (COLS * S + 160) * ((f - WAVE0) / (WAVE1 - WAVE0)) - 80;
  const cap = eOutExpo(inv(f, 4, 24));
  const tiles = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const cx = X0 + c * S + h, cy = Y0 + r * S + h;
    const d = Math.hypot((c + 0.5 - COLS / 2) / (COLS / 2), (r + 0.5 - ROWS / 2) / (ROWS / 2));
    const t0 = 4 + d * 24;
    const sc = Math.max(0, spring({ frame: f - t0, fps: 60, config: { damping: 13, stiffness: 190, mass: 0.6 } }));
    if (sc <= 0.001) continue;
    const orient = hash(c * 31 + r * 17 + 5) > 0.5 ? 1 : 0;
    const tw = WAVE0 + (WAVE1 - WAVE0) * ((cx - X0) / (COLS * S));
    const rot = 90 * Math.min(1.0, eOutExpo(inv(f, tw, tw + 14)));
    const mix = eInOut3(inv(f, tw, tw + 10));
    const arcs = orient ? ARC1 : ARC0;
    const hv = hash(c * 7 + r * 13 + 2);
    const col = hv < 0.56 ? '#fff' : hv < 0.7 ? C.light : hv < 0.82 ? C.ice : hv < 0.92 ? C.red : '#fff';
    const dash = col === '#fff' ? C.light : col;
    tiles.push(
      <g key={`${c}-${r}`} transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sc}) translate(${-h} ${-h})`}>
        {arcs.map((p, i) => <path key={'w' + i} d={p} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" opacity={1 - mix} />)}
        {arcs.map((p, i) => <path key={'n' + i} d={p} fill="none" stroke={dash} strokeWidth={7} strokeLinecap="butt" strokeDasharray="7 7" opacity={mix} />)}
      </g>,
    );
  }
  const wo = clamp(inv(f, WAVE0 - 4, WAVE0 + 2)) * (1 - inv(f, WAVE1 - 6, WAVE1 + 8));
  return (
    <Fill>
      <Bloom size={1500} opacity={0.12} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g style={{ filter: 'drop-shadow(0 0 7px rgba(255,255,255,0.55))' }}>{tiles}</g>
      </svg>
      <div style={{ position: 'absolute', left: front - 90, top: Y0 - 30, width: 180, height: ROWS * S + 60, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5) 50%, rgba(255,255,255,0))', opacity: wo }} />
      <div style={{ position: 'absolute', left: 0, top: 140, width: 1920, textAlign: 'center', fontFamily: F.mono, fontSize: 19, letterSpacing: '0.3em', color: '#fff', opacity: cap, transform: `translateY(${(1 - cap) * -10}px)` }}>THE COLLECTIVE FABRIC · 144 PIECES · ONE PATTERN</div>
    </Fill>
  );
};
