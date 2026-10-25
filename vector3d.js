/* Vector Guard: a neon vector-style grid defender in the spirit of the early-80s console classic.
   Fly over the energy grid, build energy blocks into the glowing pattern, and blast the Hackers,
   Zappers and Bouncers that try to wreck it. Every fourth level a Mother Saucer attacks. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const VG = { ok: false }; window.VG = VG;
const $ = id => document.getElementById(id);
const canvas = $('c');
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x02030a);
const camera = new THREE.PerspectiveCamera(50, 1, .1, 600);

/* ================================================================
   Settings, levels and saved progress
   ================================================================ */
const COLS = 11, ROWS = 7, CS = 4, HW = COLS * CS / 2, HD = ROWS * CS / 2;
const cellX = c => (c - (COLS - 1) / 2) * CS, cellZ = r => (r - (ROWS - 1) / 2) * CS;
const cellAt = (x, z) => ({ c: Math.round(x / CS + (COLS - 1) / 2), r: Math.round(z / CS + (ROWS - 1) / 2) });
const DIFF = {
  easy:   { lives: 5, spd: .62, spawn: 1.6, maxE: 4, hack: 3.6, shot: 8,  homing: true,  auto: true,  regen: 1.8, podHp: 10 },
  medium: { lives: 3, spd: .85, spawn: 1.1, maxE: 6, hack: 2.6, shot: 11, homing: false, auto: false, regen: 2.4, podHp: 16 },
  hard:   { lives: 3, spd: 1.05, spawn: .8, maxE: 9, hack: 1.8, shot: 14, homing: false, auto: false, regen: 3,   podHp: 22 },
};
const P_ = s => s.trim().split('\n').map(r => r.trim());
const LEVELS = [
  { name: 'First Light', pat: P_(`
...........
...........
....###....
....#C#....
....###....
...........
...........`) },
  { name: 'Power Cross', pat: P_(`
...........
.....#.....
.....#.....
..###C###..
.....#.....
.....#.....
...........`) },
  { name: 'Twin Walls', pat: P_(`
...........
..#######..
...........
.....C.....
...........
..#######..
...........`) },
  { name: 'Mother Saucer', boss: true, pat: P_(`
...........
...........
....###....
....#C#....
....###....
...........
...........`) },
  { name: 'The Ring', pat: P_(`
...........
...#####...
...#...#...
...#.C.#...
...#...#...
...#####...
...........`) },
  { name: 'Victory V', pat: P_(`
.#.......#.
..#.....#..
...#...#...
....#C#....
...........
...........
...........`) },
  { name: 'Diamond Mine', pat: P_(`
.....#.....
....#.#....
...#...#...
..#..C..#..
...#...#...
....#.#....
.....#.....`) },
  { name: 'Saucer Storm', boss: true, pat: P_(`
...........
.....#.....
.....#.....
..###C###..
.....#.....
.....#.....
...........`) },
  { name: 'Checkerboard', pat: P_(`
...........
..#.#.#.#..
...#.#.#...
..#.#C#.#..
...#.#.#...
..#.#.#.#..
...........`) },
  { name: 'Power Plants', pat: P_(`
...........
.###...###.
.###...###.
.###.C.###.
...........
...........
...........`) },
  { name: 'The Fortress', pat: P_(`
###########
#.........#
#.........#
#....C....#
#.........#
#.........#
###########`) },
  { name: 'Final Saucer', boss: true, pat: P_(`
...........
...#####...
...#...#...
...#.C.#...
...#...#...
...#####...
...........`) },
];
const SAVE_KEY = 'vectorguard';
const save = (() => { const d = { hi: 0, diff: 'easy', cleared: { easy: [], medium: [], hard: [] } }; try { return Object.assign(d, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { return d; } })();
const store = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* private mode */ } };
const G = { mode: 'title', diff: save.diff, level: 0, score: 0, lives: 3, energy: 6, t: 0, paused: false, msgT: 0 };
let D = DIFF[G.diff];

/* ================================================================
   Neon helpers
   ================================================================ */
const glowTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const glow = (color, size, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op == null ? 1 : op })); s.scale.set(size, size, 1); return s; };
const lineMat = c => new THREE.LineBasicMaterial({ color: c });
const wire = (geo, color) => new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), lineMat(color));
const fill = (geo, color, op) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
const neon = (geo, color, op) => { const g = new THREE.Group(); g.add(fill(geo, color, op == null ? .22 : op)); g.add(wire(geo, color)); return g; };

