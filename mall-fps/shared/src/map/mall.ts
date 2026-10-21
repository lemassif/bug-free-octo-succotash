// Doorbuster Mall: two floors, a skylit atrium with two escalator pairs,
// stairs in each team hall, 36 storefronts and The Manager's Office.
//
// Layout (top view, +x east, +z south... north is +z here):
//   x -36..36, z -22..22. Floor 1 at y 0, floor 2 at y 5, roof at y 10.
//   West hall (team 0 spawn) x -36..-20, east hall (team 1) x 20..36.
//   Atrium x -20..20, z -6..6, open to a glass skylight. A bridge crosses
//   it at x -2..2 and escalators climb to the bridge from both sides.
//   Stores line both long walls (z 13..22 and -22..-13) on both floors.
//
// Most of the map is built once and rotated 180 degrees for the other team.

import type { MatId, Vec3 } from "../types.ts";
import { MapBuilder } from "./builder.ts";
import type { BoxOpts, MapData, PropType, Sign } from "./types.ts";

const F2 = 5;
const CEIL1 = 4.7;
const ROOF = 10;
const SKY = 11.4;

/** Builder facade that optionally rotates everything 180 degrees. */
class Side {
  private b: MapBuilder;
  readonly flip: boolean;
  constructor(b: MapBuilder, flip: boolean) {
    this.b = b;
    this.flip = flip;
  }
  private x(v: number) { return this.flip ? -v : v; }
  box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, mat: MatId, o: BoxOpts = {}) {
    const ramp = o.ramp && this.flip ? { ...o.ramp, rise: (-o.ramp.rise) as 1 | -1 } : o.ramp;
    return this.b.box(this.x(x0), y0, this.x(z0), this.x(x1), y1, this.x(z1), mat, { ...o, ramp });
  }
  prop(type: PropType, x: number, y: number, z: number, rot = 0, v?: number) {
    this.b.prop(type, this.x(x), y, this.x(z), this.flip ? rot + 2 : rot, v);
  }
  light(x: number, y: number, z: number, radius = 9, intensity = 1, color?: Vec3) {
    this.b.light(this.x(x), y, this.x(z), radius, intensity, color);
  }
  sign(s: Sign) {
    this.b.sign({ ...s, p: [this.x(s.p[0]), s.p[1], this.x(s.p[2])], rot: this.flip ? (s.rot + 2) % 4 : s.rot });
  }
}

/** Glass railing with a metal cap and a dark fascia under the slab edge. */
function edge(s: Side, x0: number, z0: number, x1: number, z1: number) {
  const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
  const t = 0.05;
  if (alongX) {
    s.box(x0, F2, z0 - t, x1, F2 + 1.05, z0 + t, "glass", { noBullets: true });
    s.box(x0, F2 + 1.05, z0 - 0.06, x1, F2 + 1.12, z0 + 0.06, "trim", { noBullets: true });
    s.box(x0, CEIL1 - 0.5, z0 - 0.15, x1, CEIL1, z0 + 0.15, "trim");
  } else {
    s.box(x0 - t, F2, z0, x0 + t, F2 + 1.05, z1, "glass", { noBullets: true });
    s.box(x0 - 0.06, F2 + 1.05, z0, x0 + 0.06, F2 + 1.12, z1, "trim", { noBullets: true });
    s.box(x0 - 0.15, CEIL1 - 0.5, z0, x0 + 0.15, CEIL1, z1, "trim");
  }
}

/** Floor slab: a tile top over a ceiling-tile underside. */
function slab(s: Side, x0: number, z0: number, x1: number, z1: number) {
  s.box(x0, F2 - 0.15, z0, x1, F2, z1, "tile");
  s.box(x0, CEIL1, z0, x1, F2 - 0.15, z1, "ceiling");
}

interface StoreDef {
  name: string;
  sub?: string;
  kind: "shelves" | "racks" | "tv" | "beds" | "food" | "closed" | "boxes" | "service";
  bg: string;
  fg: string;
  floor?: MatId;
  accent?: MatId;
}

