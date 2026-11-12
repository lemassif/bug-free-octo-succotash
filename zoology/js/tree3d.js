/* ============================================================
   tree3d.js — the tree of life in 3D, with a deep-time slider.

   Built from the project's species list: Life → kingdom → phylum →
   class → order → family → genus → species. Nodes are one
   InstancedMesh of spheres (fast on phones), edges one LineSegments.
   Pinned specimens glow; unpinned ones sit grey, so the tree fills
   in as the project progresses. The time slider hides every branch
   younger than the chosen age, so dragging it from 650 Mya to today
   grows the tree in the order life actually branched.

   Uses the three.js module already shipped in this repository.
   ============================================================ */
import * as THREE from '../../three.module.min.js';

const RANK_DEFAULT_AGE = { life: 3800, kingdom: 700, phylum: 530, cls: 350, order: 150, family: 45, genus: 12, species: 2 };
const AGES = {
  Animalia: 650, Plantae: 470, Chordata: 530, Arthropoda: 540, Mollusca: 540, Tracheophyta: 420,
  Insecta: 410, Arachnida: 430, Malacostraca: 500, Mammalia: 210, Aves: 150, Reptilia: 310, Amphibia: 350, Actinopterygii: 420, Bivalvia: 500, Cephalopoda: 500, Magnoliopsida: 140, Pinopsida: 300,
  Lepidoptera: 200, Coleoptera: 300, Hymenoptera: 280, Diptera: 250, Hemiptera: 300, Odonata: 300, Orthoptera: 300, Mantodea: 140, Phasmatodea: 130, Neuroptera: 290, Ephemeroptera: 320, Dermaptera: 200, Megaloptera: 260, Zygentoma: 390,
  Strigiformes: 60, Passeriformes: 60, Accipitriformes: 55, Anseriformes: 70, Galliformes: 70, Pelecaniformes: 55, Coraciiformes: 50, Piciformes: 50, Apodiformes: 55, Gaviiformes: 60, Charadriiformes: 65, Suliformes: 55, Struthioniformes: 60, Otidiformes: 55, Ciconiiformes: 55, Gruiformes: 60, Psittaciformes: 55, Sphenisciformes: 60, Phoenicopteriformes: 60,
  Carnivora: 55, Artiodactyla: 60, Perissodactyla: 56, Rodentia: 60, Lagomorpha: 55, Chiroptera: 55, Primates: 65, Proboscidea: 60, Didelphimorphia: 65, Diprotodontia: 50, Monotremata: 180,
  Anura: 250, Urodela: 180, Testudines: 220, Squamata: 200, Crocodilia: 90, Salmoniformes: 100, Perciformes: 70, Cypriniformes: 100, Acipenseriformes: 200, Esociformes: 100, Gobiiformes: 60,
  Decapoda: 400, Araneae: 400, Octopoda: 150, Myida: 250, Gentianales: 80, Pinales: 250
};
export const COLORS = { Mammalia: '#f4a24a', Aves: '#6fc3ff', Reptilia: '#8fd16a', Amphibia: '#4fd1b5', Actinopterygii: '#5e8bff', Insecta: '#ffd84d', Arachnida: '#d98cff', Malacostraca: '#ff8c8c', Bivalvia: '#c9b8a8', Cephalopoda: '#ff6fb5', Magnoliopsida: '#9be37a', Pinopsida: '#4e9a5a', other: '#e8e4d8' };

function build(species) {
  const root = { name: 'Life', rank: 'life', children: [], depth: 0 };
  const ranks = ['kingdom', 'phylum', 'cls', 'order', 'family', 'genus'];
  species.forEach(sp => {
    let node = root;
    ranks.forEach((r, i) => {
      let c = node.children.find(x => x.name === sp[r]);
      if (!c) { c = { name: sp[r], rank: r, children: [], depth: i + 1, parent: node, cls: r === 'cls' ? sp[r] : node.cls }; node.children.push(c); }
      node = c;
    });
    node.children.push({ name: sp.sci, rank: 'species', children: [], depth: 7, parent: node, sp, cls: node.cls });
  });
  const nodes = [];
  (function walk(n) { nodes.push(n); n.children.forEach(walk); })(root);
  nodes.forEach(n => {
    n.age = n.rank === 'life' ? 3800 : (AGES[n.name] || RANK_DEFAULT_AGE[n.rank]);
    if (n.parent && n.age >= n.parent.age) n.age = Math.max(1, n.parent.age - 5);
  });
  /* leaves count and radial layout */
  (function count(n) { n.leaves = n.children.length ? n.children.reduce((a, c) => a + count(c), 0) : 1; return n.leaves; })(root);
  let cursor = 0;
  (function place(n) {
    if (!n.children.length) { n.angle = (cursor + 0.5) / root.leaves * Math.PI * 2; cursor++; }
    else { n.children.forEach(place); n.angle = n.children.reduce((a, c) => a + c.angle, 0) / n.children.length; }
  })(root);
  /* fix angle wrap: use mean on circle for internal nodes */
  (function fix(n) { if (n.children.length) { n.children.forEach(fix); let sx = 0, sy = 0; n.children.forEach(c => { sx += Math.cos(c.angle); sy += Math.sin(c.angle); }); n.angle = Math.atan2(sy, sx); } })(root);
  const R = [0, 3.4, 6.6, 9.8, 13, 16.2, 19.2, 22], H = [0, 1.6, 3.0, 4.3, 5.5, 6.6, 7.6, 8.5];
  nodes.forEach((n, i) => { n.i = i; n.pos = new THREE.Vector3(Math.cos(n.angle) * R[n.depth], H[n.depth], Math.sin(n.angle) * R[n.depth]); if (n.depth === 0) n.pos.set(0, 0, 0); });
  return { root, nodes };
}

