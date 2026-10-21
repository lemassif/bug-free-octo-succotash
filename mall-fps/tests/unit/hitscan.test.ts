import { describe, expect, it } from "vitest";
import { World, buildGym, traceShot, viewDir, aimDeviation, type Vec3 } from "../../shared/src/index.ts";

const world = new World(buildGym().solids);
const dir = (a: Vec3, b: Vec3): Vec3 => {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const l = Math.hypot(...d);
  return [d[0] / l, d[1] / l, d[2] / l];
};

describe("hitscan", () => {
  const target = { id: "t", x: 0, y: 0, z: -14 };
  it("hits the body and the head", () => {
    const o: Vec3 = [0, 1.6, -4];
    expect(traceShot(world, o, dir(o, [0, 1.0, -14]), 100, [target], null)).toMatchObject({ target: "t", head: false });
    expect(traceShot(world, o, dir(o, [0, 1.65, -14]), 100, [target], null)).toMatchObject({ target: "t", head: true });
  });
  it("misses just past the shoulder", () => {
    const o: Vec3 = [0, 1.6, -4];
    expect(traceShot(world, o, dir(o, [0.45, 1.2, -14]), 100, [target], null).target).toBeNull();
  });
  it("is stopped by walls", () => {
    const o: Vec3 = [-16, 1.2, -7];
    const t = { id: "t", x: -11, y: 0, z: -7 };
    const h = traceShot(world, o, dir(o, [-11, 1.2, -7]), 100, [t], null);
    expect(h.target).toBeNull();
    expect(h.point[0]).toBeCloseTo(-14, 3);
  });
  it("passes through glass railings", () => {
    const o: Vec3 = [8, 4.4, 1.0];
    const t = { id: "t", x: 8, y: 0, z: 12 };
    expect(traceShot(world, o, dir(o, [8, 1, 12]), 100, [t], null).target).toBe("t");
    // The same shot is blocked by a solid wall in movement queries.
    expect(world.raycast(o, dir(o, [8, 1, 12]), 100, false)?.solid.mat).toBe("glass");
  });
  it("hits the sloped top of the ramp", () => {
    const o: Vec3 = [5, 6, 6];
    const h = traceShot(world, o, [0, -1, 0], 100, [], null);
    // Ramp rises from 0 at z=10 to 3 at z=2, so at z=6 the top is 1.5.
    expect(h.point[1]).toBeCloseTo(1.5, 3);
  });
  it("measures aim deviation", () => {
    expect(aimDeviation(viewDir(0.3, 0.1), 0.3, 0.1)).toBeLessThan(1e-6);
    expect(aimDeviation(viewDir(0.8, 0.1), 0.3, 0.1)).toBeGreaterThan(0.45);
  });
});
