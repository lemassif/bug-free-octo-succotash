/* Sheep brain — atlas plate: remaining surface landmarks, the inner meninges,
   and the deep structures seen in a cross-section and on the midline. */
DX.extend('brain', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.16, BR = K.brain, BR2 = K.brain2, WH = 0xf4efe2, DARK = 0x5a3a36;
  function ln(pts, r, y) { return T(pts.map(function (p) { return [p[0], y || Y, p[1]]; }), r); }

  /* ---- the brain from above and from below (front to the left) ---- */
  var TX = -4.4, TZ = -1.9;
  add(0, 'sf_ctx', 'brain from above', 'nerv', BR, [E([TX, 0.12, TZ - 0.5], [1.5, 0.1, 0.45]), E([TX, 0.12, TZ + 0.5], [1.5, 0.1, 0.45]), E([TX + 1.9, 0.12, TZ], [0.5, 0.1, 0.7])], '', { x: 1, dull: 1 });
  add(0, 'sf_cruciate', 'cruciate sulcus', 'nerv', DARK, [ln([[TX - 0.8, TZ - 0.55], [TX - 0.8, TZ + 0.55]], 0.025, 0.24)], 'A short groove crossing the midline near the front of the brain. The cortex round it controls movement.');
  add(0, 'sf_marginal', 'marginal sulcus', 'nerv', DARK, [ln([[TX - 1.0, TZ - 0.28], [TX + 1.2, TZ - 0.3]], 0.02, 0.24), ln([[TX - 1.0, TZ + 0.28], [TX + 1.2, TZ + 0.3]], 0.02, 0.24)], 'A long groove running front to back on each hemisphere, parallel to the midline.');
  add(0, 'sf_cbhemi', 'cerebellar hemispheres', 'nerv', BR2, [E([TX + 1.9, 0.2, TZ - 0.45], [0.36, 0.06, 0.22]), E([TX + 1.9, 0.2, TZ + 0.45], [0.36, 0.06, 0.22])], 'The lobes of the cerebellum on either side of the vermis. They coordinate the limbs.');
  add(0, 'sf_folia', 'folia of the cerebellum', 'nerv', 0x8a5a50, D.row(6, function (i) { return ln([[TX + 1.55 + i * 0.14, TZ - 0.6], [TX + 1.55 + i * 0.14, TZ + 0.6]], 0.012, 0.26); }), 'The fine, parallel, leaf-like ridges of the cerebellum, much narrower than the gyri of the cerebrum.');
  add(0, 'sf_arachnoid', 'arachnoid mater', 'nerv', 0xf4f0e6, [E([TX - 0.5, 0.3, TZ - 0.5], [0.7, 0.02, 0.3])], 'The delicate middle membrane, like cobweb, bridging over the grooves. Blood vessels run beneath it. A patch is shown lifted here.', { a: 0.6 });
  add(0, 'sf_pia', 'pia mater', 'nerv', 0xe9b8b0, [E([TX + 0.6, 0.26, TZ + 0.5], [0.6, 0.015, 0.3])], 'The innermost membrane, a thin film stuck to the brain itself and dipping into every groove. It cannot be peeled off cleanly.', { a: 0.7 });
  var VX = -4.4, VZ = 1.9;
  add(0, 'vn_ctx', 'brain from below', 'nerv', BR2, [E([VX, 0.12, VZ - 0.5], [1.5, 0.1, 0.45]), E([VX, 0.12, VZ + 0.5], [1.5, 0.1, 0.45]), T([[VX + 0.6, 0.14, VZ], [VX + 2.6, 0.14, VZ]], [0.42, 0.26], { sy: 0.4 })], '', { x: 1, dull: 1 });
  add(0, 'vn_rhinal', 'rhinal sulcus', 'nerv', DARK, [ln([[VX - 1.3, VZ - 0.72], [VX + 1.0, VZ - 0.8]], 0.022, 0.24), ln([[VX - 1.3, VZ + 0.72], [VX + 1.0, VZ + 0.8]], 0.022, 0.24)], 'A long groove along the lower edge of each hemisphere. Everything below it is the old “smell brain”; everything above is the newer cortex.');
  add(0, 'vn_piriform', 'piriform lobe', 'nerv', BR, [E([VX + 0.5, 0.22, VZ - 0.55], [0.5, 0.05, 0.2]), E([VX + 0.5, 0.22, VZ + 0.55], [0.5, 0.05, 0.2])], 'A pear-shaped bulge at the back of the olfactory tract on each side. Smell is recognised here.');
  add(0, 'vn_tuber', 'tuber cinereum', 'nerv', 0xcfa594, [E([VX + 0.35, 0.24, VZ], [0.14, 0.04, 0.14])], 'The small grey mound on the floor of the brain from which the stalk of the pituitary hangs.');
  add(0, 'vn_fossa', 'interpeduncular fossa', 'nerv', 0x7a4a44, [E([VX + 0.85, 0.24, VZ], [0.12, 0.03, 0.08])], 'The pit between the two cerebral peduncles. The oculomotor nerves emerge from its sides.');
  add(0, 'vn_trapezoid', 'trapezoid body', 'nerv', 0xdcc0b0, [E([VX + 1.55, 0.26, VZ], [0.12, 0.04, 0.3])], 'A narrow crosswise band just behind the pons. It carries hearing fibres from one side to the other.');
  add(0, 'vn_fissure', 'ventral median fissure', 'nerv', DARK, [ln([[VX + 1.7, VZ], [VX + 2.6, VZ]], 0.018, 0.28)], 'The groove down the midline of the underside of the medulla, between the two pyramids, continuing down the spinal cord.');
  add(0, 'vn_flocculus', 'flocculus', 'nerv', BR, [E([VX + 1.8, 0.2, VZ - 0.52], [0.14, 0.05, 0.1]), E([VX + 1.8, 0.2, VZ + 0.52], [0.14, 0.05, 0.1])], 'A small lobe of the cerebellum tucked in beside the brainstem on each side. It steadies the eyes when the head moves.');

  /* ---- a cross-section through the middle of the cerebrum ---- */
  var XX = 0.9, XZ = -1.9;
  function x2(x, z) { return [XX + x, Y, XZ + z]; }
  add(0, 'xs_ctx', 'cross-section through the cerebrum: cortex outside, white matter within', 'nerv', BR, [O([XX, 0.12, XZ], 1.7, 0.16, [90, 0, 0], { s: [1.15, 1, 0.9] }), E([XX, 0.08, XZ], [1.75, 0.04, 1.35])], '', { x: 1, dull: 1 });
  add(0, 'xs_caudate', 'caudate nucleus', 'nerv', 0xb98a7a, [E(x2(-0.62, -0.25), [0.26, 0.05, 0.2]), E(x2(0.62, -0.25), [0.26, 0.05, 0.2])], 'A mass of grey matter bulging into the floor of each lateral ventricle. It helps start and smooth out movement.');
  add(0, 'xs_capsule', 'internal capsule', 'nerv', WH, [T([x2(-0.95, -0.55), x2(-0.75, 0.55)], 0.06), T([x2(0.95, -0.55), x2(0.75, 0.55)], 0.06)], 'A band of white fibres on each side, between the caudate nucleus and the grey mass outside it. Nearly all traffic between the cortex and the rest of the nervous system passes through it.');
  add(0, 'xs_lentiform', 'lentiform nucleus', 'nerv', 0xa87a6a, [E(x2(-1.2, 0.1), [0.22, 0.05, 0.3]), E(x2(1.2, 0.1), [0.22, 0.05, 0.3])], 'A lens-shaped mass of grey matter outside the internal capsule. With the caudate nucleus it forms the basal nuclei.');
  add(0, 'xs_hippo', 'hippocampus', 'nerv', 0xd9a890, [T([x2(-0.9, 0.75), x2(-0.5, 0.95), x2(-0.15, 0.8)], 0.09), T([x2(0.9, 0.75), x2(0.5, 0.95), x2(0.15, 0.8)], 0.09)], 'A curved roll of old cortex in the floor of each lateral ventricle. It is needed for laying down new memories.');
  add(0, 'xs_choroid', 'choroid plexus', 'nerv', 0xb5453c, [E(x2(-0.4, 0.2), [0.14, 0.04, 0.08]), E(x2(0.4, 0.2), [0.14, 0.04, 0.08]), E(x2(0, 0.45), [0.08, 0.04, 0.06])], 'Tufts of tiny, dark red blood vessels hanging into each ventricle. They make the cerebrospinal fluid.');
  add(0, 'xs_adhesion', 'interthalamic adhesion', 'nerv', 0xcfa594, [E(x2(0, 0.62), [0.18, 0.05, 0.14])], 'The bridge of grey matter joining the left and right thalamus across the third ventricle. In a sheep it is large, and the ventricle is a ring round it.');

  /* ---- the midline again: what was not named before ---- */
  var MX = 0.6, MZ = 1.9;
  function m2(x, z) { return [MX + x, Y, MZ + z]; }
  add(0, 'ml_ctx', 'midline section: corpus callosum, thalamus, brainstem and cerebellum', 'nerv', BR2, [T([m2(-1.3, -0.4), m2(0, -0.62), m2(1.0, -0.4)], 0.09), E(m2(0.1, 0.05), [0.5, 0.05, 0.32]), T([m2(0.5, 0.35), m2(1.6, 0.5), m2(2.8, 0.55)], [0.3, 0.26, 0.16]), E(m2(2.0, -0.35), [0.6, 0.05, 0.45]), E(m2(-0.6, 0.6), [0.16, 0.05, 0.12])], '', { x: 1, dull: 1 });
  add(0, 'ml_genu', 'genu of the corpus callosum', 'nerv', WH, [T([m2(-1.3, -0.4), m2(-1.45, -0.25), m2(-1.3, -0.1)], 0.07)], 'The front end of the corpus callosum, where it bends sharply downward and back.');
  add(0, 'ml_splenium', 'splenium of the corpus callosum', 'nerv', WH, [E(m2(1.05, -0.38), [0.14, 0.06, 0.12])], 'The thickened rear end of the corpus callosum. It links the visual areas of the two hemispheres.');
  add(0, 'ml_foramen', 'interventricular foramen', 'nerv', 0x3a2a2a, [E(m2(-0.35, -0.2), [0.06, 0.04, 0.05])], 'The small hole on each side through which a lateral ventricle opens into the third ventricle.');
  add(0, 'ml_lamina', 'lamina terminalis', 'nerv', 0xe9c9b8, [T([m2(-0.55, -0.1), m2(-0.62, 0.45)], 0.025)], 'The thin front wall of the third ventricle, between the anterior commissure and the optic chiasm. It marks the front end of the tube from which the brain formed.');
  add(0, 'ml_habenula', 'habenula', 'nerv', 0xb98a7a, [E(m2(0.55, -0.2), [0.07, 0.05, 0.05])], 'A small knob on the upper rear corner of the thalamus, just in front of the pineal gland.');
  add(0, 'ml_postcomm', 'posterior commissure', 'nerv', WH, [E(m2(0.72, -0.1), [0.05, 0.05, 0.04])], 'A small round bundle of white fibres just below the stalk of the pineal gland, cut across here. It coordinates the pupils of the two eyes.');
  add(0, 'ml_tectum', 'tectum', 'nerv', 0xdcbcae, [T([m2(0.8, 0.02), m2(1.35, 0.08)], 0.07)], 'The roof of the midbrain: the plate that carries the four colliculi.');
  add(0, 'ml_tegmentum', 'tegmentum', 'nerv', 0xc9a08c, [T([m2(0.8, 0.3), m2(1.4, 0.38)], 0.1)], 'The core of the midbrain, under the cerebral aqueduct.');
  add(0, 'ml_velum', 'rostral medullary velum', 'nerv', 0xf4f0e6, [T([m2(1.35, 0.1), m2(1.65, 0.0)], 0.02)], 'A thin white sheet stretched from the colliculi back to the cerebellum, roofing the front of the fourth ventricle.');
  add(0, 'ml_adeno', 'adenohypophysis', 'endo', 0xe8a0b8, [E(m2(-0.68, 0.66), [0.09, 0.06, 0.1])], 'The front, glandular part of the pituitary. It makes the hormones that drive growth, the thyroid, the adrenal cortex and the gonads.');
  add(0, 'ml_neuro', 'neurohypophysis', 'endo', 0xd9c9b8, [E(m2(-0.5, 0.64), [0.07, 0.05, 0.08])], 'The rear part of the pituitary, a downgrowth of the brain. It releases two hormones made by the hypothalamus: one saves water, the other drives labour and milk let-down.');
  add(0, 'ml_canal', 'central canal', 'nerv', 0x3a2a2a, [T([m2(2.5, 0.52), m2(3.2, 0.56)], 0.018)], 'The fine channel down the middle of the spinal cord, continuous with the fourth ventricle.');

  return {
    steps: [
      { t: 'Remaining landmarks and deep structures', view: { t: [-1.0, 0.4, 0], d: 14, ph: 0.3 },
        how: D.ol(['On the upper surface (upper left), find the two named grooves and compare the fine <b>folia</b> of the cerebellum with the gyri of the cerebrum.', 'With forceps, lift a scrap of the cobweb-like <b>arachnoid</b>. The film left on the brain is the <b>pia</b>.', 'On the underside (lower left), a long groove separates the old smell brain from the rest.', 'Cut one hemisphere straight across about halfway back (upper right) to see the grey masses buried in the white matter.', 'Return to the midline cut (lower right) for the last small landmarks.']) }
    ],
    parts: parts
  };
});
