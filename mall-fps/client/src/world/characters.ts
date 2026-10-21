// The three playable shoppers, built from primitives. Clothing marked with
// TEAM takes the team color, so friend and foe read at a glance.

import * as THREE from "three";
import { TEAMS } from "@bfb/shared";
import { Kit } from "../game/meshkit.ts";

const TEAM = -1;
const SKIN = [0xf1c7a5, 0xc68863, 0x8d5a3b];

export interface CharacterParts {
  body: THREE.BufferGeometry;
  leg: THREE.BufferGeometry;
  /** Hip height where legs pivot. */
  hip: number;
  /** Shoulder point where the gun is held, relative to feet. */
  hands: THREE.Vector3;
}

type Builder = (k: Kit, c: (v: number) => number) => void;

/** Coupon Carol: cardigan, long skirt, grey bun, glasses, coupon binder. */
const carolBody: Builder = (k, c) => {
  k.box(0.6, 0.5, 0.32, 0, 1.18, 0, c(TEAM));
  k.box(0.56, 0.3, 0.3, 0, 0.82, 0, 0x3b2f4a);
  k.box(0.62, 0.08, 0.34, 0, 1.0, 0, 0x2a2a2e);
  k.sphere(0.16, 0, 1.6, 0, SKIN[0], 1, 1.08, 1);
  k.sphere(0.13, 0, 1.75, 0.08, 0xb9b4ad);
  k.sphere(0.09, 0, 1.78, 0.18, 0xb9b4ad);
  k.box(0.26, 0.05, 0.02, 0, 1.62, -0.16, 0x222222);
  k.box(0.14, 0.38, 0.12, -0.36, 1.12, 0, c(TEAM));
  k.box(0.28, 0.24, 0.08, 0.38, 0.95, 0.05, 0xd9a93a);
  k.box(0.3, 0.26, 0.06, 0.38, 0.95, 0.1, 0xfff3c4);
};
const carolLeg: Builder = (k) => {
  k.box(0.16, 0.6, 0.16, 0, -0.3, 0, 0x3b2f4a);
  k.box(0.18, 0.1, 0.26, 0, -0.65, -0.04, 0x5a3820);
};

/** Doorbuster Doug: flannel, cargo shorts, ball cap, a belly that means business. */
const dougBody: Builder = (k, c) => {
  k.box(0.7, 0.55, 0.42, 0, 1.15, 0, c(TEAM));
  k.sphere(0.3, 0, 1.0, -0.12, c(TEAM), 1.1, 0.9, 0.9);
  for (let i = 0; i < 4; i++) k.box(0.71, 0.03, 0.43, 0, 0.95 + i * 0.13, 0, 0x1a1a1e);
  k.box(0.64, 0.12, 0.38, 0, 0.82, 0, 0x6b5a3a);
  k.sphere(0.17, 0, 1.63, 0, SKIN[1]);
  k.box(0.36, 0.1, 0.36, 0, 1.77, 0, c(TEAM));
  k.box(0.3, 0.03, 0.2, 0, 1.73, -0.22, c(TEAM));
  k.box(0.22, 0.08, 0.06, 0, 1.53, -0.15, 0x5a3820);
  k.box(0.16, 0.42, 0.16, -0.43, 1.12, 0, c(TEAM));
};
const dougLeg: Builder = (k) => {
  k.box(0.22, 0.32, 0.22, 0, -0.16, 0, 0x6b5a3a);
  k.box(0.16, 0.3, 0.16, 0, -0.47, 0, SKIN[1]);
  k.box(0.2, 0.12, 0.3, 0, -0.66, -0.04, 0xf4f1ea);
};

/** Influencer Izzy: hoodie, ripped jeans, pink ponytail, phone on a selfie stick. */
const izzyBody: Builder = (k, c) => {
  k.box(0.56, 0.55, 0.3, 0, 1.15, 0, c(TEAM));
  k.box(0.3, 0.2, 0.05, 0, 1.08, -0.16, 0xffffff);
  k.box(0.5, 0.14, 0.28, 0, 0.82, 0, 0x5b7fb8);
  k.sphere(0.15, 0, 1.6, 0, SKIN[2], 1, 1.05, 1);
  k.sphere(0.16, 0, 1.68, 0.03, 0xff5aa5, 1, 0.7, 1);
  k.box(0.08, 0.3, 0.08, 0, 1.55, 0.2, 0xff5aa5, 0.4);
  k.box(0.26, 0.06, 0.03, 0, 1.62, -0.15, 0x111111);
  k.box(0.13, 0.4, 0.12, -0.34, 1.12, 0, c(TEAM));
  // Selfie stick over the shoulder with a glowing phone.
  k.box(0.02, 0.02, 0.9, -0.38, 1.6, 0.15, 0x2a2a2e, -0.9);
  k.box(0.1, 0.17, 0.02, -0.38, 2.0, -0.12, 0x111111, -0.9);
  k.box(0.08, 0.14, 0.01, -0.38, 1.99, -0.135, 0x9be3ff, -0.9);
};
const izzyLeg: Builder = (k) => {
  k.box(0.16, 0.6, 0.16, 0, -0.3, 0, 0x5b7fb8);
  k.box(0.1, 0.06, 0.17, 0, -0.25, -0.01, 0xd9e2f0);
  k.box(0.18, 0.12, 0.28, 0, -0.65, -0.04, 0xffffff);
};

const BUILDERS: [Builder, Builder, number][] = [
  [carolBody, carolLeg, 0.72],
  [dougBody, dougLeg, 0.74],
  [izzyBody, izzyLeg, 0.72],
];

const cache = new Map<string, CharacterParts>();

export function characterParts(char: number, team: number): CharacterParts {
  const key = `${char}:${team}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [body, leg, hip] = BUILDERS[char] ?? BUILDERS[0];
  const teamColor = TEAMS[team]?.color ?? 0xffffff;
  const col = (v: number) => (v === TEAM ? teamColor : v);
  const kb = new Kit();
  body(kb, col);
  const kl = new Kit();
  leg(kl, col);
  const parts: CharacterParts = { body: kb.build(), leg: kl.build(), hip, hands: new THREE.Vector3(0.2, 1.25, -0.25) };
  cache.set(key, parts);
  return parts;
}
