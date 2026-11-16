/* Squid — atlas plates, laid out on the tray: arms, suckers, funnel and eye in
   detail; then vessels, nerves, brain and the smaller organs. */
DX.extend('squid', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, H = D.H, F = D.F, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.14, SK = 0xe6d2c8, SK2 = 0xd9b8a8;
  function ln(a, b, r, y) { return T([[a[0], y || Y, a[1]], [b[0], y || Y, b[1]]], r); }

  /* ================= plate 0: arms, suckers, funnel and eye ================= */
  /* one tentacle and one arm */
  add(0, 'ar_ctx', 'a tentacle (above) and an arm (below)', 'ext', SK, [T([[-8.0, 0.14, -2.6], [-3.2, 0.14, -2.6]], 0.07), T([[-8.0, 0.14, -1.3], [-4.0, 0.14, -1.3]], [0.16, 0.04])], '', { x: 1, dull: 1 });
  add(0, 'ar_club', 'tentacular club', 'ext', SK2, [T([[-3.2, 0.14, -2.6], [-2.4, 0.14, -2.6], [-1.7, 0.14, -2.6]], [0.08, 0.2, 0.04])].concat(D.row(8, function (i) { return O([-3.0 + i * 0.15, 0.22, -2.6 + (i % 2 ? 0.07 : -0.07)], 0.045, 0.014, [90, 0, 0]); })), 'The widened tip of each of the two long tentacles, the only part of a tentacle that carries suckers. The tentacles shoot out to seize prey.');
  add(0, 'ar_hecto', 'hectocotylus', 'repro', 0xc98f80, [T([[-5.2, 0.16, -1.3], [-4.0, 0.16, -1.3]], [0.09, 0.04])].concat(D.row(5, function (i) { return ln([-5.1 + i * 0.22, -1.38], [-5.1 + i * 0.22, -1.22], 0.02, 0.24); })), 'In a male, the tip of the left fourth arm has its suckers replaced by rows of small flaps. He uses it to hand packets of sperm to the female.', { sex: 'm' });
  /* one sucker, enlarged */
  var SX = -6.2, SZ = 1.2;
  add(0, 'sk_ctx', 'one sucker, enlarged', 'ext', SK, [H([SX, 0.45, SZ], [0.7, 0.45, 0.7], [180, 0, 0], { th: 90 })], '', { x: 1 });
  add(0, 'sk_stalk', 'stalk of the sucker', 'ext', SK2, [T([[SX, 0.05, SZ], [SX, 0.2, SZ]], 0.14)], 'The short muscular stem that joins a sucker to the arm. Octopus suckers have no stalk.');
  add(0, 'sk_ring', 'horny ring of the sucker', 'ext', 0x8a6a3a, [O([SX, 0.46, SZ], 0.6, 0.06, [90, 0, 0])].concat(D.row(12, function (i) { var a = i / 12 * Math.PI * 2; return T([[SX + Math.cos(a) * 0.6, 0.46, SZ + Math.sin(a) * 0.6], [SX + Math.cos(a) * 0.5, 0.6, SZ + Math.sin(a) * 0.5]], [0.04, 0.008]); })), 'A hard brown ring of chitin lining the rim of every sucker, edged with sharp teeth that dig into slippery prey.');
  add(0, 'sk_piston', 'floor (piston) of the sucker', 'ext', 0xb98f80, [E([SX, 0.26, SZ], [0.42, 0.06, 0.42])], 'The muscular floor of the cup. Pulled back like a piston, it lowers the pressure inside and makes the sucker hold.');
  /* the mouth region */
  add(0, 'mo_buccal', 'buccal membrane', 'dig', 0xe9c4b8, [O([-3.0, 0.14, 1.2], 0.55, 0.12, [90, 0, 0])].concat(D.row(7, function (i) { var a = i / 7 * Math.PI * 2; return T([[-3.0 + Math.cos(a) * 0.6, 0.14, 1.2 + Math.sin(a) * 0.6], [-3.0 + Math.cos(a) * 0.95, 0.14, 1.2 + Math.sin(a) * 0.95]], [0.07, 0.02]); })), 'A frilled ring of skin with seven points round the mouth, inside the circle of arms. In a mated female, sperm packets are stored in a pocket on it.');
  /* the funnel and the locking cartilages */
  var FX = 0.6, FZ = -1.8;
  add(0, 'fn_ctx', 'funnel, slit open, and the edge of the mantle', 'ext', SK, [E([FX, 0.1, FZ], [1.0, 0.05, 0.75]), ln([FX - 1.6, FZ + 1.3], [FX + 1.6, FZ + 1.3], 0.08)], '', { x: 1, dull: 1 });
  add(0, 'fn_valve', 'funnel valve', 'ext', 0xd9a898, [E([FX - 0.5, 0.18, FZ], [0.22, 0.04, 0.3])], 'A flap inside the funnel near its tip. It lets water out but stops it being drawn back in when the mantle expands.');
  add(0, 'fn_organ', 'funnel organ', 'ext', 0xf0d6c8, [E([FX + 0.25, 0.18, FZ - 0.2], [0.3, 0.03, 0.14]), E([FX + 0.25, 0.18, FZ + 0.2], [0.3, 0.03, 0.14])], 'Pale glandular pads on the inner wall of the funnel. Their mucus keeps the jet passage clean.');
  add(0, 'fn_flock', 'funnel-locking cartilage', 'skel', K.cart, [E([FX - 1.0, 0.2, FZ + 0.95], [0.3, 0.05, 0.1]), E([FX + 1.0, 0.2, FZ + 0.95], [0.3, 0.05, 0.1])], 'A grooved cartilage on each side of the base of the funnel.');
  add(0, 'fn_mlock', 'mantle-locking cartilage', 'skel', 0xb9d2da, [E([FX - 1.0, 0.2, FZ + 1.32], [0.3, 0.06, 0.06]), E([FX + 1.0, 0.2, FZ + 1.32], [0.3, 0.06, 0.06])], 'A ridge on the inside of the mantle edge that snaps into the groove on the funnel, like a press-stud. It seals the mantle so that all the water must leave by the funnel.');
  add(0, 'fn_nuchal', 'nuchal cartilage', 'skel', K.cart, [E([FX, 0.2, FZ - 1.2], [0.5, 0.05, 0.14])], 'A third locking cartilage, on the back of the neck, fastening the head to the mantle on the upper side.');
  /* an eye cut in half */
  var EX = 0.8, EY = 0.7, EZ = 1.6;
  add(0, 'ey_ctx', 'an eye cut in half', 'nerv', 0xf4f0e6, [H([EX, EY, EZ], [0.72, 0.7, 0.72], null, { th: 100 })], '', { x: 1 });
  add(0, 'ey_retina', 'retina', 'nerv', 0x3a2a3a, [H([EX, EY, EZ], [0.64, 0.62, 0.64], null, { th: 88 })], 'The dark light-sensitive lining. Its sensing cells point toward the light, so a squid’s eye, unlike ours, has no blind spot.');
  add(0, 'ey_iris', 'iris', 'nerv', 0xc9b8a0, [O([EX, EY + 0.5, EZ], 0.34, 0.06, [90, 0, 0])], 'The silvery ring round the pupil. It can close the pupil to a slit.');
  add(0, 'ey_cornea', 'cornea', 'nerv', 0xcfe2e8, [E([EX, EY + 0.62, EZ], [0.5, 0.05, 0.5])], 'A thin transparent skin over the front of the eye.', { a: 0.5 });
  add(0, 'ey_ciliary', 'ciliary muscle', 'nerv', K.muscle, [O([EX, EY + 0.3, EZ], 0.4, 0.045, [90, 0, 0])], 'A ring of muscle holding the lens. It focuses by moving the whole lens nearer to or further from the retina.');
  add(0, 'ey_opticgang', 'optic ganglion', 'nerv', K.brain, [E([EX, EY - 0.78, EZ], [0.45, 0.14, 0.3])], 'A large kidney-shaped lobe of the brain directly behind each eye. The two together are bigger than the rest of the brain.');
  /* pen detail */
  add(0, 'pn_rachis', 'rachis of the pen', 'skel', 0xd9c9a0, [T([[4.0, 0.14, 0.4], [8.6, 0.14, 0.4]], [0.05, 0.02])], 'The stiff midrib of the pen.');
  add(0, 'pn_vane', 'vane of the pen', 'skel', 0xefe6d2, [F([[5.0, 0.12, 0.4], [6.6, 0.12, -0.25], [8.6, 0.12, 0.4], [6.6, 0.12, 1.05]])], 'The thin, clear, feather-shaped blade on each side of the rachis. The pen is all that is left of the shell.', { a: 0.75 });

  /* ================= plate 1: vessels, nerves, brain and smaller organs ================= */
  /* circulation */
  var HX = -4.6, HZ = -1.8;
  add(1, 'vs_ctx', 'the three hearts and two gills', 'circ', 0xe6d9c8, [E([HX, 0.14, HZ], [0.3, 0.1, 0.22]), E([HX - 0.3, 0.14, HZ - 1.0], [0.16, 0.1, 0.14]), E([HX - 0.3, 0.14, HZ + 1.0], [0.16, 0.1, 0.14]), T([[HX - 0.4, 0.12, HZ - 1.15], [HX - 2.6, 0.12, HZ - 1.5]], [0.18, 0.04]), T([[HX - 0.4, 0.12, HZ + 1.15], [HX - 2.6, 0.12, HZ + 1.5]], [0.18, 0.04])], '', { x: 1, dull: 1 });
  add(1, 'vs_cephaorta', 'cephalic (anterior) aorta', 'circ', K.artery, [T([[HX - 0.3, 0.2, HZ], [HX - 3.2, 0.2, HZ]], 0.04)], 'Leaves the front of the systemic heart and runs forward beside the esophagus to the head and arms.');
  add(1, 'vs_postaorta', 'posterior aorta', 'circ', 0xd9564a, [T([[HX + 0.3, 0.2, HZ], [HX + 1.6, 0.2, HZ], [HX + 2.6, 0.2, HZ - 0.4]], 0.035), T([[HX + 1.6, 0.2, HZ], [HX + 2.6, 0.2, HZ + 0.4]], 0.03)], 'Leaves the rear of the systemic heart and forks to the mantle, fins and the tip of the body.');
  add(1, 'vs_afferent', 'afferent branchial vessels', 'circ', 0x5673bd, [T([[HX - 0.42, 0.22, HZ - 1.05], [HX - 2.5, 0.22, HZ - 1.36]], 0.025), T([[HX - 0.42, 0.22, HZ + 1.05], [HX - 2.5, 0.22, HZ + 1.36]], 0.025)], 'One along each gill, carrying oxygen-poor blood out from a branchial heart.');
  add(1, 'vs_efferent', 'efferent branchial vessels', 'circ', K.artery, [T([[HX - 2.5, 0.22, HZ - 1.62], [HX - 0.9, 0.22, HZ - 0.8], [HX - 0.1, 0.22, HZ - 0.15]], 0.025), T([[HX - 2.5, 0.22, HZ + 1.62], [HX - 0.9, 0.22, HZ + 0.8], [HX - 0.1, 0.22, HZ + 0.15]], 0.025)], 'One along the other edge of each gill, returning oxygenated blood to the systemic heart.');
  add(1, 'vs_lamellae', 'gill lamellae', 'resp', 0xe9d6c8, D.row(9, function (i) { var f = i / 8, x = HX - 0.6 - f * 1.9; return [ln([x, HZ - 1.1 - f * 0.3], [x - 0.05, HZ - 1.75 - f * 0.1], 0.03, 0.16), ln([x, HZ + 1.1 + f * 0.3], [x - 0.05, HZ + 1.75 + f * 0.1], 0.03, 0.16)]; }), 'The feathery leaflets of a gill, across which blood and water exchange gases.');
  add(1, 'vs_nephpores', 'nephridiopores', 'exc', 0x3a2a20, [E([HX - 0.9, 0.2, HZ - 0.3], [0.05, 0.03, 0.05]), E([HX - 0.9, 0.2, HZ + 0.3], [0.05, 0.03, 0.05])], 'A small raised opening on each side of the rectum, through which the kidneys empty into the mantle cavity.');
  /* gut extras */
  var GX = 0.4, GZ = -2.2;
  add(1, 'gt_ctx', 'buccal mass and stomach region', 'dig', 0xe9d6c0, [E([GX - 1.2, 0.14, GZ], [0.4, 0.12, 0.34]), T([[GX - 0.8, 0.12, GZ], [GX + 1.6, 0.12, GZ]], 0.045), E([GX + 2.0, 0.14, GZ], [0.4, 0.12, 0.3])], '', { x: 1, dull: 1 });
  add(1, 'gt_salivary', 'salivary glands', 'dig', 0xf4e6d6, [E([GX - 0.5, 0.2, GZ - 0.22], [0.2, 0.05, 0.1]), E([GX - 0.5, 0.2, GZ + 0.22], [0.2, 0.05, 0.1])], 'Two pairs of glands near the buccal mass. The rear pair makes a venom that paralyses prey and begins to digest it.');
  add(1, 'gt_odontophore', 'odontophore', 'dig', 0xd9a898, [E([GX - 1.2, 0.26, GZ], [0.16, 0.05, 0.12])], 'The firm tongue-like cushion inside the buccal mass over which the radula is drawn back and forth.');
  add(1, 'gt_pancreas', 'pancreas', 'dig', 0xf2d9a8, [E([GX + 1.4, 0.2, GZ + 0.25], [0.3, 0.05, 0.12])], 'Pale frothy tissue lying along the ducts that run from the digestive gland to the caecum.');
  add(1, 'gt_inkduct', 'ink duct', 'ext', 0x1a1a1a, [T([[GX + 2.4, 0.2, GZ + 0.9], [GX + 1.4, 0.2, GZ + 0.95], [GX + 0.6, 0.2, GZ + 0.8]], 0.022)], 'A fine dark tube from the ink sac along the rectum. It opens just inside the anus, so the ink leaves with the jet from the funnel.');
  /* reproductive extras */
  add(1, 're_accnid', 'accessory nidamental glands', 'repro', 0xd9564a, [E([GX + 4.6, 0.16, GZ - 0.2], [0.2, 0.05, 0.12]), E([GX + 4.6, 0.16, GZ + 0.2], [0.2, 0.05, 0.12])], 'A small mottled pair in front of the nidamental glands, orange-red in a ripe female. They hold bacteria that are added to the egg cases and protect them from fungi.', { sex: 'f' });
  add(1, 're_spermatoph', 'spermatophores', 'repro', 0xf4f0e6, D.row(6, function (i) { return ln([GX + 4.2 + i * 0.1, GZ - 0.3], [GX + 5.2 + i * 0.1, GZ - 0.25 + i * 0.1], 0.016, 0.18); }), 'Needle-like white packets of sperm, each a spring-loaded tube about a centimetre long, stored by the hundred in the sac beside the penis.', { sex: 'm' });
  add(1, 're_vasdef', 'vas deferens', 'repro', K.duct, [T([[GX + 3.4, 0.16, GZ + 0.5], [GX + 3.9, 0.16, GZ + 0.2], [GX + 3.6, 0.16, GZ - 0.1], [GX + 4.1, 0.16, GZ - 0.3]], 0.025)], 'A fine, tightly coiled tube carrying sperm from the testis to the organ that packs them.', { sex: 'm' });
  /* nervous system: brain from above, and the mantle nerves */
  var NX = -3.6, NZ = 2.0;
  add(1, 'nv_ctx', 'brain, from above, with the stellate ganglia', 'nerv', 0xe9d9c4, [E([NX + 4.2, 0.14, NZ - 0.9], [0.16, 0.06, 0.14]), E([NX + 4.2, 0.14, NZ + 0.9], [0.16, 0.06, 0.14])], '', { x: 1 });
  add(1, 'nv_cranial', 'cranial cartilage', 'skel', K.cart, [O([NX, 0.12, NZ], 0.75, 0.12, [90, 0, 0])], 'A box of cartilage round the brain: a skull, evolved quite separately from ours.');
  add(1, 'nv_cerebral', 'cerebral ganglion', 'nerv', K.brain, [E([NX, 0.22, NZ], [0.3, 0.08, 0.26])], 'The part of the brain above the esophagus. It handles memory, learning and the senses.');
  add(1, 'nv_pedal', 'pedal ganglion', 'nerv', K.brain2, [E([NX - 0.3, 0.08, NZ], [0.2, 0.05, 0.2])], 'The front part of the brain below the esophagus. It runs the arms and the funnel.');
  add(1, 'nv_visceral', 'visceral ganglion', 'nerv', 0xcfa594, [E([NX + 0.32, 0.08, NZ], [0.2, 0.05, 0.22])], 'The rear part of the brain below the esophagus. It runs the mantle and the internal organs, and holds the cells that fire the escape jet.');
  add(1, 'nv_opticlobe', 'optic lobes', 'nerv', K.brain, [E([NX, 0.16, NZ - 1.05], [0.38, 0.1, 0.26]), E([NX, 0.16, NZ + 1.05], [0.38, 0.1, 0.26])], 'The largest lobes of the brain, one behind each eye.');
  add(1, 'nv_statocyst', 'statocysts', 'nerv', 0xdbe7ee, [E([NX + 0.5, 0.05, NZ - 0.2], [0.09, 0.05, 0.09]), E([NX + 0.5, 0.05, NZ + 0.2], [0.09, 0.05, 0.09])], 'A pair of fluid-filled balance organs embedded in the cartilage under the brain. They also detect low-pitched sound.');
  add(1, 'nv_pallial', 'pallial nerves', 'nerv', K.nerve, [T([[NX + 0.5, 0.14, NZ - 0.15], [NX + 2.4, 0.14, NZ - 0.7], [NX + 4.05, 0.14, NZ - 0.9]], 0.03), T([[NX + 0.5, 0.14, NZ + 0.15], [NX + 2.4, 0.14, NZ + 0.7], [NX + 4.05, 0.14, NZ + 0.9]], 0.03)], 'A stout nerve on each side from the brain to the stellate ganglion on the inside of the mantle.');
  add(1, 'nv_stellar', 'stellar nerves', 'nerv', 0xe6dc9c, D.row(6, function (i) { var a = -0.9 + i * 0.36; return [ln([NX + 4.3, NZ - 0.9], [NX + 4.3 + Math.cos(a) * 1.6, NZ - 0.9 + Math.sin(a) * 0.9 - 0.3], 0.014), ln([NX + 4.3, NZ + 0.9], [NX + 4.3 + Math.cos(a) * 1.6, NZ + 0.9 + Math.sin(a) * 0.9 + 0.3], 0.014)]; }), 'Nerves radiating like a star from each stellate ganglion to the muscle of the mantle.');
  add(1, 'nv_giant', 'giant axon', 'nerv', 0xffffff, [ln([NX + 4.3, NZ - 0.9], [NX + 6.6, NZ - 0.7], 0.035, 0.16), ln([NX + 4.3, NZ + 0.9], [NX + 6.6, NZ + 0.7], 0.035, 0.16)], 'The thickest of the stellar nerves contains a single nerve fibre up to a millimetre across, the largest known. It is big so that the signal travels fast and the whole mantle contracts at once. Most of what is known about how nerves fire was first worked out on it.');
  add(1, 'nv_visceraln', 'visceral nerves', 'nerv', K.nerve, [T([[NX + 0.5, 0.14, NZ - 0.05], [NX + 2.6, 0.14, NZ - 0.12], [NX + 4.0, 0.14, NZ - 0.3]], 0.016), T([[NX + 0.5, 0.14, NZ + 0.05], [NX + 2.6, 0.14, NZ + 0.12], [NX + 4.0, 0.14, NZ + 0.3]], 0.016)], 'A slender pair running back between the pallial nerves to the gills, hearts and gut.');

  return {
    steps: [
      { t: 'Arms, suckers, funnel and eye', view: { t: [0.2, 0.4, -0.4], d: 23, ph: 0.3 },
        how: D.ol(['Compare a tentacle with an arm, and in a male find the altered tip of the left fourth arm.', 'Pull one sucker off and look at it under magnification (enlarged, left).', 'Slit the funnel open along its underside to find the valve, then feel for the three places where the mantle buttons to the body (centre).', 'Remove an eye and cut it in half (lower centre).', 'Lift the pen out and hold it to the light (right).']) },
      { t: 'Vessels, nerves, brain and smaller organs', view: { t: [-0.8, 0.4, 0], d: 20, ph: 0.3 },
        how: D.ol(['In an injected squid, follow the blood round: body, branchial heart, gill, systemic heart, body (upper left).', 'Find the two pairs of small glands and the duct of the ink sac (upper centre).', 'Slice the head across just behind the eyes to see the brain in its cartilage box, wrapped round the esophagus (lower left).', 'Inside the mantle, trace the nerves that fan out from each <b>stellate ganglion</b>. The thickest holds the giant axon.']) }
    ],
    parts: parts
  };
});
