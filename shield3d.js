/* Sky Shield: defend six cities from falling missiles, in the style of the arcade classic.
   Tap the sky to launch a counter-missile from the nearest base; its fireball destroys anything
   that flies into it. 12 waves bring split missiles, bombers, satellites and smart bombs. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const SS = { ok: false }; window.SS = SS;
const $ = id => document.getElementById(id);
const canvas = $('c');
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, .1, 800);
scene.add(new THREE.HemisphereLight(0x9fb0ff, 0x302018, 1.1));
const moonLight = new THREE.DirectionalLight(0xdfe8ff, 1.2); moonLight.position.set(-30, 60, 40); scene.add(moonLight);
const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7 }, o || {}));
const canvasTex = (w, h, fn, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };

/* ================================================================
   Settings and saved progress
   ================================================================ */
const DIFF = {
  easy:   { spd: .62, count: .7,  ammo: 15, blast: 6.6, intSpd: 75, bonusCity: 5000 },
  medium: { spd: .9,  count: 1,   ammo: 10, blast: 5.4, intSpd: 62, bonusCity: 10000 },
  hard:   { spd: 1.12, count: 1.25, ammo: 10, blast: 4.6, intSpd: 56, bonusCity: 15000 },
};
const WAVES = ['First Alert', 'Night Raid', 'Split Shots', 'Bomber Run', 'Star Wars', 'Rain of Fire', 'Smart Bombs', 'Double Trouble', 'Satellite Storm', 'Fire Sky', 'Last Stand', 'Armageddon'];
const TRAIL = [0xff4a4a, 0xff8a2a, 0xffe83a, 0x3aff8a, 0x3ad8ff, 0xff3ad8, 0xff4a4a, 0xffe83a, 0x9a6aff, 0xff8a2a, 0x3aff8a, 0xffffff];
const SAVE_KEY = 'skyshield';
const save = (() => { const d = { hi: 0, diff: 'easy', cleared: { easy: [], medium: [], hard: [] } }; try { return Object.assign(d, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { return d; } })();
const store = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* private mode */ } };
const G = { mode: 'title', diff: save.diff, wave: 0, score: 0, t: 0, paused: false, msgT: 0, nextBonus: 0, spareCities: 0 };
let D = DIFF[G.diff];
const mult = () => Math.min(6, 1 + Math.floor(G.wave / 2));

/* ================================================================
   The world: night sky, hills, six cities and three missile bases
   ================================================================ */
