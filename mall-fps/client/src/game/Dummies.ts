import * as THREE from "three";
import { MAX_HEALTH, WEAPONS, type ShotHit, type Target } from "@bfb/shared";
import { Kit } from "./meshkit.ts";
import type { Fx } from "./fx.ts";

interface Dummy extends Target { hp: number; down: number; mesh: THREE.Mesh; home: [number, number, number]; t: number }

/** Shopping mannequins on the test range, for weapon tuning before multiplayer. */
export class Dummies {
  readonly list: Dummy[] = [];

  constructor(scene: THREE.Scene, spots: [number, number, number][], private fx: Fx) {
    const k = new Kit();
    k.box(0.5, 0.75, 0.3, 0, 1.05, 0, 0xe8e2d6);
    k.box(0.2, 0.7, 0.2, -0.13, 0.35, 0, 0xd8d2c6);
    k.box(0.2, 0.7, 0.2, 0.13, 0.35, 0, 0xd8d2c6);
    k.sphere(0.17, 0, 1.63, 0, 0xf0ebe0);
    k.box(0.52, 0.12, 0.32, 0, 1.38, 0, 0xff3b3b);
    const geo = k.build();
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    spots.forEach((p, i) => {
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      this.list.push({ id: `dummy${i}`, x: p[0], y: p[1], z: p[2], hp: MAX_HEALTH, down: 0, mesh, home: p, t: i });
    });
  }

  targets(): Target[] {
    return this.list.filter((d) => d.down <= 0);
  }

  /** Applies a local hit. Returns "kill", "head", "body" or null. */
  damage(hit: ShotHit, weapon: number): "kill" | "head" | "body" | null {
    const d = this.list.find((x) => x.id === hit.target);
    if (!d || d.down > 0) return null;
    const w = WEAPONS[weapon];
    d.hp -= hit.head ? w.head : w.body;
    if (d.hp <= 0) {
      d.down = 3;
      this.fx.tagBurst(d.x, d.y, d.z);
      return "kill";
    }
    return hit.head ? "head" : "body";
  }

  update(dt: number) {
    for (const d of this.list) {
      d.t += dt;
      if (d.down > 0) {
        d.down -= dt;
        if (d.down <= 0) d.hp = MAX_HEALTH;
      }
      // Strafe slowly so moving targets can be tested too.
      d.x = d.home[0] + Math.sin(d.t * 0.7) * 2;
      d.mesh.position.set(d.x, d.y, d.z);
      d.mesh.visible = d.down <= 0;
    }
  }
}
