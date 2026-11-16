/* Kidney — atlas plate: the finer vessels and regions of the cut kidney, and the
   renal corpuscle and tubule at high magnification. */
DX.extend('kidney', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.16, AR = K.artery;
  function ln(pts, r, y) { return T(pts.map(function (p) { return [p[0], y || Y, p[1]]; }), r); }

  /* ---- a wedge of the cut kidney: one lobe ---- */
  var LX = -4.0, LZ = 0.2;
  function l(x, z) { return [LX + x, LZ + z]; }
  add(0, 'lb_ctx', 'one wedge of the cut kidney: cortex outside, pyramid inside', 'exc', 0x8b3d33, [E([LX, 0.08, LZ - 1.4], [2.0, 0.05, 0.75]), E([LX, 0.1, LZ + 0.3], [1.2, 0.05, 1.3])], '', { x: 1, dull: 1 });
  add(0, 'lb_lobe', 'renal lobe', 'exc', 0xf4f0e6, [ln([l(-1.6, -2.1), l(-0.9, 1.5), l(0, 1.75), l(0.9, 1.5), l(1.6, -2.1)], 0.03, 0.2)], 'One pyramid together with the cap of cortex over it, outlined here. A kidney is a cluster of lobes, which stay separate on the surface in cattle and in a human baby.');
  add(0, 'lb_rays', 'medullary rays', 'exc', 0xc98f80, D.row(7, function (i) { return ln([l(-1.2 + i * 0.4, -0.9), l(-1.3 + i * 0.43, -1.9)], 0.02, 0.18); }), 'Pale streaks running out from the pyramid into the cortex. Each is a bundle of straight tubules and collecting ducts.');
  add(0, 'lb_labyrinth', 'cortical labyrinth', 'exc', 0x6b2b24, D.row(6, function (i) { return E([LX - 1.0 + i * 0.4, 0.16, LZ - 1.45], [0.1, 0.03, 0.4]); }), 'The darker, grainy cortex between the rays, packed with renal corpuscles and coiled tubules.');
  add(0, 'lb_outer', 'outer medulla', 'exc', 0xa8503f, [E([LX, 0.16, LZ - 0.35], [1.05, 0.03, 0.45])], 'The darker band at the base of a pyramid, next to the cortex. The thick parts of the nephron loops lie here.');
  add(0, 'lb_inner', 'inner medulla', 'exc', 0xd9a08c, [E([LX, 0.16, LZ + 0.75], [0.7, 0.03, 0.6])], 'The paler tip of a pyramid, holding the thin parts of the loops and the large collecting ducts.');
  add(0, 'lb_cribrosa', 'area cribrosa', 'exc', 0x3a2a24, D.row(6, function (i) { return E([LX - 0.2 + (i % 3) * 0.2, 0.2, LZ + 1.5 + Math.floor(i / 3) * 0.12], [0.03, 0.02, 0.03]); }), 'The sieve-like tip of a papilla, pierced by the openings of the papillary ducts. Squeeze a fresh pyramid and drops of urine appear here.');
  add(0, 'lb_segmental', 'segmental arteries', 'circ', AR, [ln([l(0, 2.6), l(-0.5, 2.1)], 0.05, 0.22), ln([l(0, 2.6), l(0.5, 2.1)], 0.05, 0.22)], 'The first branches of the renal artery, in the renal sinus. Each supplies one region of the kidney and does not link with its neighbours.');
  add(0, 'lb_cortrad', 'cortical radiate (interlobular) arteries', 'circ', 0xd9564a, D.row(6, function (i) { return ln([l(-1.1 + i * 0.44, -0.86), l(-1.2 + i * 0.47, -1.85)], 0.014, 0.24); }), 'Small arteries that rise from the arcuate arteries straight out through the cortex. The afferent arterioles branch from them.');
  add(0, 'lb_stellate', 'stellate veins', 'circ', K.vein, D.row(4, function (i) { var x = -1.2 + i * 0.8; return [ln([l(x, -2.08), l(x - 0.2, -2.14)], 0.012, 0.24), ln([l(x, -2.08), l(x + 0.2, -2.14)], 0.012, 0.24), ln([l(x, -2.08), l(x, -1.9)], 0.012, 0.24)]; }), 'Tiny star-shaped veins just under the capsule, draining the outermost cortex.');

  /* ---- a renal corpuscle and its tubule, at high magnification ---- */
  var CX = 2.2, CZ = -0.6;
  function c(x, z) { return [CX + x, CZ + z]; }
  add(0, 'rc_ctx', 'glomerulus, its capsule and the tubule, enlarged', 'exc', 0xe9c9a8, [O([CX, 0.14, CZ], 1.15, 0.07, [90, 0, 0]), E([CX, 0.14, CZ], [0.7, 0.1, 0.7]), ln([c(-2.4, -0.5), c(-0.7, -0.2)], 0.07), ln([c(-0.7, 0.2), c(-2.4, 0.6)], 0.05), ln([c(1.15, 0), c(2.2, 0.2), c(2.6, 1.2), c(1.8, 1.9)], 0.12)], '', { x: 1, dull: 1 });
  add(0, 'rc_corpuscle', 'renal corpuscle', 'exc', 0xf4f0e6, [O([CX, 0.2, CZ], 1.32, 0.03, [90, 0, 0])], 'The glomerulus and its capsule together, outlined here: the filtering unit, about a fifth of a millimetre across. A kidney has roughly a million.');
  add(0, 'rc_space', 'capsular space', 'exc', 0xdcebf2, [O([CX, 0.1, CZ], 0.92, 0.1, [90, 0, 0])], 'The gap between the tuft of capillaries and the outer wall of the capsule. Filtrate collects here before entering the tubule.', { a: 0.7 });
  add(0, 'rc_parietal', 'parietal layer of the capsule', 'exc', 0xd9b48a, [O([CX, 0.22, CZ], 1.15, 0.035, [90, 0, 0])], 'The outer wall of the glomerular capsule: a single layer of flat cells.');
  add(0, 'rc_podocytes', 'podocytes (visceral layer)', 'exc', 0x8a5a9a, D.row(9, function (i) { var a = i / 9 * Math.PI * 2; return E([CX + Math.cos(a) * 0.68, 0.24, CZ + Math.sin(a) * 0.68], [0.1, 0.05, 0.1]); }), 'Cells with many interlocking foot-like processes that wrap every capillary of the glomerulus. The slits between the feet are the final filter: water and small molecules pass, proteins and blood cells do not.');
  add(0, 'rc_mesangium', 'mesangial cells', 'exc', 0x6a4a7a, [E([CX - 0.25, 0.26, CZ], [0.18, 0.04, 0.24])], 'Cells among the capillary loops at the root of the glomerulus. They support the loops and clear debris from the filter.');
  add(0, 'rc_macula', 'macula densa', 'exc', 0x2a4a8a, [E([CX - 0.98, 0.26, CZ + 0.02], [0.07, 0.05, 0.18])], 'A patch of tightly packed cells where the far end of the tubule loops back to touch its own glomerulus. It tastes the salt in the fluid and reports whether filtering is too fast or too slow.');
  add(0, 'rc_jgcells', 'juxtaglomerular cells', 'endo', 0xd9564a, [E([CX - 1.25, 0.26, CZ - 0.38], [0.14, 0.05, 0.08])], 'Altered muscle cells in the wall of the afferent arteriole beside the macula densa. They release renin, the hormone that raises blood pressure.');
  add(0, 'rc_thin', 'thin descending limb', 'exc', 0xf0d68a, [ln([c(1.8, 1.9), c(1.2, 3.0), c(1.0, 3.4)], 0.05, 0.2)], 'The narrow first part of the nephron loop, dipping into the medulla. Water leaves it; salt does not.');
  add(0, 'rc_thick', 'thick ascending limb', 'exc', 0xd9a02a, [ln([c(1.0, 3.4), c(0.7, 3.0), c(0.3, 1.9), c(-0.6, 1.3), c(-1.0, 0.3)], 0.09, 0.2)], 'The wide second part of the loop, climbing back to the cortex. It pumps salt out but lets no water follow, which makes the medulla salty and lets the kidney make concentrated urine.');
  add(0, 'rc_papduct', 'papillary duct', 'exc', 0xc9a04a, [ln([c(3.4, 0.2), c(3.5, 2.0), c(3.4, 3.5)], 0.14, 0.2)], 'The wide last stretch formed by many collecting ducts joining. It opens at the tip of the papilla.');
  add(0, 'rc_vasarecta', 'vasa recta', 'circ', 0x9a4a6a, [ln([c(-0.6, 0.6), c(0.4, 1.6), c(1.5, 3.2), c(1.7, 3.3), c(0.7, 1.7), c(-0.3, 0.9)], 0.022, 0.26)], 'Long hairpin capillaries that follow the nephron loop down into the medulla and back. They carry away reabsorbed water without washing out the salt.');

  return {
    steps: [
      { t: 'Finer regions and vessels, and the renal corpuscle', view: { t: [-0.5, 0.3, 0.8], d: 18, ph: 0.2 },
        how: D.ol(['Look at one wedge of the cut kidney with a hand lens (left). The cortex is streaked: pale <b>rays</b> between dark grainy strips.', 'The pyramid has a darker outer band and a paler tip. Find the tiny holes at the very tip.', 'Under a microscope, find a round <b>renal corpuscle</b> in the cortex of a prepared slide (enlarged, right). Next to it, one tubule presses against the vessels entering the tuft.', 'Follow the loop down into the medulla and back.']) }
    ],
    parts: parts
  };
});
