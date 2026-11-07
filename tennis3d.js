/* Grand Slam Tennis: an original 3D tennis game.
   Serve, return and rally with topspin, slice and lobs against computer opponents, then travel the
   world tour to the four majors: Melbourne (blue hard court), Paris (red clay), London (grass) and
   New York (hard court, under the lights).

   The ball is real physics: gravity, air drag, and the Magnus force from spin (topspin dips, slice
   floats, a slice serve curves), plus a bounce that depends on the surface (clay is slow and high,
   grass is fast and low) and on the spin (topspin kicks up, slice skids). Every shot is aimed by
   solving that same physics for the launch, so the ball really goes where the player meant it to,
   give or take the errors that make tennis tennis. */
import * as THREE from './three.module.min.js';

const TAU = Math.PI * 2, clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a), gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
const GST = { ok: false }; window.GST = GST;
const $ = id => document.getElementById(id);
const canvas = $('c');
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
if (renderer) boot();

function boot() {
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, .1, 600);
const hemi = new THREE.HemisphereLight(0xcfe4ff, 0x4a5a3a, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
sun.position.set(-18, 34, 12); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 26, bottom: -26, near: 5, far: 90 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun); scene.add(sun.target);
const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7 }, o || {}));
const canvasTex = (w, h, fn) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };

/* ================================================================
   The court (metres): x across, z along, y up. The net is at z = 0,
   you play from the near end (z > 0), the opponent from the far end.
   ================================================================ */
const HALF_W = 4.115, HALF_L = 11.885, SERVICE = 6.40, DBL_W = 5.485, BALL_R = .033, NET_POST = 6.4;
const netH = x => .914 + .156 * Math.min(1, (x / NET_POST) ** 2);
const SURF = {
  hard:  { e: .74, f: .80, kick: 1.0, name: 'hard court' },
  clay:  { e: .80, f: .69, kick: 1.35, name: 'red clay' },
  grass: { e: .60, f: .90, kick: .6, name: 'grass' },
};
const MAJORS = [
  { id: 'mel', city: 'Melbourne', month: 'January', surf: 'hard', inner: '#2f6fc0', outer: '#2a8a9a', walls: 0x1f4f8a, sky: ['#5fb0ff', '#d8f0ff'], night: false, ll: [-37.8, 145], card: 'linear-gradient(135deg,#2f6fc0,#2a8a9a)' },
  { id: 'par', city: 'Paris', month: 'June', surf: 'clay', inner: '#c8643a', outer: '#c25e35', walls: 0x1f5a3a, sky: ['#7ab8ef', '#eaf2ff'], night: false, ll: [48.9, 2.35], card: 'linear-gradient(135deg,#d8693a,#9a4422)' },
  { id: 'lon', city: 'London', month: 'July', surf: 'grass', inner: '#5d9a3c', outer: '#57923a', walls: 0x2a4a2a, sky: ['#8ab8e0', '#f0f4f8'], night: false, ll: [51.5, -.1], card: 'linear-gradient(135deg,#4f8a32,#3a5f2a)' },
  { id: 'ny', city: 'New York', month: 'September', surf: 'hard', inner: '#3b6fb6', outer: '#4b8a52', walls: 0x1a2a4a, sky: ['#05091c', '#1a2a5a'], night: true, ll: [40.7, -74], card: 'linear-gradient(135deg,#1a2a5a,#3b6fb6)' },
];
const ROUNDS = ['Quarterfinal', 'Semifinal', 'Final'];
/* Made-up players, each with a style and colours. */
const OPP = {
  mel: [{ n: 'Tomas Reyna', st: 'base', c: [0xffffff, 0x1a3a7a, 0xd8a07a, 0x2a1a10] }, { n: 'Kai Lindqvist', st: 'serve', c: [0xffe14a, 0x2a2a2a, 0xf2c7a5, 0xe8d088] }, { n: 'Mateus Ferro', st: 'counter', c: [0xff6a3a, 0xffffff, 0xb8784e, 0x1a1008] }],
  par: [{ n: 'Hugo Marchal', st: 'net', c: [0x2a8aff, 0xffffff, 0xf0c09a, 0x6a4020] }, { n: 'Iker Solano', st: 'clay', c: [0xd82a4a, 0x1a1a1a, 0xc8906a, 0x1a1008] }, { n: 'Diego Varela', st: 'clay', c: [0x2ad89a, 0x1a2a3a, 0xb07850, 0x1a1008] }],
  lon: [{ n: 'Oliver Pembroke', st: 'net', c: [0xffffff, 0xffffff, 0xf4cfb0, 0xb07040] }, { n: 'Jonas Brandt', st: 'serve', c: [0xffffff, 0xffffff, 0xf0c8a8, 0xd8c070] }, { n: 'Arthur Hale', st: 'base', c: [0xffffff, 0xffffff, 0x8a5a3a, 0x0a0806] }],
  ny: [{ n: 'Marcus Bell', st: 'counter', c: [0x1a1a1a, 0x1a1a1a, 0x7a4a2a, 0x0a0806] }, { n: 'Andrei Volkov', st: 'serve', c: [0x8a3ad8, 0x1a1a2a, 0xf2d0b8, 0x3a2a1a] }, { n: 'Leo Santana', st: 'base', c: [0x3ad8ff, 0x0a2a4a, 0xc08a60, 0x1a1008] }],
};
const STYLE_NOTE = { base: 'a baseliner who hits deep', serve: 'a big server', net: 'a serve-and-volley player who rushes the net', clay: 'a clay specialist with heavy topspin', counter: 'a fast counter-puncher who gets everything back' };

const DIFF = {
  easy:   { auto: true,  win: 1.0,  reach: 1.85, sim: .70, run: 6.2, meReact: .18, ai: 4.8, react: .32, noise: 1.0,  aiPow: .80, aim: .25, serveIn: .82, note: 'You run to the ball by yourself: just tap a shot. Slow ball, friendly opponents.' },
  medium: { auto: true,  win: .66,  reach: 1.55, sim: .80, run: 5.6, meReact: .24, ai: 6.8, react: .16, noise: .70,  aiPow: .95, aim: .78, serveIn: .70, note: 'You still run by yourself, but time your shots. Opponents aim for the corners.' },
  hard:   { auto: false, win: .46,  reach: 1.38, sim: .90, run: 6.6, meReact: .2, ai: 7.6, react: .1, noise: .45,  aiPow: 1.0, aim: .95, serveIn: .64, note: 'Move with the joystick, real speed, sharp opponents.' },
};
const COLORS = [0xe8323c, 0x2a7aff, 0x2fbf71, 0xffb02e, 0x9a5aff, 0x1a1a1a, 0xffffff];

const SAVE_KEY = 'grandslamtennis';
const save = (() => { const d = { name: 'Chance', color: 0, diff: 'easy', tour: { slam: 0, round: 0, year: 1 }, titles: {}, best: {}, sound: true }; try { return Object.assign(d, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { return d; } })();
const store = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* private mode */ } };
let D = DIFF[save.diff];

/* ================================================================
   Sound: hits, bounces and the crowd, plus the umpire's voice
   ================================================================ */
let AC = null;
const ac = () => { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; };
function noise(d, vol, f0, f1, q, delay) {
  if (!save.sound || !ac()) return;
  const n = Math.floor(AC.sampleRate * d), buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (delay || 0);
  f.type = 'bandpass'; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.value = vol; s.buffer = buf; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t);
}
function tone(f0, f1, d, vol, type) {
  if (!save.sound || !ac()) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + .02);
}
const SFX = {
  hit: (p) => { noise(.07, .5 * p + .2, 2600, 900, 1.2); tone(520, 300, .06, .18 * p); },
  bounce: (s) => { noise(.05, s === 'clay' ? .12 : .22, s === 'grass' ? 500 : 900, 300, 1.5); },
  net: () => { noise(.18, .25, 400, 200, .8); },
  clap: (big) => { for (let i = 0; i < (big ? 4 : 2); i++) noise(1.6, big ? .3 : .16, 1800, 1300, .5, i * .12); },
  groan: () => { noise(.9, .12, 380, 220, .6); },
};
let voice = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /en-GB/i.test(v.lang) && /male|daniel|arthur/i.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; } catch (e) { voice = null; } }
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { /* no speech */ }
function umpire(text) {
  if (!save.sound) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); if (voice) u.voice = voice; u.rate = 1.0; u.pitch = .9; speechSynthesis.speak(u); } catch (e) { /* no speech */ }
}

/* ================================================================
   The venue: court, net, stands, crowd and sky. Rebuilt per major.
   ================================================================ */
