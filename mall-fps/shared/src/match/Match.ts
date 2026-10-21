// The authoritative match: players, bots, inputs, shots, damage, knockouts,
// respawns, the clock and the score. The Colyseus room wraps this, and the
// offline practice mode runs the same class in the browser.

import {
  DT, END_SCREEN_SECONDS, INPUT_TIMEOUT_MS, KILL_TARGET, LAGCOMP_MAX_MS, MATCH_SECONDS, MAX_HEALTH, PLAYER,
  REGEN_DELAY, REGEN_PER_SEC, RESPAWN_SECONDS, SNAPSHOT_EVERY_TICKS, SPAWN_PROTECT_SECONDS, TEAM_SIZE,
} from "../constants.ts";
import { BOT_NAMES, CHARACTERS } from "../characters.ts";
import { aimDeviation, traceShot, viewDir, type Target } from "../hitscan.ts";
import type { MapData } from "../map/types.ts";
import { stepPlayer } from "../movement.ts";
import { newPlayerState, type Input, type PlayerState, type Vec3 } from "../types.ts";
import { WEAPONS } from "../weapons.ts";
import { World } from "../world.ts";
import { BotBrain, type BotView } from "./bots.ts";
import { NavGrid } from "./nav.ts";
import { Flag, packState, type EndEvent, type KillEvent, type OtherState, type RosterEntry, type ServerEvent, type ShotFx, type Snapshot } from "./protocol.ts";
import { MULTI_WINDOW_MS, killLabels } from "./scoring.ts";
import { VoicePicker } from "./voice.ts";

const HISTORY = 90;

interface HistEntry { t: number; x: number; y: number; z: number; alive: boolean }

export interface PlayerRec {
  id: number;
  name: string;
  team: number;
  char: number;
  bot: BotBrain | null;
  st: PlayerState;
  hp: number;
  respawnAt: number;
  kills: number;
  deaths: number;
  score: number;
  streak: number;
  multi: number;
  lastKillAt: number;
  lastKiller: number | null;
  inputs: Input[];
  ack: number;
  lastInputAt: number;
  spawnSeq: number;
  protectUntil: number;
  lastHurtAt: number;
  lastShotAt: number;
  hist: HistEntry[];
}

export interface MatchOptions {
  botFill?: boolean;
  killTarget?: number;
  matchSeconds?: number;
  seed?: number;
}

