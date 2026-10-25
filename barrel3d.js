/* Barrel Blitz 3D: climb the tower, dodge barrels and fireballs, save Pickles the puppy.
   The game plays in a flat x/y plane (like the arcade classics) and is drawn in 3D with three.js. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const BZ = { ok: false }; window.BZ = BZ;
const $ = id => document.getElementById(id);
const canvas = $('c');
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, .1, 400);
scene.add(new THREE.HemisphereLight(0xc8d4ff, 0x302028, .95));
const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.position.set(10, 30, 22); scene.add(sun);
const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .6, metalness: .05 }, o || {}));
const canvasTex = (w, h, fn, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };

/* ================================================================
   Settings, levels and saved progress
   ================================================================ */
const DIFF = {
  easy:   { spd: .72, lives: 5, pDown: .12, fallKill: false, fallMax: 99,  interval: 4.0, fbMax: 2, hit: .7,  bonusKill: false, tick: 3 },
  medium: { spd: .9,  lives: 3, pDown: .28, fallKill: true,  fallMax: 4.6, interval: 2.9, fbMax: 3, hit: .85, bonusKill: false, tick: 2 },
  hard:   { spd: 1.1, lives: 3, pDown: .45, fallKill: true,  fallMax: 3.8, interval: 2.1, fbMax: 5, hit: 1,   bonusKill: true,  tick: 1.6 },
};
const TYPES = { girders: { icon: '🛢️', names: ['Girder Hill', 'Barrel Rush', 'Thunder Barrels'] }, factory: { icon: '📦', names: ['Crate Factory', 'Busy Belts', 'Mega Factory'] },
  lifts: { icon: '🛗', names: ['Lift Land', 'Spring Fling', 'Sky Lifts'] }, rivets: { icon: '🔩', names: ['Rivet Tower', 'Loose Bolts', 'Big Bongo Falls'] } };
const LEVELS = []; for (let r = 1; r <= 3; r++) for (const t of ['girders', 'factory', 'lifts', 'rivets']) LEVELS.push({ type: t, round: r, name: TYPES[t].names[r - 1], icon: TYPES[t].icon });
const SAVE_KEY = 'barrelblitz';
const save = (() => { try { return Object.assign({ hi: 0, diff: 'easy', cleared: { easy: [], medium: [], hard: [] } }, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { return { hi: 0, diff: 'easy', cleared: { easy: [], medium: [], hard: [] } }; } })();
const store = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* private mode */ } };

const GRAV = 26, JUMP_V = 8.2, WALK = 4.2, CLIMB = 2.8, W = 28;
const G = { mode: 'title', diff: save.diff, level: 0, score: 0, lives: 3, bonus: 5000, bonusT: 0, t: 0, cam: 0, paused: false, timer: 0, msgT: 0, rivets: 0 };
let D = DIFF[G.diff], L = null;

/* ================================================================
   Level layouts
   Floors are lists of straight segments {k, x1, y1, x2, y2}; k is the floor number.
   Ladders join floor kb to floor kt at a given x.
   ================================================================ */
const yAt = (s, x) => s.x2 === s.x1 ? s.y1 : s.y1 + (clamp(x, s.x1, s.x2) - s.x1) / (s.x2 - s.x1) * (s.y2 - s.y1);
function seg(L, k, x1, y1, x2, y2, o) { const s = Object.assign({ k, x1, y1, x2, y2, belt: 0, kind: 'girder', dead: false }, o || {}); L.segs.push(s); return s; }
function floorSeg(L, k, x) { for (const s of L.segs) if (!s.dead && s.k === k && x >= s.x1 - 1e-6 && x <= s.x2 + 1e-6) return s; return null; }
function ladder(L, x, kb, kt, broken) { const a = floorSeg(L, kb, x), b = floorSeg(L, kt, x); if (!a || !b) { console.warn('ladder misses a floor', x, kb, kt); return; } L.ladders.push({ x, yb: yAt(a, x), yt: yAt(b, x), kb, kt, broken: !!broken }); }
function nextSeg(L, s, x, y) { for (const t of L.segs) if (t !== s && !t.dead && t.kind !== 'lift' && x >= t.x1 - 1e-6 && x <= t.x2 + 1e-6 && Math.abs(yAt(t, x) - y) < .3) return t; return null; }
function landSeg(L, x, yOld, yNew, hw) {
  let best = null, by = -1e9;
  for (const s of L.segs) { if (s.dead || x < s.x1 - hw || x > s.x2 + hw) continue; const sy = yAt(s, x); if (sy <= yOld + (s.kind === 'lift' ? .4 : .1) && sy >= yNew - .02 && sy > by) { by = sy; best = s; } }
  return best;
}

function buildLevel(n) {
  const meta = LEVELS[n], r = meta.round;
  const L = { n, type: meta.type, round: r, name: meta.name, segs: [], ladders: [], items: [], lifts: [], belts: [], drum: null, goalK: -1, top: 30 };
  if (meta.type === 'girders') {
    const H = 4.4;
    seg(L, 0, 0, 0, 14, 0); seg(L, 0, 14, 0, 28, .7);
    for (let k = 1; k <= 4; k++) { const b = H * k; if (k % 2) seg(L, k, 0, b + .8, 25.5, b); else seg(L, k, 2.5, b, 28, b + .8); }
    const b5 = H * 5; seg(L, 5, 0, b5 + .8, 6, b5 + .8); seg(L, 5, 6, b5 + .8, 25.5, b5);
    seg(L, 6, 10.5, H * 6, 17.5, H * 6);
    ladder(L, 22, 0, 1); ladder(L, 10, 0, 1, true); ladder(L, 5, 1, 2); ladder(L, 14, 1, 2, r === 3);
    ladder(L, 24, 2, 3); ladder(L, 17, 2, 3, true); ladder(L, 9, 2, 3, r > 1);
    ladder(L, 4, 3, 4); ladder(L, 13, 3, 4, true); ladder(L, 20, 3, 4, r > 1);
    ladder(L, 22, 4, 5); ladder(L, 11, 4, 5, true); ladder(L, 16, 5, 6);
    L.items.push({ kind: 'hammer', x: 3.5, y: yAt(floorSeg(L, 2, 3.5), 3.5) + 1.3 });
    if (r < 3) L.items.push({ kind: 'hammer', x: 19, y: yAt(floorSeg(L, 4, 19), 19) + 1.3 });
    L.items.push({ kind: 'ball', x: 20, y: yAt(floorSeg(L, 3, 20), 20) + .5 });
    L.start = { x: 6, k: 0 }; L.goalK = 6; L.ape = { x: 3, y: b5 + .8 }; L.puppy = { x: 13, y: H * 6 }; L.drum = { x: 1.2, y: 0 };
    L.throwK = 5; L.throwX = 5; L.top = H * 6 + 3;
  } else if (meta.type === 'factory') {
    const H = 5;
    seg(L, 0, 0, 0, 28, 0);
    L.belts.push(Object.assign(seg(L, 1, 1, H, 27, H, { kind: 'belt', belt: 1.5 }), { flip: 7, crateT: 1 }));
    seg(L, 2, 0, 2 * H, 28, 2 * H);
    L.belts.push(Object.assign(seg(L, 3, 0, 3 * H, 13, 3 * H, { kind: 'belt', belt: 1.3 }), { crateT: 2 }));
    L.belts.push(Object.assign(seg(L, 3, 15, 3 * H, 28, 3 * H, { kind: 'belt', belt: -1.3 }), { crateT: .5 }));
    seg(L, 4, 0, 4 * H, 28, 4 * H); seg(L, 5, 0, 5 * H, 22, 5 * H); seg(L, 6, 11.5, 5 * H + 4.4, 16.5, 5 * H + 4.4);
    ladder(L, 3, 0, 1); ladder(L, 25, 0, 1); ladder(L, 6, 1, 2); ladder(L, 22, 1, 2); ladder(L, 14, 1, 2, true);
    ladder(L, 2, 2, 3); ladder(L, 26, 2, 3); ladder(L, 10, 2, 3, r > 1); ladder(L, 5, 3, 4); ladder(L, 23, 3, 4);
    ladder(L, 9, 4, 5); ladder(L, 19, 4, 5, r === 3); ladder(L, 15, 5, 6);
    L.items.push({ kind: 'hammer', x: 24, y: 2 * H + 1.3 }, { kind: 'hammer', x: 4, y: 4 * H + 1.3 }, { kind: 'bone', x: 26.5, y: 4 * H + .5 });
    L.start = { x: 8, k: 0 }; L.goalK = 6; L.ape = { x: 3, y: 5 * H }; L.puppy = { x: 13, y: 5 * H + 4.4 }; L.drum = { x: 14, y: 2 * H };
    L.top = 5 * H + 7.4;
  } else if (meta.type === 'lifts') {
    if (G.diff === 'easy') { seg(L, 0, 0, 0, 5.4, 0); seg(L, 0, 8.6, 0, 14.4, 0); seg(L, 0, 17.6, 0, 28, 0); }
    else seg(L, 0, 0, 0, 5.4, 0);
    seg(L, 1, 9.2, 9, 14.4, 9); seg(L, 2, 0, 12, 5.4, 12); seg(L, 3, 9.2, 15.5, 14.4, 15.5);
    seg(L, 4, 17.6, 6, 23, 6); seg(L, 5, 19, 13, 28, 13); seg(L, 6, 20.5, 19, 28, 19); seg(L, 7, 9, 24, 26, 24); seg(L, 8, 12.5, 28.5, 17.5, 28.5);
    if (G.diff === 'easy') ladder(L, 12, 0, 1);
    ladder(L, 10.5, 1, 3); ladder(L, 21.5, 4, 5); ladder(L, 27, 5, 6); if (G.diff === 'easy') ladder(L, 21.5, 5, 6); ladder(L, 23, 6, 7); ladder(L, 16, 7, 8);
    const sp = 1.8 + .25 * (r - 1);
    L.lifts.push({ x: 7, w: 2.6, dir: 1, lo: -1, hi: 24, gap: 7, speed: sp, phase: 0, plats: [] }, { x: 16, w: 2.6, dir: -1, lo: -1, hi: 24, gap: 7, speed: sp, phase: 3, plats: [] });
    for (const lf of L.lifts) { const n = Math.round((lf.hi - lf.lo) / lf.gap); lf.gap = (lf.hi - lf.lo) / n; for (let i = 0; i < n; i++) lf.plats.push(seg(L, -1, lf.x - lf.w / 2, 0, lf.x + lf.w / 2, 0, { kind: 'lift' })); }
    L.items.push({ kind: 'hammer', x: 12.5, y: 15.5 + 1.3 }, { kind: 'bone', x: 2, y: 12.5 }, { kind: 'ball', x: 26, y: 19.5 });
    L.start = { x: 2, k: 0 }; L.goalK = 8; L.ape = { x: 10.6, y: 24 }; L.puppy = { x: 15, y: 28.5 }; L.top = 31.5; L.springK = 7;
  } else {
    const H = 5;
    seg(L, 0, 0, 0, 28, 0);
    for (let k = 1; k <= 4; k++) { const a = k, b = 28 - k, y = H * k; seg(L, k, a, y, 7.5, y); seg(L, k, 7.5, y, 8.5, y, { kind: 'rivet' }); seg(L, k, 8.5, y, 19.5, y); seg(L, k, 19.5, y, 20.5, y, { kind: 'rivet' }); seg(L, k, 20.5, y, b, y); }
    seg(L, 5, 5, 5 * H, 23, 5 * H);
    ladder(L, 2.5, 0, 1); ladder(L, 14, 0, 1); ladder(L, 25.5, 0, 1); ladder(L, 4, 1, 2); ladder(L, 12, 1, 2, r > 1); ladder(L, 16, 1, 2, r === 1); ladder(L, 24, 1, 2);
    ladder(L, 4, 2, 3); ladder(L, 16, 2, 3); ladder(L, 24, 2, 3); ladder(L, 5, 3, 4); ladder(L, 14, 3, 4); ladder(L, 23, 3, 4);
    L.items.push({ kind: 'hammer', x: 15, y: H + 1.3 }, { kind: 'hammer', x: 11, y: 3 * H + 1.3 }, { kind: 'bone', x: 26, y: 2 * H + .5 });
    L.start = { x: 6, k: 0 }; L.ape = { x: 11, y: 5 * H }; L.puppy = { x: 17, y: 5 * H }; L.top = 5 * H + 5;
  }
  return L;
}

