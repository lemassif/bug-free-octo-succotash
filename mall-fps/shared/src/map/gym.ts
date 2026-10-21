import { MapBuilder } from "./builder.ts";
import type { MapData } from "./types.ts";

/** Small gray test level for movement and weapon tests. */
export function buildGym(): MapData {
  const b = new MapBuilder();
  b.box(-20, -0.5, -20, 20, 0, 20, "concrete");
  b.box(-20, 0, -20.5, 20, 6, -20, "wall");
  b.box(-20, 0, 20, 20, 6, 20.5, "wall");
  b.box(-20.5, 0, -20, -20, 6, 20, "wall");
  b.box(20, 0, -20, 20.5, 6, 20, "wall");
  // Raised platform reached by stairs on one side and a ramp on the other.
  b.box(4, 0, -6, 12, 3, 2, "tile");
  b.box(-2, 0, -6, 4, 3, -4, "steps", { ramp: { axis: 0, rise: 1, low: 0 }, steps: 12 });
  b.box(4, 0, 2, 6, 3, 10, "tile", { ramp: { axis: 2, rise: -1, low: 0 } });
  // An escalator onto the platform.
  b.box(12, 0, -4, 20, 3, -2.6, "steps", { ramp: { axis: 0, rise: -1, low: 0, conveyor: 0.9 }, steps: 20 });
  // Cover and a low ledge to step onto.
  b.box(-10, 0, 6, -8, 1.2, 10, "wood");
  b.box(-6, 0, -12, -4, 0.4, -10, "wood");
  b.box(-14, 0, -12, -13, 2.5, -2, "wallAccent");
  // A glass railing bullets pass through.
  b.box(6, 3, 1.9, 12, 4.1, 2, "glass", { noBullets: true });
  b.light(0, 5.5, 0, 25, 1.2);
  return b.finish({
    name: "gym",
    spawns: [[[-15, 0, 15], [-12, 0, 15]], [[15, 0, 15], [12, 0, 15]]],
    spawnYaw: [-Math.PI / 4, Math.PI / 4],
    floors: [0, 3],
  });
}
