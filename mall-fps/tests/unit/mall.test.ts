import { describe, expect, it } from "vitest";
import { World, buildMall, newPlayerState, stepPlayer, Key, PLAYER, type PlayerState } from "../../shared/src/index.ts";

const map = buildMall();
const world = new World(map.solids);
const hits: never[] = [];

function walk(st: PlayerState, yaw: number, steps: number, k: number = Key.Fwd, until?: (s: PlayerState) => boolean) {
  for (let i = 0; i < steps; i++) {
    stepPlayer(st, { s: i, k, yaw, pitch: 0 }, world);
    if (until?.(st)) break;
  }
  return st;
}
const EAST = -Math.PI / 2, WEST = Math.PI / 2, NORTH = Math.PI, SOUTH = 0; // north is +z

describe("mall map", () => {
  it("has 7 clear spawn points per team", () => {
    for (const team of map.spawns) {
      expect(team.length).toBe(7);
      for (const p of team) {
        expect(world.overlaps(p[0], p[1] + 0.01, p[2], PLAYER.radius, PLAYER.height, hits as never[]).length).toBe(0);
        const st = walk(newPlayerState(p[0], p[1] + 0.5, p[2]), 0, 60, 0);
        expect(st.y).toBeCloseTo(0, 3);
      }
    }
  });

  it("climbs the spawn hall stairs to floor 2", () => {
    const st = walk(newPlayerState(-26, 0, -5), NORTH, 240);
    expect(st.y).toBeCloseTo(5, 3);
    expect(st.z).toBeGreaterThan(7);
  });

  it("rides the up escalator to the bridge", () => {
    const st = walk(newPlayerState(-12.5, 0, -0.9), EAST, 300, Key.Fwd, (s) => s.x > -1);
    expect(st.y).toBeCloseTo(5, 3);
    expect(st.x).toBeGreaterThan(-1);
  });

  it("the east team has the same escalator", () => {
    const st = walk(newPlayerState(12.5, 0, 0.9), WEST, 300, Key.Fwd, (s) => s.x < 1);
    expect(st.y).toBeCloseTo(5, 3);
    expect(st.x).toBeLessThan(1);
  });

  it("the down escalator carries a standing player to floor 1", () => {
    const st = walk(newPlayerState(-2.6, 5, 0.9), 0, 60 * 12, 0);
    // Ends on the 8 cm landing plate at the bottom.
    expect(st.y).toBeLessThan(0.1);
    expect(st.x).toBeLessThan(-10.5);
  });

  it("walks through the door into the Manager's Office", () => {
    const st = walk(newPlayerState(0, 5, 10), NORTH, 90);
    const office = map.zones.find((z) => z.name === "office")!;
    expect(st.z).toBeGreaterThan(office.min[2] + 1);
    expect(st.y).toBeGreaterThanOrEqual(5);
  });

  it("railings stop players from walking off floor 2", () => {
    const st = walk(newPlayerState(-14, 5, 9), SOUTH, 120);
    expect(st.y).toBeCloseTo(5, 3);
    expect(st.z).toBeGreaterThan(6);
  });

  it("store glass blocks movement but doors let you in", () => {
    const glass = walk(newPlayerState(-34.5, 0, 10), NORTH, 90);
    expect(glass.z).toBeLessThan(13);
    const door = walk(newPlayerState(-32, 0, 10), NORTH, 90);
    expect(door.z).toBeGreaterThan(14);
  });

  it("can cross the whole map on floor 1 without getting stuck", () => {
    const st = walk(newPlayerState(-33, 0, 8), EAST, 60 * 14);
    expect(st.x).toBeGreaterThan(20);
  });
});
