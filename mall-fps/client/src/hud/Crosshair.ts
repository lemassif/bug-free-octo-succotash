import { STEADY_SECONDS, WEAPONS, type PlayerState } from "@bfb/shared";

/** Crosshair, reload ring, hit marker and the sniper scope overlay. */
export class Crosshair {
  readonly el = document.createElement("div");
  private lines: HTMLElement[] = [];
  private ring: SVGCircleElement;
  private ringWrap: HTMLElement;
  private marker: HTMLElement;
  private markerT = 0;
  private scope: HTMLElement;
  private steadyBar: HTMLElement;
  private steadyFill: HTMLElement;
  private dot: HTMLElement;

  constructor(root: HTMLElement) {
    this.el.className = "xh";
    this.el.innerHTML = `
      <div class="xh-dot"></div>
      <i class="xh-l t"></i><i class="xh-l b"></i><i class="xh-l l"></i><i class="xh-l r"></i>
      <div class="xh-ring"><svg viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="26"/><circle class="fg" cx="32" cy="32" r="26"/></svg><span>RELOADING</span></div>
      <div class="xh-hit"><i></i><i></i><i></i><i></i></div>`;
    root.appendChild(this.el);
    this.lines = [...this.el.querySelectorAll<HTMLElement>(".xh-l")];
    this.ring = this.el.querySelector(".xh-ring .fg")!;
    this.ringWrap = this.el.querySelector(".xh-ring")!;
    this.marker = this.el.querySelector(".xh-hit")!;
    this.dot = this.el.querySelector(".xh-dot")!;
    this.scope = document.createElement("div");
    this.scope.className = "scope";
    this.scope.innerHTML = `<div class="scope-lens"><i class="h"></i><i class="v"></i><b></b></div><div class="steady"><div class="steady-fill"></div><span>HOLD SHIFT TO STEADY</span></div>`;
    root.appendChild(this.scope);
    this.steadyBar = this.scope.querySelector(".steady")!;
    this.steadyFill = this.scope.querySelector(".steady-fill")!;
  }

  hit(kind: "body" | "head" | "kill") {
    this.marker.className = `xh-hit show ${kind}`;
    this.markerT = kind === "kill" ? 0.35 : 0.18;
  }

  update(dt: number, st: PlayerState, spreadRad: number, fovDeg: number, scopeShown: boolean, steady: number, steadying: boolean) {
    const px = (spreadRad / ((fovDeg * Math.PI) / 180)) * innerHeight;
    const gap = 4 + Math.min(60, px);
    const [t, b, l, r] = this.lines;
    t.style.transform = `translate(-50%, ${-gap - 10}px)`;
    b.style.transform = `translate(-50%, ${gap}px)`;
    l.style.transform = `translate(${-gap - 10}px, -50%)`;
    r.style.transform = `translate(${gap}px, -50%)`;
    const showLines = !scopeShown && st.alive;
    for (const x of this.lines) x.style.display = showLines ? "" : "none";
    this.dot.style.display = showLines ? "" : "none";

    const w = WEAPONS[st.weapon];
    if (st.reload > 0 && st.alive) {
      const p = 1 - st.reload / w.reload;
      const c = 2 * Math.PI * 26;
      this.ring.style.strokeDasharray = `${c}`;
      this.ring.style.strokeDashoffset = `${c * (1 - p)}`;
      this.ringWrap.style.display = "";
    } else this.ringWrap.style.display = "none";

    this.markerT -= dt;
    if (this.markerT <= 0) this.marker.classList.remove("show");

    this.scope.style.display = scopeShown ? "" : "none";
    this.steadyFill.style.width = `${(steady / STEADY_SECONDS) * 100}%`;
    this.steadyBar.classList.toggle("on", steadying);
  }
}