const venue = new THREE.Group(); scene.add(venue);
const PX = 48;   // texture pixels per metre
function courtTexture(m) {
  const W = 40, L = 36;   // metres covered: 40 along z, 36 across... (z first)
  return canvasTex(Math.round(L * PX), Math.round(W * PX), (g, w, h) => {
    // u along x (width 36 m), v along z (length 40 m)
    g.fillStyle = m.outer; g.fillRect(0, 0, w, h);
    const X = x => (x + L / 2) * PX, Z = z => (z + W / 2) * PX;
    if (m.surf === 'grass') {
      for (let i = 0; i < 40; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; g.fillRect(0, i * PX, w, PX); }
      // worn patches behind the baselines
      for (const s of [-1, 1]) { const gr = g.createRadialGradient(X(0), Z(s * 12.6), 10, X(0), Z(s * 12.6), 3.2 * PX); gr.addColorStop(0, 'rgba(170,150,90,.55)'); gr.addColorStop(1, 'rgba(170,150,90,0)'); g.fillStyle = gr; g.fillRect(X(-4), Z(s * 12.6) - 3.2 * PX, 8 * PX, 6.4 * PX); }
    } else {
      g.fillStyle = m.inner; g.fillRect(X(-DBL_W), Z(-HALF_L), 2 * DBL_W * PX, 2 * HALF_L * PX);
    }
    if (m.surf === 'clay') {
      for (let i = 0; i < 26000; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,220,180,.08)' : 'rgba(90,30,10,.08)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    } else if (m.surf === 'hard') {
      for (let i = 0; i < 12000; i++) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    }
    g.fillStyle = '#ffffff';
    const line = (x0, z0, x1, z1) => { const lw = .05 * PX; if (x0 === x1) g.fillRect(X(x0) - lw / 2, Z(z0), lw, Z(z1) - Z(z0)); else g.fillRect(X(x0), Z(z0) - lw / 2, X(x1) - X(x0), lw); };
    for (const s of [-1, 1]) {
      line(-DBL_W, s * HALF_L, DBL_W, s * HALF_L);           // baselines
      line(-HALF_W, s * SERVICE, HALF_W, s * SERVICE);       // service lines
      line(s * HALF_W, -HALF_L, s * HALF_W, HALF_L);         // singles sidelines
      line(s * DBL_W, -HALF_L, s * DBL_W, HALF_L);           // doubles sidelines
      g.fillRect(X(0) - .025 * PX, Z(s * HALF_L) - (s > 0 ? .1 * PX : 0), .05 * PX, .1 * PX);   // centre marks
    }
    line(0, -SERVICE, 0, SERVICE);                           // centre service line
  });
}
function crowdColors() { const c = [0xffffff, 0x1a3a7a, 0xd82a2a, 0xffd34d, 0x2a8a4a, 0x1a1a1a, 0xff8a3a, 0x8ad8ff, 0xd8a0d0, 0x6a4a3a]; return c[Math.floor(Math.random() * c.length)]; }
let nightLights = [];
function buildVenue(m) {
  while (venue.children.length) { const o = venue.children.pop(); o.traverse(n => { if (n.geometry) n.geometry.dispose(); }); }
  nightLights = [];
  // sky
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, map: canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, m.sky[0]); gr.addColorStop(.5, m.sky[1]); gr.addColorStop(1, m.sky[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }));
  venue.add(sky);
  if (m.night) {
    const st = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 900 }, (_, i) => { const a = Math.random() * TAU, e = .25 + Math.random() * 1.2, r = 280; return i % 3 === 0 ? r * Math.cos(e) * Math.cos(a) : i % 3 === 1 ? r * Math.sin(e) : r * Math.cos(e) * Math.sin(a); }), 3)), new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false }));
    venue.add(st);
  }
  // ground and court
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 40), std(0xffffff, { map: courtTexture(m), roughness: m.surf === 'hard' ? .55 : .95 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; venue.add(ground);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), std(new THREE.Color(m.outer).multiplyScalar(.7)));
  apron.rotation.x = -Math.PI / 2; apron.position.y = -.02; apron.receiveShadow = true; venue.add(apron);
  // net
  const netTex = canvasTex(512, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,20,20,.9)'; g.lineWidth = 1.4; for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  netTex.wrapS = THREE.RepeatWrapping; netTex.repeat.x = 4;
  const netGeo = new THREE.PlaneGeometry(2 * NET_POST, 1, 40, 1); const pos = netGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setY(i, y > 0 ? netH(x) : 0); }
  netGeo.computeVertexNormals();
  const net = new THREE.Mesh(netGeo, new THREE.MeshStandardMaterial({ map: netTex, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .9 }));
  net.castShadow = true; venue.add(net);
  const tape = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 21 }, (_, i) => { const x = -NET_POST + i * NET_POST / 10; return new THREE.Vector3(x, netH(x) + .02, 0); })), 40, .03, 6), std(0xffffff));
  tape.castShadow = true; venue.add(tape);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(.05, .914, .01), std(0xffffff)); strap.position.set(0, .457, 0); venue.add(strap);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.07, 12), std(0x1f3a2a, { metalness: .4 })); p.position.set(s * NET_POST, .535, 0); p.castShadow = true; venue.add(p); }
  // umpire's chair
  const chair = new THREE.Group();
  const legM = std(0x1f3a2a, { metalness: .3 });
  for (const [x, z] of [[-.4, -.3], [.4, -.3], [-.4, .3], [.4, .3]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, 2, .06), legM); l.position.set(x, 1, z); chair.add(l); }
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1, .12, .8), std(0x1f3a2a)); seat.position.y = 2; chair.add(seat);
  const ump = makePlayer({ shirt: 0x1a2a4a, shorts: 0x2a2a2a, skin: 0xe0b090, hair: 0x6a6a6a, racket: false });
  ump.root.position.y = 1.35; ump.root.scale.setScalar(.9); ump.root.rotation.y = Math.PI / 2; pose(ump, POSES.sit, 1); chair.add(ump.root);
  chair.position.set(-DBL_W - 1.6, 0, 0); chair.traverse(n => { if (n.isMesh) n.castShadow = true; }); venue.add(chair);
  // walls with boards
  const wallM = std(m.walls, { roughness: .8 });
  // the wall is 36 m by 1.2 m: a 3000 x 100 canvas keeps the letters in proportion
  const board = (txt, w) => canvasTex(3000, 100, (g, W, H) => {
    g.fillStyle = '#' + new THREE.Color(m.walls).getHexString(); g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.92)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 64; g.font = `900 ${fs}px Trebuchet MS, sans-serif`;
    while (g.measureText(txt).width > W / w * .82 && fs > 20) { fs -= 2; g.font = `900 ${fs}px Trebuchet MS, sans-serif`; }
    for (let i = 0; i < w; i++) g.fillText(txt, (i + .5) * W / w, H / 2 + 2);
  });
  for (const s of [-1, 1]) {
    const back = new THREE.Mesh(new THREE.BoxGeometry(36, 1.2, .3), [wallM, wallM, wallM, wallM, std(0xffffff, { map: board(m.city.toUpperCase() + '  ·  GRAND SLAM', 3) }), std(0xffffff, { map: board(m.city.toUpperCase() + '  ·  GRAND SLAM', 3) })]);
    back.position.set(0, .6, s * 20); venue.add(back);
    const side = new THREE.Mesh(new THREE.BoxGeometry(.3, 1.2, 40), wallM); side.position.set(s * 18, .6, 0); venue.add(side);
  }
  // stands: stepped tiers all round, filled with a crowd
  const tierM = std(new THREE.Color(m.walls).multiplyScalar(.75), { roughness: .9 });
  const people = [];
  const addStand = (cx, cz, len, alongX, dirSign) => {
    for (let r = 0; r < 12; r++) {
      const out = 1.2 + r * .9, y = .6 + r * .55;
      const step = new THREE.Mesh(new THREE.BoxGeometry(alongX ? len : .9, .55, alongX ? .9 : len), tierM);
      step.position.set(cx + (alongX ? 0 : dirSign * out), y, cz + (alongX ? dirSign * out : 0)); venue.add(step);
      const n = Math.floor(len / .62);
      for (let i = 0; i < n; i++) {
        if (Math.random() < .08) continue;
        const a = -len / 2 + (i + .5) * len / n + rnd(-.08, .08);
        people.push({ x: alongX ? cx + a : cx + dirSign * out, z: alongX ? cz + dirSign * out : cz + a, y: y + .27, face: alongX ? (dirSign > 0 ? Math.PI : 0) : (dirSign > 0 ? -Math.PI / 2 : Math.PI / 2) });
      }
    }
  };
  addStand(0, 20, 36, true, 1); addStand(0, -20, 36, true, -1); addStand(18, 0, 40, false, 1); addStand(-18, 0, 40, false, -1);
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.2, .35, 3, 8), std(0xffffff, { roughness: .85 }), people.length);
  const head = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 10, 8), std(0xffffff, { roughness: .7 }), people.length);
  const mx = new THREE.Matrix4(), col = new THREE.Color();
  const skins = [0xf2d0b8, 0xe0b090, 0xc08a60, 0x8a5a3a, 0x5a3a22];
  people.forEach((p, i) => {
    mx.makeTranslation(p.x, p.y + .3, p.z); body.setMatrixAt(i, mx); body.setColorAt(i, col.setHex(crowdColors()));
    mx.makeTranslation(p.x, p.y + .78, p.z); head.setMatrixAt(i, mx); head.setColorAt(i, col.setHex(skins[i % skins.length]));
  });
  venue.add(body); venue.add(head);
  crowd = { body, head, people, t: 0, cheer: 0 };
  // roof ring / light towers at night
  if (m.night) {
    for (const [x, z] of [[-17, -19], [17, -19], [-17, 19], [17, 19]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.2, .3, 22, 8), std(0x2a2a3a)); pole.position.set(x, 11, z); venue.add(pole);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, .4), new THREE.MeshBasicMaterial({ color: 0xfffbe8 })); lamp.position.set(x * .97, 22, z * .97); lamp.lookAt(0, 0, 0); venue.add(lamp);
      nightLights.push(lamp);
    }
    hemi.intensity = .55; hemi.color.setHex(0x9ab0ff); sun.intensity = 2.4; sun.color.setHex(0xf4f6ff); sun.position.set(-6, 30, 6);
    scene.fog = new THREE.Fog(0x05091c, 120, 280);
  } else {
    hemi.intensity = 1.0; hemi.color.setHex(0xcfe4ff); sun.intensity = 2.2; sun.color.setHex(0xfff4e0); sun.position.set(-18, 34, 12);
    scene.fog = null;
  }
}
let crowd = null;

/* ================================================================
   Players: jointed bodies with shoulders, elbows, hips and knees,
   posed every frame (ready stance, running, forehand, two-handed
   backhand, volley, serve).
   ================================================================ */
function makePlayer(o) {
  const skin = std(o.skin, { roughness: .6 }), shirt = std(o.shirt, { roughness: .8 }), shorts = std(o.shorts, { roughness: .8 }), white = std(0xf4f4f4, { roughness: .7 }), hairM = std(o.hair, { roughness: .9 });
  const cap = (r, l, m) => { const g = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), m); g.castShadow = true; return g; };
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = .98; root.add(hips);
  const pelvis = cap(.15, .12, shorts); pelvis.rotation.z = Math.PI / 2; pelvis.scale.set(1, 1, .8); hips.add(pelvis);
  const chest = new THREE.Group(); chest.position.y = .08; hips.add(chest);
  const torso = cap(.17, .34, shirt); torso.position.y = .3; torso.scale.set(1.05, 1, .72); chest.add(torso);
  const neck = cap(.055, .06, skin); neck.position.y = .62; chest.add(neck);
  const head = new THREE.Group(); head.position.y = .76; chest.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.115, 20, 16), skin); skull.scale.set(.92, 1.05, 1); skull.castShadow = true; head.add(skull);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 12, 0, TAU, 0, Math.PI * .55), hairM); hair.position.y = .02; hair.rotation.x = -.25; hair.scale.set(.95, 1, 1.05); head.add(hair);
  if (o.band !== false) { const band = new THREE.Mesh(new THREE.TorusGeometry(.112, .016, 6, 24), std(o.band || 0xffffff)); band.rotation.x = Math.PI / 2 - .2; band.position.y = .035; head.add(band); }
  for (const s of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 6), std(0x1a1a1a)); eye.position.set(s * .04, .01, .1); head.add(eye); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), skin); nose.position.set(0, -.02, .112); head.add(nose);
  const arm = side => {
    const sh = new THREE.Group(); sh.position.set(side * .22, .52, 0); chest.add(sh);
    const up = cap(.052, .22, shirt === shirt ? skin : skin); up.position.y = -.15; sh.add(up);
    const sleeve = cap(.064, .08, shirt); sleeve.position.y = -.05; sh.add(sleeve);
    const el = new THREE.Group(); el.position.y = -.3; sh.add(el);
    const fore = cap(.045, .2, skin); fore.position.y = -.13; el.add(fore);
    const hand = new THREE.Group(); hand.position.y = -.28; el.add(hand);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(.048, 10, 8), skin); palm.scale.set(.8, 1.1, .6); palm.castShadow = true; hand.add(palm);
    return { sh, el, hand };
  };
  const R = arm(-1), L = arm(1);
  const leg = side => {
    const hp = new THREE.Group(); hp.position.set(side * .1, -.04, 0); hips.add(hp);
    const thigh = cap(.075, .3, shorts); thigh.position.y = -.12; hp.add(thigh);
    const thighSkin = cap(.066, .14, skin); thighSkin.position.y = -.33; hp.add(thighSkin);
    const kn = new THREE.Group(); kn.position.y = -.44; hp.add(kn);
    const shin = cap(.058, .3, skin); shin.position.y = -.2; kn.add(shin);
    const sock = cap(.06, .06, white); sock.position.y = -.37; kn.add(sock);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(.11, .09, .27), std(o.shoe || 0xf8f8f8, { roughness: .5 })); shoe.position.set(0, -.46, .05); shoe.castShadow = true; kn.add(shoe);
    return { hp, kn };
  };
  const LR = leg(-1), LL = leg(1);
  let racket = null;
  if (o.racket !== false) {
    racket = new THREE.Group(); R.hand.add(racket);
    const frameM = std(o.frame || 0x1a1a1a, { roughness: .35, metalness: .3 });
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(.017, .017, .2, 8), std(0xf0f0f0)); grip.position.y = -.05; racket.add(grip);
    const throat = new THREE.Mesh(new THREE.CylinderGeometry(.012, .016, .16, 6), frameM); throat.position.y = -.22; racket.add(throat);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(.13, .011, 8, 36), frameM); hoop.scale.set(1, 1.28, 1); hoop.position.y = -.46; hoop.castShadow = true; racket.add(hoop);
    const strings = new THREE.Mesh(new THREE.CircleGeometry(.125, 28), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(250,250,240,.95)'; g.lineWidth = 2; for (let i = 6; i < w; i += 10) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }), transparent: true, side: THREE.DoubleSide, alphaTest: .2 }));
    strings.scale.set(1, 1.28, 1); strings.position.y = -.46; racket.add(strings);
    racket.rotation.x = -.35;
  }
  return { root, hips, chest, head, shR: R.sh, elR: R.el, handR: R.hand, shL: L.sh, elL: L.el, handL: L.hand, hpR: LR.hp, knR: LR.kn, hpL: LL.hp, knL: LL.kn, racket, cur: Object.assign({}, POSES_READY()) };
}
/* Poses: joint angles. Arms hang along -y; a negative x rotation
   swings an arm forward; the model's right side is -x. */