const NORTH_1: StoreDef[] = [
  { name: "SOCK MARKET", sub: "Prices only go up", kind: "racks", bg: "#1d3c6e", fg: "#ffffff" },
  { name: "GADGET GALAXY", sub: "Batteries not included", kind: "shelves", bg: "#111111", fg: "#36e0ff" },
  { name: "PRETZEL LOGIC", sub: "Twisted since 1987", kind: "food", bg: "#f2b632", fg: "#5a2a00" },
  { name: "TOY AVALANCHE", sub: "Some assembly required", kind: "boxes", bg: "#e8323c", fg: "#ffe14a", accent: "red" },
  { name: "BIG SCREEN DREAMS", sub: "DOORBUSTER: 85 INCH", kind: "tv", bg: "#0b0b0b", fg: "#ffd23c" },
  { name: "MATTRESS MOUNTAIN", sub: "Lie down. Not on the job.", kind: "beds", bg: "#6a4fd8", fg: "#ffffff", floor: "carpet" },
  { name: "CANDLE SCANDAL", sub: "Smells like a lawsuit", kind: "shelves", bg: "#3a1d10", fg: "#ffcf8a" },
  { name: "SHOE-IN SHOES", sub: "Left shoes 50% off", kind: "racks", bg: "#ffffff", fg: "#d32f2f" },
  { name: "OPENS AT 5 AM", sub: "No cutting. We see you.", kind: "closed", bg: "#333333", fg: "#ff5a4e" },
];
const NORTH_2: StoreDef[] = [
  { name: "BLENDER BENDER", sub: "Smoothie criminals", kind: "shelves", bg: "#1fae8c", fg: "#ffffff" },
  { name: "LAMP CHAMP", sub: "Bright ideas, dim prices", kind: "shelves", bg: "#ffe14a", fg: "#222222" },
  { name: "SOLD OUT", sub: "Try again next year", kind: "closed", bg: "#333333", fg: "#ffd23c" },
  { name: "THE RECEIPT", sub: "Longer than your arm", kind: "racks", bg: "#f4f1ea", fg: "#222222" },
  { name: "THE MANAGER'S OFFICE", sub: "Knock first", kind: "service", bg: "#4a2e1a", fg: "#ffd23c" },
  { name: "THRIFT SHIFT", sub: "Gently fought over", kind: "racks", bg: "#8a3ab9", fg: "#ffffff" },
  { name: "SCENT CENTS", sub: "Perfume, priced to sniff", kind: "shelves", bg: "#ff8fb3", fg: "#3a0c1e" },
  { name: "WOK THIS WAY", sub: "Food court, kind of", kind: "food", bg: "#c62828", fg: "#ffe9a8" },
  { name: "DISCOUNT DUNGEON", sub: "Everything must go", kind: "boxes", bg: "#2b2b2b", fg: "#7cff6b" },
];
const SOUTH_1: StoreDef[] = [
  { name: "OPENS AT 5 AM", sub: "Line starts here", kind: "closed", bg: "#333333", fg: "#4ea2ff" },
  { name: "HAT TRICK", sub: "Caps, toques, regrets", kind: "racks", bg: "#0f5132", fg: "#ffffff" },
  { name: "SNOW GLOBE SHOP", sub: "Shake responsibly", kind: "shelves", bg: "#bfe3ff", fg: "#0b3a66" },
  { name: "CINNA-MEGA", sub: "Frosting is a food group", kind: "food", bg: "#fff3d6", fg: "#8b4a12" },
  { name: "TV OR NOT TV", sub: "DOORBUSTER: 75 INCH", kind: "tv", bg: "#0b0b0b", fg: "#4ea2ff" },
  { name: "PILLOW FIGHT", sub: "Soft goods, hard prices", kind: "beds", bg: "#ff7a1a", fg: "#ffffff", floor: "carpet" },
  { name: "BOARD GAME BOARD", sub: "Rules are suggestions", kind: "boxes", bg: "#2f6b2f", fg: "#ffe14a" },
  { name: "JEAN POOL", sub: "Fits like genetics", kind: "racks", bg: "#26418f", fg: "#ffffff" },
  { name: "PHONE CASE PLACE", sub: "Cases for phones you lost", kind: "shelves", bg: "#111111", fg: "#ff5aa5" },
];
const SOUTH_2: StoreDef[] = [
  { name: "GIFT WRAP CENTRAL", sub: "Tape sold separately", kind: "boxes", bg: "#d81b60", fg: "#ffffff" },
  { name: "TOASTER COASTER", sub: "Browned to perfection", kind: "shelves", bg: "#9e9e9e", fg: "#111111" },
  { name: "WAFFLE IRONY", sub: "Breakfast, but ironic", kind: "food", bg: "#f2b632", fg: "#3a1d10" },
  { name: "SOLD OUT", sub: "It was a good TV", kind: "closed", bg: "#333333", fg: "#ff5a4e" },
  { name: "CUSTOMER SERVICE", sub: "Take a number. Any number.", kind: "service", bg: "#1d3c6e", fg: "#ffffff" },
  { name: "SWEATER WEATHER", sub: "Ugly is in", kind: "racks", bg: "#b71c1c", fg: "#c8f27a" },
  { name: "BATTERY BARN", sub: "AA, AAA, AAAAAH", kind: "shelves", bg: "#ffd23c", fg: "#111111" },
  { name: "LAST CHANCE", sub: "Final markdowns", kind: "boxes", bg: "#000000", fg: "#ffd23c" },
  { name: "LUGGAGE LOUNGE", sub: "Carry-on, carry on", kind: "racks", bg: "#5d4037", fg: "#ffe9a8" },
];

