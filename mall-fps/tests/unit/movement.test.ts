import { describe, expect, it } from "vitest";
import { World, buildGym, newPlayerState, stepPlayer, copyState, Key, type Input, type PlayerState } from "../../shared/src/index.ts";

const world = new World(buildGym().solids);

function run(st: PlayerState, k: number, yaw: number, steps: number, seq = { s: 0 }) {
  for (let i = 0; i < steps; i++) stepPlayer(st, { s: ++seq.s, k, yaw, pitch: 0 }, world);
  return st;
}

// yaw for a direction: forward is (-sin yaw, -cos yaw).
const YAW_POS_X = -Math.PI / 2;
const YAW_NEG_X = Math.PI / 2;
const YAW_NEG_Z = 0;

describe("movement", () => {
  it("lands on the floor and stands still", () => {
    const st = run(newPlayerState(0, 2, 10), 0, 0, 120);
    expect(st.onGround).toBe(true);
    expect(st.y).toBeCloseTo(0, 5);
  });

  it("walks up the stairs onto the platform", () => {
    const st = run(newPlayerState(-6, 0, -5), Key.Fwd, YAW_POS_X, 150);
    expect(st.x).toBeGreaterThan(5);
    expect(st.y).toBeCloseTo(3, 3);
  });

  it("walks up the ramp", () => {
    const st = run(newPlayerState(5, 0, 14), Key.Fwd, YAW_NEG_Z, 200);
    expect(st.z).toBeLessThan(1);
    expect(st.y).toBeCloseTo(3, 3);
  });

  it("is carried up the escalator while standing still", () => {
    const st = run(newPlayerState(19.5, 0, -3.3), 0, 0, 60);
    expect(st.onGround).toBe(true);
    run(st, 0, 0, 60 * 12);
    expect(st.y).toBeCloseTo(3, 2);
    expect(st.x).toBeLessThan(12.5);
  });

  it("is blocked by walls and slides along them", () => {
    const st = run(newPlayerState(-11, 0, -8), Key.Fwd, YAW_NEG_X, 60);
    expect(st.x).toBeGreaterThan(-13 + 0.34);
    expect(st.x).toBeLessThan(-13 + 0.36);
    const st2 = run(newPlayerState(-11, 0, -8), Key.Fwd | Key.Left, YAW_NEG_X, 60);
    expect(st2.z).toBeGreaterThan(-6);
    expect(st2.x).toBeGreaterThan(-13 + 0.34);
  });

  it("steps up a low ledge but not a tall box", () => {
    const st = run(newPlayerState(-5, 0, -8), Key.Fwd, YAW_NEG_Z, 40);
    expect(st.y).toBeCloseTo(0.4, 3);
    const st2 = run(newPlayerState(-9, 0, 4), Key.Back, YAW_NEG_Z, 60);
    expect(st2.y).toBeCloseTo(0, 3);
    expect(st2.z).toBeLessThan(6);
  });

  it("jumps onto the 1.2 m crate", () => {
    const st = run(newPlayerState(-9, 0, 4), Key.Back, YAW_NEG_Z, 10);
    run(st, Key.Back | Key.Jump, YAW_NEG_Z, 1);
    run(st, Key.Back, YAW_NEG_Z, 60);
    expect(st.y).toBeCloseTo(1.2, 3);
  });

  it("is deterministic: replaying the same inputs gives the same state", () => {
    const inputs: Input[] = [];
    for (let i = 0; i < 600; i++) {
      const k = (i % 97 < 60 ? Key.Fwd : Key.Left) | (i % 50 === 0 ? Key.Jump : 0) | (i % 3 === 0 ? Key.Fire : 0);
      inputs.push({ s: i + 1, k, yaw: Math.sin(i / 40) * 2, pitch: 0 });
    }
    const a = newPlayerState(-10, 0, 10);
    const b = newPlayerState(-10, 0, 10);
    for (const inp of inputs) stepPlayer(a, inp, world);
    // Rewind half way, copy the state, then replay the rest like reconciliation does.
    for (const inp of inputs.slice(0, 300)) stepPlayer(b, inp, world);
    const c = copyState(b, newPlayerState());
    for (const inp of inputs.slice(300)) stepPlayer(c, inp, world);
    expect(c).toEqual(a);
  });
});

describe("weapons", () => {
  it("fires at the rifle rate and reloads when empty", () => {
    const st = run(newPlayerState(0, 0, 10), 0, 0, 30);
    let shots = 0;
    for (let i = 0; i < 60 * 6; i++) if (stepPlayer(st, { s: i, k: Key.Fire, yaw: 0, pitch: 0 }, world).fired) shots++;
    // 30 rounds in 3 s, a 2 s reload, then more rounds.
    expect(shots).toBeGreaterThan(36);
    expect(shots).toBeLessThan(44);
  });

  it("switches to the sniper and scopes", () => {
    const st = run(newPlayerState(0, 0, 10), Key.W2, 0, 40);
    expect(st.weapon).toBe(1);
    run(st, Key.Scope, 0, 1);
    expect(st.scoped).toBe(true);
  });
});