/* ================================================================
   Textures and shared materials
   ================================================================ */
const girderTex = canvasTex(128, 32, (c, w, h) => {
  c.fillStyle = '#d8402a'; c.fillRect(0, 0, w, h); c.fillStyle = '#a82818'; c.fillRect(0, 0, w, 5); c.fillRect(0, h - 5, w, 5);
  c.strokeStyle = '#8a1c10'; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= w; x += 32) { c.moveTo(x, 5); c.lineTo(x + 16, h - 5); c.lineTo(x + 32, 5); } c.stroke();
  c.fillStyle = '#ffb08a'; for (let x = 4; x < w; x += 16) { c.fillRect(x, 1, 3, 2); c.fillRect(x, h - 3, 3, 2); }
}, true);
const beltTex = canvasTex(64, 16, (c, w, h) => { c.fillStyle = '#2a2c34'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd34d'; for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, 2); c.lineTo(x + 8, 8); c.lineTo(x, 14); c.lineTo(x + 4, 8); c.fill(); } }, true);
const woodTex = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#b8742e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#a4652a' : '#c4833a'; c.fillRect(i * 8, 0, 8, h); c.fillStyle = '#6a3a14'; c.fillRect(i * 8, 0, 1, h); } for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(80,40,10,.3)'; c.fillRect(Math.random() * w, Math.random() * h, 1, 6); } }, true);
const crateTex = canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#c8924a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a4a1a'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.beginPath(); c.moveTo(4, 4); c.lineTo(w - 4, h - 4); c.stroke(); });
const liftTex = canvasTex(64, 16, (c, w, h) => { for (let x = -16; x < w; x += 16) { c.fillStyle = '#ffd34d'; c.fillRect(0, 0, w, h); } c.fillStyle = '#1d1d22'; for (let x = -16; x < w + 16; x += 16) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 8, 0); c.lineTo(x + 14, 0); c.lineTo(x + 6, h); c.fill(); } }, true);
const drumTex = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#2a64c8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(0, 22, w, 20); c.fillStyle = '#2a64c8'; c.font = '900 18px sans-serif'; c.textAlign = 'center'; c.fillText('OIL', 32, 39); c.fillText('OIL', 96, 39); c.fillStyle = '#1a448a'; c.fillRect(0, 4, w, 4); c.fillRect(0, h - 8, w, 4); });
const M = {
  girder: std(0xffffff, { map: girderTex, roughness: .55, metalness: .25 }), rivet: std(0xffd000, { metalness: .3, roughness: .3, emissive: 0x7a5a00 }), ladder: std(0x3ad8e8, { metalness: .2, roughness: .45 }),
  wood: std(0xffffff, { map: woodTex, roughness: .7 }), blueWood: std(0x6aa0ff, { map: woodTex, roughness: .7 }), hoop: std(0x3a3a44, { metalness: .7, roughness: .35 }),
  crate: std(0xffffff, { map: crateTex }), lift: std(0xffffff, { map: liftTex, metalness: .3 }), steel: std(0x8a909c, { metalness: .7, roughness: .35 }), dark: std(0x2a2c34, { metalness: .4 }),
  drum: std(0xffffff, { map: drumTex, metalness: .3, roughness: .4 }),
  fire: new THREE.MeshBasicMaterial({ color: 0xff6a1a }), fire2: new THREE.MeshBasicMaterial({ color: 0xffd34d }), black: std(0x111111), white: std(0xffffff),
};
const GEO = {
  barrel: new THREE.CylinderGeometry(.42, .42, .8, 18).rotateX(Math.PI / 2), hoop: new THREE.TorusGeometry(.43, .035, 6, 20), box: new THREE.BoxGeometry(1, 1, 1),
  ball: new THREE.SphereGeometry(1, 16, 12), cone: new THREE.ConeGeometry(.3, .7, 10), rung: new THREE.CylinderGeometry(.05, .05, .9, 6).rotateZ(Math.PI / 2), rail: new THREE.BoxGeometry(.1, 1, .1),
};

/* ================================================================
   Characters
   ================================================================ */
