import type { Solid, Vec3 } from "./types.ts";

const CELL = 2;
const EPS = 1e-6;

function key(ix: number, iz: number) {
  return (ix + 1024) * 4096 + (iz + 1024);
}

/** Height of a solid's top surface over the footprint [lo, hi] on its ramp
 *  axis. Flat solids just return max y. Ramps return the highest point. */
export function topOver(s: Solid, minx: number, maxx: number, minz: number, maxz: number): number {
  const r = s.ramp;
  if (!r) return s.max[1];
  const a = r.axis;
  const smin = s.min[a], smax = s.max[a];
  const lo = Math.max(a === 0 ? minx : minz, smin);
  const hi = Math.min(a === 0 ? maxx : maxz, smax);
  const c = r.rise > 0 ? hi : lo;
  return rampHeight(s, c);
}

export function rampHeight(s: Solid, c: number): number {
  const r = s.ramp!;
  const a = r.axis;
  const len = s.max[a] - s.min[a];
  let t = r.rise > 0 ? (c - s.min[a]) / len : (s.max[a] - c) / len;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return r.low + t * (s.max[1] - r.low);
}

export interface RayHit {
  t: number;
  solid: Solid;
  normal: Vec3;
}

/** Static level geometry with a 2 m column grid for fast queries. */
export class World {
  readonly solids: Solid[];
  private grid = new Map<number, Solid[]>();
  private stamp = new Uint32Array(0);
  private stampId = 1;
  readonly bounds = { minx: Infinity, maxx: -Infinity, minz: Infinity, maxz: -Infinity, miny: Infinity, maxy: -Infinity };

  constructor(solids: Solid[]) {
    this.solids = solids;
    this.stamp = new Uint32Array(solids.length + 1);
    for (const s of solids) {
      const b = this.bounds;
      b.minx = Math.min(b.minx, s.min[0]); b.maxx = Math.max(b.maxx, s.max[0]);
      b.minz = Math.min(b.minz, s.min[2]); b.maxz = Math.max(b.maxz, s.max[2]);
      b.miny = Math.min(b.miny, s.min[1]); b.maxy = Math.max(b.maxy, s.max[1]);
      if (s.noCollide && s.noBullets) continue;
      const x0 = Math.floor(s.min[0] / CELL), x1 = Math.floor((s.max[0] - EPS) / CELL);
      const z0 = Math.floor(s.min[2] / CELL), z1 = Math.floor((s.max[2] - EPS) / CELL);
      for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
        const k = key(ix, iz);
        let list = this.grid.get(k);
        if (!list) this.grid.set(k, (list = []));
        list.push(s);
      }
    }
  }

  /** Collidable solids whose footprint touches the rectangle. */
  query(minx: number, minz: number, maxx: number, maxz: number, out: Solid[]): Solid[] {
    out.length = 0;
    const id = ++this.stampId;
    const x0 = Math.floor(minx / CELL), x1 = Math.floor(maxx / CELL);
    const z0 = Math.floor(minz / CELL), z1 = Math.floor(maxz / CELL);
    for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
      const list = this.grid.get(key(ix, iz));
      if (!list) continue;
      for (const s of list) {
        if (this.stamp[s.id] === id || s.noCollide) continue;
        this.stamp[s.id] = id;
        out.push(s);
      }
    }
    return out;
  }

  private tmp: Solid[] = [];

  /** Solids overlapping a player-sized box with feet at y. */
  overlaps(x: number, y: number, z: number, r: number, h: number, out: Solid[]): Solid[] {
    const minx = x - r, maxx = x + r, minz = z - r, maxz = z + r;
    const cands = this.query(minx, minz, maxx, maxz, this.tmp);
    out.length = 0;
    for (const s of cands) {
      if (minx >= s.max[0] - EPS || maxx <= s.min[0] + EPS) continue;
      if (minz >= s.max[2] - EPS || maxz <= s.min[2] + EPS) continue;
      if (y + h <= s.min[1] + EPS) continue;
      const top = topOver(s, minx, maxx, minz, maxz);
      if (y >= top - 1e-4) continue;
      out.push(s);
    }
    return out;
  }

  /** Highest walkable surface under a player footprint between y-maxDrop and y+0.01. */
  groundBelow(x: number, y: number, z: number, r: number, maxDrop: number): { y: number; solid: Solid } | null {
    const minx = x - r, maxx = x + r, minz = z - r, maxz = z + r;
    const cands = this.query(minx, minz, maxx, maxz, this.tmp);
    let best: Solid | null = null;
    let bestY = -Infinity;
    for (const s of cands) {
      if (minx >= s.max[0] - EPS || maxx <= s.min[0] + EPS) continue;
      if (minz >= s.max[2] - EPS || maxz <= s.min[2] + EPS) continue;
      const top = topOver(s, minx, maxx, minz, maxz);
      if (top > y + 0.01 || top < y - maxDrop) continue;
      if (top > bestY) { bestY = top; best = s; }
    }
    return best ? { y: bestY, solid: best } : null;
  }

  /** Nearest bullet-blocking hit along a ray, up to maxT. Walks the 2D grid
   *  so long shots across the atrium only test nearby columns. */
  raycast(o: Vec3, d: Vec3, maxT: number, forBullets = true): RayHit | null {
    const id = ++this.stampId;
    let best: RayHit | null = null;
    let bestT = maxT;
    let ix = Math.floor(o[0] / CELL), iz = Math.floor(o[2] / CELL);
    const stepX = d[0] > 0 ? 1 : -1, stepZ = d[2] > 0 ? 1 : -1;
    const tdx = Math.abs(d[0]) > 1e-9 ? CELL / Math.abs(d[0]) : Infinity;
    const tdz = Math.abs(d[2]) > 1e-9 ? CELL / Math.abs(d[2]) : Infinity;
    let tmx = Math.abs(d[0]) > 1e-9 ? ((d[0] > 0 ? (ix + 1) * CELL - o[0] : o[0] - ix * CELL) / Math.abs(d[0])) : Infinity;
    let tmz = Math.abs(d[2]) > 1e-9 ? ((d[2] > 0 ? (iz + 1) * CELL - o[2] : o[2] - iz * CELL) / Math.abs(d[2])) : Infinity;
    for (let guard = 0; guard < 512; guard++) {
      const list = this.grid.get(key(ix, iz));
      if (list) {
        for (const s of list) {
          if (this.stamp[s.id] === id) continue;
          this.stamp[s.id] = id;
          if (forBullets ? s.noBullets : s.noCollide) continue;
          const h = raySolid(o, d, s, bestT);
          if (h && h.t < bestT) { bestT = h.t; best = h; }
        }
      }
      const tNext = Math.min(tmx, tmz);
      if (best && best.t <= tNext) break;
      if (tNext > bestT || tNext === Infinity) break;
      if (tmx < tmz) { ix += stepX; tmx += tdx; } else { iz += stepZ; tmz += tdz; }
    }
    return best;
  }
}

