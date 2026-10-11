/* ============================================================
   stations.js — the three stops in every mission

   🔭 discover : narrated science idea + one reasoning check
   🔢 numbers  : three real-world problems
   📖 reading  : phonics words said out loud, a sentence, and a
                 comprehension question about the science

   House rules, enforced here in code:
   - Every question's choices are SHUFFLED. The correct answer is
     written first in the data files, and a kid will spot that
     inside a week.
   - A wrong answer is never a dead end and never says "wrong".
     The owl coaches with a line aimed at that specific thinking
     error, and he tries again.
   - Third miss gets a scaffold: two choices fade out and the
     reasoning is walked through, then he still taps the answer
     himself so his hand ends on the right one.
   - Nothing is timed on screen. The evaluator times him quietly
     to spot guessing, but a clock would just add stress.
   ============================================================ */

window.Stations = (function () {

  var stage, current = null;

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ------------------------------------------------------------
     ask() — one multiple-choice item, start to finish.
     Resolves when he has landed on the correct answer.
     ------------------------------------------------------------ */
  function ask(item, meta) {
    return new Promise(function (resolve) {
      var card = el('div', 'card');

      if (item.story) {
        var s = el('div', 'story', item.story);
        card.appendChild(s);
      }
      var q = el('div', 'qtext', item.q);
      card.appendChild(q);

      var wrap = el('div', 'choices');
      var order = shuffle(item.choices);
      var buttons = [];
      var attempt = 0;
      var t0 = Date.now();
      var solved = false;

      order.forEach(function (ch) {
        var b = el('button', 'choice');
        b.appendChild(el('span', 'pick', '○'));
        b.appendChild(el('span', 'txt', ch.t));
        b.addEventListener('click', function () { pick(ch, b); });
        wrap.appendChild(b);
        buttons.push({ b: b, ch: ch });
      });
      card.appendChild(wrap);
      stage.appendChild(card);

      // read the whole item aloud, then let him answer. meta.spoken
      // lets a caller supply a say-able version — "7 times 8" reads
      // properly where the written "7 × 8" would not.
      var spoken = [item.story, meta.spoken || item.q].filter(Boolean).concat(order.map(function (c, i) {
        return (i + 1) + '. ' + c.t;
      }));
      App.setReplay(function () { Voice.stop(); Voice.sayLines(spoken); });
      Voice.sayLines(spoken).then(function () { t0 = Date.now(); });

      function pick(ch, btn) {
        if (solved) return;
        attempt++;
        var ms = Date.now() - t0;
        Voice.stop();

        var v = Evaluate.judge({
          itemId: meta.itemId, station: meta.station, domain: meta.domain,
          dayId: meta.dayId, choice: ch, attempt: attempt, ms: ms, item: item
        });
        App.setThinkMeter(v.focus);

        if (v.correct) {
          solved = true;
          btn.classList.add('right');
          btn.querySelector('.pick').textContent = '⭐';
          buttons.forEach(function (o) { o.b.disabled = true; if (o.b !== btn) o.b.classList.add('faded'); });
          App.showCoach(v.speak, 'good');
          App.burst(6);

          if (item.show) {
            var sw = el('div', 'showwork');
            sw.appendChild(el('b', null, 'HOW IT WORKS'));
            sw.appendChild(el('span', null, item.show));
            card.appendChild(sw);
            Voice.say(v.speak).then(function () { return Voice.say(item.show); });
          } else {
            Voice.say(v.speak);
          }
          App.setActions([{ label: 'Next', em: '➡️', cls: '', fn: function () { App.hideCoach(); resolve(); } }]);
          return;
        }

        // --- not correct: coach, keep going
        btn.classList.add('rethink');
        btn.querySelector('.pick').textContent = '🤔';
        App.showCoach(v.speak, v.tone);
        Voice.say(v.speak);

        if (v.eliminate) {
          // fade two wrong ones so only the answer and one distractor remain
          var wrongs = buttons.filter(function (o) { return !o.ch.correct && o.b !== btn; });
          shuffle(wrongs).slice(0, Math.max(0, wrongs.length - 1)).forEach(function (o) {
            o.b.classList.add('faded'); o.b.disabled = true;
          });
        }
        if (v.reveal) {
          var right = buttons.filter(function (o) { return o.ch.correct; })[0];
          if (right) {
            right.b.classList.add('right');
            right.b.querySelector('.pick').textContent = '👉';
            buttons.forEach(function (o) { if (!o.ch.correct) { o.b.disabled = true; o.b.classList.add('faded'); } });
            Voice.say(Phrases.tapTheAnswer);
          }
        }
        t0 = Date.now();
      }
    });
  }

  /* ------------------------------------------------------------
     🔭 DISCOVER
     ------------------------------------------------------------ */
  function discover(day) {
    var d = day.discover;
    stage.innerHTML = '';
    App.setPips(0, 2);

    var card = el('div', 'card');
    var head = el('div', 'card-head');
    head.appendChild(el('span', 'em', day.icon));
    var ht = el('div');
    ht.appendChild(el('span', 'tag', 'SCIENCE · ' + day.weekTitle.toUpperCase()));
    ht.appendChild(el('h3', null, day.title));
    head.appendChild(ht);
    card.appendChild(head);

    var lines = el('div', 'lines');
    var ps = d.intro.map(function (t) { var p = el('p', null, t); lines.appendChild(p); return p; });
    card.appendChild(lines);

    if (d.word) {
      var bw = el('div', 'bigword');
      bw.appendChild(el('span', 'em', '💬'));
      var box = el('div');
      box.appendChild(el('div', 'w', d.word.w));
      box.appendChild(el('div', 'say', d.word.say));
      box.appendChild(el('div', 'mean', d.word.mean));
      bw.appendChild(box);
      var sp = el('button', 'icon-btn', '🔊');
      sp.addEventListener('click', function () {
        Voice.stop();
        Voice.say(d.word.w + '. ' + d.word.say + '. It means ' + d.word.mean + '.');
      });
      bw.appendChild(sp);
      card.appendChild(bw);
    }
    stage.appendChild(card);

    function readAll() {
      Voice.stop();
      return Voice.sayLines(d.intro, function (i) {
        ps.forEach(function (p, k) { p.classList.toggle('said', k === i); });
      }).then(function () {
        if (d.word) return Voice.say('Big word: ' + d.word.w + '. ' + d.word.mean + '.');
      });
    }
    App.setReplay(readAll);
    readAll();

    App.setActions([{
      label: 'Question time', em: '🤔', cls: 'sun', fn: function () {
        Voice.stop();
        App.setPips(1, 2);
        stage.innerHTML = '';
        var t = el('div', 'card-head');
        t.appendChild(el('span', 'em', '🤔'));
        var th = el('div');
        th.appendChild(el('span', 'tag', 'THINK IT THROUGH'));
        th.appendChild(el('h3', null, day.title));
        t.appendChild(th);
        stage.appendChild(t);
        App.setActions([]);
        ask(d.check, { itemId: day.id + '-check', station: 'discover', domain: 'science', dayId: day.id })
          .then(function () { App.setPips(2, 2); finish(day, 'discover'); });
      }
    }]);
  }

  /* ------------------------------------------------------------
     🔢 NUMBERS
     ------------------------------------------------------------ */
  function numbers(day) {
    var probs = day.numbers.problems;
    var i = 0;
    stage.innerHTML = '';

    function nextProblem() {
      App.setPips(i, probs.length);
      stage.innerHTML = '';
      var head = el('div', 'card-head');
      head.appendChild(el('span', 'em', '🔢'));
      var ht = el('div');
      ht.appendChild(el('span', 'tag', 'NUMBERS · PROBLEM ' + (i + 1) + ' OF ' + probs.length));
      ht.appendChild(el('h3', null, day.title));
      head.appendChild(ht);
      stage.appendChild(head);
      App.setActions([]);

      ask(probs[i], {
        itemId: day.id + '-n' + i, station: 'numbers',
        domain: day.numbers.domain, dayId: day.id
      }).then(function () {
        i++;
        App.setPips(i, probs.length);
        if (i < probs.length) nextProblem();
        else finish(day, 'numbers');
      });
    }
    nextProblem();
  }

  /* ------------------------------------------------------------
     📖 READ & SAY  (phonics, out loud, with the microphone)
     ------------------------------------------------------------ */
  /* ------------------------------------------------------------
     wordCard() — one phonics word: tappable chunks, 🔊 hear it,
     🐢 sound it out, 🎤 say it into the microphone.

     Shared by the Read & Say station and by homework spelling
     words, so a word photographed off a worksheet behaves exactly
     like a word from the course: same chunking, same anchored
     sounds, same pronunciation scoring, same owl.
     ------------------------------------------------------------ */
  function wordCard(o) {
    stage.innerHTML = '';

    var card = el('div', 'card');
    var head = el('div', 'card-head');
    head.appendChild(el('span', 'em', '📖'));
    var ht = el('div');
    ht.appendChild(el('span', 'tag', o.tag || 'READ & SAY'));
    ht.appendChild(el('h3', null, o.title || 'Say the word'));
    head.appendChild(ht);
    card.appendChild(head);

    var hero = el('div', 'word-hero');
    var wordRow = el('div', 'word');
    var chunkEls = o.parts.map(function (p, idx) {
      var c = el('span', 'chunk', p);
      c.addEventListener('click', function () {
        Voice.stop();
        light(idx);
        // "f, like in fan" — or Grandpa's recorded /f/ if it exists
        Voice.sayChunk(p, o.word, idx).then(function () { light(-1); });
      });
      wordRow.appendChild(c);
      return c;
    });
    hero.appendChild(wordRow);
    if (o.mean) hero.appendChild(el('div', 'say', o.mean));
    card.appendChild(hero);

    function light(k) {
      chunkEls.forEach(function (c, idx) { c.classList.toggle('lit', idx === k); });
    }

    var micRow = el('div', 'mic-row');
    var hearBtn = el('button', 'icon-btn', '🔊');
    hearBtn.setAttribute('aria-label', 'Hear the word');
    var slowBtn = el('button', 'icon-btn', '🐢');
    slowBtn.setAttribute('aria-label', 'Sound it out slowly');
    var mic = el('button', 'mic-btn', '🎤');
    mic.setAttribute('aria-label', 'Say the word');
    micRow.appendChild(hearBtn);
    micRow.appendChild(mic);
    micRow.appendChild(slowBtn);
    card.appendChild(micRow);

    var heard = el('div', 'heard', Voice.canListen()
      ? 'Tap the microphone and say the word.'
      : 'Tap 🐢 to hear the sounds, then say it out loud.');
    card.appendChild(heard);
    stage.appendChild(card);

    function sayWord() { Voice.stop(); return Voice.say(o.word, { rate: 0.72 }); }
    function soundOut() { Voice.stop(); return Voice.soundOut(o.word, o.parts, light); }
    hearBtn.addEventListener('click', sayWord);
    slowBtn.addEventListener('click', soundOut);
    App.setReplay(soundOut);

    var attempt = 0;
    mic.addEventListener('click', function () {
      if (!Voice.canListen()) {
        soundOut().then(function () {
          heard.innerHTML = 'Now you say it out loud, then tap <b>I said it</b>.';
        });
        return;
      }
      Voice.stop();
      attempt++;
      mic.classList.add('live');
      heard.textContent = 'Listening…';
      var t0 = Date.now();
      Voice.listen({
        ms: 5000,
        onInterim: function (txt) { heard.innerHTML = 'I hear: <b>' + txt + '</b>'; }
      }).then(function (res) {
        mic.classList.remove('live');
        if (res.reason === 'denied' || res.reason === 'unsupported') {
          heard.textContent = 'Microphone is off. Tap 🐢 and say it out loud instead.';
          return;
        }
        var conf = Voice.match(o.word, res.transcript, res.alternatives);
        var v = Evaluate.judgeSpoken({
          word: o.word, parts: o.parts, confidence: conf, attempt: attempt,
          heard: res.transcript, ms: Date.now() - t0, itemId: o.itemId
        });
        App.setThinkMeter(v.focus);
        App.showCoach(v.speak, v.tone);

        if (v.correct) {
          heard.innerHTML = '✅ <b>' + o.word + '</b> — that is it!';
          chunkEls.forEach(function (c) { c.classList.add('lit'); });
          App.burst(5);
          Voice.say(v.speak).then(function () { App.hideCoach(); o.onDone(); });
        } else {
          heard.innerHTML = res.transcript ? 'I heard: <b>' + res.transcript + '</b>' : 'I did not catch that.';
          Voice.say(v.speak).then(function () {
            if (attempt >= 2) return soundOut();
          }).then(function () {
            if (attempt >= 3) {
              heard.innerHTML = 'Good trying. Tap <b>Next</b> — we will practice this one again.';
              App.setActions([
                { label: 'Try again', em: '🎤', cls: 'ghost', fn: function () { mic.click(); } },
                { label: 'Next word', em: '➡️', cls: '', fn: function () { App.hideCoach(); o.onDone(); } }
              ]);
            }
          });
        }
      });
    });

    /* "I said it" is the honour-system path: it exists so a dead
       microphone, a noisy room or a shy morning never blocks the
       lesson. It still credits the word so the Word Sayer badge is
       reachable without the mic, but it is logged as self-reported
       so the grown-up report does not mistake it for a checked
       pronunciation. */
    App.setActions([
      {
        label: 'I said it', em: '👍', cls: 'sun', fn: function () {
          if (attempt === 0 && !Progress.stationDone(o.dayId, o.station)) {
            Progress.logEvent({
              t: Date.now(), dayId: o.dayId, itemId: o.itemId,
              station: o.station, domain: 'phonics', correct: true,
              attempt: 1, ms: 0, flags: ['self-reported']
            });
          }
          App.hideCoach();
          o.onDone();
        }
      }
    ]);

    soundOut();
  }

  function reading(day) {
    var r = day.reading;
    var wi = 0;
    stage.innerHTML = '';

    function wordStep() {
      App.setPips(wi, r.words.length + 2);
      var word = r.words[wi];
      wordCard({
        word: word.w, parts: word.parts, mean: word.mean,
        tag: 'READ & SAY · ' + (day.phonicsFocus || '').toUpperCase(),
        title: 'Word ' + (wi + 1) + ' of ' + r.words.length,
        itemId: day.id + '-w' + wi, dayId: day.id, station: 'reading',
        onDone: function () {
          wi++;
          if (wi < r.words.length) wordStep();
          else sentenceStep();
        }
      });
    }

    /* the sentence: science vocabulary in a real sentence */
    function sentenceStep() {
      App.setPips(r.words.length, r.words.length + 2);
      stage.innerHTML = '';
      var card = el('div', 'card');
      var head = el('div', 'card-head');
      head.appendChild(el('span', 'em', '📚'));
      var ht = el('div');
      ht.appendChild(el('span', 'tag', 'READ THE SENTENCE'));
      ht.appendChild(el('h3', null, 'Point and read'));
      head.appendChild(ht);
      card.appendChild(head);

      var sent = el('div', 'sentence');
      var tokens = r.sentence.split(' ');
      var spans = tokens.map(function (w, i) {
        var s = el('span', null, w);
        s.addEventListener('click', function () {
          Voice.stop();
          spans.forEach(function (x) { x.classList.remove('lit'); });
          s.classList.add('lit');
          Voice.say(w.replace(/[^A-Za-z'-]/g, ''), { rate: 0.65 })
            .then(function () { s.classList.remove('lit'); });
        });
        sent.appendChild(s);
        if (i < tokens.length - 1) sent.appendChild(document.createTextNode(' '));
        return s;
      });
      card.appendChild(sent);
      card.appendChild(el('div', 'heard', 'Tap any word to hear just that word.'));
      stage.appendChild(card);

      function readSentence() {
        Voice.stop();
        var p = Promise.resolve();
        spans.forEach(function (s, i) {
          p = p.then(function () {
            spans.forEach(function (x) { x.classList.remove('lit'); });
            s.classList.add('lit');
            return Voice.say(tokens[i].replace(/[^A-Za-z'-]/g, ''), { rate: 0.8 });
          });
        });
        return p.then(function () {
          spans.forEach(function (x) { x.classList.remove('lit'); });
          return Voice.say(r.sentence, { rate: 0.85 });
        });
      }
      App.setReplay(readSentence);
      readSentence();

      App.setActions([
        { label: 'Hear it again', em: '🔊', cls: 'ghost', fn: readSentence },
        { label: 'I read it', em: '➡️', cls: '', fn: function () { Voice.stop(); compStep(); } }
      ]);
    }

    function compStep() {
      App.setPips(r.words.length + 1, r.words.length + 2);
      stage.innerHTML = '';
      var head = el('div', 'card-head');
      head.appendChild(el('span', 'em', '🧠'));
      var ht = el('div');
      ht.appendChild(el('span', 'tag', 'WHAT DID IT MEAN?'));
      ht.appendChild(el('h3', null, day.title));
      head.appendChild(ht);
      stage.appendChild(head);
      var box = el('div', 'story', r.sentence);
      stage.appendChild(box);
      App.setActions([]);
      ask(r.comp, { itemId: day.id + '-comp', station: 'reading', domain: 'comprehension', dayId: day.id })
        .then(function () {
          App.setPips(r.words.length + 2, r.words.length + 2);
          finish(day, 'reading');
        });
    }

    wordStep();
  }

  /* ------------------------------------------------------------
     📸 HOMEWORK — his real worksheet, photographed

     The photo sits at the top the whole time so he can look back at
     the actual problem, and the practice items run through the same
     ask() machinery as the course: shuffled choices, tagged wrong
     answers, the owl, the scaffold on a third miss. Spelling words
     go through the same wordCard as Read & Say.
     ------------------------------------------------------------ */
  function homework(pack) {
    var items = (pack.items || []).slice();
    var i = 0;

    /* The container goes in synchronously and fills in when the blob
       loads — otherwise the question card, which is appended right
       after this returns, ends up above the worksheet it is about. */
    function showPhotos(container) {
      var ids = pack.photoIds || [];
      if (!ids.length) return;
      var holder = el('div', 'hw-photos');
      container.appendChild(holder);
      ids.forEach(function (pid) {
        var fig = el('div', 'hw-photo');
        holder.appendChild(fig);
        Homework.photo(pid).then(function (rec) {
          if (!rec) return;
          var url = URL.createObjectURL(rec.blob);
          var img = document.createElement('img');
          img.src = url;
          img.alt = 'Homework photo';
          img.addEventListener('click', function () { App.showPhoto(url); });
          fig.appendChild(img);
          fig.appendChild(el('div', 'hw-tap', 'Tap the picture to make it big'));
        });
      });
    }

    /* No items yet: the photo on its own is still worth something —
       he reads the worksheet, does it on paper, and taps done. */
    function lookAndDo() {
      stage.innerHTML = '';
      var card = el('div', 'card');
      var head = el('div', 'card-head');
      head.appendChild(el('span', 'em', '📸'));
      var ht = el('div');
      ht.appendChild(el('span', 'tag', 'HOMEWORK'));
      ht.appendChild(el('h3', null, pack.title));
      head.appendChild(ht);
      card.appendChild(head);
      showPhotos(card);
      card.appendChild(el('div', 'heard', 'Do it on paper, then tap the button.'));
      stage.appendChild(card);
      App.setPips(0, 1);
      App.setReplay(function () { Voice.say('Here is your homework. ' + pack.title + '.'); });
      Voice.say('Here is your homework. Do it on paper, then tap the button.');
      App.setActions([{
        label: 'I finished it', em: '✅', cls: 'sun', fn: function () {
          App.setPips(1, 1);
          finishHomework(pack);
        }
      }]);
    }

    function nextItem() {
      if (i >= items.length) return finishHomework(pack);
      App.setPips(i, items.length);
      var item = items[i];
      stage.innerHTML = '';

      var head = el('div', 'card-head');
      head.appendChild(el('span', 'em', '📸'));
      var ht = el('div');
      ht.appendChild(el('span', 'tag', 'HOMEWORK · ' + (i + 1) + ' OF ' + items.length));
      ht.appendChild(el('h3', null, pack.title));
      head.appendChild(ht);
      stage.appendChild(head);

      showPhotos(stage);   // the worksheet stays up, every question

      App.setActions([]);

      if (item.kind === 'word') {
        wordCard({
          word: item.word, parts: item.parts,
          tag: 'HOMEWORK SPELLING · ' + (i + 1) + ' OF ' + items.length,
          title: 'Say the word',
          itemId: pack.id + '-' + item.id, dayId: pack.id, station: 'homework',
          onDone: function () { i++; nextItem(); }
        });
        return;
      }

      ask(item, {
        itemId: pack.id + '-' + item.id,
        station: 'homework',
        domain: item.kind === 'math' ? 'homework-math' : 'homework-question',
        dayId: pack.id,
        spoken: item.spoken
      }).then(function () { i++; nextItem(); });
    }

    if (!items.length) lookAndDo();
    else nextItem();
  }

  /* Homework earns stars and feeds the Thinking Report, but it does
     not advance the 60-day course — it is extra, not a substitute. */
  function finishHomework(pack) {
    var res = Progress.completeStation(pack.id, 'homework');
    var summary = Evaluate.sessionSummary();
    App.homeworkFinished(pack, res, summary);
  }

  /* ------------------------------------------------------------
     end of a station
     ------------------------------------------------------------ */
  function finish(day, station) {
    var res = Progress.completeStation(day.id, station);
    var done = Progress.dayStationsDone(day.id);
    var summary = Evaluate.sessionSummary();
    App.stationFinished(day, station, res, done, summary);
  }

  /* ------------------------------------------------------------ */
  function run(day, station) {
    stage = document.getElementById('stage');
    current = { day: day, station: station };
    if (!Evaluate.currentSession() || Evaluate.currentSession().dayId !== day.id) {
      Evaluate.startSession(day.id);
    }
    App.setThinkMeter(Evaluate.currentSession().focus);
    if (station === 'homework') homework(day);     // `day` is a homework pack here
    else if (station === 'discover') discover(day);
    else if (station === 'numbers') numbers(day);
    else reading(day);
  }

  return { run: run, ask: ask, current: function () { return current; } };
})();
