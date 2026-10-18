import React, { useEffect, useState } from 'react';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { continueRender, delayRender, staticFile } from 'remotion';

// The Kennedy Collective palette: Dark Blue #00205C is the ground; Light Blue, Light Gold and Light Red are accents; white is the main graphic color.
export const C = { blue: '#00205C', dark: '#00122F', bright: '#0B3B8A', navy: '#000B24', light: '#00BED6', ice: '#DDC9A3', red: '#E7004C', dred: '#9A004F', white: '#FFFFFF' };
// Headlines: condensed all-caps (stand-in for Program Narrow Black). Body: Sofia Sans (stand-in for Sofia). Mono for technical labels.
export const F = { head: "'Barlow Condensed', 'Arial Narrow', sans-serif", serif: "'Sofia Sans', Arial, sans-serif", mono: "'JetBrains Mono', monospace" };
export const W = 1920, H = 1080, CX = 960, CY = 540;

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const inv = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
export const lin = (t: number) => t;
export const eIn2 = (t: number) => t * t;
export const eIn3 = (t: number) => t * t * t;
export const eOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
export const eInOut3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const eInExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const eInOutExpo = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);
export const eBackOut = (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
export const eElastic = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) + 1);
export const eBounce = (t: number) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};
// Deterministic hash in [0,1): same value for the same index at every frame (no Math.random anywhere).
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};
export const SPRING = { fps: 60 };

// Five-point star (the TKC star motif). Point straight up.
export const starPath = (R: number, k = 0.42) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * k : R;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
  }
  return d + 'Z';
};
export const sparklePath = (r: number, k = 0.1) =>
  `M0 ${-r} Q ${r * k} ${-r * k} ${r} 0 Q ${r * k} ${r * k} 0 ${r} Q ${-r * k} ${r * k} ${-r} 0 Q ${-r * k} ${-r * k} 0 ${-r}Z`;

export const Fill: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, ...style }}>{children}</div>
);

// Pre-blurred soft white bloom: a radial-gradient disc, animated by transform/opacity only.
export const Bloom: React.FC<{ x?: number; y?: number; size?: number; scale?: number; opacity?: number; color?: string; stop?: number }> = ({
  x = CX, y = CY, size = 600, scale = 1, opacity = 1, color = '255,255,255', stop = 65,
}) => (
  <div
    style={{
      position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(${color},1) 0%, rgba(${color},0.35) ${stop * 0.45}%, rgba(${color},0) ${stop}%)`,
      transform: `scale(${scale})`, opacity,
    }}
  />
);

export const Sparkle: React.FC<{ x: number; y: number; r: number; rot?: number; fill?: string; opacity?: number; glow?: boolean; k?: number }> = ({
  x, y, r, rot = 0, fill = '#fff', opacity = 1, glow = false, k = 0.1,
}) => (
  <svg width={r * 2 + 80} height={r * 2 + 80} viewBox={`${-r - 40} ${-r - 40} ${r * 2 + 80} ${r * 2 + 80}`}
    style={{ position: 'absolute', left: x - r - 40, top: y - r - 40, transform: `rotate(${rot}deg)`, opacity, filter: glow ? 'drop-shadow(0 0 18px rgba(255,255,255,0.9))' : undefined, overflow: 'visible' }}>
    <path d={sparklePath(r, k)} fill={fill} />
  </svg>
);

// Motion blur only while something is moving fast (5 samples), otherwise a plain pass-through.
export const MB: React.FC<{ on: boolean; angle?: number; children: React.ReactNode }> = ({ on, angle = 220, children }) =>
  on ? <CameraMotionBlur shutterAngle={angle} samples={5}>{children}</CameraMotionBlur> : <>{children}</>;

export type Pt = { x: number; y: number; red: boolean };
export const LOGO_ASPECT = 660 / 1626; // height / width of public/logo-full.png
// Samples opaque pixels of public/logo-full.png deterministically (works with any logo you drop in).
export function useLogoPoints(n = 1400): Pt[] | null {
  const [pts, setPts] = useState<Pt[] | null>(null);
  const [handle] = useState(() => delayRender('logo points'));
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const SW = 540, SH = Math.round(540 * LOGO_ASPECT);
      const cv = document.createElement('canvas');
      cv.width = SW; cv.height = SH;
      const ctx = cv.getContext('2d')!;
      ctx.drawImage(img, 0, 0, SW, SH);
      const d = ctx.getImageData(0, 0, SW, SH).data;
      const cand: Pt[] = [];
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
        const o = (y * SW + x) * 4;
        if (d[o + 3] > 128) cand.push({ x: (x + 0.5) / SW - 0.5, y: (y + 0.5) / SH - 0.5, red: d[o] > 200 && d[o + 1] < 90 });
      }
      for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(hash(i * 3.7) * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
      setPts(cand.slice(0, n));
      continueRender(handle);
    };
    img.src = staticFile('logo-full.png');
  }, [handle, n]);
  return pts;
}