function makeHero() {
  // jointed body: hips > torso > neck > head, shoulder > elbow > hand, hip > knee > foot
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = std(0xffc9a0, { roughness: .65, emissive: 0x3a1a0a }), shirt = std(0xff7a1a, { roughness: .8 }), denim = std(0x2f5fbf, { roughness: .85 }), capM = std(0x1f8fff, { roughness: .6 }),
    shoe = std(0xf8f8f8, { roughness: .5 }), sole = std(0xe8323c), hair = std(0x7a4a22, { roughness: .9 }), white = std(0xffffff, { roughness: .3 }), ink = std(0x1a1410, { roughness: .4 }), mouthM = std(0x6a1a1a), tongue = std(0xff7a8a), freck = std(0xd88a5a), gold = std(0xffd34d, { metalness: .5, roughness: .3 });
  const grp = (p, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); p.add(o); return o; };
  const add = (p, geo, mat, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); p.add(m); return m; };
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);
  const hips = grp(body, 0, .78, 0);
  add(hips, GEO.ball, denim, 0, .02, 0, .21, .13, .2);
  // legs
  const leg = z => { const thigh = grp(hips, 0, 0, z); add(thigh, cap(.085, .2), denim, 0, -.18, 0); const knee = grp(thigh, 0, -.37, 0); add(knee, cap(.075, .2), denim, 0, -.16, 0); add(knee, new THREE.CylinderGeometry(.088, .08, .05, 10), denim, 0, -.31, 0);
    const foot = grp(knee, 0, -.36, 0); add(foot, GEO.ball, shoe, .06, -.02, 0, .17, .085, .1); add(foot, GEO.box, sole, .06, -.08, 0, .34, .035, .19); add(foot, GEO.box, std(0x3a7fff), .1, .04, 0, .1, .02, .12); return { thigh, knee, foot }; };
  const L_ = leg(.11), R_ = leg(-.11);
  // torso with dungarees
  const torso = grp(hips, 0, .05, 0);
  add(torso, cap(.2, .22), shirt, 0, .26, 0, 1, 1, .85);
  add(torso, GEO.box, denim, .1, .2, 0, .1, .3, .3); add(torso, GEO.ball, denim, 0, .08, 0, .22, .14, .19);
  for (const z of [.1, -.1]) { add(torso, GEO.box, denim, .06, .36, z, .22, .04, .045).rotation.z = -.3; add(torso, GEO.ball, gold, .16, .32, z, .025, .025, .025); }
  add(torso, GEO.box, std(0xffd34d), .155, .22, 0, .01, .08, .08);                      // pocket badge
  add(torso, new THREE.CylinderGeometry(.07, .08, .1, 10), skin, 0, .5, 0);             // neck
  // head
  const head = grp(torso, .01, .69, 0);
  add(head, GEO.ball, skin, 0, 0, 0, .25, .26, .24);
  add(head, GEO.ball, skin, .05, -.09, 0, .2, .16, .2);                                  // round chin
  for (const z of [.12, -.12]) add(head, GEO.ball, std(0xff9a8a, { roughness: .8 }), .19, -.06, z, .035, .025, .03);   // rosy cheeks
  for (const z of [.24, -.24]) { add(head, GEO.ball, skin, -.02, 0, z, .06, .08, .04); }
  add(head, GEO.ball, skin, .25, -.02, 0, .05, .045, .05);                               // nose
  for (const z of [.13, -.13]) for (const k of [0, 1, 2]) add(head, GEO.ball, freck, .21 - k * .01, -.05 + (k % 2) * .02, z + (k - 1) * .025, .008, .008, .006);
  // hair under the cap and a cowlick
  for (const [x, y, z] of [[-.16, .08, .14], [-.2, .02, 0], [-.16, .08, -.14], [-.08, .12, .2], [-.08, .12, -.2]]) add(head, GEO.ball, hair, x, y, z, .09, .08, .08);
  const tuft = add(head, cap(.025, .1), hair, -.05, .3, .02); tuft.rotation.z = .6;
  // cap with a star badge, worn a little crooked
  const capG = grp(head, -.01, .14, 0); capG.rotation.x = .08;
  add(capG, new THREE.SphereGeometry(.265, 20, 10, 0, TAU, 0, Math.PI / 2), capM, 0, 0, 0);
  add(capG, new THREE.CylinderGeometry(.2, .2, .02, 20, 1, false, -Math.PI / 2, Math.PI), capM, .17, 0, 0, 1, 1, .95);
  add(capG, GEO.ball, gold, .22, .1, 0, .025, .045, .045);
  add(capG, GEO.ball, capM, 0, .27, 0, .03, .02, .03);
  // eyes, brows, mouths
  const eyes = [], pupils = [], brows = [];
  for (const z of [.085, -.085]) { const e = grp(head, .2, .04, z); add(e, GEO.ball, white, 0, 0, 0, .045, .078, .066); const pu = add(e, GEO.ball, ink, .03, -.005, 0, .024, .045, .04); add(e, GEO.ball, white, .052, .012, .012, .01, .01, .01); eyes.push(e); pupils.push(pu);
    const br = add(head, GEO.box, hair, .225, .115, z, .025, .03, .09); brows.push(br); }
  const smile = add(head, new THREE.TorusGeometry(.075, .016, 6, 14, Math.PI), mouthM, .215, -.1, 0); smile.rotation.set(0, Math.PI / 2, Math.PI);
  const grin = grp(head, .2, -.11, 0); add(grin, GEO.ball, mouthM, 0, 0, 0, .03, .045, .075); add(grin, GEO.ball, tongue, .01, -.02, 0, .02, .02, .045); add(grin, GEO.box, white, .025, .025, 0, .01, .015, .08);
  const oh = add(head, GEO.ball, mouthM, .23, -.115, 0, .025, .045, .035);
  grin.visible = false; oh.visible = false;
  // arms
  const arm = z => { const sh = grp(torso, 0, .42, z); add(sh, GEO.ball, shirt, 0, -.03, 0, .1, .1, .1); add(sh, cap(.065, .14), shirt, 0, -.12, 0); const el = grp(sh, 0, -.25, 0); add(el, cap(.055, .14), skin, 0, -.11, 0);
    const hand = grp(el, 0, -.25, 0); add(hand, GEO.ball, skin, 0, 0, 0, .065, .07, .055); add(hand, GEO.ball, skin, .04, .02, 0, .025, .04, .025); return { sh, el, hand }; };
  const AL = arm(.27), AR = arm(-.27);
  // hammer held in the near hand
  const hammer = grp(AR.hand, 0, 0, 0); hammer.rotation.z = -Math.PI / 2;
  add(hammer, new THREE.CylinderGeometry(.04, .04, .8, 8), std(0xffa040), 0, .3, 0);
  add(hammer, GEO.box, std(0xe8ecf4, { metalness: .4, roughness: .25 }), 0, .72, 0, .42, .22, .22);
  hammer.visible = false;
  // speech bubble
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); bubble.scale.set(4, 1, 1); bubble.position.y = 2.45; bubble.renderOrder = 12; bubble.visible = false; g.add(bubble);
  return { g, body, hips, torso, head, capG, eyes, pupils, brows, smile, grin, oh, thighL: L_.thigh, kneeL: L_.knee, footL: L_.foot, thighR: R_.thigh, kneeR: R_.knee, footR: R_.foot,
    shL: AL.sh, elL: AL.el, shR: AR.sh, elR: AR.el, hammer, bubble, bubbleCv: cv, bubbleTex: tex };
}
function makeApe() {
  const g = new THREE.Group(), fur = std(0x6b3a1e, { roughness: .9 }), tan = std(0xd9a066, { roughness: .8 }), dark = std(0x2a160a);
  const add = (p, geo, mat, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); p.add(m); return m; };
  const body = new THREE.Group(); g.add(body);
  add(body, GEO.ball, fur, 0, 1.5, 0, 1.05, 1.0, .85); add(body, GEO.ball, tan, 0, 1.4, .42, .72, .76, .45);
  const head = new THREE.Group(); head.position.set(0, 2.62, .1); body.add(head);
  add(head, GEO.ball, fur, 0, 0, 0, .62, .6, .58); add(head, GEO.ball, tan, 0, -.14, .42, .5, .36, .34); add(head, GEO.ball, tan, 0, .16, .4, .4, .24, .25);
  add(head, GEO.box, dark, 0, .3, .5, .82, .13, .18);
  for (const x of [-.17, .17]) { add(head, GEO.ball, M.white, x, .14, .6, .1, .1, .06); add(head, GEO.ball, M.black, x, .14, .65, .05, .05, .03); add(head, GEO.ball, dark, x * .45, -.08, .76, .05, .04, .03); add(head, GEO.ball, tan, x * 3.6, .04, 0, .16, .18, .1); }
  const mouth = add(head, GEO.box, dark, 0, -.27, .73, .4, .06, .05);
  const arm = x => { const p = new THREE.Group(); p.position.set(x, 2.05, 0); body.add(p); add(p, new THREE.CapsuleGeometry(.27, .8, 4, 10), fur, 0, -.6, 0); add(p, GEO.ball, tan, 0, -1.22, 0, .36, .34, .36); return p; };
  const armL = arm(.98), armR = arm(-.98);
  for (const x of [-.5, .5]) { add(body, new THREE.CapsuleGeometry(.3, .35, 4, 10), fur, x, .5, 0); add(body, GEO.ball, tan, x * 1.1, .12, .22, .3, .14, .42); }
  return { g, body, head, armL, armR, mouth };
}
function makePuppy() {
  const g = new THREE.Group(), wh = std(0xfafafa), br = std(0x9a6030);
  const add = (geo, mat, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); g.add(m); return m; };
  const b = add(new THREE.CapsuleGeometry(.2, .45, 4, 10), wh, 0, .42, 0); b.rotation.z = Math.PI / 2;
  add(GEO.ball, br, -.05, .5, .12, .16, .14, .1);
  const head = add(GEO.ball, wh, .42, .74, 0, .26, .25, .25);
  add(GEO.ball, wh, .62, .68, 0, .14, .1, .11); add(GEO.ball, M.black, .75, .7, 0, .05, .04, .04);
  for (const z of [-.1, .1]) add(GEO.ball, M.black, .58, .8, z, .04, .045, .04);
  for (const z of [-.2, .2]) { const e = add(GEO.ball, br, .38, .82, z, .07, .18, .1); e.rotation.x = z > 0 ? .5 : -.5; }
  for (const [x, z] of [[.25, .12], [.25, -.12], [-.25, .12], [-.25, -.12]]) add(new THREE.CylinderGeometry(.06, .06, .3, 6), wh, x, .15, z);
  const tail = new THREE.Group(); tail.position.set(-.42, .52, 0); g.add(tail); const tm = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .25, 3, 6), br); tm.position.y = .15; tm.rotation.z = .5; tail.add(tm);
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 64, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.roundRect ? c.roundRect(4, 4, 120, 44, 14) : c.rect(4, 4, 120, 44); c.fill(); c.beginPath(); c.moveTo(50, 46); c.lineTo(60, 62); c.lineTo(70, 46); c.fill(); c.fillStyle = '#e8323c'; c.font = '900 30px sans-serif'; c.textAlign = 'center'; c.fillText('HELP!', 64, 38); }), depthTest: false }));
  bubble.scale.set(2, 1, 1); bubble.position.set(.2, 1.7, 0); bubble.renderOrder = 5; g.add(bubble);
  return { g, head, tail, bubble };
}
function makeHammerItem() { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .8, 8), std(0xffa040, { emissive: 0x5a2a00 })); g.add(h); const hd = new THREE.Mesh(GEO.box, std(0xe8ecf4, { metalness: .4, roughness: .25, emissive: 0x404650 })); hd.scale.set(.45, .24, .24); hd.position.y = .42; g.add(hd); return g; }
function makeBone() { const g = new THREE.Group(), m = std(0xf8f2e0); const c = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .6, 8), m); c.rotation.z = Math.PI / 2; g.add(c); for (const x of [-.3, .3]) for (const y of [-.07, .07]) { const s = new THREE.Mesh(GEO.ball, m); s.scale.setScalar(.1); s.position.set(x, y, 0); g.add(s); } return g; }
function makeBall() { const g = new THREE.Group(); const s = new THREE.Mesh(GEO.ball, std(0xe8323c, { roughness: .3 })); s.scale.setScalar(.28); g.add(s); const st = new THREE.Mesh(new THREE.TorusGeometry(.28, .03, 6, 20), std(0xffffff)); g.add(st); return g; }

/* plain light background so the platforms, ladders and hazards stand out */
scene.background = new THREE.Color(0x4a5a78);

/* ================================================================
   Building the 3D level
   ================================================================ */