/* ================================================================
   The arena
   ================================================================ */
{
  const p = []; for (let i = 0; i < 900; i++) { const a = Math.random() * TAU, r = 60 + Math.random() * 200; p.push(Math.cos(a) * r, -30 - Math.random() * 120, Math.sin(a) * r - 40); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8fb0ff, size: .7 })));
  const pts = [];
  for (let c = 0; c <= COLS; c++) { const x = -HW + c * CS; pts.push(x, 0, -HD, x, 0, HD); }
  for (let r = 0; r <= ROWS; r++) { const z = -HD + r * CS; pts.push(-HW, 0, z, HW, 0, z); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: 0x1a3a9a })));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2, HD * 2), new THREE.MeshBasicMaterial({ color: 0x050a24 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.05; scene.add(floor);
  for (const [w, d] of [[HW * 2 + .6, HD * 2 + .6], [HW * 2 + 1.4, HD * 2 + 1.4]]) { const b = wire(new THREE.BoxGeometry(w, .6, d), w > HW * 2 + 1 ? 0x2a5aff : 0x5ad8ff); b.position.y = .3; scene.add(b); }
}
const core = new THREE.Group(); scene.add(core);
core.add(neon(new THREE.IcosahedronGeometry(1.3, 0), 0xffffff, .15)); const coreGlow = glow(0x9fe8ff, 7, .7); coreGlow.position.y = 1.2; core.add(coreGlow);
const coreRing = wire(new THREE.TorusGeometry(1.9, .05, 4, 24), 0x5ad8ff); coreRing.rotation.x = Math.PI / 2; core.add(coreRing); core.position.y = 1.4;

let levelGroup = new THREE.Group(); scene.add(levelGroup);
const BLOCK_GEO = new THREE.BoxGeometry(3.2, 1.6, 3.2), TARGET_GEO = new THREE.PlaneGeometry(3.4, 3.4);
const cells = [];           // cells[r][c] = { target, block, hack, mesh }
function buildLevelScene() {
  scene.remove(levelGroup); levelGroup = new THREE.Group(); scene.add(levelGroup);
  const pat = LEVELS[G.level].pat; cells.length = 0; G.targets = 0;
  for (let r = 0; r < ROWS; r++) { cells.push([]); for (let c = 0; c < COLS; c++) {
    const ch = pat[r][c], cell = { c, r, target: ch === '#', block: null, hack: 0 };
    if (ch === 'C') { core.position.x = cellX(c); core.position.z = cellZ(r); }
    if (cell.target) { G.targets++; const t = new THREE.Group(); const pl = fill(TARGET_GEO, 0x5ad8ff, .07); pl.rotation.x = -Math.PI / 2; t.add(pl); const o = wire(new THREE.BoxGeometry(3.4, .02, 3.4), 0x2a9ad8); t.add(o); t.position.set(cellX(c), .05, cellZ(r)); levelGroup.add(t); cell.marker = t; }
    cells[r].push(cell);
  } }
}
function blockMesh() { const g = neon(BLOCK_GEO, 0x3aff8a, .2); const top = glow(0x3aff8a, 4, .35); top.position.y = 1.2; g.add(top); g.position.y = .8; return g; }

/* ================================================================
   Ship, enemies, bullets
   ================================================================ */
const shipShape = new THREE.Shape(); shipShape.moveTo(1.6, 0); shipShape.lineTo(-1, .95); shipShape.lineTo(-.55, 0); shipShape.lineTo(-1, -.95); shipShape.closePath();
const SHIP_GEO = new THREE.ExtrudeGeometry(shipShape, { depth: .4, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, .2, 0);
const ship = { g: new THREE.Group(), x: 0, z: 0, vx: 0, vz: 0, ang: 0, inv: 0, fireCD: 0, hover: 0, dead: 0 };
{ const body = neon(SHIP_GEO, 0x5ad8ff, .3); ship.g.add(body); const cockpit = neon(new THREE.OctahedronGeometry(.35, 0), 0xffffff, .3); cockpit.position.set(.3, .55, 0); ship.g.add(cockpit);
  ship.flame = glow(0xff9a3a, 1.6, .9); ship.flame.position.set(-.9, .3, 0); ship.g.add(ship.flame); ship.halo = glow(0x5ad8ff, 4.5, .25); ship.g.add(ship.halo);
  const shield = wire(new THREE.IcosahedronGeometry(1.8, 1), 0x9ff8ff); ship.g.add(shield); ship.shield = shield; scene.add(ship.g); }
const E = [], B = [], S = [], FX = [];   // enemies, player bullets, enemy shots, effects
const ENEMY = {
  hacker:  { color: 0xff3ad8, geo: new THREE.OctahedronGeometry(1, 0), r: 1, hp: 1, pts: 100 },
  zapper:  { color: 0xffe83a, geo: new THREE.TorusGeometry(.9, .28, 4, 8), r: 1.1, hp: 2, pts: 200 },
  bouncer: { color: 0xff8a2a, geo: new THREE.IcosahedronGeometry(.9, 0), r: .95, hp: 1, pts: 150 },
};
function spawnEnemy(type, x, z) {
  const T = ENEMY[type]; if (x == null) { const side = Math.floor(Math.random() * 4); x = side < 2 ? (Math.random() - .5) * HW * 2 : (side === 2 ? -HW : HW); z = side < 2 ? (side ? HD : -HD) : (Math.random() - .5) * HD * 2; }
  const m = neon(T.geo, T.color, .25); m.add(glow(T.color, 3.4, .45)); m.position.set(x, 1, z); levelGroup.add(m);
  const e = { type, x, z, vx: 0, vz: 0, hp: T.hp, r: T.r, m, t: Math.random() * 9, cd: 1 + Math.random() * 2, target: null };
  if (type === 'bouncer') { const a = Math.random() * TAU; e.vx = Math.cos(a) * 9; e.vz = Math.sin(a) * 9; }
  E.push(e); return e;
}
function makeBoss() {
  const g = new THREE.Group(); const ring = neon(new THREE.TorusGeometry(5, .7, 6, 28), 0xff3a4a, .18); ring.rotation.x = Math.PI / 2; g.add(ring);
  const dome = neon(new THREE.SphereGeometry(2.2, 12, 6, 0, TAU, 0, Math.PI / 2), 0xff6a3a, .2); g.add(dome); g.add(glow(0xff3a4a, 16, .35));
  const pods = []; for (let i = 0; i < 3; i++) { const p = neon(new THREE.OctahedronGeometry(1.3, 0), 0xffffff, .3); p.add(glow(0xffd34d, 4, .6)); g.add(p); pods.push({ m: p, hp: D.podHp, a: i / 3 * TAU, x: 0, z: 0 }); }
  g.position.y = 2.6; levelGroup.add(g);
  return { g, pods, x: 0, z: 0, t: 0, spawnT: 3, fireT: 2.5, hurt: 0 };
}
function bullet(x, z, vx, vz, friendly, color) {
  const m = glow(color || (friendly ? 0xfff0a0 : 0xff4a6a), friendly ? 1.4 : 1.6); m.position.set(x, 1, z); levelGroup.add(m);
  const core_ = new THREE.Mesh(new THREE.SphereGeometry(friendly ? .18 : .26, 8, 6), new THREE.MeshBasicMaterial({ color: friendly ? 0xffffff : 0xffb0c0 })); m.add(core_);
  (friendly ? B : S).push({ x, z, vx, vz, life: friendly ? .7 : 4, m });
}
function boom(x, z, color, n, size) {
  for (let i = 0; i < (n || 14); i++) { const a = Math.random() * TAU, s = 4 + Math.random() * 10; const m = glow(color, (size || 1) * (.6 + Math.random() * .8)); m.position.set(x, 1, z); levelGroup.add(m); FX.push({ m, vx: Math.cos(a) * s, vz: Math.sin(a) * s, vy: Math.random() * 6, life: .5 + Math.random() * .4, t: 0 }); }
  const ring = wire(new THREE.TorusGeometry(1, .04, 4, 24), color); ring.rotation.x = Math.PI / 2; ring.position.set(x, 1, z); levelGroup.add(ring); FX.push({ m: ring, ring: true, life: .45, t: 0, s: (size || 1) * 6 });
}
function popup(text, x, z, color) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c = cv.getContext('2d'); c.font = '900 40px "Trebuchet MS", sans-serif'; c.textAlign = 'center'; c.fillStyle = color || '#fff'; c.shadowColor = color || '#5ad8ff'; c.shadowBlur = 12; c.fillText(text, 128, 46);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthTest: false })); s.scale.set(5, 1.25, 1); s.position.set(x, 3, z); s.renderOrder = 9; levelGroup.add(s); FX.push({ m: s, vy: 3, vx: 0, vz: 0, life: 1, t: 0, text: true });
}

