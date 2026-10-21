import { DT, PLAYER } from "./constants.ts";
import { Key, type Input, type PlayerState, type Solid } from "./types.ts";
import { World, topOver } from "./world.ts";
import { WEAPONS } from "./weapons.ts";

const hits: Solid[] = [];
const R = PLAYER.radius;
const H = PLAYER.height;

export interface StepResult {
  fired: boolean;
}

/** One fixed 1/60 s step of a player. Pure and deterministic: the client
 *  runs it for prediction, the server runs it for the truth. */
export function stepPlayer(st: PlayerState, inp: Input, world: World): StepResult {
  const res: StepResult = { fired: false };
  if (!st.alive) return res;
  st.yaw = inp.yaw;
  st.pitch = Math.max(-1.5, Math.min(1.5, inp.pitch));
  stepWeapon(st, inp.k, res);
  stepMovement(st, inp.k, world);
  return res;
}

function stepWeapon(st: PlayerState, k: number, res: StepResult) {
  // Snap tiny float leftovers to zero so a 0.1 s gun fires every 6 steps.
  st.cool = st.cool - DT < 1e-9 ? 0 : st.cool - DT;
  if (st.switchT > 0) st.switchT = st.switchT - DT < 1e-9 ? 0 : st.switchT - DT;
  const want = k & Key.W1 ? 0 : k & Key.W2 ? 1 : st.weapon;
  if (want !== st.weapon) {
    st.weapon = want;
    st.switchT = WEAPONS[want].switchTime;
    st.reload = 0;
  }
  const w = WEAPONS[st.weapon];
  if (st.reload > 0) {
    st.reload -= DT;
    if (st.reload <= 1e-9) {
      st.reload = 0;
      if (st.weapon === 0) st.ammo0 = w.mag; else st.ammo1 = w.mag;
    }
  }
  const ammo = st.weapon === 0 ? st.ammo0 : st.ammo1;
  if (k & Key.Reload && st.reload === 0 && ammo < w.mag && st.switchT === 0) st.reload = w.reload;
  st.scoped = !!(k & Key.Scope) && st.weapon === 1 && st.reload === 0 && st.switchT === 0;
  if (k & Key.Fire && st.cool === 0 && st.switchT === 0 && st.reload === 0) {
    if (ammo > 0) {
      if (st.weapon === 0) st.ammo0--; else st.ammo1--;
      st.cool = w.interval;
      res.fired = true;
      if (ammo - 1 === 0) st.reload = w.reload;
    } else st.reload = w.reload;
  }
}

function stepMovement(st: PlayerState, k: number, world: World) {
  const fwd = (k & Key.Fwd ? 1 : 0) - (k & Key.Back ? 1 : 0);
  const str = (k & Key.Right ? 1 : 0) - (k & Key.Left ? 1 : 0);
  const sy = Math.sin(st.yaw), cy = Math.cos(st.yaw);
  // Three.js camera convention: yaw 0 looks down -z.
  let wx = -sy * fwd + cy * str;
  let wz = -cy * fwd - sy * str;
  const wl = Math.hypot(wx, wz);
  if (wl > 0) { wx /= wl; wz /= wl; }
  const sprint = !!(k & Key.Sprint) && fwd > 0 && !st.scoped && st.reload === 0;
  const speed = st.scoped ? PLAYER.scoped : sprint ? PLAYER.sprint : PLAYER.walk;
  const f = Math.min(1, (st.onGround ? PLAYER.groundRate : PLAYER.airRate) * DT);
  st.vx += (wx * speed - st.vx) * f;
  st.vz += (wz * speed - st.vz) * f;

  if (k & Key.Jump && st.onGround) {
    st.vy = PLAYER.jump;
    st.onGround = false;
  }
  st.vy = Math.max(-40, st.vy - PLAYER.gravity * DT);

  let dx = st.vx * DT, dz = st.vz * DT;
  if (st.onGround) {
    // Escalator belts carry whoever stands on them.
    const g = world.groundBelow(st.x, st.y, st.z, R, 0.05);
    const r = g?.solid.ramp;
    if (r?.conveyor) {
      if (r.axis === 0) dx += r.rise * r.conveyor * DT; else dz += r.rise * r.conveyor * DT;
    }
  }
  const wasGround = st.onGround;
  moveAxis(st, 0, dx, world, wasGround);
  moveAxis(st, 2, dz, world, wasGround);

  // Vertical.
  const ny = st.y + st.vy * DT;
  world.overlaps(st.x, ny, st.z, R, H, hits);
  if (hits.length) {
    if (st.vy <= 0) {
      let top = -Infinity;
      for (const s of hits) top = Math.max(top, topOver(s, st.x - R, st.x + R, st.z - R, st.z + R));
      st.y = top;
      st.vy = 0;
      st.onGround = true;
    } else {
      let bottom = Infinity;
      for (const s of hits) bottom = Math.min(bottom, s.min[1]);
      st.y = Math.min(st.y, bottom - H - 1e-4);
      st.vy = 0;
    }
  } else {
    st.y = ny;
    st.onGround = false;
    if (wasGround && st.vy <= 0) {
      // Stick to ramps and stairs on the way down instead of hopping.
      const g = world.groundBelow(st.x, st.y, st.z, R, PLAYER.snapDown);
      if (g) {
        st.y = g.y;
        st.vy = 0;
        st.onGround = true;
      }
    }
  }
}

function moveAxis(st: PlayerState, axis: 0 | 2, delta: number, world: World, grounded: boolean) {
  if (delta === 0) return;
  const old = axis === 0 ? st.x : st.z;
  const next = old + delta;
  const x = axis === 0 ? next : st.x;
  const z = axis === 2 ? next : st.z;
  world.overlaps(x, st.y, z, R, H, hits);
  if (!hits.length) {
    if (axis === 0) st.x = next; else st.z = next;
    return;
  }
  if (grounded) {
    let top = -Infinity;
    for (const s of hits) top = Math.max(top, topOver(s, x - R, x + R, z - R, z + R));
    if (top - st.y <= PLAYER.step) {
      const blocked = world.overlaps(x, top + 1e-4, z, R, H, hits).length > 0;
      if (!blocked) {
        st.y = top;
        if (axis === 0) st.x = next; else st.z = next;
        return;
      }
      world.overlaps(x, st.y, z, R, H, hits);
    }
  }
  // Blocked: slide up to the nearest face instead of stopping short.
  let allowed = delta;
  for (const s of hits) {
    if (delta > 0) allowed = Math.min(allowed, s.min[axis] - (old + R) - 1e-4);
    else allowed = Math.max(allowed, s.max[axis] - (old - R) + 1e-4);
  }
  if ((delta > 0 && allowed < 0) || (delta < 0 && allowed > 0)) allowed = 0;
  if (axis === 0) { st.x = old + allowed; st.vx = 0; } else { st.z = old + allowed; st.vz = 0; }
}