let levelGroup = null, hero = null, ape = null, puppy = null, drumFx = null;
const H = [];                       // hazards: barrels, fireballs, crates, springs
const fx = [];                      // popups and particles
function girderMesh(s, mat) {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1, len = Math.hypot(dx, dy), a = Math.atan2(dy, dx), th = s.kind === 'lift' ? .3 : .42;
  const geo = new THREE.BoxGeometry(len, th, s.kind === 'lift' ? 1.8 : 2.0); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / 2.2);
  const m = new THREE.Mesh(geo, mat); m.position.set((s.x1 + s.x2) / 2 + Math.sin(a) * th / 2, (s.y1 + s.y2) / 2 - Math.cos(a) * th / 2, 0); m.rotation.z = a; return m;
}
function buildScene() {
  if (levelGroup) scene.remove(levelGroup);
  levelGroup = new THREE.Group(); scene.add(levelGroup);
  for (const s of L.segs) {
    if (s.kind === 'lift') { s.mesh = girderMesh(s, M.lift); levelGroup.add(s.mesh); continue; }
    if (s.kind === 'rivet') { const m = new THREE.Group(); const plug = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .5, 14), M.rivet); plug.position.y = -.22; m.add(plug); const cap = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .1, 14), M.rivet); cap.position.y = .02; m.add(cap); m.position.set((s.x1 + s.x2) / 2, s.y1, 0); s.mesh = m; levelGroup.add(m); continue; }
    if (s.kind === 'belt') { const t = beltTex.clone(); t.needsUpdate = true; t.repeat.set(1, 1); s.tex = t; const m = girderMesh(s, std(0xffffff, { map: t, roughness: .8 })); levelGroup.add(m);
      for (const x of [s.x1, s.x2]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 2.1, 12).rotateX(Math.PI / 2), M.steel); r.position.set(x, s.y1 - .2, 0); levelGroup.add(r); } continue; }
    levelGroup.add(girderMesh(s, M.girder));
  }
  // ladders as instanced rails and rungs
  const rails = [], rungs = [], d = new THREE.Object3D();
  for (const ld of L.ladders) {
    const h = ld.yt - ld.yb, parts = ld.broken ? [[0, h * .3], [h * .72, h]] : [[0, h]];
    for (const [a, b] of parts) for (const x of [-.42, .42]) { d.position.set(ld.x + x, ld.yb + (a + b) / 2, -.35); d.scale.set(1, b - a, 1); d.rotation.set(0, 0, 0); d.updateMatrix(); rails.push(d.matrix.clone()); }
    for (let y = .35; y < h - .1; y += .42) { if (ld.broken && y > h * .3 && y < h * .72) continue; d.position.set(ld.x, ld.yb + y, -.35); d.scale.set(1, 1, 1); d.updateMatrix(); rungs.push(d.matrix.clone()); }
  }
  const mk = (geo, list) => { const im = new THREE.InstancedMesh(geo, M.ladder, Math.max(1, list.length)); list.forEach((m, i) => im.setMatrixAt(i, m)); im.count = list.length; levelGroup.add(im); };
  mk(GEO.rail, rails); mk(GEO.rung, rungs);
  // tower frame
  for (const x of [-.8, W + .8]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.6, L.top + 2, .6), M.girder); c.position.set(x, (L.top + 2) / 2 - .5, -.7); levelGroup.add(c); }
  // lift shafts
  for (const lf of L.lifts) { for (const x of [lf.x - lf.w / 2 - .15, lf.x + lf.w / 2 + .15]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, lf.hi - lf.lo + 2, 6), M.steel); p.position.set(x, (lf.hi + lf.lo) / 2, -.9); levelGroup.add(p); }
    for (const y of [lf.lo - .6, lf.hi + .8]) { const b = new THREE.Mesh(GEO.box, M.dark); b.scale.set(lf.w + .6, .8, 1.6); b.position.set(lf.x, y, -.4); levelGroup.add(b); } }
  // oil drum with flames
  drumFx = null;
  if (L.drum) { const g = new THREE.Group(); const dm = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, 1.3, 20), M.drum); dm.position.y = .65; g.add(dm); const flames = [];
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(GEO.cone, i % 2 ? M.fire2 : M.fire); f.position.set(Math.cos(i * 1.6) * .25, 1.6, Math.sin(i * 1.6) * .25); g.add(f); flames.push(f); }
    const light = new THREE.PointLight(0xff8a2a, 30, 12, 2); light.position.y = 2; g.add(light); g.position.set(L.drum.x, L.drum.y, 0); levelGroup.add(g); drumFx = { flames, light, boost: 0 }; }
  // items
  for (const it of L.items) { it.taken = false; it.mesh = it.kind === 'hammer' ? makeHammerItem() : it.kind === 'bone' ? makeBone() : makeBall(); it.mesh.position.set(it.x, it.y, .3); levelGroup.add(it.mesh); }
  // the hero, the gorilla and the puppy
  hero = makeHero(); levelGroup.add(hero.g);
  ape = makeApe(); ape.g.position.set(L.ape.x, L.ape.y, -.2); levelGroup.add(ape.g);
  puppy = makePuppy(); puppy.g.position.set(L.puppy.x, L.puppy.y, 0); puppy.g.rotation.y = -.6; levelGroup.add(puppy.g);
  if (L.type === 'girders') { // a stack of barrels next to Big Bongo
    for (const [x, y] of [[-1.7, .42], [-.85, .42], [-1.27, 1.24]]) { const b = barrelMesh(false); b.rotation.x = Math.PI / 2; b.position.set(L.ape.x + x, L.ape.y + y, -.6); levelGroup.add(b); } }
}
function barrelMesh(blue) { const g = new THREE.Group(); g.add(new THREE.Mesh(GEO.barrel, blue ? M.blueWood : M.wood)); for (const z of [-.26, .26]) { const h = new THREE.Mesh(GEO.hoop, M.hoop); h.position.z = z; g.add(h); } levelGroup.add(g); return g; }
function fireMesh() { const g = new THREE.Group(); const s = new THREE.Mesh(GEO.ball, M.fire); s.scale.setScalar(.34); s.position.y = .34; g.add(s); const c = new THREE.Mesh(GEO.cone, M.fire2); c.position.y = .7; c.scale.set(.9, .9, .9); g.add(c);
  for (const x of [-.12, .12]) { const e = new THREE.Mesh(GEO.ball, M.black); e.scale.setScalar(.06); e.position.set(x, .4, .3); g.add(e); } levelGroup.add(g); return g; }
function crateMesh() { const m = new THREE.Mesh(GEO.box, M.crate); m.scale.setScalar(.8); const g = new THREE.Group(); m.position.y = .4; g.add(m); levelGroup.add(g); return g; }
function springMesh() { const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU * 4; pts.push(new THREE.Vector3(Math.cos(a) * .3, i / 60 * .6, Math.sin(a) * .3)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .05, 6), M.steel)); for (const y of [0, .62]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .06, 14), M.dark); d.position.y = y; g.add(d); } levelGroup.add(g); return g; }
function popup(text, x, y, color) {
  const tex = canvasTex(128, 64, (c) => { c.font = '900 40px sans-serif'; c.textAlign = 'center'; c.lineWidth = 6; c.strokeStyle = '#000'; c.strokeText(text, 64, 46); c.fillStyle = color || '#ffd34d'; c.fillText(text, 64, 46); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); s.scale.set(2, 1, 1); s.position.set(x, y, 1); s.renderOrder = 10; levelGroup.add(s); fx.push({ obj: s, t: 0, life: 1.1, vy: 1.4 });
}
function burst(x, y, color, n) { for (let i = 0; i < (n || 10); i++) { const m = new THREE.Mesh(GEO.ball, new THREE.MeshBasicMaterial({ color })); m.scale.setScalar(.08 + Math.random() * .08); m.position.set(x, y, .5); levelGroup.add(m); fx.push({ obj: m, t: 0, life: .7, vx: (Math.random() - .5) * 7, vy: Math.random() * 6, g: 14 }); } }

/* ================================================================
   Sound
   ================================================================ */
let AC = null, muted = false;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f0, f1, d, type, vol, delay) { if (muted || !AC) return; const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d); g.gain.setValueAtTime(vol || .08, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); }
const SFX = {
  jump: () => tone(300, 700, .18, 'square', .06), step: (i) => tone(i ? 520 : 400, i ? 520 : 400, .04, 'triangle', .04), score: () => { tone(880, 880, .07, 'square', .05); tone(1320, 1320, .1, 'square', .05, .07); },
  smash: () => { tone(200, 40, .25, 'sawtooth', .1); tone(900, 200, .12, 'square', .05); }, hammer: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, f, .1, 'square', .06, i * .08)),
  die: () => [600, 500, 400, 300, 200].forEach((f, i) => tone(f, f * .9, .16, 'square', .07, i * .14)), win: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, f, .16, 'square', .06, i * .12)),
  rivet: () => tone(1200, 600, .12, 'square', .06), throw: () => tone(160, 90, .2, 'sawtooth', .07), land: () => tone(140, 80, .08, 'triangle', .08),
};

/* ================================================================
   Starting levels and lives
   ================================================================ */
const P = { x: 0, y: 0, vx: 0, vy: 0, state: 'walk', seg: null, ladder: null, face: 1, maxY: 0, hammer: 0, anim: 0, deadT: 0, stepT: 0, stepI: 0 };
function startGame(level) { G.level = level; G.score = 0; D = DIFF[G.diff]; G.lives = D.lives; startLevel(); }
function startLevel() {
  L = buildLevel(G.level); H.length = 0; fx.length = 0; buildScene();
  G.rivets = L.segs.filter(s => s.kind === 'rivet').length; G.bonus = 5000 + 1000 * (L.round - 1); G.bonusT = 0;
  resetLife(); G.mode = 'play'; G.paused = false; G.camInit = false;
  showScreen(null); hud(); setTimeout(() => say('start', true), 900); flash(L.name, LEVELS[G.level].icon + ' Level ' + (G.level + 1) + ' · ' + G.diff.toUpperCase(), 2.2);
}
function resetLife() {
  for (const h of H) levelGroup.remove(h.mesh); H.length = 0;
  const s = floorSeg(L, L.start.k, L.start.x); Object.assign(P, { x: L.start.x, y: yAt(s, L.start.x), vx: 0, vy: 0, state: 'walk', seg: s, ladder: null, face: 1, hammer: 0, deadT: 0, prone: false, idleT: 0, squash: 0 });
  G.throwT = 1.2; G.fireT = 4; G.springT = 2; G.spawned = 0; G.apeAnim = 0;
  for (const b of L.belts) b.crateT = Math.random() * 2;
  if (L.type === 'factory') { spawnFire(14, 2, 1); }
  if (L.type === 'lifts') spawnFire(24, 5, 1);
}
function die() {
  if (P.state === 'dead') return; P.state = 'dead'; P.deadT = 0; P.hammer = 0; P.prone = false; say('die', true); SFX.die(); burst(P.x, P.y + .8, 0xffffff, 14);
}
function afterDeath() {
  G.lives--; hud();
  if (G.lives <= 0) { G.mode = 'over'; if (G.score > save.hi) { save.hi = G.score; store(); } $('overScore').textContent = 'Score ' + G.score.toLocaleString(); showScreen('over'); return; }
  resetLife(); flash('Try again!', G.lives + (G.lives === 1 ? ' life' : ' lives') + ' left', 1.6);
}
function win() {
  if (G.mode !== 'play') return; G.mode = 'clear'; G.timer = 0; P.hammer = 0; P.prone = false; say('win', true); SFX.win();
  const bonus = G.bonus; G.score += bonus; const c = save.cleared[G.diff]; if (!c.includes(G.level)) c.push(G.level);
  if (G.score > save.hi) save.hi = G.score; store(); hud();
  for (const h of H) levelGroup.remove(h.mesh); H.length = 0;
  for (let i = 0; i < 6; i++) setTimeout(() => popup('❤', L.puppy.x + (Math.random() - .5) * 3, L.puppy.y + 1.5 + Math.random(), '#ff5a8a'), i * 200);
  G.clearBonus = bonus;
}
const LINES = {
  start: ["I'm coming, Pickles!", 'Hang on, Pickles!', 'Here I go!', "Let's do this!"],
  over: ['Woo-hoo!', 'Too easy!', 'Ha! Missed me!', 'Boing!', 'Yeah!', 'Over you go!'],
  hammer: ['Smash time!', 'Look out, barrels!', 'Bonk bonk bonk!'],
  idle: ['La la la...', "Come on, let's go!", 'Is it snack time yet?', "I'm not scared of you, Big Bongo!", 'Pickles needs me!'],
  prone: ['Phew!', 'Hiding!', 'Nap time... just kidding!', 'Shhh...'],
  scared: ['Yikes!', 'Uh-oh!', 'Whoa!'], ouch: ['Ouch, my toes!', 'Oof, big drop!'],
  die: ['Oof!', 'Aw, man!', 'Bonk!'], win: ['Got you, Pickles!', 'We did it!', 'High five, Pickles!'], rivet: ['Pop!', 'Boop!'], ladderJump: ['Wheee!', 'Ninja jump!'],
};
function say(kind, force) {
  if (!hero || (!force && G.t < (G.sayUntil || 0) + 1.2)) return;
  const list = LINES[kind] || [kind], text = list[Math.floor(Math.random() * list.length)], c = hero.bubbleCv.getContext('2d'), w = hero.bubbleCv.width, h = hero.bubbleCv.height;
  c.clearRect(0, 0, w, h); c.font = '900 40px "Trebuchet MS", sans-serif'; const tw = Math.min(w - 24, c.measureText(text).width + 44), x0 = (w - tw) / 2;
  c.fillStyle = '#fff'; c.strokeStyle = '#1a1a2a'; c.lineWidth = 5; c.beginPath(); if (c.roundRect) c.roundRect(x0, 6, tw, 80, 24); else c.rect(x0, 6, tw, 80); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(w / 2 - 14, 84); c.lineTo(w / 2, 118); c.lineTo(w / 2 + 14, 84); c.closePath(); c.fill(); c.beginPath(); c.moveTo(w / 2 - 14, 86); c.lineTo(w / 2, 118); c.lineTo(w / 2 + 14, 86); c.stroke();
  c.fillStyle = '#1a1a2a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2, 47, w - 40);
  hero.bubbleTex.needsUpdate = true; hero.bubble.visible = true; G.sayUntil = G.t + 1.8;
}
function addScore(n, x, y) { G.score += n; popup(String(n), x, y); hud(); }

