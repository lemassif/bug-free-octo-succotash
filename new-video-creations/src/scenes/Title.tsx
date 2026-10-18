import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { Bloom, C, CX, CY, F, Fill, MB, clamp, eInOut3, eOut3, eOutExpo, inv, lerp, starPath } from '../lib';

const LINES = ['THE KENNEDY', 'COLLECTIVE'];
const SIZE = 262;
const LH = 0.9;
const TOP = 192;
const GLITCH = [1, -0.7, 1.2, -1, 0.6, 0];

const Letters: React.FC<{ color: string; dx: number; dy: number; opacity?: number; skew?: number }> = ({ color, dx, dy, opacity = 1, skew = 0 }) => {
  const f = useCurrentFrame();
  let n = 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: TOP, width: 1920, fontFamily: F.head, fontWeight: 900, fontSize: SIZE, lineHeight: LH, fontKerning: 'none', color, opacity, transform: `translate(${dx}px, ${dy}px) skewX(${skew}deg)`, whiteSpace: 'pre', letterSpacing: '0.01em' }}>
      {LINES.map((line, li) => (
        <div key={li} style={{ display: 'flex', justifyContent: 'center' }}>
          {line.split('').map((ch, i) => {
            const k = n++;
            const s = spring({ frame: f - k * 2.2, fps: 60, config: { damping: 11, stiffness: 170, mass: 0.7 } });
            return (
              <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - s) * 340}px) skewX(${(1 - s) * -22}deg) scale(${0.88 + 0.12 * s})`, opacity: clamp(s * 5) }}>{ch === ' ' ? ' ' : ch}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const settle = 1 - eOut3(inv(f, 4, 36));
  const gf = f - 66;
  const g = gf >= 0 && gf < GLITCH.length ? GLITCH[gf] : 0;
  const off = 30 * settle + 26 * Math.abs(g);
  const skew = g * 5;
  const slam = 1 + 0.12 * (1 - eOutExpo(inv(f, 0, 14)));
  const sweepP = inv(f, 50, 94);
  const sub = ['Empowerment', 'Employment', 'Collective Impact'];
  const bigIn = spring({ frame: f - 2, fps: 60, config: { damping: 18, stiffness: 60, mass: 1.4 } });
  return (
    <Fill>
      {/* huge soft rotating star behind */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: 0.11 }}>
        <g transform={`translate(${CX} ${CY - 30}) rotate(${f * 0.3}) scale(${0.5 + 0.5 * bigIn})`}><path d={starPath(760)} fill="#fff" /></g>
      </svg>
      <Bloom y={CY - 40} size={1500} opacity={0.2} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${slam})`, transformOrigin: `${CX}px 400px`, filter: 'drop-shadow(0 0 34px rgba(255,255,255,0.3))' }}>
        <MB on={f < 34}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }}>
            <Letters color={C.navy} dx={off + 7} dy={off * 0.35 + 9} skew={skew} />
            <Letters color={C.red} dx={off} dy={off * 0.25} skew={skew} opacity={0.95} />
            <Letters color={C.light} dx={-off} dy={-off * 0.25} skew={skew} opacity={0.95} />
            <Letters color="#fff" dx={0} dy={0} skew={skew} />
          </div>
        </MB>
        {/* light sweep crossing the settled letters */}
        <div style={{ position: 'absolute', left: 0, top: TOP, width: 1920, textAlign: 'center', opacity: sweepP > 0 && sweepP < 1 ? 1 : 0 }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: SIZE, lineHeight: LH, fontKerning: 'none', letterSpacing: '0.01em', whiteSpace: 'pre', color: 'transparent', backgroundImage: 'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 38%, #fff 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 100%)', backgroundSize: '300% 100%', backgroundPosition: `${lerp(100, 0, eInOut3(sweepP))}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: 'drop-shadow(0 0 24px #fff)' }}>
            {'THE KENNEDY\nCOLLECTIVE'}
          </div>
        </div>
      </div>
      {/* underline + the Three Benefits */}
      <div style={{ position: 'absolute', left: CX - 560, top: 690, width: 1120, height: 3, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff 20%, #fff 80%, rgba(255,255,255,0))', transform: `scaleX(${eOutExpo(inv(f, 30, 56))})`, boxShadow: '0 0 14px rgba(255,255,255,0.8)' }} />
      <div style={{ position: 'absolute', left: 0, top: 718, width: 1920, display: 'flex', justifyContent: 'center', gap: 28, fontFamily: F.serif, fontSize: 62, color: '#fff' }}>
        {sub.map((s, i) => {
          const e = spring({ frame: f - (36 + i * 6), fps: 60, config: { damping: 16, stiffness: 120, mass: 0.8 } });
          return (
            <React.Fragment key={s}>
              <span style={{ display: 'inline-block', opacity: clamp(e * 3), transform: `translateY(${(1 - e) * 36}px)`, color: i === 1 ? C.ice : '#fff', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>{s}</span>
              {i < 2 && <span style={{ opacity: clamp(e * 3), color: C.light }}>·</span>}
            </React.Fragment>
          );
        })}
      </div>
    </Fill>
  );
};
