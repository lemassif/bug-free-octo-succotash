// Bakes lighting into per-vertex colors for the mall and per-instance colors
// for props. Runs at build time (npm run bake) and is skipped when the map
// has not changed since the last bake.
//
// Light model: sky through the skylight (with soft occlusion), a sun shaft,
// every ceiling light with ray-traced shadows, and a little ambient.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { World, buildMall, type MatId, type Vec3 } from "../../shared/src/index.ts";
import { buildLevelGeometry } from "../src/world/levelGeometry.ts";
import { MATS } from "../src/world/materials.ts";

const VERSION = 3;
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "../public/baked");
const map = buildMall();
const hash = crypto.createHash("sha1").update(JSON.stringify([VERSION, map.solids, map.lights, map.props, map.skyHoles])).digest("hex").slice(0, 16);
const manifestPath = path.join(outDir, "mall.json");
if (fs.existsSync(manifestPath) && !process.argv.includes("--force")) {
  const old = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (old.hash === hash && fs.existsSync(path.join(outDir, "mall.bin"))) {
    console.log(`bake: up to date (${hash})`);
    process.exit(0);
  }
}

const t0 = Date.now();
// Glass does not cast shadows, so the skylight lets the sky in.
const world = new World(map.solids.filter((s) => !MATS[s.mat].transparent));

const SKY: Vec3 = [0.62, 0.74, 0.95];
const SKY_GAIN = 1.5;
const SUN_DIR = norm([0.35, 1, 0.25]);
const SUN: Vec3 = [1.0, 0.9, 0.74];
const SUN_GAIN = 1.25;
const AMBIENT = 0.2;
const N_RAYS = 32;

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

// Cosine-weighted hemisphere directions (Hammersley), z is up.
const hemi: Vec3[] = [];
for (let i = 0; i < N_RAYS; i++) {
  let bits = i;
  bits = ((bits << 16) | (bits >>> 16)) >>> 0;
  bits = (((bits & 0x55555555) << 1) | ((bits & 0xaaaaaaaa) >>> 1)) >>> 0;
  bits = (((bits & 0x33333333) << 2) | ((bits & 0xcccccccc) >>> 2)) >>> 0;
  bits = (((bits & 0x0f0f0f0f) << 4) | ((bits & 0xf0f0f0f0) >>> 4)) >>> 0;
  bits = (((bits & 0x00ff00ff) << 8) | ((bits & 0xff00ff00) >>> 8)) >>> 0;
  const u = (i + 0.5) / N_RAYS, v = bits / 4294967296;
  const r = Math.sqrt(u), phi = 2 * Math.PI * v;
  hemi.push([r * Math.cos(phi), r * Math.sin(phi), Math.sqrt(1 - u)]);
}

function basis(n: Vec3): [Vec3, Vec3] {
  const a: Vec3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const t = norm([a[1] * n[2] - a[2] * n[1], a[2] * n[0] - a[0] * n[2], a[0] * n[1] - a[1] * n[0]]);
  const b: Vec3 = [n[1] * t[2] - n[2] * t[1], n[2] * t[0] - n[0] * t[2], n[0] * t[1] - n[1] * t[0]];
  return [t, b];
}

