/* ChanceCraft: a block-building adventure in 20 levels, on Earth and in outer space.
   Everything (world, monsters, bosses, boats, cutscenes) is built here with three.js.
   World units are blocks (1 block = 1 metre). Y is up. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const $ = id => document.getElementById(id);
const CC = { ok: false };
window.CC = CC;

/* ================================================================
   Noise (seeded)
   ================================================================ */
function hash(x, y, z, s) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041) ^ Math.imul(s | 0, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function noise2(x, z, s) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, 0, zi, s), b = hash(xi + 1, 0, zi, s), c = hash(xi, 0, zi + 1, s), d = hash(xi + 1, 0, zi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm2(x, z, s, o) { let t = 0, a = .5, f = 1, n = 0; for (let i = 0; i < (o || 4); i++) { t += a * noise2(x * f, z * f, s + i * 31); n += a; a *= .5; f *= 2; } return t / n; }
function noise3(x, y, z, s) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const sm = t => t * t * (3 - 2 * t), u = sm(xf), v = sm(yf), w = sm(zf); let r = 0;
  for (let k = 0; k < 8; k++) { const dx = k & 1, dy = (k >> 1) & 1, dz = (k >> 2) & 1; r += hash(xi + dx, yi + dy, zi + dz, s) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w); } return r; }
function rng(seed) { let a = seed >>> 0 || 1; const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; r.int = n => Math.floor(r() * n); r.pick = a => a[Math.floor(r() * a.length)]; return r; }

/* ================================================================
   Blocks and the texture atlas (pixel art painted in code)
   ================================================================ */
const TILES = ['grass_top', 'grass_side', 'dirt', 'stone', 'sand', 'log_side', 'log_top', 'leaves', 'planks', 'cobble', 'snow', 'snow_side', 'ice', 'cactus_side', 'cactus_top', 'water',
  'lava', 'coal', 'iron', 'gold', 'diamond', 'bedrock', 'glass', 'brick', 'moonrock', 'moondust', 'marsrock', 'marssand', 'crystal', 'metal', 'alien', 'obsidian', 'bosscrystal', 'jleaves', 'part'];
const T = {}; TILES.forEach((n, i) => T[n] = i);
const B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, LOG: 5, LEAVES: 6, PLANKS: 7, COBBLE: 8, SNOW: 9, ICE: 10, CACTUS: 11, WATER: 12, LAVA: 13, COAL: 14, IRON: 15, GOLD: 16, DIAMOND: 17,
  BEDROCK: 18, GLASS: 19, BRICK: 20, MOONROCK: 21, MOONDUST: 22, MARSROCK: 23, MARSSAND: 24, CRYSTAL: 25, METAL: 26, ALIEN: 27, OBSIDIAN: 28, BOSSCRYSTAL: 29, JLEAVES: 30 };
const D = [];   // block definitions: name, tiles [top, side, bottom], hardness (seconds to dig), solid, opaque, drop
const def = (id, n, t, hard, o) => { D[id] = Object.assign({ n, t: Array.isArray(t) ? t : [t, t, t], hard, solid: true, opaque: true, drop: id }, o || {}); };
def(B.AIR, 'Air', 'stone', 0, { solid: false, opaque: false });
def(B.GRASS, 'Grass', [T.grass_top, T.grass_side, T.dirt], .45, { drop: B.DIRT });
def(B.DIRT, 'Dirt', T.dirt, .4); def(B.STONE, 'Stone', T.stone, .9, { drop: B.COBBLE }); def(B.SAND, 'Sand', T.sand, .35);
def(B.LOG, 'Wood', [T.log_top, T.log_side, T.log_top], .7); def(B.LEAVES, 'Leaves', T.leaves, .15, { opaque: false, cull: true });
def(B.PLANKS, 'Planks', T.planks, .6); def(B.COBBLE, 'Cobblestone', T.cobble, .9); def(B.SNOW, 'Snow', [T.snow, T.snow_side, T.dirt], .35, { drop: B.SNOW });
def(B.ICE, 'Ice', T.ice, .4); def(B.CACTUS, 'Cactus', [T.cactus_top, T.cactus_side, T.cactus_top], .3);
def(B.WATER, 'Water', T.water, 0, { solid: false, opaque: false, liquid: true });
def(B.LAVA, 'Lava', T.lava, 0, { solid: false, opaque: false, liquid: true, lava: true });
def(B.COAL, 'Coal ore', T.coal, 1.0, { gem: 1 }); def(B.IRON, 'Iron ore', T.iron, 1.1, { gem: 2 }); def(B.GOLD, 'Gold ore', T.gold, 1.1, { gem: 5 }); def(B.DIAMOND, 'Diamond ore', T.diamond, 1.2, { gem: 10 });
def(B.BEDROCK, 'Bedrock', T.bedrock, 999); def(B.GLASS, 'Glass', T.glass, .3, { opaque: false, cull: true }); def(B.BRICK, 'Brick', T.brick, .9);
def(B.MOONROCK, 'Moon rock', T.moonrock, .8); def(B.MOONDUST, 'Moon dust', [T.moondust, T.moonrock, T.moonrock], .4, { drop: B.MOONROCK });
def(B.MARSROCK, 'Mars rock', T.marsrock, .8); def(B.MARSSAND, 'Mars sand', T.marssand, .35);
def(B.CRYSTAL, 'Crystal', T.crystal, .6, { gem: 3 }); def(B.METAL, 'Metal', T.metal, 1.0); def(B.ALIEN, 'Alien stone', T.alien, .8); def(B.OBSIDIAN, 'Obsidian', T.obsidian, 1.4);
def(B.BOSSCRYSTAL, 'Power crystal', T.bosscrystal, 1.2, { drop: 0 }); def(B.JLEAVES, 'Leaves', T.jleaves, .15, { opaque: false, cull: true, drop: B.JLEAVES });

const ATLAS_N = 8, TPX = 16;
function paintAtlas() {
  const cv = document.createElement('canvas'); cv.width = cv.height = ATLAS_N * TPX; const c = cv.getContext('2d');
  const R = rng(7);
  const tile = (name, fn) => { const i = T[name], ox = (i % ATLAS_N) * TPX, oy = Math.floor(i / ATLAS_N) * TPX; const img = c.createImageData(TPX, TPX);
    for (let y = 0; y < TPX; y++) for (let x = 0; x < TPX; x++) { const p = fn(x, y, R()) || [255, 0, 255, 255]; const k = (y * TPX + x) * 4; img.data[k] = clamp(p[0], 0, 255); img.data[k + 1] = clamp(p[1], 0, 255); img.data[k + 2] = clamp(p[2], 0, 255); img.data[k + 3] = p[3] == null ? 255 : p[3]; }
    c.putImageData(img, ox, oy); };
  const nz = (col, amt) => (x, y, r) => { const d = (r - .5) * amt; return [col[0] + d, col[1] + d, col[2] + d]; };
  const ore = (spot) => (x, y, r) => { const s = hash(x, y, spot[0], 9) < .16 && hash(x >> 1, y >> 1, spot[1], 3) < .55; if (s) return [spot[2][0] + (r - .5) * 30, spot[2][1] + (r - .5) * 30, spot[2][2] + (r - .5) * 30]; const d = (r - .5) * 40; return [125 + d, 125 + d, 128 + d]; };
  tile('grass_top', (x, y, r) => { const d = (r - .5) * 50; return [92 + d, 168 + d, 62 + d * .6]; });
  tile('dirt', (x, y, r) => { const d = (r - .5) * 46; return [134 + d, 96 + d * .8, 66 + d * .6]; });
  tile('grass_side', (x, y, r) => { const edge = 3 + (hash(x, 0, 0, 5) * 3 | 0); if (y < edge) { const d = (r - .5) * 40; return [92 + d, 168 + d, 62 + d * .6]; } const d = (r - .5) * 46; return [134 + d, 96 + d * .8, 66 + d * .6]; });
  tile('stone', (x, y, r) => { const d = (r - .5) * 40 + (hash(x >> 2, y >> 1, 0, 2) - .5) * 24; return [128 + d, 128 + d, 132 + d]; });
  tile('sand', (x, y, r) => { const d = (r - .5) * 30; return [222 + d, 206 + d, 150 + d]; });
  tile('log_side', (x, y, r) => { const d = (r - .5) * 30 + (x % 4 === 0 ? -26 : 0); return [110 + d, 80 + d, 48 + d]; });
  tile('log_top', (x, y, r) => { const rr = Math.hypot(x - 7.5, y - 7.5), ring = Math.floor(rr) % 3 === 0 ? -24 : 0, d = (r - .5) * 20 + ring; return rr > 7 ? [100 + d, 72 + d, 44 + d] : [180 + d, 146 + d, 96 + d]; });
  tile('leaves', (x, y, r) => r < .14 ? [0, 0, 0, 0] : [(52 + (r - .5) * 50), (128 + (r - .5) * 60), (40 + (r - .5) * 30)]);
  tile('jleaves', (x, y, r) => r < .1 ? [0, 0, 0, 0] : [(34 + (r - .5) * 40), (104 + (r - .5) * 50), (60 + (r - .5) * 30)]);
  tile('planks', (x, y, r) => { const d = (r - .5) * 22 + (y % 4 === 0 ? -34 : 0) + ((x + (y >> 2) * 5) % 8 === 0 ? -22 : 0); return [176 + d, 136 + d, 82 + d]; });
  tile('cobble', (x, y, r) => { const cell = hash(x >> 2, y >> 2, (x + y) >> 3, 4), edge = (x % 4 === 0 || y % 4 === 0) ? -36 : 0, d = (r - .5) * 30 + cell * 30 + edge; return [110 + d, 110 + d, 112 + d]; });
  tile('snow', (x, y, r) => { const d = (r - .5) * 14; return [240 + d, 246 + d, 252 + d]; });
  tile('snow_side', (x, y, r) => { if (y < 4 + (hash(x, 0, 1, 5) * 2 | 0)) { const d = (r - .5) * 14; return [240 + d, 246 + d, 252 + d]; } const d = (r - .5) * 46; return [134 + d, 96 + d * .8, 66 + d * .6]; });
  tile('ice', (x, y, r) => { const d = (r - .5) * 20 + ((x + y) % 7 === 0 ? 30 : 0); return [150 + d, 196 + d, 240 + d]; });
  tile('cactus_side', (x, y, r) => { const d = (r - .5) * 30 + (x % 5 === 0 ? -30 : 0) + (hash(x, y, 2, 2) < .06 ? 80 : 0); return [62 + d, 140 + d, 52 + d]; });
  tile('cactus_top', (x, y, r) => { const d = (r - .5) * 30; return [86 + d, 160 + d, 70 + d]; });
  tile('water', (x, y, r) => { const d = (r - .5) * 18 + (Math.sin((x + y * 2) * .8) > .7 ? 22 : 0); return [52 + d, 112 + d, 220 + d, 170]; });
  tile('lava', (x, y, r) => { const w = Math.sin(x * .7 + y * .4) + Math.sin(y * .9 - x * .3), d = (r - .5) * 30; return w > .6 ? [255, 220 + d, 90 + d] : [236 + d, 96 + d + w * 30, 20]; });
  tile('coal', ore([1, 2, [30, 30, 32]])); tile('iron', ore([3, 4, [216, 168, 136]])); tile('gold', ore([5, 6, [255, 214, 60]])); tile('diamond', ore([7, 8, [90, 236, 228]]));
  tile('bedrock', (x, y, r) => { const d = (r - .5) * 90; return [70 + d, 70 + d, 72 + d]; });
  tile('glass', (x, y, r) => (x === 0 || y === 0 || x === 15 || y === 15) ? [220, 240, 250] : (x === y + 3 && x < 9) ? [255, 255, 255, 200] : [200, 230, 250, 0]);
  tile('brick', (x, y, r) => { const row = y >> 2, mortar = y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7, d = (r - .5) * 26; return mortar ? [196 + d, 190 + d, 180 + d] : [170 + d, 72 + d, 56 + d]; });
  tile('moonrock', (x, y, r) => { const d = (r - .5) * 36 + (hash(x >> 1, y >> 1, 3, 3) < .12 ? -40 : 0); return [170 + d, 170 + d, 176 + d]; });
  tile('moondust', (x, y, r) => { const d = (r - .5) * 20; return [206 + d, 206 + d, 210 + d]; });
  tile('marsrock', (x, y, r) => { const d = (r - .5) * 40; return [156 + d, 72 + d, 44 + d]; });
  tile('marssand', (x, y, r) => { const d = (r - .5) * 30; return [204 + d, 110 + d, 64 + d]; });
  tile('crystal', (x, y, r) => { const s = Math.abs(((x + y) % 8) - 4) < 1 || Math.abs(((x - y + 16) % 8) - 4) < 1, d = (r - .5) * 30; return s ? [240, 200 + d, 255] : [170 + d, 90 + d, 240 + d]; });
  tile('metal', (x, y, r) => { const rivet = (x % 7 === 2 && y % 7 === 2), edge = x === 0 || y === 0 ? 30 : x === 15 || y === 15 ? -30 : 0, d = (r - .5) * 10 + edge + (rivet ? 50 : 0); return [150 + d, 158 + d, 170 + d]; });
  tile('alien', (x, y, r) => { const d = (r - .5) * 40 + (Math.sin(x * .9) * Math.cos(y * .9) > .5 ? 40 : 0); return [96 + d, 60 + d, 130 + d]; });
  tile('obsidian', (x, y, r) => { const d = (r - .5) * 30 + (hash(x, y, 9, 9) < .1 ? 50 : 0); return [30 + d, 20 + d, 48 + d]; });
  tile('bosscrystal', (x, y, r) => { const c2 = Math.hypot(x - 7.5, y - 7.5) < 4, d = (r - .5) * 40; return c2 ? [255, 240, 200] : [240 + d * .3, 40 + d, 60 + d]; });
  tile('part', (x, y, r) => { const edge = x < 2 || y < 2 || x > 13 || y > 13, gear = Math.hypot(x - 7.5, y - 7.5) < 3.5, d = (r - .5) * 20; return edge ? [150 + d, 96 + d, 20] : gear ? [255, 250, 200] : [250 + d, 196 + d, 40 + d]; });
  return cv;
}
const atlasCanvas = paintAtlas();
function tileUV(i) { const col = i % ATLAS_N, row = Math.floor(i / ATLAS_N), e = .02 / ATLAS_N; return [col / ATLAS_N + e, 1 - (row + 1) / ATLAS_N + e, (col + 1) / ATLAS_N - e, 1 - row / ATLAS_N - e]; }
// little isometric block icons for the hotbar
const iconCache = {};
function blockIcon(id) {
  if (iconCache[id]) return iconCache[id];
  const cv = document.createElement('canvas'); cv.width = cv.height = 48; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const src = i => [(i % ATLAS_N) * TPX, Math.floor(i / ATLAS_N) * TPX];
  const [top, side] = D[id].t; const s = 1.25;
  const face = (i, m, shade) => { const [sx, sy] = src(i); c.save(); c.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); c.drawImage(atlasCanvas, sx, sy, 16, 16, 0, 0, 16, 16); c.fillStyle = 'rgba(0,0,0,' + shade + ')'; c.fillRect(0, 0, 16, 16); c.restore(); };
  face(top, [s, -.5 * s * .9, s, .5 * s * .9, 4, 16], 0);
  face(side, [s, .5 * s * .9, 0, s, 4, 16], .18);
  face(side, [s, -.5 * s * .9, 0, s, 24, 16 + 8 * s * .9], .32);
  return (iconCache[id] = cv.toDataURL());
}

/* ================================================================
   The world: a block grid, meshed in 16x16 chunks with soft corner shading
   ================================================================ */
const SX = 80, SZ = 80, SY = 40, SEA = 12, CH = 16, NCX = SX / CH, NCZ = SZ / CH;
const world = new Uint8Array(SX * SY * SZ);
const ix = (x, y, z) => x + SX * (z + SZ * y);
function get(x, y, z) { if (x < 0 || z < 0 || x >= SX || z >= SZ || y < 0 || y >= SY) return 0; return world[ix(x, y, z)]; }
function setRaw(x, y, z, id) { if (x < 0 || z < 0 || x >= SX || z >= SZ || y < 0 || y >= SY) return; world[ix(x, y, z)] = id; }
const solidAt = (x, y, z) => D[get(x, y, z)].solid;
const opaqueAt = (x, y, z) => D[get(x, y, z)].opaque;
const FACES = [
  { d: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], s: .8, k: 1 },
  { d: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], s: .8, k: 1 },
  { d: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], s: 1, k: 0 },
  { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: .55, k: 2 },
  { d: [0, 0, 1], c: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], s: .9, k: 1 },
  { d: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], s: .9, k: 1 },
];
const AO = [.5, .68, .84, 1];

