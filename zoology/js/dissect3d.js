/* ============================================================
   dissect3d.js — the 3D dissection engine.

   A specimen is a list of named parts; each part is a handful of
   simple shapes (ellipsoids, tapering tubes, flat sheets, domes,
   rings) merged into one mesh. Nothing is downloaded: every organ
   is modelled procedurally from the numbers in data/dissect/*.js,
   so the whole lab works offline.

   A part has a step at which it is exposed (s) and, if it is cut
   away or reflected, a step at which it leaves (u). Moving through
   the steps therefore performs the dissection. The engine handles
   orbit / pinch / pan, picking (with help for thin structures like
   nerves and ducts), highlighting, leader-line labels, numbered
   pins, turning the specimen over, and tracing an incision with a
   scalpel.

   Coordinates: x runs head (−) to tail (+), y is up off the tray,
   z is toward the viewer.
   ============================================================ */
import * as THREE from '../../three.module.min.js';

const DEG = Math.PI / 180;

function interp(arr, t) {
  const n = arr.length; if (n === 1) return arr[0];
  const i = Math.min(n - 2, Math.max(0, Math.floor(t))); const f = Math.min(1, Math.max(0, t - i));
  const p0 = arr[Math.max(0, i - 1)], p1 = arr[i], p2 = arr[i + 1], p3 = arr[Math.min(n - 1, i + 2)];
  const v = 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
  const lo = Math.min(p1, p2), hi = Math.max(p1, p2);
  return Math.max(0, Math.min(hi + (hi - lo) * 0.15, Math.max(lo - (hi - lo) * 0.15, v)));
}

