import React from 'react';
import { useCurrentFrame } from 'remotion';
import { EASE } from '../timing.js';
import { Bloom, C, F, Fill, clamp, eBackOut, eBounce, eElastic, eInOut3, eOut3, eOutExpo, inv, lin } from '../lib';

const ROWS: { name: string; tag: string; fn: (t: number) => number }[] = [
  { name: 'linear', tag: '/IDEA', fn: lin },
  { name: 'ease-in-out', tag: '/PROMPT', fn: eInOut3 },
  { name: 'expo-out', tag: '/DRAFT', fn: eOutExpo },
  { name: 'back-out', tag: '/TEST', fn: (t) => eBackOut(t, 1.4) },
  { name: 'elastic', tag: '/ITERATE', fn: eElastic },
  { name: 'bounce', tag: '/SHIP', fn: eBounce },
];
const X0 = 800, DIST = 720, Y0 = 285, PITCH = 100, TRAIL = 8;

const curvePath = (fn: (t: number) => number) => {
  let d = '';
  for (let i = 0; i <= 40; i++) { const t = i / 40; const y = 58 - clamp(fn(t), -0.3, 1.3) * 52; d += `${i ? 'L' : 'M'}${(t * 96).toFixed(1)} ${y.toFixed(1)}`; }
  return d;
};

export const Easing: React.FC = () => {
  const f = useCurrentFrame();
  const head = eOutExpo(inv(f, 0, 22));
  return (
    <Fill>
      <Bloom x={1200} y={540} size={1500} opacity={0.12} />
      <div style={{ position: 'absolute', left: 128, top: 150, fontFamily: F.serif, fontStyle: 'italic', fontSize: 62, color: '#fff', opacity: head, transform: `translateY(${(1 - head) * 30}px)`, textShadow: '0 0 24px rgba(255,255,255,0.3)' }}>
        Six ways to get an idea out in public.
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {ROWS.map((r, i) => {
          const y = Y0 + i * PITCH;
          const start = EASE.rowStart(i), end = start + EASE.dur;
          const rowIn = eOutExpo(inv(f, i * 4, i * 4 + 16));
          const pos = (ff: number) => X0 + r.fn(inv(ff, start, end)) * DIST;
          const arrive = inv(f, end, end + 24);
          const t = inv(f, start, end);
          const px = 128 + 0 * i;
          return (
            <g key={i} opacity={rowIn} transform={`translate(${(1 - rowIn) * -60} 0)`}>
              <text x={px} y={y + 8} fill={C.ice} fontFamily={F.mono} fontSize={20} letterSpacing={3}>{r.tag}</text>
              <text x={px + 170} y={y + 9} fill="#fff" fontFamily={F.mono} fontWeight={700} fontSize={26}>{r.name}</text>
              {/* curve icon */}
              <g transform={`translate(${520} ${y - 30})`}>
                <rect x={-8} y={-4} width={112} height={66} rx={10} fill="rgba(10,11,61,0.35)" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
                <path d={curvePath(r.fn)} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={t * 96} cy={58 - clamp(r.fn(t), -0.3, 1.3) * 52} r={5.5} fill="#fff" style={{ filter: 'drop-shadow(0 0 6px #fff)' }} />
              </g>
              {/* track */}
              <line x1={X0} x2={X0 + DIST} y1={y} y2={y} stroke="rgba(201,202,255,0.35)" strokeWidth={2} strokeDasharray="3 9" />
              <line x1={X0 + DIST} x2={X0 + DIST} y1={y - 26} y2={y + 26} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
              {/* trails + dots: white leads, navy follows 5 frames behind */}
              {[{ lag: 0, col: '#fff', dy: -11, edge: undefined }, { lag: 5, col: C.navy, dy: 11, edge: '#fff' }].map((d, di) => (
                <g key={di}>
                  {Array.from({ length: TRAIL }, (_, k) => TRAIL - k).map((k) => (
                    <circle key={k} cx={pos(f - d.lag - k * 0.9)} cy={y + d.dy} r={13 * (1 - k * 0.08)} fill={d.col} opacity={0.38 * (1 - k / (TRAIL + 1)) * (t > 0 ? 1 : 0)} />
                  ))}
                  <circle cx={pos(f - d.lag)} cy={y + d.dy} r={13} fill={d.col} stroke={d.edge} strokeWidth={d.edge ? 2 : 0} style={{ filter: d.col === '#fff' ? 'drop-shadow(0 0 10px rgba(255,255,255,0.9))' : undefined }} />
                </g>
              ))}
              {/* arrival ring pop */}
              {arrive > 0 && arrive < 1 && (
                <>
                  <circle cx={X0 + DIST} cy={y} r={14 + 60 * eOutExpo(arrive)} fill="none" stroke="#fff" strokeWidth={4 * (1 - arrive) + 0.5} opacity={1 - arrive} />
                  <circle cx={X0 + DIST} cy={y} r={14 + 34 * eOut3(arrive)} fill="none" stroke={C.ice} strokeWidth={2} opacity={(1 - arrive) * 0.8} />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </Fill>
  );
};