/* ================================================================
   three.js setup
   ================================================================ */
const canvas = $('c');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, 1, .05, 400); camera.rotation.order = 'YXZ'; scene.add(camera);
const hemi = new THREE.HemisphereLight(0xffffff, 0x556644, 1.1); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xffffff, .7); sunL.position.set(-.4, 1, .3); scene.add(sunL);
const atlasTex = new THREE.CanvasTexture(atlasCanvas); atlasTex.magFilter = THREE.NearestFilter; atlasTex.minFilter = THREE.NearestFilter; atlasTex.generateMipmaps = false; atlasTex.colorSpace = THREE.SRGBColorSpace;
const matSolid = new THREE.MeshLambertMaterial({ map: atlasTex, vertexColors: true, alphaTest: .5 });
const matWater = new THREE.MeshLambertMaterial({ map: atlasTex, vertexColors: true, transparent: true, opacity: .78, depthWrite: false });
const lam = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
const BOX = new THREE.BoxGeometry(1, 1, 1);

const chunks = [];   // { solid: Mesh, water: Mesh, dirty }
for (let i = 0; i < NCX * NCZ; i++) chunks.push({ solid: null, water: null, dirty: true });
const worldGroup = new THREE.Group(); scene.add(worldGroup);
function buildChunk(cx, cz) {
  const P = [], N = [], U = [], C = [], I = [], WP = [], WN = [], WU = [], WC = [], WI = [];
  const x0 = cx * CH, z0 = cz * CH;
  for (let y = 0; y < SY; y++) for (let z = z0; z < z0 + CH; z++) for (let x = x0; x < x0 + CH; x++) {
    const id = world[ix(x, y, z)]; if (!id) continue;
    const dfn = D[id];
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], nx = x + F.d[0], ny = y + F.d[1], nz = z + F.d[2], nb = get(nx, ny, nz);
      if (D[nb].opaque) continue;
      if (nb === id && (dfn.cull || dfn.liquid)) continue;
      if (dfn.liquid) { if (D[nb].solid && !D[nb].opaque) continue; if (f === 3) continue; if (f !== 2 && nb !== 0) continue; }
      const liq = dfn.liquid, tgt = liq ? { P: WP, N: WN, U: WU, C: WC, I: WI } : { P, N, U, C, I };
      const tile = dfn.t[F.k], uv = tileUV(tile), base = tgt.P.length / 3, aos = [];
      const ax = F.d[0] ? 0 : F.d[1] ? 1 : 2, t1 = (ax + 1) % 3, t2 = (ax + 2) % 3;
      for (const cn of F.c) {
        let py = y + cn[1]; if (liq && cn[1] === 1 && get(x, y + 1, z) !== id) py = y + .88;
        tgt.P.push(x + cn[0], py, z + cn[2]); tgt.N.push(F.d[0], F.d[1], F.d[2]);
        // texture coords: sides run up the block, tops across it
        let u, v; if (ax === 1) { u = cn[0]; v = cn[2]; } else if (ax === 0) { u = cn[2]; v = cn[1]; } else { u = cn[0]; v = cn[1]; }
        tgt.U.push(lerp(uv[0], uv[2], u), lerp(uv[1], uv[3], v));
        // ambient occlusion from the three blocks touching this corner
        let ao = 3;
        if (!liq) {
          const o = [x + F.d[0], y + F.d[1], z + F.d[2]], s1 = o.slice(), s2 = o.slice();
          s1[t1] += cn[t1] ? 1 : -1; s2[t2] += cn[t2] ? 1 : -1; const co = s1.slice(); co[t2] += cn[t2] ? 1 : -1;
          const a = opaqueAt(s1[0], s1[1], s1[2]) ? 1 : 0, b = opaqueAt(s2[0], s2[1], s2[2]) ? 1 : 0, c = opaqueAt(co[0], co[1], co[2]) ? 1 : 0;
          ao = a && b ? 0 : 3 - (a + b + c);
        }
        aos.push(ao); const sh = F.s * AO[ao] * (dfn.lava || id === B.CRYSTAL || id === B.BOSSCRYSTAL ? 1.25 : 1); tgt.C.push(sh, sh, sh);
      }
      // split the quad along the darker diagonal, wound to face outward
      const flip = aos[0] + aos[2] < aos[1] + aos[3];
      const tris = flip ? [[1, 2, 3], [1, 3, 0]] : [[0, 1, 2], [0, 2, 3]];
      for (const t of tris) {
        const p = i => [tgt.P[(base + t[i]) * 3], tgt.P[(base + t[i]) * 3 + 1], tgt.P[(base + t[i]) * 3 + 2]], A = p(0), Bv = p(1), Cv = p(2);
        const e1 = [Bv[0] - A[0], Bv[1] - A[1], Bv[2] - A[2]], e2 = [Cv[0] - A[0], Cv[1] - A[1], Cv[2] - A[2]];
        const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
        if (cr[0] * F.d[0] + cr[1] * F.d[1] + cr[2] * F.d[2] >= 0) tgt.I.push(base + t[0], base + t[1], base + t[2]); else tgt.I.push(base + t[0], base + t[2], base + t[1]);
      }
    }
  }
  const mk = (P2, N2, U2, C2, I2, mat, old) => {
    if (old) { worldGroup.remove(old); old.geometry.dispose(); }
    if (!I2.length) return null;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N2, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U2, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(C2, 3)); g.setIndex(I2); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; m.updateMatrix(); worldGroup.add(m); return m;
  };
  const ch = chunks[cz * NCX + cx];
  ch.solid = mk(P, N, U, C, I, matSolid, ch.solid); ch.water = mk(WP, WN, WU, WC, WI, matWater, ch.water); if (ch.water) ch.water.renderOrder = 2; ch.dirty = false;
}
function markDirty(x, z) { const cx = Math.floor(x / CH), cz = Math.floor(z / CH); for (const [ax, az] of [[cx, cz], [Math.floor((x - 1) / CH), cz], [Math.floor((x + 1) / CH), cz], [cx, Math.floor((z - 1) / CH)], [cx, Math.floor((z + 1) / CH)]]) if (ax >= 0 && az >= 0 && ax < NCX && az < NCZ) chunks[az * NCX + ax].dirty = true; }
function setBlock(x, y, z, id) { setRaw(x, y, z, id); markDirty(x, z); }
function rebuildDirty(limit) { let n = 0; for (let cz = 0; cz < NCZ; cz++) for (let cx = 0; cx < NCX; cx++) { if (chunks[cz * NCX + cx].dirty) { buildChunk(cx, cz); if (++n >= limit) return; } } }

// voxel ray march (Amanatides & Woo)
function raycast(o, d, maxD, pred) {
  let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z);
  const sx = Math.sign(d.x), sy = Math.sign(d.y), sz = Math.sign(d.z);
  const tdx = sx ? Math.abs(1 / d.x) : Infinity, tdy = sy ? Math.abs(1 / d.y) : Infinity, tdz = sz ? Math.abs(1 / d.z) : Infinity;
  let tmx = sx > 0 ? (x + 1 - o.x) * tdx : sx < 0 ? (o.x - x) * tdx : Infinity, tmy = sy > 0 ? (y + 1 - o.y) * tdy : sy < 0 ? (o.y - y) * tdy : Infinity, tmz = sz > 0 ? (z + 1 - o.z) * tdz : sz < 0 ? (o.z - z) * tdz : Infinity;
  let nx = 0, ny = 0, nz = 0, t = 0;
  for (let i = 0; i < 64 && t <= maxD; i++) {
    const id = get(x, y, z); if (id && pred(id)) return { x, y, z, nx, ny, nz, t, id };
    if (tmx < tmy && tmx < tmz) { x += sx; t = tmx; tmx += tdx; nx = -sx; ny = nz = 0; }
    else if (tmy < tmz) { y += sy; t = tmy; tmy += tdy; ny = -sy; nx = nz = 0; }
    else { z += sz; t = tmz; tmz += tdz; nz = -sz; nx = ny = 0; }
  }
  return null;
}

/* ================================================================
   Levels
   ================================================================ */
const BOATS = [
  ['Noob Raft', 'Five logs tied together. Every hero starts somewhere!'],
  ['Log Canoe', 'A hollowed-out log. A little faster.'],
  ['Rowboat', 'Real sides and two oars.'],
  ['Sailboat', 'A big white sail catches the wind.'],
  ['Fishing Boat', 'A cabin to keep dry and a fishing rod.'],
  ['Speedboat', 'An outboard motor. Vroom!'],
  ['Pirate Ship', 'Black sails and cannons. Arrr!'],
  ['Hovercraft', 'Floats on a cushion of air.'],
  ['Jet Boat', 'Jet engines blast it across the waves.'],
  ['Rocket Boat with Wings', 'Wings and a rocket engine. It can fly to OUTER SPACE!'],
  ['Winged Rocket Mk 2', 'Bigger wings for zooming between planets.'],
  ['Star Skimmer', 'Skims across space like a stone on a pond.'],
  ['Comet Cruiser', 'Twin boosters with comet tails.'],
  ['Laser Rocket', 'Laser cannons on both wings.'],
  ['Moon Jumper', 'Springy legs for landing on moons.'],
  ['Ring Racer', 'Built to race around Saturn\'s rings.'],
  ['Crystal Cruiser', 'Glowing crystal fins.'],
  ['Nebula Ship', 'Painted with the colours of a nebula.'],
  ['Galaxy Glider', 'Four wings and six engines.'],
  ['Ultimate Star Rocket', 'Solid gold. The best ship in the galaxy!'],
];
const LV = [
  null,
  { name: 'Grassy Island', world: 'earth', biome: 'meadow', spots: ['surface', 'buried', 'pillar'], mobs: [['slime', 1]], tip: 'Use MINE to dig and BUILD to stack blocks. Climb your own tower to reach the high part!' },
  { name: 'Forest Isles', world: 'earth', biome: 'forest', spots: ['surface', 'tree', 'island', 'buried'], mobs: [['slime', 3]], tip: 'One part is on another island. Hop in your boat to get there.' },
  { name: 'Sandy Desert', world: 'earth', biome: 'desert', spots: ['surface', 'buried', 'pillar', 'island'], mobs: [['zombie', 3], ['slime', 1]], tip: 'Watch out for cactus and zombies!' },
  { name: 'Snowy Peaks', world: 'earth', biome: 'snow', spots: ['peak', 'buried', 'pillar', 'island', 'surface'], mobs: [['zombie', 3], ['spider', 1]], tip: 'Climb the mountain. Build stairs if it is too steep.' },
  { name: 'Jungle Lagoon', world: 'earth', biome: 'jungle', spots: ['tree', 'tree', 'island', 'buried', 'surface'], mobs: [['spider', 3], ['slime', 2]], tip: 'Jungle trees are tall. Build up to the treetops.' },
  { name: 'Deep Caves', world: 'earth', biome: 'caves', spots: ['cave', 'cave', 'cave', 'buried', 'pillar'], mobs: [['zombie', 3], ['spider', 3]], tip: 'Dig down into the caves. Diamonds are deep!' },
  { name: 'BOSS: Stone Golem King', world: 'earth', biome: 'boss1', boss: 'golem', spots: [], mobs: [], tip: 'When the Golem raises his fists, JUMP to dodge the shockwave. Hit him while he is dizzy!' },
  { name: 'Pirate Islands', world: 'earth', biome: 'islands', spots: ['island', 'island', 'island', 'pillar', 'buried', 'island'], mobs: [['zombie', 4], ['slime', 2]], tip: 'Lots of little islands. Sail around to find every part.' },
  { name: 'Volcano Island', world: 'earth', biome: 'volcano', spots: ['peak', 'pillar', 'buried', 'island', 'surface', 'cave'], mobs: [['fireslime', 4], ['zombie', 2]], tip: 'Do not touch the lava! The top of the volcano is very hot.' },
  { name: 'Launch Pad', world: 'earth', biome: 'launch', spots: ['pillar', 'buried', 'island', 'surface', 'tree'], mobs: [['zombie', 3], ['spider', 3]], tip: 'Find the rocket fuel so your Rocket Boat with Wings can fly to space!' },
  { name: 'The Moon', world: 'space', biome: 'moon', spots: ['crater', 'surface', 'asteroid', 'buried', 'pillar'], mobs: [['moonslime', 4]], tip: 'Low gravity! You can jump really high on the Moon.' },
  { name: 'Mars', world: 'space', biome: 'mars', spots: ['surface', 'pillar', 'asteroid', 'buried', 'peak'], mobs: [['rockbot', 4]], tip: 'Rock robots guard the red planet.' },
  { name: 'Asteroid Belt', world: 'space', biome: 'asteroids', spots: ['asteroid', 'asteroid', 'asteroid', 'asteroid', 'buried'], mobs: [['alien', 3], ['moonslime', 2]], tip: 'Fly your rocket between the asteroids. Do not fall off!' },
  { name: 'BOSS: Space Dragon', world: 'space', biome: 'boss2', boss: 'dragon', spots: [], mobs: [], tip: 'Dodge the fireballs. When the dragon lands, hit it as hard as you can!' },
  { name: 'Ice Moon', world: 'space', biome: 'icemoon', spots: ['surface', 'buried', 'pillar', 'asteroid', 'crater', 'peak'], mobs: [['alien', 4], ['moonslime', 2]], tip: 'Ice is slippery, but you can still dig through it.' },
  { name: 'Saturn\'s Rings', world: 'space', biome: 'rings', spots: ['asteroid', 'asteroid', 'asteroid', 'asteroid', 'asteroid', 'pillar'], mobs: [['alien', 4]], tip: 'The rings are made of ice chunks. Fly from one to the next.' },
  { name: 'Crystal Planet', world: 'space', biome: 'crystal', spots: ['spire', 'spire', 'buried', 'asteroid', 'surface', 'pillar'], mobs: [['alien', 4], ['rockbot', 2]], tip: 'Some parts sit on top of crystal towers.' },
  { name: 'Lava Moon', world: 'space', biome: 'io', spots: ['peak', 'buried', 'asteroid', 'pillar', 'surface', 'cave'], mobs: [['fireslime', 4], ['rockbot', 3]], tip: 'This moon has volcanoes too. Careful!' },
  { name: 'Alien Base', world: 'space', biome: 'alienbase', spots: ['dome', 'dome', 'pillar', 'asteroid', 'buried', 'surface'], mobs: [['alien', 6], ['rockbot', 2]], tip: 'Sneak into the glass domes. The aliens are on alert!' },
  { name: 'BOSS: Alien Overlord', world: 'space', biome: 'boss3', boss: 'overlord', spots: [], mobs: [['alien', 2]], tip: 'Break the 4 red power crystals to knock the UFO down, then hit the Overlord!' },
];
const BIOMES = {
  meadow: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'oak', trees: .012, sky: 0x8fd0ff, fog: 0xbfe4ff, r: 20, h: 6, isl: 2 },
  forest: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'oak', trees: .05, sky: 0x86c8f5, fog: 0xb8dff7, r: 21, h: 7, isl: 3 },
  desert: { top: B.SAND, fill: B.SAND, beach: B.SAND, tree: 'cactus', trees: .02, sky: 0xa8d8ff, fog: 0xf2e6c4, r: 22, h: 5, isl: 2 },
  snow: { top: B.SNOW, fill: B.DIRT, beach: B.SNOW, tree: 'spruce', trees: .025, sky: 0xbcd8f0, fog: 0xe4eef8, r: 22, h: 7, isl: 2, peaks: 14 },
  jungle: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'jungle', trees: .04, sky: 0x7fc8e8, fog: 0xa8dcc8, r: 21, h: 6, isl: 3 },
  caves: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'oak', trees: .015, sky: 0x8fbfe0, fog: 0xa8c8dc, r: 24, h: 12, isl: 1, caves: .6 },
  boss1: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'none', trees: 0, sky: 0x7f9fc0, fog: 0x9fb0c0, r: 24, h: 2, isl: 0, flat: true },
  islands: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'oak', trees: .03, sky: 0x86d0ff, fog: 0xbfe8ff, r: 13, h: 4, isl: 7 },
  volcano: { top: B.STONE, fill: B.STONE, beach: B.SAND, tree: 'none', trees: 0, sky: 0xc89a80, fog: 0xc8a090, r: 23, h: 5, isl: 2, volcano: true },
  launch: { top: B.GRASS, fill: B.DIRT, beach: B.SAND, tree: 'oak', trees: .02, sky: 0x8fd0ff, fog: 0xbfe4ff, r: 22, h: 4, isl: 2, pad: true },
  moon: { top: B.MOONDUST, fill: B.MOONROCK, stone: B.MOONROCK, grav: .38, r: 22, h: 4, ast: 3, craters: 7 },
  mars: { top: B.MARSSAND, fill: B.MARSROCK, stone: B.MARSROCK, grav: .5, r: 23, h: 6, ast: 3, peaks: 9 },
  asteroids: { top: B.STONE, fill: B.STONE, stone: B.STONE, grav: .45, r: 11, h: 3, ast: 8 },
  boss2: { top: B.OBSIDIAN, fill: B.OBSIDIAN, stone: B.OBSIDIAN, grav: .55, r: 18, h: 1, ast: 0, flat: true },
  icemoon: { top: B.SNOW, fill: B.ICE, stone: B.ICE, grav: .4, r: 22, h: 5, ast: 3, craters: 4, peaks: 7 },
  rings: { top: B.ICE, fill: B.ICE, stone: B.STONE, grav: .45, r: 10, h: 3, ast: 0, rings: 9 },
  crystal: { top: B.ALIEN, fill: B.ALIEN, stone: B.ALIEN, grav: .5, r: 22, h: 5, ast: 3, spires: 10 },
  io: { top: B.SAND, fill: B.MARSROCK, stone: B.OBSIDIAN, grav: .45, r: 22, h: 5, ast: 3, volcano: true },
  alienbase: { top: B.METAL, fill: B.METAL, stone: B.ALIEN, grav: .5, r: 23, h: 2, ast: 3, base: true, flat: true },
  boss3: { top: B.METAL, fill: B.METAL, stone: B.METAL, grav: .55, r: 18, h: 1, ast: 0, flat: true, crystals: true },
};
const MOBS = {
  slime: { hp: 2, speed: 2.4, dmg: 2, w: .8, h: .8, col: 0x6fd860 },
  fireslime: { hp: 3, speed: 2.6, dmg: 3, w: .8, h: .8, col: 0xff7a2a },
  moonslime: { hp: 2, speed: 2.4, dmg: 2, w: .8, h: .8, col: 0xc8e0d0 },
  zombie: { hp: 3, speed: 2.2, dmg: 2, w: .6, h: 1.8, col: 0x5aa04a },
  spider: { hp: 3, speed: 3.2, dmg: 2, w: 1.2, h: .8, col: 0x2a2a30 },
  alien: { hp: 3, speed: 2.6, dmg: 2, w: .6, h: 1.6, col: 0x9a6ad8 },
  rockbot: { hp: 4, speed: 2.0, dmg: 3, w: .8, h: 1.4, col: 0x8a8f9a },
};

