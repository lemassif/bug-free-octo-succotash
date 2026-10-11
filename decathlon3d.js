/* Decathlon 3D view: a full stadium, athletes and implements on WebGL (three.js).
   decathlon.html runs the events and hands over a scene description each frame (G.sc);
   this file only draws it. Units are meters. X runs down the home straight, Y is up,
   +Z is toward the main stand. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const D3 = { ok: false };
window.Deca3D = D3;

/* track geometry: 110 m straights, lane 1 measure line is exactly 400 m */
const STR = 110, RM = 400 / TAU - STR / Math.PI, KERB = RM - .3, LANE = 1.22, NL = 8;
function trackPos(s, lane, out) {
  s = ((s % 400) + 400) % 400; const r = KERB + .3 + lane * LANE, k = r / (RM), c = Math.PI * RM;
  let x, z, hx, hz;
  if (s < STR) { x = s; z = r - KERB; hx = 1; hz = 0; }
  else if (s < STR + c) { const f = (s - STR) / RM; x = STR + r * Math.sin(f); z = -KERB + r * Math.cos(f); hx = Math.cos(f); hz = -Math.sin(f); }
  else if (s < 2 * STR + c) { x = STR - (s - STR - c); z = -KERB - r; hx = -1; hz = 0; }
  else { const f = (s - 2 * STR - c) / RM; x = -r * Math.sin(f); z = -KERB - r * Math.cos(f); hx = -Math.cos(f); hz = Math.sin(f); }
  void k; out.x = x; out.z = z; out.hx = hx; out.hz = hz; return out;
}
/* field event sites inside the oval */
const SITE = { lj: { x: 6, z: -7 }, pv: { x: 8, z: -17 }, hj: { x: 46, z: -27 }, sp: { x: 22, z: -42 }, dt: { x: 22, z: -42 }, jt: { x: 4, z: -48 } };

