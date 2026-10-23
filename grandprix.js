/* Turbo Grand Prix: open-wheel racing in eight cities (three.js).
   Units are metres and seconds. Tracks are smooth closed curves sampled every ~2.5 m;
   every car keeps track of the sample it is nearest to, which drives laps, positions,
   the computer drivers and the walls. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const wrapA = a => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI;
const $ = id => document.getElementById(id);
const GP = { ok: false }; window.GP = GP;
function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ================================================================
   The eight cities
   ================================================================ */
const CITIES = [
  { id: 'monaco', name: 'Monte Carlo', flag: '🇲🇨', desc: 'Tight streets beside a harbour full of yachts, with a tunnel.', street: true, sky: 0x7fc4ff, fog: 0xbfe0ff, ground: 0x8a8f96, night: false,
    pts: [[0, 0], [120, 0], [200, -30], [230, -90], [210, -160], [150, -190], [110, -170], [95, -130], [60, -120], [30, -160], [-10, -200], [-80, -210], [-150, -180], [-180, -120], [-160, -60], [-100, -30], [-50, -10]],
    water: [{ x: 0, z: 140, w: 700, d: 180 }], tunnel: [.56, .66], scene: 'harbour' },
  { id: 'melbourne', name: 'Melbourne', flag: '🇦🇺', desc: 'A flowing park circuit around a lake.', sky: 0x86c8f5, fog: 0xc8e4f5, ground: 0x4f9a3e, night: false,
    pts: [[0, 0], [200, 0], [280, 40], [300, 120], [250, 180], [150, 170], [100, 220], [0, 240], [-120, 220], [-200, 160], [-230, 60], [-180, 0], [-90, -10]],
    water: [{ x: 40, z: 115, r: 58 }], scene: 'park' },
  { id: 'montreal', name: 'Montreal', flag: '🇨🇦', desc: 'An island in a river: long straights and a hairpin.', sky: 0x8fc8f0, fog: 0xc4dff0, ground: 0x5aa04a, night: false,
    pts: [[0, 0], [250, 0], [330, 20], [350, 60], [320, 80], [220, 70], [120, 90], [40, 120], [-80, 110], [-200, 90], [-300, 60], [-340, 20], [-310, -10], [-200, -20], [-100, -10]],
    water: [{ x: 0, z: -110, w: 900, d: 120 }, { x: 0, z: 215, w: 900, d: 130 }], scene: 'island' },
  { id: 'monza', name: 'Monza', flag: '🇮🇹', desc: 'The fastest track: huge straights through the forest.', sky: 0x9fd0f0, fog: 0xd0e4ee, ground: 0x4a8a3a, night: false,
    pts: [[0, 0], [300, 0], [330, 15], [345, -5], [380, 10], [420, 80], [400, 180], [300, 230], [150, 240], [60, 230], [-80, 200], [-180, 140], [-200, 60], [-150, 10], [-80, 0]],
    scene: 'forest' },
  { id: 'suzuka', name: 'Suzuka', flag: '🇯🇵', desc: 'A figure of eight that crosses over itself on a bridge.', sky: 0x9ac8ee, fog: 0xd4e2ee, ground: 0x5a9a48, night: false, eight: true, scene: 'suzuka' },
  { id: 'singapore', name: 'Singapore', flag: '🇸🇬', desc: 'A night race through glowing city streets.', street: true, sky: 0x0a1030, fog: 0x141a38, ground: 0x3a3f4a, night: true,
    pts: [[0, 0], [220, 0], [240, 20], [240, 90], [200, 110], [200, 170], [150, 190], [60, 190], [40, 170], [40, 130], [-40, 130], [-60, 150], [-160, 150], [-190, 120], [-190, 40], [-160, 10], [-80, 0]],
    water: [{ x: 0, z: 330, w: 900, d: 180 }], scene: 'city' },
  { id: 'vegas', name: 'Las Vegas', flag: '🇺🇸', desc: 'Night racing down the neon Strip.', street: true, sky: 0x120a2a, fog: 0x1e1438, ground: 0x3a3440, night: true,
    pts: [[0, 0], [420, 0], [460, 30], [450, 80], [380, 100], [300, 90], [220, 140], [100, 150], [-200, 150], [-260, 120], [-260, 40], [-220, 0], [-100, 0]],
    scene: 'neon' },
  { id: 'saopaulo', name: 'São Paulo', flag: '🇧🇷', desc: 'Up and down the hills, the wrong way round!', sky: 0x8ac4ee, fog: 0xc4dcee, ground: 0x5a9a3e, night: false,
    pts: [[0, 0, 6], [-200, 0, 8], [-260, -40, 4], [-250, -110, 0], [-180, -130, 2], [-120, -90, 6], [-60, -120, 8], [20, -160, 4], [120, -140, 0], [180, -80, 2], [160, -20, 6], [90, 10, 7]], scene: 'hills' },
];
// Suzuka: a figure of eight whose two halves cross on a bridge
{ const c = CITIES.find(c => c.id === 'suzuka'), pts = []; for (let i = 0; i < 28; i++) { const t = i / 28 * TAU + Math.PI / 2; pts.push([320 * Math.sin(t), 170 * Math.sin(t) * Math.cos(t), 6 + 6 * Math.cos(t)]); } c.pts = pts; }
const TEAMS = [
  { name: 'Red Comet', c: 0xe10600, a: 0xffd34d }, { name: 'Blue Bolt', c: 0x1f5fd0, a: 0xff3a6a }, { name: 'Green Gecko', c: 0x1aa850, a: 0xf4f6fb },
  { name: 'Orange Flash', c: 0xff8000, a: 0x1d2433 }, { name: 'Purple Storm', c: 0x7a3ad8, a: 0x5ad8ff }, { name: 'Gold Rush', c: 0xe0b020, a: 0x1d2433 },
  { name: 'Night Hawk', c: 0x222630, a: 0x3ad06a }, { name: 'White Lightning', c: 0xeef0f6, a: 0xe10600 }, { name: 'Pink Rocket', c: 0xff5fb0, a: 0x1d2433 }, { name: 'Teal Tornado', c: 0x18b8b0, a: 0xffd34d },
];
const RIVALS = ['ZIGGY R.', 'MARCO V.', 'ROCKY B.', 'LUNA P.', 'TOMMY T.', 'NINA K.', 'BRUNO S.', 'KENJI M.', 'SOFIA L.', 'DIEGO F.', 'AXEL W.', 'RUBY Q.'];
const DIFF = { easy: { vmax: 64, grip: .78, line: .7 }, medium: { vmax: 72, grip: .9, line: .85 }, hard: { vmax: 79, grip: 1, line: 1 } };
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const W = 14;   // track width

/* ================================================================
   three.js
   ================================================================ */