/* ================================================================
   Hazards
   ================================================================ */
function spawnBarrel() {
  const s = floorSeg(L, L.throwK, L.throwX), blue = Math.random() < .1 + .08 * L.round;
  H.push({ type: 'barrel', x: L.throwX, y: yAt(s, L.throwX), seg: s, dir: 1, state: 'roll', vx: 0, vy: 0, r: .42, blue, rot: 0, lastLd: null, mesh: barrelMesh(blue) });
  SFX.throw(); G.apeAnim = .6;
}
function spawnFire(x, k, dir, pop) {
  if (H.filter(h => h.type === 'fire').length >= D.fbMax) return;
  const s = floorSeg(L, k, x); if (!s) return;
  const f = { type: 'fire', x, y: yAt(s, x), seg: s, dir: dir || 1, state: 'walk', r: .34, t: Math.random() * 9, mesh: fireMesh() };
  if (pop) { f.state = 'pop'; f.vy = 7; f.vx = (Math.random() < .5 ? -1 : 1) * 1.6; f.y += 1.4; f.seg = null; }
  H.push(f);
}
const speedMul = () => D.spd * (1 + .1 * (L.round - 1));
function removeHazard(h) { const i = H.indexOf(h); if (i >= 0) H.splice(i, 1); levelGroup.remove(h.mesh); }
function updateBarrel(b, dt) {
  const v = 6.4 * speedMul();
  if (b.state === 'roll') {
    const s = b.seg; if (s.y2 < s.y1 - 1e-3) b.dir = 1; else if (s.y2 > s.y1 + 1e-3) b.dir = -1;
    const ox = b.x; b.x += b.dir * v * dt; b.rot -= b.dir * v * dt / b.r;
    for (const ld of L.ladders) { if (ld.kt !== s.k || ld === b.lastLd) continue; if ((ox - ld.x) * (b.x - ld.x) <= 0) { b.lastLd = ld; if (Math.random() < D.pDown) { b.state = 'ladder'; b.x = ld.x; b.ld = ld; return; } } }
    if (b.x < s.x1 || b.x > s.x2) { const n = nextSeg(L, s, b.x, yAt(s, b.x)); if (n) b.seg = n; else { b.state = 'fall'; b.vx = b.dir * 1.6; b.vy = 0; b.seg = null; return; } }
    b.y = yAt(b.seg, b.x);
    if (L.drum && b.seg.k === 0 && b.x < L.drum.x + .9) { removeHazard(b); if (drumFx) drumFx.boost = 1; if (b.blue || Math.random() < (G.diff === 'hard' ? .35 : .12)) spawnFire(L.drum.x + .3, 0, 1, true); }
  } else if (b.state === 'ladder') {
    b.y -= v * .5 * dt; if (b.y <= b.ld.yb) { b.y = b.ld.yb; b.seg = floorSeg(L, b.ld.kb, b.x); b.state = 'roll'; b.lastLd = b.ld; if (!b.seg) { b.state = 'fall'; b.vx = 0; b.vy = 0; } }
  } else {
    const oy = b.y; b.vy -= GRAV * dt; b.y += b.vy * dt; b.x += b.vx * dt;
    const s = landSeg(L, b.x, oy, b.y, 0); if (s && b.vy < 0) { b.seg = s; b.y = yAt(s, b.x); b.state = 'roll'; b.vy = 0; }
    if (b.y < -6) removeHazard(b);
  }
}
function updateFire(f, dt) {
  const v = 1.7 * speedMul(); f.t += dt;
  if (f.state === 'pop') { const oy = f.y; f.vy -= GRAV * .7 * dt; f.y += f.vy * dt; f.x = clamp(f.x + f.vx * dt, .4, W - .4); const s = f.vy < 0 && landSeg(L, f.x, oy, f.y, 0); if (s) { f.seg = s; f.y = yAt(s, f.x); f.state = 'walk'; } if (f.y < -6) removeHazard(f); return; }
  if (f.state === 'climb') { f.y += f.cdir * v * .8 * dt; const ld = f.ld; if ((f.cdir > 0 && f.y >= ld.yt) || (f.cdir < 0 && f.y <= ld.yb)) { const k = f.cdir > 0 ? ld.kt : ld.kb; f.y = f.cdir > 0 ? ld.yt : ld.yb; f.seg = floorSeg(L, k, ld.x); f.state = 'walk'; f.lastLd = ld; if (!f.seg) removeHazard(f); } return; }
  if (Math.random() < dt * .3) f.dir = -f.dir;
  if (P.state !== 'dead' && Math.abs(P.y - f.y) < 1.5 && Math.random() < dt * .8) f.dir = Math.sign(P.x - f.x) || 1;
  const ox = f.x; f.x += f.dir * v * dt; const s = f.seg;
  if (f.x < s.x1 || f.x > s.x2) { const n = nextSeg(L, s, f.x, yAt(s, f.x)); if (n && n.kind !== 'belt') f.seg = n; else { f.x = clamp(f.x, s.x1, s.x2); f.dir = -f.dir; } }
  f.y = yAt(f.seg, f.x);
  for (const ld of L.ladders) {
    if (ld === f.lastLd || ld.broken || (ox - ld.x) * (f.x - ld.x) > 0) continue;
    const up = ld.kb === f.seg.k, down = ld.kt === f.seg.k; if (!up && !down) continue;
    const want = P.y > f.y + 1 ? up : P.y < f.y - 1 ? down : false;
    if (Math.random() < (want ? .6 : .2)) { f.state = 'climb'; f.ld = ld; f.x = ld.x; f.cdir = up ? 1 : -1; return; }
  }
  if (Math.abs(f.x - (f.lastLd ? f.lastLd.x : -99)) > 1) f.lastLd = null;
}
function updateCrate(c, dt) {
  if (c.state === 'ride') { c.x += c.seg.belt * speedMul() * dt; if (c.x < c.seg.x1 || c.x > c.seg.x2) { c.state = 'fall'; c.vx = Math.sign(c.seg.belt) * 1.2; c.vy = 0; c.y0 = c.y; } c.mesh.rotation.z = 0; }
  else { c.vy -= GRAV * dt; c.y += c.vy * dt; c.x += c.vx * dt; c.mesh.rotation.z += dt * 4; if (c.y < c.y0 - 4) { burst(c.x, c.y, 0xc8924a, 6); removeHazard(c); } }
}
function updateSpring(s, dt) {
  const T = floorSeg(L, L.springK, 12);
  if (s.state === 'bounce') { s.t += dt; s.x += 3.4 * speedMul() * dt; s.y = T.y1 + Math.abs(Math.sin(s.t * Math.PI / .55)) * 1.7; if (s.x > 26.5) { s.state = 'drop'; s.x = 26.6; } }
  else { s.y -= 9 * dt; if (s.y < -4) removeHazard(s); }
}
function hits(h) {
  // lying flat: barrels, crates and springs bounce over you, fireballs still burn
  if (P.prone && h.type !== 'fire') return false;
  const k = D.hit, cx = P.prone ? P.x + P.face * .2 : P.x, cy = P.y + (P.prone ? .22 : .75), hy = h.y + h.r, hw = P.prone ? .75 : .3, hh = P.prone ? .2 : .7;
  return Math.abs(cx - h.x) < (hw + h.r * .8) * k + .1 && Math.abs(cy - hy) < (hh + h.r * .8) * k;
}

/* ================================================================
   Player
   ================================================================ */
