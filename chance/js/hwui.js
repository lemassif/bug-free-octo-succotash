/* ============================================================
   hwui.js — the two homework screens

   📸 Homework (kid)      pick a worksheet and study it
   ✏️ Manage (grown-up)   photograph it, add practice to it

   The grown-up side is built around one honest constraint: nobody
   is hand-typing twenty questions on a weeknight. So the fast path
   is a single box where you paste or type the problems the way
   they appear on the page — "7x8, 6x7, 24/3" — and every one
   becomes a full question with tagged wrong answers.
   ============================================================ */

window.HWUI = (function () {

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function note(t) {
    var n = el('p', null, t);
    n.style.cssText = 'font-size:15px;color:var(--ink-soft);margin:8px 0;';
    return n;
  }

  /* ===================== the Homework screen ====================
     The camera is the first thing on it. Take the picture, the app
     reads the words, you check them, and the lesson starts. Past
     worksheets sit underneath to study again. */
  function renderPicker(body) {
    body.innerHTML = '';
    var list = Homework.packs();

    var cam = el('button', 'scan-hero');
    cam.appendChild(el('span', 'scan-em', '📷'));
    var t = el('span', 'scan-text');
    t.appendChild(el('b', null, 'Take a picture of homework'));
    t.appendChild(el('span', null, 'The app reads the words and makes a lesson out of them'));
    cam.appendChild(t);
    cam.addEventListener('click', function () { pickPhoto(body, true); });
    body.appendChild(cam);

    var lib = el('div', 'row');
    lib.appendChild(App.ui.btn('🖼️', 'Use a photo I already took', function () { pickPhoto(body, false); }));
    lib.appendChild(App.ui.btn('⌨️', 'Type the words instead', function () {
      showConfirm(body, null, { words: [], math: [], fromList: false }, null);
    }));
    body.appendChild(lib);

    if (!list.length) return;

    body.appendChild(el('div', 'week-title', 'HOMEWORK TO STUDY AGAIN'));
    var grid = el('div', 'badge-grid');
    list.forEach(function (p) {
      var card = el('button', 'badge hw-card');
      var thumb = el('div', 'hw-thumb');
      thumb.appendChild(el('span', 'em', '📄'));
      card.appendChild(thumb);
      card.appendChild(el('div', 'nm', p.title));
      var n = (p.items || []).length;
      card.appendChild(el('div', 'dt', n ? n + (n === 1 ? ' question' : ' questions') : 'look & do'));
      if (Progress.stationDone(p.id, 'homework')) card.appendChild(el('div', 'dt', '⭐ done'));
      card.addEventListener('click', function () {
        App.go('mission', { day: p, station: 'homework' });
      });
      grid.appendChild(card);

      // swap in the real photo once it loads
      if ((p.photoIds || []).length) {
        Homework.photo(p.photoIds[0]).then(function (rec) {
          if (!rec) return;
          var img = document.createElement('img');
          img.src = URL.createObjectURL(rec.blob);
          img.alt = '';
          thumb.innerHTML = '';
          thumb.appendChild(img);
        });
      }
    });
    body.appendChild(grid);
  }

  /* ============ GROWN-UP SIDE: build a worksheet ============== */
  var editing = null;

  function renderEditor(body) {
    body.innerHTML = '';

    if (!editing) return renderPackList(body);
    return renderPack(body, editing);
  }

  function renderPackList(body) {
    var s = Homework.stats();
    var stats = el('div', 'stat-row');
    [[s.packs, 'worksheets'], [s.photos, 'photos'], [s.items, 'questions']].forEach(function (x) {
      var n = el('div', 'stat');
      n.appendChild(el('b', null, String(x[0])));
      n.appendChild(el('i', null, x[1]));
      stats.appendChild(n);
    });
    body.appendChild(stats);

    body.appendChild(note(
      'Photograph the homework that came home, then add the problems from it. ' +
      'Chance studies them with the same owl, the same coaching and the same report as the course.'
    ));

    var r = el('div', 'row');
    r.appendChild(App.ui.btn('📷', 'New worksheet', function () {
      Homework.createPack().then(function (p) { editing = p; renderEditor(body); });
    }));
    body.appendChild(r);

    var list = Homework.packs();
    if (!list.length) return;

    body.appendChild(el('div', 'week-title', 'WORKSHEETS'));
    list.forEach(function (p) {
      var row = el('div', 'report-item');
      row.appendChild(el('b', null, p.title));
      row.appendChild(el('span', null,
        (p.photoIds || []).length + ' photo' + ((p.photoIds || []).length === 1 ? '' : 's') + ' · ' +
        (p.items || []).length + ' question' + ((p.items || []).length === 1 ? '' : 's') +
        (Progress.stationDone(p.id, 'homework') ? ' · ⭐ he has done it' : '')));
      var rr = el('div', 'row');
      rr.appendChild(App.ui.btn('✏️', 'Open', function () { editing = p; renderEditor(body); }));
      rr.appendChild(App.ui.btn('🗑️', 'Delete', function () {
        if (!confirm('Delete "' + p.title + '" and its photos?')) return;
        Homework.deletePack(p).then(function () { renderEditor(body); });
      }));
      row.appendChild(rr);
      body.appendChild(row);
    });
  }

  function renderPack(body, p) {
    var back = el('div', 'row');
    back.appendChild(App.ui.btn('⬅️', 'All worksheets', function () { editing = null; renderEditor(body); }));
    body.appendChild(back);

    // --- title
    var titleField = el('label', 'field', 'What is this worksheet?');
    var titleInput = el('input');
    titleInput.type = 'text';
    titleInput.value = p.title;
    titleInput.addEventListener('change', function () {
      p.title = titleInput.value.trim() || Homework.defaultTitle();
      Homework.savePack(p);
    });
    titleField.appendChild(titleInput);
    body.appendChild(titleField);

    // --- photos
    body.appendChild(el('div', 'week-title', 'PHOTOS'));
    var photoRow = el('div', 'badge-grid');
    (p.photoIds || []).forEach(function (pid) {
      var cell = el('div', 'badge');
      var holder = el('div', 'hw-thumb');
      cell.appendChild(holder);
      var rm = App.ui.btn('🗑️', 'Remove', function () {
        Homework.removePhoto(p, pid).then(function () { renderEditor(body); });
      });
      cell.appendChild(rm);
      photoRow.appendChild(cell);
      Homework.photo(pid).then(function (rec) {
        if (!rec) return;
        var img = document.createElement('img');
        img.src = URL.createObjectURL(rec.blob);
        img.alt = '';
        img.addEventListener('click', function () { App.showPhoto(img.src); });
        holder.appendChild(img);
      });
    });
    body.appendChild(photoRow);

    /* capture="environment" makes iOS open the camera straight away
       rather than the photo library; dropping it would make this a
       two-step chore every single night. */
    var camRow = el('div', 'row');
    camRow.appendChild(filePicker('📷', 'Take a photo', true, p, body));
    camRow.appendChild(filePicker('🖼️', 'Choose photos', false, p, body));
    body.appendChild(camRow);

    // --- the fast path
    body.appendChild(el('div', 'week-title', 'ADD THE PROBLEMS'));
    body.appendChild(note(
      'Type the problems the way they appear on the page, separated by commas or new lines — ' +
      '"7x8, 6x7, 24/3, 15-8". Each one becomes a full question, with wrong answers picked to match ' +
      'the mistakes a second-grader actually makes.'
    ));
    var mathField = el('label', 'field', 'Math problems');
    var mathBox = document.createElement('textarea');
    mathBox.rows = 3;
    mathBox.placeholder = '7x8, 6x7, 24/3, 15-8, 9+6';
    mathBox.style.cssText = 'width:100%;margin-top:4px;padding:12px;font-size:17px;font-family:inherit;border:2px solid var(--line);border-radius:12px;';
    mathField.appendChild(mathBox);
    body.appendChild(mathField);
    var mathMsg = note('');
    body.appendChild(mathMsg);
    var mr = el('div', 'row');
    mr.appendChild(App.ui.btn('➕', 'Add these', function () {
      Homework.addMany(p, mathBox.value).then(function (res) {
        mathBox.value = '';
        var msg = 'Added ' + res.made.length + '.';
        if (res.skipped.length) msg += ' Could not read: ' + res.skipped.join(', ') +
          ' — only simple whole-number problems like 7x8 or 24/3 work here.';
        mathMsg.textContent = msg;
        renderEditor(body);
      });
    }));
    body.appendChild(mr);

    // --- spelling words
    var wordField = el('label', 'field', 'Spelling words (one per line — add hyphens to fix the split: sh-ad-ow)');
    var wordBox = document.createElement('textarea');
    wordBox.rows = 2;
    wordBox.placeholder = 'shadow\nplanet\nbright';
    wordBox.style.cssText = mathBox.style.cssText;
    wordField.appendChild(wordBox);
    body.appendChild(wordField);
    var wr = el('div', 'row');
    wr.appendChild(App.ui.btn('➕', 'Add words', function () {
      var lines = wordBox.value.split(/[\n,;]+/).map(function (x) { return x.trim(); }).filter(Boolean);
      var chain = Promise.resolve();
      lines.forEach(function (w) {
        chain = chain.then(function () { return Homework.addItem(p, Homework.wordItem(w)); });
      });
      chain.then(function () { wordBox.value = ''; renderEditor(body); });
    }));
    body.appendChild(wr);

    // --- anything else
    var askWrap = el('div', 'report-item');
    askWrap.appendChild(el('b', null, 'Any other question'));
    var qf = el('label', 'field', 'Question');
    var qi = el('input'); qi.type = 'text'; qi.placeholder = 'What is a group of fish called?';
    qf.appendChild(qi); askWrap.appendChild(qf);
    var af = el('label', 'field', 'Right answer');
    var ai = el('input'); ai.type = 'text'; ai.placeholder = 'A school';
    af.appendChild(ai); askWrap.appendChild(af);
    var wf = el('label', 'field', 'Wrong answers (optional, separated by commas)');
    var wi2 = el('input'); wi2.type = 'text'; wi2.placeholder = 'A herd, A flock';
    wf.appendChild(wi2); askWrap.appendChild(wf);
    var ar = el('div', 'row');
    ar.appendChild(App.ui.btn('➕', 'Add question', function () {
      if (!qi.value.trim() || !ai.value.trim()) return;
      var wrongs = wi2.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      Homework.addItem(p, Homework.askItem(qi.value.trim(), ai.value.trim(), wrongs))
        .then(function () { renderEditor(body); });
    }));
    askWrap.appendChild(ar);
    body.appendChild(askWrap);

    // --- what is in the pack
    var items = p.items || [];
    body.appendChild(el('div', 'week-title', 'IN THIS WORKSHEET — ' + items.length +
      (items.length === 1 ? ' QUESTION' : ' QUESTIONS')));
    if (!items.length) {
      body.appendChild(note('None yet. A worksheet with no questions still works — Chance sees the photo, ' +
        'does it on paper, and taps "I finished it".'));
    }
    items.forEach(function (it) {
      var row = el('div', 'report-item');
      var label = it.kind === 'word' ? '📖 ' + it.word + '  (' + it.parts.join(' · ') + ')' : '🔢 ' + it.q;
      row.appendChild(el('b', null, label));
      if (it.choices) {
        row.appendChild(el('span', null, 'Answer ' + it.choices.filter(function (c) { return c.correct; })[0].t +
          '   ·   also offers ' + it.choices.filter(function (c) { return !c.correct; })
            .map(function (c) { return c.t; }).join(', ')));
      }
      var rr = el('div', 'row');
      rr.appendChild(App.ui.btn('🔊', 'Hear it', function () {
        Voice.stop();
        if (it.kind === 'word') Voice.soundOut(it.word, it.parts);
        else Voice.say(it.spoken || it.q);
      }));
      rr.appendChild(App.ui.btn('🗑️', 'Remove', function () {
        Homework.removeItem(p, it.id).then(function () { renderEditor(body); });
      }));
      row.appendChild(rr);
      body.appendChild(row);
    });

    if (items.length || (p.photoIds || []).length) {
      var done = el('div', 'row');
      done.appendChild(App.ui.btn('👦', 'Try it as Chance', function () {
        App.go('mission', { day: p, station: 'homework' });
      }));
      body.appendChild(done);
    }
  }

  function filePicker(em, label, useCamera, p, body) {
    var b = App.ui.btn(em, label, function () { input.click(); });
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (useCamera) input.setAttribute('capture', 'environment');
    input.multiple = !useCamera;
    input.style.display = 'none';
    input.addEventListener('change', function () {
      var files = [].slice.call(input.files || []);
      if (!files.length) return;
      var chain = Promise.resolve();
      files.forEach(function (f) { chain = chain.then(function () { return Homework.addPhoto(p, f); }); });
      chain.then(function () { input.value = ''; renderEditor(body); })
        .catch(function (e) { alert(e.message || 'That picture could not be added.'); });
    });
    b.appendChild(input);
    return b;
  }

  function openPack(p) { editing = p; }

  /* -------------------- scan: pick a photo -------------------- */
  /* capture="environment" opens the iPad's back camera straight away;
     without it iOS asks "photo library or camera?" every single time. */
  function pickPhoto(body, useCamera) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (useCamera) input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      input.remove();
      if (f) readPhoto(body, f);
    });
    document.body.appendChild(input);
    input.click();
  }

  /* ---------------- scan: read the words off it ---------------- */
  function readPhoto(body, file) {
    body.innerHTML = '';
    App.setActions([]);
    var card = el('div', 'card');
    card.appendChild(el('div', 'big-em', '🔎'));
    var status = el('h3', null, 'Reading the words…');
    card.appendChild(status);
    var bar = el('div', 'bar');
    bar.style.cssText = 'height:14px;background:var(--line);border-radius:99px;overflow:hidden;margin:14px 0;';
    var fill = el('span');
    fill.style.cssText = 'display:block;height:100%;width:2%;background:linear-gradient(90deg,var(--leaf),var(--sun));transition:width .3s;';
    bar.appendChild(fill);
    card.appendChild(bar);
    card.appendChild(note('This happens on the iPad itself — nothing is sent anywhere. The first time takes a little longer while the word reader loads.'));
    body.appendChild(card);

    if (!Scan.available()) {
      return failed(body, file, 'This copy of the app cannot read photos. Open Chance Academy from its home-screen icon (the GitHub link), or type the words instead.');
    }
    Scan.read(file, function (label, p) {
      status.textContent = label;
      fill.style.width = Math.max(2, Math.round(p * 100)) + '%';
    }).then(function (res) {
      var found = Scan.extract(res);
      showConfirm(body, file, found, res);
    }).catch(function () {
      failed(body, file, 'The word reader could not open. Check the wifi and try again — or type the words instead.');
    });
  }

  function failed(body, file, msg) {
    body.innerHTML = '';
    var card = el('div', 'card');
    card.appendChild(el('div', 'big-em', '🤔'));
    card.appendChild(el('h3', null, 'Could not read that photo'));
    card.appendChild(note(msg));
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('📷', 'Try another picture', function () { pickPhoto(body, true); }));
    r.appendChild(App.ui.btn('⌨️', 'Type the words', function () {
      showConfirm(body, file, { words: [], math: [], fromList: false }, null);
    }));
    card.appendChild(r);
    body.appendChild(card);
  }

  /* -------------- scan: a grown-up checks the words --------------
     The reader is good but not perfect, and drilling a seven-year-old
     on a misread word would be worse than no lesson at all. So every
     word and problem is shown here to keep, fix or drop before
     Chance sees anything. Unsure readings arrive unticked. */
  function showConfirm(body, file, found, raw) {
    body.innerHTML = '';
    App.setActions([]);

    var words = found.words.map(function (w) { return { text: w.word, keep: w.keep, unsure: !w.keep }; });
    var math = found.math.map(function (m) { return { text: m.source, keep: true }; });

    if (file) {
      var fig = el('div', 'hw-photo');
      var img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = 'The homework';
      img.addEventListener('click', function () { App.showPhoto(img.src); });
      fig.appendChild(img);
      body.appendChild(fig);
    }

    var head = el('div', 'card');
    head.appendChild(el('h3', null, words.length
      ? 'I found ' + words.length + (words.length === 1 ? ' word' : ' words')
      : (file ? 'I could not find any words' : 'Type the words')));
    head.appendChild(note(words.length
      ? 'Grown-up check: untick anything that is not a homework word, and fix any that are spelled wrong. ' +
        (words.some(function (w) { return w.unsure; }) ? 'Words I was unsure about start unticked. ' : '') +
        'Then start the lesson.'
      : 'Type each homework word in the box below.'));
    body.appendChild(head);

    var listEl = el('div', 'scan-list');
    body.appendChild(listEl);

    function row(item, kind) {
      var r = el('div', 'scan-row' + (item.keep ? '' : ' off'));
      var tick = el('button', 'scan-tick', item.keep ? '✓' : '');
      tick.setAttribute('aria-label', item.keep ? 'Keep' : 'Skip');
      tick.addEventListener('click', function () {
        item.keep = !item.keep;
        r.classList.toggle('off', !item.keep);
        tick.textContent = item.keep ? '✓' : '';
        refresh();
      });
      var input = el('input');
      input.type = 'text';
      input.value = item.text;
      input.autocapitalize = 'none';
      input.spellcheck = false;
      input.addEventListener('input', function () { item.text = input.value.trim(); refresh(); });
      r.appendChild(tick);
      r.appendChild(input);
      if (item.unsure) r.appendChild(el('span', 'scan-flag', 'unsure'));
      return r;
    }

    function draw() {
      listEl.innerHTML = '';
      if (words.length) listEl.appendChild(el('div', 'week-title', 'WORDS'));
      words.forEach(function (w) { listEl.appendChild(row(w, 'word')); });

      var add = el('div', 'scan-row');
      var addInput = el('input');
      addInput.type = 'text';
      addInput.placeholder = 'Add a word…';
      addInput.autocapitalize = 'none';
      var addBtn = el('button', 'scan-tick', '+');
      addBtn.setAttribute('aria-label', 'Add word');
      function addWord() {
        addInput.value.split(/[\s,;]+/).map(function (x) { return x.trim().toLowerCase(); })
          .filter(Boolean).forEach(function (x) { words.push({ text: x, keep: true }); });
        draw();
      }
      addBtn.addEventListener('click', addWord);
      addInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addWord(); });
      add.appendChild(addBtn);
      add.appendChild(addInput);
      listEl.appendChild(add);

      if (math.length) {
        listEl.appendChild(el('div', 'week-title', 'MATH PROBLEMS'));
        listEl.appendChild(note('Check the signs — the reader sometimes mistakes ÷ for +.'));
        math.forEach(function (m) { listEl.appendChild(row(m, 'math')); });
      }
      refresh();
    }

    function chosen() {
      return {
        words: words.filter(function (w) { return w.keep && /^[a-zA-Z][a-zA-Z'-]*$/.test(w.text); })
          .map(function (w) { return w.text.toLowerCase(); }),
        math: math.filter(function (m) { return m.keep && Homework.parseMath(m.text); })
          .map(function (m) { return m.text; })
      };
    }

    function refresh() {
      var c = chosen();
      var n = c.words.length + c.math.length;
      if (!n) {
        App.setActions([{ label: 'Back', em: '⬅️', cls: 'ghost', fn: function () { renderPicker(body); } }]);
        return;
      }
      App.setActions([
        { label: 'Back', em: '⬅️', cls: 'ghost compact', fn: function () { renderPicker(body); } },
        {
          label: 'Start the lesson (' + n + ')', em: '▶️', cls: 'sun', fn: function () {
            var title = (c.words.length ? 'Spelling: ' + c.words.slice(0, 3).join(', ') +
              (c.words.length > 3 ? '…' : '') : 'Math homework');
            Homework.buildLesson(title, file, c.words, c.math).then(function (p) {
              App.go('mission', { day: p, station: 'homework' });
            });
          }
        }
      ]);
    }

    draw();
  }

  return {
    renderPicker: renderPicker, renderEditor: renderEditor, openPack: openPack,
    // exposed for the tests
    _showConfirm: showConfirm, _readPhoto: readPhoto
  };
})();
