/* Earthworm — atlas plates: the front twenty segments in fine detail (with the body
   surface, the vessels, the nerves and one nephridium enlarged), and a cross-section
   at high magnification. Laid out as plates on the tray. */
DX.extend('worm', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.12, WALL = 0xc98a78, PALE = 0xe9d3c4, NV = K.nerve;
  function sx(i) { return -9 + (i - 0.5) * 0.6; }   /* middle of segment i on the plate */
  function ln(a, b, r, y) { return T([[a[0], y || Y, a[1]], [b[0], y || Y, b[1]]], r); }

  /* ================= plate 0: the front end in fine detail ================= */
  var ctx = [ln([sx(0.5), -1.3], [sx(20.5), -1.3], 0.05), ln([sx(0.5), 1.3], [sx(20.5), 1.3], 0.05), T([[sx(4), 0.1, 0], [sx(6), 0.1, 0]], [0.3, 0.14]), T([[sx(6), 0.1, 0], [sx(14), 0.1, 0]], 0.13), E([sx(3), 0.2, 0], [0.12, 0.05, 0.2]), ln([sx(14.6), 0], [sx(20.4), 0], 0.035, 0.08)];
  for (var i = 1; i <= 20; i++) ctx.push(ln([sx(i + 0.5), -1.3], [sx(i + 0.5), 1.3], 0.012, 0.06));
  add(0, 'fr_ctx', 'body wall, septa, gut and nerve cord', 'wall', PALE, ctx, '', { x: 1, dull: 1 });
  add(0, 'fr_buccal', 'buccal cavity', 'dig', 0xe3b193, [T([[sx(1), 0.14, 0], [sx(3.4), 0.14, 0]], [0.08, 0.14])], 'The short first part of the gut, in segments 1 to 3, between the mouth and the pharynx.');
  add(0, 'fr_phmusc', 'dilator muscles of the pharynx', 'musc', K.muscle, D.row(5, function (j) { var x = sx(4.2 + j * 0.4); return [ln([x, -0.28], [x - 0.1, -1.2], 0.02), ln([x, 0.28], [x - 0.1, 1.2], 0.02)]; }), 'Strands radiating from the pharynx to the body wall. When they contract the pharynx widens and sucks soil in. They give the pharynx its fuzzy look.');
  add(0, 'fr_pouch', 'esophageal pouches', 'dig', 0xf0e0c8, [E([sx(10), 0.14, -0.3], [0.16, 0.08, 0.14]), E([sx(10), 0.14, 0.3], [0.16, 0.08, 0.14])], 'A pair of small swellings on the esophagus in segment 10, just in front of the calciferous glands. The glands’ chalky secretion collects here.');
  add(0, 'fr_latesoph', 'lateral esophageal vessels', 'circ', 0xb5453c, [ln([sx(6), -0.2], [sx(12.5), -0.2], 0.018, 0.2), ln([sx(6), 0.2], [sx(12.5), 0.2], 0.018, 0.2)], 'A slender vessel along each side of the esophagus, draining the front segments.');
  add(0, 'fr_testes', 'testes', 'repro', K.testis, [[10, -0.14], [10, 0.14], [11, -0.14], [11, 0.14]].map(function (p) { return E([sx(p[0]) - 0.14, 0.26, p[1]], [0.06, 0.04, 0.06]); }), 'Two pairs of tiny white bodies in segments 10 and 11, hidden inside the seminal vesicles. Tear a vesicle open under water to find them.');
  add(0, 'fr_funnels', 'sperm funnels', 'repro', 0xf4f0e6, [[10, -0.3], [10, 0.3], [11, -0.3], [11, 0.3]].map(function (p) { return O([sx(p[0]) + 0.14, 0.26, p[1]], 0.07, 0.022, [90, 0, 0]); }), 'A frilled, ciliated funnel behind each testis. It gathers ripe sperm into the sperm duct.');
  add(0, 'fr_oviduct', 'oviducts', 'repro', 0xe9c9a0, [ln([sx(13.3), -0.3], [sx(14.4), -1.0], 0.02, 0.18), ln([sx(13.3), 0.3], [sx(14.4), 1.0], 0.02, 0.18)], 'A short tube from a funnel behind each ovary to the female pore on segment 14.');
  add(0, 'fr_ovisac', 'ovisacs (egg sacs)', 'repro', 0xf0d68a, [E([sx(14), 0.2, -0.36], [0.07, 0.04, 0.07]), E([sx(14), 0.2, 0.36], [0.07, 0.04, 0.07])], 'A tiny pouch on each oviduct, in segment 14, where ripe eggs are stored until laying.');
  add(0, 'fr_parietal', 'parietal vessels', 'circ', 0xc2362b, D.row(6, function (j) { var x = sx(15 + j); return [T([[x, 0.2, -0.05], [x, 0.3, -0.7], [x, 0.14, -1.25]], 0.014), T([[x, 0.2, 0.05], [x, 0.3, 0.7], [x, 0.14, 1.25]], 0.014)]; }), 'A pair of loops in every segment behind the hearts, running round the body wall from the dorsal vessel down to the vessel under the nerve cord.');
  add(0, 'fr_segnerves', 'segmental nerves', 'nerv', NV, D.row(6, function (j) { var x = sx(15 + j); return [-0.18, 0, 0.18].map(function (dx) { return [ln([x + dx, 0.03], [x + dx, 1.2], 0.01, 0.06), ln([x + dx, -0.03], [x + dx, -1.2], 0.01, 0.06)]; }); }).reduce(function (a, b) { return a.concat(b[0], b[1]); }, []), 'Three pairs of fine nerves leave the nerve cord in every segment, to the muscles and skin of that segment.');
  add(0, 'fr_prostnerves', 'prostomial nerves', 'nerv', 0xe6dc9c, [ln([sx(3), -0.12], [sx(0.7), -0.25], 0.014, 0.2), ln([sx(3), 0.12], [sx(0.7), 0.25], 0.014, 0.2)], 'A pair of nerves from the brain forward to the sensitive lobe over the mouth.');
  /* the body surface: a strip of the back and a strip of the underside */
  add(0, 'sf_ctx', 'skin of the back (above) and of the underside (below)', 'ext', 0x8a5a4a, [E([sx(10.5), 0.06, -2.7], [6.2, 0.04, 0.45]), E([sx(10.5), 0.06, 2.7], [6.2, 0.04, 0.45])].concat(D.row(21, function (j) { return [ln([sx(j + 0.5), -3.12], [sx(j + 0.5), -2.28], 0.01, 0.1), ln([sx(j + 0.5), 2.28], [sx(j + 0.5), 3.12], 0.01, 0.1)]; })), '', { x: 1, dull: 1 });
  add(0, 'sf_dorsalpores', 'dorsal pores', 'ext', 0x1c1410, D.row(12, function (j) { return E([sx(9.5 + j), 0.11, -2.7], [0.035, 0.02, 0.035]); }), 'A tiny hole in the mid-line of the back in each groove between segments, from about segment 8 backward. Coelomic fluid oozes out to keep the skin moist. Squeeze a fresh worm gently to see it.');
  add(0, 'sf_pygidium', 'pygidium (periproct)', 'ext', 0x7a4a3c, [E([sx(20.9), 0.1, -2.7], [0.2, 0.05, 0.4])], 'The last piece of the body, bearing the anus. Like the prostomium, it is not a true segment. Drawn here at the end of the strip, though it lies far behind segment 20.');
  add(0, 'sf_tubercula', 'tubercula pubertatis', 'repro', 0xd9a890, [ln([sx(16), 2.42], [sx(19), 2.42], 0.05, 0.11), ln([sx(16), 2.98], [sx(19), 2.98], 0.05, 0.11)], 'A pale ridge along each lower edge of the clitellum (drawn here further forward than it lies). The two worms grip each other with them when mating.');
  add(0, 'sf_gensetae', 'genital setae', 'ext', 0x3a2a1a, D.row(4, function (j) { return [ln([sx(12 + j), 2.55], [sx(12 + j) + 0.05, 2.45], 0.012, 0.13), ln([sx(12 + j), 2.85], [sx(12 + j) + 0.05, 2.95], 0.012, 0.13)]; }), 'Longer, straighter bristles on a few segments near the reproductive openings. They pierce the partner’s skin and hold the pair together.');
  /* one nephridium, enlarged */
  var NX = 5.4, NZ = -0.1;
  add(0, 'np_ctx', 'septum and body wall beside one nephridium', 'wall', PALE, [ln([NX, NZ - 1.2], [NX, NZ + 1.2], 0.03), ln([NX - 0.6, NZ + 1.25], [NX + 3.6, NZ + 1.25], 0.05)], '', { x: 1, dull: 1 });
  add(0, 'np_nephrostome', 'nephrostome', 'exc', 0xf4f0e6, [O([NX - 0.3, 0.16, NZ - 0.3], 0.16, 0.05, [0, 0, 90]), T([[NX - 0.3, 0.16, NZ - 0.3], [NX + 0.1, 0.16, NZ - 0.3]], 0.03)], 'A ciliated funnel that opens into the coelom of the segment in front. It draws coelomic fluid into the tubule. Shown on one nephridium, enlarged.');
  add(0, 'np_tubule', 'nephridial tubule', 'exc', 0xe9d9c4, [T([[NX + 0.1, 0.16, NZ - 0.3], [NX + 1.0, 0.16, NZ - 0.9], [NX + 1.9, 0.16, NZ - 0.3], [NX + 1.1, 0.16, NZ + 0.3], [NX + 2.0, 0.16, NZ + 0.6], [NX + 2.7, 0.16, NZ + 0.1]], [0.025, 0.03, 0.04, 0.05, 0.06, 0.07])], 'A long looped tube, narrow at first and then wider, wrapped in capillaries. Useful substances are taken back into the blood as the fluid passes along.');
  add(0, 'np_bladder', 'bladder of the nephridium', 'exc', 0xd8cdea, [T([[NX + 2.7, 0.16, NZ + 0.1], [NX + 3.1, 0.16, NZ + 0.7], [NX + 3.0, 0.16, NZ + 1.2]], [0.1, 0.14, 0.05])], 'The wide muscular last part, where urine is held before leaving through the nephridiopore.');

  /* ================= plate 1: a cross-section at high magnification ================= */
  var R = function (r, c) { return O([0, 0.12, 0], r, c, [90, 0, 0]); };
  add(1, 'xs_ctx', 'muscle layers, coelom, gut wall and nerve cord', 'wall', WALL, [R(2.72, 0.09), R(2.4, 0.2), R(1.05, 0.12), E([0, 0.1, -0.45], [0.2, 0.05, 0.4]), E([0, 0.12, 1.72], [0.26, 0.06, 0.16])], '', { x: 1, dull: 1 });
  add(1, 'xs_cuticle', 'cuticle', 'ext', 0xf4efd8, [R(3.0, 0.025)], 'A thin, clear, non-living film on the outside, secreted by the epidermis. Its fine grooves split light and give a live worm its sheen.');
  add(1, 'xs_epidermis', 'epidermis', 'ext', 0xd9a890, [R(2.9, 0.07)], 'A single layer of tall cells under the cuticle. It contains mucus glands and sense cells, and gases are exchanged through it.');
  add(1, 'xs_peritoneum', 'peritoneum', 'wall', 0xf0d6c8, [R(2.14, 0.025)], 'The thin lining of the coelom, covering the inside of the body wall.');
  add(1, 'xs_setalsac', 'setal sacs', 'ext', 0x8a5a4a, [[1.75, 2.3], [1.2, 2.65], [-1.75, 2.3], [-1.2, 2.65]].map(function (p) { return T([[p[0], 0.14, p[1]], [p[0] * 0.82, 0.14, p[1] * 0.82]], 0.07); }), 'A pocket of epidermis pushed into the body wall, in which a seta is made and anchored. There are eight in each segment, in four pairs.');
  add(1, 'xs_setalmusc', 'protractor and retractor muscles of the setae', 'musc', K.muscle, [[1.75, 2.3], [1.2, 2.65], [-1.75, 2.3], [-1.2, 2.65]].map(function (p) { return T([[p[0] * 0.82, 0.14, p[1] * 0.82], [p[0] * 0.6, 0.14, p[1] * 0.92]], 0.025); }).concat([T([[1.43, 0.14, 1.89], [0.98, 0.14, 2.17]], 0.025), T([[-1.43, 0.14, 1.89], [-0.98, 0.14, 2.17]], 0.025)]), 'Tiny muscles on each setal sac that push the bristle out to grip the soil and pull it back in.');
  add(1, 'xs_giant', 'giant nerve fibres', 'nerv', 0xfaf6d6, [E([0, 0.2, 1.62], [0.06, 0.03, 0.05]), E([-0.13, 0.2, 1.66], [0.04, 0.03, 0.04]), E([0.13, 0.2, 1.66], [0.04, 0.03, 0.04])], 'Three very thick fibres along the top of the nerve cord. They carry the alarm signal that makes the whole worm shorten at once when touched.');
  add(1, 'xs_subneural', 'subneural vessel', 'circ', 0xc2362b, [E([0, 0.16, 1.95], [0.07, 0.04, 0.06])], 'A small vessel under the nerve cord, carrying blood backward.');
  add(1, 'xs_latneural', 'lateral neural vessels', 'circ', 0xd9564a, [E([-0.32, 0.16, 1.74], [0.05, 0.04, 0.05]), E([0.32, 0.16, 1.74], [0.05, 0.04, 0.05])], 'A fine vessel along each side of the nerve cord.');
  add(1, 'xs_epith', 'intestinal epithelium', 'dig', 0xe3b193, [R(0.9, 0.06)], 'The lining of the intestine: tall cells that secrete enzymes and absorb food.');
  add(1, 'xs_lumen', 'lumen of the intestine', 'dig', 0x5a4636, [E([0, 0.06, 0.15], [0.8, 0.03, 0.62])], 'The cavity of the gut, full of soil in a fresh worm.');

  return {
    steps: [
      { t: 'The front end in fine detail', view: { t: [0, 0.2, 0.2], d: 25, ph: 0.2 },
        how: D.ol(['Work under a dissecting microscope with the worm under water. The middle strip shows the first twenty segments opened from above.', 'Tear open a <b>seminal vesicle</b> to find the testes and sperm funnels inside it.', 'Lift the gut away behind segment 14 to see the nerves and vessels of each segment.', 'With fine forceps, pull out one <b>nephridium</b> and mount it in a drop of water (enlarged at the right).', 'The strips above and below show the skin of the back and of the underside.']) },
      { t: 'A cross-section at high magnification', view: { t: [0, 0.2, 0], d: 9.5, ph: 0.12 },
        how: D.ol(['Use a stained prepared slide of a section through the intestine region.', 'Work inward from the outside: <b>cuticle</b>, <b>epidermis</b>, two layers of muscle, <b>peritoneum</b>, coelom, then the wall of the gut.', 'Find the nerve cord at the bottom, with three <b>giant fibres</b> on top of it and small vessels round it.', 'Look for a <b>setal sac</b> where the section has passed through a bristle.']) }
    ],
    parts: parts
  };
});