function POSES_READY() { return { cy: 0, cx: .22, rx: -.55, rz: -.25, re: -1.35, lx: -.65, lz: .35, le: -1.25, hy: 0, crouch: .32 }; }
const POSES = {
  ready: POSES_READY(),
  sit: { cy: 0, cx: 0, rx: -.3, rz: -.1, re: -1.4, lx: -.3, lz: .1, le: -1.4, hy: 0, crouch: 1.4 },
  fhBack: { cy: -1.15, cx: .25, rx: -.25, rz: -1.0, re: -.55, lx: -1.05, lz: .45, le: -.3, hy: -.5, crouch: .45 },
  fhHit: { cy: .15, cx: .2, rx: -1.35, rz: -.55, re: -.25, lx: -.55, lz: .7, le: -.8, hy: .2, crouch: .35 },
  fhFollow: { cy: 1.0, cx: .15, rx: -2.45, rz: .45, re: -1.6, lx: -.3, lz: .3, le: -1.4, hy: .5, crouch: .25 },
  bhBack: { cy: 1.15, cx: .25, rx: -.85, rz: .55, re: -.6, lx: -.55, lz: .95, le: -.45, hy: .5, crouch: .45 },
  bhHit: { cy: 0, cx: .2, rx: -1.25, rz: .2, re: -.3, lx: -1.25, lz: -.15, le: -.3, hy: -.1, crouch: .35 },
  bhFollow: { cy: -1.0, cx: .15, rx: -2.3, rz: -.6, re: -1.4, lx: -2.2, lz: -.55, le: -1.2, hy: -.5, crouch: .25 },
  volBack: { cy: -.45, cx: .3, rx: -.9, rz: -.65, re: -.85, lx: -.9, lz: .4, le: -.7, hy: -.2, crouch: .6 },
  volHit: { cy: .05, cx: .3, rx: -1.35, rz: -.3, re: -.55, lx: -.7, lz: .5, le: -.8, hy: 0, crouch: .55 },
  toss: { cy: -.65, cx: -.15, rx: -.35, rz: -1.55, re: -2.1, lx: -3.0, lz: .15, le: -.05, hy: -.3, crouch: .55 },
  svHit: { cy: .2, cx: -.05, rx: -2.95, rz: -.2, re: -.1, lx: -1.0, lz: .3, le: -.6, hy: 0, crouch: 0 },
  svFollow: { cy: .85, cx: .45, rx: -.6, rz: .6, re: -.5, lx: -.4, lz: .5, le: -.6, hy: .3, crouch: .3 },
  cheer: { cy: 0, cx: -.1, rx: -2.9, rz: -.4, re: -.2, lx: -2.9, lz: .4, le: -.2, hy: 0, crouch: 0 },
};
function pose(p, target, k) { for (const key in target) p.cur[key] = lerp(p.cur[key], target[key], k); applyPose(p, 0, 0); }
function blendPoses(a, b, t) { const o = {}; for (const k in a) o[k] = lerp(a[k], b[k], t); return o; }
function applyPose(p, runPhase, runAmt) {
  const c = p.cur;
  p.chest.rotation.set(c.cx * .5, c.cy, 0);
  p.hips.rotation.set(c.cx * .5, c.hy, 0);
  p.shR.rotation.set(c.rx, 0, c.rz); p.elR.rotation.set(c.re, 0, 0);
  p.shL.rotation.set(c.lx, 0, c.lz); p.elL.rotation.set(c.le, 0, 0);
  const cr = c.crouch, s = Math.sin(runPhase);
  p.hips.position.y = .98 - cr * .12 - runAmt * .03 * Math.abs(Math.cos(runPhase));
  p.hpR.rotation.x = -cr * .6 - s * .8 * runAmt; p.knR.rotation.x = cr * 1.1 + Math.max(0, s) * 1.2 * runAmt;
  p.hpL.rotation.x = -cr * .6 + s * .8 * runAmt; p.knL.rotation.x = cr * 1.1 + Math.max(0, -s) * 1.2 * runAmt;
}
const SWINGS = {
  fh: [['fhHit', 0], ['fhFollow', .55], ['ready', 1]],
  bh: [['bhHit', 0], ['bhFollow', .55], ['ready', 1]],
  vol: [['volHit', 0], ['volHit', .4], ['ready', 1]],
  sv: [['svHit', 0], ['svFollow', .5], ['ready', 1]],
};

/* ================================================================
   The ball and its physics
   ================================================================ */
const G_ACC = 9.81, KD = .017, KM = .0106;
const UP = new THREE.Vector3(0, 1, 0);
const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(.058, 24, 16), std(0xffffff, { roughness: .9, map: canvasTex(256, 128, (g, w, h) => {
  g.fillStyle = '#d8f02a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,255,200,.25)' : 'rgba(120,140,0,.15)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.beginPath();
  for (let x = 0; x <= w; x += 2) { const y = h / 2 + Math.sin(x / w * TAU * 2) * h * .28; x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
}) }));
ballMesh.castShadow = true; scene.add(ballMesh);
const ballShadow = new THREE.Mesh(new THREE.CircleGeometry(.07, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35, depthWrite: false }));
ballShadow.rotation.x = -Math.PI / 2; scene.add(ballShadow);
const trailN = 14, trailPos = new Float32Array(trailN * 3);
const trail = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(trailPos, 3)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 }));
trail.frustumCulled = false; scene.add(trail);
const markMat = new THREE.MeshBasicMaterial({ color: 0x7a3a1a, transparent: true, opacity: .45, depthWrite: false });
const marks = [];
const aimMarker = new THREE.Mesh(new THREE.RingGeometry(.22, .32, 24), new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: .9, depthWrite: false }));
aimMarker.rotation.x = -Math.PI / 2; aimMarker.position.y = .01; aimMarker.visible = false; scene.add(aimMarker);

function newBall() { return { p: new THREE.Vector3(), v: new THREE.Vector3(), w: new THREE.Vector3(), held: true }; }
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
/* One physics step. Returns 'bounce' when it bounced this step. */
function stepBall(b, dt, surf) {
  const v = b.v, sp = v.length();
  tmpA.copy(b.w).cross(v).multiplyScalar(KM * sp);              // Magnus
  v.x += (-KD * sp * v.x + tmpA.x) * dt;
  v.y += (-G_ACC - KD * sp * v.y + tmpA.y) * dt;
  v.z += (-KD * sp * v.z + tmpA.z) * dt;
  b.p.addScaledVector(v, dt);
  if (b.p.y < BALL_R && v.y < 0) { b.p.y = BALL_R; bounceBall(b, surf); return 'bounce'; }
  return null;
}
function bounceBall(b, surf) {
  const v = b.v, h = Math.hypot(v.x, v.z) || 1, dx = v.x / h, dz = v.z / h;
  tmpB.set(dx, 0, dz); tmpA.copy(UP).cross(tmpB);              // the topspin axis for this direction
  const top = clamp(b.w.dot(tmpA), -1, 1);
  v.y = -v.y * surf.e * (1 + .2 * top);
  let f = surf.f + (top < 0 ? -top * .1 : 0);
  v.x *= f; v.z *= f;
  if (top > 0) { v.x += dx * top * 1.1 * surf.kick; v.z += dz * top * 1.1 * surf.kick; v.y += top * .3 * surf.kick; }
  b.w.multiplyScalar(.55);
}
/* Launch velocity that lands the ball at target T from contact P,
   with horizontal speed V and spin (top: + topspin, - slice; side). */
function spinVector(dx, dz, top, side) { tmpB.set(dx, 0, dz).normalize(); return new THREE.Vector3().copy(UP).cross(tmpB).multiplyScalar(top).addScaledVector(UP, side); }
function simulate(p0, v0, w, surf, until) {
  const b = { p: p0.clone(), v: v0.clone(), w: w.clone() }, out = { land: null, netY: null, netX: 0 };
  let prevZ = b.p.z;
  for (let i = 0; i < 480; i++) {
    const e = stepBall(b, 1 / 120, surf);
    if ((prevZ > 0) !== (b.p.z > 0) && out.netY == null) { out.netY = b.p.y; out.netX = b.p.x; }
    prevZ = b.p.z;
    if (e === 'bounce') { out.land = b.p.clone(); out.t = i / 120; break; }
  }
  return out;
}
function solveShot(P, T, V, top, side, surf, vyLo, vyHi) {
  const d = new THREE.Vector3(T.x - P.x, 0, T.z - P.z), dist = d.length(); d.normalize();
  const w = spinVector(d.x, d.z, top, side);
  let lo = vyLo, hi = vyHi, best = null;
  for (let k = 0; k < 22; k++) {
    const vy = (lo + hi) / 2, v0 = new THREE.Vector3(d.x * V, vy, d.z * V);
    const r = simulate(P, v0, w, surf);
    const got = r.land ? (r.land.x - P.x) * d.x + (r.land.z - P.z) * d.z : 1e9;
    best = { v: v0, w, sim: r };
    if (got < dist) lo = vy; else hi = vy;
  }
  return best;
}
/* Solve, and make sure it clears the net: if not, slow it down. */
function planShot(P, T, V, top, side, surf, opts) {
  let s = null;
  for (let k = 0; k < 6; k++) {
    s = solveShot(P, T, V, top, side, surf, opts.lo, opts.hi);
    const n = s.sim;
    if (n.netY == null || n.netY > netH(n.netX) + (opts.margin || .25)) break;
    V *= .9;
  }
  return s;
}

/* ================================================================
   Game state
   ================================================================ */
