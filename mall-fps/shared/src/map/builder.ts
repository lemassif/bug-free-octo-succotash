import type { MatId, Solid, Vec3 } from "../types.ts";
import type { BoxOpts, Light, MapData, Prop, PropType, Sign, Zone } from "./types.ts";

/** Local collider boxes for each prop at rot 0: [x0,y0,z0,x1,y1,z1]. */
export const PROP_COLLIDERS: Record<PropType, number[][]> = {
  planter: [[-0.6, 0, -0.6, 0.6, 0.9, 0.6]],
  palm: [[-0.8, 0, -0.8, 0.8, 0.8, 0.8], [-0.2, 0.8, -0.2, 0.2, 4, 0.2]],
  bench: [[-1, 0, -0.3, 1, 0.5, 0.3]],
  trash: [[-0.3, 0, -0.3, 0.3, 1, 0.3]],
  shelf: [[-1.5, 0, -0.35, 1.5, 1.9, 0.35]],
  rack: [[-0.8, 0, -0.3, 0.8, 1.5, 0.3]],
  counter: [[-1.2, 0, -0.4, 1.2, 1.1, 0.4]],
  tvPallet: [[-0.8, 0, -0.6, 0.8, 1.4, 0.6]],
  boxes: [[-0.5, 0, -0.5, 0.5, 1, 0.5]],
  kiosk: [[-1.5, 0, -1, 1.5, 1.2, 1]],
  vending: [[-0.5, 0, -0.4, 0.5, 2, 0.4]],
  desk: [[-1, 0, -0.5, 1, 0.8, 0.5]],
  chair: [[-0.3, 0, -0.3, 0.3, 0.5, 0.3]],
  cabinet: [[-0.25, 0, -0.3, 0.25, 1.4, 0.3]],
  light: [],
  beam: [],
  post: [],
  mannequin: [[-0.25, 0, -0.2, 0.25, 1.8, 0.2]],
  watercooler: [[-0.2, 0, -0.2, 0.2, 1.3, 0.2]],
};

export function rotXZ(x: number, z: number, rot: number): [number, number] {
  const r = ((rot % 4) + 4) % 4;
  if (r === 0) return [x, z];
  if (r === 1) return [z, -x];
  if (r === 2) return [-x, -z];
  return [-z, x];
}

/** Collects solids, props and lights. mirror() repeats everything rotated
 *  180 degrees around the map center so both teams get the same layout. */
export class MapBuilder {
  solids: Solid[] = [];
  props: Prop[] = [];
  lights: Light[] = [];
  signs: Sign[] = [];
  zones: Zone[] = [];
  skyHoles: { min: Vec3; max: Vec3 }[] = [];

  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mat: MatId, o: BoxOpts = {}): Solid {
    const s: Solid = {
      id: this.solids.length + 1,
      min: [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)],
      max: [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)],
      mat,
      ...o,
    };
    this.solids.push(s);
    return s;
  }

  prop(type: PropType, x: number, y: number, z: number, rot = 0, v?: number) {
    this.props.push({ type, x, y, z, rot: ((rot % 4) + 4) % 4, v });
  }

  light(x: number, y: number, z: number, radius = 9, intensity = 1, color: Vec3 = [1, 0.95, 0.85]) {
    this.lights.push({ p: [x, y, z], color, radius, intensity });
  }

  sign(s: Sign) {
    this.signs.push(s);
  }

  /** Rotate everything added since `from` by 180 degrees and append the copy. */
  mirrorFrom(from: { solids: number; props: number; lights: number; signs: number }) {
    for (const s of this.solids.slice(from.solids)) {
      const ramp = s.ramp ? { ...s.ramp, rise: (-s.ramp.rise) as 1 | -1 } : undefined;
      this.solids.push({
        ...s,
        id: this.solids.length + 1,
        min: [-s.max[0], s.min[1], -s.max[2]],
        max: [-s.min[0], s.max[1], -s.min[2]],
        ramp,
      });
    }
    for (const p of this.props.slice(from.props)) this.props.push({ ...p, x: -p.x, z: -p.z, rot: (p.rot + 2) % 4 });
    for (const l of this.lights.slice(from.lights)) this.lights.push({ ...l, p: [-l.p[0], l.p[1], -l.p[2]] });
    for (const s of this.signs.slice(from.signs)) this.signs.push({ ...s, p: [-s.p[0], s.p[1], -s.p[2]], rot: (s.rot + 2) % 4 });
  }

  mark() {
    return { solids: this.solids.length, props: this.props.length, lights: this.lights.length, signs: this.signs.length };
  }

  finish(meta: Omit<MapData, "solids" | "props" | "lights" | "signs" | "zones" | "skyHoles">): MapData {
    // Prop colliders become invisible solids so physics and bullets see them.
    for (const p of this.props) {
      for (const c of PROP_COLLIDERS[p.type]) {
        const [ax, az] = rotXZ(c[0], c[2], p.rot);
        const [bx, bz] = rotXZ(c[3], c[5], p.rot);
        this.box(p.x + ax, p.y + c[1], p.z + az, p.x + bx, p.y + c[4], p.z + bz, "wood", { noRender: true });
      }
    }
    return {
      ...meta,
      solids: this.solids,
      props: this.props,
      lights: this.lights,
      signs: this.signs,
      zones: this.zones,
      skyHoles: this.skyHoles,
    };
  }
}
