export type Vec3 = [number, number, number];

/** A ramp turns a solid into a wedge whose top rises along one axis. */
export interface Ramp {
  axis: 0 | 2;
  /** +1: top rises toward +axis. -1: rises toward -axis. */
  rise: 1 | -1;
  /** Height of the top surface at the low end. The high end is max[1]. */
  low: number;
  /** Escalator belt speed in m/s along the rise direction (negative runs down). */
  conveyor?: number;
}

export type MatId =
  | "tile" | "tileDark" | "wall" | "wallAccent" | "trim" | "ceiling" | "carpet"
  | "wood" | "metal" | "steps" | "glass" | "glassDark" | "grate" | "red" | "concrete";

export interface Solid {
  id: number;
  min: Vec3;
  max: Vec3;
  mat: MatId;
  ramp?: Ramp;
  /** Bullets pass through (glass railings). */
  noBullets?: boolean;
  /** Visual only, no collision. */
  noCollide?: boolean;
  /** Collision only, not drawn (prop colliders, stair wedges). */
  noRender?: boolean;
  /** Visual stair steps run along this ramp (draw steps instead of a slope). */
  steps?: number;
}

export const Key = {
  Fwd: 1, Back: 2, Left: 4, Right: 8, Jump: 16, Sprint: 32,
  Fire: 64, Reload: 128, Scope: 256, W1: 512, W2: 1024,
} as const;

export interface Input {
  /** Sequence number, increases by one per fixed step. */
  s: number;
  k: number;
  yaw: number;
  pitch: number;
  /** Shot direction (with spread and sway) when the client fired this step. */
  aim?: Vec3;
  /** Server time the shooter was looking at, for lag compensation. */
  rt?: number;
}

/** Everything the movement and weapon step reads or writes. Reconciliation
 *  resets this from the server and replays inputs, so it must be complete. */
export interface PlayerState {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  onGround: boolean;
  yaw: number; pitch: number;
  weapon: number;
  ammo0: number; ammo1: number;
  reload: number;
  cool: number;
  switchT: number;
  scoped: boolean;
  alive: boolean;
}

export function newPlayerState(x = 0, y = 0, z = 0, yaw = 0): PlayerState {
  return {
    x, y, z, vx: 0, vy: 0, vz: 0, onGround: false, yaw, pitch: 0,
    weapon: 0, ammo0: 30, ammo1: 5, reload: 0, cool: 0, switchT: 0, scoped: false, alive: true,
  };
}

export function copyState(src: PlayerState, dst: PlayerState): PlayerState {
  dst.x = src.x; dst.y = src.y; dst.z = src.z;
  dst.vx = src.vx; dst.vy = src.vy; dst.vz = src.vz;
  dst.onGround = src.onGround; dst.yaw = src.yaw; dst.pitch = src.pitch;
  dst.weapon = src.weapon; dst.ammo0 = src.ammo0; dst.ammo1 = src.ammo1;
  dst.reload = src.reload; dst.cool = src.cool; dst.switchT = src.switchT;
  dst.scoped = src.scoped; dst.alive = src.alive;
  return dst;
}
