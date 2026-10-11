/* ============================================================
   grownup.js — the Thinking Report

   This is the part a classroom cannot give you. Every answer he
   taps is logged with the thinking error behind it, how long he
   took, and which try it was. This screen turns that log into
   plain sentences:

     "Sound on multiplication. Speed problems are the soft spot —
      he flipped the faster/slower relationship 5 times this week.
      Work on: practice 'faster means less time' with two real
      trips."

   It also holds the settings: the narration voice (soft female
   by default), his name on the reward cards, and a reset.
   ============================================================ */

window.Grownup = (function () {

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  var DOMAIN_NAMES = {
    science: 'Science reasoning',
    'time-distance-speed': 'Time, distance & speed',
    time: 'Time & clocks',
    geometry: 'Geometry & shape',
    algebra: 'Algebra & patterns',
    physics: 'Physics & forces',
    measure: 'Measuring & data',
    phonics: 'Phonics (spoken)',
    comprehension: 'Reading comprehension',
    'homework-math': 'Homework math (from school)',
    'homework-question': 'Homework questions (from school)'
  };

  function render(body) {
    body.innerHTML = '';
    var log = Progress.data.log || [];
    var firstTries = log.filter(function (e) { return e.attempt === 1; });
    var correctFirst = firstTries.filter(function (e) { return e.correct; });
    var pct = firstTries.length ? Math.round(100 * correctFirst.length / firstTries.length) : 0;
    var times = firstTries.filter(function (e) { return e.ms > 0 && e.ms < 120000; }).map(function (e) { return e.ms; });

    /* ------------------------- headline stats ------------------------ */
    var stats = el('div', 'stat-row');
    [[Progress.countDone(), 'missions finished'],
     [pct + '%', 'right on first try'],
     [(median(times) / 1000).toFixed(1) + 's', 'typical think time'],
     [Progress.data.streak.count, 'day streak'],
     [Progress.data.streak.best, 'best streak'],
     [Progress.data.totals.wordsSpoken, 'words read aloud']].forEach(function (s) {
      var n = el('div', 'stat');
      n.appendChild(el('b', null, String(s[0])));
      n.appendChild(el('i', null, s[1]));
      stats.appendChild(n);
    });
    body.appendChild(stats);

    if (!log.length) {
      body.appendChild(el('p', null, 'No sessions yet. Once Chance finishes a mission, this page fills in with what his answers reveal about how he is thinking.'));
      body.appendChild(soundBlock());
      body.appendChild(soundBlock());
    body.appendChild(homeworkBlock());
      body.appendChild(voiceBlock());
      body.appendChild(updateBlock());
      body.appendChild(settingsBlock());
      return;
    }

    /* ---------------------- thinking habits (tags) ------------------- */
    var tagCounts = {};
    log.forEach(function (e) { if (e.tag) tagCounts[e.tag] = (tagCounts[e.tag] || 0) + 1; });
    var tags = Object.keys(tagCounts).sort(function (a, b) { return tagCounts[b] - tagCounts[a]; });

    body.appendChild(el('div', 'week-title', 'WHAT HIS WRONG ANSWERS ARE TELLING US'));
    if (!tags.length) {
      body.appendChild(item('good', 'No repeated thinking errors yet', 'Every miss so far has been a one-off, not a habit.'));
    }
    tags.slice(0, 6).forEach(function (t) {
      var info = Evaluate.tagInfo(t);
      var n = tagCounts[t];
      var cls = n >= 4 ? 'watch' : '';
      body.appendChild(item(cls,
        (info ? info.label : t) + ' — ' + n + ' time' + (n > 1 ? 's' : ''),
        info ? 'Work on: ' + info.fix : ''));
    });

    /* ------------------------ behaviour signals ---------------------- */
    var flagCounts = {};
    log.forEach(function (e) {
      (e.flags || []).forEach(function (f) { flagCounts[f] = (flagCounts[f] || 0) + 1; });
    });
    var behaviourKeys = Object.keys(flagCounts).filter(function (k) { return Evaluate.BEHAVIOR[k]; });
    if (behaviourKeys.length) {
      body.appendChild(el('div', 'week-title', 'HOW HE IS WORKING'));
      behaviourKeys.sort(function (a, b) { return flagCounts[b] - flagCounts[a]; }).forEach(function (k) {
        var info = Evaluate.BEHAVIOR[k];
        body.appendChild(item(flagCounts[k] >= 4 ? 'watch' : '',
          info.label + ' — ' + flagCounts[k] + ' time' + (flagCounts[k] > 1 ? 's' : ''),
          'What to do: ' + info.fix));
      });
    }

    /* -------------------------- by subject --------------------------- */
    body.appendChild(el('div', 'week-title', 'BY SUBJECT (first-try accuracy)'));
    var byDomain = {};
    firstTries.forEach(function (e) {
      var d = byDomain[e.domain] = byDomain[e.domain] || { n: 0, ok: 0, ms: [] };
      d.n++; if (e.correct) d.ok++; if (e.ms) d.ms.push(e.ms);
    });
    var tbl = el('table', 'tbl');
    var thead = el('tr');
    ['Subject', 'Items', 'First try', 'Think time'].forEach(function (h) { thead.appendChild(el('th', null, h)); });
    tbl.appendChild(thead);
    Object.keys(byDomain).sort(function (a, b) {
      return (byDomain[a].ok / byDomain[a].n) - (byDomain[b].ok / byDomain[b].n);
    }).forEach(function (d) {
      var x = byDomain[d];
      var tr = el('tr');
      tr.appendChild(el('td', null, DOMAIN_NAMES[d] || d));
      tr.appendChild(el('td', null, String(x.n)));
      tr.appendChild(el('td', null, Math.round(100 * x.ok / x.n) + '%'));
      tr.appendChild(el('td', null, (median(x.ms) / 1000).toFixed(1) + 's'));
      tbl.appendChild(tr);
    });
    body.appendChild(tbl);

    /* --------------------- words that need practice ------------------ */
    var wordTrouble = {};
    log.filter(function (e) { return e.station === 'reading' && e.domain === 'phonics' && !e.correct; })
      .forEach(function (e) {
        var id = e.itemId;
        wordTrouble[id] = (wordTrouble[id] || 0) + 1;
      });
    var troubled = Object.keys(wordTrouble).filter(function (k) { return wordTrouble[k] >= 2; });
    if (troubled.length) {
      body.appendChild(el('div', 'week-title', 'WORDS TO PRACTICE OUT LOUD'));
      var list = troubled.map(function (id) {
        var w = lookupWord(id);
        return w ? w.w + ' (' + w.parts.join('-') + ')' : id;
      });
      body.appendChild(item('', list.join(', '), 'These needed more than one try. The Word Wall tile replays each one, sound by sound.'));
    }

    /* --------------------------- last 7 days ------------------------- */
    body.appendChild(el('div', 'week-title', 'LAST 7 DAYS'));
    var days = {};
    Object.keys(Progress.data.days).forEach(function (id) {
      var rec = Progress.data.days[id];
      if (rec.done && rec.date) days[rec.date] = (days[rec.date] || 0) + 1;
    });
    var row = el('div', 'day-row');
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(); dt.setDate(dt.getDate() - i);
      var key = dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
      var chip = el('div', 'day-chip' + (days[key] ? ' done' : ''));
      chip.appendChild(el('span', 'em', days[key] ? '⭐' : '·'));
      chip.appendChild(el('span', 'n', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()]));
      chip.appendChild(el('span', 't', days[key] ? days[key] + ' mission' + (days[key] > 1 ? 's' : '') : '—'));
      row.appendChild(chip);
    }
    body.appendChild(row);

    /* ---------------------------- talk to him ----------------------- */
    body.appendChild(el('div', 'week-title', 'ONE THING TO ASK HIM AT DINNER'));
    var lastDay = lastFinishedDay();
    body.appendChild(item('good',
      lastDay ? lastDay.title : 'Ask him what he figured out today',
      lastDay ? lastDay.discover.check.q + '  (Answer: ' + correctText(lastDay.discover.check) + ')' : ''));

    body.appendChild(copyBlock(pct, tags, tagCounts, byDomain));
    body.appendChild(homeworkBlock());
    body.appendChild(voiceBlock());
    body.appendChild(updateBlock());
    body.appendChild(settingsBlock());
  }

  /* --------------------------- helpers ---------------------------- */
  function item(cls, title, sub) {
    var n = el('div', 'report-item ' + (cls || ''));
    n.appendChild(el('b', null, title));
    if (sub) n.appendChild(el('span', null, sub));
    return n;
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function median(a) {
    if (!a || !a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  }
  function correctText(check) {
    var c = check.choices.filter(function (x) { return x.correct; })[0];
    return c ? c.t : '';
  }
  function lastFinishedDay() {
    var best = null, bestDate = '';
    Object.keys(Progress.data.days).forEach(function (id) {
      var rec = Progress.data.days[id];
      if (rec.done && rec.date >= bestDate) { bestDate = rec.date; best = Curriculum.day(id); }
    });
    return best;
  }
  function lookupWord(itemId) {
    // itemId looks like d07-w2
    var m = /^(d\d+)-w(\d+)$/.exec(itemId || '');
    if (!m) return null;
    var d = Curriculum.day(m[1]);
    return d && d.reading ? d.reading.words[+m[2]] : null;
  }

  /* Plain-text summary a grandparent can text to a parent or teacher. */
  function copyBlock(pct, tags, tagCounts, byDomain) {
    var wrap = el('div', 'report-item');
    wrap.appendChild(el('b', null, 'Send this summary to a parent or teacher'));
    var lines = [
      Progress.data.name + ' — Chance Academy progress (' + Progress.today() + ')',
      'Missions finished: ' + Progress.countDone() + ' of ' + Curriculum.count,
      'First-try accuracy: ' + pct + '%   Streak: ' + Progress.data.streak.count +
        (Progress.data.streak.count === 1 ? ' day' : ' days'),
      'Words read aloud: ' + Progress.data.totals.wordsSpoken
    ];
    var weakest = Object.keys(byDomain).sort(function (a, b) {
      return (byDomain[a].ok / byDomain[a].n) - (byDomain[b].ok / byDomain[b].n);
    })[0];
    if (weakest) lines.push('Weakest subject right now: ' + (DOMAIN_NAMES[weakest] || weakest) +
      ' (' + Math.round(100 * byDomain[weakest].ok / byDomain[weakest].n) + '% first try)');
    if (tags.length) {
      var info = Evaluate.tagInfo(tags[0]);
      lines.push('Most common thinking error: ' + (info ? info.label : tags[0]) + ' (' + tagCounts[tags[0]] + 'x)');
      if (info) lines.push('Suggested practice: ' + info.fix);
    }
    var text = lines.join('\n');
    var pre = el('span', null, text);
    pre.style.whiteSpace = 'pre-wrap';
    wrap.appendChild(pre);
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('📋', 'Copy', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text);
    }));
    r.appendChild(App.ui.btn('✉️', 'Email', function () {
      location.href = 'mailto:?subject=' + encodeURIComponent(Progress.data.name + ' — Chance Academy progress') +
        '&body=' + encodeURIComponent(text);
    }));
    r.appendChild(App.ui.btn('💬', 'Text', function () {
      var ios = /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent);
      location.href = 'sms:' + (ios ? '&' : '?') + 'body=' + encodeURIComponent(text);
    }));
    wrap.appendChild(r);
    return wrap;
  }

  /* --------------------- record it in your own voice --------------- */
  function voiceBlock() {
    var s = Recordings.stats();
    var wrap = el('div', 'report-item ' + (s.count ? 'good' : ''));
    wrap.appendChild(el('b', null, '🎙️  Use your own voice instead of the computer'));
    wrap.appendChild(el('span', null, s.count
      ? s.count + (s.count === 1 ? ' line is' : ' lines are') + ' recorded in your voice (' +
        s.mb + ' MB). Everything else still uses the computer voice.'
      : 'Record the app\'s lines yourself and they replace the computer voice everywhere. ' +
        'Start with the coach lines — about 20 minutes, and they repeat on every single day of the course.'));
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('🎙️', s.count ? 'Record more lines' : 'Start recording', function () {
      App.go('studio');
    }));
    wrap.appendChild(r);
    return wrap;
  }

  /* --------------------------- no sound? -------------------------- */
  /* Silence is the worst failure this app can have — every lesson is
     read aloud — and from the outside every cause looks the same. So
     this does the repair, then says what it can see, then lists the
     iPad settings the app has no way to see or change. */
  function soundBlock() {
    var wrap = el('div', 'report-item');
    wrap.appendChild(el('b', null, '🔈  No sound?'));
    var status = el('span', null, 'Tap Fix the sound. It wakes the voice back up and says a test sentence.');
    wrap.appendChild(status);

    var r = el('div', 'row');
    r.appendChild(App.ui.btn('🔧', 'Fix the sound', function () {
      Voice.repair();
      status.textContent = 'Listening for the test sentence…';
      Voice.say('Hi Chance. If you can hear me, the sound is working.').then(function () {
        var d = Voice.diagnose();
        var lines = [];
        if (!d.available) {
          lines.push('This browser has no voice at all. Open the app in Safari.');
        } else {
          lines.push('Voice: ' + d.voice + (d.voices ? '' : ' (no voices loaded yet — try again in a moment)') + '.');
          if (d.paused) lines.push('The voice was paused by the iPad; it has been told to resume.');
          if (d.stalls) lines.push('The voice engine is stuck. Close the app fully and reopen it (swipe up from the bottom, then swipe the app away).');
          lines.push('If you heard the sentence, you are done. If not, check the list below.');
        }
        status.textContent = lines.join(' ');
      });
    }));
    wrap.appendChild(r);

    var list = el('div');
    list.style.cssText = 'font-size:15px;color:var(--ink-soft);margin-top:8px;line-height:1.6;';
    [
      '🔔 Silent mode: swipe down from the top-right corner. If the bell is crossed out, tap it. The voice obeys silent mode even when videos still play.',
      '🔊 Volume: press the volume-up button on the side of the iPad while the app is open.',
      '🎧 Headphones: if Bluetooth headphones are connected, the sound may be going to them.',
      '🔄 Still nothing: swipe up from the bottom, swipe the app away, and open it again.'
    ].forEach(function (t) { list.appendChild(el('div', null, t)); });
    wrap.appendChild(list);
    return wrap;
  }

  /* ------------------- photograph his real homework --------------- */
  function homeworkBlock() {
    var s = Homework.stats();
    var wrap = el('div', 'report-item ' + (s.packs ? 'good' : ''));
    wrap.appendChild(el('b', null, '📸  Homework from school'));
    wrap.appendChild(el('span', null, s.packs
      ? s.packs + ' worksheet' + (s.packs === 1 ? '' : 's') + ' · ' + s.photos + ' photo' +
        (s.photos === 1 ? '' : 's') + ' · ' + s.items + ' question' + (s.items === 1 ? '' : 's')
      : 'Photograph the worksheet that came home, type the problems off it, and he studies them ' +
        'with the same coaching and the same report as the course.'));
    var r = el('div', 'row');
    r.appendChild(App.ui.btn('📷', s.packs ? 'Add or edit homework' : 'Add homework', function () {
      App.go('hwedit');
    }));
    wrap.appendChild(r);
    return wrap;
  }

  /* --------------------- update the app itself -------------------- */
  function updateBlock() {
    var cur = Updater.current();
    var wrap = el('div', 'report-item');
    wrap.appendChild(el('b', null, '⬆️  Update the app'));
    var status = el('span', null, 'Version ' + cur.version + ', built ' + cur.built +
      '. The app keeps itself cached so it works with no signal, which also means a new ' +
      'version has to be fetched on purpose.');
    wrap.appendChild(status);

    var r = el('div', 'row');
    r.appendChild(App.ui.btn('🔄', 'Check for an update', function () {
      status.textContent = 'Checking…';
      Updater.check().then(function (res) {
        if (!res.ok) {
          status.textContent = res.reason === 'offline'
            ? 'No connection right now. Try again when you are back on wi-fi.'
            : 'Could not reach the server. The app still works — try again later.';
          return;
        }
        if (!res.newer) {
          status.textContent = 'You already have the newest version (' + cur.version + '). Nothing to do.';
          return;
        }
        status.textContent = 'Version ' + res.latest + ' is available' +
          (res.notes ? ' — ' + res.notes : '') + '.';
        App.sheet([
          App.ui.big('⬆️'),
          App.ui.h3('Update to ' + res.latest + '?'),
          App.ui.p(res.notes || 'A newer version of the app is ready.'),
          App.ui.p('His stars, badges, recordings and homework are all kept.'),
          App.ui.row([
            App.ui.btn('⬆️', 'Update now', function () {
              var step = App.ui.p('Starting…');
              App.sheet([App.ui.big('⏳'), App.ui.h3('Updating'), step]);
              Updater.install(function (msg) { step.textContent = msg; });
            }),
            App.ui.btn('✖️', 'Not now', function () { App.closeSheet(); })
          ])
        ]);
      });
    }));
    r.appendChild(App.ui.btn('🧹', 'Force a fresh copy', function () {
      if (!confirm('Throw away the cached app and reload from the server?\n\n' +
                   'Stars, badges, recordings and homework are all kept.')) return;
      Updater.install(function () {});
    }));
    wrap.appendChild(r);
    return wrap;
  }

  /* ---------------------------- settings -------------------------- */
  function settingsBlock() {
    var wrap = el('div', 'report-item');
    wrap.appendChild(el('b', null, 'Settings'));

    // name
    var nameField = el('label', 'field', 'Name on the reward cards');
    var nameInput = el('input');
    nameInput.type = 'text';
    nameInput.value = Progress.data.name;
    nameInput.addEventListener('change', function () { Progress.setName(nameInput.value.trim()); });
    nameField.appendChild(nameInput);
    wrap.appendChild(nameField);

    // reading level
    var lField = el('label', 'field', 'Reading level for the Read & Say words');
    var lvl = el('select');
    [[2, 'Grade 2 — two-syllable words, vowel teams, prefixes and suffixes'],
     [1, 'Grade 1 — short words, one sound at a time']].forEach(function (o) {
      var op = el('option', null, o[1]);
      op.value = String(o[0]);
      if (Curriculum.readingLevel() === o[0]) op.selected = true;
      lvl.appendChild(op);
    });
    lvl.addEventListener('change', function () {
      Curriculum.setReadingLevel(parseInt(lvl.value, 10));
      Voice.say(Curriculum.readingLevel() === 2
        ? 'Reading words set to second grade.'
        : 'Reading words set to first grade.');
    });
    lField.appendChild(lvl);
    wrap.appendChild(lField);

    // voice
    var vField = el('label', 'field', 'Computer voice — used only for lines you have not recorded yourself');
    var sel = el('select');
    var auto = el('option', null, 'Automatic — currently ' + Voice.currentVoiceName());
    auto.value = '';
    sel.appendChild(auto);
    Voice.listVoices().forEach(function (v) {
      var o = el('option', null, v.name + ' (' + v.lang + ')');
      o.value = v.name;
      if (Voice.settings.voiceName === v.name) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      Voice.update({ voiceName: sel.value || null });
      Voice.say('Hi Chance. This is my voice. Ready to learn something today?');
    });
    vField.appendChild(sel);
    wrap.appendChild(vField);

    // speed
    var sField = el('label', 'field', 'Speaking speed');
    var speed = el('select');
    [['0.7', 'Very slow'], ['0.82', 'Slow (recommended for reading)'], ['0.95', 'Normal'], ['1.1', 'Quick']]
      .forEach(function (o) {
        var op = el('option', null, o[1]);
        op.value = o[0];
        if (Math.abs(Voice.settings.rate - parseFloat(o[0])) < 0.02) op.selected = true;
        speed.appendChild(op);
      });
    speed.addEventListener('change', function () {
      Voice.update({ rate: parseFloat(speed.value) });
      Voice.say('This is how fast I will read to him.');
    });
    sField.appendChild(speed);
    wrap.appendChild(sField);

    var r = el('div', 'row');
    r.appendChild(App.ui.btn('🔊', 'Test the voice', function () {
      Voice.stop();
      Voice.say('Hi Chance! The Moon is a whole round ball, even when it looks like a sliver.');
    }));
    r.appendChild(App.ui.btn('🎤', 'Check the microphone', function () {
      if (!Voice.canListen()) { alert('This browser cannot listen. Safari on iPad works; the app still reads everything out loud without it.'); return; }
      Voice.say('Say the word: salamander.').then(function () {
        return Voice.listen({ ms: 6000 });
      }).then(function (res) {
        alert(res.transcript ? 'Heard: "' + res.transcript + '" — microphone is working.' : 'Nothing heard. Check Settings → Safari → Microphone.');
      });
    }));
    r.appendChild(App.ui.btn('♻️', 'Reset all progress', function () {
      if (confirm('Erase all stars, badges and reports for ' + Progress.data.name + '? This cannot be undone.')) {
        Progress.reset();
        App.go('home');
      }
    }));
    wrap.appendChild(r);

    var note = el('span', null,
      'Everything is stored on this iPad only — no account, no upload, nothing leaves the device unless you tap Share. ' +
      'Curriculum: ' + Curriculum.count + ' mission days across 3 units.');
    wrap.appendChild(note);
    return wrap;
  }

  return { render: render };
})();