/** Ray against a box, or a box clipped by a ramp's sloped top. */
export function raySolid(o: Vec3, d: Vec3, s: Solid, maxT: number): RayHit | null {
  let tmin = 0, tmax = maxT;
  let nAxis = -1, nSign = 0;
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-12) {
      if (o[a] < s.min[a] || o[a] > s.max[a]) return null;
      continue;
    }
    const inv = 1 / d[a];
    let t0 = (s.min[a] - o[a]) * inv, t1 = (s.max[a] - o[a]) * inv;
    let sign = -1;
    if (t0 > t1) { const tt = t0; t0 = t1; t1 = tt; sign = 1; }
    if (t0 > tmin) { tmin = t0; nAxis = a; nSign = sign; }
    if (t1 < tmax) tmax = t1;
    if (tmin > tmax) return null;
  }
  let normal: Vec3 = [0, 0, 0];
  if (nAxis >= 0) normal[nAxis] = nSign;
  const r = s.ramp;
  if (r) {
    // Plane: y <= low + slope * u, with u the distance from the low end.
    const a = r.axis;
    const len = s.max[a] - s.min[a];
    const slope = (s.max[1] - r.low) / len;
    // f(p) = y - low - slope*u(p); inside when f <= 0.
    const uo = r.rise > 0 ? o[a] - s.min[a] : s.max[a] - o[a];
    const ud = r.rise > 0 ? d[a] : -d[a];
    const fo = o[1] - r.low - slope * uo;
    const fd = d[1] - slope * ud;
    if (Math.abs(fd) < 1e-12) {
      if (fo > 0) return null;
    } else {
      const tp = -fo / fd;
      if (fd < 0) {
        // Entering the half-space at tp.
        if (tp > tmin) {
          tmin = tp;
          const nl = Math.hypot(1, slope);
          normal = [0, 1 / nl, 0];
          normal[a] = (r.rise > 0 ? -slope : slope) / nl;
        }
      } else if (tp < tmax) tmax = tp;
      if (tmin > tmax) return null;
    }
  }
  if (tmin <= 0 && nAxis < 0) return { t: 0, solid: s, normal };
  return { t: tmin, solid: s, normal };
}
