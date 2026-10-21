import * as THREE from "three";
import { WEAPONS, type PlayerState } from "@bfb/shared";
import { Kit } from "./meshkit.ts";

/** The Markdown AR: a bright orange price-tag gun with a drum of tags. */
export function rifleGeometry() {
  const k = new Kit();
  const orange = 0xff7a1a, dark = 0x26262c, tag = 0xfff3c4, red = 0xe23b3b;
  k.box(0.09, 0.11, 0.55, 0, 0, 0, orange);
  k.box(0.07, 0.07, 0.32, 0, 0.01, -0.42, dark);
  k.cyl(0.018, 0.018, 0.18, 0, 0.01, -0.66, dark, Math.PI / 2);
  k.box(0.06, 0.16, 0.08, 0, -0.12, 0.12, dark, 0.25);
  k.box(0.055, 0.2, 0.09, 0, -0.15, -0.1, tag, -0.15);
  k.box(0.08, 0.1, 0.2, 0, -0.01, 0.34, dark);
  k.box(0.03, 0.04, 0.12, 0, 0.08, -0.05, dark);
  // Swinging price tag on the barrel.
  k.box(0.004, 0.07, 0.05, 0.05, -0.04, -0.52, red);
  k.box(0.006, 0.03, 0.03, 0.052, -0.03, -0.52, tag);
  return k.build();
}

/** The Layaway Longshot: navy body, gold scope, receipt-roll stock. */
export function sniperGeometry() {
  const k = new Kit();
  const navy = 0x203052, gold = 0xd9a93a, dark = 0x1a1a1e, paper = 0xf1efe6;
  k.box(0.08, 0.1, 0.7, 0, 0, 0, navy);
  k.cyl(0.016, 0.02, 0.55, 0, 0.01, -0.62, dark, Math.PI / 2);
  k.cyl(0.035, 0.035, 0.32, 0, 0.1, -0.08, gold, Math.PI / 2);
  k.cyl(0.042, 0.035, 0.05, 0, 0.1, -0.25, gold, Math.PI / 2);
  k.box(0.02, 0.05, 0.03, 0, 0.06, -0.08, dark);
  k.box(0.06, 0.15, 0.08, 0, -0.11, 0.1, dark, 0.25);
  k.cyl(0.06, 0.06, 0.07, 0, -0.02, 0.4, paper, 0, 0, Math.PI / 2);
  k.box(0.05, 0.1, 0.06, 0, -0.08, -0.12, dark);
  return k.build();
}

/** First-person weapon, drawn in its own scene so it never clips into walls. */
export class Viewmodel {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(58, 1, 0.01, 10);
  private guns: THREE.Mesh[];
  private holder = new THREE.Group();
  private flash: THREE.Mesh;
  private flashT = 0;
  private kick = 0;
  private kickRot = 0;
  private t = 0;
  visible = true;

  constructor() {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.guns = [new THREE.Mesh(rifleGeometry(), mat), new THREE.Mesh(sniperGeometry(), mat)];
    for (const g of this.guns) this.holder.add(g);
    this.scene.add(this.holder);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x555566, 2.4));
    const d = new THREE.DirectionalLight(0xffffff, 1.4);
    d.position.set(0.5, 1, 0.6);
    this.scene.add(d);
    const fm = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    const fg = new THREE.PlaneGeometry(0.16, 0.16);
    this.flash = new THREE.Mesh(fg, fm);
    this.flash.visible = false;
    this.holder.add(this.flash);
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  fire(weapon: number) {
    this.kick = weapon === 1 ? 0.14 : 0.045;
    this.kickRot = weapon === 1 ? 0.25 : 0.06;
    this.flashT = 0.05;
    this.flash.rotation.z = Math.random() * Math.PI;
    this.flash.position.set(0, 0.01, weapon === 1 ? -0.92 : -0.78);
  }

  /** World-space muzzle position for tracers, given the main camera. */
  muzzleWorld(cam: THREE.Camera, weapon: number, out: THREE.Vector3) {
    // Where the barrel tip appears on screen, re-projected into the world camera.
    out.set(0.3, -0.27, -1.5);
    void weapon;
    return cam.localToWorld(out);
  }

  update(dt: number, st: PlayerState, speed: number, sprinting: boolean) {
    this.t += dt;
    const w = WEAPONS[st.weapon];
    this.guns[0].visible = st.weapon === 0;
    this.guns[1].visible = st.weapon === 1;
    this.kick = Math.max(0, this.kick - dt * (st.weapon === 1 ? 0.6 : 0.5));
    this.kickRot = Math.max(0, this.kickRot - dt * 2.2);
    this.flashT -= dt;
    this.flash.visible = this.flashT > 0;

    const move = Math.min(1, speed / 6) * (st.onGround ? 1 : 0.3);
    const bobX = Math.sin(this.t * 9) * 0.012 * move;
    const bobY = Math.abs(Math.cos(this.t * 9)) * 0.014 * move;
    let y = -0.19 - bobY, x = 0.2 + bobX, z = -0.62 + this.kick;
    let rx = this.kickRot, ry = 0, rz = 0;
    if (st.reload > 0) {
      const p = 1 - st.reload / w.reload;
      const s = Math.sin(Math.PI * p);
      y -= s * 0.14;
      rx -= s * 0.7;
      rz += s * 0.35;
    }
    if (st.switchT > 0) y -= (st.switchT / w.switchTime) * 0.4;
    if (sprinting) {
      ry += 0.5;
      rx -= 0.15;
      x -= 0.04;
    }
    this.holder.position.set(x, y, z);
    this.holder.rotation.set(rx, ry, rz);
    this.holder.visible = this.visible && st.alive;
  }
}
