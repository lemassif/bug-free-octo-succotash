// Generates a stand-in public/logo-mark.png (white "A" + 4-point sparkle, transparent).
// Replace public/logo-mark.png with the real mark any time; the reel reads pixels from it at render time.
import fs from 'fs';
import zlib from 'zlib';
const S = 512, SS = 4;
const seg = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const inside = (x, y) => {
  if (seg(x, y, 78, 448, 214, 118) < 29) return true;
  if (seg(x, y, 214, 118, 350, 448) < 29) return true;
  if (seg(x, y, 140, 330, 290, 330) < 22) return true;
  const sx = Math.abs(x - 410), sy = Math.abs(y - 112);
  return Math.pow(sx, 0.62) + Math.pow(sy, 0.62) <= Math.pow(92, 0.62);
};
const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  for (let x = 0; x < S; x++) {
    let c = 0;
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) if (inside(x + (i + 0.5) / SS, y + (j + 0.5) / SS)) c++;
    const o = y * (S * 4 + 1) + 1 + x * 4;
    raw[o] = raw[o + 1] = raw[o + 2] = 255;
    raw[o + 3] = Math.round((255 * c) / (SS * SS));
  }
}
const png = (w, h, data, color) => {
  const chunk = (t, d) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t), d]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = color;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(data, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/logo-mark.png', png(S, S, raw, 6));

// 256x256 film-grain tile (pre-made noise texture, shifted each frame in the comp)
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const G = 256, g = Buffer.alloc((G * 4 + 1) * G);
for (let y = 0; y < G; y++) {
  g[y * (G * 4 + 1)] = 0;
  for (let x = 0; x < G; x++) {
    const v = Math.round(rnd() * 255), o = y * (G * 4 + 1) + 1 + x * 4;
    g[o] = g[o + 1] = g[o + 2] = v; g[o + 3] = 255;
  }
}
fs.writeFileSync('public/grain.png', png(G, G, g, 6));
console.log('wrote public/logo-mark.png and public/grain.png');