function store(s: Side, i: number, y0: number, d: StoreDef, office: boolean) {
  const x0 = -36 + i * 8;
  const ceil = y0 === 0 ? CEIL1 : ROOF;
  const zF = 13;
  const head = y0 + 3.2;
  if (i > 0) s.box(x0 - 0.15, y0, zF, x0 + 0.15, ceil, 22, "wall");
  if (office) {
    // Wood-panelled front: a door between two tinted windows.
    for (const [a, c] of [[x0, x0 + 3.3], [x0 + 4.7, x0 + 8]]) {
      s.box(a, y0, zF - 0.15, c, y0 + 1, zF + 0.15, "wood");
      s.box(a, y0 + 2.6, zF - 0.15, c, ceil, zF + 0.15, "wood");
      s.box(a, y0 + 1, zF - 0.15, a + 0.3, y0 + 2.6, zF + 0.15, "wood");
      s.box(c - 0.3, y0 + 1, zF - 0.15, c, y0 + 2.6, zF + 0.15, "wood");
      s.box(a + 0.3, y0 + 1, zF - 0.04, c - 0.3, y0 + 2.6, zF + 0.04, "glassDark");
    }
    s.box(x0 + 3.3, y0 + 2.4, zF - 0.15, x0 + 4.7, ceil, zF + 0.15, "wood");
  } else {
    s.box(x0, y0, zF - 0.15, x0 + 0.4, ceil, zF + 0.15, "trim");
    s.box(x0 + 7.6, y0, zF - 0.15, x0 + 8, ceil, zF + 0.15, "trim");
    s.box(x0 + 0.4, head, zF - 0.15, x0 + 7.6, ceil, zF + 0.15, "wall");
    if (d.kind === "closed") {
      s.box(x0 + 0.4, y0, zF - 0.05, x0 + 7.6, head, zF + 0.05, "grate");
    } else {
      s.box(x0 + 0.4, y0, zF - 0.04, x0 + 2.6, head, zF + 0.04, "glass");
      s.box(x0 + 5.4, y0, zF - 0.04, x0 + 7.6, head, zF + 0.04, "glass");
      s.box(x0 + 0.4, y0, zF - 0.1, x0 + 2.6, y0 + 0.3, zF + 0.1, "trim");
      s.box(x0 + 5.4, y0, zF - 0.1, x0 + 7.6, y0 + 0.3, zF + 0.1, "trim");
    }
  }
  s.sign({
    p: [x0 + 4, office ? y0 + 3.6 : head + 0.75, zF - 0.17], w: office ? 4.4 : 6.4, h: office ? 0.8 : 1.1, rot: 2,
    text: d.name, sub: d.sub, bg: d.bg, fg: d.fg, lit: true,
  });
  if (d.kind === "closed") return;
  // Store floor and back wall.
  const floor = office ? "carpet" : d.floor ?? "wood";
  s.box(x0 + 0.15, y0, zF + 0.15, x0 + 7.85, y0 + 0.02, 22, floor);
  s.box(x0 + 0.15, y0, 21.7, x0 + 7.85, ceil, 22, d.accent ?? (office ? "wood" : "wallAccent"));
  s.light(x0 + 4, ceil - 0.3, 17.5, 8, 0.9);
  s.prop("light", x0 + 4, ceil, 17.5);
  const cx = x0 + 4;
  const y = y0 + 0.02;
  switch (office ? "office" : d.kind) {
    case "office":
      s.prop("desk", cx, y, 18.6, 2);
      s.prop("chair", cx, y, 19.6, 2);
      s.prop("cabinet", x0 + 0.6, y, 20.6, 1);
      s.prop("cabinet", x0 + 0.6, y, 19.9, 1);
      s.prop("cabinet", x0 + 7.4, y, 20.6, 3);
      s.prop("watercooler", x0 + 7.3, y, 14.2);
      s.prop("planter", x0 + 0.9, y, 14.2);
      s.sign({ p: [cx, y0 + 2.4, 21.65], w: 2.6, h: 1.4, rot: 2, text: "EMPLOYEE OF THE MONTH", sub: "Every month: me", bg: "#f4f1ea", fg: "#4a2e1a" });
      s.sign({ p: [x0 + 0.17, y0 + 2.2, 17], w: 3, h: 0.9, rot: 1, text: "WORLD'S OKAYEST MANAGER", sub: "Est. Black Friday", bg: "#ffd23c", fg: "#111111" });
      s.sign({ p: [x0 + 7.83, y0 + 2.2, 17], w: 3, h: 0.9, rot: 3, text: "NO REFUNDS", sub: "No exchanges. No eye contact.", bg: "#c62828", fg: "#ffffff" });
      break;
    case "service":
      s.prop("counter", cx, y, 16.2);
      s.prop("counter", cx - 2.4, y, 16.2);
      s.prop("boxes", x0 + 1, y, 20.5);
      s.prop("boxes", x0 + 7, y, 20.6);
      s.prop("cabinet", x0 + 7.4, y, 18.5, 3);
      break;
    case "shelves":
      s.prop("shelf", x0 + 2.4, y, 16.5, 0, i % 5);
      s.prop("shelf", x0 + 5.6, y, 18.8, 0, (i + 2) % 5);
      s.prop("counter", x0 + 5.8, y, 14.6);
      s.prop("shelf", cx, y, 21.2, 0, (i + 1) % 5);
      break;
    case "racks":
      s.prop("rack", x0 + 2, y, 16.2, 1);
      s.prop("rack", x0 + 6, y, 16.6, 1);
      s.prop("rack", x0 + 4, y, 19.4);
      s.prop("mannequin", x0 + 1.4, y, 13.9);
      s.prop("mannequin", x0 + 6.6, y, 13.9);
      break;
    case "tv":
      s.prop("tvPallet", x0 + 2, y, 15.4);
      s.prop("tvPallet", x0 + 6, y, 15.8, 1);
      s.prop("tvPallet", x0 + 2.6, y, 19.5, 1);
      s.prop("shelf", x0 + 6, y, 20.9);
      break;
    case "beds":
      s.box(x0 + 1, y, 15, x0 + 3.2, y + 0.6, 17.4, "carpet");
      s.box(x0 + 4.8, y, 18, x0 + 7, y + 0.6, 20.4, "carpet");
      s.prop("boxes", x0 + 6.4, y, 15);
      break;
    case "food":
      s.prop("counter", cx, y, 16.8);
      s.prop("counter", cx + 1.2, y, 16.8);
      s.prop("shelf", cx, y, 21.2);
      s.prop("bench", x0 + 2, y, 14.3);
      break;
    case "boxes":
      s.prop("boxes", x0 + 1.8, y, 15.6);
      s.prop("boxes", x0 + 1.8, y + 1, 15.6);
      s.prop("boxes", x0 + 5.6, y, 17.4);
      s.prop("boxes", x0 + 6.4, y, 18.4);
      s.prop("shelf", x0 + 4, y, 21.1, 0, i % 5);
      s.prop("tvPallet", x0 + 3.4, y, 19.2);
      break;
  }
}