/* ---------- shape builders: each returns a BufferGeometry ---------- */
function tubeGeo(s) {
  const pts = s.pts.map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const n = pts.length;
  const curve = n === 2 ? new THREE.LineCurve3(pts[0], pts[1]) : new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const segs = s.seg || Math.max(4, (n - 1) * 6);
  const full = !s.arc; const rs = s.rs || (full ? 12 : 10);
  const a0 = full ? 0 : s.arc[0] * DEG, a1 = full ? Math.PI * 2 : s.arc[1] * DEG;
  const ringN = full ? rs : rs + 1;
  const R = Array.isArray(s.r) ? s.r : null, SY = Array.isArray(s.sy) ? s.sy : null, SZ = Array.isArray(s.sz) ? s.sz : null;
  const pos = [], idx = [];
  let N = null; const up = new THREE.Vector3().fromArray(s.up || [0, 1, 0]);
  const T = new THREE.Vector3(), B = new THREE.Vector3(), c = new THREE.Vector3();
  let r0 = 0, r1 = 0;
  for (let i = 0; i <= segs; i++) {
    const u = i / segs; curve.getPoint(u, c); curve.getTangent(u, T).normalize();
    if (!N) { N = up.clone().addScaledVector(T, -up.dot(T)); if (N.lengthSq() < 1e-4) { N.set(0, 0, 1).addScaledVector(T, -T.z); } N.normalize(); }
    else { N.addScaledVector(T, -N.dot(T)).normalize(); }
    B.crossVectors(T, N).normalize();
    const t = u * (n - 1);
    const r = R ? interp(R, t) : s.r, sy = SY ? interp(SY, t) : (s.sy || 1), sz = SZ ? interp(SZ, t) : (s.sz || 1);
    if (i === 0) r0 = r; if (i === segs) r1 = r;
    for (let j = 0; j < ringN; j++) {
      const a = a0 + (a1 - a0) * j / rs;
      const cy = Math.cos(a) * r * sy, cz = Math.sin(a) * r * sz;
      pos.push(c.x + N.x * cy + B.x * cz, c.y + N.y * cy + B.y * cz, c.z + N.z * cy + B.z * cz);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < rs; j++) {
    const jn = full ? (j + 1) % ringN : j + 1;
    const a = i * ringN + j, b = i * ringN + jn, cc = (i + 1) * ringN + j, d = (i + 1) * ringN + jn;
    idx.push(a, b, cc, b, d, cc);
  }
  if (full && s.cap !== false) {
    if (r0 > 1e-3) { const p = curve.getPoint(0); const ci = pos.length / 3; pos.push(p.x, p.y, p.z); for (let j = 0; j < rs; j++) idx.push(ci, (j + 1) % rs, j); }
    if (r1 > 1e-3) { const p = curve.getPoint(1); const ci = pos.length / 3; pos.push(p.x, p.y, p.z); const o = segs * ringN; for (let j = 0; j < rs; j++) idx.push(ci, o + j, o + (j + 1) % rs); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function xform(g, s) {
  const m = new THREE.Matrix4(); const r = s.rot || [0, 0, 0];
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, 'XYZ'));
  const sc = s.s ? new THREE.Vector3(s.s[0], s.s[1], s.s[2]) : new THREE.Vector3(1, 1, 1);
  m.compose(new THREE.Vector3().fromArray(s.p || [0, 0, 0]), q, sc); g.applyMatrix4(m); return g;
}
function fanGeo(s) {
  /* a flat sheet: every triangle is wound to face the same way and shares one normal,
     so outlines that are not convex still shade evenly */
  const P = s.pts, n = P.length; const c = [0, 0, 0]; P.forEach(p => { c[0] += p[0] / n; c[1] += p[1] / n; c[2] += p[2] / n; });
  const N = [0, 0, 0];
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; N[0] += (a[1] - b[1]) * (a[2] + b[2]); N[1] += (a[2] - b[2]) * (a[0] + b[0]); N[2] += (a[0] - b[0]) * (a[1] + b[1]); }
  const len = Math.hypot(N[0], N[1], N[2]) || 1; N[0] /= len; N[1] /= len; N[2] /= len;
  const pos = [], nor = [];
  for (let i = 0; i < n; i++) {
    let a = P[i], b = P[(i + 1) % n];
    const ux = a[0] - c[0], uy = a[1] - c[1], uz = a[2] - c[2], vx = b[0] - c[0], vy = b[1] - c[1], vz = b[2] - c[2];
    const d = (uy * vz - uz * vy) * N[0] + (uz * vx - ux * vz) * N[1] + (ux * vy - uy * vx) * N[2];
    if (d < 0) { const t = a; a = b; b = t; }
    pos.push(c[0], c[1], c[2], a[0], a[1], a[2], b[0], b[1], b[2]); for (let k = 0; k < 3; k++) nor.push(N[0], N[1], N[2]);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g;
}
function stripGeo(s) { /* a sheet stretched between two polylines of equal length */
  const A = s.a, Bp = s.b; const pos = [], idx = [];
  for (let i = 0; i < A.length; i++) { pos.push(A[i][0], A[i][1], A[i][2], Bp[i][0], Bp[i][1], Bp[i][2]); }
  for (let i = 0; i < A.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function shapeGeo(s) {
  switch (s.t) {
    case 'e': return xform(new THREE.SphereGeometry(1, s.q || 18, s.q ? Math.round(s.q * 0.7) : 12), s);
    case 'h': return xform(new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, (s.th || 90) * DEG), s);
    case 'o': return xform(new THREE.TorusGeometry(s.R, s.r, 8, 26, (s.arc || 360) * DEG), s);
    case 'r': return xform(new THREE.RingGeometry(s.ri, s.ro, 30, 1, 0, (s.arc || 360) * DEG), s);
    case 'b': return xform(new THREE.BoxGeometry(1, 1, 1), s);
    case 'c': return xform(new THREE.CylinderGeometry(s.rt == null ? 1 : s.rt, s.rb == null ? 1 : s.rb, 1, s.q || 16, 1, !!s.open), s);
    case 'f': return fanGeo(s);
    case 'st': return stripGeo(s);
    case 't': return tubeGeo(s);
  }
  throw new Error('unknown shape ' + s.t);
}
function mergeShapes(shapes) {
  /* Open surfaces (cut-away walls, flat sheets, domes, discs) get a second, inward-facing copy,
     so both faces are true front faces. That keeps the lighting right on every GPU without
     relying on double-sided shading. */
  const P = [], Nn = [];
  const add = (g, mirror, invert) => {
    const ng = g.index ? g.toNonIndexed() : g; const p = ng.attributes.position.array, nn = ng.attributes.normal.array;
    const order = (mirror !== invert) ? [0, 6, 3] : [0, 3, 6], zs = mirror ? -1 : 1, ns = invert ? -1 : 1;
    for (let i = 0; i < p.length; i += 9) for (const k of order) { P.push(p[i + k], p[i + k + 1], zs * p[i + k + 2]); Nn.push(ns * nn[i + k], ns * nn[i + k + 1], ns * zs * nn[i + k + 2]); }
    if (ng !== g) ng.dispose();
  };
  shapes.forEach(s => {
    const g = shapeGeo(s); if (!g.attributes.normal) g.computeVertexNormals();
    const open = s.t === 'f' || s.t === 'st' || s.t === 'h' || s.t === 'r' || (s.t === 't' && (s.arc || s.cap === false)) || (s.t === 'c' && s.open);
    add(g, false, false); if (open) add(g, false, true);
    if (s.m) { add(g, true, false); if (open) add(g, true, true); }
    g.dispose();
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3));
  out.computeBoundingBox(); out.computeBoundingSphere(); return out;
}
function shapeAnchor(s) {
  if (s.t === 't') { const n = s.pts.length; if (n === 2) return [(s.pts[0][0] + s.pts[1][0]) / 2, (s.pts[0][1] + s.pts[1][1]) / 2, (s.pts[0][2] + s.pts[1][2]) / 2]; const c = new THREE.CatmullRomCurve3(s.pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal').getPoint(0.5); return [c.x, c.y, c.z]; }
  if (s.t === 'f') { const c = [0, 0, 0]; s.pts.forEach(p => { c[0] += p[0] / s.pts.length; c[1] += p[1] / s.pts.length; c[2] += p[2] / s.pts.length; }); return c; }
  if (s.t === 'st') { const i = Math.floor(s.a.length / 2); return [(s.a[i][0] + s.b[i][0]) / 2, (s.a[i][1] + s.b[i][1]) / 2, (s.a[i][2] + s.b[i][2]) / 2]; }
  return (s.p || [0, 0, 0]).slice();
}
function shapeSamples(s) {
  const out = [];
  if (s.t === 't') { const n = s.pts.length; const c = n === 2 ? new THREE.LineCurve3(new THREE.Vector3().fromArray(s.pts[0]), new THREE.Vector3().fromArray(s.pts[1])) : new THREE.CatmullRomCurve3(s.pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal'); const k = Math.max(4, n * 3); for (let i = 0; i <= k; i++) { const p = c.getPoint(i / k); out.push([p.x, p.y, p.z]); } }
  else out.push(shapeAnchor(s));
  if (s.m) out.slice().forEach(p => out.push([p[0], p[1], -p[2]]));
  return out;
}

/* ============================================================ */
export function mount(container, spec, opts = {}) {
  const L = spec.len || 12;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x1b2226, 1);
  container.appendChild(renderer.domElement);
  const overlay = document.createElement('div'); overlay.className = 'dx-overlay';
  overlay.innerHTML = '<svg class="dx-lines"></svg>'; container.appendChild(overlay);
  const svg = overlay.querySelector('svg');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / Math.max(1, container.clientHeight), 0.05, 400);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x556066, 1.25));
  const head = new THREE.DirectionalLight(0xffffff, 1.5); head.position.set(0.4, 0.8, 1); camera.add(head);
  const side = new THREE.DirectionalLight(0xfff2e0, 0.5); side.position.set(-6, 10, -4); scene.add(side);

  /* tray */
  const tw = (spec.tray && spec.tray[0]) || L * 1.45, td = (spec.tray && spec.tray[1]) || L * 0.85;
  const tray = new THREE.Group();
  const wax = new THREE.Mesh(new THREE.BoxGeometry(tw, 0.3, td), new THREE.MeshPhongMaterial({ color: 0x2b3438, shininess: 8 })); wax.position.y = -0.16; tray.add(wax);
  const rimM = new THREE.MeshPhongMaterial({ color: 0x8d989d, shininess: 60, specular: 0x555555 });
  [[tw + 0.5, 0.25, 0, td / 2 + 0.12], [tw + 0.5, 0.25, 0, -td / 2 - 0.12]].forEach(a => { const m = new THREE.Mesh(new THREE.BoxGeometry(a[0], 0.7, a[1]), rimM); m.position.set(a[2], 0.05, a[3]); tray.add(m); });
  [[0.25, td, tw / 2 + 0.12, 0], [0.25, td, -tw / 2 - 0.12, 0]].forEach(a => { const m = new THREE.Mesh(new THREE.BoxGeometry(a[0], 0.7, a[1]), rimM); m.position.set(a[2], 0.05, a[3]); tray.add(m); });
  tray.position.x = spec.trayX || 0; tray.position.z = spec.trayZ || 0;
  scene.add(tray);

  /* specimen: pivot lets us turn it over */
  const thick = spec.thick || 2;
  const pivot = new THREE.Group(); pivot.position.y = thick / 2; scene.add(pivot);
  const group = new THREE.Group(); group.position.y = -thick / 2; pivot.add(group);

  const parts = spec.parts.map(p => {
    const geo = mergeShapes(p.sh);
    const alpha = p.a == null ? 1 : p.a;
    const mat = new THREE.MeshPhongMaterial({ color: p.c || 0xcccccc, shininess: p.dull ? 6 : 34, specular: p.dull ? 0x050505 : 0x2a2a2a, side: THREE.FrontSide, transparent: alpha < 1, opacity: alpha, depthWrite: alpha >= 1 });
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.id = p.id; group.add(mesh);
    const bb = geo.boundingBox; const dims = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].sort((a, b) => b - a);
    const samples = []; p.sh.forEach(s => shapeSamples(s).forEach(q => samples.push(new THREE.Vector3(q[0], q[1], q[2]))));
    return { def: p, mesh, mat, alpha, base: new THREE.Color(p.c || 0xcccccc), k: 0, target: 0, anchor: new THREE.Vector3().fromArray(p.anchor || shapeAnchor(p.sh[0])), samples, small: p.small != null ? p.small : dims[1] < L * 0.035 };
  });
  const byId = {}; parts.forEach(p => { byId[p.def.id] = p; });

  /* camera */
  const dv = spec.view || {};
  const def = { t: new THREE.Vector3().fromArray(dv.t || [0, thick * 0.45, 0]), d: dv.d || L * 1.25, th: dv.th == null ? 0 : dv.th, ph: dv.ph == null ? 0.62 : dv.ph };
  const cam = { t: def.t.clone(), d: def.d, th: def.th, ph: def.ph };
  let glide = null;
  function placeCamera() {
    camera.position.set(cam.t.x + cam.d * Math.sin(cam.ph) * Math.sin(cam.th), cam.t.y + cam.d * Math.cos(cam.ph), cam.t.z + cam.d * Math.sin(cam.ph) * Math.cos(cam.th));
    camera.lookAt(cam.t);
  }
  function glideTo(v, ms) {
    glide = { from: { t: cam.t.clone(), d: cam.d, th: cam.th, ph: cam.ph }, to: { t: v.t ? (v.t.isVector3 ? v.t.clone() : new THREE.Vector3().fromArray(v.t)) : cam.t.clone(), d: v.d == null ? cam.d : v.d, th: v.th == null ? cam.th : v.th, ph: v.ph == null ? cam.ph : v.ph }, k: 0, ms: ms || 600 };
  }

  /* state */
  let step = 0, sex = spec.sexes ? 'f' : null, filter = null, selected = null, hinted = null, flipT = 0, flipK = 0, hadView = false;
  let labelIds = [], pins = [], dirty = true;
  const vis = p => p.def.s <= step && (p.def.u == null || step < p.def.u) && (!p.def.sex || p.def.sex === sex) && (!filter || p.def.wall || filter.has(p.def.sys));
  let flipOverride = null;
  function applyVis(instant) {
    parts.forEach(p => { p.target = vis(p) ? 1 : 0; if (instant) p.k = p.target; });
    const st = spec.steps[step] || {}; flipT = (flipOverride != null ? flipOverride : st.flip) ? 1 : 0; if (instant) flipK = flipT;
    dirty = true;
  }
  function setStep(i, o = {}) {
    step = Math.max(0, Math.min(spec.steps.length - 1, i)); flipOverride = o.flip == null ? null : o.flip; applyVis(o.instant);
    const st = spec.steps[step]; const view = o.view || st.view;
    if (view) { glideTo({ t: view.t || def.t, d: view.d || def.d, th: view.th == null ? def.th : view.th, ph: view.ph == null ? def.ph : view.ph }, o.instant ? 1 : 700); hadView = true; }
    else if (hadView || o.reset) { glideTo({ t: def.t, d: def.d, th: def.th, ph: def.ph }, o.instant ? 1 : 700); hadView = false; }
    if (selected && !vis(byId[selected])) select(null);
  }

  /* selection / emphasis */
  function paint() {
    const focus = selected || hinted;
    parts.forEach(p => {
      const on = focus && p.def.id === focus;
      if (focus && !on) p.mat.color.copy(p.base).multiplyScalar(0.5); else p.mat.color.copy(p.base);
      p.mat.emissive.setHex(0x000000);
      /* the structure in focus is drawn through whatever covers it, so nothing asked for is ever hidden */
      p.mat.depthTest = !on; p.mesh.renderOrder = on ? 6 : 0;
    });
    dirty = true;
  }
  function select(id) { selected = id && byId[id] ? id : null; paint(); if (opts.onSelect) opts.onSelect(selected); }
  function hint(id) { hinted = id && byId[id] ? id : null; paint(); }

  /* picking */
  const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(); const v3 = new THREE.Vector3();
  function toScreen(local, out) {
    v3.copy(local); group.localToWorld(v3); const d = v3.distanceTo(camera.position); v3.project(camera);
    const r = renderer.domElement.getBoundingClientRect(); out.x = (v3.x * 0.5 + 0.5) * r.width; out.y = (-v3.y * 0.5 + 0.5) * r.height; out.z = v3.z; out.d = d; return out;
  }
  function pickAt(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect(); const x = cx - r.left, y = cy - r.top;
    ptr.x = (x / r.width) * 2 - 1; ptr.y = -(y / r.height) * 2 + 1; ray.setFromCamera(ptr, camera);
    /* a structure that is glowing through its neighbours can be tapped through them too */
    const fp = (hinted || selected) ? byId[hinted || selected] : null;
    if (fp && fp.k > 0.5) {
      if (ray.intersectObject(fp.mesh, false).length) return fp.def.id;
      const q = {}; for (const smp of fp.samples) { toScreen(smp, q); if (q.z <= 1 && Math.hypot(q.x - x, q.y - y) < 24) return fp.def.id; }
    }
    const live = parts.filter(p => p.k > 0.5 && !p.def.nopick);
    const hits = ray.intersectObjects(live.map(p => p.mesh), false);
    const first = hits.length ? byId[hits[0].object.userData.id] : null; const fd = hits.length ? hits[0].distance : Infinity;
    let best = null, bd = 22; const s = {};
    live.forEach(p => { if (!p.small) return; p.samples.forEach(q => { toScreen(q, s); if (s.z > 1) return; const d = Math.hypot(s.x - x, s.y - y); if (d < bd && s.d <= fd + L * 0.05) { bd = d; best = p; } }); });
    if (best && !(first && first.small && hits[0].object === first.mesh && bd > 8)) return best.def.id;
    return first ? first.def.id : null;
  }

  /* incision tracing */
  let cut = null;
  const cutGroup = new THREE.Group(); group.add(cutGroup);
  const scalpel = new THREE.Group();
  { const blade = new THREE.Mesh(new THREE.ConeGeometry(L * 0.012, L * 0.07, 4), new THREE.MeshPhongMaterial({ color: 0xdfe6ea, shininess: 90, specular: 0x999999 })); blade.rotation.x = Math.PI; blade.position.y = L * 0.035; scalpel.add(blade);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(L * 0.008, L * 0.008, L * 0.16, 8), new THREE.MeshPhongMaterial({ color: 0x9aa4a9, shininess: 60 })); h.position.y = L * 0.15; scalpel.add(h); scalpel.rotation.z = -0.5; scalpel.visible = false; group.add(scalpel); }
  function startCut(lines, onDone) {
    endCut();
    const cps = [];
    lines.forEach((ln, li) => {
      const pts = ln.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = pts.length === 2 ? new THREE.LineCurve3(pts[0], pts[1]) : new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const n = Math.max(8, Math.round(curve.getLength() / (L * 0.035)));
      const sp = curve.getSpacedPoints(n);
      const g = new THREE.BufferGeometry().setFromPoints(sp); const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0xff4d3d, dashSize: L * 0.02, gapSize: L * 0.014, depthTest: false, transparent: true }));
      line.computeLineDistances(); line.renderOrder = 20; cutGroup.add(line);
      const dg = new THREE.BufferGeometry().setFromPoints(sp); dg.setDrawRange(0, 0); const done = new THREE.Line(dg, new THREE.LineBasicMaterial({ color: 0x5a0d08, depthTest: false })); done.renderOrder = 21; cutGroup.add(done);
      sp.forEach((p, i) => cps.push({ p, li, i, done }));
    });
    const startDot = new THREE.Mesh(new THREE.SphereGeometry(L * 0.014, 12, 8), new THREE.MeshBasicMaterial({ color: 0x35d07f, depthTest: false })); startDot.renderOrder = 22; cutGroup.add(startDot);
    cut = { cps, at: 0, onDone, startDot, drawing: false };
    startDot.position.copy(cps[0].p); scalpel.visible = true; scalpel.position.copy(cps[0].p);
    dirty = true;
  }
  function advanceCut(to) {
    while (cut && cut.at < to) { const c = cut.cps[cut.at]; c.done.geometry.setDrawRange(0, c.i + 1); cut.at++; }
    if (!cut) return;
    if (cut.at >= cut.cps.length) { const cb = cut.onDone; endCut(); if (cb) cb(); return; }
    const nx = cut.cps[cut.at]; cut.startDot.position.copy(nx.p); scalpel.position.copy(nx.p); dirty = true;
  }
  function endCut() { while (cutGroup.children.length) { const c = cutGroup.children.pop(); c.geometry.dispose(); c.material.dispose(); } scalpel.visible = false; cut = null; dirty = true; }
  function cutNear(cx, cy, radius) {
    if (!cut) return -1; const r = renderer.domElement.getBoundingClientRect(); const s = {}; let reach = -1;
    for (let k = cut.at; k < Math.min(cut.cps.length, cut.at + 4); k++) { toScreen(cut.cps[k].p, s); if (Math.hypot(s.x - (cx - r.left), s.y - (cy - r.top)) < radius) reach = k; }
    return reach;
  }

  /* pointer handling: orbit, pinch-zoom + two-finger pan, tap to pick, drag to cut */
  const el = renderer.domElement; el.style.touchAction = 'none';
  const touches = new Map(); let drag = null, pinch = null, moved = 0;
  function pan(dx, dy) {
    const k = cam.d * 0.0016; const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0), upv = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    cam.t.addScaledVector(right, -dx * k).addScaledVector(upv, dy * k);
    cam.t.x = Math.max(-L, Math.min(L, cam.t.x)); cam.t.z = Math.max(-L, Math.min(L, cam.t.z)); cam.t.y = Math.max(-1, Math.min(L * 0.5, cam.t.y));
  }
  el.addEventListener('pointerdown', e => {
    el.setPointerCapture(e.pointerId); touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); glide = null;
    if (touches.size === 1) {
      moved = 0;
      if (cut && cutNear(e.clientX, e.clientY, 40) >= 0) { cut.drawing = true; advanceCut(cutNear(e.clientX, e.clientY, 40) + 1); drag = null; }
      else drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey };
    } else if (touches.size === 2) { const t = [...touches.values()]; pinch = { d: Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y), dist: cam.d, mx: (t[0].x + t[1].x) / 2, my: (t[0].y + t[1].y) / 2 }; drag = null; if (cut) cut.drawing = false; }
  });
  el.addEventListener('pointermove', e => {
    if (!touches.has(e.pointerId)) return; touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (cut && cut.drawing) { const k = cutNear(e.clientX, e.clientY, 44); if (k >= 0) advanceCut(k + 1); return; }
    if (pinch && touches.size === 2) { const t = [...touches.values()]; const d = Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y); cam.d = Math.min(L * 3, Math.max(L * 0.12, pinch.dist * pinch.d / d)); const mx = (t[0].x + t[1].x) / 2, my = (t[0].y + t[1].y) / 2; pan(mx - pinch.mx, my - pinch.my); pinch.mx = mx; pinch.my = my; dirty = true; return; }
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); if (drag.pan) pan(dx, dy); else { cam.th -= dx * 0.007; cam.ph = Math.min(1.5, Math.max(0.04, cam.ph - dy * 0.006)); } drag.x = e.clientX; drag.y = e.clientY; dirty = true; }
  });
  function up(e) {
    if (!touches.has(e.pointerId)) return; touches.delete(e.pointerId); if (touches.size < 2) pinch = null;
    if (cut && cut.drawing) { cut.drawing = false; return; }
    if (drag && moved < 7) { const id = pickAt(e.clientX, e.clientY); if (opts.onPick) opts.onPick(id, e); }
    drag = null;
  }
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { e.preventDefault(); cam.d = Math.min(L * 3, Math.max(L * 0.12, cam.d * (1 + Math.sign(e.deltaY) * 0.09))); dirty = true; }, { passive: false });

  /* labels with leader lines, laid out in two gutters like an anatomical plate */
  const labelEls = new Map();
  function setLabels(list) { /* [{id, text, cls}] */
    labelIds = list || []; labelEls.forEach(e => e.remove()); labelEls.clear();
    labelIds.forEach(l => { const d = document.createElement('div'); d.className = 'dx-label ' + (l.cls || ''); d.textContent = l.text; d.dataset.id = l.id; overlay.appendChild(d); labelEls.set(l.id + '|' + l.text, d); d._l = l; });
    dirty = true;
  }
  function layoutLabels() {
    const r = renderer.domElement.getBoundingClientRect(); const W = r.width, H = r.height; const s = {}; const items = [];
    labelEls.forEach(d => { const p = byId[d._l.id]; if (!p || p.k < 0.5) { d.style.display = 'none'; return; } toScreen(p.anchor, s); if (s.z > 1) { d.style.display = 'none'; return; } d.style.display = ''; items.push({ d, x: s.x, y: s.y }); });
    let lines = '';
    const lay = (arr, leftSide) => {
      arr.sort((a, b) => a.y - b.y); const gap = 24; let y = 34;
      arr.forEach(it => { it.ly = Math.max(y, Math.min(H - 60, it.y - 10)); y = it.ly + gap; });
      const over = arr.length ? arr[arr.length - 1].ly - (H - 64) : 0; if (over > 0) arr.forEach(it => { it.ly = Math.max(30, it.ly - over); });
      arr.forEach(it => {
        const w = it.d.offsetWidth || 80;
        if (leftSide) { it.d.style.left = '6px'; it.d.style.right = ''; it.lx = 6 + w; } else { it.d.style.right = '6px'; it.d.style.left = ''; it.lx = W - 6 - w; }
        it.d.style.top = it.ly + 'px';
        lines += '<line x1="' + it.lx.toFixed(1) + '" y1="' + (it.ly + 10).toFixed(1) + '" x2="' + it.x.toFixed(1) + '" y2="' + it.y.toFixed(1) + '"/><circle cx="' + it.x.toFixed(1) + '" cy="' + it.y.toFixed(1) + '" r="2.6"/>';
      });
    };
    lay(items.filter(i => i.x < W / 2), true); lay(items.filter(i => i.x >= W / 2), false);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.innerHTML = lines;
  }
  /* numbered pins */
  const pinEls = [];
  function setPins(list) { pins = list || []; pinEls.forEach(e => e.remove()); pinEls.length = 0; pins.forEach(pn => { const d = document.createElement('div'); d.className = 'dx-pin ' + (pn.cls || ''); d.textContent = pn.text; overlay.appendChild(d); d._p = pn; pinEls.push(d); }); dirty = true; }
  function layoutPins() { const s = {}; pinEls.forEach(d => { const p = byId[d._p.id]; if (!p || p.k < 0.5) { d.style.display = 'none'; return; } toScreen(p.anchor, s); d.style.display = s.z > 1 ? 'none' : ''; d.style.left = s.x + 'px'; d.style.top = s.y + 'px'; }); }

  /* loop */
  let raf = 0, last = performance.now(), lastCam = '';
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    let anim = false;
    parts.forEach(p => {
      if (p.k !== p.target) {
        anim = true; const dir = p.target > p.k ? 1 : -1; p.k = Math.max(0, Math.min(1, p.k + dir * dt * 3.2));
        const fading = p.k < 1; p.mesh.visible = p.k > 0.01; p.mat.transparent = fading || p.alpha < 1; p.mat.depthWrite = !p.mat.transparent || (fading && p.alpha >= 1 && p.k > 0.6); p.mat.opacity = p.alpha * p.k;
        p.mesh.position.y = dir < 0 ? (1 - p.k) * L * 0.09 : 0;
      } else if (p.k === 0) p.mesh.visible = false;
    });
    if (flipK !== flipT) { anim = true; flipK += Math.sign(flipT - flipK) * Math.min(Math.abs(flipT - flipK), dt * 2.2); pivot.rotation.x = Math.PI * (flipK * flipK * (3 - 2 * flipK)); }
    if (glide) { anim = true; glide.k = Math.min(1, glide.k + dt * 1000 / glide.ms); const e = 1 - Math.pow(1 - glide.k, 3); const a = glide.from, b = glide.to; cam.t.lerpVectors(a.t, b.t, e); cam.d = a.d + (b.d - a.d) * e; cam.th = a.th + (b.th - a.th) * e; cam.ph = a.ph + (b.ph - a.ph) * e; if (glide.k >= 1) glide = null; }
    const focus = selected || hinted;
    if (focus) { const p = byId[focus]; const pulse = 0.5 + 0.5 * Math.sin(now / 170); p.mat.emissive.setRGB(0.42 * pulse, 0.26 * pulse, 0.02 * pulse); anim = true; }
    if (cut) { const s = 1 + 0.35 * Math.sin(now / 150); cut.startDot.scale.setScalar(s); anim = true; }
    const ck = cam.t.x.toFixed(3) + cam.t.y.toFixed(3) + cam.t.z.toFixed(3) + cam.d.toFixed(3) + cam.th.toFixed(4) + cam.ph.toFixed(4);
    if (!anim && !dirty && ck === lastCam) return;
    lastCam = ck; dirty = false;
    placeCamera(); renderer.render(scene, camera);
    if (labelEls.size) layoutLabels(); else if (svg.innerHTML) svg.innerHTML = '';
    if (pinEls.length) layoutPins();
  }
  function onResize() { const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
  window.addEventListener('resize', onResize);
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(onResize) : null; if (ro) ro.observe(container);
  applyVis(true); setStep(opts.step || 0, { instant: true }); placeCamera(); raf = requestAnimationFrame(frame);

  return {
    setStep, get step() { return step; },
    setSex(s) { sex = s; applyVis(false); if (selected && !vis(byId[selected])) select(null); }, get sex() { return sex; },
    setFilter(set) { filter = set && set.size ? set : null; applyVis(false); },
    select, hint, get selected() { return selected; },
    isVisible(id) { return !!byId[id] && vis(byId[id]); },
    focus(id) { const p = byId[id]; if (!p) return; const w = p.anchor.clone(); group.localToWorld(w); glideTo({ t: w, d: Math.min(cam.d, Math.max(L * 0.3, L * 0.55)) }, 600); },
    resetView() { glideTo({ t: def.t, d: def.d, th: def.th, ph: def.ph }, 500); },
    topView() { glideTo({ ph: 0.12 }, 500); },
    startCut, endCut, finishCut() { if (cut) advanceCut(cut.cps.length); }, get cutting() { return !!cut; },
    setLabels, setPins,
    screenOf(id) { const p = byId[id]; if (!p) return null; const s = {}; toScreen(p.anchor, s); const r = renderer.domElement.getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y }; },
    snapshot() { placeCamera(); renderer.render(scene, camera); return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    destroy() { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); if (ro) ro.disconnect(); parts.forEach(p => { p.mesh.geometry.dispose(); p.mat.dispose(); }); renderer.dispose(); el.remove(); overlay.remove(); }
  };
}
window.Dissect3D = { mount };
