/* ============================================================
   voice.js — Chance Academy speech layer

   Two jobs:
   1) SPEAK. Everything on screen can be read aloud in a soft
      female voice, slowed down for a 7-year-old, so reading is
      never the thing that blocks him from doing the science.
   2) LISTEN. In the Read & Say station he says the word out
      loud; we compare what the microphone heard against the
      target word and coach the sounds he missed.

   iOS notes (this app lives on an iPad):
   - getVoices() is empty until the engine warms up, so we wait
     on the voiceschanged event and re-resolve.
   - Speech will not start until the user has tapped once, so
     app.js calls Voice.unlock() on the first touch.
   - Safari's recognition is webkitSpeechRecognition and needs
     mic permission once per site. If it is missing or refused,
     the reading station falls back to "listen, then tap the
     sounds you said" so nothing is a dead end.
   ============================================================ */

window.Voice = (function () {
  var synth = window.speechSynthesis || null;
  var voices = [];
  var chosen = null;
  var unlocked = false;
  var muted = false;
  var queueTail = Promise.resolve();

  /* Soft, warm, female, in rough order of preference. First list is
     Apple (iPad / Mac), then Google, then Microsoft. */
  var PREFERRED = [
    'Samantha', 'Ava', 'Allison', 'Susan', 'Nicky', 'Karen', 'Moira',
    'Tessa', 'Fiona', 'Serena', 'Victoria', 'Kate',
    'Google UK English Female', 'Google US English',
    'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Microsoft Michelle'
  ];

  var settings = {
    rate: 0.82,   // slower than default; he is 7 and decoding as he listens
    pitch: 1.12,  // a touch higher reads as gentler
    volume: 1,
    voiceName: null // grown-ups can pin a specific voice in settings
  };

  function loadSettings() {
    try {
      var raw = localStorage.getItem('chance.voice');
      if (raw) Object.assign(settings, JSON.parse(raw));
    } catch (e) {}
  }
  function saveSettings() {
    try { localStorage.setItem('chance.voice', JSON.stringify(settings)); } catch (e) {}
  }

  function score(v) {
    var n = (v.name || '');
    var idx = PREFERRED.findIndex(function (p) { return n.indexOf(p) === 0 || n === p; });
    var s = idx === -1 ? 500 : idx;
    if (!/^en/i.test(v.lang || '')) s += 1000;          // English only
    if (/compact|eloquence/i.test(n)) s += 60;          // the tinny fallback voices
    if (/\b(male|Daniel|Alex|Fred|Aaron|Arthur|Oliver|Rishi|Tom|Guy)\b/i.test(n)) s += 400;
    return s;
  }

  function resolveVoice() {
    if (!synth) return null;
    voices = synth.getVoices() || [];
    if (!voices.length) return null;
    if (settings.voiceName) {
      var pinned = voices.filter(function (v) { return v.name === settings.voiceName; })[0];
      if (pinned) { chosen = pinned; return chosen; }
    }
    chosen = voices.slice().sort(function (a, b) { return score(a) - score(b); })[0] || null;
    return chosen;
  }

  if (synth) {
    resolveVoice();
    synth.addEventListener && synth.addEventListener('voiceschanged', resolveVoice);
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = resolveVoice;
  }
  loadSettings();

  /* ---------------------------------------------------------------
     KEEPING THE SOUND ALIVE ON AN iPAD

     Reported: "somehow the sound turned off." Four separate things
     in the first version could each do that, and every one of them
     looked identical from the outside — silence, no error:

     1. One failed line poisoned the queue forever. Each line chains
        onto the one before; a single rejection meant every later
        .then() was skipped until the app was force-closed.
     2. iOS pauses the speech engine when the app goes to the
        background and never resumes it, so after a screen lock or
        an app switch every line queued silently.
     3. Audio was only unlocked on the very first tap. A home-screen
        app resuming from the background can need a fresh gesture.
     4. Stop() cleared the queue variable but not the chain already
        built on it, so lines queued before the tap still ran — and
        iOS drops an utterance spoken in the same tick as cancel().

     The fixes are below: a generation counter, a catch on every
     queued step, resume() before speaking, a pause after cancel, a
     re-armed unlock on return from the background, and repair() —
     which the 🔊 button calls, so "no sound? tap the speaker" works.
     --------------------------------------------------------------- */

  var generation = 0;        // bumped by stop(); queued lines from before it skip

  /* How many lines are queued or playing. The app shows a Stop
     button whenever this is above zero, on every screen. */
  var inFlight = 0;
  var talkListeners = [];
  function setInFlight(delta) {
    var was = inFlight > 0;
    inFlight = Math.max(0, inFlight + delta);
    var now = inFlight > 0;
    if (was !== now) talkListeners.forEach(function (fn) { try { fn(now); } catch (e) {} });
  }
  function onTalking(fn) { talkListeners.push(fn); }

  var lastCancel = 0;        // when cancel() last ran — iOS drops speech right after
  var stalls = 0;            // utterances that never started; >0 means wedged

  /* A silent utterance inside a tap buys the right to speak later
     without one. Re-armed every time the app comes back to the
     front, because iOS may have taken that right away. */
  function unlock() {
    if (!synth) return;
    try { synth.resume(); } catch (e) {}
    if (unlocked) return;
    unlocked = true;
    resolveVoice();
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.rate = 2;
      synth.speak(u);
    } catch (e) {}
  }

  function stop() {
    generation++;
    if (inFlight) setInFlight(-inFlight);
    if (window.Recordings) Recordings.stop();
    queueTail = Promise.resolve();
    if (!synth) return;
    try { synth.cancel(); } catch (e) {}
    lastCancel = Date.now();
  }

  /* Back from the background (screen lock, app switch, home button).
     The engine is probably paused, the queue holds lines nobody is
     waiting for, and audio may need re-unlocking on the next tap. */
  function onReturn() {
    stop();
    try { if (synth) synth.resume(); } catch (e) {}
    unlocked = false;
    stalls = 0;
    resolveVoice();
    if (window.Recordings && Recordings.rearm) Recordings.rearm();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') onReturn();
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) onReturn(); });

  /* Everything at once, called from inside a tap so iOS accepts the
     unlock. This is what the 🔊 button runs before it replays. */
  function repair() {
    onReturn();
    unlock();
    if (window.Recordings) Recordings.unlock();
  }

  /* Get the engine into a state where speak() will actually play. */
  function wake() {
    if (!synth) return Promise.resolve();
    try { synth.resume(); } catch (e) {}
    var wait = Math.max(0, 140 - (Date.now() - lastCancel));
    if (stalls > 0) {
      // the last line never started: the engine is wedged
      stalls = 0;
      try { synth.cancel(); } catch (e) {}
      lastCancel = Date.now();
      wait = 160;
    }
    if (!wait) return Promise.resolve();
    return pause(wait).then(function () { try { synth.resume(); } catch (e) {} });
  }

  /* For the grown-up sound check: what the engine thinks it is doing. */
  function diagnose() {
    return {
      available: !!synth,
      voices: synth ? (synth.getVoices() || []).length : 0,
      voice: chosen ? chosen.name : 'device default',
      paused: !!(synth && synth.paused),
      speaking: !!(synth && synth.speaking),
      muted: muted,
      stalls: stalls,
      unlocked: unlocked
    };
  }

  /* say(text, opts) -> Promise that settles when the phrase finishes.
     opts.rate / opts.pitch override for one phrase (used to stretch
     single phonemes out). Calls queue rather than interrupt so a
     three-sentence lesson reads in order.

     A real recorded voice always wins over the synthesizer. If
     somebody has recorded this exact line in the studio, we play
     their voice; otherwise we fall back to speech synthesis. That
     is what lets a half-finished recording session still work. */
  function say(text, opts) {
    opts = opts || {};
    if (!text) return Promise.resolve();
    if (muted) return Promise.resolve();
    if (opts.interrupt) stop();

    var gen = generation;
    setInFlight(1);
    var step = queueTail.then(function () {
      if (gen !== generation) return;          // Stop was tapped after this was queued
      var kind = opts.kind || 'say';
      if (window.Recordings && Recordings.has(text, kind)) {
        return Recordings.play(text, kind).then(function (played) {
          if (!played && gen === generation) return speak(text, opts);
        });
      }
      return speak(text, opts);
    })
      // One bad line must never silence every line after it.
      .catch(function () {})
      // only count down lines from the current generation — Stop has
      // already zeroed the count for everything older
      .then(function () { if (gen === generation) setInFlight(-1); });
    queueTail = step;
    return step;
  }

  /* the synthesized fallback */
  function speak(text, opts) {
    if (!synth) return Promise.resolve();
    return wake().then(function () {
      return new Promise(function (done) {
        var finished = false, started = false;
        function finish() { if (!finished) { finished = true; done(); } }
        try {
          if (!chosen) resolveVoice();
          var u = new SpeechSynthesisUtterance(String(text));
          // A voice object can go stale after the app is backgrounded
          // and iOS reloads its voice list; fall back rather than throw.
          try { if (chosen) { u.voice = chosen; u.lang = chosen.lang || 'en-US'; } else u.lang = 'en-US'; }
          catch (e) { u.lang = 'en-US'; }
          u.rate = opts.rate != null ? opts.rate : settings.rate;
          u.pitch = opts.pitch != null ? opts.pitch : settings.pitch;
          u.volume = opts.volume != null ? opts.volume : settings.volume;
          u.onstart = function () { started = true; stalls = 0; };
          u.onend = finish;
          u.onerror = finish;
          // Safety net: if the engine silently drops an utterance we keep moving.
          var safety = Math.min(20000, 1400 + String(text).length * 95);
          // Never started at all: the engine is wedged — fix it before the
          // next line. This must run BEFORE the safety net, or a short line
          // gets quietly "finished" and the wedge is never noticed.
          setTimeout(function () { if (!started && !finished) stalls++; }, Math.min(2500, safety - 100));
          setTimeout(finish, safety);
          synth.speak(u);
        } catch (e) { finish(); }
      });
    });
  }

  /* Read a list of lines with a beat between them, calling back
     before each one so the UI can highlight what is being said. */
  function sayLines(lines, onLine) {
    var p = Promise.resolve();
    lines.forEach(function (line, i) {
      p = p.then(function () {
        if (onLine) onLine(i);
        return say(line);
      }).then(function () { return pause(220); });
    });
    return p.then(function () { if (onLine) onLine(-1); });
  }

  function pause(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Say one letter chunk.

     If somebody has recorded this chunk in the booth, play their
     voice — a human can say a true isolated /f/ and no synthesizer
     can. Otherwise fall back to the anchor-word phrase from
     phonics.js ("f, like in fan"), which is built entirely out of
     real words so no engine can garble it.

     Note there is no rate stretching here any more. Slowing the
     synthesizer down to 0.55 was part of what made the old fake
     phonemes sound like noise. */
  function sayChunk(chunk, word, index) {
    if (window.Recordings && Recordings.has(chunk, 'sound')) {
      return say(chunk, { kind: 'sound' });
    }
    var phrase = window.Phonics ? Phonics.chunkPhrase(chunk, word, index) : String(chunk);
    return say(phrase, { rate: 0.8 });
  }

  /* Kept for the recording booth, which needs to preview the clip
     for one chunk on its own. */
  function sayPhoneme(sound) {
    return say(sound, { kind: 'sound' });
  }

  /* Sound out a word the way a reading teacher does: the whole word,
     each chunk anchored in a real word, then the blend.
     onStep(highlightIndex) lets the UI light the chunk being said. */
  function soundOut(word, parts, onStep) {
    var steps = window.Phonics
      ? Phonics.script(word, parts)
      : [{ phrase: word, highlight: -1 }];
    var p = Promise.resolve();
    steps.forEach(function (st) {
      p = p.then(function () {
        if (onStep) onStep(st.highlight);
        if (st.chunk != null) return sayChunk(st.chunk, word, st.index);
        return say(st.phrase, { rate: st.whole ? 0.75 : 0.85 });
      }).then(function () { return pause(180); });
    });
    return p.then(function () { if (onStep) onStep(-1); });
  }

  /* --------------------------- LISTENING --------------------------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var rec = null, recBusy = false;

  function canListen() { return !!SR; }

  /* listen() -> Promise<{transcript, ok:boolean, reason}>  */
  function listen(opts) {
    opts = opts || {};
    if (!SR) return Promise.resolve({ transcript: '', ok: false, reason: 'unsupported' });
    if (recBusy) return Promise.resolve({ transcript: '', ok: false, reason: 'busy' });

    return new Promise(function (resolve) {
      recBusy = true;
      var settled = false;
      var best = '';
      try { rec = new SR(); } catch (e) { recBusy = false; return resolve({ transcript: '', ok: false, reason: 'unsupported' }); }
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      var alts = [];

      function finish(reason) {
        if (settled) return;
        settled = true; recBusy = false;
        try { rec.stop(); } catch (e) {}
        resolve({ transcript: best.trim(), alternatives: alts, ok: !!best.trim(), reason: reason || 'ok' });
      }

      rec.onresult = function (ev) {
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var r = ev.results[i];
          for (var j = 0; j < r.length; j++) {
            if (r[j].transcript) alts.push(r[j].transcript);
          }
          if (r[0] && r[0].transcript) best = r[0].transcript;
          if (opts.onInterim) opts.onInterim(best);
          if (r.isFinal) return finish('ok');
        }
      };
      rec.onerror = function (ev) {
        finish(ev && ev.error === 'not-allowed' ? 'denied' : 'error');
      };
      rec.onend = function () { finish('ok'); };
      try { rec.start(); } catch (e) { finish('error'); }
      setTimeout(function () { finish('timeout'); }, opts.ms || 6000);
    });
  }

  function abortListen() {
    if (rec) { try { rec.abort(); } catch (e) {} }
    recBusy = false;
  }

  /* ----------------------- PRONUNCIATION MATCH --------------------- */
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function lev(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur.slice();
    }
    return prev[n];
  }

  /* Homophone-ish forgiveness: the recogniser often returns a common
     word that sounds like the target ("son" for "sun"). Reading the
     word correctly out loud is the goal, not spelling it. */
  var SOUNDALIKE = {
    sun: ['son'], son: ['sun'], to: ['two', 'too'], two: ['to', 'too'],
    for: ['four', 'fore'], four: ['for'], one: ['won'], won: ['one'],
    ate: ['eight'], eight: ['ate'], be: ['bee'], bee: ['be'],
    see: ['sea'], sea: ['see'], by: ['buy', 'bye'], red: ['read'],
    hour: ['our'], our: ['hour'], knew: ['new'], new: ['knew'],
    weight: ['wait'], wait: ['weight'], ate2: []
  };

  /* heard vs target -> 0..1 confidence that he said the word. */
  function match(target, heard, alternatives) {
    var t = norm(target);
    var pool = [heard].concat(alternatives || []).map(norm).filter(Boolean);
    if (!pool.length) return 0;
    var best = 0;
    pool.forEach(function (h) {
      // The recogniser often returns a whole phrase; check each word too.
      var candidates = [h].concat(h.split(' '));
      candidates.forEach(function (c) {
        if (!c) return;
        var s;
        if (c === t) s = 1;
        else if ((SOUNDALIKE[t] || []).indexOf(c) !== -1) s = 0.95;
        else {
          var d = lev(c, t);
          s = 1 - d / Math.max(c.length, t.length);
          if (c.length > 2 && t.indexOf(c) === 0) s = Math.max(s, 0.7); // said the first part
        }
        if (s > best) best = s;
      });
    });
    return best;
  }

  return {
    say: say, sayLines: sayLines, sayPhoneme: sayPhoneme, sayChunk: sayChunk, soundOut: soundOut,
    stop: stop, unlock: unlock, pause: pause, repair: repair, diagnose: diagnose,
    onTalking: onTalking, isTalking: function () { return inFlight > 0; },
    listen: listen, abortListen: abortListen, canListen: canListen, match: match, norm: norm,
    get settings() { return settings; },
    setMuted: function (m) { muted = !!m; if (muted) stop(); },
    isMuted: function () { return muted; },
    update: function (patch) { Object.assign(settings, patch || {}); saveSettings(); resolveVoice(); },
    listVoices: function () { resolveVoice(); return voices.filter(function (v) { return /^en/i.test(v.lang || ''); }); },
    currentVoiceName: function () { return chosen ? chosen.name : 'device default'; },
    available: function () { return !!synth; }
  };
})();