const canvas = $('c');
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, .1, 2200);
const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2dc, 1.1); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
{ const c = sun.shadow.camera; c.left = -30; c.right = 30; c.top = 30; c.bottom = -30; c.near = 1; c.far = 200; } sun.shadow.bias = -.0005; scene.add(sun); scene.add(sun.target);
const SUN_DIR = new THREE.Vector3(-.4, .8, .35).normalize();
const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
const BOX = new THREE.BoxGeometry(1, 1, 1);
const canvasTex = (w, h, fn, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
const asphaltTex = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#4a4c52'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2200; i++) { const v = 50 + Math.random() * 50; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); } }, true);
const kerbTex = canvasTex(64, 16, (c) => { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#f4f4f4' : '#e10600'; c.fillRect(i * 16, 0, 16, 16); } }, true);
const checkTex = canvasTex(64, 64, (c) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#111' : '#fff'; c.fillRect(x * 8, y * 8, 8, 8); } });
const barrierTex = canvasTex(256, 32, (c) => { const ads = [['TURBO', '#e10600', '#fff'], ['GRAND PRIX', '#111', '#ffd34d'], ['ARCADE', '#1f5fd0', '#fff'], ['VROOM', '#1aa850', '#fff']]; ads.forEach(([s, bg, fg], i) => { c.fillStyle = bg; c.fillRect(i * 64, 0, 64, 32); c.fillStyle = fg; c.font = 'italic 900 13px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, i * 64 + 32, 17); }); }, true);
const windowTex = night => canvasTex(64, 128, (c, w, h) => { c.fillStyle = night ? '#141826' : '#8a95a8'; c.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 10) for (let x = 4; x < w; x += 10) { const lit = Math.random() < (night ? .55 : .0); c.fillStyle = lit ? ['#ffe08a', '#fff2c8', '#9fd8ff'][Math.floor(Math.random() * 3)] : night ? '#1e2436' : '#b8d4ee'; c.fillRect(x, y, 6, 6); } }, true);
const crowdTex = canvasTex(128, 32, (c, w, h) => { c.fillStyle = '#3a3f4a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = ['#e10600', '#ffd34d', '#1f5fd0', '#fff', '#1aa850', '#ff8000'][i % 6]; c.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }, true);

/* ================================================================
   Track building
   ================================================================ */
let T = null;   // current track
const world = new THREE.Group(); scene.add(world);
function ribbon(samples, a, b, yOff, mat, vScale, uFn, open) {   // a strip between lateral offsets a and b along the track
  const N = samples.length, P = [], U = [], I = [], M = open ? N - 1 : N;
  for (let i = 0; i <= M; i++) { const s = samples[i % N], d = i === N ? T.len : s.d;
    for (const o of [a, b]) { P.push(s.x + s.nx * o, s.y + yOff, s.z + s.nz * o); U.push(uFn ? uFn(o) : (o === a ? 0 : 1), d / vScale); } }
  for (let i = 0; i < M; i++) { const k = i * 2; I.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; world.add(m); return m;
}
function buildTrack(city) {
  world.clear();
  const pts = city.pts.map(p => new THREE.Vector3(p[0], p[2] || 0, p[1]));
  const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  const len0 = curve.getLength(), N = Math.round(len0 / 2.5), P = curve.getSpacedPoints(N); P.pop();
  const S = [];
  for (let i = 0; i < N; i++) { const a = P[(i - 1 + N) % N], b = P[(i + 1) % N], tx = b.x - a.x, tz = b.z - a.z, L = Math.hypot(tx, tz); S.push({ x: P[i].x, y: P[i].y, z: P[i].z, tx: tx / L, tz: tz / L, nx: tz / L, nz: -tx / L, d: 0 }); }
  let d = 0; for (let i = 0; i < N; i++) { S[i].d = d; const q = S[(i + 1) % N]; d += Math.hypot(q.x - S[i].x, q.z - S[i].z); }
  for (let i = 0; i < N; i++) { const a = S[i], b = S[(i + 1) % N]; a.k = ((b.tx - a.tx) * a.nx + (b.tz - a.tz) * a.nz) / 2.5; }   // + = bending left
  // look-ahead corner severity, used by the computer drivers and the kerbs
  for (let i = 0; i < N; i++) { let m = 0; for (let j = 0; j < 40; j++) m = Math.max(m, Math.abs(S[(i + j) % N].k)); S[i].ka = m; let s = 0; for (let j = -4; j <= 4; j++) s += S[(i + j + N) % N].k; S[i].ks = s / 9; }
  const R = city.street ? 7 : 16;   // run-off width beyond the white line
  T = { city, S, N, len: d, R, minY: Math.min(...S.map(s => s.y)) };
  // ground and water
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), lam(city.ground)); ground.position.y = T.minY - .4; ground.receiveShadow = true; world.add(ground);
  for (const wa of city.water || []) { const g = wa.r ? new THREE.CircleGeometry(wa.r, 40) : new THREE.PlaneGeometry(wa.w, wa.d); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: city.night ? 0x10204a : 0x2f7fd0 })); m.position.set(wa.x, T.minY - .3, wa.z); world.add(m); }
  // road, run-off, kerbs, lines, walls
  const runMat = city.street ? lam(0x6a6e78, { map: asphaltTex }) : lam(new THREE.Color(city.ground).multiplyScalar(1.08).getHex());
  ribbon(S, -W / 2 - R, -W / 2, -.04, runMat, 8); ribbon(S, W / 2, W / 2 + R, -.04, runMat, 8);
  asphaltTex.repeat.set(1, 1);
  ribbon(S, -W / 2, W / 2, 0, lam(0xffffff, { map: asphaltTex }), 10);
  const white = lam(0xf4f4f4);
  ribbon(S, -W / 2, -W / 2 + .35, .02, white, 10); ribbon(S, W / 2 - .35, W / 2, .02, white, 10);
  // kerbs only where the track bends
  const kerbS = (side) => { const segs = []; let cur = null; for (let i = 0; i < N; i++) { const on = Math.abs(S[i].ks) > .006 && Math.sign(S[i].ks) * side > 0; if (on && !cur) cur = [i]; if (!on && cur) { cur.push(i); segs.push(cur); cur = null; } } if (cur) { cur.push(N - 1); segs.push(cur); } return segs; };
  const kerbMat = lam(0xffffff, { map: kerbTex });
  for (const side of [1, -1]) for (const [a, b] of kerbS(side)) { if (b - a < 3) continue; const sub = S.slice(Math.max(0, a - 2), Math.min(N, b + 2)), o1 = side * (W / 2), o2 = side * (W / 2 + 1.4); ribbon(sub, Math.min(o1, o2), Math.max(o1, o2), .03, kerbMat, 3, null, true); }
  // start line and grid boxes
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, W).rotateX(-Math.PI / 2), lam(0xffffff, { map: checkTex })); sl.position.set(S[0].x, S[0].y + .04, S[0].z); sl.rotation.y = -Math.atan2(S[0].tz, S[0].tx); world.add(sl);
  // walls
  const wallMat = lam(0xffffff, { map: barrierTex }); barrierTex.repeat.set(1, 1);
  for (const side of [1, -1]) {
    const o = side * (W / 2 + R + .2), Pp = [], U2 = [], I2 = [];
    for (let i = 0; i <= N; i++) { const s = S[i % N], dd = i === N ? T.len : s.d; Pp.push(s.x + s.nx * o, s.y - .3, s.z + s.nz * o, s.x + s.nx * o, s.y + 1.1, s.z + s.nz * o); U2.push(dd / 16, 0, dd / 16, 1); }
    for (let i = 0; i < N; i++) { const k = i * 2; I2.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(Pp, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U2, 2)); g.setIndex(I2); g.computeVertexNormals();
    world.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: barrierTex, side: THREE.DoubleSide })));
  }
  // embankments under raised track, pillars under bridges
  for (let i = 0; i < N; i += 1) { const s = S[i]; const h = s.y - T.minY; if (h > 2.5 && i % 8 === 0) { const p = new THREE.Mesh(BOX, lam(0x9a9aa2)); p.scale.set(2, h, 2); p.position.set(s.x, T.minY + h / 2 - .4, s.z); world.add(p); } }
  if (!city.eight) for (const side of [1, -1]) { const o = side * (W / 2 + R), Pp = [], I2 = []; for (let i = 0; i <= N; i++) { const s = S[i % N]; Pp.push(s.x + s.nx * o, s.y - .05, s.z + s.nz * o, s.x + s.nx * (o + side * 6), T.minY - .4, s.z + s.nz * (o + side * 6)); } for (let i = 0; i < N; i++) { const k = i * 2; I2.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(Pp, 3)); g.setIndex(I2); g.computeVertexNormals(); world.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: city.ground, side: THREE.DoubleSide }))); }
  // tunnel
  if (city.tunnel) { const a = Math.floor(city.tunnel[0] * N), b = Math.floor(city.tunnel[1] * N), m = lam(0x8a8a90), lightM = new THREE.MeshBasicMaterial({ color: 0xfff2c0 });
    for (let i = a; i < b; i += 2) { const s = S[i], ang = -Math.atan2(s.tz, s.tx); const roof = new THREE.Mesh(BOX, m); roof.scale.set(5.2, 1.2, W + 2 * R + 2); roof.position.set(s.x, s.y + 7, s.z); roof.rotation.y = ang; world.add(roof);
      if (i % 8 === 0) { const l = new THREE.Mesh(BOX, lightM); l.scale.set(1.2, .2, 4); l.position.set(s.x, s.y + 6.35, s.z); l.rotation.y = ang; world.add(l); } } T.tunnel = [a, b]; }
  scenery(city);
  setSky(city);
  T.mapPts = S.filter((_, i) => i % 4 === 0).map(s => [s.x, s.z]);
}
function nearTrack(x, z, pad) { const S = T.S; for (let i = 0; i < T.N; i += 3) { const s = S[i]; if (Math.abs(s.x - x) < pad + 10 && Math.abs(s.z - z) < pad + 10 && Math.hypot(s.x - x, s.z - z) < pad) return true; } return false; }
const inWater = (x, z, pad) => (T.city.water || []).some(w => w.r ? Math.hypot(x - w.x, z - w.z) < w.r + pad : Math.abs(x - w.x) < w.w / 2 + pad && Math.abs(z - w.z) < w.d / 2 + pad);
function scenery(city) {
  const R = rng(city.name.length * 977), S = T.S, keep = W / 2 + T.R + 5, dummy = new THREE.Object3D(), col = new THREE.Color();
  const bounds = { x0: Math.min(...S.map(s => s.x)) - 160, x1: Math.max(...S.map(s => s.x)) + 160, z0: Math.min(...S.map(s => s.z)) - 160, z1: Math.max(...S.map(s => s.z)) + 160 };
  const spot = (pad, waterOk) => { for (let k = 0; k < 60; k++) { const x = lerp(bounds.x0, bounds.x1, R()), z = lerp(bounds.z0, bounds.z1, R()); if (nearTrack(x, z, keep + pad)) continue; if (!waterOk && inWater(x, z, pad)) continue; return [x, z]; } return null; };
  const groundY = T.minY - .4;
  // buildings (instanced)
  const nB = { harbour: 140, city: 220, neon: 170, island: 20, park: 50, forest: 0, suzuka: 30, hills: 160 }[city.scene] || 40;
  if (nB) {
    const wt = windowTex(city.night); const mat = new THREE.MeshLambertMaterial({ map: wt, emissive: city.night ? 0xffffff : 0x000000, emissiveMap: city.night ? wt : null, emissiveIntensity: city.night ? .9 : 0 });
    const im = new THREE.InstancedMesh(BOX, mat, nB); let n = 0;
    for (let i = 0; i < nB; i++) { const small = city.scene === 'hills', w = small ? 6 + R() * 6 : 12 + R() * 22, h = small ? 5 + R() * 6 : city.scene === 'neon' || city.scene === 'city' ? 25 + R() * 110 : 12 + R() * 45, p = spot(w * .7); if (!p) continue;
      dummy.position.set(p[0], groundY + h / 2, p[1]); dummy.rotation.set(0, R() * TAU, 0); dummy.scale.set(w, h, w * (.6 + R() * .8)); dummy.updateMatrix(); im.setMatrixAt(n, dummy.matrix);
      im.setColorAt(n++, col.setHex(small ? [0xff6a5a, 0xffd34d, 0x5ad8ff, 0x8fe36a, 0xff9fd0, 0xf4f4f4][i % 6] : city.night ? 0xffffff : [0xf4efe6, 0xe8dcc8, 0xd8e0ea, 0xffffff, 0xf0d8c0][i % 5])); }
    im.count = n; im.castShadow = false; world.add(im);
  }
  // neon signs and the giant glowing ball in Las Vegas
  if (city.scene === 'neon') { for (let i = 0; i < 40; i++) { const p = spot(4); if (!p) continue; const m = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: [0xff3aa0, 0x3ad0ff, 0xffd34d, 0x7aff6a, 0xa06aff][i % 5] })); m.scale.set(8 + R() * 10, 2 + R() * 3, .6); m.position.set(p[0], groundY + 10 + R() * 30, p[1]); m.rotation.y = R() * TAU; world.add(m); }
    const p = spot(40); if (p) { const ball = new THREE.Mesh(new THREE.SphereGeometry(32, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffb030 })); ball.position.set(p[0], groundY + 32, p[1]); world.add(ball); T.ball = ball; } }
  // trees
  const nT = { park: 260, island: 220, forest: 520, suzuka: 260, hills: 120, harbour: 40, city: 60, neon: 20 }[city.scene] || 100;
  { const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.35, .5, 1, 6), lam(0x6a4a2a), nT), top = new THREE.InstancedMesh(city.scene === 'forest' || city.scene === 'island' ? new THREE.ConeGeometry(1, 1, 7) : new THREE.IcosahedronGeometry(1, 1), lam(0xffffff, { flatShading: true }), nT); let n = 0;
    for (let i = 0; i < nT; i++) { const p = spot(3); if (!p) continue; const h = 4 + R() * 6, r = 2 + R() * 2.2;
      dummy.rotation.set(0, 0, 0); dummy.position.set(p[0], groundY + h * .3, p[1]); dummy.scale.set(1, h * .6, 1); dummy.updateMatrix(); trunk.setMatrixAt(n, dummy.matrix);
      dummy.position.set(p[0], groundY + h * .75, p[1]); dummy.scale.set(r, h * .7, r); dummy.updateMatrix(); top.setMatrixAt(n, dummy.matrix); top.setColorAt(n++, col.setHex(city.night ? 0x1f4a2a : [0x2f8a34, 0x3a9a3a, 0x2a7a4a, 0x4aa040][i % 4])); }
    trunk.count = top.count = n; trunk.castShadow = top.castShadow = true; world.add(trunk); world.add(top); }
  // yachts in the harbour
  if (city.scene === 'harbour') for (let i = 0; i < 26; i++) { const x = -300 + R() * 600, z = 70 + R() * 120; if (nearTrack(x, z, keep + 8)) continue; const g = new THREE.Group(); const hull = new THREE.Mesh(BOX, lam(0xffffff)); hull.scale.set(14 + R() * 16, 2.4, 5); hull.position.y = 1; g.add(hull); const cab = new THREE.Mesh(BOX, lam(0x1d2a4a)); cab.scale.set(7, 2, 3.6); cab.position.set(-1, 3, 0); g.add(cab); g.position.set(x, groundY + .2, z); g.rotation.y = R() * .6 - .3; world.add(g); }
  // grandstands along the start straight
  { const s0 = S[Math.floor(T.N * .02)], ang = -Math.atan2(s0.tz, s0.tx); for (const side of [1, -1]) { const g = new THREE.Group(), o = side * (W / 2 + T.R + 9); const st = new THREE.Mesh(BOX, lam(0xffffff, { map: crowdTex })); st.scale.set(90, 9, 10); st.position.y = 4.5; st.rotation.x = side * .35; g.add(st); const roof = new THREE.Mesh(BOX, lam(0xd8dce4)); roof.scale.set(92, .5, 12); roof.position.set(0, 11, side * 2); g.add(roof); g.position.set(s0.x + s0.nx * o + s0.tx * 40, s0.y - .4, s0.z + s0.nz * o + s0.tz * 40); g.rotation.y = ang; world.add(g); } }
  // big wheel (Suzuka and Singapore)
  if (city.scene === 'suzuka' || city.scene === 'city') { const p = spot(40, false); if (p) { const g = new THREE.Group(); const rim = new THREE.Mesh(new THREE.TorusGeometry(26, .8, 8, 48), new THREE.MeshLambertMaterial({ color: 0xf4f4f4, emissive: city.night ? 0x5ad8ff : 0 })); g.add(rim); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, sp = new THREE.Mesh(BOX, lam(0xd8d8d8)); sp.scale.set(26, .3, .3); sp.position.set(Math.cos(a) * 13, Math.sin(a) * 13, 0); sp.rotation.z = a; g.add(sp); const cab = new THREE.Mesh(BOX, lam([0xe10600, 0xffd34d, 0x1f5fd0, 0x1aa850][i % 4])); cab.scale.set(2.4, 2.4, 2.4); cab.position.set(Math.cos(a) * 26, Math.sin(a) * 26, 0); g.add(cab); } g.position.set(p[0], groundY + 30, p[1]); world.add(g); T.wheel = g; } }
  // street lights at night
  if (city.night) { const bulb = new THREE.MeshBasicMaterial({ color: 0xfff0c0 }), pole = lam(0x60646e); for (let i = 0; i < T.N; i += 16) { const s = S[i]; for (const side of [1, -1]) { if ((i / 16 + (side > 0 ? 0 : 1)) % 2) continue; const o = side * (W / 2 + T.R - 1); const p = new THREE.Mesh(BOX, pole); p.scale.set(.25, 9, .25); p.position.set(s.x + s.nx * o, s.y + 4.5, s.z + s.nz * o); world.add(p); const b = new THREE.Mesh(new THREE.SphereGeometry(.6, 8, 6), bulb); b.position.set(s.x + s.nx * (o - side * 1.5), s.y + 9, s.z + s.nz * (o - side * 1.5)); world.add(b); } } }
}
const skyGroup = new THREE.Group(); scene.add(skyGroup);
const stars = (() => { const p = [], R = rng(9); for (let i = 0; i < 1200; i++) { const u = R() * .95 + .05, a = R() * TAU, r = 1500; p.push(Math.sqrt(1 - u * u) * Math.cos(a) * r, u * r, Math.sqrt(1 - u * u) * Math.sin(a) * r); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })); })();
const skyDome = (() => { const g = new THREE.SphereGeometry(1800, 24, 12); g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3)); return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })); })();
const clouds = new THREE.Group(); { const R = rng(4), m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, fog: false }); for (let i = 0; i < 24; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), m); b.scale.set(40 + R() * 40, 14 + R() * 8, 30); b.position.set(k * 45, R() * 8, R() * 20); g.add(b); } const a = R() * TAU, r = 900 + R() * 500; g.position.set(Math.cos(a) * r, 220 + R() * 200, Math.sin(a) * r); g.lookAt(0, g.position.y, 0); clouds.add(g); } }
function setSky(city) {
  skyGroup.clear(); const p = skyDome.geometry.attributes.position, c = skyDome.geometry.attributes.color, top = new THREE.Color(city.sky), hor = new THREE.Color(city.fog), t = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 1800; t.copy(hor).lerp(top, clamp(y * 2.2, 0, 1)); c.setXYZ(i, t.r, t.g, t.b); } c.needsUpdate = true; skyDome.renderOrder = -10; skyGroup.add(skyDome);
  if (city.night) { skyGroup.add(stars); scene.fog = new THREE.Fog(city.fog, 200, 1400); hemi.intensity = .75; hemi.color.set(0x9fb0ff); hemi.groundColor.set(0x403040); sun.intensity = .35; sun.color.set(0xb0c0ff); }
  else { skyGroup.add(clouds); scene.fog = new THREE.Fog(city.fog, 250, 1600); hemi.intensity = 1.0; hemi.color.set(0xffffff); hemi.groundColor.set(0x445533); sun.intensity = 1.1; sun.color.set(0xfff2dc); }
  scene.background = new THREE.Color(city.fog);
}

