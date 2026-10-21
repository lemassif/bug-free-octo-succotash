// Client side of the netcode:
//  - every fixed step's input is predicted locally, kept until the server
//    acknowledges it, and sent in small batches;
//  - each snapshot resets the local player to the server's state and replays
//    the unacknowledged inputs (reconciliation), smoothing any correction;
//  - everyone else is drawn 100 ms in the past, interpolated between snapshots;
//  - shots carry that render time so the server can rewind targets to match
//    what this player saw.

import * as THREE from "three";
import {
  Flag, INTERP_DELAY_MS, PLAYER, copyState, newPlayerState, stepPlayer, unpackState,
  type EndEvent, type HitEvent, type HurtEvent, type Input, type KillEvent, type RosterEntry, type Snapshot, type Target, type Welcome,
} from "@bfb/shared";
import type { Game } from "../game/Game.ts";
import type { WeaponController } from "../game/WeaponController.ts";
import { Avatars, type AvatarPose } from "../world/Avatars.ts";
import type { Transport } from "./transport.ts";

interface Sample { t: number; x: number; y: number; z: number; yaw: number; pitch: number; flags: number }

const tmpV = new THREE.Vector3();

function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export interface NetHooks {
  kill(e: KillEvent): void;
  hit(e: HitEvent): void;
  hurt(e: HurtEvent): void;
  roster(r: RosterEntry[]): void;
  end(e: EndEvent): void;
  start(): void;
  closed(reason: string): void;
}

export class NetClient {
  welcome!: Welcome;
  roster: RosterEntry[] = [];
  hp = 100;
  respawnIn = 0;
  phase = 0;
  timeLeft = 0;
  scores: [number, number] = [0, 0];
  /** Smoothed round-trip estimate in ms (from ack timing). */
  rtt = 0;
  private pending: Input[] = [];
  private outbox: Input[] = [];
  private sentAt = new Map<number, number>();
  private spawnSeq = -1;
  private offset = NaN;
  private buffers = new Map<number, Sample[]>();
  private smooth = new THREE.Vector3();
  readonly avatars: Avatars;
  readonly poses = new Map<number, AvatarPose>();
  private scratch = newPlayerState();
  corrections = 0;

  constructor(private game: Game, private weapons: WeaponController, readonly transport: Transport, hooks: NetHooks) {
    this.avatars = new Avatars(game.scene);
    transport.on("s", (s: Snapshot) => this.onSnapshot(s));
    transport.on("roster", (r: RosterEntry[]) => {
      this.roster = r;
      if (this.welcome) this.avatars.sync(r, this.welcome.id, this.myTeam);
      hooks.roster(r);
    });
    transport.on("kill", (e: KillEvent) => hooks.kill(e));
    transport.on("hit", (e: HitEvent) => hooks.hit(e));
    transport.on("hurt", (e: HurtEvent) => {
      this.hp = e.hp;
      hooks.hurt(e);
    });
    transport.on("end", (e: EndEvent) => hooks.end(e));
    transport.on("start", () => hooks.start());
    transport.onClose = (r) => hooks.closed(r);

    game.beforeStep.push((inp) => {
      inp.rt = this.renderTime();
    });
    game.onStep.push((inp) => {
      this.pending.push(inp);
      this.outbox.push(inp);
      this.sentAt.set(inp.s, performance.now());
      if (this.pending.length > 180) this.pending.splice(0, this.pending.length - 180);
    });
    game.onFrame.push((dt) => this.frame(dt));
    weapons.targets = () => this.enemyTargets();
  }

  get myTeam() {
    return this.roster.find((r) => r.id === this.welcome?.id)?.team ?? this.welcome?.team ?? 0;
  }

  async join(name: string, char: number) {
    this.welcome = await this.transport.connect({ name, char });
    this.avatars.sync(this.roster, this.welcome.id, this.myTeam);
  }

  serverNow() {
    return performance.now() + (Number.isNaN(this.offset) ? 0 : this.offset);
  }

  renderTime() {
    return this.serverNow() - INTERP_DELAY_MS;
  }

