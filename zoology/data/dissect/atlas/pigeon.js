/* Pigeon — atlas plates: skull, skeleton, muscles, vessels, nerves and sense organs,
   feather types, glands and small organs.
   Same coordinates as pigeon.js: ventral side up (+y), beak at -x, the bird's right at +z. */
DX.extend('pigeon', function (B) {
  var D = DX, E = D.E, T = D.T, F = D.F, H = D.H, O = D.O, M = D.M, P = D.P, K = D.K;
  var BX = [-3.0, -2.2, -1.0, 0.5, 2.0, 3.0, 3.6], BR = [0.6, 1.3, 1.7, 1.7, 1.3, 0.8, 0.4];
  var k = D.kit(BX, BR, 1.6, 0.9), body = k.body, surf = k.surf;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var BONE = K.bone, BONE2 = 0xe2d6bd, BONE3 = 0xfaf4e2, DARK = 0x2a2420;
  var on = function () { var a = []; for (var i = 0; i < arguments.length; i++) a.push(B + arguments[i]); return { on: a }; };
  var S = on(1, 2), V = on(2), LB = on(2, 3, 4, 5);
  var SH = [-1.8, 1.2, 1.5], EL = [-2.3, 0.8, 3.1], WR = [-0.9, 0.6, 4.6];

  /* ================= plate 0: skull ================= */
  add(0, 'sk_frontal', 'frontal bone', 'skel', BONE, [M(E([-4.85, 1.4, 0.2], [0.35, 0.1, 0.22]))], 'Roofs the front of the braincase and the eye sockets. Bird skull bones fuse early, so in an adult the sutures between them cannot be seen.', S);
  add(0, 'sk_parietal', 'parietal bone', 'skel', BONE2, [M(E([-4.3, 1.38, 0.22], [0.22, 0.12, 0.24]))], 'Roofs the back of the braincase. The skull is thin as paper and braced inside by fine struts.', S);
  add(0, 'sk_supraocc', 'supraoccipital bone', 'skel', BONE, [E([-3.98, 1.6, 0], [0.08, 0.25, 0.3])], 'The back wall of the skull above the foramen magnum.', S);
  add(0, 'sk_foramen', 'foramen magnum', 'skel', DARK, [E([-3.94, 2.0, 0], [0.03, 0.09, 0.1])], 'The opening for the spinal cord. In birds it faces downward as much as backward.', S);
  add(0, 'sk_condyle', 'occipital condyle', 'skel', BONE3, [E([-3.92, 2.13, 0], [0.04, 0.04, 0.05])], 'A single small ball below the foramen magnum. One condyle, not two, lets a bird turn its head through most of a circle.', S);
  add(0, 'sk_squam', 'squamosal bone', 'skel', BONE2, [M(E([-4.25, 1.85, 0.5], [0.2, 0.2, 0.08]))], 'The side wall of the braincase above the ear, carrying the socket for the quadrate.', S);
  add(0, 'sk_orbit', 'orbit', 'skel', 0x3a3a44, [M(E([-4.7, 1.95, 0.5], [0.26, 0.26, 0.03]))], 'The huge eye socket. A pigeon’s two eyes outweigh its brain.', { a: 0.45, on: [B + 1, B + 2] });
  add(0, 'sk_septum', 'interorbital septum', 'skel', BONE3, [E([-4.7, 1.95, 0], [0.28, 0.28, 0.03])], 'A thin vertical sheet of bone that is all that separates the two eyes.', S);
  add(0, 'sk_sclerotic', 'sclerotic ring', 'skel', BONE, [M(O([-4.7, 1.95, 0.56], 0.16, 0.03))], 'A ring of small overlapping bony plates in the wall of the eyeball. It holds the shape of the eye against the muscles that focus it.', S);
  add(0, 'sk_lacrimal', 'lacrimal bone', 'skel', BONE2, [M(E([-5.02, 1.8, 0.42], [0.07, 0.12, 0.06]))], 'A small bone at the front of the orbit.', S);
  add(0, 'sk_nasal', 'nasal bone', 'skel', BONE, [M(T([[-5.15, 1.55, 0.12], [-5.5, 1.7, 0.1]], [0.1, 0.06], { sy: 0.5 }))], 'Forms the rear border of the nostril. Where it meets the frontal the bone is thin and flexible: a hinge that lets the upper beak lift.', S);
  add(0, 'sk_naris', 'nasal aperture', 'skel', DARK, [M(E([-5.45, 1.82, 0.14], [0.1, 0.04, 0.03]))], 'The bony opening of the nostril.', S);
  add(0, 'sk_premax', 'premaxilla', 'skel', BONE2, [T([[-5.3, 1.75, 0], [-5.75, 1.85, 0], [-6.1, 1.9, 0]], [0.14, 0.1, 0.03])], 'The main bone of the upper beak, the two sides fused. It is covered in life by a horny sheath; birds have no teeth.', S);
  add(0, 'sk_maxilla', 'maxilla', 'skel', BONE3, [M(T([[-5.6, 2.02, 0.1], [-5.25, 2.05, 0.25]], 0.045))], 'A small bone at the base of the upper beak, much reduced compared with a mammal’s.', S);
  add(0, 'sk_jugal', 'jugal bar', 'skel', BONE, [M(T([[-5.25, 2.08, 0.3], [-4.35, 2.2, 0.52]], 0.025))], 'A slender rod under the eye from the beak to the quadrate. When the quadrate swings forward, this rod pushes the upper beak up.', S);
  add(0, 'sk_quadrate', 'quadrate', 'skel', BONE2, [M(E([-4.3, 2.2, 0.5], [0.08, 0.12, 0.07]))], 'A movable bone between the skull and the lower jaw. In mammals it has moved into the middle ear as the incus.', S);
  add(0, 'sk_palatine', 'palatine', 'skel', BONE3, [M(T([[-5.3, 2.2, 0.08], [-4.8, 2.25, 0.14]], 0.035))], 'A strap of bone in the roof of the mouth. The palate is open in the midline.', S);
  add(0, 'sk_ptery', 'pterygoid', 'skel', BONE, [M(T([[-4.8, 2.25, 0.14], [-4.35, 2.25, 0.42]], 0.03))], 'A short rod linking the palatine to the quadrate, the second pushrod of the movable upper beak.', S);
  add(0, 'sk_rostrum', 'parasphenoid rostrum', 'skel', BONE2, [T([[-5.0, 2.15, 0], [-4.2, 2.15, 0]], 0.03)], 'A midline bar under the braincase on which the palatines and pterygoids slide.', S);
  add(0, 'sk_basitemp', 'basitemporal plate', 'skel', BONE, [E([-4.15, 2.2, 0], [0.15, 0.04, 0.2])], 'The broad floor of the back of the skull.', S);
  add(0, 'sk_meatus', 'external acoustic meatus', 'skel', DARK, [M(E([-4.2, 2.05, 0.56], [0.06, 0.06, 0.03]))], 'The ear opening in the skull, behind and below the eye.', S);
  add(0, 'mn_dentary', 'dentary', 'skel', BONE, [M(T([[-8.6, 2.3, 0.02], [-8.0, 2.3, 0.14]], [0.04, 0.05]))], 'The front bone of the lower jaw, sheathed in horn. The lower jaw has been lifted off and laid in front.');
  add(0, 'mn_surang', 'surangular', 'skel', BONE2, [M(T([[-8.0, 2.3, 0.14], [-7.3, 2.3, 0.4]], [0.05, 0.06]))], 'The upper bone of the back half of the lower jaw.');
  add(0, 'mn_angular', 'angular', 'skel', BONE3, [M(T([[-7.9, 2.4, 0.16], [-7.3, 2.4, 0.42]], 0.03))], 'The lower bone of the back half of the lower jaw.');
  add(0, 'mn_artic', 'articular', 'skel', BONE, [M(E([-7.15, 2.3, 0.45], [0.08, 0.06, 0.07]))], 'The bone that hinges on the quadrate. In mammals it has become the malleus of the middle ear.');
  add(0, 'mn_hyoid', 'hyoid apparatus', 'skel', BONE2, [T([[-8.3, 2.3, 0], [-7.7, 2.3, 0]], 0.025), M(T([[-7.7, 2.3, 0.02], [-7.2, 2.3, 0.25], [-6.95, 2.2, 0.3]], 0.018))], 'The skeleton of the tongue: a midline rod with two long horns that curve up round the back of the skull.');

  /* ================= plate 1: skeleton from above ================= */
  var NK = D.pts(11, function (i, f) { return [-3.68 + f * 1.08, 1.94 - f * 1.05 - Math.sin(f * Math.PI) * 0.12, 0]; });
  add(1, 'ax_atlas', 'atlas', 'skel', BONE3, [E([-3.88, 2.0, 0], [0.04, 0.06, 0.07])], 'A tiny ring that pivots on the single occipital condyle.', V);
  add(1, 'ax_axis', 'axis', 'skel', BONE2, [E([-3.78, 1.97, 0], [0.06, 0.07, 0.07])], 'The second neck vertebra, with a peg on which the atlas turns.', V);
  add(1, 'ax_cerv', 'cervical vertebrae', 'skel', BONE, NK.map(function (p) { return E(p, [0.06, 0.07, 0.08]); }), 'Twelve more neck vertebrae: fourteen in all. Saddle-shaped joints make the neck flexible enough to reach every feather with the beak.', V);
  add(1, 'ax_thor', 'thoracic vertebrae (notarium)', 'skel', BONE, D.row(5, function (i) { return E([-2.3 + i * 0.4, 0.75, 0], [0.19, 0.1, 0.12]); }), 'Five rib-bearing vertebrae, most of them fused into a rigid rod, the notarium. A stiff back is a firm base for the wings.', V);
  add(1, 'ax_synsac', 'synsacrum', 'skel', BONE2, [T([[-0.4, 0.72, 0], [1.2, 0.7, 0], [2.4, 0.78, 0]], [0.2, 0.24, 0.12], { sy: 0.5 })], 'About a dozen vertebrae of the lower back, hip and tail base fused into one bone and to the pelvis.', V);
  add(1, 'ax_caudal', 'free caudal vertebrae', 'skel', BONE, D.row(5, function (i) { return E([2.62 + i * 0.16, 0.84 + i * 0.03, 0], [0.07, 0.07, 0.11]); }), 'A few movable tail vertebrae that let the tail be raised, lowered and fanned.', V);
  add(1, 'ax_pygo', 'pygostyle', 'skel', BONE3, [T([[3.42, 0.98, 0], [3.78, 0.9, 0]], [0.1, 0.03], { sy: 1.6 })], 'The last tail vertebrae fused into a blade: the “parson’s nose”. The tail feathers fan out from it.', V);
  add(1, 'pg_scapula', 'scapula', 'skel', BONE, [M(T([[-2.15, 1.3, 1.2], [-1.2, 0.7, 0.75], [-0.2, 0.6, 0.7]], [0.06, 0.05, 0.02], { sy: 0.5 }))], 'A thin sabre-shaped blade lying along the ribs beside the spine.', V);
  add(1, 'wg_humerus', 'humerus', 'skel', BONE, [M(T([SH, EL], [0.11, 0.08])), M(E(SH, [0.13, 0.13, 0.13]))], 'The short, stout bone of the upper wing. It is hollow and contains an extension of an air sac.', LB);
  add(1, 'wg_dpcrest', 'deltopectoral crest', 'skel', BONE3, [M(E([-1.95, 1.05, 1.9], [0.06, 0.08, 0.18]))], 'The flange near the head of the humerus where the flight muscles insert.', V);
  add(1, 'wg_radius', 'radius', 'skel', BONE2, [M(T([[-2.25, 0.78, 3.12], [-0.92, 0.58, 4.55]], 0.035))], 'The thinner, straighter bone of the forearm, on the leading side.', LB);
  add(1, 'wg_ulna', 'ulna', 'skel', BONE, [M(T([[-2.35, 0.82, 3.05], [-0.85, 0.62, 4.65]], 0.055))], 'The thicker bone of the forearm. The secondary flight feathers attach along it, each at a small bump.', LB);
  add(1, 'wg_radiale', 'radiale', 'skel', BONE3, [M(E([-0.95, 0.58, 4.52], [0.05, 0.04, 0.05]))], 'One of only two free wrist bones, at the end of the radius.', V);
  add(1, 'wg_ulnare', 'ulnare', 'skel', BONE3, [M(E([-0.82, 0.62, 4.72], [0.06, 0.04, 0.05]))], 'The other free wrist bone, at the end of the ulna.', V);
  add(1, 'wg_cmc', 'carpometacarpus', 'skel', BONE, [M(T([[-0.85, 0.6, 4.65], [0.0, 0.55, 5.15]], [0.06, 0.05])), M(T([[-0.8, 0.6, 4.78], [0.05, 0.55, 5.28]], 0.02))], 'The remaining wrist bones and the hand bones fused into one. The primary flight feathers attach to it and to the finger.', LB);
  add(1, 'wg_alular', 'alular digit', 'skel', BONE2, [M(T([[-0.75, 0.6, 4.6], [-0.35, 0.6, 4.9]], [0.035, 0.01]))], 'The small first finger, the bird’s thumb. It carries the alula.', V);
  add(1, 'wg_major', 'major digit', 'skel', BONE, [M(T([[0.0, 0.55, 5.18], [0.45, 0.52, 5.42], [0.8, 0.5, 5.6]], [0.05, 0.04, 0.01]))], 'The main finger, of two bones, forming the tip of the wing skeleton.', V);
  add(1, 'wg_minor', 'minor digit', 'skel', BONE3, [M(T([[0.05, 0.55, 5.3], [0.25, 0.54, 5.42]], 0.02))], 'A single small bone, all that remains of the third finger.', V);
  add(1, 'pv_ilium', 'ilium', 'skel', BONE, [M(E([0.8, 0.6, 0.45], [1.3, 0.08, 0.4]))], 'A long thin plate fused to the synsacrum along its whole length, roofing the kidneys.', V);
  add(1, 'pv_ischium', 'ischium', 'skel', BONE2, [M(T([[1.6, 0.9, 0.85], [2.6, 1.0, 0.8]], [0.12, 0.05], { sy: 1.5 }))], 'The plate behind the hip socket, fused to the ilium.', V);
  add(1, 'pv_pubis', 'pubis', 'skel', BONE3, [M(T([[1.3, 1.15, 0.95], [2.3, 1.3, 0.95], [3.0, 1.35, 0.8]], 0.022))], 'A thin rod pointing backward. The two do not meet in the midline, which leaves room for an egg to pass.', V);
  add(1, 'pv_acetab', 'acetabulum', 'skel', DARK, [M(E([1.2, 1.0, 0.92], [0.08, 0.08, 0.04]))], 'The hip socket. In birds it is a hole right through the pelvis.', V);
  add(1, 'pv_ilioisch', 'ilioischiadic foramen', 'skel', DARK, [M(E([1.75, 0.88, 0.92], [0.14, 0.06, 0.03]))], 'An opening behind the hip socket through which the sciatic nerve and vessels leave for the leg.', V);
  add(1, 'lg_femur', 'femur', 'skel', BONE, [M(T([[1.2, 1.0, 0.95], [0.6, 1.5, 1.25]], [0.07, 0.06]))], 'The thigh bone. It points forward and is hidden inside the body feathers, so the “knee” you see on a standing bird is really its ankle.', LB);
  add(1, 'lg_patella', 'patella', 'skel', BONE3, [M(E([0.55, 1.56, 1.27], [0.04, 0.04, 0.04]))], 'The small kneecap.', V);
  add(1, 'lg_tibiotarsus', 'tibiotarsus', 'skel', BONE, [M(T([[0.6, 1.5, 1.25], [2.3, 1.1, 0.8]], [0.07, 0.045]))], 'The drumstick bone: the tibia fused with the upper ankle bones.', LB);
  add(1, 'lg_fibula', 'fibula', 'skel', BONE2, [M(T([[0.65, 1.45, 1.34], [1.6, 1.22, 1.05]], [0.03, 0.01]))], 'A thin splint beside the tibiotarsus that tapers away to nothing.', V);
  add(1, 'lg_mt1', 'metatarsal I', 'skel', BONE3, [M(E([3.4, 0.66, 1.42], [0.06, 0.03, 0.04]))], 'A small separate bone at the base of the hind toe.', V);

  /* ================= plate 2: skeleton from below ================= */
  add(2, 'st_ribs', 'sternal ribs', 'skel', BONE2, D.row(5, function (i) { var x = -1.6 + i * 0.5; return M(T([surf(x, 66, 0.93), surf(x - 0.25, 61, 0.9)], 0.03)); }), 'The lower, bony segments of the ribs that join the vertebral ribs to the breastbone. In mammals this part is cartilage.');
  add(2, 'st_manub', 'manubrium (rostrum of the sternum)', 'skel', BONE3, [T([[-2.35, 2.42, 0], [-2.05, 2.5, 0]], 0.05)], 'A small spike at the front of the breastbone, between the two coracoids.');
  add(2, 'st_notch', 'sternal notches', 'skel', 0x3a3a44, [M(E(surf(1.6, 40, 0.905), [0.3, 0.02, 0.14]))], 'Gaps in the rear edge of the breastbone, closed in life by membrane.', { a: 0.6 });
  add(2, 'st_triosseal', 'triosseal canal', 'skel', 0xfaf4e2, [M(O([-2.18, 1.55, 1.3], 0.07, 0.025))], 'A hole where coracoid, scapula and furcula meet. The tendon of the supracoracoideus runs up through it like a rope over a pulley to raise the wing.');
  add(2, 'st_glenoid', 'glenoid cavity', 'skel', DARK, [M(E([-1.95, 1.3, 1.42], [0.07, 0.07, 0.05]))], 'The shoulder socket, formed by the coracoid and the scapula.');
  add(2, 'st_hypocl', 'hypocleidium', 'skel', BONE3, [E([-2.25, 2.6, 0], [0.05, 0.06, 0.03])], 'The small plate where the two halves of the wishbone join.');

  /* ================= plate 3: muscles ================= */
  add(3, 'mu_ctx', 'trunk, skinned', 'musc', 0x9a4a44, [body(0, 6, null, 0.95)], '', { x: 1, dull: 1 });
  add(3, 'mu_propat', 'propatagium', 'ext', 0xd9b8a8, [M(F([SH, EL, WR]))], 'The triangular fold of skin stretched between shoulder and wrist. It forms the leading edge of the wing’s aerofoil.', { a: 0.6 });
  add(3, 'mu_patagial', 'tendon of the tensor propatagialis', 'musc', K.white, [M(T([[-1.95, 1.2, 1.5], [-1.6, 0.7, 4.3], [-0.95, 0.6, 4.55]], 0.02))], 'An elastic tendon in the free edge of the propatagium. It keeps the leading edge taut whatever the angle of the elbow.');
  add(3, 'mu_biceps', 'biceps brachii', 'musc', 0x8a2e2e, [M(T([[-1.97, 1.35, 1.6], [-2.22, 1.1, 2.4], [-2.4, 0.95, 3.05]], [0.08, 0.13, 0.05]))], 'On the front of the humerus. It folds the wing by bending the elbow.');
  add(3, 'mu_triceps', 'triceps brachii', 'musc', 0xa33a36, [M(T([[-1.6, 1.05, 1.6], [-1.88, 0.78, 2.4], [-2.18, 0.72, 3.1]], [0.08, 0.12, 0.05]))], 'On the back of the humerus. It opens the wing by straightening the elbow.');
  add(3, 'mu_deltoid', 'deltoid major', 'musc', 0x8a2e2e, [M(T([[-1.9, 0.95, 1.45], [-2.1, 0.85, 2.2]], [0.12, 0.06]))], 'Over the shoulder, from the scapula to the humerus. It helps raise the wing.');
  add(3, 'mu_emr', 'extensor metacarpi radialis', 'musc', 0xa33a36, [M(T([[-2.38, 0.8, 3.1], [-1.85, 0.68, 3.9], [-0.98, 0.58, 4.5]], [0.07, 0.1, 0.03]))], 'Along the leading edge of the forearm. It straightens the wrist, spreading the primaries.');
  add(3, 'mu_fcu', 'flexor carpi ulnaris', 'musc', 0x8a2e2e, [M(T([[-2.2, 0.9, 3.15], [-1.5, 0.75, 3.95], [-0.8, 0.64, 4.7]], [0.07, 0.1, 0.03]))], 'Along the trailing edge of the forearm. It folds the hand back against the forearm.');
  add(3, 'mu_pronator', 'pronator muscles', 'musc', 0xb8504a, [M(T([[-2.25, 0.95, 3.1], [-1.7, 0.82, 3.7]], [0.06, 0.04]))], 'Two short muscles crossing the inside of the elbow. They twist the leading edge down on the downstroke.');
  add(3, 'mu_sartorius', 'iliotibialis cranialis (sartorius)', 'musc', 0xa33a36, [M(T([[0.3, 0.9, 0.95], [0.4, 1.4, 1.3]], [0.12, 0.07]))], 'The strap on the front edge of the thigh. It swings the leg forward.');
  add(3, 'mu_iliotib', 'iliotibialis lateralis', 'musc', 0x8a2e2e, [M(T([[1.2, 0.8, 1.05], [0.7, 1.4, 1.35]], [0.3, 0.12], { sy: 0.4 }))], 'A broad sheet covering the outside of the thigh.');
  add(3, 'mu_femtib', 'femorotibialis', 'musc', 0xb8504a, [M(T([[1.15, 1.05, 1.0], [0.65, 1.5, 1.3]], [0.12, 0.1]))], 'Wraps the femur under the iliotibialis. It straightens the knee, as the quadriceps does in mammals.');
  add(3, 'mu_flexcr', 'flexor cruris (semitendinosus)', 'musc', 0xa33a36, [M(T([[2.3, 1.0, 0.9], [1.3, 1.35, 1.15]], [0.14, 0.1]))], 'From the rear of the pelvis to the back of the knee. It bends the knee and pulls the leg back.');
  add(3, 'mu_gastroc', 'gastrocnemius', 'musc', 0x8a2e2e, [M(T([[0.75, 1.55, 1.2], [1.5, 1.4, 1.0], [2.3, 1.12, 0.8]], [0.1, 0.2, 0.04]))], 'The bulk of the drumstick. It straightens the ankle for take-off and perching.');
  add(3, 'mu_peroneus', 'peroneus (fibularis) longus', 'musc', 0xb8504a, [M(T([[0.7, 1.45, 1.38], [1.5, 1.3, 1.18], [2.3, 1.08, 0.86]], [0.07, 0.11, 0.03]))], 'On the outer front of the drumstick. Its tendon helps flex the toes.');
  add(3, 'mu_tibcran', 'tibialis cranialis', 'musc', 0xa33a36, [M(T([[0.65, 1.62, 1.25], [1.5, 1.5, 1.05], [2.25, 1.2, 0.82]], [0.05, 0.08, 0.03]))], 'On the front of the drumstick. It bends the ankle, raising the foot.');
  add(3, 'mu_longus', 'longus colli', 'musc', 0x8a2e2e, [T([[-3.9, 2.3, 0], [-3.3, 2.1, 0], [-2.8, 1.9, 0]], 0.1)], 'A long muscle on the underside of the neck vertebrae. It bends the neck downward.');
  add(3, 'mu_complexus', 'complexus (hatching muscle)', 'musc', 0xb8504a, [M(T([[-4.0, 1.5, 0.2], [-3.6, 1.5, 0.25]], [0.12, 0.1]))], 'On the back of the head. In the chick it swells with fluid before hatching and drives the egg tooth against the shell.');
  add(3, 'mu_biventer', 'biventer cervicis', 'musc', 0xa33a36, [M(T([[-4.0, 1.45, 0.08], [-3.4, 1.4, 0.08], [-2.8, 1.1, 0.1]], 0.05))], 'A slender two-bellied muscle along the back of the neck. It raises the head.');
  add(3, 'mu_addmand', 'adductor mandibulae', 'musc', 0x8a2e2e, [M(E([-4.45, 2.1, 0.5], [0.2, 0.12, 0.08]))], 'Below and behind the eye. It closes the beak.');
  add(3, 'mu_depmand', 'depressor mandibulae', 'musc', 0xb8504a, [M(E([-4.1, 2.05, 0.48], [0.1, 0.14, 0.08]))], 'Behind the ear, from the back of the skull to the rear tip of the jaw. It opens the beak.');
  add(3, 'mu_extobl', 'external abdominal oblique', 'musc', 0xa33a36, [body(3, 5, [30, 80], 1.0), body(3, 5, [280, 330], 1.0)], 'A thin sheet covering the sides of the belly behind the ribs.');
  add(3, 'mu_levcaud', 'levator caudae', 'musc', 0x8a2e2e, [M(T([[2.6, 0.75, 0.2], [3.5, 0.85, 0.2]], [0.14, 0.08]))], 'On top of the tail base. It raises the tail.');
  add(3, 'mu_depcaud', 'depressor caudae', 'musc', 0xb8504a, [M(T([[2.7, 1.45, 0.2], [3.5, 1.15, 0.2]], [0.14, 0.08]))], 'Under the tail base. It lowers the tail, the air brake for landing.');
  add(3, 'mu_sternotr', 'sternotrachealis', 'musc', 0xdc9484, [M(T([[-2.4, 1.6, 0.2], [-2.2, 2.0, 0.5]], 0.02))], 'A thread of muscle from the breastbone to the trachea just above the syrinx. It tunes the voice by changing the tension on the syrinx.');

  /* ================= plate 4: arteries and veins ================= */
  var AR = K.artery, AR2 = 0xd9564a, VE = K.vein, VE2 = 0x5673bd;
  add(4, 'ar_carotid', 'common carotid arteries', 'circ', AR, [M(T([[-2.5, 2.3, 0.5], [-2.9, 2.1, 0.15], [-3.6, 1.95, 0.08], [-4.1, 2.05, 0.1]], 0.04))], 'The two run side by side up the front of the neck, buried in a groove in the vertebrae where they cannot be pinched when the neck bends.');
  add(4, 'ar_subcl', 'subclavian artery', 'circ', AR2, [M(T([[-2.6, 2.0, 1.1], [-2.3, 1.6, 1.4]], 0.06))], 'The outer branch of each brachiocephalic artery, to the wing and the flight muscles.');
  add(4, 'ar_pectoral', 'pectoral artery', 'circ', AR, [M(T([[-2.3, 1.6, 1.4], [-1.5, 2.0, 1.2], [-0.4, 2.1, 1.1]], 0.05))], 'A very large artery to the flight muscles. It is far bigger than the artery to the wing itself.');
  add(4, 'ar_brachial', 'brachial artery', 'circ', AR2, [M(T([[-2.3, 1.6, 1.4], [-1.9, 1.25, 1.6], [-2.2, 0.95, 2.9]], 0.035))], 'The artery of the wing, running along the humerus.');
  add(4, 'ar_pulm', 'pulmonary arteries', 'circ', 0x7b5ea8, [M(T([[-1.9, 2.3, 0.1], [-1.6, 1.6, 0.5], [-1.2, 1.1, 0.7]], 0.06))], 'Carry oxygen-poor blood from the right ventricle to the lungs.');
  add(4, 'ar_aorta', 'dorsal aorta', 'circ', AR, [T([[-1.8, 1.2, 0.3], [-0.5, 0.9, 0.05], [1.5, 0.85, 0], [2.6, 0.9, 0]], 0.07)], 'The continuation of the aortic arch back along the underside of the spine.');
  add(4, 'ar_coeliac', 'coeliac artery', 'circ', AR2, [T([[-0.3, 0.9, 0.05], [0, 1.3, -0.2], [0.5, 1.6, -0.4]], 0.04)], 'To the stomach, gizzard, liver and spleen.');
  add(4, 'ar_cranmes', 'cranial mesenteric artery', 'circ', AR, [T([[0.2, 0.88, 0], [0.6, 1.3, 0.3], [1.0, 1.6, 0.5]], 0.04)], 'To the small intestine and pancreas.');
  add(4, 'ar_renal', 'renal arteries', 'circ', AR2, D.row(3, function (i) { return M(T([[0.9 + i * 0.65, 0.85, 0.03], [0.9 + i * 0.65, 0.75, 0.3]], 0.018)); }), 'Three pairs, one to each of the three lobes of the kidney.');
  add(4, 'ar_femoral', 'external iliac (femoral) artery', 'circ', AR, [M(T([[1.0, 0.85, 0.03], [1.15, 0.9, 0.6], [1.0, 1.1, 1.0]], 0.03))], 'A small artery to the front of the thigh.');
  add(4, 'ar_ischiadic', 'ischiadic artery', 'circ', AR2, [M(T([[1.7, 0.85, 0.03], [1.8, 0.9, 0.7], [1.5, 1.2, 1.1]], 0.04))], 'The main artery of the leg. It passes between the kidney lobes and out through the ilioischiadic foramen.');
  add(4, 'ar_caudmes', 'caudal mesenteric artery', 'circ', AR, [T([[2.4, 0.9, 0], [2.7, 1.2, 0]], 0.02)], 'To the large intestine and cloaca.');
  add(4, 'ar_caudal', 'caudal artery', 'circ', AR2, [T([[2.6, 0.9, 0], [3.4, 1.0, 0]], 0.025)], 'The end of the aorta, running into the tail.');
  add(4, 've_jugular', 'jugular veins', 'circ', VE, [M(T([[-4.1, 1.95, 0.3], [-3.5, 1.85, 0.35], [-2.8, 2.0, 0.6], [-2.45, 2.2, 0.55]], 0.05))], 'One on each side of the neck. The right is much the larger and is the usual place to draw blood from a small bird.');
  add(4, 've_cranvc', 'cranial venae cavae', 'circ', VE2, [M(T([[-2.45, 2.2, 0.55], [-2.15, 2.25, 0.4]], 0.07))], 'Birds keep two, left and right, each formed by a jugular, a subclavian and a pectoral vein.');
  add(4, 've_caudvc', 'caudal vena cava', 'circ', VE, [T([[-1.9, 2.15, 0.3], [-1.0, 1.7, 0.4], [0, 1.2, 0.2], [0.8, 0.95, 0.1]], 0.08)], 'Returns blood from the hind body, passing through the right lobe of the liver.');
  add(4, 've_pectoral', 'pectoral vein', 'circ', VE2, [M(T([[-0.4, 2.15, 1.2], [-1.5, 2.05, 1.3], [-2.4, 2.1, 0.9]], 0.05))], 'A large vein draining the flight muscles.');
  add(4, 've_brachial', 'brachial (basilic) vein', 'circ', VE, [M(T([[-2.2, 1.0, 2.95], [-1.9, 1.3, 1.7], [-2.4, 2.0, 1.0]], 0.035))], 'The vein of the upper wing.');
  add(4, 've_ulnar', 'cutaneous ulnar vein', 'circ', VE2, [M(T([[-0.9, 0.66, 4.5], [-1.6, 0.8, 3.7], [-2.2, 1.0, 2.95]], 0.022))], 'Crosses the inside of the elbow just under the bare skin. Vets and banders take blood samples here.');
  add(4, 've_hepatic', 'hepatic veins', 'circ', VE, [T([[-0.6, 1.9, 0.5], [-1.0, 1.75, 0.42]], 0.05)], 'Short veins from the liver into the caudal vena cava.');
  add(4, 've_hportal', 'hepatic portal vein', 'circ', 0x34508f, [T([[0.8, 1.6, 0.3], [0.2, 1.8, 0.5], [-0.3, 1.95, 0.6]], 0.045)], 'Carries blood from the gut to the liver.');
  add(4, 've_coccmes', 'coccygeomesenteric vein', 'circ', 0x34508f, [T([[2.6, 1.0, 0], [2.0, 1.3, 0.1], [0.8, 1.6, 0.3]], 0.03)], 'A vein found only in birds, linking the veins of the tail and kidneys with the hepatic portal vein. Blood can flow either way in it.');
  add(4, 've_rportal', 'renal portal veins', 'circ', 0x34508f, [M(T([[2.5, 0.8, 0.35], [1.5, 0.62, 0.62], [0.8, 0.62, 0.6]], 0.025))], 'Bring blood from the legs and tail into the kidneys. A valve can divert this blood past the kidney when the bird is active.');
  add(4, 've_femoral', 'femoral (external iliac) vein', 'circ', VE, [M(T([[1.0, 1.15, 1.0], [1.15, 0.95, 0.6], [0.9, 0.95, 0.15]], 0.035))], 'The main vein of the leg.');
  add(4, 've_comiliac', 'common iliac veins', 'circ', VE2, [M(T([[0.95, 0.95, 0.35], [0.8, 0.95, 0.12]], 0.05))], 'A short wide vein on each side; the two join to form the caudal vena cava.');
  add(4, 've_pulm', 'pulmonary veins', 'circ', 0xc2362b, [M(T([[-1.2, 1.15, 0.6], [-1.7, 1.7, 0.3], [-1.95, 2.2, -0.05]], 0.045))], 'Return oxygenated blood from the lungs to the left atrium.');

  /* ================= plate 5: nervous system and sense organs ================= */
  var NV = K.nerve, NV2 = 0xe6dc9c, NV3 = 0xfaf6d6;
  add(5, 'ne_pineal', 'pineal body', 'nerv', 0xb98a7a, [E([-4.42, 1.55, 0], [0.035, 0.03, 0.035])], 'A small gland between the cerebrum and the cerebellum. In birds it senses light through the skull and keeps the daily clock.');
  add(5, 'ne_opticn', 'optic nerve', 'nerv', NV, [M(T([[-4.6, 1.95, 0.2], [-4.7, 1.98, 0.42]], 0.035))], 'Very thick: about a million fibres from each eye, more than twice a human’s for its size.');
  add(5, 'ne_chiasma', 'optic chiasma', 'nerv', NV3, [E([-4.6, 2.02, 0], [0.06, 0.04, 0.2])], 'Under the brain, where the two optic nerves cross completely.');
  add(5, 'ne_cord', 'spinal cord', 'nerv', NV, [T([[-3.8, 1.85, 0], [-3.3, 1.6, 0], [-2.6, 0.9, 0], [-1, 0.75, 0], [1.8, 0.75, 0]], 0.045)], 'Runs the whole length of the spine. Unlike a mammal’s it reaches right to the tail.');
  add(5, 'ne_brenl', 'cervical (brachial) enlargement', 'nerv', NV3, [E([-2.3, 0.8, 0], [0.22, 0.07, 0.09])], 'A swelling of the cord where the nerves of the wings arise.');
  add(5, 'ne_lsenl', 'lumbosacral enlargement', 'nerv', NV3, [E([0.9, 0.74, 0], [0.3, 0.075, 0.11])], 'A swelling of the cord where the nerves of the legs arise.');
  add(5, 'ne_glycogen', 'glycogen body', 'nerv', 0xf2d9a8, [E([0.95, 0.66, 0], [0.14, 0.04, 0.06])], 'A jelly-like mass of glycogen-filled cells in a hollow on top of the lumbosacral cord. Only birds have one; its job is still debated.');
  add(5, 'ne_brplex', 'brachial plexus', 'nerv', NV3, [M(E([-2.0, 1.0, 0.9], [0.12, 0.04, 0.16]))].concat(D.row(3, function (i) { return M(T([[-2.5 + i * 0.2, 0.82, 0.06], [-2.1 + i * 0.08, 0.98, 0.78]], 0.02)); })), 'Four or five spinal nerves joining at the shoulder to form the nerves of the wing.');
  add(5, 'ne_wingn', 'nerves of the wing', 'nerv', NV, [M(T([[-1.95, 1.05, 1.0], [-1.85, 1.15, 1.6], [-2.2, 0.9, 2.9]], 0.022))], 'Two cords from the brachial plexus running down the humerus, one to the muscles that open the wing and one to those that fold it.');
  add(5, 'ne_lsplex', 'lumbosacral plexus', 'nerv', NV3, [M(E([1.2, 0.8, 0.5], [0.25, 0.04, 0.12]))], 'A web of nerves buried in the kidney, formed by the spinal nerves of the synsacrum.');
  add(5, 'ne_sciatic', 'sciatic (ischiadic) nerve', 'nerv', NV, [M(T([[1.4, 0.82, 0.6], [1.6, 1.0, 0.95], [1.0, 1.4, 1.2]], 0.035))], 'The large nerve of the leg, leaving the pelvis through the ilioischiadic foramen.');
  add(5, 'ne_femoral', 'femoral nerve', 'nerv', NV2, [M(T([[0.9, 0.8, 0.5], [0.8, 1.1, 1.0]], 0.02))], 'A smaller nerve to the muscles of the front of the thigh.');
  add(5, 'ne_vagus', 'vagus nerve', 'nerv', NV2, [M(T([[-4.0, 1.95, 0.25], [-3.4, 1.8, 0.3], [-2.7, 1.9, 0.5], [-2.0, 1.9, 0.5]], 0.018))], 'Runs down the neck beside the jugular vein to the heart, lungs, crop and stomach.');
  add(5, 'er_colum', 'columella', 'nerv', BONE3, [M(T([[-4.2, 2.05, 0.5], [-4.25, 2.0, 0.34]], 0.012))], 'The single ear bone of a bird, a fine rod from the eardrum to the inner ear. Mammals have three.');
  add(5, 'er_canals', 'semicircular canals', 'nerv', 0xdbe7ee, [M(O([-4.2, 1.85, 0.32], 0.08, 0.014, [90, 0, 0])), M(O([-4.2, 1.85, 0.32], 0.075, 0.014)), M(O([-4.2, 1.85, 0.32], 0.07, 0.014, [0, 90, 0]))], 'Three loops at right angles, large in a bird for its size: the balance organ that makes flight possible.');
  add(5, 'er_cochlea', 'cochlear duct (lagena)', 'nerv', 0xc9dae2, [M(T([[-4.25, 2.0, 0.32], [-4.32, 2.15, 0.22]], 0.02))], 'The hearing organ: a short, slightly curved tube, not coiled like a mammal’s.');
  /* an eye cut in half, enlarged, laid beside the head */
  var EX = -4.6, EY = 1.0, EZ = 2.4;
  add(5, 'ey_sclera', 'sclera', 'nerv', 0xf4f0e6, [H([EX, EY, EZ], [0.62, 0.62, 0.5], [90, 0, 0], { th: 110 })], 'The tough white outer coat of the eyeball, here cut in half and enlarged. A bird’s eye is flattened, not round.');
  add(5, 'ey_retina', 'retina', 'nerv', 0xd9a441, [H([EX, EY, EZ], [0.56, 0.56, 0.44], [90, 0, 0], { th: 95 })], 'The light-sensitive lining. It is thick and has no blood vessels of its own, which is part of why a bird sees so sharply.');
  add(5, 'ey_cornea', 'cornea', 'nerv', 0xcfe2e8, [H([EX, EY - 0.42, EZ], [0.3, 0.3, 0.2], [-90, 0, 0], { th: 70 })], 'The clear window at the front of the eye.', { a: 0.5 });
  add(5, 'ey_iris', 'iris', 'nerv', 0xd9682a, [O([EX, EY - 0.4, EZ], 0.2, 0.05, [90, 0, 0])], 'The coloured ring, orange-red in a pigeon. Its muscle is striated, so a bird can change its pupil at will.');
  add(5, 'ey_lens', 'lens', 'nerv', 0xeef4f6, [E([EX, EY - 0.26, EZ], [0.2, 0.13, 0.2])], 'Soft and flexible. Muscles squeeze it to change focus very quickly.', { a: 0.8 });
  add(5, 'ey_pecten', 'pecten', 'nerv', 0x2a2420, D.row(5, function (i) { return T([[EX - 0.12 + i * 0.06, EY + 0.3, EZ + 0.1], [EX - 0.1 + i * 0.05, EY - 0.02, EZ + 0.05 + (i % 2 ? 0.05 : -0.03)]], 0.02); }), 'A black, pleated, blood-rich comb standing up from the back of the eye into the jelly. Found only in birds, it nourishes the retina.');

  /* ================= plate 6: feather types and fine structure ================= */
  var FY = 0.12;
  function feather(x, len, w, col) { return [T([[x, FY, -len / 2], [x, FY, len / 2]], [0.03, 0.008]), F([[x, FY, -len / 2 + len * 0.2], [x - w, FY, -len / 2 + len * 0.45], [x - w * 0.8, FY, len / 2 - 0.1], [x, FY, len / 2], [x + w * 0.8, FY, len / 2 - 0.1], [x + w, FY, -len / 2 + len * 0.45]], { c: col })]; }
  add(6, 'ft_contour', 'contour feather', 'ext', 0x7c8794, feather(-4.2, 3.4, 0.6), '', { x: 1 });
  add(6, 'ft_after', 'aftershaft', 'ext', 0xcfd6dc, [T([[-4.2, FY + 0.03, -1.0], [-3.95, FY + 0.03, -0.3]], [0.015, 0.005]), F([[-4.2, FY + 0.02, -1.0], [-4.05, FY + 0.02, -0.5], [-3.9, FY + 0.02, -0.25], [-3.95, FY + 0.02, -0.75]])], 'A small second feather growing from the base of a contour feather, on its underside. It adds insulation.');
  add(6, 'ft_supumb', 'superior umbilicus', 'ext', 0x2a2420, [E([-4.2, FY + 0.04, -1.02], [0.04, 0.03, 0.05])], 'A tiny pit on the shaft where the vane begins. It is the upper end of the hollow of the quill.');
  add(6, 'ft_infumb', 'inferior umbilicus', 'ext', 0x2a2420, [E([-4.2, FY + 0.01, -1.72], [0.04, 0.03, 0.04])], 'The hole in the very tip of the quill. While the feather grew, blood vessels entered here.');
  add(6, 'ft_down', 'down feather', 'ext', 0xe6e9ec, D.row(9, function (i) { var a = -1.2 + i * 0.3; return T([[-2.6, FY, -0.7], [-2.6 + Math.sin(a) * 0.7, FY + 0.05, -0.7 + Math.cos(a) * 0.9]], 0.012); }).concat([T([[-2.6, FY, -1.0], [-2.6, FY, -0.7]], 0.025)]), 'A feather with almost no shaft: a tuft of soft barbs with no hooks. Down lies under the contour feathers and traps air.');
  add(6, 'ft_semi', 'semiplume', 'ext', 0xd3d9de, [T([[-1.2, FY, -1.3], [-1.2, FY, 0.9]], [0.022, 0.006])].concat(D.row(8, function (i) { var z = -0.9 + i * 0.22; return [T([[-1.2, FY, z], [-1.2 - 0.5, FY + 0.03, z + 0.3]], 0.01), T([[-1.2, FY, z], [-1.2 + 0.5, FY + 0.03, z + 0.3]], 0.01)]; })), 'Halfway between down and a contour feather: a full shaft, but loose fluffy barbs.');
  add(6, 'ft_filo', 'filoplume', 'ext', 0xbfc6cc, [T([[0.0, FY, -1.3], [0.0, FY, 0.8]], 0.008)].concat(D.row(4, function (i) { return T([[0.0, FY, 0.8], [-0.12 + i * 0.08, FY, 1.0]], 0.006); })), 'A hair-like feather with a tuft at the tip, standing beside each contour feather. Nerve endings at its base report the position of the feathers.');
  add(6, 'ft_bristle', 'bristle', 'ext', 0x3a3a3a, [T([[1.0, FY, -1.0], [1.0, FY, 0.9]], [0.022, 0.004])].concat(D.row(3, function (i) { return T([[1.0, FY, -0.9 + i * 0.12], [1.0 + (i % 2 ? 0.14 : -0.14), FY, -0.8 + i * 0.12]], 0.006); })), 'A stiff bare shaft with a few barbs at the base. Bristles guard the nostrils and eyes.');
  add(6, 'ft_barbx', 'two barbs, greatly enlarged', 'ext', 0x8f99a5, [T([[2.4, FY, -1.6], [3.6, FY, 1.2]], 0.05), T([[3.3, FY, -1.9], [4.5, FY, 0.9]], 0.05)], '', { x: 1 });
  add(6, 'ft_barbules', 'barbules', 'ext', 0xbfc9d4, D.row(9, function (i) { var f = 0.1 + i * 0.1, x = 2.4 + f * 1.2, z = -1.6 + f * 2.8; return [T([[x, FY, z], [x + 0.5, FY + 0.02, z - 0.05]], 0.014), T([[x + 0.9, FY, z - 0.3], [x + 0.42, FY + 0.02, z - 0.1]], 0.014)]; }), 'Hundreds of tiny branches along both sides of every barb. Those of neighbouring barbs overlap.');
  add(6, 'ft_hooklets', 'hooklets (barbicels)', 'ext', 0xf0c64c, D.row(9, function (i) { var f = 0.1 + i * 0.1, x = 2.4 + f * 1.2, z = -1.6 + f * 2.8; return [E([x + 0.47, FY + 0.03, z - 0.08], [0.035, 0.014, 0.035]), O([x + 0.47, FY + 0.03, z - 0.08], 0.035, 0.012, [90, 0, 0])]; }), 'Microscopic hooks on one set of barbules that catch on the next barb’s barbules, zipping the vane into one sheet. Preening re-zips them.');
  add(6, 'ft_skin', 'patch of plucked skin', 'ext', 0xe3b9a8, [E([-1.5, 0.06, 3.0], [2.6, 0.04, 0.9])], '', { x: 1, dull: 1 });
  add(6, 'ft_pteryla', 'pteryla (feather tract)', 'ext', 0xb98a7a, D.row(14, function (i) { return E([-3.4 + (i % 7) * 0.3, 0.1, 2.7 + (i > 6 ? 0.35 : 0)], [0.05, 0.03, 0.05]); }), 'A band of skin from which feathers grow, seen as rows of pits once the bird is plucked.');
  add(6, 'ft_apterium', 'apterium', 'ext', 0xf0d0c2, [E([-0.2, 0.1, 3.0], [0.9, 0.02, 0.6])], 'A bare strip of skin between feather tracts. The feathers of the tracts on either side spread to cover it.');
  add(6, 'ft_follicle', 'feather follicle', 'ext', 0x8a5a4e, [O([-3.4, 0.12, 2.7], 0.07, 0.02, [90, 0, 0])], 'The pit in the skin in which a feather is rooted. A new feather grows from its base and pushes the old one out at the moult.');

  /* ================= plate 7: glands and small organs ================= */
  add(7, 'gl_thyroid', 'thyroid glands', 'endo', K.thyroid, [M(E([-2.55, 1.75, 0.45], [0.07, 0.05, 0.05]))], 'A small dark-red oval on each side at the base of the neck, against the carotid artery. Their hormone controls metabolism and the moult.');
  add(7, 'gl_parathy', 'parathyroid glands', 'endo', 0xf0c64c, [M(E([-2.46, 1.72, 0.5], [0.03, 0.03, 0.03]))], 'Tiny yellowish dots just behind each thyroid. They control blood calcium, which matters greatly to a bird making eggshell.');
  add(7, 'gl_thymus', 'thymus', 'endo', K.thymus, D.row(4, function (i) { return M(E([-3.9 + i * 0.3, 1.9, 0.45], [0.1, 0.05, 0.06])); }), 'A chain of pale lobes along each side of the neck. Large in a young bird, it shrinks with age.');
  add(7, 'gl_cervsac', 'cervical air sacs', 'resp', 0xdfeaf0, [M(E([-2.75, 1.35, 0.35], [0.2, 0.12, 0.14]))], 'A small pair at the base of the neck, completing the set of nine air sacs.', { a: 0.5 });
  add(7, 'gl_bursa', 'bursa of Fabricius', 'endo', 0xe8b7c8, [E([3.3, 1.25, 0], [0.14, 0.12, 0.12])], 'A round pouch on the dorsal wall of the cloaca in young birds. B lymphocytes, the antibody-making cells, are named after it.');
  add(7, 'gl_bile', 'bile ducts', 'dig', K.gall, [T([[-0.1, 1.9, 0.3], [0.5, 1.75, 0.2], [1.0, 1.7, 0.1]], 0.02)], 'Two fine ducts straight from the liver to the far end of the duodenal loop. A pigeon has no gallbladder.');
  add(7, 'gl_pancduct', 'pancreatic ducts', 'dig', K.pancreas, [T([[1.0, 1.9, 0.3], [1.2, 1.75, 0.35]], 0.015)], 'Three small ducts from the pancreas into the duodenum beside the bile ducts.');
  add(7, 'gl_koilin', 'koilin lining of the gizzard', 'dig', 0xc9b84a, [E([0.9, 2.42, -0.55], [0.35, 0.05, 0.4])], 'Cut the gizzard open: it is lined with a tough, yellow-green, horny sheet that grinds seed against swallowed grit.');
  add(7, 'gl_meckel', 'Meckel’s diverticulum', 'dig', 0xf2e6b4, [E([1.9, 2.0, 0.55], [0.05, 0.05, 0.05])], 'A tiny blind stub on the small intestine: the remains of the stalk that joined the embryo to its yolk.');
  var OV = [[0.2, 1.2, -0.6], [0.8, 1.35, -0.85], [1.5, 1.4, -0.85], [2.1, 1.45, -0.7], [2.6, 1.5, -0.45], [3.05, 1.55, -0.2]];
  add(7, 'ov_infund', 'infundibulum', 'repro', 0xf0cfc2, [T([[OV[0][0] - 0.15, 1.2, -0.45], OV[0], OV[1]], [0.22, 0.12, 0.07])], 'The funnel that catches the yolk as it leaves the ovary. Fertilisation happens here.', { sex: 'f' });
  add(7, 'ov_magnum', 'magnum', 'repro', 0xe9bcae, [T([OV[1], OV[2]], 0.1)], 'The longest part of the oviduct. Its glands lay the egg white round the yolk.', { sex: 'f' });
  add(7, 'ov_isthmus', 'isthmus', 'repro', 0xd9a898, [T([OV[2], OV[3]], 0.075)], 'A narrower stretch where the two shell membranes are added.', { sex: 'f' });
  add(7, 'ov_shell', 'shell gland (uterus)', 'repro', 0xc98f80, [T([OV[3], OV[4]], [0.1, 0.16])], 'A thick-walled pouch where the egg sits for most of a day while the chalky shell is laid down.', { sex: 'f' });
  add(7, 'ov_vagina', 'vagina', 'repro', 0xb97a68, [T([OV[4], OV[5]], 0.08)], 'The short muscular last part that pushes the finished egg into the cloaca.', { sex: 'f' });

  return {
    steps: [
      { t: 'Skeleton: the skull', flip: true, view: { t: [-5.8, 1.3, 0], d: 8, ph: 0.35 },
        how: D.ol(['Use a cleaned skull. Bird bone is thin and full of air spaces: handle it by the braincase.', 'Note what is missing compared with a mammal: no teeth, and only <b>one occipital condyle</b>.', 'Find the three slender rods on each side that link the <b>quadrate</b> to the upper beak. Push a quadrate forward and the beak lifts.', 'The lower jaw and the tongue bones have been set in front.']) },
      { t: 'Skeleton: from above', flip: true, view: { t: [-0.4, 2.2, 0], d: 17, ph: 0.3 },
        how: D.ol(['Notice how much is fused: the back, the hips, the hand, the lower leg. Fusion gives stiffness without weight.', 'Follow the wing: <b>humerus</b>, <b>radius</b> and <b>ulna</b>, two wrist bones, then the fused hand and three reduced fingers.', 'Follow the leg: <b>femur</b>, <b>tibiotarsus</b>, <b>tarsometatarsus</b>, toes.']) },
      { t: 'Skeleton: from below', view: { t: [-0.4, 1.6, 0], d: 17, ph: 0.3 },
        how: D.ol(['The <b>sternum</b> with its deep <b>keel</b> dominates the underside.', 'Each shoulder is braced by a tripod: <b>coracoid</b>, <b>scapula</b> and half of the <b>furcula</b>.', 'Find the <b>triosseal canal</b> where the three meet.']) },
      { t: 'Muscles: wing, leg, neck and tail', view: { t: [-0.4, 1.6, 0.8], d: 16, ph: 0.3 },
        how: D.ol(['Pluck and skin one wing and one leg.', 'Wing muscles are bunched near the body; long tendons work the far joints, keeping the wingtip light.', 'Pull on the tendon of the <b>extensor metacarpi radialis</b> and watch the hand open.', 'In the leg, note that the drumstick is all muscle but the lower leg is only tendon and bone.']) },
      { t: 'Arteries and veins', view: { t: [-0.6, 1.6, 0.6], d: 14, ph: 0.25 },
        how: D.ol(['Move the heart gently to one side to follow each vessel.', 'A bird’s aorta arches to the <b>right</b>; a mammal’s arches to the left.', 'The vessels to the flight muscles are larger than those to the wing itself.', 'Find the <b>cutaneous ulnar vein</b> on the underside of the elbow.']) },
      { t: 'Nerves, eye and ear', flip: true, view: { t: [-1.6, 2.0, -0.8], d: 14, ph: 0.3 },
        how: D.ol(['Chip away the roof of the synsacrum to find the <b>glycogen body</b> sitting in the spinal cord.', 'Trace the nerves from the two enlargements of the cord out to the wing and the leg.', 'Remove an eye and cut it in half from front to back with a sharp blade (shown enlarged beside the head). Look for the black <b>pecten</b>.']) },
      { t: 'Feather types and fine structure', view: { t: [-0.4, 0.3, 0.7], d: 15, ph: 0.25 },
        how: D.ol(['Pluck one feather of each kind and lay them side by side.', 'Find the <b>aftershaft</b> at the base of a body feather.', 'Under a dissecting microscope, pull two barbs apart and watch the <b>hooklets</b> let go, then stroke them together again.', 'On the plucked skin, note that feathers grow only in tracts.']) },
      { t: 'Glands and small organs', view: { t: [0.2, 1.7, 0], d: 11, ph: 0.3 },
        how: D.ol(['Several small organs are easy to miss. Look for them before you remove the gut.', 'At the base of the neck: <b>thyroid</b> and <b>parathyroid</b> on each carotid artery.', 'In a young bird: the <b>thymus</b> along the neck and the <b>bursa of Fabricius</b> above the cloaca.', 'In a hen, follow the oviduct from funnel to cloaca: it has five regions.']) }
    ],
    parts: parts,
    show: {
      1: ['ribs', 'tarsus', 'toes'],
      2: ['ribs', 'tarsus', 'toes', 'sternum', 'keel', 'coracoid', 'furcula'],
      3: ['pectoralis', 'tarsus', 'toes', 'sk_frontal', 'sk_parietal', 'sk_premax', 'sk_squam'],
      4: ['lining', 'rventricle', 'lventricle', 'atria', 'aorticarch', 'brachioceph', 'lungs', 'kidney', 'trachea', 'liver_r'],
      5: ['skullfloor', 'cerebrum', 'optic', 'cerebel', 'medulla', 'olfb', 'ax_synsac'],
      7: ['lining', 'trachea', 'crop', 'gizzard', 'liver_r', 'liver_l', 'duodenum', 'pancreas', 'cloaca', 'kidney', 'ileum', 'ovary']
    }
  };
});
