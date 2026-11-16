/* Sea star — atlas plate: the body plan, the skeleton of ossicles, a pedicellaria,
   and the axial complex, blood (hemal) system and stomach muscles in a section of the disc. */
DX.extend('seastar', function (B) {
  var D = DX, E = D.E, T = D.T, O = D.O, P = D.P, K = D.K;
  var parts = [];
  function add(p, id, n, sys, c, sh, d, o) { parts.push(P(id, n, sys, B + p, c, sh, d, o)); }
  var Y = 0.14, OR = 0xc97a4a, OR2 = 0xd9925e, OSS = 0xf0e6d2;
  var CX = -3.6, CZ = 0;
  function arm(kk, r) { var a = (90 + 72 * kk) * Math.PI / 180; return [CX + Math.cos(a) * r, CZ - Math.sin(a) * r]; }
  function ln(a, b, r, y) { return T([[a[0], y || Y, a[1]], [b[0], y || Y, b[1]]], r); }

  /* ---- body plan, from above ---- */
  var ctx = [E([CX, 0.12, CZ], [0.95, 0.1, 0.95]), E([arm(0.5, 0.6)[0], 0.24, arm(0.5, 0.6)[1]], [0.14, 0.04, 0.14])];
  for (var a5 = 0; a5 < 5; a5++) ctx.push(T([[arm(a5, 0.5)[0], 0.12, arm(a5, 0.5)[1]], [arm(a5, 3.0)[0], 0.12, arm(a5, 3.0)[1]]], [0.55, 0.14], { sy: 0.3 }));
  add(0, 'bp_ctx', 'sea star from above, with the madreporite', 'ext', OR, ctx, '', { x: 1, dull: 1 });
  add(0, 'bp_radius', 'radius', 'ext', 0xfaf4e2, [ln(arm(2, 0.2), arm(2, 3.0), 0.025, 0.3)], 'A line from the centre out along the middle of an arm. Structures on it are called radial: canals, nerves, blood strands.');
  add(0, 'bp_interradius', 'interradius', 'ext', 0x3a2a20, [ln(arm(2.5, 0.2), arm(2.5, 1.5), 0.025, 0.3)], 'A line from the centre out between two arms. The madreporite, the gonopores and the jaws of the mouth all lie on interradii.');
  function arc(k0, k1, r) { var pts = []; for (var t = 0; t <= 8; t++) { var p = arm(k0 + (k1 - k0) * t / 8, r); pts.push([p[0], 0.2, p[1]]); } return T(pts, 0.035); }
  add(0, 'bp_bivium', 'bivium', 'ext', 0xf0c64c, [arc(-0.2, 1.2, 3.3)], 'The two arms on either side of the madreporite, bracketed here. They give a five-rayed animal a left and a right.');
  add(0, 'bp_trivium', 'trivium', 'ext', 0x9ab8d9, [arc(1.8, 4.2, 3.3)], 'The other three arms. A sea star usually moves with one of these in front.');
  add(0, 'bp_carinal', 'carinal ossicles', 'skel', OSS, D.row(9, function (i) { var p = arm(4, 0.8 + i * 0.25); return E([p[0], 0.22, p[1]], [0.07, 0.05, 0.07]); }), 'A row of skeletal plates along the ridge of each arm, each carrying a spine.');
  add(0, 'bp_marginal', 'marginal ossicles', 'skel', 0xe2d6bd, D.row(8, function (i) { var p = arm(3, 0.9 + i * 0.25), q = arm(3.25, 0.9 + i * 0.25); return [E([p[0] + (q[0] - p[0]) * 0.45, 0.16, p[1] + (q[1] - p[1]) * 0.45], [0.06, 0.04, 0.06])]; }), 'Plates along the edge of each arm, where the upper and lower surfaces meet.');
  add(0, 'bp_gonopores', 'gonopores', 'repro', 0x2a2420, [0.5, 1.5, 2.5, 3.5, 4.5].map(function (kk) { var p = arm(kk - 0.12, 0.95), q = arm(kk + 0.12, 0.95); return [E([p[0], 0.22, p[1]], [0.04, 0.03, 0.04]), E([q[0], 0.22, q[1]], [0.04, 0.03, 0.04])]; }).reduce(function (x, y) { return x.concat(y); }, []), 'Ten minute holes, a pair in each angle between the arms, on the upper surface. Eggs or sperm are shed straight into the sea through them.');
  add(0, 'bp_terminal', 'terminal tentacles', 'nerv', 0xf0d6c8, [0, 1, 2, 3, 4].map(function (kk) { var p = arm(kk, 3.0), q = arm(kk, 3.25); return T([[p[0], 0.14, p[1]], [q[0], 0.2, q[1]]], [0.04, 0.015]); }), 'A single long tube foot without a sucker at the very tip of each arm, beside the eyespot. It feels and smells the way ahead.');

  /* ---- one pedicellaria, enlarged ---- */
  var PX = 1.6, PZ = -2.7;
  add(0, 'pd_jaws', 'jaws (valves) of a pedicellaria', 'ext', OSS, [T([[PX - 0.12, 0.7, PZ], [PX - 0.22, 1.1, PZ], [PX - 0.05, 1.4, PZ]], [0.1, 0.09, 0.02]), T([[PX + 0.12, 0.7, PZ], [PX + 0.22, 1.1, PZ], [PX + 0.05, 1.4, PZ]], [0.1, 0.09, 0.02])], 'Two tiny chalky blades that snap shut like forceps on anything that settles on the skin. Shown on one pedicellaria, greatly enlarged.');
  add(0, 'pd_basal', 'basal piece of a pedicellaria', 'ext', 0xe2d6bd, [E([PX, 0.62, PZ], [0.2, 0.1, 0.14])], 'A third ossicle on which the two jaws hinge.');
  add(0, 'pd_muscles', 'muscles of a pedicellaria', 'musc', K.muscle, [T([[PX - 0.15, 0.85, PZ + 0.02], [PX + 0.15, 0.85, PZ + 0.02]], 0.04), T([[PX - 0.2, 0.6, PZ], [PX - 0.26, 0.95, PZ]], 0.025), T([[PX + 0.2, 0.6, PZ], [PX + 0.26, 0.95, PZ]], 0.025)], 'One muscle between the jaws closes them; a pair on the outside opens them.');
  add(0, 'pd_stalk', 'stalk of a pedicellaria', 'ext', OR2, [T([[PX, 0.05, PZ], [PX, 0.55, PZ]], [0.1, 0.07])], 'The soft, flexible stem. Pedicellariae cluster on stalks round the base of each spine.');

  /* ---- the lower surface of part of an arm: ossicles of the groove ---- */
  var GX = 5.0, GZ = -2.6;
  add(0, 'gr_ctx', 'ambulacral groove with the tube feet removed', 'skel', OR2, [E([GX, 0.08, GZ], [1.9, 0.04, 0.9])].concat(D.row(8, function (i) { return [ln([GX - 1.6 + i * 0.45, GZ - 0.05], [GX - 1.6 + i * 0.45, GZ - 0.6], 0.06), ln([GX - 1.6 + i * 0.45, GZ + 0.05], [GX - 1.6 + i * 0.45, GZ + 0.6], 0.06)]; })), '', { x: 1, dull: 1 });
  add(0, 'gr_adamb', 'adambulacral ossicles', 'skel', OSS, D.row(9, function (i) { return [E([GX - 1.7 + i * 0.42, 0.16, GZ - 0.75], [0.14, 0.05, 0.09]), E([GX - 1.7 + i * 0.42, 0.16, GZ + 0.75], [0.14, 0.05, 0.09])]; }), 'A row of small plates along each lip of the groove. They carry the movable spines that close over the tube feet.');
  add(0, 'gr_pores', 'ambulacral pores', 'wvs', 0x2a2420, D.row(7, function (i) { return [E([GX - 1.38 + i * 0.45, 0.14, GZ - 0.3 - (i % 2) * 0.14], [0.05, 0.03, 0.05]), E([GX - 1.38 + i * 0.45, 0.14, GZ + 0.3 + (i % 2) * 0.14], [0.05, 0.03, 0.05])]; }), 'Holes between neighbouring ambulacral ossicles. The stem joining each tube foot to its ampulla passes through one.');
  add(0, 'gr_hemal', 'radial hemal strand', 'circ', 0xb5453c, [ln([GX - 1.8, GZ], [GX + 1.8, GZ], 0.03, 0.2)], 'A thin strand of tissue and fluid-filled spaces along the roof of the groove, between the radial canal and the radial nerve. It is what a sea star has in place of blood vessels.');

  /* ---- the disc cut down the middle through the madreporite ---- */
  var SX = 3.4, SZ = 2.1;
  function sp(x, z) { return [SX + x, Y, SZ + z]; }
  add(0, 'ds_ctx', 'disc, cut down the middle: body wall, stomachs, stone canal and mouth', 'wall', OR, [T([sp(-2.6, 0.2), sp(-2.0, -1.0), sp(0, -1.3), sp(2.0, -1.0), sp(2.6, 0.2)], 0.09), T([sp(-2.6, 0.2), sp(-0.5, 0.75)], 0.09), T([sp(0.5, 0.75), sp(2.6, 0.2)], 0.09), E(sp(0, -0.2), [1.1, 0.06, 0.5]), E(sp(0, -0.85), [0.6, 0.06, 0.2]), T([sp(-1.5, -1.12), sp(-1.25, -0.2), sp(-0.9, 0.55)], 0.04), E(sp(-1.55, -1.2), [0.18, 0.06, 0.07])], '', { x: 1, dull: 1 });
  add(0, 'ds_epidermis', 'epidermis', 'ext', 0xe9a070, [T([sp(-2.05, -1.12), sp(0, -1.43), sp(2.05, -1.12)], 0.035)], 'The thin living skin that covers the whole animal, spines and all. The skeleton is inside the body, as ours is.');
  add(0, 'ds_peritoneum', 'peritoneum', 'wall', 0xf0d6c8, [T([sp(-1.9, -0.88), sp(0, -1.16), sp(1.9, -0.88)], 0.03)], 'The ciliated lining of the body cavity. Its cilia keep the coelomic fluid moving; that fluid carries food and oxygen round the body.');
  add(0, 'ds_ampulla', 'madreporic ampulla', 'wvs', 0xdbe7ee, [E(sp(-1.42, -1.0), [0.1, 0.06, 0.08])], 'A small swelling just under the madreporite where the stone canal begins.');
  add(0, 'ds_axialorgan', 'axial organ', 'circ', 0x8a4a3a, [T([sp(-1.36, -0.95), sp(-1.1, -0.2), sp(-0.78, 0.5)], 0.06)], 'A dark, spongy strand running beside the stone canal. It is part of the hemal system and makes some of the wandering cells of the body fluid.');
  add(0, 'ds_axialsinus', 'axial sinus', 'circ', 0xe6d2c0, [T([sp(-1.2, -0.95), sp(-0.95, -0.2), sp(-0.62, 0.5)], 0.1, { sy: 0.3 })], 'A thin-walled tube of coelom enclosing both the stone canal and the axial organ.', { a: 0.6 });
  add(0, 'ds_oralhemal', 'oral hemal ring', 'circ', 0xb5453c, [E(sp(-0.72, 0.66), [0.07, 0.04, 0.05]), E(sp(0.72, 0.66), [0.07, 0.04, 0.05])], 'A ring of hemal tissue round the mouth, cut through twice in this section. A radial strand runs from it into each arm.');
  add(0, 'ds_oraloss', 'oral ossicles', 'skel', OSS, [E(sp(-0.5, 0.8), [0.14, 0.06, 0.1]), E(sp(0.5, 0.8), [0.14, 0.06, 0.1])], 'Five pairs of stout plates forming the corners of the mouth frame.');
  add(0, 'ds_gonoduct', 'gonoduct', 'repro', 0xe9c9a0, [T([sp(1.5, -0.5), sp(1.75, -0.9), sp(1.8, -1.12)], 0.025)], 'A short tube from each gonad up to its gonopore on the upper surface.');
  add(0, 'ds_retractors', 'retractor muscles of the stomach', 'musc', K.muscle, [T([sp(0.5, -0.2), sp(1.6, 0.3)], 0.03), T([sp(-0.3, -0.2), sp(-0.2, 0.45)], 0.03)], 'Five pairs of muscles from the ambulacral ridges to the stomach. They pull the stomach back in after it has been pushed out of the mouth to digest prey.');
  add(0, 'ds_ligaments', 'gastric ligaments', 'dig', 0xf4f0e6, [T([sp(0.3, -0.85), sp(0.9, -1.1)], 0.02), T([sp(0.8, -0.2), sp(1.7, -0.75)], 0.02)], 'Sheets of connective tissue that tie the stomach to the body wall and stop it being pushed out too far.');

  return {
    steps: [
      { t: 'Body plan, skeleton and fine structure', view: { t: [0.6, 0.4, -0.2], d: 20, ph: 0.3 },
        how: D.ol(['A sea star is built on five rays. The arms lie on <b>radii</b>; the madreporite and the gonopores lie between them, on <b>interradii</b> (left).', 'Scrape off a little skin near a spine and look at it in a drop of water under magnification to see a <b>pedicellaria</b> (enlarged, top).', 'Pull the tube feet out of one groove and brush it clean to see the plates and the pores between them (upper right).', 'Cut the disc straight down through the madreporite and the mouth, and look at the cut face (lower right).']) }
    ],
    parts: parts
  };
});