const WX = 52, SKY = 64;
const BASES_X = [-46, 0, 46], CITIES_X = [-35, -25, -15, 15, 25, 35];
const gy = x => 1.2 + BASES_X.reduce((h, b) => h + 3.2 * Math.exp(-(((x - b) / 5.5) ** 2)), 0);
scene.background = canvasTex(4, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#02031a'); g.addColorStop(.7, '#141a4a'); g.addColorStop(1, '#3a2a5a'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
{
  const p = []; for (let i = 0; i < 700; i++) p.push((Math.random() - .5) * 260, 10 + Math.random() * 120, -60 - Math.random() * 40);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: .6 })));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); moon.position.set(-40, 62, -70); scene.add(moon);
  const sh = new THREE.Shape(); sh.moveTo(-90, -6); for (let x = -90; x <= 90; x += 1) sh.lineTo(x, Math.abs(x) > WX + 4 ? gy(x) + 2 : gy(x)); sh.lineTo(90, -6); sh.closePath();
  const ground = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 12, bevelEnabled: false }), std(0xd8a83a, { roughness: .9 })); ground.position.z = -8; scene.add(ground);
  const far = new THREE.Shape(); far.moveTo(-160, -6); for (let x = -160; x <= 160; x += 8) far.lineTo(x, 6 + Math.sin(x * .07) * 4 + Math.sin(x * .19) * 2); far.lineTo(160, -6); far.closePath();
  const hills = new THREE.Mesh(new THREE.ShapeGeometry(far), new THREE.MeshBasicMaterial({ color: 0x2a1f4a })); hills.position.z = -40; scene.add(hills);
}
const winTex = canvasTex(32, 64, (c, w, h) => { c.fillStyle = '#1a2038'; c.fillRect(0, 0, w, h); for (let y = 3; y < h; y += 7) for (let x = 3; x < w; x += 7) { c.fillStyle = Math.random() < .6 ? ['#ffe08a', '#fff2c8', '#9fd8ff'][Math.floor(Math.random() * 3)] : '#262c48'; c.fillRect(x, y, 3, 4); } }, true);
const CITY_COLS = [0x5a7ad8, 0x8a5ad8, 0x3aa8a8, 0xd85a8a, 0x5ab85a, 0xd8a03a];
const cities = CITIES_X.map((x, i) => {
  const g = new THREE.Group(); g.position.set(x, gy(x) - .2, 0); scene.add(g);
  const alive = new THREE.Group(); g.add(alive);
  for (let k = 0; k < 6; k++) { const w = 1.2 + Math.random() * 1.2, h = 2 + Math.random() * 4.5, t = winTex.clone(); t.needsUpdate = true; t.repeat.set(w / 2, h / 3);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), std(CITY_COLS[(i + k) % 6], { emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .7, map: t })); m.position.set(-3.4 + k * 1.35, h / 2, (k % 2) * .6 - .3); alive.add(m); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.7, 12, 8, 0, TAU, 0, Math.PI / 2), std(0xffd34d, { emissive: 0x5a3a00 })); dome.position.set(0, 6.6, 0); alive.add(dome);
  const rubble = new THREE.Group(); g.add(rubble); rubble.visible = false;
  for (let k = 0; k < 9; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.6 + Math.random() * 1.2, .3 + Math.random() * .8, 1 + Math.random()), std(0x3a3030)); r.position.set(-3.6 + Math.random() * 7.2, .3, Math.random() - .5); r.rotation.set(Math.random(), Math.random(), Math.random()); rubble.add(r); }
  return { x, y: gy(x), g, alive, rubble, up: true };
});
const bases = BASES_X.map(x => {
  const g = new THREE.Group(); g.position.set(x, gy(x) - .3, 0); scene.add(g);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 18, 10, 0, TAU, 0, Math.PI / 2), std(0x8a909c, { metalness: .5, roughness: .4 })); g.add(dome);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.35, .45, 2.2, 10), std(0x5a6070, { metalness: .6 })); tube.position.y = 2.8; g.add(tube);
  const ammo = []; const coneGeo = new THREE.ConeGeometry(.28, .9, 8), am = std(0x5ad8ff, { emissive: 0x1a4a6a });
  for (let k = 0; k < 15; k++) { const row = k < 5 ? 0 : k < 9 ? 1 : k < 12 ? 2 : k < 14 ? 3 : 4, idx = [0, 5, 9, 12, 14][row], n = [5, 4, 3, 2, 1][row]; const m = new THREE.Mesh(coneGeo, am); m.position.set((k - idx - (n - 1) / 2) * .7, .45 + row * .75, 3); g.add(m); ammo.push(m); }
  const wreck = new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 6, 0, TAU, 0, Math.PI / 2), std(0x2a2424)); wreck.scale.y = .4; wreck.visible = false; g.add(wreck);
  return { x, y: gy(x) + 3.9, g, dome, tube, ammo, wreck, n: 0, up: true };
});

/* ================================================================
   Missiles, fliers, explosions
   ================================================================ */
const glowTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const glow = (color, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.set(size, size, 1); return s; };
const xTex = canvasTex(64, 64, (c) => { c.strokeStyle = '#fff'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(12, 12); c.lineTo(52, 52); c.moveTo(52, 12); c.lineTo(12, 52); c.stroke(); });
let world = new THREE.Group(); scene.add(world);
const M = [], X = [], F = [], FX = [];      // missiles (enemy and ours), explosions, fliers, effects
function trail(x, y, color) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([x, y, .5, x, y, .5], 3));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .9 })); world.add(l); return l;
}
function launchEnemy(x0, y0, target, kind) {
  const color = TRAIL[G.wave % TRAIL.length], tx = target.x + (Math.random() - .5) * 2, ty = target.y - 1.5;
  const d = Math.hypot(tx - x0, ty - y0), sp = (3.6 + G.wave * .5) * D.spd * (kind === 'smart' ? .8 : 1);
  const m = { enemy: true, kind: kind || 'missile', x0, y0, x: x0, y: y0, tx, ty, vx: (tx - x0) / d * sp, vy: (ty - y0) / d * sp, line: trail(x0, y0, color), head: glow(kind === 'smart' ? 0xffffff : color, kind === 'smart' ? 3 : 1.8), target };
  if (m.kind === 'mirv') m.splitY = 28 + Math.random() * 12;
  if (m.kind === 'smart') { const s = new THREE.Mesh(new THREE.OctahedronGeometry(.9, 0), std(0xffffff, { emissive: 0xff3ad8, emissiveIntensity: .8 })); m.head.add(s); s.scale.setScalar(1 / 3); m.body = s; }
  m.head.position.set(x0, y0, .6); world.add(m.head); M.push(m); return m;
}
function launchOurs(base, tx, ty) {
  const d = Math.hypot(tx - base.x, ty - base.y), sp = D.intSpd * (base.x === 0 ? 1.15 : 1);
  const mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: xTex, color: 0x9fe8ff, transparent: true, depthTest: false })); mark.scale.set(1.6, 1.6, 1); mark.position.set(tx, ty, 1); world.add(mark);
  const m = { enemy: false, x0: base.x, y0: base.y, x: base.x, y: base.y, tx, ty, vx: (tx - base.x) / d * sp, vy: (ty - base.y) / d * sp, line: trail(base.x, base.y, 0x7ac8ff), head: glow(0xffffff, 1.6), mark };
  m.head.position.set(base.x, base.y, .6); world.add(m.head); M.push(m); SFX.launch();
}
function explode(x, y, big, enemyMade) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
  mesh.position.set(x, y, .5); mesh.scale.setScalar(.1); world.add(mesh);
  const halo = glow(0xffc070, 1); halo.position.set(x, y, .4); world.add(halo);
  X.push({ x, y, r: 0, max: (big || 1) * D.blast * (enemyMade ? .75 : 1), t: 0, mesh, halo }); SFX.boom(enemyMade ? .6 : 1);
}
function removeMissile(m) { const i = M.indexOf(m); if (i >= 0) M.splice(i, 1); world.remove(m.line); world.remove(m.head); if (m.mark) world.remove(m.mark); m.line.geometry.dispose(); }
function spawnFlier() {
  const left = Math.random() < .5, sat = Math.random() < .5, y = 36 + Math.random() * 12, g = new THREE.Group();
  if (sat) { g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), std(0xd8d8e8, { metalness: .7, roughness: .3 }))); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.8, .9, .08), std(0x2a5ad8, { emissive: 0x0a2a6a })); p.position.x = s * 2; g.add(p); } g.add(glow(0x9fd8ff, 4)); }
  else { const body = new THREE.Mesh(new THREE.CapsuleGeometry(.5, 3, 4, 8), std(0x6a7a6a)); body.rotation.z = Math.PI / 2; g.add(body); const wing = new THREE.Mesh(new THREE.BoxGeometry(1.4, .12, 5), std(0x5a6a5a)); g.add(wing); const tail = new THREE.Mesh(new THREE.BoxGeometry(.8, 1.2, .1), std(0x5a6a5a)); tail.position.set(-1.8, .6, 0); g.add(tail); g.rotation.y = left ? 0 : Math.PI; g.add(glow(0xff6a4a, 2.5)); }
  g.position.set(left ? -WX - 6 : WX + 6, y, .5); world.add(g);
  F.push({ g, x: g.position.x, y, vx: (left ? 1 : -1) * (5 + G.wave * .3) * D.spd, drops: 2 + Math.floor(G.wave / 4), dropT: 1.5 + Math.random() * 2, sat });
}
function boomFX(x, y, color, n) { for (let i = 0; i < n; i++) { const s = glow(color, .8 + Math.random()); s.position.set(x, y, .7); world.add(s); const a = Math.random() * TAU, v = 4 + Math.random() * 10; FX.push({ o: s, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 4, life: .7 + Math.random() * .5, t: 0 }); } }
function popup(text, x, y, color) {
  const tex = canvasTex(256, 64, (c) => { c.font = '900 40px "Trebuchet MS", sans-serif'; c.textAlign = 'center'; c.lineWidth = 6; c.strokeStyle = '#000'; c.strokeText(text, 128, 46); c.fillStyle = color || '#ffd34d'; c.fillText(text, 128, 46); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); s.scale.set(7, 1.75, 1); s.position.set(x, y + 2, 2); s.renderOrder = 9; world.add(s); FX.push({ o: s, vx: 0, vy: 3, life: 1, t: 0, text: true });
}

/* ================================================================
   Sound
   ================================================================ */
let AC = null, muted = false;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f0, f1, d, type, vol, delay) { if (muted || !AC) return; const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d); g.gain.setValueAtTime(vol || .06, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02); }
function noise(d, vol) { if (muted || !AC) return; const n = AC.sampleRate * d, buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2; const s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; s.buffer = buf; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(); }
const SFX = {
  launch: () => tone(900, 300, .25, 'sawtooth', .035), boom: v => noise(.6, .25 * (v || 1)), empty: () => tone(160, 120, .12, 'square', .05),
  alarm: () => { for (let i = 0; i < 4; i++) { tone(600, 900, .2, 'square', .04, i * .45); tone(900, 600, .2, 'square', .04, i * .45 + .22); } },
  city: () => { noise(1.2, .4); tone(200, 40, 1, 'sawtooth', .08); }, tick: () => tone(1200, 1200, .03, 'square', .03), bonus: () => [523, 784, 1046].forEach((f, i) => tone(f, f, .15, 'square', .05, i * .1)),
};

