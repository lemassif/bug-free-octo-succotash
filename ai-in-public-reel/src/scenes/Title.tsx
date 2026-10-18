import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { Bloom, C, CX, CY, F, Fill, MB, clamp, eInOut3, eOut3, eOutExpo, inv, lerp, sparklePath } from '../lib';

const TEXT = 'AI IN PUBLIC';
const SIZE = 230;
const GLITCH = [1, -0.7, 1.2, -1, 0.6, 0];

const Letters: React.FC<{ color: string; dx: number; dy: number; opacity?: number; skew?: number; shadow?: string }> = ({ color, dx, dy, opacity = 1, skew = 0, shadow }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, top: 300, width: 1920, display: 'flex', justifyContent: 'center', fontFamily: F.head, fontSize: SIZE, lineHeight: 1, fontKerning: 'none', color, opacity, transform: `translate(${dx}px, ${dy}px) skewX(${skew}deg)`, textShadow: shadow, whiteSpace: 'pre' }}>
      {TEXT.split('').map((ch, i) => {
        const s = spring({ frame: f - i * 2.2, fps: 60, config: { damping: 11, stiffness: 170, mass: 0.7 } });
        return (
          <span key={i} style={{ display: 'inline-block', transform: `translateY(${(1 - s) * 340}px) skewX(${(1 - s) * -22}deg) scale(${0.88 + 0.12 * s})`, opacity: clamp(s * 5), width: ch === ' ' ? SIZE * 0.26 : undefined }}>{ch === ' ' ? ' ' : ch}</span>
        );
      })}
    </div>
  );
};

export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const settle = 1 - eOut3(inv(f, 4, 36));
  const gf = f - 64;
  const g = gf >= 0 && gf < GLITCH.length ? GLITCH[gf] : 0;
  const off = 30 * settle + 26 * Math.abs(g);
  const skew = g * 5;
  const slam = 1 + 0.12 * (1 - eOutExpo(inv(f, 0, 14)));
  const sweepP = inv(f, 46, 90);
  const sub = ['learn it', 'build it', 'share it'];
  const bigIn = spring({ frame: f - 2, fps: 60, config: { damping: 18, stiffness: 60, mass: 1.4 } });
  return (
    <Fill>
      {/* huge soft rotating sparkle behind */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: 0.13 }}>
        <g transform={`translate(${CX} ${CY - 40}) rotate(${f * 0.45}) scale(${0.5 + 0.5 * bigIn})`}><path d={sparklePath(820, 0.12)} fill="#fff" /></g>
      </svg>
      <Bloom y={CY - 40} size={1500} opacity={0.22} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${slam})`, transformOrigin: `${CX}px 410px`, filter: 'drop-shadow(0 0 34px rgba(255,255,255,0.35))' }}>
        <MB on={f < 34}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }}>
            <Letters color={C.navy} dx={off + 6} dy={off * 0.35 + 8} skew={skew} />
            <Letters color={C.ice} dx={-off} dy={-off * 0.25} skew={skew} opacity={0.95} />
            <Letters color="#F4F4FF" dx={0} dy={0} skew={skew} />
          </div>
        </MB>
        {/* light sweep crossing the settled letters */}
        <div style={{ position: 'absolute', left: 0, top: 300, width: 1920, display: 'flex', justifyContent: 'center', opacity: sweepP > 0 && sweepP < 1 ? 1 : 0 }}>
          <div style={{ fontFamily: F.head, fontSize: SIZE, lineHeight: 1, fontKerning: 'none', whiteSpace: 'pre', color: 'transparent', backgroundImage: 'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 38%, #fff 50%, rgba(255,255,255,0) 62%, rgba(255,255,255,0) 100%)', backgroundSize: '300% 100%', backgroundPosition: `${lerp(100, 0, eInOut3(sweepP))}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: 'drop-shadow(0 0 22px #fff)' }}>
            {TEXT.replace(/ /g, ' '.repeat(1))}
          </div>
        </div>
      </div>
      {/* underline + subtitle */}
      <div style={{ position: 'absolute', left: CX - 520, top: 640, width: 1040, height: 3, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff 20%, #fff 80%, rgba(255,255,255,0))', transform: `scaleX(${eOutExpo(inv(f, 30, 56))})`, boxShadow: '0 0 14px rgba(255,255,255,0.8)' }} />
      <div style={{ position: 'absolute', left: 0, top: 676, width: 1920, display: 'flex', justifyContent: 'center', gap: 26, fontFamily: F.serif, fontStyle: 'italic', fontSize: 76, color: C.ice }}>
        {sub.map((s, i) => {
          const e = spring({ frame: f - (36 + i * 6), fps: 60, config: { damping: 16, stiffness: 120, mass: 0.8 } });
          return (
            <React.Fragment key={s}>
              <span style={{ display: 'inline-block', opacity: clamp(e * 3), transform: `translateY(${(1 - e) * 36}px)`, color: i === 2 ? '#fff' : C.ice, textShadow: '0 0 20px rgba(255,255,255,0.35)' }}>{s}</span>
              {i < 2 && <span style={{ opacity: clamp(e * 3), color: '#fff' }}>·</span>}
            </React.Fragment>
          );
        })}
      </div>
    </Fill>
  );
};