function start() {
  const api = window.__dec; if (!api) { setTimeout(start, 30); return; }
  const canvas = document.getElementById('c3');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.style.display = 'none'; return; }   // no WebGL: the 2D view keeps running
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xbfe2ff, 180, 520);
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 1500);
  const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));

  /* sky dome */
  {
    const geo = new THREE.SphereGeometry(900, 24, 16), col = [], pos = geo.attributes.position, top = new THREE.Color(0x2f80e0), mid = new THREE.Color(0x9fd2ff), bot = new THREE.Color(0xe8f6ff), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 900; if (y > .05) c.copy(mid).lerp(top, Math.min(1, (y - .05) / .5)); else c.copy(bot); col.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); m.renderOrder = -10; scene.add(m); D3.sky = m;
  }
  scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x5f7f4a, 1.0));
  const sun = new THREE.DirectionalLight(0xfff2dc, 1.05); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); { const s = sun.shadow.camera; s.left = -22; s.right = 22; s.top = 22; s.bottom = -22; s.near = 1; s.far = 160; }
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; scene.add(sun); scene.add(sun.target);
  const SUN_DIR = new THREE.Vector3(-.35, .85, .4).normalize();

  /* ---------------- stadium ---------------- */
  const CX = STR / 2, CZ = -KERB;
  function paintTrack() {
    const px = 6, M = 14, w = STR + 2 * (KERB + NL * LANE + M), h = 2 * (KERB + NL * LANE + M);
    const cv = document.createElement('canvas'); cv.width = Math.round(w * px); cv.height = Math.round(h * px);
    const c = cv.getContext('2d'); c.setTransform(px, 0, 0, px, (KERB + NL * LANE + M) * px, (KERB + NL * LANE + M) * px);
    // world (x, z) -> canvas (x, z + KERB) so the oval centre line sits at canvas y = 0
    const oval = r => { c.beginPath(); c.moveTo(0, r); c.lineTo(STR, r); c.arc(STR, 0, r, Math.PI / 2, -Math.PI / 2, true); c.lineTo(0, -r); c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, true); c.closePath(); };
    c.fillStyle = '#3f9a3a'; c.fillRect(-200, -200, 600, 400);
    oval(KERB + NL * LANE + 2.5); c.fillStyle = '#c4492f'; c.fill();
    oval(KERB); c.fillStyle = '#4fae3e'; c.fill();
    c.save(); oval(KERB); c.clip(); c.fillStyle = 'rgba(255,255,255,.07)'; for (let x = -40; x < STR + 40; x += 10) c.fillRect(x, -60, 5, 120); c.restore();
    c.strokeStyle = '#f4f4f4'; c.lineWidth = .05; for (let l = 0; l <= NL; l++) { oval(KERB + l * LANE); c.stroke(); }
    c.lineWidth = .12; oval(KERB); c.stroke();
    // finish line and start lines
    c.fillStyle = '#fff'; c.fillRect(STR - .05, KERB, .1, NL * LANE);
    for (const s of [0, 10, 110]) { const p = trackPos(s, 0, {}); if (Math.abs(p.z) < 20) c.fillRect(p.x - .03, KERB, .06, NL * LANE); }
    // lane numbers before the finish
    c.font = '900 .8px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
    for (let l = 0; l < NL; l++) { c.save(); c.translate(STR + 2.5, KERB + (l + .5) * LANE); c.rotate(-Math.PI / 2); c.fillText(String(l + 1), 0, 0); c.restore(); }
    // runways and sectors
    const rw = (x0, z0, len, wid, col) => { c.fillStyle = col; c.fillRect(x0, z0 + KERB - wid / 2, len, wid); };
    rw(SITE.lj.x - 2, SITE.lj.z, 50, 1.6, '#c4492f');
    rw(SITE.pv.x - 2, SITE.pv.z, 36, 1.6, '#c4492f'); rw(SITE.hj.x - 2, SITE.hj.z, 24, 12, '#c4492f');
    rw(SITE.jt.x - 2, SITE.jt.z, 36, 4, '#c4492f');
    c.strokeStyle = '#fff'; c.lineWidth = .1;
    for (const ang of [-.25, .25]) { c.beginPath(); c.moveTo(SITE.sp.x, SITE.sp.z + KERB); c.lineTo(SITE.sp.x + Math.cos(ang) * 80, SITE.sp.z + KERB + Math.sin(ang) * 80); c.stroke(); }
    c.fillStyle = '#9aa3ad'; c.beginPath(); c.arc(SITE.sp.x, SITE.sp.z + KERB, 1.3, 0, TAU); c.fill(); c.stroke();
    // distance arcs for the throws
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .06;
    for (let d = 10; d <= 70; d += 10) { c.beginPath(); c.arc(SITE.sp.x, SITE.sp.z + KERB, d, -.25, .25); c.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const g = new THREE.PlaneGeometry(w, h); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, lam(0xffffff, { map: tex })); m.position.set(STR / 2, 0, -KERB); m.receiveShadow = true;
    // the plane is centred on the oval
    scene.add(m);
  }
  paintTrack();
  /* stands, crowd and floodlights */
  const RS = KERB + NL * LANE + 4;
  {
    const standMat = lam(0x7f8ea6), roofMat = lam(0xe9eef6), crowdCols = [0xff5d5d, 0xffd34d, 0x5bc0ff, 0x7ee081, 0xffffff, 0xff9f43, 0xb98cff, 0x2f3b55];
    const crowdGeo = new THREE.BoxGeometry(.45, .7, .4), people = [], dummy = new THREE.Object3D();
    const segs = 120;
    for (let i = 0; i < segs; i++) {
      const t0 = i / segs, p = ovalAt(t0, RS);
      const seg = new THREE.Group(); seg.position.set(p.x, 0, p.z); seg.rotation.y = p.a; scene.add(seg);
      const len = p.len + .05;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(len, 1, 14), standMat); tier.position.set(0, 3, 7); tier.rotation.x = -.42; tier.receiveShadow = true; seg.add(tier);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, .3), lam(0x2a5fb0)); wall.position.set(0, .6, 0); seg.add(wall);
      if (p.main) { const roof = new THREE.Mesh(new THREE.BoxGeometry(len, .3, 10), roofMat); roof.position.set(0, 12, 9); roof.rotation.x = -.12; seg.add(roof); }
      for (let r = 0; r < 9; r++) for (let k = 0; k < Math.floor(len / .8); k++) {
        if (((i * 31 + r * 7 + k * 13) % 10) > 7) continue;
        dummy.position.set(-len / 2 + .4 + k * .8, 1.2 + r * .64 + .35, 1.0 + r * 1.45); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
        const mw = new THREE.Matrix4().multiplyMatrices(new THREE.Matrix4().compose(seg.position, seg.quaternion, new THREE.Vector3(1, 1, 1)), dummy.matrix);
        people.push({ m: mw, c: crowdCols[(i * 7 + r * 3 + k * 5) % crowdCols.length] });
      }
    }
    const crowd = new THREE.InstancedMesh(crowdGeo, lam(0xffffff), people.length), cc = new THREE.Color();
    people.forEach((p, i) => { crowd.setMatrixAt(i, p.m); crowd.setColorAt(i, cc.set(p.c)); });
    scene.add(crowd); D3.crowd = crowd; D3.people = people;
    // floodlights at the four corners
    const poleMat = lam(0xb7c0cc), lampMat = new THREE.MeshBasicMaterial({ color: 0xfffbe6 });
    for (const [x, z] of [[-30, 22], [STR + 30, 22], [-30, -2 * KERB - 22], [STR + 30, -2 * KERB - 22]]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.5, .7, 40, 8), poleMat); p.position.set(x, 20, z); scene.add(p);
      const head = new THREE.Mesh(new THREE.BoxGeometry(6, 4, .6), lampMat); head.position.set(x, 41, z); head.lookAt(CX, 0, CZ); scene.add(head);
    }
    // scoreboard behind the far curve
    const sbc = document.createElement('canvas'); sbc.width = 512; sbc.height = 160; const s2 = sbc.getContext('2d');
    s2.fillStyle = '#0b1530'; s2.fillRect(0, 0, 512, 160); s2.fillStyle = '#ffc93c'; s2.font = 'italic 900 64px sans-serif'; s2.textAlign = 'center'; s2.textBaseline = 'middle'; s2.fillText('DECATHLON', 256, 80);
    const sbt = new THREE.CanvasTexture(sbc); sbt.colorSpace = THREE.SRGBColorSpace;
    const sb = new THREE.Mesh(new THREE.PlaneGeometry(24, 7.5), new THREE.MeshBasicMaterial({ map: sbt })); sb.position.set(STR + RS + 16, 16, CZ); sb.rotation.y = -Math.PI / 2; scene.add(sb);
  }
  function ovalAt(t, r) {   // point on an oval of radius r around the track; a faces outward
    const per = 2 * STR + TAU * r, s = t * per, ds = per / 120; let x, z, a, main = false;
    if (s < STR) { x = s; z = r - KERB; a = 0; main = true; }
    else if (s < STR + Math.PI * r) { const f = (s - STR) / r; x = STR + r * Math.sin(f); z = -KERB + r * Math.cos(f); a = f; }
    else if (s < 2 * STR + Math.PI * r) { x = STR - (s - STR - Math.PI * r); z = -KERB - r; a = Math.PI; }
    else { const f = (s - 2 * STR - Math.PI * r) / r; x = -r * Math.sin(f); z = -KERB - r * Math.cos(f); a = Math.PI + f; }
    return { x, z, a, len: ds, main };
  }

  /* ---------------- field equipment ---------------- */
  const white = lam(0xffffff), yellow = lam(0xffc93c), metal = lam(0x9aa3ad), dark = lam(0x1d2433), mat = lam(0x2f6fd6), sand = lam(0xe9d6a0);
  const box = (w, h, d, m, x, y, z, parent) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; (parent || scene).add(b); return b; };
  // long jump board and pit
  const ljBoard = box(.2, .02, 1.22, white, 0, .01, 0);
  const ljPit = box(9, .06, 3, sand, 0, .03, 0); ljPit.castShadow = false;
  const ljMark = box(.06, .08, 3, lam(0xff4d5e), 0, .04, 0); ljMark.visible = false;
  // high jump and pole vault: standards, bar and landing mat
  function heightRig(pv) {
    const g = new THREE.Group(); scene.add(g);
    for (const s of [-1, 1]) box(.08, pv ? 6.2 : 2.6, .08, metal, 0, pv ? 3.1 : 1.3, s * (pv ? 2.4 : 2.1), g);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, pv ? 4.6 : 4, 8), yellow); bar.rotation.x = Math.PI / 2; bar.castShadow = true; g.add(bar);
    const m = box(pv ? 5 : 3, pv ? .8 : .6, pv ? 5 : 5, mat, (pv ? 2.8 : 1.7), pv ? .4 : .3, 0, g);
    let plant = null; if (pv) { plant = box(1, .06, .6, dark, -.6, .03, 0, g); plant.castShadow = false; }
    return { g, bar, m };
  }
  const HJ = heightRig(false), PV = heightRig(true);
  // throws: circle cage, toe board, javelin arc
  const cage = new THREE.Group(); scene.add(cage);
  { const net = lam(0x3b4a5c, { transparent: true, opacity: .16, side: THREE.DoubleSide, depthWrite: false });
    for (let i = 0; i < 7; i++) { const a = Math.PI * .6 + i / 6 * Math.PI * .8; const p = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 4.2, 6), metal); p.position.set(Math.cos(a) * 3.6, 2.1, Math.sin(a) * 3.6); cage.add(p); }
    const n = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 4.2, 24, 1, true, Math.PI * 1.1, Math.PI * .8), net); n.position.y = 2.1; cage.add(n);
    const toe = box(.12, .1, 1.2, white, 1.3, .05, 0, cage); void toe; }
  const jtLine = box(.07, .02, 4, white, 0, .01, 0); jtLine.castShadow = false;
  const throwMark = box(.25, .3, .25, lam(0xff4d5e), 0, .15, 0); throwMark.visible = false;
  // hurdles: one set for the five lanes in use
  const hurdleGeo = new THREE.BoxGeometry(.06, .2, 1.0), legGeo = new THREE.BoxGeometry(.04, .9, .04);
  const hurdles = [];
  function hurdle() {
    const g = new THREE.Group(); const top = new THREE.Mesh(hurdleGeo, white); top.position.y = 1.0; top.castShadow = true; g.add(top);
    for (const s of [-.48, .48]) { const l = new THREE.Mesh(legGeo, metal); l.position.set(0, .5, s); g.add(l); const f = new THREE.Mesh(new THREE.BoxGeometry(.7, .04, .04), metal); f.position.set(-.3, .02, s); g.add(f); }
    scene.add(g); return g;
  }
  for (let i = 0; i < 50; i++) hurdles.push(hurdle());
  // implements
  const shot = new THREE.Mesh(new THREE.SphereGeometry(.065, 14, 10), lam(0x5b6375)); shot.castShadow = true; scene.add(shot);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .045, 20), lam(0xe8edf6)); disc.castShadow = true; scene.add(disc);
  { const c = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .05, 12), lam(0xd2552d)); disc.add(c); }
  const jav = new THREE.Group(); { const r = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 2.6, 6), lam(0xe8edf6)); r.rotation.z = -Math.PI / 2; r.castShadow = true; jav.add(r);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.02, .22, 6), metal); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.4; jav.add(tip);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .2, 6), lam(0x2a5fb0)); grip.rotation.z = -Math.PI / 2; jav.add(grip); }
  scene.add(jav);
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false });
  const trail = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), trailMat); scene.add(m); trail.push(m); }
  // the pole: a tube we bend every frame
  const POLE_N = 12, poleMat = lam(0xffc93c); let poleMesh = null;
  const poleCurvePts = Array.from({ length: POLE_N }, () => new THREE.Vector3());
  function setPole(a, b, bend, up) {
    const d = new THREE.Vector3().subVectors(b, a), L = d.length(), n = up.clone().sub(d.clone().multiplyScalar(up.dot(d) / (L * L || 1))).normalize();
    for (let i = 0; i < POLE_N; i++) { const t = i / (POLE_N - 1); poleCurvePts[i].copy(a).addScaledVector(d, t).addScaledVector(n, Math.sin(Math.PI * t) * bend * L * .22); }
    const curve = new THREE.CatmullRomCurve3(poleCurvePts), geo = new THREE.TubeGeometry(curve, 16, .025, 6, false);
    if (!poleMesh) { poleMesh = new THREE.Mesh(geo, poleMat); poleMesh.castShadow = true; scene.add(poleMesh); } else { poleMesh.geometry.dispose(); poleMesh.geometry = geo; }
    poleMesh.visible = true;
  }

  /* ---------------- athletes ---------------- */
  const SPH = new THREE.SphereGeometry(1, 16, 12), CYL = new THREE.CylinderGeometry(1, 1, 1, 10), YUP = new THREE.Vector3(0, 1, 0);
  function placeLimb(mesh, a, b, r) { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); mesh.position.copy(a).addScaledVector(d, .5); if (L > 1e-5) mesh.quaternion.setFromUnitVectors(YUP, d.multiplyScalar(1 / L)); mesh.scale.set(r, Math.max(.01, L), r); }
  const rigs = new Map();
  function rig(a) {
    let r = rigs.get(a); if (r) return r;
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g);
    const skin = lam(a.skin), kit = lam(a.color), shorts = lam(0x16233f), shoe = lam(0xf4f6fb), hair = lam(a.hair);
    const mk = (geo, m) => { const x = new THREE.Mesh(geo, m); x.castShadow = true; body.add(x); return x; };
    r = { g, body, a,
      torso: mk(CYL, kit), pelvis: mk(SPH, shorts), chest: mk(SPH, kit), head: mk(SPH, skin), hairM: mk(SPH, hair), band: mk(CYL, kit), nose: mk(SPH, skin),
      thigh: [mk(CYL, skin), mk(CYL, skin)], shin: [mk(CYL, skin), mk(CYL, skin)], knee: [mk(SPH, skin), mk(SPH, skin)], foot: [mk(SPH, shoe), mk(SPH, shoe)], short: [mk(CYL, shorts), mk(CYL, shorts)],
      upper: [mk(CYL, skin), mk(CYL, skin)], fore: [mk(CYL, skin), mk(CYL, skin)], elbow: [mk(SPH, skin), mk(SPH, skin)], hand: [mk(SPH, skin), mk(SPH, skin)],
      handPt: new THREE.Object3D() };
    body.add(r.handPt);
    // bib on the chest
    const bc = document.createElement('canvas'); bc.width = 64; bc.height = 48; const c = bc.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 64, 48); c.fillStyle = '#0b1d3a'; c.font = '900 36px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(a.bib), 32, 26);
    const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
    r.bib = new THREE.Mesh(new THREE.PlaneGeometry(.17, .13), new THREE.MeshLambertMaterial({ map: bt })); body.add(r.bib); r.bib2 = new THREE.Mesh(new THREE.PlaneGeometry(.17, .13), new THREE.MeshLambertMaterial({ map: bt })); body.add(r.bib2);
    rigs.set(a, r); return r;
  }
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const seg = (p, ang, len) => v(p.x + Math.sin(ang) * len, p.y - Math.cos(ang) * len, p.z);
  /* pose: same angles as the 2D game (measured from straight down, forward positive) */
  function pose(r, P, opts) {
    const lean = P.lean || 0, legs = P.legs || [[0, 0], [0, 0]], arms = P.arms || [[0, 0], [0, 0]], W = .1;
    const hip = v(0, 0, 0), sh = v(Math.sin(lean) * .52, Math.cos(lean) * .52, 0), up = v(Math.sin(lean), Math.cos(lean), 0);
    placeLimb(r.torso, v(hip.x + up.x * .08, up.y * .08, 0), sh.clone().addScaledVector(up, -.06), .12); r.torso.scale.z = .09;
    r.torso.scale.x = .13;
    r.pelvis.position.set(0, .02, 0); r.pelvis.scale.set(.13, .11, .15);
    r.chest.position.copy(sh).addScaledVector(up, -.12); r.chest.scale.set(.13, .12, .17); r.chest.quaternion.setFromUnitVectors(YUP, up);
    const hd = sh.clone().addScaledVector(up, .21); r.head.position.copy(hd); r.head.scale.setScalar(.11);
    r.hairM.position.copy(hd).addScaledVector(up, .03).add(v(-up.y * .02, up.x * .02, 0)); r.hairM.scale.set(.108, .1, .108);
    r.band.position.copy(hd).addScaledVector(up, .03); r.band.quaternion.setFromUnitVectors(YUP, up); r.band.scale.set(.113, .03, .113);
    r.nose.position.copy(hd).add(v(up.y * .105, -up.x * .105, 0)); r.nose.scale.setScalar(.022);
    const fwd = v(up.y, -up.x, 0);
    r.bib.position.copy(sh).addScaledVector(up, -.2).addScaledVector(fwd, .135); r.bib.lookAt(r.bib.position.clone().add(fwd));
    r.bib2.position.copy(sh).addScaledVector(up, -.2).addScaledVector(fwd, -.135); r.bib2.lookAt(r.bib2.position.clone().sub(fwd));
    for (let i = 0; i < 2; i++) {
      const sd = i === 0 ? W : -W, l = legs[i], h0 = v(0, 0, sd), k = seg(h0, l[0], .47), f = seg(k, l[0] + l[1], .47);
      placeLimb(r.thigh[i], h0, k, .07); placeLimb(r.shin[i], k, f, .055); r.knee[i].position.copy(k); r.knee[i].scale.setScalar(.06);
      placeLimb(r.short[i], h0, h0.clone().lerp(k, .45), .085);
      const fa = l[0] + l[1]; r.foot[i].position.copy(f).add(v(Math.cos(fa) * .06, Math.sin(fa) * .06, 0)); r.foot[i].scale.set(.12, .05, .06); r.foot[i].rotation.set(0, 0, fa);
      const s0 = sh.clone().add(v(0, 0, sd * 1.75)).addScaledVector(up, -.04), ar = arms[i], e = seg(s0, ar[0], .3), hnd = seg(e, ar[0] + ar[1], .28);
      placeLimb(r.upper[i], s0, e, .05); placeLimb(r.fore[i], e, hnd, .042); r.elbow[i].position.copy(e); r.elbow[i].scale.setScalar(.045); r.hand[i].position.copy(hnd); r.hand[i].scale.setScalar(.055);
      if (i === 0) r.handPt.position.copy(hnd);
    }
    void opts;
  }
  /* place an athlete: world position of the feet line, heading (radians, 0 = +X), hip height and body roll */
  function placeAthlete(r, x, y, z, head, P, extra) {
    extra = extra || {}; r.g.visible = true;
    r.g.position.set(x, y + (P.hipH == null ? .98 : P.hipH), z); r.g.rotation.set(0, head + (extra.yaw || 0), 0);
    r.body.rotation.set(extra.roll || 0, 0, extra.pitch != null ? extra.pitch : -(P.rot || 0));
    pose(r, P);
  }
  const handWorld = r => { r.g.updateMatrixWorld(true); return r.handPt.getWorldPosition(new THREE.Vector3()); };

  /* ---------------- camera ---------------- */
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(); let camInit = false, idleT = 0;
  function aimCamera(pos, look, dt, snap, rate) {
    if (!camInit || snap) { camPos.copy(pos); camLook.copy(look); camInit = true; }
    rate = rate || 5; camPos.lerp(pos, Math.min(1, (dt || .016) * rate)); camLook.lerp(look, Math.min(1, (dt || .016) * rate * 1.6));
    camera.position.copy(camPos); camera.lookAt(camLook);
  }
  let lastKind = null, lastEv = null, DM = 1;

  /* ---------------- per frame ---------------- */
  let slowT = 0, quality = 2;
  const tmp = {}, tmp2 = {};
  D3.render = function (sc, dt, athletes, lay) {
    const Wd = lay.W, Hd = lay.H;
    if (quality > 0) { slowT = dt > .045 ? slowT + dt : Math.max(0, slowT - dt * .5); if (slowT > 2.5) { quality--; slowT = 0; renderer.setPixelRatio(quality === 1 ? Math.min(1.5, window.devicePixelRatio || 1) : 1); if (quality === 0) { sun.shadow.mapSize.set(1024, 1024); sun.shadow.map && sun.shadow.map.dispose(); sun.shadow.map = null; } } }
    if (renderer.domElement.width !== Math.round(Wd * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(Hd * renderer.getPixelRatio())) renderer.setSize(Wd, Hd, false);
    // portrait screens: keep about 48 degrees across and pull the camera back a little
    const asp = Wd / Hd; camera.aspect = asp;
    camera.fov = asp >= 1 ? 46 : Math.min(84, 2 * Math.atan(Math.tan(24 * Math.PI / 180) / asp) * 180 / Math.PI);
    DM = asp >= 1 ? 1 : 1.25;
    // put the action where the 2D game had its ground line, above the touch pads
    const targetY = clamp(lay.GY - Hd * .16, Hd * .3, Hd * .62);
    camera.setViewOffset(Wd, Hd, 0, Hd / 2 - targetY, Wd, Hd); camera.updateProjectionMatrix();

    for (const r of rigs.values()) r.g.visible = false;
    for (const h of hurdles) h.visible = false;
    shot.visible = disc.visible = jav.visible = false; for (const t of trail) t.visible = false;
    if (poleMesh) poleMesh.visible = false;
    ljMark.visible = throwMark.visible = false;
    const kind = sc ? sc.kind : null, ev = sc && sc.ev ? sc.ev.id : null, snap = kind !== lastKind || ev !== lastEv; lastKind = kind; lastEv = ev;
    let focus = v(CX, 0, CZ);

    if (!sc) {   // idle: slow orbit around the stadium
      idleT += dt * .06; const R = 95;
      aimCamera(v(CX + Math.cos(idleT) * R, 26, CZ + Math.sin(idleT) * R), v(CX, 0, CZ), dt, snap);
    }
    else if (kind === 'race') {
      const e = sc.ev, s0 = ((STR - e.dist) % 400 + 400) % 400;
      let fp = null; const laneOf = rn => sc.runners.length - rn.lane;   // the player gets the inside lane, nearest the camera
      for (const rn of sc.runners) {
        const a = athletes[rn.idx], r = rig(a), lane = laneOf(rn), p = trackPos(s0 + rn.d, lane, tmp);
        placeAthlete(r, p.x, rn.y, p.z, Math.atan2(-p.hz, p.hx), rn.pose);
        if (rn.idx === sc.human) fp = { x: p.x, z: p.z, hx: p.hx, hz: p.hz, lane };
      }
      if (e.hurdles) {
        const H = window.Deca.HURDLES; let n = 0;
        for (const rn of sc.runners) for (let i = 0; i < H.length; i++) {
          const h = hurdles[n++]; if (!h) break; const p = trackPos(s0 + H[i], laneOf(rn), tmp2);
          h.visible = true; h.position.set(p.x, 0, p.z); h.rotation.set(0, Math.atan2(-p.hz, p.hx), 0);
          if (rn.idx === sc.human && sc.knocked.includes(i)) { h.rotation.z = -1.35; h.position.y = .05; }
        }
      }
      if (fp) {
        // side-on tracking camera from the infield, a step behind the player
        const dist = 7 * DM, pos = v(fp.x + fp.hz * dist - fp.hx * 2.5, 2.8, fp.z - fp.hx * dist - fp.hz * 2.5);
        aimCamera(pos, v(fp.x + fp.hx * 1.5, 1.0, fp.z + fp.hz * 1.5), dt, snap);
        focus = v(fp.x + fp.hx * 1.5, 1.0, fp.z + fp.hz * 1.5);
      }
    }
    else if (kind === 'lj') {
      const s = SITE.lj, a = athletes[sc.ai], r = rig(a), x0 = s.x;
      ljBoard.position.set(x0 + sc.board, .01, s.z); ljPit.position.set(x0 + sc.board + 1 + 4.5, .03, s.z);
      placeAthlete(r, x0 + sc.x, sc.y, s.z, 0, sc.pose);
      if (sc.mark != null) { ljMark.visible = true; ljMark.position.set(x0 + sc.mark, .04, s.z); }
      focus = v(x0 + sc.x + 1.5, 1.0, s.z);
      aimCamera(v(x0 + sc.x + 1.2, 2.4, s.z + 8.5 * DM), focus, dt, snap);
    }
    else if (kind === 'throw') {
      const id = sc.ev.id, s = SITE[id], a = athletes[sc.ai], r = rig(a), isJ = id === 'jt';
      cage.visible = !isJ; cage.position.set(s.x, 0, s.z); jtLine.visible = isJ; jtLine.position.set(SITE.jt.x + sc.line, .01, SITE.jt.z);
      const ax = isJ ? SITE.jt.x + sc.x : s.x, spin = sc.spin || 0;
      placeAthlete(r, ax, 0, s.z, 0, sc.pose, { yaw: spin ? -spin : 0 });
      const hw = handWorld(r), o = sc.opts || {};
      if (o.shot) { shot.visible = true; shot.position.copy(hw).add(v(0, .05, 0)); }
      if (o.discus) { disc.visible = true; disc.position.copy(hw); disc.rotation.set(0, 0, .3); }
      if (o.jav != null) { jav.visible = true; jav.position.copy(hw); jav.rotation.set(0, 0, o.jav); jav.position.x += Math.cos(o.jav) * .1; }
      const x0 = isJ ? SITE.jt.x : s.x;
      if (sc.imp) {
        const im = sc.imp, p = v(x0 + im.x, Math.max(.05, im.y), s.z);
        const m = id === 'sp' ? shot : id === 'dt' ? disc : jav; m.visible = true; m.position.copy(p);
        if (id === 'jt') m.rotation.set(0, 0, im.y <= .1 ? -.5 : im.ang); else if (id === 'dt') m.rotation.set(0, sc.flight * 30, .25);
        im.trail.forEach((q, i) => { const t = trail[i]; if (!t) return; t.visible = q.y > 0; t.position.set(x0 + q.x, q.y, s.z); });
        focus = p.clone();
        aimCamera(v(p.x - 8, Math.max(3, p.y * .7 + 2), s.z + 15 * DM), focus, dt, false, 9);
      } else {
        focus = v(ax + (isJ ? 2 : 1.5), 1.1, s.z);
        aimCamera(v(ax - (isJ ? 2 : 1), 2.4, s.z + (isJ ? 8 : 7.5) * DM), focus, dt, snap);
      }
      if (sc.mark != null) { throwMark.visible = true; throwMark.position.set(x0 + sc.mark, .15, s.z); focus = throwMark.position.clone(); aimCamera(v(x0 + sc.mark - 6, 4, s.z + 10 * DM), v(x0 + sc.mark, .5, s.z), dt, false); }
    }
    else if (kind === 'height') {
      const s = sc.pv ? SITE.pv : SITE.hj, R = sc.pv ? PV : HJ, a = athletes[sc.ai], r = rig(a), x0 = s.x;
      HJ.g.visible = !sc.pv; PV.g.visible = sc.pv;
      R.g.position.set(x0 + sc.barX, 0, s.z);
      R.bar.position.set(0, sc.barDown ? .5 : sc.bar, sc.barDown ? .4 : 0); R.bar.rotation.set(Math.PI / 2, 0, sc.barDown ? .15 : 0);
      const P = sc.pose; let extra = {};
      if (sc.flop) { const k = P.k || 0, arch = P.arch || 0; extra = { yaw: Math.PI, pitch: Math.PI / 2 + k * .6 + (k > .5 ? arch * .4 : 0) }; P.lean = -arch * .5; }
      placeAthlete(r, x0 + sc.x, sc.y, s.z, 0, P, extra);
      const o = sc.opts || {};
      if (sc.pv && o.pole != null) {
        const hw = handWorld(r), boxP = v(x0 + sc.barX - .55, .02, s.z);
        if (sc.phase === 'swing' || o.poleFree) { setPole(boxP, hw, sc.bend || 0, v(-1, 0, 0)); }
        else { const ang = o.pole, d = v(Math.cos(ang), Math.sin(ang), 0); setPole(hw.clone().addScaledVector(d, -1.1), hw.clone().addScaledVector(d, 3.5), 0, YUP); }
      }
      // side-on view that slides from the run-up to the bar, keeping the athlete in frame
      const bx = x0 + sc.barX, ax = x0 + sc.x, near = clamp((ax - (bx - 12)) / 10, 0, 1), hb = sc.pv ? Math.max(2.2, sc.bar * .55) : sc.bar * .65;
      focus = v(lerp(ax + 2, (ax + bx) / 2 + .6, near), lerp(1.1, hb, near), s.z);
      aimCamera(v(lerp(ax + .5, bx - 2.5, near), lerp(2.2, sc.pv ? 3.2 : 2.2, near), s.z + lerp(8, sc.pv ? 12.5 : 8.5, near) * DM), focus, dt, snap);
    }

    D3.sky.position.copy(camera.position);
    sun.target.position.copy(focus); sun.position.copy(focus).addScaledVector(SUN_DIR, 60); sun.target.updateMatrixWorld();
    renderer.render(scene, camera);
  };
  D3.ok = true;
  D3.debug = { scene, camera, rigs, trackPos };
}
start();
