import * as THREE from "three";
import type { Prop, PropType } from "@bfb/shared";
import { Kit } from "../game/meshkit.ts";

const GOODS = [
  [0xe8323c, 0xffd23c, 0x36a2ff, 0xffffff],
  [0x2bb673, 0xff7a1a, 0xffffff, 0x8a3ab9],
  [0x111111, 0x36e0ff, 0x9e9e9e, 0xffd23c],
  [0xff8fb3, 0xfff3c4, 0xd81b60, 0x7ad46b],
  [0x5d4037, 0xffe9a8, 0xc62828, 0x1d3c6e],
];

function propGeometry(type: PropType, v = 0): THREE.BufferGeometry | null {
  const k = new Kit();
  switch (type) {
    case "planter":
      k.box(1.2, 0.85, 1.2, 0, 0.425, 0, 0x8a8f96);
      k.box(1.1, 0.05, 1.1, 0, 0.86, 0, 0x4a3524);
      k.sphere(0.55, 0, 1.3, 0, 0x3f8f3a, 1, 0.9, 1);
      k.sphere(0.35, 0.25, 1.65, 0.1, 0x4fa548);
      k.sphere(0.3, -0.25, 1.55, -0.2, 0x357a31);
      break;
    case "palm": {
      k.box(1.6, 0.8, 1.6, 0, 0.4, 0, 0xb9b2a6);
      k.box(1.5, 0.05, 1.5, 0, 0.81, 0, 0x4a3524);
      k.cyl(0.13, 0.18, 3.4, 0, 2.5, 0, 0x7a5a3a);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        k.box(0.5, 0.05, 2.0, Math.sin(a) * 0.8, 4.05, Math.cos(a) * 0.8, 0x3f9a3a, -0.35, a, 0);
      }
      break;
    }
    case "bench":
      k.box(2, 0.08, 0.6, 0, 0.45, 0, 0x9a6b3f);
      k.box(2, 0.4, 0.06, 0, 0.75, 0.27, 0x9a6b3f);
      k.box(0.08, 0.45, 0.5, -0.85, 0.22, 0, 0x2a2a2e);
      k.box(0.08, 0.45, 0.5, 0.85, 0.22, 0, 0x2a2a2e);
      break;
    case "trash":
      k.cyl(0.3, 0.28, 0.95, 0, 0.475, 0, 0x2f5d3a, 0, 0, 0, 12);
      k.cyl(0.32, 0.32, 0.08, 0, 0.98, 0, 0x1f3d27, 0, 0, 0, 12);
      break;
    case "shelf": {
      const g = GOODS[v % GOODS.length];
      k.box(3, 1.9, 0.08, 0, 0.95, 0, 0xd9d9d9);
      k.box(0.06, 1.9, 0.7, -1.47, 0.95, 0, 0xbfbfbf);
      k.box(0.06, 1.9, 0.7, 1.47, 0.95, 0, 0xbfbfbf);
      for (let s = 0; s < 4; s++) {
        const y = 0.12 + s * 0.48;
        k.box(2.9, 0.04, 0.68, 0, y, 0, 0xe6e6e6);
        for (let i = 0; i < 6; i++) {
          const c = g[(i + s) % g.length];
          const h = 0.22 + ((i * 7 + s * 3) % 4) * 0.04;
          k.box(0.36, h, 0.25, -1.2 + i * 0.48, y + h / 2 + 0.02, 0.18, c);
          k.box(0.36, h, 0.25, -1.2 + i * 0.48, y + h / 2 + 0.02, -0.18, g[(i + s + 1) % g.length]);
        }
      }
      break;
    }
    case "rack": {
      k.box(1.6, 0.04, 0.04, 0, 1.45, 0, 0xcfd3d8);
      k.box(0.04, 1.45, 0.04, -0.78, 0.72, 0, 0xcfd3d8);
      k.box(0.04, 1.45, 0.04, 0.78, 0.72, 0, 0xcfd3d8);
      k.box(0.3, 0.04, 0.5, -0.78, 0.02, 0, 0x8a8f96);
      k.box(0.3, 0.04, 0.5, 0.78, 0.02, 0, 0x8a8f96);
      const cols = [0xe8323c, 0x36a2ff, 0xffd23c, 0x2bb673, 0xffffff, 0x8a3ab9, 0xff7a1a];
      for (let i = 0; i < 8; i++) k.box(0.06, 0.75, 0.45, -0.6 + i * 0.17, 1.05, 0, cols[(i + v) % cols.length]);
      break;
    }
    case "counter":
      k.box(2.4, 1.0, 0.8, 0, 0.5, 0, 0xf1efe6);
      k.box(2.5, 0.06, 0.9, 0, 1.03, 0, 0x2a2a2e);
      k.box(0.4, 0.25, 0.35, 0.6, 1.18, 0, 0x3a3a40);
      k.box(0.35, 0.12, 0.05, 0.6, 1.35, -0.12, 0x7cff6b);
      break;
    case "tvPallet": {
      k.box(1.6, 0.15, 1.2, 0, 0.075, 0, 0xa07a4a);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
        const y = 0.15 + r * 0.62;
        k.box(1.55, 0.6, 0.55, 0, y + 0.3, -0.29 + c * 0.58, r === 0 ? 0x1a1a1e : 0xf4f1ea);
        k.box(1.56, 0.12, 0.56, 0, y + 0.45, -0.29 + c * 0.58, 0xe8323c);
      }
      break;
    }
    case "boxes":
      k.box(1, 1, 1, 0, 0.5, 0, 0xb98a55);
      k.box(1.01, 0.08, 0.2, 0, 1.0, 0, 0xd9c08a);
      k.box(0.6, 0.3, 0.01, 0, 0.55, 0.5, 0xf4f1ea);
      break;
    case "kiosk":
      k.box(3, 1.15, 2, 0, 0.575, 0, 0xe8323c);
      k.box(3.1, 0.06, 2.1, 0, 1.18, 0, 0xf4f1ea);
      for (const [x, z] of [[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]]) k.box(0.08, 1.5, 0.08, x, 1.95, z, 0xcfd3d8);
      for (let i = 0; i < 6; i++) k.box(3.4 / 6, 0.2, 2.5, -1.7 + (i + 0.5) * (3.4 / 6), 2.8, 0, i % 2 ? 0xffffff : 0xe8323c);
      k.box(0.5, 0.3, 0.5, -0.8, 1.35, 0, 0xffd23c);
      break;
    case "vending":
      k.box(1, 2, 0.8, 0, 1, 0, 0xc62828);
      k.box(0.62, 1.4, 0.02, -0.12, 1.15, 0.41, 0x10161c);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
        const col = [0xffd23c, 0x36a2ff, 0xff7a1a, 0x7cff6b][(r + c) % 4];
        k.box(0.1, 0.16, 0.02, -0.33 + c * 0.14, 0.62 + r * 0.26, 0.42, col);
      }
      k.box(0.18, 0.5, 0.03, 0.33, 1.3, 0.415, 0x2a2a2e);
      k.box(0.5, 0.15, 0.03, -0.12, 0.25, 0.415, 0x0b0b0b);
      break;
    case "desk":
      k.box(2, 0.06, 1, 0, 0.77, 0, 0x6b4426);
      k.box(0.06, 0.74, 0.95, -0.95, 0.37, 0, 0x5a3820);
      k.box(0.06, 0.74, 0.95, 0.95, 0.37, 0, 0x5a3820);
      k.box(1.9, 0.6, 0.04, 0, 0.42, -0.45, 0x5a3820);
      k.box(0.6, 0.4, 0.05, 0, 1.05, 0.2, 0x1a1a1e);
      k.box(0.08, 0.1, 0.08, 0.6, 0.85, -0.1, 0xffffff);
      k.box(0.3, 0.02, 0.22, -0.5, 0.81, -0.1, 0xf4f1ea);
      break;
    case "chair":
      k.box(0.5, 0.08, 0.5, 0, 0.5, 0, 0x1a1a1e);
      k.box(0.5, 0.6, 0.08, 0, 0.85, 0.22, 0x1a1a1e);
      k.cyl(0.04, 0.04, 0.45, 0, 0.24, 0, 0x8a8f96);
      k.box(0.6, 0.04, 0.08, 0, 0.03, 0, 0x8a8f96);
      k.box(0.08, 0.04, 0.6, 0, 0.03, 0, 0x8a8f96);
      break;
    case "cabinet":
      k.box(0.5, 1.4, 0.6, 0, 0.7, 0, 0x8a8f96);
      for (let i = 0; i < 4; i++) k.box(0.2, 0.03, 0.02, 0, 0.25 + i * 0.33, 0.31, 0x2a2a2e);
      break;
    case "light":
      k.box(1.2, 0.05, 0.5, 0, -0.03, 0, 0xffffff);
      break;
    case "beam":
      k.box(0.18, 0.3, Math.max(1, v), 0, 0, 0, 0x2a2e34);
      break;
    case "mannequin":
      k.box(0.36, 0.55, 0.22, 0, 1.25, 0, [0xe8323c, 0x36a2ff, 0x2bb673][v % 3]);
      k.box(0.3, 0.7, 0.2, 0, 0.6, 0, 0x26418f);
      k.sphere(0.13, 0, 1.68, 0, 0xf1efe6);
      k.cyl(0.03, 0.03, 0.25, 0, 0.12, 0, 0x8a8f96);
      break;
    case "watercooler":
      k.box(0.36, 0.95, 0.36, 0, 0.475, 0, 0xf1efe6);
      k.cyl(0.15, 0.15, 0.35, 0, 1.13, 0, 0x6fc3ff);
      break;
    case "post":
      return null;
  }
  return k.build();
}