/* ================================================================
   Waves
   ================================================================ */
function clearActors() { for (const m of M.slice()) removeMissile(m); for (const x of X) { world.remove(x.mesh); world.remove(x.halo); } for (const f of F) world.remove(f.g); for (const f of FX) world.remove(f.o); X.length = F.length = FX.length = 0; }
function setCity(c, up) { c.up = up; c.alive.visible = up; c.rubble.visible = !up; }
function setBase(b, up, n) { b.up = up; b.n = up ? n : 0; b.dome.visible = b.tube.visible = up; b.wreck.visible = !up; b.ammo.forEach((m, i) => { m.visible = i < b.n; }); }
function startGame(wave) { G.wave = wave; G.score = 0; D = DIFF[G.diff]; G.nextBonus = D.bonusCity; G.spareCities = 0; cities.forEach(c => setCity(c, true)); startWave(); }
function startWave() {
  clearActors(); bases.forEach(b => setBase(b, true, D.ammo));
  // a spare city rebuilds a destroyed one
  for (const c of cities) if (!c.up && G.spareCities > 0) { setCity(c, true); G.spareCities--; popup('CITY REBUILT!', c.x, c.y + 8, '#3aff8a'); }
  G.toSpawn = Math.round((10 + G.wave * 2) * D.count); G.fliersLeft = G.wave >= 1 ? Math.round((1 + Math.floor(G.wave / 3)) * D.count) : 0;
  G.volleyT = 1.5; G.flierT = 6 + Math.random() * 4; G.mode = 'play'; G.paused = false; G.endT = 0; G.smartLeft = G.wave >= 6 ? 1 + Math.floor((G.wave - 6) / 2) : 0;
  showScreen(null); hud(); SFX.alarm();
  flash('WAVE ' + (G.wave + 1), WAVES[G.wave] + ' · points ×' + mult() + ' · DEFEND CITIES', 2.6);
}
function targets() { const all = [...cities.map(c => ({ x: c.x, y: c.y, c })), ...bases.map(b => ({ x: b.x, y: b.y - 2.5, b }))]; const up = all.filter(t => (t.c && t.c.up) || (t.b && t.b.up)); return Math.random() < .85 && up.length ? up : all; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function volley() {
  const n = Math.min(G.toSpawn, 2 + Math.floor(Math.random() * (2 + G.wave / 4)));
  for (let i = 0; i < n; i++) { const kind = G.wave >= 2 && Math.random() < .15 + G.wave * .02 ? 'mirv' : G.smartLeft > 0 && Math.random() < .25 ? (G.smartLeft--, 'smart') : 'missile'; launchEnemy((Math.random() - .5) * WX * 1.9, SKY, pick(targets()), kind); }
  G.toSpawn -= n;
}
function addScore(n, x, y) {
  const pts = n * mult(); G.score += pts; if (x != null) popup(String(pts), x, y);
  while (G.score >= G.nextBonus) { G.nextBonus += D.bonusCity; G.spareCities++; flash('BONUS CITY!', 'It rebuilds a lost city next wave', 1.6); SFX.bonus(); }
  hud();
}
function fireAt(x, y) {
  if (G.mode !== 'play' || G.paused) return;
  y = clamp(y, 8, SKY - 2); x = clamp(x, -WX, WX);
  let best = null; for (const b of bases) if (b.up && b.n > 0 && (!best || Math.abs(b.x - x) < Math.abs(best.x - x))) best = b;
  if (!best) { SFX.empty(); flash('Out of missiles!', '', .8); return; }
  best.n--; best.ammo[best.n].visible = false; launchOurs(best, x, y); hud();
}
function endWave() {
  G.mode = 'tally'; const up = cities.filter(c => c.up).length, ammo = bases.reduce((s, b) => s + b.n, 0);
  G.tally = { ammo, cities: up, ammoPts: ammo * 5 * mult(), cityPts: up * 100 * mult() };
  G.score += G.tally.ammoPts + G.tally.cityPts; while (G.score >= G.nextBonus) { G.nextBonus += D.bonusCity; G.spareCities++; }
  if (G.score > save.hi) save.hi = G.score;
  if (up > 0) { const c = save.cleared[G.diff]; if (!c.includes(G.wave)) c.push(G.wave); }
  store(); hud(); SFX.bonus();
  if (up === 0 && G.spareCities === 0) { G.mode = 'over'; setTimeout(() => { $('overScore').textContent = 'Score ' + G.score.toLocaleString() + ' · you reached wave ' + (G.wave + 1); showScreen('over'); }, 1500); return; }
  const last = G.wave === WAVES.length - 1;
  $('clearTitle').textContent = last ? 'SKY SAVED!' : 'WAVE ' + (G.wave + 1) + ' CLEAR!';
  $('clearSub').innerHTML = (last ? 'You beat all 12 waves on ' + G.diff + '!<br>' : '') + '🏙️ ' + up + ' cities × ' + 100 * mult() + ' = <b>' + G.tally.cityPts + '</b><br>🚀 ' + ammo + ' missiles × ' + 5 * mult() + ' = <b>' + G.tally.ammoPts + '</b><br>Score ' + G.score.toLocaleString() + (G.spareCities ? ' · spare cities: ' + G.spareCities : '');
  $('clearNext').classList.toggle('hide', last);
  setTimeout(() => showScreen('clear'), 900);
}

/* ================================================================
   Update
   ================================================================ */
function update(dt) {
  G.t += dt;
  if (G.msgT > 0) { G.msgT -= dt; if (G.msgT <= 0) $('msg').style.opacity = 0; }
  updateFX(dt);
  if (G.mode !== 'play') { updateBlasts(dt); return; }
  G.volleyT -= dt; if (G.volleyT <= 0 && G.toSpawn > 0) { volley(); G.volleyT = Math.max(1.4, 4 - G.wave * .2) / D.spd * (.7 + Math.random() * .6); }
  G.flierT -= dt; if (G.flierT <= 0 && G.fliersLeft > 0) { spawnFlier(); G.fliersLeft--; G.flierT = 7 + Math.random() * 5; }
  for (const m of M.slice()) {
    if (m.kind === 'smart') { // smart bombs sidestep fireballs in their way
      let ax = 0; for (const x of X) { const dx = m.x - x.x, dy = m.y - x.y, d = Math.hypot(dx, dy); if (d < x.r + 6 && d > .1) ax += dx / d * 14; }
      const sp = Math.hypot(m.vx, m.vy), toX = m.tx - m.x, toY = m.ty - m.y, dd = Math.hypot(toX, toY) || 1; m.vx = lerp(m.vx, toX / dd * sp + ax, dt * 2); m.vy = Math.min(-sp * .3, lerp(m.vy, toY / dd * sp, dt * 2));
      const s2 = Math.hypot(m.vx, m.vy); m.vx *= sp / s2; m.vy *= sp / s2; m.body.rotation.y += dt * 5;
    }
    m.x += m.vx * dt; m.y += m.vy * dt; m.head.position.set(m.x, m.y, .6);
    const pos = m.line.geometry.attributes.position; pos.setXYZ(1, m.x, m.y, .5); pos.needsUpdate = true;
    if (!m.enemy) { if ((m.tx - m.x) * m.vx + (m.ty - m.y) * m.vy <= 0) { removeMissile(m); explode(m.tx, m.ty); } continue; }
    if (m.kind === 'mirv' && m.y < m.splitY) { const n = 2 + (Math.random() < .4 ? 1 : 0); for (let i = 0; i < n; i++) launchEnemy(m.x, m.y, pick(targets())); removeMissile(m); continue; }
    if (m.y <= m.ty) { removeMissile(m); groundHit(m.x, m.ty); }
  }
  for (const f of F.slice()) { f.x += f.vx * dt; f.g.position.x = f.x; f.g.rotation.x = f.sat ? f.g.rotation.x + dt : Math.sin(G.t * 2) * .1;
    f.dropT -= dt; if (f.dropT <= 0 && f.drops > 0 && Math.abs(f.x) < WX - 4) { f.drops--; f.dropT = 2 + Math.random() * 2; launchEnemy(f.x, f.y - 1, pick(targets())); }
    if (Math.abs(f.x) > WX + 8) { world.remove(f.g); F.splice(F.indexOf(f), 1); } }
  updateBlasts(dt);
  if (G.toSpawn <= 0 && G.fliersLeft <= 0 && !M.some(m => m.enemy) && !F.length && !X.length && !M.length) { G.endT += dt; if (G.endT > .8) endWave(); }
}
function updateBlasts(dt) {
  for (let i = X.length - 1; i >= 0; i--) { const x = X[i]; x.t += dt;
    x.r = x.t < .35 ? x.max * x.t / .35 : x.t < .75 ? x.max : x.max * Math.max(0, 1 - (x.t - .75) / .45);
    x.mesh.scale.setScalar(Math.max(.05, x.r)); x.mesh.material.color.setHSL((G.t * 3 + i * .2) % 1, 1, .6); x.halo.scale.setScalar(x.r * 3.2); x.halo.material.opacity = .7;
    if (G.mode === 'play') {
      for (const m of M.slice()) if (m.enemy && Math.hypot(m.x - x.x, m.y - x.y) < x.r + .3) { removeMissile(m); addScore(m.kind === 'smart' ? 125 : 25, m.x, m.y); explode(m.x, m.y, .8, false); }
      for (const f of F.slice()) if (Math.hypot(f.x - x.x, f.y - x.y) < x.r + 1.5) { world.remove(f.g); F.splice(F.indexOf(f), 1); addScore(100, f.x, f.y); explode(f.x, f.y, 1.1, false); boomFX(f.x, f.y, 0xffd34d, 10); }
    }
    if (x.t > 1.2) { world.remove(x.mesh); world.remove(x.halo); x.mesh.geometry.dispose(); X.splice(i, 1); }
  }
}
function groundHit(x, y) {
  explode(x, y + 1, .9, true); boomFX(x, y + 1, 0xff8a2a, 12); G.shake = .5;
  for (const c of cities) if (c.up && Math.abs(c.x - x) < 4.5) { setCity(c, false); SFX.city(); boomFX(c.x, c.y + 3, 0xff4a2a, 30); flash('City hit!', cities.filter(k => k.up).length + ' cities left', 1.2); }
  for (const b of bases) if (b.up && Math.abs(b.x - x) < 3.5) { setBase(b, false, 0); SFX.city(); boomFX(b.x, b.y, 0xff4a2a, 20); }
  hud();
}
function updateFX(dt) {
  for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; f.o.position.x += f.vx * dt; f.o.position.y += f.vy * dt; if (!f.text) f.vy -= 12 * dt; f.o.material.opacity = 1 - f.t / f.life;
    if (f.t >= f.life) { world.remove(f.o); if (f.text) f.o.material.map.dispose(); f.o.material.dispose(); FX.splice(i, 1); } }
}