const G = { level: 1, mode: 'title', cfg: null, bio: null, t: 0, parts: [], partsGot: 0, mobs: [], boss: null, shots: [], name: 'CHANCE', shirt: '#2f9fd8',
  inv: new Map(), sel: 0, gems: 0, cam3: false, done: {}, start: null, boatHome: null, won: false, toastT: 0, hurtFlash: 0 };
try { const s = JSON.parse(localStorage.getItem('chancecraft_v1') || '{}'); if (s.done) G.done = s.done; if (s.name) G.name = s.name; if (s.shirt) G.shirt = s.shirt; } catch (e) {}
const saveGame = () => { try { localStorage.setItem('chancecraft_v1', JSON.stringify({ done: G.done, name: G.name, shirt: G.shirt })); } catch (e) {} };

function generate(L) {
  const cfg = LV[L], bio = BIOMES[cfg.biome], R = rng(L * 7919 + 13), seed = L * 101, space = cfg.world === 'space';
  world.fill(0);
  const cx = SX / 2, cz = SZ / 2, bodies = [{ x: cx, z: cz, r: bio.r, h: bio.h, main: true }];
  const nIsl = space ? (bio.ast || 0) : bio.isl;
  for (let i = 0; i < nIsl; i++) {
    const a = i / Math.max(1, nIsl) * TAU + R() * .6, d = bio.r + 8 + R() * 6 + (space ? 2 : 0);
    bodies.push({ x: clamp(cx + Math.cos(a) * d, 8, SX - 8), z: clamp(cz + Math.sin(a) * d, 8, SZ - 8), r: 4 + R() * 3.5, h: 2 + R() * 3, off: space ? (R() - .5) * 6 : 0 });
  }
  if (bio.rings) for (let i = 0; i < bio.rings; i++) { const a = i / bio.rings * TAU, d = 24 + (i % 2) * 6; bodies.push({ x: clamp(cx + Math.cos(a) * d, 6, SX - 6), z: clamp(cz + Math.sin(a) * d, 6, SZ - 6), r: 3.5 + R() * 2.5, h: 2, off: (R() - .5) * 8 }); }
  const heights = new Int16Array(SX * SZ).fill(-1), bottoms = new Int16Array(SX * SZ).fill(0);
  for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    const n = fbm2(x * .07, z * .07, seed, 4);
    let best = 0, bb = null;
    for (const b of bodies) { const d = Math.hypot(x - b.x, z - b.z) + (fbm2(x * .15, z * .15, seed + 5, 2) - .5) * 5; const m = 1 - d / b.r; if (m > best) { best = m; bb = b; } }
    if (!space) {
      let h;
      if (best <= 0) h = SEA - 5 + Math.round(n * 3);
      else { const m = Math.min(1, best * 1.6); h = SEA - 2 + m * (bb.h + 3) + (bio.flat ? 0 : (n - .5) * 6 * m); if (bio.peaks && bb.main) h += Math.pow(Math.max(0, fbm2(x * .05, z * .05, seed + 9, 3) - .45), 1.2) * bio.peaks * 2 * m; }
      if (bio.volcano && bb && bb.main) { const d = Math.hypot(x - cx, z - cz); h = Math.max(h, SEA + 16 - d * .9); if (d < 4) h = SEA + 12; }
      heights[x + z * SX] = clamp(Math.round(h), 2, SY - 6);
    } else if (best > 0) {
      const m = Math.min(1, best * 1.8), base = 14 + (bb.off || 0);
      let top = base + m * bb.h + (bio.flat ? 0 : (n - .5) * 5 * m); if (bio.peaks && bb.main) top += Math.max(0, fbm2(x * .05, z * .05, seed + 9, 3) - .5) * bio.peaks * 3 * m;
      if (bio.volcano && bb.main) { const d = Math.hypot(x - cx, z - cz); top = Math.max(top, base + 13 - d * .9); if (d < 3.5) top = base + 9; }
      heights[x + z * SX] = clamp(Math.round(top), 4, SY - 6); bottoms[x + z * SX] = clamp(Math.round(base - 3 - m * (bb.main ? 7 : 4) - n * 2), 1, SY - 8);
    }
  }
  // craters
  if (bio.craters) for (let i = 0; i < bio.craters; i++) { const a = R() * TAU, d = R() * (bio.r - 7), qx = cx + Math.cos(a) * d, qz = cz + Math.sin(a) * d, rc = 3 + R() * 3;
    for (let z = Math.floor(qz - rc); z <= qz + rc; z++) for (let x = Math.floor(qx - rc); x <= qx + rc; x++) { const dd = Math.hypot(x - qx, z - qz); if (dd < rc && heights[x + z * SX] > 0) heights[x + z * SX] -= Math.round((1 - (dd / rc) ** 2) * 3); } }
  // fill columns
  const top = bio.top, fill = bio.fill, stone = bio.stone || B.STONE;
  for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    const h = heights[x + z * SX]; if (h < 0) continue;
    const y0 = space ? bottoms[x + z * SX] : 0;
    for (let y = y0; y <= h; y++) {
      let id;
      if (!space && y === 0) id = B.BEDROCK;
      else if (y < h - 3) {
        id = stone; const r = hash(x, y, z, seed);
        if (stone === B.STONE || stone === B.MOONROCK || stone === B.MARSROCK) { if (r < .03) id = B.COAL; else if (r < .045) id = B.IRON; else if (r < .052 && y < 10) id = B.GOLD; else if (r < .056 && y < 7) id = B.DIAMOND; }
        if (space && r > .985) id = B.CRYSTAL;
      } else if (y < h) id = fill;
      else id = (!space && h <= SEA) ? (bio.beach === B.SNOW ? B.SNOW : B.SAND) : top;
      setRaw(x, y, z, id);
    }
    if (!space && h < SEA - 1) for (let y = h + 1; y < SEA; y++) setRaw(x, y, z, B.WATER);
    if (!space && h === SEA - 1) setRaw(x, SEA - 1, z, bio.beach === B.SNOW ? B.SNOW : B.SAND);
  }
  // caves
  const cavesK = bio.caves || (cfg.spots.includes('cave') ? .7 : 0);
  if (cavesK) for (let z = 2; z < SZ - 2; z++) for (let x = 2; x < SX - 2; x++) { const h = heights[x + z * SX]; if (h < SEA + 2) continue;
    for (let y = space ? bottoms[x + z * SX] + 2 : 3; y < h - 3; y++) { const v = noise3(x * .11, y * .16, z * .11, seed + 3); if (v > 1 - cavesK * .5 && get(x, y, z) !== B.BEDROCK) setRaw(x, y, z, 0); } }
  // lava pools (volcano crater)
  if (bio.volcano) { for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) { const d = Math.hypot(x - cx, z - cz), h = heights[x + z * SX]; if (d < 3.5 && h > 0) { setRaw(x, h, z, B.LAVA); setRaw(x, h - 1, z, B.LAVA); } else if (d < 7 && h > 0 && !space) setRaw(x, h, z, B.OBSIDIAN); } }
  // trees and plants
  const surf = (x, z) => heights[x + z * SX];
  const tree = (x, z, kind) => {
    const h0 = surf(x, z) + 1; if (h0 < SEA + 1 && !space) return;
    if (kind === 'cactus') { const hh = 2 + R.int(2); for (let i = 0; i < hh; i++) setRaw(x, h0 + i, z, B.CACTUS); return; }
    const th = kind === 'jungle' ? 7 + R.int(4) : kind === 'spruce' ? 5 + R.int(2) : 4 + R.int(2), leaf = kind === 'oak' ? B.LEAVES : B.JLEAVES;
    for (let i = 0; i < th; i++) setRaw(x, h0 + i, z, B.LOG);
    const ty = h0 + th;
    if (kind === 'spruce') { for (let k = 0; k < 4; k++) { const r = 2 - (k >> 1); for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) if (Math.abs(dx) + Math.abs(dz) <= r + 1 && !get(x + dx, ty - 3 + k, z + dz)) setRaw(x + dx, ty - 3 + k, z + dz, leaf); } setRaw(x, ty + 1, z, leaf); return; }
    const r = kind === 'jungle' ? 3 : 2;
    for (let dy = -2; dy <= 1; dy++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const rr = dy === 1 ? r - 1 : r; if (dx * dx + dz * dz <= rr * rr + 1 && !get(x + dx, ty + dy, z + dz) && hash(x + dx, ty + dy, z + dz, 4) > .08) setRaw(x + dx, ty + dy, z + dz, leaf); }
  };
  if (bio.tree && bio.tree !== 'none') for (let z = 3; z < SZ - 3; z++) for (let x = 3; x < SX - 3; x++) { const h = surf(x, z); if (h <= SEA) continue; const t = get(x, h, z); if ((t === B.GRASS || t === B.SNOW || t === B.SAND) && hash(x, 7, z, seed) < bio.trees && Math.hypot(x - cx, z - (cz + bio.r - 4)) > 5) tree(x, z, bio.tree); }
  // crystal spires
  if (bio.spires) for (let i = 0; i < bio.spires; i++) { const a = R() * TAU, d = 4 + R() * (bio.r - 8), x = Math.round(cx + Math.cos(a) * d), z = Math.round(cz + Math.sin(a) * d), h = surf(x, z); if (h < 0) continue; const hh = 4 + R.int(6); for (let k = 1; k <= hh; k++) setRaw(x, h + k, z, B.CRYSTAL); }
  // launch pad
  if (bio.pad) { const px = cx - 6, pz = cz - 6; for (let z = pz - 4; z <= pz + 4; z++) for (let x = px - 4; x <= px + 4; x++) { const h = SEA + 4; for (let y = surf(x, z) + 1; y <= h; y++) setRaw(x, y, z, B.METAL); for (let y = h + 1; y < h + 4; y++) setRaw(x, y, z, 0); heights[x + z * SX] = h; } for (let y = SEA + 5; y < SEA + 15; y++) { setRaw(px + 4, y, pz - 4, B.METAL); setRaw(px + 4, y, pz - 3, y % 3 ? B.GLASS : B.METAL); } }
  // alien base domes
  const domes = [];
  if (bio.base) for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, d = 9, qx = Math.round(cx + Math.cos(a) * d), qz = Math.round(cz + Math.sin(a) * d), h = surf(qx, qz), r = 4; domes.push({ x: qx, z: qz, y: h + 1 });
    for (let dy = 0; dy <= r; dy++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const dd = Math.sqrt(dx * dx + dy * dy + dz * dz); if (dd <= r + .5 && dd > r - .6) setRaw(qx + dx, h + 1 + dy, qz + dz, B.GLASS); } }
  // the dock: a shore on the main island's south side with open water (or open space) beyond
  let start = null;
  for (let z = SZ - 3; z > cz && !start; z--) for (let dx = 0; dx < 12 && !start; dx++) for (const sx of [cx + dx, cx - dx]) {
    const h = surf(sx, z); if (h < 0) continue;
    if (!space && h >= SEA && h <= SEA + 3 && surf(sx, z + 1) < SEA && surf(sx, z + 2) < SEA - 1) { start = { x: sx, z }; break; }
    if (space && h > 0 && surf(sx, z + 1) < 0 && surf(sx, z + 2) < 0 && surf(sx, z + 3) < 0) { start = { x: sx, z }; break; }
  }
  if (!start) start = { x: cx, z: cz + bio.r - 3 };
  const sh = surf(start.x, start.z); for (let y = sh + 1; y < sh + 4; y++) setRaw(start.x, y, start.z, 0);
  const boatPos = { x: start.x + .5, z: start.z + 2.5 + (space ? 1 : 0) };
  // boat lane in space: keep the strip in front of the dock clear
  // boat parts
  const parts = [];
  const free = (x, y, z) => !get(x, y, z) && !get(x, y + 1, z);
  const landSpot = (minD, maxD, onMain) => { for (let k = 0; k < 400; k++) { const x = 4 + R.int(SX - 8), z = 4 + R.int(SZ - 8), h = surf(x, z); if (h < 0 || (!space && h < SEA)) continue; const t = get(x, h, z); if (!t || D[t].liquid) continue; const d = Math.hypot(x - start.x, z - start.z), dm = Math.hypot(x - cx, z - cz); if (d < minD || d > maxD) continue; if (onMain === true && dm > bio.r) continue; if (onMain === false && dm < bio.r + 3) continue; if (!free(x, h + 1, z)) continue; if (parts.some(p => Math.hypot(p.x - x, p.z - z) < 7)) continue; return { x, y: h + 1, z }; } return null; };
  for (const kind of cfg.spots) {
    let s = null;
    if (kind === 'surface') s = landSpot(12, 60, true);
    else if (kind === 'island' || kind === 'asteroid') s = landSpot(10, 80, false) || landSpot(12, 60, true);
    else if (kind === 'buried') { s = landSpot(8, 50, true); if (s) { const depth = 3; for (let k = 1; k <= depth; k++) if (get(s.x, s.y - k, s.z) !== B.BEDROCK) setRaw(s.x, s.y - k, s.z, k === depth ? 0 : (space ? bio.fill : B.DIRT)); for (const [dx, dz] of [[0, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (get(s.x + dx, s.y - 1, s.z + dz)) setRaw(s.x + dx, s.y - 1, s.z + dz, B.BRICK); s.y -= depth; s.buried = true; } }
    else if (kind === 'pillar') { s = landSpot(10, 50, true); if (s) { const hh = 4 + Math.min(4, Math.floor(L / 3)); for (let k = 0; k < hh; k++) setRaw(s.x, s.y + k, s.z, space ? B.METAL : B.COBBLE); s.y += hh; } }
    else if (kind === 'peak' || kind === 'spire') { let best = null; for (let z = 4; z < SZ - 4; z++) for (let x = 4; x < SX - 4; x++) { const h = surf(x, z); let hh = h; while (get(x, hh + 1, z) === B.CRYSTAL || get(x, hh + 1, z) === B.LOG || get(x, hh + 1, z) === B.LEAVES) hh++; if (h > 0 && (!best || hh > best.y) && !parts.some(p => Math.hypot(p.x - x, p.z - z) < 7) && get(x, hh, z) !== B.LAVA && Math.hypot(x - cx, z - cz) > (bio.volcano ? 6 : 0)) best = { x, y: hh + 1, z }; } s = best; }
    else if (kind === 'tree') { for (let k = 0; k < 600 && !s; k++) { const x = 3 + R.int(SX - 6), z = 3 + R.int(SZ - 6); for (let y = SY - 2; y > SEA; y--) { const t = get(x, y, z); if (t === B.LEAVES || t === B.JLEAVES) { if (!get(x, y + 1, z) && !parts.some(p => Math.hypot(p.x - x, p.z - z) < 6)) s = { x, y: y + 1, z }; break; } if (t) break; } } if (!s) s = landSpot(12, 60, true); }
    else if (kind === 'cave') { for (let k = 0; k < 3000 && !s; k++) { const x = 4 + R.int(SX - 8), z = 4 + R.int(SZ - 8), y = 3 + R.int(SEA); if (!get(x, y, z) && solidAt(x, y - 1, z) && y < surf(x, z) - 3 && !parts.some(p => Math.hypot(p.x - x, p.z - z) < 6)) s = { x, y, z, cave: true }; } if (!s) s = landSpot(10, 60, true); }
    else if (kind === 'crater') s = landSpot(8, 40, true);
    else if (kind === 'dome') { const dm = domes[parts.filter(p => p.dome).length % Math.max(1, domes.length)]; if (dm) s = { x: dm.x, y: dm.y, z: dm.z, dome: true }; else s = landSpot(10, 60, true); }
    if (s) { setRaw(s.x, s.y, s.z, 0); parts.push(s); }
  }
  // boss arenas
  let arena = null;
  if (bio.flat || cfg.boss) arena = { x: cx, z: cz, y: surf(cx, cz) + 1 };
  if (bio.crystals) { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4, px = Math.round(cx + Math.cos(a) * 10), pz = Math.round(cz + Math.sin(a) * 10), h = surf(px, pz), hh = 2 + i * 2; for (let k = 1; k <= hh; k++) setRaw(px, h + k, pz, B.METAL); setRaw(px, h + hh + 1, pz, B.BOSSCRYSTAL); } }
  if (cfg.boss === 'golem') { for (let a = 0; a < 64; a++) { const t = a / 64 * TAU, x = Math.round(cx + Math.cos(t) * 15), z = Math.round(cz + Math.sin(t) * 15); if (Math.abs(x - start.x) + Math.abs(z - start.z) < 4) continue; const h = surf(x, z); if (h > 0) setRaw(x, h + 1, z, B.COBBLE); } }
  return { cfg, bio, start: { x: start.x + .5, y: sh + 1, z: start.z + .5 }, boat: boatPos, parts, arena, heights, space };
}

/* ================================================================
   Models: player, monsters, bosses, boats, parts
   ================================================================ */
const box = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x || 0, y || 0, z || 0); if (parent) parent.add(m); return m; };
function personModel(shirt, skin, pants, hair) {
  const g = new THREE.Group(), M = { shirt: lam(shirt), skin: lam(skin), pants: lam(pants), hair: lam(hair), eye: lam(0x1a1a2a), white: lam(0xffffff) };
  const head = new THREE.Group(); head.position.y = 1.5; g.add(head);
  box(.5, .5, .5, M.skin, 0, .25, 0, head); box(.52, .14, .52, M.hair, 0, .46, 0, head); box(.52, .3, .1, M.hair, 0, .32, .22, head);
  box(.1, .08, .02, M.white, -.12, .26, -.255, head); box(.1, .08, .02, M.white, .12, .26, -.255, head); box(.05, .07, .02, M.eye, -.1, .26, -.262, head); box(.05, .07, .02, M.eye, .14, .26, -.262, head);
  box(.5, .7, .26, M.shirt, 0, 1.12, 0, g);
  const limb = (x, y, mat, mat2) => { const p = new THREE.Group(); p.position.set(x, y, 0); g.add(p); box(.24, .7, .24, mat, 0, -.35, 0, p); if (mat2) box(.25, .2, .25, mat2, 0, -.6, 0, p); return p; };
  const armL = limb(-.37, 1.45, M.shirt, M.skin), armR = limb(.37, 1.45, M.shirt, M.skin), legL = limb(-.13, .75, M.pants), legR = limb(.13, .75, M.pants);
  return { g, head, armL, armR, legL, legR };
}
function mobModel(type) {
  const m = MOBS[type], g = new THREE.Group(), col = lam(m.col, { emissive: 0x000000 }), eye = lam(0x111111), red = lam(0xff2a2a, { emissive: 0x880000 });
  const parts = { g, col, legs: [] };
  if (type.endsWith('slime')) {
    const out = new THREE.Mesh(BOX, new THREE.MeshLambertMaterial({ color: m.col, transparent: true, opacity: .75, emissive: type === 'fireslime' ? 0x662200 : 0 })); out.scale.set(.8, .8, .8); out.position.y = .4; g.add(out); parts.body = out; parts.col = out.material;
    box(.45, .45, .45, lam(new THREE.Color(m.col).multiplyScalar(.6)), 0, .4, 0, g); box(.14, .14, .02, eye, -.18, .5, -.41, g); box(.14, .14, .02, eye, .18, .5, -.41, g); box(.2, .06, .02, eye, 0, .3, -.41, g);
  } else if (type === 'spider') {
    box(1.0, .5, .9, col, 0, .45, .2, g); box(.6, .5, .6, col, 0, .5, -.5, g); box(.1, .1, .02, red, -.15, .55, -.81, g); box(.1, .1, .02, red, .15, .55, -.81, g); box(.08, .08, .02, red, -.05, .62, -.81, g); box(.08, .08, .02, red, .05, .62, -.81, g);
    for (let i = 0; i < 8; i++) { const s = i < 4 ? -1 : 1, k = i % 4, p = new THREE.Group(); p.position.set(s * .45, .5, -.3 + k * .25); g.add(p); box(.8, .08, .08, col, s * .4, -.05, 0, p).rotation.z = -s * .5; parts.legs.push(p); }
  } else if (type === 'rockbot') {
    box(.8, .8, .7, col, 0, .95, 0, g); box(.6, .14, .05, lam(0xffd34d, { emissive: 0x886600 }), 0, 1.1, -.36, g); box(.2, .3, .2, col, 0, 1.5, 0, g); box(.1, .1, .1, red, 0, 1.7, 0, g);
    for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * .22, .55, 0); g.add(p); box(.25, .55, .3, lam(0x555a66), 0, -.27, 0, p); parts.legs.push(p); }
    for (const s of [-1, 1]) box(.18, .6, .18, lam(0x555a66), s * .5, .9, 0, g);
  } else {
    const isAlien = type === 'alien', skin = isAlien ? lam(0x9a6ad8) : lam(0x5aa04a), shirt = isAlien ? lam(0x3a2a6a) : lam(0x2a7a8a), pants = isAlien ? lam(0x2a1a4a) : lam(0x3a3a9a);
    const p = personModel(0, 0, 0, 0); g.add(p.g);
    p.g.traverse(o => { if (o.isMesh) o.material = shirt; });
    p.head.children.forEach(o => o.material = skin); p.armL.children[1].material = skin; p.armR.children[1].material = skin; p.legL.children[0].material = pants; p.legR.children[0].material = pants;
    p.head.children[1].material = skin; p.head.children[2].material = skin;
    if (isAlien) { p.head.scale.set(1.25, 1.2, 1.15); p.head.children[3].material = eye; p.head.children[4].material = eye; p.head.children[3].scale.set(.18, .16, .02); p.head.children[4].scale.set(.18, .16, .02); box(.04, .3, .04, skin, 0, .65, 0, p.head); box(.1, .1, .1, lam(0x9effa0, { emissive: 0x2a8a2a }), 0, .82, 0, p.head); }
    else { p.head.children[3].material = eye; p.head.children[4].material = eye; }
    p.head.children[5].material = p.head.children[6].material = isAlien ? skin : lam(0xff3030);
    p.armL.rotation.x = p.armR.rotation.x = -1.4; parts.person = p; parts.col = shirt;
  }
  return parts;
}
function boatModel(tier) {
  const g = new THREE.Group(), wood = lam(0x9a6a3a), dark = lam(0x6a4422), white = lam(0xf4f6fb), red = lam(0xe8323c), gray = lam(0x8a8f9a), black = lam(0x222228), gold = lam(0xffd34d, { emissive: 0x553300 }), glass = lam(0x9fd8ff, { transparent: true, opacity: .7 });
  const flames = [];
  const flame = (x, y, z, s) => { const f = new THREE.Mesh(new THREE.ConeGeometry(.22 * s, .9 * s, 8), new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: .9 })); f.rotation.z = Math.PI / 2; f.position.set(x, y, z); g.add(f); flames.push(f); };
  const space = tier >= 10, len = space ? 3.6 : 2.6 + Math.min(tier, 9) * .14;
  const hullC = tier === 20 ? gold : tier === 7 ? lam(0x3a2a20) : tier === 6 || tier === 9 ? white : tier === 8 ? lam(0x4f6f9a) : tier >= 11 ? lam([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x3f8fe8, 0x5fd0ff, 0xff7a3a, 0xc0c8d8, 0x9a7aff, 0xffd34d, 0xc84dff, 0xff5fb0, 0x5fffc0][tier]) : wood;
  if (tier === 1) { for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 2.4, 8), wood); l.rotation.z = Math.PI / 2; l.position.set(0, .15, -.64 + i * .32); g.add(l); } box(.06, 1.2, .06, dark, -.8, .8, 0, g); const fl = box(.5, .3, .02, white, -.55, 1.2, 0, g); void fl; }
  else if (!space) {
    box(len, .35, 1.2, hullC, 0, .2, 0, g); box(len - .3, .12, 1.0, dark, 0, .4, 0, g); box(.6, .3, .9, hullC, len / 2 + .2, .25, 0, g).rotation.y = Math.PI / 4;
    box(len, .25, .1, hullC, 0, .5, .58, g); box(len, .25, .1, hullC, 0, .5, -.58, g);
    if (tier === 2) { box(.06, .06, 1.6, dark, 0, .6, 0, g); }
    if (tier === 3) { for (const s of [-1, 1]) { const o = box(.06, .06, 1.4, dark, -.2, .55, s * .8, g); o.rotation.x = s * .3; } }
    if (tier >= 4 && tier !== 6 && tier !== 8 && tier !== 9) { box(.1, 2.6, .1, dark, 0, 1.7, 0, g); const sail = box(.05, 1.8, 1.5, tier === 7 ? black : white, -.2, 1.9, 0, g); sail.rotation.y = Math.PI / 2; if (tier === 7) box(.06, .4, .4, white, -.25, 2.1, 0, g); }
    if (tier === 5) { box(.9, .7, .9, white, -.6, .8, 0, g); box(.92, .2, .92, red, -.6, 1.2, 0, g); }
    if (tier >= 6) { box(.4, .5, .4, black, -len / 2 - .1, .45, 0, g); }
    if (tier === 6 || tier === 9) { box(.1, .4, 1.0, glass, .4, .7, 0, g); box(len, .06, 1.22, red, 0, .3, 0, g); }
    if (tier === 7) { for (const s of [-1, 1]) for (let i = 0; i < 2; i++) box(.4, .14, .14, black, -.4 + i * .8, .45, s * .66, g); }
    if (tier === 8) { box(len + .2, .3, 1.5, black, 0, .05, 0, g); const fan = box(.1, 1.0, 1.0, gray, -len / 2 - .2, .9, 0, g); void fan; }
    if (tier === 9) { for (const s of [-.3, .3]) { box(.6, .3, .3, gray, -len / 2 - .2, .4, s, g); flame(-len / 2 - .7, .4, s, .7); } }
  } else {
    // a rocket with wings that still floats like a boat
    box(len, .35, 1.3, hullC, 0, .2, 0, g);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.5, .55, len, 16), tier === 20 ? gold : white); body.rotation.z = Math.PI / 2; body.position.y = .75; g.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.2, 16), tier === 20 ? gold : red); nose.rotation.z = -Math.PI / 2; nose.position.set(len / 2 + .6, .75, 0); g.add(nose);
    box(.5, .4, .7, glass, .7, 1.15, 0, g);
    const wingSpan = 1.2 + Math.min(1.4, (tier - 10) * .14), wingC = tier >= 11 ? hullC : red;
    for (const s of [-1, 1]) { const w = box(1.4, .08, wingSpan, wingC, -.2, .7, s * (wingSpan / 2 + .4), g); w.rotation.y = s * .25; if (tier >= 19) box(1.0, .08, wingSpan * .8, wingC, -.9, 1.3, s * (wingSpan / 2 + .3), g); }
    box(.7, .9, .08, wingC, -len / 2 + .2, 1.3, 0, g);
    const nEng = tier >= 19 ? 3 : tier >= 13 ? 2 : 1;
    for (let i = 0; i < nEng; i++) { const z = nEng === 1 ? 0 : (i - (nEng - 1) / 2) * .55; const e = new THREE.Mesh(new THREE.CylinderGeometry(.22, .3, .5, 12), gray); e.rotation.z = Math.PI / 2; e.position.set(-len / 2 - .2, .75, z); g.add(e); flame(-len / 2 - .8, .75, z, 1); }
    if (tier >= 14) for (const s of [-1, 1]) box(.9, .1, .1, red, .3, .72, s * (wingSpan + .3), g);
    if (tier >= 17) for (const s of [-1, 1]) box(.5, .5, .06, lam(0xc84dff, { emissive: 0x6a22aa }), -1.2, 1.1, s * .4, g);
    if (tier === 15) for (const s of [-1, 1]) box(.08, .6, .08, gray, .5, -.1, s * .5, g);
  }
  return { g, flames };
}
function partModel() {
  const g = new THREE.Group(), tex = atlasTex.clone(); tex.needsUpdate = true;
  const uv = tileUV(T.part), geo = new THREE.BoxGeometry(.6, .6, .6), a = geo.attributes.uv;
  for (let i = 0; i < a.count; i++) a.setXY(i, lerp(uv[0], uv[2], a.getX(i)), lerp(uv[1], uv[3], a.getY(i)));
  const cube = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: atlasTex, emissive: 0x6a4a00 })); g.add(cube);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 40, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe066, transparent: true, opacity: .35, depthWrite: false, blending: THREE.AdditiveBlending })); beam.position.y = 20; g.add(beam);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd34d, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); glow.scale.setScalar(1.8); g.add(glow);
  return { g, cube };
}
const glowTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(cv); return t; })();

