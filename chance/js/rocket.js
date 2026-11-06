/* ============================================================
   rocket.js — 🚀 Spelling Rocket

   This week's spelling list, turned into a space journey:

     1. A grown-up photographs the list that came home from school
        (the same on-device reader and grown-up check as Scan
        Homework), or types it. The list stays until next week's.
     2. The words float in the sky on planets and stars. The voice
        says one, and Chance taps the planet or star it is written
        on, which means reading every word in the sky.
     3. He SAYS it into the microphone, then SPELLS it on the iPad
        keyboard with the word hidden. A miss shows which letters
        were right, then sounds it out, then shows it to copy.
     4. Every word he spells earns a piece of a rocket on the launch
        pad: engine, fuel tank, window, nose cone, boosters. Five
        pieces and the rocket is built, and it flies:
            5 words   -> Venus
           10 words   -> Saturn
           15 words   -> a new galaxy
           20 words   -> beyond the galaxy, where it is all stardust
        A soccer break waits at each stop. A short list keeps going
        round, missed words first, so every stop is reachable.

   Every direction and every bit of praise is a fixed line in LINES
   below, and they all appear in the recording booth (Grown-ups ->
   Use your own voice -> Spelling Rocket), together with this
   week's words. Record them and Grandpa's real voice gives every
   instruction; anything not recorded uses the computer voice.
   ============================================================ */