/* ================================================================
   Sound
   ================================================================ */
let AC = null, muted = false;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f0, f1, d, type, vol, delay) { if (muted || !AC) return; const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d); g.gain.setValueAtTime(vol || .06, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); }
const SFX = {
  fire: () => tone(1400, 500, .07, 'square', .025), build: () => { tone(300, 600, .1, 'triangle', .07); tone(600, 900, .1, 'triangle', .05, .08); }, pop: () => tone(500, 60, .25, 'sawtooth', .07),
  hit: () => tone(200, 120, .06, 'square', .04), hurt: () => [500, 380, 260, 160].forEach((f, i) => tone(f, f * .8, .14, 'sawtooth', .07, i * .1)), hack: () => tone(90, 70, .3, 'sawtooth', .05),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, .16, 'square', .05, i * .1)), zap: () => tone(900, 200, .15, 'triangle', .04), power: () => tone(1200, 1800, .08, 'sine', .04),
};

/* ================================================================
   Game flow
   ================================================================ */
function clearActors() { for (const a of [...E, ...B, ...S, ...FX]) levelGroup.remove(a.m); E.length = B.length = S.length = FX.length = 0; }
function startGame(level) { G.level = level; G.score = 0; D = DIFF[G.diff]; G.lives = D.lives; startLevel(); }
function startLevel() {
  clearActors(); buildLevelScene(); G.boss = LEVELS[G.level].boss ? makeBoss() : null;
  G.built = 0; G.energy = 6; G.regenT = 0; G.spawnT = 2; G.powerT = 0; G.mode = 'play'; G.paused = false; G.clearT = 0; G.camInit = false;
  respawnShip(); recomputePower(); showScreen(null); hud();
  flash(LEVELS[G.level].name, 'Level ' + (G.level + 1) + ' · ' + G.diff.toUpperCase() + (G.boss ? ' · shoot the 3 glowing pods!' : ' · build the glowing squares'), 2.4);
}
function respawnShip() {
  // come back at the spot farthest from the saucer and the enemies
  let bx = core.position.x, bz = core.position.z + 4, best = -1;
  for (const [x, z] of [[0, 4], [0, -10], [-16, 9], [16, 9], [-16, -9], [16, -9], [-18, 0], [18, 0]]) { let d = 99; for (const e of E) d = Math.min(d, Math.hypot(e.x - x, e.z - z)); if (G.boss && !G.boss.dead) d = Math.min(d, Math.hypot(G.boss.x - x, G.boss.z - z) - 4); if (d > best + 3) { best = d; bx = x; bz = z; } }
  ship.x = bx; ship.z = bz; ship.vx = ship.vz = 0; ship.ang = -Math.PI / 2; ship.inv = 2.5; ship.dead = 0; ship.g.visible = true; }
