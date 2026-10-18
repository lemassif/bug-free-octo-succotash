import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { Bloom, C, CX, CY, F, Fill, Sparkle, clamp, eInExpo, eInOut3, eOutExpo, hash, inv, lerp, sparklePath } from '../lib';

const RING_TEXT = 'AI IN PUBLIC · LEARN · BUILD · SHARE · AI IN PUBLIC · LEARN · BUILD · SHARE · ';

export const Signal: React.FC = () => {
  const f = useCurrentFrame();
  const dot = spring({ frame: f - 2, fps: 60, config: { damping: 9, stiffness: 190, mass: 0.6 } });
  const dotShrink = 1 - eInOut3(inv(f, 16, 28));
  const sp = spring({ frame: f - 16, fps: 60, config: { damping: 10, stiffness: 150, mass: 0.7 } });
  const zoom = 1 + 8 * eInExpo(inv(f, 82, 120));
  const rot = lerp(-90, 0, clamp(sp)) + f * 0.35;
  const breathe = 1 + 0.035 * Math.sin(f * 0.12);
  const ringIn = spring({ frame: f - 34, fps: 60, config: { damping: 14, stiffness: 90, mass: 1 } });
  const R = 300, circ = 2 * Math.PI * R;
  const flareX = eOutExpo(inv(f, 30, 52));
  const flareO = (1 - inv(f, 50, 96)) * clamp(inv(f, 28, 34));
  const burst = (t0: number, d: number) => eOutExpo(inv(f, t0, t0 + d));
  return (
    <Fill style={{ transform: `scale(${zoom})`, transformOrigin: `${CX}px ${CY}px` }}>
      <Bloom size={900} scale={0.4 + 0.5 * eOutExpo(inv(f, 28, 70))} opacity={0.55 * clamp(inv(f, 24, 32)) * (1 - 0.4 * inv(f, 70, 100))} />
      {/* horizontal lens flare */}
      <div style={{ position: 'absolute', left: CX - 800, top: CY - 3, width: 1600, height: 6, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff 50%, rgba(255,255,255,0))', transform: `scaleX(${flareX})`, opacity: flareO, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.9))' }} />
      <div style={{ position: 'absolute', left: CX - 800, top: CY - 40, width: 1600, height: 80, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,0.5), rgba(255,255,255,0))', transform: `scaleX(${flareX})`, opacity: flareO * 0.8 }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* 16 rays */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2 + 0.1;
          const L = i % 2 ? 560 : 760 - (i % 4) * 30;
          const head = lerp(120, L, burst(30 + (i % 3), 26));
          const tail = lerp(120, L * 0.78, eInOut3(inv(f, 36 + (i % 3), 76)));
          const o = (1 - inv(f, 60, 84)) * clamp(inv(f, 30, 33));
          return (
            <line key={i} x1={CX + Math.cos(a) * tail} y1={CY + Math.sin(a) * tail} x2={CX + Math.cos(a) * head} y2={CY + Math.sin(a) * head}
              stroke={i % 2 ? C.ice : '#fff'} strokeWidth={i % 2 ? 3 : 5} strokeLinecap="round" opacity={o} />
          );
        })}
        {/* expanding rings */}
        {[0, 7].map((d, i) => {
          const t = inv(f, 30 + d, 84 + d);
          return <circle key={i} cx={CX} cy={CY} r={120 + 820 * eOutExpo(t)} fill="none" stroke={i ? C.ice : '#fff'} strokeWidth={Math.max(0.5, (i ? 2 : 5) * (1 - t))} opacity={(1 - t) * clamp(inv(f, 30 + d, 32 + d))} />;
        })}
        {/* rotating text ring */}
        <g transform={`translate(${CX} ${CY}) rotate(${f * 0.55 - 20}) scale(${0.72 + 0.28 * ringIn})`} opacity={clamp(ringIn)}>
          <defs><path id="ringpath" d={`M ${-R} 0 A ${R} ${R} 0 1 1 ${R} 0 A ${R} ${R} 0 1 1 ${-R} 0`} /></defs>
          <text fill={C.ice} fontFamily={F.mono} fontSize={26} fontWeight={700} letterSpacing={4}>
            <textPath href="#ringpath" textLength={circ - 8} lengthAdjust="spacing">{RING_TEXT}</textPath>
          </text>
          <circle r={R - 34} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} strokeDasharray="4 10" />
        </g>
        {/* twinkles */}
        {Array.from({ length: 10 }, (_, i) => {
          const a = hash(i * 5.1) * 6.28, d = 380 + hash(i * 2.3) * 180, t = inv(f, 44 + i * 3, 70 + i * 3);
          const s = Math.sin(t * Math.PI);
          return <path key={i} d={sparklePath(16 * s + 0.01, 0.12)} fill="#fff" transform={`translate(${CX + Math.cos(a) * d} ${CY + Math.sin(a) * d})`} opacity={0.9} />;
        })}
      </svg>
      {/* white dot -> sparkle */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.85))' }}>
        <circle cx={CX} cy={CY} r={Math.max(0, 28 * dot * dotShrink)} fill="#fff" />
        <g transform={`translate(${CX} ${CY}) rotate(${rot}) scale(${Math.max(0, sp * breathe)})`}>
          <path d={sparklePath(150, 0.1)} fill="#fff" />
        </g>
      </svg>
    </Fill>
  );
};
