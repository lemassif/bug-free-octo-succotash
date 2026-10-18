import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Bloom, C, CX, CY, Fill, MB, clamp, eIn3, eInExpo, inv, lerp, hash } from '../lib';

const N = 260;
const S = (f: number) => (f / 60) * 0.9 + 5.2 * Math.pow(f / 60, 2.2); // accumulated travel, accelerating
const rad = (u: number) => 30 + 1500 * Math.pow(u, 2.2);

const Streaks: React.FC = () => {
  const f = useCurrentFrame();
  const speed = S(f) - S(f - 1);
  const rows = [];
  for (let i = 0; i < N; i++) {
    const th = hash(i * 3 + 1) * Math.PI * 2, k = 0.7 + hash(i * 7 + 2) * 0.8, u0 = hash(i * 11 + 3);
    const u = (u0 + k * S(f)) % 1;
    const tl = Math.min(0.5, 0.012 + speed * k * 1.1);
    const r1 = rad(u), r0 = rad(Math.max(0, u - tl));
    const col = i % 5 === 0 ? C.red : i % 3 === 0 ? C.light : i % 7 === 0 ? C.ice : '#fff';
    const w = 1.2 + 5 * Math.pow(u, 1.5);
    rows.push(
      <line key={i} x1={CX + Math.cos(th) * r0} y1={CY + Math.sin(th) * r0} x2={CX + Math.cos(th) * r1} y2={CY + Math.sin(th) * r1}
        stroke={col} strokeWidth={w} strokeLinecap="round" opacity={clamp(u * 4) * (col === C.red ? 0.85 : 0.95)} />,
    );
  }
  return <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>{rows}</svg>;
};

export const Warp: React.FC = () => {
  const f = useCurrentFrame();
  const core = eInExpo(inv(f, 0, 56));
  return (
    <Fill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `rotate(${f * 0.12}deg)` }}>
        <MB on angle={240}><Streaks /></MB>
      </div>
      <Bloom size={700} scale={lerp(0.2, 7, core)} opacity={0.35 + 0.65 * core} />
      <Bloom size={260} scale={lerp(0.3, 5, core)} opacity={clamp(inv(f, 6, 20))} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: '#fff', opacity: eIn3(inv(f, 44, 60)) }} />
    </Fill>
  );
};