function hurtShip() {
  if (ship.inv > 0 || ship.dead > 0 || G.mode !== 'play') return;
  boom(ship.x, ship.z, 0x5ad8ff, 24, 1.4); SFX.hurt(); ship.dead = 1.6; ship.g.visible = false; G.lives--; hud();
}
function addScore(n, x, z, col) { G.score += n; if (x != null) popup(String(n), x, z, col); hud(); }
function levelClear() {
  if (G.mode !== 'play') return; G.mode = 'clear'; G.clearT = 0; SFX.win();
  for (const e of E.slice()) killEnemy(e, true); for (const s of S) levelGroup.remove(s.m); S.length = 0;
  const bonus = 1000 + G.energy * 100 + (G.boss ? 3000 : 0); G.clearBonus = bonus; G.score += bonus;
  const c = save.cleared[G.diff]; if (!c.includes(G.level)) c.push(G.level); if (G.score > save.hi) save.hi = G.score; store(); hud();
  G.blast = 0;
}
function killEnemy(e, quiet) {
  const i = E.indexOf(e); if (i < 0) return; E.splice(i, 1); levelGroup.remove(e.m); boom(e.x, e.z, ENEMY[e.type].color, 12);
  if (!quiet) { SFX.pop(); addScore(ENEMY[e.type].pts, e.x, e.z, '#' + new THREE.Color(ENEMY[e.type].color).getHexString()); G.energy = Math.min(12, G.energy + (e.type === 'hacker' ? 1 : 2)); }
  if (e.hacking) { e.hacking.hack = 0; e.hacking = null; }
}

/* blocks and power squares */
function placeBlock(cell) {
  if (!cell || !cell.target || cell.block || G.energy < 1) return false;
  G.energy--; cell.block = blockMesh(); cell.block.position.x = cellX(cell.c); cell.block.position.z = cellZ(cell.r); cell.block.scale.setScalar(.01); cell.grow = 0; levelGroup.add(cell.block);
  G.built++; SFX.build(); addScore(10); recomputePower(); hud();
  if (!G.boss && G.built >= G.targets) levelClear();
  return true;
}
function breakBlock(cell) { if (!cell.block) return; levelGroup.remove(cell.block); boom(cellX(cell.c), cellZ(cell.r), 0x3aff8a, 16); cell.block = null; cell.hack = 0; G.built--; SFX.hack(); recomputePower(); hud(); }
let powers = [];
function recomputePower() {
  for (const p of powers) levelGroup.remove(p.m); powers = [];
  for (let r = 0; r < ROWS - 1; r++) for (let c = 0; c < COLS - 1; c++) if (cells[r][c].block && cells[r][c + 1].block && cells[r + 1][c].block && cells[r + 1][c + 1].block) {
    const x = (cellX(c) + cellX(c + 1)) / 2, z = (cellZ(r) + cellZ(r + 1)) / 2, m = new THREE.Group(); const gem = neon(new THREE.OctahedronGeometry(1, 0), 0xffffff, .35); gem.position.y = 3.2; m.add(gem); const gl = glow(0x3aff8a, 6, .6); gl.position.y = 3.2; m.add(gl);
    m.position.set(x, 0, z); levelGroup.add(m); powers.push({ x, z, m, gem, cd: Math.random() });
  }
}

/* ================================================================
   Input: keys, joystick and buttons
   ================================================================ */
