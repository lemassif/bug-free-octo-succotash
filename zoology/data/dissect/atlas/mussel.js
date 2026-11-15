/* Freshwater mussel — atlas plates, laid out on the tray: the shell in detail,
   then the gill, the stomach, and the small openings, vessels and nerves. */
DX.extend('mussel', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, F = D.F, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.14, SH = 0x5a4a32, NAC = 0xe9e6f2;
  function ln(a, b, r, y) { return T([[a[0], y || Y, a[1]], [b[0], y || Y, b[1]]], r); }

  /* ================= plate 0: the shell in detail ================= */
  /* outline of a left valve, outside up: front to the left, hinge away from you */
  var OUT = [[-4.2, -0.2], [-3.4, -1.5], [-1.5, -2.0], [1.5, -1.9], [3.8, -1.2], [4.6, 0.1], [3.6, 1.5], [0.5, 2.1], [-2.6, 1.8], [-4.0, 0.9]];
  add(0, 'sh_ctx', 'left valve, outer surface', 'skel', SH, [F(OUT.map(function (p) { return [p[0], 0.1, p[1]]; }))], '', { x: 1, dull: 1 });
  add(0, 'sh_anterior', 'anterior end', 'skel', 0x8a7a55, [ln([-4.15, -0.1], [-3.95, 0.8], 0.07, 0.18)], 'The shorter, rounded end, in front of the umbo. The foot comes out here and the mussel ploughs forward with this end.');
  add(0, 'sh_posterior', 'posterior end', 'skel', 0x7a6a48, [ln([4.5, -0.3], [4.2, 0.9], 0.07, 0.18)], 'The longer, more pointed end. It is the end left sticking out of the mud, with the two siphons.');
  add(0, 'sh_dorsal', 'dorsal margin', 'skel', 0x8a7a55, [T([[-2.6, 0.18, -1.85], [0, 0.18, -2.02], [2.6, 0.18, -1.62]], 0.06)], 'The hinge side of the shell, where the two valves are joined.');
  add(0, 'sh_ventral', 'ventral margin', 'skel', 0x7a6a48, [T([[-2.6, 0.18, 1.75], [0.4, 0.18, 2.05], [3.2, 0.18, 1.6]], 0.06)], 'The free edge opposite the hinge, where the valves gape and the shell grows fastest.');
  add(0, 'sh_rest', 'rest lines (annual rings)', 'skel', 0x2e2416, [0.45, 0.65, 0.84].map(function (k) { return T(OUT.slice(3, 9).map(function (p) { return [-1.4 + (p[0] + 1.4) * k, 0.16, -1.6 + (p[1] + 1.6) * k]; }), 0.022); }), 'A few growth lines are darker and deeper than the rest: each marks a winter when growth stopped. Counting them gives a rough age.');
  /* a broken edge of shell, greatly enlarged, standing on the tray */
  var BXp = 7.2;
  add(0, 'ly_periost', 'periostracum', 'skel', 0x4a3a22, [E([BXp, 1.0, 0], [1.2, 0.07, 0.9])], 'The thin, horny, brown outer skin of the shell, made of protein. It protects the chalky layers beneath from being dissolved by acid water. Shown on a chip of shell, enlarged.');
  add(0, 'ly_prismatic', 'prismatic layer', 'skel', 0xd9d2c0, [E([BXp, 0.68, 0], [1.2, 0.24, 0.9])].concat(D.row(7, function (i) { return T([[BXp - 0.9 + i * 0.3, 0.46, 0.88], [BXp - 0.9 + i * 0.3, 0.9, 0.88]], 0.012); })), 'The thick middle layer: tightly packed columns of chalk (calcium carbonate) standing at right angles to the surface.');
  add(0, 'ly_nacre', 'nacreous layer', 'skel', NAC, [E([BXp, 0.28, 0], [1.2, 0.16, 0.9])], 'The inner layer: thousands of very thin sheets of chalk laid flat like tiles. Light reflecting between the sheets gives mother-of-pearl its colours.');
  /* the hinge of the right valve, from inside */
  add(0, 'hg_ctx', 'hinge region, from inside', 'skel', NAC, [E([-0.5, 0.08, 4.4], [4.0, 0.04, 0.7])], '', { x: 1, dull: 1 });
  add(0, 'hg_line', 'hinge line', 'skel', 0x4a3a22, [ln([-4.2, 3.82], [3.2, 3.82], 0.035, 0.14)], 'The line along which the two valves rock against each other.');
  add(0, 'hg_beakcav', 'beak cavity', 'skel', 0x8a86a0, [E([-2.3, 0.12, 4.2], [0.6, 0.03, 0.3])], 'The hollow inside the shell under the umbo. Its depth is used to tell species apart.');
  add(0, 'hg_interdent', 'interdentum', 'skel', 0xd0cde0, [E([-1.0, 0.13, 4.0], [0.5, 0.04, 0.12])], 'The smooth stretch of the hinge plate between the pseudocardinal teeth at the front and the lateral teeth behind.');

  /* ================= plate 1: gill, stomach, and small openings, vessels and nerves ================= */
  /* a block cut from one gill */
  var GX = -5.6, GZ = -1.6;
  add(1, 'gl_ctx', 'a block cut from a gill, enlarged', 'resp', 0xd9b89a, [T([[GX - 1.4, 0.1, GZ], [GX + 1.4, 0.1, GZ]], 0.04)], '', { x: 1, dull: 1 });
  add(1, 'gl_lamellae', 'lamellae of the gill', 'resp', 0xe3c4a4, [E([GX, 0.6, GZ - 0.3], [1.4, 0.5, 0.05]), E([GX, 0.6, GZ + 0.3], [1.4, 0.5, 0.05])], 'Each gill is a double sheet: an outer and an inner lamella, joined along their lower edge to make a long V-shaped pocket.');
  add(1, 'gl_junctions', 'interlamellar junctions', 'resp', 0xc9a07a, D.row(6, function (i) { return T([[GX - 1.25 + i * 0.5, 0.6, GZ - 0.28], [GX - 1.25 + i * 0.5, 0.6, GZ + 0.28]], [0.04, 0.04], { sy: 10 }); }), 'Partitions joining the two lamellae at intervals. They divide the space between them into vertical tubes.');
  add(1, 'gl_watertubes', 'water tubes', 'resp', 0x9ab8d9, D.row(5, function (i) { return E([GX - 1.0 + i * 0.5, 1.12, GZ], [0.18, 0.03, 0.2]); }), 'The vertical channels inside a gill. Water that has passed in through the pores rises through them.');
  add(1, 'gl_ostia', 'ostia of the gill', 'resp', 0x2a2420, D.row(18, function (i) { return E([GX - 1.2 + (i % 9) * 0.3, 0.35 + Math.floor(i / 9) * 0.4, GZ + 0.36], [0.035, 0.035, 0.012]); }), 'Rows of microscopic pores in the surface of the gill. Cilia round them draw water in and trap food particles on the outside.');
  add(1, 'gl_suprabr', 'suprabranchial chamber', 'resp', 0xbcd0e2, [T([[GX - 1.4, 1.35, GZ], [GX + 1.4, 1.35, GZ]], 0.2, { sy: 0.5 })], 'The passage above the gills into which all the water tubes open. It carries the filtered water back to the excurrent siphon.', { a: 0.7 });
  add(1, 'gl_groove', 'food groove', 'dig', 0xf0c64c, [T([[GX - 1.4, 0.08, GZ + 0.02], [GX + 1.4, 0.08, GZ + 0.02]], 0.05)], 'A ciliated gutter along the lower edge of the gill. Food trapped in mucus is carried forward along it to the labial palps and mouth.');
  add(1, 'gl_marsupium', 'marsupium (brood chamber)', 'repro', 0xe9c46a, [E([GX + 0.8, 0.55, GZ], [0.5, 0.42, 0.2])], 'In a female the water tubes of the outer gills swell with developing young. The gill doubles as a nursery.');
  add(1, 'gl_glochidia', 'glochidia', 'repro', 0x8a6a2a, D.row(7, function (i) { return E([GX + 0.5 + (i % 4) * 0.2, 0.4 + Math.floor(i / 4) * 0.3, GZ + 0.02], [0.05, 0.05, 0.05]); }), 'The larvae, like tiny snapping shells. They are shot out near a fish, clamp onto its gills or fins, and ride as parasites for a few weeks before dropping off.');
  /* the stomach, opened */
  var SX = -1.2, SZ = -1.9;
  add(1, 'st_ctx', 'stomach and intestine, opened', 'dig', K.stomach, [E([SX, 0.1, SZ], [0.9, 0.06, 0.7]), T([[SX + 0.6, 0.1, SZ + 0.2], [SX + 2.6, 0.1, SZ + 0.4]], 0.16)], '', { x: 1, dull: 1 });
  add(1, 'st_style', 'crystalline style', 'dig', 0xf4f8fa, [T([[SX + 0.1, 0.2, SZ], [SX + 2.4, 0.2, SZ + 0.38]], [0.06, 0.035])], 'A clear jelly rod that juts into the stomach and is spun by cilia. Its tip wears away, releasing starch-digesting enzymes and winding in the string of food and mucus. It dissolves within hours of death.', { a: 0.85 });
  add(1, 'st_sac', 'style sac', 'dig', 0xdcc0a0, [T([[SX + 1.0, 0.14, SZ + 0.3], [SX + 2.6, 0.14, SZ + 0.55]], 0.09)], 'The ciliated pouch off the stomach that makes and rotates the crystalline style.');
  add(1, 'st_shield', 'gastric shield', 'dig', 0xcfa55a, [E([SX - 0.45, 0.2, SZ - 0.1], [0.16, 0.04, 0.24])], 'A hard plate on the stomach wall against which the turning tip of the style grinds.');
  add(1, 'st_typhlo', 'typhlosole', 'dig', 0xc98f70, [T([[SX + 0.9, 0.2, SZ + 0.12], [SX + 2.5, 0.2, SZ + 0.3]], 0.03)], 'A ridge folded into the intestine along its length, increasing the surface that absorbs food.');
  /* heart region: vessels and the small openings */
  var HX = 3.4, HZ = -1.9;
  add(1, 'ht_ctx', 'ventricle wrapped round the rectum', 'circ', 0xd9a0a0, [E([HX, 0.14, HZ], [0.5, 0.1, 0.3]), T([[HX - 2.0, 0.12, HZ], [HX + 2.2, 0.12, HZ]], 0.07)], '', { x: 1, dull: 1 });
  add(1, 'ht_antaorta', 'anterior aorta', 'circ', K.artery, [T([[HX - 0.45, 0.24, HZ - 0.05], [HX - 1.9, 0.24, HZ - 0.12]], 0.04)], 'Leaves the front of the ventricle above the rectum, to the foot, the gut and the front of the mantle.');
  add(1, 'ht_postaorta', 'posterior aorta', 'circ', 0xd9564a, [T([[HX + 0.45, 0.06, HZ + 0.06], [HX + 2.0, 0.06, HZ + 0.14]], 0.04)], 'Leaves the rear of the ventricle below the rectum, to the rear of the mantle and the siphons.');
  add(1, 'ht_keber', 'pericardial gland (Keber’s organ)', 'exc', 0x7a4a3a, [E([HX - 0.9, 0.12, HZ + 0.45], [0.35, 0.06, 0.14])], 'Brownish tissue on the mantle at the front of the pericardial cavity. It removes wastes from the blood into the cavity.');
  add(1, 'ht_renoperi', 'renopericardial opening', 'exc', 0x2a2420, [E([HX - 0.3, 0.1, HZ + 0.42], [0.05, 0.03, 0.05])], 'A tiny hole in the floor of the pericardial cavity leading into the kidney. Fluid filtered from the heart drains through it.');
  add(1, 'ht_nephpore', 'nephridiopore', 'exc', 0x3a2a20, [E([HX + 0.35, 0.1, HZ + 0.62], [0.05, 0.03, 0.04])], 'The opening of the kidney into the chamber above the gills. Urine leaves in the outgoing water.');
  add(1, 'ht_genpore', 'genital pore', 'repro', 0x8a5a2a, [E([HX + 0.6, 0.1, HZ + 0.62], [0.05, 0.03, 0.04])], 'The opening of the gonad, just beside the nephridiopore. Sperm and eggs are shed into the outgoing water.');
  /* the nervous system */
  var NZ = 1.6;
  add(1, 'nv_ctx', 'the three pairs of ganglia', 'nerv', 0xf0c64c, [E([-4.4, 0.14, NZ - 0.35], [0.12, 0.06, 0.1]), E([-4.4, 0.14, NZ + 0.35], [0.12, 0.06, 0.1]), E([-1.6, 0.14, NZ + 1.4], [0.16, 0.06, 0.14]), E([3.6, 0.14, NZ], [0.2, 0.06, 0.18])], '', { x: 1 });
  add(1, 'nv_commissure', 'cerebral commissure', 'nerv', K.nerve, [T([[-4.4, 0.14, NZ - 0.35], [-4.75, 0.14, NZ], [-4.4, 0.14, NZ + 0.35]], 0.025)], 'A nerve arching over the gullet, joining the two cerebropleural ganglia.');
  add(1, 'nv_cerebroped', 'cerebropedal connectives', 'nerv', 0xfaf6d6, [T([[-4.4, 0.14, NZ + 0.35], [-3.0, 0.14, NZ + 1.2], [-1.6, 0.14, NZ + 1.4]], 0.022), T([[-4.4, 0.14, NZ - 0.35], [-3.1, 0.14, NZ + 0.9], [-1.7, 0.14, NZ + 1.32]], 0.022)], 'A pair of nerves from the ganglia beside the mouth down to the ganglia in the foot.');
  add(1, 'nv_cerebrovisc', 'cerebrovisceral connectives', 'nerv', K.nerve, [T([[-4.3, 0.14, NZ - 0.35], [0, 0.14, NZ - 0.5], [3.5, 0.14, NZ - 0.1]], 0.022), T([[-4.3, 0.14, NZ + 0.35], [0, 0.14, NZ + 0.2], [3.5, 0.14, NZ + 0.1]], 0.022)], 'A long pair of nerves running back through the body to the ganglia under the posterior adductor muscle.');
  add(1, 'nv_statocyst', 'statocysts', 'nerv', 0xdbe7ee, [E([-1.35, 0.2, NZ + 1.55], [0.05, 0.04, 0.05]), E([-1.85, 0.2, NZ + 1.55], [0.05, 0.04, 0.05])], 'A pair of tiny fluid-filled balance organs in the foot, beside the pedal ganglia.');
  add(1, 'nv_osphradium', 'osphradium', 'nerv', 0xd9c97a, [E([3.6, 0.2, NZ + 0.3], [0.14, 0.03, 0.06])], 'A patch of yellowish sensory tissue on the visceral ganglion, in the path of the incoming water. It tests the water for silt and chemicals.');

  return {
    steps: [
      { t: 'The shell in detail', view: { t: [2.0, 0.4, 1.2], d: 20, ph: 0.3 },
        how: D.ol(['Hold the shell with the hinge up and the umbo nearer the front. Name its four edges.', 'Find the few growth lines that are darker and deeper than the rest.', 'Snap a chip from the edge of an old shell and look at the broken face under magnification: three layers (enlarged, right).', 'Look along the hinge from inside (bottom).']) },
      { t: 'Gill, stomach, openings, vessels and nerves', view: { t: [-0.8, 0.4, 0], d: 20, ph: 0.3 },
        how: D.ol(['Cut a small square from a gill and look at its cut edge under magnification (upper left). The gill is a double sheet with tubes inside.', 'Slit the stomach in a freshly killed mussel to find the glassy <b>crystalline style</b> (top centre).', 'With a hand lens, search the floor of the pericardial cavity and the roof of the gill chamber for the three pairs of tiny openings (upper right).', 'Trace the fine yellow nerves that link the three pairs of ganglia (bottom).']) }
    ],
    parts: parts
  };
});
