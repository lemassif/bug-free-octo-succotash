/* ============================================================
   homework.js — photograph the real homework, study it in the app

   The idea: Chance's actual worksheet comes home, Grandpa snaps a
   photo of it, and the app turns it into practice he can do with
   the same owl, the same coaching and the same report as the
   built-in curriculum.

   The hard part is not the photo — it is that nobody is going to
   hand-type twenty questions every night. So:

   - A photo on its own is already useful: the Look & Do mode shows
     it big and reads the instructions aloud.
   - Typing "7 x 8" generates a complete question, with three wrong
     answers chosen to match the mistakes a second-grader actually
     makes, each carrying the right misconception tag so the live
     evaluator and the Thinking Report keep working. Ten problems
     takes about a minute.
   - Typing a spelling word generates a Read & Say item, chunked by
     the same phonics table the course uses.

   Everything lives in IndexedDB on the device, like the voice
   recordings. Photos are downscaled on import so a term's worth of
   homework does not fill the iPad.
   ============================================================ */

window.Homework = (function () {

  var DB_NAME = 'chance-homework';
  var PACKS = 'packs', PHOTOS = 'photos';
  var db = null;
  var cache = [];          // packs in memory, newest first
  var ready = false;

  /* ------------------------- storage ------------------------- */
  function open() {
    return new Promise(function (resolve, reject) {
      if (db) return resolve(db);
      if (!window.indexedDB) return reject(new Error('no IndexedDB'));
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains(PACKS)) d.createObjectStore(PACKS, { keyPath: 'id' });
        if (!d.objectStoreNames.contains(PHOTOS)) d.createObjectStore(PHOTOS, { keyPath: 'id' });
      };
      req.onsuccess = function () {
        db = req.result;
        // iOS closes connections while the app is in the background
        db.onclose = function () { db = null; };
        db.onversionchange = function () { try { db.close(); } catch (e) {} db = null; };
        resolve(db);
      };
      req.onerror = function () { reject(req.error); };
    });
  }
  function store(name, mode) {
    return open().then(function (d) {
      try { return d.transaction(name, mode).objectStore(name); }
      catch (e) {
        db = null;   // connection was closed under us — reconnect once
        return open().then(function (d2) { return d2.transaction(name, mode).objectStore(name); });
      }
    });
  }
  function put(name, rec) {
    return store(name, 'readwrite').then(function (s) {
      return new Promise(function (res, rej) {
        var r = s.put(rec);
        r.onsuccess = function () { res(rec); };
        r.onerror = function () { rej(r.error); };
      });
    });
  }
  function del(name, id) {
    return store(name, 'readwrite').then(function (s) {
      return new Promise(function (res) {
        var r = s.delete(id);
        r.onsuccess = function () { res(true); };
        r.onerror = function () { res(false); };
      });
    });
  }
  function getAll(name) {
    return store(name, 'readonly').then(function (s) {
      return new Promise(function (res) {
        var out = [], r = s.openCursor();
        r.onsuccess = function () {
          var c = r.result;
          if (c) { out.push(c.value); c.continue(); } else res(out);
        };
        r.onerror = function () { res([]); };
      });
    }).catch(function () { return []; });
  }
  function get(name, id) {
    return store(name, 'readonly').then(function (s) {
      return new Promise(function (res) {
        var r = s.get(id);
        r.onsuccess = function () { res(r.result || null); };
        r.onerror = function () { res(null); };
      });
    }).catch(function () { return null; });
  }

  function init() {
    return getAll(PACKS).then(function (list) {
      cache = list.sort(function (a, b) { return b.created - a.created; });
      ready = true;
      return cache;
    });
  }

  function packs() { return cache; }
  function pack(id) { return cache.filter(function (p) { return p.id === id; })[0] || null; }
  function isReady() { return ready; }

  function newId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function createPack(title) {
    var p = {
      id: newId('hw'),
      title: title || defaultTitle(),
      created: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      photoIds: [],
      items: []
    };
    cache.unshift(p);
    return put(PACKS, p).then(function () { return p; });
  }

  function defaultTitle() {
    var d = new Date();
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) + ' homework';
  }

  function savePack(p) {
    var i = cache.findIndex(function (x) { return x.id === p.id; });
    if (i >= 0) cache[i] = p;
    return put(PACKS, p);
  }

  function deletePack(p) {
    cache = cache.filter(function (x) { return x.id !== p.id; });
    var chain = Promise.resolve();
    (p.photoIds || []).forEach(function (pid) { chain = chain.then(function () { return del(PHOTOS, pid); }); });
    return chain.then(function () { return del(PACKS, p.id); });
  }

  /* --------------------------- photos ------------------------- */
  /* Phone cameras produce 4000px, 4MB images. A worksheet is
     perfectly readable at 1600px, and that keeps a whole term of
     homework inside a sane amount of storage. */
  var MAX_EDGE = 1600;

  function addPhoto(packObj, file) {
    return downscale(file).then(function (out) {
      var rec = { id: newId('ph'), packId: packObj.id, blob: out.blob, w: out.w, h: out.h, created: Date.now() };
      return put(PHOTOS, rec).then(function () {
        packObj.photoIds = (packObj.photoIds || []).concat(rec.id);
        return savePack(packObj).then(function () { return rec; });
      });
    });
  }

  function downscale(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var c = document.createElement('canvas');
        c.width = cw; c.height = ch;
        c.getContext('2d').drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        var done = function (blob) {
          if (!blob) return reject(new Error('could not read that picture'));
          resolve({ blob: blob, w: cw, h: ch });
        };
        if (c.toBlob) c.toBlob(done, 'image/jpeg', 0.82);
        else done(dataURLtoBlob(c.toDataURL('image/jpeg', 0.82)));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('could not read that picture')); };
      img.src = url;
    });
  }
  function dataURLtoBlob(u) {
    var parts = u.split(','), bin = atob(parts[1]), n = bin.length, arr = new Uint8Array(n);
    while (n--) arr[n] = bin.charCodeAt(n);
    return new Blob([arr], { type: 'image/jpeg' });
  }

  function photo(id) { return get(PHOTOS, id); }
  function removePhoto(packObj, photoId) {
    packObj.photoIds = (packObj.photoIds || []).filter(function (x) { return x !== photoId; });
    return del(PHOTOS, photoId).then(function () { return savePack(packObj); });
  }

  /* ------------------- turning input into items ---------------- */

  /* Parse "7 x 8", "7*8", "24 ÷ 3", "15-8", "9 + 6". Returns the
     numbers and operator, or null if it is not a simple problem. */
  function parseMath(text) {
    var t = String(text || '').trim().replace(/[=?]+$/, '').trim();
    var m = /^(\d{1,4})\s*([x×*·+\-−/÷])\s*(\d{1,4})$/i.exec(t);
    if (!m) return null;
    var a = parseInt(m[1], 10), b = parseInt(m[3], 10);
    var opRaw = m[2];
    var op = /[x×*·]/i.test(opRaw) ? '×' : (opRaw === '+' ? '+' : (/[-−]/.test(opRaw) ? '−' : '÷'));
    if (op === '÷' && (b === 0 || a % b !== 0)) return null;   // keep it whole-number
    if (op === '−' && b > a) return null;                      // no negatives at seven
    return { a: a, b: b, op: op };
  }

  /* Build a full question from a parsed problem. Every wrong answer
     carries the tag of the mistake that produces it, so the live
     coaching and the Thinking Report keep working exactly as they
     do for the built-in curriculum. */
  function mathItem(p) {
    var a = p.a, b = p.b, op = p.op, correct, wrong = [];

    if (op === '×') {
      correct = a * b;
      wrong.push([a + b, 'additive-for-multiplicative']);
      wrong.push([a * b - a, 'off-by-one']);            // skip-counted one group short
      wrong.push([a * (b + 1), 'bigger-number-bias']);
    } else if (op === '+') {
      correct = a + b;
      wrong.push([Math.abs(a - b), 'reversed-relation']);  // did the opposite operation
      wrong.push([a + b + 1, 'off-by-one']);
      wrong.push([a * b, 'bigger-number-bias']);
    } else if (op === '−') {
      correct = a - b;
      wrong.push([a + b, 'reversed-relation']);
      wrong.push([a - b + 1, 'off-by-one']);
      wrong.push([b, 'surface-feature']);                  // copied a number from the question
    } else {
      correct = a / b;
      wrong.push([a - b, 'reversed-relation']);
      wrong.push([a * b, 'bigger-number-bias']);
      wrong.push([a / b + 1, 'off-by-one']);
    }

    // no duplicates, nothing negative, nothing equal to the answer
    var seen = { }, choices = [{ t: String(correct), correct: true }];
    seen[correct] = true;
    wrong.forEach(function (w) {
      var v = w[0];
      if (v == null || isNaN(v) || v < 0 || seen[v]) return;
      seen[v] = true;
      choices.push({ t: String(v), tag: w[1] });
    });
    // a question needs at least one distractor to be worth asking
    var pad = 1;
    while (choices.length < 3) {
      var v = correct + pad;
      if (!seen[v]) { seen[v] = true; choices.push({ t: String(v), tag: 'off-by-one' }); }
      pad++;
      if (pad > 12) break;
    }

    var names = { '×': 'times', '+': 'plus', '−': 'minus', '÷': 'divided by' };
    return {
      id: newId('it'),
      kind: 'math',
      source: a + ' ' + op + ' ' + b,
      q: 'What is ' + a + ' ' + op + ' ' + b + '?',
      spoken: 'What is ' + a + ' ' + names[op] + ' ' + b + '?',
      choices: choices,
      hint: hintFor(op, a, b),
      show: a + ' ' + op + ' ' + b + ' = ' + correct + '.'
    };
  }

  function hintFor(op, a, b) {
    if (op === '×') return 'Think of ' + b + ' groups with ' + a + ' in each group. Count them up.';
    if (op === '+') return 'Start at ' + a + ' and count on ' + b + ' more.';
    if (op === '−') return 'Start at ' + a + ' and count back ' + b + '.';
    return 'How many ' + b + 's fit inside ' + a + '?';
  }

  /* A spelling word becomes a Read & Say item: he sees the chunks,
     hears them anchored, and says the word into the microphone.
     Hyphens let a grown-up force the split: "sh-ad-ow". */
  function wordItem(text) {
    var raw = String(text || '').trim();
    if (!raw) return null;
    var word, parts;
    if (raw.indexOf('-') !== -1) {
      parts = raw.split('-').map(function (s) { return s.trim(); }).filter(Boolean);
      word = parts.join('');
    } else {
      word = raw.replace(/\s+/g, '');
      parts = window.Phonics && Phonics.split ? Phonics.split(word) : [word];
    }
    if (!word) return null;
    return { id: newId('it'), kind: 'word', word: word, parts: parts };
  }

  /* ----------------------- spelling test ----------------------- */

  /* Misspellings a second-grader actually writes. Each one sounds
     right and is spelled wrong — "nite", "littel", "jumpt" — which is
     the whole difficulty of English spelling, and what a spelling
     test is checking. Ordered so the most telling mistake for a word
     is tried first. */
  var SOUND_SWAPS = [
    [/eir$/, 'ere'],          // their -> there
    [/oul/, 'u'],             // would -> wud
    [/cause$/, 'cuz'],        // because -> becuz
    [/ight/, 'ite'],          // night -> nite
    [/ck/, 'k'],              // rock -> rok
    [/ph/, 'f'],              // photo -> foto
    [/tch/, 'ch'],            // catch -> cach
    [/dge/, 'ge'],            // bridge -> brige
    [/^kn/, 'n'],             // knob -> nob
    [/^wr/, 'r'],             // wrap -> rap
    [/mb$/, 'm'],             // thumb -> thum
    [/oa(st)$/, 'o$1'],       // toast -> tost
    [/oa([^aeiou])$/, 'o$1e'],  // boat -> bote, road -> rode
    [/ow$/, 'oe'],            // slow -> sloe
    [/ai/, 'ay'],             // rain -> rayn
    [/ay$/, 'ai'],            // play -> plai
    [/ea/, 'ee'],             // beach -> beech
    [/ee/, 'ea'],             // feet -> feat
    [/ou/, 'ow'],             // cloud -> clowd
    [/oi/, 'oy'],             // coin -> coyn
    [/oy$/, 'oi'],            // toy -> toi
    [/au/, 'aw'],             // launch -> lawnch
    [/aw/, 'au'],             // claw -> clau
    [/ir/, 'ur'],             // bird -> burd
    [/ur/, 'er'],             // turn -> tern
    [/er$/, 'ur'],            // faster -> fastur
    [/le$/, 'el'],            // little -> littel
    [/ed$/, 't'],             // jumped -> jumpt
    [/([bdglmnprt])\1(ing|ed|er|y)$/, '$1$2'],   // hopping -> hoping
    [/c([ei])/, 's$1'],       // city -> sity
    [/y$/, 'ee'],             // happy -> happee
    [/^qu/, 'kw']             // quick -> kwick
  ];

  function vowelSwap(w) {
    var next = { a: 'e', e: 'i', i: 'e', o: 'u', u: 'o' };
    // a lone vowel, not half of a vowel team, so the swap is a real slip
    var m = /([^aeiou])([aeiou])([^aeiouy]|$)/.exec(w);
    if (!m) return null;
    var at = m.index + 1;
    return w.slice(0, at) + next[w[at]] + w.slice(at + 1);
  }

  /* Swap two neighbouring letters the way a child actually does, in
     order of how common the slip is:
       1. a vowel pair or gh reversed   their -> thier, night -> nihgt
       2. an r and its vowel swapped     bird -> brid
       3. a vowel and a neighbour, mid-word
     Never the first letter, which children almost always get right. */
  function letterSlip(w, n) {
    if (w.length < 4) return null;
    var V = /[aeiou]/, tiers = [[], [], [], []];
    for (var i = 1; i < w.length - 1; i++) {
      var a = w[i], b = w[i + 1];
      if (a === b) continue;
      if ((V.test(a) && V.test(b)) || (a === 'g' && b === 'h')) tiers[0].push(i);
      else if ((a === 'r' && V.test(b)) || (V.test(a) && b === 'r')) tiers[1].push(i);
      else if (i >= 2 && i <= w.length - 3 && (V.test(a) || V.test(b))) tiers[2].push(i);
      else if (i >= 2 && i <= w.length - 3) tiers[3].push(i);
    }
    for (var t = 0; t < tiers.length; t++) {
      if (tiers[t].length) {
        var at = tiers[t][n % tiers[t].length];
        return w.slice(0, at) + w[at + 1] + w[at] + w.slice(at + 2);
      }
    }
    return null;
  }

  function hashWord(w) {
    var h = 7;
    for (var i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0;
    return h;
  }

  /* Two wrong spellings for a word: one that SOUNDS right, one that
     LOOKS nearly right, each tagged with the mistake it represents. */
  function misspellings(word) {
    var w = word.toLowerCase(), out = [], seen = {};
    seen[w] = 1;
    function add(t, tag) {
      if (t && !seen[t] && /^[a-z]+$/.test(t) && t.length > 1) { seen[t] = 1; out.push({ t: t, tag: tag }); }
    }
    for (var i = 0; i < SOUND_SWAPS.length && out.length < 1; i++) {
      if (SOUND_SWAPS[i][0].test(w)) add(w.replace(SOUND_SWAPS[i][0], SOUND_SWAPS[i][1]), 'sound-spelling');
    }
    if (!out.length) add(vowelSwap(w), 'vowel-swap');
    var h = hashWord(w);
    for (var k = 0; k < 4 && out.length < 2; k++) add(letterSlip(w, h + k), 'letter-look');
    if (out.length < 2) add(vowelSwap(w), 'vowel-swap');
    // drop one letter of a vowel pair: friend -> frend, because -> becuse
    var vp = /[aeiou]{2}/.exec(w);
    if (out.length < 2 && vp) add(w.slice(0, vp.index) + w.slice(vp.index + 1), 'letter-look');
    if (out.length < 2) add(w + w[w.length - 1], 'letter-look');
    return out.slice(0, 2);
  }

  /* "Which is the right way to spell ___?" The word is SAID, never
     shown — showing it would give the answer away — and the choices
     are not read aloud, because a speech engine says "nite" and
     "night" the same way. */
  function spellItem(word) {
    var w = String(word || '').toLowerCase().trim();
    if (!w) return null;
    var wrong = misspellings(w);
    if (!wrong.length) return null;
    return {
      id: newId('it'),
      kind: 'spell',
      word: w,
      q: 'Listen 🔊 — which is the right way to spell the word?',
      spoken: 'Which is the right way to spell: ' + w + '?',
      silentChoices: true,
      choices: [{ t: w, correct: true }].concat(wrong),
      hint: 'Say ' + w + ' slowly in your head and picture each part.',
      show: w + ' is spelled ' + w.split('').join(', ') + '.'
    };
  }

  /* Turn a scanned worksheet into a lesson:
       1. read each word aloud into the microphone (practice)
       2. a spelling test on the same words, in a different order
       3. any math problems from the page
     Reading comes first so the test isn't a cold start, and the test
     is shuffled so he can't just remember the order. */
  function buildLesson(title, photoFile, words, mathProblems) {
    return createPack(title).then(function (p) {
      var chain = photoFile ? addPhoto(p, photoFile) : Promise.resolve();
      return chain.then(function () {
        var reads = [], tests = [], maths = [];
        (words || []).forEach(function (w) {
          var r = wordItem(w);
          if (r) reads.push(r);
          var s = spellItem(w);
          if (s) tests.push(s);
        });
        for (var i = tests.length - 1; i > 0; i--) {
          var j = (hashWord(title + i) % (i + 1)), t = tests[i];
          tests[i] = tests[j]; tests[j] = t;
        }
        (mathProblems || []).forEach(function (src) {
          var parsed = parseMath(src);
          if (parsed) maths.push(mathItem(parsed));
        });
        p.items = reads.concat(tests, maths);
        p.scanned = true;
        return savePack(p).then(function () { return p; });
      });
    });
  }

  /* A free-form question typed by a grown-up. Wrong answers are
     optional; with none it becomes a say-it-out-loud prompt. */
  function askItem(q, right, wrongs) {
    var choices = [{ t: String(right), correct: true }];
    (wrongs || []).forEach(function (w) {
      if (w && String(w).trim()) choices.push({ t: String(w).trim(), tag: 'guess-plausible' });
    });
    return {
      id: newId('it'), kind: 'ask', q: String(q),
      choices: choices,
      hint: 'Read the question again slowly.',
      show: 'The answer is ' + right + '.'
    };
  }

  function addItem(packObj, item) {
    if (!item) return Promise.resolve(null);
    packObj.items = (packObj.items || []).concat(item);
    return savePack(packObj).then(function () { return item; });
  }
  function removeItem(packObj, itemId) {
    packObj.items = (packObj.items || []).filter(function (x) { return x.id !== itemId; });
    return savePack(packObj);
  }

  /* Accepts a whole list at once: "7x8, 6x7, 24/3" or one per line. */
  function addMany(packObj, text) {
    var lines = String(text || '').split(/[\n,;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var made = [], skipped = [];
    lines.forEach(function (line) {
      var p = parseMath(line);
      if (p) made.push(mathItem(p));
      else skipped.push(line);
    });
    packObj.items = (packObj.items || []).concat(made);
    return savePack(packObj).then(function () { return { made: made, skipped: skipped }; });
  }

  function stats() {
    var items = 0, photos = 0;
    cache.forEach(function (p) { items += (p.items || []).length; photos += (p.photoIds || []).length; });
    return { packs: cache.length, items: items, photos: photos };
  }

  init();

  return {
    isReady: isReady, init: init, packs: packs, pack: pack,
    createPack: createPack, savePack: savePack, deletePack: deletePack,
    addPhoto: addPhoto, photo: photo, removePhoto: removePhoto,
    parseMath: parseMath, mathItem: mathItem, wordItem: wordItem, askItem: askItem,
    spellItem: spellItem, misspellings: misspellings, buildLesson: buildLesson,
    addItem: addItem, removeItem: removeItem, addMany: addMany,
    stats: stats, defaultTitle: defaultTitle
  };
})();