const inp = { l: 0, r: 0, u: 0, d: 0, fire: 0, build: 0, sx: 0, sz: 0 };
const KEYS = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd', ' ': 'fire', b: 'build', B: 'build', Shift: 'build', Enter: 'build' };
addEventListener('keydown', e => { const k = KEYS[e.key]; if (k) { if (k === 'build' && !inp.build) G.buildQ = true; inp[k] = 1; e.preventDefault(); audio(); } if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause(); if (e.key === 'm' || e.key === 'M') toggleMute(); });
addEventListener('keyup', e => { const k = KEYS[e.key]; if (k) inp[k] = 0; });
{
  const zone = $('stickZone'), base = $('stickBase'), knob = $('stickKnob'); let id = null, ox = 0, oy = 0;
  const set = (dx, dy) => { const m = Math.hypot(dx, dy), R = 56, k = m > R ? R / m : 1; dx *= k; dy *= k; knob.style.transform = `translate(${dx}px, ${dy}px)`; inp.sx = dx / R; inp.sz = dy / R; };
  zone.addEventListener('pointerdown', e => { e.preventDefault(); audio(); id = e.pointerId; ox = e.clientX; oy = e.clientY; base.style.left = ox + 'px'; base.style.top = oy + 'px'; base.classList.add('on'); set(0, 0); try { zone.setPointerCapture(id); } catch (er) { /* fine */ } });
  zone.addEventListener('pointermove', e => { if (e.pointerId === id) set(e.clientX - ox, e.clientY - oy); });
  const end = e => { if (e.pointerId !== id) return; id = null; set(0, 0); base.classList.remove('on'); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  for (const [bid, k] of [['bFire', 'fire'], ['bBuild', 'build']]) { const el = $(bid);
    el.addEventListener('pointerdown', e => { e.preventDefault(); audio(); el.classList.add('on'); inp[k] = 1; if (k === 'build') G.buildQ = true; try { el.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } });
    const off = e => { e.preventDefault(); el.classList.remove('on'); inp[k] = 0; }; el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off); }
}

/* ================================================================
   Update
   ================================================================ */
