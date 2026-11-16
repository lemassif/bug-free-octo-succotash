/* Fetal pig — atlas plates: skull, skeleton, muscles, arteries, veins, nervous system.
   Same coordinates as pig.js: ventral side up (+y), snout at -x, the pig's right at +z. */
DX.extend('pig', function (B) {
  var D = DX, E = D.E, T = D.T, M = D.M, P = D.P, K = D.K;
  var BX = [-8.0, -7.6, -6.8, -5.8, -4.8, -3.6, -2.0, -0.4, 1.5, 3.2, 4.8, 6.0, 6.6];
  var BR = [0.35, 0.75, 1.15, 1.5, 1.4, 1.9, 2.15, 2.2, 2.25, 2.15, 1.8, 1.1, 0.5];
  var k = D.kit(BX, BR, 1.9, 0.85), body = k.body, surf = k.surf, band = k.band;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var BONE = K.bone, BONE2 = 0xe2d6bd, BONE3 = 0xfaf4e2, CART = K.cart, DARK = 0x2a2420;
  var on = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(B + arguments[i]); return { on: a }; };
  var S = on(1, 2), V = on(2);

  /* ================= plate 0: skull and lower jaw ================= */
  add(0, 'sk_nasal', 'nasal bone', 'skel', BONE, [M(T([[-7.9, 1.5, 0.14], [-6.4, 0.86, 0.2]], [0.1, 0.2], { sy: 0.3 }))], 'A long narrow bone roofing the nasal cavity on each side. Its length gives the pig its long face.', S);
  add(0, 'sk_premax', 'premaxilla (incisive bone)', 'skel', BONE2, [M(T([[-8.0, 1.75, 0.2], [-7.5, 1.6, 0.5]], [0.14, 0.16]))], 'The bone at the tip of the upper jaw that carries the upper incisors.', S);
  add(0, 'sk_max', 'maxilla', 'skel', BONE, [M(T([[-7.5, 1.65, 0.55], [-6.6, 1.7, 1.0], [-6.1, 1.75, 1.15]], [0.22, 0.34, 0.3], { sy: 0.8 }))], 'The main bone of the upper jaw and face. It holds the canine and all the cheek teeth and forms most of the hard palate.', S);
  add(0, 'sk_infraorb', 'infraorbital foramen', 'skel', DARK, [M(E([-7.0, 1.48, 0.93], [0.07, 0.07, 0.04]))], 'A hole in the maxilla in front of the eye. The nerve and vessels to the snout, upper lip and whiskers come out through it.', S);
  add(0, 'sk_lacrimal', 'lacrimal bone', 'skel', BONE3, [M(E([-6.35, 1.25, 1.1], [0.16, 0.14, 0.06]))], 'A small bone at the front edge of the eye socket, pierced by the tear duct.', S);
  add(0, 'sk_frontal', 'frontal bone', 'skel', BONE2, [M(T([[-6.4, 0.84, 0.3], [-5.6, 0.62, 0.42]], [0.3, 0.42], { sy: 0.25 }))], 'Forms the forehead between and behind the eyes and the roof of the front of the braincase.', S);
  add(0, 'sk_supraorb', 'supraorbital process', 'skel', BONE3, [M(T([[-6.0, 0.75, 0.7], [-5.95, 1.0, 1.05]], 0.07))], 'A spur of the frontal bone arching over the eye. In the pig it does not reach the cheekbone, so the eye socket is open behind.', S);
  add(0, 'sk_parietal', 'parietal bone', 'skel', BONE, [M(T([[-5.6, 0.62, 0.3], [-5.05, 0.66, 0.3]], [0.36, 0.3], { sy: 0.3 }))], 'Roofs the back of the braincase. In the fetus the sutures between these skull bones are still open membranes.', S);
  add(0, 'sk_nuchal', 'nuchal crest', 'skel', BONE3, [T([[-4.95, 0.6, -0.6], [-4.95, 0.6, 0.6]], 0.1)], 'The ridge across the top of the back of the skull where the powerful neck muscles used in rooting attach.', S);
  add(0, 'sk_occip', 'occipital bone', 'skel', BONE2, [E([-4.88, 1.2, 0], [0.08, 0.55, 0.6])], 'The back wall of the skull, surrounding the foramen magnum.', S);
  add(0, 'sk_condyle', 'occipital condyles', 'skel', BONE3, [M(E([-4.82, 1.75, 0.25], [0.1, 0.14, 0.14]))], 'Two rounded knobs beside the foramen magnum that rock in the atlas when the head nods.', S);
  add(0, 'sk_foramen', 'foramen magnum', 'skel', DARK, [E([-4.8, 1.7, 0], [0.05, 0.14, 0.14])], 'The large opening through which the spinal cord joins the brain.', S);
  add(0, 'sk_parocc', 'paroccipital (jugular) process', 'skel', BONE, [M(T([[-4.95, 1.8, 0.6], [-5.0, 2.5, 0.65]], [0.07, 0.04]))], 'A long spike pointing down from the back of the skull, very long in pigs. Jaw-opening muscles attach to it.', S);
  add(0, 'sk_temporal', 'temporal bone (squamous part)', 'skel', BONE2, [M(E([-5.35, 1.35, 1.05], [0.3, 0.3, 0.08]))], 'The side wall of the braincase. It carries the socket for the lower jaw and houses the ear.', S);
  add(0, 'sk_zygo', 'zygomatic (jugal) bone', 'skel', BONE, [M(T([[-6.3, 1.6, 1.25], [-5.8, 1.7, 1.45]], [0.14, 0.12]))], 'The cheekbone, forming the front half of the zygomatic arch under the eye.', S);
  add(0, 'sk_zygproc', 'zygomatic process of the temporal bone', 'skel', BONE3, [M(T([[-5.8, 1.68, 1.45], [-5.35, 1.6, 1.3]], 0.09))], 'The rear half of the zygomatic arch. The masseter muscle hangs from the arch; the temporalis passes inside it.', S);
  add(0, 'sk_orbit', 'orbit', 'skel', 0x3a3a44, [M(E([-6.1, 1.3, 1.17], [0.25, 0.25, 0.03]))], 'The eye socket.', { a: 0.5, on: [B + 1, B + 2] });
  add(0, 'sk_meatus', 'external acoustic meatus', 'skel', DARK, [M(E([-5.25, 1.5, 1.2], [0.06, 0.06, 0.05]))], 'The bony opening of the ear canal.', S);
  var JX = -4.8;
  add(0, 'mn_body', 'body of the mandible', 'skel', BONE, [M(T([[JX - 7.95, 1.9, 0.12], [JX - 7.4, 1.9, 0.5], [JX - 6.2, 1.9, 0.9]], [0.14, 0.18, 0.2], { sy: 1.2 }))], 'The horizontal part of the lower jaw, which holds the teeth. The lower jaw has been lifted off and set in front of the skull.');
  add(0, 'mn_symph', 'mandibular symphysis', 'skel', BONE3, [E([JX - 7.95, 1.9, 0], [0.14, 0.16, 0.1])], 'The joint at the chin where the two halves of the lower jaw meet. It fuses solid in pigs, as in humans.');
  add(0, 'mn_mental', 'mental foramina', 'skel', DARK, [M(E([JX - 7.5, 1.82, 0.62], [0.04, 0.04, 0.03]))], 'Small holes near the front of the jaw for the nerve and vessels to the chin and lower lip.');
  add(0, 'mn_ramus', 'ramus of the mandible', 'skel', BONE2, [M(T([[JX - 6.2, 1.9, 0.9], [JX - 5.5, 1.5, 1.15]], [0.22, 0.3], { sy: 1.3 }))], 'The upright plate at the back of the jaw to which the chewing muscles attach.');
  add(0, 'mn_angle', 'angle of the mandible', 'skel', BONE, [M(E([JX - 5.35, 2.05, 1.15], [0.2, 0.2, 0.07]))], 'The rounded lower rear corner of the jaw, where the masseter inserts.');
  add(0, 'mn_coronoid', 'coronoid process', 'skel', BONE3, [M(T([[JX - 5.7, 1.4, 1.15], [JX - 5.6, 0.95, 1.15]], [0.1, 0.05]))], 'The blade rising from the ramus inside the zygomatic arch. The temporalis pulls on it to close the jaw.');
  add(0, 'mn_condyle', 'condyloid (articular) process', 'skel', BONE3, [M(E([JX - 5.3, 1.15, 1.15], [0.1, 0.08, 0.12]))], 'The rounded head that hinges on the temporal bone: the jaw joint.');
  add(0, 'mn_incis', 'incisors', 'dig', 0xfbf7ea, D.row(3, function (i) { return M(T([[JX - 8.02 + i * 0.05, 1.75, 0.05 + i * 0.1], [JX - 8.3 + i * 0.08, 1.6, 0.07 + i * 0.12]], [0.04, 0.03])); }), 'The front teeth, three on each side of each jaw. The lower ones point almost straight forward, a shovel for rooting.');
  add(0, 'mn_canine', 'canines (tusks)', 'dig', 0xfbf7ea, [M(T([[JX - 7.7, 1.75, 0.5], [JX - 7.75, 1.4, 0.6]], [0.06, 0.02]))], 'One on each side of each jaw. In boars they grow throughout life into tusks.');
  add(0, 'mn_premol', 'premolars', 'dig', 0xf4eedd, D.row(4, function (i) { return M(E([JX - 7.3 + i * 0.2, 1.72, 0.62 + i * 0.07], [0.08, 0.07, 0.06])); }), 'Four on each side of each jaw, behind a gap. Narrow and pointed, for slicing.');
  add(0, 'mn_molar', 'molars', 'dig', 0xfbf7ea, D.row(3, function (i) { return M(E([JX - 6.5 + i * 0.24, 1.7, 0.88 + i * 0.05], [0.12, 0.08, 0.09])); }), 'Three on each side of each jaw. Broad and low-crowned with rounded cusps for crushing, much like human molars.');

  /* ================= plate 1: skeleton from above ================= */
  add(1, 'sk_atlas', 'atlas (first cervical vertebra)', 'skel', BONE3, [E([-4.6, 0.85, 0], [0.14, 0.14, 0.42])], 'A ring with broad wings and no body. The skull nods on it.', V);
  add(1, 'sk_axis', 'axis (second cervical vertebra)', 'skel', BONE2, [E([-4.25, 0.85, 0], [0.2, 0.14, 0.2]), E([-4.25, 0.58, 0], [0.2, 0.14, 0.04])], 'Its peg, the dens, projects forward into the atlas so that the head can turn. Note the tall blade-like spine.', V);
  add(1, 'sk_cerv', 'cervical vertebrae (III to VII)', 'skel', BONE, D.row(5, function (i) { return E([-3.9 + i * 0.25, 0.9, 0], [0.11, 0.13, 0.24]); }), 'With the atlas and axis they make seven neck vertebrae: the number in nearly every mammal, giraffe and human included.', V);
  var TX = D.pts(14, function (i) { return -2.6 + i * 0.33; });
  add(1, 'sk_thor', 'thoracic vertebrae', 'skel', BONE, TX.map(function (x) { return E([x, 0.8, 0], [0.13, 0.13, 0.17]); }), 'Fourteen or fifteen vertebrae, each carrying a pair of ribs.', V);
  add(1, 'sk_tspine', 'spinous processes', 'skel', BONE3, TX.map(function (x, i) { return T([[x, 0.7, 0], [x + 0.12, 0.7 - (0.55 - i * 0.022), 0]], 0.035); }), 'The spines along the top of the backbone. They are tallest over the shoulders, where the muscles and ligament that hold up the head attach.', V);
  var LX = D.pts(6, function (i) { return 2.05 + i * 0.4; });
  add(1, 'sk_lumb', 'lumbar vertebrae', 'skel', BONE2, LX.map(function (x) { return E([x, 0.8, 0], [0.17, 0.14, 0.2]); }), 'Six or seven large vertebrae of the lower back, with no ribs.', V);
  add(1, 'sk_ltrans', 'transverse processes of the lumbar vertebrae', 'skel', BONE3, LX.map(function (x) { return M(T([[x, 0.82, 0.18], [x - 0.08, 0.85, 0.62]], 0.05, { sy: 0.4 })); }), 'Long flat wings to which the muscles of the loin attach: the bone in a loin chop.', V);
  add(1, 'sk_sacrum', 'sacrum', 'skel', BONE, [T([[4.4, 0.8, 0], [5.3, 0.85, 0]], [0.26, 0.16], { sy: 0.6 })], 'Four vertebrae that fuse into one bone and join the pelvis to the spine.', V);
  add(1, 'sk_caudal', 'caudal vertebrae', 'skel', BONE2, D.row(8, function (i, f) { return E([5.5 + f * 2.1, 0.9 + (f < 0.5 ? f * 0.7 : 0.35 - (f - 0.5) * 0.9), f > 0.6 ? (f - 0.6) * 1.3 : 0], [0.1, 0.07 - f * 0.03, 0.07 - f * 0.03]); }), 'The tail vertebrae, twenty or more, growing simpler toward the tip.', V);
  add(1, 'sk_ribs_s', 'sternal (true) ribs', 'skel', BONE, D.row(7, function (i) { var x = TX[i]; return [band(x, 0.07, [52, 176], 0.93), band(x, 0.07, [184, 308], 0.93)]; }), 'The first seven pairs, each joined to the breastbone by its own costal cartilage.', V);
  add(1, 'sk_ribs_a', 'asternal (false) ribs', 'skel', BONE2, D.row(7, function (i) { var x = TX[i + 7], a = 60 + i * 5; return [band(x, 0.07, [a, 176], 0.93), band(x, 0.07, [184, 360 - a], 0.93)]; }), 'The last seven pairs. Their cartilages join the cartilage of the rib in front instead of reaching the breastbone.', V);
  add(1, 'sk_scapula', 'scapula', 'skel', BONE, [M(T([[-3.4, 1.45, 1.55], [-2.7, 0.75, 1.1]], [0.14, 0.55], { sy: 0.2 }))], 'The shoulder blade, a flat triangle lying on the ribs. Mammals that run have no collarbone, so only muscle joins it to the trunk.', V);
  add(1, 'sk_scspine', 'spine of the scapula', 'skel', BONE3, [M(T([[-3.3, 1.3, 1.64], [-2.65, 0.6, 1.2]], 0.045))], 'The ridge down the outer face of the shoulder blade.', V);
  add(1, 'sk_suprasp', 'supraspinous fossa', 'skel', BONE2, [M(E([-3.2, 0.92, 1.18], [0.3, 0.035, 0.16], [0, 30, 0]))], 'The hollow in front of the spine of the scapula, filled by the supraspinatus muscle.', V);
  add(1, 'sk_infrasp', 'infraspinous fossa', 'skel', BONE2, [M(E([-2.85, 0.98, 1.52], [0.3, 0.035, 0.16], [0, 30, 0]))], 'The hollow behind the spine of the scapula, filled by the infraspinatus muscle.', V);
  add(1, 'sk_glenoid', 'glenoid cavity', 'skel', DARK, [M(E([-3.42, 1.5, 1.6], [0.1, 0.1, 0.06]))], 'The shallow socket of the shoulder joint.', V);
  var LB = { on: [B + 2, B + 3, B + 4, B + 5, B + 6, B + 7] };
  add(1, 'sk_humerus', 'humerus', 'skel', BONE, [M(T([[-3.4, 1.5, 1.68], [-3.9, 0.95, 3.4]], [0.13, 0.1])), M(E([-3.4, 1.5, 1.68], [0.15, 0.15, 0.15]))], 'The bone of the upper forelimb.', LB);
  add(1, 'sk_gtub', 'greater tubercle of the humerus', 'skel', BONE3, [M(E([-3.52, 1.36, 1.78], [0.1, 0.1, 0.1]))], 'The knob beside the head of the humerus: the “point of the shoulder”.', V);
  add(1, 'sk_radius', 'radius', 'skel', BONE, [M(T([[-3.9, 1.0, 3.4], [-4.6, 0.7, 4.9]], 0.08))], 'The front bone of the forearm, which carries the weight.', LB);
  add(1, 'sk_ulna', 'ulna', 'skel', BONE2, [M(T([[-3.75, 0.85, 3.3], [-4.5, 0.6, 4.9]], 0.06))], 'The rear bone of the forearm, well developed in pigs and not fused to the radius.', V);
  add(1, 'sk_olecr', 'olecranon', 'skel', BONE3, [M(E([-3.68, 0.85, 3.18], [0.1, 0.1, 0.14]))], 'The point of the elbow: a lever on the ulna for the triceps muscle.', V);
  add(1, 'sk_carpals', 'carpals', 'skel', BONE3, [M(E([-4.62, 0.62, 5.0], [0.14, 0.1, 0.08]))], 'Eight small wrist bones in two rows. This is the joint people call the pig’s “knee”.', V);
  var DXs = [-0.2, -0.07, 0.07, 0.2];
  add(1, 'sk_metacarp', 'metacarpals', 'skel', BONE, DXs.map(function (d) { return M(T([[-4.62 + d * 0.6, 0.6, 5.06], [-4.62 + d, 0.55, 5.45]], 0.04)); }), 'Four long bones, to digits two to five. The two middle ones are large and bear the weight; the thumb is lost.', V);
  add(1, 'sk_phal_f', 'phalanges of the forefoot', 'skel', BONE3, DXs.map(function (d) { return M(T([[-4.62 + d, 0.55, 5.48], [-4.62 + d * 1.2, 0.52, 5.68], [-4.62 + d * 1.3, 0.5, 5.86]], [0.04, 0.04, 0.02])); }), 'Three bones in each toe. The last one sits inside the hoof.', V);
  add(1, 'sk_ilium', 'ilium', 'skel', BONE, [M(T([[4.3, 0.75, 0.45], [4.9, 1.2, 1.2]], [0.2, 0.14], { sy: 0.4 }))], 'The front blade of the hip bone, joined to the sacrum.', V);
  add(1, 'sk_ischium', 'ischium', 'skel', BONE2, [M(T([[5.05, 1.5, 1.4], [5.8, 1.3, 0.8]], [0.12, 0.16], { sy: 0.5 }))], 'The rear part of the hip bone: the pin bone beside the tail.', V);
  add(1, 'sk_acetab', 'acetabulum', 'skel', DARK, [M(E([5.0, 1.5, 1.47], [0.12, 0.12, 0.06]))], 'The deep hip socket, where ilium, ischium and pubis meet.', V);
  add(1, 'sk_femur', 'femur', 'skel', BONE, [M(T([[5.0, 1.5, 1.58], [5.6, 0.95, 3.4]], [0.13, 0.11])), M(E([5.0, 1.5, 1.58], [0.14, 0.14, 0.14]))], 'The thigh bone, the largest in the body.', LB);
  add(1, 'sk_gtroch', 'greater trochanter', 'skel', BONE3, [M(E([5.06, 1.33, 1.76], [0.1, 0.1, 0.1]))], 'The knob beside the head of the femur where the gluteal muscles insert.', V);
  add(1, 'sk_tibia', 'tibia', 'skel', BONE, [M(T([[5.62, 0.98, 3.42], [6.58, 0.68, 4.9]], [0.11, 0.08]))], 'The shin bone, the weight-bearing bone of the lower hindlimb.', LB);
  add(1, 'sk_fibula', 'fibula', 'skel', BONE2, [M(T([[5.74, 0.84, 3.42], [6.67, 0.6, 4.88]], 0.04))], 'The slender bone beside the tibia. Complete in pigs; reduced to a splint in horses and cattle.', V);
  add(1, 'sk_calc', 'calcaneus', 'skel', BONE3, [M(T([[6.62, 0.62, 4.92], [6.95, 0.45, 4.75]], 0.07))], 'The heel bone, forming the point of the hock. The Achilles tendon pulls on it.', V);
  add(1, 'sk_talus', 'talus (astragalus)', 'skel', BONE2, [M(E([6.58, 0.68, 5.0], [0.09, 0.08, 0.08]))], 'The ankle bone that hinges on the tibia. In pigs and all even-toed hoofed mammals it has a pulley at both ends.', V);
  add(1, 'sk_tarsals', 'distal tarsals', 'skel', BONE3, [M(E([6.6, 0.62, 5.14], [0.12, 0.08, 0.06]))], 'The small bones of the lower rows of the hock.', V);
  add(1, 'sk_metatars', 'metatarsals', 'skel', BONE, DXs.map(function (d) { return M(T([[6.6 + d * 0.6, 0.6, 5.2], [6.6 + d, 0.55, 5.6]], 0.04)); }), 'Four long bones of the hindfoot, matching the metacarpals of the forefoot.', V);
  add(1, 'sk_phal_h', 'phalanges of the hindfoot', 'skel', BONE3, DXs.map(function (d) { return M(T([[6.6 + d, 0.55, 5.63], [6.6 + d * 1.2, 0.52, 5.83], [6.6 + d * 1.3, 0.5, 6.0]], [0.04, 0.04, 0.02])); }), 'Three bones in each of the four toes of the hindfoot.', V);

  /* ================= plate 2: skeleton from below ================= */
  add(2, 'st_manub', 'manubrium', 'skel', BONE2, [T([[-3.7, 3.25, 0], [-3.1, 3.4, 0]], [0.08, 0.13])], 'The first, pointed segment of the breastbone, projecting in front of the first ribs.');
  add(2, 'st_body', 'sternebrae (body of the sternum)', 'skel', BONE, D.row(4, function (i) { return E([-2.75 + i * 0.6, 3.5, 0], [0.26, 0.08, 0.14]); }), 'Four separate blocks of bone joined by cartilage. They fuse only in old age.');
  add(2, 'st_xiph', 'xiphoid process', 'skel', BONE3, [T([[-0.5, 3.5, 0], [0.0, 3.46, 0]], [0.1, 0.05])], 'The last segment of the breastbone.');
  add(2, 'st_xcart', 'xiphoid cartilage', 'skel', CART, [E([0.22, 3.43, 0], [0.26, 0.03, 0.2])], 'A thin plate of cartilage on the end of the breastbone, to which the diaphragm and belly muscles attach.');
  add(2, 'st_costal', 'costal cartilages', 'skel', CART, D.row(7, function (i) { return M(T([[-3.15 + i * 0.46, 3.44, 0.14], [TX[i] + 0.1, 2.75, surf(TX[i], 52, 0.93)[2]]], 0.04)); }), 'Bars of cartilage joining the ribs to the breastbone. They let the chest expand.');
  add(2, 'sb_palatine', 'palatine bone', 'skel', BONE2, [M(E([-6.1, 2.25, 0.3], [0.3, 0.04, 0.2]))], 'Forms the back of the hard palate, behind the maxilla.');
  add(2, 'sb_ptery', 'pterygoid bone', 'skel', BONE3, [M(T([[-5.8, 2.3, 0.35], [-5.55, 2.55, 0.4]], 0.05))], 'A small hooked plate behind the palate, on each side of the opening from the nose to the throat.');
  add(2, 'sb_vomer', 'vomer', 'skel', BONE, [T([[-6.6, 2.1, 0], [-5.7, 2.15, 0]], 0.04)], 'A thin midline bone forming the lower part of the partition between the two nasal passages.');
  add(2, 'sb_basisph', 'basisphenoid', 'skel', BONE2, [E([-5.5, 2.1, 0], [0.25, 0.05, 0.15])], 'The middle of the floor of the braincase. The pituitary gland sits in a hollow on its upper surface.');
  add(2, 'sb_basiocc', 'basioccipital', 'skel', BONE, [E([-5.05, 2.05, 0], [0.2, 0.05, 0.18])], 'The rear of the floor of the braincase, in front of the foramen magnum.');
  add(2, 'sb_bulla', 'tympanic bulla', 'skel', BONE3, [M(E([-5.2, 2.1, 0.6], [0.18, 0.2, 0.14]))], 'A bony capsule under the ear enclosing the middle-ear cavity and its three small bones.');
  add(2, 'sb_hyoid', 'hyoid apparatus', 'skel', BONE2, [T([[-5.4, 2.7, -0.3], [-5.4, 2.7, 0.3]], 0.04), M(T([[-5.4, 2.7, 0.3], [-5.1, 2.4, 0.6], [-5.0, 1.9, 0.7]], 0.03))], 'A chain of small bones slung from the base of the skull. It supports the tongue and the larynx.');
  add(2, 'sk_patella', 'patella', 'skel', BONE3, [M(E([5.62, 1.22, 3.42], [0.1, 0.08, 0.1]))], 'The kneecap, a bone formed inside the tendon of the quadriceps muscle.');
  add(2, 'sk_pubis', 'pubis', 'skel', BONE, [M(T([[5.0, 1.6, 1.3], [5.3, 2.1, 0.1]], 0.08))], 'The front lower bar of the hip bone, running to the midline.');
  add(2, 'sk_obtur', 'obturator foramen', 'skel', 0x3a3a44, [M(E([5.5, 1.78, 0.68], [0.2, 0.04, 0.2]))], 'The large window between the pubis and the ischium, closed in life by a membrane and muscle.', { a: 0.5 });
  add(2, 'sk_pubsym', 'pelvic (pubic) symphysis', 'skel', CART, [E([5.42, 2.15, 0], [0.3, 0.06, 0.05])], 'The joint in the midline where the two hip bones meet. The fetus must pass through the ring this completes.');

  /* ================= plate 3: muscles from above ================= */
  add(3, 'mu_ctx', 'trunk, skinned', 'musc', 0xb97768, [body(0, 12, null, 0.95)], '', { x: 1, dull: 1, on: [B + 4] });
  add(3, 'mu_trapez', 'trapezius', 'musc', K.muscle, [body(4, 6, [150, 210], 1.0)], 'A thin sheet from the back of the skull and the spines of the neck and chest to the spine of the scapula. It lifts and swings the shoulder blade.');
  add(3, 'mu_latiss', 'latissimus dorsi', 'musc', K.muscle2, [body(6, 8, [105, 165], 1.0), body(6, 8, [195, 255], 1.0)], 'A broad fan from the back to the humerus. It pulls the forelimb backward: the main muscle of propulsion.');
  add(3, 'mu_lumbfas', 'lumbodorsal fascia', 'musc', 0xf2e6da, [body(8, 10, [150, 210], 1.0)], 'A tough white sheet of tendon over the loin, giving origin to the latissimus dorsi and the oblique belly muscles.');
  add(3, 'mu_longiss', 'longissimus dorsi', 'musc', 0xd08a7c, [body(6, 8, [167, 193], 1.006)], 'The long muscle beside the spine that straightens the back. Butchers call it the loin eye.');
  add(3, 'mu_serratus', 'serratus ventralis', 'musc', 0xb86a5c, [body(5, 6, [100, 128], 1.0), body(5, 6, [232, 260], 1.0)], 'A fan from the ribs up to the inner face of the scapula. The trunk hangs between the forelimbs in a sling made of these two muscles.');
  add(3, 'mu_intercost', 'intercostal muscles', 'musc', 0xc98274, [body(6, 7, [70, 103], 0.99), body(6, 7, [257, 290], 0.99)], 'Two crossed layers between each pair of ribs. They move the ribs in breathing.');
  add(3, 'mu_splenius', 'splenius', 'musc', K.muscle2, [body(3, 4, [160, 200], 1.0)], 'A flat muscle on the back of the neck under the trapezius. It raises and turns the head.');
  add(3, 'mu_brachioc', 'brachiocephalic muscle', 'musc', 0xdc9484, [body(4, 5, [95, 148], 1.0), body(4, 5, [212, 265], 1.0)], 'A long band on the side of the neck from the head to the humerus. It draws the forelimb forward.', { on: [B + 4] });
  add(3, 'mu_temporal', 'temporalis', 'musc', K.muscle, [M(E([-5.5, 0.85, 0.85], [0.35, 0.12, 0.3]))], 'Fills the hollow on the side of the skull behind the eye and passes inside the zygomatic arch to close the jaw.');
  add(3, 'mu_supraspin', 'supraspinatus', 'musc', 0xd08a7c, [M(T([[-3.45, 1.3, 1.5], [-3.0, 0.75, 1.1]], [0.12, 0.26], { sy: 0.4 }))], 'Fills the fossa in front of the spine of the scapula. It extends the shoulder.');
  add(3, 'mu_infraspin', 'infraspinatus', 'musc', K.muscle2, [M(T([[-3.25, 1.3, 1.75], [-2.6, 0.7, 1.4]], [0.12, 0.26], { sy: 0.4 }))], 'Fills the fossa behind the spine of the scapula. It braces the outside of the shoulder joint.');
  add(3, 'mu_deltoid', 'deltoid', 'musc', K.muscle, [M(T([[-3.0, 0.95, 1.6], [-3.5, 1.15, 2.2]], [0.2, 0.1], { sy: 0.4 }))], 'From the spine of the scapula to the humerus. It flexes the shoulder.');
  add(3, 'mu_triceps', 'triceps brachii', 'musc', K.muscle2, [M(T([[-2.9, 1.1, 1.9], [-3.3, 0.85, 2.7], [-3.72, 0.8, 3.25]], [0.3, 0.42, 0.14]))], 'The large mass behind the humerus, inserting on the olecranon. It straightens the elbow and holds the animal up.');
  add(3, 'mu_brachialis', 'brachialis', 'musc', 0xdc9484, [M(T([[-3.6, 1.1, 2.2], [-3.95, 0.85, 3.3]], [0.12, 0.1]))], 'Winds round the outside of the humerus to the forearm. It bends the elbow.');
  add(3, 'mu_ecr', 'extensor carpi radialis', 'musc', K.muscle, [M(T([[-3.95, 0.85, 3.4], [-4.3, 0.7, 4.1], [-4.62, 0.6, 4.9]], [0.1, 0.16, 0.05]))], 'The largest muscle on the front of the forearm. It straightens the wrist.');
  add(3, 'mu_cde', 'common digital extensor', 'musc', 0xb86a5c, [M(T([[-3.8, 0.7, 3.4], [-4.15, 0.55, 4.1], [-4.5, 0.5, 4.9]], [0.09, 0.14, 0.04]))], 'Beside the extensor carpi radialis. Its tendons run to the toes and straighten them.');
  add(3, 'mu_tfl', 'tensor fasciae latae', 'musc', 0xdc9484, [M(T([[4.5, 0.9, 1.1], [5.2, 0.85, 2.4]], [0.3, 0.14], { sy: 0.4 }))], 'A triangle at the front of the hip that tightens the white fascia over the thigh and flexes the hip.');
  add(3, 'mu_glutmed', 'gluteus medius', 'musc', K.muscle, [M(E([4.75, 0.75, 1.05], [0.42, 0.16, 0.34]))], 'The thick muscle over the ilium, inserting on the greater trochanter. It extends the hip.');
  add(3, 'mu_bicfem', 'biceps femoris', 'musc', K.muscle2, [M(T([[5.4, 0.9, 1.2], [5.75, 0.7, 2.4], [5.85, 0.7, 3.4]], [0.36, 0.5, 0.2], { sy: 0.5 }))], 'The large muscle covering the outside of the thigh. It extends the hip and bends the knee. With the two below it forms the ham.');
  add(3, 'mu_semitend', 'semitendinosus', 'musc', K.muscle, [M(T([[5.9, 1.1, 0.9], [6.2, 0.9, 2.2], [6.1, 0.8, 3.4]], [0.2, 0.26, 0.1]))], 'The rear edge of the thigh, from the ischium to the tibia.');
  add(3, 'mu_semimem', 'semimembranosus', 'musc', 0xb86a5c, [M(T([[5.95, 1.5, 0.8], [6.1, 1.3, 2.0], [5.9, 1.1, 3.3]], [0.22, 0.28, 0.1]))], 'The thick muscle on the inner rear of the thigh, medial to the semitendinosus.', { on: [B + 4] });
  add(3, 'mu_gastroc', 'gastrocnemius', 'musc', K.muscle2, [M(T([[5.75, 0.75, 3.45], [6.25, 0.55, 4.1], [6.8, 0.5, 4.7]], [0.14, 0.26, 0.06]))], 'The calf muscle. It straightens the hock.', { on: [B + 4] });
  add(3, 'mu_achilles', 'calcaneal (Achilles) tendon', 'musc', K.white, [M(T([[6.8, 0.5, 4.7], [6.95, 0.45, 4.77]], 0.04))], 'The cord that carries the pull of the calf muscles to the heel bone.');
  add(3, 'mu_tibcran', 'tibialis cranialis', 'musc', K.muscle, [M(T([[5.6, 1.05, 3.5], [6.05, 0.9, 4.2], [6.5, 0.75, 4.9]], [0.1, 0.15, 0.05]))], 'On the front of the shin. It flexes the hock.', { on: [B + 4] });
  add(3, 'mu_peroneus', 'peroneus (fibularis) muscles', 'musc', 0xdc9484, [M(T([[5.75, 0.8, 3.5], [6.2, 0.65, 4.2], [6.62, 0.58, 4.86]], [0.08, 0.12, 0.04]))], 'A group on the outer side of the leg along the fibula. They flex the hock and turn the foot out.');

  /* ================= plate 4: muscles from below ================= */
  add(4, 'mv_digastric', 'digastric', 'musc', K.muscle2, [M(T([[-7.3, 2.55, 0.3], [-6.2, 2.75, 0.7], [-5.4, 2.6, 0.95]], [0.08, 0.14, 0.08]))], 'Along the inner edge of the lower jaw, from the paroccipital process to the chin. It opens the mouth.');
  add(4, 'mv_mylohy', 'mylohyoid', 'musc', 0xd9998b, [body(1, 3, [-28, 28], 1.0)], 'A thin sheet slung between the two halves of the lower jaw. It lifts the floor of the mouth in swallowing.');
  add(4, 'mv_sternohy', 'sternohyoid', 'musc', K.muscle, [M(T([surf(-5.6, 6, 1.0), surf(-4.4, 5, 1.0), surf(-3.6, 4, 0.99)], 0.1, { sy: 0.5 }))], 'A strap in the midline of the neck from the breastbone to the hyoid, lying over the trachea.');
  add(4, 'mv_sternothy', 'sternothyroid', 'musc', 0xb86a5c, [M(T([surf(-5.0, 17, 1.0), surf(-3.7, 13, 0.99)], 0.08, { sy: 0.5 }))], 'A thinner strap beside and beneath the sternohyoid, ending on the thyroid cartilage of the larynx.');
  add(4, 'mv_sternomast', 'sternomastoid', 'musc', 0xdc9484, [M(T([surf(-3.6, 10, 1.0), surf(-4.6, 40, 1.0), surf(-5.3, 75, 1.0)], 0.14, { sy: 0.5 }))], 'Runs diagonally from the breastbone to the skull behind the ear. It bends and turns the head.');
  add(4, 'mv_pectsup', 'superficial pectoral', 'musc', K.muscle, [body(5, 6, [-45, 45], 1.0), M(T([surf(-3.0, 40, 1.0), [-3.5, 1.6, 2.2]], [0.4, 0.15], { sy: 0.3 }))], 'The front chest muscle, from the sternum to the humerus. It draws the forelimb toward the midline.');
  add(4, 'mv_pectdeep', 'deep (posterior) pectoral', 'musc', K.muscle2, [body(6, 7, [-45, 45], 1.0), M(T([surf(-1.6, 45, 1.0), [-3.3, 1.7, 1.9]], [0.4, 0.15], { sy: 0.3 }))], 'The larger, rear chest muscle. It pulls the forelimb back and helps hold the trunk up between the legs.');
  add(4, 'mv_rectus', 'rectus abdominis', 'musc', K.muscle, [body(7, 11, [-22, 22], 1.0)], 'The pair of straight muscles of the belly, from the pubis to the sternum.');
  add(4, 'mv_linea', 'linea alba', 'musc', 0xf7f1e6, [body(7, 11, [-2, 2], 1.008, { rs: 3 })], 'The white midline seam of tendon where the belly muscles of the two sides meet. Surgeons cut here because it barely bleeds.');
  add(4, 'mv_extobl', 'external abdominal oblique', 'musc', K.muscle2, [body(7, 11, [22, 90], 1.0), body(7, 8, [270, 338], 1.0)], 'The outermost of three sheets in the side of the belly. Its fibres run down and back. On the pig’s left it has been cut away in steps to show the two layers beneath.');
  add(4, 'mv_intobl', 'internal abdominal oblique', 'musc', 0xd08a7c, [body(8, 9, [270, 338], 0.985)], 'The middle sheet. Its fibres run down and forward, at right angles to the external oblique.');
  add(4, 'mv_transv', 'transversus abdominis', 'musc', 0xb86a5c, [body(9, 11, [270, 338], 0.97)], 'The innermost sheet, with fibres running straight across. Three crossed layers make the wall strong, like plywood.');
  add(4, 'mv_biceps', 'biceps brachii', 'musc', K.muscle, [M(T([[-3.45, 1.75, 1.75], [-3.75, 1.4, 2.6], [-3.95, 1.2, 3.35]], [0.1, 0.16, 0.07]))], 'On the front of the humerus. It bends the elbow.');
  add(4, 'mv_flexfore', 'flexor muscles of the forearm', 'musc', 0xd08a7c, [M(T([[-3.95, 1.15, 3.45], [-4.3, 1.0, 4.1], [-4.62, 0.8, 4.9]], [0.1, 0.16, 0.05]))], 'A group on the back of the forearm that bends the wrist and the toes.');
  add(4, 'mv_sartorius', 'sartorius', 'musc', 0xdc9484, [M(T([[4.7, 2.1, 1.2], [5.2, 1.6, 2.4], [5.55, 1.3, 3.35]], 0.1, { sy: 0.4 }))], 'A narrow strap along the front edge of the inner thigh.');
  add(4, 'mv_gracilis', 'gracilis', 'musc', K.muscle2, [M(T([[5.4, 2.2, 0.6], [5.75, 1.7, 2.0], [5.8, 1.3, 3.35]], [0.35, 0.4, 0.12], { sy: 0.3 }))], 'A broad thin sheet covering the rear half of the inner thigh. It draws the leg inward.');
  add(4, 'mv_rectfem', 'rectus femoris', 'musc', K.muscle, [M(T([[4.9, 1.8, 1.6], [5.25, 1.5, 2.5], [5.6, 1.25, 3.4]], [0.16, 0.24, 0.1]))], 'The middle head of the quadriceps, on the front of the femur. All the heads straighten the knee through the patella.');
  add(4, 'mv_vastmed', 'vastus medialis', 'musc', 0xb86a5c, [M(T([[5.05, 1.7, 1.9], [5.4, 1.45, 2.8], [5.62, 1.25, 3.4]], [0.12, 0.2, 0.08]))], 'The inner head of the quadriceps.');
  add(4, 'mv_vastlat', 'vastus lateralis', 'musc', K.muscle2, [M(T([[4.75, 1.3, 1.6], [5.1, 1.1, 2.5], [5.55, 1.05, 3.4]], [0.16, 0.24, 0.1]))], 'The outer head of the quadriceps, the largest.', { on: [B + 3] });
  add(4, 'mv_adductor', 'adductor', 'musc', K.muscle, [M(T([[5.45, 1.9, 0.9], [5.75, 1.5, 2.0], [5.8, 1.2, 3.0]], [0.2, 0.26, 0.1]))], 'A thick muscle under the gracilis, from the pelvis to the femur. It draws the leg inward.');
  add(4, 'mv_pectineus', 'pectineus', 'musc', 0xdc9484, [M(T([[5.2, 2.1, 0.8], [5.4, 1.75, 1.6]], [0.12, 0.07]))], 'A small muscle between the sartorius and the adductor. The femoral artery and vein run along its edge.');
  add(4, 'mv_iliopsoas', 'iliopsoas', 'musc', 0xb86a5c, [M(T([[3.6, 1.3, 0.5], [4.6, 1.6, 1.0], [5.05, 1.65, 1.6]], [0.14, 0.18, 0.08]))], 'From the underside of the lumbar vertebrae to the femur: the tenderloin. It flexes the hip.');

  /* ================= plate 5: arteries ================= */
  var AR = K.artery, AR2 = 0xd9564a, PU = 0x7b5ea8;
  add(5, 'ar_pulm', 'pulmonary arteries', 'circ', PU, [T([[-3.35, 2.45, -0.5], [-3.0, 2.2, -1.0]], 0.1), T([[-3.3, 2.6, -0.2], [-3.1, 2.3, 0.9]], 0.1)], 'The two branches of the pulmonary trunk, one to each lung. In the fetus they carry little blood; most is shunted through the ductus arteriosus.');
  add(5, 'ar_bicar', 'bicarotid trunk', 'circ', AR, [T([[-3.9, 2.55, 0.2], [-4.1, 2.5, 0.1]], 0.09)], 'A short common stem from the brachiocephalic trunk that divides into the two common carotid arteries.');
  add(5, 'ar_rsubcl', 'right subclavian artery', 'circ', AR2, [T([[-3.9, 2.55, 0.2], [-3.95, 2.35, 0.7], [-3.8, 2.0, 1.3]], 0.085)], 'The other branch of the brachiocephalic trunk, to the right forelimb. The left subclavian leaves the aortic arch directly.');
  add(5, 'ar_intcar', 'internal carotid artery', 'circ', AR, [M(T([[-5.6, 2.42, 0.4], [-5.75, 2.1, 0.55], [-5.6, 1.8, 0.5]], 0.03))], 'The small deep branch of the common carotid that enters the skull to supply the brain.');
  add(5, 'ar_extcar', 'external carotid artery', 'circ', AR2, [M(T([[-5.6, 2.42, 0.4], [-6.1, 2.45, 0.75], [-6.6, 2.4, 0.95]], 0.04))], 'The larger branch of the common carotid, to the face, tongue and jaws.');
  add(5, 'ar_costocerv', 'costocervical trunk', 'circ', AR2, [M(T([[-3.82, 2.2, 1.0], [-3.6, 1.6, 1.0], [-3.9, 1.2, 0.8]], 0.035))], 'A branch of the subclavian running dorsally to the deep muscles of the neck and the first ribs.');
  add(5, 'ar_vertebral', 'vertebral artery', 'circ', AR, [M(T([[-3.85, 2.25, 0.9], [-4.2, 1.6, 0.6], [-4.7, 1.2, 0.4]], 0.03))], 'Runs up the neck through a hole in each cervical vertebra to reach the brain.');
  add(5, 'ar_thyrocerv', 'thyrocervical trunk', 'circ', AR2, [M(T([[-3.8, 2.1, 1.15], [-4.2, 2.2, 1.4], [-4.6, 2.0, 1.6]], 0.035))], 'A branch of the subclavian to the thyroid region and the muscles of the neck and shoulder.');
  add(5, 'ar_intthor', 'internal thoracic (mammary) artery', 'circ', AR, [M(T([[-3.8, 2.3, 0.85], [-3.2, 3.2, 0.45], [-1.5, 3.4, 0.4], [0.0, 3.3, 0.45]], 0.035))], 'Runs back along the inside of the chest wall beside the sternum. Heart surgeons use it for bypass grafts.');
  add(5, 'ar_axillary', 'axillary artery', 'circ', AR, [M(T([[-3.75, 2.0, 1.3], [-3.6, 1.8, 1.7]], 0.07))], 'The continuation of the subclavian as it crosses the armpit.');
  add(5, 'ar_subscap', 'subscapular artery', 'circ', AR2, [M(T([[-3.6, 1.8, 1.7], [-3.1, 1.4, 1.6]], 0.035))], 'A branch of the axillary to the muscles of the shoulder blade.');
  add(5, 'ar_brachial', 'brachial artery', 'circ', AR, [M(T([[-3.6, 1.8, 1.7], [-3.8, 1.3, 2.6], [-3.95, 1.1, 3.4]], 0.045))], 'The artery of the upper forelimb, running down the inner side of the humerus.');
  add(5, 'ar_radial', 'radial artery', 'circ', AR2, [M(T([[-3.95, 1.1, 3.4], [-4.3, 0.9, 4.2], [-4.6, 0.75, 4.9]], 0.03))], 'A continuation of the brachial artery down the forearm.');
  add(5, 'ar_intercost', 'intercostal arteries', 'circ', AR2, D.row(6, function (i) { var x = -2.6 + i * 0.38; return M(T([[x, 1.12, 0.15], [x + 0.1, 1.2, 1.6]], 0.02)); }), 'Paired branches of the aorta, one along the rear edge of each rib.');
  add(5, 'ar_coeliac', 'coeliac artery', 'circ', AR, [T([[0.2, 0.98, -0.2], [0.4, 1.4, -0.4], [0.6, 1.7, -0.6]], 0.07)], 'The first unpaired branch of the abdominal aorta, just behind the diaphragm. It divides to the stomach, liver and spleen.');
  add(5, 'ar_splenic', 'splenic artery', 'circ', AR2, [T([[0.6, 1.7, -0.6], [1.0, 2.0, -1.5]], 0.035)], 'The branch of the coeliac artery to the spleen and part of the stomach.');
  add(5, 'ar_hepatic', 'hepatic artery', 'circ', AR2, [T([[0.6, 1.7, -0.6], [0.3, 2.1, 0.2]], 0.035)], 'The branch of the coeliac artery to the liver, gallbladder and duodenum.');
  add(5, 'ar_gastric', 'left gastric artery', 'circ', AR, [T([[0.6, 1.7, -0.6], [0.9, 1.9, -0.9]], 0.03)], 'The branch of the coeliac artery to the stomach.');
  add(5, 'ar_cranmes', 'cranial mesenteric artery', 'circ', AR, [T([[0.9, 0.95, -0.2], [1.6, 1.6, 0.2], [2.4, 2.3, 0.6]], 0.07)], 'The second unpaired branch of the aorta, fanning through the mesentery to the small intestine and most of the colon.');
  add(5, 'ar_gonadal', 'gonadal (testicular or ovarian) arteries', 'circ', AR2, [M(T([[3.3, 0.95, 0.0], [3.7, 1.1, 0.6], [3.85, 1.2, 1.0]], 0.022))], 'A slender pair leaving the aorta behind the kidneys. They are long because the gonads begin near the kidneys and migrate back.');
  add(5, 'ar_caudmes', 'caudal mesenteric artery', 'circ', AR, [T([[4.2, 1.0, -0.1], [4.5, 1.3, -0.2], [4.8, 1.4, -0.15]], 0.035)], 'The small third unpaired branch, to the end of the colon and the rectum.');
  add(5, 'ar_extiliac', 'external iliac artery', 'circ', AR, [M(T([[4.9, 1.2, 0.05], [5.0, 1.4, 0.8], [5.05, 1.55, 1.4]], 0.07))], 'The large branch of the aorta to each hindlimb.');
  add(5, 'ar_femoral', 'femoral artery', 'circ', AR2, [M(T([[5.05, 1.55, 1.4], [5.3, 1.45, 2.4], [5.6, 1.25, 3.3]], 0.05))], 'The external iliac once it leaves the body wall and runs down the inner thigh.');
  add(5, 'ar_deepfem', 'deep femoral artery', 'circ', AR, [M(T([[5.05, 1.55, 1.4], [5.5, 1.5, 1.5], [5.8, 1.4, 1.9]], 0.035))], 'A branch given off at the groin to the muscles of the rear thigh.');
  add(5, 'ar_intiliac', 'internal iliac artery', 'circ', AR2, [M(T([[5.1, 1.25, 0.1], [5.5, 1.2, 0.5], [5.9, 1.3, 0.6]], 0.04))], 'Supplies the pelvic organs and rump. In the fetus its main branch is the umbilical artery.');
  add(5, 'ar_medsac', 'median sacral (caudal) artery', 'circ', AR, [T([[5.1, 1.25, -0.05], [5.9, 1.15, 0], [6.5, 1.3, 0]], 0.03)], 'The small midline continuation of the aorta into the tail.');

  /* ================= plate 6: veins ================= */
  var VE = K.vein, VE2 = 0x5673bd, PO = 0x34508f;
  add(6, 've_brachioc', 'brachiocephalic veins', 'circ', VE, [T([[-3.95, 2.5, 0.5], [-4.15, 2.5, 0.75]], 0.12), T([[-3.95, 2.5, 0.5], [-4.1, 2.55, -0.3], [-4.15, 2.5, -0.7]], 0.12)], 'The two large veins, one from each side, that join to form the cranial vena cava.');
  add(6, 've_intjug', 'internal jugular vein', 'circ', VE2, [M(T([[-4.15, 2.5, 0.72], [-4.8, 2.45, 0.55], [-5.6, 2.38, 0.6]], 0.04))], 'A slender vein beside the carotid artery and vagus nerve, draining the brain.');
  add(6, 've_subcl', 'subclavian vein', 'circ', VE, [M(T([[-4.1, 2.48, 0.75], [-3.95, 2.2, 1.2], [-3.8, 1.95, 1.5]], 0.08))], 'Brings blood from the forelimb to the brachiocephalic vein.');
  add(6, 've_axillary', 'axillary vein', 'circ', VE2, [M(T([[-3.8, 1.95, 1.5], [-3.62, 1.75, 1.85]], 0.07))], 'The vein of the armpit, between the brachial and subclavian veins.');
  add(6, 've_brachial', 'brachial vein', 'circ', VE, [M(T([[-3.62, 1.75, 1.85], [-3.85, 1.3, 2.7], [-4.0, 1.05, 3.4]], 0.045))], 'The deep vein of the upper forelimb, beside the brachial artery.');
  add(6, 've_cephalic', 'cephalic vein', 'circ', VE2, [M(T([[-4.5, 2.42, 0.95], [-4.0, 1.9, 1.9], [-4.1, 1.2, 3.0], [-4.5, 0.85, 4.4]], 0.04))], 'A vein just under the skin of the front of the forelimb, joining the external jugular. The usual site for drawing blood in many animals.');
  add(6, 've_subscap', 'subscapular vein', 'circ', VE, [M(T([[-3.62, 1.75, 1.85], [-3.05, 1.35, 1.7]], 0.04))], 'Drains the muscles of the shoulder blade into the axillary vein.');
  add(6, 've_intthor', 'internal thoracic vein', 'circ', VE2, [M(T([[-3.9, 2.55, 0.62], [-3.2, 3.25, 0.6], [-1.5, 3.45, 0.55], [0.0, 3.35, 0.6]], 0.035))], 'Runs beside the artery of the same name along the inside of the sternum.');
  add(6, 've_costocerv', 'costocervical vein', 'circ', VE, [M(T([[-3.6, 2.55, 0.6], [-3.5, 1.6, 0.9], [-3.9, 1.2, 0.7]], 0.035))], 'Drains the deep neck and the first ribs into the cranial vena cava.');
  add(6, 've_hemiazyg', 'hemiazygos vein', 'circ', VE2, [T([[-2.9, 2.4, -0.4], [-3.1, 1.5, -0.6], [-2.0, 1.05, -0.6], [-0.6, 1.0, -0.55]], 0.05)], 'Collects the intercostal veins along the left side of the spine and empties into the heart. In humans the matching vein, the azygos, is on the right.');
  add(6, 've_hepatic', 'hepatic veins', 'circ', VE, [T([[-0.3, 1.95, 0.4], [0.1, 2.2, 0.8]], 0.07), T([[-0.3, 1.95, 0.3], [0.2, 2.2, -0.6]], 0.07)], 'Short veins from the liver into the caudal vena cava just behind the diaphragm.');
  add(6, 've_ductven', 'ductus venosus', 'circ', 0x8a5fbf, [T([[0.7, 3.1, 0], [0.3, 2.6, 0.2], [-0.3, 2.0, 0.32]], 0.09)], 'A fetal channel through the liver that takes oxygen-rich blood from the umbilical vein straight to the caudal vena cava. It closes after birth.');
  add(6, 've_hportal', 'hepatic portal vein', 'circ', PO, [T([[2.2, 2.3, 0.5], [1.4, 2.2, 0.5], [0.6, 2.4, 0.5]], 0.08)], 'Carries blood from the stomach, spleen, pancreas and intestines to the liver, so that the liver sees absorbed food first.');
  add(6, 've_gastrospl', 'gastrosplenic vein', 'circ', PO, [T([[1.4, 2.2, 0.5], [1.3, 2.2, -0.6], [1.2, 2.4, -1.5]], 0.05)], 'The tributary of the portal vein from the stomach and spleen.');
  add(6, 've_cranmes', 'cranial mesenteric vein', 'circ', PO, [T([[2.2, 2.3, 0.5], [2.8, 2.5, 0.9]], 0.06)], 'The tributary of the portal vein from the intestines.');
  add(6, 've_gonadal', 'gonadal (testicular or ovarian) veins', 'circ', VE2, [M(T([[3.3, 0.98, 0.25], [3.7, 1.12, 0.7], [3.85, 1.22, 1.0]], 0.022))], 'A slender pair draining the gonads into the caudal vena cava.');
  add(6, 've_comiliac', 'common iliac vein', 'circ', VE, [M(T([[5.0, 1.2, 0.2], [5.2, 1.25, 0.5]], 0.1))], 'Formed by the external and internal iliac veins. The two common iliacs join to make the caudal vena cava.');
  add(6, 've_extiliac', 'external iliac vein', 'circ', VE2, [M(T([[5.2, 1.25, 0.5], [5.1, 1.5, 1.0], [5.1, 1.6, 1.45]], 0.07))], 'The vein returning blood from the hindlimb.');
  add(6, 've_femoral', 'femoral vein', 'circ', VE, [M(T([[5.1, 1.6, 1.45], [5.35, 1.5, 2.4], [5.65, 1.3, 3.3]], 0.055))], 'The main vein of the thigh, beside the femoral artery.');
  add(6, 've_intiliac', 'internal iliac vein', 'circ', VE2, [M(T([[5.2, 1.25, 0.5], [5.6, 1.2, 0.6], [5.95, 1.3, 0.7]], 0.045))], 'Drains the pelvic organs and the rump.');
  add(6, 've_medsac', 'median sacral vein', 'circ', VE, [T([[5.0, 1.2, 0.2], [5.9, 1.12, 0.08], [6.5, 1.28, 0.05]], 0.03)], 'The small midline vein of the tail.');

  /* ================= plate 7: nervous system ================= */
  var NV = K.nerve, NV2 = 0xe6dc9c, NV3 = 0xfaf6d6;
  add(7, 'ne_floor', 'floor of the skull', 'skel', BONE2, [E([-5.75, 1.78, 0], [1.05, 0.06, 0.9])], '', { x: 1, dull: 1 });
  add(7, 'ne_olfbulb', 'olfactory bulbs', 'nerv', K.brain2, [M(E([-6.55, 1.4, 0.14], [0.16, 0.1, 0.12]))], 'Two large lobes at the front of the brain receiving the nerves of smell. Their size tells you how much a pig relies on its nose.');
  add(7, 'ne_cerebrum', 'cerebral hemispheres', 'nerv', K.brain, [M(E([-5.95, 1.2, 0.3], [0.52, 0.3, 0.3]))], 'The largest part of the brain: sensation, voluntary movement, learning and memory.');
  add(7, 'ne_longfis', 'longitudinal fissure', 'nerv', 0x7a4a44, [T([[-6.45, 0.92, 0], [-5.45, 0.92, 0]], 0.022)], 'The deep cleft between the two cerebral hemispheres.');
  add(7, 'ne_sulci', 'sulci and gyri', 'nerv', 0x9a6a60, D.row(3, function (i) { return M(T([[-6.3, 0.96 + i * 0.05, 0.2 + i * 0.12], [-5.6, 0.96 + i * 0.05, 0.22 + i * 0.14]], 0.013)); }), 'The grooves (sulci) and the folds between them (gyri). Folding packs more cortex into the skull.');
  add(7, 'ne_vermis', 'vermis of the cerebellum', 'nerv', K.brain2, [E([-5.25, 1.2, 0], [0.2, 0.24, 0.16])], 'The ridged middle strip of the cerebellum.');
  add(7, 'ne_cbhemi', 'cerebellar hemispheres', 'nerv', 0xcfa594, [M(E([-5.25, 1.28, 0.3], [0.18, 0.2, 0.18]))], 'The lateral lobes of the cerebellum. It coordinates balance and smooth movement.');
  add(7, 'ne_medulla', 'medulla oblongata', 'nerv', 0xcfa594, [T([[-5.05, 1.4, 0], [-4.75, 1.3, 0]], [0.2, 0.14])], 'The brainstem behind the cerebellum, continuous with the spinal cord. It controls breathing and heartbeat.');
  add(7, 'ne_cord', 'spinal cord', 'nerv', NV, [T([[-4.75, 1.3, 0], [-4.2, 1.0, 0], [-2.0, 0.95, 0], [2.0, 0.95, 0], [4.6, 0.95, 0]], 0.09)], 'Runs through the canal of the vertebrae from the skull to the lumbar region.');
  add(7, 'ne_cervenl', 'cervical enlargement', 'nerv', NV3, [E([-3.3, 0.95, 0], [0.4, 0.115, 0.16])], 'A thickening of the cord where the nerves of the forelimbs arise.');
  add(7, 'ne_lumbenl', 'lumbar enlargement', 'nerv', NV3, [E([3.6, 0.95, 0], [0.4, 0.115, 0.15])], 'A thickening of the cord where the nerves of the hindlimbs arise.');
  add(7, 'ne_cauda', 'cauda equina', 'nerv', NV2, D.row(5, function (i) { return T([[4.6, 0.95, 0], [5.7, 0.98, (i - 2) * 0.12]], 0.018); }), 'The “horse’s tail”: a spray of nerve roots that continue back inside the canal beyond the end of the cord.');
  add(7, 'ne_dura', 'dura mater', 'nerv', 0xd9d2c2, [T([[-1.0, 0.95, 0], [1.0, 0.95, 0]], 0.135)], 'The tough outer one of the three membranes (meninges) around the brain and cord. A sleeve of it has been left in place here.', { a: 0.55 });
  var GX = D.pts(11, function (i) { return -2.6 + i * 0.6; });
  add(7, 'ne_drg', 'dorsal root ganglia', 'nerv', NV3, GX.map(function (x) { return M(E([x, 0.98, 0.22], [0.05, 0.04, 0.05])); }), 'A bead on the sensory root of every spinal nerve, holding the cell bodies of its sensory neurons.');
  add(7, 'ne_spnerves', 'spinal nerves', 'nerv', NV2, GX.map(function (x) { return M(T([[x, 0.98, 0.26], [x + 0.1, 1.0, 0.75]], 0.018)); }), 'One pair leaves between each two vertebrae. Each is formed by a sensory dorsal root and a motor ventral root.');
  add(7, 'ne_brplex', 'brachial plexus', 'nerv', NV3, [M(E([-3.5, 1.3, 1.0], [0.2, 0.06, 0.3]))].concat(D.row(4, function (i) { return M(T([[-3.75 + i * 0.22, 0.98, 0.12], [-3.55 + i * 0.05, 1.25, 0.8]], 0.025)); })), 'A web formed by the last three cervical and first thoracic nerves, from which the nerves of the forelimb emerge.');
  add(7, 'ne_radial', 'radial nerve', 'nerv', NV, [M(T([[-3.5, 1.3, 1.25], [-3.55, 1.0, 2.2], [-3.85, 0.85, 3.3]], 0.03))], 'The largest nerve of the plexus. It supplies the triceps and the extensor muscles.');
  add(7, 'ne_median', 'median nerve', 'nerv', NV2, [M(T([[-3.55, 1.4, 1.25], [-3.8, 1.3, 2.5], [-4.0, 1.1, 3.4], [-4.4, 0.9, 4.4]], 0.025))], 'Runs with the brachial artery to the flexor muscles of the forearm.');
  add(7, 'ne_ulnar', 'ulnar nerve', 'nerv', NV, [M(T([[-3.45, 1.35, 1.25], [-3.6, 1.15, 2.5], [-3.8, 0.8, 3.3], [-4.3, 0.65, 4.4]], 0.022))], 'Passes behind the elbow (your “funny bone”) to the flexor muscles and the foot.');
  add(7, 'ne_lsplex', 'lumbosacral plexus', 'nerv', NV3, [M(E([4.5, 1.15, 0.6], [0.3, 0.05, 0.2]))].concat(D.row(4, function (i) { return M(T([[3.9 + i * 0.3, 0.98, 0.12], [4.3 + i * 0.12, 1.12, 0.5]], 0.025)); })), 'A web formed by the last lumbar and first sacral nerves, from which the nerves of the hindlimb emerge.');
  add(7, 'ne_femoral', 'femoral nerve', 'nerv', NV, [M(T([[4.4, 1.2, 0.7], [4.9, 1.6, 1.5], [5.3, 1.45, 2.5]], 0.03))], 'Runs with the femoral vessels to the quadriceps muscle.');
  add(7, 'ne_obtur', 'obturator nerve', 'nerv', NV2, [M(T([[4.6, 1.2, 0.6], [5.2, 1.7, 0.8], [5.6, 1.7, 1.4]], 0.022))], 'Passes through the obturator foramen to the adductor muscles of the inner thigh.');
  add(7, 'ne_sciatic', 'sciatic nerve', 'nerv', NV, [M(T([[4.7, 1.1, 0.75], [5.3, 0.95, 1.5], [5.75, 0.85, 2.6], [5.85, 0.85, 3.3]], 0.045))], 'The thickest nerve in the body, running down the back of the thigh under the biceps femoris.');
  add(7, 'ne_tibial', 'tibial nerve', 'nerv', NV2, [M(T([[5.85, 0.85, 3.3], [6.3, 0.7, 4.2], [6.7, 0.6, 4.8]], 0.025))], 'The branch of the sciatic nerve to the calf muscles and the sole of the foot.');
  add(7, 'ne_peroneal', 'common peroneal (fibular) nerve', 'nerv', NV, [M(T([[5.85, 0.85, 3.3], [5.9, 0.95, 3.7], [6.3, 0.85, 4.4]], 0.022))], 'The branch of the sciatic nerve to the muscles on the front and outer side of the leg.');
  add(7, 'ne_symp', 'sympathetic trunk', 'nerv', 0xd9c97a, [M(T([[-3.4, 1.2, 0.36], [0, 1.15, 0.36], [4.0, 1.15, 0.3]], 0.02))].concat(D.row(10, function (i) { return M(E([-3.2 + i * 0.75, 1.17, 0.36], [0.06, 0.04, 0.045])); })), 'A beaded chain of ganglia on each side of the spine. It runs the heart, gut and vessels without conscious control.');
  /* the brain turned over, laid out to one side */
  var ZB = 3.4, XB = -1.0;
  function bx(x, y, z) { return [x + XB, y, z + ZB]; }
  add(7, 'nb_ctx', 'brain, ventral surface', 'nerv', K.brain2, [E(bx(-6.55, 1.3, 0.14), [0.16, 0.1, 0.12]), E(bx(-6.55, 1.3, -0.14), [0.16, 0.1, 0.12]), E(bx(-5.95, 1.3, 0.3), [0.52, 0.22, 0.3]), E(bx(-5.95, 1.3, -0.3), [0.52, 0.22, 0.3]), E(bx(-5.25, 1.35, 0), [0.22, 0.16, 0.42]), T([bx(-5.5, 1.25, 0), bx(-4.75, 1.3, 0)], [0.2, 0.13])], '', { x: 1, dull: 1 });
  add(7, 'nb_chiasma', 'optic chiasma', 'nerv', NV3, [E(bx(-5.95, 1.06, 0), [0.07, 0.04, 0.16]), T([bx(-5.97, 1.06, 0.12), bx(-6.3, 1.04, 0.45)], 0.035), T([bx(-5.97, 1.06, -0.12), bx(-6.3, 1.04, -0.45)], 0.035)], 'The X-shaped crossing of the two optic nerves (cranial nerve II). About half the fibres cross to the other side.');
  add(7, 'nb_pituit', 'pituitary (hypophysis)', 'endo', 0xe8b7c8, [E(bx(-5.72, 1.02, 0), [0.1, 0.06, 0.1])], 'The master endocrine gland, hanging from the floor of the brain behind the chiasma. It usually tears off when the brain is lifted out.');
  add(7, 'nb_pons', 'pons', 'nerv', 0xdbb8a6, [E(bx(-5.36, 1.1, 0), [0.14, 0.06, 0.24])], 'A crosswise band of fibres on the underside of the brainstem, linking the cerebellum with the rest of the brain.');
  var CN = [
    ['III', 'oculomotor nerve (III)', -5.6, 0.1, -6.0, 0.5, 'Motor, to four of the six muscles that move the eye, and to the pupil.'],
    ['IV', 'trochlear nerve (IV)', -5.48, 0.26, -5.9, 0.62, 'Motor, to one eye muscle. The thinnest cranial nerve.'],
    ['V', 'trigeminal nerve (V)', -5.36, 0.24, -5.75, 0.7, 'The thickest cranial nerve: sensation from the whole face, and motor to the chewing muscles.'],
    ['VI', 'abducens nerve (VI)', -5.22, 0.07, -5.6, 0.45, 'Motor, to the muscle that turns the eye outward.'],
    ['VII', 'facial nerve (VII)', -5.2, 0.22, -5.3, 0.7, 'Motor to the muscles of the face and ears; taste from the front of the tongue.'],
    ['VIII', 'vestibulocochlear nerve (VIII)', -5.14, 0.24, -5.12, 0.62, 'Sensory, from the inner ear: hearing and balance.'],
    ['IX', 'glossopharyngeal nerve (IX)', -5.05, 0.17, -4.95, 0.6, 'Taste from the back of the tongue, and the muscles of swallowing.'],
    ['X', 'root of the vagus nerve (X)', -4.98, 0.16, -4.8, 0.55, 'The origin of the vagus, which you traced down the neck to the heart, lungs and gut.'],
    ['XI', 'accessory nerve (XI)', -4.9, 0.14, -4.6, 0.4, 'Motor, to the trapezius and other muscles of the neck. Part of it rises from the spinal cord.'],
    ['XII', 'hypoglossal nerve (XII)', -4.98, 0.06, -5.2, 0.5, 'Motor, to the muscles of the tongue.']
  ];
  CN.forEach(function (c, i) { add(7, 'nb_' + c[0], c[1], 'nerv', i % 2 ? NV : NV2, [T([bx(c[2], 1.1, c[3]), bx(c[4], 1.08, c[5])], c[0] === 'V' ? 0.04 : 0.018), T([bx(c[2], 1.1, -c[3]), bx(c[4], 1.08, -c[5])], c[0] === 'V' ? 0.04 : 0.018)], c[6]); });

  return {
    steps: [
      { t: 'Skeleton: the skull and lower jaw', flip: true, view: { t: [-8.4, 2.6, 0], d: 13, ph: 0.35 },
        how: D.ol(['Study the skeleton from a prepared specimen. A fetal skeleton is still partly cartilage, and the skull bones are separated by soft sutures.', 'Work back along the roof of the skull: <b>nasal</b>, <b>frontal</b>, <b>parietal</b>, <b>occipital</b>.', 'Turn the skull to see the <b>zygomatic arch</b> and the open <b>orbit</b> from the side.', 'The <b>mandible</b> has been lifted off and set in front. Count the four kinds of teeth.']) },
      { t: 'Skeleton: from above', flip: true, view: { t: [-0.3, 3.0, 1.2], d: 24, ph: 0.3 },
        how: D.ol(['Count the five regions of the spine: <b>cervical</b>, <b>thoracic</b>, <b>lumbar</b>, <b>sacral</b>, <b>caudal</b>.', 'Follow the forelimb out from the <b>scapula</b>. A pig stands on the tips of two toes, so wrist and ankle are high off the ground.', 'Compare the hindlimb bone for bone with the forelimb.']) },
      { t: 'Skeleton: from below', view: { t: [-0.3, 2.4, 0], d: 24, ph: 0.3 },
        how: D.ol(['Turn the skeleton over to see the <b>sternum</b> and the <b>costal cartilages</b> that join the ribs to it.', 'With the lower jaw removed, find the bones of the base of the skull.', 'At the hip, find the <b>pubis</b>, the <b>obturator foramen</b> and the <b>pelvic symphysis</b>.']) },
      { t: 'Muscles: back, shoulder and hip', flip: true, view: { t: [0, 3.2, 1.2], d: 23, ph: 0.3 },
        how: D.ol(['Skin one side of the pig. Fetal muscle is soft and pale: work slowly.', 'Pick away the white fascia until you can see which way the fibres of each muscle run.', 'Slide a blunt probe under a muscle to free it from its neighbours. Find where it starts (origin) and where it ends (insertion).', 'The muscles of the hindlimb seen here are the cuts of a ham.']) },
      { t: 'Muscles: throat, chest, belly and inner thigh', view: { t: [0, 2.6, 0], d: 23, ph: 0.3 },
        how: D.ol(['With the pig on its back, skin the throat, chest and the inside of one hindlimb.', 'In the neck, the strap muscles lie over the trachea; the <b>sternomastoid</b> crosses them diagonally.', 'On the pig’s left flank, cut a window through each layer of the belly wall in turn and note how the fibre direction changes.', 'On the inner thigh, lift the thin <b>gracilis</b> to see the adductor beneath.']) },
      { t: 'The arteries', view: { t: [-0.3, 2.2, 0.3], d: 19, ph: 0.25 },
        how: D.ol(['Most fetal pigs are injected with red latex through an umbilical artery.', 'Start at the <b>aortic arch</b>. Only two vessels leave it in the pig: the <b>brachiocephalic trunk</b> and the <b>left subclavian</b>.', 'Push the abdominal organs to the pig’s right and follow the aorta back. Three unpaired arteries go to the gut; paired arteries go to kidneys, gonads and limbs.', 'Where the aorta ends, the large <b>umbilical arteries</b> leave the internal iliacs.']) },
      { t: 'The veins', view: { t: [-0.3, 2.2, 0.3], d: 19, ph: 0.25 },
        how: D.ol(['Veins are injected blue. They are thin-walled and vary from pig to pig more than arteries do.', 'Trace the tributaries of the <b>cranial vena cava</b> from the neck and forelimbs.', 'Scrape away some liver to follow the <b>umbilical vein</b> into the <b>ductus venosus</b>.', 'Find the <b>hepatic portal vein</b> in the membrane between the stomach and the liver. It is usually not injected, so look for a brown vessel.']) },
      { t: 'Brain, spinal cord and nerves', flip: true, view: { t: [-0.5, 2.8, -0.6], d: 23, ph: 0.3 },
        how: D.ol(['Remove the skin and muscle from the top of the head. The fetal skull is thin: shave it away in flakes with a scalpel held flat.', 'Cut through the neural arches with scissors to expose the <b>spinal cord</b> in its sheath of <b>dura mater</b>.', 'At the shoulder and the hip, find the <b>plexus</b> where spinal nerves regroup into the nerves of the limb.', 'Lift the brain out and turn it over to see the roots of the cranial nerves (shown to one side).']) }
    ],
    parts: parts,
    show: {
      5: ['flaps', 'lining', 'rv', 'lv', 'ra', 'la', 'aorta', 'brachio', 'lsubcl', 'carotid', 'pultrunk', 'ductus', 'abaorta', 'kidney', 'umbart', 'bladder', 'trachea', 'larynx', 'renalav'],
      6: ['flaps', 'lining', 'rv', 'lv', 'ra', 'la', 'cranvc', 'caudvc', 'jugular', 'abcava', 'kidney', 'umbvein', 'pulvein', 'liver_rl', 'trachea', 'larynx', 'renalav'],
      4: ['masseter']
    }
  };
});
