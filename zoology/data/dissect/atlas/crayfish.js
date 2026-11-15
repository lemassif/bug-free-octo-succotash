/* Crayfish — atlas plates. These are laid out as lab-manual plates on the tray:
   the appendage series, a section through the gill chamber, the parts of the
   exoskeleton, and the stomach, arteries, nerves and green gland in detail. */
DX.extend('crayfish', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var EX = 0xb5552e, EX2 = 0xc96a3e, EX3 = 0xd9895a, PALE = 0xe9c9a8, Y = 0.14;
  function seg(a, b, r) { return T([[a[0], Y, a[1]], [b[0], Y, b[1]]], r); }

  /* ================= plate 0: the appendages, removed and laid out in order ================= */
  /* 19 pairs; one of each lies in a row, front of the animal at the left */
  var AXp = function (i) { return -7.3 + i * 0.78; };
  var ctx = [];
  ctx.push(seg([AXp(0), -1.0], [AXp(0), -0.6], 0.09), seg([AXp(0), -0.6], [AXp(0) - 0.15, 0.3], 0.03), seg([AXp(0), -0.6], [AXp(0) + 0.15, 0.2], 0.03));             /* antennule */
  ctx.push(seg([AXp(1), -1.0], [AXp(1), -0.5], 0.11), seg([AXp(1), -0.5], [AXp(1) + 0.1, 1.6], 0.03), E([AXp(1) - 0.2, Y, -0.4], [0.1, 0.03, 0.3]));                      /* antenna */
  ctx.push(E([AXp(2), Y, -0.8], [0.2, 0.1, 0.26]));                                                                                                                      /* mandible */
  ctx.push(E([AXp(3), Y, -0.8], [0.12, 0.03, 0.22]), E([AXp(4), Y, -0.8], [0.14, 0.03, 0.24]), E([AXp(4) + 0.16, Y, -0.6], [0.1, 0.02, 0.34]));                         /* maxillae */
  ctx.push(seg([AXp(8), -1.0], [AXp(8), -0.4], 0.13), seg([AXp(8), -0.4], [AXp(8) + 0.1, 0.5], 0.16), seg([AXp(8) + 0.1, 0.5], [AXp(8) + 0.1, 1.5], [0.22, 0.05]), seg([AXp(8) + 0.24, 0.8], [AXp(8) + 0.3, 1.45], [0.07, 0.02])); /* cheliped */
  for (var s5 = 0; s5 < 5; s5++) ctx.push(seg([AXp(13 + s5), -1.0], [AXp(13 + s5), -0.6], 0.06), seg([AXp(13 + s5), -0.6], [AXp(13 + s5) - 0.12, 0], 0.035), seg([AXp(13 + s5), -0.6], [AXp(13 + s5) + 0.12, 0], 0.035)); /* swimmerets */
  ctx.push(E([AXp(18) - 0.16, Y, -0.5], [0.16, 0.03, 0.45]), E([AXp(18) + 0.2, Y, -0.5], [0.18, 0.03, 0.5]), E([AXp(18), Y, -1.0], [0.1, 0.05, 0.1]));                   /* uropod */
  add(0, 'ap_ctx', 'appendages named earlier', 'ext', EX3, ctx, '', { x: 1, dull: 1 });
  function mxp(i, len, c, id, n, d) { var x = AXp(i); add(0, id, n, 'dig', c, [seg([x, -1.0], [x, -0.65], 0.08), seg([x, -0.65], [x - 0.1, -0.65 + len], [0.07, 0.03]), seg([x, -0.65], [x + 0.14, -0.65 + len * 0.8], 0.022)], d); }
  mxp(5, 0.5, EX3, 'ap_mxp1', 'first maxilliped', 'The first of three pairs of “jaw feet”: thoracic limbs turned to handling food. Small and leaf-like.');
  mxp(6, 0.75, EX2, 'ap_mxp2', 'second maxilliped', 'Larger than the first, with a clear two-branched form and a gill.');
  mxp(7, 1.1, EX, 'ap_mxp3', 'third maxilliped', 'The largest jaw foot, leg-like, toothed along its inner edge. It holds food against the mandibles.');
  function leg(i, pinch) { var x = AXp(i); return [seg([x, -1.0], [x, -0.5], 0.08), seg([x, -0.5], [x + 0.05, 0.4], 0.07), seg([x + 0.05, 0.4], [x + 0.05, 1.2], [0.06, 0.025])].concat(pinch ? [seg([x + 0.12, 0.95], [x + 0.14, 1.2], [0.03, 0.01])] : []); }
  add(0, 'ap_leg23', 'second and third walking legs', 'ext', EX2, leg(9, 1).concat(leg(10, 1)), 'These two pairs end in small pincers. They pick up scraps and pass them to the mouth, and clean the body.');
  add(0, 'ap_leg45', 'fourth and fifth walking legs', 'ext', EX, leg(11, 0).concat(leg(12, 0)), 'These two pairs end in a simple claw. The genital opening is on the base of the third leg in females and the fifth in males.');
  /* one walking leg, enlarged, to name its seven segments */
  var LG = [[-6.6, 3.2], [-6.0, 3.0], [-5.5, 3.1], [-4.7, 3.4], [-3.4, 3.2], [-2.6, 3.5], [-1.2, 3.3], [-0.2, 3.25]];
  var SEGN = [['coxa', 'The first segment, joining the leg to the body. The gill is attached to it.'], ['basis', 'The short second segment. In crayfish it is fused with the third; the leg breaks off cleanly here when seized, and regrows.'], ['ischium', 'The third segment.'], ['merus', 'The fourth and longest segment: the “thigh”.'], ['carpus', 'The short fifth segment: the “wrist”.'], ['propodus', 'The sixth segment. In a pincer its far end is drawn out into the fixed finger.'], ['dactyl', 'The last segment. In a pincer it is the movable finger that closes against the propodus.']];
  SEGN.forEach(function (sn, i) { add(0, 'lg_' + sn[0], sn[0], 'ext', i % 2 ? EX2 : EX, [T([[LG[i][0], 0.2, LG[i][1]], [LG[i + 1][0], 0.2, LG[i + 1][1]]], i === 6 ? [0.12, 0.03] : (i === 5 ? 0.2 : 0.16))].concat(i === 5 ? [T([[-1.5, 0.2, 3.52], [-0.3, 0.2, 3.55]], [0.1, 0.03])] : []), sn[1]); });
  /* one third maxilliped, enlarged, to show the two-branched plan */
  add(0, 'bi_proto', 'protopod', 'ext', EX, [T([[1.6, 0.2, 3.3], [2.6, 0.2, 3.3]], 0.2)], 'The two-segmented stalk of a crustacean limb, shown here on an enlarged third maxilliped.');
  add(0, 'bi_endo', 'endopod', 'ext', EX2, [T([[2.6, 0.2, 3.3], [3.6, 0.2, 3.05], [4.8, 0.2, 3.1], [5.8, 0.2, 3.0]], [0.17, 0.16, 0.12, 0.05])], 'The inner branch. In the walking legs it is the whole leg.');
  add(0, 'bi_exo', 'exopod', 'ext', EX3, [T([[2.6, 0.2, 3.45], [3.6, 0.2, 3.9], [5.0, 0.2, 4.0]], [0.08, 0.05, 0.02])], 'The outer branch. It is lost in the walking legs but keeps the two-branched (biramous) plan visible in the jaw feet, swimmerets and tail fan.');
  add(0, 'bi_epi', 'epipod', 'resp', PALE, [T([[1.9, 0.2, 3.1], [2.2, 0.2, 2.5]], [0.08, 0.14], { sy: 0.3 })], 'A flap on the outer side of the base of the limb. It carries a gill and reaches up into the gill chamber.');
  add(0, 'an_peduncle', 'peduncle of the antenna', 'ext', EX, [T([[AXp(1), 0.17, -1.02], [AXp(1), 0.17, -0.5]], 0.12)], 'The stout jointed base of the antenna.');
  add(0, 'an_flagellum', 'flagellum of the antenna', 'nerv', EX3, [T([[AXp(1), 0.17, -0.5], [AXp(1) + 0.1, 0.17, 1.6]], 0.035)], 'The long whip of many short rings, studded with touch and taste bristles.');
  add(0, 'an_statocyst', 'statocyst', 'nerv', 0x2a2420, [E([AXp(0), 0.24, -0.85], [0.045, 0.03, 0.045])], 'A pit in the base of each antennule, lined with sensory hairs and holding sand grains: the organ of balance. The grains are replaced at every moult.');
  add(0, 'md_palp', 'mandibular palp', 'dig', EX3, [T([[AXp(2), 0.2, -0.65], [AXp(2) + 0.2, 0.2, -0.35]], [0.04, 0.02])], 'A small three-jointed finger on the mandible that folds into its hollow.');
  add(0, 'md_edge', 'cutting edge of the mandible', 'dig', 0xf4e6c8, [T([[AXp(2) - 0.2, 0.2, -0.95], [AXp(2) - 0.2, 0.2, -0.65]], 0.04)], 'The hard, toothed inner edge. The two mandibles work from side to side, not up and down.');

  /* ================= plate 1: a slice through the thorax and gill chamber ================= */
  var Y1 = 0.16;
  function tz(pts, r, o) { return T(pts.map(function (p) { return [p[0], Y1, p[1]]; }), r, o); }
  add(1, 'xs_ctx', 'carapace, body wall, heart, gut and nerve cord', 'ext', EX3, [tz([[-3.0, 1.3], [-3.25, -0.5], [-2.1, -2.0], [0, -2.5], [2.1, -2.0], [3.25, -0.5], [3.0, 1.3]], 0.07), O([0, Y1, -0.6], 1.45, 0.05, [90, 0, 0]), E([0, Y1, -1.4], [0.42, 0.06, 0.28]), E([0, Y1, -0.55], [0.3, 0.06, 0.3]), E([0, Y1, 0.6], [0.14, 0.06, 0.1]), tz([[1.3, 0.55], [2.5, 1.7]], 0.2), tz([[-1.3, 0.55], [-2.5, 1.7]], 0.2)], '', { x: 1, dull: 1 });
  add(1, 'xs_pericard', 'pericardial sinus', 'circ', 0x9ab8d9, [E([0, 0.1, -1.4], [0.75, 0.03, 0.5])], 'The blood space around the heart. The heart has no veins: it fills from this sinus through its ostia.');
  add(1, 'xs_sternal', 'sternal sinus', 'circ', 0x7f9fc9, [E([0, 0.1, 0.42], [0.55, 0.03, 0.26])], 'A blood space along the floor of the thorax where blood collects after bathing the organs.');
  add(1, 'xs_chamber', 'gill (branchial) chamber', 'resp', 0xdcebf2, [E([2.25, 0.08, -0.55], [0.72, 0.02, 1.15]), E([-2.25, 0.08, -0.55], [0.72, 0.02, 1.15])], 'The space between the body wall and the overhanging side of the carapace. Water is drawn forward through it by the gill bailer.');
  add(1, 'xs_podobr', 'podobranch', 'resp', 0xe9e2d2, [tz([[2.05, 1.0], [2.5, -0.4]], [0.12, 0.2]), tz([[-2.05, 1.0], [-2.5, -0.4]], [0.12, 0.2])], 'A gill attached to the coxa of a limb.');
  add(1, 'xs_arthrobr', 'arthrobranchs', 'resp', 0xd9d0bc, [tz([[1.62, 0.62], [1.95, -0.9]], [0.1, 0.16]), tz([[1.82, 0.72], [2.2, -0.75]], [0.09, 0.14]), tz([[-1.62, 0.62], [-1.95, -0.9]], [0.1, 0.16]), tz([[-1.82, 0.72], [-2.2, -0.75]], [0.09, 0.14])], 'Gills attached to the soft membrane between a limb and the body, two above most legs.');
  add(1, 'xs_filaments', 'gill filaments', 'resp', 0xf4efe2, D.row(8, function (i) { var f = i / 7, x = 2.05 + f * 0.45, z = 1.0 - f * 1.4; return [tz([[x, z], [x + 0.28, z - 0.08]], 0.018), tz([[-x, z], [-x - 0.28, z - 0.08]], 0.018)]; }), 'The fine feathery branches of a gill. Blood flows out along one side of each and back along the other.');
  add(1, 'xs_epipod', 'epipod (gill separator)', 'resp', PALE, [tz([[2.3, 1.15], [2.9, -0.2]], 0.05, { sy: 0.3 }), tz([[-2.3, 1.15], [-2.9, -0.2]], 0.05, { sy: 0.3 })], 'A thin folded plate rising from the coxa between one set of gills and the next. It keeps the gills apart.');
  add(1, 'xs_afferent', 'afferent branchial vessels', 'circ', 0x6f8fc0, [tz([[0.4, 0.42], [1.4, 0.62], [1.95, 0.45]], 0.05), tz([[-0.4, 0.42], [-1.4, 0.62], [-1.95, 0.45]], 0.05)], 'Channels taking oxygen-poor blood from the sternal sinus out to the gills.');
  add(1, 'xs_brcard', 'branchiocardiac veins', 'circ', K.artery, [tz([[1.95, -0.9], [1.25, -1.6], [0.62, -1.5]], 0.05), tz([[-1.95, -0.9], [-1.25, -1.6], [-0.62, -1.5]], 0.05)], 'Channels in the body wall returning oxygenated blood from the gills up to the pericardial sinus.');

  /* ================= plate 2: parts of the exoskeleton ================= */
  add(2, 'ex_cephth', 'cephalothorax', 'ext', EX, [E([-2.6, 0.3, 0], [2.6, 0.3, 1.25])], 'The fused head and thorax, thirteen segments under one shield.');
  add(2, 'ex_abdomen', 'abdomen', 'ext', EX2, D.row(6, function (i) { return E([0.5 + i * 0.8, 0.26, 0], [0.42, 0.24, 1.0 - i * 0.06]); }), 'Six free segments and the telson: the “tail”. Almost all of it is the muscle that flicks the animal backward.');
  add(2, 'ex_areola', 'areola', 'ext', EX3, [E([-1.0, 0.61, 0], [0.9, 0.02, 0.14])], 'The hourglass-shaped strip of carapace between the two grooves on the back, over the heart. Its width is used to tell species apart.');
  add(2, 'ex_brgroove', 'branchiocardiac grooves', 'ext', 0x6a2e16, [T([[-1.9, 0.6, 0.2], [-1.0, 0.61, 0.16], [-0.1, 0.56, 0.3]], 0.02), T([[-1.9, 0.6, -0.2], [-1.0, 0.61, -0.16], [-0.1, 0.56, -0.3]], 0.02)], 'A shallow groove on each side of the back marking the line between the heart region and the gill chamber.');
  add(2, 'ex_eyestalk', 'eyestalk', 'nerv', EX3, [T([[-4.9, 0.35, 0.45], [-5.3, 0.4, 0.75]], 0.07), T([[-4.9, 0.35, -0.45], [-5.3, 0.4, -0.75]], 0.07)], 'A movable two-jointed stalk. It also contains a gland whose hormones control moulting and colour.');
  add(2, 'ex_cornea', 'cornea', 'nerv', 0x1a1a1a, [E([-5.36, 0.4, 0.8], [0.09, 0.09, 0.09]), E([-5.36, 0.4, -0.8], [0.09, 0.09, 0.09])], 'The black faceted cap of the eye: about two and a half thousand square lenses, each over its own light-sensing unit.');
  /* the mouth region from below, enlarged */
  add(2, 'ex_mouthctx', 'underside of the head, enlarged', 'ext', PALE, [E([-2.6, 0.08, 3.4], [1.4, 0.04, 1.0])], '', { x: 1, dull: 1 });
  add(2, 'ex_epistome', 'epistome', 'ext', EX2, [E([-3.3, 0.14, 3.4], [0.35, 0.04, 0.5])], 'The plate of exoskeleton in front of the mouth, between the bases of the antennae.');
  add(2, 'ex_labrum', 'labrum', 'dig', EX3, [E([-2.75, 0.15, 3.4], [0.16, 0.04, 0.22])], 'The upper lip: a small flap hanging over the mouth in front of the mandibles.');
  add(2, 'ex_metastoma', 'metastoma (paragnaths)', 'dig', 0xe9b890, [E([-2.2, 0.15, 3.58], [0.12, 0.04, 0.12]), E([-2.2, 0.15, 3.22], [0.12, 0.04, 0.12])], 'The lower lip: two small lobes just behind the mandibles.');
  /* one abdominal segment, as a ring */
  var RZ = 3.2, RX = 2.8;
  add(2, 'rg_tergum', 'tergum', 'ext', EX, [T([[RX, 0.2, RZ - 0.9], [RX, 1.0, RZ - 0.6], [RX, 1.25, RZ], [RX, 1.0, RZ + 0.6], [RX, 0.2, RZ + 0.9]], 0.09, { sy: 2.4 })], 'The arched plate over the back of a segment, shown on one abdominal ring stood on end.');
  add(2, 'rg_pleuron', 'pleuron', 'ext', EX2, [E([RX, 0.14, RZ - 1.05], [0.3, 0.14, 0.12]), E([RX, 0.14, RZ + 1.05], [0.3, 0.14, 0.12])], 'The flap hanging down on each side of a segment, sheltering the swimmerets.');
  add(2, 'rg_sternum', 'sternum', 'ext', EX3, [T([[RX, 0.12, RZ - 0.85], [RX, 0.12, RZ + 0.85]], 0.06)], 'The narrow bar across the underside of a segment.');
  add(2, 'rg_membrane', 'arthrodial membrane', 'ext', 0xf0d9b8, [T([[RX + 0.36, 0.2, RZ - 0.85], [RX + 0.36, 0.95, RZ - 0.55], [RX + 0.36, 1.18, RZ], [RX + 0.36, 0.95, RZ + 0.55], [RX + 0.36, 0.2, RZ + 0.85]], 0.03)], 'The thin, flexible, unhardened cuticle that joins one plate to the next. Without it an animal in armour could not move.');

  /* ================= plate 3: stomach, arteries, nerves and green gland in detail ================= */
  add(3, 'gm_ctx', 'cardiac stomach, opened', 'dig', K.stomach, [E([-4.6, 0.1, -2.2], [1.3, 0.05, 1.0])], '', { x: 1, dull: 1 });
  add(3, 'gm_median', 'median tooth', 'dig', 0x8a5a2a, [T([[-4.9, 0.2, -2.2], [-4.2, 0.2, -2.2]], [0.08, 0.14])], 'A single hard brown tooth in the roof of the stomach.');
  add(3, 'gm_lateral', 'lateral teeth', 'dig', 0x9a6a3a, [T([[-4.9, 0.2, -1.75], [-4.1, 0.2, -1.9]], 0.07), T([[-4.9, 0.2, -2.65], [-4.1, 0.2, -2.5]], 0.07)].concat(D.row(5, function (i) { return [E([-4.8 + i * 0.16, 0.24, -1.82], [0.04, 0.03, 0.05]), E([-4.8 + i * 0.16, 0.24, -2.58], [0.04, 0.03, 0.05])]; })), 'A toothed bar on each side wall. Muscles outside the stomach rock the three teeth together to grind the food.');
  add(3, 'gm_gastrolith', 'gastroliths', 'dig', 0xf4f0e6, [E([-5.5, 0.2, -1.7], [0.16, 0.08, 0.16]), E([-5.5, 0.2, -2.7], [0.16, 0.08, 0.16])], 'Two white chalky discs in the front wall of the stomach, present before a moult. They store calcium from the old shell to harden the new one.');
  add(3, 'gm_filter', 'filter of the pyloric stomach', 'dig', 0xd9b98a, D.row(7, function (i) { return T([[-3.7, 0.18, -2.5 + i * 0.1], [-3.3, 0.18, -2.5 + i * 0.1]], 0.012); }), 'Combs of fine bristles guarding the rear chamber. Only liquid and the finest particles pass to the digestive gland.');
  add(3, 'gm_midgut', 'midgut', 'dig', K.gut, [T([[-3.2, 0.18, -2.2], [-2.7, 0.18, -2.2]], 0.1)], 'A very short stretch behind the stomach, the only part of the gut not lined with cuticle. The ducts of the digestive gland open into it.');
  add(3, 'gm_ducts', 'ducts of the digestive gland', 'dig', 0xc9a04a, [T([[-3.0, 0.18, -2.1], [-2.8, 0.18, -1.6]], 0.04), T([[-3.0, 0.18, -2.3], [-2.8, 0.18, -2.8]], 0.04)], 'One duct from each half of the gland. Digested food is absorbed inside the gland itself.');
  /* arteries, drawn from the side: front to the left, back at the top */
  var AZ = 0.6;
  add(3, 'ar_ctx', 'heart and the arteries named earlier', 'circ', 0xd9a0a0, [E([0, 0.14, AZ - 0.5], [0.35, 0.08, 0.22]), T([[-0.3, 0.14, AZ - 0.5], [-2.6, 0.14, AZ - 0.55]], 0.03), T([[0.3, 0.14, AZ - 0.5], [3.6, 0.14, AZ - 0.45]], 0.035), T([[0.25, 0.14, AZ - 0.4], [0.35, 0.14, AZ + 0.6]], 0.035)], '', { x: 1, dull: 1 });
  add(3, 'ar_alary', 'suspensory ligaments of the heart', 'circ', 0xf4f0e6, [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].map(function (p) { return T([[p[0], 0.14, AZ - 0.5 + p[1] * 0.6], [p[0] * 2.4, 0.14, AZ - 0.5 + p[1] * 2.4]], 0.014); }), 'Elastic strands holding the heart in the pericardial sinus. They stretch as it contracts and pull it open again.');
  add(3, 'ar_hepatic', 'hepatic arteries', 'circ', K.artery, [T([[-0.3, 0.14, AZ - 0.42], [-0.9, 0.14, AZ - 0.1], [-1.4, 0.14, AZ + 0.1]], 0.03)], 'A pair leaving the front of the heart and turning down into the digestive gland.');
  add(3, 'ar_vthor', 'ventral thoracic artery', 'circ', 0xd9564a, [T([[0.35, 0.14, AZ + 0.6], [-1.0, 0.14, AZ + 0.72], [-2.4, 0.14, AZ + 0.7]], 0.03)], 'The forward branch of the sternal artery, running under the nerve cord to the mouthparts and legs.');
  add(3, 'ar_vabd', 'ventral abdominal artery', 'circ', K.artery, [T([[0.35, 0.14, AZ + 0.6], [1.8, 0.14, AZ + 0.7], [3.4, 0.14, AZ + 0.62]], 0.028)], 'The backward branch of the sternal artery, running under the nerve cord to the swimmerets.');
  add(3, 'ar_segmental', 'segmental arteries', 'circ', 0xd9564a, D.row(5, function (i) { return T([[1.0 + i * 0.55, 0.14, AZ - 0.46], [1.05 + i * 0.55, 0.14, AZ - 0.05]], 0.016); }), 'A pair of branches from the dorsal abdominal artery in each segment, to the tail muscles and gut.');
  /* nervous system from above */
  var NZ = 3.4;
  add(3, 'nv_ctx', 'brain and nerve cord', 'nerv', K.nerve, [E([-3.6, 0.14, NZ], [0.18, 0.06, 0.2]), T([[-3.45, 0.14, NZ + 0.1], [-2.8, 0.14, NZ + 0.25], [-2.4, 0.14, NZ]], 0.025), T([[-3.45, 0.14, NZ - 0.1], [-2.8, 0.14, NZ - 0.25], [-2.4, 0.14, NZ]], 0.025), T([[-2.4, 0.14, NZ], [3.6, 0.14, NZ]], 0.03)], '', { x: 1, dull: 1 });
  add(3, 'nv_optic', 'optic nerves', 'nerv', 0xfaf6d6, [T([[-3.7, 0.14, NZ + 0.14], [-4.3, 0.14, NZ + 0.6]], 0.03), T([[-3.7, 0.14, NZ - 0.14], [-4.3, 0.14, NZ - 0.6]], 0.03)], 'From the brain out along each eyestalk.');
  add(3, 'nv_antennul', 'antennulary nerves', 'nerv', 0xe6dc9c, [T([[-3.76, 0.14, NZ + 0.06], [-4.5, 0.14, NZ + 0.2]], 0.02), T([[-3.76, 0.14, NZ - 0.06], [-4.5, 0.14, NZ - 0.2]], 0.02)], 'From the brain to the antennules and their balance organs.');
  add(3, 'nv_antenn', 'antennary nerves', 'nerv', 0xfaf6d6, [T([[-3.6, 0.14, NZ + 0.2], [-4.1, 0.14, NZ + 0.95]], 0.025), T([[-3.6, 0.14, NZ - 0.2], [-4.1, 0.14, NZ - 0.95]], 0.025)], 'From the brain to the antennae and the green glands.');
  add(3, 'nv_thorgang', 'thoracic ganglia', 'nerv', 0xfaf6d6, D.row(5, function (i) { return E([-1.9 + i * 0.42, 0.16, NZ], [0.12, 0.05, 0.12]); }), 'Five swellings of the nerve cord, one for each pair of legs. Each is a pair of ganglia fused side by side.');
  add(3, 'nv_abdgang', 'abdominal ganglia', 'nerv', 0xe6dc9c, D.row(6, function (i) { return E([0.5 + i * 0.55, 0.16, NZ], [0.09, 0.045, 0.09]); }), 'Six smaller swellings, one in each segment of the abdomen. The last is the largest and serves the tail fan.');
  add(3, 'nv_segnerves', 'nerves to the appendages', 'nerv', K.nerve, D.row(5, function (i) { var x = -1.9 + i * 0.42; return [T([[x, 0.14, NZ + 0.1], [x + 0.1, 0.14, NZ + 0.6]], 0.014), T([[x, 0.14, NZ - 0.1], [x + 0.1, 0.14, NZ - 0.6]], 0.014)]; }), 'Paired nerves leaving each ganglion for the limbs and muscles of its segment.');
  /* green gland, enlarged */
  var GX = 5.2, GZ = -2.2;
  add(3, 'gg_endsac', 'end sac (coelomic sac)', 'exc', 0xb9a04a, [E([GX - 0.3, 0.16, GZ], [0.28, 0.1, 0.26])], 'A small thin-walled sac in the middle of the green gland where blood is filtered. It is all that remains of the coelom.');
  add(3, 'gg_labyrinth', 'labyrinth', 'exc', 0x6f9a55, [O([GX - 0.3, 0.14, GZ], 0.5, 0.14, [90, 0, 0])], 'The green spongy part of the gland, a maze of channels that reabsorbs useful substances from the filtrate.');
  add(3, 'gg_canal', 'nephridial canal', 'exc', 0xdfe9d2, [T([[GX + 0.25, 0.16, GZ], [GX + 0.7, 0.16, GZ - 0.4], [GX + 0.5, 0.16, GZ - 0.9], [GX + 0.9, 0.16, GZ - 1.2]], 0.05)], 'A long coiled white tube from the labyrinth to the bladder. It recovers salts, so a freshwater crayfish passes very dilute urine.');

  return {
    steps: [
      { t: 'The appendages, in order', view: { t: [-0.4, 0.2, 1.3], d: 20, ph: 0.25 },
        how: D.ol(['Starting at the tail, grip each appendage of one side at its base with forceps and pull it free. Lay them in order on a sheet of paper: nineteen in all.', 'They are all built on one plan, a stalk with two branches, modified for nineteen jobs.', 'Find the plan on a <b>third maxilliped</b> (enlarged, lower right), then see what has been lost from a walking leg (enlarged, lower left).']) },
      { t: 'A slice through the gill chamber', view: { t: [0, 0.2, -0.4], d: 9, ph: 0.2 },
        how: D.ol(['With a razor blade, cut straight across the thorax between the second and third walking legs.', 'Look at the cut face. The gills are outside the body wall but inside the carapace.', 'Follow the blood: from the body down to the <b>sternal sinus</b>, out to the gills, back up to the <b>pericardial sinus</b>, into the heart.']) },
      { t: 'Parts of the exoskeleton', view: { t: [-1.0, 0.4, 1.3], d: 14, ph: 0.3 },
        how: D.ol(['Run a fingernail along the back of the carapace to feel the grooves that mark the regions beneath.', 'Turn the animal over and find the upper and lower lips on either side of the mandibles (enlarged, lower left).', 'Cut one ring from the abdomen and stand it on end (lower right). Flex the abdomen and watch the thin membranes between the plates.']) },
      { t: 'Stomach, arteries, nerves and green gland', view: { t: [0.2, 0.2, 0.6], d: 16, ph: 0.25 },
        how: D.ol(['Cut the stomach out, slit it along one side and rinse it. The three teeth of the <b>gastric mill</b> are brown and hard (upper left).', 'With an injected specimen, trace each artery from the heart (centre).', 'Remove the organs of the thorax and chip away the shelf of exoskeleton over the nerve cord to follow it from brain to tail (bottom).', 'Lift a green gland out with its bladder and tease it apart in water (upper right).']) }
    ],
    parts: parts
  };
});
