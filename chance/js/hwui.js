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

  /* ============== KID SIDE: pick a worksheet ================= */
  function renderPicker(body) {
    body.innerHTML = '';
    var list = Homework.packs();

    if (!list.length) {
      var empty = el('div', 'card');
      empty.appendChild(el('div', 'big-em', '📸'));
      empty.appendChild(el('h3', null, 'No homework here yet'));
      empty.appendChild(note('Ask a grown-up to take a picture of your homework and put it in here.'));
      var r = el('div', 'row');
      r.appendChild(App.ui.btn('👨‍👩‍👦', 'Grown-ups', function () { App.go('hwedit'); }));
      empty.appendChild(r);
      body.appendChild(empty);
      return;
    }

    body.appendChild(note('Tap a worksheet to study it.'));
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

  return { renderPicker: renderPicker, renderEditor: renderEditor, openPack: openPack };
})();
