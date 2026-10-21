import * as THREE from "three";
import type { Vec3 } from "@bfb/shared";

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const fwdZ = new THREE.Vector3(0, 0, 1);

interface Tracer { a: THREE.Vector3; b: THREE.Vector3; life: number; max: number; width: number }
interface Particle { p: THREE.Vector3; v: THREE.Vector3; life: number; size: number }

/** Tracers, bullet holes and sparks. Each kind is one instanced draw call. */
export class Fx {
  private tracerMesh: THREE.InstancedMesh;
  private tracers: Tracer[] = [];
  private holeMesh: THREE.InstancedMesh;
  private holeNext = 0;
  private sparkMesh: THREE.InstancedMesh;
  private sparks: Particle[] = [];
  private confettiMesh: THREE.InstancedMesh;
  private confetti: (Particle & { rot: THREE.Euler; spin: THREE.Vector3; color: THREE.Color })[] = [];
  static readonly MAX_TRACERS = 48;
  static readonly MAX_HOLES = 96;
  static readonly MAX_SPARKS = 160;
  static readonly MAX_CONFETTI = 240;

  constructor(scene: THREE.Scene) {
    const tg = new THREE.BoxGeometry(1, 1, 1);
    tg.translate(0, 0, 0.5);
    this.tracerMesh = new THREE.InstancedMesh(tg, new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), Fx.MAX_TRACERS);
    this.tracerMesh.count = 0;
    this.tracerMesh.frustumCulled = false;
    scene.add(this.tracerMesh);

    const hg = new THREE.PlaneGeometry(0.09, 0.09);
    this.holeMesh = new THREE.InstancedMesh(hg, new THREE.MeshBasicMaterial({ color: 0x1a1612, transparent: true, opacity: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), Fx.MAX_HOLES);
    this.holeMesh.count = 0;
    this.holeMesh.frustumCulled = false;
    scene.add(this.holeMesh);

    const sg = new THREE.BoxGeometry(1, 1, 1);
    this.sparkMesh = new THREE.InstancedMesh(sg, new THREE.MeshBasicMaterial({ color: 0xffd27a }), Fx.MAX_SPARKS);
    this.sparkMesh.count = 0;
    this.sparkMesh.frustumCulled = false;
    scene.add(this.sparkMesh);

    // Price tags and coupons that burst out of a knocked-out shopper.
    const cg = new THREE.PlaneGeometry(0.12, 0.07);
    this.confettiMesh = new THREE.InstancedMesh(cg, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), Fx.MAX_CONFETTI);
    this.confettiMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Fx.MAX_CONFETTI * 3), 3);
    this.confettiMesh.count = 0;
    this.confettiMesh.frustumCulled = false;
    scene.add(this.confettiMesh);
  }

  tracer(a: THREE.Vector3, b: Vec3, width = 0.018, life = 0.07) {
    if (this.tracers.length >= Fx.MAX_TRACERS) this.tracers.shift();
    this.tracers.push({ a: a.clone(), b: new THREE.Vector3(b[0], b[1], b[2]), life, max: life, width });
  }

  hole(p: Vec3, n: Vec3) {
    if (n[0] === 0 && n[1] === 0 && n[2] === 0) return;
    const nv = tmpV.set(n[0], n[1], n[2]).normalize();
    tmpQ.setFromUnitVectors(fwdZ, nv);
    tmpS.set(1, 1, 1);
    const pos = new THREE.Vector3(p[0] + n[0] * 0.01, p[1] + n[1] * 0.01, p[2] + n[2] * 0.01);
    tmpM.compose(pos, tmpQ, tmpS);
    this.holeMesh.setMatrixAt(this.holeNext, tmpM);
    this.holeNext = (this.holeNext + 1) % Fx.MAX_HOLES;
    this.holeMesh.count = Math.min(Fx.MAX_HOLES, this.holeMesh.count + 1);
    this.holeMesh.instanceMatrix.needsUpdate = true;
  }

  sparksAt(p: Vec3, n: Vec3, count = 6, speed = 3) {
    for (let i = 0; i < count; i++) {
      if (this.sparks.length >= Fx.MAX_SPARKS) this.sparks.shift();
      const v = new THREE.Vector3(n[0] + (Math.random() - 0.5) * 1.4, n[1] + Math.random() * 0.8, n[2] + (Math.random() - 0.5) * 1.4).multiplyScalar(speed * (0.5 + Math.random()));
      this.sparks.push({ p: new THREE.Vector3(p[0], p[1], p[2]), v, life: 0.25 + Math.random() * 0.2, size: 0.025 });
    }
  }

  /** A shower of price tags and coupons, used when a shopper is knocked out. */
  tagBurst(x: number, y: number, z: number) {
    const colors = [0xfff3c4, 0xff4b4b, 0xffd23c, 0x7ad46b, 0xffffff];
    for (let i = 0; i < 36; i++) {
      if (this.confetti.length >= Fx.MAX_CONFETTI) this.confetti.shift();
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 3;
      const p = {
        p: new THREE.Vector3(x, y + 1 + Math.random() * 0.6, z),
        v: new THREE.Vector3(Math.cos(a) * s, 2 + Math.random() * 4, Math.sin(a) * s),
        life: 1.6 + Math.random(),
        size: 1,
        rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        spin: new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14),
        color: new THREE.Color(colors[i % colors.length]),
      };
      this.confetti.push(p);
    }
  }

  update(dt: number) {
    let n = 0;
    this.tracers = this.tracers.filter((t) => (t.life -= dt) > 0);
    for (const t of this.tracers) {
      const len = t.a.distanceTo(t.b);
      tmpV.subVectors(t.b, t.a).normalize();
      tmpQ.setFromUnitVectors(fwdZ, tmpV);
      const w = t.width * (t.life / t.max);
      tmpS.set(w, w, len);
      tmpM.compose(t.a, tmpQ, tmpS);
      this.tracerMesh.setMatrixAt(n++, tmpM);
    }
    this.tracerMesh.count = n;
    this.tracerMesh.instanceMatrix.needsUpdate = true;

    n = 0;
    this.sparks = this.sparks.filter((s) => (s.life -= dt) > 0);
    for (const s of this.sparks) {
      s.v.y -= 12 * dt;
      s.p.addScaledVector(s.v, dt);
      tmpS.setScalar(s.size);
      tmpM.compose(s.p, tmpQ.identity(), tmpS);
      this.sparkMesh.setMatrixAt(n++, tmpM);
    }
    this.sparkMesh.count = n;
    this.sparkMesh.instanceMatrix.needsUpdate = true;

    n = 0;
    const keep: typeof this.confetti = [];
    for (const c of this.confetti) {
      c.life -= dt;
      if (c.life <= 0) continue;
      c.v.y -= 6 * dt;
      c.v.multiplyScalar(1 - 1.8 * dt);
      c.p.addScaledVector(c.v, dt);
      c.rot.x += c.spin.x * dt; c.rot.y += c.spin.y * dt; c.rot.z += c.spin.z * dt;
      tmpQ.setFromEuler(c.rot);
      tmpS.setScalar(Math.min(1, c.life * 2));
      tmpM.compose(c.p, tmpQ, tmpS);
      this.confettiMesh.setMatrixAt(n, tmpM);
      this.confettiMesh.setColorAt(n, c.color);
      keep.push(c);
      n++;
    }
    this.confetti = keep;
    if (n) this.confettiMesh.instanceColor!.needsUpdate = true;
    this.confettiMesh.count = n;
    this.confettiMesh.instanceMatrix.needsUpdate = true;
  }
}
