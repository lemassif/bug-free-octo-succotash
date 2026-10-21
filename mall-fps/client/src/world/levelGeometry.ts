// Turns map solids into per-material triangle lists. Pure TypeScript, no
// three.js, so the lighting bake tool can run it in Node and produce vertex
// colors that line up exactly with what the browser builds.
import type { MapData, MatId, Solid, Vec3 } from "@bfb/shared";
import { MATS } from "./materials.ts";

export interface GeoBuffers {
  pos: number[];
  nrm: number[];
  uv: number[];
  idx: number[];
}

const CELL = 1.5;

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function len(a: Vec3) {
  return Math.hypot(a[0], a[1], a[2]);
}

function emitQuad(buf: GeoBuffers, q: Vec3[], n: Vec3, scale: number) {
  let [a, b, c, d] = q;
  if (cross(sub(b, a), sub(c, a)).reduce((s, v, i) => s + v * n[i], 0) < 0) [a, b, c, d] = [a, d, c, b];
  const nu = Math.max(1, Math.ceil(Math.max(len(sub(b, a)), len(sub(c, d))) / CELL));
  const nv = Math.max(1, Math.ceil(Math.max(len(sub(d, a)), len(sub(c, b))) / CELL));
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  const base = buf.pos.length / 3;
  for (let j = 0; j <= nv; j++) {
    const v = j / nv;
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const p: Vec3 = [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        const top = a[k] + (b[k] - a[k]) * u;
        const bot = d[k] + (c[k] - d[k]) * u;
        p[k] = top + (bot - top) * v;
      }
      buf.pos.push(p[0], p[1], p[2]);
      buf.nrm.push(n[0], n[1], n[2]);
      if (ay >= ax && ay >= az) buf.uv.push(p[0] / scale, p[2] / scale);
      else if (ax >= az) buf.uv.push(p[2] / scale, p[1] / scale);
      else buf.uv.push(p[0] / scale, p[1] / scale);
    }
  }
  const row = nu + 1;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const i0 = base + j * row + i;
    buf.idx.push(i0, i0 + 1, i0 + row + 1, i0, i0 + row + 1, i0 + row);
  }
}

interface SkipRules {
  bounds: { minx: number; maxx: number; minz: number; maxz: number; miny: number };
  floors: number[];
}

function emitBox(buf: GeoBuffers, mn: Vec3, mx: Vec3, scale: number, skip: SkipRules) {
  const [x0, y0, z0] = mn, [x1, y1, z1] = mx;
  const b = skip.bounds;
  const e = 1e-3;
  if (y1 - y0 > e) {
    if (x1 < b.maxx - e) emitQuad(buf, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], scale);
    if (x0 > b.minx + e) emitQuad(buf, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], scale);
    if (z1 < b.maxz - e) emitQuad(buf, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], scale);
    if (z0 > b.minz + e) emitQuad(buf, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], scale);
  }
  emitQuad(buf, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], scale);
  const onFloor = skip.floors.some((f) => Math.abs(f - y0) < e) || y0 <= b.miny + e;
  if (!onFloor) emitQuad(buf, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0], scale);
}

/** Point on a ramp solid: u in [0,1] from low end to high end, w across. */
function rampPoint(s: Solid, u: number, w: number, y: number): Vec3 {
  const r = s.ramp!;
  const a = r.axis, o = a === 0 ? 2 : 0;
  const p: Vec3 = [0, y, 0];
  p[a] = r.rise > 0 ? s.min[a] + (s.max[a] - s.min[a]) * u : s.max[a] - (s.max[a] - s.min[a]) * u;
  p[o] = s.min[o] + (s.max[o] - s.min[o]) * w;
  return p;
}