const ME = 0, AI = 1;
const sideSign = i => i === ME ? 1 : -1;
const G = { mode: 'title', paused: false, t: 0 };
let M = null;          // the match in progress
let me = null, opp = null;
const ball = newBall();
const input = { jx: 0, jz: 0, press: null, pressT: -9, keys: {} };

function playerColors() { return { shirt: COLORS[save.color], shorts: save.color === 6 ? 0xffffff : 0x1a1a2a, skin: 0xf0c8a0, hair: 0x5a3a1a, band: save.color === 6 ? 0x2a7aff : 0xffffff, frame: 0x1a1a1a }; }
function makeAthlete(colors) {
  const p = makePlayer(colors); scene.add(p.root);
  return Object.assign(p, { pos: new THREE.Vector3(), vel: new THREE.Vector3(), target: null, runPh: 0, swing: null, prep: null, face: 0 });
}
function removeAthlete(a) { if (a) scene.remove(a.root); }

/* ---------------------------- scoring ---------------------------- */
const CALL = ['love', 'fifteen', 'thirty', 'forty'], SHOW = ['0', '15', '30', '40'];
function newMatch(cfg) {
  return Object.assign({ pts: [0, 0], games: [0, 0], sets: [], setsWon: [0, 0], server: ME, serveNo: 1, tb: false, tbPts: [0, 0], over: false, stats: { aces: [0, 0], winners: [0, 0], df: [0, 0] } }, cfg);
}
function scoreText() {
  if (M.tb) return [String(M.tbPts[0]), String(M.tbPts[1])];
  const [a, b] = M.pts;
  if (a >= 3 && b >= 3) { if (a === b) return ['40', '40']; return a > b ? ['AD', ''] : ['', 'AD']; }
  return [SHOW[Math.min(a, 3)], SHOW[Math.min(b, 3)]];
}
function scoreCall() {
  const nm = i => i === ME ? save.name : M.oppName.split(' ').pop();
  if (M.tb) { const s = M.server; return M.tbPts[s] + ', ' + M.tbPts[1 - s]; }
  const s = M.server, a = M.pts[s], b = M.pts[1 - s];
  if (a >= 3 && b >= 3) return a === b ? 'Deuce' : 'Advantage ' + nm(a > b ? s : 1 - s);
  if (a === b) return CALL[a] + ' all';
  return CALL[a] + ' ' + CALL[b];
}
function pointTotal() { return M.tb ? M.tbPts[0] + M.tbPts[1] : M.pts[0] + M.pts[1]; }
function isDeuceSide() { return pointTotal() % 2 === 0; }
function awardPoint(w, why) {
  if (M.over) return;
  const L = 1 - w, nm = i => i === ME ? save.name : M.oppName.split(' ').pop();
  let said = '';
  if (M.tb) {
    M.tbPts[w]++;
    const tot = M.tbPts[0] + M.tbPts[1];
    if (tot % 2 === 1) M.server = 1 - M.server;      // tiebreak: change server after the first point, then every two
    if (M.tbPts[w] >= 7 && M.tbPts[w] - M.tbPts[L] >= 2) { M.games[w]++; return winSet(w); }
  } else {
    M.pts[w]++;
    const a = M.pts[w], b = M.pts[L];
    if (a >= 4 && a - b >= 2) {
      M.games[w]++; M.pts = [0, 0];
      const gw = M.games[w], gl = M.games[L];
      if (gw >= M.gamesTo && gw - gl >= 2) return winSet(w);
      if (gw === M.gamesTo && gl === M.gamesTo) { M.tb = true; M.tbPts = [0, 0]; }
      M.server = 1 - M.server; M.serveNo = 1;
      said = 'Game, ' + nm(w) + '.' + (M.tb ? ' Tiebreak.' : '');
      flash(w === ME ? 'GAME!' : 'Game ' + nm(w), w === ME ? '#7ee0a8' : '#ffffff');
      updateBoard(); return nextPoint(said, 2.2);
    }
  }
  M.serveNo = 1;
  updateBoard();
  nextPoint(why ? why + ' ' + scoreCall() : scoreCall(), 1.6);
}
function winSet(w) {
  M.sets.push([M.games[0], M.games[1]]); M.setsWon[w]++;
  if (M.setsWon[w] >= M.setsTo) {
    M.over = true; updateBoard();
    const nm = w === ME ? save.name : M.oppName;
    umpire('Game, set and match, ' + nm + '.');
    flash(w === ME ? 'MATCH WON!' : 'Match over', w === ME ? '#ffd34d' : '#ffffff');
    SFX.clap(true); if (crowd) crowd.cheer = 4;
    G.endT = 3.2; G.winner = w;
    return;
  }
  M.games = [0, 0]; M.pts = [0, 0]; M.tb = false; M.tbPts = [0, 0]; M.server = 1 - M.server; M.serveNo = 1;
  updateBoard(); nextPoint('Game and set, ' + (w === ME ? save.name : M.oppName.split(' ').pop()) + '.', 2.4);
}
function updateBoard() {
  $('nm0').textContent = save.name; $('nm1').textContent = M.oppName.split(' ').pop();
  $('sv0').textContent = M.server === ME ? '●' : ''; $('sv1').textContent = M.server === AI ? '●' : '';
  const cols = ['a', 'b', 'c'];
  for (let i = 0; i < 2; i++) {
    cols.forEach((c, k) => { const s = M.sets[k]; $('s' + i + c).textContent = s ? s[i] : (k === M.sets.length ? M.games[i] : ''); });
    $('pt' + i).textContent = scoreText()[i];
  }
}

/* ---------------------------- points ---------------------------- */
let P = null;   // the point in progress
function nextPoint(said, delay) {
  if (said) umpire(said);
  P = Object.assign(P || {}, { state: 'between', wait: delay || 1.5 });
}
function setupPoint() {
  const deuce = isDeuceSide(), s = M.server, ss = sideSign(s);
  P = { state: 'serveReady', wait: s === AI ? rnd(1.0, 1.6) : 0, lastHitter: -1, bounces: 0, serve: true, let: false, crossed: false, dead: false, t: 0, serveType: null, serveNo: M.serveNo, hitT: 0 };
  opp.charge = false; opp.swingDone = false;
  // the server stands just beside the centre mark: on their right in the deuce court, their left in the ad court
  const server = s === ME ? me : opp, recv = s === ME ? opp : me;
  server.pos.set(ss * (deuce ? .75 : -.75), 0, ss * (HALF_L + .3));
  // the receiver stands diagonally across, a little behind the baseline
  const rs = -ss, boxSign = deuce ? -ss : ss;
  recv.pos.set(boxSign * 2.7, 0, rs * (HALF_L + (M.surf === 'clay' ? 1.6 : .9)));
  if (recv === opp && opp.style === 'net') opp.pos.z = rs * (HALF_L + .4);
  me.target = null; opp.target = null; me.swing = opp.swing = null; me.prep = opp.prep = null;
  ball.held = true; ball.v.set(0, 0, 0); ball.w.set(0, 0, 0);
  P.boxSign = boxSign;
  aimMarker.position.set(boxSign * 2.2, .01, -ss * 4.6);
  if (s === ME) { aimMarker.visible = true; setServeButtons(true); hint(D.auto ? 'Tap the box to aim, then tap a serve' : 'Aim with the joystick or tap the box, then tap a serve'); }
  else { aimMarker.visible = false; setServeButtons(false); hint(''); }
  if (s === ME && M.serveNo === 2) hint('Second serve: tap the box, then a serve');
}
function inBox(x, z) {
  const ss = sideSign(M.server);
  const xr = x * P.boxSign, zr = z * -ss;
  return xr >= -BALL_R && xr <= HALF_W + BALL_R && zr >= -BALL_R && zr <= SERVICE + BALL_R;
}
function inCourt(x, z) { return Math.abs(x) <= HALF_W + BALL_R && Math.abs(z) <= HALF_L + BALL_R; }
function endPoint(winner, why, say) {
  if (P.dead) return;
  if (GST.log) GST.log.push(['end', winner, why, 'ball', +ball.p.x.toFixed(2), +ball.p.z.toFixed(2), 'me', +me.pos.x.toFixed(2), +me.pos.z.toFixed(2), 'opp', +opp.pos.x.toFixed(2), +opp.pos.z.toFixed(2), 'tgt', opp.target ? +opp.target.x.toFixed(2) : null, opp.target ? +opp.target.z.toFixed(2) : null]);
  P.dead = true; P.deadT = 1.1;
  P.winner = winner; P.why = say || '';
  aimMarker.visible = false; $('meter').classList.add('hide');
  if (why) flash(why, winner === ME ? '#7ee0a8' : '#ff8a8a');
  if (winner === ME) { SFX.clap(false); if (crowd) crowd.cheer = 1.6; } else if (why === 'Out!' || why === 'Net') SFX.groan();
}

/* ---------------------------- serving ---------------------------- */
const SERVE = { flat: { V: 50, top: .12, side: 0, nm: 'Flat serve' }, slice: { V: 43, top: .1, side: .6, nm: 'Slice serve' }, kick: { V: 35, top: .85, side: -.25, nm: 'Kick serve' } };
function startToss(type) {
  if (P.state !== 'serveReady') return;
  const server = M.server === ME ? me : opp;
  P.state = 'toss'; P.serveType = type; P.tossT = 0;
  ball.held = false; ball.w.set(0, 0, 0);
  ball.p.copy(server.pos).add(new THREE.Vector3(-sideSign(M.server) * .25, 1.5, -sideSign(M.server) * .25));
  ball.v.set(0, 5.6, 0);
  if (M.server === ME) { $('meter').classList.remove('hide'); hint('Tap again when the bar is in the green'); setShotButtons(false); }
}
function hitServe(power) {
  if (P.state !== 'toss') return;
  const s = M.server, server = s === ME ? me : opp, ss = sideSign(s), ty = SERVE[P.serveType];
  const C = server.pos.clone().add(new THREE.Vector3(0, 2.72, -ss * .35));
  // the meter: green (.78-.94) is a clean serve; past it is long, short of it is soft and loose
  const good = power >= .78 && power <= .94;
  const speedK = s === ME ? clamp(.62 + .42 * power, .6, 1.02) : clamp(D.aiPow * (M.skill || 1) * rnd(.9, 1.02), .6, 1.05);
  const T = s === ME ? aimMarker.position.clone() : aiServeTarget();
  let noise = s === ME ? (good ? .22 : .35 + Math.abs(power - .86) * 2.2) : .28;
  if (s === ME && power > .94) T.z += -ss * (power - .94) * 9;      // overhit: long
  if (s === ME && power < .6) T.z += ss * (.6 - power) * 4;          // too soft: short, maybe the net
  if (s === AI && Math.random() > (P.serveNo === 1 ? D.serveIn * (M.serveIn || 1) : .93)) {
    // a missed serve: long or wide
    if (Math.random() < .5) T.z += -ss * rnd(.5, 1.4); else T.x += P.boxSign * rnd(.6, 1.3);
  }
  T.x += gauss() * noise; T.z += gauss() * noise * .8;
  const plan = planShot(C, T, ty.V * speedK, ty.top, ty.side, SURF[M.surf], { lo: -14, hi: 4, margin: .06 });
  ball.p.copy(C); ball.v.copy(plan.v); ball.w.copy(plan.w);
  P.state = 'rally'; P.lastHitter = s; P.bounces = 0; P.serve = true; P.crossed = false; P.prevZ = ball.p.z; P.hitT = G.t;
  server.swing = { kind: 'sv', u: 0 }; server.prep = null;
  if (s === AI && opp.style === 'net' && P.serveNo === 1 && Math.random() < .5) opp.charge = true;
  SFX.hit(1); trailReset();
  shotLabel(ty.nm + ' · ' + Math.round(plan.v.length() * 2.237) + ' mph');
  aimMarker.visible = false; $('meter').classList.add('hide'); hint(''); setServeButtons(false); setShotButtons(true);
}
function aiServeTarget() {
  const ss = sideSign(M.server), bs = P.boxSign, r = Math.random();
  const x = r < .4 ? bs * 3.5 : r < .7 ? bs * .45 : bs * 1.9;   // wide, T or body
  return new THREE.Vector3(x, 0, -ss * rnd(5.0, 5.9));
}

