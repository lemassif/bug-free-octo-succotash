import type { MatId, Ramp, Solid, Vec3 } from "../types.ts";

export type PropType =
  | "planter" | "palm" | "bench" | "trash" | "shelf" | "rack" | "counter" | "tvPallet"
  | "boxes" | "kiosk" | "vending" | "desk" | "chair" | "cabinet" | "light" | "beam"
  | "post" | "mannequin" | "watercooler";

export interface Prop {
  type: PropType;
  x: number; y: number; z: number;
  /** Quarter turns around y. */
  rot: number;
  /** Optional tint index used by some props (shelf goods, kiosk color). */
  v?: number;
}

export interface Light {
  p: Vec3;
  color: Vec3;
  radius: number;
  intensity: number;
}

export interface Sign {
  /** Center of the sign face. */
  p: Vec3;
  w: number;
  h: number;
  /** Quarter turns: 0 faces +z, 1 faces +x, 2 faces -z, 3 faces -x. */
  rot: number;
  text: string;
  sub?: string;
  bg: string;
  fg: string;
  /** Lit signs ignore baked lighting. */
  lit?: boolean;
}

export interface Zone {
  name: string;
  min: Vec3;
  max: Vec3;
}

export interface MapData {
  name: string;
  solids: Solid[];
  props: Prop[];
  lights: Light[];
  signs: Sign[];
  spawns: [Vec3[], Vec3[]];
  /** Yaw each team faces when spawning. */
  spawnYaw: [number, number];
  zones: Zone[];
  floors: number[];
  /** Openings in the roof that let sky light in (for baking). */
  skyHoles: { min: Vec3; max: Vec3 }[];
}

export interface BoxOpts {
  ramp?: Ramp;
  noBullets?: boolean;
  noCollide?: boolean;
  noRender?: boolean;
  steps?: number;
}

export type { MatId };
