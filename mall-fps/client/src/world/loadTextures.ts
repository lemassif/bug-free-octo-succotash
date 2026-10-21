import * as THREE from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { TEX_IDS } from "./materials.ts";
import type { TextureSet } from "./LevelView.ts";

/** Loads the KTX2 textures. Returns null on any failure so the caller can
 *  fall back to generating the same textures on the CPU. */
export async function loadKtx2Textures(renderer: THREE.WebGLRenderer, base = import.meta.env.BASE_URL): Promise<TextureSet | null> {
  try {
    const loader = new KTX2Loader().setTranscoderPath(`${base}baked/basis/`).detectSupport(renderer);
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const entries = await Promise.all(
      TEX_IDS.map(async (id) => {
        const t = await loader.loadAsync(`${base}baked/textures/${id}.ktx2`);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = aniso;
        t.colorSpace = THREE.SRGBColorSpace;
        return [id, t] as const;
      }),
    );
    loader.dispose();
    return new Map(entries);
  } catch (e) {
    console.warn("KTX2 textures unavailable, using generated textures", e);
    return null;
  }
}
