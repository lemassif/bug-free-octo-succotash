import type { Vec3 } from "./types.ts";
import { World } from "./world.ts";

export interface Target {
  id: string;
  x: number; y: number; z: number;
}

export interface ShotHit {
  t: number;
  point: Vec3;
  normal: Vec3;
  /** Player id when a player was hit, otherwise null (wall or nothing). */
  target: string | null;
  head: boolean;
}

/** Hitboxes relative to the feet. Slightly inside the 0.35 m collision box. */
export const BODY = { r: 0.32, y0: 0, y1: 1.45 };
export const HEAD = { r: 0.17, y0: 1.45, y1: 1.82 };

function rayBox(o: Vec3, d: Vec3, mn: Vec3, mx: Vec3, maxT: number): number {
  let t0 = 0, t1 = maxT;
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-12) {
      if (o[a] < mn[a] || o[a] > mx[a]) return -1;
      continue;
    }
    const inv = 1 / d[a];
    let n = (mn[a] - o[a]) * inv, f = (mx[a] - o[a]) * inv;
    if (n > f) { const t = n; n = f; f = t; }
    if (n > t0) t0 = n;
    if (f < t1) t1 = f;
    if (t0 > t1) return -1;
  }
  return t0;
}

/** Ray against one player's head then body. Returns distance or -1. */
export function rayPlayer(o: Vec3, d: Vec3, p: Target, maxT: number): { t: number; head: boolean } | null {
  const th = rayBox(o, d, [p.x - HEAD.r, p.y + HEAD.y0, p.z - HEAD.r], [p.x + HEAD.r, p.y + HEAD.y1, p.z + HEAD.r], maxT);
  const tb = rayBox(o, d, [p.x - BODY.r, p.y + BODY.y0, p.z - BODY.r], [p.x + BODY.r, p.y + BODY.y1, p.z + BODY.r], maxT);
  if (th < 0 && tb < 0) return null;
  if (th >= 0 && (tb < 0 || th <= tb)) return { t: th, head: true };
  return { t: tb, head: false };
}

/** Full hitscan: nearest of the level and every target except the shooter. */
export function traceShot(world: World, o: Vec3, d: Vec3, range: number, targets: Iterable<Target>, ignore: string | null): ShotHit {
  const wall = world.raycast(o, d, range);
  let bestT = wall ? wall.t : range;
  let target: string | null = null;
  let head = false;
  for (const p of targets) {
    if (p.id === ignore) continue;
    const h = rayPlayer(o, d, p, bestT);
    if (h && h.t < bestT) { bestT = h.t; target = p.id; head = h.head; }
  }
  const point: Vec3 = [o[0] + d[0] * bestT, o[1] + d[1] * bestT, o[2] + d[2] * bestT];
  const normal: Vec3 = target ? [-d[0], -d[1], -d[2]] : wall && wall.t === bestT ? wall.normal : [0, 0, 0];
  return { t: bestT, point, normal, target, head };
}

/** View direction for yaw/pitch (three.js YXZ camera convention). */
export function viewDir(yaw: number, pitch: number): Vec3 {
  const cp = Math.cos(pitch);
  return [-Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp];
}

/** Angle in radians between a shot and the view direction (server-side sanity check). */
export function aimDeviation(aim: Vec3, yaw: number, pitch: number): number {
  const v = viewDir(yaw, pitch);
  const l = Math.hypot(aim[0], aim[1], aim[2]) || 1;
  const dot = (aim[0] * v[0] + aim[1] * v[1] + aim[2] * v[2]) / l;
  return Math.acos(Math.max(-1, Math.min(1, dot)));
}