/* ================================================================
   Drawing and camera
   ================================================================ */
const cross = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (c) => { c.strokeStyle = '#9fe8ff'; c.lineWidth = 4; c.beginPath(); c.arc(32, 32, 18, 0, TAU); c.moveTo(32, 2); c.lineTo(32, 22); c.moveTo(32, 42); c.lineTo(32, 62); c.moveTo(2, 32); c.lineTo(22, 32); c.moveTo(42, 32); c.lineTo(62, 32); c.stroke(); }), transparent: true, depthTest: false }));
cross.scale.set(3.4, 3.4, 1); cross.renderOrder = 8; cross.position.set(0, 30, 1); cross.visible = false; scene.add(cross);
function draw(dt) {
  const tanH = Math.tan(camera.fov * Math.PI / 360), dist = Math.max((SKY / 2 + 6) / tanH, (WX + 4) / (tanH * camera.aspect));
  G.shake = Math.max(0, (G.shake || 0) - dt);
  const sh = G.shake * 1.2;
  const lookY = Math.max(SKY / 2 - 1, dist * tanH - 6);  // tall screens: keep the ground at the bottom
  camera.position.set((Math.random() - .5) * sh, lookY - 5 + (Math.random() - .5) * sh, dist); camera.lookAt(0, lookY, 0);
  for (const b of bases) b.tube.rotation.z = lerp(b.tube.rotation.z, clamp(-(cross.position.x - b.x) * .02, -.8, .8), dt * 6);
}

