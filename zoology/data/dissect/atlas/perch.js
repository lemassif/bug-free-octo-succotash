/* Yellow perch — atlas plates: skull bones, skeleton and fin supports, muscles,
   vessels and gills, brain, ear, eye, and small organs.
   Same coordinates as perch.js: the fish lies on its right side, head at -x;
   +y is its left flank (up), -z its back, +z its belly. */
DX.extend('perch', function (B) {
  var D = DX, E = D.E, T = D.T, H = D.H, O = D.O, P = D.P, K = D.K;
  var CY = 0.95;
  var BX = [-6.5, -6.0, -5.0, -4.5, -3.8, -2.2, -0.5, 1.5, 3.2, 4.4, 5.0];
  var BR = [0.25, 0.8, 1.45, 1.74, 1.95, 2.2, 2.15, 1.8, 1.2, 0.7, 0.6];
  var k = D.kit(BX, BR, CY, 0.42), body = k.body, surf = k.surf, rad = k.rad;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var BONE = K.bone, BONE2 = 0xe2d6bd, BONE3 = 0xfaf4e2;
  var on = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(B + arguments[i]); return { on: a }; };
  /* a point on the left flank above (x, z) */
  function L(x, z, kk) { var r = rad(x), a = Math.asin(Math.max(-0.98, Math.min(0.98, z / r))) * 180 / Math.PI; return surf(x, a, kk || 1.02); }
  function zc(x) { return -0.8 + (x + 3.6) / 8.5 * 0.8; }   /* the backbone's height along the body */

  /* ================= plate 0: bones of the skull ================= */
  var S = on(1);
  add(0, 'sk_premax', 'premaxilla', 'skel', BONE3, [T([[-6.56, 1.24, -0.16], [-6.3, 1.34, 0.18]], 0.055)], 'The toothed bone forming the front edge of the upper jaw. It slides forward when the mouth opens, making a tube that sucks in prey.', S);
  add(0, 'sk_artic', 'articular (angular)', 'skel', BONE2, [T([[-5.6, 1.3, 1.0], [-5.2, 1.36, 1.2]], 0.09)], 'The rear bone of the lower jaw. It hinges on the quadrate.', S);
  add(0, 'sk_quadrate', 'quadrate', 'skel', BONE, [E(L(-5.05, 1.05), [0.16, 0.05, 0.14])], 'A small triangular bone carrying the jaw joint.', S);
  add(0, 'sk_nasal', 'nasal', 'skel', BONE3, [E(L(-5.85, -0.42), [0.16, 0.04, 0.08])], 'A small bone over the nasal sac, beside the nostrils.', S);
  add(0, 'sk_lacrimal', 'lacrimal', 'skel', BONE2, [E(L(-5.65, 0.05), [0.22, 0.04, 0.13])], 'The first and largest of the ring of bones round the eye, lying in front of it.', S);
  add(0, 'sk_infraorb', 'infraorbital (suborbital) bones', 'skel', BONE, [[-5.3, 0.2], [-4.95, 0.15], [-4.74, -0.1], [-4.74, -0.42]].map(function (p) { return E(L(p[0], p[1]), [0.13, 0.035, 0.08]); }), 'A chain of thin bones under and behind the eye. A sensory canal of the lateral line system runs through them.', S);
  add(0, 'sk_frontal', 'frontal', 'skel', BONE, [E(L(-5.2, -0.85), [0.5, 0.04, 0.14])], 'The large roofing bone between and above the eyes.', S);
  add(0, 'sk_parietal', 'parietal', 'skel', BONE2, [E(L(-4.45, -1.25), [0.2, 0.04, 0.14])], 'A small roofing bone behind the frontal.', S);
  add(0, 'sk_supraocc', 'supraoccipital crest', 'skel', BONE3, [T([[-4.3, CY, -1.6], [-3.9, CY, -2.0]], [0.06, 0.03])], 'A blade rising from the back of the skull in the midline. The front of the back muscles attaches to it.', S);
  add(0, 'sk_sphenotic', 'sphenotic', 'skel', BONE3, [E(L(-4.76, -0.76), [0.1, 0.04, 0.1])], 'A small bone at the upper rear corner of the eye socket.', S);
  add(0, 'sk_pterotic', 'pterotic', 'skel', BONE, [E(L(-4.35, -0.85), [0.18, 0.04, 0.1])], 'A bone along the side of the braincase over the ear. The hyomandibula hinges on it.', S);
  add(0, 'sk_posttemp', 'posttemporal', 'skel', BONE2, [T([L(-4.1, -1.3), L(-3.85, -1.0)], 0.045)], 'A forked bone that hangs the shoulder girdle from the back of the skull.', S);
  add(0, 'sk_supracl', 'supracleithrum', 'skel', BONE3, [T([L(-3.85, -1.0), L(-3.75, -0.5)], 0.045)], 'A small link between the posttemporal and the cleithrum.', S);
  add(0, 'sk_cleithrum', 'cleithrum', 'skel', BONE, [T([L(-3.75, -0.5), L(-3.7, 0.6), L(-4.0, 1.5), L(-4.4, 1.8)], 0.06)], 'The large curved bone of the shoulder girdle, forming the rear wall of the gill chamber. In a fish the shoulder is attached to the skull.', { on: [B + 1, B + 2] });
  add(0, 'sk_opercle', 'opercle', 'skel', BONE2, [E(L(-4.1, -0.25), [0.3, 0.05, 0.45])], 'The main plate of the gill cover.', S);
  add(0, 'sk_opspine', 'opercular spine', 'skel', BONE3, [T([L(-3.86, -0.35), L(-3.6, -0.3)], [0.04, 0.01])], 'A sharp point on the rear edge of the opercle. Mind your fingers.', S);
  add(0, 'sk_preop', 'preopercle', 'skel', BONE, [T([L(-4.6, -0.6), L(-4.55, 0.6), L(-4.9, 1.0)], [0.07, 0.09, 0.06])], 'An L-shaped bone in front of the opercle. Its edge is saw-toothed in perch.', S);
  add(0, 'sk_subop', 'subopercle', 'skel', BONE3, [E(L(-4.05, 0.55), [0.3, 0.04, 0.14])], 'The lower plate of the gill cover, under the opercle.', S);
  add(0, 'sk_interop', 'interopercle', 'skel', BONE2, [E(L(-4.55, 1.05), [0.3, 0.04, 0.12])], 'A plate between the preopercle and the subopercle, linked by a ligament to the lower jaw.', S);
  add(0, 'sk_hyomand', 'hyomandibula', 'skel', 0xd6c9aa, [T([L(-4.62, -0.75, 0.9), L(-4.75, 0.1, 0.9)], 0.07)], 'A stout bone under the preopercle that hangs the jaws and gill cover from the skull.', S);
  add(0, 'sk_symplectic', 'symplectic', 'skel', BONE3, [T([L(-4.78, 0.3, 0.9), L(-4.95, 0.8, 0.9)], 0.035)], 'A small rod wedging the hyomandibula into the quadrate.', S);
  add(0, 'sk_metapt', 'metapterygoid', 'skel', BONE2, [E(L(-4.95, 0.35, 0.92), [0.14, 0.04, 0.14])], 'A plate between the hyomandibula and the quadrate.', S);
  add(0, 'sk_endopt', 'endopterygoid (mesopterygoid)', 'skel', BONE3, [E(L(-5.25, 0.4, 0.92), [0.2, 0.03, 0.1])], 'A thin plate forming the floor of the eye socket and the roof of the mouth.', S);
  add(0, 'sk_ectopt', 'ectopterygoid', 'skel', BONE, [T([L(-5.35, 0.55, 0.94), L(-5.1, 0.85, 0.94)], 0.04)], 'A slender bone joining the palatine to the quadrate.', S);
  add(0, 'sk_palatine', 'palatine', 'skel', BONE2, [T([L(-5.95, 0.2, 0.95), L(-5.5, 0.45, 0.95)], 0.045)], 'A toothed bone in the roof of the mouth, running forward to the upper jaw.', S);
  add(0, 'sk_parasph', 'parasphenoid', 'skel', BONE, [T([[-5.9, CY, -0.05], [-4.3, CY, -0.45]], 0.04)], 'A long midline bar under the braincase, seen crossing the eye socket.', S);
  add(0, 'sk_vomer', 'vomer', 'skel', BONE3, [E([-6.05, CY, -0.1], [0.14, 0.06, 0.08])], 'A small midline bone at the front of the roof of the mouth. It carries a patch of teeth.', S);
  add(0, 'sk_ceratohy', 'ceratohyal', 'skel', BONE, [T([[-5.3, 1.15, 1.35], [-4.6, 1.15, 1.75]], 0.07)], 'The main bone of the hyoid arch under the gill cover. The branchiostegal rays hang from it.', S);
  add(0, 'sk_hypohy', 'hypohyals', 'skel', BONE3, [E([-5.4, 1.1, 1.3], [0.07, 0.06, 0.06])], 'Two small bones at the front end of the ceratohyal.', S);
  add(0, 'sk_urohyal', 'urohyal', 'skel', BONE2, [T([[-5.2, CY, 1.5], [-4.5, CY, 1.9]], 0.04)], 'A midline blade under the throat. The muscle that opens the mouth pulls on it.', S);
  add(0, 'sk_basihy', 'basihyal (tongue bone)', 'skel', BONE, [T([[-6.0, CY, 0.5], [-5.5, CY, 0.9]], 0.05)], 'The bone inside the stiff, immovable tongue.', S);

  /* ================= plate 1: backbone, girdles and fin supports ================= */
  var PX = D.pts(20, function (i) { return -3.5 + i * 0.247; }), CX = D.pts(20, function (i) { return 1.45 + i * 0.172; });
  add(1, 'ax_precaud', 'precaudal (abdominal) vertebrae', 'skel', BONE, PX.map(function (x) { return E([x, CY, zc(x)], [0.1, 0.11, 0.11]); }), 'About twenty vertebrae over the body cavity. Each bears a pair of ribs and has no haemal arch.');
  add(1, 'ax_caud', 'caudal vertebrae', 'skel', BONE2, CX.map(function (x) { return E([x, CY, zc(x)], [0.075, 0.1, 0.1]); }), 'About twenty vertebrae behind the body cavity. Each has a haemal arch and spine below as well as a neural spine above.');
  add(1, 'ax_nsp', 'neural spines', 'skel', BONE3, PX.concat(CX).map(function (x, i) { return T([[x, CY, zc(x) - 0.1], [x + 0.28, CY, zc(x) - (i < 20 ? 0.85 : 0.85 - (i - 20) * 0.03)]], 0.022); }), 'A spine sloping up and back from the top of every vertebra.');
  add(1, 'ax_hsp', 'haemal spines', 'skel', BONE3, CX.map(function (x, i) { return T([[x, CY, zc(x) + 0.1], [x + 0.28, CY, zc(x) + 0.85 - i * 0.03]], 0.022); }), 'A spine sloping down and back from every tail vertebra, mirroring the neural spine.');
  add(1, 'ax_ribs', 'pleural ribs', 'skel', BONE, PX.slice(1, 17).map(function (x) { return T([[x, CY + 0.2, zc(x) + 0.1], [x + 0.15, CY + 0.55, zc(x) + 1.0], [x + 0.2, CY + 0.25, zc(x) + 1.75]], 0.02); }), 'Slender curved ribs in the wall of the body cavity.');
  add(1, 'ax_epipl', 'epipleural (intermuscular) bones', 'skel', 0xd6c9aa, PX.slice(1, 15).map(function (x) { return T([[x, CY + 0.25, zc(x) + 0.12], [x + 0.5, CY + 0.6, zc(x) - 0.15]], 0.012); }), 'Fine needles branching from the ribs into the muscle: the small bones you pick out of a fillet.');
  add(1, 'ax_pteryg', 'pterygiophores', 'skel', BONE2, D.row(13, function (i) { var x = -3.15 + i * 0.29; return T([[x, CY, -1.62], [x - 0.08, CY, -2.05]], 0.025); }).concat(D.row(8, function (i) { var x = 0.95 + i * 0.27; return T([[x, CY, -1.45 + i * 0.05], [x - 0.05, CY, -1.95 + i * 0.08]], 0.025); })).concat(D.row(7, function (i) { var x = 1.65 + i * 0.22; return T([[x, CY, 1.3 - i * 0.04], [x, CY, 1.75 - i * 0.07]], 0.025); })), 'A row of small bones buried in the muscle, one supporting the base of each ray of the dorsal and anal fins.');
  add(1, 'ax_dspines', 'spines of the dorsal fin', 'skel', BONE3, D.row(13, function (i) { var x = -3.2 + i * 0.29, h = 1.25 + Math.sin((i + 1) / 13 * Math.PI) * 0.35 - i * 0.06; return T([[x, CY, -2.08], [x + 0.25, CY, -2.08 - h]], [0.03, 0.006]); }), 'Stiff, sharp, unjointed rays supporting the first dorsal fin. Spiny rays are the mark of the perch-like fishes.');
  add(1, 'ax_dsoft', 'soft rays (lepidotrichia)', 'skel', 0xe9dcb8, D.row(12, function (i) { var x = 0.95 + i * 0.18; return T([[x, CY, -1.95 + i * 0.05], [x + 0.4, CY, -2.95 + i * 0.12]], 0.014); }), 'Flexible rays, each jointed and branching toward its tip, supporting the second dorsal fin.');
  add(1, 'ax_urostyle', 'urostyle', 'skel', BONE, [T([[4.75, CY, -0.02], [5.05, CY, -0.3]], [0.08, 0.03])], 'The upturned tip of the backbone. The tail looks symmetrical, but the skeleton still turns up inside it.');
  add(1, 'ax_hypural', 'hypural plate', 'skel', BONE2, [E([5.08, CY, 0], [0.13, 0.04, 0.6])], 'A fan of flattened haemal spines on which the tail-fin rays hinge.');
  add(1, 'ax_crays', 'caudal fin rays', 'skel', 0xe9dcb8, D.row(15, function (i) { var z = -0.56 + i * 0.08, f = Math.abs(i - 7) / 7; return T([[5.2, CY, z], [6.3 + f * 0.55, CY, z * 3.4]], 0.014); }), 'The soft rays of the tail fin.');
  add(1, 'pg_scapula', 'scapula', 'skel', BONE3, [E(L(-3.55, 0.3, 0.97), [0.12, 0.04, 0.14])], 'A small plate behind the cleithrum, pierced by a hole.');
  add(1, 'pg_coracoid', 'coracoid', 'skel', BONE, [T([L(-3.6, 0.5, 0.97), L(-3.9, 1.4, 0.97)], [0.1, 0.04])], 'A blade below the scapula reaching forward along the cleithrum.');
  add(1, 'pg_radials', 'radials (actinosts)', 'skel', BONE3, D.row(4, function (i) { return E(L(-3.36, 0.42 + i * 0.13, 0.99), [0.06, 0.03, 0.05]); }), 'Four small hourglass-shaped bones on which the rays of the pectoral fin hinge.');
  add(1, 'pg_postcl', 'postcleithrum', 'skel', BONE2, [T([L(-3.6, 0.5), L(-3.3, 1.6)], 0.03)], 'A slender strut running down and back from the cleithrum inside the body wall.');
  add(1, 'pg_prays', 'pectoral fin rays', 'skel', 0xe9dcb8, D.row(11, function (i) { var f = i / 10; return T([[-3.22, 1.74, 0.72 + f * 0.25], [-2.2 + f * 0.45 - Math.abs(f - 0.5) * 0.2, 1.9, 0.2 + f * 1.3]], 0.013); }), 'The soft rays of the pectoral fin.');
  add(1, 'pv_basi', 'basipterygium (pelvic bone)', 'skel', BONE, [T([[-3.3, CY + 0.2, 1.75], [-2.5, CY + 0.25, 2.05]], [0.05, 0.09])], 'The single bone on each side that is the whole pelvic girdle. In perch it has moved forward and is tied to the shoulder girdle.');
  add(1, 'pv_spine', 'pelvic spine', 'skel', BONE3, [T([[-2.5, 1.22, 2.05], [-2.2, 1.3, 3.1]], [0.04, 0.01])], 'The single stiff spine at the leading edge of each pelvic fin.');
  add(1, 'pv_rays', 'pelvic soft rays', 'skel', 0xe9dcb8, D.row(5, function (i) { return T([[-2.4 + i * 0.18, 1.22, 2.08], [-2.0 + i * 0.2, 1.3, 3.2 - i * 0.07]], 0.013); }), 'Five branched rays behind the pelvic spine.');
  add(1, 'an_spines', 'anal spines', 'skel', BONE3, D.row(2, function (i) { return T([[1.62 + i * 0.12, CY, 1.78], [1.78 + i * 0.15, CY, 2.75]], [0.035, 0.008]); }), 'Two stout spines at the front of the anal fin.');
  add(1, 'an_rays', 'anal soft rays', 'skel', 0xe9dcb8, D.row(7, function (i) { return T([[1.9 + i * 0.18, CY, 1.72 - i * 0.07], [2.25 + i * 0.14, CY, 2.7 - i * 0.2]], 0.013); }), 'The soft rays of the anal fin.');

  /* ================= plate 2: muscles ================= */
  add(2, 'mu_ctx', 'body, skinned', 'musc', 0xd9bfb0, [body(1, 10, null, 0.97)], '', { x: 1, dull: 1 });
  add(2, 'mu_epax', 'epaxial muscles', 'musc', 0xe9cfc0, [body(4, 10, [-88, -12], 1.0)], 'The upper half of each muscle block, above the horizontal septum. It is white muscle, used for sudden bursts of speed.');
  add(2, 'mu_hypax', 'hypaxial muscles', 'musc', 0xe3c5b4, [body(4, 10, [12, 88], 1.0)], 'The lower half of each muscle block. Over the body cavity it is thin.');
  add(2, 'mu_red', 'red muscle (lateralis superficialis)', 'musc', 0x9a3a36, [body(4, 10, [-9, 9], 1.006)], 'A thin dark strip along the midline of the flank, under the lateral line. Rich in blood and myoglobin, it powers steady cruising without tiring.');
  add(2, 'mu_addmand', 'adductor mandibulae', 'musc', K.muscle, [E(L(-4.95, 0.35, 1.02), [0.3, 0.06, 0.36])], 'The cheek muscle, in several layers between the eye and the preopercle. It closes the mouth.');
  add(2, 'mu_levarc', 'levator arcus palatini', 'musc', K.muscle2, [E(L(-4.8, -0.5, 1.02), [0.1, 0.04, 0.12])], 'A small muscle behind the eye. It swings the side of the head outward, widening the mouth cavity to suck water in.');
  add(2, 'mu_dilop', 'dilator operculi', 'musc', 0xd08a7c, [E(L(-4.55, -0.76, 1.03), [0.14, 0.04, 0.08])], 'A small muscle from the skull to the front corner of the opercle. It opens the gill cover.');
  add(2, 'mu_levop', 'levator operculi', 'musc', K.muscle, [E(L(-4.1, -0.86, 1.03), [0.2, 0.04, 0.1])], 'Runs from the skull to the upper edge of the opercle. Lifting the opercle also pulls the lower jaw open.');
  add(2, 'mu_sternohy', 'sternohyoideus', 'musc', K.muscle2, [T([[-4.6, CY + 0.2, 1.85], [-3.9, CY + 0.2, 1.9]], [0.1, 0.16])], 'Under the throat, from the shoulder girdle to the urohyal. It drops the floor of the mouth: the main muscle of the feeding strike.');
  add(2, 'mu_pecabd', 'abductor of the pectoral fin', 'musc', 0xd08a7c, [E(L(-3.5, 0.75, 1.03), [0.2, 0.05, 0.3])], 'A fan of muscle on the outer face of the shoulder girdle. It swings the fin forward and out.');
  add(2, 'mu_dfin', 'erector and depressor muscles of the dorsal fin', 'musc', 0xb86a5c, D.row(13, function (i) { var x = -3.15 + i * 0.29; return T([[x - 0.06, CY + 0.08, -1.85], [x, CY + 0.08, -2.07]], 0.04); }), 'A pair of small muscles to each ray. They raise the fin and fold it flat.');
  add(2, 'mu_supracar', 'supracarinalis', 'musc', K.muscle, [T([[-3.9, CY, -2.0], [-3.3, CY, -2.1]], 0.06)], 'A thin cord along the midline of the back from the skull to the first dorsal fin.');
  add(2, 'mu_infracar', 'infracarinalis', 'musc', K.muscle2, [T([[-1.4, CY, 2.14], [0, CY, 2.12], [1.2, CY, 2.0]], 0.05)], 'A thin cord along the midline of the belly between the pelvic fins and the anus.');
  add(2, 'mu_tail', 'flexor muscles of the tail fin', 'musc', 0xd08a7c, [E([4.72, CY + 0.2, 0], [0.3, 0.06, 0.5])], 'Small fan-shaped muscles on the tail base that spread and angle the fin rays.');

  /* ================= plate 3: vessels and gills ================= */
  var AR = K.artery, AR2 = 0xd9564a, VE = K.vein, VE2 = 0x5673bd;
  add(3, 'ar_aff', 'afferent branchial arteries', 'circ', 0xb5453c, D.row(4, function (i) { return T([[-4.0 - i * 0.17, 1.08, 1.22 - i * 0.1], [-3.93 - i * 0.17, 1.36, 0.5]], 0.025); }), 'Four pairs of branches of the ventral aorta carrying oxygen-poor blood up into the gill arches.');
  add(3, 'ar_eff', 'efferent branchial arteries', 'circ', AR, D.row(4, function (i) { return T([[-3.93 - i * 0.17, 1.4, -0.3], [-3.8 - i * 0.15, 1.1, -0.8]], 0.025); }), 'Four pairs carrying oxygenated blood from the tops of the gill arches to the dorsal aorta.');
  add(3, 'ar_daorta', 'dorsal aorta', 'circ', AR, [T([[-4.4, CY, -0.7], [-3.6, CY, -0.86], [-1.5, CY, -1.28], [1.2, CY, -0.85], [3.0, CY, -0.2]], 0.045)], 'The main artery, running back just under the backbone.');
  add(3, 'ar_carotid', 'carotid artery', 'circ', AR2, [T([[-4.4, CY, -0.7], [-5.0, CY, -0.6], [-5.4, CY + 0.1, -0.4]], 0.02)], 'Runs forward from the first efferent arteries to the head and brain.');
  add(3, 'ar_coelmes', 'coeliacomesenteric artery', 'circ', AR2, [T([[-3.3, CY, -0.9], [-2.9, CY, -0.3], [-2.3, CY, 0.1]], 0.03)], 'The single large branch of the aorta to the stomach, liver, intestine and gonads.');
  add(3, 'ar_caudal', 'caudal artery', 'circ', AR, [T([[3.0, CY, -0.2], [4.8, CY, -0.06]], 0.03)], 'The aorta continued into the tail through the haemal arches.');
  add(3, 've_caudal', 'caudal vein', 'circ', VE, [T([[4.8, CY, 0.08], [3.0, CY, -0.04], [1.4, CY, -0.7]], 0.035)], 'Runs forward under the caudal artery and enters the kidney.');
  add(3, 've_pcard', 'posterior cardinal vein', 'circ', VE2, [T([[1.3, CY + 0.16, -0.95], [-1.6, CY + 0.16, -1.45], [-3.2, CY + 0.16, -1.15]], 0.045)], 'Runs forward through the kidney, collecting its blood.');
  add(3, 've_acard', 'anterior cardinal vein', 'circ', VE, [T([[-4.9, CY + 0.1, -0.7], [-4.0, CY + 0.1, -0.95], [-3.3, CY + 0.1, -1.05]], 0.04)], 'Drains the head.');
  add(3, 've_ccard', 'common cardinal vein (duct of Cuvier)', 'circ', VE2, [T([[-3.3, CY + 0.1, -1.05], [-3.2, CY + 0.1, 0], [-3.15, 1.05, 0.9]], 0.05)], 'Formed by the anterior and posterior cardinal veins. It runs down the wall behind the gills to the sinus venosus.');
  add(3, 've_hepatic', 'hepatic vein', 'circ', VE, [T([[-2.9, 1.1, 0.9], [-3.1, 1.05, 1.0]], 0.05)], 'A short vein from the liver to the sinus venosus.');
  add(3, 've_hportal', 'hepatic portal vein', 'circ', 0x34508f, [T([[-0.8, 1.05, 0.9], [-1.6, 1.1, 0.7], [-2.4, 1.1, 0.6]], 0.035)], 'Carries blood from the stomach and intestine to the liver.');
  add(3, 'gl_pseudo', 'pseudobranch', 'resp', 0xd23a44, [E(L(-4.45, -0.45, 0.9), [0.12, 0.04, 0.1])], 'A small red patch like a gill on the inside of the gill cover. It receives blood that is already oxygenated and passes it to the eye.');
  add(3, 'gl_upph', 'upper pharyngeal teeth', 'dig', 0xfbf7ea, [E([-3.95, CY, -0.5], [0.14, 0.1, 0.1])], 'A pad of fine teeth on the tops of the last gill arches, in the roof of the throat.');
  add(3, 'gl_lowph', 'lower pharyngeal teeth', 'dig', 0xf4eedd, [E([-3.9, CY, 0.7], [0.14, 0.1, 0.1])], 'A pad of teeth on the fifth gill arch, in the floor of the throat. The two pads are a second set of jaws that grip prey and move it down.');

  /* ================= plate 4: brain, ear, eye, small organs and a scale ================= */
  var NV = K.nerve, NV3 = 0xfaf6d6;
  add(4, 'ne_opticn', 'optic nerve', 'nerv', NV, [T([[-4.5, CY + 0.12, -0.9], [-4.9, CY + 0.3, -0.5], [-5.1, 1.35, -0.35]], 0.03)], 'A thick cord from the eye. The two cross under the brain without mixing: each goes whole to the opposite side.');
  add(4, 'ne_pituit', 'pituitary (hypophysis)', 'endo', 0xe8b7c8, [E([-4.5, CY, -0.82], [0.06, 0.06, 0.05])], 'A small gland hanging under the brain. Fish farmers inject pituitary extract to make broodfish spawn.');
  add(4, 'ne_inflobes', 'inferior lobes', 'nerv', 0xcfa594, [E([-4.3, CY + 0.1, -0.86], [0.1, 0.07, 0.07]), E([-4.3, CY - 0.1, -0.86], [0.1, 0.07, 0.07])], 'A pair of swellings on the underside of the brain behind the pituitary.');
  add(4, 'ne_pineal', 'pineal body', 'nerv', 0xb98a7a, [E([-4.62, CY, -1.2], [0.03, 0.03, 0.03])], 'A tiny light-sensitive body on top of the brain between the cerebrum and the optic lobes.');
  add(4, 'ne_rosette', 'olfactory rosette', 'nerv', 0xc98274, [E([-5.62, 1.3, -0.48], [0.12, 0.06, 0.1])].concat(D.row(5, function (i) { return T([[-5.72 + i * 0.05, 1.37, -0.56], [-5.72 + i * 0.05, 1.37, -0.4]], 0.012); })), 'A pleated disc of sensory tissue inside the nasal sac. Water flows in one nostril, over it, and out the other.');
  add(4, 'er_sagitta', 'sagitta', 'nerv', 0xffffff, [E([-3.95, CY + 0.25, -0.95], [0.1, 0.03, 0.06])], 'The largest of three ear stones (otoliths), white and hard. It grows a ring every year, and fisheries biologists read fish ages from it.');
  add(4, 'er_lapillus', 'lapillus', 'nerv', 0xf4f0e6, [E([-4.06, CY + 0.28, -1.12], [0.03, 0.02, 0.03])], 'A tiny ear stone in the upper chamber of the inner ear, used for balance.');
  add(4, 'er_aster', 'asteriscus', 'nerv', 0xf4f0e6, [E([-3.82, CY + 0.25, -0.9], [0.03, 0.02, 0.03])], 'The third ear stone, behind the sagitta.');
  add(4, 'er_canals', 'semicircular canals', 'nerv', 0xdbe7ee, [O([-4.0, CY + 0.3, -1.1], 0.11, 0.015), O([-4.0, CY + 0.3, -1.1], 0.1, 0.015, [90, 0, 0]), O([-4.0, CY + 0.3, -1.1], 0.09, 0.015, [0, 90, 0])], 'Three loops above the ear stones that detect turning. A fish has no outer or middle ear.');
  add(4, 'ne_vagus', 'vagus nerve', 'nerv', NV, [T([[-3.75, CY + 0.08, -0.92], [-3.5, CY + 0.2, -0.5], [-3.2, CY + 0.2, 0]], 0.018)], 'Leaves the back of the medulla for the gills, heart and gut.');
  add(4, 'ne_llnerve', 'lateral line nerve', 'nerv', 0xe6dc9c, [T([[-3.75, CY + 0.1, -0.92], [-2, CY + 0.5, -0.5], [1, CY + 0.5, -0.3], [4, CY + 0.25, -0.1]], 0.016)], 'A branch of the vagus running the length of the body under the lateral line canal.');
  var EX = -5.4, EY = 0.5, EZ = -3.5;
  add(4, 'ey_sclera', 'sclera', 'nerv', 0xe6e2d6, [H([EX, EY, EZ], [0.55, 0.5, 0.55], null, { th: 100 })], 'The outer coat of the eyeball, stiffened with cartilage. The eye is shown removed, cut in half and enlarged.');
  add(4, 'ey_retina', 'retina', 'nerv', 0x4a3a3a, [H([EX, EY, EZ], [0.48, 0.44, 0.48], null, { th: 90 })], 'The dark light-sensitive lining.');
  add(4, 'ey_cornea', 'cornea', 'nerv', 0xcfe2e8, [E([EX, EY + 0.44, EZ], [0.36, 0.05, 0.36])], 'Nearly flat. Under water a cornea cannot bend light, so all the focusing is done by the lens.', { a: 0.5 });
  add(4, 'ey_iris', 'iris', 'nerv', 0xe9c23a, [O([EX, EY + 0.38, EZ], 0.24, 0.05, [90, 0, 0])], 'The golden ring round the pupil. It cannot change the size of the pupil.');
  add(4, 'ey_lens', 'lens', 'nerv', 0xf4f8fa, [E([EX, EY + 0.2, EZ], [0.2, 0.2, 0.2])], 'A hard, perfectly round ball that bulges through the pupil. It keeps its shape after cooking: the white bead in a baked fish’s eye.', { a: 0.85 });
  add(4, 'ey_retractor', 'retractor lentis', 'nerv', K.muscle, [T([[EX + 0.12, EY + 0.12, EZ + 0.12], [EX + 0.34, EY - 0.1, EZ + 0.3]], 0.025)], 'A small muscle that pulls the whole lens backward to focus on distant things. Fish focus as a camera does, by moving the lens.');
  add(4, 'sb_gasgland', 'gas gland (red body)', 'resp', 0xb5453c, [E([-2.6, CY + 0.12, -0.62], [0.25, 0.08, 0.12])], 'A red patch on the floor of the swim bladder fed by a dense net of capillaries. It secretes gas into the bladder from the blood.');
  add(4, 'sb_oval', 'oval', 'resp', 0xe8b7c8, [E([0.3, CY + 0.12, -1.0], [0.2, 0.06, 0.1])], 'A thin window at the rear of the swim bladder through which gas is absorbed back into the blood. Perch have no duct from the bladder to the gut.');
  add(4, 'ex_headkid', 'head kidney', 'exc', 0x7a2f3a, [E([-3.6, CY, -1.32], [0.25, 0.16, 0.14])], 'The swollen front end of the kidney, behind the gills. It makes blood cells, not urine.');
  add(4, 'ex_duct', 'mesonephric duct (ureter)', 'exc', K.duct, [T([[0.2, CY + 0.1, -1.3], [1.0, CY + 0.05, -0.3], [1.12, 0.98, 1.05]], 0.02)], 'The duct that carries urine from the rear of the kidney down to the urinary bladder.');
  add(4, 're_gonoduct', 'gonoduct', 'repro', 0xe9c9a0, [T([[1.35, 0.95, 1.6], [1.36, CY, 1.95]], 0.04)], 'A short duct from the gonad to the urogenital opening behind the anus.');
  add(4, 'tt_jaw', 'jaw teeth', 'dig', 0xfbf7ea, [T([[-6.5, 1.2, 0.02], [-6.2, 1.25, 0.4], [-5.8, 1.28, 0.72]], 0.02)], 'Bands of many fine, backward-pointing teeth on the premaxilla and dentary. They hold prey; they do not chew.');
  add(4, 'tt_vomer', 'vomerine teeth', 'dig', 0xf4eedd, [E([-6.05, 1.06, -0.05], [0.1, 0.03, 0.06])], 'A patch of teeth on the vomer in the roof of the mouth.');
  var SX = 4.6, SZ = 3.5, SYy = 0.1;
  add(4, 'sc_body', 'one scale, enlarged', 'ext', 0xe9e2c4, [E([SX, SYy, SZ], [0.9, 0.03, 0.8])], '', { x: 1 });
  add(4, 'sc_focus', 'focus', 'ext', 0x8a7a4a, [E([SX + 0.25, SYy + 0.04, SZ], [0.06, 0.02, 0.06])], 'The centre of the scale, the first part to form.');
  add(4, 'sc_circuli', 'circuli', 'ext', 0xb9aa78, D.row(5, function (i) { return O([SX + 0.25 - i * 0.03, SYy + 0.04, SZ], 0.16 + i * 0.1, 0.008, [90, 0, 0]); }), 'Fine ridges laid down round the focus as the scale grows, like the grain of a tree.');
  add(4, 'sc_annuli', 'annuli', 'ext', 0x6a5a2a, [O([SX + 0.16, SYy + 0.045, SZ], 0.4, 0.014, [90, 0, 0]), O([SX + 0.1, SYy + 0.045, SZ], 0.62, 0.014, [90, 0, 0])], 'Dark bands where the circuli crowd together in winter, when growth slows. Count them to age the fish.');
  add(4, 'sc_radii', 'radii', 'ext', 0x7a6a3a, D.row(5, function (i) { var a = (i - 2) * 0.3; return T([[SX + 0.2, SYy + 0.045, SZ + a * 0.2], [SX - 0.85, SYy + 0.045, SZ + a * 1.9]], 0.008); }), 'Grooves fanning from the focus to the front edge, the edge buried in the skin. They let the scale flex.');
  add(4, 'sc_ctenii', 'ctenii', 'ext', 0xcfc27a, D.row(9, function (i) { var z = SZ - 0.5 + i * 0.125; return T([[SX + 0.82 - Math.abs(i - 4) * 0.04, SYy + 0.04, z], [SX + 1.0 - Math.abs(i - 4) * 0.04, SYy + 0.04, z]], [0.016, 0.004]); }), 'A comb of tiny teeth on the exposed rear edge. They make a perch feel rough when stroked toward the head, and give the ctenoid scale its name.');

  return {
    steps: [
      { t: 'Skeleton: bones of the skull', view: { t: [-4.9, 1.2, 0], d: 7.5, ph: 0.25 },
        how: D.ol(['A fish skull has far more separate bones than a mammal’s. Use a prepared skull, or simmer a head and pick it apart.', 'Take them in sets: the <b>jaws</b>; the <b>ring round the eye</b>; the four bones of the <b>gill cover</b>; the roof; and the chain that hangs the jaws from the skull.', 'The shoulder girdle is attached to the back of the skull by the <b>posttemporal</b>.']) },
      { t: 'Skeleton: backbone and fin supports', view: { t: [0.5, 0.9, -0.2], d: 19.5, ph: 0.28 },
        how: D.ol(['The backbone has two regions only: <b>precaudal</b> vertebrae with ribs, and <b>caudal</b> vertebrae with haemal spines.', 'Every fin ray rests on its own small bone in the muscle.', 'Compare the stiff <b>spines</b> of the first dorsal fin with the jointed <b>soft rays</b> of the second.']) },
      { t: 'Muscles', view: { t: [-0.5, 1.1, 0], d: 15, ph: 0.28 },
        how: D.ol(['Skin the left side from the gill cover to the tail.', 'Nearly all of the fish is one muscle, the great lateral muscle, in W-shaped blocks.', 'Find the thin strip of <b>red muscle</b> along the midline of the flank.', 'On the head, the cheek and the muscles round the gill cover work the mouth and the breathing pump.']) },
      { t: 'Vessels and gills', view: { t: [-2.2, 1.0, 0], d: 9.5, ph: 0.25 },
        how: D.ol(['Blood goes round once: heart, gills, body, heart. Trace it in that order.', 'From the <b>ventral aorta</b>, four pairs of arteries enter the gill arches; four pairs leave from the tops of the arches and join as the <b>dorsal aorta</b>.', 'Lift a gill arch right out and look down the throat for the two pads of <b>pharyngeal teeth</b>.']) },
      { t: 'Brain, ear, eye and small organs', view: { t: [-0.4, 1.0, 0], d: 18, ph: 0.3 },
        how: D.ol(['Behind the brain, break open the bone on each side to find the white ear stones. The largest, the <b>sagitta</b>, is as big as a grain of rice.', 'Take out an eye and cut it in half (shown enlarged above the head). The lens is a hard ball.', 'Slit open the swim bladder and look for the red <b>gas gland</b> on its floor.', 'Pull a scale from the flank and look at it against the light under a dissecting microscope (shown enlarged near the tail).']) }
    ],
    parts: parts,
    show: {
      0: ['maxilla', 'mandible'],
      1: ['maxilla', 'mandible'],
      2: ['maxilla', 'mandible', 'eye'],
      3: ['cavity', 'sinusv', 'atrium', 'ventricle', 'bulbus', 'vaorta', 'gillarch', 'kidney', 'liver'],
      4: ['cavity', 'craniumf', 'olfbulb', 'cerebrum', 'optic', 'cerebel', 'medulla', 'cord', 'swimbl', 'kidney', 'ubladder', 'maxilla', 'mandible', 'eye']
    }
  };
});
