// Weapon stats. Spread and recoil are client-side aim effects; the server
// trusts the aim direction but checks it against the player's view.

export interface WeaponDef {
  id: number;
  name: string;
  short: string;
  mag: number;
  interval: number;
  reload: number;
  body: number;
  head: number;
  range: number;
  /** Spread in radians: still, moving, airborne, per-shot bloom, bloom cap. */
  spread: { base: number; move: number; air: number; bloom: number; maxBloom: number };
  recoil: { pitch: number; yaw: number; recover: number };
  switchTime: number;
}

export const RIFLE: WeaponDef = {
  id: 0, name: "Markdown AR", short: "AR", mag: 30, interval: 0.1, reload: 2.0,
  body: 22, head: 48, range: 140,
  spread: { base: 0.004, move: 0.018, air: 0.05, bloom: 0.0035, maxBloom: 0.03 },
  recoil: { pitch: 0.011, yaw: 0.004, recover: 6 },
  switchTime: 0.4,
};

export const SNIPER: WeaponDef = {
  id: 1, name: "Layaway Longshot", short: "SNIPER", mag: 5, interval: 1.15, reload: 2.8,
  body: 80, head: 200, range: 260,
  spread: { base: 0.07, move: 0.12, air: 0.2, bloom: 0, maxBloom: 0 },
  recoil: { pitch: 0.07, yaw: 0.01, recover: 3 },
  switchTime: 0.55,
};

export const WEAPONS = [RIFLE, SNIPER];

export const SCOPE_FOV = 18;
/** Seconds of steady aim from holding Shift while scoped, and recharge rate. */
export const STEADY_SECONDS = 3.5;
export const STEADY_RECHARGE = 0.6;
