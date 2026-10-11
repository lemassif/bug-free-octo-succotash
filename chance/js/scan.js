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
        return w.recognize(canvas, {}, { text: true, blocks: true });
      });
    }).then(function (res) {
      report('Done', 1);
      return normalise(res.data);
    });
  }

  function normalise(data) {
    var lines = [];
    (data.blocks || []).forEach(function (b) {
      (b.paragraphs || []).forEach(function (p) {
        (p.lines || []).forEach(function (l) {
          lines.push({
            text: l.text || '',
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
    return String(t || '').toLowerCase().replace(/[’']/g, "'").replace(/^[^a-z]+|[^a-z']+$/g, '').replace(/'s$/, '');
  }
  function isWord(w) { return /^[a-z][a-z'-]{1,15}$/.test(w) && !/^[a-z]$/.test(w); }

  function extract(res) {
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

  return { read: read, extract: extract, available: available };
})();