/* ================================================================
   Cars
   ================================================================ */
function carModel(team, num) {
  const g = new THREE.Group(), body = lam(team.c), acc = lam(team.a), black = lam(0x15161a), carbon = lam(0x2a2c32);
  const part = (geo, mat, x, y, z, sx, sy, sz, ry) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); if (ry) m.rotation.y = ry; m.castShadow = true; g.add(m); return m; };
  part(BOX, body, .2, .42, 0, 3.4, .42, .9);                       // tub
  part(BOX, body, 2.3, .34, 0, 1.6, .24, .42);                      // nose
  part(BOX, acc, 1.1, .5, 0, .9, .2, .55);                          // nose stripe
  part(BOX, carbon, 3.05, .14, 0, .55, .06, 1.95);                  // front wing
  part(BOX, acc, 3.05, .2, .96, .55, .22, .05); part(BOX, acc, 3.05, .2, -.96, .55, .22, .05);
  part(BOX, body, -.2, .45, .62, 1.9, .42, .42); part(BOX, body, -.2, .45, -.62, 1.9, .42, .42);   // sidepods
  part(BOX, body, -.9, .72, 0, 1.6, .5, .55);                       // engine cover
  part(BOX, body, -.2, .95, 0, .5, .3, .3);                         // air box
  part(BOX, carbon, -2.05, 1.05, 0, .5, .08, 1.15); part(BOX, acc, -2.05, .95, 0, .48, .08, 1.15);   // rear wing
  part(BOX, carbon, -2.05, .8, .55, .4, .55, .05); part(BOX, carbon, -2.05, .8, -.55, .4, .55, .05);
  part(BOX, carbon, -1.9, .2, 0, .6, .16, .9);                      // diffuser
  const helmet = part(new THREE.SphereGeometry(.2, 14, 10), acc, .45, .82, 0); void helmet;
  part(BOX, lam(0x111111), .6, .82, 0, .05, .09, .3);               // visor
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.32, .04, 6, 16, Math.PI), carbon); halo.rotation.set(Math.PI / 2, 0, Math.PI / 2); halo.position.set(.55, .98, 0); g.add(halo);
  part(BOX, carbon, .87, .9, 0, .05, .2, .05);
  // number on the nose
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.font = 'italic 900 40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(num), 32, 34);
  const nt = new THREE.CanvasTexture(cv); const numM = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: nt, transparent: true })); numM.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); numM.position.set(1.9, .47, 0); g.add(numM);
  // wheels
  const wheelGeo = new THREE.CylinderGeometry(.36, .36, .4, 18); wheelGeo.rotateX(Math.PI / 2);
  const rimM = lam(0x9aa0aa), wheels = [], fronts = [];
  for (const [x, z, front] of [[1.75, .92, 1], [1.75, -.92, 1], [-1.55, .9, 0], [-1.55, -.9, 0]]) {
    const pivot = new THREE.Group(); pivot.position.set(x, .36, z); g.add(pivot);
    const w = new THREE.Mesh(wheelGeo, black); w.castShadow = true; pivot.add(w); const rim = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .42, 10).rotateX(Math.PI / 2), rimM); w.add(rim);
    const mark = new THREE.Mesh(BOX, acc); mark.scale.set(.05, .3, .43); w.add(mark);
    wheels.push(w); if (front) fronts.push(pivot);
  }
  // boost flame and brake light
  const flame = new THREE.Mesh(new THREE.ConeGeometry(.16, .9, 10), new THREE.MeshBasicMaterial({ color: 0x5ad8ff, transparent: true, opacity: .85 })); flame.rotation.z = Math.PI / 2; flame.position.set(-2.6, .5, 0); flame.visible = false; g.add(flame);
  const brake = new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0x400000 })); brake.scale.set(.05, .12, .3); brake.position.set(-2.32, .62, 0); g.add(brake);
  return { g, wheels, fronts, flame, brake };
}

