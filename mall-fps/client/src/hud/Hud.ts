import { MAX_HEALTH, WEAPONS, type PlayerState } from "@bfb/shared";
import { Crosshair } from "./Crosshair.ts";

/** Heads-up display root. Each panel is plain DOM over the canvas. */
export class Hud {
  readonly root = document.createElement("div");
  readonly crosshair: Crosshair;
  private ammo = document.createElement("div");
  private health = document.createElement("div");
  private last = "";

  constructor(parent: HTMLElement) {
    this.root.className = "hud";
    parent.appendChild(this.root);
    this.crosshair = new Crosshair(this.root);
    this.ammo.className = "ammo";
    this.health.className = "health";
    this.root.append(this.ammo, this.health);
  }

  update(st: PlayerState, hp: number) {
    const w = WEAPONS[st.weapon];
    const ammo = st.weapon === 0 ? st.ammo0 : st.ammo1;
    const key = `${st.weapon}|${ammo}|${st.reload > 0}|${Math.ceil(hp)}|${st.alive}`;
    if (key === this.last) return;
    this.last = key;
    const low = ammo <= Math.ceil(w.mag * 0.2);
    this.ammo.innerHTML = `<div class="ammo-name">${w.name}</div>
      <div class="ammo-count ${low ? "low" : ""}"><b>${ammo}</b><span>/ ${w.mag}</span></div>
      <div class="ammo-keys"><span class="${st.weapon === 0 ? "on" : ""}">1 AR</span><span class="${st.weapon === 1 ? "on" : ""}">2 SNIPER</span></div>`;
    const pct = Math.max(0, hp) / MAX_HEALTH;
    this.health.innerHTML = `<div class="hp-bar"><div class="hp-fill ${pct < 0.35 ? "low" : ""}" style="width:${pct * 100}%"></div></div><b>${Math.max(0, Math.ceil(hp))}</b>`;
  }
}
