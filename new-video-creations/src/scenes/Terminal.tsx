import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { LOG_TEXT, PROMPT_PREFIX, TERM, TYPED, typeFrames } from '../timing.js';
import { Bloom, C, CX, CY, F, Fill, clamp, eOut3, eOutExpo, inv, lerp } from '../lib';

const FRAMES = typeFrames();
const CELLS = 30;

export const Terminal: React.FC = () => {
  const f = useCurrentFrame();
  const win = spring({ frame: f, fps: 60, config: { damping: 15, stiffness: 90, mass: 0.9 } });
  const typed = FRAMES.filter((x) => x <= f).length;
  const typing = f < TERM.enter;
  const cursorOn = typing ? true : Math.floor(f / 18) % 2 === 0 && f < TERM.shipped + 30;
  const bar = inv(f, TERM.barStart, TERM.barEnd);
  const filled = Math.floor(eOut3(bar) * CELLS + 0.0001);
  const pct = Math.round(eOut3(bar) * 100);
  const ship = spring({ frame: f - TERM.shipped, fps: 60, config: { damping: 11, stiffness: 150, mass: 0.8 } });
  const sy = Math.sin(f / 38) * 9, ry = Math.sin(f / 70) * 4.5, rx = 5 + Math.sin(f / 55) * 1.8;
  const line: React.CSSProperties = { fontFamily: F.mono, fontSize: 27, lineHeight: '42px', color: '#fff', whiteSpace: 'pre' };
  const gridScroll = (f * 3.2) % 120;
  return (
    <Fill>
      {/* scrolling white grid floor in perspective */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 38%, transparent 82%)', maskImage: 'linear-gradient(to top, #000 0%, #000 38%, transparent 82%)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, perspective: 800, perspectiveOrigin: '50% 38%' }}>
          <div style={{ position: 'absolute', left: -1500, top: 560, width: 4920, height: 3600, transformOrigin: '50% 0', transform: 'rotateX(72deg)' }}>
            <div style={{ position: 'absolute', left: 0, top: -120, width: 4920, height: 3720, transform: `translateY(${gridScroll}px)`, backgroundImage: 'linear-gradient(rgba(255,255,255,0.55) 3px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,0.55) 3px, transparent 3px)', backgroundSize: '120px 120px' }} />
          </div>
        </div>
      </div>
      <Bloom y={CY + 30} size={1600} opacity={0.2} />
      {/* floating terminal */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, perspective: 2200 }}>
        <div style={{ position: 'absolute', left: CX - 620, top: 220, width: 1240, height: 600, transform: `translateY(${(1 - win) * 260 + sy}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${0.82 + 0.18 * win})`, opacity: clamp(win * 3), filter: 'drop-shadow(0 0 38px rgba(255,255,255,0.5))' }}>
          <div style={{ position: 'absolute', inset: 0, background: C.navy, borderRadius: 22, border: '2px solid rgba(255,255,255,0.55)', overflow: 'hidden' }}>
            <div style={{ height: 58, borderBottom: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12 }}>
              {['#fff', C.ice, C.light].map((c, i) => <div key={i} style={{ width: 15, height: 15, borderRadius: '50%', background: c }} />)}
              <div style={{ marginLeft: 18, fontFamily: F.mono, fontSize: 17, letterSpacing: '0.16em', color: C.light }}>collective ~ zsh</div>
            </div>
            <div style={{ padding: '24px 40px' }}>
              <div style={line}>
                <span style={{ color: C.light }}>{PROMPT_PREFIX}</span>{TYPED.slice(0, typed)}
                <span style={{ opacity: cursorOn ? 1 : 0, color: '#fff' }}>█</span>
              </div>
              {LOG_TEXT.map((t, i) => {
                const at = TERM.logs[i];
                if (f < at) return <div key={i} style={line}> </div>;
                const e = eOutExpo(inv(f, at, at + 10));
                const done = f >= at + 9;
                return (
                  <div key={i} style={{ ...line, color: C.ice, opacity: e, transform: `translateX(${(1 - e) * -24}px)` }}>
                    {'  ◆ '}{t}{done ? <span style={{ color: '#fff' }}>{' ·········· ✓'}</span> : '…'}
                  </div>
                );
              })}
              <div style={{ ...line, marginTop: 6, opacity: clamp(inv(f, TERM.barStart - 2, TERM.barStart + 4)) }}>
                <span style={{ color: C.light }}>{'  ['}</span>
                <span style={{ color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>{'█'.repeat(filled)}</span>
                <span style={{ color: 'rgba(201,202,255,0.28)' }}>{'░'.repeat(CELLS - filled)}</span>
                <span style={{ color: C.light }}>{'] '}</span>{String(pct).padStart(3, ' ')}%
              </div>
              <div style={{ fontFamily: F.head, fontSize: 128, lineHeight: '130px', color: '#fff', marginTop: 4, transformOrigin: '0 60%', transform: `scale(${0.6 + 0.4 * ship})`, opacity: clamp(ship * 4), textShadow: '0 0 28px rgba(255,255,255,0.75)', whiteSpace: 'pre' }}>
                ✓ shipped. together.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fill>
  );
};