const inp = { l: 0, r: 0, u: 0, d: 0, jump: 0 };
function findLadder(dir) { let best = null; for (const ld of L.ladders) { if (Math.abs(P.x - ld.x) > .65) continue; if ((dir > 0 && Math.abs(P.y - ld.yb) < .35) || (dir < 0 && Math.abs(P.y - ld.yt) < .35)) { if (!ld.broken) return ld; best = ld; } } return best; }
// a broken ladder only lets you climb its rungs: partway up from the bottom, or partway down from the top
function startClimb(ld, fromTop) {
  const h = ld.yt - ld.yb; P.state = 'climb'; P.ladder = ld; P.x = ld.x;
  P.climbLo = ld.broken && fromTop ? ld.yb + h * .5 : ld.yb - 1; P.climbHi = ld.broken && !fromTop ? ld.yb + h * .3 : ld.yt + 1;
  if (fromTop) P.y = ld.yt - .05;
}
function liftAt(x, y) { for (const lf of L.lifts) for (const s of lf.plats) if (s.mesh.visible && x >= s.x1 && x <= s.x2 && Math.abs(s.y1 - y) < .45) return s; return null; }
// stepping off a lift onto a ledge that is a little higher or lower
function stepSeg(x, y) { for (const t of L.segs) if (!t.dead && t.kind !== 'lift' && x >= t.x1 - .35 && x <= t.x2 + .35) { const d = yAt(t, x) - y; if (d > -.5 && d < .8) return t; } return null; }
function fallOff() { P.state = 'air'; P.vy = 0; P.vx *= .35; P.maxY = P.y; P.seg = null; }
function updatePlayer(dt) {
  if (P.hammer > 0) { P.hammer -= dt; if (P.hammer <= 0) hero.hammer.visible = false; }
  const mv = (inp.r ? 1 : 0) - (inp.l ? 1 : 0); if (mv && P.state !== 'climb') P.face = mv;
  if (P.state === 'walk') {
    const s = P.seg; if (!s || s.dead) { fallOff(); return; }
    const wasProne = P.prone; if (!inp.d) P.proneLock = false; P.prone = !!inp.d && !inp.jump && !P.proneLock && !findLadder(-1);
    P.proneT = P.prone ? (P.proneT || 0) + dt : 0; if (P.proneT > 3) { P.prone = false; P.proneLock = true; say('Up I get!', true); }
    if (P.prone && !wasProne && Math.random() < .5) say('prone');
    P.vx = mv * (P.prone ? 1.2 : WALK); P.x = clamp(P.x + (P.vx + s.belt * speedMul()) * dt, .3, W - .3);
    if (s.kind === 'lift') { if (s.jumped) { fallOff(); return; } }
    if (P.x < s.x1 || P.x > s.x2) { const n = nextSeg(L, s, P.x, yAt(s, P.x)) || liftAt(P.x, P.y) || (s.kind === 'lift' && stepSeg(P.x, P.y)); if (n) P.seg = n; else if (P.x < s.x1 - .25 || P.x > s.x2 + .25) { fallOff(); return; } }
    P.y = yAt(P.seg, P.x);
    if (mv && !P.prone) { P.anim += dt * 11; P.stepT -= dt; if (P.stepT <= 0) { P.stepT = .17; P.stepI ^= 1; SFX.step(P.stepI); } } else P.anim = 0;
    if (P.seg.kind === 'rivet') P.seg.touched = true;
    if (inp.jump) { P.state = 'air'; P.vy = JUMP_V; P.vx = mv * WALK + s.belt * speedMul(); P.maxY = P.y; P.seg = null; SFX.jump(); }
    else if (inp.u) { const ld = findLadder(1); if (ld) startClimb(ld, false); }
    else if (inp.d) { const ld = findLadder(-1); if (ld) { P.prone = false; startClimb(ld, true); } }
  } else if (P.state === 'air') {
    const oy = P.y; P.vy -= GRAV * dt; P.y += P.vy * dt; P.x = clamp(P.x + P.vx * dt, .3, W - .3); P.maxY = Math.max(P.maxY, P.y);
    for (const s of L.segs) if (s.kind === 'rivet' && !s.dead && Math.abs(P.x - (s.x1 + s.x2) / 2) < .5 && P.y > s.y1 && P.y < s.y1 + 2.6) s.touched = true;
    if (P.vy <= 0) { const s = landSeg(L, P.x, oy, P.y, .2); if (s) { const drop = P.maxY - yAt(s, P.x); P.seg = s; P.y = yAt(s, P.x); P.state = 'walk'; P.squash = Math.min(1, drop / 3); if (drop > 1.6) SFX.land(); if (D.fallKill && drop > D.fallMax) die(); else if (drop > 3.5) say('ouch'); } }
    if (P.y < -5) die();
  } else if (P.state === 'climb' && inp.jump) {
    // jump off the ladder, sideways if an arrow is held
    if (mv) P.face = mv; P.state = 'air'; P.vy = JUMP_V * .8; P.vx = mv * WALK; P.maxY = P.y; P.seg = null; SFX.jump(); if (Math.random() < .5) say('ladderJump');
  } else if (P.state === 'climb') {
    const ld = P.ladder; let c = (inp.u ? 1 : 0) - (inp.d ? 1 : 0);
    if ((c > 0 && P.y >= P.climbHi) || (c < 0 && P.y <= P.climbLo)) { c = 0; if (G.t - (G.brokenT || -9) > 2.5) { G.brokenT = G.t; flash('Broken ladder!', 'You can hide here, but it doesn\'t reach the next floor', 1.6); } }
    P.y = clamp(P.y + c * CLIMB * dt, P.climbLo, P.climbHi); P.anim += Math.abs(c) * dt * 9;
    if (c) { P.stepT -= dt; if (P.stepT <= 0) { P.stepT = .2; P.stepI ^= 1; SFX.step(P.stepI); } }
    if (P.y >= ld.yt) { P.y = ld.yt; P.seg = floorSeg(L, ld.kt, ld.x); P.state = 'walk'; }
    else if (P.y <= ld.yb) { P.y = ld.yb; P.seg = floorSeg(L, ld.kb, ld.x); P.state = 'walk'; }
  }
  inp.jump = 0;
  // rivets pop out once you have walked past them
  for (const s of L.segs) if (s.kind === 'rivet' && s.touched && !s.dead && P.seg !== s && !(P.state === 'air' && Math.abs(P.x - (s.x1 + s.x2) / 2) < .5)) {
    s.dead = true; s.mesh.visible = false; G.rivets--; SFX.rivet(); if (Math.random() < .4) say('rivet'); addScore(100, (s.x1 + s.x2) / 2, s.y1 + 1); burst((s.x1 + s.x2) / 2, s.y1, 0xffd34d, 8); hud();
    for (const h of H) if (h.seg === s) h.seg = floorSeg(L, s.k, h.x < s.x1 ? s.x1 - .1 : s.x2 + .1) || h.seg;
  }
  // pick-ups
  for (const it of L.items) if (!it.taken && Math.abs(P.x - it.x) < .7 && Math.abs(P.y + .9 - it.y) < 1.3) {
    it.taken = true; it.mesh.visible = false;
    if (it.kind === 'hammer') { P.hammer = 9; hero.hammer.visible = true; SFX.hammer(); say('hammer', true); popup('HAMMER!', it.x, it.y + 1, '#5ad8ff'); }
    else { const pts = it.kind === 'bone' ? 500 : 300; addScore(pts, it.x, it.y + .8); SFX.score(); }
  }
}

/* ================================================================
   Main update
   ================================================================ */
function update(dt) {
  G.t += dt;
  if (G.msgT > 0) { G.msgT -= dt; if (G.msgT <= 0) $('msg').style.opacity = 0; }
  // lifts move all the time
  for (const lf of L.lifts) { lf.phase += lf.speed * D.spd * dt; const span = lf.hi - lf.lo;
    lf.plats.forEach((s, i) => { const u = ((lf.phase + i * lf.gap) % span + span) % span, y = lf.dir > 0 ? lf.lo + u : lf.hi - u; s.jumped = Math.abs(y - s.y1) > 1; s.y1 = s.y2 = y; s.mesh.position.y = y - .15; s.mesh.visible = u > .2 && u < span - .2; }); }
  for (const b of L.belts) { if (b.flip) { b.flip -= dt; if (b.flip <= 0) { b.belt = -b.belt; b.flip = 6 + Math.random() * 4; } } if (b.tex) b.tex.offset.x -= b.belt * speedMul() * dt / 2.2; }
  if (G.mode === 'clear') { G.timer += dt; animate(dt); if (G.timer > 2.8 && !$('clear').classList.contains('show')) showClear(); return; }
  if (G.mode !== 'play') { animate(dt); return; }
  if (P.state === 'dead') { P.deadT += dt; animate(dt); if (P.deadT > 1.6) afterDeath(); return; }
  updatePlayer(dt);
  // spawners
  if (L.type === 'girders') { G.throwT -= dt; if (G.throwT <= 0) { spawnBarrel(); G.throwT = D.interval * (1 - .12 * (L.round - 1)) * (.75 + Math.random() * .5); } }
  if (L.type === 'factory') { for (const b of L.belts) { b.crateT -= dt; if (b.crateT <= 0) { b.crateT = (2.6 + Math.random() * 1.6) / speedMul() * (b.k === 1 ? 1 : 1.3); const x = b.belt > 0 ? b.x1 + .4 : b.x2 - .4; H.push({ type: 'crate', x, y: b.y1, seg: b, state: 'ride', r: .4, mesh: crateMesh() }); } }
    G.fireT -= dt; if (G.fireT <= 0) { G.fireT = 9 / D.spd; spawnFire(14, 2, Math.random() < .5 ? -1 : 1, true); if (drumFx) drumFx.boost = 1; } }
  if (L.type === 'lifts') { G.springT -= dt; if (G.springT <= 0) { G.springT = D.interval * 1.15 * (1 - .1 * (L.round - 1)) * (.8 + Math.random() * .4); H.push({ type: 'spring', x: L.ape.x + 1.2, y: 24, state: 'bounce', t: 0, r: .35, mesh: springMesh() }); G.apeAnim = .6; SFX.throw(); } }
  if (L.type === 'rivets') { G.fireT -= dt; if (G.fireT <= 0) { G.fireT = 6 / D.spd; const k = Math.floor(Math.random() * 4); const fl = L.segs.filter(s => s.k === k && !s.dead && s.kind !== 'rivet'); const s = fl[Math.floor(Math.random() * fl.length)]; if (s && !(P.seg && P.seg.k === k)) spawnFire(Math.random() < .5 ? s.x1 + .3 : s.x2 - .3, k, Math.random() < .5 ? 1 : -1); } }
  for (const h of H.slice()) { if (h.type === 'barrel') updateBarrel(h, dt); else if (h.type === 'fire') updateFire(h, dt); else if (h.type === 'crate') updateCrate(h, dt); else updateSpring(h, dt); }
  // collisions
  for (const h of H.slice()) {
    if (P.hammer > 0 && h.type !== 'spring') { const reach = Math.abs(P.x + P.face * .6 - h.x) < .9 && Math.abs(P.y + .6 - h.y - h.r) < 1.1; if (reach || hits(h)) { removeHazard(h); SFX.smash(); burst(h.x, h.y + .4, h.type === 'fire' ? 0xff8a2a : 0xc8924a, 12); addScore(h.type === 'fire' ? 500 : 300, h.x, h.y + 1.2); continue; } }
    if (hits(h)) { die(); break; }
    if (P.state === 'air' && !h.scored && h.type !== 'spring' && Math.abs(P.x - h.x) < .6 && P.y > h.y + h.r * 1.4 && P.y < h.y + 3) { h.scored = true; G.cheer = 1; if (Math.random() < .55) say('over'); addScore(100, h.x, h.y + 1.6); SFX.score(); }
  }
  if (P.state !== 'dead' && L.type !== 'rivets' && Math.abs(P.x - L.ape.x) < 1.3 && P.y > L.ape.y - 1.4 && P.y < L.ape.y + 2.6) die();
  if (P.state !== 'dead' && L.drum && Math.abs(P.x - L.drum.x) < .8 && Math.abs(P.y - L.drum.y) < 1.2) die();
  // bonus counts down
  G.bonusT += dt; if (G.bonusT >= D.tick) { G.bonusT = 0; if (G.bonus > 0) { G.bonus -= 100; hud(); if (G.bonus <= 0 && D.bonusKill) die(); } }
  // reached Pickles?
  if (P.state === 'walk' && L.type !== 'rivets' && P.seg && P.seg.k === L.goalK) win();
  if (L.type === 'rivets' && G.rivets <= 0) { win(); G.apeFall = 0; }
  animate(dt);
}