/* bosses */
function golemModel() {
  const g = new THREE.Group(), stone = lam(0x8a8a90), moss = lam(0x4f8a3a), eye = lam(0xffa020, { emissive: 0xff6a00 });
  box(2.4, 2.0, 1.4, stone, 0, 3.0, 0, g); box(1.2, 1.0, 1.0, stone, 0, 4.5, 0, g); box(.3, .16, .05, eye, -.3, 4.6, -.51, g); box(.3, .16, .05, eye, .3, 4.6, -.51, g);
  box(1.0, .4, .2, moss, -.4, 3.6, -.71, g); box(.6, .5, .3, moss, .6, 2.3, -.6, g); box(1.24, .3, 1.04, moss, 0, 5.0, 0, g);
  const arm = s => { const p = new THREE.Group(); p.position.set(s * 1.6, 3.8, 0); g.add(p); box(.8, 2.4, .8, stone, 0, -1.2, 0, p); box(1.0, .8, 1.0, stone, 0, -2.6, 0, p); return p; };
  const leg = s => { const p = new THREE.Group(); p.position.set(s * .6, 2.0, 0); g.add(p); box(.9, 2.0, .9, stone, 0, -1.0, 0, p); return p; };
  return { g, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1), eye, stone };
}
function dragonModel() {
  const g = new THREE.Group(), body = lam(0x5a2a9a), belly = lam(0xc8a0ff), eye = lam(0xff3a3a, { emissive: 0xff0000 }), horn = lam(0xf0e0c0);
  box(1.4, 1.2, 4.0, body, 0, 0, 0, g); box(1.0, .4, 3.4, belly, 0, -.55, 0, g);
  const neck = box(.8, .8, 1.6, body, 0, .4, -2.6, g); neck.rotation.x = -.3;
  const head = new THREE.Group(); head.position.set(0, .9, -3.6); g.add(head); box(1.0, .8, 1.4, body, 0, 0, 0, head); box(.8, .4, .8, body, 0, -.2, -.9, head); box(.2, .2, .05, eye, -.3, .15, -.71, head); box(.2, .2, .05, eye, .3, .15, -.71, head); box(.15, .6, .15, horn, -.3, .6, .3, head).rotation.x = .5; box(.15, .6, .15, horn, .3, .6, .3, head).rotation.x = .5;
  for (let i = 0; i < 4; i++) box(.6 - i * .12, .6 - i * .12, 1.0, body, 0, .1 - i * .1, 2.4 + i * .9, g);
  const wing = s => { const p = new THREE.Group(); p.position.set(s * .7, .5, -.3); g.add(p); const w = box(4.5, .08, 2.6, lam(0x7a4ac0, { side: THREE.DoubleSide }), s * 2.25, 0, .4, p); void w; box(4.5, .16, .16, body, s * 2.25, .05, -.9, p); return p; };
  return { g, wingL: wing(-1), wingR: wing(1), head, body };
}
function ufoModel() {
  const g = new THREE.Group(), metal = lam(0xb8c0cc), lights = [];
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 2.2, 1.2, 24), metal); g.add(saucer);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.4, .25, 8, 32), lam(0x6a7080)); rim.rotation.x = Math.PI / 2; g.add(rim);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, l = new THREE.Mesh(new THREE.SphereGeometry(.25, 8, 6), new THREE.MeshBasicMaterial({ color: 0x9effa0 })); l.position.set(Math.cos(a) * 4.2, -.2, Math.sin(a) * 4.2); g.add(l); lights.push(l); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.8, 20, 12, 0, TAU, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x9fd8ff, transparent: true, opacity: .45 })); dome.position.y = .5; g.add(dome);
  const alien = new THREE.Group(); alien.position.y = .5; g.add(alien); const skin = lam(0x9a6ad8, { emissive: 0x000000 });
  box(1.0, 1.0, 1.0, skin, 0, 1.0, 0, alien); box(.3, .25, .05, lam(0x111111), -.22, 1.1, -.51, alien); box(.3, .25, .05, lam(0x111111), .22, 1.1, -.51, alien); box(.7, .6, .6, lam(0x3a2a6a), 0, .3, 0, alien);
  const crown = box(.8, .2, .8, lam(0xffd34d, { emissive: 0x554400 }), 0, 1.6, 0, alien);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), new THREE.MeshBasicMaterial({ color: 0xff4a6a, transparent: true, opacity: .18, depthWrite: false })); g.add(shield);
  return { g, lights, alien, skin, shield, crown };
}

