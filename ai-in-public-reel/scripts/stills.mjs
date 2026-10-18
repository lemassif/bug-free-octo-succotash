// Bundle once, render still PNGs for a list of frames: node scripts/stills.mjs outDir f1 f2 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({ serveUrl, id: 'Reel', browserExecutable });
for (const f of frames) {
  await renderStill({ composition, serveUrl, frame: +f, output: path.join(outDir, `f${String(f).padStart(4, '0')}.png`), browserExecutable, scale: 0.5 });
  console.log('frame', f);
}
