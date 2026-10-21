import * as THREE from "three";
import {
  Key, SCOPE_FOV, STEADY_RECHARGE, STEADY_SECONDS, WEAPONS, PLAYER,
  traceShot, viewDir, type Input, type PlayerState, type ShotHit, type StepResult, type Target, type Vec3,
} from "@bfb/shared";
import type { Game } from "./Game.ts";
import { Viewmodel } from "./viewmodel.ts";
import { Fx } from "./fx.ts";
import { sfx } from "./audio.ts";

const muzzle = new THREE.Vector3();

/** Client-side weapon feel: spread, recoil, scope, steady aim, effects.
 *  Ammo and fire timing come from the shared step, so they match the server. */
export class WeaponController {
  readonly viewmodel = new Viewmodel();
  readonly fx: Fx;
  bloom = 0;
  steady = STEADY_SECONDS;
  winded = 0;
  steadying = false;
  private recoilDebt = 0;
  private sinceShot = 10;
  private t = 0;
  private sway = { yaw: 0, pitch: 0 };
  private lastReload = 0;
  fov = 75;
  /** Who can be hit, at the positions this client currently sees them. */
  targets: () => Iterable<Target> = () => [];
  /** Called for every shot this client fires, after the local trace. */
  onShot: (hit: ShotHit, inp: Input, origin: Vec3, dir: Vec3) => void = () => {};

  constructor(private game: Game) {
    this.fx = new Fx(game.scene);
    game.beforeStep.push((inp, st) => this.beforeStep(inp, st));
    game.onStep.push((inp, st, res) => this.afterStep(inp, st, res));
    game.onFrame.push((dt) => this.frame(dt));
    game.onResize.push((a) => this.viewmodel.resize(a));
    this.viewmodel.resize(game.camera.aspect);
    game.overlays.push(() => {
      if (!this.viewmodel.visible) return;
      game.renderer.clearDepth();
      game.renderer.render(this.viewmodel.scene, this.viewmodel.camera);
    });
  }

  /** Current spread cone half-angle in radians. */
  spread(st: PlayerState): number {
    const w = WEAPONS[st.weapon];
    if (st.weapon === 1 && st.scoped) return 0;
    const speed = Math.hypot(st.vx, st.vz);
    let s = w.spread.base + this.bloom;
    s += w.spread.move * Math.min(1, speed / PLAYER.walk);
    if (!st.onGround) s += w.spread.air;
    return s;
  }

  private beforeStep(inp: Input, st: PlayerState) {
    if (!(inp.k & Key.Fire)) return;
    // Attach an aim direction in case this step fires. The server uses it
    // only if its own copy of the step fires too.
    const yaw = inp.yaw + this.sway.yaw;
    const pitch = inp.pitch + this.sway.pitch;
    const d = viewDir(yaw, pitch);
    const s = this.spread(st);
    if (s > 0) {
      const right: Vec3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
      const up: Vec3 = [
        d[1] * right[2] - d[2] * right[1],
        d[2] * right[0] - d[0] * right[2],
        d[0] * right[1] - d[1] * right[0],
      ];
      const a = Math.random() * Math.PI * 2;
      const r = s * Math.sqrt(Math.random());
      const ox = Math.cos(a) * r, oy = Math.sin(a) * r;
      for (let i = 0; i < 3; i++) d[i] += right[i] * ox - up[i] * oy;
      const l = Math.hypot(d[0], d[1], d[2]);
      d[0] /= l; d[1] /= l; d[2] /= l;
    }
    inp.aim = d;
  }