/* ================================================================
   Scene dressing: sky, clouds, stars, planets
   ================================================================ */
const skyGroup = new THREE.Group(); scene.add(skyGroup);
const stars = (() => { const n = 1500, p = []; const R = rng(3); for (let i = 0; i < n; i++) { const u = R() * 2 - 1, a = R() * TAU, r = 180; p.push(Math.sqrt(1 - u * u) * Math.cos(a) * r, u * r, Math.sqrt(1 - u * u) * Math.sin(a) * r); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false, fog: false })); })();
const earthBall = (() => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#2a6fd0'; c.fillRect(0, 0, 256, 128); const R = rng(5); for (let i = 0; i < 30; i++) { c.fillStyle = R() < .7 ? '#3f9a3a' : '#d8c890'; c.beginPath(); c.ellipse(R() * 256, 20 + R() * 88, 10 + R() * 26, 6 + R() * 14, R() * 3, 0, TAU); c.fill(); } c.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(R() * 256, R() * 128, 8 + R() * 20, 3 + R() * 5, 0, 0, TAU); c.fill(); } const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.SphereGeometry(30, 32, 20), new THREE.MeshLambertMaterial({ map: t, fog: false })); })();
const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff2c0, fog: false, depthWrite: false })); sunSprite.scale.setScalar(40);
const clouds = new THREE.Group(); { const R = rng(11), m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85 }); for (let i = 0; i < 26; i++) { const c = box(4 + R() * 8, 1, 3 + R() * 6, m, R() * 160 - 40, SY + 6, R() * 160 - 40, clouds); void c; } }
function setEnvironment(space, bio) {
  skyGroup.clear();
  if (space) { scene.background = new THREE.Color(0x05060f); scene.fog = new THREE.Fog(0x05060f, 70, 200); skyGroup.add(stars); earthBall.position.set(-90, 30, -110); skyGroup.add(earthBall); sunSprite.position.set(120, 70, 60); skyGroup.add(sunSprite); hemi.color.set(0xd8e0ff); hemi.groundColor.set(0x30304a); hemi.intensity = 1.0; }
  else { scene.background = new THREE.Color(bio.sky); scene.fog = new THREE.Fog(bio.fog, 45, 130); skyGroup.add(clouds); sunSprite.position.set(80, 90, -60); skyGroup.add(sunSprite); hemi.color.set(0xffffff); hemi.groundColor.set(0x556644); hemi.intensity = 1.1; }
}
// the endless ocean around the map
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x2f6fd0, transparent: true, opacity: .9 })); ocean.position.y = SEA - .14; scene.add(ocean);
const seabed = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), lam(0xc8b880)); seabed.position.y = SEA - 6; scene.add(seabed);

/* ================================================================
   Game objects
   ================================================================ */
const player = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: -.15, ground: false, water: false, hp: 20, hurtT: 0, regenT: 0, riding: false, w: .3, h: 1.8, swing: 0, walk: 0, safe: null };
let me = personModel(G.shirt, 0xe0a87c, 0x2a3a8a, 0x4a2a12); scene.add(me.g);
const hand = new THREE.Group(); camera.add(hand); hand.position.set(.55, -.55, -.95); hand.scale.setScalar(.75);
{ const arm = box(.16, .16, .55, lam(0xe0a87c), 0, 0, 0, hand); arm.rotation.x = .2; const handle = box(.05, .05, .5, lam(0x8a5a2a), 0, .12, -.28, hand); handle.rotation.x = -.9; box(.38, .07, .07, lam(0x7fe0e0), 0, .3, -.42, hand); void handle; }
const highlight = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.005, 1.005, 1.005)), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: .6 })); scene.add(highlight);
const crack = new THREE.Mesh(new THREE.BoxGeometry(1.01, 1.01, 1.01), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); scene.add(crack);
let boat = null;
// particles
const PN = 260, pMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .12, .12), new THREE.MeshLambertMaterial({ color: 0xffffff }), PN); pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(pMesh);
const parts = []; for (let i = 0; i < PN; i++) parts.push({ life: 0 }); let pI = 0; const dummy = new THREE.Object3D(), tmpC = new THREE.Color();
const tileColor = id => { const t = D[id].t[1], sx = (t % ATLAS_N) * TPX + 8, sy = Math.floor(t / ATLAS_N) * TPX + 8, d = atlasCanvas.getContext('2d').getImageData(sx, sy, 1, 1).data; return (d[0] << 16) | (d[1] << 8) | d[2]; };
function burst(x, y, z, color, n, spd) { for (let i = 0; i < n; i++) { const p = parts[pI++ % PN]; p.life = .6 + Math.random() * .4; p.x = x + (Math.random() - .5) * .6; p.y = y + (Math.random() - .5) * .6; p.z = z + (Math.random() - .5) * .6; p.vx = (Math.random() - .5) * (spd || 4); p.vy = Math.random() * (spd || 4); p.vz = (Math.random() - .5) * (spd || 4); p.c = color; } }
function updateParticles(dt) { let k = 0; for (const p of parts) { if (p.life <= 0) { dummy.position.set(0, -999, 0); dummy.scale.setScalar(.001); } else { p.life -= dt; p.vy -= 14 * dt * (G.space ? .4 : 1); p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; dummy.position.set(p.x, p.y, p.z); dummy.scale.setScalar(Math.max(.01, Math.min(1, p.life * 2))); pMesh.setColorAt(k, tmpC.setHex(p.c)); } dummy.updateMatrix(); pMesh.setMatrixAt(k++, dummy.matrix); } pMesh.instanceMatrix.needsUpdate = true; if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true; }

/* ================================================================
   Sound
   ================================================================ */
let AC = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } else if (AC.state === 'suspended') AC.resume(); }
function tone(f, d, type, v, slide, delay) { if (!AC) return; const t0 = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d); g.gain.setValueAtTime(v || .06, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + d + .02); }
function noiz(d, v, f, delay) { if (!AC) return; const t0 = AC.currentTime + (delay || 0), b = AC.createBuffer(1, Math.ceil(AC.sampleRate * d), AC.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length); const s = AC.createBufferSource(); s.buffer = b; const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f || 1200; const g = AC.createGain(); g.gain.value = v || .1; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(t0); }
const SFX = {
  dig: () => noiz(.07, .08, 900), break: () => { noiz(.15, .14, 700); tone(180, .08, 'square', .03, 90); }, place: () => { noiz(.06, .12, 500); tone(140, .06, 'sine', .08); },
  hit: () => { tone(220, .1, 'square', .06, 110); noiz(.06, .1, 1500); }, hurt: () => { tone(300, .2, 'sawtooth', .07, 120); }, jump: () => tone(300, .08, 'sine', .04, 420),
  part: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .14, 'square', .05, null, i * .08)); }, gem: () => tone(1320, .12, 'sine', .05, 1760),
  boss: () => { tone(80, .9, 'sawtooth', .1, 50); noiz(.8, .12, 300); }, win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, 'square', .05, null, i * .12)); },
  splash: () => noiz(.3, .1, 900), boom: () => { noiz(.6, .25, 400); tone(60, .5, 'sine', .15, 30); }, laser: () => tone(1400, .25, 'sawtooth', .04, 200), fire: () => noiz(.4, .12, 1200), launch: () => { noiz(3, .25, 500); tone(70, 3, 'sawtooth', .08, 140); },
};

/* ================================================================
   Level start / finish
   ================================================================ */
let lvl = null, partObjs = [];
function startLevel(L) {
  G.level = L; G.won = false; G.mode = 'loading';
  lvl = generate(L); G.cfg = lvl.cfg; G.bio = lvl.bio; G.space = lvl.space;
  for (let i = 0; i < chunks.length; i++) chunks[i].dirty = true; rebuildDirty(999);
  setEnvironment(lvl.space, lvl.bio); ocean.visible = seabed.visible = !lvl.space;
  // player
  Object.assign(player, { x: lvl.start.x, y: lvl.start.y, z: lvl.start.z, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: -.2, hp: 20, riding: false, safe: { x: lvl.start.x, y: lvl.start.y, z: lvl.start.z } });
  player.yaw = Math.atan2(-(SX / 2 - player.x), -(SZ / 2 - player.z));
  scene.remove(me.g); me = personModel(G.shirt, 0xe0a87c, 0x2a3a8a, 0x4a2a12); scene.add(me.g);
  // inventory: a few blocks to start building straight away
  G.inv = new Map(); const give = (id, n) => G.inv.set(id, (G.inv.get(id) || 0) + n);
  if (lvl.space) { give(B.METAL, 16); give(B.MOONROCK, 16); } else { give(B.DIRT, 16); give(B.PLANKS, 16); }
  G.sel = 0; G.gems = 0;
  // boat
  if (boat) scene.remove(boat.m.g);
  const bm = boatModel(L); scene.add(bm.g); boat = { m: bm, x: lvl.boat.x, z: lvl.boat.z, yaw: Math.PI / 2, v: 0, y: lvl.space ? lvl.start.y - 1.2 : SEA - .25, speed: 3.6 + L * .45 };
  G.boatHome = { x: boat.x, z: boat.z };
  // parts
  for (const p of partObjs) scene.remove(p.m.g); partObjs = [];
  for (const s of lvl.parts) { const m = partModel(); m.g.position.set(s.x + .5, s.y + .45, s.z + .5); scene.add(m.g); partObjs.push({ s, m, got: false }); }
  G.partsGot = 0;
  // monsters and boss
  for (const m of G.mobs) scene.remove(m.p.g); G.mobs = [];
  for (const [type, n] of lvl.cfg.mobs) for (let i = 0; i < n; i++) spawnMob(type);
  if (G.boss) scene.remove(G.boss.root); G.boss = null; for (const s of G.shots) scene.remove(s.m); G.shots = [];
  if (lvl.cfg.boss) makeBoss(lvl.cfg.boss);
  $('bossbar').classList.toggle('hide', !G.boss); if (G.boss) $('bossname').textContent = G.boss.name;
  refreshHotbar(); updateHearts();
  $('lvl').textContent = 'LEVEL ' + L + ' · ' + lvl.cfg.name.replace('BOSS: ', '');
}
function spawnMob(type, near) {
  const M = MOBS[type]; let pos = null;
  for (let k = 0; k < 300 && !pos; k++) {
    let x, z; if (near) { const a = Math.random() * TAU, d = 4 + Math.random() * 5; x = Math.floor(near.x + Math.cos(a) * d); z = Math.floor(near.z + Math.sin(a) * d); } else { x = 4 + Math.floor(Math.random() * (SX - 8)); z = 4 + Math.floor(Math.random() * (SZ - 8)); }
    if (x < 1 || z < 1 || x >= SX - 1 || z >= SZ - 1) continue;
    let y = SY - 2; while (y > 0 && !solidAt(x, y, z)) y--; if (y <= 0 || D[get(x, y, z)].liquid) continue; if (get(x, y + 1, z) || get(x, y + 2, z)) continue;
    if (!near && Math.hypot(x - player.x, z - player.z) < 14) continue;
    pos = { x: x + .5, y: y + 1, z: z + .5 };
  }
  if (!pos) return;
  const p = mobModel(type); scene.add(p.g);
  G.mobs.push({ type, M, p, x: pos.x, y: pos.y, z: pos.z, vx: 0, vy: 0, vz: 0, hp: M.hp, yaw: 0, cd: 0, hopT: Math.random(), hurt: 0, ground: false, anim: 0 });
}
function finishLevel() {
  if (G.won) return; G.won = true; G.done[G.level] = true; saveGame(); SFX.win(); confetti();
  toast('LEVEL COMPLETE!', G.level === 20 ? 'You beat the whole game!' : 'Sailing to the next level...');
  setTimeout(() => {
    if (G.level >= 20) { showEnding(); return; }
    playCine(G.level === 10 ? 'launch' : G.level >= 11 ? 'fly' : 'sail', G.level + 1);
  }, 2600);
}

/* ================================================================
   Bosses
   ================================================================ */