/* ================================================================
   Input: tap or click the sky
   ================================================================ */
const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
function toWorld(cx, cy) { const r = canvas.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; }
canvas.addEventListener('pointerdown', e => { if (G.mode !== 'play') return; e.preventDefault(); audio(); const p = toWorld(e.clientX, e.clientY); if (p) { cross.position.set(clamp(p.x, -WX, WX), clamp(p.y, 8, SKY - 2), 1); cross.visible = true; fireAt(p.x, p.y); } });
canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const p = toWorld(e.clientX, e.clientY); if (p) { cross.position.set(clamp(p.x, -WX, WX), clamp(p.y, 8, SKY - 2), 1); cross.visible = G.mode === 'play'; } });
const held = {};
addEventListener('keydown', e => {
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause(); if (e.key === 'm' || e.key === 'M') toggleMute();
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { held[e.key] = 1; e.preventDefault(); cross.visible = G.mode === 'play'; }
  if (e.key === ' ' && !e.repeat) { e.preventDefault(); audio(); fireAt(cross.position.x, cross.position.y); }
});
addEventListener('keyup', e => { held[e.key] = 0; });
function keyCross(dt) { const v = 40 * dt; cross.position.x = clamp(cross.position.x + ((held.ArrowRight ? 1 : 0) - (held.ArrowLeft ? 1 : 0)) * v, -WX, WX); cross.position.y = clamp(cross.position.y + ((held.ArrowUp ? 1 : 0) - (held.ArrowDown ? 1 : 0)) * v, 8, SKY - 2); }

