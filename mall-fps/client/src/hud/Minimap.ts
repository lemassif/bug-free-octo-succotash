import { Flag, type MapData } from "@bfb/shared";

const PX = 4; // pixels per meter in the pre-rendered layouts
const VIEW = 64; // meters shown across the minimap

export interface Blip {
  x: number;
  z: number;
  /** 0 teammate, 1 enemy. */
  kind: 0 | 1;
  floor: number;
  flags: number;
}

/** Top-left radar, centered on the player, -z up. Each floor's layout is
 *  drawn once; per frame only the visible window and the dots are drawn. */
export class Minimap {
  readonly el = document.createElement("div");
  private canvas = document.createElement("canvas");
  private g: CanvasRenderingContext2D;
  private layers: HTMLCanvasElement[] = [];
  private label = document.createElement("div");
  private ox: number;
  private oz: number;

  constructor(root: HTMLElement, private map: MapData) {
    this.el.className = "minimap";
    this.canvas.width = this.canvas.height = 200;
    this.g = this.canvas.getContext("2d")!;
    this.label.className = "minimap-floor";
    this.el.append(this.canvas, this.label);
    root.appendChild(this.el);
    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
    for (const s of map.solids) {
      minx = Math.min(minx, s.min[0]); maxx = Math.max(maxx, s.max[0]);
      minz = Math.min(minz, s.min[2]); maxz = Math.max(maxz, s.max[2]);
    }
    this.ox = minx;
    this.oz = minz;
    for (const f of map.floors) this.layers.push(this.drawFloor(f, minx, maxx, minz, maxz));
  }

  private drawFloor(fy: number, minx: number, maxx: number, minz: number, maxz: number) {
    const c = document.createElement("canvas");
    c.width = Math.ceil((maxx - minx) * PX);
    c.height = Math.ceil((maxz - minz) * PX);
    const g = c.getContext("2d")!;
    const rect = (x0: number, z0: number, x1: number, z1: number) => g.fillRect((x0 - minx) * PX, (z0 - minz) * PX, (x1 - x0) * PX, (z1 - z0) * PX);
    // Walkable floor at this level.
    g.fillStyle = "rgba(255,255,255,0.16)";
    for (const s of this.map.solids) if (!s.noCollide && !s.ramp && Math.abs(s.max[1] - fy) < 0.05 && s.max[0] - s.min[0] > 1.5 && s.max[2] - s.min[2] > 1.5) rect(s.min[0], s.min[2], s.max[0], s.max[2]);
    // Stairs and escalators.
    g.fillStyle = "rgba(255,210,60,0.55)";
    for (const s of this.map.solids) if (s.ramp && !s.noBullets && s.min[1] <= fy + 0.1 && s.max[1] >= fy - 0.1) rect(s.min[0], s.min[2], s.max[0], s.max[2]);
    // Walls, glass and props at body height.
    for (const s of this.map.solids) {
      if (s.noCollide || s.ramp) continue;
      if (s.max[1] < fy + 0.4 || s.min[1] > fy + 1.8) continue;
      g.fillStyle = s.mat === "glass" || s.mat === "glassDark" ? "rgba(140,210,255,0.6)" : s.noRender ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)";
      rect(s.min[0], s.min[2], s.max[0], s.max[2]);
    }
    for (const z of this.map.zones) {
      if (Math.abs(z.min[1] - fy) > 0.5) continue;
      g.fillStyle = "rgba(255,210,60,0.18)";
      rect(z.min[0], z.min[2], z.max[0], z.max[2]);
      g.fillStyle = "#ffd23c";
      g.font = "bold 16px Arial";
      g.textAlign = "center";
      g.fillText("MANAGER", ((z.min[0] + z.max[0]) / 2 - minx) * PX, ((z.min[2] + z.max[2]) / 2 - minz) * PX + 6);
    }
    return c;
  }

  update(x: number, y: number, z: number, yaw: number, blips: Blip[]) {
    const floor = y > 3 ? 1 : 0;
    const g = this.g;
    const W = this.canvas.width;
    const s = W / VIEW;
    g.clearRect(0, 0, W, W);
    g.save();
    g.beginPath();
    g.arc(W / 2, W / 2, W / 2 - 2, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = "rgba(10,10,14,0.72)";
    g.fillRect(0, 0, W, W);
    const layer = this.layers[floor] ?? this.layers[0];
    const sx = (x - this.ox) * PX - (VIEW / 2) * PX, sz = (z - this.oz) * PX - (VIEW / 2) * PX;
    g.drawImage(layer, sx, sz, VIEW * PX, VIEW * PX, 0, 0, W, W);
    for (const b of blips) {
      const bx = W / 2 + (b.x - x) * s, bz = W / 2 + (b.z - z) * s;
      g.globalAlpha = b.floor === floor ? 1 : 0.35;
      g.fillStyle = b.kind === 0 ? "#4ea2ff" : "#ff5a4e";
      g.beginPath();
      g.arc(bx, bz, b.kind === 0 ? 4 : 5, 0, Math.PI * 2);
      g.fill();
      if (!(b.flags & Flag.Alive)) {
        g.strokeStyle = "#000";
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    // The player: an arrow pointing where they look.
    g.translate(W / 2, W / 2);
    g.rotate(-yaw);
    g.fillStyle = "#ffd23c";
    g.beginPath();
    g.moveTo(0, -9);
    g.lineTo(6, 7);
    g.lineTo(0, 3);
    g.lineTo(-6, 7);
    g.closePath();
    g.fill();
    g.restore();
    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(W / 2, W / 2, W / 2 - 2, 0, Math.PI * 2);
    g.stroke();
    this.label.textContent = floor ? "FLOOR 2" : "FLOOR 1";
  }
}
