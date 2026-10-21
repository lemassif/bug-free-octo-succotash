// Small helpers to build low-poly models from colored boxes and cylinders,
// merged into one geometry with vertex colors so each model is one draw call.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export class Kit {
  private parts: THREE.BufferGeometry[] = [];

  box(w: number, h: number, d: number, x: number, y: number, z: number, color: number, rx = 0, ry = 0, rz = 0) {
    return this.add(new THREE.BoxGeometry(w, h, d), x, y, z, color, rx, ry, rz);
  }

  cyl(rTop: number, rBot: number, h: number, x: number, y: number, z: number, color: number, rx = 0, ry = 0, rz = 0, seg = 10) {
    return this.add(new THREE.CylinderGeometry(rTop, rBot, h, seg), x, y, z, color, rx, ry, rz);
  }

  sphere(r: number, x: number, y: number, z: number, color: number, sx = 1, sy = 1, sz = 1) {
    const g = new THREE.SphereGeometry(r, 12, 8);
    g.scale(sx, sy, sz);
    return this.add(g, x, y, z, color);
  }

  add(g: THREE.BufferGeometry, x: number, y: number, z: number, color: number, rx = 0, ry = 0, rz = 0) {
    const geo = g.index ? g.toNonIndexed() : g;
    geo.deleteAttribute("uv");
    geo.rotateX(rx); geo.rotateY(ry); geo.rotateZ(rz);
    geo.translate(x, y, z);
    const c = new THREE.Color(color);
    const n = geo.attributes.position.count;
    const col = new Float32Array(n * 3);
    const nrm = geo.attributes.normal;
    for (let i = 0; i < n; i++) {
      // Bake a little directional shading so unlit materials still read as 3D.
      const shade = 0.72 + 0.28 * nrm.getY(i) + 0.08 * nrm.getX(i);
      col[i * 3] = c.r * shade;
      col[i * 3 + 1] = c.g * shade;
      col[i * 3 + 2] = c.b * shade;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    this.parts.push(geo);
    return this;
  }

  build(): THREE.BufferGeometry {
    const g = mergeGeometries(this.parts, false)!;
    g.computeBoundingSphere();
    return g;
  }
}