function nearestEnemy(x, z, maxD) { let best = null, bd = maxD || 1e9; for (const e of E) { const d = Math.hypot(e.x - x, e.z - z); if (d < bd) { bd = d; best = e; } } if (G.boss) for (const p of G.boss.pods) if (p.hp > 0) { const d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; best = p; } } return best; }
function update(dt) {
  G.t += dt;
  if (G.msgT > 0) { G.msgT -= dt; if (G.msgT <= 0) $('msg').style.opacity = 0; }
  updateFX(dt);
  if (G.mode === 'clear') { G.clearT += dt; G.blast += dt; if (G.clearT > 2.6 && !$('clear').classList.contains('show')) showClear(); return; }
  if (G.mode !== 'play') return;
  // ship
  if (ship.dead > 0) { ship.dead -= dt; if (ship.dead <= 0) { if (G.lives <= 0) return gameOver(); respawnShip(); } }
  else {
    let mx = inp.sx + (inp.r - inp.l), mz = inp.sz + (inp.d - inp.u); const m = Math.hypot(mx, mz); if (m > 1) { mx /= m; mz /= m; }
    const sp = 15, k = 1 - Math.exp(-dt * 9); ship.vx = lerp(ship.vx, mx * sp, k); ship.vz = lerp(ship.vz, mz * sp, k);
    ship.x = clamp(ship.x + ship.vx * dt, -HW + 1, HW - 1); ship.z = clamp(ship.z + ship.vz * dt, -HD + 1, HD - 1);
    if (m > .2) { const want = Math.atan2(mz, mx); let da = ((want - ship.ang + Math.PI) % TAU + TAU) % TAU - Math.PI; ship.ang += da * Math.min(1, dt * 14); }
    ship.inv = Math.max(0, ship.inv - dt); ship.fireCD -= dt;
    if (inp.fire && ship.fireCD <= 0) { ship.fireCD = .15; const dx = Math.cos(ship.ang), dz = Math.sin(ship.ang); bullet(ship.x + dx * 1.6, ship.z + dz * 1.6, dx * 40, dz * 40, true); SFX.fire(); }
    // building: press BUILD over a glowing square (Easy builds by itself when you hover)
    const cc = cellAt(ship.x, ship.z), cell = cells[cc.r] && cells[cc.r][cc.c], over = cell && cell.target && !cell.block && Math.abs(ship.x - cellX(cc.c)) < 1.9 && Math.abs(ship.z - cellZ(cc.r)) < 1.9;
    ship.hover = over ? ship.hover + dt : 0;
    if (over && (G.buildQ || inp.build || (D.auto && ship.hover > .35))) { if (!placeBlock(cell) && G.energy < 1 && G.buildQ) flash('Out of energy!', 'Shoot enemies or wait for it to refill', 1.2); }
    G.buildQ = false;
  }
  // energy refills slowly
  G.regenT += dt; if (G.regenT > D.regen) { G.regenT = 0; if (G.energy < 12) { G.energy++; hud(); } }
  // enemies arrive
  G.spawnT -= dt; const lv = G.level;
  if (G.spawnT <= 0 && E.length < D.maxE + Math.floor(lv / 3)) {
    G.spawnT = (2.8 - lv * .1) * D.spawn * (.7 + Math.random() * .6);
    const roll = Math.random(); spawnEnemy(lv >= 4 && roll < .25 ? 'bouncer' : lv >= 2 && roll < .5 ? 'zapper' : 'hacker');
  }
  for (const e of E.slice()) updateEnemy(e, dt);
  if (G.boss) updateBoss(dt);
  // power squares fire at the nearest enemy
  for (const p of powers) { p.cd -= dt; p.gem.rotation.y += dt * 3; if (p.cd <= 0) { const t = nearestEnemy(p.x, p.z, 16); if (t) { p.cd = 1.6; const a = Math.atan2(t.z - p.z, t.x - p.x); bullet(p.x, p.z, Math.cos(a) * 30, Math.sin(a) * 30, true, 0x3aff8a); SFX.power(); } else p.cd = .3; } }
  // player bullets
  for (const b of B.slice()) {
    if (D.homing) { const t = nearestEnemy(b.x, b.z, 9); if (t) { const a = Math.atan2(t.z - b.z, t.x - b.x), sp = Math.hypot(b.vx, b.vz), cur = Math.atan2(b.vz, b.vx); let da = ((a - cur + Math.PI) % TAU + TAU) % TAU - Math.PI; const na = cur + clamp(da, -dt * 5, dt * 5); b.vx = Math.cos(na) * sp; b.vz = Math.sin(na) * sp; } }
    b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt; b.m.position.set(b.x, 1, b.z);
    let hit = false;
    for (const e of E) if (Math.hypot(e.x - b.x, e.z - b.z) < e.r + .4) { e.hp--; e.flash = .12; SFX.hit(); if (e.hp <= 0) killEnemy(e); hit = true; break; }
    if (!hit && G.boss) for (const p of G.boss.pods) if (p.hp > 0 && Math.hypot(p.x - b.x, p.z - b.z) < 1.7) { p.hp--; p.flash = .12; SFX.hit(); if (p.hp <= 0) { boom(p.x, p.z, 0xffd34d, 20, 1.3); SFX.pop(); addScore(500, p.x, p.z, '#ffd34d'); p.m.visible = false; } hit = true; break; }
    if (hit || b.life <= 0 || Math.abs(b.x) > HW + 2 || Math.abs(b.z) > HD + 2) { levelGroup.remove(b.m); B.splice(B.indexOf(b), 1); }
  }
  // enemy shots
  for (const s of S.slice()) { s.x += s.vx * dt; s.z += s.vz * dt; s.life -= dt; s.m.position.set(s.x, 1, s.z);
    let gone = s.life <= 0 || Math.abs(s.x) > HW + 2 || Math.abs(s.z) > HD + 2;
    if (!gone && ship.dead <= 0 && Math.hypot(s.x - ship.x, s.z - ship.z) < 1.1) { gone = true; hurtShip(); }
    if (gone) { levelGroup.remove(s.m); S.splice(S.indexOf(s), 1); } }
  if (G.boss && G.boss.pods.every(p => p.hp <= 0) && !G.boss.dead) { G.boss.dead = true; boom(G.boss.x, G.boss.z, 0xff3a4a, 50, 2.2); levelGroup.remove(G.boss.g); levelClear(); }
}
function updateEnemy(e, dt) {
  const sp = D.spd * (1 + G.level * .04); e.t += dt; e.flash = Math.max(0, (e.flash || 0) - dt);
  if (e.type === 'hacker') {
    if (e.hacking) { const c = e.hacking; c.hack += dt; if (c.hack >= D.hack) { breakBlock(c); e.hacking = null; } }
    else {
      if (!e.target || (e.target.cell && !e.target.cell.block)) { const blocks = cells.flat().filter(c => c.block); const c = blocks.length ? blocks[Math.floor(Math.random() * blocks.length)] : null; e.target = c ? { cell: c, x: cellX(c.c), z: cellZ(c.r) } : { x: ship.x, z: ship.z, chase: true }; }
      if (e.target.chase) { e.target.x = ship.x; e.target.z = ship.z; }
      const dx = e.target.x - e.x, dz = e.target.z - e.z, d = Math.hypot(dx, dz) || 1; e.x += dx / d * 5 * sp * dt; e.z += dz / d * 5 * sp * dt;
      if (e.target.cell && d < .8) { e.hacking = e.target.cell; e.target = null; }
    }
  } else if (e.type === 'zapper') {
    const a = e.t * .5 + e.cd, R = 11, tx = clamp(ship.x + Math.cos(a) * R, -HW + 2, HW - 2), tz = clamp(ship.z + Math.sin(a) * R * .6, -HD + 2, HD - 2);
    e.x = lerp(e.x, tx, dt * .8 * sp); e.z = lerp(e.z, tz, dt * .8 * sp);
    e.fire = (e.fire == null ? 1.5 : e.fire) - dt; if (e.fire <= 0 && ship.dead <= 0) { e.fire = 2.4 / sp; const an = Math.atan2(ship.z - e.z, ship.x - e.x); bullet(e.x, e.z, Math.cos(an) * D.shot, Math.sin(an) * D.shot, false); SFX.zap(); }
  } else {
    e.x += e.vx * sp * dt; e.z += e.vz * sp * dt;
    if (Math.abs(e.x) > HW - 1) { e.vx = -e.vx; e.x = clamp(e.x, -HW + 1, HW - 1); } if (Math.abs(e.z) > HD - 1) { e.vz = -e.vz; e.z = clamp(e.z, -HD + 1, HD - 1); }
  }
  if (ship.dead <= 0 && Math.hypot(e.x - ship.x, e.z - ship.z) < e.r + .9) { if (ship.inv <= 0) { hurtShip(); killEnemy(e, true); } }
  e.m.position.set(e.x, 1 + Math.sin(e.t * 3) * .2, e.z); e.m.rotation.y += dt * (e.type === 'zapper' ? 4 : 2); e.m.rotation.x = e.type === 'zapper' ? Math.PI / 2 : e.m.rotation.x + dt;
  e.m.scale.setScalar(e.flash > 0 ? 1.3 : e.hacking ? 1 + Math.sin(e.t * 20) * .12 : 1);
}
function updateBoss(dt) {
  const b = G.boss; if (b.dead) return; b.t += dt;
  b.x = Math.sin(b.t * .35) * 12; b.z = Math.sin(b.t * .7) * 4.5; b.g.position.set(b.x, 2.6 + Math.sin(b.t * 2) * .3, b.z); b.g.rotation.y += dt * .6;
  b.pods.forEach(p => { const a = p.a - b.g.rotation.y; p.m.position.set(Math.cos(p.a) * 5, 0, Math.sin(p.a) * 5); p.x = b.x + Math.cos(a) * 5; p.z = b.z + Math.sin(a) * 5; p.flash = Math.max(0, (p.flash || 0) - dt); p.m.scale.setScalar(p.flash > 0 ? 1.35 : 1); p.m.rotation.y += dt * 3; });
  b.spawnT -= dt; if (b.spawnT <= 0) { b.spawnT = 5 * D.spawn; spawnEnemy('hacker', b.x, b.z); }
  b.fireT -= dt; if (b.fireT <= 0 && ship.dead <= 0) { b.fireT = 3.4 * D.spawn; const n = G.diff === 'easy' ? 3 : 5, base = Math.atan2(ship.z - b.z, ship.x - b.x); for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * .28; bullet(b.x, b.z, Math.cos(a) * D.shot, Math.sin(a) * D.shot, false); } SFX.zap(); }
  if (ship.dead <= 0 && Math.hypot(b.x - ship.x, b.z - ship.z) < 3.4) hurtShip();
}
function updateFX(dt) {
  for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; const k = f.t / f.life;
    if (f.ring) { f.m.scale.setScalar(1 + k * f.s); f.m.material.opacity = 1 - k; f.m.material.transparent = true; }
    else { f.m.position.x += (f.vx || 0) * dt; f.m.position.z += (f.vz || 0) * dt; f.m.position.y += (f.vy || 0) * dt; if (f.vy && !f.text) f.vy -= 14 * dt; f.m.material.opacity = 1 - k; }
    if (f.t >= f.life) { levelGroup.remove(f.m); if (f.text) f.m.material.map.dispose(); f.m.material.dispose(); FX.splice(i, 1); } }
}

