import type { MatId } from "@bfb/shared";
import type { BakedColors } from "./LevelView.ts";

export interface BakeData {
  colors: BakedColors;
  propLight: Float32Array;
}

/** Loads the build-time lighting bake. Returns null if it is missing, and the
 *  game falls back to simple shading. */
export async function loadBake(base = import.meta.env.BASE_URL): Promise<BakeData | null> {
  try {
    const [mres, bres] = await Promise.all([fetch(`${base}baked/mall.json`), fetch(`${base}baked/mall.bin`)]);
    if (!mres.ok || !bres.ok) return null;
    const manifest = (await mres.json()) as { mats: { mat: MatId; offset: number; count: number }[]; props: { offset: number; count: number } };
    const bin = new Uint8Array(await bres.arrayBuffer());
    const colors: BakedColors = new Map();
    for (const m of manifest.mats) colors.set(m.mat, bin.subarray(m.offset, m.offset + m.count * 3));
    const propLight = new Float32Array(manifest.props.count * 3);
    for (let i = 0; i < propLight.length; i++) propLight[i] = bin[manifest.props.offset + i] / 128;
    return { colors, propLight };
  } catch {
    return null;
  }
}