window.Rocket = (function () {

  var KEY = 'chance.rocket.v1';
  var PIECES = 5;

  /* ------------------------ what the voice says ------------------------
     Kept as whole, fixed sentences so each one can be recorded once in
     the booth. Words are never glued into a sentence: "Find this word:"
     is one clip and the word is another, so both can be recorded. */
  var LINES = {
    start: "Hi Chance! Let's build a rocket. Spell five words and we can fly to Venus!",
    find: 'Find this word:',
    notIt: 'That one says',
    lookFor: 'Look for',
    sayIt: 'You found it! Now say the word out loud.',
    saidRight: "Yes! That's it!",
    sayAgain: "Let's try that again. Listen.",
    spellIt: 'Now spell it on the keyboard.',
    squeeze: 'Squeeze these two words into one:',
    apostrophe: 'The apostrophe takes the place of the missing letters.',
    almost: 'Almost! The green letters are right. Fix the orange ones.',
    soundOut: 'Listen. Let me sound it out for you.',
    copyIt: 'Here is how to spell it. Copy it into the boxes.',
    typeFirst: 'Type the letters first. Tap the boxes to bring up the keyboard.',
    praise: ['Great job, Chance!', 'You spelled it! Great job, Chance!', 'Awesome spelling, Chance!'],
    pieces: ['Here comes the rocket engine!', 'Here comes the fuel tank!', 'Here comes the window!',
      'Here comes the nose cone!', 'Here comes the last piece!'],
    built: ['Great job Chance! Now we can build a rocket to go to Venus!',
      'Great job Chance! Now we can build a rocket to go to Saturn!',
      'Great job Chance! Now we can build a rocket to go to a new galaxy!',
      'Great job Chance! Now we can build a rocket to go beyond the galaxy!'],
    countdown: 'Three, two, one, blast off!',
    arrive: ['We made it to Venus! Venus is the hottest planet of all.',
      'We made it to Saturn! Look at those beautiful rings.',
      'Welcome to a brand new galaxy! Billions of stars!',
      'Beyond the galaxy, everything is stardust. You did it, Chance!'],
    nextLeg: ["Let's build a new rocket. Next stop: Saturn!",
      "Let's build a new rocket. Next stop: a new galaxy!",
      "Let's build one more rocket, to go beyond the galaxy!"],
    soccer: 'Time for a soccer break! Swipe the ball into the goal.',
    goal: ['Goal! Great shot, Chance!', 'Goooal! What a kick!'],
    saved: 'Saved by the keeper! Try a corner.',
    over: 'Too high! Swipe a little slower.',
    wide: 'Just wide! Aim between the posts.',
    soccerDone: 'Great shooting! Back to space!',
    finish: 'You flew beyond the galaxy! You are a super speller, Chance!'
  };

  var DESTS = [
    { name: 'Venus', em: '🟠', at: 5 },
    { name: 'Saturn', em: '🪐', at: 10 },
    { name: 'a new galaxy', em: '🌌', at: 15 },
    { name: 'beyond the galaxy', em: '✨', at: 20 }
  ];
  var PART_NAMES = ['engine', 'fuel tank', 'window', 'nose cone', 'boosters'];
  var PART_EMS = ['⚙️', '🛢️', '🪟', '🔺', '🔥'];

  /* ------------------------- saved state ------------------------
     words    this week's list, in the teacher's order
     setAt    when the list was saved (also names the list)
     order    the shuffled queue of words; refilled when it runs out
     pos      how far through the queue he is
     results  word -> { first: spelled right first try, tries }
     journey  { leg: 0 Venus .. 3 beyond, built: pieces on the pad,
                spelled: words spelled this journey } */
  var state = freshState([]);

  function freshState(words) {
    return { words: words, setAt: Date.now(), order: [], pos: 0, results: {}, passes: 0,
      journey: newJourney(), lastDone: null };
  }
  function newJourney() { return { leg: 0, built: 0, spelled: 0 }; }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) {}
    if (!Array.isArray(state.words)) state.words = [];
    if (!Array.isArray(state.order)) state.order = [];
    if (!state.results || typeof state.results !== 'object') state.results = {};
    fixJourney();
  }
  /* A journey that ran past the last stop (he left on the final
     screen) starts over rather than pointing at a stop that isn't. */
  function fixJourney() {
    var j = state.journey;
    if (!j || typeof j !== 'object' || !(j.leg >= 0) || j.leg >= DESTS.length || !(j.built >= 0) || j.built >= PIECES) {
      state.journey = newJourney();
    }
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
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  /* "sh-ad-ow" -> "shadow"; letters and apostrophes only */
  /* "sh-ad-ow" -> "shadow"; "It’s" -> "it's"; "i'll" -> "I'll" */
  function cleanWord(w) {
    return String(w || '').toLowerCase().replace(/[‘’]/g, "'").replace(/-/g, '').replace(/[^a-z']/g, '')
      .replace(/^i(?='|$)/, 'I');
  }
  /* "it's" -> "it is", or null for a word that is not a contraction */
  function expansion(w) { return window.Homework && Homework.expand ? Homework.expand(w) : null; }
  function partsOf(w) {
    if (w.indexOf("'") !== -1) return [w];        // a contraction is said whole, not sounded out
    var it = window.Homework ? Homework.wordItem(w) : null;
    return it ? it.parts : [w];
  }
  function journeyStarted() { var j = state.journey; return j.leg > 0 || j.built > 0; }

  function setWords(words) {
    var seen = {}, list = [];
    (words || []).forEach(function (w) {
      var c = cleanWord(w);
      if (c.length > 1 && !seen[c]) { seen[c] = 1; list.push(c); }
    });
    state = freshState(list);
    save();
  }

  /* The queue never runs dry: when the list is used up it goes round
     again, the words he has not yet spelled first time first. */
  function nextQueued() {
    if (state.pos >= state.order.length) {
      var missed = state.words.filter(function (w) { return !(state.results[w] && state.results[w].first); });
      var rest = state.words.filter(function (w) { return missed.indexOf(w) === -1; });
      var last = state.order[state.order.length - 1];
      var next = shuffle(missed).concat(shuffle(rest));
      if (next.length > 1 && next[0] === last) next.push(next.shift());   // never the same word twice running
      state.order = next;
      state.pos = 0;
      save();
    }
    return state.order[state.pos];
  }

  /* ---------------------- talking, in Grandpa's voice ------------------
     Voice.say plays a recording of the exact line when one exists and
     falls back to the computer voice otherwise. */
  function talk(line) { return Voice.say(line); }
  function sayWord(w) { return Voice.say(w, { rate: 0.75 }); }

  /* Everything above, plus the week's words, for the recording booth. */
  function voiceLines() {
    var out = [];
    function add(t, note) { if (t && !out.some(function (x) { return x.text === t; })) out.push({ text: t, kind: 'say', note: note }); }
    Object.keys(LINES).forEach(function (k) {
      var v = LINES[k];
      if (Array.isArray(v)) v.forEach(function (t, i) { add(t, k + ' ' + (i + 1)); });
      else add(v, k);
    });
    state.words.forEach(function (w) {
      add(w, 'this week\'s word');
      var e = expansion(w);
      if (e) add(e, 'the two words in ' + w);
    });
    return out;
  }

  /* ========================== SETUP SCREEN ========================= */
  var bodyEl = null;

  function render(body) {
    bodyEl = body;
    stopGame();
    fixJourney();
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

  function recordButton() {
    return App.ui.btn('🎙️', 'Record your voice for the rocket', function () { App.go('studio', { group: 'rocket' }); });
  }

  function renderSetup(body) {
    body.appendChild(banner('Spelling Rocket',
      'Find this week\'s spelling words on the planets and stars, say them, and spell them. Every word builds a piece of a rocket: 5 words to Venus, 10 to Saturn, 15 to a new galaxy!'));

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
    r.appendChild(recordButton());
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
    var n = state.words.length, j = state.journey, dest = DESTS[j.leg];
    var when = new Date(state.setAt || Date.now());
    var ageDays = (Date.now() - (state.setAt || Date.now())) / 86400000;
    body.appendChild(banner('Spelling Rocket',
      n + ' word' + (n === 1 ? '' : 's') + ' this week · saved ' +
      when.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })));

    if (ageDays > 6) {
      body.appendChild(el('p', 'rk-note', '📅 These words are from last week. Grown-ups: tap "New week\'s words" to scan the new list.'));
    }

    // the journey so far: Venus, Saturn, galaxy, beyond
    var trail = el('div', 'rk-trail');
    DESTS.forEach(function (d, i) {
      var stop = el('div', 'rk-stop' + (i < j.leg ? ' been' : (i === j.leg ? ' next' : '')));
      stop.appendChild(el('span', 'em', d.em));
      stop.appendChild(el('span', 'nm', d.name));
      stop.appendChild(el('span', 'ct', d.at + ' words'));
      trail.appendChild(stop);
    });
    body.appendChild(trail);

    var chips = el('div', 'rk-chips');
    state.words.forEach(function (w) {
      var c = el('button', 'rk-chip', w);
      var r = state.results[w];
      if (r) c.classList.add(r.first ? 'got' : 'practiced');
      c.addEventListener('click', function () { Voice.stop(); sayWord(w); });
      chips.appendChild(c);
    });
    body.appendChild(chips);
    body.appendChild(el('p', 'rk-note', 'Tap a word to hear it.'));

    var go = el('button', 'rk-go');
    go.appendChild(el('span', 'rk-go-em', '🚀'));
    var gt = el('span', 'scan-text');
    if (journeyStarted()) {
      gt.appendChild(el('b', null, 'Keep building!'));
      gt.appendChild(el('span', null, j.built + ' of ' + PIECES + ' rocket pieces · next stop: ' + dest.name));
    } else {
      gt.appendChild(el('b', null, 'Build a rocket!'));
      gt.appendChild(el('span', null, 'Spell 5 words to fly to Venus'));
    }
    go.appendChild(gt);
    go.addEventListener('click', function () { startGame(false); });
    body.appendChild(go);

    if (journeyStarted()) {
      var r = el('div', 'row');
      r.appendChild(App.ui.btn('🔁', 'Start a new journey', function () { startGame(true); }));
      body.appendChild(r);
    }

    body.appendChild(el('div', 'week-title', 'GROWN-UPS'));
    var g = el('div', 'row');
    g.appendChild(recordButton());
    g.appendChild(App.ui.btn('📷', 'New week\'s words', function () { HWUI.scanFor(body, true, scanOpts(body)); }));
    g.appendChild(App.ui.btn('✏️', 'Fix or add words', function () { HWUI.checkWords(body, state.words, scanOpts(body)); }));
    body.appendChild(g);
    if (window.Recordings) {
      var lines = voiceLines();
      var have = lines.filter(function (l) { return Recordings.has(l.text, l.kind); }).length;
      body.appendChild(el('p', 'rk-note', '🎙️ ' + have + ' of ' + lines.length +
        ' rocket lines are in your voice. Anything not recorded uses the computer voice.'));
    }
  }

  /* ============================== SOUND ============================
     Small game sounds, kept quiet under the voice. */
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
    clunk: function () { tone(180, 90, 0.12, 'square', 0.05); tone(900, 1400, 0.12, 'sine', 0.04, 0.1); },
    oops: function () { tone(330, 260, 0.22, 'sine', 0.04); },
    tick: function () { tone(880, 880, 0.09, 'square', 0.025); },
    whoosh: function () { noise(1.8, 0.35, 200, 2400); tone(90, 40, 1.6, 'sawtooth', 0.04); },
    kick: function () { tone(160, 50, 0.16, 'sine', 0.18); noise(0.08, 0.2, 1500, 600); },
    cheer: function () { noise(1.8, 0.28, 900, 1400); noise(1.4, 0.18, 2000, 2600, 0.2); },
    groan: function () { noise(0.9, 0.16, 500, 250); }
  };

  /* ============================ THE GAME =========================== */
  var G = null;      // everything about the game that is running

  function inGame() { return !!G; }

  function startGame(fresh) {
    if (fresh) {
      state.journey = newJourney();
      state.order = []; state.pos = 0; state.results = {};
      save();
    }
    fixJourney();
    if (window.Evaluate) Evaluate.startSession('rocket');
    Voice.stop();
    ac();
    buildLayer();
    var j = state.journey;
    if (!journeyStarted()) talk(LINES.start);
    else if (!j.built && j.leg > 0) talk(LINES.nextLeg[j.leg - 1]);
    nextWord();
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
      mode: 'find', word: null, parts: [], bodies: [], fx: [], stars: [], warp: 0,
      ship: { lift: 0, vy: 0, flying: false }, flyPiece: null, dest: null,
      findMisses: 0, sayTries: 0, spellTries: 0, reveal: false, caught: null
    };

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
    G.raf = requestAnimationFrame(frame);
  }

  function stopGame() {
    if (!G) return;
    cancelAnimationFrame(G.raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
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

  /* Leaving mid-game is a pause: every piece on the pad is saved. */
  function confirmExit() {
    Voice.stop();
    var u = App.ui, j = state.journey;
    App.sheet([
      u.big('🏠'),
      u.h3('Stop for now?'),
      u.p(j.built ? 'Your rocket is saved: ' + j.built + ' of ' + PIECES + ' pieces built. Come back to finish it!' : 'You can come back to the rocket any time.'),
      u.row([
        u.btn('🚀', 'Keep building', function () { App.closeSheet(); }),
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
    G.S = clamp(Math.min(W, H) / 820, 0.62, 1.25);
    G.font = Math.round(clamp(Math.min(W, H) * 0.048, 24, 44));
    G.top = 128;
    G.padY = H - 34 * G.S;                     // the launch pad surface
    G.padX = W / 2;
    G.RS = G.S * (H > W ? 1.7 : 1.35);         // the rocket on the pad, big enough to see each piece
    G.skyBottom = G.padY - 168 * G.RS;         // planets stay above the rocket
    makeBackdrop();
    if (!G.stars.length) for (var i = 0; i < 170; i++) G.stars.push({ x: Math.random(), y: Math.random(), z: Math.random() });
    layoutBodies();
    if (G.mode === 'soccer' && S) layoutSoccer();
  }

  /* The sky: deep blue, a few soft nebulae. Drawn once per resize. */
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
    G.backdrop = c;
  }

  /* ------------------------ planets and stars ------------------------ */
  var PLANETS = [
    ['#ffb3c7', '#e8436b'], ['#9fd8ff', '#2f86d8'], ['#c9b3ff', '#7347d8'],
    ['#a8f0c0', '#2a9e5c'], ['#ffd0a0', '#e07a26'], ['#9ff0ec', '#169a96']
  ];

  function pickDistractors(word) {
    var others = shuffle(state.words.filter(function (w) { return w !== word; }));
    var out = others.slice(0, 3);
    // a short list gets look-alike spellings so there is still something to read
    if (out.length < 3 && window.Homework) {
      Homework.misspellings(word).forEach(function (m) { if (out.length < 3 && out.indexOf(m.t) === -1) out.push(m.t); });
    }
    return out;
  }

  function makeBodies(word) {
    var words = shuffle([word].concat(pickDistractors(word)));
    var looks = shuffle(PLANETS);
    G.bodies = words.map(function (w, i) {
      return {
        word: w, target: w === word, slot: i,
        kind: (i % 2 === 0 && w.length <= 7) ? 'star' : 'planet',
        look: looks[i % looks.length], ring: Math.random() < 0.45,
        x: 0, y: 0, hx: 0, hy: 0, r: 0, phase: Math.random() * 6, alpha: 0, shake: 0, cool: 0, gone: false
      };
    });
    layoutBodies();
  }

  /* Four homes in a loose 2 x 2, each body drifting gently around its
     home so it is easy to read and easy for a small finger to tap. */
  function layoutBodies() {
    if (!G || !G.bodies.length) return;
    var ctx = G.ctx;
    ctx.font = '800 ' + G.font + 'px ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif';
    var top = G.top + 20, bottom = G.skyBottom, rows = 2, cols = 2;
    var cellW = G.W / cols, cellH = (bottom - top) / rows;
    var spots = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      spots.push({ x: cellW * (c + 0.5) + (r % 2 ? 0.12 : -0.08) * cellW, y: top + cellH * (r + 0.5) });
    }
    G.bodies.forEach(function (b, i) {
      var tw = ctx.measureText(b.word).width;
      var maxR = Math.min(cellW, cellH) * 0.46;
      b.r = Math.min(maxR, b.kind === 'star' ? Math.max(tw * 0.68, G.font * 1.7) : Math.max(tw / 2 + G.font * 0.55, G.font * 1.5));
      b.hx = spots[i % spots.length].x; b.hy = spots[i % spots.length].y;
      if (!b.x) { b.x = b.hx; b.y = b.hy; }
    });
  }

  /* --------------------------- each new word ----------------------- */
  function nextWord() {
    if (!G) return;
    G.word = nextQueued();
    G.parts = partsOf(G.word);
    G.mode = 'find';
    G.dest = null;
    G.findMisses = 0; G.sayTries = 0; G.spellTries = 0; G.reveal = false; G.caught = null;
    G.wordT0 = Date.now();
    makeBodies(G.word);
    G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
    G.prompt.hidden = false;
    G.prompt.innerHTML = '<span>🔊</span> Tap the planet or star with the word!';
    updateHud();
    // queued after whatever is still being said (praise, next stop)
    talk(LINES.find); sayWord(G.word);
  }

  function sayTarget() {
    if (!G || !G.word) return;
    Voice.stop();
    if (G.mode === 'find') { talk(LINES.find); sayWord(G.word); }
    else sayWord(G.word);
  }

  function updateHud() {
    if (!G) return;
    var j = state.journey;
    G.pips.innerHTML = '';
    for (var i = 0; i < PIECES; i++) {
      var p = el('i', null, PART_EMS[i]);
      p.className = i < j.built ? 'on' : (i === j.built ? 'now' : 'off');
      p.title = PART_NAMES[i];
      G.pips.appendChild(p);
    }
    var d = DESTS[Math.min(j.leg, DESTS.length - 1)];
    G.label.textContent = d.em + ' ' + d.name;
  }

  /* ------------------------------ tapping --------------------------- */
  function pointerPos(e) { var r = G.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function onDown(e) {
    if (!G) return;
    ac();
    if (G.mode === 'soccer') return soccerDown(e);
    if (G.mode === 'find') tapAt(pointerPos(e));
  }
  function onMove(e) { if (G && G.mode === 'soccer') soccerMove(e); }
  function onUp(e) { if (G && G.mode === 'soccer') soccerUp(e); }

  function tapAt(p) {
    var hit = null, best = 1e9;
    G.bodies.forEach(function (b) {
      if (b.gone || b.alpha < 0.5) return;
      var d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d < b.r + 18 && d < best) { best = d; hit = b; }
    });
    if (!hit) return;
    if (hit.target) foundIt(hit); else if (hit.cool <= 0) wrongWord(hit);
  }

  /* Tapped the wrong one: no penalty. The voice reads him the word he
     tapped and the word to look for, so even a miss is reading. */
  function wrongWord(b) {
    b.cool = 1.4; b.shake = 1;
    G.findMisses++;
    SFX.bump();
    if (G.findMisses === 1) logFind(false, 'letter-look');
    Voice.stop();
    talk(LINES.notIt); sayWord(b.word); talk(LINES.lookFor); sayWord(G.word);
  }

  function foundIt(b) {
    G.mode = 'say';
    G.caught = b;
    G.prompt.hidden = true;
    logFind(true, null);
    SFX.found();
    sparkle(b.x, b.y, 22);
    G.bodies.forEach(function (o) { if (o !== b) o.gone = true; });
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
    var H = G.H;
    var speed = 14 + G.warp * 1500;
    G.stars.forEach(function (s) {
      s.y += (speed * (0.3 + s.z) * dt) / H;
      if (s.y > 1.05) { s.y = -0.05; s.x = Math.random(); }
    });
    if (G.mode !== 'travel' && G.mode !== 'launch') G.warp = Math.max(0, G.warp - dt * 0.8);

    G.bodies.forEach(function (b) {
      if (b.gone) { b.alpha = Math.max(0, b.alpha - dt * 3); return; }
      b.alpha = Math.min(1, b.alpha + dt * 1.6);
      b.shake = Math.max(0, b.shake - dt * 2.2);
      b.cool = Math.max(0, b.cool - dt);
      if (G.caught === b) {
        // the found planet floats up to the middle while he says it
        b.x += (G.W / 2 - b.x) * Math.min(1, dt * 4);
        b.y += (Math.max(G.top + b.r + 10, H * 0.3) - b.y) * Math.min(1, dt * 4);
        if (G.mode !== 'say') b.alpha = Math.max(0, b.alpha - dt * 4);
        return;
      }
      b.x = b.hx + Math.sin(G.t * 0.5 + b.phase) * 26;
      b.y = b.hy + Math.cos(G.t * 0.7 + b.phase) * 14;
    });

    // a new rocket piece flies down onto the pad
    var fp = G.flyPiece;
    if (fp) {
      fp.t += dt / fp.dur;
      if (fp.t >= 1) { G.flyPiece = null; fp.done(); }
    }

    // the finished rocket lifts off
    var sh = G.ship;
    if (sh.flying) { sh.vy += 900 * dt; sh.lift += sh.vy * dt; }

    if (G.dest) G.dest.t += dt;

    for (var i = G.fx.length - 1; i >= 0; i--) {
      var f = G.fx[i]; f.t += dt;
      f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt;
      if (f.t > f.life) G.fx.splice(i, 1);
    }
  }

  /* ------------------------------ drawing --------------------------- */
  function drawSpace() {
    var ctx = G.ctx, W = G.W, H = G.H;
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.drawImage(G.backdrop, 0, 0, W, H);
    G.stars.forEach(function (s) {
      var x = s.x * W, y = s.y * H, size = 0.6 + s.z * 1.8;
      ctx.globalAlpha = 0.45 + s.z * 0.55;
      ctx.fillStyle = '#ffffff';
      if (G.warp > 0.05) ctx.fillRect(x - size / 2, y - G.warp * 60 * (0.4 + s.z), size, G.warp * 60 * (0.4 + s.z) + size);
      else ctx.fillRect(x - size / 2, y - size / 2, size, size);
    });
    ctx.globalAlpha = 1;

    if (G.dest) drawDestination(G.dest);
    G.bodies.forEach(drawBody);
    if (G.mode !== 'travel') drawPad();

    var fp = G.flyPiece;
    if (fp) {
      var e = 1 - Math.pow(1 - fp.t, 3);
      var x = fp.x0 + (G.padX - fp.x0) * e, y = fp.y0 + (G.padY - 6 * G.RS - fp.y0) * e - Math.sin(e * Math.PI) * 80;
      var s = G.RS * (1.6 - 0.6 * e);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      drawPart(ctx, fp.i, false);
      ctx.restore();
    }

    G.fx.forEach(function (f) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / f.life);
      ctx.fillStyle = f.c;
      starPath(ctx, f.x, f.y, f.r, f.r * 0.45); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function starPath(ctx, x, y, R, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
  }

  /* A word written on a planet (banded, sometimes ringed) or on a big
     glowing star. */
  function drawBody(b) {
    if (b.alpha <= 0.01) return;
    var ctx = G.ctx, x = b.x + Math.sin(G.t * 45) * 8 * b.shake, y = b.y, r = b.r;
    ctx.save();
    ctx.globalAlpha = b.alpha;
    if (b.kind === 'star') {
      var pulse = 1 + Math.sin(G.t * 2 + b.phase) * 0.03;
      ctx.shadowColor = '#ffd34d'; ctx.shadowBlur = 30;
      starPath(ctx, x, y, r * 1.18 * pulse, r * 0.72 * pulse);
      var sg = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, r * 0.1, x, y, r * 1.2);
      sg.addColorStop(0, '#fff6c2'); sg.addColorStop(1, '#ffc21a');
      ctx.fillStyle = sg; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
      wordText(ctx, b.word, x, y + G.font * 0.08, '#3a2600', 'rgba(255,255,255,0.6)');
    } else {
      if (b.ring) ringHalf(ctx, x, y, r, b.look[0], true);
      ctx.shadowColor = b.look[1]; ctx.shadowBlur = 26;
      var pg = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      pg.addColorStop(0, b.look[0]); pg.addColorStop(1, b.look[1]);
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x - r, y - r * 0.55, r * 2, r * 0.18);
      ctx.fillRect(x - r, y + r * 0.42, r * 2, r * 0.14);
      ctx.restore();
      if (b.ring) ringHalf(ctx, x, y, r, b.look[0], false);
      wordText(ctx, b.word, x, y + G.font * 0.05, '#ffffff', 'rgba(10,20,60,0.6)');
    }
    ctx.restore();
  }
  function ringHalf(ctx, x, y, r, color, back) {
    ctx.save();
    ctx.strokeStyle = color; ctx.globalAlpha *= 0.85; ctx.lineWidth = Math.max(5, r * 0.09);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.5, r * 0.34, -0.25, back ? Math.PI : 0, back ? Math.PI * 2 : Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  function wordText(ctx, w, x, y, fill, outline) {
    ctx.font = '800 ' + G.font + 'px ui-rounded, "SF Pro Rounded", "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 5; ctx.strokeStyle = outline; ctx.strokeText(w, x, y);
    ctx.fillStyle = fill; ctx.fillText(w, x, y);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  /* ---------------------- the rocket, piece by piece -----------------
     Drawn upright with (0, 0) at the bottom of the engine. Missing
     pieces show as a dashed outline, so he can see what is still to
     come and where each new piece goes. */
  function drawPad() {
    var ctx = G.ctx, x = G.padX, y = G.padY, s = G.RS;
    ctx.fillStyle = '#3a4060';
    roundRect(ctx, x - 110 * s, y, 220 * s, 16 * s, 6 * s); ctx.fill();
    ctx.fillStyle = '#5a6488';
    roundRect(ctx, x - 90 * s, y - 6 * s, 180 * s, 8 * s, 4 * s); ctx.fill();
    for (var i = 0; i < 5; i++) {
      ctx.fillStyle = (Math.floor(G.t * 3) + i) % 2 ? '#ffd34d' : '#ff6b5b';
      ctx.beginPath(); ctx.arc(x - 80 * s + i * 40 * s, y + 8 * s, 3.5 * s, 0, Math.PI * 2); ctx.fill();
    }
    // the launch tower
    ctx.strokeStyle = '#7f8bb0'; ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(x + 62 * s, y); ctx.lineTo(x + 62 * s, y - 150 * s); ctx.stroke();
    for (var k = 0; k < 6; k++) {
      ctx.beginPath(); ctx.moveTo(x + 62 * s, y - k * 25 * s); ctx.lineTo(x + 46 * s, y - (k * 25 + 12) * s); ctx.stroke();
    }
    // the rocket, as far as it is built
    var built = state.journey.built, sh = G.ship;
    ctx.save();
    ctx.translate(x, y - 6 * s - sh.lift);
    ctx.scale(s, s);
    if (sh.flying || G.mode === 'ready' || G.mode === 'launch') drawFlame(ctx, sh.flying ? 1 : 0.25);
    for (var p = 0; p < PIECES; p++) {
      if (sh.flying || p < built) drawPart(ctx, p, false);
      else if (!(G.flyPiece && G.flyPiece.i === p)) drawPart(ctx, p, true);
    }
    ctx.restore();
  }

  function drawFlame(ctx, k) {
    var fl = 20 + k * 70 + Math.random() * 14;
    var fg = ctx.createLinearGradient(0, 0, 0, fl);
    fg.addColorStop(0, '#fff6b0'); fg.addColorStop(0.35, '#ffb02e'); fg.addColorStop(1, 'rgba(255,60,30,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(-14, -2); ctx.quadraticCurveTo(0, fl * 1.2, 14, -2); ctx.closePath(); ctx.fill();
  }

  /* i: 0 engine + fins, 1 fuel tank, 2 window, 3 nose cone, 4 boosters */
  function drawPart(ctx, i, ghost) {
    ctx.save();
    if (ghost) {
      ctx.setLineDash([6, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(200,220,255,0.45)';
      ctx.fillStyle = 'rgba(200,220,255,0.06)';
    }
    function shape(fill) {
      if (ghost) { ctx.fill(); ctx.stroke(); return; }
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,50,80,0.6)'; ctx.stroke();
    }
    var body = null;
    if (!ghost) {
      body = ctx.createLinearGradient(-24, 0, 24, 0);
      body.addColorStop(0, '#c9d6e6'); body.addColorStop(0.45, '#ffffff'); body.addColorStop(1, '#aebdd2');
    }
    if (i === 0) {
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(18, -18); ctx.lineTo(-18, -18); ctx.closePath(); shape('#6b7590');
      ctx.beginPath(); ctx.moveTo(-20, -16); ctx.lineTo(-40, 6); ctx.lineTo(-38, -30); ctx.lineTo(-20, -44); ctx.closePath(); shape('#e8323c');
      ctx.beginPath(); ctx.moveTo(20, -16); ctx.lineTo(40, 6); ctx.lineTo(38, -30); ctx.lineTo(20, -44); ctx.closePath(); shape('#e8323c');
    } else if (i === 1) {
      roundRect(ctx, -22, -66, 44, 48, 6); shape(body);
      if (!ghost) { ctx.fillStyle = '#ffd34d'; ctx.fillRect(-21, -48, 42, 7); ctx.fillStyle = '#e8323c'; ctx.fillRect(-21, -40, 42, 4); }
    } else if (i === 2) {
      roundRect(ctx, -22, -104, 44, 40, 6); shape(body);
      if (!ghost) {
        ctx.fillStyle = '#5ad8ff'; ctx.strokeStyle = '#2a5a8a'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, -85, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(-3.5, -88.5, 3.5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (i === 3) {
      ctx.beginPath(); ctx.moveTo(-22, -102); ctx.bezierCurveTo(-20, -126, -8, -140, 0, -150); ctx.bezierCurveTo(8, -140, 20, -126, 22, -102); ctx.closePath(); shape('#e8323c');
    } else {
      [-1, 1].forEach(function (sd) {
        roundRect(ctx, sd * 31 - 7, -58, 14, 50, 6); shape('#8a94b4');
        ctx.beginPath(); ctx.moveTo(sd * 31 - 7, -58); ctx.quadraticCurveTo(sd * 31, -72, sd * 31 + 7, -58); ctx.closePath(); shape('#ffd34d');
      });
    }
    ctx.restore();
  }

  /* ------------------------- the destinations ------------------------ */
  function drawDestination(d) {
    var ctx = G.ctx, W = G.W, H = G.H, grow = Math.min(1, d.t / 2.2), e = 1 - Math.pow(1 - grow, 3);
    var cx = W / 2, cy = H * 0.4, R = Math.min(W, H) * (0.08 + 0.24 * e);
    ctx.save();
    if (d.leg === 0) {                       // Venus: hot, yellow, cloudy
      ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 60;
      var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      g.addColorStop(0, '#fff1b8'); g.addColorStop(0.6, '#f4b24a'); g.addColorStop(1, '#c8742a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = 'rgba(255,240,200,0.35)'; ctx.lineWidth = R * 0.08;
      for (var k = 0; k < 5; k++) {
        ctx.beginPath(); ctx.ellipse(cx + Math.sin(G.t * 0.3 + k) * R * 0.1, cy - R * 0.6 + k * R * 0.3, R * 1.1, R * 0.12, 0.15, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    } else if (d.leg === 1) {                // Saturn and its rings
      var rings = function (back) {
        ctx.save(); ctx.lineWidth = R * 0.16;
        [['rgba(240,220,170,0.85)', 1.75], ['rgba(200,170,120,0.8)', 2.05]].forEach(function (rg) {
          ctx.strokeStyle = rg[0]; ctx.beginPath();
          ctx.ellipse(cx, cy, R * rg[1], R * 0.42, -0.22, back ? Math.PI : 0, back ? Math.PI * 2 : Math.PI); ctx.stroke();
        });
        ctx.restore();
      };
      rings(true);
      var sg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      sg.addColorStop(0, '#fff0c8'); sg.addColorStop(1, '#c79a52');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = 'rgba(150,100,40,0.25)';
      for (var b = -2; b <= 2; b++) ctx.fillRect(cx - R, cy + b * R * 0.32, R * 2, R * 0.12);
      ctx.restore();
      rings(false);
    } else if (d.leg === 2) {                // a spiral galaxy
      var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      core.addColorStop(0, 'rgba(255,250,220,1)'); core.addColorStop(1, 'rgba(255,200,255,0)');
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2); ctx.fill();
      for (var a = 0; a < 2; a++) {
        for (var n = 0; n < 220; n++) {
          var tt = n / 220, ang = a * Math.PI + tt * 4.2 + G.t * 0.15, rr = R * (0.1 + tt * 1.25);
          var jx = Math.sin(n * 12.9898) * 10, jy = Math.cos(n * 78.233) * 10;
          ctx.fillStyle = ['#ffffff', '#9fd8ff', '#ffb3f0', '#fff3a0'][n % 4];
          ctx.globalAlpha = 0.9 - tt * 0.6;
          ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * rr + jx, cy + Math.sin(ang) * rr * 0.55 + jy, 3.4 - 1.6 * tt, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    } else {                                 // beyond: clouds of stardust
      [['rgba(255,120,220,0.35)', -0.4, -0.1], ['rgba(120,200,255,0.35)', 0.35, 0.1], ['rgba(255,220,120,0.3)', 0, 0.35]].forEach(function (c) {
        var ng = ctx.createRadialGradient(cx + c[1] * R, cy + c[2] * R, 0, cx + c[1] * R, cy + c[2] * R, R * 1.3);
        ng.addColorStop(0, c[0]); ng.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
      });
      for (var q = 0; q < 160; q++) {
        var qa = q * 2.399 + G.t * 0.2, qr = R * 1.4 * Math.sqrt((q % 80) / 80);
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.t * 3 + q);
        ctx.fillStyle = ['#ffffff', '#ffd34d', '#ff9ad8', '#9fe8ff'][q % 4];
        starPath(ctx, cx + Math.cos(qa) * qr, cy + Math.sin(qa) * qr * 0.7, 3.4, 1.4); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // the rocket flying in
    if (d.t > 0.4) {
      var k2 = Math.min(1, (d.t - 0.4) / 1.6), s = G.S * 0.7;
      ctx.save();
      ctx.translate(W * 0.15 + (cx - R * 1.1 - W * 0.15) * k2, H * 0.8 - (H * 0.8 - cy - R * 0.3) * k2);
      ctx.rotate(0.5); ctx.scale(s, s);
      drawFlame(ctx, 0.4);
      for (var p = 0; p < PIECES; p++) drawPart(ctx, p, false);
      ctx.restore();
    }
  }

  /* ============================ SAY IT ============================= */
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

    hear.addEventListener('click', function () { Voice.stop(); sayWord(w); });
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
        // judged and logged like Read & Say; what he hears are the rocket's own recordable lines
        var v = Evaluate.judgeSpoken({
          word: w, parts: parts, confidence: conf, attempt: tries,
          heard: res.transcript, ms: Date.now() - t0, itemId: 'rocket-say-' + w
        });
        if (v.correct) {
          heard.innerHTML = '✅ <b>' + esc(w) + '</b>. That is it!';
          big.querySelectorAll('.chunk').forEach(function (c) { c.classList.add('lit'); });
          SFX.right();
          talk(LINES.saidRight).then(function () { if (G && G.mode === 'say' && G.word === w) spellStep(); });
        } else {
          heard.innerHTML = res.transcript ? 'I heard: <b>' + esc(res.transcript) + '</b>. Try again, or tap I said it.' : 'I did not catch that. Try again.';
          talk(LINES.sayAgain);
          sayWord(w).then(function () { if (tries >= 2 && G && G.mode === 'say') return Voice.soundOut(w, parts); });
        }
      });
    });

    // never talk over the microphone: once he has tapped it, the
    // second line is dropped so the iPad cannot hear itself
    Voice.stop();
    talk(LINES.sayIt).then(function () {
      if (G && G.mode === 'say' && G.word === w && G.sayTries === 0) return sayWord(w);
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

    var panel = G.panel;
    panel.className = 'rk-panel top';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-step', '⌨️ Spell it on the keyboard!'));
    var exp = expansion(w), lw = w.toLowerCase();
    if (exp) {
      // the teacher's way: here are the two words, write the contraction
      var pair = el('div', 'rk-pair');
      pair.appendChild(el('span', 'rk-pair-words', exp));
      pair.appendChild(el('span', 'rk-pair-arrow', '➜'));
      pair.appendChild(el('span', 'rk-pair-q', '?'));
      pair.addEventListener('click', function () { Voice.stop(); talk(LINES.squeeze); sayWord(exp); });
      card.appendChild(pair);
    }
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
    r.appendChild(hear);
    if (w.indexOf("'") !== -1) {
      // on the iPad keyboard the apostrophe hides on the 123 page
      var apo = el('button', 'btn-big ghost compact rk-apo');
      apo.appendChild(el('span', 'rk-apo-mark', '\u2019'));
      apo.appendChild(el('span', null, 'apostrophe'));
      apo.setAttribute('aria-label', 'Type an apostrophe');
      ['pointerdown', 'mousedown'].forEach(function (ev) { apo.addEventListener(ev, function (e) { e.preventDefault(); }); });
      apo.addEventListener('click', function () {
        if (input.value.length < input.maxLength) input.value += "'";
        marks = null; draw(); focusInput(input);
      });
      r.appendChild(apo);
    }
    r.appendChild(check);
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
    hear.addEventListener('click', function () { Voice.stop(); sayWord(w); focusInput(input); });
    check.addEventListener('click', function () { checkIt(); });

    function checkIt() {
      if (!G || G.mode !== 'spell') return;
      var val = input.value.toLowerCase();
      if (!val) { Voice.stop(); talk(LINES.typeFirst); focusInput(input); return; }
      G.spellTries++;
      var ok = val === lw;
      var tag = ok || G.reveal ? null : classify(lw, val);
      Progress.logEvent({
        t: Date.now(), dayId: 'rocket', itemId: 'rocket-spell-' + w, station: 'rocket', domain: 'rocket-spelling',
        correct: ok, tag: tag, attempt: G.spellTries, ms: Date.now() - G.spellT0,
        flags: G.reveal ? ['copied'] : [], word: w, typed: val
      });
      if (ok) return spelled(input, boxes);

      // not yet: green for every letter already in the right place
      marks = [];
      for (var i = 0; i < Math.max(w.length, val.length); i++) marks.push(val[i] === lw[i] ? 'ok' : 'fix');
      draw();
      SFX.oops();
      Voice.stop();
      if (G.reveal || G.spellTries >= 3) {
        showReveal();
        talk(LINES.copyIt);
        input.value = ''; marks = null; draw();
      } else if (G.spellTries === 1) {
        heard.innerHTML = 'Almost! The <b class="g">green</b> letters are right. Fix the <b class="o">orange</b> ones.';
        talk(LINES.almost);
      } else {
        if (exp) {
          heard.innerHTML = '<b>' + esc(exp) + '</b> squeezed together. The <b>\u2019</b> goes where letters are missing.';
          talk(LINES.apostrophe); talk(LINES.squeeze); sayWord(exp);
        } else {
          heard.innerHTML = 'Listen to the sounds, then fix the <b class="o">orange</b> letters.';
          talk(LINES.soundOut).then(function () { return Voice.soundOut(w, G.parts); });
        }
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
    if (exp) {
      talk(LINES.squeeze);
      sayWord(exp).then(function () { if (G && G.mode === 'spell' && G.word === w) return talk(LINES.spellIt); });
    } else {
      talk(LINES.spellIt).then(function () { if (G && G.mode === 'spell' && G.word === w) return sayWord(w); });
    }
  }

  function focusInput(input) {
    try { input.focus({ preventScroll: true }); } catch (e) { try { input.focus(); } catch (e2) {} }
  }

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

  /* ===================== a word spelled: a rocket piece ================ */
  function spelled(input, boxes) {
    var w = G.word, j = state.journey;
    try { input.blur(); } catch (e) {}
    boxes.querySelectorAll('.rk-box').forEach(function (b) { b.className = 'rk-box ok'; });
    boxes.classList.add('win');
    // "first" means right first time on every visit: a word he has
    // missed even once stays on the practise list for the week
    var prev = state.results[w];
    state.results[w] = { first: G.spellTries === 1 && !G.reveal && (!prev || prev.first), tries: G.spellTries };
    state.pos++;
    save();
    SFX.right();
    App.burst(8);
    G.mode = 'piece';
    var piece = j.built;
    Voice.stop();
    talk(pick(LINES.praise));
    talk(LINES.pieces[piece]);
    setTimeout(function () {
      if (!G) return;
      G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
      G.flyPiece = {
        i: piece, x0: G.W / 2, y0: G.H * 0.4, t: 0, dur: 1.1,
        done: function () {
          j.built = piece + 1;
          j.spelled++;
          save();
          SFX.clunk();
          sparkle(G.padX, G.padY - 70 * G.RS, 18);
          updateHud();
          if (j.built >= PIECES) rocketBuilt();
          else nextWord();
        }
      };
    }, 500);
  }

  /* Five pieces: the rocket is built and ready for the next stop. */
  function rocketBuilt() {
    var j = state.journey;
    G.mode = 'ready';
    talk(LINES.built[j.leg]);
    var panel = G.panel;
    panel.className = 'rk-panel top';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-step', 'Rocket built! Next stop: ' + DESTS[j.leg].name + ' ' + DESTS[j.leg].em));
    var go = el('button', 'rk-launch', '🚀 LAUNCH to ' + DESTS[j.leg].name);
    go.addEventListener('click', launch);
    card.appendChild(go);
    panel.appendChild(card);
  }

  /* One star per stop reached, once a day per list, through the same
     star counter as the course and homework. */
  function legStar(leg) {
    var res = Progress.completeStation('rocket-' + state.setAt + '-' + Progress.today() + '-leg' + leg, 'rocket');
    if (res.star && Progress.checkBadges) Progress.checkBadges();
    return res;
  }

  function launch() {
    if (!G || G.mode !== 'ready') return;
    G.mode = 'launch';
    G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
    G.prompt.hidden = true;
    Voice.stop();
    talk(LINES.countdown);
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
      G.ship.flying = true; G.ship.vy = 60;
      setTimeout(function () { if (G) G.warp = 1; }, 500);
      setTimeout(function () { if (G) G.count.className = 'rk-count'; }, 900);
      setTimeout(function () { if (G && G.mode === 'launch') travel(); }, 2200);
    }
    tick();
  }

  function travel() {
    G.mode = 'travel';
    G.warp = 1;
    setTimeout(function () { if (G && G.mode === 'travel') arrive(); }, 1600);
  }

  function arrive() {
    var j = state.journey, leg = j.leg;
    G.mode = 'arrive';
    G.ship = { lift: 0, vy: 0, flying: false };
    G.dest = { leg: leg, t: 0 };
    G.bodies = [];
    legStar(leg);
    j.leg = leg + 1;
    j.built = 0;
    save();
    App.burst(24);
    SFX.cheer();
    Voice.stop();
    talk(LINES.arrive[leg]);
    updateHud();

    var panel = G.panel;
    panel.className = 'rk-panel bottom';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-step', leg === 3 ? 'Beyond the galaxy! ✨' : 'We made it to ' + DESTS[leg].name + '! ' + DESTS[leg].em));
    card.appendChild(el('p', 'rk-sum', j.spelled + ' words spelled so far.'));
    var go = el('button', 'rk-launch');
    if (leg === DESTS.length - 1) {
      go.textContent = '🏆 Finish';
      go.addEventListener('click', finishAll);
    } else {
      go.textContent = '⚽ Soccer break!';
      go.addEventListener('click', function () { startSoccer(function () { nextLeg(); }); });
    }
    card.appendChild(go);
    panel.appendChild(card);
  }

  function nextLeg() {
    if (!G) return;
    G.layer.classList.remove('soccer');
    G.dest = null;
    G.mode = 'warp';            // nothing to tap until the next word arrives
    G.panel.className = 'rk-panel'; G.panel.innerHTML = '';
    Voice.stop();
    talk(LINES.nextLeg[state.journey.leg - 1]);
    setTimeout(function () { if (G) nextWord(); }, 300);
  }

  /* =========================== ALL DONE ============================ */
  function finishAll() {
    if (!G) return;
    G.mode = 'done';
    G.prompt.hidden = true;
    var tried = state.words.filter(function (w) { return state.results[w]; });
    var got = tried.filter(function (w) { return state.results[w].first; });
    var practice = tried.filter(function (w) { return !state.results[w].first; });
    var spelledCount = state.journey.spelled;
    state.passes = (state.passes || 0) + 1;
    state.lastDone = Progress.today();
    state.journey = newJourney();
    state.order = []; state.pos = 0;
    save();
    App.burst(30);
    Voice.stop();
    talk(LINES.finish);

    var panel = G.panel;
    panel.className = 'rk-panel bottom';
    panel.innerHTML = '';
    var card = el('div', 'rk-card');
    card.appendChild(el('div', 'rk-big-em', '🏆'));
    card.appendChild(el('div', 'rk-step', 'Super speller! ' + spelledCount + ' words, all the way beyond the galaxy'));
    card.appendChild(el('p', 'rk-sum', got.length + ' of ' + tried.length + ' words spelled right the first time.' +
      (practice.length ? ' Practice: ' + practice.join(', ') + '.' : ' Every single one!')));
    var r = el('div', 'rk-row');
    var soccer = el('button', 'btn-big ghost compact');
    soccer.appendChild(el('span', null, '⚽')); soccer.appendChild(el('span', null, 'Soccer'));
    soccer.addEventListener('click', function () { startSoccer(function () { exitGame(); }); });
    var again = el('button', 'btn-big ghost compact');
    again.appendChild(el('span', null, '🔁')); again.appendChild(el('span', null, 'New journey'));
    again.addEventListener('click', function () { state.results = {}; save(); talk(LINES.start); nextWord(); });
    var home = el('button', 'btn-big');
    home.appendChild(el('span', null, '🏠')); home.appendChild(el('span', null, 'Home'));
    home.addEventListener('click', function () { exitGame(); });
    r.appendChild(soccer); r.appendChild(again); r.appendChild(home);
    card.appendChild(r);
    panel.appendChild(card);
  }

  /* ========================== SOCCER BREAK =========================
     A penalty shoot-out: swipe the ball with a finger. The direction
     of the swipe aims it; a faster swipe hits it higher, and too fast
     sails over the bar. Five shots. */
  var S = null;
  var SHOTS = 5;

  function startSoccer(after) {
    if (!G) return;
    G.mode = 'soccer';
    G.prompt.hidden = true;
    G.layer.classList.add('soccer');
    S = { after: after, shots: 0, goals: 0, ball: null, phase: 'aim', msg: '', msgT: 0, net: 0, keeper: { x: 0, dive: 0, diveDir: 0, target: 0 },
      swipe: null, hint: 1, conf: [] };
    layoutSoccer();
    Voice.stop();
    talk(LINES.soccer);
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
    [0.08, 0.92].forEach(function (k) {
      var lx = W * k, ly = standTop - 40, g = x.createRadialGradient(lx, ly, 0, lx, ly, 160);
      g.addColorStop(0, 'rgba(255,255,230,0.9)'); g.addColorStop(1, 'rgba(255,255,230,0)');
      x.fillStyle = g; x.fillRect(lx - 160, ly - 160, 320, 320);
    });
    var stripes = 9;
    for (var s = 0; s < stripes; s++) {
      var t0 = s / stripes, t1 = (s + 1) / stripes;
      var y0 = horizon + (H - horizon) * t0 * t0, y1 = horizon + (H - horizon) * t1 * t1;
      x.fillStyle = s % 2 ? '#2f9e44' : '#37b24d';
      x.fillRect(0, y0, W, y1 - y0 + 1);
    }
    x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 4;
    var bx = S.goal.w * 0.95, bTop = horizon, bBot = horizon + (H - horizon) * 0.42;
    x.beginPath();
    x.moveTo(W / 2 - bx * 0.62, bTop); x.lineTo(W / 2 - bx * 0.9, bBot); x.lineTo(W / 2 + bx * 0.9, bBot); x.lineTo(W / 2 + bx * 0.62, bTop);
    x.stroke();
    x.beginPath(); x.moveTo(0, horizon); x.lineTo(W, horizon); x.stroke();
    x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(S.spot.x, S.spot.y + S.R * 0.9, 9, 4, 0, 0, Math.PI * 2); x.fill();
    S.pitch = c;
  }

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
    var line;
    if (sh.h > 1.02) { S.msg = 'Over the bar!'; line = LINES.over; SFX.groan(); }
    else if (x < g.x - post || x > g.x + g.w + post) { S.msg = 'Just wide!'; line = LINES.wide; SFX.groan(); }
    else if (blocked && sh.h < 0.95) {
      S.saved = true; S.bounce = (x < k.x ? -1 : 1) * 160;
      S.msg = 'Saved!'; line = LINES.saved;
      SFX.groan();
    } else {
      S.goalScored = true; S.goals++; S.net = 1;
      S.msg = 'GOAL!';
      line = pick(LINES.goal);
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
    talk(line);
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
    var go = el('button', 'rk-launch', '🚀 Back to space');
    go.addEventListener('click', function () {
      var after = S.after;
      S = null;
      if (after) after();
    });
    card.appendChild(go);
    panel.appendChild(card);
    Voice.stop();
    talk(LINES.soccerDone);
  }

  function drawSoccer() {
    if (!S) return;
    var ctx = G.ctx, W = G.W, g = S.goal;
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.drawImage(S.pitch, 0, 0, W, G.H);

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

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6;
    ctx.fillRect(g.x - 8, g.y - 8, 10, g.h + 8);
    ctx.fillRect(g.x + g.w - 2, g.y - 8, 10, g.h + 8);
    ctx.fillRect(g.x - 8, g.y - 8, g.w + 16, 10);
    ctx.shadowBlur = 0;

    var b = S.ball, R = S.R * b.s;
    var groundY = S.phase === 'flight' ? S.shot.y0 + (S.line - S.shot.y0) * Math.min(1, S.shot.t) : b.y + R * 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(b.x, Math.max(groundY, b.y + R * 0.8), R * 0.9, R * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    drawBall(ctx, b.x, b.y, R, b.rot);

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
    ctx.fillStyle = '#1b2a4a';
    ctx.fillRect(-w * 0.32, -h * 0.36, w * 0.24, h * 0.36);
    ctx.fillRect(w * 0.08, -h * 0.36, w * 0.24, h * 0.36);
    ctx.fillStyle = '#ffd34d';
    roundRect(ctx, -w / 2, -h * 0.8, w, h * 0.48, w * 0.2); ctx.fill();
    ctx.fillStyle = '#1b2a4a'; ctx.font = '900 ' + Math.round(w * 0.4) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('1', 0, -h * 0.57);
    var reach = w * (0.55 + k.dive * 0.5);
    ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = w * 0.18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * 0.45, -h * 0.72); ctx.lineTo(-w * 0.45 - reach, -h * (0.82 + k.dive * 0.1)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.45, -h * 0.72); ctx.lineTo(w * 0.45 + reach, -h * (0.82 + k.dive * 0.1)); ctx.stroke();
    ctx.fillStyle = '#2fbf71';
    ctx.beginPath(); ctx.arc(-w * 0.45 - reach, -h * (0.82 + k.dive * 0.1), w * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.45 + reach, -h * (0.82 + k.dive * 0.1), w * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c79a';
    ctx.beginPath(); ctx.arc(0, -h * 0.9, w * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2a14';
    ctx.beginPath(); ctx.arc(0, -h * 0.95, w * 0.24, Math.PI, 0); ctx.fill();
    ctx.restore();
  }

  /* ============================ HOME TILE ==========================
     The home tile shows how many words to the next launch. Once the
     whole journey is done it stays quiet for the rest of the day. */
  function tileCount() {
    if (!state.words.length) return 0;
    if (!journeyStarted() && state.lastDone === Progress.today()) return 0;
    return PIECES - state.journey.built;
  }

  return {
    render: render, inGame: inGame, stopGame: stopGame, tileCount: tileCount, voiceLines: voiceLines,
    week: function () { return { words: state.words.slice(), setAt: state.setAt }; },
    LINES: LINES,
    // for the tests
    _state: function () { return state; },
    _game: function () { return G; },
    _soccer: function () { return S; },
    _setWords: setWords,
    _shoot: function (dx, dy, speed) { if (S && S.phase === 'aim') shoot(dx, dy, speed); },
    _found: function () { if (G && G.mode === 'find') { var b = G.bodies.filter(function (x) { return x.target && !x.gone; })[0]; if (b) foundIt(b); } },
    _classify: classify
  };
})();
