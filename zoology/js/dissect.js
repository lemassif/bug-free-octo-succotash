/* ============================================================
   dissect.js — the Dissection Lab section.

   Gallery of specimens, a "before you cut" primer, and the lab
   itself: a 3D specimen (dissect3d.js) beside a panel with four
   tabs. Steps walks through the real procedure, including tracing
   each incision; Structures is a searchable atlas of every part;
   Practical is a pinned-station exam; About has the why, the
   safety, and real photographs and videos.

   Identification is tracked per structure, so each specimen has a
   true 100% to reach, and it persists like everything else.
   ============================================================ */
(function () {
  var esc = Media.esc;
  var GROUPS = [['invert', 'Invertebrates'], ['fish', 'Fishes'], ['herp', 'Amphibian'], ['bird', 'Bird'], ['mammal', 'Mammals'], ['organ', 'Mammal organs']];
  var lab = null;

  function prog(id) { var p = Store.get('dissect.' + id, null) || {}; p.cuts = p.cuts || {}; p.ids = p.ids || {}; p.best = p.best || 0; p.step = p.step || 0; return p; }
  function save() { if (lab) Store.set('dissect.' + lab.spec.id, lab.P); }
  function idParts(spec) { return spec.parts.filter(function (p) { return !p.x; }); }
  function counts(spec) { var p = prog(spec.id), all = idParts(spec); return { done: all.filter(function (x) { return p.ids[x.id]; }).length, total: all.length, best: p.best }; }
  function shuffle(a) { a = a.slice(); for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function hex(c) { return '#' + ('000000' + (c || 0xcccccc).toString(16)).slice(-6); }
  function sexTag(p) { return p.sex === 'm' ? ' <span class="tag">♂</span>' : p.sex === 'f' ? ' <span class="tag">♀</span>' : ''; }
  function totals() { var d = 0, t = 0, full = 0; DX.list.forEach(function (s) { var c = counts(s); d += c.done; t += c.total; if (c.done === c.total) full++; }); return { done: d, total: t, full: full }; }
  window.DissectStats = totals;
  window.DissectLab = function () { return lab; };

  /* ------------------------------------------------------------ gallery */
  function renderGallery(el) {
    var T = totals();
    el.innerHTML = '<section class="hero" style="background:linear-gradient(135deg,#263238,#3d5560 70%,#6f8f9c)"><h1>Dissection Lab</h1><p class="lede">' + DX.list.length + ' specimens from first- and second-year biology and anatomy labs, each built in 3D so you can turn it over, trace every incision with a scalpel, lift organs out layer by layer, and pin and name every structure a lab practical could ask for. ' + T.total + ' structures in all.</p>' +
      '<div class="row"><a class="btn monarch" href="#/dissect/basics">Before you cut: directions, tools, safety</a></div></section>' +
      '<div class="card"><div class="row between"><b>' + T.done + ' of ' + T.total + ' structures identified</b><span class="muted small">' + T.full + ' of ' + DX.list.length + ' specimens at 100%</span></div><div class="bar" style="margin-top:6px"><i style="width:' + (100 * T.done / Math.max(1, T.total)) + '%"></i></div></div>' +
      GROUPS.map(function (g) {
        var sp = DX.list.filter(function (s) { return s.group === g[0]; }); if (!sp.length) return '';
        return '<h2>' + g[1] + '</h2><div class="grid">' + sp.map(function (s) {
          var c = counts(s);
          return '<a class="card" href="#/dissect/' + s.id + '" style="text-decoration:none;color:inherit"><div class="row between"><div style="font-size:34px">' + s.icon + '</div>' + (c.done === c.total ? '<span class="tag ok">100%</span>' : '<span class="tag">' + c.done + '/' + c.total + '</span>') + '</div><h3 style="margin:6px 0 0">' + esc(s.name) + '</h3><div class="sci muted small">' + esc(s.sci) + '</div><p class="small muted" style="margin:6px 0 8px">' + esc(s.blurb) + '</p><div class="bar"><i style="width:' + (100 * c.done / c.total) + '%"></i></div><div class="small muted" style="margin-top:6px">' + s.steps.length + ' steps · ' + c.total + ' structures' + (c.best ? ' · practical best ' + c.best + '%' : '') + '</div></a>';
        }).join('') + '</div>';
      }).join('') +
      '<p class="small muted" style="margin-top:24px">The models are diagrams you can handle, not photographs: proportions are tidied so that every structure can be seen and tapped. Each specimen’s About tab pulls real dissection photographs and videos to compare against.</p>';
  }

  /* ------------------------------------------------------------ primer */
  var TERMS = [
    ['Anterior (cranial)', 'toward the head'], ['Posterior (caudal)', 'toward the tail'], ['Dorsal', 'toward the back'], ['Ventral', 'toward the belly'],
    ['Medial', 'toward the midline'], ['Lateral', 'away from the midline'], ['Proximal', 'nearer the point of attachment'], ['Distal', 'farther from the point of attachment'],
    ['Superficial', 'nearer the surface'], ['Deep', 'farther from the surface'], ['Sagittal plane', 'divides left from right'], ['Transverse plane', 'divides anterior from posterior (a cross-section)'], ['Frontal (coronal) plane', 'divides dorsal from ventral']
  ];
  function renderBasics(el) {
    el.innerHTML = '<p><a href="#/dissect">← Dissection Lab</a></p><h2 style="margin-top:0">Before you cut</h2><p class="lede">To dissect is to expose, not to cut up. Nine-tenths of a good dissection is done with blunt tools: lifting, separating and tracing. The scalpel opens the door and then mostly rests.</p>' +
      '<div class="grid"><div class="card"><h3>Directions and planes</h3><table>' + TERMS.map(function (t) { return '<tr><td><b>' + t[0] + '</b></td><td class="small">' + t[1] + '</td></tr>'; }).join('') + '</table><p class="small muted">Left and right always mean the animal’s own left and right. A specimen pinned belly-up with its head away from you has its right on your left.</p></div>' +
      '<div class="card"><h3>The kit</h3><ul class="small"><li><b>Dissecting tray</b> with a wax or foam bed, and <b>pins</b> set at 45° leaning away from the specimen so flaps stay open and your hands stay clear.</li><li><b>Scissors</b>: the main cutting tool. Keep the blunt tip inside the body and lift as you cut, so the tips never touch the organs.</li><li><b>Scalpel</b>: shallow skin incisions only; cut away from yourself and from the hand that steadies the specimen.</li><li><b>Forceps</b> to lift tissue before every cut; <b>blunt probe</b> to separate organs and follow ducts and vessels; <b>teasing needle</b> for membranes.</li><li><b>Pipette and water</b> to float thin membranes and keep tissue from drying.</li></ul></div>' +
      '<div class="card"><h3>Safety</h3><ul class="small"><li>Goggles, gloves and an apron or lab coat. Preserved specimens are stored in holding fluids that irritate eyes and skin; rinse the specimen and work with ventilation.</li><li>Blades go into the sharps container, never the bin. Pass tools handle first.</li><li>No food or drink in the lab. Wash hands when gloves come off.</li><li>Wrap the specimen in damp towel inside a labelled bag between sessions.</li><li>Tissue goes in the specimen waste container, never down the sink.</li></ul></div>' +
      '<div class="card"><h3>Technique that examiners notice</h3><ul class="small"><li>Read the whole step before you cut. Identify from the outside first.</li><li>Cut shallow, then look. You can always cut more.</li><li>Follow a structure to both ends before you name it: a tube’s name comes from what it connects.</li><li>Reflect (fold back) rather than remove whenever you can; removed organs lose their relationships.</li><li>Draw what you see, not what the manual shows. Label drawings with ruled lines that do not cross.</li></ul></div>' +
      '<div class="card"><h3>Where specimens come from</h3><p class="small">Fetal pigs are a by-product of the pork industry; sheep and cow organs come from meat processing; frogs, perch and invertebrates are supplied by biological houses, some farm-raised and some wild-caught. It is reasonable to ask a department where its specimens come from and what alternatives it offers. Models like these are a good rehearsal: students who know the map before they open the animal need fewer animals and learn more from each.</p></div></div>' +
      '<h2>Check yourself: directions</h2><div id="dxTermQuiz"></div>';
    var qs = shuffle(TERMS).slice(0, 6), i = 0, score = 0, box = document.getElementById('dxTermQuiz');
    (function q() {
      if (i >= qs.length) { box.innerHTML = '<div class="card"><h3>' + score + ' / ' + qs.length + '</h3><div class="row"><a class="btn primary" href="#/dissect">Choose a specimen</a></div></div>'; if (score === qs.length) { Store.set('dissectBasics', true); App.checkBadges(); } return; }
      var Q = qs[i]; var opts = shuffle([Q].concat(shuffle(TERMS.filter(function (t) { return t !== Q; })).slice(0, 3)));
      box.innerHTML = '<div class="card"><p class="muted small">Question ' + (i + 1) + ' of ' + qs.length + '</p><p><b>Which term means “' + esc(Q[1]) + '”?</b></p><div class="choices">' + opts.map(function (o, k) { return '<button class="choice" data-k="' + k + '">' + esc(o[0]) + '</button>'; }).join('') + '</div></div>';
      var done = false;
      box.querySelectorAll('.choice').forEach(function (b) { b.onclick = function () { if (done) return; done = true; var o = opts[+b.getAttribute('data-k')]; b.classList.add(o === Q ? 'right' : 'wrong'); if (o === Q) score++; box.querySelectorAll('.choice').forEach(function (bb, k) { if (opts[k] === Q) bb.classList.add('right'); }); setTimeout(function () { i++; q(); }, 800); }; });
    })();
  }

  /* ------------------------------------------------------------ lab */
  function part(id) { return lab.spec.parts.filter(function (p) { return p.id === id; })[0]; }
  function stepParts(i) { return idParts(lab.spec).filter(function (p) { return p.s === i; }); }
  function renderLab(el, id, tab) {
    var spec = DX.list.filter(function (s) { return s.id === id; })[0];
    if (!spec) { renderGallery(el); return; }
    if (!window.Dissect3D) { el.innerHTML = '<div class="card"><p>Loading the 3D lab… If this stays, your browser may not support WebGL.</p></div>'; setTimeout(function () { if (location.hash.indexOf('#/dissect/' + id) === 0 && !lab) App.route(); }, 500); return; }
    var P = prog(id);
    el.innerHTML = '<p style="margin-bottom:6px"><a href="#/dissect">← All specimens</a></p>' +
      '<div class="row between" style="margin-bottom:8px"><h2 style="margin:0">' + spec.icon + ' ' + esc(spec.name) + ' <span class="sci muted" style="font-size:16px;font-weight:400">' + esc(spec.sci) + '</span></h2><div style="min-width:220px;flex:1;max-width:360px"><div class="small muted" id="dxProgTxt"></div><div class="bar"><i id="dxProgBar"></i></div></div></div>' +
      '<div class="dx-lab"><div><div class="dx-stage" id="dxStage"><div class="dx-banner" id="dxBanner" hidden></div><div class="dx-hint">drag to turn · pinch or scroll to zoom · two fingers or shift-drag to slide · tap a structure</div><div class="dx-tools" id="dxTools"></div></div>' +
      '<div class="dx-stepbar"><button class="btn sm" id="dxPrev" aria-label="Previous step">◀</button><div class="dx-dots" id="dxDots"></div><button class="btn sm primary" id="dxNext" aria-label="Next step">▶</button></div></div>' +
      '<div class="dx-panel"><div class="chips" id="dxTabs"></div><div id="dxInfo"></div><div id="dxPanel"></div></div></div>';
    lab = { spec: spec, P: P, tab: ['steps', 'parts', 'practical', 'about'].indexOf(tab) >= 0 ? tab : 'steps', step: Math.min(spec.steps.length - 1, P.at || 0), labels: false, test: null, prac: null, pending: null, sel: null, el: el };
    lab.eng = Dissect3D.mount(document.getElementById('dxStage'), spec, { step: lab.step, onPick: onPick, onSelect: onSelect });
    document.getElementById('dxPrev').onclick = function () { goStep(lab.step - 1); };
    document.getElementById('dxNext').onclick = function () { goStep((lab.pending != null ? lab.pending - 1 : lab.step) + 1); };
    drawAll();
  }
  function unmount() { if (lab) { try { lab.eng.destroy(); } catch (e) {} lab = null; } }

  function drawAll() { drawProg(); drawDots(); drawTools(); drawTabs(); drawBanner(); drawInfo(); drawPanel(); refreshLabels(); }
  function drawProg() {
    var all = idParts(lab.spec), d = all.filter(function (x) { return lab.P.ids[x.id]; }).length;
    document.getElementById('dxProgTxt').textContent = d + ' of ' + all.length + ' structures identified' + (d === all.length ? ' — 100%' : '');
    document.getElementById('dxProgBar').style.width = (100 * d / all.length) + '%';
  }
  function drawDots() {
    var box = document.getElementById('dxDots'); var cur = lab.pending != null ? lab.pending : lab.step;
    box.innerHTML = lab.spec.steps.map(function (s, i) { var n = stepParts(i), d = n.filter(function (p) { return lab.P.ids[p.id]; }).length; return '<button class="dx-dot ' + (i === cur ? 'on' : '') + '" data-i="' + i + '" title="' + esc(s.t) + '">' + (i + 1) + (n.length && d === n.length ? ' ✓' : (s.cut && !lab.P.cuts[i] ? ' ✂' : '')) + '</button>'; }).join('');
    box.querySelectorAll('.dx-dot').forEach(function (b) { b.onclick = function () { goStep(+b.getAttribute('data-i')); }; });
    var on = box.querySelector('.on'); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
    document.getElementById('dxPrev').disabled = cur <= 0; document.getElementById('dxNext').disabled = cur >= lab.spec.steps.length - 1;
  }
  function drawTools() {
    var t = document.getElementById('dxTools');
    t.innerHTML = (lab.spec.sexes ? '<button id="dxSex" title="Switch between the female and male specimen">' + (lab.eng.sex === 'f' ? '♀ female' : '♂ male') + '</button>' : '') +
      '<button id="dxLab" class="' + (lab.labels ? 'on' : '') + '" title="Label this step’s structures">🏷</button><button id="dxView" title="Reset the view">⟲</button><button id="dxBig" title="Bigger view">⛶</button>';
    var sx = document.getElementById('dxSex'); if (sx) sx.onclick = function () { stopTest(true); lab.eng.setSex(lab.eng.sex === 'f' ? 'm' : 'f'); drawAll(); App.toast(lab.eng.sex === 'f' ? 'Female specimen' : 'Male specimen'); };
    document.getElementById('dxLab').onclick = function () { if (lab.test || lab.prac) { App.toast('Labels are off during a test.'); return; } lab.labels = !lab.labels; drawTools(); refreshLabels(); };
    document.getElementById('dxView').onclick = function () { var st = lab.spec.steps[lab.step]; if (st.view) lab.eng.setStep(lab.step); else lab.eng.resetView(); };
    document.getElementById('dxBig').onclick = function () { document.getElementById('dxStage').classList.toggle('big'); };
  }
  function drawTabs() {
    var tabs = [['steps', 'Steps'], ['parts', 'Structures'], ['practical', 'Practical'], ['about', 'About']];
    var box = document.getElementById('dxTabs');
    box.innerHTML = tabs.map(function (t) { return '<button class="chip ' + (lab.tab === t[0] ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    box.querySelectorAll('.chip').forEach(function (b) { b.onclick = function () { if (lab.prac && b.getAttribute('data-t') !== 'practical') endPrac(); if (lab.test) stopTest(true); lab.tab = b.getAttribute('data-t'); drawTabs(); drawBanner(); drawInfo(); drawPanel(); refreshLabels(); }; });
  }
  function drawBanner() {
    var b = document.getElementById('dxBanner'); if (!b) return;
    if (lab.pending != null) {
      b.hidden = false; b.innerHTML = '<span>✂️ <b>Make the incision.</b> Put the scalpel on the green dot and drag along the red dashed line.</span><span class="sp"></span><button class="btn sm" id="dxAuto">Do it for me</button>';
      document.getElementById('dxAuto').onclick = function () { lab.eng.finishCut(); };
    } else if (lab.test) {
      var t = lab.test, p = part(t.queue[t.i]);
      b.hidden = false; b.innerHTML = '<span>📍 ' + (t.i + 1) + ' of ' + t.queue.length + ' · tap the</span> <b class="t">' + esc(p.n) + '</b><span class="sp"></span><button class="btn sm" id="dxHint">Show me</button><button class="btn sm" id="dxStop">Stop</button>';
      document.getElementById('dxHint').onclick = function () { t.miss = Math.max(t.miss, 2); lab.eng.hint(p.id); lab.eng.focus(p.id); };
      document.getElementById('dxStop').onclick = function () { stopTest(); };
    } else if (lab.prac && !lab.prac.done) {
      b.hidden = false; b.innerHTML = '<span>🧪 Station <b>' + (lab.prac.i + 1) + '</b> of ' + lab.prac.q.length + ' · name the pinned structure</span>';
    } else { b.hidden = true; b.innerHTML = ''; }
  }
  function drawInfo() {
    var box = document.getElementById('dxInfo'); if (!box) return;
    if (!lab.sel || lab.test || lab.prac) { box.innerHTML = ''; return; }
    var p = part(lab.sel);
    box.innerHTML = '<div class="dx-info"><h4><span class="dx-sw" style="background:' + hex(p.c) + '"></span>' + esc(p.n) + sexTag(p) + '</h4><div class="small muted" style="margin-bottom:4px">' + esc(DX.SYS[p.sys] || p.sys) + (p.x ? '' : (lab.P.ids[p.id] ? ' · <span style="color:var(--ok)">identified ✓</span>' : ' · not yet identified')) + '</div><div class="small">' + (p.d || '') + '</div></div>';
  }
  function refreshLabels() {
    if (!lab) return; var eng = lab.eng;
    if (lab.prac && !lab.prac.done) { eng.setLabels([]); return; }
    if (lab.test) { eng.setLabels([]); eng.setPins(lab.test.found.map(function (id, k) { return { id: id, text: '✓', cls: 'ok' }; })); return; }
    eng.setPins([]);
    var list = [];
    if (lab.labels && lab.pending == null) stepParts(lab.step).forEach(function (p) { if (eng.isVisible(p.id) && p.id !== lab.sel) list.push({ id: p.id, text: p.n, cls: lab.P.ids[p.id] ? 'ok' : '' }); });
    if (lab.sel) list.push({ id: lab.sel, text: part(lab.sel).n, cls: 'sel' });
    eng.setLabels(list);
  }

  function onSelect(id) { if (!lab) return; lab.sel = id; drawInfo(); refreshLabels(); var pl = document.getElementById('dxPanel'); if (pl) pl.querySelectorAll('li[data-id]').forEach(function (li) { li.classList.toggle('sel', li.getAttribute('data-id') === id); }); }
  function onPick(id) {
    if (!lab || lab.pending != null) return;
    if (lab.test) return testPick(id);
    if (lab.prac) return;
    lab.eng.select(id && id === lab.eng.selected ? null : id);
  }

  function goStep(i, force) {
    var spec = lab.spec; i = Math.max(0, Math.min(spec.steps.length - 1, i)); var st = spec.steps[i];
    stopTest(true); if (lab.prac) endPrac();
    if (lab.pending != null) { lab.eng.endCut(); lab.pending = null; }
    if (st.cut && !lab.P.cuts[i] && !force && i > 0) {
      lab.pending = i; lab.step = i - 1; lab.eng.select(null);
      lab.eng.setStep(i - 1, { flip: !!st.flip, view: st.cutView || st.view || { ph: 0.2 } });
      lab.eng.startCut(st.cut, function () { lab.P.cuts[i] = 1; lab.pending = null; enter(i); App.toast('Incision made.'); });
      lab.tab = 'steps'; drawAll(); return;
    }
    if (st.cut) lab.P.cuts[i] = 1;
    enter(i);
  }
  function enter(i) { lab.step = i; lab.P.at = i; lab.P.step = Math.max(lab.P.step || 0, i); save(); lab.eng.endCut(); lab.eng.setStep(i); lab.eng.select(null); lab.sel = null; drawAll(); }

  /* ---- pin test ---- */
  function startTest() {
    var q = shuffle(stepParts(lab.step).filter(function (p) { return lab.eng.isVisible(p.id); }).map(function (p) { return p.id; }));
    if (!q.length) { App.toast('Nothing new to pin in this step.'); return; }
    lab.labels = false; lab.eng.select(null); lab.test = { queue: q, i: 0, miss: 0, found: [], first: 0 }; lab.eng.frame(q); drawTools(); drawBanner(); drawInfo(); drawPanel(); refreshLabels();
  }
  function stopTest(quiet) { if (!lab || !lab.test) return; lab.test = null; lab.eng.hint(null); if (!quiet) { drawBanner(); drawPanel(); refreshLabels(); } else { lab.eng.setPins([]); } }
  function testPick(id) {
    var t = lab.test; if (!id) return; var target = t.queue[t.i];
    if (id === target) {
      var first = t.miss === 0; if (first) t.first++;
      lab.P.ids[target] = first ? 1 : (lab.P.ids[target] || 2); save(); lab.eng.hint(null);
      t.found.push(target); t.i++; t.miss = 0; drawProg(); drawDots();
      if (t.i >= t.queue.length) {
        var msg = t.first + ' of ' + t.queue.length + ' on the first tap.'; var q = t.queue.length;
        lab.test = null; lab.eng.setPins([]); lab.lastTest = { first: t.first, n: q }; drawBanner(); drawPanel(); refreshLabels(); App.toast('Step pinned: ' + msg, 3000); App.checkBadges();
      } else { drawBanner(); refreshLabels(); }
    } else {
      t.miss++; var w = part(id); App.toast('That is the ' + (w ? w.n : 'tray') + '.' + (t.miss >= 2 ? ' The right one is glowing.' : ' Try again.'), 2600);
      if (t.miss >= 2) { lab.eng.hint(target); lab.eng.focus(target); }
    }
  }

  /* ---- practical ---- */
  function norm(s) { return String(s).toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z ]+/g, ' ').replace(/\b(the|of|and|a)\b/g, ' ').replace(/\s+/g, ' ').trim(); }
  function lev(a, b) { var m = a.length, n = b.length, d = []; for (var i = 0; i <= m; i++) { d[i] = [i]; } for (var j = 0; j <= n; j++) d[0][j] = j; for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
  function typedOK(input, p) {
    var a = norm(input); if (a.length < 3) return false;
    var names = [p.n].concat((p.n.match(/\(([^)]*)\)/g) || []).map(function (x) { return x.replace(/[()]/g, ''); })).concat(p.n.split(/[:;,]/)).concat(p.aka || []);
    return names.some(function (nm) { var b = norm(nm); if (!b) return false; if (a === b) return true; if (lev(a, b) <= Math.max(1, Math.floor(b.length * 0.18))) return true; var at = a.split(' ').sort().join(' '), bt = b.split(' ').sort().join(' '); return at === bt; });
  }
  function startPrac(n, typed) {
    var pool = shuffle(idParts(lab.spec)); if (n && n < pool.length) pool = pool.slice(0, n);
    lab.labels = false; lab.prac = { q: pool, i: 0, right: 0, typed: typed, miss: [], full: !n || n >= idParts(lab.spec).length };
    station();
  }
  function station() {
    var pr = lab.prac, p = pr.q[pr.i];
    if (p.sex && lab.spec.sexes) lab.eng.setSex(p.sex);
    lab.step = p.s; lab.eng.endCut(); lab.eng.setStep(p.s); lab.eng.select(null); lab.eng.hint(p.id); lab.eng.setLabels([]); lab.eng.setPins([{ id: p.id, text: String(pr.i + 1) }]); setTimeout(function () { if (lab && lab.prac === pr) lab.eng.focus(p.id); }, 750);
    pr.answered = false; drawDots(); drawTools(); drawBanner(); drawPanel();
  }
  function endPrac() { if (!lab || !lab.prac) return; lab.prac = null; lab.eng.hint(null); lab.eng.setPins([]); }
  function answer(ok, shown) {
    var pr = lab.prac, p = pr.q[pr.i]; if (pr.answered) return; pr.answered = true;
    if (ok) { pr.right++; if (!lab.P.ids[p.id]) { lab.P.ids[p.id] = 2; save(); drawProg(); } } else pr.miss.push(p);
    var box = document.getElementById('dxPracFb');
    box.innerHTML = '<div class="dx-info" style="border-color:' + (ok ? 'var(--ok)' : 'var(--bad)') + '"><h4>' + (ok ? '✓ ' : '✗ ') + esc(p.n) + '</h4>' + (ok ? '' : (shown ? '<div class="small">You answered: ' + esc(shown) + '</div>' : '')) + '<div class="small">' + (p.d || '') + '</div></div><button class="btn primary" id="dxPracNext">' + (pr.i + 1 >= pr.q.length ? 'Finish' : 'Next station →') + '</button>';
    document.getElementById('dxPracNext').onclick = function () { pr.i++; if (pr.i >= pr.q.length) finishPrac(); else station(); };
  }
  function finishPrac() {
    var pr = lab.prac; pr.done = true; var pct = Math.round(100 * pr.right / pr.q.length);
    if (pr.q.length >= Math.min(10, idParts(lab.spec).length) && pct > (lab.P.best || 0)) lab.P.best = pct;
    if (pr.full && pct === 100) lab.P.ace = Store.today();
    save(); lab.eng.hint(null); lab.eng.setPins([]); drawBanner(); drawPanel(); App.checkBadges();
  }

  /* ---- panel ---- */
  function partLi(p, showStep) { return '<li data-id="' + p.id + '" class="' + (lab.P.ids[p.id] ? 'done ' : '') + (lab.sel === p.id ? 'sel' : '') + '"><span class="ck">' + (p.x ? '·' : lab.P.ids[p.id] ? '✓' : '○') + '</span><span><span class="dx-sw" style="background:' + hex(p.c) + '"></span>' + esc(p.n) + sexTag(p) + '</span>' + (showStep ? '<span class="st">step ' + (p.s + 1) + '</span>' : '') + '</li>'; }
  function wireLis(box, atlas) {
    box.querySelectorAll('li[data-id]').forEach(function (li) {
      li.onclick = function () {
        var p = part(li.getAttribute('data-id')); if (lab.test) return;
        if (p.sex && lab.spec.sexes && lab.eng.sex !== p.sex) { lab.eng.setSex(p.sex); drawTools(); }
        if (!lab.eng.isVisible(p.id)) { if (lab.pending != null) { lab.eng.endCut(); lab.pending = null; } lab.step = p.s; lab.P.at = p.s; lab.eng.setStep(p.s); drawDots(); drawBanner(); if (!atlas) drawPanel(); }
        lab.eng.select(p.id); lab.eng.focus(p.id);
      };
    });
  }
  function drawPanel() {
    var box = document.getElementById('dxPanel'); if (!box) return; var spec = lab.spec;
    if (lab.tab === 'steps') {
      var i = lab.pending != null ? lab.pending : lab.step, st = spec.steps[i], list = stepParts(i);
      var vis = list.filter(function (p) { return !p.sex || !spec.sexes || p.sex === lab.eng.sex; }), other = list.length - vis.length;
      var d = vis.filter(function (p) { return lab.P.ids[p.id]; }).length;
      var h = '<div class="card"><div class="small muted">Step ' + (i + 1) + ' of ' + spec.steps.length + '</div><h3 style="margin:2px 0 8px">' + esc(st.t) + '</h3><div class="dx-how">' + st.how + '</div>';
      if (lab.pending != null) h += '<div class="callout">Trace the incision on the specimen to continue. Start at the green dot; the scalpel follows your finger. If your trace drifts, come back to the pulsing dot and carry on.</div>';
      else {
        if (lab.lastTest) { h += '<div class="callout moss">Pinned ' + lab.lastTest.n + ' structures, ' + lab.lastTest.first + ' on the first tap.</div>'; lab.lastTest = null; }
        if (vis.length) {
          h += '<div class="row between" style="margin-top:10px"><b>Find in this step (' + d + '/' + vis.length + ')</b><button class="btn sm ' + (d === vis.length ? '' : 'monarch') + '" id="dxTest"' + (lab.test ? ' disabled' : '') + '>📍 ' + (d === vis.length ? 'Pin again' : 'Pin test') + '</button></div><ul class="dx-parts">' + vis.map(function (p) { return partLi(p); }).join('') + '</ul>';
          if (other && spec.sexes) h += '<p class="small muted">' + other + ' more structure' + (other === 1 ? '' : 's') + ' in this step belong to the ' + (lab.eng.sex === 'f' ? 'male' : 'female') + '. Switch with the ' + (lab.eng.sex === 'f' ? '♀' : '♂') + ' button on the specimen.</p>';
        } else h += '<p class="small muted">No new structures to name in this step.</p>';
      }
      h += '<div class="row" style="margin-top:12px"><button class="btn" id="dxB"' + (i <= 0 ? ' disabled' : '') + '>← Back</button>' + (i < spec.steps.length - 1 ? '<button class="btn primary" id="dxN">Next: ' + esc(spec.steps[i + 1].t) + ' →</button>' : '<button class="btn primary" id="dxP">Take the practical →</button>') + '</div></div>';
      box.innerHTML = h; wireLis(box);
      var tb = document.getElementById('dxTest'); if (tb) tb.onclick = startTest;
      document.getElementById('dxB').onclick = function () { goStep(i - 1); };
      var nb = document.getElementById('dxN'); if (nb) nb.onclick = function () { goStep(i + 1); };
      var pb = document.getElementById('dxP'); if (pb) pb.onclick = function () { lab.tab = 'practical'; drawTabs(); drawPanel(); };
    } else if (lab.tab === 'parts') {
      var sysKeys = Object.keys(DX.SYS).filter(function (k) { return spec.parts.some(function (p) { return p.sys === k && !p.x; }); });
      box.innerHTML = '<div class="card"><input id="dxSearch" placeholder="Search ' + idParts(spec).length + ' structures…" value="' + esc(lab.q || '') + '"><div class="chips" style="margin-top:8px" id="dxSys"><button class="chip ' + (!lab.sys ? 'on' : '') + '" data-s="">All</button>' + sysKeys.map(function (k) { return '<button class="chip ' + (lab.sys === k ? 'on' : '') + '" data-s="' + k + '">' + esc(DX.SYS[k]) + '</button>'; }).join('') + '</div><label class="small" style="margin-top:8px"><input type="checkbox" id="dxOnly" style="width:auto" ' + (lab.only ? 'checked' : '') + '> On the specimen, show only this system</label><div id="dxList"></div></div>';
      var draw = function () {
        var q = (lab.q || '').toLowerCase();
        var ps = idParts(spec).filter(function (p) { return (!lab.sys || p.sys === lab.sys) && (!q || p.n.toLowerCase().indexOf(q) >= 0); });
        var by = {}; ps.forEach(function (p) { (by[p.sys] = by[p.sys] || []).push(p); });
        document.getElementById('dxList').innerHTML = Object.keys(by).map(function (k) { return '<h4 style="margin:12px 0 2px">' + esc(DX.SYS[k] || k) + ' <span class="small muted">' + by[k].filter(function (p) { return lab.P.ids[p.id]; }).length + '/' + by[k].length + '</span></h4><ul class="dx-parts">' + by[k].map(function (p) { return partLi(p, true); }).join('') + '</ul>'; }).join('') || '<p class="small muted">No structure matches.</p>';
        wireLis(document.getElementById('dxList'), true);
      };
      draw();
      document.getElementById('dxSearch').oninput = function (e) { lab.q = e.target.value; draw(); };
      var setFilter = function () { lab.eng.setFilter(lab.only && lab.sys ? new Set([lab.sys]) : null); };
      box.querySelectorAll('#dxSys .chip').forEach(function (b) { b.onclick = function () { lab.sys = b.getAttribute('data-s') || null; box.querySelectorAll('#dxSys .chip').forEach(function (x) { x.classList.toggle('on', x === b); }); setFilter(); draw(); }; });
      document.getElementById('dxOnly').onchange = function (e) { lab.only = e.target.checked; setFilter(); };
    } else if (lab.tab === 'practical') {
      var pr = lab.prac, n = idParts(spec).length;
      if (!pr) {
        box.innerHTML = '<div class="card"><h3 style="margin-top:0">Lab practical</h3><p class="small">A real practical is a room of trays with numbered pins and ninety seconds per station. Same here: one pin, one structure, name it. Correct answers also count toward your 100%.</p>' + (lab.P.best ? '<p class="tag ok">Best so far: ' + lab.P.best + '%</p>' : '') +
          '<div class="field"><label>How many stations?</label><select id="dxN2"><option value="10">10 stations</option><option value="25">25 stations</option><option value="0">All ' + n + ' structures</option></select></div><div class="field"><label>Answer by</label><select id="dxMode"><option value="mc">Choosing from four names</option><option value="type">Typing the name (as on a real practical)</option></select></div><button class="btn primary" id="dxGo">Start</button></div>';
        document.getElementById('dxGo').onclick = function () { startPrac(+document.getElementById('dxN2').value, document.getElementById('dxMode').value === 'type'); };
      } else if (pr.done) {
        var pct = Math.round(100 * pr.right / pr.q.length);
        box.innerHTML = '<div class="card"><h3 style="margin-top:0">' + pr.right + ' of ' + pr.q.length + ' — ' + pct + '%</h3><p class="small">' + (pct === 100 ? 'A clean sheet.' : pct >= 80 ? 'Solid. Review the misses below and run it again.' : 'Go back through the steps with labels on, then try again.') + '</p>' + (pr.miss.length ? '<b>Review</b><ul class="dx-parts">' + pr.miss.map(function (p) { return partLi(p, true); }).join('') + '</ul>' : '') + '<div class="row"><button class="btn primary" id="dxAgain">New practical</button></div></div>';
        document.getElementById('dxAgain').onclick = function () { endPrac(); drawPanel(); drawBanner(); };
        lab.prac = null; wireLis(box, true); lab.prac = pr; box.querySelectorAll('li[data-id]').forEach(function (li) { var f = li.onclick; li.onclick = function () { endPrac(); f(); }; });
      } else {
        var p = pr.q[pr.i], h2 = '<div class="card"><div class="small muted">Station ' + (pr.i + 1) + ' of ' + pr.q.length + ' · ' + pr.right + ' correct so far</div><h3 style="margin:2px 0 10px">What is pinned?</h3>';
        if (pr.typed) h2 += '<div class="row"><input id="dxType" placeholder="type its name" autocomplete="off" autocapitalize="off" style="flex:1"><button class="btn primary" id="dxChk">Check</button></div><p class="small muted" style="margin-top:6px">Spelling can be a letter or two off.</p>';
        else {
          var same = shuffle(idParts(spec).filter(function (x) { return x.id !== p.id && x.n !== p.n && x.sys === p.sys; })), rest = shuffle(idParts(spec).filter(function (x) { return x.id !== p.id && x.n !== p.n && x.sys !== p.sys; }));
          var opts = shuffle([p].concat(same.concat(rest).slice(0, 3)));
          h2 += '<div class="choices" style="grid-template-columns:1fr">' + opts.map(function (o) { return '<button class="choice" data-id="' + o.id + '">' + esc(o.n) + '</button>'; }).join('') + '</div>';
        }
        h2 += '<div id="dxPracFb" style="margin-top:10px"></div><div class="row" style="margin-top:10px"><button class="btn sm ghost" id="dxQuit">End practical</button></div></div>';
        box.innerHTML = h2;
        document.getElementById('dxQuit').onclick = function () { endPrac(); drawBanner(); drawPanel(); };
        if (pr.typed) { var inp = document.getElementById('dxType'); var go = function () { if (!inp.value.trim()) return; answer(typedOK(inp.value, p), inp.value); inp.disabled = true; }; document.getElementById('dxChk').onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') go(); }; }
        else box.querySelectorAll('.choice').forEach(function (b) { b.onclick = function () { if (pr.answered) return; var ok = b.getAttribute('data-id') === p.id; b.classList.add(ok ? 'right' : 'wrong'); box.querySelectorAll('.choice').forEach(function (x) { if (x.getAttribute('data-id') === p.id) x.classList.add('right'); }); answer(ok, b.textContent); }; });
      }
    } else {
      box.innerHTML = '<div class="card"><h3 style="margin-top:0">Why this specimen</h3><p class="small">' + spec.about + '</p>' +
        (spec.cls ? '<div class="ranks" style="margin-bottom:10px">' + spec.cls.map(function (r) { return '<span class="rank"><b>' + r[0] + '</b>' + esc(r[1]) + '</span>'; }).join('') + '</div>' : '') +
        '<h4 style="margin:8px 0 2px">On the tray</h4><p class="small">' + esc(spec.orient) + '</p><h4 style="margin:8px 0 2px">Tools</h4><p class="small">' + esc(spec.tools) + '</p>' + (spec.care ? '<h4 style="margin:8px 0 2px">Watch out for</h4><p class="small">' + spec.care + '</p>' : '') + '</div>' +
        '<div class="card" style="margin-top:10px"><h3 style="margin-top:0">The real thing</h3><p class="small muted">Photographs of real specimens and dissections from Wikimedia Commons, searched live. They show preserved animals opened up.</p><button class="btn sm" id="dxReal">Show real photographs</button><div id="dxRealBox" style="margin-top:10px"></div>' +
        '<div class="row" style="margin-top:10px"><a class="btn sm ghost" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(spec.q || (spec.name + ' dissection')) + '">Dissection videos on YouTube ↗</a></div><div id="dxVid" style="margin-top:10px"></div></div>';
      document.getElementById('dxReal').onclick = function () {
        var rb = document.getElementById('dxRealBox'); rb.innerHTML = '<p class="small muted">Searching Wikimedia Commons…</p>';
        Media.commonsImages(spec.photoQ || (spec.name + ' dissection'), 12).then(function (imgs) {
          if (!imgs.length) { rb.innerHTML = '<p class="small muted">Nothing came back (offline, or no match). Try the video link below.</p>'; return; }
          rb.innerHTML = '<div class="gallery">' + imgs.map(function (m) { return '<a class="photo" href="' + esc(m.page) + '" target="_blank" rel="noopener"><img class="loaded" loading="lazy" src="' + esc(m.thumb) + '" alt="' + esc(m.title) + '"><span class="credit">' + esc(m.credit) + '</span></a>'; }).join('') + '</div><p class="small muted">Tap a photograph for its source and licence on Wikimedia Commons.</p>';
        });
      };
      var vids = (window.VIDEOS && VIDEOS.dissect && VIDEOS.dissect[spec.id]) || [];
      if (vids.length) { document.getElementById('dxVid').innerHTML = '<h4 style="margin:6px 0">Watch it done on a real specimen</h4>' + Media.videoGrid(vids.map(function (v) { return { id: v.id, title: v.title, q: spec.q }; })); Media.hydrate(box); }
    }
  }

  App.register({
    id: 'dissect', title: 'Dissection Lab', icon: '🔬', blurb: 'Dissect ' + DX.list.length + ' classic lab specimens in 3D, step by step: trace the incisions, lift out the organs, pin and name every structure, then sit the practical.',
    render: function (el, args) { if (!args[0]) renderGallery(el); else if (args[0] === 'basics') renderBasics(el); else renderLab(el, args[0], args[1]); },
    unmount: unmount
  });
})();
