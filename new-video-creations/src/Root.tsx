import React, { useEffect, useState } from 'react';
import { Composition, continueRender, delayRender, staticFile } from 'remotion';
import { Reel } from './Reel';
import { FPS, TOTAL } from './timing.js';

const FONTS: [string, string, string][] = [
  ['Barlow Condensed', 'fonts/barlow-900.ttf', '900'],
  ['Sofia Sans', 'fonts/sofia-400.ttf', '400'],
  ['Sofia Sans', 'fonts/sofia-700.ttf', '700'],
  ['JetBrains Mono', 'fonts/jbmono.ttf', '400'],
  ['JetBrains Mono', 'fonts/jbmono-bold.ttf', '700'],
];

const FontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) => {
        const ff = new FontFace(family, `url(${staticFile(file)})`, { weight, style: 'normal' });
        return ff.load().then((f) => document.fonts.add(f));
      }),
    ).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready ? <>{children}</> : null;
};

const Wrapped: React.FC = () => (
  <FontLoader>
    <Reel />
  </FontLoader>
);

export const Root: React.FC = () => (
  <Composition id="Reel" component={Wrapped} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