/* ---------------------------- hitting ---------------------------- */
const SHOT = { top: { V: 30, top: .8, side: 0, nm: 'Topspin', lo: -8, hi: 14 }, slice: { V: 25, top: -.6, side: 0, nm: 'Slice', lo: -8, hi: 12 }, lob: { V: 13, top: .45, side: 0, nm: 'Lob', lo: 3, hi: 22 } };
function contactPoint(a, ballX) {
  // forehand on the right-handed side: near player's right is +x, far player's right is -x
  const ss = sideSign(a === me ? ME : AI), fh = (ballX - a.pos.x) * ss >= 0;
  return fh;
}
function hitBall(who, type, timing, aimX) {
  const a = who === ME ? me : opp, ss = sideSign(who), sh = SHOT[type];
  const fh = contactPoint(a, ball.p.x);
  const volley = P.bounces === 0;
  // where to: deep into the other half, across or down the line
  const depth = type === 'lob' ? 10.6 : type === 'slice' ? rnd(7.6, 9.6) : rnd(8.4, 10.4);
  let tx;
  if (who === ME) {
    if (Math.abs(aimX) > .3) tx = aimX * 3.2;
    else { const cross = timing > .55; const fromX = ball.p.x; tx = cross ? -Math.sign(fromX || 1) * 2.9 : Math.sign(fromX || 1) * 2.9; if (Math.abs(fromX) < .8) tx = (timing - .5) * 5; }
  } else tx = aiAimX();
  let dep = depth;
  if (who === AI && type === 'top' && Math.random() < .22 * D.aim) { dep = rnd(5.6, 7.2); tx = Math.sign(tx || 1) * rnd(3.4, 3.9); }   // a sharp short angle
  const T = new THREE.Vector3(tx, 0, -ss * dep);
  // errors: timing, reach and difficulty
  // your shot: clean in the middle of the timing window, looser at the very start or end, and on the stretch
  const q = who === ME ? clamp(1 - Math.abs(timing - .5) * (save.diff === 'easy' ? .5 : 1.1), .4, 1) : 1;
  const reachNow = Math.abs(ball.p.x - a.pos.x) / (who === ME ? D.reach : 1.7);
  const err = who === ME ? (save.diff === 'easy' ? .3 : .42) + (1 - q) * 1.7 + Math.max(0, reachNow - .6) * .8 : D.noise * (M.noise || 1) * (type === 'lob' ? 1.2 : 1);
  T.x += gauss() * err; T.z += gauss() * err * .9;
  let V = sh.V * (who === ME ? 1 : D.aiPow * (M.skill || 1)) * (volley && type !== 'lob' ? .8 : 1);
  if (M.surf === 'clay' && type === 'top') V *= .95;
  const C = ball.p.clone();
  // the computer's unforced errors: more likely deep in a rally and at full stretch
  if (who === AI) {
    P.rally = (P.rally || 0) + 1;
    const stretch = Math.abs(ball.p.x - opp.pos.x) / 1.6;
    const uf = D.noise * .12 * (M.noise || 1) / (M.skill || 1) * (1 + P.rally * .06) * (1 + stretch);
    if (Math.random() < uf) { if (Math.random() < .55) T.z += -ss * rnd(.8, 2.2); else T.x = Math.sign(T.x || 1) * (HALF_W + rnd(.3, 1.4)); }
  }
  const plan = planShot(C, T, V, sh.top * (volley ? .3 : 1), sh.side, SURF[M.surf], { lo: sh.lo, hi: sh.hi, margin: type === 'lob' ? 1.2 : .45 });
  ball.v.copy(plan.v); ball.w.copy(plan.w);
  if (GST.log) GST.log.push(['hit', who, type, +C.x.toFixed(2), +C.y.toFixed(2), +C.z.toFixed(2), 'T', +T.x.toFixed(2), +T.z.toFixed(2), 'land', plan.sim.land ? +plan.sim.land.x.toFixed(2) : null, plan.sim.land ? +plan.sim.land.z.toFixed(2) : null]);
  P.lastHitter = who; P.bounces = 0; P.serve = false; P.crossed = false; P.prevZ = ball.p.z; P.hitT = G.t;
  if (who === ME) { opp.swingDone = false; P.meX = me.pos.x; }
  a.swing = { kind: volley ? 'vol' : fh ? 'fh' : 'bh', u: 0, mirror: !fh && volley }; a.prep = null;
  SFX.hit(q); trailReset();
  shotLabel((who === ME ? '' : M.oppName.split(' ').pop() + ': ') + sh.nm + ' ' + (volley ? 'volley' : fh ? 'forehand' : 'backhand') + ' · ' + Math.round(plan.v.length() * 2.237) + ' mph');
  if (who === AI && opp.style === 'net' && !volley && T.z * -ss > 8.5 && Math.random() < .4) opp.charge = true;   // follows a deep approach in
}
function aiAimX() {
  const k = clamp(D.aim * (.85 + .15 * (M.skill || 1)), 0, 1);
  // the open court: away from where you hit your last shot from (you are still getting back)
  const from = P.meX != null ? P.meX : me.pos.x;
  const away = from > 0 ? -1 : 1;
  return clamp(away * rnd(1.8, 3.7) * k + rnd(-1, 1) * (1 - k), -3.7, 3.7);
}

/* Where will the ball be when this player can hit it? */
function predictHit(who) {
  const ss = sideSign(who), a = who === ME ? me : opp;
  const b = { p: ball.p.clone(), v: ball.v.clone(), w: ball.w.clone() };
  let bounces = P.bounces, best = null, rise = null;
  const atNet = Math.abs(a.pos.z) < 6.5;
  for (let i = 0; i < 360; i++) {
    const e = stepBall(b, 1 / 120, SURF[M.surf]);
    if (e === 'bounce') { bounces++; if (bounces >= 2) break; }
    if (b.p.z * ss <= .5) continue;
    if (atNet && bounces === 0 && !P.serve && b.p.y < 2.2 && b.p.y > .4 && b.p.z * ss >= Math.abs(a.pos.z) - .3) { best = { x: b.p.x, z: b.p.z, t: i / 120 }; break; }
    if (bounces === 1) {
      const pt = { x: b.p.x, z: b.p.z, t: i / 120 };
      if (!rise && b.p.y > .35 && b.p.y < 1.6) rise = pt;                 // first comfortable height, on the rise
      if (b.v.y < 0 && b.p.y < 1.3) { best = b.p.z * ss <= HALF_L + 2.2 ? pt : (rise || pt); break; }   // dropping: ideal, unless that is miles back
      if (b.p.z * ss > HALF_L + 2.2 && rise) { best = rise; break; }
      if (b.p.z * ss > HALF_L + 4) { best = pt; break; }
    }
  }
  return best || rise;
}
function standSpot(a, who, hp) {
  const ss = sideSign(who), off = .72;
  const fx = hp.x - ss * off, bx = hp.x + ss * off;     // standing so the ball is on the forehand (or backhand) side
  const x = Math.abs(fx - a.pos.x) <= Math.abs(bx - a.pos.x) + .6 ? fx : bx;
  return new THREE.Vector3(clamp(x, -9, 9), 0, clamp(hp.z + ss * .25, -17, 17));
}

/* ================================================================
   Input: joystick, shot buttons, keyboard, tap-to-aim the serve
   ================================================================ */
