/* ============================================================
   scan.js — read the words off a photo of his homework

   Take a picture of the worksheet, and the app finds the words on
   it by itself — no typing. It then hands them to a grown-up to
   confirm (text recognition always makes some mistakes, and a
   seven-year-old should not be drilled on a misread word), and
   builds a lesson out of whatever is confirmed.

   The recognition runs ON THE iPAD, with no internet connection and
   nothing uploaded. It is Tesseract (the open-source OCR engine),
   shipped inside the app under vendor/tesseract/ rather than pulled
   from a CDN, so it works wherever the app works and nothing about
   his homework leaves the device.

   What it is good at: printed worksheets, which is what spelling
   lists and math sheets from school almost always are. What it is
   bad at: handwriting. The confirm step is there for both cases.

   How words are picked out of the page:
   1. If the page has a numbered list ("1. light  2. night"), only
      the numbered items are taken. That is how teachers write a
      spelling list, and it skips the instructions automatically.
   2. Otherwise every word on the page is taken, minus the usual
      worksheet chrome ("Name", "Date", "Spelling words", "Write each
      word three times").
   3. A school take-home spelling sheet (a "Spelling Word" table, a
      "Tricky Word", a letter to the caregiver above it): the letter
      is ignored. The table is read a second time on its own, in
      black and white, which reads it far better than the whole
      page did, and only the spelling column and the tricky word are
      taken. Contraction tables ("it is | it's") are read from the
      two-word column, which comes through cleanly, and turned into
      the contraction from a fixed list, so a misread apostrophe can
      not change the word.
   Words the engine was unsure about arrive unticked, so a grown-up
   looks at them before Chance does.
   Math problems on the page ("7 x 8 =") are picked up too.
   ============================================================ */