/* ================================================================
   Race state
   ================================================================ */
const G = { mode: 'title', t: 0, cars: [], me: null, laps: 3, diff: 'easy', auto: true, cityI: 0, team: 0, name: 'CHANCE', tour: null, cam: 0, raceT: 0, lightsT: 0, finished: 0 };
try { const s = JSON.parse(localStorage.getItem('turbogp_v1') || '{}'); Object.assign(G, { name: s.name || G.name, team: s.team || 0, laps: s.laps || 3, diff: s.diff || 'easy', auto: s.auto != null ? s.auto : true, tour: s.tour || null, done: s.done || {} }); } catch (e) { G.done = {}; }
const save = () => { try { localStorage.setItem('turbogp_v1', JSON.stringify({ name: G.name, team: G.team, laps: G.laps, diff: G.diff, auto: G.auto, tour: G.tour, done: G.done })); } catch (e) {} };
const input = { l: false, r: false, gas: false, brake: false, boost: false, keys: {} };
function findIdx(car, wide) {   // nearest track sample, searched near the last one (so bridges and figure-eights work)
  const S = T.S, N = T.N; let best = car.idx, bd = 1e9; const span = wide ? N : 40;
  for (let k = -span; k <= span; k++) { const i = ((car.idx + k) % N + N) % N, s = S[i], d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2 + (wide ? 0 : ((s.y - car.y) ** 2) * 4); if (d < bd) { bd = d; best = i; } if (wide && k > N / 2) break; }
  return best;
}
function startRace() {
  const city = CITIES[G.cityI]; buildTrack(city);
  for (const c of G.cars) scene.remove(c.m.g); G.cars = [];
  const names = RIVALS.slice().sort(() => Math.random() - .5), myGrid = { easy: 5, medium: 7, hard: 9 }[G.diff];
  const teamOrder = TEAMS.map((t, i) => i).filter(i => i !== G.team);
  const D = DIFF[G.diff];
  for (let g = 0; g < 10; g++) {
    const isMe = g === myGrid, teamI = isMe ? G.team : teamOrder[(g < myGrid ? g : g - 1) % teamOrder.length], team = TEAMS[teamI];
    const back = 10 + g * 9, idx = ((-Math.round(back / 2.5)) % T.N + T.N) % T.N, s = T.S[idx], lat = (g % 2 ? -1 : 1) * 3.2;
    const m = carModel(team, isMe ? 7 : 10 + g); scene.add(m.g);
    const skill = isMe ? 1 : clamp(1 - (9 - g) * .012 + (Math.random() - .5) * .03, .85, 1.04);
    G.cars.push({ me: isMe, name: isMe ? G.name : names[g % names.length], team, m, x: s.x + s.nx * lat, z: s.z + s.nz * lat, y: s.y, h: Math.atan2(s.tz, s.tx), v: 0, steer: 0, idx, lap: 0, cp: true, prog: 0, finish: 0, best: 0, lapStart: 0, boost: .5, boosting: false, spin: 0, lat: 0, skill, vmax: isMe ? 80 : D.vmax * skill, grip: isMe ? 1 : D.grip * skill, lineK: D.line, laneOff: (Math.random() - .5) * 3, wrongT: 0, slide: 0, finishPos: 0 });
  }
  G.me = G.cars.find(c => c.me);
  for (const c of G.cars) { c.idx = findIdx(c, true); c.prog = -(T.S[0].d === 0 ? (T.len - T.S[c.idx].d) : 0); }
  G.raceT = 0; G.finished = 0; G.mode = 'lights'; G.lightsT = 0; G.camInit = false;
  show(null); $('hud').classList.remove('hide'); $('touch').classList.remove('hide'); $('lights').classList.remove('hide'); $('lights').querySelectorAll('span').forEach(s => s.classList.remove('on'));
  $('bGas').style.display = G.auto ? 'none' : ''; $('bBrake').style.right = G.auto ? 'calc(max(14px, env(safe-area-inset-right)) + 0px)' : '';
  if (G.auto) $('bBoost').style.right = 'calc(max(14px, env(safe-area-inset-right)) + 104px)'; else $('bBoost').style.right = '';
  engineOn(true);
}
// physics for every car
function stepCar(c, dt) {
  const S = T.S, N = T.N;
  c.idx = findIdx(c); const s = S[c.idx];
  const dx = c.x - s.x, dz = c.z - s.z, along = dx * s.tx + dz * s.tz; c.lat = dx * s.nx + dz * s.nz;
  // height follows the road (smoothly between samples)
  const s2 = S[(c.idx + (along >= 0 ? 1 : N - 1)) % N]; c.y = lerp(s.y, s2.y, clamp(Math.abs(along) / 2.5, 0, 1));
  // controls
  let thr = 0, brk = 0, st = 0, boost = false;
  if (G.mode === 'lights' || G.mode === 'paused' || c.finish) { thr = c.finish ? .25 : 0; brk = c.finish ? 0 : 1; }
  else if (c.me && !G.autopilot) {
    const k = input.keys; const L = input.l || k.ArrowLeft || k.KeyA, Rr = input.r || k.ArrowRight || k.KeyD;
    st = (Rr ? 1 : 0) - (L ? 1 : 0); brk = input.brake || k.ArrowDown || k.KeyS ? 1 : 0; thr = brk ? 0 : (G.auto || input.gas || k.ArrowUp || k.KeyW ? 1 : 0); boost = input.boost || k.Space;
    if (G.diff === 'easy' && !st) { const ahead = S[(c.idx + 8) % N]; const want = Math.atan2(ahead.z + ahead.nz * clamp(c.lat, -3, 3) - c.z, ahead.x + ahead.nx * clamp(c.lat, -3, 3) - c.x); st = clamp(wrapA(want - c.h) * .9, -.35, .35); }   // gentle steering help on Easy
  } else {
    // computer driver: follow the racing line, slow for corners, go round slower cars
    const look = 6 + Math.floor(c.v * .22), a = S[(c.idx + look) % N];
    const sideOfBend = Math.sign(a.ks || 0) * (W / 2 - 2) * c.lineK * Math.min(1, Math.abs(a.ks) * 60);
    let off = sideOfBend + c.laneOff;
    for (const o of G.cars) { if (o === c) continue; const ddx = o.x - c.x, ddz = o.z - c.z, fwd = ddx * Math.cos(c.h) + ddz * Math.sin(c.h), side = ddx * Math.cos(c.h + Math.PI / 2) + ddz * Math.sin(c.h + Math.PI / 2); if (fwd > 0 && fwd < 18 && Math.abs(side) < 3 && o.v < c.v + 2) off += side > 0 ? 3.5 : -3.5; }
    off = clamp(off, -W / 2 + 1.5, W / 2 - 1.5);
    const tx = a.x + a.nx * off, tz = a.z + a.nz * off, want = Math.atan2(tz - c.z, tx - c.x);
    st = clamp(wrapA(want - c.h) * 2.4, -1, 1);
    const corner = Math.max(a.ka, S[c.idx].ka), vTarget = Math.min(c.vmax, Math.sqrt((26 * c.grip) / Math.max(corner, .0008)));
    // on Easy the field waits for you if you fall far behind
    let vt = vTarget; if (G.diff === 'easy' && c.prog - G.me.prog > 120) vt *= .85;
    thr = c.v < vt ? 1 : 0; brk = c.v > vt + 3 ? 1 : 0;
    boost = c.boost > .6 && corner < .004 && Math.random() < .02 || (c.boosting && c.boost > .1 && corner < .004);
  }
  // boost
  c.boosting = boost && c.boost > .02 && thr > 0; if (c.boosting) c.boost = Math.max(0, c.boost - dt * .3); else c.boost = Math.min(1, c.boost + dt * (c.me ? .05 : .04));
  // engine and brakes
  const offTrack = Math.abs(c.lat) > W / 2 + .4, grass = offTrack && !T.city.street, vmax = (c.vmax + (c.boosting ? 13 : 0)) * (grass ? .45 : 1);
  const accel = (c.boosting ? 20 : 13) * (1 - c.v / Math.max(vmax, 1));
  c.v += (thr * accel - brk * 30 - (thr ? 0 : 2.5) - (grass ? 12 : 0) * (c.v > vmax ? 1 : 0)) * dt;
  if (c.v > vmax) c.v = Math.max(vmax, c.v - 25 * dt);
  c.v = Math.max(0, c.v);
  // steering with a grip limit: ask for too much and the car slides wide
  const maxSteer = .5 / (1 + c.v / 22); c.steer = lerp(c.steer, st * maxSteer, Math.min(1, dt * (c.me ? 8 : 6)));
  let yaw = c.v * Math.tan(c.steer) / 3.6; const grip = (grass ? 9 : 27) * c.grip * (c.me && G.diff === 'easy' ? 1.15 : 1), latAcc = Math.abs(yaw * c.v);
  c.slide = latAcc > grip ? Math.min(1, (latAcc - grip) / grip) : 0; if (latAcc > grip) yaw *= grip / latAcc;
  c.h = wrapA(c.h + yaw * dt);
  c.x += Math.cos(c.h) * c.v * dt; c.z += Math.sin(c.h) * c.v * dt;
  // walls
  const lim = W / 2 + T.R - .9; const s3 = S[findIdx(c)], lat2 = (c.x - s3.x) * s3.nx + (c.z - s3.z) * s3.nz;
  if (Math.abs(lat2) > lim) { const sg = Math.sign(lat2); c.x -= s3.nx * (Math.abs(lat2) - lim) * sg; c.z -= s3.nz * (Math.abs(lat2) - lim) * sg; const trackH = Math.atan2(s3.tz, s3.tx); c.h = wrapA(c.h + wrapA(trackH - c.h) * .55); const hit = c.v; c.v *= .62; if (c.me && hit > 12) { sfx.bump(Math.min(1, hit / 60)); G.shake = Math.min(.6, hit / 80); } }
  // laps
  const ni = findIdx(c); if (c.idx > N * .4 && c.idx < N * .6) c.cp = true;
  if (c.lastIdx != null && c.lastIdx > N * .8 && ni < N * .2) { if (c.cp) { c.cp = false; c.lap++; const lt = G.raceT - c.lapStart; if (c.lap > 1 && (!c.best || lt < c.best)) c.best = lt; c.lapStart = G.raceT; if (c.lap > G.laps && !c.finish) { c.finish = G.raceT; G.finished++; c.finishPos = G.finished; if (c.me) finishMe(); } else if (c.me && c.lap > 1) { msg(c.lap === G.laps ? 'FINAL LAP!' : 'LAP ' + c.lap, fmt(lt) + (lt === c.best ? ' · best lap!' : '')); } } }
  if (c.lastIdx != null && c.lastIdx < N * .2 && ni > N * .8 && c.lap > 0 && !c.cp) { c.lap--; c.cp = true; }
  c.lastIdx = ni; c.idx = ni;
  c.prog = (c.lap - 1) * T.len + S[ni].d;
  if (c.me) { const fwd = Math.cos(c.h) * S[ni].tx + Math.sin(c.h) * S[ni].tz; c.wrongT = fwd < -.3 && c.v > 3 ? c.wrongT + dt : 0; }
}
function collide() {
  const C = G.cars;
  for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {
    const a = C[i], b = C[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
    if (d < 2.1 && d > .001 && Math.abs(a.y - b.y) < 2) { const push = (2.1 - d) / 2, ux = dx / d, uz = dz / d; a.x -= ux * push; a.z -= uz * push; b.x += ux * push; b.z += uz * push;
      const rear = (dx * Math.cos(a.h) + dz * Math.sin(a.h)) > 0 ? a : b; rear.v *= .97; if ((a.me || b.me) && Math.abs(a.v - b.v) > 4) sfx.bump(.3); }
  }
}
function finishMe() {
  G.mode = 'done'; G.doneT = 0; const p = G.me.finishPos;
  msg(p === 1 ? 'YOU WIN!' : 'FINISHED P' + p, p <= 3 ? 'On the podium!' : 'Great race!'); sfx.cheer();
  if (p === 1) confetti();
}
function standings() { return G.cars.slice().sort((a, b) => (a.finish && b.finish) ? a.finish - b.finish : a.finish ? -1 : b.finish ? 1 : b.prog - a.prog); }
function showResults() {
  engineOn(false); G.mode = 'results'; $('hud').classList.add('hide'); $('touch').classList.add('hide');
  // anyone still driving gets a time from their gap
  const order = standings(), win = order[0].finish || G.raceT;
  order.forEach((c, i) => { if (!c.finish) c.finishEst = win + (order[0].prog - c.prog) / 60 + i * .3; });
  const city = CITIES[G.cityI], myPos = order.indexOf(G.me) + 1;
  G.done[city.id] = Math.min(G.done[city.id] || 99, myPos);
  $('resTitle').textContent = city.flag + ' ' + city.name + (myPos === 1 ? ': YOU WIN!' : ': P' + myPos);
  $('resSub').textContent = G.laps + ' laps · ' + G.diff[0].toUpperCase() + G.diff.slice(1) + ' rivals' + (G.me.best ? ' · your best lap ' + fmt(G.me.best) : '');
  let h = '<tr><th>POS</th><th>DRIVER</th><th>TEAM</th><th style="text-align:right">TIME</th>' + (G.tour ? '<th style="text-align:right">PTS</th>' : '') + '</tr>';
  order.forEach((c, i) => { const t = c.finish || c.finishEst; h += '<tr class="' + (c.me ? 'me' : '') + '"><td>' + (i + 1) + '</td><td><b>' + c.name + '</b></td><td style="color:#' + new THREE.Color(c.team.c === 0x222630 ? c.team.a : c.team.c).getHexString() + '">' + c.team.name + '</td><td class="n">' + (i === 0 ? fmt(t) : '+' + (t - win).toFixed(1) + 's') + '</td>' + (G.tour ? '<td class="n">' + (POINTS[i] || 0) + '</td>' : '') + '</tr>'; });
  $('resTable').innerHTML = h;
  let st = '';
  if (G.tour) {
    order.forEach((c, i) => { G.tour.pts[c.name] = (G.tour.pts[c.name] || 0) + (POINTS[i] || 0); G.tour.teams[c.name] = c.team.name; });
    G.tour.round++; const table = Object.entries(G.tour.pts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    st = '<h3 style="margin-top:14px">World Tour standings after ' + G.tour.round + ' of 8</h3><table>' + table.map(([n, p], i) => '<tr class="' + (n === G.name ? 'me' : '') + '"><td>' + (i + 1) + '</td><td><b>' + n + '</b></td><td class="n">' + p + '</td></tr>').join('') + '</table>';
    if (G.tour.round >= 8) { const champ = table[0][0]; st = '<h3 style="margin-top:14px;color:var(--gold)">' + (champ === G.name ? '🏆 YOU ARE THE WORLD CHAMPION!' : 'World Tour champion: ' + champ) + '</h3>' + st; if (champ === G.name) confetti(); }
  }
  $('standings').innerHTML = st;
  $('resNext').classList.toggle('hide', !G.tour || G.tour.round >= 8); $('resAgain').classList.toggle('hide', !!(G.tour && G.tour.round < 8));
  if (G.tour && G.tour.round >= 8) G.tour = null;
  save(); show('results');
}
const fmt = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };

/* ================================================================
   Sound: engine note that climbs through the gears, bumps, crowd
   ================================================================ */
let AC = null, eng = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } else if (AC.state === 'suspended') AC.resume(); }
function engineOn(on) {
  if (!AC) return;
  if (on && !eng) { const o = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 1400; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(AC.destination); o.start(); o2.start(); eng = { o, o2, f, g }; }
  if (!on && eng) { eng.g.gain.setTargetAtTime(0, AC.currentTime, .1); const e = eng; setTimeout(() => { try { e.o.stop(); e.o2.stop(); } catch (x) {} }, 400); eng = null; }
}
function noise(d, v, f) { if (!AC) return; const b = AC.createBuffer(1, Math.ceil(AC.sampleRate * d), AC.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length); const s = AC.createBufferSource(); s.buffer = b; const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f; const g = AC.createGain(); g.gain.value = v; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(); }
function beep(f, d, v) { if (!AC) return; const o = AC.createOscillator(), g = AC.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(v || .06, AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d + .02); }
const sfx = { bump: v => noise(.2, .25 * v + .05, 500), cheer: () => { for (let i = 0; i < 5; i++) setTimeout(() => noise(.8, .12, 1200), i * 120); }, light: () => beep(440, .25, .07), go: () => beep(880, .5, .09) };