function makeLabel(text, color, size) {
  const c = document.createElement('canvas'); const ctx = c.getContext('2d');
  const font = (size || 28) + 'px Georgia, serif'; ctx.font = font; const w = Math.ceil(ctx.measureText(text).width) + 24;
  c.width = w; c.height = (size || 28) + 18; ctx.font = font; ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, 0, c.width, c.height, 10) : ctx.rect(0, 0, c.width, c.height); ctx.fill();
  ctx.fillStyle = color || '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(text, 12, c.height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  const k = 0.028; sp.scale.set(c.width * k, c.height * k, 1); sp.renderOrder = 10;
  return sp;
}

export function mount(container, opts) {
  const { root, nodes } = build(opts.species);
  const done = opts.done || {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.insertBefore(renderer.domElement, container.firstChild);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 400);
  const target = new THREE.Vector3(0, 4.2, 0);
  let theta = 0.6, phi = 1.1, dist = 40;
  function placeCamera() {
    camera.position.set(target.x + dist * Math.sin(phi) * Math.cos(theta), target.y + dist * Math.cos(phi), target.z + dist * Math.sin(phi) * Math.sin(theta));
    camera.lookAt(target);
  }
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(10, 30, 10); scene.add(dl);

  /* spheres */
  const geo = new THREE.SphereGeometry(1, 14, 10);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
  const mesh = new THREE.InstancedMesh(geo, mat, nodes.length);
  const m4 = new THREE.Matrix4(); const col = new THREE.Color();
  const SIZE = [0.9, 0.62, 0.5, 0.42, 0.34, 0.26, 0.2, 0.24];
  function nodeColor(n) {
    if (n.sp) return (done[n.sp.id] && done[n.sp.id].done) ? (COLORS[n.cls] || COLORS.other) : '#6a7070';
    if (n.depth === 0) return '#ffffff';
    return COLORS[n.cls] || COLORS.other;
  }
  nodes.forEach(n => { m4.makeScale(SIZE[n.depth], SIZE[n.depth], SIZE[n.depth]).setPosition(n.pos); mesh.setMatrixAt(n.i, m4); mesh.setColorAt(n.i, col.set(nodeColor(n))); });
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  /* edges */
  const edges = nodes.filter(n => n.parent);
  const epos = new Float32Array(edges.length * 6); const ecol = new Float32Array(edges.length * 6);
  edges.forEach((n, k) => { const c = new THREE.Color(nodeColor(n.sp ? n.parent : n)); const c2 = new THREE.Color(nodeColor(n.parent)); ecol.set([c2.r, c2.g, c2.b, c.r, c.g, c.b], k * 6); });
  const egeo = new THREE.BufferGeometry(); egeo.setAttribute('position', new THREE.BufferAttribute(epos, 3)); egeo.setAttribute('color', new THREE.BufferAttribute(ecol, 3));
  const lines = new THREE.LineSegments(egeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 }));
  scene.add(lines);

  /* labels: kingdom/phylum/class always; others on selection */
  const labels = new Map();
  function label(n) {
    if (labels.has(n)) return labels.get(n);
    const s = makeLabel(n.sp ? (n.sp.common) : n.name, n.depth === 0 ? '#fff' : (COLORS[n.cls] || '#fff'), n.depth <= 1 ? 34 : n.depth <= 3 ? 28 : 24);
    s.position.copy(n.pos).add(new THREE.Vector3(0, SIZE[n.depth] + (n.depth === 0 ? 1.6 : n.depth === 1 ? 1.1 : 0.5), 0)); labels.set(n, s); scene.add(s); return s;
  }
  const always = n => n.depth <= 3 && n.depth !== 2;
  nodes.filter(always).forEach(n => label(n));
  let dyn = [];
  function showDynamic(n) {
    dyn.forEach(s => { if (!always(s.node)) s.visible = false; }); dyn = [];
    const list = [n].concat(n.children.slice(0, 40)); if (n.parent) list.push(n.parent);
    list.forEach(x => { const s = label(x); s.node = x; s.visible = x.age >= currentT; dyn.push(s); });
  }
  labels.forEach((s, n) => { s.node = n; });

  /* time */
  let currentT = 0;
  function setTime(mya) {
    currentT = mya;
    nodes.forEach(n => {
      const vis = n.age >= mya;
      const sz = vis ? SIZE[n.depth] : 0.0001;
      m4.makeScale(sz, sz, sz).setPosition(n.pos); mesh.setMatrixAt(n.i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
    edges.forEach((n, k) => {
      const vis = n.age >= mya; const a = n.parent.pos, b = vis ? n.pos : n.parent.pos;
      epos.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6);
    });
    egeo.attributes.position.needsUpdate = true;
    labels.forEach((s, n) => { s.visible = (always(n) || dyn.indexOf(s) >= 0) && n.age >= mya; });
  }
  setTime(0);

  /* interaction */
  const ray = new THREE.Raycaster(); ray.params.Line.threshold = 0.3;
  const ptr = new THREE.Vector2();
  let drag = null, pinch = null, moved = 0, idle = 0;
  const el = renderer.domElement;
  const touches = new Map();
  function onDown(e) {
    el.setPointerCapture(e.pointerId); touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 1) { drag = { x: e.clientX, y: e.clientY }; moved = 0; }
    else if (touches.size === 2) { const t = [...touches.values()]; pinch = { d: Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y), dist }; drag = null; }
    idle = 0;
  }
  function onMove(e) {
    if (!touches.has(e.pointerId)) return; touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); idle = 0;
    if (pinch && touches.size === 2) { const t = [...touches.values()]; const d = Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y); dist = Math.min(80, Math.max(6, pinch.dist * pinch.d / d)); placeCamera(); return; }
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); theta += dx * 0.006; phi = Math.min(2.6, Math.max(0.25, phi - dy * 0.006)); drag = { x: e.clientX, y: e.clientY }; placeCamera(); }
  }
  function onUp(e) {
    touches.delete(e.pointerId); if (touches.size < 2) pinch = null;
    if (drag && moved < 6) pickAt(e.clientX, e.clientY);
    drag = null;
  }
  function pickAt(cx, cy) {
    const r = el.getBoundingClientRect(); ptr.x = ((cx - r.left) / r.width) * 2 - 1; ptr.y = -((cy - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    let hit = ray.intersectObject(mesh)[0];
    let n = hit ? nodes[hit.instanceId] : null;
    if (n && n.age < currentT) n = null;
    if (!n) { /* try labels */
      const vis = [...labels.values()].filter(s => s.visible); const h2 = ray.intersectObjects(vis)[0]; if (h2) n = h2.object.node;
    }
    if (!n) return;
    select(n);
  }
  let selected = null;
  function select(n) {
    selected = n; showDynamic(n);
    nodes.forEach(x => mesh.setColorAt(x.i, col.set(nodeColor(x))));
    mesh.setColorAt(n.i, col.set('#ffffff')); mesh.instanceColor.needsUpdate = true;
    /* glide the camera target toward the node */
    glide = { from: target.clone(), to: n.pos.clone(), t: 0 };
    if (opts.onSelect) opts.onSelect(n);
  }
  let glide = null;
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp);
  el.addEventListener('wheel', e => { e.preventDefault(); dist = Math.min(80, Math.max(6, dist * (1 + Math.sign(e.deltaY) * 0.08))); placeCamera(); idle = 0; }, { passive: false });

  /* loop */
  let raf = 0, last = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; idle += dt;
    if (idle > 4 && !drag) theta += dt * 0.08;
    if (glide) { glide.t = Math.min(1, glide.t + dt * 2); target.lerpVectors(glide.from, glide.to, 1 - Math.pow(1 - glide.t, 3)); if (glide.t >= 1) glide = null; }
    placeCamera(); renderer.render(scene, camera);
  }
  placeCamera(); raf = requestAnimationFrame(frame);
  function onResize() { const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', onResize);

  return {
    setTime, select,
    focus(sci) { const n = nodes.find(x => x.sp && x.sp.sci === sci); if (n) select(n); },
    destroy() { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); renderer.dispose(); geo.dispose(); egeo.dispose(); labels.forEach(s => { s.material.map.dispose(); s.material.dispose(); }); el.remove(); }
  };
}
window.Tree3D = { mount, COLORS };
