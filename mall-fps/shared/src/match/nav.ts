// Navigation grid for bots, generated from the collision world, so it
// always matches the map. Nodes sit on walkable surfaces every 1.5 m and
// link to neighbors a player could actually walk to.

import { PLAYER } from "../constants.ts";
import type { Solid } from "../types.ts";
import { World, topOver } from "../world.ts";

const STEP = 1.5;
const R = 0.4;

export interface NavNode {
  i: number;
  x: number;
  y: number;
  z: number;
  links: number[];
}

export class NavGrid {
  readonly nodes: NavNode[] = [];
  private cells = new Map<number, number[]>();
  private minx: number;
  private minz: number;
  private tmp: Solid[] = [];
  private world: World;

  constructor(world: World) {
    this.world = world;
    const b = world.bounds;
    this.minx = b.minx;
    this.minz = b.minz;
    const nx = Math.floor((b.maxx - b.minx) / STEP);
    const nz = Math.floor((b.maxz - b.minz) / STEP);
    for (let ix = 0; ix <= nx; ix++) for (let iz = 0; iz <= nz; iz++) {
      const x = b.minx + ix * STEP + 0.25, z = b.minz + iz * STEP + 0.25;
      for (const y of this.surfaces(x, z)) this.addNode(x, y, z);
    }
    // Escalator and stair lanes are narrower than the grid spacing, so they
    // get their own nodes along the middle of each lane.
    for (const s of world.solids) {
      if (!s.ramp || s.noCollide || s.noBullets) continue;
      const a = s.ramp.axis, o = a === 0 ? 2 : 0;
      if (s.max[o] - s.min[o] < 0.9) continue;
      const mid = (s.min[o] + s.max[o]) / 2;
      for (let u = s.min[a] + 0.4; u <= s.max[a] - 0.4; u += 1.0) {
        const x = a === 0 ? u : mid, z = a === 0 ? mid : u;
        const top = topOver(s, x - 0.3, x + 0.3, z - 0.3, z + 0.3);
        if (world.overlaps(x, top + 0.02, z, 0.3, PLAYER.height, this.tmp).length) continue;
        this.addNode(x, top, z);
      }
    }
    for (const n of this.nodes) {
      const ix = Math.round((n.x - 0.25 - this.minx) / STEP), iz = Math.round((n.z - 0.25 - this.minz) / STEP);
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
        for (const j of this.cells.get((ix + dx) * 10000 + iz + dz) ?? []) {
          const m = this.nodes[j];
          if (j === n.i || Math.abs(m.y - n.y) > 1.3) continue;
          // Grid neighbors and the short hops between ramp lanes and floors.
          if (Math.hypot(m.x - n.x, m.z - n.z) > 2.5) continue;
          if (this.walkable(n, m)) n.links.push(j);
        }
      }
    }
  }

  private cellKey(x: number, z: number) {
    return Math.round((x - 0.25 - this.minx) / STEP) * 10000 + Math.round((z - 0.25 - this.minz) / STEP);
  }

  private addNode(x: number, y: number, z: number) {
    const n: NavNode = { i: this.nodes.length, x, y, z, links: [] };
    this.nodes.push(n);
    const k = this.cellKey(x, z);
    let list = this.cells.get(k);
    if (!list) this.cells.set(k, (list = []));
    list.push(n.i);
  }

  /** Standable heights at (x, z), lowest first. */
  private surfaces(x: number, z: number): number[] {
    const out: number[] = [];
    const cands = this.world.query(x - R, z - R, x + R, z + R, this.tmp).slice();
    for (const s of cands) {
      if (x - R < s.min[0] || x + R > s.max[0] || z - R < s.min[2] || z + R > s.max[2]) continue;
      const top = topOver(s, x - R, x + R, z - R, z + R);
      if (top > 9.5 || out.some((y) => Math.abs(y - top) < 0.3)) continue;
      if (this.world.overlaps(x, top + 0.02, z, R, PLAYER.height, this.tmp).length) continue;
      out.push(top);
    }
    return out.sort((a, b) => a - b);
  }

  /** Samples the straight line between two nodes. */
  private walkable(a: NavNode, b: NavNode): boolean {
    const d = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.ceil(d / 0.3);
    let y = a.y;
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      const g = this.world.groundBelow(x, y + PLAYER.step, z, 0.3, PLAYER.step + 0.6);
      if (!g) return false;
      if (Math.abs(g.y - y) > PLAYER.step) return false;
      y = g.y;
      if (this.world.overlaps(x, y + 0.02, z, 0.3, PLAYER.height, this.tmp).length) return false;
    }
    return Math.abs(y - b.y) < 0.6;
  }

  nearest(x: number, y: number, z: number): number {
    const ix = Math.round((x - 0.25 - this.minx) / STEP), iz = Math.round((z - 0.25 - this.minz) / STEP);
    let best = -1, bestD = Infinity;
    for (let r = 0; r <= 2 && best < 0; r++) {
      for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
        for (const j of this.cells.get((ix + dx) * 10000 + iz + dz) ?? []) {
          const m = this.nodes[j];
          const d = Math.hypot(m.x - x, (m.y - y) * 3, m.z - z);
          if (d < bestD && m.links.length) { bestD = d; best = j; }
        }
      }
    }
    return best;
  }

  /** A* over the grid. Returns node indices from start to goal, or []. */
  path(from: number, to: number, maxIter = 6000): number[] {
    if (from < 0 || to < 0) return [];
    const open = new Map<number, number>();
    const g = new Map<number, number>([[from, 0]]);
    const came = new Map<number, number>();
    const goal = this.nodes[to];
    const h = (i: number) => {
      const n = this.nodes[i];
      return Math.hypot(n.x - goal.x, (n.y - goal.y) * 2, n.z - goal.z);
    };
    open.set(from, h(from));
    for (let it = 0; it < maxIter && open.size; it++) {
      let cur = -1, best = Infinity;
      for (const [i, f] of open) if (f < best) { best = f; cur = i; }
      if (cur === to) {
        const out = [cur];
        while (came.has(cur)) { cur = came.get(cur)!; out.push(cur); }
        return out.reverse();
      }
      open.delete(cur);
      const cn = this.nodes[cur];
      for (const j of cn.links) {
        const m = this.nodes[j];
        const ng = g.get(cur)! + Math.hypot(m.x - cn.x, m.y - cn.y, m.z - cn.z);
        if (ng < (g.get(j) ?? Infinity)) {
          g.set(j, ng);
          came.set(j, cur);
          open.set(j, ng + h(j));
        }
      }
    }
    return [];
  }
}