/* ================================================================
   HUD, minimap, messages
   ================================================================ */
let msgT = null;
function msg(a, b) { const el = $('msg'); el.innerHTML = a + (b ? '<small>' + b + '</small>' : ''); el.style.opacity = 1; clearTimeout(msgT); msgT = setTimeout(() => el.style.opacity = 0, 2000); }
const mapC = $('map').getContext('2d');
function drawMap() {
  const pts = T.mapPts; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const s = 260 / Math.max(x1 - x0, z1 - z0), ox = 150 - (x0 + x1) / 2 * s, oz = 150 - (z0 + z1) / 2 * s;
  mapC.clearRect(0, 0, 300, 300); mapC.lineWidth = 12; mapC.strokeStyle = 'rgba(255,255,255,.85)'; mapC.lineJoin = 'round'; mapC.beginPath(); pts.forEach(([x, z], i) => i ? mapC.lineTo(ox + x * s, oz + z * s) : mapC.moveTo(ox + x * s, oz + z * s)); mapC.closePath(); mapC.stroke();
  mapC.fillStyle = '#111'; mapC.fillRect(ox + pts[0][0] * s - 6, oz + pts[0][1] * s - 6, 12, 12);
  for (const c of G.cars) { mapC.fillStyle = '#' + new THREE.Color(c.team.c).getHexString(); mapC.beginPath(); mapC.arc(ox + c.x * s, oz + c.z * s, c.me ? 11 : 7, 0, TAU); mapC.fill(); if (c.me) { mapC.lineWidth = 4; mapC.strokeStyle = '#ffd34d'; mapC.stroke(); } }
}
function updateHud() {
  const me = G.me, order = standings(), pos = order.indexOf(me) + 1;
  $('pos').innerHTML = 'P' + pos + '<small>/10</small>';
  $('lap').textContent = 'LAP ' + clamp(me.lap, 1, G.laps) + '/' + G.laps;
  $('times').innerHTML = 'Time ' + fmt(Math.max(0, G.raceT - me.lapStart)) + (me.best ? '<br>Best ' + fmt(me.best) : '');
  $('spd').innerHTML = Math.round(me.v * 3.6 * 1.1) + '<small> km/h</small>';
  const gear = me.v < .5 ? 'N' : Math.min(8, 1 + Math.floor(me.v / 11)); $('gear').textContent = 'GEAR ' + gear + (me.boosting ? ' · BOOST!' : '');
  $('boostFill').style.width = (me.boost * 100) + '%';
  $('wrong').classList.toggle('hide', me.wrongT < 1.2);
  if ((G.hudT = (G.hudT || 0) + 1) % 10 === 0) { const leader = order[0]; $('board').innerHTML = order.map((c, i) => '<div class="' + (c.me ? 'me' : '') + '"><span>' + (i + 1) + '</span><i style="background:#' + new THREE.Color(c.team.c).getHexString() + '"></i>' + c.name.split(' ')[0] + '<span class="gap">' + (i === 0 ? 'LEADER' : '+' + ((leader.prog - c.prog) / Math.max(30, leader.v)).toFixed(1)) + '</span></div>').join(''); }
  drawMap();
  if (eng) { const v = me.v, gr = Math.min(7, Math.floor(v / 11)), rpm = (v - gr * 11) / 11; eng.o.frequency.setTargetAtTime(70 + gr * 6 + rpm * 120 + (me.boosting ? 30 : 0), AC.currentTime, .05); eng.o2.frequency.setTargetAtTime((70 + gr * 6 + rpm * 120) * .5, AC.currentTime, .05); eng.g.gain.setTargetAtTime(G.mode === 'race' || G.mode === 'done' ? .045 + .03 * (v / 80) : .02, AC.currentTime, .1); }
}
function confetti() { const cols = ['#e10600', '#ffd34d', '#fff', '#5ad8ff', '#1aa850']; for (let i = 0; i < 80; i++) { const d = document.createElement('div'); d.className = 'confetti'; d.style.left = Math.random() * 100 + 'vw'; d.style.background = cols[i % 5]; d.style.animationDuration = 1.8 + Math.random() * 1.8 + 's'; document.body.appendChild(d); setTimeout(() => d.remove(), 4200); } }

