/* Cow eye. Pose: cornea to the left, optic nerve to the right. */
(function () {
  var D = DX, E = D.E, T = D.T, F = D.F, ST = D.ST, H = D.H, O = D.O, RG = D.RG, P = D.P, K = D.K, I = D.ol;
  var CY = 2.05, R = 2.0;
  var parts = [], add = function () { parts.push(P.apply(null, arguments)); };

  /* ---------------- 0 as it arrives ---------------- */
  add('sclera', 'sclera', 'nerv', 0, 0xf2efe8, [E([0, CY, 0], [R, R, R], null, { q: 28 })], 'The tough, white outer coat of the eyeball: the “white of the eye”. It keeps the eye’s shape and is the anchor for the muscles that move it.', { u: 2 });
  add('cornea', 'cornea', 'nerv', 0, 0x9fb6c4, [H([-1.52, CY, 0], [1.25, 0.82, 1.4], [0, 0, 90], { th: 85 })], 'The clear window at the front, continuous with the sclera. It does most of the eye’s focusing. In a preserved eye it has turned cloudy blue-grey.', { u: 2, a: 0.9 });
  add('pupil_ext', 'iris and pupil, seen through the cornea', 'nerv', 0, 0x1c1c22, [E([-1.72, CY, 0], [0.12, 0.75, 1.2])], 'A cow’s pupil is a horizontal oval, giving a grazing animal a wide view of the horizon.', { u: 2, x: 1 });
  add('opticnerve', 'optic nerve', 'nerv', 0, 0xf7f1e2, [T([[1.85, CY - 0.25, 0.15], [2.6, CY - 0.3, 0.2], [3.3, CY - 0.3, 0.3]], [0.36, 0.33, 0.3])], 'A solid white cord as thick as a pencil leaving the back of the eye, slightly off centre. It carries about a million fibres from the retina to the brain. Pinch it: it is solid, not a tube.', { u: 2 });
  add('fat', 'fat', 'other', 0, 0xf0d98a, D.row(9, function (i) { var a = i * 0.7; return E([1.0 + (i % 3) * 0.45, CY + Math.cos(a) * 1.45, Math.sin(a) * 1.5], [0.7, 0.5, 0.55]); }), 'Yellow cushions packed around the back of the eyeball. In life they pad the eye in its bony socket.', { u: 1 });
  add('muscles', 'extrinsic eye muscles', 'musc', 0, 0x9a4a40, [[0, 1.0], [0, -1.0], [1.0, 0], [-1.0, 0]].map(function (d) { return T([[2.9, CY + d[0] * 0.5, d[1] * 0.5], [1.4, CY + d[0] * 1.75, d[1] * 1.75], [-0.4, CY + d[0] * 2.02, d[1] * 2.02]], [0.2, 0.36, 0.3], { sy: d[0] ? 0.35 : 1, sz: d[1] ? 0.35 : 1 }); }).concat([T([[1.6, CY + 1.5, 1.2], [0.4, CY + 1.6, 1.35], [-0.5, CY + 1.2, 1.7]], [0.16, 0.24, 0.18], { sy: 0.4 })]), 'Flat, reddish-brown straps attached to the sclera: four straight (rectus) muscles and two oblique ones in ours, with an extra retractor in a cow. They swing the eye in its socket. Trim them back to their attachments.', { u: 1 });

  /* ---------------- 2 cut in two around the equator ---------------- */
  var PX = 3.2, AX = -3.2, BY = 1.95;                      /* the two halves, each sitting like a bowl */
  add('p_sclera', 'sclera (back half)', 'nerv', 2, 0xf2efe8, [H([PX, BY, 0], [R, R - 0.1, R], [180, 0, 0], { th: 88 }), T([[PX + 0.2, 0.25, 0.1], [PX + 0.9, 0.12, 0.3]], 0.3)], 'The back half of the eye, set down like a cup with the stump of the optic nerve underneath. Look at the cut edge: three coats, sclera outside, dark choroid in the middle, pale retina inside.', { x: 1 });
  add('a_sclera', 'sclera (front half)', 'nerv', 2, 0xf2efe8, [H([AX, BY, 0], [R, R - 0.1, R], [180, 0, 0], { th: 62, s: [R, R - 0.1, R] })], 'The front half, set down on the cornea.', { x: 1 });
  add('vitreous', 'vitreous humor', 'nerv', 2, 0xdfeaf0, [E([PX, BY - 0.25, 0], [1.6, 1.25, 1.6], null, { q: 22 })], 'A clear, firm jelly that fills the back two-thirds of the eye and holds the retina against the wall. It slides out in one lump when the eye is opened.', { u: 3, a: 0.55 });
  add('lens', 'lens', 'nerv', 2, 0xf0ead2, [E([AX, BY - 0.35, 0], [0.82, 0.55, 0.82], null, { q: 22 })], 'A hard, clear (cloudy when preserved) disc behind the iris, thicker in the middle. Muscles change its shape to fine-focus the image on the retina. Lift it out and hold it over print: it magnifies.', { u: 4 });

  /* ---------------- 3 the back half ---------------- */
  add('choroid', 'choroid', 'nerv', 3, 0x1e1a24, [H([PX, BY, 0], [R * 0.95, (R - 0.1) * 0.95, R * 0.95], [180, 0, 0], { th: 86 })], 'The middle coat: thin, black and full of blood vessels. Its pigment soaks up stray light, like the black paint inside a camera, and its vessels feed the retina.');
  add('tapetum', 'tapetum lucidum', 'nerv', 3, 0x3ab0c0, [H([PX - 0.25, BY, -0.15], [R * 0.93, (R - 0.1) * 0.93, R * 0.93], [180, 0, 0], { th: 48 })], 'A shimmering blue-green patch of the choroid, behind the retina. It reflects light back through the retina for a second chance at catching it, improving night vision; it is what makes a cow’s, cat’s or deer’s eyes shine in headlights. Owls have none; neither do we.');
  add('retina', 'retina', 'nerv', 3, 0xe9dcc2, [ST([[PX + 0.2, 0.33, 0.1], [PX + 0.2, 0.33, 0.1], [PX + 0.2, 0.33, 0.1], [PX + 0.2, 0.33, 0.1], [PX + 0.2, 0.33, 0.1]], [[PX - 0.9, 0.75, 0.9], [PX + 0.2, 0.95, 1.3], [PX + 1.2, 0.8, 0.5], [PX + 0.9, 0.9, -0.9], [PX - 0.5, 0.85, -1.1]]), ST([[PX + 0.2, 0.33, 0.1], [PX + 0.2, 0.33, 0.1], [PX + 0.2, 0.33, 0.1]], [[PX - 0.5, 0.85, -1.1], [PX - 1.2, 0.7, -0.2], [PX - 0.9, 0.75, 0.9]])], 'The innermost coat: a thin, soft, cream-coloured film that has wrinkled and come loose. It holds the rods and cones that turn light into nerve signals. It is attached at only one point, where its nerve fibres leave.', { a: 0.92 });
  add('opticdisc', 'optic disc (blind spot)', 'nerv', 3, 0xfaf6ea, [E([PX + 0.2, 0.32, 0.1], [0.2, 0.06, 0.2])], 'The small pale spot where the retina’s nerve fibres gather and pass out through the wall as the optic nerve. There are no light-sensitive cells here, so every eye has a blind spot.', { small: true });

  /* ---------------- 4 the front half ---------------- */
  add('ciliary', 'ciliary body', 'nerv', 4, 0x24202a, [O([AX, BY - 0.45, 0], 1.25, 0.26, [90, 0, 0], { s: [1, 1, 0.6] })].concat(D.row(30, function (i) { var a = i * Math.PI / 15; return T([[AX + Math.cos(a) * 1.02, BY - 0.36, Math.sin(a) * 1.02], [AX + Math.cos(a) * 1.5, BY - 0.3, Math.sin(a) * 1.5]], 0.02); })), 'A dark ring of muscle and ridged tissue around the edge of the lens, at the front of the choroid. Its muscle pulls on the lens to focus; its ridges make the aqueous humor.');
  add('suspens', 'suspensory ligament', 'nerv', 4, 0xf7f3ea, D.row(20, function (i) { var a = i * Math.PI / 10 + 0.1; return T([[AX + Math.cos(a) * 0.8, BY - 0.38, Math.sin(a) * 0.8], [AX + Math.cos(a) * 1.08, BY - 0.42, Math.sin(a) * 1.08]], 0.012); }), 'Fine, clear fibres running like spokes from the ciliary body to the rim of the lens, holding it in place. They can be seen as the lens is lifted away.', { small: true });
  add('iris', 'iris', 'nerv', 4, 0x4a3a2a, [RG([AX, BY - 0.95, 0], 0.55, 1.3, [-90, 0, 0])], 'The coloured ring in front of the lens, brown in a cow. It is a muscle that widens or narrows the pupil to control how much light enters.');
  add('pupil', 'pupil', 'nerv', 4, 0x0a0a0a, [E([AX, BY - 0.97, 0], [0.55, 0.02, 0.36])], 'Not a structure but a hole: the opening in the middle of the iris through which light passes to the lens.');
  add('aqueous', 'aqueous humor (anterior chamber)', 'nerv', 4, 0xcfe6ee, [E([AX, BY - 1.35, 0], [1.1, 0.3, 1.25])], 'The watery fluid filling the space between the cornea and the lens. It feeds the cornea and lens, which have no blood vessels, and keeps the front of the eye inflated. It drains away when the eye is cut.', { a: 0.4 });
  add('a_cornea', 'cornea, from inside', 'nerv', 4, 0x9fb6c4, [H([AX, BY - 1.25, 0], [1.3, 0.55, 1.42], [180, 0, 0], { th: 80 })], 'The cornea seen from behind, forming the floor of the cup. Cut through it: it is tough and built in layers.', { x: 1, a: 0.85 });

  D.add({
    id: 'eye', name: 'Cow eye', sci: 'Bos taurus', group: 'organ', icon: '👁️', len: 11, thick: 4.1, tray: [13, 8],
    view: { t: [0, 1.6, 0], d: 14, ph: 0.6 },
    blurb: 'A camera in three coats: cornea, iris, lens, vitreous, retina, and the shimmering tapetum behind it.',
    about: 'A cow’s eye is big enough to take apart with ordinary tools and has every part a human eye has, plus one we lack: the reflective tapetum that makes animals’ eyes shine at night. Comparing it with what owls have instead (enormous tubular eyes, a retina packed with rods, and no tapetum) is a good exercise for a bird bander.',
    cls: [['Class', 'Mammalia'], ['Order', 'Artiodactyla'], ['Family', 'Bovidae'], ['Genus', 'Bos']],
    orient: 'Cornea to your left, optic nerve to your right. After the cut, the two halves sit like cups: the front half on the left, the back half on the right.',
    tools: 'Dissecting tray, sharp scalpel, scissors, forceps, probe. Goggles: the eye is under pressure and fluid can squirt.',
    care: 'The sclera is very tough and slippery. Make the first puncture carefully with the tip of the scalpel, pointing away from you, then finish the cut with scissors.',
    q: 'cow eye dissection', photoQ: 'cow eye dissection',
    steps: [
      { t: 'The eye as it arrives', how: I(['The eyeball is half buried in yellow <b>fat</b> and reddish <b>muscle</b>.', 'Find the cloudy <b>cornea</b> at the front and, through it, the dark <b>iris and pupil</b>.', 'The white coat is the <b>sclera</b>.', 'At the back find the stump of the <b>optic nerve</b>.']) },
      { t: 'Trim the fat and muscle', how: I(['Cut the fat and muscle away with scissors, close to the eyeball, until the sclera is clean.', 'Leave the optic nerve in place.', 'Notice where the muscles were attached.']) },
      { t: 'Cut the eye in half', cut: [[[0, CY + 2.02, 0.0], [0, CY + 1.43, 1.43], [0, CY, 2.02]], [[0, CY, 2.02], [0, CY - 1.3, 1.5]]], view: { t: [0, 1.4, 0], d: 14, ph: 0.45 }, how: I(['Hold the eye firmly. Puncture the sclera with the scalpel tip halfway between cornea and optic nerve.', 'Put the scissors into the hole and cut all the way around the equator, separating a front half and a back half.', 'Clear jelly, the <b>vitreous humor</b>, fills the back half. In the front half the <b>lens</b> sits like a marble.', 'Set the two halves down as cups.']) },
      { t: 'The back half', view: { t: [3.2, 1.0, 0], d: 6.5, ph: 0.28 }, how: I(['Tip out the vitreous humor.', 'The thin cream film lining the cup is the <b>retina</b>. It is loose except at one spot, the <b>optic disc</b>.', 'Push the retina aside. Beneath it is the black <b>choroid</b>, part of which is the shining blue-green <b>tapetum lucidum</b>.', 'Outside the choroid is the white sclera.']) },
      { t: 'The front half', view: { t: [-3.2, 1.0, 0], d: 6.5, ph: 0.28 }, how: I(['Lift the lens out, noticing the fine <b>suspensory ligament</b> fibres letting go. Look at print through the lens.', 'The dark ridged ring that held it is the <b>ciliary body</b>.', 'Below is the <b>iris</b> with the <b>pupil</b> at its centre.', 'Under the iris was the watery <b>aqueous humor</b>, and the floor of the cup is the cornea.']) }
    ],
    parts: parts
  });
})();
