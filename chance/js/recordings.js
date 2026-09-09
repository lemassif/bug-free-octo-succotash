/* ============================================================
   recordings.js — Grandpa's voice instead of the robot's

   The synthesized voice is fine as a fallback, but it is not the
   voice that matters to him. This lets a real person record any
   line in the app, in their own voice, and from then on that
   recording plays instead of the robot — everywhere that line is
   spoken.

   How it hangs together:
   - Every spoken string is keyed by a hash of its own text. Record
     "Whoa, speedy! That was faster than the question." once and it
     plays every time the owl says it, on any day, forever.
   - Clips live in IndexedDB on the device (localStorage cannot hold
     audio). A list of which keys exist is kept in memory so the
     lookup on every line is instant and never delays the lesson.
   - Anything not yet recorded falls back to the synthesized voice,
     so a half-finished recording session still works fine. You can
     record the 40 lines he hears most and stop there.
   - Export writes every clip to one file you can back up or carry
     to another iPad.

   iOS notes:
   - MediaRecorder needs iOS 14.3+ and gives us audio/mp4.
   - Audio playback needs one user gesture before it will work, so
     a single shared <audio> element is unlocked on the first tap
     and reused for every clip after that.
   ============================================================ */

window.Recordings = (function () {

  var DB_NAME = 'chance-recordings';
  var STORE = 'clips';
  var db = null;
  var known = Object.create(null);   // id -> {text, kind, size}
  var ready = false;
  var player = null;                  // one shared, unlocked <audio>
  var currentUrl = null;

  /* ------------------------- keys ------------------------- */
  function norm(s) {
    return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function hash(s) {
    var h = 2166136261, t = norm(s);
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h.toString(36);
  }
  /* kind separates a phoneme from a word that happens to spell the
     same thing — the "or" sound versus the word "or". */
  function keyFor(text, kind) { return (kind || 'say') + '_' + hash(text); }

  /* ----------------------- IndexedDB ---------------------- */
  function open() {
    return new Promise(function (resolve, reject) {
      if (db) return resolve(db);
      if (!window.indexedDB) return reject(new Error('no IndexedDB'));
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { db = req.result; resolve(db); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function tx(mode) {
    return open().then(function (d) { return d.transaction(STORE, mode).objectStore(STORE); });
  }

  function init() {
    return tx('readonly').then(function (store) {
      return new Promise(function (resolve) {
        var req = store.openCursor();
        req.onsuccess = function () {
          var cur = req.result;
          if (cur) {
            var v = cur.value;
            known[v.id] = { text: v.text, kind: v.kind, size: v.blob ? v.blob.size : 0, ts: v.ts };
            cur.continue();
          } else { ready = true; resolve(true); }
        };
        req.onerror = function () { ready = true; resolve(false); };
      });
    }).catch(function () { ready = true; return false; });
  }

  function save(text, kind, blob) {
    var id = keyFor(text, kind);
    var rec = { id: id, text: String(text), kind: kind || 'say', blob: blob, ts: Date.now() };
    return tx('readwrite').then(function (store) {
      return new Promise(function (resolve, reject) {
        var req = store.put(rec);
        req.onsuccess = function () {
          known[id] = { text: rec.text, kind: rec.kind, size: blob.size, ts: rec.ts };
          resolve(id);
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function load(id) {
    return tx('readonly').then(function (store) {
      return new Promise(function (resolve) {
        var req = store.get(id);
        req.onsuccess = function () { resolve(req.result ? req.result.blob : null); };
        req.onerror = function () { resolve(null); };
      });
    }).catch(function () { return null; });
  }

  function remove(text, kind) {
    var id = keyFor(text, kind);
    return tx('readwrite').then(function (store) {
      return new Promise(function (resolve) {
        var req = store.delete(id);
        req.onsuccess = function () { delete known[id]; resolve(true); };
        req.onerror = function () { resolve(false); };
      });
    }).catch(function () { return false; });
  }

  function clearAll() {
    return tx('readwrite').then(function (store) {
      return new Promise(function (resolve) {
        var req = store.clear();
        req.onsuccess = function () { known = Object.create(null); resolve(true); };
        req.onerror = function () { resolve(false); };
      });
    }).catch(function () { return false; });
  }

  /* ---------------------- playback ------------------------ */
  /* One element, unlocked once. iOS will not let us create a new
     Audio() mid-lesson and play it without a fresh tap. */
  function unlock() {
    if (player) return;
    player = new Audio();
    player.preload = 'auto';
    // a 0.05s silent wav, just to satisfy the gesture requirement
    player.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';
    var p = player.play();
    if (p && p.catch) p.catch(function () {});
    setTimeout(function () { try { player.pause(); player.currentTime = 0; } catch (e) {} }, 30);
  }

  function has(text, kind) { return !!known[keyFor(text, kind)]; }

  /* play() resolves true when a real recording was played, false
     when there is nothing recorded for this line (so the caller
     falls back to the synthesized voice). */
  function play(text, kind) {
    var id = keyFor(text, kind);
    if (!known[id]) return Promise.resolve(false);
    return load(id).then(function (blob) {
      if (!blob) return false;
      return new Promise(function (resolve) {
        if (!player) player = new Audio();
        if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = null; }
        currentUrl = URL.createObjectURL(blob);
        var done = false;
        function finish(v) { if (!done) { done = true; resolve(v); } }
        player.onended = function () { finish(true); };
        player.onerror = function () { finish(false); };
        player.src = currentUrl;
        var pr = player.play();
        if (pr && pr.catch) pr.catch(function () { finish(false); });
        // never let a stuck clip hang the lesson
        setTimeout(function () { finish(true); }, 30000);
      });
    });
  }

  function stop() {
    if (player) { try { player.pause(); player.currentTime = 0; } catch (e) {} }
  }

  /* ---------------------- recording ----------------------- */
  var stream = null, recorder = null, chunks = [];

  function pickMime() {
    if (!window.MediaRecorder) return null;
    var options = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < options.length; i++) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(options[i])) return options[i];
    }
    return '';
  }

  function canRecord() {
    return !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  function startRecording() {
    if (!canRecord()) return Promise.reject(new Error('This browser cannot record audio.'));
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s;
      chunks = [];
      var mime = pickMime();
      recorder = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
      recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.start();
      return true;
    });
  }

  /* stopRecording() resolves with the finished Blob. */
  function stopRecording() {
    return new Promise(function (resolve, reject) {
      if (!recorder) return reject(new Error('not recording'));
      recorder.onstop = function () {
        var type = recorder.mimeType || 'audio/mp4';
        var blob = new Blob(chunks, { type: type });
        if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
        recorder = null; chunks = [];
        resolve(blob);
      };
      try { recorder.stop(); } catch (e) { reject(e); }
    });
  }

  function isRecording() { return !!recorder; }

  function cancelRecording() {
    try { if (recorder) recorder.stop(); } catch (e) {}
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    recorder = null; chunks = [];
  }

  /* ------------------- backup / transfer ------------------ */
  function blobToBase64(blob) {
    return new Promise(function (resolve) {
      var r = new FileReader();
      r.onloadend = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.readAsDataURL(blob);
    });
  }
  function base64ToBlob(b64, type) {
    var bin = atob(b64), n = bin.length, arr = new Uint8Array(n);
    while (n--) arr[n] = bin.charCodeAt(n);
    return new Blob([arr], { type: type || 'audio/mp4' });
  }

  function exportAll(onProgress) {
    var ids = Object.keys(known);
    var out = { app: 'chance-academy-voice', version: 1, made: new Date().toISOString(), clips: [] };
    var p = Promise.resolve();
    ids.forEach(function (id, i) {
      p = p.then(function () {
        return load(id).then(function (blob) {
          if (!blob) return;
          return blobToBase64(blob).then(function (b64) {
            out.clips.push({ id: id, text: known[id].text, kind: known[id].kind, type: blob.type, data: b64 });
            if (onProgress) onProgress(i + 1, ids.length);
          });
        });
      });
    });
    return p.then(function () { return out; });
  }

  function importAll(json) {
    if (!json || json.app !== 'chance-academy-voice' || !json.clips) {
      return Promise.reject(new Error('That is not a Chance Academy voice file.'));
    }
    var p = Promise.resolve(), n = 0;
    json.clips.forEach(function (c) {
      p = p.then(function () {
        return save(c.text, c.kind, base64ToBlob(c.data, c.type)).then(function () { n++; });
      });
    });
    return p.then(function () { return n; });
  }

  function stats() {
    var ids = Object.keys(known), bytes = 0;
    ids.forEach(function (id) { bytes += known[id].size || 0; });
    return { count: ids.length, bytes: bytes, mb: (bytes / 1048576).toFixed(1) };
  }

  /* ---------------- what there is to record ---------------- */
  /* Ordered by how often he will actually hear it, so somebody with
     twenty minutes records the lines that matter and stops. */
  function inventory() {
    var groups = [];

    // 1. the owl. Every one of these repeats across all 60 days.
    var coach = [];
    Object.keys(Evaluate.allTags()).forEach(function (t) {
      coach.push({ text: Evaluate.allTags()[t].say, kind: 'say', note: Evaluate.allTags()[t].label });
    });
    Object.keys(Evaluate.BEHAVIOR).forEach(function (b) {
      coach.push({ text: Evaluate.BEHAVIOR[b].say, kind: 'say', note: Evaluate.BEHAVIOR[b].label });
    });
    groups.push({
      id: 'coach', em: '🦉', name: 'Coach lines',
      blurb: 'What the owl says when he picks a wrong answer. These repeat on every single day — record these first.',
      lines: coach
    });

    // 2. praise and the app's own phrases
    var praise = Evaluate.praiseLines().map(function (t) { return { text: t, kind: 'say', note: 'praise' }; });
    Object.keys(Phrases).forEach(function (k) {
      if (typeof Phrases[k] === 'string') praise.push({ text: Phrases[k], kind: 'say', note: k });
    });
    groups.push({
      id: 'app', em: '⭐', name: 'Praise & app lines',
      blurb: 'Well done, station finished, mission complete. Also heard constantly.',
      lines: praise
    });

    // 3. the letter sounds. A synthesizer physically cannot say an
    //    isolated /f/; a person can. Recording each chunk once fixes
    //    the sound-out for every word in the course that uses it.
    groups.push({
      id: 'sounds', em: '🔤', name: 'Letter sounds',
      blurb: 'Say each one as a pure sound — "ffff", not "eff". Recorded once, each of these works in every word ' +
             'across all 60 days, and it is the one thing the computer voice genuinely cannot do.',
      lines: Phonics.allChunks().map(function (c) {
        return { text: c.chunk, kind: 'sound', note: 'as in "' + (c.anchor || c.example) + '"' };
      })
    });

    // 4. one group per mission day
    Curriculum.allDays().forEach(function (d) {
      var lines = [];
      d.discover.intro.forEach(function (t) { lines.push({ text: t, kind: 'say', note: 'science' }); });
      if (d.discover.word) {
        lines.push({ text: 'Big word: ' + d.discover.word.w + '. ' + d.discover.word.mean + '.', kind: 'say', note: 'big word' });
      }
      pushItem(lines, d.discover.check, 'science question');
      d.numbers.problems.forEach(function (p, i) { pushItem(lines, p, 'math ' + (i + 1)); });
      d.reading.words.forEach(function (w) {
        lines.push({ text: w.w, kind: 'say', note: 'word' });
      });
      lines.push({ text: d.reading.sentence, kind: 'say', note: 'sentence' });
      pushItem(lines, d.reading.comp, 'comprehension');
      groups.push({
        id: d.id, em: d.icon, name: 'Day ' + d.n + ': ' + d.title,
        blurb: d.unitName + ' · ' + d.weekTitle, lines: lines, day: true
      });
    });
    return groups;
  }

  function pushItem(lines, item, note) {
    if (!item) return;
    if (item.story) lines.push({ text: item.story, kind: 'say', note: note + ' story' });
    lines.push({ text: item.q, kind: 'say', note: note + ' question' });
    item.choices.forEach(function (c, i) {
      lines.push({ text: (i + 1) + '. ' + c.t, kind: 'say', note: note + ' choice' });
    });
    if (item.hint) lines.push({ text: item.hint, kind: 'say', note: note + ' hint' });
    if (item.show) lines.push({ text: item.show, kind: 'say', note: note + ' answer' });
  }

  function groupProgress(group) {
    var done = group.lines.filter(function (l) { return has(l.text, l.kind); }).length;
    return { done: done, total: group.lines.length, pct: Math.round(100 * done / (group.lines.length || 1)) };
  }

  init();

  return {
    isReady: function () { return ready; },
    has: has, play: play, stop: stop, unlock: unlock,
    save: save, remove: remove, clearAll: clearAll,
    canRecord: canRecord, startRecording: startRecording, stopRecording: stopRecording,
    isRecording: isRecording, cancelRecording: cancelRecording,
    exportAll: exportAll, importAll: importAll, stats: stats,
    inventory: inventory, groupProgress: groupProgress, keyFor: keyFor
  };
})();

/* Every fixed phrase the app speaks, in one place, so the recording
   studio can list exactly the strings the code will later look up.
   If these two ever drift apart you record a line that never plays,
   so they are defined here and referenced everywhere else. */
window.Phrases = {
  stationDone: 'Station complete. You earned a star.',
  missionDone: 'Mission complete! Fantastic work today.',
  tapTheAnswer: 'Here is the answer. Tap it with me, and say it out loud.',
  micOff: "I didn't hear you. Hold the microphone button and say it out loud."
};
