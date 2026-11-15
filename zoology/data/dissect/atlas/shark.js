/* Spiny dogfish — atlas plates: chondrocranium, visceral arches, backbone and fins,
   muscles, arteries, veins, and the cranial nerves, ear and lateral line.
   Same coordinates as shark.js: ventral side up (+y), snout at -x, the shark's right at +z. */
DX.extend('shark', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, M = D.M, P = D.P, K = D.K;
  var BX = [-8, -7.4, -6.2, -5, -3.6, -2, 0, 1.8, 3.2, 4.6, 6, 7.2, 8.2], BR = [0.15, 0.7, 1.15, 1.35, 1.5, 1.55, 1.5, 1.3, 1.0, 0.7, 0.48, 0.32, 0.2];
  var k = D.kit(BX, BR, 1.3, 0.8), body = k.body, surf = k.surf, band = k.band, rad = k.rad;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var CART = K.cart, CART2 = 0xb9d2da, CART3 = 0xe2eef2, DARK = 0x26323a;
  var on = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(B + arguments[i]); return { on: a }; };
  /* a sheet of body wall between two stations */
  function sheet(x0, x1, a0, a1, kk) { return T([[x0, 1.3, 0], [x1, 1.3, 0]], [rad(x0) * (kk || 1), rad(x1) * (kk || 1)], { sy: 0.8, arc: [a0, a1], rs: 10, seg: 6 }); }
  var AX = D.pts(5, function (i) { return -5.1 + i * 0.3; });

  /* ================= plate 0: chondrocranium, from above ================= */
  var S = on(1, 2);
  add(0, 'cc_rostral', 'rostral cartilage', 'skel', CART, [T([[-7.9, 0.7, 0], [-7.2, 0.62, 0]], [0.12, 0.4], { sy: 0.35 })], 'The scoop-shaped cartilage that stiffens the snout.', S);
  add(0, 'cc_precer', 'precerebral cavity', 'skel', DARK, [E([-7.42, 0.5, 0], [0.35, 0.05, 0.22])], 'The hollow of the rostrum, open above and filled in life with a jelly.', S);
  add(0, 'cc_nasal', 'nasal capsules', 'skel', CART2, [M(E([-7.05, 0.7, 0.62], [0.34, 0.24, 0.34]))], 'Thin-walled bubbles of cartilage, one on each side of the rostrum, enclosing the olfactory sacs.', S);
  add(0, 'cc_antorb', 'antorbital process', 'skel', CART3, [M(T([[-6.75, 0.6, 0.8], [-6.6, 0.62, 1.15]], 0.07))], 'A spur at the front corner of each orbit.', S);
  add(0, 'cc_roof', 'cranial roof', 'skel', CART, [E([-6.0, 0.42, 0], [0.9, 0.1, 0.7])], 'The cartilage over the brain. The whole skull is one piece of cartilage with no sutures: there are no separate bones to name.', S);
  add(0, 'cc_supraorb', 'supraorbital crest', 'skel', CART3, [M(T([[-6.6, 0.42, 1.0], [-6.1, 0.4, 1.05], [-5.6, 0.42, 1.0]], 0.06))], 'The shelf over each eye, pierced by a row of holes for nerves to the sensory canals.', S);
  add(0, 'cc_orbit', 'orbit', 'skel', DARK, [M(E([-6.1, 0.8, 1.06], [0.42, 0.25, 0.04]))], 'The deep socket for the eye, open at the side.', { a: 0.5, on: [B + 1, B + 2] });
  add(0, 'cc_postorb', 'postorbital process', 'skel', CART3, [M(T([[-5.6, 0.45, 0.95], [-5.45, 0.5, 1.3]], 0.07))], 'A spur at the rear corner of each orbit.', S);
  add(0, 'cc_epiph', 'epiphyseal foramen', 'skel', DARK, [E([-6.35, 0.32, 0], [0.05, 0.02, 0.05])], 'A small hole in the roof, in the midline, over the pineal body. It lets light reach it.', S);
  add(0, 'cc_otic', 'otic capsules', 'skel', CART2, [M(E([-5.15, 0.5, 0.8], [0.38, 0.24, 0.36]))], 'The swollen rear corners of the skull that house the inner ears.', S);
  add(0, 'cc_endofossa', 'endolymphatic fossa', 'skel', 0x8fb0bb, [E([-5.15, 0.32, 0], [0.2, 0.03, 0.22])], 'A shallow pit in the roof between the two otic capsules.', S);
  add(0, 'cc_endofor', 'endolymphatic foramina', 'skel', DARK, [M(E([-5.23, 0.29, 0.07], [0.035, 0.02, 0.035]))], 'The front pair of holes in the fossa. Through them the endolymphatic ducts run from the inner ears to the skin.', S);
  add(0, 'cc_perifor', 'perilymphatic foramina', 'skel', DARK, [M(E([-5.05, 0.29, 0.1], [0.045, 0.02, 0.04]))], 'The larger rear pair of holes in the fossa, closed by a membrane in life.', S);
  add(0, 'cc_foramen', 'foramen magnum', 'skel', DARK, [E([-4.62, 0.6, 0], [0.04, 0.12, 0.14])], 'The opening at the back of the skull for the spinal cord.', S);
  add(0, 'cc_condyle', 'occipital condyles', 'skel', CART3, [M(E([-4.62, 0.72, 0.2], [0.06, 0.07, 0.08]))], 'Two small bumps below the foramen magnum that meet the first vertebra.', S);

  /* ================= plate 1: jaws and gill arches, from below ================= */
  var J = on(2);
  add(1, 'va_basal', 'basal plate', 'skel', CART, [E([-5.6, 0.95, 0], [0.9, 0.05, 0.6])], 'The flat floor of the braincase.', J);
  add(1, 'va_carina', 'rostral carina', 'skel', CART3, [T([[-7.8, 0.9, 0], [-7.0, 0.9, 0]], 0.05)], 'The keel along the underside of the rostrum.', J);
  add(1, 'va_palatoq', 'palatoquadrate cartilage (upper jaw)', 'skel', CART2, [M(T([[-6.55, 1.5, 0.05], [-6.4, 1.5, 0.6], [-5.85, 1.45, 1.05], [-5.5, 1.4, 1.15]], [0.1, 0.13, 0.12, 0.1]))], 'The upper jaw. It is not fused to the skull but slung from it, so a shark can thrust its jaws forward to bite.', J);
  add(1, 'va_meckel', 'Meckel’s cartilage (lower jaw)', 'skel', CART, [M(T([[-6.3, 1.85, 0.05], [-6.15, 1.85, 0.6], [-5.75, 1.75, 1.05], [-5.5, 1.55, 1.18]], [0.12, 0.15, 0.13, 0.1]))], 'The lower jaw. With the palatoquadrate it forms the first visceral arch, a gill arch turned into jaws.', J);
  add(1, 'va_labial', 'labial cartilages', 'skel', CART3, [M(T([[-6.2, 1.7, 0.95], [-6.0, 1.75, 1.25], [-5.8, 1.85, 1.1]], 0.035))], 'Slender rods in the folds at the corners of the mouth.', J);
  add(1, 'va_hyomand', 'hyomandibular cartilage', 'skel', CART2, [M(T([[-5.3, 0.75, 1.0], [-5.4, 1.2, 1.25], [-5.5, 1.5, 1.2]], 0.08))], 'The upper piece of the second (hyoid) arch. It props the jaw joint against the otic capsule. In land vertebrates it becomes the stapes of the ear.', J);
  add(1, 'va_ceratohy', 'ceratohyal cartilage', 'skel', CART, [M(T([[-5.5, 1.5, 1.2], [-5.6, 1.9, 0.7], [-5.65, 2.0, 0.3]], 0.08))], 'The lower piece of the hyoid arch, running forward and inward beneath the lower jaw.', J);
  add(1, 'va_basihy', 'basihyal cartilage', 'skel', CART3, [E([-5.7, 2.02, 0], [0.2, 0.06, 0.32])], 'The midline plate joining the two ceratohyals. It supports the tongue.', J);
  add(1, 'va_pharyngo', 'pharyngobranchial cartilages', 'skel', CART3, AX.map(function (x) { return M(T([[x, 0.85, 0.75], [x + 0.25, 0.7, 0.4]], 0.04)); }), 'The top piece of each of the five gill arches, pointing backward over the pharynx.', J);
  add(1, 'va_epibr', 'epibranchial cartilages', 'skel', CART2, AX.map(function (x) { return M(T([[x, 0.85, 0.75], [x + 0.05, 1.3, 1.22]], 0.05)); }), 'The upper side piece of each gill arch.', J);
  add(1, 'va_ceratobr', 'ceratobranchial cartilages', 'skel', CART, AX.map(function (x) { return M(T([[x + 0.05, 1.3, 1.22], [x, 1.75, 0.7]], 0.05)); }), 'The lower side piece of each gill arch, the longest. Gill rakers stand along its inner edge.', J);
  add(1, 'va_hypobr', 'hypobranchial cartilages', 'skel', CART3, AX.slice(0, 4).map(function (x) { return M(T([[x, 1.75, 0.7], [x - 0.1, 1.95, 0.3]], 0.04)); }), 'Short pieces linking the first four gill arches to the midline.', J);
  add(1, 'va_basibr', 'basibranchial cartilages', 'skel', CART2, [T([[-5.3, 2.0, 0], [-4.0, 1.95, 0]], [0.08, 0.14], { sy: 0.5 })], 'Midline plates in the floor of the pharynx on which the arches of the two sides meet.', J);
  add(1, 'va_gillrays', 'gill rays', 'skel', 0xdbe7ee, D.row(5, function (i) { var x = AX[i]; return [M(T([[x + 0.05, 1.3, 1.22], [x + 0.22, 1.3, 1.52]], 0.018)), M(T([[x + 0.03, 1.5, 1.0], [x + 0.2, 1.56, 1.3]], 0.018)), M(T([[x + 0.03, 1.08, 1.0], [x + 0.2, 1.02, 1.3]], 0.018))]; }), 'Fine rods fanning out from each arch into the partition between two gill pouches, holding the gill surface out flat.', J);

  /* ================= plate 2: backbone, girdles and fins ================= */
  add(2, 'ax_trunk', 'trunk vertebrae', 'skel', CART, D.row(27, function (i) { return E([-4.45 + i * 0.29, 0.55, 0], [0.12, 0.1, 0.12]); }), 'The vertebrae in front of the cloaca. Each has short ribs and no haemal arch.');
  var TAIL = D.pts(24, function (i, f) { var x = 3.5 + f * 6.0, up = x > 8 ? (x - 8) : 0; return [x, 0.6 - up * 0.2, -up * 1.45]; });
  add(2, 'ax_caudal', 'caudal vertebrae', 'skel', CART2, TAIL.map(function (p, i) { return E(p, [0.11 - i * 0.003, 0.09 - i * 0.002, 0.11 - i * 0.003]); }), 'The vertebrae of the tail. Each has a haemal arch below. The column bends upward into the upper lobe of the tail fin.');
  add(2, 'ax_ribs', 'ribs', 'skel', CART3, D.row(14, function (i) { var x = -3.6 + i * 0.36; return M(T([[x, 0.6, 0.12], [x + 0.1, 0.64, 0.5]], 0.02)); }), 'Short slender cartilages in the horizontal septum between the upper and lower muscle blocks. They do not form a cage.');
  add(2, 'ax_haemal', 'haemal spines of the tail', 'skel', CART3, TAIL.slice(14).map(function (p) { return T([p, [p[0] + 0.12, p[1] + 0.25, p[2] + 0.5]], 0.02); }), 'Long spines below the tail vertebrae that support the lower lobe of the tail fin.');
  add(2, 'pg_coracoid', 'coracoid bar', 'skel', CART, [T([[-3.55, 1.75, -0.9], [-3.6, 1.95, 0], [-3.55, 1.75, 0.9]], 0.11)], 'The ventral half of the U-shaped pectoral girdle, crossing the midline just behind the heart.');
  add(2, 'pg_scapular', 'scapular process', 'skel', CART2, [M(T([[-3.55, 1.75, 0.9], [-3.4, 1.2, 1.4], [-3.3, 0.6, 1.3]], [0.1, 0.08, 0.04]))], 'The arm of the girdle that curves up the side of the body.');
  add(2, 'pg_suprascap', 'suprascapular cartilage', 'skel', CART3, [M(E([-3.28, 0.5, 1.25], [0.08, 0.08, 0.06]))], 'A small separate cartilage capping the tip of the scapular process.');
  add(2, 'pg_glenoid', 'glenoid surface', 'skel', 0x8fb0bb, [M(E([-3.5, 1.45, 1.32], [0.08, 0.08, 0.06]))], 'The facet on the girdle with which the pectoral fin articulates.');
  add(2, 'pf_pro', 'propterygium', 'skel', CART3, [M(E([-4.1, 1.0, 1.7], [0.14, 0.06, 0.14]))], 'The small front basal cartilage of the pectoral fin.');
  add(2, 'pf_meso', 'mesopterygium', 'skel', CART, [M(E([-3.65, 1.0, 1.78], [0.26, 0.06, 0.2]))], 'The middle basal cartilage of the pectoral fin.');
  add(2, 'pf_meta', 'metapterygium', 'skel', CART2, [M(T([[-3.3, 1.0, 1.65], [-2.75, 0.95, 2.1]], [0.12, 0.06], { sy: 0.5 }))], 'The long rear basal cartilage of the pectoral fin.');
  add(2, 'pf_radials', 'radial cartilages of the pectoral fin', 'skel', CART3, D.row(10, function (i) { var x = -4.2 + i * 0.16; return M(T([[x, 0.98, 1.95], [x + 0.06 + i * 0.03, 0.94, 2.5]], 0.028)); }), 'Rows of small rods fanning out from the basals into the base of the fin.');
  add(2, 'pf_cerato', 'ceratotrichia (fin rays)', 'skel', 0xe9dcb8, D.row(16, function (i) { var x = -4.15 + i * 0.105; return M(T([[x + i * 0.02, 0.93, 2.52], [x + 0.08 + i * 0.035, 0.88, 3.15 - Math.abs(i - 6) * 0.03]], 0.012)); }), 'Fine horny fibres that stiffen the outer two-thirds of every fin. They are the “needles” in shark-fin soup.');
  add(2, 'pv_bar', 'puboischiadic bar', 'skel', CART, [T([[2.55, 1.25, -0.75], [2.5, 1.35, 0], [2.55, 1.25, 0.75]], 0.09)], 'The simple crossbar that is the whole pelvic girdle. It is not attached to the backbone.');
  add(2, 'pv_iliac', 'iliac process', 'skel', CART3, [M(E([2.6, 1.1, 0.86], [0.08, 0.1, 0.06]))], 'A small upward bump at each end of the puboischiadic bar.');
  add(2, 'pv_basi', 'basipterygium (pelvic metapterygium)', 'skel', CART2, [M(T([[2.65, 1.0, 0.85], [3.8, 0.98, 0.7]], 0.06))], 'The long cartilage along the inner edge of the pelvic fin.');
  add(2, 'pv_radials', 'radial cartilages of the pelvic fin', 'skel', CART3, D.row(7, function (i) { return M(T([[2.8 + i * 0.16, 0.97, 0.95], [2.95 + i * 0.17, 0.93, 1.6]], 0.025)); }), 'Rods running out from the basipterygium to support the pelvic fin.');
  add(2, 'pv_clasper', 'clasper cartilage', 'skel', CART, [M(T([[3.8, 0.98, 0.7], [5.05, 0.98, 0.5]], [0.05, 0.03]))], 'In males the basipterygium continues backward as the grooved skeleton of the clasper.', { sex: 'm' });
  add(2, 'df_basal', 'basal cartilages of the dorsal fins', 'skel', CART2, [E([-0.3, 0.25, -0.6], [0.5, 0.04, 0.2]), E([4.9, 0.4, -0.4], [0.4, 0.04, 0.15])], 'A plate of cartilage embedded in the back muscles at the base of each dorsal fin.');
  add(2, 'df_radials', 'radial cartilages of the dorsal fins', 'skel', CART3, D.row(5, function (i) { return T([[-0.6 + i * 0.2, 0.22, -0.82], [-0.4 + i * 0.22, 0.16, -1.25]], 0.025); }).concat(D.row(4, function (i) { return T([[4.65 + i * 0.16, 0.36, -0.56], [4.8 + i * 0.17, 0.26, -0.85]], 0.022); })), 'Short rods standing on the basal cartilage, supporting the fin.');
  /* one vertebra, enlarged */
  var ZV = -3.4, XV = 0.4;
  add(2, 'vt_centrum', 'centrum', 'skel', CART, [T([[XV, 0.6, ZV], [XV + 0.35, 0.6, ZV], [XV + 0.7, 0.6, ZV]], [0.42, 0.3, 0.42])], 'The spool-shaped body of a vertebra, drawn enlarged. It is hollow at both ends (amphicoelous) and hardened with lime.');
  add(2, 'vt_noto', 'notochord', 'skel', 0xf2d9a8, [E([XV - 0.06, 0.6, ZV], [0.1, 0.3, 0.3]), E([XV + 0.76, 0.6, ZV], [0.1, 0.3, 0.3])], 'The jelly-like rod that was the embryo’s first skeleton. It persists inside the vertebrae, pinched narrow in the middle of each one.');
  add(2, 'vt_nplate', 'neural plate', 'skel', CART2, [E([XV + 0.35, 1.2, ZV], [0.2, 0.3, 0.26])], 'A plate of cartilage rising from each centrum to wall in the spinal cord.');
  add(2, 'vt_intercal', 'intercalary plates', 'skel', CART3, [E([XV - 0.02, 1.2, ZV], [0.16, 0.28, 0.24]), E([XV + 0.72, 1.2, ZV], [0.16, 0.28, 0.24])], 'Extra plates that fill the gaps between neural plates, so the cord is completely enclosed.');
  add(2, 'vt_ncanal', 'neural canal', 'skel', DARK, [E([XV + 0.35, 1.1, ZV], [0.52, 0.12, 0.12])], 'The tunnel for the spinal cord.');
  add(2, 'vt_harch', 'haemal arch', 'skel', CART2, [E([XV + 0.35, 0.02, ZV], [0.22, 0.28, 0.24])], 'In tail vertebrae, a second arch below the centrum.');
  add(2, 'vt_hcanal', 'haemal canal', 'skel', DARK, [E([XV + 0.35, 0.08, ZV], [0.3, 0.1, 0.1])], 'The tunnel in the haemal arch that carries the caudal artery and vein. Cut the tail across to see both, one above the other.');

  /* ================= plate 3: muscles, from below ================= */
  var SK = on(3, 4);
  add(3, 'mu_ctx', 'trunk, skinned', 'musc', 0xc7a394, [body(4, 12, null, 0.97)], '', { x: 1, dull: 1, on: [B + 4] });
  add(3, 'mu_hypax', 'hypaxial muscles', 'musc', K.muscle, [body(4, 10, [-82, 82], 1.0)], 'The muscle blocks below the horizontal septum, forming the belly wall.');
  add(3, 'mu_linea', 'linea alba', 'musc', 0xf7f1e6, [body(4, 8, [-2, 2], 1.01, { rs: 3 })], 'The white seam of connective tissue down the ventral midline.');
  add(3, 'mu_myosepta', 'myosepta', 'musc', 0xf2e6da, D.row(14, function (i) { var x = -3.0 + i * 0.55; return [band(x, 0.035, [-82, 82], 1.012), band(x + 0.12, 0.035, [98, 262], 1.012)]; }), 'Sheets of white connective tissue separating one muscle block (myomere) from the next. They show on the surface as zigzag lines.', { on: [B + 4] });
  add(3, 'mu_intermand', 'intermandibularis', 'musc', 0xd9998b, [sheet(-6.35, -5.6, -50, 50, 0.99)], 'A broad thin sheet between the two halves of the lower jaw. It raises the floor of the mouth.', { anchor: surf(-6.0, 0, 0.99) });
  add(3, 'mu_interhy', 'interhyoideus', 'musc', K.muscle2, [sheet(-5.6, -5.25, -50, 50, 0.99)], 'A sheet just above and behind the intermandibularis, between the two ceratohyals.', { anchor: surf(-5.42, 0, 0.99) });
  add(3, 'mu_vconstr', 'ventral superficial constrictors', 'musc', 0xd08a7c, [sheet(-5.25, -3.9, 28, 80, 0.99), sheet(-5.25, -3.9, 280, 332, 0.99)], 'Thin muscle in the wall between the gill slits. Contracting, they squeeze water out over the gills.', { anchor: surf(-4.6, 55, 0.99) });
  add(3, 'mu_coracomand', 'coracomandibular', 'musc', K.muscle, [T([surf(-4.6, 0, 1.0), surf(-5.4, 0, 1.0), surf(-6.1, 0, 1.0)], 0.11, { sy: 0.4 })], 'A single midline strap from the pectoral girdle to the chin. It opens the mouth.');
  add(3, 'mu_coracohy', 'coracohyoid', 'musc', 0xb86a5c, [M(T([surf(-4.6, 8, 0.99), surf(-5.6, 10, 0.99)], 0.1, { sy: 0.4 }))], 'A pair of straps beside and above the coracomandibular, running to the hyoid arch.');
  add(3, 'mu_coracoarc', 'common coracoarcuals', 'musc', K.muscle2, [M(T([surf(-3.75, 9, 0.99), surf(-4.6, 7, 0.99)], [0.3, 0.16], { sy: 0.3 }))], 'A pair of triangles in front of the coracoid bar, from which the coracomandibular and coracohyoid arise.');
  add(3, 'mu_coracobr', 'coracobranchials', 'musc', 0xdc9484, [M(T([[-4.3, 1.92, 0.34], [-4.7, 1.9, 0.55], [-5.0, 1.85, 0.66]], 0.06))], 'Deep slips fanning from the girdle to the bases of the gill arches. They widen the pharynx to draw water in.');
  add(3, 'mu_addmand', 'adductor mandibulae', 'musc', K.muscle, [M(E([-5.75, 1.6, 1.22], [0.3, 0.25, 0.14]))], 'The big jaw-closing muscle at the angle of the mouth.');
  add(3, 'mu_preorb', 'preorbitalis', 'musc', 0xb86a5c, [M(T([[-6.6, 1.7, 0.5], [-5.95, 1.65, 1.05]], [0.07, 0.1]))], 'A slim muscle from under the eye back to the jaw angle. It helps swing the upper jaw forward.');
  add(3, 'mu_pecdep', 'depressor (flexor) of the pectoral fin', 'musc', K.muscle2, [M(E([-3.5, 1.15, 1.9], [0.5, 0.08, 0.3]))], 'The muscle on the underside of the fin base.');
  add(3, 'mu_pelvdep', 'depressor (flexor) of the pelvic fin', 'musc', 0xd08a7c, [M(E([3.0, 1.1, 1.1], [0.4, 0.06, 0.22]))], 'The muscle on the underside of the pelvic fin base.');

  /* ================= plate 4: muscles and eye muscles, from above ================= */
  add(4, 'md_epax', 'epaxial muscles', 'musc', K.muscle, [body(4, 10, [100, 260], 1.0)], 'The muscle blocks above the horizontal septum. With the hypaxials they bend the body from side to side in swimming.');
  add(4, 'md_septum', 'horizontal (lateral) septum', 'musc', 0xf7f1e6, [M(T([surf(-3.6, 91, 1.012), surf(-2, 91, 1.012), surf(0, 91, 1.012), surf(1.8, 91, 1.012), surf(3.2, 91, 1.012), surf(4.6, 91, 1.012), surf(6, 91, 1.012)], 0.03))], 'The sheet of connective tissue dividing every muscle block into an upper and a lower half. It lies under the lateral line.');
  add(4, 'md_dconstr', 'dorsal superficial constrictors', 'musc', 0xd08a7c, [sheet(-5.25, -3.9, 100, 150, 0.99), sheet(-5.25, -3.9, 210, 260, 0.99)], 'The upper halves of the gill constrictors, above the gill slits.', { anchor: surf(-4.6, 125, 0.99) });
  add(4, 'md_cucull', 'cucullaris (trapezius)', 'musc', K.muscle2, [M(T([surf(-5.2, 162, 1.0), surf(-3.6, 132, 1.0)], [0.14, 0.2], { sy: 0.3 }))], 'A triangle above the gills, from the back muscles to the scapular process and last gill arch. It lifts the girdle.');
  add(4, 'md_levpq', 'levator palatoquadrati', 'musc', 0xb86a5c, [M(E([-5.75, 0.7, 1.1], [0.14, 0.2, 0.1]))], 'A short muscle behind the eye from the otic capsule down to the upper jaw. It raises the jaw.');
  add(4, 'md_levhyo', 'levator hyomandibulae', 'musc', K.muscle, [M(E([-5.4, 0.6, 1.2], [0.16, 0.14, 0.1]))], 'Just behind the spiracle, from the otic capsule to the hyomandibular cartilage.');
  add(4, 'md_peclev', 'levator (extensor) of the pectoral fin', 'musc', K.muscle2, [M(E([-3.5, 0.75, 1.9], [0.5, 0.08, 0.3]))], 'The muscle on the upper side of the fin base.');
  add(4, 'ey_ball', 'eyeball', 'nerv', 0x3a4046, [M(E([-6.25, 0.85, 0.98], [0.26, 0.24, 0.2]))], '', { x: 1 });
  add(4, 'ey_pedicel', 'optic pedicel', 'skel', CART, [M(T([[-6.0, 0.9, 0.68], [-6.18, 0.88, 0.84]], 0.03))], 'A stalk of cartilage with a cupped end that props the eyeball away from the skull.');
  add(4, 'ey_suprect', 'superior rectus', 'musc', K.muscle, [M(T([[-5.72, 0.8, 0.72], [-6.2, 0.6, 0.95]], 0.035))], 'One of four straight muscles from the back of the orbit. It rolls the eye upward.');
  add(4, 'ey_infrect', 'inferior rectus', 'musc', K.muscle2, [M(T([[-5.72, 0.9, 0.72], [-6.2, 1.1, 0.95]], 0.035))], 'Rolls the eye downward.');
  add(4, 'ey_medrect', 'medial rectus', 'musc', 0xd08a7c, [M(T([[-5.72, 0.85, 0.7], [-6.32, 0.85, 0.74]], 0.035))], 'Runs along the inner wall of the orbit and turns the eye forward.');
  add(4, 'ey_latrect', 'lateral rectus', 'musc', 0xb86a5c, [M(T([[-5.72, 0.85, 0.74], [-6.08, 0.85, 1.2]], 0.035))], 'Turns the eye backward. It is supplied by its own cranial nerve, the abducens.');
  add(4, 'ey_supobl', 'superior oblique', 'musc', 0xdc9484, [M(T([[-6.7, 0.75, 0.75], [-6.32, 0.6, 0.98]], 0.03))], 'One of two muscles from the front of the orbit. It is supplied by its own cranial nerve, the trochlear.');
  add(4, 'ey_infobl', 'inferior oblique', 'musc', K.muscle, [M(T([[-6.7, 0.95, 0.75], [-6.32, 1.1, 0.98]], 0.03))], 'The lower muscle from the front of the orbit.');

  /* ================= plate 5: arteries ================= */
  var AR = K.artery, AR2 = 0xd9564a;
  add(5, 'ar_efferent', 'efferent branchial arteries', 'circ', AR, D.row(4, function (i) { var x = -5.0 + i * 0.3; return M(T([[x + 0.1, 0.9, 0.9], [x + 0.5, 0.55, 0.45], [x + 0.9, 0.42, 0.05]], 0.035)); }), 'Four pairs carrying freshly oxygenated blood from the gills up and back to the dorsal aorta.');
  add(5, 'ar_loops', 'collector loops (pretrematic and post-trematic arteries)', 'circ', AR2, AX.map(function (x) { return M(O([x + 0.08, 1.3, 1.08], 0.3, 0.02, [0, 90, 0])); }), 'A ring of artery around each gill slit, collecting blood from the gill filaments on both sides of it.');
  add(5, 'ar_paired', 'paired dorsal aortae', 'circ', AR, [M(T([[-4.9, 0.5, 0.45], [-5.6, 0.55, 0.3], [-6.0, 0.6, 0.2]], 0.03))], 'Two slender vessels running forward from the first efferent arteries along the underside of the skull.');
  add(5, 'ar_intcar', 'internal carotid artery', 'circ', AR2, [M(T([[-6.0, 0.6, 0.2], [-6.15, 0.75, 0.05]], 0.025))], 'The two meet in the midline and enter the skull to supply the brain.');
  add(5, 'ar_hyoid', 'hyoidean epibranchial artery', 'circ', AR, [M(T([[-5.05, 0.9, 0.9], [-5.5, 0.7, 0.9], [-5.9, 0.75, 0.8]], 0.025))], 'Runs forward from the top of the first collector loop toward the spiracle and the head.');
  add(5, 'ar_staped', 'stapedial artery', 'circ', AR2, [M(T([[-5.9, 0.75, 0.8], [-6.3, 0.7, 0.9]], 0.02))], 'A branch into the orbit, supplying the eye muscles and the snout.');
  add(5, 'ar_extcar', 'external carotid artery', 'circ', AR, [M(T([[-5.2, 1.7, 0.75], [-5.8, 1.75, 0.9], [-6.3, 1.7, 0.7]], 0.025))], 'Runs forward from the bottom of the first collector loop to the lower jaw.');
  add(5, 'ar_hypobr', 'hypobranchial artery', 'circ', AR2, [M(T([[-4.9, 1.85, 0.5], [-4.5, 1.9, 0.3], [-4.2, 1.9, 0.15]], 0.022))], 'Arises from the lower ends of the collector loops and carries oxygenated blood back to the heart wall and the floor of the throat.');
  add(5, 'ar_coronary', 'coronary artery', 'circ', AR, [M(T([[-4.5, 1.9, 0.3], [-4.32, 1.98, 0.12], [-4.2, 2.02, 0.03]], 0.02))], 'The branch of the hypobranchial that supplies the heart muscle. The blood inside the heart is oxygen-poor, so the heart needs its own supply.');
  add(5, 'ar_subcl', 'subclavian artery', 'circ', AR2, [M(T([[-3.6, 0.42, 0.05], [-3.5, 0.8, 0.9], [-3.45, 1.2, 1.35]], 0.035))], 'Leaves the dorsal aorta just in front of the body cavity and runs round to the pectoral girdle.');
  add(5, 'ar_brachial', 'brachial artery', 'circ', AR, [M(T([[-3.45, 1.2, 1.35], [-3.5, 1.0, 2.2]], 0.025))], 'The continuation of the subclavian into the pectoral fin.');
  add(5, 'ar_lateral', 'lateral (ventrolateral) artery', 'circ', AR2, [M(T([[-3.45, 1.2, 1.35], [-1.5, 1.3, 1.5], [1.5, 1.3, 1.3]], 0.02))], 'A branch of the subclavian running back along the inside of the body wall beside the lateral abdominal vein.');
  add(5, 'ar_coeliac', 'coeliac artery', 'circ', AR, [T([[-3.3, 0.42, 0], [-3.0, 0.8, -0.1], [-2.4, 1.0, -0.2]], 0.04)], 'The first large unpaired branch of the dorsal aorta, entering the body cavity beside the oesophagus.');
  add(5, 'ar_gastric', 'gastric artery', 'circ', AR2, [T([[-2.4, 1.0, -0.2], [-1.6, 1.3, -0.5]], 0.025)], 'The branch of the coeliac to the stomach.');
  add(5, 'ar_hepatic', 'hepatic artery', 'circ', AR2, [T([[-2.4, 1.0, -0.2], [-2.6, 1.5, 0.3]], 0.025)], 'The branch of the coeliac to the liver, running beside the bile duct.');
  add(5, 'ar_pancmes', 'pancreaticomesenteric artery', 'circ', AR, [T([[-2.4, 1.0, -0.2], [-0.8, 1.0, 0.3], [0.2, 1.2, 0.6]], 0.03)], 'The branch of the coeliac to the pancreas, the duodenum and the front of the intestine.');
  add(5, 'ar_antmes', 'anterior mesenteric artery', 'circ', AR, [T([[1.2, 0.42, 0], [1.4, 0.8, 0.3], [1.6, 1.1, 0.5]], 0.03)], 'Leaves the aorta far back and supplies the rear of the valvular intestine.');
  add(5, 'ar_lienogas', 'lienogastric artery', 'circ', AR2, [T([[1.35, 0.42, 0], [1.2, 0.8, -0.3], [1.05, 1.1, -0.42]], 0.03)], 'Leaves the aorta just behind the anterior mesenteric and supplies the spleen and the rear of the stomach.');
  add(5, 'ar_postmes', 'posterior mesenteric artery', 'circ', AR, [T([[2.4, 0.44, 0], [2.7, 0.7, 0], [2.95, 0.9, 0.1]], 0.022)], 'A small artery to the rectal gland.');
  add(5, 'ar_genital', 'genital arteries', 'circ', AR2, [M(T([[-2.9, 0.42, 0.03], [-2.75, 0.6, 0.3], [-2.6, 0.8, 0.5]], 0.018))], 'Small arteries to the testes or ovaries.');
  add(5, 'ar_renal', 'renal arteries', 'circ', AR2, D.row(6, function (i) { var x = 0.1 + i * 0.5; return M(T([[x, 0.42, 0.03], [x + 0.05, 0.45, 0.26]], 0.015)); }), 'Many small branches of the dorsal aorta into the kidneys.');
  add(5, 'ar_parietal', 'parietal (segmental) arteries', 'circ', AR, D.row(8, function (i) { var x = -2.6 + i * 0.6; return M(T([[x, 0.42, 0.05], [x + 0.1, 0.66, 1.05]], 0.015)); }), 'A pair for each body segment, running out along the myosepta to the body-wall muscles.');
  add(5, 'ar_iliac', 'iliac artery', 'circ', AR, [M(T([[2.6, 0.45, 0.03], [2.65, 0.8, 0.6], [2.75, 1.0, 0.95]], 0.03))], 'The artery to the pelvic fin, leaving the aorta just in front of the cloaca.');
  add(5, 'ar_femoral', 'femoral artery', 'circ', AR2, [M(T([[2.75, 1.0, 0.95], [3.2, 0.95, 1.3]], 0.02))], 'The continuation of the iliac artery into the pelvic fin.');
  add(5, 'ar_caudal', 'caudal artery', 'circ', AR, [T([[3.1, 0.45, 0], [5.0, 0.5, 0], [7.0, 0.6, 0]], 0.04)], 'The dorsal aorta continued into the tail, inside the haemal canal of the vertebrae.');

  /* ================= plate 6: veins ================= */
  var VE = K.vein, VE2 = 0x5673bd, PO = 0x34508f;
  add(6, 've_ccard', 'common cardinal veins (ducts of Cuvier)', 'circ', VE, [M(T([[-3.85, 1.5, 0.5], [-3.8, 1.1, 1.0], [-3.75, 0.7, 1.1]], 0.1))], 'A short wide vein on each side, running across from the cardinal sinuses to the sinus venosus. Nearly all the blood returns through them.');
  add(6, 've_acard', 'anterior cardinal sinus', 'circ', VE2, [M(T([[-3.75, 0.7, 1.1], [-4.6, 0.6, 1.1], [-5.4, 0.6, 1.0]], 0.09))], 'A large blood space above the gills, draining the head. Shark veins are mostly wide thin-walled sinuses.');
  add(6, 've_orbital', 'orbital sinus', 'circ', VE, [M(E([-6.1, 0.82, 0.92], [0.3, 0.12, 0.12]))], 'A blood space around the eye, draining back into the anterior cardinal sinus.');
  add(6, 've_hyoid', 'hyoidean sinus', 'circ', VE2, [M(T([[-5.4, 0.6, 1.0], [-5.5, 1.3, 1.25], [-5.6, 1.8, 0.8]], 0.04))], 'Runs down behind the hyoid arch, linking the anterior cardinal sinus with the inferior jugular vein.');
  add(6, 've_infjug', 'inferior jugular vein', 'circ', VE, [M(T([[-3.82, 1.6, 0.6], [-4.6, 1.85, 0.55], [-5.5, 1.9, 0.5]], 0.04))], 'Drains the floor of the mouth and the gill region back to the common cardinal vein.');
  add(6, 've_pcardsin', 'posterior cardinal sinus', 'circ', VE2, [M(T([[-3.75, 0.7, 1.0], [-3.3, 0.5, 0.5], [-2.0, 0.48, 0.35], [0, 0.5, 0.2]], [0.12, 0.2, 0.12, 0.06], { sy: 0.5 }))], 'A very wide blood space in the roof of the front of the body cavity, beside the oesophagus.');
  add(6, 've_pcardv', 'posterior cardinal veins', 'circ', VE, [M(T([[0, 0.5, 0.2], [1.5, 0.52, 0.12], [3.0, 0.55, 0.08]], 0.035))], 'The narrow rear part of each posterior cardinal, lying between the kidneys.');
  add(6, 've_effrenal', 'efferent renal veins', 'circ', VE2, D.row(6, function (i) { var x = 0.2 + i * 0.5; return M(T([[x, 0.5, 0.3], [x, 0.52, 0.14]], 0.014)); }), 'Many small veins carrying filtered blood out of the kidneys into the posterior cardinal veins.');
  add(6, 've_rportal', 'renal portal veins', 'circ', PO, [M(T([[3.3, 0.55, 0.1], [3.0, 0.5, 0.42], [1.5, 0.44, 0.52], [-0.5, 0.42, 0.45]], 0.03))], 'The two branches of the caudal vein, running along the outer edge of each kidney and feeding blood from the tail into it.');
  add(6, 've_caudal', 'caudal vein', 'circ', VE, [T([[7.0, 0.72, 0], [5.0, 0.62, 0], [3.3, 0.56, 0]], 0.045)], 'The vein of the tail, in the haemal canal just below the caudal artery.');
  add(6, 've_latabd', 'lateral abdominal veins', 'circ', VE2, [M(T([[2.9, 1.1, 0.95], [1.5, 1.3, 1.38], [-1.5, 1.35, 1.55], [-3.4, 1.3, 1.45], [-3.75, 1.2, 1.2]], 0.04))], 'A long vein on each side just under the lining of the body wall, showing through as a dark line. It drains the pelvic fin and the body wall.');
  add(6, 've_subcl', 'subclavian vein', 'circ', VE, [M(T([[-3.6, 1.15, 1.6], [-3.75, 1.2, 1.2]], 0.045))], 'A short vein formed by the brachial and lateral abdominal veins, entering the common cardinal vein.');
  add(6, 've_brachial', 'brachial vein', 'circ', VE2, [M(T([[-3.5, 1.0, 2.3], [-3.6, 1.15, 1.6]], 0.03))], 'The vein of the pectoral fin.');
  add(6, 've_iliac', 'iliac vein', 'circ', VE, [M(T([[3.2, 0.95, 1.3], [2.9, 1.1, 0.95]], 0.03))], 'The vein of the pelvic fin, the start of the lateral abdominal vein.');
  add(6, 've_cloacal', 'cloacal vein', 'circ', VE2, [M(T([[3.2, 1.2, 0.2], [3.0, 1.15, 0.6], [2.9, 1.1, 0.95]], 0.02))], 'Drains the wall of the cloaca into the lateral abdominal vein.');
  add(6, 've_hepsinus', 'hepatic sinuses', 'circ', VE, [M(T([[-3.3, 1.7, 0.5], [-3.7, 1.6, 0.35], [-3.85, 1.5, 0.25]], 0.09))], 'Two wide veins from the front of the liver straight into the sinus venosus.');
  add(6, 've_hportal', 'hepatic portal vein', 'circ', PO, [T([[0.4, 1.4, 0.3], [-1.0, 1.5, 0.3], [-2.6, 1.6, 0.2]], 0.05)], 'Runs forward beside the bile duct, carrying blood from the gut to the liver.');
  add(6, 've_gastric', 'gastric vein', 'circ', 0x4a66a8, [T([[-1.0, 1.5, 0.3], [-1.2, 1.35, -0.2]], 0.03)], 'The tributary of the hepatic portal vein from the stomach.');
  add(6, 've_lienomes', 'lienomesenteric vein', 'circ', 0x4a66a8, [T([[0.4, 1.4, 0.3], [0.9, 1.25, -0.3]], 0.03)], 'The tributary of the hepatic portal vein from the spleen and the rear of the intestine.');
  add(6, 've_pancmes', 'pancreaticomesenteric vein', 'circ', PO, [T([[0.4, 1.4, 0.3], [1.0, 1.3, 0.6]], 0.03)], 'The tributary of the hepatic portal vein from the pancreas and the front of the intestine.');
  add(6, 've_genital', 'genital sinus', 'circ', VE2, [M(E([-2.6, 0.6, 0.45], [0.5, 0.06, 0.15]))], 'A blood space around the gonad, opening into the posterior cardinal sinus.');

  /* ================= plate 7: brain, cranial nerves, ear and lateral line, from above ================= */
  var NV = K.nerve, NV2 = 0xe6dc9c, NV3 = 0xfaf6d6, LL = 0x6fb7c9;
  add(7, 'ne_terminal', 'terminal nerve (cranial nerve 0)', 'nerv', NV2, [M(T([[-6.3, 0.52, 0.12], [-6.7, 0.52, 0.42]], 0.012))], 'A hair-thin nerve along the inner side of each olfactory tract. It was found in sharks after the other ten had been numbered, so it is called zero.');
  add(7, 'ne_epiph', 'epiphysis (pineal body)', 'nerv', 0xb98a7a, [T([[-5.82, 0.5, 0], [-6.12, 0.4, 0]], 0.015)], 'A thread-like stalk rising forward from the roof of the diencephalon to the epiphyseal foramen. It responds to light.');
  add(7, 'ne_tela', 'tela choroidea', 'nerv', 0x9a5a5a, [E([-5.82, 0.51, 0], [0.1, 0.02, 0.1])], 'The thin, blood-rich membrane roofing the diencephalon. It tears away easily, opening the third ventricle.');
  add(7, 'ne_v4', 'fourth ventricle', 'nerv', 0x6a3a3a, [E([-4.85, 0.5, 0], [0.22, 0.03, 0.12])], 'The cavity of the medulla, seen as a triangular trough once its thin roof is removed.');
  add(7, 'ne_III', 'oculomotor nerve (III)', 'nerv', NV2, [M(T([[-5.6, 0.7, 0.15], [-5.9, 0.8, 0.6]], 0.015))], 'Motor, to four of the six eye muscles.');
  add(7, 'ne_IV', 'trochlear nerve (IV)', 'nerv', NV2, [M(T([[-5.42, 0.45, 0.12], [-5.9, 0.5, 0.7]], 0.012))], 'Leaves the roof of the brain between the optic lobes and cerebellum, and runs to the superior oblique muscle.');
  add(7, 'ne_V', 'trigeminal nerve (V)', 'nerv', NV, [M(T([[-5.0, 0.62, 0.25], [-5.3, 0.65, 0.6]], 0.04))], 'A thick root from the front of the medulla. It shares its trunk with the facial nerve and divides into four branches.');
  add(7, 'ne_supoph', 'superficial ophthalmic nerve', 'nerv', NV, [M(T([[-5.3, 0.6, 0.6], [-6.2, 0.45, 0.85], [-7.3, 0.5, 0.5]], 0.025))], 'Runs along the top of the orbit to the snout. Easy to find; it serves the skin and the sensory canals and ampullae there.');
  add(7, 'ne_deepoph', 'deep ophthalmic nerve', 'nerv', NV2, [M(T([[-5.3, 0.68, 0.6], [-6.2, 0.7, 0.8], [-7.0, 0.7, 0.55]], 0.015))], 'A fine branch crossing the orbit against the eyeball, to the skin of the snout.');
  add(7, 'ne_infraorb', 'infraorbital (maxillary) nerve', 'nerv', NV, [M(T([[-5.3, 0.72, 0.62], [-6.0, 1.0, 0.85], [-6.9, 1.1, 0.6]], 0.03))], 'A broad band across the floor of the orbit to the underside of the snout.');
  add(7, 'ne_mandib', 'mandibular nerve', 'nerv', NV2, [M(T([[-5.3, 0.72, 0.64], [-5.6, 1.1, 1.0], [-5.9, 1.5, 1.05]], 0.022))], 'The branch of the trigeminal that turns down behind the eye to the jaw muscles.');
  add(7, 'ne_VI', 'abducens nerve (VI)', 'nerv', NV2, [M(T([[-4.9, 0.72, 0.1], [-5.5, 0.82, 0.6]], 0.012))], 'Leaves the underside of the medulla for the lateral rectus muscle.');
  add(7, 'ne_hyomand', 'hyomandibular nerve (VII)', 'nerv', NV, [M(T([[-4.98, 0.62, 0.27], [-5.2, 0.7, 0.9], [-5.45, 1.1, 1.25]], 0.028))], 'The main trunk of the facial nerve, passing behind the spiracle to the hyoid arch.');
  add(7, 'ne_palatine', 'palatine nerve (VII)', 'nerv', NV2, [M(T([[-5.05, 0.68, 0.28], [-5.5, 0.9, 0.5], [-6.0, 0.95, 0.4]], 0.014))], 'A branch of the facial nerve to the taste buds in the roof of the mouth.');
  add(7, 'ne_VIII', 'auditory (statoacoustic) nerve (VIII)', 'nerv', NV, [M(T([[-4.92, 0.62, 0.26], [-5.1, 0.62, 0.6]], 0.03))], 'A short thick nerve straight into the otic capsule.');
  add(7, 'ne_IX', 'glossopharyngeal nerve (IX)', 'nerv', NV2, [M(T([[-4.75, 0.62, 0.2], [-4.9, 0.65, 0.9], [-5.05, 0.9, 1.2]], 0.02))], 'Passes through the floor of the otic capsule to the first gill pouch.');
  add(7, 'ne_X', 'vagus nerve (X)', 'nerv', NV, [M(T([[-4.6, 0.62, 0.18], [-4.4, 0.62, 0.8], [-4.0, 0.6, 1.05]], 0.035))], 'The largest cranial nerve, leaving the back of the medulla and dividing into three sets of branches.');
  add(7, 'ne_Xbr', 'branchial branches of the vagus', 'nerv', NV2, D.row(4, function (i) { return M(T([[-4.4 + i * 0.12, 0.62, 0.85], [-4.75 + i * 0.3, 0.85, 1.2]], 0.014)); }), 'Four branches, one to each of the last four gill pouches.');
  add(7, 'ne_Xvisc', 'visceral branch of the vagus', 'nerv', NV, [M(T([[-4.0, 0.6, 1.05], [-3.4, 0.9, 0.7], [-2.8, 1.1, 0.3]], 0.02))], 'Continues back to the heart and the gut.');
  add(7, 'ne_Xlat', 'lateral line nerve', 'nerv', NV2, [M(T([[-4.0, 0.6, 1.05], [-2, 0.55, 1.2], [1, 0.6, 1.0], [4, 0.7, 0.5]], 0.02))], 'The branch of the vagus that runs the whole length of the body under the lateral line canal.');
  add(7, 'ne_cord', 'spinal cord', 'nerv', NV, [T([[-4.3, 0.62, 0], [-1, 0.6, 0], [3, 0.6, 0]], 0.07)], 'Continues back from the medulla inside the neural canal of the vertebrae.');
  add(7, 'ne_hypobr', 'hypobranchial nerve', 'nerv', NV2, [M(T([[-4.25, 0.62, 0.08], [-3.9, 0.9, 0.9], [-4.4, 1.6, 0.6]], 0.015))], 'Formed by the first spinal nerves. It loops round behind the gills to the muscles under the throat.');
  add(7, 'ne_spnerves', 'spinal nerves', 'nerv', NV2, D.row(8, function (i) { var x = -3.2 + i * 0.7; return M(T([[x, 0.6, 0.07], [x + 0.15, 0.6, 0.7]], 0.014)); }), 'A pair to each body segment, with a dorsal sensory root and a ventral motor root.');
  add(7, 'ne_brplex', 'brachial plexus', 'nerv', NV3, [M(T([[-3.9, 0.6, 0.08], [-3.6, 0.8, 0.9], [-3.5, 1.0, 1.5]], 0.022))], 'Several spinal nerves joining to supply the pectoral fin.');
  add(7, 'er_sacculus', 'sacculus', 'nerv', 0xdbe7ee, [M(E([-5.18, 0.75, 0.85], [0.14, 0.12, 0.1]))], 'The large lower chamber of the inner ear. It holds a mass of sand-like grains that press on sensory hairs.');
  add(7, 'er_utric', 'utriculus', 'nerv', 0xeef4f6, [M(E([-5.22, 0.6, 0.88], [0.09, 0.06, 0.07]))], 'The upper chamber of the inner ear, from which the semicircular canals arise.');
  add(7, 'er_lagena', 'lagena', 'nerv', 0xc9dae2, [M(E([-5.02, 0.82, 0.85], [0.06, 0.05, 0.05]))], 'A small pocket at the back of the sacculus. In land vertebrates it lengthens into the cochlea.');
  add(7, 'er_ampullae', 'ampullae of the semicircular canals', 'nerv', NV3, [M(E([-5.38, 0.62, 0.82], [0.045, 0.04, 0.045])), M(E([-5.1, 0.62, 1.08], [0.045, 0.04, 0.045])), M(E([-5.05, 0.66, 0.8], [0.045, 0.04, 0.045]))], 'A swelling at one end of each canal containing the patch of sensory hairs that detects turning.');
  add(7, 'er_endoduct', 'endolymphatic duct', 'nerv', LL, [M(T([[-5.2, 0.6, 0.8], [-5.22, 0.36, 0.1]], 0.014))], 'A fine tube from each inner ear up to a pore on top of the head. A shark’s inner ear is open to the sea.');
  add(7, 'll_supra', 'supraorbital canal', 'nerv', LL, [M(T([[-5.3, 0.3, 0.5], [-6.2, 0.3, 0.75], [-7.3, 0.45, 0.45]], 0.02))], 'The branch of the lateral line system running forward over the eye to the snout.');
  add(7, 'll_infra', 'infraorbital canal', 'nerv', LL, [M(T([[-5.5, 0.5, 1.25], [-6.2, 1.2, 1.2], [-7.0, 1.3, 0.7]], 0.02))], 'The branch running down behind the eye and forward under it.');
  add(7, 'll_hyomand', 'hyomandibular canal', 'nerv', LL, [M(T([[-5.5, 0.5, 1.25], [-5.6, 1.2, 1.4], [-5.9, 1.7, 1.2]], 0.02))], 'The branch running down across the cheek toward the angle of the jaw.');
  var ZB = 3.3;
  add(7, 'nb_ctx', 'brain, ventral surface', 'nerv', K.brain2, [E([-6.1, 0.72, ZB], [0.26, 0.14, 0.42]), E([-5.7, 0.72, ZB], [0.3, 0.12, 0.3]), T([[-5.3, 0.72, ZB], [-4.4, 0.72, ZB]], [0.26, 0.14], { sy: 0.7 })], '', { x: 1, dull: 1 });
  add(7, 'nb_chiasma', 'optic chiasma', 'nerv', NV3, [E([-5.9, 0.56, ZB], [0.07, 0.04, 0.18]), T([[-5.92, 0.56, ZB + 0.14], [-6.2, 0.54, ZB + 0.5]], 0.04), T([[-5.92, 0.56, ZB - 0.14], [-6.2, 0.54, ZB - 0.5]], 0.04)], 'The crossing of the optic nerves on the underside of the diencephalon.');
  add(7, 'nb_inflobes', 'inferior lobes of the infundibulum', 'nerv', 0xcfa594, [E([-5.66, 0.56, ZB + 0.12], [0.14, 0.06, 0.11]), E([-5.66, 0.56, ZB - 0.12], [0.14, 0.06, 0.11])], 'Two rounded swellings on the floor of the diencephalon behind the chiasma.');
  add(7, 'nb_hypoph', 'hypophysis (pituitary)', 'endo', 0xe8b7c8, [E([-5.48, 0.54, ZB], [0.1, 0.05, 0.08])], 'The master endocrine gland, attached behind the inferior lobes. It usually stays behind in the skull when the brain is lifted.');
  add(7, 'nb_saccus', 'saccus vasculosus', 'nerv', 0x9a5a5a, [E([-5.36, 0.56, ZB + 0.11], [0.07, 0.04, 0.07]), E([-5.36, 0.56, ZB - 0.11], [0.07, 0.04, 0.07])], 'A thin-walled, blood-rich sac behind the inferior lobes, found only in fishes. It may sense water pressure.');

  return {
    steps: [
      { t: 'Skeleton: the chondrocranium', flip: true, view: { t: [-6.1, 2.0, 0], d: 8, ph: 0.35 },
        how: D.ol(['Use a prepared skull, or carefully scrape every scrap of muscle from the head of your specimen.', 'The skull is a single box of cartilage. Its landmarks are processes, capsules and holes, not bones.', 'From the front: <b>rostrum</b>, <b>nasal capsules</b>, <b>orbits</b>, <b>otic capsules</b>.', 'Find the four small holes in the <b>endolymphatic fossa</b> on top.']) },
      { t: 'Skeleton: jaws and gill arches', view: { t: [-5.6, 1.6, 0], d: 8.5, ph: 0.35 },
        how: D.ol(['Turn the head over. Seven arches of cartilage hang below the skull.', 'The first is the <b>jaws</b>. The second, the <b>hyoid arch</b>, props the jaws against the skull.', 'The last five are <b>gill arches</b>. Each is a chain of four pieces on each side plus a midline piece.']) },
      { t: 'Skeleton: backbone, girdles and fins', view: { t: [1.2, 1.0, -0.5], d: 25, ph: 0.35 },
        how: D.ol(['Find the two girdles: a stout U behind the gills, and a simple bar in front of the cloaca. Neither is joined to the backbone.', 'In each paired fin find the <b>basal cartilages</b>, the <b>radials</b>, then the fine <b>ceratotrichia</b>.', 'Follow the backbone into the upper lobe of the tail.', 'The enlarged vertebra beside the body is cut from the tail, to show both arches.']) },
      { t: 'Muscles: throat, jaws and belly', view: { t: [-1.5, 1.6, 0.4], d: 16, ph: 0.3 },
        how: D.ol(['Skin the underside of the head and one side of the trunk. Shark skin is tough: cut shallowly and peel it with forceps.', 'The trunk muscle is a series of zigzag blocks, the <b>myomeres</b>.', 'Under the throat, cut through the thin <b>intermandibularis</b> in the midline to find the strap muscles beneath.']) },
      { t: 'Muscles: the back, gills and eye', flip: true, view: { t: [-2.5, 1.9, 0.6], d: 15, ph: 0.3 },
        how: D.ol(['Skin the top of the head and the back.', 'Find the pale <b>horizontal septum</b> that splits the trunk muscle into upper and lower halves.', 'Cut away the upper eyelid and the roof of the orbit. Six thin muscles hold the eyeball: four from the back of the orbit and two from the front.']) },
      { t: 'The arteries', view: { t: [-1.6, 1.2, 0.2], d: 13, ph: 0.25 },
        how: D.ol(['Use an injected shark. Cut through the angle of the jaw on one side and back through the gill arches, then swing the floor of the mouth aside.', 'Strip the lining from the roof of the mouth to expose the four pairs of <b>efferent branchial arteries</b> meeting as the <b>dorsal aorta</b>.', 'Trace the aorta back through the body cavity, noting each branch to the gut.', 'Compare with the heart: blood leaves it forward and ventrally, and comes back along the roof.']) },
      { t: 'The veins', view: { t: [-1.6, 1.2, 0.2], d: 13, ph: 0.25 },
        how: D.ol(['Slit open the <b>sinus venosus</b> and wash it out. Its openings lead to the main veins.', 'Probe sideways into a <b>common cardinal vein</b>, and from there forward and backward into the cardinal sinuses.', 'Find the dark <b>lateral abdominal vein</b> under the lining of each body wall.', 'There are two portal systems: one to the liver, one to the kidneys.']) },
      { t: 'Cranial nerves, ear and lateral line', flip: true, view: { t: [-5.3, 1.9, -1.2], d: 9, ph: 0.3 },
        how: D.ol(['Shave away the cartilage of the skull roof in thin slices, then pick out the roof of one orbit and one otic capsule.', 'The <b>superficial ophthalmic nerve</b> is the first you will see, running along the top of the orbit.', 'Shave the otic capsule carefully: the <b>semicircular canals</b> appear as clear tubes in the cartilage.', 'Lift the brain and turn it over to see the underside (shown to one side).']) }
    ],
    parts: parts,
    show: {
      3: ['va_palatoq', 'va_meckel', 'va_ceratohy', 'va_ceratobr', 'va_epibr', 'va_basibr'],
      4: ['cc_roof', 'cc_otic', 'cc_nasal', 'cc_rostral', 'cc_supraorb'],
      5: ['lining', 'wallflap', 'atrium', 'ventricle', 'conus', 'vaorta', 'afferent', 'daorta', 'kidney', 'va_basal', 'va_ceratobr', 'va_epibr'],
      6: ['lining', 'wallflap', 'sinusv', 'atrium', 'ventricle', 'kidney', 'liver_r', 'va_basal', 'va_ceratobr', 'va_epibr'],
      7: ['chondro', 'olfsac', 'olfbulb', 'cerebrum', 'dienc', 'optic', 'cerebel', 'auricles', 'medulla', 'opticn', 'semicirc']
    }
  };
});
