/* ============================================================
   studio.js — the recording booth

   Where a grown-up records the app's lines in their own voice.
   Designed around one honest fact: there are thousands of lines in
   60 days, and nobody is recording all of them in one sitting. So:

   - Lines are grouped by how often they are actually heard. The
     coach lines come first because they repeat on every single day
     across the whole course. Twenty minutes there changes the
     entire feel of the app.
   - The main flow is one line at a time, big text, tap to record,
     tap to stop, auto-advance. No forms, no fiddling.
   - Anything unrecorded still plays in the synthesized voice, so
     you can stop whenever and nothing breaks.
   ============================================================ */

window.Studio = (function () {

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  var state = { group: null, index: 0, lastBlob: null };

  /* --------------------------- overview --------------------------- */
  function render(body) {
    body.innerHTML = '';
    state.group = null;

    if (!Recordings.canRecord()) {
      body.appendChild(note('This browser cannot record audio. On an iPad use Safari (iOS 14.3 or newer). ' +
        'You can still record on another device and bring the file over with Import.'));
    }

    var s = Recordings.stats();
    var stats = el('div', 'stat-row');
    [[s.count, 'lines recorded'], [s.mb + ' MB', 'stored on device']].forEach(function (x) {
      var n = el('div', 'stat');
      n.appendChild(el('b', null, String(x[0])));
      n.appendChild(el('i', null, x[1]));
      stats.appendChild(n);
    });
    body.appendChild(stats);

    body.appendChild(note(
      'Record any line in your own voice and it replaces the computer voice everywhere that line is spoken. ' +
      'Anything you do not record keeps using the computer voice, so you can stop any time. ' +
      'Start with the Coach lines — he hears those on every single day.'
    ));

    var groups = Recordings.inventory();

    // the two high-value groups get big cards; the 60 days get a list
    groups.filter(function (g) { return !g.day; }).forEach(function (g) {
      body.appendChild(groupCard(body, g, true));
    });

    body.appendChild(el('div', 'week-title', 'LESSON LINES, DAY BY DAY'));
    body.appendChild(note('About 45 lines per day — roughly 4 or 5 minutes of reading each. ' +
      'Recording a week ahead on a Sunday keeps you in front of him.'));

    var list = el('div', 'day-row');
    groups.filter(function (g) { return g.day; }).forEach(function (g) {
      var p = Recordings.groupProgress(g);
      var chip = el('button', 'day-chip' + (p.done === p.total ? ' done' : (p.done ? ' today' : '')));
      chip.appendChild(el('span', 'em', g.em));
      chip.appendChild(el('span', 'n', g.name.split(':')[0]));
      chip.appendChild(el('span', 't', p.done + '/' + p.total));
      chip.addEventListener('click', function () { openGroup(body, g); });
      list.appendChild(chip);
    });
    body.appendChild(list);

    /* ------------------------ backup / move ---------------------- */
    body.appendChild(el('div', 'week-title', 'BACKUP & MOVE TO ANOTHER DEVICE'));
    var io = el('div', 'report-item');
    io.appendChild(el('b', null, 'Your recordings live on this device only'));
    io.appendChild(el('span', null,
      'Export writes every clip to one file. Keep it somewhere safe, or open the app on another iPad and Import it there.'));
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('📤', 'Export all', function () { doExport(); }));
    r.appendChild(App.ui.btn('📥', 'Import a file', function () { doImport(body); }));
    r.appendChild(App.ui.btn('🗑️', 'Delete all recordings', function () {
      if (confirm('Delete every recording? The computer voice comes back. This cannot be undone.')) {
        Recordings.clearAll().then(function () { render(body); });
      }
    }));
    io.appendChild(r);
    body.appendChild(io);
  }

  function groupCard(body, g, big) {
    var p = Recordings.groupProgress(g);
    var card = el('div', 'report-item ' + (p.done === p.total ? 'good' : ''));
    card.appendChild(el('b', null, g.em + '  ' + g.name + ' — ' + p.done + ' of ' + p.total + ' recorded'));
    if (g.blurb) card.appendChild(el('span', null, g.blurb));
    var bar = el('div', 'bar');
    bar.style.cssText = 'height:12px;background:var(--line);border-radius:99px;overflow:hidden;margin:8px 0;';
    var fill = el('span');
    fill.style.cssText = 'display:block;height:100%;width:' + p.pct + '%;background:linear-gradient(90deg,var(--leaf),var(--sun));';
    bar.appendChild(fill);
    card.appendChild(bar);
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('🎙️', p.done ? 'Continue recording' : 'Start recording', function () { openGroup(body, g); }));
    card.appendChild(r);
    return card;
  }

  /* ------------------------ the booth itself ---------------------- */
  function openGroup(body, g) {
    state.group = g;
    // resume at the first line that has no recording yet
    state.index = 0;
    for (var i = 0; i < g.lines.length; i++) {
      if (!Recordings.has(g.lines[i].text, g.lines[i].kind)) { state.index = i; break; }
    }
    booth(body);
  }

  function booth(body) {
    var g = state.group;
    if (!g) return render(body);
    if (state.index >= g.lines.length) return finished(body);

    var line = g.lines[state.index];
    var recorded = Recordings.has(line.text, line.kind);
    body.innerHTML = '';

    var head = el('div', 'bar-top');
    var back = el('button', 'icon-btn', '⬅️');
    back.addEventListener('click', function () { Recordings.cancelRecording(); render(body); });
    head.appendChild(back);
    var h = el('h2', null, g.em + ' ' + g.name);
    head.appendChild(h);
    body.appendChild(head);

    var p = Recordings.groupProgress(g);
    body.appendChild(note('Line ' + (state.index + 1) + ' of ' + g.lines.length +
      ' · ' + p.done + ' recorded so far' + (line.note ? ' · ' + line.note : '')));

    // the line, big enough to read off the screen at arm's length
    var card = el('div', 'card');
    var script = el('div', 'qtext', line.kind === 'sound'
      ? 'Say this sound: “' + line.text + '”'
      : line.text);
    script.style.fontSize = 'clamp(20px, 5.2vw, 30px)';
    card.appendChild(script);
    if (line.kind === 'sound') {
      card.appendChild(note('Stretch it out the way you would for him — “sss”, not “ess”.'));
    }
    var status = el('div', 'heard', recorded ? '✅ Already recorded in your voice.' : 'Not recorded yet — the computer voice reads this one.');
    card.appendChild(status);
    body.appendChild(card);

    var recBtn = el('button', 'mic-btn', '⏺');
    recBtn.setAttribute('aria-label', 'Record this line');
    var micRow = el('div', 'mic-row');

    var hearBtn = el('button', 'icon-btn', '🔊');
    hearBtn.setAttribute('aria-label', 'Hear the current version');
    hearBtn.addEventListener('click', function () {
      Voice.stop();
      if (line.kind === 'sound') Voice.sayPhoneme(line.text);
      else Voice.say(line.text);
    });

    var skipBtn = el('button', 'icon-btn', '⏭️');
    skipBtn.setAttribute('aria-label', 'Skip this line');
    skipBtn.addEventListener('click', function () { state.index++; booth(body); });

    micRow.appendChild(hearBtn);
    micRow.appendChild(recBtn);
    micRow.appendChild(skipBtn);
    body.appendChild(micRow);

    var busy = false;
    recBtn.addEventListener('click', function () {
      if (busy) return;
      if (!Recordings.isRecording()) {
        Voice.stop();
        busy = true;
        Recordings.startRecording().then(function () {
          busy = false;
          recBtn.textContent = '⏹';
          recBtn.classList.add('live');
          status.textContent = '🔴 Recording… tap the square when you finish.';
        }).catch(function (e) {
          busy = false;
          status.textContent = 'Could not start the microphone. ' +
            'Check Settings → Safari → Microphone, then try again.';
        });
      } else {
        busy = true;
        Recordings.stopRecording().then(function (blob) {
          recBtn.textContent = '⏺';
          recBtn.classList.remove('live');
          state.lastBlob = blob;
          return Recordings.save(line.text, line.kind, blob);
        }).then(function () {
          busy = false;
          status.textContent = '✅ Saved. Playing it back…';
          return Recordings.play(line.text, line.kind);
        }).then(function () {
          // straight on to the next line — that rhythm is what makes
          // recording forty lines bearable
          state.index++;
          booth(body);
        }).catch(function () {
          busy = false;
          status.textContent = 'That recording did not save. Try once more.';
        });
      }
    });

    var actions = [];
    if (recorded) {
      actions.push({
        label: 'Re-record', em: '🔁', cls: 'ghost', fn: function () {
          Recordings.remove(line.text, line.kind).then(function () { booth(body); });
        }
      });
    }
    actions.push({ label: 'Next line', em: '➡️', cls: 'sun', fn: function () { state.index++; booth(body); } });
    App.setActions(actions);
  }

  function finished(body) {
    var g = state.group;
    App.setActions([]);
    body.innerHTML = '';
    var card = el('div', 'card');
    card.appendChild(el('div', 'big-em', '🎙️'));
    card.appendChild(el('h3', null, 'Finished ' + g.name));
    var p = Recordings.groupProgress(g);
    card.appendChild(note(p.done + ' of ' + p.total + ' lines are now in your voice.'));
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('⬅️', 'Back to the list', function () { render(body); }));
    card.appendChild(r);
    body.appendChild(card);
  }

  /* -------------------------- export / import --------------------- */
  function doExport() {
    var s = Recordings.stats();
    if (!s.count) { alert('Nothing recorded yet.'); return; }
    Recordings.exportAll().then(function (data) {
      var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'chance-academy-voice.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    });
  }

  function doImport(body) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var json;
        try { json = JSON.parse(String(r.result)); }
        catch (e) { alert('That file could not be read.'); return; }
        Recordings.importAll(json).then(function (n) {
          alert('Imported ' + n + ' recordings.');
          render(body);
        }).catch(function (e) { alert(e.message); });
      };
      r.readAsText(f);
    });
    input.click();
  }

  function note(t) {
    var n = el('p', null, t);
    n.style.cssText = 'font-size:15px;color:var(--ink-soft);margin:8px 0;';
    return n;
  }

  return { render: render };
})();
