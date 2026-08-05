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

      // read the whole item aloud, then let him answer
      var spoken = [item.story, item.q].filter(Boolean).concat(order.map(function (c, i) {
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
  function reading(day) {
    var r = day.reading;
    var wi = 0;
    stage.innerHTML = '';

    function wordStep() {
      App.setPips(wi, r.words.length + 2);
      var word = r.words[wi];
      stage.innerHTML = '';

      var card = el('div', 'card');
      var head = el('div', 'card-head');
      head.appendChild(el('span', 'em', '📖'));
      var ht = el('div');
      ht.appendChild(el('span', 'tag', 'READ & SAY · ' + (day.phonicsFocus || '').toUpperCase()));
      ht.appendChild(el('h3', null, 'Word ' + (wi + 1) + ' of ' + r.words.length));
      head.appendChild(ht);
      card.appendChild(head);

      var hero = el('div', 'word-hero');
      var wordRow = el('div', 'word');
      var chunkEls = word.parts.map(function (p, idx) {
        var c = el('span', 'chunk', p);
        c.addEventListener('click', function () {
          Voice.stop();
          light(idx);
          Voice.sayPhoneme(word.sounds[idx] || p).then(function () { light(-1); });
        });
        wordRow.appendChild(c);
        return c;
      });
      hero.appendChild(wordRow);
      if (word.mean) hero.appendChild(el('div', 'say', word.mean));
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

      var heard = el('div', 'heard', Voice.canListen() ? 'Tap the microphone and say the word.' : 'Tap 🐢 to hear the sounds, then say it out loud.');
      card.appendChild(heard);
      stage.appendChild(card);

      function sayWord() { Voice.stop(); return Voice.say(word.w, { rate: 0.72 }); }
      function soundOut() {
        Voice.stop();
        var p = Promise.resolve();
        word.parts.forEach(function (_, idx) {
          p = p.then(function () {
            light(idx);
            return Voice.sayPhoneme(word.sounds[idx] || word.parts[idx]);
          }).then(function () { return Voice.pause(140); });
        });
        return p.then(function () { light(-1); return Voice.say(word.w, { rate: 0.7 }); });
      }
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
          var conf = Voice.match(word.w, res.transcript, res.alternatives);
          var v = Evaluate.judgeSpoken({
            word: word.w, parts: word.sounds, confidence: conf, attempt: attempt,
            heard: res.transcript, ms: Date.now() - t0, itemId: day.id + '-w' + wi
          });
          App.setThinkMeter(v.focus);
          App.showCoach(v.speak, v.tone);

          if (v.correct) {
            heard.innerHTML = '✅ <b>' + word.w + '</b> — that is it!';
            chunkEls.forEach(function (c) { c.classList.add('lit'); });
            App.burst(5);
            Voice.say(v.speak).then(function () { App.hideCoach(); advance(); });
          } else {
            heard.innerHTML = res.transcript ? 'I heard: <b>' + res.transcript + '</b>' : 'I did not catch that.';
            Voice.say(v.speak).then(function () {
              if (attempt >= 2) return soundOut();
            }).then(function () {
              if (attempt >= 3) {
                heard.innerHTML = 'Good trying. Tap <b>Next</b> — we will practice this one again on the Word Wall.';
                App.setActions([
                  { label: 'Try again', em: '🎤', cls: 'ghost', fn: function () { mic.click(); } },
                  { label: 'Next word', em: '➡️', cls: '', fn: function () { App.hideCoach(); advance(); } }
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
            // Only when the mic was never used on this word — otherwise
            // judgeSpoken already logged the real attempt and we would
            // be scoring the same word twice.
            if (attempt === 0 && !Progress.stationDone(day.id, 'reading')) {
              Progress.logEvent({
                t: Date.now(), dayId: day.id, itemId: day.id + '-w' + wi,
                station: 'reading', domain: 'phonics', correct: true,
                attempt: 1, ms: 0, flags: ['self-reported']
              });
            }
            App.hideCoach();
            advance();
          }
        }
      ]);

      soundOut();

      function advance() {
        wi++;
        if (wi < r.words.length) wordStep();
        else sentenceStep();
      }
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
    if (station === 'discover') discover(day);
    else if (station === 'numbers') numbers(day);
    else reading(day);
  }

  return { run: run, ask: ask, current: function () { return current; } };
})();