/* ================================================================
   HUD and screens
   ================================================================ */
function hud() {
  $('score').textContent = G.score.toLocaleString(); $('hi').textContent = 'HI ' + Math.max(save.hi, G.score).toLocaleString();
  $('wave').textContent = 'WAVE ' + (G.wave + 1) + ' · ×' + mult(); $('citiesLeft').textContent = '🏙️ ' + cities.filter(c => c.up).length + (G.spareCities ? ' +' + G.spareCities : '');
  $('ammo').textContent = bases.map(b => b.up ? b.n : '✖').join('  ·  ');
}
function flash(t, sub, sec) { $('msg').innerHTML = t + (sub ? '<small>' + sub + '</small>' : ''); $('msg').style.opacity = 1; G.msgT = sec || 1.6; }
const SCREENS = ['title', 'select', 'help', 'pause', 'clear', 'over'];
function showScreen(id) {
  for (const s of SCREENS) $(s).classList.toggle('hide', s !== id);
  $('hud').classList.toggle('hide', !(id === null || id === 'pause')); $('ctl').classList.toggle('hide', id !== null); cross.visible = cross.visible && id === null;
  if (id === 'select') buildSelect();
}
function buildSelect() {
  for (const b of $('diff').children) b.setAttribute('aria-pressed', b.dataset.v === G.diff);
  const box = $('levels'); box.innerHTML = '';
  WAVES.forEach((name, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'lv' + (save.cleared[G.diff].includes(i) ? ' done' : '');
    b.innerHTML = '<b>' + (i + 1) + '</b><span>' + name + '</span><em>' + ['easy', 'medium', 'hard'].map(d => save.cleared[d].includes(i) ? '★' : '☆').join('') + '</em>';
    b.onclick = () => { audio(); startGame(i); }; box.appendChild(b); });
  $('selHi').textContent = save.hi ? 'High score ' + save.hi.toLocaleString() : '';
}
function togglePause() { if (G.mode !== 'play') return; G.paused = !G.paused; showScreen(G.paused ? 'pause' : null); }
function toggleMute() { muted = !muted; $('bSnd').textContent = muted ? '🔇' : '🔊'; }
$('bPause').onclick = togglePause; $('bSnd').onclick = toggleMute;
$('goPlay').onclick = () => { audio(); showScreen('select'); }; $('goHelp').onclick = () => showScreen('help'); $('helpBack').onclick = () => showScreen('title'); $('selBack').onclick = () => showScreen('title');
for (const b of $('diff').children) b.onclick = () => { G.diff = b.dataset.v; save.diff = G.diff; store(); buildSelect(); };
$('resume').onclick = togglePause; $('restart').onclick = () => { G.paused = false; startGame(G.wave); }; $('toLevels').onclick = () => { G.paused = false; G.mode = 'title'; clearActors(); showScreen('select'); };
$('clearNext').onclick = () => { G.wave++; startWave(); }; $('clearLevels').onclick = () => { G.mode = 'title'; showScreen('select'); };
$('overAgain').onclick = () => startGame(G.wave); $('overLevels').onclick = () => { G.mode = 'title'; showScreen('select'); };
document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused) togglePause(); });

