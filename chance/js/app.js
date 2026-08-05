/* ============================================================
   app.js — the shell: icons, routing, rewards, sharing

   The home screen is icon-first on purpose. A 7-year-old should
   never have to read a menu to get started: one big picture for
   today's mission, six picture tiles for everything else, and a
   small grown-up door in the corner.
   ============================================================ */

window.App = (function () {

  var screens = {}, replayFn = null, actionsBar = null;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  /* ---------------------------- routing --------------------------- */
  function go(name, arg) {
    Voice.stop();
    hideCoach();
    setActions([]);
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
    window.scrollTo(0, 0);
    if (name === 'home') renderHome();
    if (name === 'map') renderMap();
    if (name === 'rewards') renderRewards();
    if (name === 'wordwall') renderWordWall();
    if (name === 'grownup') Grownup.render($('grownupBody'));
    if (name === 'mission' && arg) Stations.run(arg.day, arg.station);
  }

  /* -------------------------- action bar -------------------------- */
  function setActions(list) {
    if (!actionsBar) {
      actionsBar = el('div', 'actions');
      document.body.appendChild(actionsBar);
    }
    actionsBar.innerHTML = '';
    if (!list || !list.length) { actionsBar.style.display = 'none'; return; }
    actionsBar.style.display = 'flex';
    list.forEach(function (a) {
      var b = el('button', 'btn-big ' + (a.cls || ''));
      if (a.em) b.appendChild(el('span', null, a.em));
      b.appendChild(el('span', null, a.label));
      b.addEventListener('click', a.fn);
      actionsBar.appendChild(b);
    });
  }

  /* ---------------------------- the owl --------------------------- */
  var coachTimer = null;
  function showCoach(text, tone) {
    var c = $('coach');
    $('coachText').textContent = text;
    $('coachFace').textContent = tone === 'good' ? '🦉' : (tone === 'slow-down' ? '🐢' : (tone === 'pattern' ? '🔁' : '🦉'));
    c.hidden = false;
    clearTimeout(coachTimer);
    if (tone === 'good') coachTimer = setTimeout(hideCoach, 6000);
    $('coachSpeak').onclick = function () { Voice.stop(); Voice.say(text); };
  }
  function hideCoach() { $('coach').hidden = true; }

  /* ------------------------ progress feedback --------------------- */
  function setThinkMeter(focus) {
    var f = $('thinkFill');
    f.style.width = Math.max(8, focus) + '%';
    f.className = focus >= 70 ? '' : (focus >= 45 ? 'warn' : 'slow');
  }
  function setPips(done, total) {
    var box = $('missionPips');
    box.innerHTML = '';
    for (var i = 0; i < total; i++) {
      var p = el('i');
      if (i < done) p.className = 'on';
      else if (i === done) p.className = 'now';
      box.appendChild(p);
    }
  }
  function setReplay(fn) { replayFn = fn; }

  function burst(n) {
    var box = $('confetti');
    var ems = ['⭐', '✨', '🌟', '💫', '🎉'];
    for (var i = 0; i < (n || 8); i++) {
      var s = el('i', null, ems[Math.floor(Math.random() * ems.length)]);
      s.style.left = Math.random() * 96 + 'vw';
      s.style.top = '-40px';
      s.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      box.appendChild(s);
      setTimeout(function (node) { return function () { node.remove(); }; }(s), 3200);
    }
  }

  /* ------------------------------ HOME --------------------------- */
  function renderHome() {
    var day = Progress.nextDay();
    if (!day) return;
    var done = Progress.dayStationsDone(day.id);
    $('todayIcon').textContent = day.icon;
    $('todayNumber').textContent = 'Day ' + day.n;
    $('todayTitle').textContent = day.title;
    $('todaySub').textContent = day.unitName + ' · ' + day.weekTitle;
    var dots = $('todayDots');
    dots.innerHTML = '';
    ['discover', 'numbers', 'reading'].forEach(function (s) {
      var i = el('i');
      if (done.indexOf(s) !== -1) i.className = 'on';
      dots.appendChild(i);
    });
    $('homeAvatar').textContent = day.unit === 1 ? '🚀' : (day.unit === 2 ? '🦎' : '⚙️');
    $('tileStarCount').textContent = Progress.data.totals.stars;

    var streak = Progress.data.streak.count;
    $('homeGreeting').textContent = streak > 1
      ? 'Hi ' + Progress.data.name + '! ' + streak + ' days in a row. 🔥'
      : 'Hi ' + Progress.data.name + '! Tap a picture to start.';

    var wp = Progress.weekProgress(), mp = Progress.monthProgress();
    $('goalWeekText').textContent = wp.done + ' of ' + wp.goal + ' days' + (wp.met ? ' ✅' : '');
    $('goalWeekBar').style.width = wp.pct + '%';
    $('goalMonthText').textContent = mp.done + ' of ' + mp.goal + ' days' + (mp.met ? ' ✅' : '');
    $('goalMonthBar').style.width = mp.pct + '%';
  }

  function startMission(day) {
    var done = Progress.dayStationsDone(day.id);
    var next = ['discover', 'numbers', 'reading'].filter(function (s) { return done.indexOf(s) === -1; })[0];
    if (!next) next = 'discover';   // replaying a finished day is allowed
    go('mission', { day: day, station: next });
  }

  /* --------------------- end of a station / day ------------------- */
  function stationFinished(day, station, res, done, summary) {
    setActions([]);
    var all = done.length >= 3;
    var names = { discover: 'Science', numbers: 'Numbers', reading: 'Read & Say' };

    if (!all) {
      burst(10);
      Voice.say('Station complete. You earned a star.');
      var remaining = ['discover', 'numbers', 'reading'].filter(function (s) { return done.indexOf(s) === -1; });
      sheet([
        big('⭐'),
        h3(names[station] + ' done!'),
        p('That is ' + Progress.data.totals.stars + (Progress.data.totals.stars === 1 ? ' star' : ' stars') +
          '. ' + remaining.length + ' stop' + (remaining.length > 1 ? 's' : '') + ' left in today\'s mission.'),
        row([
          btn('➡️', 'Keep going', function () {
            closeSheet();
            go('mission', { day: day, station: remaining[0] });
          }),
          btn('🏠', 'Home', function () { closeSheet(); go('home'); })
        ])
      ]);
      return;
    }

    // whole day finished
    var out = Progress.completeDay(day.id, summary);
    burst(26);
    Voice.say('Mission complete! Fantastic work today.');
    var stats = [
      { label: 'stars', value: Progress.data.totals.stars },
      { label: 'first try', value: (summary ? summary.firstTryPct : 0) + '%' },
      { label: 'streak', value: Progress.data.streak.count }
    ];
    var badge = {
      id: 'day-' + day.id, em: day.icon,
      name: 'Day ' + day.n + ': ' + day.title,
      blurb: day.unitName + ' · ' + day.weekTitle,
      date: Progress.today(), who: Progress.data.name
    };
    var nodes = [
      big(out.gem ? '💎' : '🏆'),
      h3('Mission Complete!'),
      p(out.gem
        ? 'Every answer right on the first try. That is a Clear Thinker gem.'
        : (summary ? summary.firstTryPct + '% right on the first try.' : 'Great work today.'))
    ];
    if (out.badges && out.badges.length) {
      var bl = el('div', 'badge-grid');
      out.badges.forEach(function (b) {
        var n = el('div', 'badge');
        n.appendChild(el('span', 'em', b.em));
        n.appendChild(el('div', 'nm', b.name));
        n.appendChild(el('div', 'dt', 'NEW!'));
        bl.appendChild(n);
      });
      nodes.push(el('p', null, out.badges.length > 1 ? 'New badges earned!' : 'New badge earned!'));
      nodes.push(bl);
      Voice.say('You earned a new badge: ' + out.badges[0].name + '!');
    }
    nodes.push(row([
      btn('📤', 'Share it', function () { closeSheet(); shareSheet(out.badges && out.badges[0] ? Object.assign({ who: Progress.data.name }, out.badges[0]) : badge, stats); }),
      btn('🏆', 'My rewards', function () { closeSheet(); go('rewards'); }),
      btn('🏠', 'Home', function () { closeSheet(); go('home'); })
    ]));
    sheet(nodes);
  }

  /* ------------------------------ MAP ---------------------------- */
  function renderMap() {
    var body = $('mapBody');
    body.innerHTML = '';
    var next = Progress.nextDay();
    Curriculum.units().forEach(function (u) {
      var uh = el('div', 'week-title');
      uh.appendChild(el('span', 'em', u.em));
      uh.appendChild(el('span', null, 'UNIT ' + u.n + ' · ' + u.name.toUpperCase() + ' — ' + u.blurb));
      body.appendChild(uh);
      u.weeks.forEach(function (w) {
        var block = el('div', 'week-block');
        var wt = el('div', 'week-title');
        wt.appendChild(el('span', 'em', w.em));
        wt.appendChild(el('span', null, 'Week ' + w.n + ' · ' + w.title + ' · badge: ' + w.badge));
        block.appendChild(wt);
        var row2 = el('div', 'day-row');
        Curriculum.daysInWeek(w.n).forEach(function (d) {
          var chip = el('button', 'day-chip');
          if (Progress.isDayDone(d.id)) chip.classList.add('done');
          if (next && next.id === d.id) chip.classList.add('today');
          chip.appendChild(el('span', 'em', Progress.isDayDone(d.id) ? '⭐' : d.icon));
          chip.appendChild(el('span', 'n', 'Day ' + d.n));
          chip.appendChild(el('span', 't', d.title));
          chip.addEventListener('click', function () { startMission(d); });
          row2.appendChild(chip);
        });
        block.appendChild(row2);
        body.appendChild(block);
      });
    });
  }

  /* ---------------------------- REWARDS -------------------------- */
  function renderRewards() {
    var body = $('rewardsBody');
    body.innerHTML = '';
    var t = Progress.data.totals, wp = Progress.weekProgress(), mp = Progress.monthProgress();

    var stats = el('div', 'stat-row');
    [[t.stars, 'stars'], [t.gems, 'gems 💎'], [Progress.data.streak.count, 'day streak'],
     [Progress.countDone(), 'missions done'], [t.wordsSpoken, 'words said']].forEach(function (s) {
      var n = el('div', 'stat');
      n.appendChild(el('b', null, String(s[0])));
      n.appendChild(el('i', null, s[1]));
      stats.appendChild(n);
    });
    body.appendChild(stats);

    var goals = el('div', 'goal-strip');
    [['📅', 'Weekly goal', wp, '5 mission days in one week'],
     ['🎖️', 'Monthly goal', mp, '20 mission days in one month']].forEach(function (g) {
      var n = el('div', 'goal');
      n.appendChild(el('span', 'goal-icon', g[0]));
      var d = el('div');
      d.appendChild(el('b', null, g[1] + (g[2].met ? ' ✅' : '')));
      d.appendChild(el('i', null, g[2].done + ' of ' + g[2].goal + ' — ' + g[3]));
      n.appendChild(d);
      var bar = el('div', 'bar');
      var sp = el('span');
      sp.style.width = g[2].pct + '%';
      bar.appendChild(sp);
      n.appendChild(bar);
      goals.appendChild(n);
    });
    body.appendChild(goals);

    body.appendChild(el('div', 'week-title', 'BADGES EARNED — tap one to send it to family'));
    var earned = Progress.badgeList();
    var grid = el('div', 'badge-grid');
    if (!earned.length) {
      grid.appendChild(el('p', null, 'No badges yet. Finish today\'s mission to earn your first one!'));
    }
    earned.forEach(function (b) {
      var n = el('div', 'badge');
      n.appendChild(el('span', 'em', b.em));
      n.appendChild(el('div', 'nm', b.name));
      n.appendChild(el('div', 'dt', b.date));
      n.addEventListener('click', function () {
        shareSheet(Object.assign({ who: Progress.data.name }, b), [
          { label: 'stars', value: t.stars },
          { label: 'missions', value: Progress.countDone() },
          { label: 'streak', value: Progress.data.streak.count }
        ]);
      });
      grid.appendChild(n);
    });
    body.appendChild(grid);

    var locked = Progress.lockedMilestones();
    if (locked.length) {
      body.appendChild(el('div', 'week-title', 'STILL TO EARN'));
      var lg = el('div', 'badge-grid');
      locked.forEach(function (m) {
        var n = el('div', 'badge locked');
        n.appendChild(el('span', 'em', m.em));
        n.appendChild(el('div', 'nm', m.name));
        n.appendChild(el('div', 'dt', m.blurb));
        lg.appendChild(n);
      });
      body.appendChild(lg);
    }
  }

  /* --------------------------- WORD WALL ------------------------- */
  function renderWordWall() {
    var body = $('wordwallBody');
    body.innerHTML = '';
    body.appendChild(el('p', null, 'Every word from every mission. Tap a word to hear it sounded out.'));
    var byWeek = {};
    Curriculum.wordWall().forEach(function (w) {
      (byWeek[w.week] = byWeek[w.week] || []).push(w);
    });
    Object.keys(byWeek).sort(function (a, b) { return a - b; }).forEach(function (wk) {
      var meta = Curriculum.weekMeta(+wk);
      var t = el('div', 'week-title');
      t.appendChild(el('span', 'em', meta ? meta.em : '📖'));
      t.appendChild(el('span', null, 'Week ' + wk + ' · ' + (meta ? meta.phonics : '')));
      body.appendChild(t);
      var grid = el('div', 'badge-grid');
      byWeek[wk].forEach(function (w) {
        var n = el('div', 'badge');
        n.appendChild(el('span', 'nm', w.w));
        n.appendChild(el('span', 'dt', w.parts.join(' · ')));
        n.addEventListener('click', function () {
          Voice.stop();
          Voice.soundOut(w.w, w.sounds);
        });
        grid.appendChild(n);
      });
      body.appendChild(grid);
    });
  }

  /* ---------------------------- SHEETS --------------------------- */
  function sheet(nodes) {
    var s = $('sheet');
    s.innerHTML = '';
    nodes.forEach(function (n) { s.appendChild(n); });
    $('overlay').hidden = false;
  }
  function closeSheet() { $('overlay').hidden = true; }
  function big(em) { return el('div', 'big-em', em); }
  function h3(t) { return el('h3', null, t); }
  function p(t) { return el('p', null, t); }
  function row(btns) {
    var r = el('div', 'row');
    btns.forEach(function (b) { r.appendChild(b); });
    return r;
  }
  function btn(em, label, fn) {
    var b = el('button', 'share-btn');
    b.appendChild(el('span', 'em', em));
    b.appendChild(el('span', null, label));
    b.addEventListener('click', fn);
    return b;
  }

  /* ------------------------- SHARE A REWARD ---------------------- */
  /* Draws the badge as a real PNG, then offers the iOS share sheet
     (Messages / Mail / AirDrop / Photos all attach the picture),
     plus plain text and email fallbacks. */
  function shareSheet(badge, stats) {
    var canvas = Rewards.drawCard(badge, stats);
    var status = el('p', null, 'Send this to Grandpa, Mom, or anybody you want.');
    var nodes = [
      h3('Share your reward'),
      canvas,
      status,
      row([
        btn('📤', 'Share / AirDrop', function () {
          status.textContent = 'Opening share sheet…';
          Rewards.share(badge, canvas, Progress.data.name).then(function (r) {
            status.textContent = r === 'shared' || r === 'shared-text' ? 'Sent! 🎉'
              : (r === 'cancelled' ? 'No problem — try another way.' : 'Sharing is not available here. Try Save or Text.');
          });
        }),
        btn('💬', 'Text it', function () { Rewards.textIt(badge, Progress.data.name); }),
        btn('✉️', 'Email it', function () { Rewards.emailIt(badge, Progress.data.name); })
      ]),
      row([
        btn('💾', 'Save picture', function () {
          Rewards.download(badge, canvas).then(function () { status.textContent = 'Saved to your device. 📥'; });
        }),
        btn('📋', 'Copy text', function () {
          Rewards.copyIt(badge, Progress.data.name).then(function (ok) {
            status.textContent = ok ? 'Copied — paste it anywhere.' : 'Could not copy here.';
          });
        }),
        btn('✖️', 'Close', function () { closeSheet(); go('home'); })
      ])
    ];
    sheet(nodes);
  }

  /* ------------------------------ BOOT --------------------------- */
  function boot() {
    ['home', 'mission', 'map', 'rewards', 'wordwall', 'grownup'].forEach(function (k) {
      screens[k] = $('screen-' + k);
    });

    // Any first tap unlocks iOS speech.
    var unlock = function () {
      Voice.unlock();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });

    document.body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-go]');
      if (!t) return;
      var v = t.getAttribute('data-go');
      if (v.indexOf('station:') === 0) {
        var day = Progress.nextDay();
        go('mission', { day: day, station: v.split(':')[1] });
      } else {
        go(v);
      }
    });

    $('todayCard').addEventListener('click', function () { startMission(Progress.nextDay()); });
    $('todayCard').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') startMission(Progress.nextDay());
    });
    $('btnGrownups').addEventListener('click', function () { go('grownup'); });
    $('btnReplay').addEventListener('click', function () { if (replayFn) replayFn(); });
    $('overlay').addEventListener('click', function (e) { if (e.target === $('overlay')) closeSheet(); });

    go('home');
  }

  // If the scripts are inlined at the end of the document (single-file
  // builds), DOMContentLoaded may already have fired by now.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return {
    go: go, setActions: setActions, showCoach: showCoach, hideCoach: hideCoach,
    setThinkMeter: setThinkMeter, setPips: setPips, setReplay: setReplay, burst: burst,
    stationFinished: stationFinished, startMission: startMission,
    sheet: sheet, closeSheet: closeSheet, shareSheet: shareSheet,
    ui: { el: el, big: big, h3: h3, p: p, row: row, btn: btn }
  };
})();