window.Scan = (function () {

  var BASE = 'vendor/tesseract/';
  var loading = null;
  var worker = null;

  /* Absolute URLs: the worker resolves paths against its own address,
     not the page's, so relative paths would break. */
  function abs(p) { return new URL(p, location.href).href; }

  function loadLibrary() {
    if (window.Tesseract) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = BASE + 'tesseract.min.js';
      s.onload = function () { resolve(); };
      s.onerror = function () { loading = null; reject(new Error('library')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function getWorker(onProgress) {
    if (worker) return Promise.resolve(worker);
    return loadLibrary().then(function () {
      return Tesseract.createWorker('eng', 1, {
        workerPath: abs(BASE + 'worker.min.js'),
        // a specific .js file, so no SIMD guessing; the .wasm sits beside it
        corePath: abs(BASE + 'tesseract-core-lstm.js'),
        langPath: abs(BASE.replace(/\/$/, '')),
        gzip: true,
        // load the worker from its real address: the engine finds its
        // .wasm relative to the worker, which a blob: URL would break
        workerBlobURL: false,
        // keep the language data in IndexedDB after the first read
        cacheMethod: 'write',
        logger: function (m) {
          if (onProgress && m && typeof m.progress === 'number') onProgress(m.status || '', m.progress);
        }
      });
    }).then(function (w) { worker = w; return w; });
  }

  /* Phone photos are large, often dim and slightly grey. Shrink to a
     size the engine reads well, convert to grey, and stretch the
     contrast so faint print stands out. */
  var MAX_EDGE = 2000;
  function prepare(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var g = c.getContext('2d');
        g.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        try {
          var d = g.getImageData(0, 0, w, h), px = d.data, lo = 255, hi = 0, i, v;
          for (i = 0; i < px.length; i += 4) {
            v = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
            px[i] = px[i + 1] = px[i + 2] = v;
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
          var span = Math.max(1, hi - lo);
          for (i = 0; i < px.length; i += 4) {
            v = Math.round((px[i] - lo) * 255 / span);
            px[i] = px[i + 1] = px[i + 2] = v;
          }
          g.putImageData(d, 0, 0);
        } catch (e) { /* tainted or huge canvas: read it as it is */ }
        resolve(c);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('picture')); };
      img.src = url;
    });
  }

  /* read(file, onProgress) -> { text, lines: [{ text, words: [{ text, conf }] }] } */
  function read(file, onProgress) {
    var report = onProgress || function () {};
    report('Getting the picture ready…', 0.02);
    return prepare(file).then(function (canvas) {
      report('Loading the word reader…', 0.08);
      return getWorker(function (status, p) {
        // map the engine's own stages onto one bar he can watch
        if (/recogniz/i.test(status)) report('Reading the words…', 0.35 + 0.6 * p);
        else report('Loading the word reader…', 0.08 + 0.25 * p);
      }).then(function (w) {
        return w.recognize(canvas, {}, { text: true, blocks: true }).then(function (r) {
          var res = normalise(r.data), head = tableTop(res);
          if (head == null) return res;
          /* A spelling sheet: read the table again on its own. */
          report('Reading the spelling table…', 0.97);
          var crop = tableCanvas(canvas, head);
          return w.setParameters({ tessedit_pageseg_mode: '6' })
            .then(function () { return w.recognize(crop, {}, { text: true, blocks: true }); })
            .then(function (r2) { res.table = normalise(r2.data); return res; },
                  function () { return res; })
            .then(function (out) {
              return w.setParameters({ tessedit_pageseg_mode: '3' }).then(function () { return out; }, function () { return out; });
            });
        });
      });
    }).then(function (res) {
      report('Done', 1);
      return res;
    });
  }

  /* Where a school spelling table starts (its "Spelling Word" header,
     or the first line holding a contraction pair), or null if this is
     not that kind of sheet. */
  /* The table's own heading: a short line that is just "Spelling
     Word(s)", not a sentence that mentions spelling words. */
  function isHeader(text) {
    var t = letters(text);
    return t.length <= 22 && /spel+i?n?g?w[oa]r[dl]/.test(t);
  }
  function tableTop(res) {
    var pairs = 0, first = null;
    for (var i = 0; i < res.lines.length; i++) {
      var l = res.lines[i];
      if (isHeader(l.text) && l.bbox) return Math.max(0, l.bbox.y0 - 10);
      if (pairInLine(l.text)) { pairs++; if (first == null && l.bbox) first = Math.max(0, l.bbox.y0 - 40); }
    }
    return pairs >= 3 ? first : null;
  }

  /* The table alone, a little larger, in pure black and white with the
     cut-off chosen from the picture itself (Otsu's method), so a fold
     or a shadow across the page drops out. */
  function tableCanvas(src, top) {
    var w = src.width, h = src.height - top, k = 1.5;
    var c = document.createElement('canvas');
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    var g = c.getContext('2d');
    g.drawImage(src, 0, top, w, h, 0, 0, c.width, c.height);
    try {
      var d = g.getImageData(0, 0, c.width, c.height), px = d.data, hist = new Array(256).fill(0), n = 0, i;
      for (i = 0; i < px.length; i += 4) { hist[px[i]]++; n++; }
      var sum = 0; for (i = 0; i < 256; i++) sum += i * hist[i];
      var sb = 0, wb = 0, best = 0, cut = 128;
      for (i = 0; i < 256; i++) {
        wb += hist[i]; if (!wb) continue;
        var wf = n - wb; if (!wf) break;
        sb += i * hist[i];
        var mb = sb / wb, mf = (sum - sb) / wf, between = wb * wf * (mb - mf) * (mb - mf);
        if (between > best) { best = between; cut = i; }
      }
      for (i = 0; i < px.length; i += 4) { var v = px[i] < cut ? 0 : 255; px[i] = px[i + 1] = px[i + 2] = v; }
      g.putImageData(d, 0, 0);
    } catch (e) {}
    return c;
  }

  /* ---------------------- contractions ---------------------- */
  function letters(t) { return String(t || '').toLowerCase().replace(/[^a-z]/g, ''); }
  function near(a, b) {                    // edit distance of at most 1
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 3) return false;
    var i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }
  /* "it is" (or "itis", "you wil") somewhere in the line -> "it's" */
  function pairInLine(text) {
    var toks = String(text || '').toLowerCase().split(/[^a-z]+/).filter(Boolean);
    var C = window.Homework ? Homework.CONTRACTIONS : {};
    for (var i = 0; i < toks.length; i++) {
      for (var c in C) {
        var p = C[c].split(' ');
        var one = toks[i] === p[0] || (p[0].length > 3 && near(toks[i], p[0]));
        if (one && toks[i + 1] && (toks[i + 1] === p[1] || (p[1].length > 3 && near(toks[i + 1], p[1])))) return c;
        if (toks[i].length >= 5 && near(toks[i], p.join(''))) return c;
      }
    }
    return null;
  }
  /* a lone contraction, read however badly: "isn’", "arent", "wasn’!" */
  function contractionInLine(text) {
    var C = window.Homework ? Homework.CONTRACTIONS : {};
    var toks = String(text || '').split(/\s+/);
    for (var i = toks.length - 1; i >= 0; i--) {
      var raw = toks[i].replace(/[‘’`]/g, "'"), t = letters(raw);
      if (t.length < 3) continue;
      for (var c in C) {
        var cl = letters(c);
        if (t === cl && (raw.indexOf("'") !== -1 || !REAL[t])) return c;
        if (raw.indexOf("'") !== -1 && cl.length >= 4 && near(t, cl)) return c;
      }
    }
    return null;
  }
  // contractions that are also ordinary words without the apostrophe
  var REAL = { its: 1, shell: 1, well: 1, hell: 1, ill: 1, were: 1, wed: 1, id: 1, hed: 1, shed: 1, wont: 1, cant: 1, lets: 1 };

  /* The words off a school spelling sheet, in the teacher's order:
     the spelling column of the table, then the tricky word(s). */
  function sheetWords(res) {
    var lines = (res.table && res.table.lines.length ? res.table.lines : res.lines), out = [], tricky = [];
    var started = !!res.table, seen = {};
    lines.forEach(function (l) {
      var t = l.text || '';
      var tm = /tricky\s*words?\s*[:;.]?\s*(.*)$/i.exec(t);
      if (tm) {
        tm[1].split(/[,;&]|\s+and\s+|\s+/).forEach(function (x) {
          var w = x.toLowerCase().replace(/[‘’`]/g, "'").replace(/^[^a-z]+|[^a-z']+$/g, '');
          if (isWord(w) && tricky.indexOf(w) === -1 && tricky.length < 3) tricky.push(w);
        });
        started = false;          // nothing after the tricky word is a spelling word
        return;
      }
      if (isHeader(t)) { started = true; return; }
      if (!started) return;
      var c = pairInLine(t) || contractionInLine(t);
      if (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } return; }
      // an ordinary spelling table: the right-hand column, if read with confidence
      var ws = (l.words || []).filter(function (x) { return x.conf >= 80; });
      var last = ws.length ? ws[ws.length - 1].text : '';
      var w = last.toLowerCase().replace(/[‘’`]/g, "'").replace(/^[^a-z]+|[^a-z']+$/g, '');
      if (ws.length && ws.length <= 3 && isWord(w) && !CHROME[w] && !seen[w]) { seen[w] = 1; out.push(w); }
    });
    // anything the whole-page read found in the table that the table read missed
    if (res.table) {
      var inTable = false;
      res.lines.forEach(function (l) {
        if (isHeader(l.text)) { inTable = true; return; }
        if (/tricky/i.test(l.text)) inTable = false;
        if (!inTable) return;
        var c = pairInLine(l.text) || contractionInLine(l.text);
        if (c && !seen[c]) { seen[c] = 1; out.push(c); }
      });
    }
    tricky.forEach(function (w) { if (!seen[w]) { seen[w] = 1; out.push(w); } });
    return out;
  }

  function normalise(data) {
    var lines = [];
    (data.blocks || []).forEach(function (b) {
      (b.paragraphs || []).forEach(function (p) {
        (p.lines || []).forEach(function (l) {
          lines.push({
            text: l.text || '', bbox: l.bbox || null,
            words: (l.words || []).map(function (w) { return { text: w.text || '', conf: w.confidence || 0 }; })
          });
        });
      });
    });
    if (!lines.length && data.text) {
      lines = data.text.split('\n').map(function (t) { return { text: t, words: [] }; });
    }
    return { text: data.text || '', lines: lines };
  }

  /* ------------------ picking the words out ------------------- */

  /* Worksheet chrome. Deliberately short: a stop word that is also a
     real spelling word ("these", "write", "each" are all on the
     second-grade sight-word list) would silently vanish, so these
     only apply when there is NO numbered list to go on. */
  var CHROME = {};
  ('name date class teacher grade spelling words word list week test homework directions ' +
   'page unit lesson parent signature due monday tuesday wednesday thursday friday ' +
   'times practice study sentence sentences answer answers the and a an of to in on for ' +
   'with is are be it at by or as from your my').split(' ').forEach(function (w) { CHROME[w] = 1; });

  var LOW_CONFIDENCE = 65;

  function clean(t) {
    var w = String(t || '').toLowerCase().replace(/[’']/g, "'").replace(/^[^a-z]+|[^a-z']+$/g, '');
    var C = window.Homework ? Homework.CONTRACTIONS : {};
    return C[w] ? w : w.replace(/'s$/, '');          // keep "it's", drop the 's of "Chance's"
  }
  function isWord(w) { return /^[a-z][a-z'-]{1,15}$/.test(w) && !/^[a-z]$/.test(w); }

  function extract(res) {
    if (res.table || tableTop(res) != null) {
      var sw = sheetWords(res);
      if (sw.length >= 2) {
        return { words: sw.map(function (w) { return { word: w, conf: 100, keep: true }; }), math: [], fromList: true, sheet: true };
      }
    }
    var conf = {};
    res.lines.forEach(function (l) {
      l.words.forEach(function (w) {
        var c = clean(w.text);
        if (c && (conf[c] == null || w.conf > conf[c])) conf[c] = w.conf;
      });
    });

    /* math first: "7 x 8 =", "24 ÷ 3", several per line */
    var math = [], seenMath = {};
    res.lines.forEach(function (l) {
      var re = /(\d{1,4})\s*([xX×*+\-−–÷\/])\s*(\d{1,4})/g, m;
      while ((m = re.exec(l.text))) {
        var src = m[1] + ' ' + m[2].replace(/[–−]/, '-').replace(/X/, 'x') + ' ' + m[3];
        var parsed = window.Homework && Homework.parseMath(src);
        if (parsed && !seenMath[src]) { seenMath[src] = 1; math.push({ source: src, parsed: parsed, keep: true }); }
      }
    });

    /* numbered list: "1. light", "2) night", two columns on one line */
    var numbered = [];
    res.lines.forEach(function (l) {
      var re = /(?:^|\s)(\d{1,2})\s*[.)]\s*([A-Za-z][A-Za-z’'-]*)/g, m;
      while ((m = re.exec(l.text))) numbered.push({ n: parseInt(m[1], 10), w: clean(m[2]) });
    });
    /* A two-column list reads across (1, 6, 2, 7…); the teacher's
       numbers say the real order, so use them. */
    numbered = numbered.filter(function (x) { return isWord(x.w); })
      .sort(function (a, b) { return a.n - b.n; })
      .map(function (x) { return x.w; });

    var picked, fromList = numbered.length >= 3;
    if (fromList) {
      picked = numbered;
    } else {
      picked = [];
      res.lines.forEach(function (l) {
        if (/(\d{1,4})\s*[xX×*+\-−–÷\/]\s*(\d{1,4})/.test(l.text)) return;   // a math line
        (l.text.match(/[A-Za-z][A-Za-z’'-]*/g) || []).forEach(function (t) {
          var c = clean(t);
          if (isWord(c) && !CHROME[c]) picked.push(c);
        });
      });
    }

    var seen = {}, words = [];
    picked.forEach(function (w) {
      if (seen[w]) return;
      seen[w] = 1;
      var c = conf[w] != null ? conf[w] : 0;
      words.push({ word: w, conf: Math.round(c), keep: c >= LOW_CONFIDENCE });
    });

    return { words: words.slice(0, 25), math: math.slice(0, 20), fromList: fromList };
  }

  /* The single-file copy (dist/, the preview link) has every script
     inlined and no vendor/ folder beside it, so the reader only
     exists when this file was loaded from its own address. */
  function available() {
    return typeof Worker !== 'undefined' && typeof WebAssembly === 'object' &&
      /^https?:$/.test(location.protocol) &&
      !!document.querySelector('script[src*="js/scan.js"]');
  }

  return { read: read, extract: extract, available: available, _sheetWords: sheetWords, _pairInLine: pairInLine };
})();
