import React from 'react';
import { spring, useCurrentFrame } from 'remotion';
import { KINETIC } from '../timing.js';
import { Bloom, C, F, Fill, MB, clamp, eInExpo, eOutExpo, inv } from '../lib';

const SIZE = 340;

const Word: React.FC<{ word: string; idx: number; f: number }> = ({ word, idx, f }) => {
  const t0 = idx * KINETIC.step;
  const local = f - t0;
  const last = idx === KINETIC.words.length - 1;
  const exit = last ? 0 : inv(local, KINETIC.step - 4, KINETIC.step + 2);
  if (local < 0 || exit >= 1) return null;
  const amp = 1 + idx * 0.12;
  const chars = (word + '.').split('');
  const mk = (stroke: boolean, dy: number, op: number) => (
    <div style={{ position: 'absolute', left: 0, top: 370 + dy, width: 1920, display: 'flex', justifyContent: 'center', fontFamily: F.head, fontSize: SIZE, lineHeight: 1, opacity: op * (1 - eInExpo(exit)), transform: `scale(${1 + 0.35 * eInExpo(exit)})`, whiteSpace: 'pre' }}>
      {chars.map((ch, i) => {
        const s = spring({ frame: local - i * 1.4, fps: 60, config: { damping: 10, stiffness: 190, mass: 0.7 } });
        const isDot = i === chars.length - 1;
        const col = isDot ? C.red : '#fff';
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `translateY(${(1 - s) * 260 * amp}px) scale(${0.7 + 0.3 * s}) skewX(${(1 - s) * -16}deg)`,
            opacity: clamp(s * 4),
            color: stroke ? 'transparent' : col,
            WebkitTextStroke: stroke ? `3px ${isDot ? C.red : C.light}` : undefined,
            textShadow: stroke ? undefined : isDot ? undefined : '0 0 40px rgba(255,255,255,0.45)',
          }}>{ch}</span>
        );
      })}
    </div>
  );
  return (
    <>
      {mk(true, -520, 0.16)}{mk(true, -265, 0.34)}
      {mk(true, 265, 0.34)}{mk(true, 520, 0.16)}
      <MB on={local < 14} angle={240}>{mk(false, 0, 1)}</MB>
      <Bloom size={1500} opacity={0.5 * (1 - eOutExpo(inv(local, 0, 14)))} />
    </>
  );
};

export const Kinetic: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.min(KINETIC.words.length - 1, Math.floor(f / KINETIC.step));
  return (
    <Fill>
      {/* clip echoes to the 72px safe margin */}
      <div style={{ position: 'absolute', left: 72, top: 72, width: 1776, height: 936, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -72, top: -72, width: 1920, height: 1080 }}>
          {KINETIC.words.map((w, i) => <Word key={w} word={w} idx={i} f={f} />)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 128, top: 160, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.3em', color: '#fff' }}>
        {String(n + 1).padStart(2, '0')} / 04
      </div>
    </Fill>
  );
};
