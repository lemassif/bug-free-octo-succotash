import * as THREE from "three";
import type { MapData, MatId } from "@bfb/shared";
import { MATS, TEX_IDS, type TexId } from "./materials.ts";
import { buildLevelGeometry, fakeLight } from "./levelGeometry.ts";
import { generateTexture, TEX_SIZE } from "./texgen.ts";

export type TextureSet = Map<TexId, THREE.Texture>;

/** Fallback when compressed textures are unavailable: same pixels, built on the fly. */
export function proceduralTextures(maxAniso: number): TextureSet {
  const set: TextureSet = new Map();
  for (const id of TEX_IDS) {
    const t = new THREE.DataTexture(generateTexture(id), TEX_SIZE, TEX_SIZE, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = maxAniso;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    set.set(id, t);
  }
  return set;
}

/** Baked vertex colors, one Uint8 RGB triple per vertex, keyed by material. */
export type BakedColors = Map<MatId, Uint8Array>;

/** Builds one merged mesh per material: a handful of draw calls for the whole level. */
export function buildLevelMeshes(map: MapData, textures: TextureSet, baked: BakedColors | null): THREE.Group {
  const group = new THREE.Group();
  group.name = "level";
  const geos = buildLevelGeometry(map);
  for (const [mat, buf] of geos) {
    const def = MATS[mat];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(buf.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(buf.nrm, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(buf.uv, 2));
    g.setIndex(buf.idx);
    const n = buf.pos.length / 3;
    const col = new Float32Array(n * 3);
    const bake = baked?.get(mat);
    const useBake = bake && bake.length === n * 3;
    for (let i = 0; i < n; i++) {
      let l: number[];
      if (useBake) l = [bake[i * 3] / 128, bake[i * 3 + 1] / 128, bake[i * 3 + 2] / 128];
      else l = fakeLight([buf.pos[i * 3], buf.pos[i * 3 + 1], buf.pos[i * 3 + 2]], [buf.nrm[i * 3], buf.nrm[i * 3 + 1], buf.nrm[i * 3 + 2]]);
      // Tint is in sRGB; vertex colors are linear.
      col[i * 3] = srgbToLinear(def.color[0]) * l[0];
      col[i * 3 + 1] = srgbToLinear(def.color[1]) * l[1];
      col[i * 3 + 2] = srgbToLinear(def.color[2]) * l[2];
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere();
    const m = new THREE.MeshBasicMaterial({
      vertexColors: true,
      map: def.tex ? textures.get(def.tex) ?? null : null,
      transparent: !!def.transparent,
      opacity: def.opacity ?? 1,
      depthWrite: !def.transparent,
      side: def.transparent ? THREE.DoubleSide : THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.name = `level:${mat}`;
    mesh.matrixAutoUpdate = false;
    if (def.transparent) mesh.renderOrder = 2;
    group.add(mesh);
  }
  return group;
}

export function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