const pad = $('pad'), knob = $('knob');
let padId = null;
function padMove(e) {
  const r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2);
  const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
  input.jx = dx; input.jz = dy;
  knob.style.transform = `translate(${dx * r.width * .32}px, ${dy * r.height * .32}px)`;
}
pad.addEventListener('pointerdown', e => { padId = e.pointerId; pad.setPointerCapture(e.pointerId); padMove(e); ac(); });
pad.addEventListener('pointermove', e => { if (e.pointerId === padId) padMove(e); });
const padEnd = e => { if (e.pointerId !== padId) return; padId = null; input.jx = input.jz = 0; knob.style.transform = ''; };
pad.addEventListener('pointerup', padEnd); pad.addEventListener('pointercancel', padEnd);
function press(type) {
  ac();
  if (!M || G.paused || G.mode !== 'play' || !P) return;
  if (M.server === ME && P.state === 'serveReady') return startToss({ top: 'flat', slice: 'slice', lob: 'kick' }[type]);
  if (M.server === ME && P.state === 'toss') return hitServe(meterVal());
  if (P.state === 'rally' && !P.dead) { input.press = type; input.pressT = G.t; if (!me.swing) me.prep = type; }
}
for (const [id, t] of [['bTop', 'top'], ['bSlice', 'slice'], ['bLob', 'lob']]) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); press(t); });
  const off = () => b.classList.remove('on'); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
}
function setServeButtons(on) {
  $('bTop').querySelector('span').innerHTML = on ? '<b>⚡</b>FLAT' : '<b>⟳</b>TOPSPIN';
  $('bSlice').querySelector('span').innerHTML = on ? '<b>↪</b>SLICE' : '<b>↘</b>SLICE';
  $('bLob').querySelector('span').innerHTML = on ? '<b>⤒</b>KICK' : '<b>⤴</b>LOB';
}
function setShotButtons(on) { $('shots').style.opacity = on ? 1 : .55; }
addEventListener('keydown', e => {
  input.keys[e.key.toLowerCase()] = true;
  const k = e.key.toLowerCase();
  if (k === 'j' || k === ' ') { e.preventDefault(); press('top'); }
  if (k === 'k') press('slice');
  if (k === 'l') press('lob');
  if (k === 'escape' || k === 'p') togglePause();
});
addEventListener('keyup', e => { input.keys[e.key.toLowerCase()] = false; });
// tap the far court to aim the serve
const ray = new THREE.Raycaster(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitPt = new THREE.Vector3();
canvas.addEventListener('pointerdown', e => {
  ac();
  if (!M || !P || G.mode !== 'play' || M.server !== ME || P.state !== 'serveReady') return;
  aimAt(e);
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => { if (e.buttons && M && P && M.server === ME && P.state === 'serveReady') aimAt(e); });
function aimAt(e) {
  const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
  if (!ray.ray.intersectPlane(groundPlane, hitPt)) return;
  clampAim(hitPt.x, hitPt.z);
}
function clampAim(x, z) {
  const ss = sideSign(M.server), bs = P.boxSign;
  aimMarker.position.x = bs * clamp(x * bs, .25, HALF_W - .25);
  aimMarker.position.z = -ss * clamp(z * -ss, 1.2, SERVICE - .25);
}
function meterVal() { const t = P.tossT / .55; return t <= 1 ? t : Math.max(0, 2 - t); }

/* ================================================================
   The frame loop
   ================================================================ */
let last = performance.now();
const camPos = new THREE.Vector3(0, 7, 21), camLook = new THREE.Vector3(0, 0, -4);
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w / h < 1 ? 58 : 42; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(.05, (now - last) / 1000); last = now;
  if (G.mode === 'play' && !G.paused) {
    const dt = rdt * D.sim;
    G.t += dt;
    for (let i = 0; i < 2; i++) update(dt / 2);
  } else if (G.mode === 'menu') { G.t += rdt * .3; }
  animateCrowd(rdt);
  updateCamera(rdt);
  renderer.render(scene, camera);
}

function update(dt) {
  if (!M || !P) return;
  if (G.endT != null) { G.endT -= dt; idleAnims(dt); if (G.endT <= 0) { G.endT = null; finishMatch(G.winner); } return; }
  P.t += dt;
  if (P.state === 'between') { P.wait -= dt; idleAnims(dt); if (P.wait <= 0) setupPoint(); return; }

  // ---- serve preparation ----
  if (P.state === 'serveReady') {
    if (M.server === AI) { P.wait -= dt; if (P.wait <= 0) startToss(aiServeType()); }
    else if (!D.auto && (Math.abs(input.jx) > .2 || Math.abs(input.jz) > .2)) clampAim(aimMarker.position.x + input.jx * dt * 5, aimMarker.position.z + input.jz * dt * 5);
    holdBall(); idleAnims(dt); return;
  }
  if (P.state === 'toss') {
    P.tossT += dt;
    stepBall(ball, dt, SURF[M.surf]);
    const server = M.server === ME ? me : opp;
    pose(server, POSES.toss, Math.min(1, dt * 8)); applyPose(server, 0, 0);
    if (M.server === ME) { $('meter').querySelector('.fill').style.width = (meterVal() * 100) + '%'; }
    else if (P.tossT >= P.aiHitAt) hitServe(.86);
    if (P.tossT > 1.25) { P.state = 'serveReady'; P.wait = .6; if (M.server === ME) { $('meter').classList.add('hide'); hint('Re-toss: tap a serve'); setServeButtons(true); setShotButtons(true); } }
    animateOther(dt); return;
  }

  // ---- rally ----
  const prevZ = ball.p.z;
  const ev = stepBall(ball, dt, SURF[M.surf]);
  // the net
  if (!P.crossed && (prevZ > 0) !== (ball.p.z > 0)) {
    const h = netH(ball.p.x);
    if (Math.abs(ball.p.x) < NET_POST + .1 && ball.p.y < h + BALL_R) {
      SFX.net();
      if (P.serve && ball.p.y > h - .07 && !P.dead) { P.let = true; ball.v.multiplyScalar(.35); P.crossed = true; }
      else { ball.v.set(ball.v.x * .2, Math.abs(ball.v.y) * .2, -ball.v.z * .15); ball.p.z = prevZ > 0 ? .06 : -.06; if (!P.dead) netFault(); }
    } else P.crossed = true;
  }
  if (ev === 'bounce') {
    SFX.bounce(M.surf);
    if (M.surf === 'clay') addMark(ball.p.x, ball.p.z);
    if (!P.dead) onBounce();
  }
  if (!P.dead && P.bounces === 0 && (Math.abs(ball.p.z) > HALF_L + 6 || Math.abs(ball.p.x) > 13)) {
    // flew out without bouncing: out
    endPoint(P.lastHitter === ME ? AI : ME, 'Out!', 'Out.');
  }
  // hitting
  if (!P.dead) tryHits(dt);
  movePlayers(dt);
  if (P.dead) {
    P.deadT -= dt;
    if (P.deadT <= 0) {
      if (P.restart) { P.state = 'between'; P.wait = .25; P.dead = false; P.restart = false; }
      else { const w = P.winner; P.dead = false; awardPoint(w, P.why); }
    }
  }
  updateBallVisual(dt);
}
function aiServeType() {
  const r = Math.random();
  P.aiHitAt = rnd(.5, .58);
  if (P.serveNo === 2) return r < .75 ? 'kick' : 'slice';
  if (opp.style === 'serve') return r < .6 ? 'flat' : 'slice';
  return r < .45 ? 'flat' : r < .75 ? 'slice' : 'kick';
}
function netFault() {
  if (P.serve) return fault();
  endPoint(1 - P.lastHitter, 'Net', '');
}
function fault() {
  aimMarker.visible = false;
  if (M.serveNo === 1) {
    flash('Fault', '#ffffff'); umpire('Fault.');
    M.serveNo = 2;
    return replay(1.1);
  }
  M.stats.df[M.server]++;
  flash('Double fault', M.server === ME ? '#ff8a8a' : '#7ee0a8');
  P.dead = true; P.deadT = 1.0; P.winner = 1 - M.server; P.why = 'Double fault.';
}
/* Serve again (after a fault or a let): the ball plays out, then the server goes again. */
function replay(t) { P.dead = true; P.deadT = t; P.restart = true; }
function onBounce() {
  const x = ball.p.x, z = ball.p.z, hitterSide = sideSign(P.lastHitter);
  if (GST.log) GST.log.push(['bounce', P.lastHitter, +x.toFixed(2), +z.toFixed(2), P.bounces]);
  if (P.bounces === 0) {
    if (P.serve) {
      if (!inBox(x, z)) return fault();
      if (P.let) { flash('Let', '#ffffff'); umpire('Let.'); return replay(1.1); }
      P.bounces = 1; return;
    }
    if (z * hitterSide > 0) return endPoint(1 - P.lastHitter, 'Net', '');      // bounced on their own side
    if (!inCourt(x, z)) return endPoint(1 - P.lastHitter, 'Out!', 'Out.');
    P.bounces = 1; return;
  }
  // second bounce: the hitter wins the point
  const w = P.lastHitter;
  if (P.serve) { M.stats.aces[w]++; endPoint(w, 'ACE!', 'Ace.'); }
  else { M.stats.winners[w]++; endPoint(w, w === ME ? 'WINNER!' : '', ''); }
}
/* Reaching for the ball */
function canReach(a, who) {
  const ss = sideSign(who);
  if (P.lastHitter === who || P.lastHitter < 0) return false;
  if (ball.v.z * ss <= 0 || ball.p.z * ss < .3) return false;
  if (P.serve && P.bounces === 0) return false;            // the serve must bounce
  if (P.bounces >= 2) return false;
  // at the net a player lunges for the volley, so reaches further
  const reach = (who === ME ? D.reach : 1.55 + (M.skill || 1) * .2) + (Math.abs(a.pos.z) < 7 ? .6 : 0);
  const dx = ball.p.x - a.pos.x, dz = (ball.p.z - a.pos.z) * ss;
  // beside the player, from a little in front to a little behind
  return Math.abs(dx) < reach && dz > -1.0 && dz < .45 && ball.p.y < 2.8 && ball.p.y > .12;
}
function tryHits(dt) {
  // you
  if (canReach(me, ME)) {
    const since = G.t - input.pressT;
    if (input.press && since <= D.win) {
      const timing = clamp(since / D.win, 0, 1);
      hitBall(ME, input.press, timing, input.jx);
      input.press = null;
    }
  }
  if (GST.log && P.lastHitter === ME && !P.passLogged && (ball.p.z - opp.pos.z) * -1 > .45 && ball.v.z < 0) { P.passLogged = true; GST.log.push(['pass', 'dx', +(ball.p.x - opp.pos.x).toFixed(2), 'y', +ball.p.y.toFixed(2), 'bounces', P.bounces, 'opp', +opp.pos.x.toFixed(2), +opp.pos.z.toFixed(2), 'tgt', opp.target ? +opp.target.x.toFixed(2) : null, opp.target ? +opp.target.z.toFixed(2) : null, 'swingDone', !!opp.swingDone]); }
  // the computer
  if (canReach(opp, AI) && !opp.swingDone) {
    const style = opp.style, atNet = Math.abs(opp.pos.z) < 6.5, meNet = Math.abs(me.pos.z) < 7;
    let type = 'top';
    if (meNet && Math.random() < .45) type = 'lob';
    else if (style === 'counter' && Math.random() < .3) type = 'slice';
    else if (P.bounces === 1 && ball.p.y < .55 && Math.random() < .5) type = 'slice';
    else if (style === 'clay') type = 'top';
    if (atNet) type = Math.random() < .2 ? 'lob' : 'top';
    // a ball at full stretch is sometimes too much
    const stretch = Math.hypot(ball.p.x - opp.pos.x, ball.p.z - opp.pos.z) / 1.6;
    if (stretch > .85 && Math.random() < .25 * (1.2 - (M.skill || 1)) * dt * 60) { opp.swingDone = true; return; }
    hitBall(AI, type, .5, 0);
  }
}
function holdBall() {
  const server = M.server === ME ? me : opp;
  server.handL.getWorldPosition(ball.p); ball.p.y = Math.max(ball.p.y, .3);
  updateBallVisual(0);
}

/* ---------------------------- movement ---------------------------- */
function movePlayers(dt) {
  // where each player is headed
  for (const who of [ME, AI]) {
    const a = who === ME ? me : opp, ss = sideSign(who);
    const coming = !P.dead && P.lastHitter !== who && P.lastHitter >= 0 && ball.v.z * ss > 0;
    if (who === ME && !D.auto) {
      const kx = (input.keys.arrowright || input.keys.d ? 1 : 0) - (input.keys.arrowleft || input.keys.a ? 1 : 0);
      const kz = (input.keys.arrowdown || input.keys.s ? 1 : 0) - (input.keys.arrowup || input.keys.w ? 1 : 0);
      const jx = clamp(input.jx + kx, -1, 1), jz = clamp(input.jz + kz, -1, 1);
      accel(a.vel, tmpB.set(jx, 0, jz).multiplyScalar(D.run), dt);
      a.target = null;
    } else {
      if (coming && (!a.planT || G.t - a.planT > .12)) {
        if (G.t - (P.hitT || 0) < (who === AI ? D.react : D.meReact)) { /* still reacting */ } else {
          const hp = predictHit(who);
          if (hp) a.target = standSpot(a, who, hp);
          a.planT = G.t;
        }
      } else if (!coming && !P.dead) {
        // recover: back to the middle of the baseline (or the net for a net-rusher)
        const home = who === AI && opp.charge ? -4.2 : ss * (HALF_L + (M.surf === 'clay' ? 1.2 : .6));
        a.target = new THREE.Vector3(clamp(-ball.p.x * .15, -1.5, 1.5), 0, home);
      }
      const spd = who === ME ? D.run : D.ai * (M.speed || 1);
      if (a.target) {
        const d = tmpA.set(a.target.x - a.pos.x, 0, a.target.z - a.pos.z), dist = d.length();
        // people accelerate and slow down; they do not teleport to full speed
        const want = dist > .05 ? d.normalize().multiplyScalar(Math.min(spd, dist * 4)) : tmpB.set(0, 0, 0);
        accel(a.vel, want, dt);
      } else accel(a.vel, tmpB.set(0, 0, 0), dt);
    }
    a.pos.addScaledVector(a.vel, dt);
    a.pos.x = clamp(a.pos.x, -9, 9);
    a.pos.z = who === ME ? clamp(a.pos.z, .8, 17) : clamp(a.pos.z, -17, -.8);
  }
  animateAthlete(me, ME, dt); animateAthlete(opp, AI, dt);
}
function accel(v, want, dt) {
  const k = 16 * dt, dx = want.x - v.x, dz = want.z - v.z, m = Math.hypot(dx, dz);
  if (m <= k) { v.x = want.x; v.z = want.z; } else { v.x += dx / m * k; v.z += dz / m * k; }
}
function idleAnims(dt) {
  for (const [a, who] of [[me, ME], [opp, AI]]) { a.vel.multiplyScalar(.85); animateAthlete(a, who, dt); }
}
function animateOther(dt) { const other = M.server === ME ? opp : me; animateAthlete(other, M.server === ME ? AI : ME, dt); }
function animateAthlete(a, who, dt) {
  const ss = sideSign(who);
  a.root.position.copy(a.pos);
  // face the ball when it is coming, otherwise the net
  const faceTo = Math.atan2(ball.p.x - a.pos.x, ball.p.z - a.pos.z);
  const base = ss > 0 ? Math.PI : 0;
  const want = P && P.state === 'rally' && ball.v.z * ss > 0 ? lerpAngle(base, faceTo, .35) : base;
  a.face = lerpAngle(a.face, want, Math.min(1, dt * 10));
  a.root.rotation.y = a.face;
  const sp = a.vel.length();
  a.runPh += dt * (6 + sp * 1.6);
  if (a.swing) {
    a.swing.u += dt / (a.swing.kind === 'sv' ? .55 : .42);
    const keys = SWINGS[a.swing.kind], u = Math.min(1, a.swing.u);
    let k = 0; while (k < keys.length - 2 && u > keys[k + 1][1]) k++;
    const [n0, t0] = keys[k], [n1, t1] = keys[k + 1];
    const t = clamp((u - t0) / (t1 - t0), 0, 1), e = t * t * (3 - 2 * t);
    a.cur = blendPoses(POSES[n0], POSES[n1], e);
    if (a.swing.u >= 1) a.swing = null;
  } else if (a.prep) {
    const fh = contactPoint(a, ball.p.x);
    const back = Math.abs(ball.p.z) < 7 && Math.abs(a.pos.z) < 7 ? POSES.volBack : fh ? POSES.fhBack : POSES.bhBack;
    for (const key in back) a.cur[key] = lerp(a.cur[key], back[key], Math.min(1, dt * 9));
  } else {
    const r = POSES.ready;
    for (const key in r) a.cur[key] = lerp(a.cur[key], r[key], Math.min(1, dt * 6));
  }
  // the computer gets ready as the ball comes
  if (who === AI && !a.swing && P && P.state === 'rally' && ball.v.z * ss > 0 && Math.hypot(ball.p.x - a.pos.x, ball.p.z - a.pos.z) < 6) a.prep = 'top';
  if (who === AI && P && P.lastHitter === AI) a.prep = null;
  if (who === ME && me.prep && P && (P.lastHitter === ME || G.t - input.pressT > D.win + .2)) me.prep = null;
  applyPose(a, a.runPh, clamp(sp / 5, 0, 1));
}
function lerpAngle(a, b, t) { let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; }

/* ---------------------------- visuals ---------------------------- */
function updateBallVisual(dt) {
  ballMesh.position.copy(ball.p);
  const sp = ball.w.length();
  if (sp > .01 && dt) { ballMesh.rotateOnWorldAxis(tmpA.copy(ball.w).normalize(), sp * dt * 60); }
  ballShadow.position.set(ball.p.x, .006, ball.p.z);
  ballShadow.scale.setScalar(clamp(1 + ball.p.y * .25, 1, 2.2)); ballShadow.material.opacity = clamp(.4 - ball.p.y * .04, .1, .4);
  // trail, coloured by spin
  for (let i = trailN - 1; i > 0; i--) { trailPos[i * 3] = trailPos[i * 3 - 3]; trailPos[i * 3 + 1] = trailPos[i * 3 - 2]; trailPos[i * 3 + 2] = trailPos[i * 3 - 1]; }
  trailPos[0] = ball.p.x; trailPos[1] = ball.p.y; trailPos[2] = ball.p.z;
  trail.geometry.attributes.position.needsUpdate = true;
  const h = Math.hypot(ball.v.x, ball.v.z) || 1, top = ball.w.dot(tmpB.copy(UP).cross(tmpA.set(ball.v.x / h, 0, ball.v.z / h)));
  trail.material.color.setHex(top > .2 ? 0x6ff0a8 : top < -.2 ? 0x8cc8ff : 0xffffff);
}
function trailReset() { for (let i = 0; i < trailN; i++) { trailPos[i * 3] = ball.p.x; trailPos[i * 3 + 1] = ball.p.y; trailPos[i * 3 + 2] = ball.p.z; } }
function addMark(x, z) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(.06, 12), markMat); m.rotation.x = -Math.PI / 2; m.scale.set(1, 2.2, 1); m.position.set(x, .004, z);
  m.rotation.z = Math.atan2(ball.v.x, ball.v.z); scene.add(m); marks.push(m);
  if (marks.length > 30) { const o = marks.shift(); scene.remove(o); o.geometry.dispose(); }
}
function clearMarks() { while (marks.length) { const o = marks.pop(); scene.remove(o); o.geometry.dispose(); } }
function animateCrowd(dt) {
  if (!crowd) return;
  crowd.t += dt; if (crowd.cheer > 0) crowd.cheer -= dt;
  if (crowd.cheer <= 0 && crowd.still) return;
  const mx = new THREE.Matrix4(), amp = crowd.cheer > 0 ? .18 : 0;
  crowd.still = amp === 0;
  crowd.people.forEach((p, i) => {
    const j = amp ? Math.max(0, Math.sin(crowd.t * 12 + i * 1.7)) * amp : 0;
    mx.makeTranslation(p.x, p.y + .3 + j, p.z); crowd.body.setMatrixAt(i, mx);
    mx.makeTranslation(p.x, p.y + .78 + j, p.z); crowd.head.setMatrixAt(i, mx);
  });
  crowd.body.instanceMatrix.needsUpdate = true; crowd.head.instanceMatrix.needsUpdate = true;
}
function updateCamera(dt) {
  const portrait = camera.aspect < 1;
  if (G.mode === 'play' && me) {
    const want = tmpA.set(me.pos.x * .35, portrait ? 10.5 : 7.4, Math.max(me.pos.z, HALF_L) + (portrait ? 13 : 9.6));
    camPos.lerp(want, Math.min(1, dt * 3));
    camLook.lerp(tmpB.set(me.pos.x * .2, 0, portrait ? -4.5 : -3.5), Math.min(1, dt * 3));
  } else {
    const a = G.t * .25; camPos.set(Math.sin(a) * 26, 11, Math.cos(a) * 26); camLook.set(0, 0, 0);
  }
  camera.position.copy(camPos); camera.lookAt(camLook);
}