/* ================================================================
   Drawing
   ================================================================ */
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function draw(dt) {
  ship.g.position.set(ship.x, 1 + Math.sin(G.t * 3) * .12, ship.z); ship.g.rotation.y = -ship.ang; ship.g.rotation.z = clamp(-(ship.vz * Math.cos(ship.ang) - ship.vx * Math.sin(ship.ang)) * .02, -.4, .4);
  ship.flame.scale.setScalar(1 + Math.hypot(ship.vx, ship.vz) * .06 + Math.sin(G.t * 40) * .15);
  ship.shield.visible = ship.inv > 0 && ship.dead <= 0 && Math.sin(G.t * 20) > -.3; ship.shield.rotation.y += dt * 2;
  core.rotation.y += dt * .8; coreGlow.material.opacity = .55 + Math.sin(G.t * 3) * .2; coreRing.rotation.z += dt;
  for (const row of cells) for (const c of row) {
    if (c.marker) c.marker.children[1].material.color.setHex(Math.sin(G.t * 4) > 0 ? 0x5ad8ff : 0x2a9ad8);
    if (c.block) { if (c.grow != null && c.grow < 1) { c.grow = Math.min(1, c.grow + dt * 5); c.block.scale.setScalar(.2 + c.grow * .8); }
      const red = c.hack > 0 && Math.sin(G.t * 25) > 0; c.block.children[1].material.color.setHex(red ? 0xff3a4a : 0x3aff8a); c.block.children[0].material.color.setHex(red ? 0xff3a4a : 0x3aff8a); }
  }
  if (G.mode === 'clear') { const s = 1 + G.blast * 30; coreRing.scale.setScalar(s); coreRing.material.opacity = Math.max(0, 1 - G.blast / 1.5); coreRing.material.transparent = true; } else { coreRing.scale.setScalar(1); coreRing.material.opacity = 1; }
  // camera fits the whole grid, leaning a little toward the ship
  const tanH = Math.tan(camera.fov * Math.PI / 360), aspect = camera.aspect, needW = (HW + 3) / (tanH * aspect), needH = (HD + 4) / tanH, dist = Math.max(needW, needH) * 1.02;
  const want = new THREE.Vector3(ship.x * .12, dist * .82, dist * .58 + ship.z * .1), look = new THREE.Vector3(ship.x * .1, 0, 1.5 + ship.z * .08);
  if (!G.camInit) { camPos.copy(want); camLook.copy(look); G.camInit = true; } camPos.lerp(want, 1 - Math.exp(-dt * 3)); camLook.lerp(look, 1 - Math.exp(-dt * 3)); camera.position.copy(camPos); camera.lookAt(camLook);
}