/* ================================================================
   Input
   ================================================================ */
const hold = (id, key) => { const el = $(id); el.addEventListener('pointerdown', e => { e.preventDefault(); audio(); el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (x) {} input[key] = true; }); const off = () => { el.classList.remove('on'); input[key] = false; }; ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => el.addEventListener(ev, off)); };
hold('bL', 'l'); hold('bR', 'r'); hold('bGas', 'gas'); hold('bBrake', 'brake'); hold('bBoost', 'boost');
$('bCam').onclick = () => { G.cam = (G.cam + 1) % 3; }; $('bPause').onclick = () => pause(true);
addEventListener('keydown', e => { audio(); input.keys[e.code] = true; if (e.code === 'KeyC') G.cam = (G.cam + 1) % 3; if (e.code === 'KeyP' || e.code === 'Escape') pause(G.mode !== 'paused'); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
addEventListener('keyup', e => { input.keys[e.code] = false; });

/* ================================================================
   Screens
   ================================================================ */
const SCREENS = ['title', 'help', 'pick', 'setup', 'pause', 'results'];
function show(id) { for (const s of SCREENS) $(s).classList.toggle('hide', s !== id); }
function pause(on) { if (on && ['race', 'lights', 'done'].includes(G.mode)) { G.prev = G.mode; G.mode = 'paused'; engineOn(false); show('pause'); } else if (!on && G.mode === 'paused') { G.mode = G.prev; show(null); engineOn(true); } }
function cityThumb(cv, city) { const c = cv.getContext('2d'), w = cv.width = 240, h = cv.height = 120; const P = city.pts; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of P) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); } const s = Math.min((w - 30) / (x1 - x0), (h - 24) / (z1 - z0));
  const curve = new THREE.CatmullRomCurve3(P.map(p => new THREE.Vector3(p[0], 0, p[1])), true, 'centripetal'), pts = curve.getSpacedPoints(120);
  c.lineWidth = 5; c.lineJoin = 'round'; c.strokeStyle = city.night ? '#ffd34d' : '#fff'; c.beginPath(); pts.forEach((p, i) => { const x = w / 2 + (p.x - (x0 + x1) / 2) * s, y = h / 2 + (p.z - (z0 + z1) / 2) * s; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.stroke(); }
function buildPick() {
  const box = $('cities'); box.innerHTML = '';
  CITIES.forEach((city, i) => { const b = document.createElement('button'); b.className = 'city' + (G.done[city.id] === 1 ? ' done' : ''); const cv = document.createElement('canvas'); b.appendChild(cv); cityThumb(cv, city);
    b.insertAdjacentHTML('beforeend', '<b>' + city.flag + ' ' + city.name + (city.night ? ' 🌙' : '') + '</b><span>' + city.desc + '</span>' + (G.done[city.id] ? '<span style="color:var(--gold)">Best finish: P' + G.done[city.id] + '</span>' : ''));
    b.onclick = () => { G.cityI = i; openSetup(); }; box.appendChild(b); });
}
function openSetup() { const city = CITIES[G.cityI]; $('setupCity').textContent = city.flag + ' ' + city.name + (G.tour ? '  ·  World Tour round ' + (G.tour.round + 1) + ' of 8' : ''); $('setupDesc').textContent = city.desc; show('setup'); }
{ const tb = $('teams'); TEAMS.slice(0, 9).forEach((t, i) => { const b = document.createElement('button'); b.className = 'team'; b.innerHTML = '<i style="background:#' + new THREE.Color(t.c).getHexString() + ';box-shadow:inset 0 -4px 0 #' + new THREE.Color(t.a).getHexString() + '"></i>' + t.name; b.setAttribute('aria-pressed', i === G.team); b.onclick = () => { G.team = i; tb.querySelectorAll('.team').forEach(x => x.setAttribute('aria-pressed', x === b)); save(); }; tb.appendChild(b); }); }
const seg = (id, fn, cur) => $(id).querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.v) === String(cur)); b.onclick = () => { $(id).querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); fn(b.dataset.v); save(); }; });
seg('laps', v => G.laps = +v, G.laps); seg('diff', v => G.diff = v, G.diff); seg('auto', v => G.auto = v === '1', G.auto ? '1' : '0');
$('pname').value = G.name; $('pname').addEventListener('input', () => { G.name = ($('pname').value.trim().toUpperCase() || 'CHANCE').slice(0, 12); save(); });
$('goRace').onclick = () => { audio(); G.tour = null; buildPick(); show('pick'); };
$('goTour').onclick = () => { audio(); if (!G.tour || G.tour.round >= 8) G.tour = { round: 0, pts: {}, teams: {} }; G.cityI = G.tour.round; save(); openSetup(); };
$('goHelp').onclick = () => show('help'); $('helpBack').onclick = () => show('title'); $('pickBack').onclick = () => show('title');
$('setupBack').onclick = () => { if (G.tour) show('title'); else show('pick'); };
$('go').onclick = () => { audio(); startRace(); };
$('resume').onclick = () => pause(false);
$('restart').onclick = () => { show(null); startRace(); };
$('quit').onclick = () => { engineOn(false); G.mode = 'title'; $('hud').classList.add('hide'); $('touch').classList.add('hide'); refreshTitle(); show('title'); };
$('resNext').onclick = () => { G.cityI = G.tour.round; openSetup(); };
$('resAgain').onclick = () => startRace();
$('resMenu').onclick = () => { G.mode = 'title'; refreshTitle(); show('title'); };
function refreshTitle() { $('tourNote').textContent = G.tour && G.tour.round < 8 ? 'World Tour in progress: round ' + (G.tour.round + 1) + ' of 8 (' + CITIES[G.tour.round].name + ')' : ''; }
refreshTitle();

