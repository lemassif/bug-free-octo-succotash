import * as THREE from "three";
import { rotXZ, type Sign } from "@bfb/shared";

const ATLAS_W = 2048;
const CELL_W = 512;

/** Draws every sign into one canvas atlas and returns a single merged mesh. */
export function buildSigns(signs: Sign[]): THREE.Mesh {
  const cells: { x: number; y: number; w: number; h: number }[] = [];
  let x = 0, y = 0, rowH = 0;
  for (const s of signs) {
    const h = Math.max(48, Math.round((CELL_W * s.h) / s.w));
    if (x + CELL_W > ATLAS_W) { x = 0; y += rowH + 4; rowH = 0; }
    cells.push({ x, y, w: CELL_W, h });
    x += CELL_W;
    rowH = Math.max(rowH, h);
  }
  const atlasH = THREE.MathUtils.ceilPowerOfTwo(y + rowH + 4);
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_W;
  canvas.height = atlasH;
  const g = canvas.getContext("2d")!;
  signs.forEach((s, i) => drawSign(g, s, cells[i]));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;

  const pos: number[] = [], uv: number[] = [], col: number[] = [], idx: number[] = [];
  signs.forEach((s, i) => {
    const c = cells[i];
    const [rx, rz] = rotXZ(1, 0, s.rot);
    const hw = s.w / 2, hh = s.h / 2;
    const base = pos.length / 3;
    const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
    for (const [u, v] of corners) pos.push(s.p[0] + rx * u, s.p[1] + v, s.p[2] + rz * u);
    const u0 = c.x / ATLAS_W, u1 = (c.x + c.w) / ATLAS_W;
    const v0 = 1 - (c.y + c.h) / atlasH, v1 = 1 - c.y / atlasH;
    uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
    const b = s.lit ? 1.15 : 0.8;
    for (let k = 0; k < 4; k++) col.push(b, b, b);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1 }));
  mesh.name = "signs";
  return mesh;
}

function drawSign(g: CanvasRenderingContext2D, s: Sign, c: { x: number; y: number; w: number; h: number }) {
  g.save();
  g.translate(c.x, c.y);
  g.fillStyle = s.bg;
  g.fillRect(0, 0, c.w, c.h);
  g.strokeStyle = s.fg;
  g.globalAlpha = 0.5;
  g.lineWidth = Math.max(3, c.h * 0.04);
  g.strokeRect(g.lineWidth, g.lineWidth, c.w - g.lineWidth * 2, c.h - g.lineWidth * 2);
  g.globalAlpha = 1;
  g.fillStyle = s.fg;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const hasSub = !!s.sub;
  const mainH = hasSub ? c.h * 0.55 : c.h * 0.7;
  let size = Math.floor(mainH * 0.8);
  const font = (px: number) => `900 ${px}px "Arial Black", Impact, Arial, sans-serif`;
  g.font = font(size);
  while (g.measureText(s.text).width > c.w * 0.9 && size > 10) g.font = font(--size);
  g.fillText(s.text, c.w / 2, hasSub ? c.h * 0.38 : c.h / 2);
  if (s.sub) {
    let ss = Math.floor(c.h * 0.2);
    const sf = (px: number) => `700 ${px}px Arial, sans-serif`;
    g.font = sf(ss);
    while (g.measureText(s.sub).width > c.w * 0.9 && ss > 8) g.font = sf(--ss);
    g.globalAlpha = 0.85;
    g.fillText(s.sub, c.w / 2, c.h * 0.78);
  }
  g.restore();
}