/* ================================================================
   Loop
   ================================================================ */
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
bases.forEach(b => setBase(b, true, 10));
let last = performance.now(), demoT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - last) / 1000, 0, .05); last = now;
  if (!G.paused) {
    if (G.mode === 'title') { // a little demo behind the title screen
      G.t += dt; demoT -= dt; if (demoT <= 0) { demoT = 1.6; launchEnemy((Math.random() - .5) * 90, SKY, pick(cities)); }
      for (const m of M.slice()) { m.x += m.vx * dt; m.y += m.vy * dt; m.head.position.set(m.x, m.y, .6); const p = m.line.geometry.attributes.position; p.setXYZ(1, m.x, m.y, .5); p.needsUpdate = true;
        if (m.enemy && m.y < 30 && Math.random() < dt * 1.5) { removeMissile(m); explode(m.x, m.y); } else if (m.y <= m.ty) removeMissile(m); }
      updateBlasts(dt); updateFX(dt);
    } else { keyCross(dt); update(dt / 2); update(dt / 2); }
  }
  draw(dt); renderer.render(scene, camera);
}
requestAnimationFrame(frame);
showScreen('title');
SS.ok = true;
SS.debug = { G, M, X, F, cities, bases, startGame, startWave, update, fireAt, WAVES, DIFF, save, launchEnemy, spawnFlier, endWave };
}