/* ================================================================
   Animation and camera
   ================================================================ */
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function animate(dt) {
  // hero: posed every frame from the player state, with a face that reacts
  const h = hero, b = h.body; h.g.position.set(P.x, P.y, .3);
  const moving = (inp.l || inp.r) && P.state === 'walk';
  P.idleT = P.state === 'walk' && !moving && !P.prone && G.mode === 'play' ? (P.idleT || 0) + dt : 0;
  if (P.idleT > 4 && G.t - (P.idleSaid || -99) > 9) { P.idleSaid = G.t; say('idle'); }
  const idle = P.idleT > 2.2 || G.mode === 'title';
  const turn = P.state === 'climb' ? Math.PI / 2 : P.state === 'dead' ? b.rotation.y : idle ? (P.face > 0 ? -1.1 : Math.PI + 1.1) : P.face > 0 ? -.45 : Math.PI + .45;
  if (P.state !== 'dead') b.rotation.y = lerp(b.rotation.y, turn, 1 - Math.exp(-dt * 14));
  const an = P.anim, sw = Math.sin(an), t = G.t; G.cheer = Math.max(0, (G.cheer || 0) - dt * 1.5); P.squash = Math.max(0, (P.squash || 0) - dt * 4);
  const J = { hipsY: .78, hipsX: 0, lean: 0, bodyZ: 0, bodyY: 0, headZ: 0, headY: 0, thL: 0, thR: 0, knL: 0, knR: 0, ftL: 0, ftR: 0, shLz: .15, shRz: .15, shLx: -.15, shRx: .15, elL: .3, elR: .3 };
  if (P.state === 'dead') { b.rotation.y += dt * 12; J.bodyZ = Math.min(Math.PI / 2, P.deadT * 2.5); J.shLx = -1.4; J.shRx = 1.4; J.thL = .5; J.thR = -.3; }
  else if (G.mode === 'clear') { const hop = Math.abs(Math.sin(t * 7)); J.hipsY += hop * .25; J.shLz = J.shRz = 2.8; J.shLx = -.4; J.shRx = .4; J.elL = J.elR = .2; J.knL = J.knR = -hop * .6; J.thL = J.thR = hop * .3; }
  else if (P.prone) { J.bodyZ = -Math.PI / 2 + .05; J.bodyY = .22; const c = moving ? Math.sin(t * 9) : 0; J.shLz = 2.6 + c * .5; J.shRz = 2.6 - c * .5; J.elL = J.elR = .5; J.thL = c * .3; J.thR = -c * .3; J.knL = J.knR = -.3; J.headZ = .9; J.headY = .5; }
  else if (P.state === 'walk' && moving) { J.hipsY += Math.abs(sw) * .05; J.lean = -.14; J.thL = sw * .7; J.thR = -sw * .7; J.knL = -Math.max(0, -Math.cos(an)) * .9 - .1; J.knR = -Math.max(0, Math.cos(an)) * .9 - .1; J.ftL = J.ftR = .1; J.shLz = -sw * .7; J.shRz = sw * .7; J.elL = .5 + Math.max(0, -sw) * .5; J.elR = .5 + Math.max(0, sw) * .5; J.headZ = Math.sin(an * 2) * .04; }
  else if (P.state === 'air') { const up = P.vy > 0; J.thL = 1.0; J.knL = -1.3; J.thR = up ? -.3 : .2; J.knR = up ? -.4 : -.6; J.shLz = up ? 2.6 : 1.8; J.shRz = P.hammer > 0 ? J.shRz : up ? 2.4 : 1.4; J.shLx = -.5; J.shRx = .5; J.elL = J.elR = .3; J.lean = -.1; }
  else if (P.state === 'climb') { J.shLz = 2.7 + sw * .35; J.shRz = 2.7 - sw * .35; J.elL = .3 + Math.max(0, sw) * .6; J.elR = .3 + Math.max(0, -sw) * .6; J.thL = .6 + Math.max(0, sw) * .7; J.thR = .6 + Math.max(0, -sw) * .7; J.knL = -1 - Math.max(0, sw) * .5; J.knR = -1 - Math.max(0, -sw) * .5; J.lean = .05; }
  else { // standing: breathe, tap a foot, look around, and sometimes wave
    J.hipsY += Math.sin(t * 2.2) * .008; J.lean = Math.sin(t * 2.2) * .02;
    if (idle) { const ph = (P.idleT || 0) % 6; J.headY = Math.sin(t * .9) * .5; if (ph > 3 || G.mode === 'title') { J.shLz = 2.9; J.shLx = -.3; J.elL = .4 + Math.sin(t * 10) * .5; } J.ftL = Math.max(0, Math.sin(t * 6)) * .35; }
  }
  if (G.cheer > 0 && P.state === 'air') { J.shLz = 3; J.shRz = P.hammer > 0 ? J.shRz : 3; }
  if (P.hammer > 0 && P.state !== 'climb' && P.state !== 'dead') { J.shRz = 1.3 + Math.sin(t * 14) * 1.5; J.shRx = .2; J.elR = .2; h.hammer.visible = P.hammer > 2 || Math.sin(t * 20) > 0; }
  const k8 = 1 - Math.exp(-dt * 18), L8 = (o, key, v) => { o[key] = lerp(o[key], v, k8); };
  L8(h.hips.position, 'y', J.hipsY - P.squash * .12); L8(h.hips.position, 'x', J.hipsX); L8(h.torso.rotation, 'z', J.lean); L8(b.rotation, 'z', J.bodyZ); L8(b.position, 'y', J.bodyY); L8(b.position, 'x', P.prone ? -P.face * .95 : 0);
  L8(h.head.rotation, 'z', J.headZ); L8(h.head.rotation, 'y', J.headY);
  L8(h.thighL.rotation, 'z', J.thL); L8(h.thighR.rotation, 'z', J.thR); L8(h.kneeL.rotation, 'z', J.knL); L8(h.kneeR.rotation, 'z', J.knR); L8(h.footL.rotation, 'z', J.ftL); L8(h.footR.rotation, 'z', J.ftR);
  L8(h.shL.rotation, 'z', J.shLz); L8(h.shR.rotation, 'z', J.shRz); L8(h.shL.rotation, 'x', J.shLx); L8(h.shR.rotation, 'x', J.shRx); L8(h.elL.rotation, 'z', J.elL); L8(h.elR.rotation, 'z', J.elR);
  h.torso.scale.y = 1 + Math.sin(t * 2.2) * .015 - P.squash * .08;
  // face: blink, look at danger, smile, grin or gasp
  let near = 99, nx = 0; for (const z of H) { const d = Math.hypot(z.x - P.x, (z.y - P.y) * 1.5); if (d < near) { near = d; nx = z.x - P.x; } }
  const scared = P.state !== 'dead' && G.mode === 'play' && near < 2.6 && !(P.hammer > 0);
  if (scared && !P.wasScared && Math.random() < .35) say('scared');
  P.wasScared = scared;
  const blink = (t % 3.7) < .12 || P.state === 'dead';
  for (const e of h.eyes) e.scale.y = blink ? .12 : scared ? 1.25 : 1;
  for (const pu of h.pupils) { pu.position.y = scared ? .005 : 0; pu.position.z = clamp(nx * P.face * -.01, -.012, .012); }
  h.brows.forEach((br, i) => { br.position.y = scared ? .135 : P.state === 'climb' ? .105 : .115; br.rotation.x = (i ? -1 : 1) * (scared ? -.25 : P.hammer > 0 ? .35 : 0); });
  const happy = G.mode === 'clear' || G.cheer > 0 || P.hammer > 0 || idle;
  h.grin.visible = happy && !scared; h.oh.visible = scared || P.state === 'dead' || (P.state === 'air' && P.vy > 2 && !happy); h.smile.visible = !h.grin.visible && !h.oh.visible;
  h.bubble.visible = G.t < (G.sayUntil || 0) && G.mode !== 'title';
  // gorilla
  G.apeAnim = Math.max(0, (G.apeAnim || 0) - dt);
  const a = ape; a.body.position.y = Math.abs(Math.sin(G.t * 3)) * .08;
  if (G.apeAnim > 0) { a.armR.rotation.z = -2.6 * Math.sin(G.apeAnim / .6 * Math.PI); a.armL.rotation.z = 0; }
  else { const beat = Math.sin(G.t * 9) > 0 && Math.sin(G.t * .9) > .3; a.armL.rotation.z = beat ? .6 + Math.sin(G.t * 18) * .3 : .15; a.armR.rotation.z = beat ? -.6 - Math.sin(G.t * 18) * .3 : -.15; a.armL.rotation.x = a.armR.rotation.x = beat ? -1 : 0; }
  a.head.rotation.y = Math.sin(G.t * .7) * .3; a.mouth.scale.y = G.apeAnim > 0 || (Math.sin(G.t * .9) > .3) ? 2.4 : 1;
  if (L.type === 'rivets' && G.mode === 'play') a.g.position.x = L.ape.x + Math.sin(G.t * .6) * 3;
  if (L.type === 'rivets' && G.mode === 'clear') { G.apeFall = (G.apeFall || 0) + dt; a.g.position.y = Math.max(-.2, L.ape.y - G.apeFall * G.apeFall * 9); a.g.rotation.z = Math.min(Math.PI, G.apeFall * 3); }
  // puppy
  puppy.tail.rotation.z = Math.sin(G.t * (G.mode === 'clear' ? 30 : 12)) * .6; puppy.g.position.y = L.puppy.y + (G.mode === 'clear' ? Math.abs(Math.sin(G.t * 8)) * .5 : 0);
  puppy.bubble.visible = G.mode !== 'clear' && Math.sin(G.t * 3) > -.4;
  // hazards
  for (const z of H) {
    const m = z.mesh; m.position.set(z.x, z.y + (z.type === 'barrel' ? z.r : 0), z.type === 'barrel' ? .2 : .3);
    if (P.prone && z.type !== 'fire' && Math.abs(z.y - P.y) < .6) { const dx = Math.abs(z.x - P.x); if (dx < 1.3) m.position.y += .55 * Math.cos(dx / 1.3 * Math.PI / 2); }
    if (z.type === 'barrel') { if (z.state === 'ladder') { m.rotation.set(0, Math.PI / 2, 0); } else m.rotation.set(0, 0, z.rot); }
    else if (z.type === 'fire') { const s = 1 + Math.sin(G.t * 20 + z.t) * .08; m.scale.set(s, 1 / s, s); m.position.y += Math.abs(Math.sin(G.t * 6 + z.t)) * .15; }
    else if (z.type === 'spring') { const sq = z.state === 'bounce' ? .6 + .4 * Math.min(1, (z.y - floorSeg(L, L.springK, 12).y1) / .6) : 1; m.scale.set(1, sq, 1); }
  }
  for (const it of L.items) if (!it.taken) { it.mesh.rotation.y += dt * 2; it.mesh.position.y = it.y + Math.sin(G.t * 3 + it.x) * .12; }
  if (drumFx) { drumFx.boost = Math.max(0, drumFx.boost - dt); drumFx.flames.forEach((f, i) => { const s = .8 + Math.sin(G.t * 17 + i * 2) * .25 + drumFx.boost * 1.5; f.scale.set(s, s * 1.3, s); }); drumFx.light.intensity = 25 + Math.sin(G.t * 23) * 6 + drumFx.boost * 40; }
  // popups and sparks
  for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; if (f.g) f.vy -= f.g * dt; f.obj.position.y += f.vy * dt; if (f.vx) f.obj.position.x += f.vx * dt; if (f.obj.material && f.obj.isSprite) f.obj.material.opacity = 1 - f.t / f.life; if (f.t > f.life) { levelGroup.remove(f.obj); if (f.obj.material.map) f.obj.material.map.dispose(); f.obj.material.dispose(); fx.splice(i, 1); } }
  // camera
  const aspect = camera.aspect, tanH = Math.tan(camera.fov * Math.PI / 360);
  let want, look; const cm = G.mode === 'title' ? 1 : G.cam;
  if (cm === 1) { const dist = Math.max((L.top + 8) / 2 / tanH, (W / 2 + 2) / (tanH * aspect)); look = new THREE.Vector3(W / 2, L.top / 2 - 1, 0); want = new THREE.Vector3(W / 2, L.top / 2, dist); }
  else { const near = cm === 2 ? 15 : 20, halfW = near * tanH * aspect, halfH = near * tanH; const tx = halfW * 2 >= W + 2 ? W / 2 : clamp(P.x, halfW - 1, W + 1 - halfW), ty = clamp(P.y + 1.2, halfH - 4, L.top - halfH + 2);
    look = new THREE.Vector3(tx, ty, 0); want = cm === 2 ? new THREE.Vector3(tx + (P.x > W / 2 ? -9 : 9), ty + 4, near * .9) : new THREE.Vector3(tx + (P.x - W / 2) * .12, ty + 1.5, near); }
  if (!G.camInit) { camPos.copy(want); camLook.copy(look); G.camInit = true; }
  camPos.lerp(want, 1 - Math.exp(-dt * 4)); camLook.lerp(look, 1 - Math.exp(-dt * 5)); camera.position.copy(camPos); camera.lookAt(camLook); if (G.debugCam) { const [px, py, pz, lx, ly, lz] = G.debugCam; camera.position.set(px, py, pz); camera.lookAt(lx, ly, lz); }
}