/** Incoming light at a point. n = null samples all directions (props). */
function shade(p: Vec3, n: Vec3 | null): Vec3 {
  const nn: Vec3 = n ?? [0, 1, 0];
  const o: Vec3 = [p[0] + nn[0] * 0.04, p[1] + nn[1] * 0.04, p[2] + nn[2] * 0.04];
  const c: Vec3 = [0, 0, 0];
  // Sky and ambient occlusion from one set of hemisphere rays.
  const [t, b] = basis(nn);
  let skyHits = 0, near = 0;
  for (const h of hemi) {
    const d: Vec3 = [
      t[0] * h[0] + b[0] * h[1] + nn[0] * h[2],
      t[1] * h[0] + b[1] * h[1] + nn[1] * h[2],
      t[2] * h[0] + b[2] * h[1] + nn[2] * h[2],
    ];
    const hit = world.raycast(o, d, 60, false);
    if (!hit) { if (d[1] > 0) skyHits++; }
    else if (hit.t < 1.2) near++;
  }
  const sky = (skyHits / N_RAYS) * SKY_GAIN;
  const ao = 1 - 0.65 * (near / N_RAYS);
  for (let k = 0; k < 3; k++) c[k] += SKY[k] * sky + AMBIENT * ao;
  // Sun shaft through the skylight.
  const ndl = n ? n[0] * SUN_DIR[0] + n[1] * SUN_DIR[1] + n[2] * SUN_DIR[2] : 0.6;
  if (ndl > 0 && !world.raycast(o, SUN_DIR, 80, false)) for (let k = 0; k < 3; k++) c[k] += SUN[k] * ndl * SUN_GAIN;
  // Ceiling lights.
  for (const l of map.lights) {
    const L: Vec3 = [l.p[0] - o[0], l.p[1] - o[1], l.p[2] - o[2]];
    const dist = Math.hypot(L[0], L[1], L[2]);
    if (dist > l.radius) continue;
    const ld: Vec3 = [L[0] / dist, L[1] / dist, L[2] / dist];
    const ndl2 = n ? n[0] * ld[0] + n[1] * ld[1] + n[2] * ld[2] : 0.7;
    if (ndl2 <= 0) continue;
    const hit = world.raycast(o, ld, dist - 0.15, false);
    if (hit) continue;
    const f = 1 - dist / l.radius;
    const att = f * f * 1.35 * l.intensity * ndl2;
    for (let k = 0; k < 3; k++) c[k] += l.color[k] * att;
  }
  // Gentle shoulder so bright spots do not clip.
  for (let k = 0; k < 3; k++) c[k] = c[k] / (1 + c[k] * 0.18);
  return c;
}

const geos = buildLevelGeometry(map);
const mats = [...geos.keys()].sort() as MatId[];
const chunks: Uint8Array[] = [];
const manifest = { version: VERSION, hash, mats: [] as { mat: MatId; offset: number; count: number }[], props: { offset: 0, count: 0 } };
let offset = 0;
let verts = 0;
for (const mat of mats) {
  const g = geos.get(mat)!;
  const n = g.pos.length / 3;
  verts += n;
  const out = new Uint8Array(n * 3);
  if (MATS[mat].transparent) out.fill(128);
  else for (let i = 0; i < n; i++) {
    const c = shade([g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]], [g.nrm[i * 3], g.nrm[i * 3 + 1], g.nrm[i * 3 + 2]]);
    out[i * 3] = Math.min(255, Math.round(c[0] * 128));
    out[i * 3 + 1] = Math.min(255, Math.round(c[1] * 128));
    out[i * 3 + 2] = Math.min(255, Math.round(c[2] * 128));
  }
  manifest.mats.push({ mat, offset, count: n });
  chunks.push(out);
  offset += out.length;
}
const props = new Uint8Array(map.props.length * 3);
map.props.forEach((p, i) => {
  const c = shade([p.x, p.y + 1.0, p.z], null);
  for (let k = 0; k < 3; k++) props[i * 3 + k] = Math.min(255, Math.round(c[k] * 128));
});
manifest.props = { offset, count: map.props.length };
chunks.push(props);

fs.mkdirSync(outDir, { recursive: true });
const bin = Buffer.concat(chunks.map((c) => Buffer.from(c.buffer, c.byteOffset, c.byteLength)));
fs.writeFileSync(path.join(outDir, "mall.bin"), bin);
fs.writeFileSync(manifestPath, JSON.stringify(manifest));
console.log(`bake: ${verts} vertices, ${map.props.length} props, ${(bin.length / 1024).toFixed(0)} KB in ${((Date.now() - t0) / 1000).toFixed(1)} s (${hash})`);
