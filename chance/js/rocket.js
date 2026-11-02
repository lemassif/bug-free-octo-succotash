/* ============================================================
   rocket.js — 🚀 Spelling Rocket

   This week's spelling list, turned into a space game:

     1. A grown-up photographs the list that came home from school
        (the same on-device reader and grown-up check as Scan
        Homework), or types it. The list stays until next week's.
     2. Chance flies his rocket through space. The owl says a word,
        and that word is racing across the sky with a few of the
        week's other words. He steers to the right one with his
        finger — which means reading every word he passes.
     3. Docked on the word, he SAYS it into the microphone.
     4. Then he SPELLS it on the iPad keyboard, with the word hidden.
        A miss shows which letters were right, then sounds it out,
        then shows the word to copy, so it never becomes a wall.
     5. LAUNCH: countdown, blast-off, warp speed, next word.
     6. Every five words, a soccer break: flick the ball past the
        keeper with a finger. Then back to space for the next five.

   House rules from the rest of the app still hold: nothing says
   "wrong", every step can be heard again, there is always a way
   home and a way to stop the talking, and the iPad keyboard's
   autocorrect is switched off so it cannot spell the word for him.
   ============================================================ */

window.Rocket = (function () {

  var KEY = 'chance.rocket.v1';
  var ROUND = 5;

  /* ------------------------- saved state ------------------------
     words    this week's list, in the teacher's order
     setAt    when the list was saved (also names the list)
     order    the shuffled order for the pass he is on
     pos      how many words of that pass are finished
     results  word -> { first: spelled right first try, tries } */
  var state = { words: [], setAt: 0, order: [], pos: 0, results: {}, passes: 0 };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) {}
    if (!Array.isArray(state.words)) state.words = [];
    if (!Array.isArray(state.order)) state.order = [];
    if (!state.results || typeof state.results !== 'object') state.results = {};
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  load();

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  /* "sh-ad-ow" -> "shadow"; letters and apostrophes only */
  function cleanWord(w) { return String(w || '').toLowerCase().replace(/-/g, '').replace(/[^a-z']/g, ''); }
  function partsOf(w) {
    var it = window.Homework ? Homework.wordItem(w) : null;
    return it ? it.parts : [w];
  }
  function inPass() { return state.order.length > 0 && state.pos < state.order.length; }
  function wordsLeft() { return inPass() ? state.order.length - state.pos : state.words.length; }

  function setWords(words) {
    var seen = {}, list = [];
    (words || []).forEach(function (w) {
      var c = cleanWord(w);
      if (c.length > 1 && !seen[c]) { seen[c] = 1; list.push(c); }
    });
    state = { words: list, setAt: Date.now(), order: [], pos: 0, results: {}, passes: 0 };
    save();
  }

  /* ========================== SETUP SCREEN ========================= */
  var bodyEl = null;

  function render(body) {
    bodyEl = body;
    stopGame();
    body.innerHTML = '';
    App.setActions([]);
    if (!state.words.length) renderSetup(body);
    else renderReady(body);
  }

  function scanOpts(body) {
    return {
      wordsOnly: true,
      startLabel: 'Save this week\'s words', startEm: '🚀',
      doneHint: 'Then save them for the Spelling Rocket.',
      onStart: function (words) { setWords(words); render(body); },
      onBack: function () { render(body); }
    };
  }

  function banner(title, sub) {
    var b = el('div', 'rk-banner');
    b.appendChild(el('div', 'rk-banner-em', '🚀'));
    var t = el('div');
    t.appendChild(el('h3', null, title));
    if (sub) t.appendChild(el('p', null, sub));
    b.appendChild(t);
    return b;
  }

  function renderSetup(body) {
    body.appendChild(banner('Spelling Rocket',
      'Fly through space to find this week\'s spelling words. Say each one, spell it on the keyboard, then blast off to the next. Soccer break every 5 words!'));

    var cam = el('button', 'scan-hero');
    cam.appendChild(el('span', 'scan-em', '📷'));
    var t = el('span', 'scan-text');
    t.appendChild(el('b', null, 'Take a picture of this week\'s spelling words'));
    t.appendChild(el('span', null, 'The app reads the list. A grown-up checks it.'));
    cam.appendChild(t);
    cam.addEventListener('click', function () { HWUI.scanFor(body, true, scanOpts(body)); });
    body.appendChild(cam);

    var r = el('div', 'row');
    r.appendChild(App.ui.btn('🖼️', 'Use a photo I already took', function () { HWUI.scanFor(body, false, scanOpts(body)); }));
    r.appendChild(App.ui.btn('⌨️', 'Type the words', function () { HWUI.checkWords(body, [], scanOpts(body)); }));
    body.appendChild(r);

    // a list he already brought home through Scan Homework works too
    var packs = (window.Homework ? Homework.packs() : []).map(function (p) {
      return { p: p, words: (p.items || []).filter(function (it) { return it.kind === 'word'; }).map(function (it) { return it.word; }) };
    }).filter(function (x) { return x.words.length >= 2; }).slice(0, 6);
    if (packs.length) {
      body.appendChild(el('div', 'week-title', 'OR USE WORDS FROM HOMEWORK YOU SCANNED'));
      var grid = el('div', 'rk-packs');
      packs.forEach(function (x) {
        grid.appendChild(App.ui.btn('📄', x.p.title + ' (' + x.words.length + ' words)', function () {
          setWords(x.words); render(body);
        }));
      });
      body.appendChild(grid);
    }
  }

  function renderReady(body) {
    var n = state.words.length;
    var when = new Date(state.setAt || Date.now());
    var ageDays = (Date.now() - (state.setAt || Date.now())) / 86400000;
    body.appendChild(banner('Spelling Rocket',
      n + ' word' + (n === 1 ? '' : 's') + ' this week · saved ' +
      when.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })));

    if (ageDays > 6) {
      body.appendChild(el('p', 'rk-note', '📅 These words are from last week. Grown-ups: tap "New week\'s words" to scan the new list.'));
    }

    var chips = el('div', 'rk-chips');
    state.words.forEach(function (w) {
      var c = el('button', 'rk-chip', w);
      var r = state.results[w];
      if (inPass() && r) c.classList.add(r.first ? 'got' : 'practiced');
      c.addEventListener('click', function () { Voice.stop(); Voice.say(w, { rate: 0.75 }); });
      chips.appendChild(c);
    });
    body.appendChild(chips);
    body.appendChild(el('p', 'rk-note', 'Tap a word to hear it.'));

    var go = el('button', 'rk-go');
    go.appendChild(el('span', 'rk-go-em', '🚀'));
    var gt = el('span', 'scan-text');
    if (inPass() && state.pos > 0) {
      gt.appendChild(el('b', null, 'Keep flying!'));
      gt.appendChild(el('span', null, 'Word ' + (state.pos + 1) + ' of ' + state.order.length + ' is next'));
    } else {
      gt.appendChild(el('b', null, 'Blast off!'));
      gt.appendChild(el('span', null, 'Find, say and spell all ' + n + ' words'));
    }
    go.appendChild(gt);
    go.addEventListener('click', function () { startGame(false); });
    body.appendChild(go);

    var r = el('div', 'row');
    if (inPass() && state.pos > 0) {
      r.appendChild(App.ui.btn('🔁', 'Start from the first word', function () { startGame(true); }));
    }
    if (r.children.length) body.appendChild(r);

    body.appendChild(el('div', 'week-title', 'GROWN-UPS'));
    var g = el('div', 'row');
    g.appendChild(App.ui.btn('📷', 'New week\'s words', function () { HWUI.scanFor(body, true, scanOpts(body)); }));
    g.appendChild(App.ui.btn('✏️', 'Fix or add words', function () { HWUI.checkWords(body, state.words, scanOpts(body)); }));
    body.appendChild(g);
  }

  /* ============================== SOUND ============================
     Small game sounds. The voice is the teacher; these are just the
     whoosh and the ding, kept quiet underneath it. */
  var AC = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    return AC;
  }
  function tone(f0, f1, d, type, vol, delay) {
    if (!AC || (Voice.isMuted && Voice.isMuted())) return;
    try {
      var t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d);
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0005, t + d);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  function noise(d, vol, f0, f1, delay) {
    if (!AC || (Voice.isMuted && Voice.isMuted())) return;
    try {
      var n = Math.floor(AC.sampleRate * d), buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0);
      for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n);
      var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime + (delay || 0);
      f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + d);
      g.gain.value = vol;
      s.buffer = buf; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t);
    } catch (e) {}
  }
  var SFX = {
    bump: function () { tone(220, 140, 0.18, 'triangle', 0.06); },
    found: function () { [660, 880, 1320].forEach(function (f, i) { tone(f, f, 0.14, 'sine', 0.05, i * 0.08); }); },
    right: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, f, 0.16, 'triangle', 0.05, i * 0.09); }); },
    oops: function () { tone(330, 260, 0.22, 'sine', 0.04); },
    tick: function () { tone(880, 880, 0.09, 'square', 0.025); },
    whoosh: function () { noise(1.6, 0.35, 200, 2400); tone(90, 40, 1.4, 'sawtooth', 0.04); },
    kick: function () { tone(160, 50, 0.16, 'sine', 0.18); noise(0.08, 0.2, 1500, 600); },
    cheer: function () { noise(1.8, 0.28, 900, 1400); noise(1.4, 0.18, 2000, 2600, 0.2); },
    groan: function () { noise(0.9, 0.16, 500, 250); }
  };

  /* ============================ THE GAME =========================== */
  var G = null;      // everything about the game that is running

  function inGame() { return !!G; }

  function startGame(fresh) {
    if (fresh || !inPass()) {
      state.order = shuffle(state.words);
      state.pos = 0;
      state.results = {};
      save();
    }
    if (window.Evaluate) Evaluate.startSession('rocket');
    Voice.stop();
    ac();
    buildLayer();
    nextWord(true);
  }

  function buildLayer() {
    stopGame();
    var layer = el('div', 'rk-layer');
    var canvas = el('canvas', 'rk-canvas');
    var hud = el('div', 'rk-hud');
    var prompt = el('button', 'rk-prompt');
    var panel = el('div', 'rk-panel');
    var count = el('div', 'rk-count');
    layer.appendChild(canvas); layer.appendChild(hud); layer.appendChild(prompt); layer.appendChild(panel); layer.appendChild(count);
    document.body.appendChild(layer);

    G = {
      layer: layer, canvas: canvas, ctx: canvas.getContext('2d'), hud: hud, prompt: prompt, panel: panel, count: count,
      W: 0, H: 0, dpr: 1, t: 0, last: performance.now(), raf: 0,
      mode: 'fly', word: null, parts: [], bubbles: [], fx: [], stars: [], warp: 0,
      rocket: { x: 0, y: 0, tx: 0, ty: 0, ang: 0, vx: 0, vy: 0, launching: false, visible: true, thrust: 0 },
      findMisses: 0, sayTries: 0, spellTries: 0, reveal: false, docked: null, keys: {}
    };

    // the HUD: home, stop, round pips, word count, hear-it-again
    var home = el('button', 'rk-hbtn', '🏠');
    home.setAttribute('aria-label', 'Home');
    home.addEventListener('click', confirmExit);
    var stop = el('button', 'rk-hbtn', '🛑');
    stop.setAttribute('aria-label', 'Stop talking');
    stop.addEventListener('click', function () { Voice.stop(); App.hideCoach(); });
    G.pips = el('div', 'rk-pips');
    G.label = el('div', 'rk-label');
    var hear = el('button', 'rk-hbtn rk-hear', '🔊');
    hear.setAttribute('aria-label', 'Hear the word again');
    hear.addEventListener('click', function () { Voice.repair(); sayTarget(); });
    hud.appendChild(home); hud.appendChild(stop); hud.appendChild(G.pips); hud.appendChild(G.label); hud.appendChild(hear);
    prompt.addEventListener('click', function () { Voice.repair(); sayTarget(); });

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    G.raf = requestAnimationFrame(frame);
  }

  function stopGame() {
    if (!G) return;
    cancelAnimationFrame(G.raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKeyUp);
    if (Voice.abortListen) Voice.abortListen();
    G.layer.remove();
    G = null;
    S = null;
  }

  function exitGame() {
    Voice.stop();
    stopGame();
    if (bodyEl) render(bodyEl);
    App.go('home');
  }

  /* Leaving mid-game: his finished words are saved, so this is a
     pause, not a loss. One clear tap to confirm. */
  function confirmExit() {
    Voice.stop();
    var u = App.ui;
    App.sheet([
      u.big('🏠'),
      u.h3('Stop for now?'),
      u.p(wordsLeft() && state.pos ? 'Your words are saved. Next time you start at word ' + (state.pos + 1) + '.' : 'You can come back to the rocket any time.'),
      u.row([
        u.btn('🚀', 'Keep flying', function () { App.closeSheet(); }),
        u.btn('🏠', 'Yes, go home', function () { App.closeSheet(); exitGame(); })
      ])
    ]);
  }

  /* ------------------------------ layout ---------------------------- */
  function resize() {
    if (!G) return;
    var W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    G.W = W; G.H = H; G.dpr = dpr;
    G.canvas.width = Math.round(W * dpr); G.canvas.height = Math.round(H * dpr);
    G.canvas.style.width = W + 'px'; G.canvas.style.height = H + 'px';
    G.S = clamp(Math.min(W, H) / 820, 0.62, 1.25);      // size of the rocket and words
    G.font = Math.round(clamp(Math.min(W, H) * 0.05, 26, 46));
    G.top = 128;                                          // below the HUD and the prompt
    G.bottom = H - 150 * G.S;                             // the rocket's parking lane
    makeBackdrop();
    if (!G.stars.length) {
      for (var i = 0; i < 170; i++) G.stars.push({ x: Math.random(), y: Math.random(), z: Math.random() });
    }
    layoutBubbles();
    var r = G.rocket;
    if (!r.x) { r.x = r.tx = W / 2; r.y = r.ty = G.bottom; }
    r.tx = clamp(r.tx, 30, W - 30); r.ty = clamp(r.ty, G.top, H - 60);
    if (G.mode === 'soccer' && S) layoutSoccer();
  }

  /* The sky behind everything is drawn once per resize: a deep blue
     gradient, two soft nebulae, a ringed planet and a little moon. */
  function makeBackdrop() {
    var c = document.createElement('canvas'), W = G.W, H = G.H;
    c.width = Math.round(W * G.dpr); c.height = Math.round(H * G.dpr);
    var x = c.getContext('2d');
    x.scale(G.dpr, G.dpr);
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#060a24'); g.addColorStop(0.55, '#14164a'); g.addColorStop(1, '#2a1650');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    [[0.22, 0.3, 0.45, 'rgba(90,120,255,0.20)'], [0.82, 0.62, 0.5, 'rgba(255,80,200,0.15)'], [0.5, 0.95, 0.4, 'rgba(60,220,255,0.10)']].forEach(function (n) {
      var r = Math.max(W, H) * n[2], rg = x.createRadialGradient(W * n[0], H * n[1], 0, W * n[0], H * n[1], r);
      rg.addColorStop(0, n[3]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = rg; x.fillRect(0, 0, W, H);
    });
    // ringed planet, lower left
    var px = W * 0.12, py = H * 0.86, pr = Math.min(W, H) * 0.11;
    var pg = x.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr);
    pg.addColorStop(0, '#ffcf7a'); pg.addColorStop(1, '#c0602a');
    x.fillStyle = pg; x.beginPath(); x.arc(px, py, pr, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(255,230,180,0.75)'; x.lineWidth = pr * 0.09;
    x.beginPath(); x.ellipse(px, py, pr * 1.75, pr * 0.42, -0.35, 0, Math.PI * 2); x.stroke();
    // moon, upper right
    var mx = W * 0.9, my = H * 0.2, mr = Math.min(W, H) * 0.045;
    x.fillStyle = '#e8ecf6'; x.beginPath(); x.arc(mx, my, mr, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(150,160,190,0.55)';
    [[-0.3, -0.2, 0.25], [0.3, 0.25, 0.18], [0.05, 0.4, 0.12]].forEach(function (k) { x.beginPath(); x.arc(mx + k[0] * mr, my + k[1] * mr, k[2] * mr, 0, Math.PI * 2); x.fill(); });
    G.backdrop = c;
  }

  /* --------------------------- the words ---------------------------- */
  var COLORS = ['#ff6b8b', '#4fb3ff', '#8b5cf6', '#2fbf71', '#ff9f43', '#16c1c8'];

  function pickDistractors(word) {
    var others = shuffle(state.words.filter(function (w) { return w !== word; }));
    var out = others.slice(0, 3);
    // a short list gets look-alike spellings so there is still something to read
    if (out.length < 3 && window.Homework) {
      Homework.misspellings(word).forEach(function (m) { if (out.length < 3 && out.indexOf(m.t) === -1) out.push(m.t); });
    }
    return out;
  }

  function makeBubbles(word) {
    var words = shuffle([word].concat(pickDistractors(word)));
    var colors = shuffle(COLORS);
    G.bubbles = words.map(function (w, i) {
      return { word: w, target: w === word, lane: i, color: colors[i % colors.length], x: 0, y: 0, vx: 0, w: 0, h: 0,
        alpha: 0, shake: 0, cool: 0, gone: false };
    });
    layoutBubbles(true);
  }

  /* One lane per word, alternating direction, slow enough to read: a
     word takes 16-22 seconds to cross the screen. */
  function layoutBubbles(fresh) {
    if (!G || !G.bubbles.length) return;
    var ctx = G.ctx, n = G.bubbles.length;
    ctx.font = '800 ' + G.font + 'px ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif';
    var top = G.top + 10, bottom = G.bottom - 90 * G.S, laneH = (bottom - top) / n;
    var slots = shuffle([0.18, 0.42, 0.62, 0.82]);
    G.bubbles.forEach(function (b, i) {
      b.w = ctx.measureText(b.word).width + G.font * 1.3;
      b.h = G.font * 1.7;
      b.y = top + laneH * (b.lane + 0.5);
      if (fresh) {
        var dir = b.lane % 2 ? 1 : -1;
        b.vx = dir * G.W / rand(16, 22);
        b.x = G.W * slots[i % slots.length];
      }
    });
  }

  /* -------------------------- each new word ------------------------- */
  function roundInfo() {
    var start = Math.floor(state.pos / ROUND) * ROUND;
    return { start: start, size: Math.min(ROUND, state.order.length - start), done: state.pos - start, index: start / ROUND };
  }

  function nextWord(first) {
    if (!G) return;
    if (state.pos >= state.order.length) return finishAll();
    G.word = state.order[state.pos];
    G.parts = partsOf(G.word);
    G.mode = 'fly';
    G.findMisses = 0; G.sayTries = 0; G.spellTries = 0; G.reveal = false; G.docked = null;
    G.wordT0 = Date.now();
    makeBubbles(G.word);
    var r = G.rocket;
    r.launching = false; r.visible = true;
    if (!first) { r.x = G.W / 2; r.y = G.H + 90; }
    r.tx = G.W / 2; r.ty = G.bottom;
    G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
    G.prompt.hidden = false;
    G.prompt.innerHTML = '<span>🔊</span> Fly to the word you hear!';
    updateHud();
    Voice.stop();
    setTimeout(function () { if (G && G.mode === 'fly') sayTarget(first); }, first ? 300 : 900);
  }

  function sayTarget(first) {
    if (!G || !G.word) return;
    Voice.stop();
    if (G.mode === 'fly') {
      Voice.say(first ? 'Drag your finger to fly the rocket. Fly to the word: ' + G.word : 'Fly to the word: ' + G.word);
    } else {
      Voice.say(G.word, { rate: 0.75 });
    }
  }

  function updateHud() {
    if (!G) return;
    var ri = roundInfo();
    if (ri.done === 0 && state.pos > 0 && G.mode !== 'fly') {
      var prev = ri.start - ROUND;
      ri = { start: prev, size: ROUND, done: ROUND };
    }
    G.pips.innerHTML = '';
    for (var i = 0; i < ri.size; i++) {
      var p = el('i', null, i < ri.done ? '⭐' : (i === ri.done ? '🚀' : ''));
      if (i < ri.done) p.className = 'on'; else if (i === ri.done) p.className = 'now';
      G.pips.appendChild(p);
    }
    G.label.textContent = 'Word ' + Math.min(state.pos + 1, state.order.length) + ' of ' + state.order.length;
  }

  /* ----------------------------- steering --------------------------- */
  function pointerPos(e) { var r = G.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function onDown(e) {
    if (!G) return;
    ac();
    if (G.mode === 'soccer') return soccerDown(e);
    if (G.mode !== 'fly') return;
    G.dragging = true;
    steerTo(pointerPos(e));
  }
  function onMove(e) {
    if (!G) return;
    if (G.mode === 'soccer') return soccerMove(e);
    if (G.dragging && G.mode === 'fly') steerTo(pointerPos(e));
  }
  function onUp(e) {
    if (!G) return;
    if (G.mode === 'soccer') return soccerUp(e);
    G.dragging = false;
  }
  /* The rocket flies to just above the finger, so the finger never
     hides the rocket or the word it is about to touch. */
  function steerTo(p) {
    var r = G.rocket;
    r.tx = clamp(p.x, 30, G.W - 30);
    r.ty = clamp(p.y - 70 * G.S, G.top, G.H - 60);
  }
  function onKey(e) {
    if (!G || G.mode !== 'fly') return;
    if (/^Arrow/.test(e.key)) { G.keys[e.key] = 1; e.preventDefault(); }
  }
  function onKeyUp(e) { if (G) G.keys[e.key] = 0; }

  /* ------------------------------ update ---------------------------- */
  function frame(now) {
    if (!G) return;
    G.raf = requestAnimationFrame(frame);
    var dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000)); G.last = now;
    if (document.hidden) return;
    G.t += dt;
    if (G.mode === 'soccer') { updateSoccer(dt); drawSoccer(); return; }
    updateSpace(dt);
    drawSpace();
  }

  function updateSpace(dt) {
    var r = G.rocket, W = G.W, H = G.H;
    // keyboard steering, for a grown-up trying it on a laptop
    if (G.mode === 'fly' && (G.keys.ArrowLeft || G.keys.ArrowRight || G.keys.ArrowUp || G.keys.ArrowDown)) {
      var k = 520 * dt;
      r.tx = clamp(r.x + ((G.keys.ArrowRight ? 1 : 0) - (G.keys.ArrowLeft ? 1 : 0)) * k * 3, 30, W - 30);
      r.ty = clamp(r.y + ((G.keys.ArrowDown ? 1 : 0) - (G.keys.ArrowUp ? 1 : 0)) * k * 3, G.top, H - 60);
    }
    if (r.launching) {
      r.vy = Math.max(-1600, (r.vy || 0) - 2600 * dt);
      r.y += r.vy * dt; r.vx = 0;
      r.ang += (0 - r.ang) * Math.min(1, dt * 8);
      r.thrust = 1;
    } else {
      var dx = r.tx - r.x, dy = r.ty - r.y, d = Math.hypot(dx, dy);
      var sp = Math.min(d * 5, 760 * G.S);
      var vx = d > 1 ? dx / d * sp : 0, vy = d > 1 ? dy / d * sp : 0;
      r.vx += (vx - r.vx) * Math.min(1, dt * 10); r.vy += (vy - r.vy) * Math.min(1, dt * 10);
      r.x += r.vx * dt; r.y += r.vy * dt;
      var want = clamp(r.vx / 900, -0.55, 0.55);
      r.ang += (want - r.ang) * Math.min(1, dt * 8);
      r.thrust = clamp(Math.hypot(r.vx, r.vy) / 500, 0.15, 1);
    }
    // stars drift down, so the rocket always looks like it is flying up
    var speed = (G.mode === 'fly' ? 26 : 14) + G.warp * 1400;
    G.stars.forEach(function (s) {
      s.y += (speed * (0.3 + s.z) * dt) / H;
      if (s.y > 1.05) { s.y = -0.05; s.x = Math.random(); }
    });
    if (!r.launching) G.warp = Math.max(0, G.warp - dt * 0.8);

    // the words race across the sky
    G.bubbles.forEach(function (b) {
      if (b.gone) { b.alpha = Math.max(0, b.alpha - dt * 3); return; }
      b.alpha = Math.min(1, b.alpha + dt * 1.6);
      b.shake = Math.max(0, b.shake - dt * 2.2);
      b.cool = Math.max(0, b.cool - dt);
      if (G.docked === b) {
        // the found word rides on top of the rocket
        b.x += (r.x - b.x) * Math.min(1, dt * 10);
        b.y += (r.y - 95 * G.S - b.h / 2 - b.y) * Math.min(1, dt * 10);
        return;
      }
      if (G.mode !== 'fly') { b.alpha = Math.max(0, b.alpha - dt * 3); return; }
      b.x += b.vx * dt;
      if (b.vx > 0 && b.x - b.w / 2 > W) b.x = -b.w / 2;
      if (b.vx < 0 && b.x + b.w / 2 < 0) b.x = W + b.w / 2;
    });

    if (G.mode === 'fly') hitTest();

    // sparkles
    for (var i = G.fx.length - 1; i >= 0; i--) {
      var f = G.fx[i]; f.t += dt;
      f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt;
      if (f.t > f.life) G.fx.splice(i, 1);
    }
  }

  /* The nose of the rocket against each word. */
  function hitTest() {
    var r = G.rocket, nx = r.x + Math.sin(r.ang) * 44 * G.S, ny = r.y - Math.cos(r.ang) * 44 * G.S, rad = 24 * G.S;
    for (var i = 0; i < G.bubbles.length; i++) {
      var b = G.bubbles[i];
      if (b.gone || b.alpha < 0.6) continue;
      var cx = clamp(nx, b.x - b.w / 2, b.x + b.w / 2), cy = clamp(ny, b.y - b.h / 2, b.y + b.h / 2);
      if (Math.hypot(nx - cx, ny - cy) > rad) continue;
      if (b.target) return foundIt(b);
      if (b.cool > 0) continue;
      wrongWord(b);
      return;
    }
  }

  /* Bumped the wrong word: no penalty, just a nudge back and the owl
     reads him the word he hit, so even a miss is reading practice. */
  function wrongWord(b) {
    b.cool = 1.6; b.shake = 1;
    var r = G.rocket;
    r.ty = Math.min(G.H - 60, r.y + 90 * G.S); r.y += 18 * G.S; r.vy = 260;
    G.findMisses++;
    SFX.bump();
    if (G.findMisses === 1) logFind(false, 'letter-look');
    Voice.stop();
    Voice.say('That one says ' + b.word + '. Find ' + G.word + '.');
  }

  function foundIt(b) {
    G.mode = 'say';
    G.docked = b;
    G.prompt.hidden = true;
    logFind(true, null);
    SFX.found();
    sparkle(b.x, b.y, 22);
    var r = G.rocket;
    r.tx = G.W / 2; r.ty = Math.max(G.top + 150 * G.S, G.H * 0.36);
    sayStep();
  }

  function logFind(correct, tag) {
    Progress.logEvent({
      t: Date.now(), dayId: 'rocket', itemId: 'rocket-find-' + G.word, station: 'rocket', domain: 'rocket-find',
      correct: correct, tag: tag, attempt: G.findMisses + (correct ? 1 : 0), ms: Date.now() - G.wordT0, flags: [], word: G.word
    });
  }

  function sparkle(x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = rand(80, 320);
      G.fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, t: 0, life: rand(0.6, 1.1),
        c: ['#ffd34d', '#ffffff', '#7ee0a8', '#5ad8ff', '#ff9ad8'][i % 5], r: rand(3, 7) });
    }
  }

  /* ------------------------------ drawing --------------------------- */
  function drawSpace() {
    var ctx = G.ctx, W = G.W, H = G.H;
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.drawImage(G.backdrop, 0, 0, W, H);
    // stars, streaking at warp speed
    G.stars.forEach(function (s) {
      var x = s.x * W, y = s.y * H, size = 0.6 + s.z * 1.8;
      ctx.globalAlpha = 0.45 + s.z * 0.55;
      ctx.fillStyle = '#ffffff';
      if (G.warp > 0.05) {
        ctx.fillRect(x - size / 2, y - G.warp * 60 * (0.4 + s.z), size, G.warp * 60 * (0.4 + s.z) + size);
      } else {
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    });
    ctx.globalAlpha = 1;

    G.bubbles.forEach(function (b) { if (G.docked !== b) drawBubble(b); });
    if (G.rocket.visible) drawRocket(G.rocket);
    if (G.docked) drawBubble(G.docked);

    G.fx.forEach(function (f) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
      ctx.fillStyle = f.c;
      star(ctx, f.x, f.y, f.r);
    });
    ctx.globalAlpha = 1;
  }

  function star(ctx, x, y, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  /* A word is a glowing comet: a capsule with a fading tail behind it. */
  function drawBubble(b) {
    if (b.alpha <= 0.01) return;
    var ctx = G.ctx, x = b.x + Math.sin(G.t * 45) * 7 * b.shake, y = b.y, w = b.w, h = b.h;
    ctx.save();
    ctx.globalAlpha = b.alpha;
    var dir = b.vx >= 0 ? -1 : 1;
    if (G.docked !== b) {
      var tail = ctx.createLinearGradient(x, y, x + dir * (w / 2 + 120), y);
      tail.addColorStop(0, b.color); tail.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = tail;
      ctx.globalAlpha = b.alpha * 0.55;
      ctx.beginPath();
      ctx.moveTo(x + dir * w * 0.3, y - h * 0.42);
      ctx.lineTo(x + dir * (w / 2 + 120), y);
      ctx.lineTo(x + dir * w * 0.3, y + h * 0.42);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = b.alpha;
    }
    ctx.shadowColor = b.color; ctx.shadowBlur = 22;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
    var g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
    g.addColorStop(0, lighten(b.color)); g.addColorStop(1, b.color);
    ctx.fillStyle = g; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
    ctx.font = '800 ' + G.font + 'px ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(10,20,60,0.55)'; ctx.strokeText(b.word, x, y + 2);
    ctx.fillStyle = '#ffffff'; ctx.fillText(b.word, x, y + 2);
    ctx.restore();
  }
  function lighten(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return 'rgb(' + Math.round(r + (255 - r) * 0.35) + ',' + Math.round(g + (255 - g) * 0.35) + ',' + Math.round(b + (255 - b) * 0.35) + ')';
  }

  function drawRocket(r) {
    var ctx = G.ctx, s = G.S;
    ctx.save();
    ctx.translate(r.x, r.y); ctx.rotate(r.ang); ctx.scale(s, s);
    // flame
    var fl = 26 + r.thrust * 34 + Math.random() * 12 + (r.launching ? 50 : 0);
    var fg = ctx.createLinearGradient(0, 34, 0, 34 + fl);
    fg.addColorStop(0, '#fff6b0'); fg.addColorStop(0.35, '#ffb02e'); fg.addColorStop(1, 'rgba(255,60,30,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(-13, 32); ctx.quadraticCurveTo(0, 34 + fl * 1.1, 13, 32); ctx.closePath(); ctx.fill();
    // fins
    ctx.fillStyle = '#e8323c';
    ctx.beginPath(); ctx.moveTo(-17, 6); ctx.lineTo(-34, 38); ctx.lineTo(-16, 32); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(17, 6); ctx.lineTo(34, 38); ctx.lineTo(16, 32); ctx.closePath(); ctx.fill();
    // body
    var bg = ctx.createLinearGradient(-20, 0, 20, 0);
    bg.addColorStop(0, '#c9d6e6'); bg.addColorStop(0.45, '#ffffff'); bg.addColorStop(1, '#b4c4d8');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.moveTo(0, -50);
    ctx.bezierCurveTo(22, -32, 21, 2, 17, 34); ctx.lineTo(-17, 34); ctx.bezierCurveTo(-21, 2, -22, -32, 0, -50);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#7f93ad'; ctx.stroke();
    // red nose
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#e8323c'; ctx.fillRect(-30, -60, 60, 26);
    ctx.fillStyle = '#ffd34d'; ctx.fillRect(-30, 18, 60, 6);
    ctx.restore();
    // window
    ctx.fillStyle = '#5ad8ff'; ctx.strokeStyle = '#2a5a8a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -8, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(-3, -11, 3.5, 0, Math.PI * 2); ctx.fill();
    // middle fin
    ctx.fillStyle = '#b8202a'; ctx.fillRect(-2.5, 14, 5, 22);
    ctx.restore();
  }

  /* ============================ SAY IT =============================
     Same pronunciation check as Read & Say: the microphone, the
     soundalike forgiveness, the owl's coaching. "I said it" is the
     honour-system path, for a dead mic or a noisy kitchen. */
  function sayStep() {
    var w = G.word, parts = G.parts;
    G.sayTries = 0;
    var panel = G.panel;
    panel.className = 'rk-panel bottom';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-step', '🎤 You found it! Now say it.'));
    var big = el('div', 'rk-word');
    parts.forEach(function (p, i) {
      var c = el('span', 'chunk', p);
      c.addEventListener('click', function () { Voice.stop(); Voice.sayChunk(p, w, i); });
      big.appendChild(c);
    });
    card.appendChild(big);

    var micRow = el('div', 'mic-row');
    var hear = el('button', 'icon-btn', '🔊'); hear.setAttribute('aria-label', 'Hear the word');
    var mic = el('button', 'mic-btn', '🎤'); mic.setAttribute('aria-label', 'Say the word');
    var slow = el('button', 'icon-btn', '🐢'); slow.setAttribute('aria-label', 'Sound it out slowly');
    micRow.appendChild(hear); micRow.appendChild(mic); micRow.appendChild(slow);
    card.appendChild(micRow);
    var heard = el('div', 'heard', Voice.canListen() ? 'Tap the microphone and say the word.' : 'Say it out loud, then tap I said it.');
    card.appendChild(heard);

    var said = el('button', 'btn-big sun rk-wide');
    said.appendChild(el('span', null, '👍'));
    said.appendChild(el('span', null, 'I said it'));
    card.appendChild(said);
    panel.appendChild(card);

    hear.addEventListener('click', function () { Voice.stop(); Voice.say(w, { rate: 0.72 }); });
    slow.addEventListener('click', function () { Voice.stop(); Voice.soundOut(w, parts); });

    said.addEventListener('click', function () {
      if (G.sayTries === 0) {
        Progress.logEvent({
          t: Date.now(), dayId: 'rocket', itemId: 'rocket-say-' + w, station: 'rocket', domain: 'phonics',
          correct: true, attempt: 1, ms: 0, flags: ['self-reported']
        });
      }
      Voice.stop();
      // still inside his tap, so iOS lets the keyboard open straight away
      spellStep();
    });

    mic.addEventListener('click', function () {
      if (!Voice.canListen()) {
        Voice.stop();
        Voice.soundOut(w, parts).then(function () { heard.innerHTML = 'Now say it out loud, then tap <b>I said it</b>.'; });
        return;
      }
      Voice.stop();
      G.sayTries++;
      mic.classList.add('live');
      heard.textContent = 'Listening…';
      var t0 = Date.now(), tries = G.sayTries;
      Voice.listen({
        ms: 5000,
        onInterim: function (txt) { heard.innerHTML = 'I hear: <b>' + esc(txt) + '</b>'; }
      }).then(function (res) {
        mic.classList.remove('live');
        if (!G || G.mode !== 'say' || G.word !== w) return;
        if (res.reason === 'denied' || res.reason === 'unsupported') {
          heard.innerHTML = 'The microphone is off. Say it out loud, then tap <b>I said it</b>.';
          return;
        }
        var conf = Voice.match(w, res.transcript, res.alternatives);
        var v = Evaluate.judgeSpoken({
          word: w, parts: parts, confidence: conf, attempt: tries,
          heard: res.transcript, ms: Date.now() - t0, itemId: 'rocket-say-' + w
        });
        if (v.correct) {
          heard.innerHTML = '✅ <b>' + esc(w) + '</b>. That is it!';
          big.querySelectorAll('.chunk').forEach(function (c) { c.classList.add('lit'); });
          SFX.right();
          sparkle(G.rocket.x, G.rocket.y - 60, 14);
          Voice.say(v.speak).then(function () { if (G && G.mode === 'say' && G.word === w) spellStep(); });
        } else {
          heard.innerHTML = res.transcript ? 'I heard: <b>' + esc(res.transcript) + '</b>. Try again, or tap I said it.' : 'I did not catch that. Try again.';
          Voice.say(v.speak).then(function () { if (tries >= 2 && G && G.mode === 'say') return Voice.soundOut(w, parts); });
        }
      });
    });

    // never talk over the microphone: once he has tapped it, the
    // second line is dropped so the iPad cannot hear itself
    Voice.stop();
    Voice.say(Phrases.rocketSayIt).then(function () {
      if (G && G.mode === 'say' && G.word === w && G.sayTries === 0) return Voice.say(w, { rate: 0.75 });
    });
  }

  /* ============================ SPELL IT ===========================
     The word is hidden: this is the spelling test. Letter boxes show
     how long it is and fill in as he types on the iPad keyboard.

     Autocorrect, autocapitalise, spellcheck and suggestions are all
     switched off — otherwise iOS would quietly spell it for him. */
  function spellStep() {
    if (!G) return;
    var w = G.word;
    G.mode = 'spell';
    G.spellTries = 0; G.reveal = false; G.spellT0 = Date.now();
    G.rocket.tx = G.W / 2; G.rocket.ty = G.H * 0.8;
    G.docked = null;
    G.bubbles.forEach(function (b) { b.gone = true; });

    var panel = G.panel;
    panel.className = 'rk-panel top';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-step', '⌨️ Spell it on the keyboard!'));
    var reveal = el('div', 'rk-reveal');
    reveal.hidden = true;
    card.appendChild(reveal);

    var boxWrap = el('div', 'rk-boxwrap');
    var boxes = el('div', 'rk-boxes tap-me');
    var input = document.createElement('input');
    input.className = 'rk-input';
    input.type = 'text';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('enterkeyhint', 'go');
    input.setAttribute('aria-label', 'Type the word');
    input.maxLength = w.length + 4;
    boxWrap.appendChild(boxes); boxWrap.appendChild(input);
    card.appendChild(boxWrap);

    var heard = el('div', 'heard', 'Tap the boxes if the keyboard is not showing.');
    card.appendChild(heard);
    var r = el('div', 'rk-row');
    var hear = el('button', 'btn-big ghost compact');
    hear.appendChild(el('span', null, '🔊')); hear.appendChild(el('span', null, 'Hear it'));
    var check = el('button', 'btn-big rk-check');
    check.appendChild(el('span', null, '✅')); check.appendChild(el('span', null, 'Check'));
    r.appendChild(hear); r.appendChild(check);
    card.appendChild(r);
    panel.appendChild(card);

    var marks = null;
    function draw() {
      var val = input.value, n = Math.max(w.length, val.length);
      boxes.innerHTML = '';
      for (var i = 0; i < n; i++) {
        var b = el('span', 'rk-box', val[i] || '');
        if (marks && marks[i]) b.classList.add(marks[i]);
        else if (i === val.length && document.activeElement === input) b.classList.add('now');
        boxes.appendChild(b);
      }
    }
    G.spellDraw = draw;
    boxWrap.addEventListener('click', function () { focusInput(input); });
    input.addEventListener('focus', function () { boxes.classList.remove('tap-me'); draw(); });
    input.addEventListener('blur', function () { draw(); });
    input.addEventListener('input', function () {
      var v = input.value.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z']/g, '');
      if (v !== input.value) input.value = v;
      marks = null;
      draw();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); checkIt(); }
    });
    hear.addEventListener('click', function () { Voice.stop(); Voice.say(w, { rate: 0.72 }); focusInput(input); });
    check.addEventListener('click', function () { checkIt(); });

    function checkIt() {
      if (!G || G.mode !== 'spell') return;
      var val = input.value.toLowerCase();
      if (!val) { Voice.stop(); Voice.say('Type the letters first. Tap the boxes to bring up the keyboard.'); focusInput(input); return; }
      G.spellTries++;
      var ok = val === w;
      var tag = ok || G.reveal ? null : classify(w, val);
      Progress.logEvent({
        t: Date.now(), dayId: 'rocket', itemId: 'rocket-spell-' + w, station: 'rocket', domain: 'rocket-spelling',
        correct: ok, tag: tag, attempt: G.spellTries, ms: Date.now() - G.spellT0,
        flags: G.reveal ? ['copied'] : [], word: w, typed: val
      });
      if (ok) return spelled(input, boxes);

      // not yet: green for every letter already in the right place
      marks = [];
      for (var i = 0; i < Math.max(w.length, val.length); i++) marks.push(val[i] === w[i] ? 'ok' : 'fix');
      draw();
      SFX.oops();
      Voice.stop();
      if (G.reveal || G.spellTries >= 3) {
        showReveal();
        Voice.say('Here is how to spell it. ' + spellOut(w) + '. Now you type it.');
        input.value = ''; marks = null; draw();
      } else if (G.spellTries === 1) {
        var info = tag && Evaluate.tagInfo(tag);
        heard.innerHTML = 'Almost! The <b class="g">green</b> letters are right. Fix the <b class="o">orange</b> ones.';
        Voice.say('Almost! The green letters are right. ' + (info ? info.say : 'Fix the orange ones.'));
      } else {
        heard.innerHTML = 'Listen to the sounds, then fix the <b class="o">orange</b> letters.';
        Voice.say('Let me sound it out for you.').then(function () { return Voice.soundOut(w, G.parts); });
      }
      focusInput(input);
    }

    function showReveal() {
      G.reveal = true;
      reveal.hidden = false;
      reveal.innerHTML = '';
      reveal.appendChild(el('span', 'rk-reveal-tag', 'Copy it:'));
      reveal.appendChild(el('span', 'rk-reveal-word', w));
      heard.textContent = 'Look at the word and type it in the boxes.';
    }

    draw();
    focusInput(input);   // opens the keyboard when we got here from a tap
    Voice.stop();
    Voice.say(Phrases.rocketSpellIt).then(function () { if (G && G.mode === 'spell' && G.word === w) return Voice.say(w, { rate: 0.72 }); });
  }

  function focusInput(input) {
    try { input.focus({ preventScroll: true }); } catch (e) { try { input.focus(); } catch (e2) {} }
  }

  function spellOut(w) { return w.toUpperCase().split('').filter(function (c) { return /[A-Z]/.test(c); }).join(', '); }

  /* Name the kind of slip, using the same habits the rest of the app
     tracks, so the Thinking Report can say "spells it the way it
     sounds" across homework, the course and the rocket alike. */
  function classify(w, typed) {
    if (window.Homework) {
      var m = Homework.misspellings(w).filter(function (x) { return x.t === typed; })[0];
      if (m) return m.tag;
    }
    var V = /[aeiouy]/;
    if (typed.length === w.length) {
      var diffs = [];
      for (var i = 0; i < w.length; i++) if (w[i] !== typed[i]) diffs.push(i);
      if (diffs.length && diffs.every(function (i) { return V.test(w[i]) && V.test(typed[i]); })) return 'vowel-swap';
      if (diffs.length === 2 && diffs[1] === diffs[0] + 1 && w[diffs[0]] === typed[diffs[1]] && w[diffs[1]] === typed[diffs[0]]) return 'letter-look';
    }
    if (Voice.match(w, typed) >= 0.6) return 'sound-spelling';
    return null;
  }

  function spelled(input, boxes) {
    var w = G.word;
    try { input.blur(); } catch (e) {}
    boxes.querySelectorAll('.rk-box').forEach(function (b) { b.className = 'rk-box ok'; });
    boxes.classList.add('win');
    state.results[w] = { first: G.spellTries === 1 && !G.reveal, tries: G.spellTries };
    state.pos++;
    save();
    SFX.right();
    App.burst(10);
    sparkle(G.W / 2, G.H * 0.45, 26);
    updateHud();
    Voice.stop();
    Voice.say('Yes! ' + spellOut(w) + '. ' + w + '!');
    readyToLaunch();
  }

  /* ============================ LAUNCH ============================= */
  function readyToLaunch() {
    G.mode = 'ready';
    var ri = roundInfo(), last = state.pos >= state.order.length, roundEnd = ri.done === 0 && state.pos > 0;
    var panel = G.panel;
    panel.className = 'rk-panel bottom';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-big-em', last ? '🏆' : (roundEnd ? '⚽' : '⭐')));
    card.appendChild(el('div', 'rk-step', last ? 'You found every word!' : (roundEnd ? 'Five words done!' : 'Word complete!')));
    var go = el('button', 'rk-launch');
    if (last) { go.textContent = '🏁 Finish'; go.addEventListener('click', function () { roundStar(true); finishAll(); }); }
    else if (roundEnd) {
      go.textContent = '⚽ Soccer break!';
      go.addEventListener('click', function () {
        roundStar(false);
        startSoccer(function () { backToSpace(); });
      });
    } else { go.textContent = '🚀 LAUNCH'; go.addEventListener('click', launch); }
    card.appendChild(go);
    panel.appendChild(card);
  }

  /* One star per round of five, once a day per list, through the same
     star counter as the course and homework. */
  function roundStar(lastRound) {
    var idx = Math.floor((state.pos - 1) / ROUND);
    var res = Progress.completeStation('rocket-' + state.setAt + '-' + Progress.today() + '-r' + idx, 'rocket');
    if (res.star && window.Progress && Progress.checkBadges) Progress.checkBadges();
    return res;
  }

  function launch() {
    if (!G || G.mode !== 'ready') return;
    G.mode = 'launch';
    G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
    Voice.stop();
    Voice.say(Phrases.rocketBlastOff);
    var n = 3;
    function tick() {
      if (!G || G.mode !== 'launch') return;
      if (n > 0) {
        G.count.textContent = String(n);
        G.count.className = 'rk-count show';
        SFX.tick();
        n--;
        setTimeout(function () { if (G) G.count.className = 'rk-count'; }, 520);
        setTimeout(tick, 700);
        return;
      }
      G.count.textContent = 'BLAST OFF!';
      G.count.className = 'rk-count show wide';
      SFX.whoosh();
      G.rocket.launching = true; G.rocket.vy = -100;
      G.warp = 1;
      setTimeout(function () { if (G) G.count.className = 'rk-count'; }, 900);
      setTimeout(function () { if (G && G.mode === 'launch') nextWord(false); }, 1500);
    }
    tick();
  }

  function backToSpace() {
    if (!G) return;
    G.layer.classList.remove('soccer');
    G.mode = 'warp';            // nothing to steer at until the next word arrives
    G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
    G.warp = 1;
    Voice.stop();
    Voice.say(Phrases.rocketBack);
    setTimeout(function () { if (G) nextWord(false); }, 300);
  }

  /* =========================== ALL DONE ============================ */
  function finishAll() {
    if (!G) return;
    G.mode = 'done';
    G.prompt.hidden = true;
    var got = state.order.filter(function (w) { return state.results[w] && state.results[w].first; });
    var practice = state.order.filter(function (w) { return !(state.results[w] && state.results[w].first); });
    state.passes = (state.passes || 0) + 1;
    state.lastDone = Progress.today();
    save();
    App.burst(26);
    SFX.right();
    Voice.stop();
    Voice.say(Phrases.rocketDone);

    var panel = G.panel;
    panel.className = 'rk-panel bottom';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-big-em', '🏆'));
    card.appendChild(el('div', 'rk-step', 'Mission complete! ' + state.order.length + ' words'));
    card.appendChild(el('p', 'rk-sum', got.length + ' spelled right the first time.' +
      (practice.length ? ' Fly again to practice: ' + practice.join(', ') + '.' : ' Every single one!')));
    var r = el('div', 'rk-row');
    var again = el('button', 'btn-big ghost compact');
    again.appendChild(el('span', null, '🔁')); again.appendChild(el('span', null, 'Fly again'));
    again.addEventListener('click', function () {
      state.order = shuffle(practice.length ? practice : state.words); state.pos = 0; state.results = {}; save();
      nextWord(true);
    });
    var soccer = el('button', 'btn-big ghost compact');
    soccer.appendChild(el('span', null, '⚽')); soccer.appendChild(el('span', null, 'Soccer'));
    soccer.addEventListener('click', function () { startSoccer(function () { G.layer.classList.remove('soccer'); finishAllAgain(); }); });
    var home = el('button', 'btn-big');
    home.appendChild(el('span', null, '🏠')); home.appendChild(el('span', null, 'Home'));
    home.addEventListener('click', function () { exitGame(); });
    r.appendChild(again); r.appendChild(soccer); r.appendChild(home);
    card.appendChild(r);
    panel.appendChild(card);
    state.order = []; state.pos = 0; save();
  }
  function finishAllAgain() {
    if (!G) return;
    G.mode = 'done';
    G.panel.className = 'rk-panel bottom';
    G.panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-big-em', '🚀'));
    card.appendChild(el('div', 'rk-step', 'Great game!'));
    var r = el('div', 'rk-row');
    var again = el('button', 'btn-big ghost compact');
    again.appendChild(el('span', null, '🔁')); again.appendChild(el('span', null, 'Fly again'));
    again.addEventListener('click', function () { state.order = shuffle(state.words); state.pos = 0; state.results = {}; save(); nextWord(true); });
    var home = el('button', 'btn-big');
    home.appendChild(el('span', null, '🏠')); home.appendChild(el('span', null, 'Home'));
    home.addEventListener('click', function () { exitGame(); });
    r.appendChild(again); r.appendChild(home);
    card.appendChild(r);
    G.panel.appendChild(card);
  }

  /* ========================== SOCCER BREAK =========================
     A penalty shoot-out against a goalkeeper: swipe the ball with a
     finger. The direction of the swipe aims it; a faster swipe hits
     it higher, and too fast sails over the bar. Five shots. */
  var S = null;
  var SHOTS = 5;

  function startSoccer(after) {
    if (!G) return;
    G.mode = 'soccer';
    G.prompt.hidden = true;
    G.layer.classList.add('soccer');
    S = { after: after, shots: 0, goals: 0, ball: null, phase: 'aim', msg: '', msgT: 0, net: 0, keeper: { x: 0, dive: 0, diveDir: 0, target: 0 },
      swipe: null, hint: 1, crowd: [], conf: [] };
    layoutSoccer();
    Voice.stop();
    Voice.say(Phrases.rocketBreak);
    soccerPanel();
  }

  function layoutSoccer() {
    var W = G.W, H = G.H;
    var gw = Math.min(W * 0.66, 700), gh = gw * 0.36;
    S.goal = { x: W / 2 - gw / 2, y: Math.max(150, H * 0.2), w: gw, h: gh };
    S.line = S.goal.y + gh;
    S.spot = { x: W / 2, y: H * 0.8 };
    S.R = clamp(Math.min(W, H) * 0.05, 24, 46);
    if (!S.ball || S.phase === 'aim') S.ball = { x: S.spot.x, y: S.spot.y, s: 1, rot: 0, t: 0 };
    S.keeper.x = W / 2;
    makePitch();
  }

  function soccerPanel() {
    var panel = G.panel;
    panel.className = 'rk-panel top slim';
    panel.innerHTML = '';
    var card = el('div', 'rk-card rk-score');
    S.scoreEl = el('div', 'rk-step', '');
    card.appendChild(S.scoreEl);
    panel.appendChild(card);
    updateScore();
  }
  function updateScore() {
    if (!S || !S.scoreEl) return;
    var balls = '';
    for (var i = 0; i < SHOTS; i++) balls += i < S.shots ? (S.results && S.results[i] ? '⚽' : '✖️') : '⚪';
    S.scoreEl.textContent = 'Goals: ' + S.goals + '   ' + balls;
  }

  function makePitch() {
    var c = document.createElement('canvas'), W = G.W, H = G.H, dpr = G.dpr;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    var x = c.getContext('2d');
    x.scale(dpr, dpr);
    var horizon = S.line;
    // stadium night sky and crowd
    var sky = x.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#0b1a3a'); sky.addColorStop(1, '#23407a');
    x.fillStyle = sky; x.fillRect(0, 0, W, horizon);
    var standTop = S.goal.y - S.goal.h * 0.9;
    x.fillStyle = '#1a2440'; x.fillRect(0, standTop, W, horizon - standTop);
    var cols = ['#ff5a5a', '#ffd34d', '#5ad8ff', '#ffffff', '#7ee0a8', '#ff9ad8'];
    for (var i = 0; i < 520; i++) {
      x.fillStyle = cols[i % cols.length];
      x.globalAlpha = 0.65;
      x.beginPath(); x.arc(Math.random() * W, standTop + 6 + Math.random() * (horizon - standTop - 14), 2.2, 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
    // floodlights
    [0.08, 0.92].forEach(function (k) {
      var lx = W * k, ly = standTop - 40, g = x.createRadialGradient(lx, ly, 0, lx, ly, 160);
      g.addColorStop(0, 'rgba(255,255,230,0.9)'); g.addColorStop(1, 'rgba(255,255,230,0)');
      x.fillStyle = g; x.fillRect(lx - 160, ly - 160, 320, 320);
    });
    // grass in perspective stripes
    var stripes = 9;
    for (var s = 0; s < stripes; s++) {
      var t0 = s / stripes, t1 = (s + 1) / stripes;
      var y0 = horizon + (H - horizon) * t0 * t0, y1 = horizon + (H - horizon) * t1 * t1;
      x.fillStyle = s % 2 ? '#2f9e44' : '#37b24d';
      x.fillRect(0, y0, W, y1 - y0 + 1);
    }
    // penalty box and spot, in perspective
    x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 4;
    var bx = S.goal.w * 0.95, bTop = horizon, bBot = horizon + (H - horizon) * 0.42;
    x.beginPath();
    x.moveTo(W / 2 - bx * 0.62, bTop); x.lineTo(W / 2 - bx * 0.9, bBot); x.lineTo(W / 2 + bx * 0.9, bBot); x.lineTo(W / 2 + bx * 0.62, bTop);
    x.stroke();
    x.beginPath(); x.moveTo(0, horizon); x.lineTo(W, horizon); x.stroke();
    x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(S.spot.x, S.spot.y + S.R * 0.9, 9, 4, 0, 0, Math.PI * 2); x.fill();
    S.pitch = c;
  }

  /* ----------------------------- swiping ---------------------------- */
  function soccerDown(e) {
    if (!S || S.phase !== 'aim') return;
    var p = pointerPos(e);
    if (p.y < S.line) return;
    S.swipe = { x0: p.x, y0: p.y, t0: performance.now(), pts: [{ x: p.x, y: p.y, t: performance.now() }] };
  }
  function soccerMove(e) {
    if (!S || !S.swipe) return;
    var p = pointerPos(e);
    S.swipe.pts.push({ x: p.x, y: p.y, t: performance.now() });
    if (S.swipe.pts.length > 12) S.swipe.pts.shift();
  }
  function soccerUp(e) {
    if (!S || !S.swipe) return;
    var sw = S.swipe; S.swipe = null;
    var p = pointerPos(e), now = performance.now();
    var dx = p.x - sw.x0, dy = p.y - sw.y0;
    if (dy > -30) return;                      // only an upward flick is a shot
    // speed from the last part of the swipe, which is the flick itself
    var first = sw.pts[0];
    for (var i = 0; i < sw.pts.length; i++) if (now - sw.pts[i].t < 140) { first = sw.pts[i]; break; }
    var fdx = p.x - first.x, fdy = p.y - first.y, ft = Math.max(16, now - first.t);
    var speed = Math.hypot(fdx, fdy) / ft * 1000;
    if (Math.hypot(fdx, fdy) < 20) speed = Math.hypot(dx, dy) / Math.max(16, now - sw.t0) * 1000;
    shoot(dx, dy, speed);
  }

  function shoot(dx, dy, speed) {
    var b = S.ball;
    var tx = S.spot.x + dx / -dy * (S.spot.y - S.line);
    var v = speed / G.H;                                       // screen heights per second
    var h = clamp((v - 0.8) / 3.6, 0, 1.35);                   // 0 = along the ground, 1 = the crossbar
    S.shot = { x0: b.x, y0: b.y, tx: tx, ty: S.line - h * S.goal.h, h: h, t: 0, dur: clamp(1 - v * 0.11, 0.5, 0.9) };
    S.phase = 'flight';
    S.hint = 0;
    // the keeper guesses after a moment, the right way less than half
    // the time, and he cannot reach the corners: aiming away from him
    // scores about two shots in three
    var gw = S.goal.w;
    S.keeper.target = clamp(Math.random() < 0.4 ? tx + rand(-0.22, 0.22) * gw : S.goal.x + gw * rand(0.2, 0.8),
      S.goal.x + gw * 0.15, S.goal.x + gw * 0.85);
    S.keeper.react = 0.3;
    SFX.kick();
  }

  function updateSoccer(dt) {
    var k = S.keeper, g = S.goal;
    if (S.phase === 'aim') {
      k.x = g.x + g.w / 2 + Math.sin(G.t * 1.4) * g.w * 0.28;
      k.dive += (0 - k.dive) * Math.min(1, dt * 6);
    }
    if (S.phase === 'flight') {
      var sh = S.shot;
      sh.t += dt / sh.dur;
      var e = Math.min(1, sh.t);
      S.ball.x = sh.x0 + (sh.tx - sh.x0) * e;
      S.ball.y = sh.y0 + (sh.ty - sh.y0) * e - Math.sin(e * Math.PI) * sh.h * 40;
      S.ball.s = 1 - 0.55 * e;
      S.ball.rot += dt * 14;
      k.react -= dt;
      if (k.react <= 0) {
        var want = k.target, step = g.w * 0.35 * dt;
        k.x += clamp(want - k.x, -step, step);
        k.diveDir = want < k.x ? -1 : 1;
        k.dive = Math.min(1, k.dive + dt * 3.2);
      }
      if (sh.t >= 1) resolveShot();
    }
    if (S.phase === 'result') {
      S.msgT -= dt;
      if (S.goalScored) { S.net = Math.max(0, S.net - dt * 1.2); S.ball.y += (S.goal.y + S.goal.h * 0.55 - S.ball.y) * Math.min(1, dt * 4); }
      else if (S.saved) { S.ball.y += 260 * dt; S.ball.x += S.bounce * dt; S.ball.s = Math.min(1, S.ball.s + dt * 0.6); }
      else { S.ball.y -= 120 * dt; S.ball.s = Math.max(0.2, S.ball.s - dt * 0.4); }
      if (S.msgT <= 0) nextShot();
    }
    for (var i = S.conf.length - 1; i >= 0; i--) {
      var c = S.conf[i]; c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 260 * dt;
      if (c.t > c.life) S.conf.splice(i, 1);
    }
  }

  function resolveShot() {
    var sh = S.shot, g = S.goal, k = S.keeper, post = 10;
    // standing, he covers a little either side; diving, he reaches
    // further — but only on the side he dived to
    var x = sh.tx, off = x - k.x, stand = g.w * 0.05, dive = k.dive * g.w * 0.12;
    var blocked = Math.abs(off) < stand || (k.diveDir * off > 0 && Math.abs(off) < stand + dive);
    S.phase = 'result'; S.msgT = 1.8;
    S.goalScored = false; S.saved = false;
    var lines;
    if (sh.h > 1.02) { S.msg = 'Over the bar!'; lines = ['Too high! Swipe a little slower.', 'Over the bar!']; SFX.groan(); }
    else if (x < g.x - post || x > g.x + g.w + post) { S.msg = 'Just wide!'; lines = ['Just wide! Aim between the posts.', 'So close!']; SFX.groan(); }
    else if (blocked && sh.h < 0.95) {
      S.saved = true; S.bounce = (x < k.x ? -1 : 1) * 160;
      S.msg = 'Saved!'; lines = ['Great save by the keeper! Try the corners.', 'Saved! Aim away from the keeper.'];
      SFX.groan();
    } else {
      S.goalScored = true; S.goals++; S.net = 1;
      S.msg = 'GOAL!';
      lines = ['Goal! What a shot!', 'Gooooal!', 'Top corner! Amazing!', 'Siuuu! Goal!', 'Into the net!'];
      SFX.cheer();
      for (var i = 0; i < 40; i++) {
        var a = rand(-Math.PI, 0);
        S.conf.push({ x: x, y: sh.ty, vx: Math.cos(a) * rand(80, 360), vy: Math.sin(a) * rand(120, 420), t: 0, life: rand(0.9, 1.6),
          c: ['#ffd34d', '#ffffff', '#ff5a5a', '#5ad8ff', '#7ee0a8'][i % 5] });
      }
    }
    S.results = S.results || [];
    S.results[S.shots] = S.goalScored;
    S.shots++;
    updateScore();
    Voice.stop();
    Voice.say(lines[Math.floor(Math.random() * lines.length)]);
  }

  function nextShot() {
    if (S.shots >= SHOTS) return soccerOver();
    S.phase = 'aim';
    S.ball = { x: S.spot.x, y: S.spot.y, s: 1, rot: 0 };
    S.goalScored = false; S.saved = false;
  }

  function soccerOver() {
    S.phase = 'over';
    var panel = G.panel;
    panel.className = 'rk-panel bottom';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-big-em', S.goals >= 3 ? '🏆' : '⚽'));
    card.appendChild(el('div', 'rk-step', S.goals + (S.goals === 1 ? ' goal' : ' goals') + ' out of ' + SHOTS + '!'));
    var go = el('button', 'rk-launch');
    var left = state.order.length && state.pos < state.order.length;
    go.textContent = left ? '🚀 Back to space' : '👍 Done';
    go.addEventListener('click', function () {
      var after = S.after;
      S = null;
      if (after) after();
    });
    card.appendChild(go);
    panel.appendChild(card);
    Voice.stop();
    Voice.say(S.goals >= 3 ? 'What a striker! ' + S.goals + ' goals.' : 'Nice shooting! ' + S.goals + (S.goals === 1 ? ' goal.' : ' goals.'));
  }

  /* ----------------------------- drawing ---------------------------- */
  function drawSoccer() {
    if (!S) return;
    var ctx = G.ctx, W = G.W, g = S.goal;
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.drawImage(S.pitch, 0, 0, W, G.H);

    // net, with a ripple when the ball goes in
    var back = 18, ripple = S.net * 10;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5;
    for (var i = 0; i <= 18; i++) {
      var xx = g.x + g.w * i / 18;
      ctx.beginPath(); ctx.moveTo(xx, g.y - back * 0.4);
      ctx.quadraticCurveTo(xx + Math.sin(G.t * 20 + i) * ripple, g.y + g.h / 2, xx, g.y + g.h); ctx.stroke();
    }
    for (var j = 0; j <= 7; j++) {
      var yy = g.y + g.h * j / 7;
      ctx.beginPath(); ctx.moveTo(g.x, yy);
      ctx.quadraticCurveTo(g.x + g.w / 2, yy + Math.sin(G.t * 18 + j) * ripple, g.x + g.w, yy); ctx.stroke();
    }
    ctx.restore();

    drawKeeper();

    // posts and crossbar
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6;
    ctx.fillRect(g.x - 8, g.y - 8, 10, g.h + 8);
    ctx.fillRect(g.x + g.w - 2, g.y - 8, 10, g.h + 8);
    ctx.fillRect(g.x - 8, g.y - 8, g.w + 16, 10);
    ctx.shadowBlur = 0;

    // the ball and its shadow
    var b = S.ball, R = S.R * b.s;
    if (b) {
      var groundY = S.phase === 'flight' ? S.shot.y0 + (S.line - S.shot.y0) * Math.min(1, S.shot.t) : b.y + R * 0.9;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(b.x, Math.max(groundY, b.y + R * 0.8), R * 0.9, R * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      drawBall(ctx, b.x, b.y, R, b.rot);
    }

    // a finger showing how to flick, until the first shot
    if (S.phase === 'aim' && S.hint) {
      var k = (G.t % 1.6) / 1.6;
      ctx.globalAlpha = k < 0.8 ? 1 - k : 0;
      ctx.font = Math.round(S.R * 1.6) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👆', S.spot.x + S.R * 0.3, S.spot.y + S.R * 1.5 - k * S.R * 4.5);
      ctx.globalAlpha = 1;
      bannerText(ctx, 'Swipe the ball up into the goal!', W / 2, S.spot.y + S.R * 3.2, Math.round(S.R * 0.62), '#ffffff');
    }

    S.conf.forEach(function (c) {
      ctx.globalAlpha = Math.max(0, 1 - c.t / c.life); ctx.fillStyle = c.c;
      ctx.fillRect(c.x - 4, c.y - 4, 8, 8);
    });
    ctx.globalAlpha = 1;

    if (S.phase === 'result' && S.msg) {
      var big = S.goalScored ? Math.round(Math.min(W, G.H) * 0.13) : Math.round(Math.min(W, G.H) * 0.08);
      bannerText(ctx, S.msg, W / 2, g.y + g.h + big * 1.2, big, S.goalScored ? '#ffd34d' : '#ffffff');
    }
  }

  function bannerText(ctx, text, x, y, size, color) {
    ctx.font = '900 ' + size + 'px ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(4, size * 0.14); ctx.strokeStyle = 'rgba(10,20,50,0.85)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }

  function drawBall(ctx, x, y, R, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    var g = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfd6e0');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = Math.max(1, R * 0.06); ctx.strokeStyle = '#2a2f3a'; ctx.stroke();
    ctx.fillStyle = '#20242e';
    pentagon(ctx, 0, 0, R * 0.33, 0);
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.98, 0, Math.PI * 2); ctx.clip();
      pentagon(ctx, Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86, R * 0.26, a + Math.PI);
      ctx.restore();
    }
    ctx.restore();
  }
  function pentagon(ctx, x, y, r, rot) {
    ctx.beginPath();
    for (var i = 0; i < 5; i++) { var a = rot - Math.PI / 2 + i * Math.PI * 2 / 5; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
  }

  function drawKeeper() {
    var ctx = G.ctx, k = S.keeper, g = S.goal;
    var h = g.h * 0.82, w = h * 0.42, footY = g.y + g.h;
    ctx.save();
    ctx.translate(k.x, footY);
    ctx.rotate(k.dive * k.diveDir * 1.15);
    // legs
    ctx.fillStyle = '#1b2a4a';
    ctx.fillRect(-w * 0.32, -h * 0.36, w * 0.24, h * 0.36);
    ctx.fillRect(w * 0.08, -h * 0.36, w * 0.24, h * 0.36);
    // shirt
    ctx.fillStyle = '#ffd34d';
    roundRect(ctx, -w / 2, -h * 0.8, w, h * 0.48, w * 0.2); ctx.fill();
    ctx.fillStyle = '#1b2a4a'; ctx.font = '900 ' + Math.round(w * 0.4) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('1', 0, -h * 0.57);
    // arms out, reaching more when diving
    var reach = w * (0.55 + k.dive * 0.5);
    ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = w * 0.18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * 0.45, -h * 0.72); ctx.lineTo(-w * 0.45 - reach, -h * (0.82 + k.dive * 0.1)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.45, -h * 0.72); ctx.lineTo(w * 0.45 + reach, -h * (0.82 + k.dive * 0.1)); ctx.stroke();
    // gloves
    ctx.fillStyle = '#2fbf71';
    ctx.beginPath(); ctx.arc(-w * 0.45 - reach, -h * (0.82 + k.dive * 0.1), w * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.45 + reach, -h * (0.82 + k.dive * 0.1), w * 0.16, 0, Math.PI * 2); ctx.fill();
    // head
    ctx.fillStyle = '#f2c79a';
    ctx.beginPath(); ctx.arc(0, -h * 0.9, w * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2a14';
    ctx.beginPath(); ctx.arc(0, -h * 0.95, w * 0.24, Math.PI, 0); ctx.fill();
    ctx.restore();
  }

  /* ============================ HOME TILE ========================== */
  /* The home tile shows how many words are left to fly. Once he has
     done the whole list it stays quiet for the rest of the day. */
  function tileCount() {
    if (!state.words.length) return 0;
    if (!inPass() && state.lastDone === Progress.today()) return 0;
    return wordsLeft();
  }

  return {
    render: render, inGame: inGame, stopGame: stopGame, tileCount: tileCount,
    // for the tests
    _state: function () { return state; },
    _game: function () { return G; },
    _soccer: function () { return S; },
    _setWords: setWords,
    _shoot: function (dx, dy, speed) { if (S && S.phase === 'aim') shoot(dx, dy, speed); },
    _found: function () { if (G && G.mode === 'fly') { var b = G.bubbles.filter(function (x) { return x.target && !x.gone; })[0]; if (b) foundIt(b); } },
    _classify: classify
  };
})();
