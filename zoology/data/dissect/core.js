/* ============================================================
   core.js — helpers the specimen files use to describe anatomy.

   Shapes (all in tray coordinates: x head→tail, y up, z toward you):
     E(p, s, rot)        ellipsoid at p with radii s
     T(pts, r, opts)     tube through pts; r may be an array (taper);
                         opts.sy / opts.sz squash the cross-section,
                         opts.arc:[a0,a1] keeps only part of the wall
                         (0° = top, 90° = toward you) for cut-open bodies
     F(pts)              flat sheet (fin, flap, membrane)
     ST(a, b)            sheet stretched between two edges
     H(p, s, rot)        dome / half shell
     O(p, R, r, rot)     ring (torus)
     RG(p, ri, ro, rot)  flat ring (cut face)
     B(p, s, rot)        block
     M(shape)            also draw its mirror image across the midline

   P(id, name, system, step, colour, shapes, description, opts)
     opts.u   step at which the part is removed or reflected
     opts.sex 'm' or 'f' for structures only one sex has
     opts.x   context only: drawn, but not on the identification list
     opts.a   opacity
   ============================================================ */
window.DX = (function () {
  var list = [];
  function mk(t, base, o) { var s = { t: t }; for (var k in base) s[k] = base[k]; if (o) for (var j in o) s[j] = o[j]; return s; }
  var api = {
    list: list,
    E: function (p, s, rot, o) { return mk('e', { p: p, s: s, rot: rot }, o); },
    T: function (pts, r, o) { return mk('t', { pts: pts, r: r }, o); },
    F: function (pts, o) { return mk('f', { pts: pts }, o); },
    ST: function (a, b, o) { return mk('st', { a: a, b: b }, o); },
    H: function (p, s, rot, o) { return mk('h', { p: p, s: s, rot: rot }, o); },
    O: function (p, R, r, rot, o) { return mk('o', { p: p, R: R, r: r, rot: rot }, o); },
    RG: function (p, ri, ro, rot, o) { return mk('r', { p: p, ri: ri, ro: ro, rot: rot }, o); },
    B: function (p, s, rot, o) { return mk('b', { p: p, s: s, rot: rot }, o); },
    C: function (p, s, rot, o) { return mk('c', { p: p, s: s, rot: rot }, o); },
    M: function (shape) { shape.m = true; return shape; },
    P: function (id, n, sys, s, c, sh, d, o) { var p = { id: id, n: n, sys: sys, s: s, c: c, sh: Array.isArray(sh) ? sh : [sh], d: d }; if (o) for (var k in o) p[k] = o[k]; return p; },
    /* a body described by stations along x: returns helpers for wall sections and surface points.
       arc angles: 0 = top of the specimen as it lies, 90 = toward you. */
    kit: function (BX, BR, CY, SY) {
      var T = api.T;
      function body(i0, i1, arc, k, o) { var pts = [], r = []; for (var i = i0; i <= i1; i++) { pts.push([BX[i], CY, 0]); r.push(BR[i] * (k || 1)); } var opt = { sy: SY, arc: arc, rs: arc ? 12 : 20, seg: (i1 - i0) * 8 }; if (o) for (var q in o) opt[q] = o[q]; return T(pts, r, opt); }
      function rad(x) { var i = 0; while (i < BX.length - 2 && BX[i + 1] < x) i++; var f = Math.max(0, Math.min(1, (x - BX[i]) / (BX[i + 1] - BX[i]))); return BR[i] + (BR[i + 1] - BR[i]) * f; }
      function surf(x, a, k) { var r = rad(x) * (k || 1), ra = a * Math.PI / 180; return [x, CY + Math.cos(ra) * r * SY, Math.sin(ra) * r]; }
      /* a thin band of wall at station x (a rib, a ring, a groove) */
      function band(x, w, arc, k, o) { var opt = { sy: SY, arc: arc, rs: arc ? 10 : 18, seg: 1 }; if (o) for (var q in o) opt[q] = o[q]; return T([[x, CY, 0], [x + w, CY, 0]], [rad(x) * (k || 1), rad(x + w) * (k || 1)], opt); }
      return { body: body, surf: surf, rad: rad, band: band };
    },
    /* n points along a path: like row, but keeps each [x,y,z] whole */
    pts: function (n, fn) { var out = []; for (var i = 0; i < n; i++) out.push(fn(i, n > 1 ? i / (n - 1) : 0)); return out; },
    ol: function (items) { return '<ol>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>'; },
    /* n evenly spaced copies along a line */
    row: function (n, fn) { var out = []; for (var i = 0; i < n; i++) { var r = fn(i, n > 1 ? i / (n - 1) : 0); if (Array.isArray(r)) out = out.concat(r); else if (r) out.push(r); } return out; },
    add: function (spec) {
      var seen = {}; spec.parts.forEach(function (p) { if (seen[p.id]) throw new Error(spec.id + ': duplicate part ' + p.id); seen[p.id] = 1; if (p.s >= spec.steps.length) throw new Error(spec.id + ': part ' + p.id + ' step out of range'); });
      list.push(spec);
    },
    SYS: { ext: 'External', wall: 'Body wall', musc: 'Muscular', skel: 'Skeletal', dig: 'Digestive', resp: 'Respiratory', circ: 'Circulatory', exc: 'Excretory', repro: 'Reproductive', nerv: 'Nervous & senses', endo: 'Endocrine & lymphatic', wvs: 'Water vascular', other: 'Other' },
    /* a shared palette so the same tissue looks the same in every animal */
    K: { muscle: 0xc9796c, muscle2: 0xb96558, liver: 0x6e3b2c, heart: 0xa8372f, atrium: 0x7c2a2a, lung: 0xe9a9a6, stomach: 0xecc7ab, gut: 0xe3b193, gut2: 0xd9a07f, fat: 0xf0c64c, gall: 0x3d7d4c, spleen: 0x6b1f2c, pancreas: 0xf2d9a8, kidney: 0x8b3d33, testis: 0xf2e6b4, ovary: 0xe9c46a, egg: 0x3b3b3b, duct: 0xf6f1e6, bladder: 0xd8cdea, vein: 0x3f5faa, artery: 0xc2362b, nerve: 0xf5efc4, bone: 0xefe6d2, cart: 0xcfe2e8, gland: 0xe8b7c8, thyroid: 0x8a4a3a, thymus: 0xf0d6c8, brain: 0xe7c7b8, brain2: 0xd9b3a6, white: 0xf4f0e6, gill: 0xd23a44, skin: 0xd9c9a8, dark: 0x2c2c2c, flap: 0xcfa390, pin: 0xdfe6ea }
  };
  return api;
})();
