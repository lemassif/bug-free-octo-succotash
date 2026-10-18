import React from 'react';
import { Img, spring, staticFile, useCurrentFrame } from 'remotion';
import { FINALE_FROM, LOCK } from '../timing.js';
import { Bloom, C, CX, CY, F, Fill, clamp, eInOut3, eOut3, eOutExpo, hash, inv, lerp, sparklePath, useLogoPoints } from '../lib';

const LOCK_L = LOCK - FINALE_FROM; // 180
const LOGO = 560;
const TAU = Math.PI * 2;
const norm = (a: number) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

export const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const pts = useLogoPoints(1400);
  const lock = f - LOCK_L;
  const slide = spring({ frame: f - (LOCK_L + 8), fps: 60, config: { damping: 20, stiffness: 120, mass: 0.8 } });
  const groupX = -330 * slide, groupS = 1 - 0.14 * slide;
  const gather = inv(f, 0, LOCK_L);

  const particles = pts && f < LOCK_L + 10 ? (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - clamp(inv(f, LOCK_L - 2, LOCK_L + 8)) }}>
      {pts.map((p, i) => {
        const delay = hash(i * 1.7) * 52, dur = 100 + hash(i * 2.9) * 20;
        const th0 = hash(i * 3.3) * TAU, r0 = 1000 + hash(i * 4.1) * 600;
        const tx = p.x * LOGO, ty = p.y * LOGO, rt = Math.hypot(tx, ty), tht = Math.atan2(ty, tx);
        const delta = norm(tht - th0) + TAU * (1 + (i % 3 === 0 ? 1 : 0));
        const at = (ff: number) => {
          const q = eOut3(inv(ff - delay, 0, dur));
          const r = lerp(r0, rt, q), th = th0 + delta * q;
          return [CX + Math.cos(th) * r, CY + Math.sin(th) * r];
        };
        const [x1, y1] = at(f), [x0, y0] = at(f - 2.5);
        const op = clamp(inv(f, delay, delay + 6));
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={i % 5 === 0 ? C.ice : '#fff'} strokeWidth={i % 7 === 0 ? 4.8 : 3.8} strokeLinecap="round" opacity={op} />;
      })}
    </svg>
  ) : null;

  const logoIn = lock >= -2 ? clamp(inv(f, LOCK_L - 2, LOCK_L + 6)) : 0;
  const pop = spring({ frame: lock, fps: 60, config: { damping: 9, stiffness: 200, mass: 0.7 } });
  const glowP = inv(f, LOCK_L, LOCK_L + 44);
  const ringT = inv(f, LOCK_L, LOCK_L + 46), ring2 = inv(f, LOCK_L + 6, LOCK_L + 56);
  const titleW = eOutExpo(inv(f, LOCK_L + 30, LOCK_L + 60));
  const sweepX = lerp(0, 1, eInOut3(inv(f, LOCK_L + 30, LOCK_L + 62)));
  const tag = ['learning', 'AI,', 'out', 'loud.'];
  const foot = clamp(inv(f, LOCK_L + 54, LOCK_L + 74));
  const arrow = 6 * Math.sin(f * 0.12);
  const TX = 880, TY = 380;
  const gathering = f < LOCK_L;
  return (
    <Fill>
      <Bloom size={1500} opacity={0.18 + 0.25 * eOut3(gather) * (gathering ? 1 : 0.4)} />
      {/* particle swirl */}
      <Fill style={{ transform: `translateX(${groupX}px) scale(${groupS})`, transformOrigin: `${CX}px ${CY}px` }}>
        {particles}
        {/* lock effects */}
        {lock >= 0 && (
          <>
            <Bloom size={900} scale={lerp(0.5, 2.6, eOutExpo(glowP))} opacity={0.95 * (1 - glowP)} />
            <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              <circle cx={CX} cy={CY} r={120 + 900 * eOutExpo(ringT)} fill="none" stroke="#fff" strokeWidth={8 * (1 - ringT) + 0.5} opacity={1 - ringT} style={{ filter: 'drop-shadow(0 0 14px #fff)' }} />
              <circle cx={CX} cy={CY} r={100 + 640 * eOutExpo(ring2)} fill="none" stroke={C.ice} strokeWidth={4 * (1 - ring2) + 0.5} opacity={(1 - ring2) * 0.9} />
            </svg>
          </>
        )}
        <div style={{ position: 'absolute', left: CX - LOGO / 2, top: CY - LOGO / 2, width: LOGO, height: LOGO, opacity: logoIn, transform: `scale(${lock >= 0 ? 0.9 + 0.1 * pop : 1})`, filter: `drop-shadow(0 0 ${22 + 40 * (1 - glowP)}px rgba(255,255,255,${0.55 + 0.4 * (1 - glowP)}))` }}>
          <Img src={staticFile('logo-mark.png')} style={{ width: LOGO, height: LOGO }} />
        </div>
      </Fill>
      {/* title wipe-in with a light sweep */}
      <div style={{ position: 'absolute', left: TX, top: TY, fontFamily: F.head, fontSize: 118, lineHeight: 1, color: '#fff', whiteSpace: 'pre', fontKerning: 'none', clipPath: `inset(-20px ${(1 - titleW) * 100}% -20px 0)`, textShadow: '0 0 36px rgba(255,255,255,0.4)', opacity: lock >= 30 ? 1 : 0 }}>
        AI IN PUBLIC
      </div>
      {lock >= 30 && sweepX < 1 && (
        <div style={{ position: 'absolute', left: TX + sweepX * 840 - 40, top: TY - 10, width: 80, height: 140, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff 50%, rgba(255,255,255,0))', opacity: 0.85 * Math.sin(sweepX * Math.PI) }} />
      )}
      {/* tagline */}
      <div style={{ position: 'absolute', left: TX, top: TY + 150, display: 'flex', gap: 22, fontFamily: F.serif, fontStyle: 'italic', fontSize: 84, color: C.ice, whiteSpace: 'pre' }}>
        {tag.map((w, i) => {
          const s = spring({ frame: f - (LOCK_L + 52 + i * 5), fps: 60, config: { damping: 15, stiffness: 120, mass: 0.8 } });
          return <span key={i} style={{ display: 'inline-block', opacity: clamp(s * 3), transform: `translateY(${(1 - s) * 40}px)`, color: i >= 2 ? '#fff' : C.ice, textShadow: '0 0 22px rgba(255,255,255,0.4)' }}>{w}</span>;
        })}
        {(() => { const s = spring({ frame: f - (LOCK_L + 66), fps: 60, config: { damping: 8, stiffness: 160, mass: 0.7 } }); return (
          <svg width={70} height={70} viewBox="-35 -35 70 70" style={{ marginLeft: 4, marginTop: 6, transform: `scale(${Math.max(0, s)}) rotate(${(1 - s) * 120}deg)`, filter: 'drop-shadow(0 0 10px #fff)', overflow: 'visible' }}>
            <path d={sparklePath(30, 0.1)} fill="#fff" />
          </svg>
        ); })()}
      </div>
      {/* footer */}
      <div style={{ position: 'absolute', left: 0, top: 876, width: 1920, textAlign: 'center', fontFamily: F.mono, fontSize: 21, letterSpacing: '0.14em', color: C.ice, opacity: foot, transform: `translateY(${(1 - foot) * 14}px)`, whiteSpace: 'pre' }}>
        MOTION REEL · 2026  <span style={{ color: C.light }}>|</span>  EVERY FRAME WRITTEN IN CODE  <span style={{ color: C.light }}>|</span>  <span style={{ color: '#fff' }}>FOLLOW THE BUILD <span style={{ display: 'inline-block', transform: `translateX(${arrow}px)` }}>→</span></span>
      </div>
    </Fill>
  );
};
