import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { Bloom, C, CX, CY, F, Fill, clamp, eOutExpo, inv } from '../lib';

const NU = 55, NV = 20, R = 285, r = 112, FOCAL = 1800;
const BASE: { x: number; y: number; z: number; c: string; i: number }[] = [];
for (let a = 0; a < NU; a++) for (let b = 0; b < NV; b++) {
  const u = (a / NU) * Math.PI * 2, v = (b / NV) * Math.PI * 2 + (a % 2) * (Math.PI / NV);
  const i = a * NV + b;
  BASE.push({ x: (R + r * Math.cos(v)) * Math.cos(u), y: (R + r * Math.cos(v)) * Math.sin(u), z: r * Math.sin(v), c: i % 11 === 0 ? C.red : i % 7 === 0 ? C.light : i % 5 === 0 ? C.ice : '#fff', i });
}

export const Depth: React.FC = () => {
  const f = useCurrentFrame();
  const intro = spring({ frame: f, fps: 60, config: { damping: 14, stiffness: 70, mass: 1 } });
  const spin = f * 0.034 + 2.4 * (1 - eOutExpo(inv(f, 0, 36)));
  const ax = 0.95 + 0.35 * Math.sin(f * 0.045), ay = f * 0.016, az = spin;
  const cxA = Math.cos(ax), sxA = Math.sin(ax), cyA = Math.cos(ay), syA = Math.sin(ay), czA = Math.cos(az), szA = Math.sin(az);
  const sc = 0.35 + 0.65 * Math.max(0, intro);
  const pts = BASE.map((p) => {
    let x = p.x * sc, y = p.y * sc, z = p.z * sc;
    // spin around the torus axis (Z), then tilt (X), then slow yaw (Y)
    const x3 = x * czA - y * szA, y3 = x * szA + y * czA; x = x3; y = y3;
    const y1 = y * cxA - z * sxA, z1 = y * sxA + z * cxA; y = y1; z = z1;
    const x2 = x * cyA + z * syA, z2 = -x * syA + z * cyA; x = x2; z = z2;
    const k = FOCAL / (FOCAL + z);
    return { sx: CX + x * k, sy: CY + 10 + y * k, z, k, c: p.c };
  }).sort((a, b) => b.z - a.z);
  const lx = CX + 200 * Math.sin(f * 0.03), ly = CY - 120 + 60 * Math.cos(f * 0.021);
  const cap = eOutExpo(inv(f, 8, 30));
  return (
    <Fill>
      <Bloom x={lx} y={ly} size={1200} opacity={0.38} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {pts.map((p, i) => {
          const depth = clamp(1 - (p.z + R + r) / (2 * (R + r)));
          return <circle key={i} cx={p.sx} cy={p.sy} r={Math.max(0.5, 4.4 * p.k * p.k)} fill={p.c} opacity={(0.3 + 0.7 * depth) * 1 * clamp(intro * 2)} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 0, top: 890, width: 1920, textAlign: 'center', fontFamily: F.mono, fontSize: 19, letterSpacing: '0.3em', color: '#fff', opacity: cap }}>1,100 POINTS · PERSPECTIVE PROJECTION · ZERO MESHES</div>
    </Fill>
  );
};