function emitRamp(buf: GeoBuffers, s: Solid, scale: number, skip: SkipRules) {
  const r = s.ramp!;
  const a = r.axis, o = a === 0 ? 2 : 0;
  const lo = r.low, hi = s.max[1], base = s.min[1];
  if (s.steps) {
    // Visual stairs: a stack of boxes stepping up along the ramp.
    const n = s.steps;
    for (let i = 0; i < n; i++) {
      const u0 = i / n, u1 = (i + 1) / n;
      const top = lo + (hi - lo) * u1;
      const p0 = rampPoint(s, u0, 0, base), p1 = rampPoint(s, u1, 1, top);
      emitBox(buf, [Math.min(p0[0], p1[0]), base, Math.min(p0[2], p1[2])], [Math.max(p0[0], p1[0]), top, Math.max(p0[2], p1[2])], scale, skip);
    }
    return;
  }
  const L = len(sub(rampPoint(s, 1, 0, hi), rampPoint(s, 0, 0, lo)));
  const slope = (hi - lo) / (s.max[a] - s.min[a]);
  const n: Vec3 = [0, 1, 0];
  n[a] = r.rise > 0 ? -slope : slope;
  const nl = Math.hypot(n[0], n[1], n[2]);
  void L;
  emitQuad(buf, [rampPoint(s, 0, 0, lo), rampPoint(s, 1, 0, hi), rampPoint(s, 1, 1, hi), rampPoint(s, 0, 1, lo)], [n[0] / nl, n[1] / nl, n[2] / nl], scale);
  // High end.
  const nh: Vec3 = [0, 0, 0];
  nh[a] = r.rise;
  emitQuad(buf, [rampPoint(s, 1, 0, base), rampPoint(s, 1, 1, base), rampPoint(s, 1, 1, hi), rampPoint(s, 1, 0, hi)], nh, scale);
  if (lo - base > 1e-3) {
    const nlo: Vec3 = [0, 0, 0];
    nlo[a] = -r.rise;
    emitQuad(buf, [rampPoint(s, 0, 0, base), rampPoint(s, 0, 1, base), rampPoint(s, 0, 1, lo), rampPoint(s, 0, 0, lo)], nlo, scale);
  }
  // Two trapezoid sides.
  for (const w of [0, 1]) {
    const ns: Vec3 = [0, 0, 0];
    ns[o] = w === 0 ? -1 : 1;
    emitQuad(buf, [rampPoint(s, 0, w, base), rampPoint(s, 1, w, base), rampPoint(s, 1, w, hi), rampPoint(s, 0, w, lo)], ns, scale);
  }
}

export function buildLevelGeometry(map: MapData): Map<MatId, GeoBuffers> {
  const out = new Map<MatId, GeoBuffers>();
  const bounds = { minx: Infinity, maxx: -Infinity, minz: Infinity, maxz: -Infinity, miny: Infinity };
  for (const s of map.solids) {
    bounds.minx = Math.min(bounds.minx, s.min[0]); bounds.maxx = Math.max(bounds.maxx, s.max[0]);
    bounds.minz = Math.min(bounds.minz, s.min[2]); bounds.maxz = Math.max(bounds.maxz, s.max[2]);
    bounds.miny = Math.min(bounds.miny, s.min[1]);
  }
  const skip: SkipRules = { bounds, floors: map.floors };
  for (const s of map.solids) {
    if (s.noRender) continue;
    let buf = out.get(s.mat);
    if (!buf) out.set(s.mat, (buf = { pos: [], nrm: [], uv: [], idx: [] }));
    const scale = MATS[s.mat].scale;
    if (s.ramp) emitRamp(buf, s, scale, skip);
    else emitBox(buf, s.min, s.max, scale, skip);
  }
  return out;
}

/** Cheap stand-in lighting used until the baked file loads. */
export function fakeLight(p: Vec3, n: Vec3): Vec3 {
  const sun = 0.6 + 0.25 * n[1] + 0.1 * n[0] + 0.05 * n[2];
  const h = 0.85 + Math.min(0.15, p[1] * 0.02);
  return [sun * h, sun * h, sun * h * 0.97];
}
