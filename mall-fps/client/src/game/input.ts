import { Key } from "@bfb/shared";

/** Keyboard and mouse state. Mouse look accumulates into yaw and pitch,
 *  which the game samples once per fixed step. */
export class Controls {
  yaw = 0;
  pitch = 0;
  sensitivity = 0.0022;
  locked = false;
  /** Set by tests and by the drag-look fallback when pointer lock is missing. */
  forceActive = false;
  private keys = new Set<string>();
  private mouse = new Set<number>();
  private wheelWeapon = -1;
  private pendingWeapon = -1;
  private dragging = false;
  testKeys = 0;
  onLockChange: (locked: boolean) => void = () => {};

  constructor(private el: HTMLElement) {
    addEventListener("keydown", (e) => {
      if (!this.active) return;
      this.keys.add(e.code);
      if (e.code === "Digit1") this.pendingWeapon = 0;
      if (e.code === "Digit2") this.pendingWeapon = 1;
      if (e.code === "KeyQ") this.wheelWeapon = 2;
      if (["Space", "Tab", "ShiftLeft", "ShiftRight"].includes(e.code)) e.preventDefault();
    });
    addEventListener("keyup", (e) => this.keys.delete(e.code));
    addEventListener("blur", () => { this.keys.clear(); this.mouse.clear(); });
    el.addEventListener("mousedown", (e) => {
      if (!this.active) return;
      this.mouse.add(e.button);
      if (!this.locked) this.dragging = true;
    });
    addEventListener("mouseup", (e) => { this.mouse.delete(e.button); this.dragging = false; });
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    addEventListener("wheel", (e) => { if (this.active) this.wheelWeapon = 2; void e; }, { passive: true });
    addEventListener("mousemove", (e) => {
      if (!this.locked && !(this.forceActive && this.dragging)) return;
      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch));
    });
    document.addEventListener("pointerlockchange", () => {
      this.locked = document.pointerLockElement === el;
      if (!this.locked) { this.keys.clear(); this.mouse.clear(); }
      this.onLockChange(this.locked);
    });
  }

  get active() {
    return this.locked || this.forceActive;
  }

  lock() {
    try {
      const p = this.el.requestPointerLock() as unknown as Promise<void> | undefined;
      if (p && typeof p.catch === "function") p.catch(() => (this.forceActive = true));
    } catch {
      this.forceActive = true;
    }
  }

  unlock() {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  /** Add to the view angles (recoil, sniper kick). */
  kick(dPitch: number, dYaw: number) {
    this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch + dPitch));
    this.yaw += dYaw;
  }

  held(code: string) {
    return this.keys.has(code);
  }

  sample(currentWeapon: number): number {
    let k = this.testKeys;
    if (this.active) {
      const h = (c: string) => this.keys.has(c);
      if (h("KeyW") || h("ArrowUp")) k |= Key.Fwd;
      if (h("KeyS") || h("ArrowDown")) k |= Key.Back;
      if (h("KeyA") || h("ArrowLeft")) k |= Key.Left;
      if (h("KeyD") || h("ArrowRight")) k |= Key.Right;
      if (h("Space")) k |= Key.Jump;
      if (h("ShiftLeft") || h("ShiftRight")) k |= Key.Sprint;
      if (h("KeyR")) k |= Key.Reload;
      if (this.mouse.has(0)) k |= Key.Fire;
      if (this.mouse.has(2)) k |= Key.Scope;
    }
    let w = this.pendingWeapon;
    if (this.wheelWeapon === 2) w = currentWeapon === 0 ? 1 : 0;
    this.pendingWeapon = -1;
    this.wheelWeapon = -1;
    if (w === 0) k |= Key.W1;
    if (w === 1) k |= Key.W2;
    return k;
  }
}
