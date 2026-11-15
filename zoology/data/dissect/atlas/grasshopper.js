/* Grasshopper — atlas plates, laid out on the tray as lab-manual plates:
   the head and each mouthpart taken apart, the thorax, wing and leg in detail,
   the tip of the abdomen, and the fine detail of the internal organs. */
DX.extend('grasshopper', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, F = D.F, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var CU = 0x9aa64a, CU2 = 0xb5bd5e, CU3 = 0x7f8a3a, PALE = 0xdcd9a8, DARK = 0x2a2a1c, Y = 0.14;
  function seg(a, b, r, y) { return T([[a[0], y || Y, a[1]], [b[0], y || Y, b[1]]], r); }

  /* ================= plate 0: the head from the front, and the mouthparts taken apart ================= */
  var HX = -4.2, HZ = -1.6;
  add(0, 'hd_ctx', 'head, from the front, with eyes and labrum', 'ext', CU2, [E([HX, 0.1, HZ], [1.25, 0.08, 1.7]), E([HX - 0.95, 0.2, HZ - 0.55], [0.3, 0.08, 0.5]), E([HX + 0.95, 0.2, HZ - 0.55], [0.3, 0.08, 0.5]), E([HX, 0.2, HZ + 1.5], [0.5, 0.05, 0.28])], '', { x: 1, dull: 1 });
  add(0, 'hd_vertex', 'vertex', 'ext', CU, [E([HX, 0.2, HZ - 1.3], [0.7, 0.05, 0.32])], 'The top of the head, between and behind the compound eyes.');
  add(0, 'hd_frons', 'frons', 'ext', CU3, [E([HX, 0.2, HZ - 0.2], [0.5, 0.05, 0.6])], 'The front of the head: the “face”, between the eyes and down to the clypeus. The middle ocellus sits on it.');
  add(0, 'hd_clypeus', 'clypeus', 'ext', CU, [E([HX, 0.2, HZ + 0.95], [0.55, 0.05, 0.24])], 'The plate below the frons to which the upper lip is hinged.');
  add(0, 'hd_gena', 'gena', 'ext', CU2, [E([HX - 0.95, 0.2, HZ + 0.5], [0.24, 0.05, 0.5]), E([HX + 0.95, 0.2, HZ + 0.5], [0.24, 0.05, 0.5])], 'The cheek: the side of the head below and behind each eye.');
  add(0, 'hd_suture', 'epicranial suture', 'ext', DARK, [seg([HX, HZ - 1.6], [HX, HZ - 0.9], 0.02, 0.26), seg([HX, HZ - 0.9], [HX - 0.5, HZ - 0.4], 0.02, 0.26), seg([HX, HZ - 0.9], [HX + 0.5, HZ - 0.4], 0.02, 0.26)], 'A faint line shaped like an upside-down Y. It is the line of weakness along which the head capsule splits at each moult.');
  add(0, 'hd_socket', 'antennal sockets', 'ext', 0x4a4a2a, [O([HX - 0.48, 0.24, HZ - 0.85], 0.1, 0.03, [90, 0, 0]), O([HX + 0.48, 0.24, HZ - 0.85], 0.1, 0.03, [90, 0, 0])], 'The ring of membrane in which each antenna pivots.');
  add(0, 'an_scape', 'scape', 'nerv', CU3, [seg([HX - 0.48, HZ - 0.85], [HX - 0.75, HZ - 1.25], 0.07, 0.26), seg([HX + 0.48, HZ - 0.85], [HX + 0.75, HZ - 1.25], 0.07, 0.26)], 'The first, largest segment of the antenna, the only one moved by muscles in the head.');
  add(0, 'an_pedicel', 'pedicel', 'nerv', CU, [seg([HX - 0.75, HZ - 1.25], [HX - 0.9, HZ - 1.45], 0.055, 0.26), seg([HX + 0.75, HZ - 1.25], [HX + 0.9, HZ - 1.45], 0.055, 0.26)], 'The short second segment. It holds a sense organ that detects movement of the rest of the antenna, including the airflow in flight.');
  add(0, 'an_flagellum', 'flagellum', 'nerv', CU2, [seg([HX - 0.9, HZ - 1.45], [HX - 2.1, HZ - 2.6], [0.04, 0.02], 0.26), seg([HX + 0.9, HZ - 1.45], [HX + 2.1, HZ - 2.6], [0.04, 0.02], 0.26)], 'The long remainder of the antenna, about two dozen similar rings covered in smell and touch receptors.');
  /* mandible */
  var MZ = 1.4;
  add(0, 'mp_mandctx', 'a mandible, removed', 'dig', 0x7a5a2a, [E([-6.2, 0.14, MZ], [0.55, 0.14, 0.5])], '', { x: 1 });
  add(0, 'mp_incisor', 'incisor teeth of the mandible', 'dig', 0x3a2a12, D.row(4, function (i) { return T([[-5.75, 0.2, MZ + 0.32 - i * 0.07], [-5.5, 0.2, MZ + 0.4 - i * 0.07]], [0.05, 0.015]); }), 'Sharp dark points on the tip. They shear pieces from a leaf.');
  add(0, 'mp_molar', 'molar surface of the mandible', 'dig', 0x5a4220, [E([-5.82, 0.22, MZ - 0.18], [0.2, 0.06, 0.2])], 'A ridged grinding area nearer the base. It crushes what the incisors cut.');
  /* maxilla */
  add(0, 'mx_cardo', 'cardo', 'dig', CU3, [E([-4.2, 0.14, MZ - 0.5], [0.22, 0.06, 0.14])], 'The basal piece of the maxilla, hinging it to the head.');
  add(0, 'mx_stipes', 'stipes', 'dig', CU, [T([[-4.2, 0.14, MZ - 0.35], [-4.2, 0.14, MZ + 0.2]], 0.18)], 'The main body of the maxilla. The palp and both lobes arise from it.');
  add(0, 'mx_lacinia', 'lacinia', 'dig', 0x7a5a2a, [T([[-4.3, 0.14, MZ + 0.2], [-4.42, 0.14, MZ + 0.75]], [0.09, 0.02])], 'The inner lobe, tipped with teeth. It holds and cuts food.');
  add(0, 'mx_galea', 'galea', 'dig', PALE, [T([[-4.12, 0.14, MZ + 0.2], [-4.05, 0.14, MZ + 0.8]], [0.1, 0.07])], 'The soft, hood-like outer lobe that folds over the lacinia.');
  add(0, 'mx_palp', 'maxillary palp', 'nerv', CU2, [T([[-3.98, 0.14, MZ + 0.05], [-3.5, 0.14, MZ + 0.3], [-3.2, 0.14, MZ + 0.9]], [0.05, 0.045, 0.03])], 'A five-jointed feeler on the outer side of the stipes. It tastes food before it is eaten.');
  /* labium */
  add(0, 'lb_submentum', 'submentum', 'dig', CU3, [E([-1.2, 0.14, MZ - 0.5], [0.4, 0.05, 0.16])], 'The basal plate of the lower lip, attached to the back of the head.');
  add(0, 'lb_mentum', 'mentum', 'dig', CU, [E([-1.2, 0.14, MZ - 0.15], [0.34, 0.05, 0.14])], 'The middle plate of the lower lip.');
  add(0, 'lb_prementum', 'prementum', 'dig', CU2, [E([-1.2, 0.14, MZ + 0.2], [0.36, 0.05, 0.18])], 'The outer plate, which carries the palps and the four lobes. The lower lip is a second pair of maxillae fused in the midline.');
  add(0, 'lb_glossae', 'glossae', 'dig', PALE, [E([-1.28, 0.14, MZ + 0.5], [0.05, 0.04, 0.12]), E([-1.12, 0.14, MZ + 0.5], [0.05, 0.04, 0.12])], 'The small inner pair of lobes at the tip of the lower lip.');
  add(0, 'lb_paragloss', 'paraglossae', 'dig', 0xcfc98a, [E([-1.5, 0.14, MZ + 0.58], [0.14, 0.04, 0.22]), E([-0.9, 0.14, MZ + 0.58], [0.14, 0.04, 0.22])], 'The large outer pair of lobes. Together they form the floor of the space in which food is chewed.');
  add(0, 'lb_palp', 'labial palp', 'nerv', CU3, [T([[-1.56, 0.14, MZ + 0.2], [-2.0, 0.14, MZ + 0.5], [-2.15, 0.14, MZ + 0.95]], [0.045, 0.04, 0.03]), T([[-0.84, 0.14, MZ + 0.2], [-0.4, 0.14, MZ + 0.5], [-0.25, 0.14, MZ + 0.95]], [0.045, 0.04, 0.03])], 'A three-jointed feeler on each side of the lower lip.');

  /* ================= plate 1: thorax, wing and leg in detail ================= */
  /* thorax from the side */
  add(1, 'th_ctx', 'thorax, from the left side', 'ext', CU2, [E([-4.6, 0.08, -1.6], [1.9, 0.05, 1.3])], '', { x: 1, dull: 1 });
  add(1, 'th_pronotum', 'pronotum', 'ext', CU, [T([[-6.2, 0.16, -1.3], [-5.9, 0.16, -2.5], [-5.0, 0.16, -2.6], [-4.7, 0.16, -1.4]], 0.14, { sy: 0.3 })], 'The saddle-shaped shield over the first thoracic segment, extending back over the wing bases.');
  add(1, 'th_episternum', 'episternum', 'ext', CU3, [E([-4.1, 0.16, -1.4], [0.3, 0.04, 0.7]), E([-3.2, 0.16, -1.4], [0.3, 0.04, 0.7])], 'The front half of the side plate (pleuron) of a wing-bearing segment.');
  add(1, 'th_epimeron', 'epimeron', 'ext', CU, [E([-3.65, 0.16, -1.4], [0.2, 0.04, 0.7]), E([-2.75, 0.16, -1.4], [0.2, 0.04, 0.7])], 'The rear half of the side plate.');
  add(1, 'th_plsuture', 'pleural suture', 'ext', DARK, [seg([-3.86, -2.05], [-3.86, -0.75], 0.02, 0.21), seg([-2.96, -2.05], [-2.96, -0.75], 0.02, 0.21)], 'The groove between episternum and epimeron. Inside, it is a ridge that braces the side of the thorax against the pull of the flight and leg muscles.');
  add(1, 'th_spir1', 'first thoracic spiracle', 'resp', 0x1a1a10, [E([-4.6, 0.2, -1.75], [0.07, 0.03, 0.12])], 'A breathing hole hidden under the rear edge of the pronotum.');
  add(1, 'th_spir2', 'second thoracic spiracle', 'resp', 0x1a1a10, [E([-3.42, 0.2, -0.8], [0.06, 0.03, 0.09])], 'A breathing hole just above the base of the middle leg.');
  /* forewing, spread */
  var WX = -1.6, WZ = -2.4;
  add(1, 'wg_ctx', 'forewing (tegmen), spread', 'ext', 0xc9c48a, [F([[WX, 0.1, WZ], [WX + 3.0, 0.1, WZ - 0.5], [WX + 6.6, 0.1, WZ - 0.1], [WX + 6.4, 0.1, WZ + 0.6], [WX + 3.0, 0.1, WZ + 0.8], [WX, 0.1, WZ + 0.4]])], '', { x: 1, a: 0.7 });
  var VN = [['costa', 'The vein forming the stiff leading edge of the wing.', -0.42, -0.1], ['subcosta', 'The second vein, just behind the leading edge.', -0.25, 0.0], ['radius', 'The third and strongest vein, branching toward the wingtip.', -0.08, 0.12], ['media', 'The fourth vein, running down the middle of the wing.', 0.1, 0.25], ['cubitus', 'The fifth vein, forking toward the rear edge.', 0.3, 0.42]];
  VN.forEach(function (v, i) { add(1, 'wg_' + v[0], v[0], 'ext', i % 2 ? 0x5a5a2a : 0x6f6a30, [T([[WX + 0.1, 0.15, WZ + 0.2], [WX + 3.0, 0.15, WZ + v[2]], [WX + 6.3, 0.15, WZ + v[3]]], 0.022)], v[1]); });
  add(1, 'wg_anal', 'anal veins', 'ext', 0x5a5a2a, [T([[WX + 0.1, 0.15, WZ + 0.26], [WX + 2.0, 0.15, WZ + 0.62], [WX + 3.4, 0.15, WZ + 0.7]], 0.02), T([[WX + 0.1, 0.15, WZ + 0.3], [WX + 1.5, 0.15, WZ + 0.55]], 0.018)], 'The hindmost veins, in the rear lobe of the wing. The named veins are the same in every insect order, which is how wings are compared.');
  add(1, 'wg_cross', 'cross-veins', 'ext', 0x7a7a3a, D.row(9, function (i) { var x = WX + 1.0 + i * 0.6; return T([[x, 0.15, WZ - 0.2], [x + 0.05, 0.15, WZ + 0.35]], 0.01); }), 'Short veins linking the long ones into a net of cells. Veins are hollow struts carrying air tubes, nerves and blood.');
  add(1, 'wg_fan', 'anal fan of the hindwing', 'ext', 0xe6e2c0, [F([[WX + 0.2, 0.1, WZ + 2.0], [WX + 4.6, 0.1, WZ + 1.5], [WX + 4.9, 0.1, WZ + 2.6], [WX + 3.6, 0.1, WZ + 3.7], [WX + 1.6, 0.1, WZ + 3.9]])].concat(D.row(7, function (i) { return T([[WX + 0.2, 0.13, WZ + 2.0], [WX + 4.7 - i * 0.5, 0.13, WZ + 1.7 + i * 0.36]], 0.012); })), 'The broad rear part of the hindwing, pleated like a fan. It folds away under the narrow forewing at rest and does most of the work in flight.', { a: 0.75 });
  /* hindleg tip */
  add(1, 'lg_ctx', 'tibia and tarsus of the hindleg', 'ext', CU2, [seg([-6.4, 2.4], [-3.2, 2.2], 0.09), seg([-3.2, 2.2], [-2.2, 2.3], [0.07, 0.05])], '', { x: 1, dull: 1 });
  add(1, 'lg_spines', 'tibial spines', 'ext', 0x3a2a12, D.row(8, function (i) { var x = -5.9 + i * 0.34; return [T([[x, 0.16, 2.36], [x + 0.14, 0.16, 2.12]], [0.03, 0.006]), T([[x + 0.1, 0.16, 2.35], [x + 0.24, 0.16, 2.58]], [0.03, 0.006])]; }), 'Two rows of sharp spines along the back of the hind tibia. They dig into the ground at take-off and rake an attacker.');
  add(1, 'lg_pulvilli', 'tarsal pads (pulvilli)', 'ext', PALE, D.row(3, function (i) { return E([-3.05 + i * 0.3, 0.1, 2.32], [0.1, 0.04, 0.06]); }), 'Soft pads under the three segments of the foot that grip smooth surfaces.');

  /* ================= plate 2: the tip of the abdomen ================= */
  add(2, 'ab_ctx', 'last abdominal segments, from the side', 'ext', CU2, [T([[-3.0, 0.2, 0], [-0.5, 0.2, 0]], [0.75, 0.6], { sy: 0.3 })], '', { x: 1, dull: 1 });
  add(2, 'ab_epiproct', 'epiproct', 'ext', CU, [T([[-0.5, 0.24, -0.35], [0.25, 0.24, -0.2]], [0.2, 0.06], { sy: 0.4 })], 'A small triangular plate over the anus: the top of the eleventh segment.');
  add(2, 'ab_paraproct', 'paraprocts', 'ext', CU3, [E([-0.2, 0.24, 0.05], [0.3, 0.05, 0.16])], 'A plate on each side of the anus, below the cerci.');
  add(2, 'ab_dvalve', 'dorsal valves of the ovipositor', 'repro', 0x5a4220, [T([[0.0, 0.24, -0.1], [0.8, 0.24, -0.3], [1.2, 0.24, -0.62]], [0.14, 0.1, 0.02])], 'The upper pair of hard, pointed blades. The female forces her abdomen into the soil by opening and closing the valves, then lays her eggs in the hole.', { sex: 'f' });
  add(2, 'ab_vvalve', 'ventral valves of the ovipositor', 'repro', 0x6a5228, [T([[0.0, 0.24, 0.3], [0.8, 0.24, 0.5], [1.2, 0.24, 0.82]], [0.14, 0.1, 0.02])], 'The lower pair of digging blades. A small third pair lies hidden between them.', { sex: 'f' });
  add(2, 'ab_aedeagus', 'aedeagus', 'repro', PALE, [T([[-0.3, 0.3, 0.45], [0.35, 0.3, 0.3]], [0.1, 0.04])], 'The male’s intromittent organ, hidden inside the boat-shaped subgenital plate. Pull the plate down to see it.', { sex: 'm' });

  /* ================= plate 3: fine detail of the internal organs ================= */
  /* heart region */
  add(3, 'in_heartctx', 'heart, from above', 'circ', 0xd9c7a0, [T([[-6.6, 0.14, -2.4], [-2.0, 0.14, -2.4]], 0.09)], '', { x: 1, dull: 1 });
  add(3, 'in_ostia', 'ostia', 'circ', 0x3a2a2a, D.row(6, function (i) { return [E([-6.0 + i * 0.7, 0.18, -2.31], [0.05, 0.03, 0.03]), E([-6.0 + i * 0.7, 0.18, -2.49], [0.05, 0.03, 0.03])]; }), 'A pair of valved slits in each chamber of the heart. Blood enters through them from the space around the heart.');
  add(3, 'in_alary', 'alary muscles', 'musc', K.muscle, D.row(6, function (i) { var x = -6.0 + i * 0.7; return [F([[x, 0.12, -2.3], [x - 0.3, 0.12, -1.75], [x + 0.3, 0.12, -1.75]]), F([[x, 0.12, -2.5], [x - 0.3, 0.12, -3.05], [x + 0.3, 0.12, -3.05]])]; }), 'Fan-shaped muscles on each side of the heart. Pulling outward, they stretch the heart open so that it fills.');
  add(3, 'in_diaphragm', 'dorsal diaphragm', 'circ', 0xe9e2c4, [E([-4.3, 0.08, -2.4], [2.6, 0.02, 0.8])], 'A thin sheet stretched across the top of the abdomen under the heart, with the alary muscles in it.', { a: 0.7 });
  add(3, 'in_pericard', 'pericardial sinus', 'circ', 0xbcd0e2, [E([-4.3, 0.05, -2.4], [2.7, 0.02, 0.35])], 'The blood space above the diaphragm in which the heart lies. An insect’s blood is not confined to vessels.');
  /* tracheae */
  add(3, 'in_trunks', 'longitudinal tracheal trunks', 'resp', 0xeef2f3, [T([[-0.6, 0.14, -2.9], [5.8, 0.14, -2.9]], 0.05), T([[-0.6, 0.14, -1.9], [5.8, 0.14, -1.9]], 0.05)], 'Main air pipes running the length of the body on each side, linking the spiracles.');
  add(3, 'in_tracheoles', 'tracheoles', 'resp', 0xdfe8ea, D.row(10, function (i) { var x = -0.2 + i * 0.6; return [T([[x, 0.14, -2.9], [x + 0.2, 0.14, -2.55], [x + 0.1, 0.14, -2.35]], 0.012), T([[x, 0.14, -1.9], [x + 0.2, 0.14, -2.2], [x + 0.3, 0.14, -2.4]], 0.012)]; }), 'The finest twigs of the air tubes, ending inside the tissues. Oxygen reaches every cell directly, without being carried by the blood.');
  add(3, 'in_fatbody', 'fat body', 'endo', 0xf0e6a8, [E([2.6, 0.1, -3.6], [1.6, 0.05, 0.3])], 'Loose yellowish sheets of tissue filling the spaces of the body. It stores food and does the work of a liver.');
  /* gut and glands */
  add(3, 'in_pharynx', 'pharynx', 'dig', K.gut2, [T([[-6.6, 0.14, 0.2], [-6.0, 0.14, 0.2]], [0.16, 0.1])], 'The muscular first part of the gut, just inside the mouth. It sucks food in.');
  add(3, 'in_salduct', 'salivary duct', 'dig', 0xf4f0e6, [T([[-5.4, 0.14, 0.7], [-6.0, 0.14, 0.55], [-6.6, 0.14, 0.42]], 0.02)], 'The ducts of the two salivary glands join and open at the base of the hypopharynx.');
  /* reproductive detail */
  add(3, 're_ovarioles', 'ovarioles', 'repro', 0xe9c46a, D.row(7, function (i) { return T([[-3.6 + i * 0.22, 0.14, -0.3], [-3.3 + i * 0.26, 0.14, 0.7]], [0.02, 0.09]); }), 'The egg tubes that make up an ovary. Each holds a row of eggs, the largest and ripest at the lower end.', { sex: 'f' });
  add(3, 're_calyx', 'calyx', 'repro', 0xd9b05a, [T([[-3.3, 0.14, 0.75], [-1.7, 0.14, 0.78]], 0.07)], 'The swollen top of the oviduct into which all the ovarioles of one side open.', { sex: 'f' });
  add(3, 're_vagina', 'vagina (genital chamber)', 'repro', 0xc98f80, [T([[-1.6, 0.14, 1.3], [-0.6, 0.14, 1.3]], [0.1, 0.14])], 'The single passage formed where the two oviducts join. The spermatheca opens into it.', { sex: 'f' });
  add(3, 're_follicles', 'follicles of the testis', 'repro', K.testis, D.row(8, function (i) { return T([[-3.5 + i * 0.2, 0.14, -0.2], [-3.3 + i * 0.2, 0.14, 0.4]], [0.03, 0.06]); }), 'The many small tubes of which each testis is made. Sperm form inside them.', { sex: 'm' });
  add(3, 're_ejac', 'ejaculatory duct', 'repro', K.duct, [T([[-1.9, 0.14, 1.3], [-0.6, 0.14, 1.3]], 0.05)], 'The single duct formed by the two sperm ducts, running to the aedeagus.', { sex: 'm' });
  /* brain and head nerves, from the front */
  var BXp = 3.2, BZ = 0.9;
  add(3, 'nv_ctx', 'brain, from the front', 'nerv', K.brain, [E([BXp, 0.14, BZ], [0.42, 0.1, 0.3]), E([BXp, 0.14, BZ + 0.9], [0.24, 0.08, 0.2])], '', { x: 1 });
  add(3, 'nv_opticlobes', 'optic lobes', 'nerv', K.brain2, [E([BXp - 0.75, 0.14, BZ], [0.4, 0.1, 0.24]), E([BXp + 0.75, 0.14, BZ], [0.4, 0.1, 0.24])], 'A large lobe on each side of the brain, joined to the compound eye. Most of the brain’s volume is devoted to sight.');
  add(3, 'nv_connect', 'circumesophageal connectives', 'nerv', K.nerve, [T([[BXp - 0.25, 0.14, BZ + 0.25], [BXp - 0.4, 0.14, BZ + 0.6], [BXp - 0.15, 0.14, BZ + 0.85]], 0.035), T([[BXp + 0.25, 0.14, BZ + 0.25], [BXp + 0.4, 0.14, BZ + 0.6], [BXp + 0.15, 0.14, BZ + 0.85]], 0.035)], 'Two cords passing round the gullet, joining the brain above it to the subesophageal ganglion below.');
  add(3, 'nv_frontal', 'frontal ganglion', 'nerv', 0xfaf6d6, [E([BXp, 0.2, BZ + 0.42], [0.08, 0.05, 0.07])], 'A small ganglion on the front of the gullet, linked to the brain. It controls swallowing and the foregut.');
  add(3, 'nv_antnerve', 'antennal nerves', 'nerv', 0xe6dc9c, [T([[BXp - 0.2, 0.14, BZ - 0.22], [BXp - 0.5, 0.14, BZ - 0.9]], 0.022), T([[BXp + 0.2, 0.14, BZ - 0.22], [BXp + 0.5, 0.14, BZ - 0.9]], 0.022)], 'From the brain to the antennae.');
  add(3, 'nv_cardiaca', 'corpora cardiaca', 'endo', 0xe8b7c8, [E([BXp - 0.1, 0.22, BZ + 0.2], [0.05, 0.04, 0.06]), E([BXp + 0.1, 0.22, BZ + 0.2], [0.05, 0.04, 0.06])], 'A pair of tiny glands just behind the brain. They store and release brain hormones, including the one that starts a moult.');
  add(3, 'nv_allata', 'corpora allata', 'endo', 0xd98ab0, [E([BXp - 0.26, 0.22, BZ + 0.32], [0.05, 0.04, 0.05]), E([BXp + 0.26, 0.22, BZ + 0.32], [0.05, 0.04, 0.05])], 'A second pair of tiny glands behind the first. They make juvenile hormone, which keeps a nymph a nymph until its final moult.');

  return {
    steps: [
      { t: 'The head and each mouthpart, taken apart', view: { t: [-3.4, 0.2, 0], d: 11, ph: 0.25 },
        how: D.ol(['Cut the head off and look at it face-on under a dissecting microscope (upper part of the plate).', 'With fine forceps, pull the mouthparts off one at a time from the front backward: labrum, mandibles, maxillae, then the labium. Lay them out in order.', 'Each <b>maxilla</b> has a hinge piece, a body, two lobes and a palp. The <b>labium</b> is a pair of maxillae fused together: find the same parts in it.']) },
      { t: 'Thorax, wing and leg in detail', view: { t: [-1.2, 0.2, -0.2], d: 14, ph: 0.25 },
        how: D.ol(['Look at the thorax from the side. Each wing-bearing segment has a side plate split by a groove into two halves.', 'Cut off a forewing and a hindwing, spread them on a slide and hold them to the light. Name the long veins from the leading edge backward.', 'Look at the hind tibia and the three-segmented foot under magnification.']) },
      { t: 'The tip of the abdomen', view: { t: [-0.9, 0.3, 0.1], d: 6, ph: 0.3 },
        how: D.ol(['Look at the last segments from the side under magnification.', 'In a female, four hard blades project: the <b>ovipositor</b>. Separate them with a needle.', 'In a male, the end is a blunt upturned boat. Pull it down to find the soft <b>aedeagus</b> inside.']) },
      { t: 'Fine detail of the internal organs', view: { t: [-0.4, 0.2, -0.8], d: 15, ph: 0.25 },
        how: D.ol(['Lift the roof of the abdomen off in one piece and turn it over: the heart, its fan muscles and the diaphragm are on the underside (upper left).', 'Float a piece of tissue in water under magnification: silvery <b>tracheae</b> branch into it ever more finely (upper right).', 'Tease an ovary or a testis apart to see the tubes it is made of (centre).', 'Remove the front of the head capsule to see the brain face-on, with the two pairs of tiny glands behind it (lower right).']) }
    ],
    parts: parts
  };
});
