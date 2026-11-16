/* Cat — atlas plates: the mouth and pharynx, the skull, the skeleton from above and
   below, the arteries, the veins and lymphatics, and the nerves.
   Same coordinates as cat.js: on its back, head at -x, the cat's right at +z. */
DX.extend('cat', function (B) {
  var D = DX, E = D.E, T = D.T, F = D.F, H = D.H, O = D.O, M = D.M, P = D.P, K = D.K;
  var BX = [-8.4, -8.0, -7.2, -6.3, -5.5, -4.4, -2.6, -0.6, 1.4, 3.2, 4.6, 5.8, 6.4];
  var BR = [0.34, 0.82, 1.12, 1.2, 0.95, 1.55, 1.85, 1.9, 1.8, 1.65, 1.42, 0.95, 0.42];
  var k = D.kit(BX, BR, 1.9, 0.85), surf = k.surf, band = k.band;
  function lerp(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
  function plus(a, o) { return [a[0] + o[0], a[1] + o[1], a[2] + o[2]]; }
  var SH = [-3.9, 1.55, 1.5], EL = [-4.7, 1.05, 3.25], WR = [-5.5, 0.72, 4.5], PW = [-5.95, 0.58, 5.0];
  var HP = [4.4, 1.55, 1.45], KN = [4.05, 1.08, 3.45], HK = [5.6, 0.72, 4.85], FT = [6.5, 0.56, 5.3];
  var TAIL = [[6.3, 1.5, 0], [7.5, 1.05, 0.3], [8.8, 0.72, 1.2], [9.9, 0.56, 2.4], [10.6, 0.5, 3.6]];
  /* height of the backbone along the body */
  var VY = [[-6.0, 1.55], [-5.0, 1.35], [-4.4, 1.1], [-2.6, 0.8], [-0.6, 0.78], [1.4, 0.85], [3.2, 0.95], [4.6, 1.1], [5.8, 1.3], [6.3, 1.5]];
  function vy(x) { var i = 0; while (i < VY.length - 2 && VY[i + 1][0] < x) i++; var f = Math.max(0, Math.min(1, (x - VY[i][0]) / (VY[i + 1][0] - VY[i][0]))); return VY[i][1] + (VY[i + 1][1] - VY[i][1]) * f; }
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var BONE = K.bone, BONE2 = 0xe2d6bd, BONE3 = 0xfaf4e2, CART = K.cart, DARK = 0x2a2420, TOOTH = 0xfbf7ea;
  var on = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(B + arguments[i]); return { on: a }; };

  /* ================= plate 0: mouth and pharynx, opened and enlarged ================= */
  function jaw(zc, dir, L, W) { var pts = []; for (var i = 0; i <= 14; i++) { var a = Math.PI * i / 14; pts.push([Math.cos(a) * W, 0.08, zc + dir * Math.sin(a) * L]); } return pts; }
  function rim(dir, a, kk) { kk = kk || 0.9; return [Math.cos(a) * 2.0 * kk, 0.2, dir * (0.3 + Math.sin(a) * 3.2 * kk)]; }
  add(0, 'mo_ctx', 'roof (left) and floor (right) of the mouth, opened flat', 'dig', 0xe2b0a4, [F(jaw(-0.3, -1, 3.2, 2.0)), T(jaw(-0.3, -1, 3.2, 2.0), 0.08), F(jaw(0.3, 1, 3.2, 2.0)), T(jaw(0.3, 1, 3.2, 2.0), 0.08)], '', { x: 1, dull: 1 });
  add(0, 'mo_hard', 'hard palate', 'dig', 0xf0cfc4, [E([0, 0.12, -2.0], [1.2, 0.05, 1.2])], 'The bony front of the roof of the mouth, covered with tough membrane. It separates the mouth from the nasal cavity.');
  add(0, 'mo_rugae', 'palatine rugae', 'dig', 0xd9a090, D.row(7, function (i) { return T([[-0.95 + Math.abs(i - 3) * 0.05, 0.18, -1.0 - i * 0.3], [0.95 - Math.abs(i - 3) * 0.05, 0.18, -1.0 - i * 0.3]], 0.04); }), 'Crosswise ridges on the hard palate. The tongue presses food against them.');
  add(0, 'mo_incpap', 'incisive papilla', 'dig', 0xe9a898, [E([0, 0.18, -3.3], [0.12, 0.05, 0.1])], 'A small bump just behind the upper incisors. Beside it open the ducts to the vomeronasal organ, used in the gaping “flehmen” face a cat makes at a strong smell.', { small: true });
  add(0, 'mo_soft', 'soft palate', 'dig', 0xe39b8e, [E([0, 0.13, -0.65], [0.95, 0.05, 0.38])], 'The muscular back of the roof of the mouth, with no bone in it. It closes off the nasal passage when the cat swallows. A cat has no uvula.');
  add(0, 'mo_nasoph', 'opening of the nasopharynx', 'resp', 0x6b2a2a, [E([0, 0.13, -0.2], [0.32, 0.04, 0.08])], 'Slit the soft palate down the middle to find the space above it, which leads forward to the nasal cavity. Air passes this way when the mouth is shut.', { small: true });
  add(0, 'mo_tongue', 'tongue', 'dig', 0xd9737f, [T([[0, 0.24, 0.7], [0, 0.32, 1.8], [0, 0.28, 3.0]], [0.55, 0.62, 0.3], { sy: 0.32 })], 'Long and muscular, fixed at the back and free at the front. A cat laps water by flicking the tip down, then pulling up a column of water and closing its jaws on it.');
  add(0, 'mo_filiform', 'filiform papillae', 'dig', 0xf4e6dc, D.row(15, function (i) { var z = 1.5 + Math.floor(i / 5) * 0.4, x = -0.4 + (i % 5) * 0.2; return T([[x, 0.42, z], [x, 0.5, z - 0.12]], [0.035, 0.005]); }), 'Hard, backward-pointing hooks of keratin covering the middle of the tongue. They make a cat’s tongue rough, comb the fur, and scrape meat from bone.');
  add(0, 'mo_vallate', 'vallate papillae', 'dig', 0xc95f6a, D.row(4, function (i) { return E([-0.45 + i * 0.3, 0.36, 0.9 - Math.abs(i - 1.5) * 0.08], [0.08, 0.04, 0.08]); }), 'A few large round papillae in a V near the back of the tongue, each in a moat. They carry taste buds. Cats cannot taste sweetness.', { small: true });
  add(0, 'mo_frenulum', 'lingual frenulum', 'dig', 0xe9a898, [T([[0, 0.16, 2.6], [0, 0.16, 3.2]], 0.04)], 'The fold of membrane tying the underside of the tongue to the floor of the mouth. Lift the tongue to see it.', { small: true });
  add(0, 'mo_epiglottis', 'epiglottis', 'resp', 0xf0d2c8, [H([0, 0.16, 0.35], [0.24, 0.24, 0.2], [-35, 0, 0], { th: 80 })], 'A leaf of cartilage at the root of the tongue that folds back over the glottis when the cat swallows.');
  add(0, 'mo_glottis', 'glottis', 'resp', 0x5a2222, [E([0, 0.13, 0.12], [0.07, 0.04, 0.12])], 'The slit between the vocal folds, the opening into the larynx.', { small: true });
  add(0, 'mo_esoph', 'opening of the esophagus', 'dig', 0x7a2f2f, [E([0, 0.12, -0.02], [0.22, 0.04, 0.06])], 'Behind and above the glottis. Food and air cross here: the pharynx is shared by both.', { small: true });
  add(0, 'mo_tonsil', 'palatine tonsils', 'endo', 0xd98a8a, [E([-0.85, 0.15, 0.35], [0.12, 0.05, 0.08]), E([0.85, 0.15, 0.35], [0.12, 0.05, 0.08])], 'A pair of small lymphoid masses in pockets on the side walls of the throat.', { small: true });
  function tooth(p, h, r) { return T([p, plus(p, [0, h, 0])], [r, r * 0.25]); }
  var UP = -1, LO = 1, C = Math.PI / 2;
  add(0, 'mo_incisors', 'incisors', 'dig', TOOTH, [-0.08, -0.04, 0.0, 0.04, 0.08].concat([0.12]).map(function (d, i) { var a = C + (i < 3 ? -1 : 1) * (0.05 + (i % 3) * 0.06); return tooth(rim(UP, a), 0.22, 0.05); }).concat([0, 1, 2, 3, 4, 5].map(function (i) { var a = C + (i < 3 ? -1 : 1) * (0.05 + (i % 3) * 0.06); return tooth(rim(LO, a), 0.2, 0.045); })), 'Six tiny chisel teeth across the front of each jaw, used to nibble and to pull out feathers.');
  add(0, 'mo_canines', 'canines', 'dig', TOOTH, [tooth(rim(UP, C - 0.38), 0.6, 0.1), tooth(rim(UP, C + 0.38), 0.6, 0.1), tooth(rim(LO, C - 0.36), 0.55, 0.09), tooth(rim(LO, C + 0.36), 0.55, 0.09)], 'The four fangs. A cat kills by driving them between the neck bones of its prey; their spacing matches the gap.');
  add(0, 'mo_premolars', 'premolars', 'dig', TOOTH, [C - 0.66, C + 0.66, C - 0.86, C + 0.86].map(function (a, i) { return tooth(rim(UP, a), 0.28 + (i > 1 ? 0.06 : 0), 0.08); }).concat([C - 0.78, C + 0.78].map(function (a) { return tooth(rim(LO, a), 0.3, 0.08); })), 'Behind a gap: three on each side above (the last of them the carnassial) and two below. Pointed, for slicing.');
  add(0, 'mo_molars', 'molars', 'dig', BONE3, [tooth(rim(UP, C - 1.25), 0.12, 0.06), tooth(rim(UP, C + 1.25), 0.12, 0.06)], 'A single tiny molar on each side of the upper jaw, behind the carnassial. The lower molar on each side is a carnassial. Dental formula: I 3/3, C 1/1, P 3/2, M 1/1, thirty teeth in all.', { small: true });
  add(0, 'mo_carnassial', 'carnassial teeth', 'dig', 0xf4eedd, [C - 1.06, C + 1.06].map(function (a) { var p = rim(UP, a); return T([plus(p, [0, 0.05, -0.18]), plus(p, [0, 0.42, 0]), plus(p, [0, 0.05, 0.18])], 0.07, { sy: 1 }); }).concat([C - 1.0, C + 1.0].map(function (a) { var p = rim(LO, a); return T([plus(p, [0, 0.05, -0.18]), plus(p, [0, 0.38, 0]), plus(p, [0, 0.05, 0.18])], 0.07); })), 'The last upper premolar and the lower molar, with long blades that slide past each other like scissors to shear meat. Every member of the order Carnivora has them.');

  /* ================= plate 1: the skull from above, with the mandible set in front ================= */
  add(1, 'sk_nasal', 'nasal bones', 'skel', BONE, [M(E([-1.55, 1.5, 0.12], [0.4, 0.06, 0.12]))], 'A pair of narrow bones roofing the nose.');
  add(1, 'sk_premax', 'premaxilla', 'skel', BONE2, [M(E([-1.95, 1.3, 0.22], [0.15, 0.12, 0.15]))], 'The small bone at the tip of the upper jaw that holds the incisors.');
  add(1, 'sk_max', 'maxilla', 'skel', BONE, [M(E([-1.35, 1.25, 0.55], [0.45, 0.2, 0.25]))], 'The main bone of the upper jaw, holding the canine and the cheek teeth.');
  add(1, 'sk_infraorb', 'infraorbital foramen', 'skel', DARK, [M(E([-1.15, 1.15, 0.82], [0.04, 0.05, 0.04]))], 'A hole in the maxilla in front of the eye for the nerve to the whiskers and upper lip.', { small: true });
  add(1, 'sk_lacrimal', 'lacrimal bone', 'skel', BONE3, [M(E([-0.95, 1.35, 0.62], [0.08, 0.06, 0.06]))], 'A tiny bone at the inner front corner of the orbit, pierced by the tear duct.', { small: true });
  add(1, 'sk_frontal', 'frontal bone', 'skel', BONE2, [M(E([-0.55, 1.62, 0.38], [0.5, 0.08, 0.35]))], 'Forms the forehead and the roofs of the orbits.');
  add(1, 'sk_postorb', 'postorbital processes', 'skel', BONE3, [M(T([[-0.55, 1.55, 0.72], [-0.6, 1.45, 1.05]], 0.05))], 'Spurs of the frontal bone that reach toward the zygomatic arch behind each eye, almost closing the orbit into a ring.');
  add(1, 'sk_orbit', 'orbit', 'skel', 0x3a3a44, [M(E([-0.45, 1.2, 0.95], [0.4, 0.04, 0.32]))], 'The eye socket, very large: a cat’s eyes are among the largest, for its size, of any carnivore.', { a: 0.5 });
  add(1, 'sk_parietal', 'parietal bone', 'skel', BONE, [M(E([0.55, 1.65, 0.42], [0.55, 0.1, 0.4]))], 'Roofs the rear of the braincase.');
  add(1, 'sk_interpar', 'interparietal bone', 'skel', BONE3, [E([1.25, 1.62, 0], [0.2, 0.06, 0.25])], 'A small triangular bone between the two parietals at the back of the roof.');
  add(1, 'sk_sagittal', 'sagittal crest', 'skel', BONE3, [T([[0.2, 1.75, 0], [1.4, 1.72, 0]], 0.03)], 'A low ridge down the midline of the roof where the temporalis muscles of the two sides meet. Big cats have a tall one.');
  add(1, 'sk_nuchal', 'nuchal crest', 'skel', BONE3, [T([[1.55, 1.6, -0.7], [1.6, 1.68, 0], [1.55, 1.6, 0.7]], 0.035)], 'The ridge across the back of the skull where the neck muscles attach.');
  add(1, 'sk_occip', 'occipital bone', 'skel', BONE2, [E([1.8, 1.2, 0], [0.08, 0.4, 0.55])], 'The back wall of the skull.');
  add(1, 'sk_condyles', 'occipital condyles', 'skel', BONE3, [M(E([1.92, 0.9, 0.18], [0.06, 0.08, 0.1]))], 'Two knobs beside the foramen magnum that rock in the atlas when the head nods.');
  add(1, 'sk_foramen', 'foramen magnum', 'skel', DARK, [E([1.9, 0.95, 0], [0.03, 0.1, 0.12])], 'The large hole through which the spinal cord joins the brain.');
  add(1, 'sk_zygomatic', 'zygomatic bone', 'skel', BONE, [M(T([[-1.0, 1.05, 0.85], [-0.4, 1.05, 1.35], [0.1, 1.0, 1.4]], 0.08))], 'The front half of the cheekbone, under the eye.');
  add(1, 'sk_zygproc', 'zygomatic process of the temporal bone', 'skel', BONE3, [M(T([[0.1, 1.0, 1.4], [0.6, 1.0, 1.05]], 0.07))], 'The rear half of the cheekbone. Together with the zygomatic bone it makes the zygomatic arch, which the masseter hangs from.');
  add(1, 'sk_squam', 'temporal bone (squamous part)', 'skel', BONE2, [M(E([0.75, 1.15, 0.9], [0.4, 0.3, 0.08]))], 'The side wall of the braincase. The jaw joint is on its underside.');
  add(1, 'sk_bulla', 'tympanic bulla', 'skel', BONE3, [M(E([1.1, 0.7, 0.75], [0.3, 0.2, 0.22]))], 'A large rounded bony capsule under the skull holding the middle ear. In the cat it is divided inside into two chambers, which helps with hearing high sounds.');
  add(1, 'sk_meatus', 'external acoustic meatus', 'skel', DARK, [M(E([1.05, 0.95, 1.0], [0.05, 0.05, 0.04]))], 'The bony opening of the ear canal.', { small: true });
  add(1, 'sk_mastoid', 'mastoid process', 'skel', BONE, [M(E([1.4, 0.85, 1.0], [0.08, 0.08, 0.06]))], 'A small knob behind the ear canal, where the sternomastoid and cleidomastoid attach.', { small: true });
  var JX = -3.5;
  add(1, 'mn_symph', 'mandibular symphysis', 'skel', BONE3, [E([JX - 1.95, 1.0, 0], [0.08, 0.1, 0.08])], 'The joint at the chin between the two halves of the mandible. In a cat it never fuses.');
  add(1, 'mn_body', 'body of the mandible', 'skel', BONE, [M(T([[JX - 1.9, 1.0, 0.08], [JX - 1.3, 1.0, 0.5], [JX - 0.1, 1.0, 1.0]], [0.1, 0.12, 0.12]))], 'The tooth-bearing part of each half of the lower jaw.');
  add(1, 'mn_mental', 'mental foramina', 'skel', DARK, [M(E([JX - 1.6, 1.1, 0.32], [0.03, 0.03, 0.03]))], 'Small holes near the chin for nerves to the lower lip.', { small: true });
  add(1, 'mn_ramus', 'ramus of the mandible', 'skel', BONE2, [M(T([[JX - 0.1, 1.0, 1.0], [JX + 0.4, 1.25, 1.1]], [0.16, 0.1]))], 'The upright rear part of the jaw where the chewing muscles attach.');
  add(1, 'mn_coronoid', 'coronoid process', 'skel', BONE3, [M(T([[JX + 0.1, 1.2, 1.05], [JX + 0.3, 1.75, 1.08]], [0.08, 0.03]))], 'The tall blade rising from the ramus. The temporalis pulls on it.');
  add(1, 'mn_condyle', 'condyloid process', 'skel', BONE3, [M(E([JX + 0.45, 1.0, 1.12], [0.06, 0.06, 0.16]))], 'The crosswise roller that hinges in the skull. It allows only an up-and-down bite, no grinding.');
  add(1, 'mn_angular', 'angular process', 'skel', BONE, [M(E([JX + 0.55, 0.85, 1.08], [0.1, 0.05, 0.04]))], 'A small spur below the condyle where the masseter inserts.', { small: true });

  /* ================= plate 2: skeleton from above ================= */
  var V = on(3), LB = on(3, 4, 5, 6);
  function vert(x, s) { return E([x, vy(x), 0], s); }
  add(2, 'ax_atlas', 'atlas', 'skel', BONE3, [vert(-5.9, [0.12, 0.12, 0.42])], 'The first neck vertebra: a ring with broad wings. The skull nods on it.', V);
  add(2, 'ax_axis', 'axis', 'skel', BONE2, [vert(-5.6, [0.18, 0.14, 0.18]), T([[-5.75, vy(-5.6) - 0.15, 0], [-5.45, vy(-5.6) - 0.28, 0]], 0.05)], 'The second neck vertebra, with a long blade-like spine and a peg on which the atlas turns.', V);
  add(2, 'ax_cerv', 'cervical vertebrae', 'skel', BONE, D.row(5, function (i) { var x = -5.35 + i * 0.22; return vert(x, [0.1, 0.12, 0.2]); }), 'Seven neck vertebrae in all, including the atlas and axis.', V);
  var TX = D.pts(13, function (i) { return -4.2 + i * 0.3; });
  add(2, 'ax_thor', 'thoracic vertebrae', 'skel', BONE, TX.map(function (x) { return vert(x, [0.12, 0.12, 0.15]); }), 'Thirteen, one for each pair of ribs.', V);
  add(2, 'ax_tspines', 'spinous processes', 'skel', BONE3, TX.map(function (x, i) { var h = 0.5 - i * 0.03, back = i < 10; return T([[x, vy(x) - 0.1, 0], [x + (back ? 0.12 : -0.08), vy(x) - 0.1 - h, 0]], 0.03); }), 'The spines on top of the vertebrae. Those in front lean back and those behind lean forward; they meet at the eleventh thoracic, which stands upright. This lets the back flex hard in a sprint.', V);
  var LX = D.pts(7, function (i) { return -0.3 + i * 0.6; });
  add(2, 'ax_lumb', 'lumbar vertebrae', 'skel', BONE2, LX.map(function (x) { return vert(x, [0.24, 0.14, 0.17]); }), 'Seven large vertebrae of the lower back, the most flexible part of the spine. Their length is the spring of a cat’s leap.', V);
  add(2, 'ax_ltrans', 'transverse processes', 'skel', BONE3, LX.map(function (x) { return M(T([[x, vy(x), 0.15], [x - 0.15, vy(x) + 0.05, 0.6]], 0.04, { sy: 0.4 })); }), 'Long side wings on the lumbar vertebrae, angled forward, where the loin muscles attach.', V);
  add(2, 'ax_sacrum', 'sacrum', 'skel', BONE, [T([[4.1, vy(4.1), 0], [4.95, vy(4.95), 0]], [0.24, 0.14], { sy: 0.6 })], 'Three vertebrae fused into one bone that carries the pelvis.', V);
  add(2, 'ax_caudal', 'caudal vertebrae', 'skel', BONE2, D.row(14, function (i, f) { var p = new Array(3), n = TAIL.length - 1, t = f * n, j = Math.min(n - 1, Math.floor(t)), g = t - j; p = lerp(TAIL[j], TAIL[j + 1], g); return E(p, [0.12 - f * 0.06, 0.07 - f * 0.03, 0.07 - f * 0.03]); }), 'About twenty tail vertebrae, getting simpler and smaller toward the tip.', V);
  function rib(x, a0, a1) { return [band(x, 0.06, [a0, a1], 0.93), band(x, 0.06, [360 - a1, 360 - a0], 0.93)]; }
  add(2, 'rb_true', 'true ribs', 'skel', BONE, D.row(9, function (i) { return rib(TX[i], 52, 176); }), 'The first nine pairs, each joined to the sternum by its own costal cartilage.', V);
  add(2, 'rb_false', 'false ribs', 'skel', BONE2, D.row(3, function (i) { return rib(TX[9 + i], 62, 176); }), 'Pairs ten to twelve. Their cartilages join the cartilage of the rib in front instead of the sternum.', V);
  add(2, 'rb_float', 'floating ribs', 'skel', BONE3, rib(TX[12], 100, 176), 'The thirteenth pair, short and free at the lower end.', V);
  add(2, 'sc_blade', 'scapula', 'skel', BONE, [M(T([plus(SH, [0.15, -0.3, -0.1]), [-3.0, 0.72, 0.95]], [0.12, 0.45], { sy: 0.22 }))], 'The shoulder blade, lying flat on the side of the chest. In a cat it is held on by muscle alone, so it slides with each stride.', V);
  add(2, 'sc_spine', 'spine of the scapula', 'skel', BONE3, [M(T([plus(SH, [0.05, -0.42, 0.05]), [-3.1, 0.62, 1.1]], 0.04))], 'The ridge down the outer face of the scapula.', V);
  add(2, 'sc_acromion', 'acromion', 'skel', BONE2, [M(E(plus(SH, [-0.05, -0.42, 0.1]), [0.1, 0.06, 0.08]))], 'The lower end of the spine, overhanging the shoulder joint.', V);
  add(2, 'sc_metacrom', 'metacromion', 'skel', BONE3, [M(T([plus(SH, [0.1, -0.42, 0.08]), plus(SH, [0.35, -0.38, 0.22])], [0.05, 0.02]))], 'A spur projecting backward from the spine just above the acromion. The levator scapulae ventralis and part of the trapezius attach to it. Humans do not have one.', { on: [B + 3], small: true });
  add(2, 'sc_supra', 'supraspinous fossa', 'skel', BONE2, [M(E([-3.55, 0.95, 1.05], [0.35, 0.03, 0.14], [0, 25, 0]))], 'The hollow in front of the spine, filled by the supraspinatus.', V);
  add(2, 'sc_infra', 'infraspinous fossa', 'skel', BONE2, [M(E([-3.25, 0.95, 1.38], [0.35, 0.03, 0.14], [0, 25, 0]))], 'The hollow behind the spine, filled by the infraspinatus.', V);
  add(2, 'hu_shaft', 'humerus', 'skel', BONE, [M(T([SH, EL], [0.09, 0.08])), M(E(SH, [0.12, 0.12, 0.12]))], 'The bone of the upper arm.', LB);
  add(2, 'hu_gtub', 'greater tubercle', 'skel', BONE3, [M(E(plus(SH, [-0.12, -0.08, 0.05]), [0.07, 0.07, 0.07]))], 'The knob beside the head of the humerus where the supraspinatus and infraspinatus insert.', { on: [B + 3], small: true });
  add(2, 'ra_radius', 'radius', 'skel', BONE, [M(T([plus(EL, [-0.06, 0, -0.04]), plus(WR, [-0.06, 0, -0.04])], 0.06))], 'The forearm bone on the thumb side. It can roll over the ulna, so a cat can turn its paw palm up, which a dog cannot do as well.', LB);
  add(2, 'ra_ulna', 'ulna', 'skel', BONE2, [M(T([plus(EL, [0.06, 0, 0.04]), plus(WR, [0.06, 0, 0.04])], 0.05))], 'The forearm bone on the little-finger side.', LB);
  add(2, 'ra_olecr', 'olecranon', 'skel', BONE3, [M(E(plus(EL, [0.12, -0.04, 0.0]), [0.08, 0.08, 0.1]))], 'The point of the elbow, where all three heads of the triceps pull.', V);
  add(2, 'mp_carpals', 'carpals', 'skel', BONE3, [M(E(WR, [0.12, 0.08, 0.1]))], 'Seven small wrist bones.', V);
  add(2, 'mp_metacarp', 'metacarpals', 'skel', BONE, D.row(5, function (i) { return M(T([plus(WR, [-0.05 + i * 0.03, 0, -0.12 + i * 0.07]), plus(PW, [-0.15 + i * 0.05, 0.02, -0.3 + i * 0.16])], 0.025)); }), 'Five bones of the palm.', V);
  add(2, 'mp_phal', 'phalanges', 'skel', BONE3, D.row(4, function (i) { var p = plus(PW, [-0.15 + i * 0.05, 0.02, -0.25 + i * 0.16]); return M(T([p, plus(p, [-0.2, 0.02, -0.05])], 0.02)); }).concat(D.row(4, function (i) { var p = plus(FT, [0.05, 0.02, -0.25 + i * 0.16]); return M(T([p, plus(p, [0.2, 0.02, -0.03])], 0.02)); })), 'The toe bones: two in the dewclaw and three in every other toe.', V);
  add(2, 'mp_ungual', 'ungual phalanges', 'skel', BONE2, D.row(4, function (i) { var p = plus(PW, [-0.37 + i * 0.05, 0.05, -0.3 + i * 0.16]); return M(T([p, plus(p, [-0.1, 0.06, 0])], [0.025, 0.006])); }).concat(D.row(4, function (i) { var p = plus(FT, [0.27, 0.05, -0.28 + i * 0.16]); return M(T([p, plus(p, [0.1, 0.05, 0])], [0.025, 0.006])); })), 'The last bone of each toe, curved and hooded, inside the claw. An elastic ligament holds it folded back over the second bone, which retracts the claw.', V);
  add(2, 'pv_ilium', 'ilium', 'skel', BONE, [M(T([[4.15, 1.0, 0.45], [4.45, 1.4, 1.25]], [0.16, 0.1], { sy: 0.4 }))], 'The blade of the hip bone joined to the sacrum.', V);
  add(2, 'pv_ischium', 'ischium', 'skel', BONE2, [M(T([[4.55, 1.55, 1.35], [5.4, 1.45, 0.75]], [0.08, 0.12]))], 'The rear part of the hip bone, the bone you sit on.', V);
  add(2, 'pv_acetab', 'acetabulum', 'skel', DARK, [M(E(plus(HP, [0, -0.05, -0.05]), [0.1, 0.1, 0.06]))], 'The hip socket, where ilium, ischium and pubis meet.', V);
  add(2, 'fe_shaft', 'femur', 'skel', BONE, [M(T([HP, KN], [0.1, 0.09])), M(E(HP, [0.12, 0.12, 0.12]))], 'The thigh bone.', LB);
  add(2, 'fe_gtroch', 'greater trochanter', 'skel', BONE3, [M(E(plus(HP, [0.1, -0.1, 0.12]), [0.08, 0.08, 0.08]))], 'The knob beside the head of the femur where the gluteal muscles insert.', { on: [B + 3], small: true });
  add(2, 'tb_tibia', 'tibia', 'skel', BONE, [M(T([plus(KN, [-0.05, 0, 0]), plus(HK, [-0.05, 0, 0])], [0.08, 0.06]))], 'The shin bone, which carries the weight.', LB);
  add(2, 'tb_fibula', 'fibula', 'skel', BONE2, [M(T([plus(KN, [0.08, -0.05, 0.05]), plus(HK, [0.08, -0.05, 0.05])], 0.03))], 'The slender bone beside the tibia. Complete in a cat; in a horse it has almost vanished.', V);
  add(2, 'ts_calc', 'calcaneus', 'skel', BONE3, [M(T([HK, plus(HK, [0.25, -0.05, -0.25])], 0.06))], 'The heel bone, sticking up behind the ankle as the point of the hock. The calcaneal tendon pulls on it.', V);
  add(2, 'ts_talus', 'talus', 'skel', BONE2, [M(E(plus(HK, [-0.02, 0.05, 0.06]), [0.08, 0.07, 0.07]))], 'The ankle bone on which the tibia hinges.', { on: [B + 3], small: true });
  add(2, 'ts_tarsals', 'tarsals', 'skel', BONE3, [M(E(plus(HK, [0.12, 0.02, 0.15]), [0.12, 0.06, 0.08]))], 'The remaining small bones of the ankle.', V);
  add(2, 'ts_metatars', 'metatarsals', 'skel', BONE, D.row(4, function (i) { return M(T([plus(HK, [0.15 + i * 0.02, 0, 0.05 + i * 0.05]), plus(FT, [-0.05, 0.02, -0.25 + i * 0.16])], 0.025)); }), 'Four long bones of the hind foot. The first is only a stub.', V);

  /* ================= plate 3: skeleton from below ================= */
  function stern(x) { return [x, 1.9 + k.rad(x) * 0.85 * 0.93, 0]; }
  add(3, 'st_manub', 'manubrium', 'skel', BONE2, [T([stern(-4.35), stern(-3.95)], [0.06, 0.1])], 'The first piece of the sternum, where the pectoral muscles and the sternomastoid begin.');
  add(3, 'st_sternebrae', 'sternebrae', 'skel', BONE, D.row(6, function (i) { var x = -3.75 + i * 0.42; return E(stern(x), [0.17, 0.06, 0.1]); }), 'The separate segments of the body of the sternum, joined by cartilage.');
  add(3, 'st_xiph', 'xiphoid process', 'skel', BONE3, [T([stern(-1.2), stern(-0.85)], [0.08, 0.04])], 'The last piece of the sternum. The xiphihumeralis starts here.');
  add(3, 'st_xcart', 'xiphoid cartilage', 'skel', CART, [E(stern(-0.65), [0.2, 0.03, 0.18])], 'A thin flat plate of cartilage on the end of the sternum.');
  add(3, 'st_costal', 'costal cartilages', 'skel', CART, D.row(9, function (i) { var x = TX[i]; return M(T([plus(stern(-4.1 + i * 0.36), [0, 0, 0.1]), surf(x, 52, 0.93)], 0.03)); }), 'Bars of cartilage joining the ribs to the sternum, letting the chest spring open.');
  add(3, 'sh_clav', 'clavicle', 'skel', BONE3, [M(T([[-4.3, 2.15, 0.95], [-4.05, 1.85, 1.3]], 0.025))], 'A thin sliver of bone a couple of centimetres long, buried in the muscle in front of the shoulder and joined to no other bone. It lets the shoulder swing freely and the forepaws land close together under the body.');
  add(3, 'sh_glenoid', 'glenoid cavity', 'skel', DARK, [M(E(plus(SH, [0, 0.08, 0]), [0.08, 0.06, 0.08]))], 'The shallow socket of the shoulder joint on the scapula.', { small: true });
  add(3, 'hu_medep', 'medial epicondyle', 'skel', BONE3, [M(E(plus(EL, [0.02, 0.12, -0.1]), [0.07, 0.06, 0.07]))], 'The knob on the inner side of the lower humerus where the forearm flexors begin.', { small: true });
  add(3, 'hu_supracon', 'supracondyloid foramen', 'skel', DARK, [M(O(plus(lerp(SH, EL, 0.82), [0, 0.1, -0.08]), 0.05, 0.015, [90, 0, 0]))], 'A hole through the lower humerus above the medial epicondyle, carrying the median nerve and brachial artery. Cats have it; people do not.', { small: true });
  add(3, 'pv_pubis', 'pubis', 'skel', BONE, [M(T([[4.5, 1.75, 1.2], [4.9, 2.3, 0.1]], 0.07))], 'The front lower bar of the hip bone, reaching the midline.');
  add(3, 'pv_obtur', 'obturator foramen', 'skel', 0x3a3a44, [M(E([4.95, 1.85, 0.75], [0.25, 0.04, 0.22]))], 'The large opening in each hip bone between the pubis and ischium, closed in life by membrane.', { a: 0.5 });
  add(3, 'pv_symph', 'pubic symphysis', 'skel', CART, [E([5.1, 2.32, 0], [0.32, 0.06, 0.05])], 'The joint where the two hip bones meet in the midline. It is cut through to open the pelvis.');
  add(3, 'fe_patella', 'patella', 'skel', BONE3, [M(E(plus(KN, [-0.12, 0.1, 0]), [0.08, 0.06, 0.07]))], 'The kneecap, a bone grown inside the tendon of the quadriceps.');

  /* ================= plate 4: the arteries ================= */
  var AR = K.artery, AR2 = 0xd9564a;
  add(4, 'ar_extcar', 'external carotid artery', 'circ', AR, [M(T([[-5.9, 2.35, 0.32], [-6.4, 2.45, 0.55], [-6.9, 2.4, 0.7]], 0.03))], 'The main continuation of the common carotid, to the face, tongue and jaws.');
  add(4, 'ar_intcar', 'internal carotid artery', 'circ', AR2, [M(T([[-5.9, 2.35, 0.32], [-6.2, 2.0, 0.35], [-6.3, 1.75, 0.25]], 0.02))], 'A tiny branch into the skull. In an adult cat it shrinks to almost nothing, and the brain is fed mainly by other arteries.', { small: true });
  add(4, 'ar_vert', 'vertebral artery', 'circ', AR, [M(T([[-3.85, 2.35, 0.6], [-4.3, 1.8, 0.45], [-5.2, 1.45, 0.3]], 0.025))], 'The first branch of each subclavian. It runs up the neck through holes in the vertebrae to the brain.');
  add(4, 'ar_costocerv', 'costocervical trunk', 'circ', AR2, [M(T([[-3.85, 2.3, 0.7], [-3.7, 1.7, 0.8], [-3.9, 1.3, 0.7]], 0.025))], 'A branch of the subclavian to the deep muscles of the neck and the first ribs.');
  add(4, 'ar_thyrocerv', 'thyrocervical artery', 'circ', AR, [M(T([[-3.85, 2.25, 0.9], [-4.3, 2.3, 1.05], [-4.7, 2.2, 1.1]], 0.022))], 'A branch of the subclavian to the muscles of the neck and shoulder.');
  add(4, 'ar_axillary', 'axillary artery', 'circ', AR, [M(T([[-3.8, 1.95, 1.2], [-3.85, 1.75, 1.55]], 0.05))], 'The subclavian artery once it leaves the chest and crosses the armpit.');
  add(4, 'ar_ventthor', 'ventral thoracic artery', 'circ', AR2, [M(T([[-3.85, 1.8, 1.45], [-3.3, 2.6, 1.2], [-2.8, 2.9, 0.9]], 0.02))], 'A branch of the axillary to the pectoral muscles.');
  add(4, 'ar_longthor', 'long thoracic artery', 'circ', AR, [M(T([[-3.85, 1.78, 1.5], [-3.0, 2.0, 1.6], [-2.2, 2.1, 1.6]], 0.02))], 'Runs back along the side of the chest wall to the pectoral and latissimus muscles.');
  add(4, 'ar_subscap', 'subscapular artery', 'circ', AR2, [M(T([[-3.85, 1.75, 1.55], [-3.4, 1.2, 1.4], [-3.0, 0.9, 1.2]], 0.03))], 'The largest branch of the axillary, to the muscles round the scapula.');
  add(4, 'ar_thoracodors', 'thoracodorsal artery', 'circ', AR, [M(T([[-3.4, 1.2, 1.4], [-2.6, 1.1, 1.55]], 0.018))], 'A branch of the subscapular to the latissimus dorsi.', { small: true });
  add(4, 'ar_brachial', 'brachial artery', 'circ', AR, [M(T([plus(SH, [0, 0.25, 0]), plus(lerp(SH, EL, 0.5), [0.05, 0.32, 0]), plus(EL, [0.05, 0.25, 0])], 0.035))], 'The artery of the upper arm, running down the inner side with the median nerve and through the supracondyloid foramen.');
  add(4, 'ar_intercost', 'intercostal arteries', 'circ', AR2, D.row(6, function (i) { var x = -3.6 + i * 0.5; return M(T([[x, 0.95, 0.12], [x + 0.08, 1.05, 1.4]], 0.014)); }), 'Paired branches of the aorta, one along the back edge of each rib.', { small: true });
  add(4, 'ar_hepatic', 'hepatic artery', 'circ', AR2, [T([[0.2, 1.35, -0.35], [0.1, 1.7, 0.2], [0.0, 2.0, 0.5]], 0.025)], 'A branch of the celiac trunk to the liver, gallbladder and duodenum.');
  add(4, 'ar_lgastric', 'left gastric artery', 'circ', AR, [T([[0.2, 1.35, -0.35], [0.5, 1.7, -0.75]], 0.022)], 'A branch of the celiac trunk to the inner curve of the stomach.');
  add(4, 'ar_splenic', 'splenic artery', 'circ', AR2, [T([[0.2, 1.35, -0.35], [0.9, 1.65, -1.2], [1.4, 1.8, -1.5]], 0.025)], 'The largest branch of the celiac trunk, to the spleen, pancreas and stomach.');
  add(4, 'ar_adrenolumb', 'adrenolumbar arteries', 'circ', AR, [M(T([[1.5, 0.92, -0.15], [1.65, 1.0, 0.5], [1.7, 0.9, 1.1]], 0.018))], 'A pair passing over the adrenal glands to the muscles of the back.', { small: true });
  add(4, 'ar_gonadal', 'gonadal arteries', 'circ', AR2, [M(T([[3.0, 0.92, -0.12], [3.0, 1.05, 0.6], [3.05, 1.15, 1.0]], 0.016))], 'Testicular arteries in a male, ovarian arteries in a female. A slender pair leaving the aorta behind the kidneys.', { small: true });
  add(4, 'ar_iliolumb', 'iliolumbar arteries', 'circ', AR, [M(T([[4.1, 0.95, -0.1], [4.2, 0.95, 0.6], [4.2, 0.9, 1.2]], 0.018))], 'A pair just in front of the external iliacs, to the muscles of the lower back.', { small: true });
  add(4, 'ar_femoral', 'femoral artery', 'circ', AR, [M(T([[5.0, 1.5, 1.2], plus(lerp(HP, KN, 0.4), [-0.1, 0.38, 0]), plus(KN, [0.05, 0.3, 0])], 0.035))], 'The external iliac once it leaves the body wall, running down the inner thigh in the groove between the sartorius and the adductors. Feel for a pulse here in a live cat.');
  add(4, 'ar_deepfem', 'deep femoral artery', 'circ', AR2, [M(T([[5.0, 1.5, 1.2], [5.3, 1.45, 1.5], [5.5, 1.3, 1.9]], 0.03))], 'A branch at the groin to the muscles at the back of the thigh.');
  add(4, 'ar_saphen', 'saphenous artery', 'circ', AR2, [M(T([plus(KN, [0.05, 0.3, 0]), plus(lerp(KN, HK, 0.6), [0, 0.22, 0])], 0.02))], 'A continuation of the femoral down the inner side of the lower leg, beside the saphenous nerve and vein.', { small: true });
  add(4, 'ar_medsac', 'median sacral (caudal) artery', 'circ', AR, [T([[5.0, 1.2, -0.02], [5.9, 1.35, 0], [6.4, 1.5, 0]], 0.022)], 'The small midline continuation of the aorta into the tail.', { small: true });

  /* ================= plate 5: the veins and lymphatics ================= */
  var VE = K.vein, VE2 = 0x5673bd, PO = 0x34508f, LY = 0xe6d48a;
  add(5, 've_subcl', 'subclavian veins', 'circ', VE, [M(T([[-4.2, 2.45, 0.8], [-4.0, 2.1, 1.2], [-3.85, 1.85, 1.45]], 0.06))], 'Bring blood from the forelimbs to the brachiocephalic veins.');
  add(5, 've_axillary', 'axillary veins', 'circ', VE2, [M(T([[-3.85, 1.85, 1.45], [-3.85, 1.72, 1.62]], 0.05))], 'The veins of the armpit.');
  add(5, 've_brachial', 'brachial veins', 'circ', VE, [M(T([plus(SH, [0.08, 0.22, 0.05]), plus(lerp(SH, EL, 0.5), [0.12, 0.3, 0.05]), plus(EL, [0.1, 0.24, 0.05])], 0.03))], 'The deep veins of the upper arm, beside the brachial artery.');
  add(5, 've_subscap', 'subscapular veins', 'circ', VE2, [M(T([[-3.85, 1.72, 1.62], [-3.4, 1.15, 1.45], [-3.0, 0.9, 1.25]], 0.03))], 'Drain the shoulder muscles into the axillary veins.');
  add(5, 've_cephalic', 'cephalic veins', 'circ', VE2, [M(T([plus(lerp(EL, WR, 0.6), [-0.1, -0.2, -0.05]), plus(EL, [-0.15, -0.28, -0.05]), plus(lerp(SH, EL, 0.4), [-0.15, -0.3, 0]), [-4.6, 1.9, 1.1], [-5.0, 2.2, 0.95]], 0.025))], 'Superficial veins up the front of the forelimb, joining the external jugular. A vet draws blood or places a drip in this vein on the front of the forearm.');
  add(5, 've_vert', 'vertebral veins', 'circ', VE, [M(T([[-3.95, 2.4, 0.45], [-4.3, 1.8, 0.35], [-5.2, 1.5, 0.25]], 0.025))], 'Drain the brain and neck alongside the vertebral arteries.');
  add(5, 've_hepatic', 'hepatic veins', 'circ', VE, [T([[-0.5, 1.95, 0.35], [-0.1, 2.2, 0.6]], 0.05), T([[-0.5, 1.95, 0.25], [0.0, 2.2, -0.5]], 0.05)], 'Short wide veins from the liver straight into the caudal vena cava, just behind the diaphragm.');
  add(5, 've_hportal', 'hepatic portal vein', 'circ', PO, [T([[1.6, 2.05, 0.4], [0.9, 2.0, 0.4], [0.3, 2.2, 0.35]], 0.06)], 'Carries blood from the stomach, intestines, pancreas and spleen to the liver, so that everything absorbed passes through the liver first. It is usually not injected; look for a brown vessel beside the bile duct.');
  add(5, 've_gastrospl', 'gastrosplenic vein', 'circ', PO, [T([[0.9, 2.0, 0.4], [1.0, 2.0, -0.5], [1.3, 2.15, -1.4]], 0.035)], 'The tributary of the portal vein from the stomach and spleen.');
  add(5, 've_cranmes', 'cranial mesenteric vein', 'circ', PO, [T([[1.6, 2.05, 0.4], [2.3, 2.3, 0.8], [3.0, 2.4, 1.0]], 0.04)], 'The largest tributary of the portal vein, from the small intestine.');
  add(5, 've_caudmes', 'caudal mesenteric vein', 'circ', PO, [T([[2.3, 2.3, 0.8], [3.0, 1.7, -0.3], [4.0, 1.55, -0.4]], 0.025)], 'The tributary of the portal system from the colon and rectum.', { small: true });
  add(5, 've_adrenolumb', 'adrenolumbar veins', 'circ', VE2, [M(T([[1.5, 1.0, 0.25], [1.65, 1.05, 0.55], [1.7, 0.95, 1.1]], 0.018))], 'A pair from the adrenal glands and back muscles into the caudal vena cava.', { small: true });
  add(5, 've_gonadal', 'gonadal veins', 'circ', VE, [M(T([[3.0, 0.98, 0.2], [3.0, 1.08, 0.65], [3.05, 1.18, 1.0]], 0.016))], 'From the testes or ovaries. The left one often drains into the left renal vein instead of the vena cava.', { small: true });
  add(5, 've_iliolumb', 'iliolumbar veins', 'circ', VE2, [M(T([[4.1, 1.0, 0.2], [4.2, 1.0, 0.7], [4.2, 0.95, 1.2]], 0.018))], 'From the lower back into the caudal vena cava.', { small: true });
  add(5, 've_comiliac', 'common iliac veins', 'circ', VE, [M(T([[4.9, 1.15, 0.18], [5.05, 1.25, 0.5]], 0.08))], 'The two short wide veins that join to form the caudal vena cava.');
  add(5, 've_extiliac', 'external iliac veins', 'circ', VE2, [M(T([[5.05, 1.25, 0.5], [5.05, 1.45, 1.0], [5.0, 1.55, 1.25]], 0.06))], 'Bring blood from the hindlimbs.');
  add(5, 've_intiliac', 'internal iliac veins', 'circ', VE, [M(T([[5.05, 1.25, 0.5], [5.5, 1.25, 0.55], [5.9, 1.35, 0.5]], 0.035))], 'Drain the pelvic organs and the rump.');
  add(5, 've_femoral', 'femoral veins', 'circ', VE, [M(T([[5.0, 1.55, 1.25], plus(lerp(HP, KN, 0.4), [-0.02, 0.4, 0.03]), plus(KN, [0.1, 0.32, 0.03])], 0.04))], 'The main veins of the thigh, beside the femoral arteries and nerves.');
  add(5, 've_deepfem', 'deep femoral veins', 'circ', VE2, [M(T([[5.0, 1.52, 1.25], [5.35, 1.48, 1.55], [5.55, 1.32, 1.95]], 0.03))], 'Drain the muscles at the back of the thigh.');
  add(5, 've_medsac', 'median sacral (caudal) vein', 'circ', VE2, [T([[4.9, 1.15, 0.1], [5.9, 1.3, 0.05], [6.4, 1.45, 0.02]], 0.02)], 'The small midline vein of the tail.', { small: true });
  add(5, 'ly_thoracic', 'thoracic duct', 'endo', LY, [T([[1.0, 0.95, 0.08], [-1.0, 0.95, 0.05], [-2.6, 1.0, -0.05], [-3.8, 1.6, -0.3], [-4.2, 2.35, -0.75]], 0.022)], 'The main lymph vessel, a thin beaded brownish thread running forward along the aorta. It empties into the left external jugular vein at the base of the neck.', { small: true });
  add(5, 'ly_cisterna', 'cisterna chyli', 'endo', LY, [E([1.2, 0.98, 0.05], [0.25, 0.06, 0.08])], 'A small sac behind the diaphragm where lymph from the gut and hindlimbs collects, milky with fat after a meal. The thoracic duct begins here.', { small: true });
  add(5, 'ly_mesnodes', 'mesenteric lymph nodes', 'endo', 0xd9c7b4, [E([2.4, 2.3, 0.6], [0.28, 0.08, 0.12]), E([2.9, 2.32, 0.8], [0.12, 0.06, 0.08])], 'A large node and smaller ones in the root of the mesentery, filtering lymph from the intestine.');
  add(5, 'ly_axnodes', 'axillary lymph nodes', 'endo', 0xd9c7b4, [M(E([-3.75, 1.95, 1.6], [0.08, 0.06, 0.07]))], 'Small nodes in the armpit, filtering lymph from the forelimb and chest wall.', { small: true });
  add(5, 'ly_ingnodes', 'inguinal lymph nodes', 'endo', 0xd9c7b4, [M(E([4.9, 2.3, 1.0], [0.08, 0.06, 0.07]))], 'Small nodes in the groin, filtering lymph from the hindlimb and belly wall.', { small: true });

  /* ================= plate 6: the nerves ================= */
  var NV = K.nerve, NV2 = 0xe6dc9c, NV3 = 0xfaf6d6;
  var CX = D.pts(12, function (i) { return -6.0 + i * 0.95; });
  add(6, 'nv_brain', 'brain', 'nerv', K.brain, [E([-6.9, 1.4, 0], [0.75, 0.35, 0.55])], 'Inside the skull, shown here only in outline. Compare the sheep brain, which is the usual specimen for studying the brain itself.');
  add(6, 'nv_cord', 'spinal cord', 'nerv', NV, [T(CX.map(function (x) { return [x, vy(x) + 0.05, 0]; }), 0.065)], 'Runs inside the vertebral canal from the brain to the sacrum.');
  add(6, 'nv_cervenl', 'cervical enlargement', 'nerv', NV3, [E([-4.3, vy(-4.3) + 0.05, 0], [0.35, 0.09, 0.12])], 'A thickening of the cord where the nerves of the forelimbs arise.');
  add(6, 'nv_lumbenl', 'lumbar enlargement', 'nerv', NV3, [E([3.2, vy(3.2) + 0.05, 0], [0.4, 0.09, 0.11])], 'A thickening of the cord where the nerves of the hindlimbs arise.');
  add(6, 'nv_cauda', 'cauda equina', 'nerv', NV2, D.row(5, function (i) { return T([[4.4, vy(4.4) + 0.05, 0], [6.0, vy(6.0) + 0.05, (i - 2) * 0.08]], 0.014); }), 'A spray of nerve roots running back inside the canal beyond the end of the cord.');
  add(6, 'nv_drg', 'dorsal root ganglia', 'nerv', NV3, D.row(11, function (i) { var x = -5.0 + i * 0.95; return M(E([x, vy(x) + 0.05, 0.2], [0.05, 0.04, 0.05])); }), 'A bead on the sensory root of each spinal nerve, holding the cell bodies of its sensory neurons.', { small: true });
  add(6, 'nv_spinal', 'spinal nerves', 'nerv', NV2, D.row(11, function (i) { var x = -5.0 + i * 0.95; return M(T([[x, vy(x) + 0.05, 0.24], [x + 0.12, vy(x) + 0.08, 0.75]], 0.016)); }), 'A pair between each two vertebrae, carrying sensation in and commands out.');
  add(6, 'nv_brplex', 'brachial plexus', 'nerv', NV3, [M(E([-3.95, 1.75, 0.95], [0.25, 0.05, 0.25]))].concat(D.row(4, function (i) { var x = -4.6 + i * 0.25; return M(T([[x, vy(x) + 0.05, 0.15], [-3.95, 1.75, 0.9]], 0.025)); })), 'The web formed by the last cervical and first thoracic spinal nerves in the armpit, from which the nerves of the forelimb leave. Clean away the fat between the chest and the arm to see it.');
  add(6, 'nv_musculocut', 'musculocutaneous nerve', 'nerv', NV, [M(T([[-3.95, 1.75, 1.15], plus(lerp(SH, EL, 0.5), [-0.12, 0.34, -0.05]), plus(EL, [-0.15, 0.25, -0.05])], 0.02))], 'The most cranial nerve of the plexus, to the biceps and brachialis.');
  add(6, 'nv_radial', 'radial nerve', 'nerv', NV, [M(T([[-3.9, 1.7, 1.2], plus(lerp(SH, EL, 0.4), [0.18, 0.15, 0.08]), plus(lerp(SH, EL, 0.8), [0.05, -0.25, 0]), plus(lerp(EL, WR, 0.5), [-0.08, -0.2, 0])], 0.03))], 'The largest nerve of the plexus. It winds round the back of the humerus to the triceps and the extensors of the forearm.');
  add(6, 'nv_median', 'median nerve', 'nerv', NV2, [M(T([[-3.95, 1.75, 1.2], plus(lerp(SH, EL, 0.5), [0.02, 0.36, 0]), plus(EL, [0.0, 0.26, -0.04]), plus(lerp(EL, WR, 0.6), [-0.02, 0.2, 0])], 0.022))], 'Runs with the brachial artery through the supracondyloid foramen to the flexors of the forearm and the paw.');
  add(6, 'nv_ulnar', 'ulnar nerve', 'nerv', NV, [M(T([[-3.85, 1.75, 1.25], plus(lerp(SH, EL, 0.5), [0.18, 0.3, 0.08]), plus(EL, [0.15, 0.2, 0.06]), plus(lerp(EL, WR, 0.6), [0.12, 0.17, 0.06])], 0.02))], 'Passes behind the medial epicondyle, the funny bone, to the flexors on the back edge of the forearm.');
  add(6, 'nv_axillary', 'axillary nerve', 'nerv', NV2, [M(T([[-3.85, 1.72, 1.2], plus(SH, [0.1, -0.2, 0.05]), plus(SH, [-0.05, -0.38, 0.12])], 0.018))], 'A short nerve passing behind the shoulder joint to the deltoid muscles.', { small: true });
  add(6, 'nv_lsplex', 'lumbosacral plexus', 'nerv', NV3, [M(E([4.2, 1.05, 0.7], [0.3, 0.05, 0.18]))].concat(D.row(4, function (i) { var x = 3.3 + i * 0.35; return M(T([[x, vy(x) + 0.05, 0.15], [4.2, 1.05, 0.65]], 0.02)); })), 'The web formed by the last lumbar and the sacral spinal nerves, from which the nerves of the hindlimb leave.');
  add(6, 'nv_femoral', 'femoral nerve', 'nerv', NV, [M(T([[4.1, 1.1, 0.75], [4.7, 1.55, 1.15], plus(lerp(HP, KN, 0.35), [-0.18, 0.4, 0])], 0.025))], 'Leaves the body through the groin with the femoral vessels, to the quadriceps.');
  add(6, 'nv_saphen', 'saphenous nerve', 'nerv', NV2, [M(T([plus(lerp(HP, KN, 0.35), [-0.18, 0.4, 0]), plus(KN, [0.0, 0.32, 0.0]), plus(lerp(KN, HK, 0.6), [0.02, 0.24, 0])], 0.016))], 'The long branch of the femoral nerve down the inner side of the leg, to the skin.', { small: true });
  add(6, 'nv_obtur', 'obturator nerve', 'nerv', NV2, [M(T([[4.3, 1.1, 0.7], [4.95, 1.85, 0.75], plus(lerp(HP, KN, 0.3), [0.15, 0.35, 0.03])], 0.018))], 'Passes through the obturator foramen to the adductor muscles of the inner thigh.', { small: true });
  add(6, 'nv_tibial', 'tibial nerve', 'nerv', NV, [M(T([plus(KN, [0.2, -0.3, 0.0]), plus(lerp(KN, HK, 0.5), [0.12, -0.2, -0.1]), plus(HK, [0.08, -0.1, -0.05])], 0.022))], 'The branch of the sciatic nerve to the calf muscles and the sole of the foot.');
  add(6, 'nv_fibular', 'common fibular (peroneal) nerve', 'nerv', NV2, [M(T([plus(KN, [0.2, -0.3, 0.0]), plus(KN, [0.05, -0.3, 0.12]), plus(lerp(KN, HK, 0.5), [-0.08, -0.22, 0.08])], 0.018))], 'The other branch of the sciatic nerve, winding round the knee to the muscles on the front of the leg.');
  add(6, 'nv_symp', 'sympathetic trunk', 'nerv', 0xd9c97a, [M(T([[-4.2, 1.4, 0.3], [-1.0, 1.05, 0.3], [3.0, 1.1, 0.25]], 0.015))].concat(D.row(8, function (i) { return M(E([-3.8 + i * 0.85, 1.15 - (i < 2 ? -0.1 : 0), 0.3], [0.05, 0.035, 0.04])); })), 'A beaded chain on each side of the backbone. In the neck it runs in the same sheath as the vagus nerve, as the vagosympathetic trunk.');
  add(6, 'nv_reclar', 'recurrent laryngeal nerves', 'nerv', NV2, [M(T([[-3.4, 2.3, 0.35], [-3.6, 2.0, 0.25], [-4.4, 2.35, 0.12], [-5.5, 2.45, 0.1]], 0.012))], 'Branches of the vagus that loop back round a great vessel in the chest and climb the neck beside the trachea to the larynx, which they control.', { small: true });

  return {
    steps: [
      { t: 'The mouth and pharynx', view: { t: [0, 0.3, 0], d: 10, ph: 0.25 },
        how: D.ol(['With bone cutters, cut through the angle of the jaw on each side and open the mouth wide (shown laid flat and enlarged).', 'Roof: the <b>hard palate</b> with its ridges, then the <b>soft palate</b>. Slit the soft palate to find the <b>nasopharynx</b>.', 'Floor: run a finger back along the <b>tongue</b> to feel the <b>filiform papillae</b>. Find the <b>epiglottis</b> and the <b>glottis</b> behind it.', 'Count the teeth on one side of each jaw and find the <b>carnassials</b>.']) },
      { t: 'Skeleton: the skull', flip: false, view: { t: [-1.6, 1.3, 0], d: 9.5, ph: 0.25 },
        how: D.ol(['Use a cleaned skull. Work back from the nose along the roof: <b>nasal</b>, <b>frontal</b>, <b>parietal</b>, <b>interparietal</b>, <b>occipital</b>.', 'Find the <b>zygomatic arch</b> and the huge <b>orbit</b>, almost closed behind by the <b>postorbital processes</b>.', 'The <b>mandible</b> has been lifted off and set in front. Note that its two halves are separate at the chin.']) },
      { t: 'Skeleton: from above', flip: true, view: { t: [0.8, 1.6, 0.6], d: 22, ph: 0.3 },
        how: D.ol(['Count the regions of the spine: 7 <b>cervical</b>, 13 <b>thoracic</b>, 7 <b>lumbar</b>, the <b>sacrum</b>, and about 20 <b>caudal</b>.', 'Find the thoracic spine that stands straight up: the spines in front lean back and those behind lean forward.', 'Follow each limb from the girdle to the claws. On the <b>scapula</b>, find the cat’s extra spur, the <b>metacromion</b>.']) },
      { t: 'Skeleton: from below', view: { t: [0.8, 1.6, 0.4], d: 22, ph: 0.3 },
        how: D.ol(['Turn the skeleton over. Find the pieces of the <b>sternum</b> and the <b>costal cartilages</b>.', 'Look for the tiny <b>clavicle</b>, free in front of the shoulder.', 'On the inner side of the lower humerus, find the <b>supracondyloid foramen</b>, a hole a pencil lead would pass through.', 'Find the <b>pubic symphysis</b> where the pelvis is cut for the reproductive dissection.']) },
      { t: 'The arteries', view: { t: [-0.4, 2.0, 0.6], d: 18, ph: 0.25 },
        how: D.ol(['Arteries are injected red. Start at the <b>aortic arch</b> and work outward.', 'Each subclavian gives off, in order, the <b>vertebral</b>, <b>costocervical</b> and <b>thyrocervical</b> arteries, then crosses the armpit as the <b>axillary</b> and becomes the <b>brachial</b>.', 'Below the diaphragm, name the branches of the aorta from front to back. Follow the <b>external iliac</b> out of the body wall to the <b>femoral artery</b>.']) },
      { t: 'The veins and lymphatics', view: { t: [-0.4, 2.0, 0.6], d: 18, ph: 0.25 },
        how: D.ol(['Veins are injected blue. They lie beside the arteries of the same name, but the pattern varies more from cat to cat.', 'Find the <b>cephalic vein</b> on the front of the forelimb, where it joins the external jugular.', 'In the membrane between the liver and the stomach, find the <b>hepatic portal vein</b> and its tributaries.', 'Look along the left side of the aorta for the thin beaded <b>thoracic duct</b>.']) },
      { t: 'The nerves', view: { t: [-0.4, 1.6, 0.8], d: 18, ph: 0.25 },
        how: D.ol(['In the armpit, pick the fat away from the <b>brachial plexus</b> and follow its five nerves into the forelimb.', 'In the groin, find the <b>femoral nerve</b> beside the femoral artery and vein.', 'Follow the sciatic nerve to the knee, where it divides into the <b>tibial</b> and <b>common fibular</b> nerves.', 'Chip away the arches of a few vertebrae to see the <b>spinal cord</b> and the <b>dorsal root ganglia</b>.']) }
    ],
    parts: parts,
    show: {
      4: ['flaps', 'lining', 'rv', 'lv', 'ra', 'la', 'aorta', 'brachio', 'lsubcl', 'rsubcl', 'carotid', 'abaorta', 'celiac', 'cranmes', 'caudmes', 'extiliac', 'intiliac', 'renalav', 'kidney', 'limb_ctx', 'trachea'],
      5: ['flaps', 'lining', 'rv', 'lv', 'ra', 'la', 'cranvc', 'caudvc', 'brcveins', 'azygos', 'extjug', 'intjug', 'abcava', 'renalav', 'kidney', 'limb_ctx', 'trachea'],
      6: ['lining', 'sciatic', 'vagus', 'phrenic', 'limb_ctx', 'abaorta', 'brachio', 'lsubcl', 'rsubcl']
    }
  };
});