function makeBoss(kind) {
  const a = lvl.arena, b = { kind, x: a.x + .5, y: a.y, z: a.z - 4.5, vy: 0, t: 0, state: 'idle', st: 0, hurt: 0, yaw: 0 };
  if (kind === 'golem') { b.name = 'STONE GOLEM KING'; b.hp = b.max = 20; b.m = golemModel(); b.w = 1.5; b.h = 5.2; }
  if (kind === 'dragon') { b.name = 'SPACE DRAGON'; b.hp = b.max = 24; b.m = dragonModel(); b.w = 1.5; b.h = 1.6; b.y = a.y + 9; b.ang = 0; }
  if (kind === 'overlord') { b.name = 'ALIEN OVERLORD'; b.hp = b.max = 24; b.m = ufoModel(); b.w = 2.5; b.h = 2.5; b.y = a.y + 9; b.shield = true; b.z = a.z; }
  b.root = b.m.g; scene.add(b.root); G.boss = b;
}
function shoot(kind, x, y, z, vx, vy, vz) {
  const m = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(kind === 'boulder' ? .6 : .45, 12, 8), kind === 'boulder' ? lam(0x8a8a90) : new THREE.MeshBasicMaterial({ color: kind === 'laser' ? 0xff2a4a : 0xff8a20 })); m.add(core);
  if (kind !== 'boulder') { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: kind === 'laser' ? 0xff3060 : 0xffa030, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.setScalar(2.4); m.add(s); }
  m.position.set(x, y, z); scene.add(m); G.shots.push({ kind, m, x, y, z, vx, vy, vz, life: 6 });
}
function updateBoss(dt) {
  const b = G.boss; if (!b || b.dead) return;
  b.t += dt; b.st += dt; b.hurt = Math.max(0, b.hurt - dt);
  const px = player.x, pz = player.z, dx = px - b.x, dz = pz - b.z, dist = Math.hypot(dx, dz);
  if (b.kind === 'golem') {
    const m = b.m; b.yaw = Math.atan2(-dx, -dz);
    if (b.state === 'idle' || b.state === 'walk') {
      b.state = 'walk'; const sp = 1.6; if (dist > 3) { b.x += dx / dist * sp * dt; b.z += dz / dist * sp * dt; }
      const s = Math.sin(b.t * 4); m.legL.rotation.x = s * .5; m.legR.rotation.x = -s * .5; m.armL.rotation.x = -s * .4; m.armR.rotation.x = s * .4;
      if (dist < 5 && b.st > 2.5) { b.state = 'raise'; b.st = 0; toast('JUMP!', 'The Golem is about to stomp'); }
      else if (b.st > 5) { b.state = 'throw'; b.st = 0; }
    } else if (b.state === 'raise') { const k = Math.min(1, b.st / .9); m.armL.rotation.x = m.armR.rotation.x = Math.PI * .9 * k; if (b.st > .9) { b.state = 'slam'; b.st = 0; } }
    else if (b.state === 'slam') {
      m.armL.rotation.x = m.armR.rotation.x = lerp(Math.PI * .9, 0, Math.min(1, b.st / .15));
      if (!b.slammed && b.st > .15) { b.slammed = true; SFX.boom(); shake = .5; burst(b.x, b.y + .2, b.z, 0x8a8a90, 30, 8); if (dist < 7 && player.ground) hurt(5, b.x, b.z); }
      if (b.st > .4) { b.state = 'dizzy'; b.st = 0; b.slammed = false; }
    } else if (b.state === 'dizzy') { m.eye.emissive.setHex(b.st % .3 < .15 ? 0x2266ff : 0x0033aa); b.root.rotation.z = Math.sin(b.t * 10) * .05; if (b.st > 2.4) { b.state = 'walk'; b.st = 0; m.eye.emissive.setHex(0xff6a00); b.root.rotation.z = 0; } }
    else if (b.state === 'throw') { m.armR.rotation.x = Math.PI * Math.min(1, b.st / .6); if (b.st > .6 && !b.thrown) { b.thrown = true; const T = 1.3, ty = player.y + .5; shoot('boulder', b.x, b.y + 5, b.z, dx / T, (ty - (b.y + 5)) / T + 9.8 * T / 2 * (G.space ? .4 : 1), dz / T); } if (b.st > 1) { b.state = 'walk'; b.st = 0; b.thrown = false; m.armR.rotation.x = 0; } }
    b.root.position.set(b.x, b.y, b.z); b.root.rotation.y = b.yaw;
  } else if (b.kind === 'dragon') {
    const a = lvl.arena, m = b.m;
    m.wingL.rotation.z = Math.sin(b.t * 6) * .5; m.wingR.rotation.z = -Math.sin(b.t * 6) * .5;
    if (b.state === 'idle' || b.state === 'fly') {
      b.state = 'fly'; b.ang += dt * .45; const tx = a.x + Math.cos(b.ang) * 12, tz = a.z + Math.sin(b.ang) * 12, ty = a.y + 8 + Math.sin(b.t) * 1.5;
      b.x = lerp(b.x, tx, dt * 2); b.z = lerp(b.z, tz, dt * 2); b.y = lerp(b.y, ty, dt * 2); b.yaw = Math.atan2(-(tx - b.x) - Math.sin(b.ang + .1) * 3, -(tz - b.z) + Math.cos(b.ang + .1) * 3);
      if (b.st > 2.6 && Math.floor(b.st / 2.6) !== b.lastShot) { b.lastShot = Math.floor(b.st / 2.6); const T = 1.6; SFX.fire(); shoot('fireball', b.x, b.y, b.z, (px - b.x) / T, (player.y + .8 - b.y) / T, (pz - b.z) / T); }
      if (b.st > 11) { b.state = 'land'; b.st = 0; b.lx = a.x + (Math.random() - .5) * 8; b.lz = a.z + (Math.random() - .5) * 8; toast('THE DRAGON LANDED!', 'Hit it now!'); }
    } else if (b.state === 'land') {
      b.x = lerp(b.x, b.lx, dt * 2.5); b.z = lerp(b.z, b.lz, dt * 2.5); b.y = lerp(b.y, a.y + .8, dt * 2.5); b.yaw = Math.atan2(-dx, -dz); m.wingL.rotation.z = .9; m.wingR.rotation.z = -.9;
      if (b.st > 6) { b.state = 'fly'; b.st = 0; b.lastShot = -1; }
    }
    b.root.position.set(b.x, b.y, b.z); b.root.rotation.y = b.yaw;
  } else if (b.kind === 'overlord') {
    const a = lvl.arena, m = b.m; m.lights.forEach((l, i) => l.material.color.setHex((i + Math.floor(b.t * 6)) % 3 ? 0x9effa0 : 0xffd34d)); b.root.rotation.y += dt * .4;
    b.countT = (b.countT || 0) - dt;
    if (b.countT <= 0) { b.countT = .4; let n = 0; for (let y = 0; y < SY; y++) for (let z = a.z - 12; z <= a.z + 12; z++) for (let x = a.x - 12; x <= a.x + 12; x++) if (get(x, y, z) === B.BOSSCRYSTAL) n++; b.crystals = n; }
    const crystals = b.crystals;
    if (b.shield && crystals === 0) { b.shield = false; b.st = 0; SFX.boom(); toast('SHIELD DOWN!', 'The UFO is coming down. Hit the Overlord!'); }
    m.shield.visible = b.shield; b.x = lerp(b.x, a.x + Math.sin(b.t * .3) * 3, dt); b.z = lerp(b.z, a.z + Math.cos(b.t * .3) * 3, dt);
    b.y = lerp(b.y, b.shield ? a.y + 9 : a.y + 1.2, dt * 1.5);
    if (b.st > 3) { b.st = 0; SFX.laser(); const T = 1.1; shoot('laser', b.x, b.y - .5, b.z, (px - b.x) / T, (player.y + .9 - (b.y - .5)) / T, (pz - b.z) / T); }
    b.minionT = (b.minionT || 0) + dt; if (b.minionT > 12 && G.mobs.length < 5) { b.minionT = 0; spawnMob('alien', { x: a.x, z: a.z }); }
    b.root.position.set(b.x, b.y, b.z);
  }
  // flash when hurt
  $('bossFill').style.width = (b.hp / b.max * 100) + '%';
}
function hitBoss(dmg) {
  const b = G.boss; if (!b || b.dead || b.hurt > 0) return false;
  if (b.kind === 'overlord' && b.shield) { toast('The shield blocks it!', 'Break the red crystals first'); return true; }
  if (b.kind === 'dragon' && b.state !== 'land' && player.y < b.y - 3) return false;
  const bonus = b.kind === 'golem' && b.state === 'dizzy' ? 2 : 1; b.hp -= dmg * bonus; b.hurt = .25; SFX.hit(); burst(b.x, b.y + (b.kind === 'golem' ? 3 : 0), b.z, 0xff4040, 10, 5);
  if (b.hp <= 0) { b.dead = true; SFX.boom(); SFX.win(); burst(b.x, b.y + 2, b.z, 0xffd34d, 80, 10); scene.remove(b.root); $('bossbar').classList.add('hide');
    toast(b.name + ' DEFEATED!', 'Get back in your boat!'); for (const m of G.mobs) scene.remove(m.p.g); G.mobs = []; }
  return true;
}

/* ================================================================
   Player: movement, mining, building, damage
   ================================================================ */
const input = { mx: 0, my: 0, jump: false, mine: false, build: false, keys: {} };
let shake = 0;
function collides(x, y, z, w, h) {
  for (let by = Math.floor(y); by <= Math.floor(y + h - .001); by++) for (let bz = Math.floor(z - w); bz <= Math.floor(z + w - .001); bz++) for (let bx = Math.floor(x - w); bx <= Math.floor(x + w - .001); bx++) if (solidAt(bx, by, bz)) return true;
  return false;
}
function moveBody(o, dt, w, h) {
  const steps = Math.ceil(Math.max(Math.abs(o.vx), Math.abs(o.vy), Math.abs(o.vz)) * dt / .25) || 1, sdt = dt / steps; let hitX = false, hitZ = false;
  o.ground = false;
  for (let i = 0; i < steps; i++) {
    let nx = o.x + o.vx * sdt; if (collides(nx, o.y, o.z, w, h)) { hitX = true; o.vx = 0; } else o.x = nx;
    let nz = o.z + o.vz * sdt; if (collides(o.x, o.y, nz, w, h)) { hitZ = true; o.vz = 0; } else o.z = nz;
    let ny = o.y + o.vy * sdt;
    if (collides(o.x, ny, o.z, w, h)) { if (o.vy < 0) { o.y = Math.floor(ny) + 1; if (collides(o.x, o.y, o.z, w, h)) o.y = Math.floor(o.y + .5); o.ground = true; } o.vy = 0; } else o.y = ny;
  }
  o.x = clamp(o.x, .5, SX - .5); o.z = clamp(o.z, .5, SZ - .5);
  return { hitX, hitZ };
}
function hurt(n, fx, fz) {
  if (player.hurtT > 0 || G.won) return; player.hp -= n; player.hurtT = .8; player.regenT = 0; SFX.hurt(); G.hurtFlash = .5;
  if (fx != null) { const dx = player.x - fx, dz = player.z - fz, d = Math.hypot(dx, dz) || 1; player.vx = dx / d * 7; player.vz = dz / d * 7; player.vy = 5; }
  if (player.hp <= 0) { player.hp = 20; toast('OUCH!', 'Back to your boat. You keep your parts!'); Object.assign(player, { x: lvl.start.x, y: lvl.start.y, z: lvl.start.z, vx: 0, vy: 0, vz: 0, riding: false }); }
  updateHearts();
}
function eye() { return new THREE.Vector3(player.x, player.y + 1.62, player.z); }
function lookDir() { const cp = Math.cos(player.pitch); return new THREE.Vector3(-Math.sin(player.yaw) * cp, Math.sin(player.pitch), -Math.cos(player.yaw) * cp); }
function rayAABB(o, d, bx, by, bz, w, h) { // returns distance to a box centred on (bx,bz) from by to by+h, or Infinity
  let tmin = 0, tmax = 1e9; const mn = [bx - w, by, bz - w], mx = [bx + w, by + h, bz + w], oo = [o.x, o.y, o.z], dd = [d.x, d.y, d.z];
  for (let i = 0; i < 3; i++) { if (Math.abs(dd[i]) < 1e-8) { if (oo[i] < mn[i] || oo[i] > mx[i]) return Infinity; continue; } let t1 = (mn[i] - oo[i]) / dd[i], t2 = (mx[i] - oo[i]) / dd[i]; if (t1 > t2) [t1, t2] = [t2, t1]; tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return Infinity; }
  return tmin;
}
let target = null, mineT = 0, mineKey = '', attackCd = 0;
function updateTarget() {
  const o = eye(), d = lookDir();
  target = raycast(o, d, 5.5, id => !D[id].liquid);
  // monsters and bosses in the way take priority over blocks
  let best = target ? target.t : 5.5, hitWho = null;
  for (const m of G.mobs) { const t = rayAABB(o, d, m.x, m.y, m.z, m.M.w / 2 + .15, m.M.h + .1); if (t < best) { best = t; hitWho = m; } }
  if (G.boss && !G.boss.dead) { const b = G.boss, t = rayAABB(o, d, b.x, b.kind === 'golem' ? b.y : b.y - b.h / 2, b.z, b.w + .3, b.kind === 'golem' ? b.h : b.h * 1.4); if (t < Math.max(best, 6.5)) { best = t; hitWho = 'boss'; } }
  return hitWho;
}
function actMine(dt) {
  const who = updateTarget();
  if (!input.mine) { mineT = 0; crack.material.opacity = 0; return who; }
  player.swing += dt * 14;
  if (who) { mineT = 0; crack.material.opacity = 0; if (attackCd <= 0) { attackCd = .35; if (who === 'boss') hitBoss(1); else hitMob(who); } return who; }
  if (!target) { mineT = 0; crack.material.opacity = 0; return null; }
  const k = target.x + ',' + target.y + ',' + target.z; if (k !== mineKey) { mineKey = k; mineT = 0; }
  const hard = D[target.id].hard; if (hard > 100) { crack.material.opacity = 0; return null; }
  mineT += dt; if (Math.floor(mineT * 6) !== Math.floor((mineT - dt) * 6)) SFX.dig();
  crack.position.set(target.x + .5, target.y + .5, target.z + .5); crack.material.opacity = Math.min(.55, mineT / hard * .55);
  if (mineT >= hard) {
    const id = target.id, dr = D[id].drop; setBlock(target.x, target.y, target.z, 0); SFX.break(); burst(target.x + .5, target.y + .5, target.z + .5, tileColor(id), 10, 4);
    if (dr && !(id === B.LEAVES || id === B.JLEAVES) || ((id === B.LEAVES || id === B.JLEAVES) && Math.random() < .3)) { G.inv.set(dr, (G.inv.get(dr) || 0) + 1); refreshHotbar(); }
    if (D[id].gem) { G.gems += D[id].gem; SFX.gem(); }
    if (id === B.BOSSCRYSTAL) { SFX.boom(); burst(target.x + .5, target.y + .5, target.z + .5, 0xff3a5a, 30, 7); toast('CRYSTAL SMASHED!', (G.boss ? Math.max(0, G.boss.crystals - 1) : 0) + ' left'); }
    // blocks above a broken cactus or leaves stay put; sand falls
    for (let y = target.y + 1; y < SY && get(target.x, y, target.z) === B.SAND; y++) { setBlock(target.x, y - 1, target.z, B.SAND); setBlock(target.x, y, target.z, 0); }
    mineT = 0; mineKey = '';
  }
  return null;
}
function hitMob(m) {
  m.hp--; m.hurt = .3; SFX.hit(); const dx = m.x - player.x, dz = m.z - player.z, d = Math.hypot(dx, dz) || 1; m.vx = dx / d * 6; m.vz = dz / d * 6; m.vy = 4;
  burst(m.x, m.y + .5, m.z, m.M.col, 6, 3);
  if (m.hp <= 0) { burst(m.x, m.y + .5, m.z, m.M.col, 24, 5); scene.remove(m.p.g); G.mobs.splice(G.mobs.indexOf(m), 1); G.gems += 2; SFX.gem(); }
}
function actBuild() {
  const who = updateTarget(); if (who || !target) return;
  const x = target.x + target.nx, y = target.y + target.ny, z = target.z + target.nz;
  if (x < 0 || z < 0 || x >= SX || z >= SZ || y < 0 || y >= SY - 1) return;
  const cur = get(x, y, z); if (cur && !D[cur].liquid) return;
  const list = hotList(), id = list[G.sel]; if (!id) { toast('No blocks!', 'MINE some blocks first'); return; }
  // don't build inside yourself or a monster
  if (x + 1 > player.x - player.w && x < player.x + player.w && z + 1 > player.z - player.w && z < player.z + player.w && y + 1 > player.y && y < player.y + player.h) return;
  for (const m of G.mobs) if (Math.abs(x + .5 - m.x) < .5 + m.M.w / 2 && Math.abs(z + .5 - m.z) < .5 + m.M.w / 2 && y + 1 > m.y && y < m.y + m.M.h) return;
  setBlock(x, y, z, id); SFX.place(); player.swing = 1;
  const n = G.inv.get(id) - 1; if (n <= 0) G.inv.delete(id); else G.inv.set(id, n); refreshHotbar();
}
const hotList = () => [...G.inv.keys()].slice(0, 8);