/* ---------------------------- HUD bits ---------------------------- */
let flashT = null;
function flash(t, color) {
  const c = $('call'); c.textContent = t; c.style.color = color || '#fff'; c.style.opacity = t ? 1 : 0;
  clearTimeout(flashT); flashT = setTimeout(() => { c.style.opacity = 0; }, 1400);
}
let shotT = null;
function shotLabel(t) { const s = $('shot'); s.textContent = t; s.classList.remove('hide'); clearTimeout(shotT); shotT = setTimeout(() => s.classList.add('hide'), 1600); }
function hint(t) { const h = $('hint'); h.textContent = t; h.classList.toggle('hide', !t); }

/* ================================================================
   Menus: title, world tour, quick match, before and after a match
   ================================================================ */
const show = id => { for (const o of ['title', 'tour', 'quick', 'pre', 'post', 'pause', 'help']) $(o).classList.toggle('hide', o !== id); };
function title() {
  G.mode = 'menu'; G.paused = false; M = null; P = null;
  $('hud').classList.add('hide'); $('pad').classList.add('hide'); $('shots').classList.add('hide');
  buildVenue(MAJORS[save.tour.slam % 4]); spawnMenuPlayers();
  $('nameIn').value = save.name;
  const cs = $('colors'); cs.innerHTML = '';
  COLORS.forEach((c, i) => { const b = document.createElement('button'); b.className = 'sw' + (i === save.color ? ' sel' : ''); b.style.background = '#' + new THREE.Color(c).getHexString(); b.setAttribute('aria-label', 'Shirt colour'); b.onclick = () => { save.color = i; store(); title(); }; cs.appendChild(b); });
  document.querySelectorAll('#diffs .btn').forEach(b => { b.classList.toggle('sel', b.dataset.d === save.diff); b.onclick = () => { save.diff = b.dataset.d; D = DIFF[save.diff]; store(); title(); }; });
  $('diffNote').textContent = D.note;
  show('title');
}
$('nameIn').addEventListener('input', () => { save.name = ($('nameIn').value.trim() || 'Player').slice(0, 12); store(); });
function spawnMenuPlayers() {
  removeAthlete(me); removeAthlete(opp);
  me = makeAthlete(playerColors()); me.pos.set(-1.5, 0, 9); me.face = Math.PI;
  const o = OPP.mel[0]; opp = makeAthlete({ shirt: o.c[0], shorts: o.c[1], skin: o.c[2], hair: o.c[3] }); opp.pos.set(1.5, 0, -9);
  me.root.position.copy(me.pos); opp.root.position.copy(opp.pos); me.root.rotation.y = Math.PI;
  pose(me, POSES.ready, 1); pose(opp, POSES.ready, 1);
  ball.p.set(0, 1.4, 0); updateBallVisual(0);
}
$('goHelp').onclick = () => show('help'); $('helpBack').onclick = () => show('title');
$('goQuick').onclick = () => {
  const q = $('quickCourts'); q.innerHTML = '';
  MAJORS.forEach(m => { const b = document.createElement('button'); b.className = 'mj'; b.style.background = m.card; b.innerHTML = `<b>${m.city}</b><span>${SURF[m.surf].name}${m.night ? ', at night' : ''}</span>`; b.onclick = () => startMatch({ major: m, round: -1 }); q.appendChild(b); });
  show('quick');
};
$('quickBack').onclick = () => show('title');
$('goTour').onclick = () => tour();
$('tourBack').onclick = () => title();
function tour() {
  const t = save.tour, m = MAJORS[t.slam];
  $('tourNote').textContent = `Season ${t.year}. Next: ${m.city}, ${m.month}, ${ROUNDS[t.round]}.`;
  const box = $('majors'); box.innerHTML = '';
  MAJORS.forEach((mm, i) => {
    const d = document.createElement('div'); d.className = 'mj' + (i === t.slam ? ' next' : '') + (i > t.slam ? ' locked' : ''); d.style.background = mm.card;
    const titles = save.titles[mm.id] || 0, best = save.best[mm.id];
    d.innerHTML = `<b>${mm.city}</b><span>${mm.month} · ${SURF[mm.surf].name}</span><br><span>${titles ? '🏆 × ' + titles : best != null ? 'Best: ' + best : '&nbsp;'}</span>` + (titles ? '<span class="tro">🏆</span>' : '');
    box.appendChild(d);
  });
  show('tour');
  drawMap(t.slam > 0 ? t.slam - 1 : -1, t.slam);
  $('tourGo').onclick = () => pre();
}
function pre() {
  const t = save.tour, m = MAJORS[t.slam], o = OPP[m.id][t.round];
  $('preTitle').textContent = `${m.city} · ${ROUNDS[t.round]}`;
  $('preTag').textContent = `${m.month}, on ${SURF[m.surf].name}${m.night ? ', under the lights' : ''}. One set, first to 4 games (tiebreak at 4-4).`;
  const br = $('preBracket'); br.innerHTML = '';
  ROUNDS.forEach((r, i) => { const d = document.createElement('div'); d.className = i < t.round ? 'won' : i === t.round ? 'now' : ''; d.textContent = `${i < t.round ? '✅' : i === t.round ? '🎾' : '⬜'} ${r}: ${OPP[m.id][i].n}`; br.appendChild(d); });
  $('preOpp').textContent = `${o.n} is ${STYLE_NOTE[o.st]}.`;
  $('preGo').onclick = () => startMatch({ major: m, round: t.round });
  show('pre');
}
/* The world map, with the plane flying to the next major */
let mapAnim = 0;
function drawMap(from, to) {
  const cv = $('mapc'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
  const P2 = ([lat, lon]) => [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
  const LAND = [
    [[70, -165], [71, -100], [60, -64], [47, -53], [25, -80], [18, -97], [8, -78], [20, -105], [32, -117], [48, -125], [60, -146]],
    [[12, -72], [5, -52], [-7, -35], [-23, -41], [-40, -62], [-55, -68], [-42, -74], [-18, -71], [-5, -81]],
    [[71, -10], [70, 30], [72, 70], [77, 105], [70, 160], [62, 178], [52, 157], [40, 142], [22, 120], [8, 105], [20, 92], [8, 77], [25, 62], [12, 44], [30, 32], [36, 28], [38, 10], [36, -9], [44, -9], [48, -5], [54, 8], [58, 6]],
    [[37, -6], [37, 10], [32, 32], [12, 44], [10, 51], [-10, 40], [-25, 35], [-35, 20], [-28, 15], [-12, 13], [5, 9], [5, -8], [15, -17], [28, -13]],
    [[-12, 131], [-11, 142], [-25, 153], [-38, 148], [-38, 140], [-32, 116], [-22, 114], [-14, 127]],
    [[58, -5], [58, -2], [53, 1], [51, 1], [50, -5], [55, -6]],
  ];
  cancelAnimationFrame(mapAnim);
  const t0 = performance.now();
  const draw = () => {
    const k = clamp((performance.now() - t0) / 2600, 0, 1), e = k * k * (3 - 2 * k);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d3550'); gr.addColorStop(1, '#0a2840'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2; for (let x = 0; x < W; x += W / 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += H / 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.fillStyle = '#2f6a4a'; g.strokeStyle = '#4f9a6a'; g.lineWidth = 3;
    LAND.forEach(poly => { g.beginPath(); poly.forEach((p, i) => { const [x, y] = P2(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke(); });
    MAJORS.forEach((m, i) => {
      const [x, y] = P2(m.ll), won = save.titles[m.id];
      g.fillStyle = i === to ? '#ffd34d' : won ? '#7ee0a8' : '#ffffff';
      g.beginPath(); g.arc(x, y, i === to ? 14 : 10, 0, TAU); g.fill();
      // London and Paris sit close together: London's label goes up-left, Paris's down-right
      const lab = { lon: [-70, -20, 'right'], par: [24, 40, 'left'], mel: [0, 44, 'center'], ny: [0, -22, 'center'] }[m.id];
      g.font = '900 30px Trebuchet MS, sans-serif'; g.fillStyle = '#fff'; g.textAlign = lab[2]; g.fillText(m.city + (won ? ' 🏆' : ''), x + (lab[2] === 'right' ? -16 : lab[2] === 'left' ? 16 : 0), y + lab[1]);
    });
    if (from >= 0 && from !== to) {
      const [x0, y0] = P2(MAJORS[from].ll), [x1, y1] = P2(MAJORS[to].ll), mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 160;
      g.strokeStyle = 'rgba(255,211,77,.8)'; g.setLineDash([12, 12]); g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); g.setLineDash([]);
      const qx = (1 - e) ** 2 * x0 + 2 * (1 - e) * e * mx + e * e * x1, qy = (1 - e) ** 2 * y0 + 2 * (1 - e) * e * my + e * e * y1;
      const dx = 2 * (1 - e) * (mx - x0) + 2 * e * (x1 - mx), dy = 2 * (1 - e) * (my - y0) + 2 * e * (y1 - my);
      g.save(); g.translate(qx, qy); g.rotate(Math.atan2(dy, dx) + Math.PI / 4); g.font = '54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✈️', 0, 0); g.restore();
    }
    if (k < 1) mapAnim = requestAnimationFrame(draw);
  };
  draw();
}

/* ---------------------------- a match ---------------------------- */
function startMatch(cfg) {
  const m = cfg.major, round = cfg.round;
  const o = round >= 0 ? OPP[m.id][round] : OPP[m.id][Math.floor(Math.random() * 3)];
  const skill = round >= 0 ? [.85, 1, 1.12][round] : 1;
  buildVenue(m); clearMarks();
  removeAthlete(me); removeAthlete(opp);
  me = makeAthlete(playerColors());
  opp = makeAthlete({ shirt: o.c[0], shorts: o.c[1], skin: o.c[2], hair: o.c[3], band: o.st === 'clay' ? 0xd82a4a : 0xffffff });
  opp.style = o.st;
  M = newMatch({ surf: m.surf, major: m, round, oppName: o.n, gamesTo: 4, setsTo: 1, skill,
    speed: o.st === 'counter' ? 1.12 : 1, noise: o.st === 'counter' ? .8 : o.st === 'serve' ? 1.15 : 1, serveIn: o.st === 'serve' ? 1.05 : 1 });
  M.server = Math.random() < .5 ? ME : AI;
  $('evName').textContent = (m.city + ' · ' + (round >= 0 ? ROUNDS[round] : 'Exhibition')).toUpperCase();
  updateBoard();
  show(null); $('hud').classList.remove('hide'); $('shots').classList.remove('hide');
  $('pad').classList.toggle('hide', D.auto);
  G.mode = 'play'; G.paused = false; G.endT = null;
  me.pos.set(0, 0, HALF_L + .5); opp.pos.set(0, 0, -HALF_L - .5);
  camPos.set(0, 9, 24);
  P = null; nextPoint((M.server === ME ? save.name : o.n) + ' to serve. Play.', 1.6);
}
function finishMatch(w) {
  G.mode = 'menu'; $('hud').classList.add('hide'); $('pad').classList.add('hide'); $('shots').classList.add('hide');
  const m = M.major, round = M.round, score = M.sets.map(s => s[0] + '-' + s[1]).join(', ');
  const btns = $('postBtns'); btns.innerHTML = '';
  const add = (txt, fn, alt) => { const b = document.createElement('button'); b.className = 'btn' + (alt ? ' alt' : ''); b.textContent = txt; b.onclick = fn; btns.appendChild(b); };
  if (round < 0) {
    $('postEm').textContent = w === ME ? '🏆' : '🎾';
    $('postTitle').textContent = w === ME ? 'You won!' : M.oppName + ' won';
    $('postTag').textContent = `${m.city}, ${score}. Aces: ${M.stats.aces[0]}. Winners: ${M.stats.winners[0]}.`;
    add('Play again', () => startMatch({ major: m, round: -1 })); add('Menu', title, true);
    return show('post');
  }
  const t = save.tour;
  if (w === ME) {
    if (round === 2) {
      save.titles[m.id] = (save.titles[m.id] || 0) + 1; save.best[m.id] = 'Champion';
      const all = MAJORS.every(mm => save.titles[mm.id]);
      $('postEm').textContent = '🏆';
      $('postTitle').textContent = `${m.city} champion!`;
      $('postTag').textContent = `You beat ${M.oppName} ${score} and lifted the trophy.` + (t.slam === 3 && all ? ' You have won all four majors: a Grand Slam!' : '');
      umpire(t.slam === 3 && all ? 'Ladies and gentlemen, your Grand Slam champion, ' + save.name + '!' : 'Ladies and gentlemen, your ' + m.city + ' champion, ' + save.name + '!');
      advanceSlam();
      add(t.slam === 0 ? 'Next season ✈️' : 'Fly to ' + MAJORS[t.slam].city + ' ✈️', tour); add('Menu', title, true);
    } else {
      save.best[m.id] = save.best[m.id] === 'Champion' ? 'Champion' : ROUNDS[round + 1];
      t.round++; store();
      $('postEm').textContent = '🎉';
      $('postTitle').textContent = `Into the ${ROUNDS[round + 1]}!`;
      $('postTag').textContent = `You beat ${M.oppName} ${score}.`;
      add('Next match ▶', pre); add('Menu', title, true);
    }
  } else {
    $('postEm').textContent = '🎾';
    $('postTitle').textContent = `${M.oppName} won, ${score}`;
    $('postTag').textContent = 'So close! Try the match again, or fly on to the next major.';
    if (!save.best[m.id]) save.best[m.id] = ROUNDS[round]; store();
    add('Try again', () => startMatch({ major: m, round })); add('Fly on ✈️', () => { advanceSlam(); tour(); }, true); add('Menu', title, true);
  }
  show('post');
}
function advanceSlam() { const t = save.tour; t.round = 0; t.slam++; if (t.slam > 3) { t.slam = 0; t.year++; } store(); }

/* ---------------------------- pause, sound ---------------------------- */
function togglePause() { if (G.mode !== 'play') return; G.paused = !G.paused; show(G.paused ? 'pause' : null); }
$('btnPause').onclick = togglePause; $('resume').onclick = togglePause;
$('quit').onclick = () => { G.paused = false; try { speechSynthesis.cancel(); } catch (e) { /* */ } title(); };
const soundBtn = () => { $('btnSound').textContent = save.sound ? '🔊' : '🔇'; };
$('btnSound').onclick = () => { save.sound = !save.sound; store(); soundBtn(); if (!save.sound) try { speechSynthesis.cancel(); } catch (e) { /* */ } };
soundBtn();
document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused) togglePause(); });

/* hooks for the tests */
Object.defineProperties(GST, { M: { get: () => M }, P: { get: () => P }, me: { get: () => me }, opp: { get: () => opp } });
Object.assign(GST, {
  ok: true, G, ball, press, startMatch, MAJORS, OPP, SURF, D: () => D,
  simulate, solveShot, planShot, awardPoint, save, title, tour, setDiff: d => { save.diff = d; D = DIFF[d]; },
  step: (dt, n) => { for (let i = 0; i < (n || 1); i++) { G.t += dt; update(dt); } }, meter: () => meterVal(),
});
title();
requestAnimationFrame(frame);
}