/* ================================================================
   Loop
   ================================================================ */
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
let last = performance.now(), slowT = 0, quality = 2, orbit = 0;
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
buildTrack(CITIES[0]);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - last) / 1000, 0, .05); last = now; G.t += dt;
  if (quality > 0) { slowT = dt > .045 ? slowT + dt : Math.max(0, slowT - dt * .5); if (slowT > 3) { quality--; slowT = 0; renderer.setPixelRatio(quality === 1 ? Math.min(1.25, devicePixelRatio || 1) : .85); if (quality === 0) sun.castShadow = false; resize(); } }
  if (T.wheel) T.wheel.rotation.z += dt * .1; if (T.ball) T.ball.material.color.setHSL((G.t * .05) % 1, .9, .55);
  if (!G.cars.length || G.mode === 'title') {   // menu: fly around the track
    orbit += dt * .05; const S = T.S, s = S[((Math.floor(orbit * 40) % T.N) + T.N) % T.N];
    camera.position.set(s.x + s.nx * 40, s.y + 25, s.z + s.nz * 40); camera.lookAt(s.x, s.y, s.z); skyGroup.position.copy(camera.position); renderer.render(scene, camera); return;
  }
  if (G.mode === 'lights') {
    G.lightsT += dt; const n = Math.min(5, Math.floor(G.lightsT / .8)); const spans = $('lights').querySelectorAll('span');
    spans.forEach((s, i) => { const on = i < n; if (on && !s.classList.contains('on')) sfx.light(); s.classList.toggle('on', on); });
    if (G.lightsT > 4.6) { spans.forEach(s => s.classList.remove('on')); G.mode = 'race'; sfx.go(); msg('GO! GO! GO!'); setTimeout(() => $('lights').classList.add('hide'), 600); }
  }
  if (G.mode === 'race' || G.mode === 'done' || G.mode === 'lights') {
    if (G.mode !== 'lights') G.raceT += dt;
    const steps = 2; for (let k = 0; k < steps; k++) { for (const c of G.cars) stepCar(c, dt / steps); collide(); }
    if (G.mode === 'done') { G.doneT += dt; if (G.doneT > 5) showResults(); }
    updateHud();
  }
  // place the cars
  for (const c of G.cars) { const m = c.m; m.g.position.set(c.x, c.y, c.z); m.g.rotation.set(0, -c.h, 0);
    const roll = G.mode === 'paused' ? 0 : c.v * .05 * dt * 60; m.wheels.forEach(w => w.rotation.z -= c.v * dt / .36); void roll;
    m.fronts.forEach(f => f.rotation.y = -c.steer * 1.4); m.flame.visible = c.boosting; if (c.boosting) m.flame.scale.set(1, .7 + Math.random() * .7, 1);
    m.brake.material.color.setHex(c.v > 2 && (c.me ? (input.brake || input.keys.ArrowDown) : false) ? 0xff2020 : 0x400000); }
  // camera: chase, high chase, cockpit
  const me = G.me, f = new THREE.Vector3(Math.cos(me.h), 0, Math.sin(me.h)), shake = (G.shake = Math.max(0, (G.shake || 0) - dt)) > 0 ? (Math.random() - .5) * G.shake : 0;
  let want, look;
  if (G.cam === 2) { want = new THREE.Vector3(me.x + f.x * .95, me.y + .98, me.z + f.z * .95); look = want.clone().addScaledVector(f, 10); camera.position.copy(want); camera.position.y += shake * .3; camera.lookAt(look); }
  else { const back = G.cam === 1 ? 13 : 7.2, up = G.cam === 1 ? 6 : 2.6; want = new THREE.Vector3(me.x - f.x * back, me.y + up, me.z - f.z * back); look = new THREE.Vector3(me.x + f.x * 6, me.y + 1, me.z + f.z * 6);
    if (!G.camInit) { camPos.copy(want); camLook.copy(look); G.camInit = true; } camPos.lerp(want, 1 - Math.exp(-dt * 8)); camLook.lerp(look, 1 - Math.exp(-dt * 12)); camera.position.copy(camPos); camera.position.y += shake; camera.lookAt(camLook); }
  const fov = 62 + (me.boosting ? 10 : 0) + me.v * .08; if (Math.abs(camera.fov - fov) > .2) { camera.fov = lerp(camera.fov, fov, dt * 4); camera.updateProjectionMatrix(); }
  skyGroup.position.copy(camera.position);
  sun.target.position.set(me.x, me.y, me.z); sun.position.set(me.x + SUN_DIR.x * 80, me.y + SUN_DIR.y * 80, me.z + SUN_DIR.z * 80); sun.target.updateMatrixWorld();
  renderer.render(scene, camera);
}
GP.ok = true;
GP.debug = { G, startRace, stepCar, collide, get T() { return T; }, CITIES, input, showResults, standings };
requestAnimationFrame(frame);
}
