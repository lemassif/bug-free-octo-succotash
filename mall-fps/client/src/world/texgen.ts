// Procedural textures, generated as raw RGBA so the same code feeds the
// KTX2 compression tool at build time and the runtime fallback.
import type { TexId } from "./materials.ts";

export const TEX_SIZE = 256;

function hash(x: number, y: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function noise(x: number, y: number, period: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const p = (a: number) => ((a % period) + period) % period;
  const a = hash(p(xi), p(yi), s), b = hash(p(xi + 1), p(yi), s);
  const c = hash(p(xi), p(yi + 1), s), d = hash(p(xi + 1), p(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, base: number, s: number) {
  let v = 0, amp = 0.5, f = base;
  for (let o = 0; o < 4; o++) {
    v += amp * noise((x * f) / TEX_SIZE, (y * f) / TEX_SIZE, f, s + o);
    amp *= 0.5;
    f *= 2;
  }
  return v;
}

/** Grayscale-ish detail maps. Color comes from per-material vertex tint. */
export function generateTexture(id: TexId): Uint8Array {
  const N = TEX_SIZE;
  const out = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let r = 1, g = 1, b = 1;
    switch (id) {
      case "tile": {
        // 2x2 polished tiles with grout and faint marble veins.
        const gx = x % 128, gy = y % 128;
        const grout = gx < 3 || gy < 3;
        const vein = Math.abs(Math.sin((x + fbm(x, y, 4, 1) * 120) * 0.05)) < 0.04 ? 0.85 : 1;
        const n = 0.92 + fbm(x, y, 8, 2) * 0.12;
        const alt = (Math.floor(x / 128) + Math.floor(y / 128)) % 2 ? 0.94 : 1;
        r = g = b = grout ? 0.55 : n * vein * alt;
        break;
      }
      case "plaster": {
        const n = 0.88 + fbm(x, y, 16, 3) * 0.14;
        r = g = b = n;
        break;
      }
      case "carpet": {
        const n = 0.7 + fbm(x, y, 32, 4) * 0.25 + hash(x, y, 9) * 0.1;
        const diamond = (Math.abs((x % 64) - 32) + Math.abs((y % 64) - 32)) < 6 ? 1.25 : 1;
        r = g = b = n * diamond;
        break;
      }
      case "wood": {
        const grain = 0.75 + 0.2 * Math.sin((y + fbm(x, y, 4, 5) * 60) * 0.25) + fbm(x, y, 16, 6) * 0.1;
        const plank = y % 64 < 2 ? 0.6 : 1;
        r = grain * plank; g = grain * plank * 0.95; b = grain * plank * 0.9;
        break;
      }
      case "metal": {
        const n = 0.85 + fbm(x, y, 64, 7) * 0.06 + (hash(x, Math.floor(y / 2), 8) - 0.5) * 0.05;
        r = g = b = n;
        break;
      }
      case "ceiling": {
        const gx = x % 128, gy = y % 128;
        const edge = gx < 4 || gy < 4 ? 0.7 : 1;
        r = g = b = (0.9 + hash(x, y, 10) * 0.08) * edge;
        break;
      }
      case "steps": {
        const groove = x % 16 < 3 ? 0.55 : 1;
        r = g = b = (0.85 + fbm(x, y, 32, 11) * 0.1) * groove;
        break;
      }
      case "concrete": {
        r = g = b = 0.75 + fbm(x, y, 16, 12) * 0.3;
        break;
      }
      case "grate": {
        const bar = x % 32 < 6 || y % 32 < 6;
        r = g = b = bar ? 0.9 : 0.35;
        break;
      }
    }
    const i = (y * N + x) * 4;
    out[i] = Math.min(255, r * 255);
    out[i + 1] = Math.min(255, g * 255);
    out[i + 2] = Math.min(255, b * 255);
    out[i + 3] = 255;
  }
  return out;
}