/** Everything that appears once per team, built on the north/west side. */
function half(s: Side) {
  // Shell.
  s.box(-36.5, 0, -22.5, -36, ROOF + 0.4, 22.5, "wall");
  s.box(-36, 0, 22, 36, ROOF + 0.4, 22.5, "wall");
  // Floor 2: the north band, the mezzanine over the spawn hall, half the bridge.
  slab(s, -36, 6, 36, 22);
  slab(s, -36, -6, -29, 6);
  slab(s, -2, 0, 2, 6);
  // Roofs, the skylight lantern and the glass.
  s.box(-36, ROOF, 6, 36, ROOF + 0.4, 22, "ceiling");
  s.box(-36, ROOF, -6, -20, ROOF + 0.4, 6, "ceiling");
  s.box(-20, ROOF, 5.8, 20, SKY, 6, "wall");
  s.box(-20.2, ROOF, -6, -20, SKY, 6, "wall");
  s.box(-20, SKY, 0, 20, SKY + 0.05, 6, "glass", { noCollide: true, noBullets: true });
  s.prop("beam", -10, SKY - 0.05, 3, 1, 20);
  s.prop("beam", 10, SKY - 0.05, 3, 1, 20);

  // Floor 2 edges around the void.
  edge(s, -29, 6, -27, 6);
  edge(s, -25, 6, -2, 6);
  edge(s, 2, 6, 29, 6);
  edge(s, -29, -6, -29, 6);
  edge(s, -2, 1.8, -2, 6);
  edge(s, 2, 1.8, 2, 6);

  // Stairs from the spawn hall up to the north walkway.
  s.box(-27, 0, -3, -25, F2, 6, "steps", { ramp: { axis: 2, rise: 1, low: 0 }, steps: 24 });
  s.box(-27.1, 0, -3, -27, F2 + 1, 6, "glass", { ramp: { axis: 2, rise: 1, low: 1 }, noBullets: true });
  s.box(-25, 0, -3, -24.9, F2 + 1, 6, "glass", { ramp: { axis: 2, rise: 1, low: 1 }, noBullets: true });
  s.box(-27.2, 0, -3.2, -24.8, 0.15, -3, "trim");

  // West escalator pair onto the bridge: up on the south lane, down on the north.
  s.box(-11, 0, 0.2, -2, F2, 1.6, "steps", { ramp: { axis: 0, rise: 1, low: 0, conveyor: -1.1 }, steps: 30 });
  s.box(-11, 0, -1.6, -2, F2, -0.2, "steps", { ramp: { axis: 0, rise: 1, low: 0, conveyor: 1.1 }, steps: 30 });
  for (const z of [-1.8, -0.2, 1.6]) {
    const w = z === -0.2 ? 0.4 : 0.2;
    s.box(-11, 0, z, -2, F2 + 1, z + w, "glass", { ramp: { axis: 0, rise: 1, low: 1 }, noBullets: true });
  }
  s.box(-12, 0, -1.8, -11, 0.08, 1.8, "metal");
  s.sign({ p: [-11.05, 2.0, -0.9], w: 1.2, h: 0.4, rot: 3, text: "UP", sub: "Hold the rail", bg: "#111111", fg: "#7cff6b", lit: true });

  // Spawn hall.
  s.box(-35.95, 0, -3.5, -35.9, 3.2, 3.5, "glassDark", { noCollide: true, noBullets: true });
  s.box(-36, 3.2, -3.7, -35.85, 3.4, 3.7, "trim", { noCollide: true });
  for (let z = -4.5; z <= 4.5; z += 3) s.prop("light", -32.5, CEIL1, z);
  s.light(-32.5, CEIL1 - 0.3, -3, 9, 0.9);
  s.light(-32.5, CEIL1 - 0.3, 3, 9, 0.9);
  s.light(-24.5, ROOF - 0.5, 0, 14, 0.9);
  s.prop("light", -24.5, ROOF, -2);
  s.prop("light", -24.5, ROOF, 2);
  s.prop("tvPallet", -23, 0, 3.4, 1);
  s.prop("boxes", -22.6, 0, -4.6);
  s.prop("boxes", -22.6, 1, -4.6);
  s.prop("boxes", -28.6, 0, 1.8);
  s.prop("planter", -21, 0, 0);
  s.prop("bench", -30, 0, -5.4);
  s.prop("trash", -28.8, 0, -5.5);

  // Atrium floor 1.
  s.prop("palm", -17, 0, 3.8);
  s.prop("palm", -17, 0, -3.8);
  s.prop("kiosk", -15.5, 0, 0, 1);
  s.sign({ p: [-16.56, 2.65, 0], w: 2.4, h: 0.55, rot: 3, text: "COUPON KIOSK", sub: "Clip responsibly", bg: "#ffd23c", fg: "#111111", lit: true });
  s.prop("tvPallet", -7.5, 0, 4.3);
  s.prop("tvPallet", -7.5, 0, -4.3);
  s.prop("boxes", 0.9, 0, 4.2);
  s.prop("boxes", -0.9, 0, 3.3);
  s.prop("bench", -14, 0, 5.2);
  for (const x of [-16, -8, 0, 8, 16]) s.light(x, SKY - 1, 3, 16, 0.35, [1, 0.97, 0.9]);

  // Floor 1 corridor.
  for (let x = -32; x <= 32; x += 8) {
    s.prop("light", x, CEIL1, 9.5);
    s.light(x, CEIL1 - 0.3, 9.5, 8, 0.75);
  }
  s.prop("planter", -20, 0, 9.5);
  s.prop("planter", 4, 0, 9.5);
  s.prop("bench", -12, 0, 11.8);
  s.prop("bench", 12, 0, 11.8);
  s.prop("trash", -4.5, 0, 12.2);
  s.prop("trash", 20.5, 0, 12.2);
  s.prop("tvPallet", 26, 0, 9.5, 1);
  s.prop("boxes", -30, 0, 11.6);

  // Floor 2 walkway.
  for (let x = -32; x <= 32; x += 8) {
    s.prop("light", x, ROOF, 9.5);
    s.light(x, ROOF - 0.4, 9.5, 9, 0.7);
  }
  s.prop("planter", -16, F2, 7.2);
  s.prop("planter", 16, F2, 7.2);
  s.prop("bench", -8, F2, 11.9);
  s.prop("bench", 12, F2, 11.9);
  s.prop("boxes", -31, F2, 3.5);
  s.prop("boxes", -31, F2, -3.5);
  s.prop("tvPallet", -33.5, F2, 0, 1);
  s.prop("trash", 24, F2, 12.3);
  s.light(-32.5, ROOF - 0.4, 0, 9, 0.7);
  s.prop("light", -32.5, ROOF, 0);

  // Big Black Friday banners hanging off the railings.
  s.sign({ p: [-11, 3.9, 5.84], w: 9, h: 1.3, rot: 2, text: "BLACK FRIDAY", sub: "EVERYTHING MUST GO. INCLUDING YOU.", bg: "#0d0d10", fg: "#ffd23c", lit: true });
  s.sign({ p: [14, 3.9, 5.84], w: 7, h: 1.2, rot: 2, text: "90% OFF", sub: "Sanity sold separately", bg: "#e8323c", fg: "#ffffff", lit: true });
}