export type Outgoing = { to: number | "all"; ev: ServerEvent };

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Match {
  readonly world: World;
  readonly nav: NavGrid;
  readonly players = new Map<number, PlayerRec>();
  readonly map: MapData;
  readonly killTarget: number;
  readonly matchSeconds: number;
  now = 0;
  tick = 0;
  phase = 0;
  timeLeft: number;
  scores: [number, number] = [0, 0];
  private nextId = 1;
  private nextMatchAt = 0;
  private firstBlood = true;
  private fx: ShotFx[] = [];
  private out: Outgoing[] = [];
  private rosterDirty = true;
  private botFill: boolean;
  private rand: () => number;
  private voice: VoicePicker;
  private office: { min: Vec3; max: Vec3 } | undefined;

  constructor(map: MapData, opts: MatchOptions = {}) {
    this.map = map;
    this.world = new World(map.solids);
    this.nav = new NavGrid(this.world);
    this.killTarget = opts.killTarget ?? KILL_TARGET;
    this.matchSeconds = opts.matchSeconds ?? MATCH_SECONDS;
    this.timeLeft = this.matchSeconds;
    this.botFill = opts.botFill ?? true;
    this.rand = opts.seed !== undefined ? mulberry(opts.seed) : Math.random;
    this.voice = new VoicePicker(this.rand);
    this.office = map.zones.find((z) => z.name === "office");
    if (this.botFill) this.balanceBots();
  }

  // ---------- joining and leaving ----------

  addHuman(name: string, char: number): PlayerRec {
    const humans = [0, 1].map((t) => [...this.players.values()].filter((p) => !p.bot && p.team === t).length);
    const team = humans[0] <= humans[1] ? 0 : 1;
    // Make room by removing a bot from that team.
    const bot = [...this.players.values()].find((p) => p.bot && p.team === team);
    if (bot) this.players.delete(bot.id);
    const p = this.create(cleanName(name), Math.max(0, Math.min(2, char | 0)), team, null);
    this.rosterDirty = true;
    return p;
  }

  remove(id: number) {
    if (this.players.delete(id)) {
      this.rosterDirty = true;
      if (this.botFill) this.balanceBots();
    }
  }

  get humanCount() {
    let n = 0;
    for (const p of this.players.values()) if (!p.bot) n++;
    return n;
  }

  private balanceBots() {
    for (const team of [0, 1]) {
      let count = [...this.players.values()].filter((p) => p.team === team).length;
      while (count < TEAM_SIZE) {
        const used = new Set([...this.players.values()].map((p) => p.name));
        const free = BOT_NAMES.filter((n) => !used.has(n));
        const name = free[Math.floor(this.rand() * free.length)] ?? `Shopper ${this.nextId}`;
        const brain = new BotBrain(this.nav, this.world, this.rand, this.rand() < 0.22);
        this.create(name, Math.floor(this.rand() * CHARACTERS.length), team, brain);
        count++;
      }
    }
    this.rosterDirty = true;
  }

  private create(name: string, char: number, team: number, bot: BotBrain | null): PlayerRec {
    const p: PlayerRec = {
      id: this.nextId++, name, team, char, bot, st: newPlayerState(), hp: MAX_HEALTH, respawnAt: 0,
      kills: 0, deaths: 0, score: 0, streak: 0, multi: 0, lastKillAt: -1e9, lastKiller: null,
      inputs: [], ack: 0, lastInputAt: this.now, spawnSeq: 0, protectUntil: 0, lastHurtAt: -1e9, lastShotAt: -1e9, hist: [],
    };
    this.players.set(p.id, p);
    this.spawn(p);
    return p;
  }

  /** Test hook: move a player and treat it as a respawn so clients snap. */
  teleport(id: number, x: number, y: number, z: number, yaw: number) {
    const p = this.players.get(id);
    if (!p) return;
    const w = p.st.weapon;
    p.st = newPlayerState(x, y, z, yaw);
    p.st.weapon = w;
    p.hp = MAX_HEALTH;
    p.protectUntil = 0;
    p.spawnSeq++;
    p.inputs.length = 0;
    p.hist.length = 0;
  }

  queueInputs(id: number, inputs: Input[]) {
    const p = this.players.get(id);
    if (!p || p.bot) return;
    for (const inp of inputs) {
      if (!validInput(inp) || inp.s <= p.ack || (p.inputs.length && inp.s <= p.inputs[p.inputs.length - 1].s)) continue;
      p.inputs.push(inp);
    }
    // A client cannot bank more than half a second of movement.
    if (p.inputs.length > 30) p.inputs.splice(0, p.inputs.length - 30);
  }

  // ---------- simulation ----------

  step() {
    this.tick++;
    this.now += DT * 1000;
    if (this.phase === 1) {
      if (this.now >= this.nextMatchAt) this.restart();
    } else {
      this.timeLeft = Math.max(0, this.timeLeft - DT);
      if (this.timeLeft <= 0) this.end();
    }
    const frozen = this.phase === 1;
    let views: BotView[] | null = null;
    for (const p of this.players.values()) {
      if (!p.st.alive && p.respawnAt && this.now >= p.respawnAt && !frozen) this.spawn(p);
      if (p.bot) {
        views ??= [...this.players.values()].map((o) => ({ id: o.id, team: o.team, x: o.st.x, y: o.st.y, z: o.st.z, alive: o.st.alive, lastShotAt: o.lastShotAt }));
        const inp = p.bot.think(p, views, this.now, DT);
        this.process(p, frozen ? { ...inp, k: 0 } : inp);
      } else {
        let n = 0;
        while (p.inputs.length && n < 4) {
          const inp = p.inputs.shift()!;
          this.process(p, frozen ? { ...inp, k: 0 } : inp);
          p.ack = inp.s;
          p.lastInputAt = this.now;
          n++;
        }
        // Keep gravity going for a client that stopped sending (tab hidden).
        if (!n && this.now - p.lastInputAt > INPUT_TIMEOUT_MS) this.process(p, { s: p.ack, k: 0, yaw: p.st.yaw, pitch: p.st.pitch });
      }
      if (p.st.alive && p.hp < MAX_HEALTH && this.now - p.lastHurtAt > REGEN_DELAY * 1000) p.hp = Math.min(MAX_HEALTH, p.hp + REGEN_PER_SEC * DT);
    }
    for (const p of this.players.values()) {
      p.hist.push({ t: this.now, x: p.st.x, y: p.st.y, z: p.st.z, alive: p.st.alive });
      if (p.hist.length > HISTORY) p.hist.shift();
    }
    if (this.rosterDirty) {
      this.rosterDirty = false;
      this.emit("all", { type: "roster", data: this.roster() });
    }
  }

  get snapshotDue() {
    return this.tick % SNAPSHOT_EVERY_TICKS === 0;
  }

  private process(p: PlayerRec, inp: Input) {
    const res = stepPlayer(p.st, inp, this.world);
    if (res.fired) this.shoot(p, inp);
    if (p.st.alive && p.st.y < -15) this.knockout(p, null, 0, false);
  }

  private shoot(p: PlayerRec, inp: Input) {
    const w = WEAPONS[p.st.weapon];
    p.lastShotAt = this.now;
    let aim = inp.aim;
    if (!aim || aimDeviation(aim, p.st.yaw, p.st.pitch) > 0.35) aim = viewDir(p.st.yaw, p.st.pitch);
    const l = Math.hypot(aim[0], aim[1], aim[2]);
    aim = [aim[0] / l, aim[1] / l, aim[2] / l];
    const rt = p.bot ? this.now : Math.max(this.now - LAGCOMP_MAX_MS, Math.min(this.now, inp.rt ?? this.now));
    const targets: (Target & { rec: PlayerRec })[] = [];
    for (const o of this.players.values()) {
      if (o === p || o.team === p.team || !o.st.alive) continue;
      const at = rewind(o, rt);
      if (at) targets.push({ id: String(o.id), x: at[0], y: at[1], z: at[2], rec: o });
    }
    const origin: Vec3 = [p.st.x, p.st.y + PLAYER.eye, p.st.z];
    const hit = traceShot(this.world, origin, aim, w.range, targets, null);
    this.fx.push([p.id, p.st.weapon, Math.round(hit.point[0] * 100), Math.round(hit.point[1] * 100), Math.round(hit.point[2] * 100)]);
    if (hit.target) {
      const v = targets.find((t) => t.id === hit.target)!.rec;
      this.damage(v, p, p.st.weapon, hit.head, hit.t);
    }
  }

  private damage(v: PlayerRec, a: PlayerRec, weapon: number, head: boolean, dist: number) {
    if (this.now < v.protectUntil || !v.st.alive) return;
    const w = WEAPONS[weapon];
    const dmg = head ? w.head : w.body;
    v.hp -= dmg;
    v.lastHurtAt = this.now;
    const kill = v.hp <= 0;
    if (!a.bot) this.emit(a.id, { type: "hit", data: { v: v.id, dmg, hs: head, kill } });
    if (!v.bot) this.emit(v.id, { type: "hurt", data: { from: [a.st.x, a.st.z], dmg, hp: Math.max(0, v.hp) } });
    if (kill) this.knockout(v, a, weapon, head, dist);
  }

  private knockout(v: PlayerRec, a: PlayerRec | null, weapon: number, head: boolean, dist = 0) {
    const wasReloading = v.st.reload > 0;
    const victimStreak = v.streak;
    v.st.alive = false;
    v.hp = 0;
    v.respawnAt = this.now + RESPAWN_SECONDS * 1000;
    v.deaths++;
    v.streak = 0;
    v.lastKiller = a?.id ?? null;
    let labels: KillEvent["labels"] = [];
    let line: string | null = null;
    if (a && a.team !== v.team) {
      this.scores[a.team]++;
      a.kills++;
      a.streak++;
      a.multi = this.now - a.lastKillAt <= MULTI_WINDOW_MS ? a.multi + 1 : 1;
      a.lastKillAt = this.now;
      const inOffice = !!this.office && inside(v.st, this.office);
      labels = killLabels({
        victimName: v.name, weapon, headshot: head, distance: dist, multi: a.multi, streak: a.streak,
        victimStreak, revenge: a.lastKiller === v.id, firstBlood: this.firstBlood, killerAirborne: !a.st.onGround,
        victimReloading: wasReloading, killerHp: a.hp, inOffice,
      }, this.rand);
      if (a.lastKiller === v.id) a.lastKiller = null;
      this.firstBlood = false;
      a.score += labels.reduce((s, l) => s + l[1], 0);
      line = this.voice.pick(a.char);
    }
    this.emit("all", {
      type: "kill",
      data: { k: a?.id ?? null, v: v.id, w: weapon, hs: head, labels, line, who: a?.char ?? v.char, at: [v.st.x, v.st.y, v.st.z] },
    });
    this.rosterDirty = true;
    if (a && this.scores[a.team] >= this.killTarget) this.end();
  }

  private spawn(p: PlayerRec) {
    const pts = this.map.spawns[p.team];
    // Pick the spawn point farthest from living enemies.
    let best = pts[0], bestD = -1;
    for (const s of pts) {
      let d = Infinity;
      for (const o of this.players.values()) {
        if (o.team === p.team || !o.st.alive) continue;
        d = Math.min(d, Math.hypot(o.st.x - s[0], o.st.z - s[2]));
      }
      for (const o of this.players.values()) if (o !== p && o.st.alive && Math.hypot(o.st.x - s[0], o.st.z - s[2]) < 0.8) d -= 100;
      d += this.rand() * 4;
      if (d > bestD) { bestD = d; best = s; }
    }
    const yaw = this.map.spawnYaw[p.team];
    const weapon = p.st.weapon;
    p.st = newPlayerState(best[0], best[1], best[2], yaw);
    p.st.weapon = p.bot ? (p.bot.sniper ? 1 : 0) : weapon;
    p.st.onGround = true;
    p.hp = MAX_HEALTH;
    p.respawnAt = 0;
    p.spawnSeq++;
    p.protectUntil = this.now + SPAWN_PROTECT_SECONDS * 1000;
    p.hist.length = 0;
    p.bot?.reset(yaw);
  }

  private end() {
    if (this.phase === 1) return;
    this.phase = 1;
    this.nextMatchAt = this.now + END_SCREEN_SECONDS * 1000;
    const winner = this.scores[0] === this.scores[1] ? -1 : this.scores[0] > this.scores[1] ? 0 : 1;
    let mvp: PlayerRec | null = null;
    for (const p of this.players.values()) if (!mvp || p.score > mvp.score) mvp = p;
    const data: EndEvent = { winner, sc: [...this.scores] as [number, number], mvp: mvp?.id ?? null, next: END_SCREEN_SECONDS };
    this.emit("all", { type: "end", data });
  }

  private restart() {
    this.phase = 0;
    this.scores = [0, 0];
    this.timeLeft = this.matchSeconds;
    this.firstBlood = true;
    for (const p of this.players.values()) {
      p.kills = p.deaths = p.score = p.streak = p.multi = 0;
      p.lastKiller = null;
      this.spawn(p);
    }
    this.rosterDirty = true;
    this.emit("all", { type: "start", data: { tl: this.timeLeft } });
  }

  // ---------- output ----------

  private emit(to: number | "all", ev: ServerEvent) {
    this.out.push({ to, ev });
  }

  drainEvents(): Outgoing[] {
    const o = this.out;
    this.out = [];
    return o;
  }

  roster(): RosterEntry[] {
    return [...this.players.values()].map((p) => ({ id: p.id, name: p.name, team: p.team, char: p.char, bot: !!p.bot, k: p.kills, d: p.deaths, pts: p.score }));
  }

  /** Builds every player's snapshot; call when snapshotDue, then send. */
  snapshots(forIds: Iterable<number>): Map<number, Snapshot> {
    const others: OtherState[] = [];
    for (const p of this.players.values()) {
      const s = p.st;
      let f = 0;
      if (s.alive) f |= Flag.Alive;
      if (s.onGround) f |= Flag.Ground;
      if (s.scoped) f |= Flag.Scoped;
      if (s.reload > 0) f |= Flag.Reloading;
      if (s.weapon === 1) f |= Flag.Sniper;
      if (this.now < p.protectUntil) f |= Flag.Protected;
      others.push([p.id, Math.round(s.x * 100), Math.round(s.y * 100), Math.round(s.z * 100), Math.round(s.yaw * 1000), Math.round(s.pitch * 1000), f]);
    }
    const fx = this.fx;
    this.fx = [];
    const out = new Map<number, Snapshot>();
    const tl = Math.round(this.timeLeft * 10) / 10;
    for (const id of forIds) {
      const p = this.players.get(id);
      out.set(id, {
        t: this.now, ph: this.phase, tl, sc: [...this.scores] as [number, number],
        me: p ? { ack: p.ack, s: packState(p.st), hp: Math.ceil(p.hp), sq: p.spawnSeq, ri: p.st.alive ? 0 : Math.max(0, (p.respawnAt - this.now) / 1000) } : null,
        p: others.filter((o) => o[0] !== id),
        fx: fx.filter((f) => f[0] !== id),
      });
    }
    return out;
  }
}

