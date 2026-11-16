/* Sheep heart — atlas plate: the coronary vessels, the layers of the wall, the
   conducting system, and the remaining small features of the chambers. */
DX.extend('heart', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.16, HR = 0xa8372f, AR = K.artery, VE = K.vein;
  function ln(pts, r, y) { return T(pts.map(function (p) { return [p[0], y || Y, p[1]]; }), r); }

  /* ---- the heart from the front: coronary vessels (apex toward you) ---- */
  var HX = -3.6, HZ = 0.2;
  function h(x, z) { return [HX + x, HZ + z]; }
  add(0, 'co_ctx', 'heart from the front, with the great vessels', 'circ', HR, [E([HX, 0.1, HZ + 0.4], [1.7, 0.08, 2.0]), E([HX - 1.1, 0.1, HZ - 1.5], [0.6, 0.08, 0.45]), E([HX + 1.1, 0.1, HZ - 1.5], [0.55, 0.08, 0.4]), T([[HX - 0.2, 0.12, HZ - 1.5], [HX - 0.3, 0.12, HZ - 2.6]], 0.3), T([[HX + 0.35, 0.12, HZ - 1.4], [HX + 0.9, 0.12, HZ - 2.5]], 0.26)], '', { x: 1, dull: 1 });
  add(0, 'co_left', 'left coronary artery', 'circ', AR, [ln([h(-0.1, -1.45), h(0.3, -1.25), h(0.5, -1.05)], 0.06, 0.24)], 'Leaves the aorta just above the valve and runs out between the pulmonary trunk and the left auricle. It is short and soon divides in two.');
  add(0, 'co_paraconal', 'paraconal (anterior) interventricular branch', 'circ', 0xd9564a, [ln([h(0.5, -1.05), h(0.3, 0), h(-0.1, 1.2), h(-0.2, 2.0)], 0.045, 0.24)], 'The branch of the left coronary artery that runs down the groove on the front of the heart toward the apex. In people a clot here causes the commonest fatal heart attack.');
  add(0, 'co_circumflex', 'circumflex branch', 'circ', AR, [ln([h(0.5, -1.05), h(1.1, -1.0), h(1.6, -0.6)], 0.045, 0.24)], 'The branch of the left coronary artery that runs round the left side of the heart in the coronary groove.');
  add(0, 'co_right', 'right coronary artery', 'circ', 0xd9564a, [ln([h(-0.35, -1.45), h(-1.0, -1.05), h(-1.6, -0.5)], 0.045, 0.24)], 'Leaves the aorta on the other side and runs round the right side of the heart in the coronary groove.');
  add(0, 'co_greatvein', 'great cardiac vein', 'circ', VE, [ln([h(-0.05, 1.9), h(0.45, 0.0), h(0.68, -0.95), h(1.25, -0.88), h(1.7, -0.45)], 0.04, 0.2)], 'Runs up the front groove beside the artery, then round the left side to empty into the coronary sinus on the back of the heart.');
  add(0, 'co_fat', 'epicardial fat', 'other', K.fat, [ln([h(-1.6, -0.82), h(-0.6, -1.2), h(0.7, -1.2), h(1.65, -0.8)], 0.11, 0.14)], 'Fat packed into the grooves of the heart, cushioning the coronary vessels. Scrape it away to see them.');
  add(0, 'co_conus', 'conus arteriosus', 'circ', 0xb5453c, [E([HX - 0.3, 0.2, HZ - 0.85], [0.42, 0.05, 0.35])], 'The smooth, funnel-shaped top of the right ventricle leading up to the pulmonary valve.');
  add(0, 'co_pularteries', 'right and left pulmonary arteries', 'circ', 0x7b5ea8, [T([[HX - 0.3, 0.14, HZ - 2.6], [HX - 1.3, 0.14, HZ - 2.9]], 0.18), T([[HX - 0.3, 0.14, HZ - 2.6], [HX + 0.5, 0.14, HZ - 3.0]], 0.18)], 'The two branches into which the pulmonary trunk divides, one to each lung.');
  add(0, 'co_base', 'base of the heart', 'circ', 0x8a5a5a, [ln([h(-1.7, -1.75), h(1.7, -1.75)], 0.035, 0.26)], 'The broad upper end where the great vessels enter and leave: the opposite end from the apex.');

  /* ---- a block cut from the wall of the left ventricle: its layers ---- */
  var WX = 1.0, WZ = -2.2;
  add(0, 'wl_pericard', 'parietal pericardium', 'circ', 0xf0e6d6, [E([WX, 1.55, WZ], [1.0, 0.04, 0.7])], 'The tough outer bag that encloses the heart, usually cut away before you receive it. Look for its torn edge on the great vessels. Shown on a block of ventricle wall, enlarged.', { a: 0.75 });
  add(0, 'wl_cavity', 'pericardial cavity', 'circ', 0xcfe2e8, [E([WX, 1.38, WZ], [1.0, 0.1, 0.7])], 'The slit between the bag and the heart, holding a film of slippery fluid so that the beating heart does not rub.', { a: 0.4 });
  add(0, 'wl_epicard', 'epicardium (visceral pericardium)', 'circ', 0xf4d6c8, [E([WX, 1.22, WZ], [1.0, 0.05, 0.7])], 'The thin, shiny membrane that covers the surface of the heart itself.');
  add(0, 'wl_myoctx', 'myocardium', 'circ', HR, [E([WX, 0.66, WZ], [1.0, 0.5, 0.7])], '', { x: 1 });
  add(0, 'wl_endocard', 'endocardium', 'circ', 0xe9b8a8, [E([WX, 0.12, WZ], [1.0, 0.05, 0.7])], 'The smooth lining of the chambers, continuous with the lining of the blood vessels. It also covers the valves.');

  /* ---- the heart opened like a book: openings and the conducting system ---- */
  var OX = 2.4, OZ = 1.5;
  function o2(x, z) { return [OX + x, OZ + z]; }
  add(0, 'op_ctx', 'the four chambers, opened: atria above, ventricles below, septum between', 'circ', 0xc9645a, [E([OX - 1.2, 0.1, OZ - 1.0], [1.0, 0.07, 0.6]), E([OX + 1.2, 0.1, OZ - 1.0], [1.0, 0.07, 0.6]), E([OX - 1.2, 0.1, OZ + 0.7], [1.0, 0.07, 1.0]), E([OX + 1.2, 0.1, OZ + 0.7], [1.0, 0.07, 1.0]), T([[OX, 0.14, OZ - 0.35], [OX, 0.14, OZ + 1.7]], 0.12)], '', { x: 1, dull: 1 });
  add(0, 'op_intatrial', 'interatrial septum', 'circ', 0x9a4a44, [T([[OX, 0.16, OZ - 1.6], [OX, 0.16, OZ - 0.45]], 0.09)], 'The thin wall between the two atria. The fossa ovalis is a dent in it.');
  add(0, 'op_cranvc', 'opening of the cranial vena cava', 'circ', 0x23324f, [E([OX - 1.7, 0.2, OZ - 1.3], [0.2, 0.03, 0.16])], 'Where blood from the head, neck and forelimbs enters the right atrium.');
  add(0, 'op_caudvc', 'opening of the caudal vena cava', 'circ', 0x2a3a5a, [E([OX - 1.0, 0.2, OZ - 0.75], [0.22, 0.03, 0.16])], 'Where blood from the rest of the body enters the right atrium.');
  add(0, 'op_tubercle', 'intervenous tubercle', 'circ', 0xb5645a, [E([OX - 1.35, 0.22, OZ - 1.02], [0.14, 0.05, 0.1])], 'A ridge of muscle between the openings of the two venae cavae. It turns the two streams of blood down toward the valve so that they do not collide.');
  add(0, 'op_crista', 'crista terminalis', 'circ', 0x8a3a34, [ln([o2(-2.05, -1.45), o2(-1.6, -0.95), o2(-0.7, -0.6)], 0.035, 0.22)], 'A ridge inside the right atrium marking the line between its smooth part and the ridged auricle. The pectinate muscles branch from it.');
  add(0, 'op_pulmveins', 'openings of the pulmonary veins', 'circ', 0x5a2a2a, D.row(4, function (i) { return E([OX + 0.7 + i * 0.36, 0.2, OZ - 1.25 + (i % 2) * 0.3], [0.1, 0.03, 0.08]); }), 'Several holes in the roof of the left atrium, where oxygenated blood returns from the lungs. There are no valves on them.');
  add(0, 'op_sinuses', 'aortic sinuses', 'circ', 0xd98a80, D.row(3, function (i) { return E([OX + 0.5 + i * 0.22, 0.22, OZ - 0.32], [0.09, 0.04, 0.07]); }), 'Three small pockets in the wall of the aorta, one behind each cusp of the valve. The coronary arteries open from two of them and fill when the valve snaps shut.');
  add(0, 'op_oscordis', 'os cordis', 'skel', K.bone, [E([OX + 0.12, 0.26, OZ - 0.42], [0.14, 0.04, 0.06])], 'A small bone in the ring round the aortic valve, found in sheep and cattle. Feel for something hard with the tip of a probe.');
  add(0, 'op_skeleton', 'fibrous rings (cardiac skeleton)', 'circ', 0xf4f0e6, [O([OX - 1.2, 0.2, OZ - 0.32], 0.5, 0.035, [90, 0, 0]), O([OX + 1.2, 0.2, OZ - 0.32], 0.5, 0.035, [90, 0, 0])], 'Tough rings of fibre round the valve openings. The valves and all the heart muscle are anchored to them, and they insulate the atria electrically from the ventricles.');
  add(0, 'cs_sa', 'sinoatrial (SA) node', 'nerv', 0xf0c64c, [E([OX - 1.95, 0.24, OZ - 1.42], [0.1, 0.04, 0.07])], 'The pacemaker: a patch of specialised muscle in the wall of the right atrium by the cranial vena cava. Each heartbeat starts here. It cannot be seen with the naked eye.');
  add(0, 'cs_av', 'atrioventricular (AV) node', 'nerv', 0xf0c64c, [E([OX - 0.2, 0.26, OZ - 0.5], [0.09, 0.04, 0.07])], 'A second patch low in the wall between the atria. It picks up the signal, delays it a tenth of a second so the atria can empty, and passes it on.');
  add(0, 'cs_bundle', 'atrioventricular bundle (bundle of His)', 'nerv', 0xe9b43a, [T([[OX - 0.14, 0.26, OZ - 0.45], [OX, 0.26, OZ - 0.2], [OX, 0.26, OZ + 0.25]], 0.03)], 'The only electrical path through the fibrous rings, running down into the top of the septum.');
  add(0, 'cs_branches', 'right and left bundle branches', 'nerv', 0xd9a02a, [T([[OX, 0.26, OZ + 0.25], [OX - 0.16, 0.26, OZ + 1.5]], 0.022), T([[OX, 0.26, OZ + 0.25], [OX + 0.16, 0.26, OZ + 1.5]], 0.022)], 'The two halves of the bundle, running down either side of the septum toward the apex. The moderator band carries part of the right branch across the ventricle.');
  add(0, 'cs_purkinje', 'Purkinje fibres', 'nerv', 0xf4d66a, D.row(5, function (i) { return [T([[OX - 0.16, 0.24, OZ + 1.5], [OX - 0.6 - i * 0.3, 0.24, OZ + 1.55 - i * 0.3]], 0.012), T([[OX + 0.16, 0.24, OZ + 1.5], [OX + 0.6 + i * 0.3, 0.24, OZ + 1.55 - i * 0.3]], 0.012)]; }), 'A net of fast-conducting fibres under the lining of both ventricles. They carry the signal up the walls from the apex, so the ventricles squeeze from the bottom upward. In a sheep heart they show as pale threads.');

  return {
    steps: [
      { t: 'Coronary vessels, wall layers and conducting system', view: { t: [-0.4, 0.5, 0], d: 14, ph: 0.3 },
        how: D.ol(['Scrape the fat out of the grooves on the front of the heart to expose the <b>coronary arteries</b> and the vein beside them (left).', 'Cut a block from the wall of the left ventricle and look at its cut face: three layers, with the bag outside them (enlarged, top).', 'Lay the opened heart flat (right). Find every opening into each atrium, and probe the wall of the aorta behind each valve cusp.', 'The conducting system is drawn in yellow. Only the <b>Purkinje fibres</b> can be seen without a microscope.']) }
    ],
    parts: parts
  };
});