function updatePlayer(dt) {
  player.hurtT = Math.max(0, player.hurtT - dt); player.regenT += dt; if (player.regenT > 4 && player.hp < 20) { player.hp++; player.regenT = 3; updateHearts(); }
  attackCd -= dt;
  const grav = (G.space ? lvl.bio.grav : 1) * 26;
  if (player.riding) { updateBoat(dt); return; }
  // walk relative to where you are looking
  let fx = -input.my, sx = input.mx; const k = input.keys;
  if (k.KeyW || k.ArrowUp) fx = 1; if (k.KeyS || k.ArrowDown) fx = -1; if (k.KeyA || k.ArrowLeft) sx = -1; if (k.KeyD || k.ArrowRight) sx = 1;
  const mag = Math.min(1, Math.hypot(fx, sx)), sy = Math.sin(player.yaw), cy = Math.cos(player.yaw);
  const inW = D[get(Math.floor(player.x), Math.floor(player.y + .4), Math.floor(player.z))].liquid, lava = D[get(Math.floor(player.x), Math.floor(player.y + .2), Math.floor(player.z))].lava;
  const speed = (inW ? 2.6 : 4.6) * (G.space ? .95 : 1);
  let wx = 0, wz = 0; if (mag > .05) { wx = (-sy * fx + cy * sx) / Math.max(1, Math.hypot(fx, sx)) * speed; wz = (-cy * fx - sy * sx) / Math.max(1, Math.hypot(fx, sx)) * speed; }
  const acc = player.ground ? 22 : 9; player.vx += clamp(wx - player.vx, -acc * dt, acc * dt); player.vz += clamp(wz - player.vz, -acc * dt, acc * dt);
  if (inW) { player.vy -= grav * .25 * dt; player.vy = Math.max(player.vy, -3); if (input.jump || k.Space) player.vy = Math.min(player.vy + 30 * dt, 4); }
  else { player.vy -= grav * dt; if ((input.jump || k.Space) && player.ground) { player.vy = 8.6; SFX.jump(); } }
  player.vy = Math.max(player.vy, -40);
  const before = { x: player.x, z: player.z };
  const hit = moveBody(player, dt, player.w, player.h);
  // auto-jump up single steps, like on a tablet
  if (player.ground && mag > .3 && (hit.hitX || hit.hitZ)) { const ax = Math.floor(player.x + Math.sign(wx) * .5), az = Math.floor(player.z + Math.sign(wz) * .5), fy = Math.floor(player.y); if ((solidAt(ax, fy, Math.floor(player.z)) || solidAt(Math.floor(player.x), fy, az)) && !solidAt(ax, fy + 1, az) && !solidAt(ax, fy + 2, az)) player.vy = 8.2; }
  void before;
  if (lava) hurt(3, null, null);
  if (player.ground && !inW && !lava) player.safe = { x: player.x, y: player.y, z: player.z };
  if (player.y < -8) { hurt(2); Object.assign(player, { x: player.safe.x, y: player.safe.y + .1, z: player.safe.z, vx: 0, vy: 0, vz: 0 }); toast('Whoa, you fell!', 'Back to safety'); }
  player.walk += Math.hypot(player.vx, player.vz) * dt;
  // cactus pricks
  if (get(Math.floor(player.x + .4), Math.floor(player.y + .5), Math.floor(player.z)) === B.CACTUS || get(Math.floor(player.x - .4), Math.floor(player.y + .5), Math.floor(player.z)) === B.CACTUS) hurt(1);
  // pick up parts
  for (const p of partObjs) { if (p.got) continue; const g = p.m.g.position; if (Math.hypot(g.x - player.x, g.y - (player.y + .9), g.z - player.z) < 1.4) { p.got = true; scene.remove(p.m.g); G.partsGot++; SFX.part(); burst(g.x, g.y, g.z, 0xffd34d, 26, 5);
    const left = partObjs.length - G.partsGot; toast(left ? 'BOAT PART ' + G.partsGot + '/' + partObjs.length + '!' : 'ALL PARTS FOUND!', left ? left + ' more to go' : 'Get back in your boat to finish!'); } }
}

/* ================================================================
   The boat
   ================================================================ */
const nearBoat = () => boat && Math.hypot(boat.x - player.x, boat.z - player.z) < 3.6 && Math.abs(player.y - boat.y) < 4;
const canFloat = (x, z) => { const bx = Math.floor(x), bz = Math.floor(z); if (bx < 1 || bz < 1 || bx >= SX - 1 || bz >= SZ - 1) return false; for (const y of [Math.floor(boat.y), Math.floor(boat.y) + 1]) if (solidAt(bx, y, bz)) return false; return G.space || D[get(bx, SEA - 1, bz)].liquid; };
function boardOrLeave() {
  if (!boat) return;
  if (!player.riding) { if (!nearBoat()) return; player.riding = true; SFX.splash(); if (levelDone()) finishLevel(); return; }
  // step off onto the nearest land
  let best = null;
  for (let r = 1; r <= 5 && !best; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) { const x = Math.floor(boat.x) + dx, z = Math.floor(boat.z) + dz; let y = SY - 3; while (y > 0 && !solidAt(x, y, z)) y--; if (y > 0 && !D[get(x, y, z)].liquid && !solidAt(x, y + 1, z) && !solidAt(x, y + 2, z) && Math.abs(y + 1 - boat.y) < 7) { const d = Math.hypot(dx, dz); if (!best || d < best.d) best = { x: x + .5, y: y + 1, z: z + .5, d }; } }
  if (!best) { toast('No land here', 'Sail closer to an island'); return; }
  player.riding = false; Object.assign(player, { x: best.x, y: best.y, z: best.z, vx: 0, vy: 0, vz: 0 });
}
const levelDone = () => (G.cfg.boss ? G.boss && G.boss.dead : partObjs.every(p => p.got));
function updateBoat(dt) {
  let fx = -input.my, sx = input.mx; const k = input.keys;
  if (k.KeyW || k.ArrowUp) fx = 1; if (k.KeyS || k.ArrowDown) fx = -1; if (k.KeyA || k.ArrowLeft) sx = -1; if (k.KeyD || k.ArrowRight) sx = 1;
  const mag = Math.min(1, Math.hypot(fx, sx));
  if (mag > .1) { const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw), wx = -sy * fx + cy * sx, wz = -cy * fx - sy * sx, want = Math.atan2(wz, wx); let da = ((want - boat.yaw + Math.PI * 3) % TAU) - Math.PI; boat.yaw += clamp(da, -2.4 * dt, 2.4 * dt); }
  boat.v = lerp(boat.v, mag * boat.speed, dt * 2);
  const nx = boat.x + Math.cos(boat.yaw) * boat.v * dt, nz = boat.z + Math.sin(boat.yaw) * boat.v * dt;
  if (canFloat(nx + Math.cos(boat.yaw) * 1.2, nz + Math.sin(boat.yaw) * 1.2)) { boat.x = nx; boat.z = nz; } else { boat.v *= .3; }
  player.x = boat.x; player.z = boat.z; player.y = boat.y + .3; player.vx = player.vz = player.vy = 0;
  if (Math.random() < boat.v * dt * 3) burst(boat.x - Math.cos(boat.yaw) * 1.8, boat.y + .1, boat.z - Math.sin(boat.yaw) * 1.8, G.space ? 0xffa030 : 0xe8f4ff, 1, 2);
  if (levelDone() && !G.won) finishLevel();
}
function placeBoat(t) {
  const g = boat.m.g; g.position.set(boat.x, boat.y + (G.space ? Math.sin(t * 2) * .15 : Math.sin(t * 2.2) * .06), boat.z); g.rotation.set(G.space ? 0 : Math.sin(t * 1.7) * .03, -boat.yaw, G.space ? 0 : Math.sin(t * 2.1) * .04);
  for (const f of boat.m.flames) { f.visible = G.space ? true : boat.v > .5; f.scale.set(1, .6 + Math.random() * .6 + boat.v * .05, 1); }
  // glow when it is time to leave
  if (levelDone() && !G.won && !player.riding) g.position.y += Math.abs(Math.sin(t * 4)) * .3;
}

/* ================================================================
   Monsters
   ================================================================ */
function updateMobs(dt) {
  const grav = (G.space ? lvl.bio.grav : 1) * 26;
  for (const m of [...G.mobs]) {
    m.cd -= dt; m.hurt = Math.max(0, m.hurt - dt); m.hopT -= dt;
    const dx = player.x - m.x, dz = player.z - m.z, d = Math.hypot(dx, dz), chase = d < 14 && !player.riding;
    let wx = 0, wz = 0; const sp = m.M.speed;
    if (chase && d > .8) { wx = dx / d * sp; wz = dz / d * sp; m.yaw = Math.atan2(-dx, -dz); }
    else if (!chase) { if (!m.wander || m.hopT < -3) { m.wander = Math.random() * TAU; m.hopT = 0; } wx = Math.cos(m.wander) * sp * .35; wz = Math.sin(m.wander) * sp * .35; m.yaw = Math.atan2(-wx, -wz); }
    const slime = m.type.endsWith('slime');
    if (slime) { if (m.ground && m.hopT <= 0) { m.vy = 7; m.hopT = .9 + Math.random() * .5; m.vx = wx * 1.3; m.vz = wz * 1.3; } else if (m.ground) { m.vx *= .8; m.vz *= .8; } }
    else if (m.hurt <= 0) { m.vx += clamp(wx - m.vx, -12 * dt, 12 * dt); m.vz += clamp(wz - m.vz, -12 * dt, 12 * dt); }
    m.vy -= grav * dt; const hit = moveBody(m, dt, m.M.w / 2 - .05, m.M.h);
    if (!slime && m.ground && (hit.hitX || hit.hitZ)) m.vy = 7.5;
    if (m.y < -8 || D[get(Math.floor(m.x), Math.floor(m.y + .2), Math.floor(m.z))].liquid && !G.space) { if (D[get(Math.floor(m.x), Math.floor(m.y + .2), Math.floor(m.z))].lava || m.y < -8) { scene.remove(m.p.g); G.mobs.splice(G.mobs.indexOf(m), 1); continue; } m.vy = 3; }
    if (d < .8 + m.M.w / 2 && Math.abs(player.y - m.y) < 1.6 && m.cd <= 0 && !player.riding) { m.cd = 1.1; hurt(m.M.dmg, m.x, m.z); }
    // pose
    m.anim += Math.hypot(m.vx, m.vz) * dt * 3;
    const g = m.p.g; g.position.set(m.x, m.y, m.z); g.rotation.y = m.yaw;
    if (slime) { const s = m.ground ? 1 : 1.15; g.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s)); }
    if (m.p.person) { const s = Math.sin(m.anim * 2); m.p.person.legL.rotation.x = s * .6; m.p.person.legR.rotation.x = -s * .6; }
    m.p.legs.forEach((l, i) => l.rotation.x = Math.sin(m.anim * 3 + i) * .4);
    if (m.p.col && m.p.col.emissive) m.p.col.emissive.setHex(m.hurt > 0 ? 0xaa0000 : (m.type === 'fireslime' ? 0x662200 : 0));
  }
  // keep a few monsters around (not on boss levels)
  if (!G.cfg.boss) { G.respawnT = (G.respawnT || 0) + dt; const want = G.cfg.mobs.reduce((a, m) => a + m[1], 0); if (G.respawnT > 25 && G.mobs.length < want) { G.respawnT = 0; const pick = G.cfg.mobs[Math.floor(Math.random() * G.cfg.mobs.length)]; spawnMob(pick[0]); } }
}
function updateShots(dt) {
  const grav = (G.space ? .4 : 1) * 9.8;
  for (const s of [...G.shots]) {
    s.life -= dt; if (s.kind === 'boulder') s.vy -= grav * dt;
    s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.m.position.set(s.x, s.y, s.z);
    const pd = Math.hypot(s.x - player.x, s.y - (player.y + .9), s.z - player.z);
    let done = s.life <= 0;
    if (pd < (s.kind === 'boulder' ? 1.2 : .9)) { hurt(s.kind === 'laser' ? 3 : 4, s.x, s.z); done = true; }
    if (solidAt(Math.floor(s.x), Math.floor(s.y), Math.floor(s.z))) { done = true; if (s.kind === 'boulder') { SFX.boom(); const bx = Math.floor(s.x), by = Math.floor(s.y) + 1, bz = Math.floor(s.z); if (!get(bx, by, bz)) setBlock(bx, by, bz, B.COBBLE); } }
    if (done) { burst(s.x, s.y, s.z, s.kind === 'boulder' ? 0x8a8a90 : s.kind === 'laser' ? 0xff3060 : 0xffa030, 12, 4); scene.remove(s.m); G.shots.splice(G.shots.indexOf(s), 1); }
  }
}

/* ================================================================
   Cutscenes between levels: sailing, the rocket launch, flying in space
   ================================================================ */
const cine = { on: false, t: 0, kind: '', next: 0, scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(55, 1, .1, 800) };
let cineSea = null, cineBoat = null;
function playCine(kind, next) {
  G.mode = 'cine'; cine.on = true; cine.t = 0; cine.kind = kind; cine.next = next; cine.dur = kind === 'launch' ? 6.5 : 4;
  const S = cine.scene; S.clear();
  S.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.2)); const dl = new THREE.DirectionalLight(0xffffff, .8); dl.position.set(-1, 2, 1); S.add(dl);
  const space = kind === 'fly';
  const tier = kind === 'launch' ? 10 : next;
  cineBoat = boatModel(tier); S.add(cineBoat.g);
  if (!space) {
    S.background = new THREE.Color(0x8fd0ff); S.fog = new THREE.Fog(0xbfe4ff, 60, 260);
    const geo = new THREE.PlaneGeometry(400, 400, 60, 60).rotateX(-Math.PI / 2); cineSea = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x2f7fd0, flatShading: true })); S.add(cineSea);
    const R = rng(next); for (let i = 0; i < 6; i++) { const isl = new THREE.Group(); const r = 3 + R() * 5; box(r * 2, 2, r * 2, lam(0x5fae3e), 0, .5, 0, isl); box(r * 2 + 1, 1, r * 2 + 1, lam(0xe8d8a0), 0, -.2, 0, isl); isl.position.set(-60 + R() * 200, 0, -80 + R() * 40); S.add(isl); }
    S.add(clouds.clone());
  } else { S.background = new THREE.Color(0x05060f); S.fog = null; S.add(stars.clone()); const pl = earthBall.clone(); pl.material = pl.material.clone(); pl.material.color.setHex([0xffffff, 0xd0d0d8, 0xff8a5a, 0xc0c0c0, 0x9a6aff, 0xbfe8ff, 0xf0d890, 0xd890ff, 0xffb040, 0x9fffd0, 0xff6a8a][Math.max(0, next - 10)] || 0xffffff); pl.position.set(60, -10, -160); pl.scale.setScalar(1.2); S.add(pl); cineSea = null; }
  if (kind === 'launch') { const earth = earthBall.clone(); earth.position.set(0, -220, -40); earth.scale.setScalar(5); earth.visible = false; S.add(earth); cine.earth = earth; cine.stars = stars.clone(); cine.stars.visible = false; S.add(cine.stars); }
  const titles = { sail: ['Sailing to Level ' + next, LV[next].name], launch: ['BLAST OFF!', 'The Rocket Boat with Wings flies to OUTER SPACE!'], fly: ['Flying to Level ' + next, LV[next].name] };
  $('cineText').innerHTML = titles[kind][0] + '<small>' + titles[kind][1] + '</small>'; $('cineText').classList.remove('hide'); $('skip').classList.remove('hide');
  showScreen(null); $('hud').classList.add('hide'); $('touch').classList.add('hide');
  if (kind === 'launch') SFX.launch(); else SFX.splash();
}
function updateCine(dt) {
  cine.t += dt; const t = cine.t, S = cine.scene, cam = cine.cam, g = cineBoat.g;
  if (cineSea) { const p = cineSea.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * .12 + t * 1.6) * .35 + Math.cos(z * .15 + t * 1.3) * .35); } p.needsUpdate = true; cineSea.geometry.computeVertexNormals(); }
  for (const f of cineBoat.flames) { f.visible = true; f.scale.set(1, .7 + Math.random() * .7, 1); }
  if (cine.kind === 'sail') { g.position.set(-20 + t * 9, Math.sin(t * 2) * .2, 0); g.rotation.set(Math.sin(t * 1.7) * .05, 0, Math.sin(t * 2.2) * .05); cam.position.set(g.position.x - 6 + Math.sin(t * .4) * 3, 4, 10); cam.lookAt(g.position.x + 2, 0, 0); }
  else if (cine.kind === 'fly') { g.position.set(t * 14 - 20, Math.sin(t * 1.5) * .6, 0); g.rotation.set(Math.sin(t) * .15, 0, .05); cam.position.set(g.position.x - 9, 3, 9); cam.lookAt(g.position.x + 3, 0, 0); }
  else if (cine.kind === 'launch') {
    const up = Math.max(0, t - 1.6), alt = up * up * 6;
    g.position.set(Math.min(t, 1.6) * 6, alt, 0); g.rotation.set(0, 0, Math.min(1.2, up * .8));
    const k = clamp(alt / 140, 0, 1); S.background = new THREE.Color(0x8fd0ff).lerp(new THREE.Color(0x05060f), k); if (cineSea) cineSea.visible = alt < 120; cine.earth.visible = cine.stars.visible = k > .6;
    cam.position.set(g.position.x - 10, g.position.y + 2 - Math.min(6, up * 2), 12); cam.lookAt(g.position.x, g.position.y + 1, 0);
  }
  if (t > cine.dur) endCine();
}
function endCine() {
  if (!cine.on) return; cine.on = false; $('cineText').classList.add('hide'); $('skip').classList.add('hide');
  startLevel(cine.next); showCard(cine.next);
}
function showCard(L) {
  G.mode = 'card';
  $('cardLevel').textContent = 'LEVEL ' + L + ' OF 20 · ' + (LV[L].world === 'space' ? 'OUTER SPACE' : 'EARTH');
  $('cardHead').textContent = L === 1 ? 'YOUR BOAT' : 'BOAT UPGRADE!';
  $('cardBoat').textContent = BOATS[L - 1][0];
  $('cardWas').textContent = L === 1 ? 'It\'s a boat for noobs. Find boat parts to upgrade it!' : 'Was: ' + BOATS[L - 2][0] + ' · ' + BOATS[L - 1][1];
  const spd = Math.round((3.6 + L * .45) / (3.6 + 20 * .45) * 100), cool = Math.round(L / 20 * 100);
  $('cardStats').innerHTML = '<div class="stat"><span>Speed</span><span class="bar"><i style="width:' + spd + '%"></i></span></div><div class="stat"><span>Awesome</span><span class="bar"><i style="width:' + cool + '%"></i></span></div>';
  const c = LV[L]; $('cardGoal').innerHTML = '<b>' + c.name + '</b><br>' + (c.boss ? 'Defeat the boss!' : 'Find ' + c.spots.length + ' glowing boat parts.') + '<br><span style="color:var(--mute)">' + c.tip + '</span>';
  showScreen('card');
}

