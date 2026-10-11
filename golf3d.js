/* Mulligan Cup 3D view: real-time 3D course, golfers and ball on WebGL (three.js).
   The game rules, physics and camera path live in golf.html; this file only draws them.
   World units: x across, y down the hole, z up. three.js: X = x, Y = z, Z = y. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const G3 = { ok: false };
window.Golf3D = G3;

function start() {
  const api = window.__mc; if (!api) { setTimeout(start, 30); return; }
  const canvas = document.getElementById('c3');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.style.display = 'none'; return; }   // no WebGL: the 2D view keeps running
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const { G, ball, cam, CHARS, CLUBS } = api;
  const gz = (x, y) => api.groundZ(G.hole, x, y);
  const V3 = (x, y, z) => new THREE.Vector3(x, z, y);

  /* ---------------- scene, sky, light ---------------- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfeeff, 1100, 3400);
  const camera = new THREE.PerspectiveCamera(60, 1, 2, 9000);
  {
    const sky = new THREE.SphereGeometry(6000, 24, 16), col = [], pos = sky.attributes.position, top = new THREE.Color(0x2f8fe8), mid = new THREE.Color(0x9fd8ff), bot = new THREE.Color(0xe6f7ff), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 6000; if (y > .1) c.copy(mid).lerp(top, Math.min(1, (y - .1) / .6)); else c.copy(bot).lerp(mid, clamp((y + .05) / .15, 0, 1)); col.push(c.r, c.g, c.b); }
    sky.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(sky, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); m.renderOrder = -10; scene.add(m); G3.sky = m;
  }
  const hemi = new THREE.HemisphereLight(0xe8f6ff, 0x6a8a4a, 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4dd, 1.05); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -220; sc.right = 220; sc.top = 220; sc.bottom = -220; sc.near = 10; sc.far = 1200; sun.shadow.bias = -.0006; sun.shadow.normalBias = .6;
  scene.add(sun); scene.add(sun.target);
  const SUN_DIR = new THREE.Vector3(-.45, .8, .38).normalize();

  // clouds: soft puffs far away
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xcfe8ff, emissiveIntensity: .55, fog: false });
  const clouds = new THREE.Group(); scene.add(clouds);
  for (let i = 0; i < 14; i++) {
    const g = new THREE.Group(), a = i / 14 * TAU + Math.random() * .3, r = 3600 + Math.random() * 900;
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), cloudMat); b.scale.set(120 + Math.random() * 90, 60 + Math.random() * 30, 90); b.position.set((k - 1.5) * 120, Math.random() * 30, Math.random() * 40); g.add(b); }
    g.position.set(Math.cos(a) * r, 700 + Math.random() * 700, Math.sin(a) * r); g.lookAt(0, g.position.y, 0); clouds.add(g);
  }

  /* ---------------- shared materials and geometry ---------------- */
  const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const MAT = {
    trunk: lam(0x7a4f2a), leaf: [lam(0x2f9e44, { flatShading: true }), lam(0x3aa64a, { flatShading: true }), lam(0x2b8f6a, { flatShading: true })],
    leafHi: [lam(0x49bf5e, { flatShading: true }), lam(0x5ccc6c, { flatShading: true }), lam(0x40b088, { flatShading: true })],
    rock: lam(0x9aa6b8, { flatShading: true }), white: lam(0xffffff), dark: lam(0x17251a), flag: lam(0xff4d5e, { side: THREE.DoubleSide }), gold: lam(0xffd34d),
    water: new THREE.MeshPhongMaterial({ color: 0x2f9be6, specular: 0xbfe6ff, shininess: 80, transparent: true, opacity: .86 }),
    aim: new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: .9, depthWrite: false }),
    aimDot: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, depthWrite: false }),
    mark: new THREE.MeshBasicMaterial({ color: 0x6ec6ff, transparent: true, opacity: .85, depthWrite: false, side: THREE.DoubleSide }),
    shadow: new THREE.MeshBasicMaterial({ color: 0x0a1e10, transparent: true, opacity: .35, depthWrite: false })
  };

  /* ---------------- course ---------------- */
  let course = null;   // { hole, group, tex, ... }
  const COLS = { rough: '#4fae3e', fairway: '#7fd34f', fringe: '#93df5c', green: '#a6ee6e', tee: '#96e264', sand: '#f1dc9c', water: '#2a7fc0' };
  function paintCourse(h, M, px) {
    const cw = Math.round((h.W + 2 * M) * px), ch = Math.round((h.H + 2 * M) * px), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    const c = cv.getContext('2d'); c.setTransform(px, 0, 0, px, M * px, M * px);
    c.fillStyle = '#3b8f35'; c.fillRect(-M, -M, h.W + 2 * M, h.H + 2 * M);
    c.fillStyle = COLS.rough; c.fillRect(0, 0, h.W, h.H);
    // mottled rough
    for (let i = 0; i < 900; i++) { const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * h.W, y = (Math.sin(i * 78.233) * 12345.678 % 1 + 1) % 1 * h.H; c.fillStyle = i % 2 ? 'rgba(30,110,40,.18)' : 'rgba(140,215,90,.14)'; c.beginPath(); c.arc(x, y, 6 + (i % 7) * 3, 0, TAU); c.fill(); }
    const path = s => { c.beginPath(); s.pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
    for (const s of h.shapes) { if (!s.deco) continue; path(s); c.fillStyle = s.col; c.fill(); }
    for (const s of h.shapes) {
      if (s.deco) continue; path(s); c.fillStyle = COLS[s.t] || COLS.rough; c.fill();
      if (s.t === 'fairway' || s.t === 'green' || s.t === 'fringe' || s.t === 'tee') {   // mown stripes
        c.save(); path(s); c.clip(); c.fillStyle = s.t === 'green' ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.09)';
        const step = s.t === 'green' ? 9 : 22; for (let k = -h.H; k < h.W + h.H; k += step * 2) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + step, 0); c.lineTo(k + step - h.H * .35, h.H); c.lineTo(k - h.H * .35, h.H); c.fill(); }
        c.restore();
      }
      if (s.t === 'sand') { c.save(); path(s); c.clip(); c.fillStyle = 'rgba(190,160,90,.25)'; for (let k = 0; k < 60; k++) { c.fillRect(s.pts[k % s.pts.length][0] + (k * 7 % 23) - 11, s.pts[(k * 3) % s.pts.length][1] + (k * 5 % 19) - 9, 1.5, 1.5); } c.restore(); c.strokeStyle = 'rgba(160,130,70,.6)'; c.lineWidth = 2; path(s); c.stroke(); }
      if (s.t === 'water') { c.strokeStyle = 'rgba(240,230,190,.9)'; c.lineWidth = 4; path(s); c.stroke(); }
    }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); tex.generateMipmaps = true;
    return tex;
  }
  function buildCourse(h) {
    if (course) { scene.remove(course.group); course.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); course.tex.dispose(); }
    const group = new THREE.Group(), M = 420, step = 10, px = Math.min(1.3, 4000 / (h.H + 2 * M));
    const tex = paintCourse(h, M, px);
    // terrain grid
    const nx = Math.ceil((h.W + 2 * M) / step), ny = Math.ceil((h.H + 2 * M) / step), pos = new Float32Array((nx + 1) * (ny + 1) * 3), uv = new Float32Array((nx + 1) * (ny + 1) * 2), idx = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const x = -M + i * step, y = -M + j * step, k = j * (nx + 1) + i;
      pos[k * 3] = x; pos[k * 3 + 1] = api.groundZ(h, x, y); pos[k * 3 + 2] = y;
      uv[k * 2] = i / nx; uv[k * 2 + 1] = 1 - j / ny;
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex })); ground.receiveShadow = true; group.add(ground);
    // far countryside ring and mountains
    const far = new THREE.Mesh(new THREE.CircleGeometry(5200, 48), lam(0x3f8f3a)); far.rotation.x = -Math.PI / 2; far.position.set(h.W / 2, -2, h.H / 2); group.add(far);
    for (let i = 0; i < 26; i++) {
      const a = i / 26 * TAU, r = 2600 + (i % 3) * 500, hh = 500 + (i * 37 % 7) * 120;
      const m = new THREE.Mesh(new THREE.ConeGeometry(700 + (i % 4) * 160, hh, 7), lam(i % 2 ? 0x6fae8c : 0x5c9c7a, { flatShading: true }));
      m.position.set(h.W / 2 + Math.cos(a) * r, hh / 2 - 20, h.H / 2 + Math.sin(a) * r); group.add(m);
      if (hh > 800) { const cap = new THREE.Mesh(new THREE.ConeGeometry((700 + (i % 4) * 160) * .32, hh * .32, 7), lam(0xf4fbff, { flatShading: true })); cap.position.set(m.position.x, hh - hh * .16 - 20, m.position.z); group.add(cap); }
    }
    // water surfaces
    for (const s of h.shapes) {
      if (s.t !== 'water' || s.deco) continue;
      const cx = s.pts.reduce((a, p) => a + p[0], 0) / s.pts.length, cy = s.pts.reduce((a, p) => a + p[1], 0) / s.pts.length, v = [cx, -2.4, cy], ix = [];
      s.pts.forEach(p => v.push(p[0], -2.4, p[1]));
      for (let i = 0; i < s.pts.length; i++) ix.push(0, 1 + (i + 1) % s.pts.length, 1 + i);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(ix); g.computeVertexNormals();
      const w = new THREE.Mesh(g, MAT.water); w.receiveShadow = true; group.add(w);
    }
    // trees (instanced): round canopies and pines
    const round = h.trees.filter(t => t.kind === 0), pine = h.trees.filter(t => t.kind === 1), dummy = new THREE.Object3D();
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .7, 1, 7), MAT.trunk, h.trees.length);
    h.trees.forEach((t, i) => { const z = api.groundZ(h, t.x, t.y); dummy.position.set(t.x, z + t.h * .25, t.y); dummy.scale.set(t.r * .3, t.h * .5, t.r * .3); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix); });
    trunk.castShadow = true; group.add(trunk);
    for (let c = 0; c < 3; c++) {
      const rs = round.filter(t => t.c === c), ps = pine.filter(t => t.c === c);
      if (rs.length) {
        const a = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), MAT.leaf[c], rs.length * 3), b = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), MAT.leafHi[c], rs.length);
        rs.forEach((t, i) => { const z = api.groundZ(h, t.x, t.y);
          [[0, .68, 1], [-.55, .5, .72], [.55, .52, .72]].forEach(([dx, dy, s], k) => { dummy.position.set(t.x + dx * t.r, z + t.h * dy, t.y + (k ? .3 * t.r : 0)); dummy.scale.setScalar(t.r * s); dummy.rotation.set(i, k, 0); dummy.updateMatrix(); a.setMatrixAt(i * 3 + k, dummy.matrix); });
          dummy.position.set(t.x - .25 * t.r, z + t.h * .8, t.y - .2 * t.r); dummy.scale.setScalar(t.r * .5); dummy.updateMatrix(); b.setMatrixAt(i, dummy.matrix); });
        a.castShadow = b.castShadow = true; group.add(a, b);
      }
      if (ps.length) {
        const a = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 8), MAT.leaf[c], ps.length * 3);
        ps.forEach((t, i) => { const z = api.groundZ(h, t.x, t.y); for (let k = 0; k < 3; k++) { dummy.position.set(t.x, z + t.h * (.42 + k * .2), t.y); dummy.scale.set(t.r * (1.2 - k * .28), t.h * .36, t.r * (1.2 - k * .28)); dummy.rotation.set(0, i + k, 0); dummy.updateMatrix(); a.setMatrixAt(i * 3 + k, dummy.matrix); } });
        a.castShadow = true; group.add(a);
      }
    }
    for (const r of h.rocks) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r.r * 1.1, 0), MAT.rock); m.position.set(r.x, api.groundZ(h, r.x, r.y) + r.r * .7, r.y); m.scale.set(1, 1.25, 1); m.rotation.set(r.x, r.y, 0); m.castShadow = true; m.receiveShadow = true; group.add(m); }
    // cup, pin and flag
    const pz = api.groundZ(h, h.pin[0], h.pin[1]);
    const cup = new THREE.Mesh(new THREE.CircleGeometry(api.CUP_R, 24), MAT.dark); cup.rotation.x = -Math.PI / 2; cup.position.set(h.pin[0], pz + .25, h.pin[1]); group.add(cup);
    const rim = new THREE.Mesh(new THREE.RingGeometry(api.CUP_R, api.CUP_R + 1.2, 24), MAT.white); rim.rotation.x = -Math.PI / 2; rim.position.set(h.pin[0], pz + .22, h.pin[1]); group.add(rim);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, 64, 8), MAT.white); pole.position.set(h.pin[0], pz + 32, h.pin[1]); pole.castShadow = true; group.add(pole);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), MAT.gold); knob.position.set(h.pin[0], pz + 64.5, h.pin[1]); group.add(knob);
    const flagGeo = new THREE.PlaneGeometry(24, 15, 10, 3); flagGeo.translate(12, -7.5, 0);
    const flag = new THREE.Mesh(flagGeo, MAT.flag); flag.position.set(h.pin[0], pz + 64, h.pin[1]); flag.castShadow = true; group.add(flag);
    scene.add(group);
    course = { hole: h, group, tex, flag, flagBase: flagGeo.attributes.position.array.slice() };
  }

  /* ---------------- ball, shadow, aim aids, particles, trail ---------------- */
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(api.BALL_R, 16, 12), lam(0xffffff, { emissive: 0x333333 })); ballMesh.castShadow = true; scene.add(ballMesh);
  const blob = new THREE.Mesh(new THREE.CircleGeometry(1, 16), MAT.shadow); blob.rotation.x = -Math.PI / 2; scene.add(blob);
  const aimGroup = new THREE.Group(); scene.add(aimGroup);
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), MAT.aimDot, 30); aimGroup.add(dots);
  const ring = new THREE.Mesh(new THREE.RingGeometry(12, 16, 32), MAT.aim); ring.rotation.x = -Math.PI / 2; aimGroup.add(ring);
  const ringDot = new THREE.Mesh(new THREE.CircleGeometry(4.5, 16), MAT.aim); ringDot.rotation.x = -Math.PI / 2; aimGroup.add(ringDot);
  const markGroup = new THREE.Group(); scene.add(markGroup);
  { const r = new THREE.Mesh(new THREE.RingGeometry(9, 12, 28), MAT.mark); r.rotation.x = -Math.PI / 2; markGroup.add(r); const p = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 26, 6), MAT.white); p.position.y = 13; markGroup.add(p); const f = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), MAT.mark); f.position.set(6, 22, 0); markGroup.add(f); }
  const PMAX = 400, pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3), pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 3.2, vertexColors: true, sizeAttenuation: true })); points.frustumCulled = false; scene.add(points);
  const tPos = new Float32Array(16 * 3), tGeo = new THREE.BufferGeometry(); tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
  const trail = new THREE.Line(tGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75 })); trail.frustumCulled = false; scene.add(trail);
  const tmpC = new THREE.Color();

  /* ---------------- the golfers: chunky, round, smooth-shaded ---------------- */
  // Each body part is a primitive; Lambert shading gives the soft 1990s console look.
  function part(geo, mat, x, y, z, sx, sy, sz, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); m.castShadow = true; parent.add(m); return m; }
  const SPH = new THREE.SphereGeometry(1, 18, 14), CAPS = new THREE.CapsuleGeometry(1, 1, 6, 12), CONE = new THREE.ConeGeometry(1, 1, 14), CYL = new THREE.CylinderGeometry(1, 1, 1, 14);
  // body faces +z (towards the ball); y up; feet at 0
  function buildGolfer(ch) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const m = { skin: lam(ch.skin), shirt: lam(ch.body), pants: lam(ch.pants), shoe: lam(ch.shoe === '#ffffff' ? 0xb8452f : ch.shoe), cap: lam(ch.cap), white: lam(0xffffff), eye: lam(0x1d3c8f), black: lam(0x15151a), glove: lam(0xffffff), btn: lam(0xffd34d) };
    const W = ch.w;
    let head = new THREE.Group();
    if (ch.kind === 'bird') {
      part(SPH, m.shirt, 0, 15, 0, 11 * W, 12, 11, body);                         // round body
      part(SPH, lam(0xfff3b0), 0, 13, 6, 7, 8, 5, body);                           // belly
      part(SPH, lam(ch.pants), -5, 2, 2, 3.4, 2, 5.5, body); part(SPH, lam(ch.pants), 5, 2, 2, 3.4, 2, 5.5, body);   // feet
      head.position.set(0, 29, 0); body.add(head);
      part(SPH, m.shirt, 0, 0, 0, 9.5, 9, 9.5, head);
      part(CONE, lam(0xff8a3d), 0, -1.5, 10, 2.6, 6, 2.6, head).rotation.x = Math.PI / 2;
      for (let k = 0; k < 3; k++) { const f = part(CONE, m.cap, (k - 1) * 2.4, 10 + (k === 1 ? 2 : 0), -1, 1.6, 7, 1.6, head); f.rotation.z = (k - 1) * .45; f.rotation.x = -.35; }
    } else {
      const big = ch.kind === 'big';
      part(CAPS, m.pants, -4.2 * W, 6, 0, 2.6 * W, 3.2, 2.6 * W, body); part(CAPS, m.pants, 4.2 * W, 6, 0, 2.6 * W, 3.2, 2.6 * W, body);   // legs
      part(SPH, m.shoe, -4.4 * W, 1.6, 1.8, 3.4 * W, 2.3, 5.4, body); part(SPH, m.shoe, 4.4 * W, 1.6, 1.8, 3.4 * W, 2.3, 5.4, body);       // big shoes
      part(SPH, m.pants, 0, 12.5, 0, 8.6 * W, 6, 7 * W, body);                     // hips and overalls
      part(SPH, m.shirt, 0, 18.5, 0, 8 * W, 7.5, 6.6 * W, body);                   // chest
      part(CYL, m.pants, 0, 16, 5.6 * W, 5.5 * W, .9, 6, body).rotation.x = Math.PI / 2;   // bib
      part(SPH, m.btn, -3.2 * W, 18.5, 6.3 * W, 1.1, 1.1, .6, body); part(SPH, m.btn, 3.2 * W, 18.5, 6.3 * W, 1.1, 1.1, .6, body);
      head.position.set(0, 31 * (big ? .98 : 1), 0); body.add(head);
      const hr = 8.4 * ch.hs;
      part(SPH, m.skin, 0, 0, 0, hr, hr * .96, hr, head);
      part(SPH, m.skin, 0, -1.6, hr * .98, hr * .3, hr * .26, hr * .3, head);      // round nose
      for (const s of [-1, 1]) {
        part(SPH, m.white, s * hr * .32, hr * .2, hr * .82, hr * .2, hr * .3, hr * .14, head);
        part(SPH, m.eye, s * hr * .3, hr * .18, hr * .93, hr * .1, hr * .16, hr * .06, head);
        part(SPH, m.skin, s * hr * .98, 0, 0, hr * .2, hr * .26, hr * .14, head);  // ears
      }
      // cap: dome and brim
      const dome = part(SPH, m.cap, 0, hr * .28, 0, hr * 1.04, hr * .72, hr * 1.04, head);
      const brim = part(CYL, m.cap, 0, hr * .22, hr * .72, hr * .72, hr * .08, hr * .5, head);
      if (big) { brim.position.z = -hr * .7; part(SPH, lam(0x5b3a1e), 0, -hr * .55, hr * .55, hr * .8, hr * .5, hr * .55, head); }   // backwards cap and a beard
      else { part(SPH, m.white, 0, hr * .62, hr * .86, hr * .26, hr * .22, hr * .08, head); }  // cap badge
      void dome;
    }
    head.userData.base = head.position.clone();
    return { g, body, head, mats: m, ch };
  }
  const limbGeo = new THREE.CylinderGeometry(1, 1, 1, 12), ZUP = new THREE.Vector3(0, 1, 0);
  function placeLimb(mesh, a, b, r) { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); mesh.position.copy(a).addScaledVector(d, .5); mesh.quaternion.setFromUnitVectors(ZUP, d.normalize()); mesh.scale.set(r, Math.max(.1, L), r); }
  function buildRig(model) {
    const ch = model.ch, armMat = ch.kind === 'bird' ? model.mats.shirt : model.mats.shirt;
    const r = { armL: new THREE.Mesh(limbGeo, armMat), armR: new THREE.Mesh(limbGeo, armMat), glove: new THREE.Mesh(SPH, ch.kind === 'bird' ? model.mats.shirt : model.mats.glove), club: new THREE.Group() };
    [r.armL, r.armR, r.glove].forEach(o => { o.castShadow = true; scene.add(o); });
    r.glove.scale.setScalar(2.5);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, 1, 6), lam(0xd9e1ee)); shaft.position.y = .5; r.club.add(shaft); r.shaft = shaft;
    r.head = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), lam(0x39475f)); r.club.add(r.head); r.grip = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 1, 6), lam(0x15151a)); r.club.add(r.grip);
    r.club.traverse(o => { o.castShadow = true; }); scene.add(r.club);
    return r;
  }
  let golfer = null, rig = null, golferCh = -1, addrT = null;
  function ensureGolfer() {
    if (golferCh === G.ch && golfer) return;
    if (golfer) { scene.remove(golfer.g); [rig.armL, rig.armR, rig.glove, rig.club].forEach(o => scene.remove(o)); }
    golfer = buildGolfer(CHARS[G.ch]); rig = buildRig(golfer); scene.add(golfer.g); golferCh = G.ch;
  }
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3(), _q = new THREE.Quaternion();
  function poseGolfer(t) {
    ensureGolfer();
    const gp = api.golferPos(), vis = !!gp;
    golfer.g.visible = rig.armL.visible = rig.armR.visible = rig.glove.visible = rig.club.visible = vis; if (!vis) return;
    const sc = .82 * 1.05, gzz = gz(gp.x, gp.y), bz = gz(ball.x, ball.y);
    golfer.g.position.set(gp.x, gzz, gp.y); golfer.g.scale.setScalar(sc);
    const face = Math.atan2(ball.x - gp.x, ball.y - gp.y); golfer.g.rotation.y = face;
    // swing angle in the old 2D convention: theta < 0 backswing, > 0 follow-through
    const a = api.swingAngle(), a0 = G.a0 || .9, th = a - a0;
    golfer.body.rotation.y = -th * .35 * G.hand;
    golfer.head.position.y = golfer.head.userData.base.y + Math.sin(t * 2.2) * .25;
    golfer.head.rotation.y = clamp(th * .15 * G.hand, -.3, .3);
    // shoulders and the swing plane
    const fwd = _a.set(Math.sin(face), 0, Math.cos(face));
    const pivot = new THREE.Vector3(gp.x, gzz + 23 * sc, gp.y).addScaledVector(fwd, 3.5 * sc);
    if (G.phase !== 'fly' || !addrT) addrT = { x: ball.x, y: ball.y, z: bz };
    const target = _b.set(addrT.x, addrT.z + api.BALL_R, addrT.y);
    const addr = new THREE.Vector3().subVectors(target, pivot), reach = addr.length(); addr.normalize();
    const aimV = _c.set(Math.cos(G.aim), 0, Math.sin(G.aim));
    _n.crossVectors(addr, aimV).normalize();
    const dir = addr.clone().applyQuaternion(_q.setFromAxisAngle(_n, th));
    const armLen = 11 * sc, hands = pivot.clone().addScaledVector(dir, armLen);
    const side = new THREE.Vector3(Math.cos(face), 0, -Math.sin(face)).multiplyScalar(5.5 * sc * CHARS[G.ch].w);
    placeLimb(rig.armL, pivot.clone().add(side), hands, 1.9 * sc); placeLimb(rig.armR, pivot.clone().sub(side), hands, 1.9 * sc);
    rig.glove.position.copy(hands);
    const L = Math.max(10, reach - armLen), ck = CLUBS[G.club].t;
    rig.club.position.copy(hands); rig.club.quaternion.setFromUnitVectors(ZUP, dir); rig.shaft.scale.set(1, L, 1);
    rig.grip.position.y = 3; rig.grip.scale.set(1, 6, 1);
    const hd = ck === 'w' ? [2.6, 1.6, 2.2] : ck === 'g' ? [1.9, .5, 1.7] : ck === 'p' ? [2.6, .7, 1] : [2, .55, 1.5];
    rig.head.position.y = L + hd[1] * .4; rig.head.scale.set(hd[0], hd[1], hd[2]);
    rig.head.material.color.set(ck === 'w' ? 0x39475f : 0xcfd8e6);
  }

  /* ---------------- character select cards ---------------- */
  let cardR = null, cardScene, cardCam, cardModels = [];
  G3.drawCards = function (ctxs) {
    if (!cardR) {
      const cv = document.createElement('canvas'); cv.width = 220; cv.height = 240;
      try { cardR = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return; }
      cardR.outputColorSpace = THREE.SRGBColorSpace; cardR.setSize(220, 240, false);
      cardScene = new THREE.Scene(); cardScene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a5a, .9)); const d = new THREE.DirectionalLight(0xffffff, 1.1); d.position.set(-30, 60, 80); cardScene.add(d);
      cardCam = new THREE.PerspectiveCamera(30, 220 / 240, 1, 500); cardCam.position.set(0, 26, 92); cardCam.lookAt(0, 21, 0);
      cardModels = CHARS.map(ch => { const m = buildGolfer(ch); // arms for the poster pose
        const mat = ch.kind === 'bird' ? m.mats.shirt : m.mats.shirt;
        for (const s of [-1, 1]) { const arm = new THREE.Mesh(limbGeo, mat); placeLimb(arm, new THREE.Vector3(s * 7 * ch.w, 22, 0), new THREE.Vector3(s * 11 * ch.w, 12, 4), 1.9); m.body.add(arm); const gl = new THREE.Mesh(SPH, ch.kind === 'bird' ? m.mats.shirt : m.mats.glove); gl.scale.setScalar(2.6); gl.position.set(s * 11 * ch.w, 12, 4); m.body.add(gl); }
        return m; });
    }
    const t = performance.now() / 1000;
    cardModels.forEach((m, i) => {
      cardScene.add(m.g); m.g.rotation.y = Math.sin(t * .8 + i) * .5; m.g.scale.set(G.hand < 0 ? -1 : 1, 1, 1);
      cardR.render(cardScene, cardCam); cardScene.remove(m.g);
      const c = ctxs[i]; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 220, 240); c.drawImage(cardR.domElement, 0, 0);
    });
  };

  /* ---------------- per frame ---------------- */
  let camZ = null;
  let slowT = 0, quality = 2;
  G3.render = function (dt) {
    const W = api.W, H = api.H, t = G.time;
    // step down the resolution on slow devices
    if (quality > 0) { slowT = dt > .045 ? slowT + dt : Math.max(0, slowT - dt * .5); if (slowT > 2.5) { quality--; slowT = 0; renderer.setPixelRatio(quality === 1 ? Math.min(1.5, window.devicePixelRatio || 1) : 1); if (quality === 0) { sun.shadow.mapSize.set(1024, 1024); sun.shadow.map && sun.shadow.map.dispose(); sun.shadow.map = null; } } }
    if (renderer.domElement.width !== Math.round(W * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(H * renderer.getPixelRatio())) renderer.setSize(W, H, false);
    if (!course || course.hole !== G.hole) { buildCourse(G.hole); camZ = null; }
    // camera follows the game's camera path, riding over the terrain
    const tz = gz(cam.x, cam.y), bz = gz(ball.x, ball.y);
    let need = Math.max(tz, bz) + cam.h;
    for (let k = 1; k < 10; k++) { const f = k / 10, x = cam.x + (ball.x - cam.x) * f, y = cam.y + (ball.y - cam.y) * f, clear = gz(x, y) + 9; need = Math.max(need, (clear - (bz + 3) * f) / (1 - f)); }
    const base = need - cam.h;
    camZ = camZ == null ? base : camZ + (base - camZ) * Math.min(1, dt * (base > camZ ? 8 : 3));
    const F = .9 * Math.min(W, .9 * H) * 1.08;
    camera.fov = 2 * Math.atan(H / 2 / F) * 180 / Math.PI; camera.aspect = W / H;
    // keep the 2D view's framing: the horizon sat at 45% of the height, not the middle
    camera.setViewOffset(W, H, 0, H * .5 - H * (H < 520 ? .42 : .45), W, H);
    camera.updateProjectionMatrix();
    camera.position.set(cam.x, cam.h + camZ, cam.y);
    const cp = Math.cos(cam.pitch);
    camera.lookAt(cam.x + Math.cos(cam.yaw) * cp * 100, cam.h + camZ - Math.sin(cam.pitch) * 100, cam.y + Math.sin(cam.yaw) * cp * 100);
    G3.sky.position.copy(camera.position);
    // sun and shadows follow the action
    const fx = G.phase === 'fly' ? ball.x : (ball.x + cam.x) / 2, fy = G.phase === 'fly' ? ball.y : (ball.y + cam.y) / 2;
    sun.target.position.set(fx, gz(fx, fy), fy); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 500); sun.target.updateMatrixWorld();
    // ball
    const by = bz + ball.z + api.BALL_R * .9;
    ballMesh.visible = !(ball.sink >= 1); ballMesh.position.set(ball.x, by - (ball.sink || 0) * 3, ball.y); ballMesh.scale.setScalar(1 - (ball.sink || 0) * .6);
    blob.visible = ballMesh.visible && !ball.sink; blob.position.set(ball.x, bz + .35, ball.y); const bs = 2.4 + ball.z * .02; blob.scale.setScalar(bs); MAT.shadow.opacity = clamp(.45 - ball.z * .002, .12, .45);
    // flag waves in the wind
    { const f = course.flag, p = f.geometry.attributes.position, b0 = course.flagBase, sp = G.hole.wind[0];
      for (let i = 0; i < p.count; i++) { const x = b0[i * 3]; p.setZ(i, Math.sin(t * (5 + sp * .3) - x * .35) * x * .07); } p.needsUpdate = true; f.geometry.computeVertexNormals();
      f.rotation.y = -G.hole.wind[1]; }
    // aim aids
    const aiming = G.mode === 'play' && (G.phase === 'aim' || G.phase === 'meter');
    aimGroup.visible = aiming;
    if (aiming) {
      const f = api.clubRange(CLUBS[G.club], false), dx = Math.cos(G.aim), dy = Math.sin(G.aim), n = 30, dm = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const q = (i + 1) / (n + 1), x = ball.x + dx * f * q, y = ball.y + dy * f * q; dm.position.set(x, gz(x, y) + 1.2, y); dm.scale.setScalar(1.3); dm.updateMatrix(); dots.setMatrixAt(i, dm.matrix); }
      dots.instanceMatrix.needsUpdate = true;
      const tx = ball.x + dx * f, ty = ball.y + dy * f, tzz = gz(tx, ty) + 1.4, pl = 1 + .12 * Math.sin(t * 5);
      ring.position.set(tx, tzz, ty); ring.scale.setScalar(pl); ringDot.position.set(tx, tzz + .1, ty);
    }
    markGroup.visible = aiming && !!G.mark; if (G.mark) markGroup.position.set(G.mark.x, gz(G.mark.x, G.mark.y) + .8, G.mark.y);
    // particles
    const ps = api.parts; let np = 0;
    for (const p of ps) { if (np >= PMAX) break; pPos[np * 3] = p.x; pPos[np * 3 + 1] = gz(p.x, p.y) + p.z + 1; pPos[np * 3 + 2] = p.y; tmpC.set(p.col); pCol[np * 3] = tmpC.r; pCol[np * 3 + 1] = tmpC.g; pCol[np * 3 + 2] = tmpC.b; np++; }
    pGeo.setDrawRange(0, np); pGeo.attributes.position.needsUpdate = true; pGeo.attributes.color.needsUpdate = true;
    // trail
    const tr = ball.trail; for (let i = 0; i < 16; i++) { const q = tr[Math.min(i, tr.length - 1)] || [ball.x, ball.y, ball.z]; tPos[i * 3] = q[0]; tPos[i * 3 + 1] = gz(q[0], q[1]) + q[2] + 1; tPos[i * 3 + 2] = q[1]; }
    tGeo.attributes.position.needsUpdate = true; trail.visible = tr.length > 1 && G.phase === 'fly';
    clouds.rotation.y = t * .004;
    poseGolfer(t);
    renderer.render(scene, camera);
    if (G.mode === 'select' && window.__mc.drawCards && Math.floor(t * 20) % 2 === 0) window.__mc.drawCards();
  };
  G3.ok = true; G3.THREE = THREE; G3.quality = () => quality; G3.dbg = () => ({ golfer: !!(golfer && golfer.g.visible), quality, camZ, ball: ballMesh.visible }); G3.scene = scene; G3.renderer = renderer;
  window.dispatchEvent(new Event('golf3d-ready'));
  if (api.drawCards) api.drawCards();
}
start();