  private onSnapshot(s: Snapshot) {
    const sample = s.t - performance.now();
    // Track the least-delayed snapshots; drift down slowly if latency grows.
    this.offset = Number.isNaN(this.offset) ? sample : Math.max(sample, this.offset - 0.5);
    this.phase = s.ph;
    this.timeLeft = s.tl;
    this.scores = s.sc;

    for (const o of s.p) {
      let b = this.buffers.get(o[0]);
      if (!b) this.buffers.set(o[0], (b = []));
      b.push({ t: s.t, x: o[1] / 100, y: o[2] / 100, z: o[3] / 100, yaw: o[4] / 1000, pitch: o[5] / 1000, flags: o[6] });
      if (b.length > 30) b.shift();
    }
    for (const f of s.fx) this.remoteShot(f[0], f[1], [f[2] / 100, f[3] / 100, f[4] / 100]);

    const me = s.me;
    if (!me) return;
    this.hp = me.hp;
    this.respawnIn = me.ri;
    const sent = this.sentAt.get(me.ack);
    if (sent !== undefined) {
      const r = performance.now() - sent;
      this.rtt = this.rtt ? this.rtt * 0.9 + r * 0.1 : r;
      for (const k of this.sentAt.keys()) if (k <= me.ack) this.sentAt.delete(k);
    }
    this.pending = this.pending.filter((i) => i.s > me.ack);
    const g = this.game;
    if (me.sq !== this.spawnSeq) {
      // Respawned (or first snapshot): take the server state as is.
      this.spawnSeq = me.sq;
      unpackState(me.s, g.me);
      g.controls.yaw = g.me.yaw;
      g.controls.pitch = 0;
      copyState(g.me, this.prevState());
      this.pending = [];
      this.smooth.set(0, 0, 0);
      return;
    }
    const before = this.scratch;
    copyState(g.me, before);
    unpackState(me.s, g.me);
    for (const inp of this.pending) stepPlayer(g.me, inp, g.world);
    const dx = before.x - g.me.x, dy = before.y - g.me.y, dz = before.z - g.me.z;
    const err = Math.hypot(dx, dy, dz);
    if (err > 1e-4) this.corrections++;
    if (err < 3) this.smooth.add(tmpV.set(dx, dy, dz));
    else this.smooth.set(0, 0, 0);
    // Shift the previous step too, so render interpolation stays continuous.
    const prev = this.prevState();
    prev.x -= dx; prev.y -= dy; prev.z -= dz;
  }

  private prevState() {
    return this.game.prev;
  }

  private sampleAt(id: number, rt: number): Sample | null {
    const b = this.buffers.get(id);
    if (!b || !b.length) return null;
    if (rt <= b[0].t) return b[0];
    for (let i = b.length - 1; i > 0; i--) {
      const a = b[i - 1], c = b[i];
      if (a.t <= rt && rt <= c.t) {
        const t = (rt - a.t) / (c.t - a.t || 1);
        // Teleports (respawns) snap instead of sliding across the map.
        if (Math.hypot(c.x - a.x, c.z - a.z) > 4) return t < 0.5 ? a : c;
        return {
          t: rt, x: a.x + (c.x - a.x) * t, y: a.y + (c.y - a.y) * t, z: a.z + (c.z - a.z) * t,
          yaw: lerpAngle(a.yaw, c.yaw, t), pitch: a.pitch + (c.pitch - a.pitch) * t, flags: t < 0.5 ? a.flags : c.flags,
        };
      }
    }
    return b[b.length - 1];
  }

  private enemyTargets(): Target[] {
    const out: Target[] = [];
    const team = this.myTeam;
    for (const [id, p] of this.poses) {
      const r = this.roster.find((e) => e.id === id);
      if (!r || r.team === team || !(p.flags & Flag.Alive)) continue;
      out.push({ id: String(id), x: p.x, y: p.y, z: p.z });
    }
    return out;
  }

  private remoteShot(id: number, weapon: number, end: [number, number, number]) {
    const p = this.poses.get(id) ?? this.sampleAt(id, this.renderTime());
    if (!p) return;
    const yaw = p.yaw;
    tmpV.set(p.x - Math.sin(yaw) * 0.6 + Math.cos(yaw) * 0.2, p.y + 1.3, p.z - Math.cos(yaw) * 0.6 - Math.sin(yaw) * 0.2);
    const me = this.game.me;
    const dist = Math.hypot(p.x - me.x, p.z - me.z);
    this.weapons.remoteShot(tmpV.clone(), end, weapon, dist);
  }

  private frame(dt: number) {
    if (this.outbox.length) {
      this.transport.send(this.outbox);
      this.outbox = [];
    }
    // Ease out prediction corrections over about 100 ms.
    const k = Math.min(1, dt * 12);
    this.game.camera.position.add(this.smooth);
    this.smooth.multiplyScalar(1 - k);

    const rt = this.renderTime();
    for (const [id, b] of this.buffers) {
      if (!this.avatars.has(id)) continue;
      const s = this.sampleAt(id, rt);
      if (!s) continue;
      const prev = this.poses.get(id);
      const speed = prev && dt > 0 ? Math.hypot(s.x - prev.x, s.z - prev.z) / dt : 0;
      const pose: AvatarPose = { x: s.x, y: s.y, z: s.z, yaw: s.yaw, pitch: s.pitch, flags: s.flags, speed: prev ? prev.speed * 0.8 + Math.min(speed, 12) * 0.2 : 0 };
      this.poses.set(id, pose);
      this.avatars.pose(id, dt, pose);
      void b;
    }
    // Dead: a slow look up at the skylight while waiting to respawn.
    if (!this.game.me.alive) {
      this.game.camera.position.y -= PLAYER.eye * 0.6;
    }
  }
}
