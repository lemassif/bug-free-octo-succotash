// Messages between client and server. Snapshots are compact arrays because
// they go out 20 times a second to every player.

import type { PlayerState } from "../types.ts";
import type { Label } from "./scoring.ts";

export interface JoinOptions {
  name: string;
  char: number;
}

export interface Welcome {
  id: number;
  team: number;
  map: string;
  killTarget: number;
}

export interface RosterEntry {
  id: number;
  name: string;
  team: number;
  char: number;
  bot: boolean;
  k: number;
  d: number;
  pts: number;
}

/** Exact local state for reconciliation, packed in a fixed order. */
export type PackedState = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

export function packState(s: PlayerState): PackedState {
  return [s.x, s.y, s.z, s.vx, s.vy, s.vz, s.onGround ? 1 : 0, s.yaw, s.pitch, s.weapon, s.ammo0, s.ammo1, s.reload, s.cool, s.switchT, s.scoped ? 1 : 0, s.alive ? 1 : 0];
}

export function unpackState(a: PackedState, s: PlayerState): PlayerState {
  s.x = a[0]; s.y = a[1]; s.z = a[2]; s.vx = a[3]; s.vy = a[4]; s.vz = a[5];
  s.onGround = a[6] === 1; s.yaw = a[7]; s.pitch = a[8]; s.weapon = a[9];
  s.ammo0 = a[10]; s.ammo1 = a[11]; s.reload = a[12]; s.cool = a[13]; s.switchT = a[14];
  s.scoped = a[15] === 1; s.alive = a[16] === 1;
  return s;
}

export const Flag = { Alive: 1, Ground: 2, Scoped: 4, Reloading: 8, Sniper: 16, Protected: 32 } as const;

/** Another player: id, position in cm, yaw/pitch in milliradians, flags. */
export type OtherState = [id: number, x: number, y: number, z: number, yaw: number, pitch: number, flags: number];

/** A shot fired by someone else: shooter id, weapon, end point in cm. */
export type ShotFx = [id: number, weapon: number, x: number, y: number, z: number];

export interface Snapshot {
  /** Server time in ms. */
  t: number;
  /** 0 playing, 1 ended. */
  ph: number;
  /** Seconds left in the match. */
  tl: number;
  sc: [number, number];
  me: { ack: number; s: PackedState; hp: number; sq: number; ri: number } | null;
  p: OtherState[];
  fx: ShotFx[];
}

export interface KillEvent {
  k: number | null;
  v: number;
  w: number;
  hs: boolean;
  labels: Label[];
  line: string | null;
  /** Character who says the line. */
  who: number;
  /** Victim position, for the price-tag burst. */
  at: [number, number, number];
}

export interface HitEvent {
  v: number;
  dmg: number;
  hs: boolean;
  kill: boolean;
}

export interface HurtEvent {
  from: [number, number] | null;
  dmg: number;
  hp: number;
}

export interface EndEvent {
  winner: number;
  sc: [number, number];
  mvp: number | null;
  next: number;
}

export type ServerEvent =
  | { type: "kill"; data: KillEvent }
  | { type: "hit"; data: HitEvent }
  | { type: "hurt"; data: HurtEvent }
  | { type: "roster"; data: RosterEntry[] }
  | { type: "end"; data: EndEvent }
  | { type: "start"; data: { tl: number } };