/* ================================================================
   HUD and screens
   ================================================================ */
function hud() {
  $('score').textContent = G.score.toLocaleString(); $('hi').textContent = 'HI ' + Math.max(save.hi, G.score).toLocaleString();
  $('lives').textContent = '▲ '.repeat(Math.max(0, Math.min(G.lives, 6))).trim(); $('lvl').textContent = 'L' + (G.level + 1) + ' · ' + LEVELS[G.level].name;
  $('energyFill').style.width = (G.energy / 12 * 100) + '%'; $('energyNum').textContent = G.energy;
  $('goal').textContent = G.boss ? 'PODS ' + G.boss.pods.filter(p => p.hp > 0).length + '/3' : 'BLOCKS ' + G.built + '/' + G.targets;
}
function flash(t, sub, sec) { $('msg').innerHTML = t + (sub ? '<small>' + sub + '</small>' : ''); $('msg').style.opacity = 1; G.msgT = sec || 1.6; }
const SCREENS = ['title', 'select', 'help', 'pause', 'clear', 'over'];
function showScreen(id) {
  for (const s of SCREENS) { $(s).classList.toggle('hide', s !== id); $(s).classList.toggle('show', s === id); }
  $('hud').classList.toggle('hide', !(id === null || id === 'pause')); $('touch').classList.toggle('hide', id !== null);
  if (id === 'select') buildSelect();
}
function showClear() {
  const last = G.level === LEVELS.length - 1;
  $('clearTitle').textContent = last ? 'GRID SAVED!' : G.boss ? 'SAUCER DOWN!' : 'GRID POWERED!';
  $('clearSub').innerHTML = (last ? 'You beat all 12 levels on ' + G.diff + '!' : 'The core blasts every enemy off the grid.') + '<br><b>Bonus +' + G.clearBonus.toLocaleString() + '</b> · Score ' + G.score.toLocaleString();
  $('clearNext').classList.toggle('hide', last); showScreen('clear');
}
function gameOver() { G.mode = 'over'; if (G.score > save.hi) { save.hi = G.score; store(); } $('overScore').textContent = 'Score ' + G.score.toLocaleString(); showScreen('over'); }
function buildSelect() {
  for (const b of $('diff').children) b.setAttribute('aria-pressed', b.dataset.v === G.diff);
  const box = $('levels'); box.innerHTML = '';
  LEVELS.forEach((lv, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'lv' + (save.cleared[G.diff].includes(i) ? ' done' : '') + (lv.boss ? ' boss' : '');
    b.innerHTML = '<b>' + (i + 1) + '</b><span>' + lv.name + '</span><em>' + ['easy', 'medium', 'hard'].map(d => save.cleared[d].includes(i) ? '★' : '☆').join('') + '</em>';
    b.onclick = () => { audio(); startGame(i); }; box.appendChild(b); });
  $('selHi').textContent = save.hi ? 'High score ' + save.hi.toLocaleString() : '';
}
function togglePause() { if (G.mode !== 'play') return; G.paused = !G.paused; showScreen(G.paused ? 'pause' : null); }
function toggleMute() { muted = !muted; $('bSnd').textContent = muted ? '🔇' : '🔊'; }
$('bPause').onclick = togglePause; $('bSnd').onclick = toggleMute;
$('goPlay').onclick = () => { audio(); showScreen('select'); }; $('goHelp').onclick = () => showScreen('help'); $('helpBack').onclick = () => showScreen('title'); $('selBack').onclick = () => showScreen('title');
for (const b of $('diff').children) b.onclick = () => { G.diff = b.dataset.v; save.diff = G.diff; store(); buildSelect(); };
$('resume').onclick = togglePause; $('restart').onclick = () => { G.paused = false; startGame(G.level); }; $('toLevels').onclick = () => { G.paused = false; G.mode = 'title'; showScreen('select'); };
$('clearNext').onclick = () => { G.level++; startLevel(); }; $('clearLevels').onclick = () => { G.mode = 'title'; showScreen('select'); };
$('overAgain').onclick = () => startGame(G.level); $('overLevels').onclick = () => { G.mode = 'title'; showScreen('select'); };
document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused) togglePause(); });

/* ================================================================
   Loop
   ================================================================ */
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
G.level = 0; buildLevelScene(); respawnShip(); ship.inv = 0;
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - last) / 1000, 0, .05); last = now;
  if (!G.paused) { if (G.mode === 'title') { G.t += dt; ship.ang += dt * .6; ship.x = Math.cos(G.t * .6) * 9; ship.z = Math.sin(G.t * .6) * 6; ship.ang = G.t * .6 + Math.PI / 2; updateFX(dt); } else { update(dt / 2); update(dt / 2); } draw(dt); }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
showScreen('title');
VG.ok = true;
VG.debug = { G, ship, inp, E, B, S, cells, get powers() { return powers; }, startGame, startLevel, update, placeBlock, levelClear, LEVELS, DIFF, save, spawnEnemy, hurtShip };
}
