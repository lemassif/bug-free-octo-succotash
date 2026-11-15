/* Leopard frog — atlas plates: the whole skeleton, the musculature, the artery and
   vein trees, and the brain with its cranial and spinal nerves.
   Same coordinates as frog.js: ventral side up (+y), head at -x, the frog's right at +z. */
DX.extend('frog', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, M = D.M, P = D.P, K = D.K;
  var parts = [];
  function add(k, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + k, c, sh, d, o)); }
  var BONE = K.bone, CART = K.cart, DARK = 0x2a2420;
  var on = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(B + arguments[i]); return { on: a }; };
  function mix(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }

  /* ================= plate 0: the skull, lower jaw and hyoid ================= */
  var S = on(1, 2);   /* skull bones are also drawn on the two whole-skeleton plates */
  add(0, 'sk_premax', 'premaxilla', 'skel', BONE, [M(T([[-5.99, 0.62, 0.03], [-5.86, 0.62, 0.42]], 0.08)), M(E([-5.86, 0.5, 0.16], [0.06, 0.12, 0.07]))], 'The small paired bone at the tip of the upper jaw. It carries teeth and a process that rises toward the nostril; when the lower jaw pushes on it, it tips and closes the nostril for lung-filling.', S);
  add(0, 'sk_max', 'maxilla', 'skel', BONE, [M(T([[-5.86, 0.62, 0.42], [-5.6, 0.62, 0.85], [-4.8, 0.62, 1.3], [-4.05, 0.62, 1.42]], 0.07))], 'The long tooth-bearing bone forming most of the rim of the upper jaw.', S);
  add(0, 'sk_qj', 'quadratojugal', 'skel', BONE, [M(T([[-4.05, 0.62, 1.42], [-3.45, 0.64, 1.4]], 0.06))], 'A short toothless bone that carries the upper jaw back from the maxilla to the jaw joint.', S);
  add(0, 'sk_quad', 'quadrate cartilage', 'skel', CART, [M(E([-3.4, 0.7, 1.38], [0.1, 0.12, 0.1]))], 'The unossified block at the back corner of the skull on which the lower jaw hinges.', S);
  add(0, 'sk_nasal', 'nasal', 'skel', BONE, [M(E([-5.32, 0.43, 0.38], [0.36, 0.04, 0.27], [0, 25, 0]))], 'A triangular plate roofing the nasal capsule on each side.', S);
  add(0, 'sk_spheneth', 'sphenethmoid', 'skel', 0xe2d6bd, [E([-4.85, 0.52, 0], [0.2, 0.11, 0.3])], 'A ring of bone encircling the front of the braincase: the “girdle bone”. The olfactory nerves pass through it.', S);
  add(0, 'sk_fp', 'frontoparietal', 'skel', BONE, [M(E([-4.08, 0.42, 0.17], [0.62, 0.045, 0.16]))], 'A long plate roofing the braincase on each side; the frontal and parietal of other vertebrates fused into one.', S);
  add(0, 'sk_prootic', 'prootic (otic capsule)', 'skel', 0xe2d6bd, [M(E([-3.62, 0.5, 0.62], [0.24, 0.14, 0.3]))], 'The bone enclosing the inner ear, projecting sideways from the back of the braincase.', S);
  add(0, 'sk_exocc', 'exoccipital', 'skel', BONE, [M(E([-3.38, 0.52, 0.2], [0.1, 0.13, 0.16]))], 'The paired bone forming the back of the skull around the foramen magnum.', S);
  add(0, 'sk_condyle', 'occipital condyles', 'skel', 0xfaf4e2, [M(E([-3.25, 0.58, 0.14], [0.06, 0.06, 0.07]))], 'Two knobs on the exoccipitals that fit into the atlas. Amphibians and mammals have two; reptiles and birds have one.', S);
  add(0, 'sk_foramen', 'foramen magnum', 'skel', DARK, [E([-3.26, 0.5, 0], [0.03, 0.09, 0.08])], 'The large opening at the back of the skull through which the spinal cord leaves the braincase.', S);
  add(0, 'sk_squam', 'squamosal', 'skel', BONE, [M(T([[-3.42, 0.6, 1.36], [-3.6, 0.45, 1.0]], 0.06)), M(T([[-3.6, 0.45, 1.0], [-4.0, 0.45, 1.12]], 0.045)), M(T([[-3.6, 0.45, 1.0], [-3.6, 0.44, 0.8]], 0.045))], 'A T-shaped bone bracing the jaw joint against the otic capsule. Its forward arm supports the rim of the eardrum.', S);
  add(0, 'sk_ptery', 'pterygoid', 'skel', BONE, [M(T([[-4.5, 0.82, 1.2], [-3.95, 0.84, 1.0], [-3.48, 0.8, 1.3]], 0.05)), M(T([[-3.95, 0.84, 1.0], [-3.7, 0.8, 0.72]], 0.045))], 'A three-armed bone of the palate linking the maxilla, the jaw joint and the otic capsule.', S);
  add(0, 'sk_palat', 'palatine', 'skel', BONE, [M(T([[-4.88, 0.82, 0.2], [-4.82, 0.82, 1.2]], 0.04))], 'A slender crossbar in the roof of the mouth from the sphenethmoid out to the maxilla, in front of the eye.', S);
  add(0, 'sk_vomer', 'vomer', 'skel', BONE, [M(E([-5.3, 0.84, 0.3], [0.2, 0.04, 0.2])), M(E([-5.18, 0.9, 0.24], [0.08, 0.04, 0.05]))], 'A plate in the front of the palate on each side. It carries the vomerine teeth and borders the internal nostril.', S);
  add(0, 'sk_parasph', 'parasphenoid', 'skel', 0xe2d6bd, [T([[-4.8, 0.86, 0], [-3.4, 0.86, 0]], [0.05, 0.1], { sy: 0.4 }), M(T([[-3.62, 0.86, 0], [-3.62, 0.86, 0.6]], 0.05, { sy: 0.5 }))], 'The dagger-shaped bone flooring the braincase, with a crossbar under the ear capsules.', S);
  add(0, 'sk_orbit', 'orbit', 'skel', 0x3a3a44, [M(E([-4.36, 0.92, 0.78], [0.5, 0.015, 0.36]))], 'The huge opening for the eye. It has no bony floor, which is why the eyeball can sink into the mouth to help swallow.', { a: 0.4, on: [B + 1, B + 2] });
  add(0, 'sk_colum', 'columella (stapes)', 'skel', BONE, [M(T([[-3.82, 0.52, 1.28], [-3.68, 0.5, 0.9]], 0.025))], 'The single ear bone: a rod carrying vibrations from the eardrum to the oval window of the inner ear.', S);
  add(0, 'sk_annulus', 'tympanic annulus', 'skel', CART, [M(O([-3.95, 0.58, 1.34], 0.2, 0.025))], 'The ring of cartilage on which the eardrum is stretched.', S);
  var MJ = [[-9.35, 0.6, 0.04], [-9.2, 0.6, 0.45], [-8.95, 0.6, 0.85], [-8.15, 0.6, 1.3], [-7.25, 0.6, 1.42], [-6.8, 0.62, 1.4]];
  var inner = function (p) { return [p[0] + 0.07, p[1] - 0.02, p[2] - 0.09]; };
  add(0, 'sk_mento', 'mentomeckelian', 'skel', BONE, [M(T([MJ[0], MJ[1]], 0.06))], 'The tiny bone at the tip of each half of the lower jaw. Its movement closes the nostrils.');
  add(0, 'sk_dentary', 'dentary', 'skel', BONE, [M(T([MJ[1], MJ[2], MJ[3]], 0.06))], 'The outer bone of the front half of the lower jaw. Toothless in frogs, in spite of its name.');
  add(0, 'sk_angulo', 'angulosplenial', 'skel', 0xe2d6bd, [M(T([MJ[3], MJ[4], MJ[5]], 0.075)), M(E([-6.8, 0.56, 1.4], [0.09, 0.08, 0.08]))], 'The main bone of the back of the lower jaw. It carries the surface that hinges on the quadrate.');
  add(0, 'sk_meckel', 'Meckel’s cartilage', 'skel', CART, [M(T([inner(MJ[1]), inner(MJ[2]), inner(MJ[3]), inner(MJ[4]), inner(MJ[5])], 0.03))], 'The cartilage core of the lower jaw, the original jaw of the embryo, around which the bones form.');
  add(0, 'sk_hyoid', 'hyoid plate (body of the hyoid)', 'skel', CART, [E([-8.2, 0.62, 0], [0.45, 0.035, 0.4])], 'A broad cartilage in the floor of the mouth. The tongue and the muscles that pump the throat attach to it.');
  add(0, 'sk_hy_ant', 'anterior cornua of the hyoid', 'skel', CART, [M(T([[-8.55, 0.62, 0.3], [-8.9, 0.62, 0.6], [-8.6, 0.62, 0.95], [-7.6, 0.6, 1.15], [-7.0, 0.6, 1.05]], 0.03))], 'Long slender horns that curve forward, then back, to attach to the otic capsules: the remains of the hyoid gill arch.');
  add(0, 'sk_hy_post', 'posterior cornua (thyroid processes)', 'skel', BONE, [M(T([[-7.85, 0.62, 0.15], [-7.3, 0.62, 0.4]], 0.045))], 'Two short bony rods projecting back from the hyoid plate to support the larynx.');

  /* ================= plate 1: skeleton from above ================= */
  var V = on(2);
  add(1, 'sk_atlas', 'atlas (first vertebra)', 'skel', 0xfaf4e2, [E([-3.08, 0.55, 0], [0.1, 0.1, 0.2])], 'The only neck vertebra. It has two hollows for the occipital condyles and no transverse processes, so the head can only nod.', V);
  var VX = D.pts(7, function (i) { return -2.78 + i * 0.34; });
  var TPL = [0.55, 0.78, 0.72, 0.5, 0.46, 0.46, 0.46];
  add(1, 'sk_trunk', 'trunk vertebrae (II to VIII)', 'skel', BONE, VX.map(function (x) { return E([x, 0.55, 0], [0.13, 0.1, 0.16]); }), 'Seven typical vertebrae. A frog has only nine in all, plus the urostyle: the shortest backbone of any vertebrate, stiff for jumping.', V);
  add(1, 'sk_tp', 'transverse processes', 'skel', 0xe2d6bd, VX.map(function (x, i) { return M(T([[x, 0.52, 0.15], [x + (i < 3 ? 0.05 : 0.12), 0.5, 0.15 + TPL[i]]], 0.035)); }), 'Sideways spines on vertebrae II to VIII. Frogs have no ribs; these are all that stiffen the flanks.', V);
  add(1, 'sk_nspine', 'neural spines', 'skel', 0xfaf4e2, VX.map(function (x) { return E([x + 0.05, 0.43, 0], [0.1, 0.04, 0.03]); }), 'A low ridge on top of each vertebra where back muscles attach.', V);
  add(1, 'sk_sacral', 'sacral vertebra (IX)', 'skel', 0xfaf4e2, [E([-0.38, 0.55, 0], [0.13, 0.1, 0.17])], 'The ninth vertebra, which carries the pelvic girdle.', V);
  add(1, 'sk_sacdia', 'sacral diapophyses', 'skel', 0xe2d6bd, [M(T([[-0.38, 0.52, 0.15], [-0.22, 0.5, 0.8]], [0.05, 0.08]))], 'The stout transverse processes of the sacral vertebra. The tips of the ilia hinge on them, and this joint flexes in a leap.', V);
  add(1, 'sk_urostyle', 'urostyle', 'skel', BONE, [T([[-0.2, 0.55, 0], [1.0, 0.56, 0], [2.0, 0.6, 0]], [0.1, 0.08, 0.04])], 'A long rod of fused tail vertebrae lying between the ilia. It transmits the thrust of the legs to the spine.', V);
  add(1, 'sk_suprasc', 'suprascapula', 'skel', CART, [M(E([-2.75, 0.36, 0.85], [0.42, 0.04, 0.42]))], 'A broad, partly cartilaginous blade over the back, the top of the shoulder girdle. It is held to the spine only by muscle.', V);
  add(1, 'sk_scapula', 'scapula', 'skel', BONE, [M(T([[-2.8, 0.42, 1.25], [-2.88, 0.92, 1.42]], [0.16, 0.1]))], 'The short shoulder blade, running down from the suprascapula to the shoulder joint.', V);
  add(1, 'sk_humerus', 'humerus', 'skel', BONE, [M(T([[-2.9, 0.95, 1.45], [-3.2, 0.62, 2.6]], [0.08, 0.06])), M(E([-2.9, 0.95, 1.45], [0.1, 0.1, 0.1])), M(E([-3.2, 0.62, 2.6], [0.09, 0.08, 0.09]))], 'The bone of the upper arm.', { on: [B + 2, B + 3, B + 4] });
  add(1, 'sk_deltcrest', 'deltoid crest', 'skel', 0xfaf4e2, [M(E([-2.98, 0.9, 1.82], [0.05, 0.07, 0.22]))], 'A ridge on the humerus for the chest and shoulder muscles. Much larger in males, which clasp the female for hours.', V);
  add(1, 'sk_radioulna', 'radio-ulna', 'skel', BONE, [M(T([[-3.2, 0.62, 2.6], [-4.25, 0.46, 3.28]], [0.07, 0.085]))], 'Radius and ulna fused into one bone, with a groove showing the join. The forearm cannot twist; it is a shock absorber for landing.', { on: [B + 2, B + 3, B + 4] });
  add(1, 'sk_carpals', 'carpals', 'skel', 0xe2d6bd, [M(E([-4.33, 0.45, 3.25], [0.06, 0.04, 0.07])), M(E([-4.38, 0.45, 3.38], [0.06, 0.04, 0.06])), M(E([-4.46, 0.44, 3.3], [0.06, 0.04, 0.08]))], 'Six small wrist bones in two rows.', V);
  var FT = [[-5.2, 0.35, 3.0], [-5.3, 0.35, 3.45], [-5.1, 0.35, 3.9], [-4.7, 0.35, 4.2]], W = [-4.48, 0.43, 3.33];
  add(1, 'sk_metacarp', 'metacarpals', 'skel', BONE, FT.map(function (f) { return M(T([W, mix(W, f, 0.45)], 0.035)); }), 'Four bones of the palm, one to each finger.', V);
  add(1, 'sk_phal_h', 'phalanges of the fingers', 'skel', 0xfaf4e2, FT.map(function (f) { return M(T([mix(W, f, 0.48), mix(W, f, 0.74), f], [0.03, 0.035, 0.02])); }), 'The finger bones. Counting from the inside the formula is 2, 2, 3, 3.', V);
  add(1, 'sk_prepollex', 'prepollex', 'skel', 0xe2d6bd, [M(E([-4.52, 0.42, 3.04], [0.08, 0.03, 0.04]))], 'A vestige of the thumb on the inner side of the hand. In males it supports the nuptial pad.', V);
  add(1, 'sk_ilium', 'ilium', 'skel', BONE, [M(T([[-0.25, 0.5, 0.82], [1.0, 0.6, 0.6], [1.95, 0.75, 0.22]], [0.05, 0.06, 0.09]))], 'A long blade running forward from the hip to the sacral vertebra. The two ilia and the urostyle make the frog’s characteristic hump.', V);
  add(1, 'sk_ischium', 'ischium', 'skel', 0xe2d6bd, [E([2.2, 0.7, 0], [0.13, 0.2, 0.09])], 'The back part of the pelvic disc, the two sides fused in the midline.', V);
  add(1, 'sk_femur', 'femur', 'skel', BONE, [M(T([[2.02, 0.8, 0.3], [2.4, 0.75, 1.6], [2.95, 0.68, 2.88]], [0.07, 0.055, 0.07])), M(E([2.02, 0.8, 0.32], [0.09, 0.09, 0.09]))], 'The thigh bone, slightly S-curved, with a round head that fits the acetabulum.', { on: [B + 2, B + 3, B + 5, B + 6, B + 7] });
  add(1, 'sk_astrag', 'astragalus (tibiale)', 'skel', BONE, [M(T([[5.42, 0.52, 1.64], [6.55, 0.45, 2.28]], 0.05))], 'The inner of two greatly lengthened ankle bones. Together they add a fourth segment to the leg.', V);
  add(1, 'sk_calc', 'calcaneum (fibulare)', 'skel', 0xe2d6bd, [M(T([[5.46, 0.52, 1.8], [6.62, 0.45, 2.5]], 0.05))], 'The outer long ankle bone, joined to the astragalus at both ends.', V);
  add(1, 'sk_dtarsal', 'distal tarsals', 'skel', 0xfaf4e2, [M(E([6.7, 0.44, 2.42], [0.06, 0.04, 0.11]))], 'Two or three tiny bones between the long ankle bones and the foot.', V);
  var TT = [[8.0, 0.35, 1.6], [8.4, 0.35, 2.1], [8.6, 0.35, 2.7], [8.3, 0.35, 3.3], [7.7, 0.35, 3.7]], A = [6.76, 0.43, 2.42];
  add(1, 'sk_metatars', 'metatarsals', 'skel', BONE, TT.map(function (f) { return M(T([A, mix(A, f, 0.45)], 0.035)); }), 'Five long bones of the sole, spread to support the web.', V);
  add(1, 'sk_phal_f', 'phalanges of the toes', 'skel', 0xfaf4e2, TT.map(function (f) { return M(T([mix(A, f, 0.48), mix(A, f, 0.74), f], [0.03, 0.035, 0.02])); }), 'The toe bones. Counting from the inside the formula is 2, 2, 3, 4, 3: the fourth toe is the longest.', V);
  add(1, 'sk_prehallux', 'prehallux (calcar)', 'skel', 0xe2d6bd, [M(E([6.78, 0.42, 2.12], [0.08, 0.03, 0.04]))], 'A small extra “sixth toe” on the inner side of the foot. In spadefoot toads it is enlarged into a digging blade.', V);

  /* ================= plate 2: skeleton from below, and one vertebra ================= */
  add(2, 'sk_clavicle', 'clavicle', 'skel', BONE, [M(T([[-2.92, 1.0, 1.38], [-3.05, 1.5, 0.7], [-3.1, 1.58, 0.08]], 0.045))], 'The slender front bar of the shoulder girdle, from the shoulder joint to the midline.');
  add(2, 'sk_coracoid', 'coracoid', 'skel', 0xe2d6bd, [M(T([[-2.85, 1.0, 1.4], [-2.6, 1.5, 0.7], [-2.5, 1.58, 0.1]], [0.06, 0.07, 0.11]))], 'The stout rear bar of the shoulder girdle. It takes the shock of landing on the forelimbs.');
  add(2, 'sk_epicor', 'epicoracoid cartilages', 'skel', CART, [T([[-3.12, 1.6, 0], [-2.48, 1.6, 0]], 0.06)], 'Strips of cartilage joining the left and right halves of the girdle in the midline.');
  add(2, 'sk_glenoid', 'glenoid fossa', 'skel', DARK, [M(E([-2.9, 0.98, 1.47], [0.08, 0.08, 0.04]))], 'The socket for the head of the humerus, where scapula, clavicle and coracoid meet.');
  add(2, 'sk_epist', 'episternum', 'skel', CART, [E([-3.64, 1.58, 0], [0.16, 0.03, 0.2])], 'A rounded plate of cartilage at the front of the breastbone.');
  add(2, 'sk_omost', 'omosternum', 'skel', BONE, [T([[-3.5, 1.6, 0], [-3.12, 1.6, 0]], 0.04)], 'The bony rod connecting the episternum to the girdle.');
  add(2, 'sk_mesost', 'mesosternum', 'skel', BONE, [T([[-2.48, 1.6, 0], [-2.0, 1.6, 0]], 0.05)], 'The bony rod of the breastbone behind the coracoids.');
  add(2, 'sk_xiphi', 'xiphisternum', 'skel', CART, [E([-1.78, 1.58, 0], [0.22, 0.03, 0.28])], 'The broad cartilage plate at the back of the breastbone. Belly muscles attach to it.');
  add(2, 'sk_pubis', 'pubis', 'skel', CART, [E([2.04, 0.98, 0], [0.13, 0.1, 0.09])], 'The lower part of the pelvic disc. It stays cartilage throughout life.');
  add(2, 'sk_acetab', 'acetabulum', 'skel', DARK, [M(E([2.04, 0.8, 0.2], [0.09, 0.09, 0.04]))], 'The hip socket, formed where ilium, ischium and pubis meet.');
  var ZC = -3.6;
  add(2, 'vt_centrum', 'centrum', 'skel', BONE, [T([[-0.95, 0.42, ZC], [-0.1, 0.42, ZC]], 0.36), E([-0.1, 0.42, ZC], [0.12, 0.3, 0.3])], 'The solid body of a vertebra, drawn here enlarged. In frogs it is hollow in front and rounded behind (procoelous), a ball-and-socket joint with its neighbours.');
  add(2, 'vt_arch', 'neural arch', 'skel', 0xe2d6bd, D.row(5, function (i) { var x = -0.85 + i * 0.16; return T([[x, 0.62, ZC - 0.32], [x, 1.05, ZC - 0.27], [x, 1.26, ZC], [x, 1.05, ZC + 0.27], [x, 0.62, ZC + 0.32]], 0.09); }), 'The bony arch over the spinal cord, rising from the centrum.');
  add(2, 'vt_canal', 'neural canal', 'skel', DARK, [E([-0.52, 0.92, ZC], [0.5, 0.17, 0.17])], 'The tunnel through which the spinal cord runs.');
  add(2, 'vt_spine', 'neural spine of a vertebra', 'skel', 0xfaf4e2, [E([-0.42, 1.42, ZC], [0.3, 0.14, 0.05])], 'The crest on top of the neural arch.');
  add(2, 'vt_tp', 'transverse process of a vertebra', 'skel', BONE, [T([[-0.5, 0.9, ZC - 0.3], [-0.5, 0.95, ZC - 1.2]], [0.1, 0.06]), T([[-0.5, 0.9, ZC + 0.3], [-0.5, 0.95, ZC + 1.2]], [0.1, 0.06])], 'The sideways spine from each side of the arch.');
  add(2, 'vt_prezyg', 'prezygapophyses', 'skel', 0xfaf4e2, [E([-0.98, 1.12, ZC - 0.26], [0.12, 0.05, 0.1]), E([-0.98, 1.12, ZC + 0.26], [0.12, 0.05, 0.1])], 'A pair of facets at the front of the arch that face upward and lock under the vertebra ahead.');
  add(2, 'vt_postzyg', 'postzygapophyses', 'skel', 0xfaf4e2, [E([-0.04, 1.18, ZC - 0.26], [0.12, 0.05, 0.1]), E([-0.04, 1.18, ZC + 0.26], [0.12, 0.05, 0.1])], 'A pair of facets at the back of the arch that face downward and rest on the vertebra behind.');

  /* ================= plate 3: muscles of the back, shoulder and limbs, from above ================= */
  add(3, 'mu_ctx_d', 'trunk, skinned', 'musc', 0xb97768, [T([[-5.9, 1.1, 0], [-5.6, 1.1, 0], [-4.8, 1.1, 0], [-3.9, 1.1, 0], [-3.2, 1.1, 0], [-2.4, 1.1, 0], [-1.0, 1.1, 0], [0.4, 1.1, 0], [1.5, 1.1, 0], [2.3, 1.1, 0]], [0.2, 0.8, 1.24, 1.36, 1.34, 1.52, 1.68, 1.56, 1.08, 0.42], { sy: 0.56, rs: 18 })], '', { x: 1, dull: 1, on: [B + 4] });
  add(3, 'mu_temporalis', 'temporalis', 'musc', K.muscle, [M(E([-3.85, 0.42, 0.98], [0.3, 0.12, 0.2]))], 'From the side of the skull behind the eye to the lower jaw. It closes the mouth.');
  add(3, 'mu_depmand', 'depressor mandibulae', 'musc', K.muscle2, [M(T([[-3.3, 0.34, 0.9], [-3.45, 0.6, 1.4]], [0.24, 0.1], { sy: 0.5 }))], 'A fan behind the eardrum from the back to the tip of the lower jaw behind the hinge. It opens the mouth.');
  add(3, 'mu_dorsscap', 'dorsalis scapulae', 'musc', 0xd08a7c, [M(E([-2.72, 0.26, 0.92], [0.36, 0.06, 0.34]))], 'Covers the suprascapula and runs to the humerus. It raises the arm.');
  add(3, 'mu_latiss', 'latissimus dorsi', 'musc', K.muscle, [M(T([[-1.85, 0.2, 0.6], [-2.4, 0.3, 1.2], [-2.9, 0.75, 1.5]], [0.42, 0.26, 0.07], { sy: 0.25 }))], 'A thin triangle from the fascia of the back, converging on the humerus. It draws the arm up and back.');
  add(3, 'mu_longiss', 'longissimus dorsi', 'musc', K.muscle2, [M(T([[-3.2, 0.3, 0.26], [-1.5, 0.14, 0.3], [-0.2, 0.22, 0.26]], [0.14, 0.24, 0.16], { sy: 0.4 }))], 'The long muscle beside the spine from the skull to the urostyle. It straightens the back and raises the head.');
  add(3, 'mu_iliolumb', 'iliolumbaris', 'musc', 0xd08a7c, [M(T([[-1.6, 0.2, 0.8], [-0.3, 0.3, 0.78]], [0.15, 0.12], { sy: 0.5 }))], 'From the transverse processes back to the tip of the ilium. It bends the trunk sideways.');
  add(3, 'mu_coccsac', 'coccygeosacralis', 'musc', K.muscle, [M(T([[-0.4, 0.32, 0.32], [0.45, 0.4, 0.1]], [0.12, 0.06]))], 'A short muscle from the sacral vertebra to the front of the urostyle.');
  add(3, 'mu_cocciliac', 'coccygeoiliacus', 'musc', K.muscle2, [M(T([[0.2, 0.4, 0.12], [1.0, 0.44, 0.42], [1.7, 0.56, 0.32]], [0.1, 0.17, 0.08], { sy: 0.5 }))], 'Fills the V between the urostyle and the ilium. It holds the urostyle steady so the back stays rigid in a jump.');
  add(3, 'mu_gluteus', 'gluteus', 'musc', K.muscle, [M(T([[1.2, 0.4, 0.66], [1.9, 0.48, 0.86], [2.25, 0.6, 1.25]], [0.1, 0.17, 0.08]))], 'From the outer side of the ilium to the head of the femur. It rotates the thigh.');
  add(3, 'mu_pyrif', 'pyriformis', 'musc', 0xd08a7c, [M(T([[1.9, 0.44, 0.1], [2.4, 0.42, 0.95]], [0.05, 0.06]))], 'A slender muscle from the tip of the urostyle to the femur. The sciatic nerve passes beside it.');
  add(3, 'mu_iliofib', 'iliofibularis (biceps femoris)', 'musc', 0xdc9484, [M(T([[2.1, 0.36, 0.86], [2.5, 0.32, 1.85], [2.98, 0.46, 2.86]], 0.1))], 'The narrow muscle on the back of the thigh between the triceps femoris and the semimembranosus. It bends the knee.');
  add(3, 'mu_semitend', 'semitendinosus', 'musc', 0xb86a5c, [M(T([[2.6, 0.62, 0.8], [3.0, 0.6, 1.8], [3.22, 0.62, 2.76]], 0.1))], 'A deep, two-headed muscle of the inner thigh, found by separating the gracilis major from the adductor magnus. It bends the knee.', { on: [B + 4] });
  add(3, 'mu_deltoid', 'deltoid', 'musc', K.muscle, [M(T([[-3.08, 0.78, 1.25], [-3.12, 0.7, 1.95]], [0.2, 0.09]))], 'From the scapula and clavicle to the deltoid crest. It draws the arm forward.', { on: [B + 4] });
  add(3, 'mu_tricbr', 'triceps brachii (anconeus)', 'musc', K.muscle2, [M(T([[-2.84, 0.6, 1.46], [-3.02, 0.48, 2.0], [-3.2, 0.52, 2.6]], [0.14, 0.22, 0.08]))], 'The large muscle on the back of the upper arm. It straightens the elbow, catching the frog as it lands.');
  add(3, 'mu_extfore', 'extensor muscles of the forearm', 'musc', 0xd08a7c, [M(T([[-3.2, 0.48, 2.62], [-3.72, 0.38, 2.98], [-4.3, 0.38, 3.3]], [0.08, 0.15, 0.05]))], 'A group on the back of the forearm that raises the hand and spreads the fingers.');

  /* ================= plate 4: muscles of the throat, chest and limbs, from below ================= */
  add(4, 'mu_submental', 'submentalis', 'musc', K.muscle2, [T([[-5.8, 1.5, -0.22], [-5.8, 1.5, 0.22]], 0.06)], 'A tiny crosswise muscle at the tip of the lower jaw. It lifts the tips of the jaw to close the nostrils.');
  add(4, 'mu_geniohy', 'geniohyoid', 'musc', K.muscle, [M(T([[-5.65, 1.6, 0.14], [-4.75, 1.84, 0.22]], [0.06, 0.11], { sy: 0.4 }))], 'A strap from the chin to the hyoid, under the mylohyoid. It draws the hyoid forward and helps open the mouth.');
  add(4, 'mu_hyogl', 'hyoglossus', 'musc', 0xd08a7c, [T([[-4.7, 1.86, 0], [-3.95, 1.92, 0]], [0.1, 0.14], { sy: 0.4 })], 'From the back of the hyoid into the tongue. It pulls the flipped-out tongue back into the mouth.');
  add(4, 'mu_sternohy', 'sternohyoid', 'musc', K.muscle2, [M(T([[-4.7, 1.83, 0.36], [-3.92, 1.9, 0.32]], [0.1, 0.12], { sy: 0.4 }))], 'From the breastbone forward to the hyoid. It lowers the floor of the mouth, drawing air in through the nostrils.');
  add(4, 'mu_coracorad', 'coracoradialis', 'musc', K.muscle, [M(T([[-2.98, 1.92, 0.2], [-3.0, 1.74, 1.0], [-3.16, 0.9, 2.4]], [0.2, 0.14, 0.04], { sy: 0.4 }))], 'A fan from the front of the girdle whose long tendon runs to the radio-ulna. It bends the elbow, as the biceps does in mammals.');
  add(4, 'mu_coracobr', 'coracobrachialis', 'musc', 0xb86a5c, [M(T([[-2.55, 1.9, 0.6], [-2.96, 1.1, 1.7]], [0.1, 0.07]))], 'From the coracoid to the middle of the humerus. It draws the arm toward the body.');
  add(4, 'mu_flexfore', 'flexor muscles of the forearm', 'musc', 0xd08a7c, [M(T([[-3.2, 0.78, 2.6], [-3.76, 0.66, 2.96], [-4.3, 0.52, 3.3]], [0.08, 0.15, 0.05]))], 'A group on the palm side of the forearm that bends the wrist and fingers.');
  add(4, 'mu_pectineus', 'pectineus', 'musc', 0xdc9484, [M(T([[2.08, 1.12, 0.72], [2.38, 1.06, 1.3]], [0.11, 0.06]))], 'A short muscle from the pubis to the femur, just behind the adductor longus. It draws the thigh inward.');
  add(4, 'mu_extcruris', 'extensor cruris', 'musc', K.muscle2, [M(T([[2.98, 0.94, 2.98], [3.8, 0.9, 2.64]], [0.07, 0.1]))], 'A small muscle on the front of the shank, from the femur to the tibiofibula. It straightens the knee.');
  add(4, 'mu_tibpost', 'tibialis posterior', 'musc', 0xb86a5c, [M(T([[3.2, 0.62, 2.72], [4.3, 0.62, 2.18], [5.3, 0.54, 1.74]], [0.06, 0.1, 0.04]))], 'Lies deep against the back of the tibiofibula, under the gastrocnemius. It extends the ankle.');

  /* ================= plate 5: the arteries ================= */
  var AR = K.artery, AR2 = 0xd9564a;
  add(5, 'ar_carbody', 'carotid body (carotid gland)', 'circ', 0x8c2f2a, [M(E([-4.3, 1.15, 0.72], [0.08, 0.07, 0.07]))], 'A small spongy swelling where the carotid arch divides. It senses blood pressure and oxygen.');
  add(5, 'ar_extcar', 'external carotid (lingual) artery', 'circ', AR2, [M(T([[-4.3, 1.15, 0.72], [-4.9, 1.2, 0.45], [-5.45, 1.2, 0.28]], 0.03))], 'The inner branch of the carotid arch, to the tongue and floor of the mouth.');
  add(5, 'ar_intcar', 'internal carotid artery', 'circ', AR, [M(T([[-4.3, 1.15, 0.72], [-4.52, 0.9, 0.95], [-4.5, 0.7, 0.6]], 0.03))], 'The outer branch of the carotid arch, turning up into the skull to supply the brain and eye.');
  add(5, 'ar_occvert', 'occipito-vertebral artery', 'circ', AR2, [M(T([[-3.2, 0.86, 0.95], [-3.3, 0.6, 0.5], [-3.62, 0.55, 0.3]], 0.028))], 'Leaves the systemic arch and divides: one branch forward to the skull, one back along the spine.');
  add(5, 'ar_subcl', 'subclavian artery', 'circ', AR, [M(T([[-3.0, 0.7, 0.92], [-2.95, 0.8, 1.4], [-3.1, 0.7, 2.2]], 0.035))], 'Leaves the systemic arch for the shoulder and continues down the arm as the brachial artery.');
  add(5, 'ar_coelmes', 'coeliacomesenteric artery', 'circ', AR, [T([[-1.5, 0.45, 0], [-1.2, 0.7, -0.2], [-0.9, 0.85, -0.4]], 0.045)], 'The single large artery to the gut, leaving the dorsal aorta just where the two systemic arches join.');
  add(5, 'ar_coeliac', 'coeliac artery', 'circ', AR2, [T([[-0.9, 0.85, -0.4], [-1.2, 0.95, -0.7], [-1.5, 1.0, -0.85]], 0.035)], 'The forward branch of the coeliacomesenteric, to the stomach, liver and pancreas.');
  add(5, 'ar_hepatic', 'hepatic artery', 'circ', AR, [T([[-1.2, 0.95, -0.7], [-1.6, 1.1, -0.3], [-1.8, 1.2, 0]], 0.025)], 'A branch of the coeliac carrying oxygenated blood to the liver and gallbladder.');
  add(5, 'ar_antmes', 'anterior mesenteric artery', 'circ', AR2, [T([[-0.9, 0.85, -0.4], [-0.3, 1.0, 0], [0.3, 1.1, 0.4]], 0.035)], 'The rear branch of the coeliacomesenteric, fanning through the mesentery to the intestine and spleen.');
  add(5, 'ar_postmes', 'posterior mesenteric artery', 'circ', AR, [T([[1.2, 0.46, 0], [1.4, 0.7, 0], [1.6, 0.82, 0]], 0.025)], 'A small artery from the end of the aorta to the large intestine.');
  add(5, 'ar_urogen', 'urogenital (renal) arteries', 'circ', AR2, D.row(4, function (i) { return M(T([[0.3 + i * 0.35, 0.44, 0], [0.35 + i * 0.35, 0.5, 0.3]], 0.02)); }), 'Four to six pairs of short arteries from the aorta to the kidneys, gonads and fat bodies.');
  add(5, 'ar_iliac', 'common iliac arteries', 'circ', AR, [M(T([[2.0, 0.5, 0], [2.2, 0.55, 0.4], [2.32, 0.6, 0.76]], 0.045))], 'The two branches into which the dorsal aorta divides at its hind end, one to each leg.');
  add(5, 'ar_epigves', 'epigastrico-vesical artery', 'circ', AR2, [M(T([[2.2, 0.55, 0.4], [1.9, 1.0, 0.5], [1.75, 1.25, 0.3]], 0.022))], 'A branch of each iliac to the bladder and the belly wall.');
  add(5, 'ar_femoral', 'femoral artery', 'circ', AR2, [M(T([[2.32, 0.6, 0.76], [2.42, 0.9, 1.25]], 0.022))], 'A small branch of the iliac to the skin and muscles of the front of the thigh.');
  add(5, 'ar_sciatic', 'sciatic artery', 'circ', AR, [M(T([[2.32, 0.6, 0.76], [2.9, 0.58, 1.75], [3.2, 0.6, 2.7]], 0.03))], 'The main continuation of the iliac, running down the back of the thigh beside the sciatic nerve.');
  add(5, 'ar_pulm', 'pulmonary artery', 'circ', 0x7a4a8a, [M(T([[-2.75, 0.92, 1.02], [-2.2, 0.85, 1.06], [-1.5, 0.8, 1.06]], 0.03))], 'The branch of the pulmocutaneous arch running along the lung. It carries oxygen-poor blood.');
  add(5, 'ar_cutan', 'cutaneous artery', 'circ', 0x8d5a9c, [M(T([[-2.75, 0.92, 1.02], [-2.9, 0.6, 1.5], [-2.6, 0.4, 1.78]], 0.03))], 'The branch of the pulmocutaneous arch to the skin of the back and sides, the frog’s second lung.');

  /* ================= plate 6: the veins ================= */
  var VE = K.vein, VE2 = 0x5673bd;
  add(6, 've_extjug', 'external jugular vein', 'circ', VE2, [M(T([[-3.75, 1.05, 0.95], [-4.3, 1.2, 0.8], [-4.9, 1.25, 0.5]], 0.035))], 'Drains the tongue and floor of the mouth into the anterior vena cava.');
  add(6, 've_innom', 'innominate vein', 'circ', VE, [M(T([[-3.75, 1.05, 0.95], [-3.9, 0.85, 1.2]], 0.035))], 'A short trunk formed by the internal jugular and subscapular veins.');
  add(6, 've_intjug', 'internal jugular vein', 'circ', VE2, [M(T([[-3.9, 0.85, 1.2], [-4.3, 0.7, 1.0], [-4.5, 0.6, 0.6]], 0.028))], 'Drains the brain and the inside of the skull.');
  add(6, 've_subscap', 'subscapular vein', 'circ', VE, [M(T([[-3.9, 0.85, 1.2], [-3.3, 0.6, 1.4]], 0.025))], 'Drains the shoulder and the back of the arm.');
  add(6, 've_subcl', 'subclavian vein', 'circ', VE, [M(T([[-3.75, 1.05, 0.95], [-3.3, 1.0, 1.35], [-3.0, 0.9, 1.5]], 0.035))], 'The outer tributary of the anterior vena cava, formed by the brachial and musculocutaneous veins.');
  add(6, 've_brach', 'brachial vein', 'circ', VE2, [M(T([[-3.0, 0.9, 1.5], [-3.15, 0.75, 2.3]], 0.028))], 'Drains the arm.');
  add(6, 've_muscut', 'musculocutaneous vein', 'circ', VE2, [M(T([[-3.0, 0.9, 1.5], [-2.3, 0.7, 1.75], [-1.2, 0.6, 1.85], [-0.2, 0.6, 1.75]], 0.03))], 'A long vein from the skin and muscles of the flank. It returns blood that has picked up oxygen through the skin.');
  add(6, 've_pulm', 'pulmonary veins', 'circ', 0xc2362b, [M(T([[-1.9, 0.95, 0.95], [-2.5, 1.1, 0.5], [-2.95, 1.2, 0.05]], 0.028))], 'Carry oxygenated blood from the lungs. The two join and enter the left atrium, the only veins that do.');
  add(6, 've_hepatic', 'hepatic veins', 'circ', VE, [M(T([[-1.6, 1.1, 0.5], [-2.1, 0.98, 0.15]], 0.04))], 'Two short veins from the liver into the posterior vena cava just before the heart.');
  add(6, 've_hportal', 'hepatic portal vein', 'circ', 0x34508f, [T([[0.3, 1.05, 0.3], [-0.5, 1.05, 0], [-1.3, 1.15, -0.2]], 0.04)], 'Collects blood from the stomach, intestine, pancreas and spleen and takes it to the liver before it reaches the heart.');
  add(6, 've_renal', 'renal veins', 'circ', VE2, D.row(4, function (i) { return M(T([[0.3 + i * 0.35, 0.7, 0.04], [0.35 + i * 0.35, 0.56, 0.32]], 0.02)); }), 'Four or five pairs of short veins from the kidneys. Together they form the posterior vena cava.');
  add(6, 've_rportal', 'renal portal vein', 'circ', 0x34508f, [M(T([[2.2, 0.62, 0.8], [1.7, 0.5, 0.74], [0.9, 0.48, 0.74], [0.1, 0.5, 0.7]], 0.03))], 'Runs along the outer edge of the kidney, bringing blood from the leg to be filtered. Mammals have no renal portal system.');
  add(6, 've_femoral', 'femoral vein', 'circ', VE, [M(T([[2.9, 0.9, 2.5], [2.5, 0.9, 1.5], [2.2, 0.8, 0.9]], 0.035))], 'The large vein of the front of the thigh. At the hip it divides into the pelvic vein and a branch to the renal portal.');
  add(6, 've_sciatic', 'sciatic vein', 'circ', VE2, [M(T([[3.1, 0.5, 2.6], [2.7, 0.5, 1.6], [2.2, 0.62, 0.8]], 0.03))], 'The vein of the back of the thigh. It joins the renal portal vein.');
  add(6, 've_pelvic', 'pelvic veins', 'circ', VE, [M(T([[2.2, 0.8, 0.9], [2.1, 1.2, 0.4], [1.9, 1.35, 0]], 0.03))], 'One from each femoral vein. They meet in the midline to form the ventral abdominal vein.');
  add(6, 've_dorsolumb', 'dorsolumbar vein', 'circ', VE2, [M(T([[0.4, 0.4, 1.2], [0.5, 0.48, 0.76]], 0.02))], 'Drains the muscles of the back into the renal portal vein.');

  /* ================= plate 7: brain, cranial nerves and spinal nerves, from above ================= */
  var NV = K.nerve;
  add(7, 'ne_pineal', 'pineal body (epiphysis)', 'nerv', 0xb98a7a, [E([-4.02, 0.46, 0], [0.05, 0.03, 0.05])], 'A tiny stalked body on the roof of the diencephalon. It responds to light through the skull and sets daily and seasonal rhythms.');
  add(7, 'ne_v4', 'fourth ventricle', 'nerv', 0x6a3a3a, [E([-3.3, 0.5, 0], [0.14, 0.03, 0.1])], 'The triangular cavity on top of the medulla, roofed only by a thin vascular membrane.');
  add(7, 'ne_cordx', 'spinal cord (continued)', 'nerv', NV, [T([[-2.5, 0.64, 0], [-0.5, 0.64, 0]], 0.08, { sy: 0.7 })], '', { x: 1 });
  add(7, 'ne_brenl', 'brachial enlargement', 'nerv', 0xfaf6d6, [E([-2.6, 0.62, 0], [0.26, 0.085, 0.14])], 'A swelling of the cord where the nerves to the arms arise.');
  add(7, 'ne_luenl', 'lumbar enlargement', 'nerv', 0xfaf6d6, [E([-0.95, 0.62, 0], [0.26, 0.085, 0.13])], 'A swelling of the cord where the nerves to the legs arise.');
  add(7, 'ne_filum', 'filum terminale', 'nerv', NV, [T([[-0.5, 0.64, 0], [1.3, 0.62, 0]], [0.05, 0.015])], 'The thread-like end of the spinal cord, running back inside the urostyle.');
  add(7, 'ne_II', 'optic nerve (cranial nerve II)', 'nerv', NV, [M(T([[-4.05, 0.68, 0.1], [-4.4, 0.62, 0.5], [-4.62, 0.5, 0.76]], 0.035))], 'Sensory, from the retina. The two cross under the diencephalon at the optic chiasma.');
  add(7, 'ne_III', 'oculomotor nerve (III)', 'nerv', 0xe6dc9c, [M(T([[-3.8, 0.66, 0.12], [-4.2, 0.6, 0.52]], 0.015))], 'Motor, to four of the six muscles that move the eyeball.');
  add(7, 'ne_IV', 'trochlear nerve (IV)', 'nerv', 0xe6dc9c, [M(T([[-3.6, 0.46, 0.15], [-4.1, 0.45, 0.56]], 0.012))], 'Motor, to the superior oblique eye muscle. The thinnest cranial nerve, and the only one leaving the top of the brain.');
  add(7, 'ne_V', 'trigeminal nerve (V)', 'nerv', NV, [M(T([[-3.4, 0.6, 0.2], [-3.7, 0.58, 0.6], [-4.3, 0.56, 1.0]], 0.03))], 'Mixed: sensation from the skin of the head and mouth, and motor to the jaw muscles.');
  add(7, 'ne_gasser', 'Gasserian (semilunar) ganglion', 'nerv', 0xfaf6d6, [M(E([-3.62, 0.58, 0.5], [0.07, 0.05, 0.07]))], 'The swelling on the trigeminal nerve holding its sensory cell bodies.');
  add(7, 'ne_VI', 'abducens nerve (VI)', 'nerv', 0xe6dc9c, [M(T([[-3.3, 0.7, 0.08], [-3.9, 0.66, 0.52]], 0.012))], 'Motor, to the muscle that turns the eye outward and the one that retracts it.');
  add(7, 'ne_VII', 'facial nerve (VII)', 'nerv', NV, [M(T([[-3.36, 0.6, 0.2], [-3.6, 0.6, 0.75], [-3.9, 0.62, 1.15]], 0.02))], 'Mixed: taste from the palate, and motor to the muscles of the throat and the mouth-opening muscle.');
  add(7, 'ne_VIII', 'auditory nerve (VIII)', 'nerv', NV, [M(T([[-3.32, 0.58, 0.2], [-3.5, 0.55, 0.5]], 0.028))], 'Sensory, from the inner ear: hearing and balance.');
  add(7, 'ne_canals', 'semicircular canals (inner ear)', 'nerv', 0xdbe7ee, [M(O([-3.62, 0.5, 0.64], 0.12, 0.02, [90, 0, 0])), M(O([-3.62, 0.5, 0.64], 0.11, 0.02)), M(O([-3.62, 0.5, 0.64], 0.1, 0.02, [0, 90, 0]))], 'Three loops at right angles inside the otic capsule. Each detects rotation in one plane.');
  add(7, 'ne_IX', 'glossopharyngeal nerve (IX)', 'nerv', 0xe6dc9c, [M(T([[-3.2, 0.62, 0.16], [-3.3, 0.7, 0.8], [-3.8, 0.9, 1.0]], 0.018))], 'Mixed: taste and touch from the tongue, and motor to throat muscles.');
  add(7, 'ne_X', 'vagus nerve (X)', 'nerv', NV, [M(T([[-3.15, 0.62, 0.15], [-3.0, 0.7, 0.8], [-2.6, 0.9, 0.95]], 0.025))], 'The “wanderer”: it leaves the head for the heart, lungs, stomach and larynx.');
  add(7, 'ne_sp1', 'spinal nerve I (hypoglossal)', 'nerv', 0xe6dc9c, [M(T([[-2.95, 0.64, 0.1], [-3.2, 0.9, 0.7], [-4.2, 1.3, 0.4]], 0.018))], 'Leaves between the atlas and the second vertebra and curves forward to the tongue. In mammals it is a cranial nerve.');
  add(7, 'ne_sp2', 'spinal nerve II (brachial nerve)', 'nerv', NV, [M(T([[-2.65, 0.64, 0.1], [-2.75, 0.7, 1.0], [-3.0, 0.75, 1.8]], 0.035))], 'The large nerve to the arm.');
  add(7, 'ne_sp3', 'spinal nerve III', 'nerv', 0xe6dc9c, [M(T([[-2.4, 0.64, 0.1], [-2.6, 0.68, 0.72]], 0.02))], 'A small nerve that joins the second to form the brachial plexus.');
  add(7, 'ne_brplex', 'brachial plexus', 'nerv', 0xfaf6d6, [M(E([-2.7, 0.7, 0.86], [0.1, 0.04, 0.12]))], 'The junction of spinal nerves II and III (with a twig from I) from which the nerves of the arm are sorted out.');
  add(7, 'ne_sp456', 'spinal nerves IV, V and VI', 'nerv', 0xe6dc9c, D.row(3, function (i) { return M(T([[-2.05 + i * 0.3, 0.64, 0.08], [-1.6 + i * 0.35, 0.6, 1.2]], 0.015)); }), 'Three slender nerves running obliquely back to the muscles and skin of the body wall.');
  add(7, 'ne_sp789', 'spinal nerves VII, VIII and IX', 'nerv', NV, D.row(3, function (i) { return M(T([[-1.1 + i * 0.2, 0.64, 0.08], [0.2 + i * 0.1, 0.62, 0.3 + i * 0.06], [1.25, 0.6, 0.5]], 0.022)); }), 'Three stout nerves that run back and converge to form the sciatic plexus.');
  add(7, 'ne_scplex', 'sciatic (lumbosacral) plexus', 'nerv', 0xfaf6d6, [M(E([1.4, 0.6, 0.55], [0.2, 0.04, 0.1])), M(T([[1.55, 0.6, 0.58], [2.3, 0.62, 0.7]], 0.035))], 'The network formed by nerves VII to IX. From it the sciatic nerve, the largest in the body, runs down the leg.');
  add(7, 'ne_sp10', 'spinal nerve X (coccygeal)', 'nerv', 0xe6dc9c, [M(T([[-0.5, 0.64, 0.04], [1.0, 0.62, 0.12], [1.9, 0.6, 0.25]], 0.012))], 'The last and smallest spinal nerve, emerging through the urostyle to the bladder and cloaca.');
  add(7, 'ne_symp', 'sympathetic trunk and ganglia', 'nerv', 0xd9c97a, [M(T([[-3.0, 0.76, 0.22], [-1.5, 0.76, 0.24], [0.2, 0.74, 0.2], [1.2, 0.72, 0.14]], 0.015))].concat(D.row(8, function (i) { return M(E([-2.9 + i * 0.52, 0.76, 0.23], [0.045, 0.03, 0.035])); })), 'A beaded chain on each side of the spine, linked to every spinal nerve. It controls the heart, gut and blood vessels without conscious effort.');
  add(7, 'ne_calc', 'calcareous bodies (glands of Swammerdam)', 'nerv', 0xffffff, D.row(8, function (i) { return M(E([-2.95 + i * 0.3, 0.6, 0.14], [0.06, 0.04, 0.05])); }), 'Chalky white sacs around the root of each spinal nerve where it leaves the backbone. They store calcium.');
  /* ventral view of the brain, laid out to one side */
  var ZB = 3.4;
  add(7, 'ne_ventctx', 'brain, ventral surface', 'nerv', K.brain2, [E([-4.86, 0.6, ZB + 0.13], [0.22, 0.1, 0.12]), E([-4.86, 0.6, ZB - 0.13], [0.22, 0.1, 0.12]), E([-4.4, 0.6, ZB + 0.17], [0.33, 0.12, 0.16]), E([-4.4, 0.6, ZB - 0.17], [0.33, 0.12, 0.16]), E([-3.9, 0.62, ZB], [0.26, 0.1, 0.24]), T([[-3.6, 0.62, ZB], [-3.0, 0.62, ZB]], [0.22, 0.12], { sy: 0.6 })], '', { x: 1, dull: 1 });
  add(7, 'ne_chiasma', 'optic chiasma', 'nerv', 0xfaf6d6, [E([-4.08, 0.48, ZB], [0.07, 0.04, 0.16]), T([[-4.1, 0.48, ZB + 0.12], [-4.4, 0.46, ZB + 0.5]], 0.035), T([[-4.1, 0.48, ZB - 0.12], [-4.4, 0.46, ZB - 0.5]], 0.035)], 'The X-shaped crossing of the optic nerves under the diencephalon. In frogs every fibre crosses to the other side.');
  add(7, 'ne_infund', 'infundibulum', 'nerv', 0xcfa594, [E([-3.86, 0.48, ZB], [0.13, 0.05, 0.13])], 'A funnel-like outgrowth of the floor of the diencephalon, behind the chiasma, to which the pituitary is attached.');
  add(7, 'ne_pituit', 'pituitary (hypophysis)', 'endo', 0xe8b7c8, [E([-3.68, 0.46, ZB], [0.09, 0.05, 0.1])], 'The master endocrine gland. Its hormones drive growth, colour change, and the release of eggs; injecting pituitary extract makes a frog ovulate on demand.');

  return {
    steps: [
      { t: 'Skeleton: the skull', flip: true, view: { t: [-6.3, 1.6, 0], d: 9.5, ph: 0.3 },
        how: D.ol(['Skeletons are studied from a prepared, cleaned frog, not from your dissection specimen.', 'Start at the tip of the upper jaw and work back along the rim: <b>premaxilla</b>, <b>maxilla</b>, <b>quadratojugal</b>.', 'Find the roofing bones (<b>nasal</b>, <b>frontoparietal</b>), then look through the <b>orbit</b> at the palate bones beneath.', 'The <b>lower jaw</b> and the <b>hyoid</b> have been lifted off and set in front.']) },
      { t: 'Skeleton: from above', flip: true, view: { t: [1.2, 1.6, 0.9], d: 18, ph: 0.3 },
        how: D.ol(['Count the vertebrae: one <b>atlas</b>, seven <b>trunk vertebrae</b>, one <b>sacral</b>, then the <b>urostyle</b>.', 'Note that there are <b>no ribs</b>.', 'Follow the forelimb from the <b>suprascapula</b> out to the fingers, then the hindlimb from the <b>ilium</b> to the toes. The leg has four long segments, not three.']) },
      { t: 'Skeleton: from below, and one vertebra', view: { t: [1.0, 1.0, 0.2], d: 19.5, ph: 0.3 },
        how: D.ol(['Turn the skeleton over. The ventral half of the shoulder girdle is two bars on each side: <b>clavicle</b> in front, <b>coracoid</b> behind.', 'Find the four parts of the breastbone strung along the midline.', 'At the hip, find the <b>acetabulum</b> and the cartilaginous <b>pubis</b>.', 'The single enlarged vertebra beside the skeleton shows the parts every vertebra shares.']) },
      { t: 'Muscles: the back, shoulder and thigh', flip: true, view: { t: [0.4, 1.7, 0.8], d: 16.5, ph: 0.3 },
        how: D.ol(['Skin the back and the dorsal side of the limbs.', 'Clear the thin, shiny <b>dorsal fascia</b> to expose the long muscles beside the spine.', 'Separate muscles by running a blunt probe along the pale lines between them. Do not cut across fibres.', 'On the back of the thigh, find the narrow <b>iliofibularis</b> between two large muscles.']) },
      { t: 'Muscles: the throat, chest and limbs', view: { t: [-1.0, 1.4, 0.6], d: 13, ph: 0.3 },
        how: D.ol(['With the frog on its back, cut through the <b>mylohyoid</b> in the midline and fold it aside.', 'Underneath are the strap muscles that work the tongue and pump the throat.', 'On the chest the pectoralis has been removed to show the <b>coracoradialis</b> and <b>coracobrachialis</b> beneath it.', 'In the leg, part the muscles you have already named to find the deep ones.']) },
      { t: 'The arteries', view: { t: [-0.9, 1.1, 0.3], d: 10.5, ph: 0.25 },
        how: D.ol(['Use a frog whose arteries have been injected with red latex.', 'Each <b>truncus arteriosus</b> splits into three arches. Trace the <b>carotid</b> forward, the <b>systemic</b> round to the back, the <b>pulmocutaneous</b> to lung and skin.', 'Lift the stomach to your left to see the systemic arches meet as the <b>dorsal aorta</b>, and the single artery to the gut leave it.', 'Follow the aorta back to where it forks into the <b>common iliac arteries</b>.']) },
      { t: 'The veins', view: { t: [-0.9, 1.1, 0.3], d: 10.5, ph: 0.25 },
        how: D.ol(['Veins are injected blue. Lift the tip of the ventricle forward to see the <b>sinus venosus</b>.', 'Three large veins enter it: two <b>anterior venae cavae</b> and one <b>posterior vena cava</b>. Trace the three tributaries of each anterior cava.', 'Find the two portal systems: blood from the gut goes to the <b>liver</b> first, and blood from the legs goes to the <b>kidneys</b> or the liver first.']) },
      { t: 'Brain, cranial nerves and spinal nerves', flip: true, view: { t: [-1.6, 1.6, -1.2], d: 12, ph: 0.3 },
        how: D.ol(['Chip away the roof of the skull and the neural arches with fine forceps, working backward from between the eyes.', 'Ten pairs of <b>cranial nerves</b> leave the brain; the thicker ones can be seen as white threads.', 'Ten pairs of <b>spinal nerves</b> leave the cord. Each emerges through a white <b>calcareous body</b>.', 'Lift the brain out and turn it over to see the <b>optic chiasma</b> and <b>pituitary</b> (shown to one side).']) }
    ],
    parts: parts,
    show: {
      1: ['tibfib'],
      2: ['tibfib'],
      3: ['triceps', 'semimem', 'gracmin', 'gastroc', 'peroneus', 'tibant', 'achilles'],
      4: ['rectus', 'inscr', 'linea', 'oblique', 'triceps', 'sartorius', 'addlong', 'addmag', 'gracmaj', 'gracmin', 'gastroc', 'tibant', 'achilles'],
      5: ['lining', 'wallflap', 'ventricle', 'atrium_r', 'atrium_l', 'conus', 'truncus', 'carotid', 'systemic', 'pulmocut', 'lung', 'kidney', 'aorta', 'stomach', 'colon', 'tibfib'],
      6: ['lining', 'wallflap', 'ventricle', 'atrium_r', 'atrium_l', 'sinus', 'antcava', 'postcava', 'lung', 'kidney', 'liver_r', 'liver_la', 'abvein', 'ileum', 'tibfib'],
      7: ['cranium', 'olfnerve', 'olflobe', 'cerebrum', 'dienc', 'optic', 'cerebel', 'medulla', 'cord', 'sciatic', 'tibfib']
    }
  };
});
