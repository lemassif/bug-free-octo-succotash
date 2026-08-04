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

  /* One silent utterance on the first tap buys us the right to
     speak later without a gesture. */
  function unlock() {
    if (unlocked || !synth) return;
    unlocked = true;
    resolveVoice();
    try {
      var u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.rate = 2;
      synth.speak(u);
    } catch (e) {}
  }

  function stop() {
    if (!synth) return;
    try { synth.cancel(); } catch (e) {}
    queueTail = Promise.resolve();
  }

  /* say(text, opts) -> Promise that settles when the phrase finishes.
     opts.rate / opts.pitch override for one phrase (used to stretch
     single phonemes out). Calls queue rather than interrupt so a
     three-sentence lesson reads in order. */
  function say(text, opts) {
    opts = opts || {};
    if (!text) return Promise.resolve();
    if (muted || !synth) return Promise.resolve();
    if (opts.interrupt) stop();

    queueTail = queueTail.then(function () {
      return new Promise(function (done) {
        if (!chosen) resolveVoice();
        var u = new SpeechSynthesisUtterance(String(text));
        if (chosen) { u.voice = chosen; u.lang = chosen.lang || 'en-US'; }
        else u.lang = 'en-US';
        u.rate = opts.rate != null ? opts.rate : settings.rate;
        u.pitch = opts.pitch != null ? opts.pitch : settings.pitch;
        u.volume = opts.volume != null ? opts.volume : settings.volume;
        var finished = false;
        function finish() { if (!finished) { finished = true; done(); } }
        u.onend = finish;
        u.onerror = finish;
        // Safety net: if the engine silently drops an utterance we keep moving.
        setTimeout(finish, Math.min(20000, 1400 + String(text).length * 95));
        try { synth.speak(u); } catch (e) { finish(); }
      });
    });
    return queueTail;
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

  /* Stretch one sound out: "sss", "ah", "or". Slow + slightly lower
     so a single phoneme is hearable instead of a blip. */
  function sayPhoneme(sound) {
    return say(sound, { rate: 0.55, pitch: 1.05 });
  }

  /* Sound out a word the way a reading teacher does:
     each part slowly, then the parts a little faster, then the word. */
  function soundOut(word, parts) {
    var p = Promise.resolve();
    (parts || []).forEach(function (s) {
      p = p.then(function () { return sayPhoneme(s); }).then(function () { return pause(180); });
    });
    return p
      .then(function () { return pause(200); })
      .then(function () { return say(parts.join(' '), { rate: 0.7 }); })
      .then(function () { return pause(200); })
      .then(function () { return say(word, { rate: 0.75 }); });
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
    say: say, sayLines: sayLines, sayPhoneme: sayPhoneme, soundOut: soundOut,
    stop: stop, unlock: unlock, pause: pause,
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
