import React from 'react';
import { Img, spring, staticFile, useCurrentFrame } from 'remotion';
import { FINALE_FROM, LOCK } from '../timing.js';
import { Bloom, C, CX, F, Fill, LOGO_ASPECT, clamp, eInOut3, eOut3, eOutExpo, hash, inv, lerp, starPath, useLogoPoints } from '../lib';

const LOCK_L = LOCK - FINALE_FROM; // 180
const LW = 1000, LH = LW * LOGO_ASPECT; // lockup size at assembly
const LY = 470; // lockup center y at assembly
const TAU = Math.PI * 2;
const norm = (a: number) => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

export const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const pts = useLogoPoints(1400);
  const lock = f - LOCK_L;
  const rise = spring({ frame: f - (LOCK_L + 8), fps: 60, config: { damping: 20, stiffness: 120, mass: 0.8 } });
  const groupY = -150 * rise, groupS = 1 - 0.16 * rise;
  const gather = inv(f, 0, LOCK_L);

  const particles = pts && f < LOCK_L + 10 ? (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: 1 - clamp(inv(f, LOCK_L - 2, LOCK_L + 8)) }}>
      {pts.map((p, i) => {
        const delay = hash(i * 1.7) * 52, dur = 100 + hash(i * 2.9) * 20;
        const th0 = hash(i * 3.3) * TAU, r0 = 1000 + hash(i * 4.1) * 600;
        const tx = p.x * LW, ty = p.y * LH, rt = Math.hypot(tx, ty), tht = Math.atan2(ty, tx);
        const delta = norm(tht - th0) + TAU * (1 + (i % 3 === 0 ? 1 : 0));
        const at = (ff: number) => {
          const q = eOut3(inv(ff - delay, 0, dur));
          const r = lerp(r0, rt, q), th = th0 + delta * q;
          return [CX + Math.cos(th) * r, LY + Math.sin(th) * r];
        };
        const [x1, y1] = at(f), [x0, y0] = at(f - 2.5);
        const op = clamp(inv(f, delay, delay + 6));
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={p.red ? C.red : i % 6 === 0 ? C.ice : '#fff'} strokeWidth={i % 7 === 0 ? 4.8 : 3.8} strokeLinecap="round" opacity={op} />;
      })}
    </svg>
  ) : null;

  const logoIn = lock >= -2 ? clamp(inv(f, LOCK_L - 2, LOCK_L + 6)) : 0;
  const pop = spring({ frame: lock, fps: 60, config: { damping: 9, stiffness: 200, mass: 0.7 } });
  const glowP = inv(f, LOCK_L, LOCK_L + 44);
  const ringT = inv(f, LOCK_L, LOCK_L + 46), ring2 = inv(f, LOCK_L + 6, LOCK_L + 56);
  const m1 = eOutExpo(inv(f, LOCK_L + 30, LOCK_L + 50)), m2 = eOutExpo(inv(f, LOCK_L + 40, LOCK_L + 60));
  const desc = clamp(inv(f, LOCK_L + 50, LOCK_L + 70));
  const foot = clamp(inv(f, LOCK_L + 56, LOCK_L + 76));
  const star = spring({ frame: f - (LOCK_L + 66), fps: 60, config: { damping: 8, stiffness: 160, mass: 0.7 } });
  const gathering = f < LOCK_L;
  const missionStyle: React.CSSProperties = { position: 'absolute', left: 0, width: 1920, textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 78, lineHeight: '92px', color: '#fff', whiteSpace: 'pre', textShadow: '0 0 30px rgba(255,255,255,0.35)' };
  return (
    <Fill>
      <Bloom y={LY} size={1500} opacity={0.18 + 0.25 * eOut3(gather) * (gathering ? 1 : 0.4)} />
      <Fill style={{ transform: `translateY(${groupY}px) scale(${groupS})`, transformOrigin: `${CX}px ${LY}px` }}>
        {particles}
        {lock >= 0 && (
          <>
            <Bloom y={LY} size={1100} scale={lerp(0.5, 2.4, eOutExpo(glowP))} opacity={0.9 * (1 - glowP)} />
            <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              <circle cx={CX} cy={LY} r={120 + 1000 * eOutExpo(ringT)} fill="none" stroke="#fff" strokeWidth={8 * (1 - ringT) + 0.5} opacity={1 - ringT} style={{ filter: 'drop-shadow(0 0 14px #fff)' }} />
              <circle cx={CX} cy={LY} r={100 + 700 * eOutExpo(ring2)} fill="none" stroke={C.light} strokeWidth={4 * (1 - ring2) + 0.5} opacity={(1 - ring2) * 0.9} />
            </svg>
          </>
        )}
        <div style={{ position: 'absolute', left: CX - LW / 2, top: LY - LH / 2, width: LW, height: LH, opacity: logoIn, transform: `scale(${lock >= 0 ? 0.92 + 0.08 * pop : 1})`, filter: `drop-shadow(0 0 ${20 + 36 * (1 - glowP)}px rgba(255,255,255,${0.4 + 0.45 * (1 - glowP)}))` }}>
          <Img src={staticFile('logo-full.png')} style={{ width: LW, height: LH }} />
        </div>
      </Fill>
      {/* mission, wiped in line by line */}
      <div style={{ ...missionStyle, top: 570, clipPath: `inset(-10px ${(1 - m1) * 100}% -10px 0)`, opacity: lock >= 30 ? 1 : 0 }}>Create pathways for people</div>
      <div style={{ ...missionStyle, top: 664, clipPath: `inset(-10px ${(1 - m2) * 100}% -10px 0)`, opacity: lock >= 40 ? 1 : 0 }}>
        to flourish and thrive.
      </div>
      {star > 0 && (
        <svg width={80} height={80} viewBox="-40 -40 80 80" style={{ position: 'absolute', left: CX + 360, top: 668, overflow: 'visible', transform: `scale(${Math.max(0, star)}) rotate(${(1 - star) * 100}deg)`, filter: 'drop-shadow(0 0 12px #fff)' }}>
          <path d={starPath(30)} fill={C.red} />
        </svg>
      )}
      {m1 < 1 && lock >= 30 && <div style={{ position: 'absolute', left: CX - 520 + m1 * 1040 - 40, top: 566, width: 80, height: 100, background: 'linear-gradient(90deg, rgba(255,255,255,0), #fff 50%, rgba(255,255,255,0))', opacity: 0.8 * Math.sin(m1 * Math.PI) }} />}
      <div style={{ position: 'absolute', left: 0, top: 800, width: 1920, textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.12em', color: C.ice, opacity: desc, transform: `translateY(${(1 - desc) * 12}px)` }}>
        SUPPORT SERVICES & BUSINESS ENTERPRISES FOR PEOPLE WITH DISABILITIES
      </div>
      <div style={{ position: 'absolute', left: 0, top: 876, width: 1920, textAlign: 'center', fontFamily: F.mono, fontSize: 21, letterSpacing: '0.14em', color: C.light, opacity: foot, transform: `translateY(${(1 - foot) * 14}px)`, whiteSpace: 'pre' }}>
        MOTION REEL · 2026  <span style={{ color: '#fff' }}>|</span>  EVERY FRAME WRITTEN IN CODE  <span style={{ color: '#fff' }}>|</span>  <span style={{ color: '#fff' }}>THEKENNEDYCOLLECTIVE.ORG</span>
      </div>
    </Fill>
  );
};
