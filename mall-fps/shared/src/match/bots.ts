// Bot shoppers. They fill empty slots so a match always plays as 7v7.
// Bots produce the same Input a human client sends, so they obey the same
// movement and weapon rules.

import { PLAYER } from "../constants.ts";
import { viewDir } from "../hitscan.ts";
import { Key, type Input, type Vec3 } from "../types.ts";
import { World } from "../world.ts";
import { NavGrid } from "./nav.ts";

export interface BotView {
  id: number;
  team: number;
  x: number; y: number; z: number;
  alive: boolean;
  lastShotAt: number;
}

export interface BotSelf {
  id: number;
  team: number;
  st: { x: number; y: number; z: number; yaw: number; pitch: number; weapon: number; ammo0: number; ammo1: number; reload: number; onGround: boolean; alive: boolean };
}

function wrap(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class BotBrain {
  private path: number[] = [];
  private pathAt = 0;
  private target: number | null = null;
  private seenAt = 0;
  private reactAt = 0;
  private lastSense = 0;
  private strafe = 1;
  private strafeUntil = 0;
  private burst = 0;
  private pauseUntil = 0;
  private stuckT = 0;
  private lastPos: Vec3 = [0, 0, 0];
  private yaw = 0;
  private pitch = 0;
  private aimErr: Vec3 = [0, 0, 0];
  readonly sniper: boolean;
  private skill: number;
  private lastKnown: Vec3 | null = null;

  private nav: NavGrid;
  private world: World;
  private rand: () => number;

  constructor(nav: NavGrid, world: World, rand: () => number, sniper: boolean) {
    this.nav = nav;
    this.world = world;
    this.rand = rand;
    this.sniper = sniper;
    this.skill = 0.75 + rand() * 0.5;
  }

  reset(yaw: number) {
    this.path = [];
    this.target = null;
    this.yaw = yaw;
    this.pitch = 0;
    this.lastKnown = null;
  }

  think(me: BotSelf, others: BotView[], now: number, dt: number): Input {
    const st = me.st;
    let k = 0;
    if (!st.alive) return { s: 0, k: 0, yaw: this.yaw, pitch: 0 };
    if (this.sniper ? st.weapon !== 1 : st.weapon !== 0) k |= this.sniper ? Key.W2 : Key.W1;
    const eye: Vec3 = [st.x, st.y + PLAYER.eye, st.z];

    // Look for enemies a few times a second.
    if (now - this.lastSense > 150) {
      this.lastSense = now;
      const prev = this.target;
      this.target = null;
      let best = Infinity;
      for (const o of others) {
        if (!o.alive || o.team === me.team) continue;
        const dx = o.x - st.x, dy = o.y + 1.1 - eye[1], dz = o.z - st.z;
        const d = Math.hypot(dx, dy, dz);
        if (d > (this.sniper ? 110 : 70)) continue;
        const ang = Math.abs(wrap(Math.atan2(-dx, -dz) - this.yaw));
        const heard = now - o.lastShotAt < 1200 && d < 30;
        if (ang > 1.6 && !heard && o.id !== prev) continue;
        const dir: Vec3 = [dx / d, dy / d, dz / d];
        if (this.world.raycast(eye, dir, d - 0.4)) continue;
        if (d < best) { best = d; this.target = o.id; }
      }
      if (this.target !== null && this.target !== prev) {
        this.reactAt = now + (380 + this.rand() * 320) / this.skill;
        this.seenAt = now;
        this.aimErr = [(this.rand() - 0.5) * 0.9, (this.rand() - 0.5) * 0.5, (this.rand() - 0.5) * 0.9];
      }
    }

    const tgt = this.target !== null ? others.find((o) => o.id === this.target && o.alive) : undefined;
    let aim: Vec3 | undefined;
    if (tgt) {
      this.lastKnown = [tgt.x, tgt.y, tgt.z];
      // Aim error shrinks the longer the bot tracks the same target.
      const settle = Math.max(0.15, 1 - (now - this.seenAt) / 1600);
      const ax = tgt.x + this.aimErr[0] * settle, ay = tgt.y + 1.15 + this.aimErr[1] * settle, az = tgt.z + this.aimErr[2] * settle;
      const dx = ax - eye[0], dy = ay - eye[1], dz = az - eye[2];
      const flat = Math.hypot(dx, dz);
      const wantYaw = Math.atan2(-dx, -dz);
      const wantPitch = Math.atan2(dy, flat);
      const turn = 5.5 * this.skill * dt;
      const dyaw = wrap(wantYaw - this.yaw);
      this.yaw = wrap(this.yaw + Math.max(-turn, Math.min(turn, dyaw)));
      this.pitch += Math.max(-turn, Math.min(turn, wantPitch - this.pitch));
      const dist = Math.hypot(dx, dy, dz);
      const onTarget = Math.abs(dyaw) < 0.06 + 0.5 / Math.max(4, dist);
      if (this.sniper && dist > 12) k |= Key.Scope;
      if (now > this.reactAt && onTarget && now > this.pauseUntil) {
        k |= Key.Fire;
        this.burst++;
        if (!this.sniper && this.burst > 5 + this.rand() * 6) {
          this.burst = 0;
          this.pauseUntil = now + 250 + this.rand() * 300;
        }
      }
      // Strafe while fighting.
      if (now > this.strafeUntil) {
        this.strafe = this.rand() < 0.5 ? -1 : 1;
        this.strafeUntil = now + 500 + this.rand() * 900;
      }
      if (!(k & Key.Scope)) k |= this.strafe > 0 ? Key.Right : Key.Left;
      if (dist > 25 && !this.sniper) k |= Key.Fwd;
      const spread = (0.012 + 0.03 * settle) / this.skill;
      const d = viewDir(this.yaw + (this.rand() - 0.5) * spread, this.pitch + (this.rand() - 0.5) * spread);
      aim = d;
    } else {
      this.burst = 0;
      if ((st.weapon === 0 ? st.ammo0 < 12 : st.ammo1 < 3) && st.reload === 0) k |= Key.Reload;
      k |= this.followPath(me, now, dt);
    }
    return { s: 0, k, yaw: this.yaw, pitch: this.pitch, aim };
  }

  private followPath(me: BotSelf, now: number, dt: number): number {
    const st = me.st;
    // Stuck detection.
    const moved = Math.hypot(st.x - this.lastPos[0], st.z - this.lastPos[2]);
    this.lastPos = [st.x, st.y, st.z];
    this.stuckT = moved < 1.5 * dt ? this.stuckT + dt : 0;
    if (!this.path.length || this.stuckT > 1.2 || now - this.pathAt > 20000) {
      const from = this.nav.nearest(st.x, st.y, st.z);
      let goal = -1;
      if (this.lastKnown && this.rand() < 0.6) goal = this.nav.nearest(this.lastKnown[0], this.lastKnown[1], this.lastKnown[2]);
      if (goal < 0) {
        // Head for the middle of the map or the enemy side, on either floor.
        const side = me.team === 0 ? 1 : -1;
        const gx = (this.rand() * 40 - 10) * side;
        const gz = (this.rand() - 0.5) * 24;
        goal = this.nav.nearest(gx, this.rand() < 0.4 ? 5 : 0, gz);
      }
      this.path = this.nav.path(from, goal);
      this.pathAt = now;
      this.lastKnown = null;
      if (this.stuckT > 1.2) {
        this.stuckT = 0;
        return Key.Jump | Key.Fwd;
      }
    }
    while (this.path.length) {
      const n = this.nav.nodes[this.path[0]];
      if (Math.hypot(n.x - st.x, n.z - st.z) < 0.9 && Math.abs(n.y - st.y) < 1.2) this.path.shift();
      else break;
    }
    if (!this.path.length) return 0;
    const n = this.nav.nodes[this.path[0]];
    const want = Math.atan2(-(n.x - st.x), -(n.z - st.z));
    const turn = 7 * dt;
    const d = wrap(want - this.yaw);
    this.yaw = wrap(this.yaw + Math.max(-turn, Math.min(turn, d)));
    this.pitch *= 0.9;
    let k = 0;
    if (Math.abs(d) < 1.0) k |= Key.Fwd;
    if (this.path.length > 4 && Math.abs(d) < 0.3 && this.rand() < 0.5) k |= Key.Sprint;
    return k;
  }
}
