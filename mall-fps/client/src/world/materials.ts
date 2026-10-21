import type { MatId } from "@bfb/shared";

export type TexId = "tile" | "plaster" | "carpet" | "wood" | "metal" | "ceiling" | "steps" | "concrete" | "grate";
export const TEX_IDS: TexId[] = ["tile", "plaster", "carpet", "wood", "metal", "ceiling", "steps", "concrete", "grate"];

export interface MatDef {
  tex: TexId | null;
  color: [number, number, number];
  /** Meters per texture repeat. */
  scale: number;
  transparent?: boolean;
  opacity?: number;
}

export const MATS: Record<MatId, MatDef> = {
  tile: { tex: "tile", color: [0.92, 0.9, 0.86], scale: 2 },
  tileDark: { tex: "tile", color: [0.45, 0.42, 0.42], scale: 2 },
  wall: { tex: "plaster", color: [0.93, 0.9, 0.84], scale: 4 },
  wallAccent: { tex: "plaster", color: [0.85, 0.2, 0.22], scale: 4 },
  trim: { tex: "metal", color: [0.25, 0.25, 0.28], scale: 2 },
  ceiling: { tex: "ceiling", color: [0.9, 0.9, 0.9], scale: 2.4 },
  carpet: { tex: "carpet", color: [0.35, 0.18, 0.2], scale: 2 },
  wood: { tex: "wood", color: [0.75, 0.55, 0.38], scale: 2 },
  metal: { tex: "metal", color: [0.7, 0.72, 0.76], scale: 2 },
  steps: { tex: "steps", color: [0.6, 0.62, 0.65], scale: 1 },
  glass: { tex: null, color: [0.6, 0.85, 0.95], scale: 1, transparent: true, opacity: 0.22 },
  glassDark: { tex: null, color: [0.15, 0.2, 0.25], scale: 1, transparent: true, opacity: 0.55 },
  grate: { tex: "grate", color: [0.55, 0.57, 0.6], scale: 2 },
  red: { tex: "plaster", color: [0.9, 0.15, 0.15], scale: 4 },
  concrete: { tex: "concrete", color: [0.62, 0.62, 0.62], scale: 4 },
};