export function buildMall(): MapData {
  const b = new MapBuilder();
  // Ground floor slab, shared by both halves.
  b.box(-36, -0.5, -22, 36, 0, 22, "tile");
  const north = new Side(b, false);
  const south = new Side(b, true);
  half(north);
  half(south);
  NORTH_1.forEach((d, i) => store(north, i, 0, d, false));
  NORTH_2.forEach((d, i) => store(north, i, F2, d, i === 4));
  SOUTH_1.forEach((d, i) => store(south, i, 0, d, false));
  SOUTH_2.forEach((d, i) => store(south, i, F2, d, false));

  // Skylight cross beams (on the center line, so not mirrored).
  for (let x = -18; x <= 18; x += 4) b.prop("beam", x, SKY - 0.05, 0, 0, 12);
  // One-offs: the vending machine by the Manager's Office, team banners.
  b.prop("vending", 5.4, F2, 12.3, 2);
  b.sign({ p: [5.4, F2 + 2.25, 11.88], w: 1.0, h: 0.3, rot: 2, text: "SNAX-O-MATIC", sub: "Exact change only", bg: "#c62828", fg: "#ffffff", lit: true });
  b.sign({ p: [-35.98, 4.0, 0], w: 6, h: 1.1, rot: 1, text: "DOORBUSTERS", sub: "Entrance A. We were here first.", bg: "#b3261e", fg: "#ffffff", lit: true });
  b.sign({ p: [35.98, 4.0, 0], w: 6, h: 1.1, rot: 3, text: "BARGAIN HUNTERS", sub: "Entrance B. We brought snacks.", bg: "#1d4f9a", fg: "#ffffff", lit: true });
  b.zones.push({ name: "office", min: [-4, F2, 13], max: [4, ROOF, 22] });
  b.skyHoles.push({ min: [-20, ROOF, -6], max: [20, SKY, 6] });

  const spawnsA: Vec3[] = [];
  for (const z of [-4.5, -1.5, 1.5, 4.5]) spawnsA.push([-34.2, 0, z]);
  for (const z of [-3, 0, 3]) spawnsA.push([-31.6, 0, z]);
  const spawnsB = spawnsA.map((p) => [-p[0], p[1], -p[2]] as Vec3);
  return b.finish({
    name: "Doorbuster Mall",
    spawns: [spawnsA, spawnsB],
    spawnYaw: [-Math.PI / 2, Math.PI / 2],
    floors: [0, F2],
  });
}