  private afterStep(inp: Input, st: PlayerState, res: StepResult) {
    if (st.reload > 0 && this.lastReload === 0) sfx.reload();
    this.lastReload = st.reload;
    if (!res.fired || !inp.aim) {
      if (inp.k & Key.Fire && st.cool === 0 && (st.weapon === 0 ? st.ammo0 : st.ammo1) === 0) sfx.empty();
      return;
    }
    const w = WEAPONS[st.weapon];
    this.sinceShot = 0;
    this.bloom = Math.min(w.spread.maxBloom, this.bloom + w.spread.bloom);
    const kick = w.recoil.pitch * (0.85 + Math.random() * 0.3);
    this.recoilDebt += kick;
    this.game.controls.kick(kick, (Math.random() - 0.5) * 2 * w.recoil.yaw);
    this.viewmodel.fire(st.weapon);
    if (st.weapon === 0) sfx.rifle(); else sfx.sniper();

    const origin: Vec3 = [st.x, st.y + PLAYER.eye, st.z];
    const hit = traceShot(this.game.world, origin, inp.aim, w.range, this.targets(), null);
    this.viewmodel.muzzleWorld(this.game.camera, st.weapon, muzzle);
    this.fx.tracer(muzzle, hit.point, st.weapon === 1 ? 0.035 : 0.018, st.weapon === 1 ? 0.18 : 0.07);
    if (hit.target) this.fx.sparksAt(hit.point, hit.normal, 8, 2.5);
    else if (hit.t < w.range) {
      this.fx.hole(hit.point, hit.normal);
      this.fx.sparksAt(hit.point, hit.normal, 4, 2);
    }
    this.onShot(hit, inp, origin, inp.aim);
  }

  private frame(dt: number) {
    this.t += dt;
    const g = this.game;
    const st = g.me;
    const w = WEAPONS[st.weapon];
    this.sinceShot += dt;
    this.bloom = Math.max(0, this.bloom - dt * (this.sinceShot > 0.15 ? 0.12 : 0.02));
    if (this.sinceShot > 0.12 && this.recoilDebt > 0) {
      const r = Math.min(this.recoilDebt, this.recoilDebt * w.recoil.recover * dt + 0.0005);
      this.recoilDebt -= r;
      g.controls.kick(-r * 0.85, 0);
    }

    // Scope, sway and hold-Shift-to-steady.
    const scoped = st.scoped && st.alive;
    const wantSteady = scoped && g.controls.held("ShiftLeft") || scoped && g.controls.held("ShiftRight");
    this.winded = Math.max(0, this.winded - dt);
    if (wantSteady && this.steady > 0 && this.winded === 0) {
      this.steadying = true;
      this.steady = Math.max(0, this.steady - dt);
      if (this.steady === 0) this.winded = 1.5;
    } else {
      this.steadying = false;
      this.steady = Math.min(STEADY_SECONDS, this.steady + dt * STEADY_RECHARGE);
    }
    const amp = !scoped ? 0 : this.steadying ? 0.0006 : this.winded > 0 ? 0.03 : 0.012;
    const targetYaw = Math.sin(this.t * 1.1) * amp + Math.sin(this.t * 2.3 + 1) * amp * 0.4;
    const targetPitch = Math.sin(this.t * 1.6 + 0.5) * amp * 0.8;
    const k = Math.min(1, dt * 6);
    this.sway.yaw += (targetYaw - this.sway.yaw) * k;
    this.sway.pitch += (targetPitch - this.sway.pitch) * k;

    const targetFov = scoped ? SCOPE_FOV : g.baseFov;
    this.fov += (targetFov - this.fov) * Math.min(1, dt * 16);
    if (Math.abs(this.fov - g.camera.fov) > 0.01) {
      g.camera.fov = this.fov;
      g.camera.updateProjectionMatrix();
    }
    g.controls.sensitivity = 0.0022 * (this.fov / g.baseFov);
    g.camera.rotation.x += this.sway.pitch;
    g.camera.rotation.y += this.sway.yaw;

    const speed = Math.hypot(st.vx, st.vz);
    const sprinting = speed > PLAYER.walk + 0.5 && st.onGround;
    this.viewmodel.visible = this.fov > 40;
    this.viewmodel.update(dt, st, speed, sprinting);
    this.fx.update(dt);
  }

  /** Visual-only tracer for someone else's shot. */
  remoteShot(from: THREE.Vector3, to: Vec3, weapon: number, distToMe: number) {
    this.fx.tracer(from, to, weapon === 1 ? 0.04 : 0.02, weapon === 1 ? 0.2 : 0.08);
    this.fx.hole(to, [0, 0, 0]);
    if (weapon === 0) sfx.rifle(distToMe); else sfx.sniper(distToMe);
  }
}
