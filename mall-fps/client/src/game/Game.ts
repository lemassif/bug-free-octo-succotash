import * as THREE from "three";
import {
  DT, PLAYER, World, copyState, newPlayerState, stepPlayer,
  type Input, type MapData, type PlayerState, type StepResult,
} from "@bfb/shared";
import { Controls } from "./input.ts";
import { buildLevelMeshes, proceduralTextures, type BakedColors, type TextureSet } from "../world/LevelView.ts";

export interface GameOptions {
  map: MapData;
  textures?: TextureSet;
  baked?: BakedColors | null;
}

/** Owns the renderer, the level, and the local player's predicted state. */
export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: Controls;
  readonly world: World;
  readonly map: MapData;
  /** Predicted local state after the latest fixed step. */
  readonly me: PlayerState;
  private prev: PlayerState;
  private acc = 0;
  private last = performance.now();
  seq = 0;
  baseFov = 75;
  /** Hooks for later layers (weapons, network, HUD). */
  beforeStep: Array<(inp: Input, st: PlayerState) => void> = [];
  onStep: Array<(inp: Input, st: PlayerState, res: StepResult) => void> = [];
  onFrame: Array<(dt: number, alpha: number) => void> = [];
  /** Extra passes drawn after the world, such as the first-person weapon. */
  overlays: Array<() => void> = [];
  onResize: Array<(aspect: number) => void> = [];
  private fps = { frames: 0, t: 0, value: 0 };
  debugEl: HTMLElement | null = null;

  constructor(canvas: HTMLCanvasElement, opts: GameOptions) {
    this.map = opts.map;
    this.world = new World(opts.map.solids);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.info.autoReset = false;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, 1, 0.05, 400);
    this.camera.rotation.order = "YXZ";
    this.scene.background = new THREE.Color(0x9fc4e8);
    this.scene.add(new THREE.HemisphereLight(0xfff4e0, 0x404858, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(0.4, 1, 0.25);
    this.scene.add(sun);

    const tex = opts.textures ?? proceduralTextures(this.renderer.capabilities.getMaxAnisotropy());
    this.scene.add(buildLevelMeshes(opts.map, tex, opts.baked ?? null));

    const sp = opts.map.spawns[0][0];
    this.me = newPlayerState(sp[0], sp[1], sp[2], opts.map.spawnYaw[0]);
    this.prev = copyState(this.me, newPlayerState());
    this.controls = new Controls(canvas);
    this.controls.yaw = this.me.yaw;

    addEventListener("resize", () => this.resize());
    this.resize();
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const f of this.onResize) f(w / h);
  }

  start() {
    const loop = () => {
      requestAnimationFrame(loop);
      this.frame();
    };
    requestAnimationFrame(loop);
  }

  /** Teleport the local player (spawns, tests). */
  place(x: number, y: number, z: number, yaw = this.controls.yaw) {
    const s = newPlayerState(x, y, z, yaw);
    s.weapon = this.me.weapon;
    copyState(s, this.me);
    copyState(s, this.prev);
    this.controls.yaw = yaw;
    this.controls.pitch = 0;
  }

  /** Builds the input for the next fixed step from the current controls. */
  makeInput(): Input {
    return { s: ++this.seq, k: this.controls.sample(this.me.weapon), yaw: this.controls.yaw, pitch: this.controls.pitch };
  }

  /** One fixed step of local prediction. The network layer overrides this. */
  step() {
    const inp = this.makeInput();
    for (const f of this.beforeStep) f(inp, this.me);
    copyState(this.me, this.prev);
    const res = stepPlayer(this.me, inp, this.world);
    for (const f of this.onStep) f(inp, this.me, res);
  }

  frame() {
    const now = performance.now();
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.25) dt = 0.25;
    this.acc += dt;
    while (this.acc >= DT) {
      this.step();
      this.acc -= DT;
    }
    const alpha = this.acc / DT;
    const p = this.prev, c = this.me;
    this.camera.position.set(
      p.x + (c.x - p.x) * alpha,
      p.y + (c.y - p.y) * alpha + PLAYER.eye,
      p.z + (c.z - p.z) * alpha,
    );
    this.camera.rotation.set(this.controls.pitch, this.controls.yaw, 0);
    for (const f of this.onFrame) f(dt, alpha);
    this.renderer.info.reset();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    for (const f of this.overlays) f();
    this.updateDebug(dt);
  }

  private updateDebug(dt: number) {
    const f = this.fps;
    f.frames++;
    f.t += dt;
    if (f.t >= 0.5) {
      f.value = Math.round(f.frames / f.t);
      f.frames = 0;
      f.t = 0;
      if (this.debugEl) {
        const i = this.renderer.info;
        const m = this.me;
        this.debugEl.textContent =
          `fps ${f.value}  calls ${i.render.calls}  tris ${(i.render.triangles / 1000).toFixed(0)}k\n` +
          `pos ${m.x.toFixed(2)} ${m.y.toFixed(2)} ${m.z.toFixed(2)}  ground ${m.onGround ? 1 : 0}  ` +
          `vel ${Math.hypot(m.vx, m.vz).toFixed(1)}`;
      }
    }
  }

  get fpsValue() {
    return this.fps.value;
  }
}
