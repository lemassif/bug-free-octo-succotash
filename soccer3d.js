/* Super Strikers 3D view (three.js). soccer.html runs the match; this file draws it.
   Pitch coordinates: x along the pitch (goals at ±PL), y across it, z up.
   three.js: X = x, Y = z (up), Z = y. The broadcast camera sits on the +y touchline. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const D3 = { ok: false, basis: { rx: 1, ry: 0, fx: 0, fy: -1 } };
window.Soccer3D = D3;

function start() {
  const api = window.__sc; if (!api) { setTimeout(start, 30); return; }
  const { PL, PW, GW, GH, BR, BOX_D, BOX_W } = api;
  const canvas = document.getElementById('c3');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { return; }   // no WebGL: soccer.html draws a top-down pitch instead
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x9fc8ee, 140, 320);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 800);
  const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const tex = (cv, rep) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; };

  /* ---------------- sky and light ---------------- */
  {
    const geo = new THREE.SphereGeometry(500, 24, 16), col = [], pos = geo.attributes.position, top = new THREE.Color(0x2a6fd0), mid = new THREE.Color(0x8cc6f5), bot = new THREE.Color(0xdcefff), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 500; if (y > .04) c.copy(mid).lerp(top, Math.min(1, (y - .04) / .5)); else c.copy(bot); col.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); m.renderOrder = -10; scene.add(m); D3.sky = m;
  }
  scene.add(new THREE.HemisphereLight(0xeef6ff, 0x4f7a3a, 1.0));
  const sun = new THREE.DirectionalLight(0xfff3df, 1.15); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  { const s = sun.shadow.camera; s.left = -24; s.right = 24; s.top = 24; s.bottom = -24; s.near = 1; s.far = 140; }
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; scene.add(sun); scene.add(sun.target);
  const SUN_DIR = new THREE.Vector3(-.35, .9, .45).normalize();

  /* ---------------- pitch ---------------- */
  {
    const M = 8, px = 14, w = 2 * (PL + M), h = 2 * (PW + M), cv = document.createElement('canvas'); cv.width = Math.round(w * px); cv.height = Math.round(h * px);
    const c = cv.getContext('2d'); c.setTransform(px, 0, 0, px, (PL + M) * px, (PW + M) * px);
    c.fillStyle = '#2f8a3a'; c.fillRect(-PL - M, -PW - M, w, h);
    for (let i = -PL - M, k = 0; i < PL + M; i += 4, k++) { c.fillStyle = k % 2 ? '#3a9c45' : '#33923e'; c.fillRect(i, -PW - M, 4, h); }
    // a little grain
    for (let i = 0; i < 9000; i++) { const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * w - PL - M, y = (Math.sin(i * 78.233) * 12345.678 % 1 + 1) % 1 * h - PW - M; c.fillStyle = i % 2 ? 'rgba(20,70,25,.12)' : 'rgba(140,210,110,.08)'; c.fillRect(x, y, .25, .25); }
    c.strokeStyle = '#ffffff'; c.lineWidth = .14;
    c.strokeRect(-PL, -PW, 2 * PL, 2 * PW); c.beginPath(); c.moveTo(0, -PW); c.lineTo(0, PW); c.stroke();
    c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, .25, 0, TAU); c.fill();
    for (const s of [-1, 1]) {
      c.strokeRect(s > 0 ? PL - BOX_D : -PL, -BOX_W, BOX_D, 2 * BOX_W);
      c.strokeRect(s > 0 ? PL - 3 : -PL, -GW - 2, 3, 2 * GW + 4);
      c.beginPath(); c.arc(s * (PL - 6), 0, .22, 0, TAU); c.fill();
      c.beginPath(); c.arc(s * (PL - 6), 0, 4, s > 0 ? Math.PI - .93 : -.93, s > 0 ? Math.PI + .93 : .93); c.stroke();
      for (const t of [-1, 1]) { c.beginPath(); c.arc(s * PL, t * PW, 1, s > 0 ? (t > 0 ? Math.PI : Math.PI / 2) : (t > 0 ? -Math.PI / 2 : 0), s > 0 ? (t > 0 ? Math.PI * 1.5 : Math.PI) : (t > 0 ? 0 : Math.PI / 2)); c.stroke(); }
    }
    const g = new THREE.PlaneGeometry(w, h); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, lam(0xffffff, { map: tex(cv) })); m.receiveShadow = true; scene.add(m);
    const sur = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), lam(0x24602c)); sur.position.y = -.02; sur.receiveShadow = true; scene.add(sur);
  }
  /* goals with nets */
  const postMat = lam(0xffffff), netMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 });
  const goals = [];
  for (const s of [-1, 1]) {
    const g = new THREE.Group(); g.position.x = s * PL; scene.add(g); goals.push(g);
    const post = (y) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, GH, 12), postMat); m.position.set(0, GH / 2, y); m.castShadow = true; g.add(m); };
    post(-GW); post(GW);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2 * GW + .12, 12), postMat); bar.rotation.x = Math.PI / 2; bar.position.y = GH; bar.castShadow = true; g.add(bar);
    const D = 1.4 * s, pts = [];
    for (let y = -GW; y <= GW + .01; y += .25) { pts.push(0, GH, y, D, GH - .4, y); pts.push(D, GH - .4, y, D, 0, y); }
    for (let z = 0; z <= GH - .4; z += .25) pts.push(D, z, -GW, D, z, GW);
    for (let x = 0; Math.abs(x) <= 1.41; x += .25 * s) pts.push(x, GH - .4 * Math.abs(x) / 1.4, -GW, x, GH - .4 * Math.abs(x) / 1.4, GW);
    for (const y of [-GW, GW]) { for (let x = 0; Math.abs(x) <= 1.41; x += .25 * s) pts.push(x, 0, y, x, GH - .4 * Math.abs(x) / 1.4, y); for (let z = 0; z <= GH; z += .25) pts.push(0, z, y, D, Math.min(z, GH - .4), y); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const net = new THREE.LineSegments(geo, netMat); g.add(net); g.userData.net = net;
  }
  // corner flags
  for (const s of [-1, 1]) for (const t of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.5, 6), lam(0xffffff)); p.position.set(s * PL, .75, t * PW); scene.add(p);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(.45, .3), lam(0xffd34d, { side: THREE.DoubleSide })); f.position.set(s * PL + .23, 1.35, t * PW); scene.add(f);
  }
  /* ad boards, stands, crowd, floodlights */
  {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 64; const c = cv.getContext('2d');
    const ads = [['SUPER STRIKERS', '#0f2a5c', '#ffd34d'], ['GOAL!', '#e8323c', '#ffffff'], ['ARCADE CUP', '#1fa354', '#ffffff'], ['PLAY FAIR', '#7c4dff', '#ffffff']];
    ads.forEach(([s, bg, fg], i) => { c.fillStyle = bg; c.fillRect(i * 256, 0, 256, 64); c.fillStyle = fg; c.font = 'italic 900 34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, i * 256 + 128, 34); });
    const t = tex(cv, true); t.repeat.set(3, 1);
    const board = (len, x, z, ry) => { const tt = t.clone(); tt.needsUpdate = true; tt.repeat.set(len / 26, 1); const m = new THREE.Mesh(new THREE.BoxGeometry(len, .9, .12), [lam(0x222222), lam(0x222222), lam(0x222222), lam(0x222222), lam(0xffffff, { map: tt }), lam(0x222222)]); m.position.set(x, .45, z); m.rotation.y = ry; scene.add(m); };
    board(2 * PL + 6, 0, -PW - 3, 0); board(2 * PL + 6, 0, PW + 3, Math.PI); board(2 * PW + 4, -PL - 4, 0, Math.PI / 2); board(2 * PW + 4, PL + 4, 0, -Math.PI / 2);
  }
  const crowdGroups = [];
  {
    const standMat = lam(0x5d6b82), roofMat = lam(0xe9eef6), people = [[], [], [], []], dummy = new THREE.Object3D();
    const kitCols = [0xe8323c, 0x2f6fd6, 0xffd23f, 0x1fa354, 0xffffff, 0x7c4dff, 0xff8a3d, 0x1d2433];
    const stand = (len, cx, cz, ry, deep) => {
      const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = ry; scene.add(g);
      const tier = new THREE.Mesh(new THREE.BoxGeometry(len, 1, deep), standMat); tier.position.set(0, 4.2, -deep / 2); tier.rotation.x = .44; tier.receiveShadow = true; g.add(tier);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(len, .4, deep * .8), roofMat); roof.position.set(0, 13, -deep * .6); roof.rotation.x = -.1; g.add(roof);
      g.updateMatrixWorld(true);
      for (let r = 0; r < 12; r++) for (let k = 0; k < Math.floor(len / .75); k++) {
        if (((r * 7 + k * 13) % 9) === 0) continue;
        dummy.position.set(-len / 2 + .4 + k * .75, 1.1 + r * .62 + .4, -1 - r * 1.3); dummy.updateMatrix();
        const m = new THREE.Matrix4().multiplyMatrices(g.matrixWorld, dummy.matrix);
        people[(r + k) % 4].push({ m, c: kitCols[(r * 3 + k * 5 + (k >> 2)) % kitCols.length] });
      }
    };
    stand(2 * PL + 10, 0, -PW - 6, 0, 18); stand(2 * PL + 10, 0, PW + 6, Math.PI, 18); stand(2 * PW + 10, -PL - 7, 0, Math.PI / 2, 16); stand(2 * PW + 10, PL + 7, 0, -Math.PI / 2, 16);
    const geo = new THREE.BoxGeometry(.45, .75, .35), cc = new THREE.Color();
    for (const list of people) {
      const im = new THREE.InstancedMesh(geo, lam(0xffffff), list.length); list.forEach((p, i) => { im.setMatrixAt(i, p.m); im.setColorAt(i, cc.set(p.c)); });
      const g = new THREE.Group(); g.add(im); scene.add(g); crowdGroups.push(g);
    }
    const poleMat = lam(0xb7c0cc), lampMat = new THREE.MeshBasicMaterial({ color: 0xfffbe6 });
    for (const [x, z] of [[-PL - 14, -PW - 14], [PL + 14, -PW - 14], [-PL - 14, PW + 14], [PL + 14, PW + 14]]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.5, .7, 34, 8), poleMat); p.position.set(x, 17, z); scene.add(p);
      const hd = new THREE.Mesh(new THREE.BoxGeometry(6, 4, .6), lampMat); hd.position.set(x, 35, z); hd.lookAt(0, 0, 0); scene.add(hd);
    }
  }

  /* ---------------- ball ---------------- */
  const ball = (() => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const c = cv.getContext('2d');
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#16181f';
    const spots = [[32, 20], [96, 20], [160, 20], [224, 20], [0, 64], [64, 64], [128, 64], [192, 64], [256, 64], [32, 108], [96, 108], [160, 108], [224, 108]];
    for (const [x, y] of spots) { c.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; c.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13 * (y === 64 ? 1 : .7)); } c.fill(); }
    const m = new THREE.Mesh(new THREE.SphereGeometry(BR, 24, 16), new THREE.MeshLambertMaterial({ map: tex(cv) })); m.castShadow = true; scene.add(m); return m;
  })();
  const ballBlob = new THREE.Mesh(new THREE.CircleGeometry(BR * 1.1, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3, depthWrite: false })); ballBlob.position.y = .015; scene.add(ballBlob);

  /* ---------------- players ---------------- */
  const CAP = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 12);
  const SPH = new THREE.SphereGeometry(1, 16, 12);
  function numberTexture(num, name, col) {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const c = cv.getContext('2d');
    c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (name) { c.font = '900 20px sans-serif'; c.fillText(name, 64, 18, 120); }
    c.font = '900 76px sans-serif'; c.fillText(String(num), 64, 76); return tex(cv);
  }
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: .9, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(.55, .72, 32).rotateX(-Math.PI / 2), ringMat); ring.position.y = .03; scene.add(ring);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(.16, .32, 4), new THREE.MeshBasicMaterial({ color: 0xffd34d })); arrow.rotation.x = Math.PI; scene.add(arrow);
  let rigs = new Map(), rigTeams = null;
  function buildRig(p, teams) {
    const kit = teams[p.team].kit, gk = p.role === 'GK';
    const shirtC = gk ? (p.team === 0 ? (kit.id === 'green' ? '#ff8a3d' : '#22c55e') : (kit.id === 'yellow' ? '#c84dff' : '#ffb000')) : kit.shirt;
    const M = { shirt: lam(shirtC), shorts: lam(gk ? '#1d2433' : kit.shorts), socks: lam(gk ? shirtC : kit.socks), skin: lam(p.skin), hair: lam(p.hair), boot: lam(p.team === 0 ? '#111111' : '#1b1b2b'), bootTrim: lam(gk ? '#ffffff' : kit.trim), glove: lam(gk ? '#f4f6fb' : p.skin), trim: lam(gk ? '#111' : kit.trim), dark: lam(0x1a1a1a) };
    const mesh = (geo, mat, parent, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); if (sx) m.scale.set(sx, sy, sz); m.castShadow = true; parent.add(m); return m; };
    const root = new THREE.Group(); root.rotation.order = 'YXZ'; scene.add(root);
    // hips (shorts)
    mesh(SPH, M.shorts, root, 0, -.02, 0, .13, .12, .19);
    const spine = new THREE.Group(); spine.position.y = .04; root.add(spine);
    mesh(CAP(.15, .26), M.shirt, spine, 0, .27, 0, .78, 1, 1.25);
    mesh(SPH, M.shirt, spine, 0, .47, 0, .12, .07, .25);                     // shoulders
    mesh(new THREE.TorusGeometry(.055, .015, 6, 14).rotateX(Math.PI / 2), M.trim, spine, 0, .54, 0);   // collar
    mesh(new THREE.CylinderGeometry(.048, .055, .1, 10), M.skin, spine, 0, .57, 0);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(.26, .26), new THREE.MeshLambertMaterial({ map: numberTexture(p.num, p.name, gk ? '#111' : kit.num), transparent: true }));
    back.position.set(-.122, .3, 0); back.rotation.y = -Math.PI / 2; spine.add(back);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(.1, .1), new THREE.MeshLambertMaterial({ map: numberTexture(p.num, '', gk ? '#111' : kit.num), transparent: true }));
    front.position.set(.122, .38, .07); front.rotation.y = Math.PI / 2; spine.add(front);
    // head
    const head = new THREE.Group(); head.position.y = .62; spine.add(head);
    mesh(SPH, M.skin, head, .005, .1, 0, .105, .125, .1);
    mesh(new THREE.SphereGeometry(1, 16, 10, 0, TAU, 0, Math.PI * .52), M.hair, head, -.01, .125, 0, .112, .12, .108).rotation.z = .25;
    for (const s of [-1, 1]) { mesh(SPH, M.dark, head, .095, .115, s * .038, .013, .016, .013); mesh(SPH, M.skin, head, 0, .1, s * .1, .022, .035, .018); }
    mesh(SPH, M.skin, head, .108, .085, 0, .02, .025, .018);
    // arms
    const arm = s => {
      const sh = new THREE.Group(); sh.position.set(0, .48, s * .2); spine.add(sh);
      mesh(CAP(.058, .1), M.shirt, sh, 0, -.07, 0);
      mesh(CAP(.044, .17), M.skin, sh, 0, -.17, 0);
      const el = new THREE.Group(); el.position.y = -.29; sh.add(el);
      mesh(CAP(.04, .17), M.skin, el, 0, -.12, 0);
      mesh(SPH, M.glove, el, .005, -.27, 0, gk ? .06 : .045, gk ? .07 : .055, gk ? .045 : .035);
      return { sh, el };
    };
    const legs = s => {
      const hp = new THREE.Group(); hp.position.set(0, -.06, s * .095); root.add(hp);
      mesh(new THREE.CylinderGeometry(.088, .08, .2, 12), M.shorts, hp, 0, -.08, 0);
      mesh(CAP(.066, .26), M.skin, hp, 0, -.25, 0);
      const kn = new THREE.Group(); kn.position.y = -.44; hp.add(kn);
      mesh(CAP(.056, .24), M.socks, kn, 0, -.2, 0);
      mesh(CAP(.058, .04), M.socks, kn, .01, -.07, 0);
      const an = new THREE.Group(); an.position.y = -.42; kn.add(an);
      const boot = mesh(CAP(.045, .14), M.boot, an, .055, -.035, 0); boot.rotation.z = Math.PI / 2; boot.scale.set(1, 1, 1.05);
      mesh(new THREE.BoxGeometry(.12, .012, .06), M.bootTrim, an, .05, -.01, 0);
      return { hp, kn, an };
    };
    const r = { root, spine, head, armL: arm(-1), armR: arm(1), legL: legs(-1), legR: legs(1), p };
    return r;
  }
  function syncRigs(G) {
    if (rigTeams !== G.teams) {
      for (const r of rigs.values()) { scene.remove(r.root); r.root.traverse(o => { if (o.geometry && o.geometry !== SPH) o.geometry.dispose(); }); }
      rigs = new Map(); rigTeams = G.teams;
      for (const p of G.players) rigs.set(p, buildRig(p, G.teams));
    }
  }

  /* ---------------- poses ----------------
     Angles: thigh/arm swing forward +, knee flex +, elbow flex +, abduct (out to the side) +,
     lean forward +. Root pitch + tips the body backwards (for the backflip), roll + to the body's right. */
  const J0 = () => ({ hipY: .95, y: 0, yaw: 0, pitch: 0, roll: 0, lean: .05, twist: 0, nod: 0, headYaw: 0,
    lT: 0, rT: 0, lTa: .04, rTa: .04, lK: .05, rK: .05, lF: 0, rF: 0, lA: 0, rA: 0, lAa: .12, rAa: .12, lE: .25, rE: .25 });
  function runPose(J, p, k) {
    const ph = p.dist * Math.PI / 1.45, s = Math.sin(ph), amp = .2 + .62 * k;
    J.rT = s * amp; J.lT = -s * amp;
    J.rK = .12 + (.35 + 1.15 * k) * (.5 - .5 * Math.cos(ph - .7)); J.lK = .12 + (.35 + 1.15 * k) * (.5 - .5 * Math.cos(ph + Math.PI - .7));
    J.rA = -s * (.25 + .6 * k); J.lA = s * (.25 + .6 * k); J.rE = J.lE = .45 + 1.0 * k;
    J.hipY = .95 - .03 * k - .05 * k * Math.abs(Math.cos(ph)); J.lean = .06 + .22 * k; J.twist = s * .12 * k;
    J.rF = -.2 * k * Math.max(0, -s); J.lF = -.2 * k * Math.max(0, s);
  }
  function poseFor(p, G, t) {
    const J = J0(), k = clamp(p.speed / 7, 0, 1), a = p.anim, T = p.animT;
    if (p.speed > .25) runPose(J, p, k); else { const b = Math.sin(t * 2 + p.i) * .015; J.lean = .08 + b; J.lE = J.rE = .35; J.lK = J.rK = .12; J.hipY = .94; }
    if (a === 'kick') {
      const u = T / .38, back = ease(u / .4), fwd = ease((u - .4) / .3);
      J.rT = lerp(-.7 * back, 1.25, fwd); J.rK = lerp(1.4 * back, .1, fwd); J.lT = -.15; J.lK = .3; J.lean = lerp(.15, -.12, fwd);
      J.lAa = .9; J.lA = .3; J.rA = -.4; J.rAa = .5; J.twist = -.25 * back + .2 * fwd;
    } else if (a === 'tackle') {
      const u = clamp(T / .25, 0, 1); J.hipY = lerp(.9, .32, u); J.lean = lerp(.1, -.55, u);
      J.rT = 1.35 * u; J.rK = .05; J.lT = .5 * u; J.lK = 1.6 * u; J.lA = -.6; J.rA = -.4; J.lAa = .7; J.rAa = .5; J.lE = J.rE = .2;
    } else if (a === 'dive' && p.dive) {
      const u = clamp(T / .35, 0, 1), s = sgn((p.dive.side || 1) * Math.cos(p.face));   // the body's right side points along (-sin, cos) of its facing J.roll = s * 1.3 * ease(u); J.hipY = .75 + .35 * Math.sin(Math.PI * clamp(T / .8, 0, 1)) * u;
      J.lAa = J.rAa = 2.7 * ease(u); J.lE = J.rE = .1; J.lT = J.rT = .1; J.lK = J.rK = .1; J.lTa = J.rTa = .1; J.lean = 0;
    } else if (a === 'hold') { J.lA = J.rA = 1.05; J.lAa = J.rAa = .12; J.lE = J.rE = .9; }
    else if (a === 'throw') { const rel = p.hands ? 0 : ease(T / .3); J.lA = J.rA = lerp(3.0, 1.2, rel); J.lAa = J.rAa = .15; J.lE = J.rE = lerp(1.3, .2, rel); J.lean = lerp(-.25, .3, rel); J.rT = .3; J.rK = .2; }
    else if (a === 'cheer') { const j = Math.abs(Math.sin(t * 6 + p.i)); J.y = j * .32; J.lAa = J.rAa = 2.6; J.lE = J.rE = .15; J.lK = J.rK = .3 * (1 - j); J.lean = 0; }
    else if (a === 'sad') { J.lean = .38; J.nod = .45; J.lAa = J.rAa = .95; J.lA = J.rA = 2.2; J.lE = J.rE = 2.4; }
    else if (a === 'celebrate') celebrate(J, p, T, t);
    return J;
  }
  const sgn = v => v < 0 ? -1 : 1;
  function celebrate(J, p, T, t) {
    const type = p.celebType;
    if (type === 'siu') {
      // run in, leap, spin round in the air, land with feet wide and arms thrust down and out
      if (T < .28) { J.hipY = .86; J.lean = .3; J.lA = J.rA = -.9; J.lE = J.rE = .3; J.lK = J.rK = .7; J.lT = J.rT = .4; }
      else if (T < .92) {
        const u = (T - .28) / .64; J.y = Math.sin(Math.PI * u) * .78; J.yaw = Math.PI * ease((u - .1) / .75);
        J.lT = J.rT = .55 * Math.sin(Math.PI * u); J.lK = J.rK = 1.1 * Math.sin(Math.PI * u); J.lAa = J.rAa = .5 + 1.4 * Math.sin(Math.PI * u); J.lA = J.rA = .4; J.lean = -.05;
      } else {
        const u = clamp((T - .92) / .14, 0, 1), hold = Math.sin(t * 30) * .01 * (T < 1.6 ? 1 : 0);
        J.yaw = Math.PI; J.hipY = lerp(.78, .86, u); J.lTa = J.rTa = .36; J.lK = J.rK = lerp(.9, .35, u); J.lT = J.rT = .15;
        J.lAa = J.rAa = .62 + hold; J.lA = J.rA = -.38; J.lE = J.rE = .02; J.lean = -.2; J.nod = -.3;
      }
    } else if (type === 'slide') {
      if (T < .3) runPose(J, p, .9);
      else { const u = clamp((T - .3) / .25, 0, 1); J.hipY = lerp(.9, .56, u); J.lT = J.rT = .05; J.lK = J.rK = 1.6 * u; J.lF = J.rF = .5; J.lean = -.4 * u; J.nod = -.4 * u; J.lAa = J.rAa = 2.3 * u + .1; J.lA = J.rA = .4; J.lE = J.rE = .2; J.lTa = J.rTa = .15; }
    } else if (type === 'plane') {
      runPose(J, p, .75); J.lAa = J.rAa = 1.5; J.lA = J.rA = 0; J.lE = J.rE = 0; J.roll = .35 * Math.sin(T * 1.9) + .25; J.lean = .15;
    } else if (type === 'flip') {
      if (T < .3) { const u = T / .3; J.hipY = lerp(.94, .7, u); J.lK = J.rK = 1.3 * u; J.lT = J.rT = .7 * u; J.lA = J.rA = -1.2 * u; J.lean = .3 * u; }
      else if (T < 1.0) { const u = (T - .3) / .7; J.y = Math.sin(Math.PI * u) * 1.15; J.pitch = TAU * ease(u); J.lT = J.rT = 1.5 * Math.sin(Math.PI * u); J.lK = J.rK = 2.0 * Math.sin(Math.PI * u); J.lA = J.rA = 1.2 * Math.sin(Math.PI * u); }
      else { J.lAa = J.rAa = 2.6; J.lE = J.rE = .1; J.lean = -.1; J.y = Math.abs(Math.sin((T - 1) * 6)) * .15 * (T < 2 ? 1 : 0); }
    } else if (type === 'dance') {
      const b = t * 7.5, s = Math.sin(b); J.roll = s * .12; J.twist = s * .35; J.hipY = .9 - Math.abs(Math.cos(b)) * .06;
      J.rA = 1.0 + s * 1.0; J.lA = 1.0 - s * 1.0; J.rE = J.lE = 1.5; J.rAa = J.lAa = .35;
      J.rT = Math.max(0, s) * .7; J.rK = Math.max(0, s) * 1.2; J.lT = Math.max(0, -s) * .7; J.lK = Math.max(0, -s) * 1.2; J.lean = .1; J.headYaw = s * .3;
    }
  }
  function applyPose(r, p, J) {
    r.root.position.set(p.x, J.hipY + J.y, p.y);
    r.root.rotation.set(J.roll, -p.face + J.yaw, J.pitch);
    r.spine.rotation.set(0, J.twist, -J.lean);
    r.head.rotation.set(0, J.headYaw, -J.nod + J.lean * .4);
    const L = (leg, T, Ta, K, F, s) => { leg.hp.rotation.set(s > 0 ? -Ta : Ta, 0, T); leg.kn.rotation.z = -K; leg.an.rotation.z = F + K * .25 - T * .1; };
    L(r.legL, J.lT, J.lTa, J.lK, J.lF, -1); L(r.legR, J.rT, J.rTa, J.rK, J.rF, 1);
    const A = (arm, a, aa, e, s) => { arm.sh.rotation.set(s > 0 ? -aa : aa, 0, a); arm.el.rotation.z = e; };
    A(r.armL, J.lA, J.lAa, J.lE, -1); A(r.armR, J.rA, J.rAa, J.rE, 1);
  }

  /* ---------------- camera ---------------- */
  const camPos = new THREE.Vector3(0, 15, 30), camLook = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpL = new THREE.Vector3();
  let camInit = false, orbit = 0;

  /* ---------------- frame ---------------- */
  let slowT = 0, quality = 2;
  D3.render = function (G, dt, lay) {
    const W = lay.W, H = lay.H, t = G.t;
    if (quality > 0) { slowT = dt > .045 ? slowT + dt : Math.max(0, slowT - dt * .5); if (slowT > 2.5) { quality--; slowT = 0; renderer.setPixelRatio(quality === 1 ? Math.min(1.5, window.devicePixelRatio || 1) : 1); } }
    if (renderer.domElement.width !== Math.round(W * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(H * renderer.getPixelRatio())) renderer.setSize(W, H, false);
    const portrait = H > W * 1.05;
    camera.aspect = W / H; camera.fov = portrait ? 62 : 40; camera.updateProjectionMatrix();
    D3.basis = portrait ? { rx: 0, ry: 1, fx: 1, fy: 0 } : { rx: 1, ry: 0, fx: 0, fy: -1 };

    if (!G.ball || !G.players.length) {   // title screen: slow fly-around of the empty stadium
      orbit += dt * .08; camera.position.set(Math.cos(orbit) * 55, 22, Math.sin(orbit) * 40); camera.lookAt(0, 0, 0);
      for (const r of rigs.values()) r.root.visible = false; ring.visible = arrow.visible = false;
      D3.sky.position.copy(camera.position); renderer.render(scene, camera); return;
    }
    syncRigs(G);
    for (const p of G.players) { const r = rigs.get(p); if (!r) continue; r.root.visible = true; applyPose(r, p, poseFor(p, G, t)); }
    // ball
    const b = G.ball; ball.position.set(b.x, b.z, b.y);
    const sp = Math.hypot(b.vx, b.vy); if (sp > .05) ball.rotateOnWorldAxis(new THREE.Vector3(b.vy / sp, 0, -b.vx / sp), sp * dt / BR);
    ballBlob.position.set(b.x, .015, b.y); ballBlob.scale.setScalar(1 + b.z * .5); ballBlob.material.opacity = clamp(.35 - b.z * .08, .08, .35);
    // the player you control
    const c = G.ctrl, showRing = c && (G.mode === 'play' || G.mode === 'kickoff' || G.mode === 'restart');
    ring.visible = arrow.visible = !!showRing;
    if (showRing) { ring.position.set(c.x, .03, c.y); arrow.position.set(c.x, 2.25 + Math.sin(t * 6) * .08, c.y); arrow.rotation.y = t * 2; }
    // net ripple after a goal
    for (const g of goals) { const net = g.userData.net; const hit = G.mode === 'goal' && Math.sign(b.x) === Math.sign(g.position.x) ? Math.max(0, 1 - G.modeT * .8) : 0; net.scale.x = 1 + hit * .18 * Math.sin(G.modeT * 18); }
    // crowd bounces when it is loud
    crowdGroups.forEach((g, i) => { g.position.y = Math.abs(Math.sin(t * 9 + i * 1.7)) * .3 * Math.min(1, G.cheer / 2); });

    // camera
    let pos, look, rate = 3;
    if (G.mode === 'goal' && G.celeb) {
      const cel = G.celeb, p = cel.p;
      if (cel.phase === 'perform') {
        if (p.celebType === 'plane') { const cx = cel.spot.x, cy = cel.spot.y - 3; pos = tmpP.set(cx - cel.s * 3, 3.6, cy + 11); look = tmpL.set(cx, 1, cy); rate = 2; }
        else {
          const fa = p.face + (p.celebType === 'siu' ? Math.PI : 0), sw = Math.sin(G.modeT * .35) * .45, R = portrait ? 6.2 : 5.2;
          pos = tmpP.set(p.x + Math.cos(fa + sw) * R, 1.7, p.y + Math.sin(fa + sw) * R); look = tmpL.set(p.x, p.celebType === 'flip' ? 1.3 : 1.05, p.y); rate = 2.2;
        }
      } else { pos = tmpP.set(p.x - 3, 4.5, p.y + 9); look = tmpL.set(p.x, 1, p.y); rate = 2; }
    } else if (portrait) {
      const fx = clamp(b.x, -PL + 4, PL - 6), fz = b.y * .85;
      pos = tmpP.set(fx - 15, 11.5, fz); look = tmpL.set(fx + 9, 0, fz);
    } else {
      const fx = clamp(b.x * .95, -PL + 8, PL - 8), fz = clamp(b.y * .55, -PW * .5, PW * .5);
      pos = tmpP.set(fx, 15, fz + 25); look = tmpL.set(fx, 0, fz - 3);
    }
    if (!camInit) { camPos.copy(pos); camLook.copy(look); camInit = true; }
    const kk = 1 - Math.exp(-dt * rate); camPos.lerp(pos, kk); camLook.lerp(look, 1 - Math.exp(-dt * rate * 1.6));
    camera.position.copy(camPos); camera.lookAt(camLook);
    D3.sky.position.copy(camera.position);
    sun.target.position.set(camLook.x, 0, camLook.z); sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 60); sun.target.updateMatrixWorld();
    renderer.render(scene, camera);
  };
  D3.ok = true;
  D3.debug = { scene, camera, rigs: () => rigs, poseFor };
}
start();