function rewind(p: PlayerRec, t: number): Vec3 | null {
  const h = p.hist;
  if (!h.length) return p.st.alive ? [p.st.x, p.st.y, p.st.z] : null;
  if (t >= h[h.length - 1].t) {
    const e = h[h.length - 1];
    return e.alive ? [e.x, e.y, e.z] : null;
  }
  for (let i = h.length - 2; i >= 0; i--) {
    const a = h[i], b = h[i + 1];
    if (a.t <= t) {
      if (!a.alive || !b.alive) return null;
      const f = (t - a.t) / (b.t - a.t || 1);
      return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.z + (b.z - a.z) * f];
    }
  }
  const e = h[0];
  return e.alive ? [e.x, e.y, e.z] : null;
}

function inside(s: PlayerState, z: { min: Vec3; max: Vec3 }) {
  return s.x >= z.min[0] && s.x <= z.max[0] && s.y >= z.min[1] - 0.1 && s.y <= z.max[1] && s.z >= z.min[2] && s.z <= z.max[2];
}

function validInput(i: Input): boolean {
  if (!i || typeof i.s !== "number" || typeof i.k !== "number" || !Number.isFinite(i.yaw) || !Number.isFinite(i.pitch)) return false;
  if (i.aim && (!Array.isArray(i.aim) || i.aim.length !== 3 || !i.aim.every(Number.isFinite))) return false;
  if (i.rt !== undefined && !Number.isFinite(i.rt)) return false;
  return true;
}

export function cleanName(n: unknown): string {
  const s = String(n ?? "").replace(/[^\p{L}\p{N} _.'-]/gu, "").trim().slice(0, 16);
  return s || "Shopper";
}