/** Every prop of a type in one InstancedMesh. Per-instance color carries baked light. */
export function buildProps(props: Prop[], light: Float32Array | null): THREE.Group {
  const group = new THREE.Group();
  group.name = "props";
  const byKey = new Map<string, number[]>();
  props.forEach((p, i) => {
    // Beams and shelves vary in shape, so their variant is part of the key.
    const key = p.type === "beam" || p.type === "shelf" || p.type === "rack" || p.type === "mannequin" ? `${p.type}:${p.v ?? 0}` : p.type;
    let list = byKey.get(key);
    if (!list) byKey.set(key, (list = []));
    list.push(i);
  });
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);
  const pos = new THREE.Vector3();
  const col = new THREE.Color();
  for (const [key, idxs] of byKey) {
    const [type, v] = key.split(":") as [PropType, string | undefined];
    const geo = propGeometry(type, v ? Number(v) : 0);
    if (!geo) continue;
    const lit = type === "light";
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, color: lit ? 0xfff6e0 : 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, mat, idxs.length);
    mesh.name = `prop:${key}`;
    idxs.forEach((pi, j) => {
      const p = props[pi];
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, (p.rot * Math.PI) / 2);
      pos.set(p.x, p.y, p.z);
      m.compose(pos, q, one);
      mesh.setMatrixAt(j, m);
      if (lit) col.setRGB(1.6, 1.55, 1.4);
      else if (light) col.setRGB(light[pi * 3], light[pi * 3 + 1], light[pi * 3 + 2]);
      else col.setRGB(0.85, 0.85, 0.85);
      mesh.setColorAt(j, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    group.add(mesh);
  }
  return group;
}