/* ================================================================
   HUD and screens
   ================================================================ */
function hud() {
  $('score').textContent = G.score.toLocaleString(); $('hi').textContent = 'HI ' + Math.max(save.hi, G.score).toLocaleString();
  $('lives').textContent = G.lives > 6 ? '❤ × ' + G.lives : '❤'.repeat(Math.max(0, G.lives)); $('lvl').textContent = L ? 'L' + (G.level + 1) + ' · ' + L.name : '';
  $('bonus').textContent = G.bonus; $('rivets').classList.toggle('hide', !L || L.type !== 'rivets'); $('rivets').textContent = '🔩 ' + G.rivets + ' left';
}
function flash(t, sub, sec) { $('msg').innerHTML = t + (sub ? '<small>' + sub + '</small>' : ''); $('msg').style.opacity = 1; G.msgT = sec || 1.6; }
const SCREENS = ['title', 'select', 'help', 'pause', 'clear', 'over'];
function showScreen(id) {
  for (const s of SCREENS) { $(s).classList.toggle('hide', s !== id); $(s).classList.toggle('show', s === id); }
  const playing = id === null || id === 'pause'; $('hud').classList.toggle('hide', !playing); $('touch').classList.toggle('hide', id !== null);
  if (id === 'select') buildSelect();
}
function showClear() {
  const last = G.level === LEVELS.length - 1;
  $('clearTitle').textContent = last ? 'YOU SAVED PICKLES!' : 'LEVEL CLEAR!';
  $('clearSub').innerHTML = (last ? 'Big Bongo gives up. You beat all 12 levels on ' + G.diff + '!' : 'Pickles is safe for now... but Big Bongo grabbed her again and climbed higher!') + '<br><b>Bonus +' + G.clearBonus.toLocaleString() + '</b> · Score ' + G.score.toLocaleString();
  $('clearNext').classList.toggle('hide', last); showScreen('clear');
  if (last) confetti();
}
function confetti() { for (let i = 0; i < 80; i++) { const d = document.createElement('div'); d.className = 'confetti'; d.style.left = Math.random() * 100 + 'vw'; d.style.background = ['#ffd34d', '#e8323c', '#3ad8e8', '#5ad86a', '#ff8ad8'][i % 5]; d.style.animationDuration = 2 + Math.random() * 2 + 's'; d.style.animationDelay = Math.random() + 's'; document.body.appendChild(d); setTimeout(() => d.remove(), 5000); } }
function buildSelect() {
  const box = $('levels'); box.innerHTML = '';
  for (const b of $('diff').children) b.setAttribute('aria-pressed', b.dataset.v === G.diff);
  LEVELS.forEach((lv, i) => {
    const b = document.createElement('button'); b.className = 'lv' + (save.cleared[G.diff].includes(i) ? ' done' : ''); b.type = 'button';
    const stars = ['easy', 'medium', 'hard'].map(d => save.cleared[d].includes(i) ? '★' : '☆').join('');
    b.innerHTML = '<i>' + lv.icon + '</i><b>' + (i + 1) + '</b><span>' + lv.name + '</span><em>' + stars + '</em>';
    b.onclick = () => { audio(); startGame(i); }; box.appendChild(b);
  });
  $('selHi').textContent = save.hi ? 'High score ' + save.hi.toLocaleString() : '';
}

/* ================================================================
   Input
   ================================================================ */
const KEYS = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' };
addEventListener('keydown', e => {
  if (KEYS[e.key]) { inp[KEYS[e.key]] = 1; e.preventDefault(); }
  if ((e.key === ' ' || e.key === 'z' || e.key === 'Z') && !e.repeat) { inp.jump = 1; e.preventDefault(); }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
  if (e.key === 'c' || e.key === 'C') cycleCam();
  if (e.key === 'm' || e.key === 'M') toggleMute();
});
addEventListener('keyup', e => { if (KEYS[e.key]) inp[KEYS[e.key]] = 0; });
for (const [id, k] of [['bL', 'l'], ['bR', 'r'], ['bU', 'u'], ['bD', 'd'], ['bJ', 'jump']]) {
  const el = $(id); const on = e => { e.preventDefault(); audio(); el.classList.add('on'); if (k === 'jump') inp.jump = 1; else inp[k] = 1; try { el.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } };
  const off = e => { e.preventDefault(); el.classList.remove('on'); if (k !== 'jump') inp[k] = 0; };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
}
function togglePause() { if (G.mode !== 'play') return; G.paused = !G.paused; showScreen(G.paused ? 'pause' : null); }
function cycleCam() { G.cam = (G.cam + 1) % 3; flash(['Close camera', 'Whole tower', '3D side camera'][G.cam], '', 1); }
function toggleMute() { muted = !muted; $('bSnd').textContent = muted ? '🔇' : '🔊'; }
$('bPause').onclick = togglePause; $('bCam').onclick = cycleCam; $('bSnd').onclick = toggleMute;
$('goPlay').onclick = () => { audio(); showScreen('select'); }; $('goHelp').onclick = () => showScreen('help'); $('helpBack').onclick = () => showScreen('title');
$('selBack').onclick = () => showScreen('title');
for (const b of $('diff').children) b.onclick = () => { G.diff = b.dataset.v; save.diff = G.diff; store(); buildSelect(); };
$('resume').onclick = togglePause; $('restart').onclick = () => { G.paused = false; startGame(G.level); }; $('toLevels').onclick = () => { G.paused = false; G.mode = 'title'; showScreen('select'); };
$('clearNext').onclick = () => { G.level++; startLevel(); }; $('clearLevels').onclick = () => { G.mode = 'title'; showScreen('select'); };
$('overAgain').onclick = () => startGame(G.level); $('overLevels').onclick = () => { G.mode = 'title'; showScreen('select'); };
document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused) togglePause(); });

/* ================================================================
   Loop
   ================================================================ */
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
// a demo tower behind the title screen
G.level = 0; L = buildLevel(0); buildScene(); resetLife();
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - last) / 1000, 0, .05); last = now;
  if (!G.paused) { if (G.mode === 'title') { G.t += dt; animate(dt); } else { update(dt / 2); update(dt / 2); } }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
G.mode = 'title'; G.cam = 0; G.camInit = false;
showScreen('title');
BZ.ok = true;
BZ.debug = { get hero() { return hero; }, G, P, inp, H, get L() { return L; }, startGame, startLevel, update, LEVELS, DIFF, save, floorSeg, yAt, win, die };
}
