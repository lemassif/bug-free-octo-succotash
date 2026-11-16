/* Cow eye — atlas plate: the six eye muscles by name, the chambers and layers in
   a half-eye, and the fine parts of the lens, iris and optic nerve. */
DX.extend('eye', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, H = D.H, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var MU = K.muscle, MU2 = K.muscle2;

  /* ---- the eyeball from the side, with its muscles (cornea to the left) ---- */
  var EX = -3.6, EY = 1.3, EZ = 0;
  add(0, 'mu_ctx', 'eyeball, with the cornea to the left and the optic nerve to the right', 'nerv', 0xf4f0e6, [E([EX, EY, EZ], [1.25, 1.25, 1.25]), E([EX - 1.05, EY, EZ], [0.4, 0.75, 0.75]), T([[EX + 1.2, EY, EZ], [EX + 2.6, EY, EZ]], 0.2)], '', { x: 1, dull: 1 });
  add(0, 'mu_dorsal', 'dorsal (superior) rectus', 'musc', MU, [T([[EX + 2.3, EY + 0.2, EZ], [EX + 1.0, EY + 1.25, EZ], [EX - 0.3, EY + 1.3, EZ]], [0.08, 0.2, 0.14], { sy: 0.4 })], 'Attached to the top of the eyeball. It rolls the eye upward.');
  add(0, 'mu_ventral', 'ventral (inferior) rectus', 'musc', MU2, [T([[EX + 2.3, EY - 0.2, EZ], [EX + 1.0, EY - 1.25, EZ], [EX - 0.3, EY - 1.3, EZ]], [0.08, 0.2, 0.14], { sy: 0.4 })], 'Attached to the bottom of the eyeball. It rolls the eye downward.');
  add(0, 'mu_lateral', 'lateral rectus', 'musc', 0xd08a7c, [T([[EX + 2.3, EY, EZ + 0.2], [EX + 1.0, EY, EZ + 1.25], [EX - 0.3, EY, EZ + 1.3]], [0.08, 0.2, 0.14], { sz: 0.4 })], 'Attached to the outer side. It turns the eye outward, toward the ear.');
  add(0, 'mu_medial', 'medial rectus', 'musc', 0xb86a5c, [T([[EX + 2.3, EY, EZ - 0.2], [EX + 1.0, EY, EZ - 1.25], [EX - 0.3, EY, EZ - 1.3]], [0.08, 0.2, 0.14], { sz: 0.4 })], 'Attached to the inner side. It turns the eye inward, toward the nose.');
  add(0, 'mu_dobl', 'dorsal (superior) oblique', 'musc', 0xdc9484, [T([[EX + 2.2, EY + 0.3, EZ - 0.3], [EX - 0.9, EY + 1.0, EZ - 1.0], [EX - 0.2, EY + 1.2, EZ - 0.2]], [0.06, 0.07, 0.1])], 'Runs forward along the inner wall of the socket, hooks through a loop of cartilage and doubles back to the top of the eyeball. It rotates the eye about its own axis.');
  add(0, 'mu_vobl', 'ventral (inferior) oblique', 'musc', MU, [T([[EX - 0.9, EY - 1.0, EZ - 1.2], [EX - 0.4, EY - 1.3, EZ], [EX, EY - 1.0, EZ + 1.0]], [0.07, 0.12, 0.1])], 'The only eye muscle that starts at the front of the socket. It passes under the eyeball and rotates it the other way.');
  add(0, 'mu_retractor', 'retractor bulbi', 'musc', 0x9a5a50, [T([[EX + 2.3, EY, EZ], [EX + 1.2, EY, EZ]], [0.22, 0.6])], 'A cone of muscle round the optic nerve, inside the four recti. It pulls the whole eye back into the socket for protection. People do not have it.');
  add(0, 'mu_conjunctiva', 'conjunctiva', 'nerv', 0xf0c8c0, [O([EX - 0.75, EY, EZ], 0.98, 0.07, [0, 90, 0])], 'The thin, moist membrane that runs from the edge of the cornea over the white of the eye and back onto the inside of the eyelids. You find its cut edge as a pink rim.');
  add(0, 'mu_limbus', 'limbus', 'nerv', 0x8a7a70, [O([EX - 1.02, EY, EZ], 0.74, 0.03, [0, 90, 0])], 'The line where the clear cornea meets the white sclera.');
  add(0, 'mu_sheath', 'sheath of the optic nerve', 'nerv', 0xe6ddd0, [T([[EX + 1.9, EY, EZ], [EX + 2.6, EY, EZ]], 0.25)], 'The optic nerve is an outgrowth of the brain and is wrapped in the same three membranes: this tough outer layer is dura mater, continuous with the sclera.', { a: 0.6 });

  /* ---- a half-eye, cut from front to back, seen from above ---- */
  var SX = 2.2, SZ = 0, SYy = 0.2;
  function s2(x, z) { return [SX + x, SYy, SZ + z]; }
  add(0, 'se_ctx', 'eye cut in half from front to back: sclera, choroid, retina, lens, iris, cornea', 'nerv', 0xe9e2d6, [O([SX, SYy, SZ], 1.9, 0.09, [90, 0, 0]), O([SX, SYy, SZ], 1.74, 0.05, [90, 0, 0]), E(s2(-1.25, 0), [0.45, 0.1, 0.75]), T([s2(-2.3, -0.75), s2(-2.7, 0), s2(-2.3, 0.75)], 0.07), T([s2(-1.72, -0.9), s2(-1.72, -0.32)], 0.05), T([s2(-1.72, 0.9), s2(-1.72, 0.32)], 0.05), T([s2(1.85, 0), s2(3.1, 0)], 0.22)], '', { x: 1, dull: 1 });
  add(0, 'se_anterior', 'anterior chamber', 'nerv', 0xcfe2e8, [E(s2(-2.15, 0), [0.32, 0.05, 0.62])], 'The space between the cornea and the iris, filled with watery aqueous humor.', { a: 0.6 });
  add(0, 'se_posterior', 'posterior chamber', 'nerv', 0xa9c9d6, [E(s2(-1.62, -0.6), [0.09, 0.05, 0.22]), E(s2(-1.62, 0.6), [0.09, 0.05, 0.22])], 'The narrow space between the back of the iris and the lens. Aqueous humor is made here and flows forward through the pupil.');
  add(0, 'se_vitreous', 'vitreous chamber', 'nerv', 0xdcebf2, [E(s2(0.3, 0), [1.35, 0.04, 1.5])], 'The large space behind the lens, filled with the jelly of the vitreous humor, which holds the retina against the wall.', { a: 0.45 });
  add(0, 'se_ciliaryproc', 'ciliary processes', 'nerv', 0x3a2a2a, D.row(5, function (i) { return [T([s2(-1.45 + i * 0.05, -1.0 - i * 0.07), s2(-1.3 + i * 0.04, -0.78 - i * 0.06)], 0.02), T([s2(-1.45 + i * 0.05, 1.0 + i * 0.07), s2(-1.3 + i * 0.04, 0.78 + i * 0.06)], 0.02)]; }), 'About seventy black radiating folds on the inner face of the ciliary body. They secrete the aqueous humor, and the fibres that hold the lens are attached to them.');
  add(0, 'se_ora', 'ora serrata', 'nerv', 0x8a6a3a, [E(s2(-1.05, -1.42), [0.06, 0.05, 0.08]), E(s2(-1.05, 1.42), [0.06, 0.05, 0.08])], 'The scalloped front edge of the retina, where the light-sensitive part stops just behind the ciliary body.');
  add(0, 'se_capsule', 'lens capsule', 'nerv', 0xf4f8fa, [O(s2(-1.25, 0), 0.6, 0.03, [90, 0, 0], { s: [0.75, 1, 1.25] })], 'A thin, clear, elastic skin round the lens. Slit it and the lens pops out.');
  add(0, 'se_nucleus', 'nucleus of the lens', 'nerv', 0xe6dcc0, [E(s2(-1.25, 0), [0.2, 0.12, 0.36])], 'The hard, older centre of the lens. Peel a lens with your fingers: it comes apart in layers like an onion, soft outside and firm within.');
  add(0, 'se_granula', 'granula iridica', 'nerv', 0x1a1410, D.row(4, function (i) { return E(s2(-1.74, -0.3 + i * 0.07), [0.05, 0.06, 0.04]); }), 'Dark, knobbly lumps on the upper edge of the pupil in cattle, sheep and horses. They shade the eye from bright sky, like a built-in visor.');
  add(0, 'se_pigment', 'pigmented epithelium', 'nerv', 0x2a1e1a, [O([SX, SYy + 0.02, SZ], 1.66, 0.025, [90, 0, 0])], 'A single black layer of cells between the retina and the choroid. It absorbs stray light and nourishes the light-sensing cells. The retina peels away from it very easily.');
  add(0, 'se_area', 'area centralis', 'nerv', 0xf0d6a8, [E(s2(1.55, 0.35), [0.07, 0.05, 0.22])], 'A streak of retina just above the optic disc, packed with sensing cells, where vision is sharpest. Cattle have a streak, giving a wide view of the horizon; people have a spot, the macula.');
  add(0, 'se_vessels', 'retinal vessels', 'circ', K.artery, D.row(4, function (i) { var a = -0.9 + i * 0.6; return T([s2(1.62, 0), s2(1.62 - Math.cos(a) * 0.9, Math.sin(a) * 1.1)], 0.018); }), 'Fine arteries and veins that enter with the optic nerve and spread over the inner surface of the retina from the optic disc.');
  add(0, 'se_hyaloid', 'hyaloid canal', 'nerv', 0xffffff, [T([s2(-0.9, 0), s2(1.6, 0)], 0.016)], 'A faint channel through the vitreous jelly from the back of the lens to the optic disc. Before birth an artery ran through it to feed the growing lens.', { a: 0.7 });

  return {
    steps: [
      { t: 'Eye muscles, chambers and fine structure', view: { t: [-0.4, 1.0, 0], d: 15, ph: 0.45 },
        how: D.ol(['Before trimming the eye, separate the muscles round it with a probe. There are four straight ones, two oblique ones, and a cone round the nerve (left).', 'Find the pink cut edge of the <b>conjunctiva</b> round the cornea.', 'In the half-eye (right), name the three fluid-filled spaces from front to back.', 'Look at the top edge of the pupil for the dark <b>granula iridica</b>, then peel the lens apart in your fingers.']) }
    ],
    parts: parts
  };
});
