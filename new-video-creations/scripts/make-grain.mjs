// Generates public/grain.png: a 256x256 film-grain tile, shifted each frame in the comp.
import fs from 'fs';
import zlib from 'zlib';
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
console.log('wrote public/grain.png');