/* ================================================================
   HUD
   ================================================================ */
function updateHearts() { let s = ''; for (let i = 0; i < 10; i++) { const v = player.hp - i * 2; s += v >= 2 ? '❤️' : v === 1 ? '💔' : '🖤'; } $('hearts').textContent = s; }
let toastTimer = null;
function toast(a, b) { const el = $('toast'); el.innerHTML = a + (b ? '<small>' + b + '</small>' : ''); el.style.opacity = 1; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.style.opacity = 0, 2200); }
function refreshHotbar() {
  const list = hotList(); if (G.sel >= list.length) G.sel = Math.max(0, list.length - 1);
  const hb = $('hotbar'); hb.innerHTML = '';
  list.forEach((id, i) => { const d = document.createElement('div'); d.className = 'slot' + (i === G.sel ? ' sel' : ''); d.innerHTML = '<img alt="" src="' + blockIcon(id) + '"><b>' + G.inv.get(id) + '</b>'; d.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); G.sel = i; refreshHotbar(); }; hb.appendChild(d); });
  if (!list.length) hb.innerHTML = '<div style="padding:10px;font-weight:900;font-size:13px">Mine blocks to fill your hotbar</div>';
}
function updateHud() {
  const left = partObjs.filter(p => !p.got);
  if (G.cfg.boss) { $('parts').textContent = G.boss && !G.boss.dead ? 'BOSS' : 'BOAT!'; }
  else $('parts').textContent = G.partsGot + '/' + partObjs.length;
  // arrow to the nearest part (or back to the boat when it is time to go)
  let tx = null, tz = null, label = '';
  if (levelDone()) { tx = boat.x; tz = boat.z; label = 'boat'; }
  else if (left.length) { let best = null, bd = 1e9; for (const p of left) { const d = Math.hypot(p.s.x + .5 - player.x, p.s.z + .5 - player.z); if (d < bd) { bd = d; best = p; } } tx = best.s.x + .5; tz = best.s.z + .5; label = Math.round(bd) + 'm' + (best.s.y + .5 < player.y - 2 ? ' ↓' : best.s.y > player.y + 3 ? ' ↑' : ''); }
  else if (G.boss && !G.boss.dead) { tx = G.boss.x; tz = G.boss.z; label = Math.round(Math.hypot(tx - player.x, tz - player.z)) + 'm'; }
  if (tx != null) { const a = Math.atan2(-(tx - player.x), -(tz - player.z)) - player.yaw; $('arrow').style.transform = 'rotate(' + (-a) + 'rad)'; $('dist').textContent = label; }
  $('bBoat').classList.toggle('hide', !(nearBoat() || player.riding));
  if (touch) { $('bMine').style.display = $('bBuild').style.display = player.riding ? 'none' : ''; }
  $('cross').style.display = player.riding ? 'none' : '';
  $('bBoat').textContent = player.riding ? (levelDone() ? 'GO!' : 'GET OFF') : 'BOAT';
  $('damage').style.opacity = G.hurtFlash > 0 ? G.hurtFlash * 1.6 : 0;
}
function confetti() { const cols = ['#ffd34d', '#8fe36a', '#6ec6ff', '#ff7a8a', '#c49bff']; for (let i = 0; i < 70; i++) { const d = document.createElement('div'); d.className = 'confetti'; d.style.left = Math.random() * 100 + 'vw'; d.style.background = cols[i % 5]; d.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'; document.body.appendChild(d); setTimeout(() => d.remove(), 4000); } }

/* ================================================================
   Input
   ================================================================ */
const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
let joyId = null, jx0 = 0, jy0 = 0, lookId = null, lx0 = 0, ly0 = 0;
$('joyZone').addEventListener('pointerdown', e => { e.preventDefault(); audio(); joyId = e.pointerId; jx0 = e.clientX; jy0 = e.clientY; try { $('joyZone').setPointerCapture(e.pointerId); } catch (x) {} const b = $('joyBase'), k = $('joyKnob'); b.style.display = k.style.display = 'block'; b.style.left = k.style.left = jx0 + 'px'; b.style.top = k.style.top = jy0 + 'px'; $('joyHint').style.display = 'none'; });
$('joyZone').addEventListener('pointermove', e => { if (e.pointerId !== joyId) return; let dx = (e.clientX - jx0) / 55, dy = (e.clientY - jy0) / 55; const L = Math.hypot(dx, dy); if (L > 1) { dx /= L; dy /= L; } input.mx = dx; input.my = dy; $('joyKnob').style.left = jx0 + dx * 55 + 'px'; $('joyKnob').style.top = jy0 + dy * 55 + 'px'; });
const joyOff = e => { if (e.pointerId !== joyId) return; joyId = null; input.mx = input.my = 0; $('joyBase').style.display = $('joyKnob').style.display = 'none'; };
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => $('joyZone').addEventListener(ev, joyOff));
$('look').addEventListener('pointerdown', e => { e.preventDefault(); audio(); if (e.pointerType === 'mouse') { canvas.requestPointerLock && canvas.requestPointerLock(); return; } lookId = e.pointerId; lx0 = e.clientX; ly0 = e.clientY; try { $('look').setPointerCapture(e.pointerId); } catch (x) {} });
$('look').addEventListener('pointermove', e => { if (e.pointerId !== lookId) return; const dx = e.clientX - lx0, dy = e.clientY - ly0; lx0 = e.clientX; ly0 = e.clientY; player.yaw -= dx * .0065; player.pitch = clamp(player.pitch - dy * .0065, -1.5, 1.5); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => $('look').addEventListener(ev, e => { if (e.pointerId === lookId) lookId = null; }));
document.addEventListener('mousemove', e => { if (document.pointerLockElement === canvas && G.mode === 'play') { player.yaw -= e.movementX * .0028; player.pitch = clamp(player.pitch - e.movementY * .0028, -1.5, 1.5); } });
document.addEventListener('mousedown', e => { if (document.pointerLockElement !== canvas || G.mode !== 'play') return; if (e.button === 0) input.mine = true; if (e.button === 2) actBuild(); });
document.addEventListener('mouseup', e => { if (e.button === 0) input.mine = false; });
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('wheel', e => { if (G.mode !== 'play') return; const n = hotList().length; if (!n) return; G.sel = (G.sel + (e.deltaY > 0 ? 1 : n - 1)) % n; refreshHotbar(); });
const holdBtn = (id, down, up) => { const el = $(id); el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio(); el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (x) {} down(); }); const off = () => { if (!el.classList.contains('on')) return; el.classList.remove('on'); if (up) up(); }; ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => el.addEventListener(ev, off)); };
holdBtn('bJump', () => input.jump = true, () => input.jump = false);
holdBtn('bMine', () => input.mine = true, () => input.mine = false);
holdBtn('bBuild', () => actBuild());
holdBtn('bBoat', () => boardOrLeave());
$('bCam').onclick = () => { G.cam3 = !G.cam3; };
$('bPause').onclick = () => pause(true);
addEventListener('keydown', e => {
  audio(); input.keys[e.code] = true;
  if (G.mode === 'cine' && (e.code === 'Space' || e.code === 'Enter')) { endCine(); return; }
  if (G.mode !== 'play') return;
  if (e.code === 'Escape' || e.code === 'KeyP') pause(true);
  if (e.code === 'KeyE' || e.code === 'KeyB') boardOrLeave();
  if (e.code === 'KeyV' || e.code === 'F5') { G.cam3 = !G.cam3; e.preventDefault(); }
  if (e.code === 'KeyF') actBuild();
  if (/^Digit[1-8]$/.test(e.code)) { const i = +e.code.slice(5) - 1; if (i < hotList().length) { G.sel = i; refreshHotbar(); } }
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', e => { input.keys[e.code] = false; });

/* ================================================================
   Screens
   ================================================================ */
const SCREENS = ['title', 'help', 'map', 'card', 'pause', 'ending'];
function showScreen(id) { for (const s of SCREENS) $(s).classList.toggle('hide', s !== id); }
function enterPlay() { G.mode = 'play'; showScreen(null); $('hud').classList.remove('hide'); $('touch').classList.toggle('hide', false); for (const id of ['joyZone', 'bJump', 'bMine', 'bBuild']) $(id).style.display = touch ? '' : 'none'; $('joyHint').style.display = touch ? '' : 'none'; if (!touch) toast('Click to look around', 'WASD to move · left click mine · right click build'); }
function pause(on) { if (on) { G.mode = 'pause'; showScreen('pause'); document.exitPointerLock && document.exitPointerLock(); } else enterPlay(); }
function buildMap() {
  const box2 = $('levels'); box2.innerHTML = '';
  for (let L = 1; L <= 20; L++) { const c = LV[L], b = document.createElement('button'); b.className = 'lv ' + (c.boss ? 'boss' : c.world) + (G.done[L] ? ' done' : '');
    b.innerHTML = '<span class="n">' + L + '</span><span class="ic">' + (c.boss ? '💀' : c.world === 'space' ? '🪐' : '🌍') + (G.done[L] ? '⭐' : '') + '</span><span>' + c.name.replace('BOSS: ', '') + '</span>';
    b.onclick = () => { audio(); playCine(L === 11 ? 'launch' : L > 11 ? 'fly' : 'sail', L); }; box2.appendChild(b); }
}
function showEnding() { G.mode = 'ending'; $('hud').classList.add('hide'); $('touch').classList.add('hide'); $('endTitle').textContent = G.name + ' SAVED THE GALAXY!'; $('endText').textContent = 'You beat the Stone Golem King, the Space Dragon and the Alien Overlord, and built the Ultimate Star Rocket. Every level is still open on the map. Play any of them again!'; confetti(); showScreen('ending'); document.exitPointerLock && document.exitPointerLock(); }
$('goMap').onclick = () => { audio(); G.name = ($('pname').value.trim().toUpperCase() || 'CHANCE').slice(0, 12); saveGame(); buildMap(); showScreen('map'); };
$('goHelp').onclick = () => showScreen('help'); $('helpBack').onclick = () => showScreen('title'); $('mapBack').onclick = () => showScreen('title');
$('cardGo').onclick = () => { audio(); enterPlay(); toast(LV[G.level].name, LV[G.level].tip); };
$('resume').onclick = () => pause(false);
$('toMap').onclick = () => { buildMap(); G.mode = 'map'; $('hud').classList.add('hide'); $('touch').classList.add('hide'); showScreen('map'); };
$('restartLvl').onclick = () => { startLevel(G.level); showCard(G.level); };
$('endMap').onclick = () => { buildMap(); showScreen('map'); };
$('skip').onclick = () => endCine();
$('pname').value = G.name;
{ const sh = $('shirts'); ['#2f9fd8', '#e8323c', '#3daa4a', '#ffb000', '#9a5ae0', '#ff7ab8'].forEach(c => { const b = document.createElement('button'); b.className = 'shirt'; b.style.background = c; b.setAttribute('aria-pressed', c === G.shirt); b.onclick = () => { G.shirt = c; sh.querySelectorAll('.shirt').forEach(x => x.setAttribute('aria-pressed', x === b)); saveGame(); }; sh.appendChild(b); }); }

/* ================================================================
   Main loop
   ================================================================ */
let last = performance.now(), slowT = 0, quality = 2, titleT = 0;
function resize() { const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); cine.cam.aspect = W / H; cine.cam.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now; G.t += dt;
  if (quality > 0) { slowT = dt > .045 ? slowT + dt : Math.max(0, slowT - dt * .5); if (slowT > 3) { quality--; slowT = 0; renderer.setPixelRatio(quality === 1 ? Math.min(1.25, devicePixelRatio || 1) : .85); resize(); } }
  if (G.mode === 'cine') { updateCine(dt); renderer.render(cine.scene, cine.cam); return; }
  if (!lvl) {   // title: a gentle fly-over of level 1
    titleT += dt; if (!CC.titleWorld) { CC.titleWorld = true; startLevel(1); G.mode = 'title'; }
    camera.position.set(SX / 2 + Math.cos(titleT * .1) * 42, 30, SZ / 2 + Math.sin(titleT * .1) * 42); camera.lookAt(SX / 2, SEA, SZ / 2); me.g.visible = false; hand.visible = false; highlight.visible = false;
    renderer.render(scene, camera); return;
  }
  if (G.mode === 'title' || G.mode === 'map') { titleT += dt; camera.position.set(SX / 2 + Math.cos(titleT * .1) * 42, 30, SZ / 2 + Math.sin(titleT * .1) * 42); camera.lookAt(SX / 2, SEA, SZ / 2); me.g.visible = hand.visible = highlight.visible = false; placeBoat(G.t); renderer.render(scene, camera); return; }
  if (G.mode === 'play') {
    updatePlayer(dt); if (!player.riding) actMine(dt); else { crack.material.opacity = 0; target = null; }
    updateMobs(dt); updateBoss(dt); updateShots(dt);
    G.hurtFlash = Math.max(0, G.hurtFlash - dt);
    updateHud();
  }
  rebuildDirty(4); updateParticles(dt);
  if (boat) placeBoat(G.t);
  for (const p of partObjs) if (!p.got) { p.m.cube.rotation.y += dt * 1.8; p.m.cube.position.y = Math.sin(G.t * 2.5 + p.s.x) * .12; }
  // camera
  const e = eye(); shake = Math.max(0, shake - dt);
  const sh = shake > 0 ? (Math.random() - .5) * shake * .6 : 0;
  if (player.riding) {
    const d = 7.5, cx = boat.x + Math.sin(player.yaw) * d, cz = boat.z + Math.cos(player.yaw) * d;
    camera.position.set(cx, boat.y + 3.4 + sh, cz); camera.lookAt(boat.x, boat.y + .8, boat.z); me.g.visible = true; hand.visible = false;
    me.g.position.set(boat.x, boat.y + .35, boat.z); me.g.rotation.y = -boat.yaw - Math.PI / 2; me.legL.rotation.x = me.legR.rotation.x = -1.3; me.armL.rotation.x = me.armR.rotation.x = -.6;
  } else if (G.cam3) {
    const d = lookDir(), back = raycast(e, d.clone().negate(), 4.2, id => D[id].opaque), dist = back ? Math.max(.6, back.t - .3) : 4;
    camera.position.copy(e).addScaledVector(d, -dist); camera.position.y += sh; camera.rotation.set(player.pitch, player.yaw, 0); me.g.visible = true; hand.visible = false;
  } else { camera.position.set(e.x, e.y + sh, e.z); camera.rotation.set(player.pitch, player.yaw, 0); me.g.visible = false; hand.visible = true; }
  if (!player.riding) {
    me.g.position.set(player.x, player.y, player.z); me.g.rotation.y = player.yaw; const s = Math.sin(player.walk * 3) * Math.min(1, Math.hypot(player.vx, player.vz) / 3);
    me.legL.rotation.x = s * .7; me.legR.rotation.x = -s * .7; me.armL.rotation.x = -s * .6; me.armR.rotation.x = input.mine ? -1.2 + Math.sin(player.swing) * .6 : s * .6;
  }
  hand.rotation.x = input.mine || player.swing > 0 ? Math.sin(player.swing) * .5 - .2 : Math.sin(player.walk * 3) * .03; if (!input.mine) player.swing = Math.max(0, player.swing - dt * 4);
  highlight.visible = !!target && !player.riding && G.mode === 'play'; if (target) highlight.position.set(target.x + .5, target.y + .5, target.z + .5);
  skyGroup.position.set(camera.position.x, 0, camera.position.z); clouds.position.x = (G.t * .8) % 80 - 40;
  ocean.position.x = camera.position.x; ocean.position.z = camera.position.z;
  renderer.render(scene, camera);
}
CC.ok = true;
CC.debug = { G, player, startLevel, get boat() { return boat; }, get lvl() { return lvl; }, partObjs: () => partObjs, setBlock, get, B, finishLevel, boardOrLeave, input, playCine, endCine, enterPlay, hitBoss, showCard };
requestAnimationFrame(frame);
}
