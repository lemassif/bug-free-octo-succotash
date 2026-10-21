import * as THREE from "three";
import { characterParts } from "../world/characters.ts";
import { rifleGeometry } from "../game/viewmodel.ts";

/** Renders a small portrait of each shopper with the game's own renderer. */
export function renderPortraits(renderer: THREE.WebGLRenderer, team = 0): string[] {
  const size = 160;
  const target = new THREE.WebGLRenderTarget(size, size, { colorSpace: THREE.SRGBColorSpace });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1920);
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x404858, 2.4));
  const d = new THREE.DirectionalLight(0xffffff, 1.6);
  d.position.set(1, 2, -2);
  scene.add(d);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  cam.position.set(1.2, 1.5, -3.2);
  cam.lookAt(0, 1.05, 0);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const pixels = new Uint8Array(size * size * 4);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d")!;
  const out: string[] = [];
  for (let c = 0; c < 3; c++) {
    const parts = characterParts(c, team);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(parts.body, mat));
    for (const x of [-0.13, 0.13]) {
      const leg = new THREE.Mesh(parts.leg, mat);
      leg.position.set(x, parts.hip, 0);
      group.add(leg);
    }
    const gun = new THREE.Mesh(rifleGeometry(), mat);
    gun.position.copy(parts.hands);
    group.add(gun);
    group.rotation.y = 0.5;
    scene.add(group);
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.readRenderTargetPixels(target, 0, 0, size, size, pixels);
    renderer.setRenderTarget(null);
    scene.remove(group);
    // Render targets are bottom-up; flip into the canvas.
    const img = g.createImageData(size, size);
    for (let y = 0; y < size; y++) img.data.set(pixels.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
    g.putImageData(img, 0, 0);
    out.push(canvas.toDataURL("image/png"));
  }
  target.dispose();
  return out;
}
