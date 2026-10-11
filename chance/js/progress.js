/* ============================================================
   progress.js — stars, streaks, weekly and monthly goals, badges

   Everything lives in localStorage on the iPad, so there is no
   account to make and no data leaving the device. The grown-up
   report reads from the same log the evaluator writes to.

   Reward shape (deliberately simple enough for a 7-year-old to
   hold in his head):
     ⭐ one star per station finished          -> 3 a day
     💎 a gem when every answer was first-try  -> "clean run"
     🗓️ weekly badge at 5 finished days in a calendar week
     🎖️ monthly patch at 20 finished days in a calendar month
     plus milestone badges for streaks and totals
   ============================================================ */

window.Progress = (function () {
  var KEY = 'chance.progress.v1';
  var LOG_CAP = 2000;

  var data = {
    name: 'Chance',
    days: {},        // dayId -> { done, stars, gem, date, firstTryPct }
    stations: {},    // dayId:station -> true
    log: [],         // evaluator events
    badges: {},      // badgeId -> ISO date earned
    streak: { count: 0, best: 0, last: null },
    totals: { stars: 0, gems: 0, wordsSpoken: 0, sessions: 0 }
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        data = Object.assign(data, parsed);
        data.totals = Object.assign({ stars: 0, gems: 0, wordsSpoken: 0, sessions: 0 }, parsed.totals || {});
        data.streak = Object.assign({ count: 0, best: 0, last: null }, parsed.streak || {});
      }
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  load();

  /* ------------------------------ dates ---------------------------- */
  function today() { return iso(new Date()); }
  function iso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function parseIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }

  /* Monday-start week key, e.g. 2026-W32 */
  function weekKey(d) {
    d = d || new Date();
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var dow = (x.getDay() + 6) % 7;             // Mon = 0
    x.setDate(x.getDate() - dow);
    return x.getFullYear() + '-W' + iso(x).slice(5);
  }
  function monthKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }

  function daysDoneIn(keyFn, key) {
    var seen = {};
    Object.keys(data.days).forEach(function (id) {
      var rec = data.days[id];
      if (!rec.done || !rec.date) return;
      if (keyFn(parseIso(rec.date)) === key) seen[rec.date] = true;
    });
    return Object.keys(seen).length;
  }

  function weekProgress() {
    var n = daysDoneIn(weekKey, weekKey());
    return { done: n, goal: 5, pct: Math.min(100, Math.round(100 * n / 5)), met: n >= 5 };
  }
  function monthProgress() {
    var n = daysDoneIn(monthKey, monthKey());
    return { done: n, goal: 20, pct: Math.min(100, Math.round(100 * n / 20)), met: n >= 20 };
  }

  /* ------------------------------ badges --------------------------- */
  /* Weekly badges are themed to the week's science so the reward
     means something — "you earned the Moon Watcher patch" beats
     "you earned badge 3". Curriculum supplies the names. */
  var MILESTONES = [
    { id: 'first-day',   em: '🌟', name: 'Launch Day',        test: function (d) { return countDone() >= 1; },  blurb: 'Finished your very first mission.' },
    { id: 'streak-3',    em: '🔥', name: '3-Day Streak',      test: function (d) { return d.streak.count >= 3; }, blurb: 'Three days in a row.' },
    { id: 'streak-5',    em: '⚡', name: '5-Day Streak',      test: function (d) { return d.streak.count >= 5; }, blurb: 'Five days in a row.' },
    { id: 'streak-10',   em: '🏅', name: '10-Day Streak',     test: function (d) { return d.streak.count >= 10; }, blurb: 'Ten days without missing.' },
    { id: 'stars-25',    em: '✨', name: '25 Stars',          test: function (d) { return d.totals.stars >= 25; }, blurb: 'Twenty-five stars collected.' },
    { id: 'stars-100',   em: '🌠', name: '100 Stars',         test: function (d) { return d.totals.stars >= 100; }, blurb: 'One hundred stars. That is a lot of thinking.' },
    { id: 'gems-5',      em: '💎', name: 'Clear Thinker',     test: function (d) { return d.totals.gems >= 5; }, blurb: 'Five perfect first-try missions.' },
    { id: 'gems-15',     em: '👑', name: 'Master Reasoner',   test: function (d) { return d.totals.gems >= 15; }, blurb: 'Fifteen perfect missions.' },
    { id: 'words-50',    em: '🗣️', name: 'Word Sayer',        test: function (d) { return d.totals.wordsSpoken >= 50; }, blurb: 'Read fifty words out loud.' },
    { id: 'words-200',   em: '📣', name: 'Out-Loud Reader',   test: function (d) { return d.totals.wordsSpoken >= 200; }, blurb: 'Two hundred words read out loud.' },
    { id: 'unit-1',      em: '🚀', name: 'Space Explorer',    test: function () { return unitDone(1); }, blurb: 'Completed every Space mission.' },
    { id: 'unit-2',      em: '🦎', name: 'Field Scientist',   test: function () { return unitDone(2); }, blurb: 'Completed every Woods & Water mission.' },
    { id: 'unit-3',      em: '⚙️', name: 'Engineer',          test: function () { return unitDone(3); }, blurb: 'Completed every Forces & Machines mission.' }
  ];

  function countDone() {
    return Object.keys(data.days).filter(function (k) { return data.days[k].done; }).length;
  }
  function unitDone(n) {
    if (!window.Curriculum) return false;
    var ds = Curriculum.daysInUnit(n);
    return ds.length > 0 && ds.every(function (d) { return isDayDone(d.id); });
  }

  function awardBadge(id, em, name, blurb) {
    if (data.badges[id]) return null;
    data.badges[id] = { date: today(), em: em, name: name, blurb: blurb || '' };
    save();
    return data.badges[id];
  }

  function checkBadges() {
    var fresh = [];
    MILESTONES.forEach(function (m) {
      if (!data.badges[m.id] && m.test(data)) {
        var b = awardBadge(m.id, m.em, m.name, m.blurb);
        if (b) fresh.push(Object.assign({ id: m.id }, b));
      }
    });
    // weekly
    var wp = weekProgress();
    if (wp.met) {
      var wk = weekKey();
      var theme = window.Curriculum ? Curriculum.weekBadgeForDate() : { em: '🗓️', name: 'Week Complete' };
      var b2 = awardBadge('week-' + wk, theme.em, theme.name, 'Five mission days in one week.');
      if (b2) fresh.push(Object.assign({ id: 'week-' + wk }, b2));
    }
    // monthly
    var mp = monthProgress();
    if (mp.met) {
      var b3 = awardBadge('month-' + monthKey(), '🎖️', 'Monthly Mission Patch', 'Twenty mission days in one month.');
      if (b3) fresh.push(Object.assign({ id: 'month-' + monthKey() }, b3));
    }
    return fresh;
  }

  /* ---------------------------- recording -------------------------- */
  function logEvent(ev) {
    data.log.push(ev);
    // Only spoken phonics words count toward "words read aloud" —
    // the comprehension question is a tap, not a word.
    if (ev.domain === 'phonics' && ev.correct) data.totals.wordsSpoken++;
    if (data.log.length > LOG_CAP) data.log.splice(0, data.log.length - LOG_CAP);
    save();
  }

  function completeStation(dayId, station) {
    var k = dayId + ':' + station;
    var firstTime = !data.stations[k];
    if (firstTime) {
      data.stations[k] = today();
      data.totals.stars++;
      save();
    }
    return { star: firstTime, stars: data.totals.stars };
  }

  function stationDone(dayId, station) { return !!data.stations[dayId + ':' + station]; }

  function dayStationsDone(dayId) {
    return ['discover', 'numbers', 'reading'].filter(function (s) { return stationDone(dayId, s); });
  }

  function isDayDone(dayId) { return !!(data.days[dayId] && data.days[dayId].done); }

  /* Called when all three stations of a day are finished. */
  function completeDay(dayId, summary) {
    var already = isDayDone(dayId);
    var rec = data.days[dayId] || {};
    rec.done = true;
    rec.date = rec.date || today();
    rec.stars = 3;
    rec.firstTryPct = summary ? summary.firstTryPct : rec.firstTryPct || 0;
    if (summary && summary.cleanRun && !rec.gem) { rec.gem = true; data.totals.gems++; }
    data.days[dayId] = rec;

    if (!already) {
      data.totals.sessions++;
      bumpStreak();
    }
    save();
    return { fresh: !already, badges: checkBadges(), gem: !!rec.gem };
  }

  function bumpStreak() {
    var t = today();
    if (data.streak.last === t) return;
    var y = new Date(); y.setDate(y.getDate() - 1);
    data.streak.count = (data.streak.last === iso(y)) ? data.streak.count + 1 : 1;
    data.streak.last = t;
    if (data.streak.count > data.streak.best) data.streak.best = data.streak.count;
  }

  /* ------------------------- what to do today ---------------------- */
  /* The next unfinished day in curriculum order. If he finished
     today's mission he can keep going — nothing is locked, because
     locking a curious kid out is the opposite of the point. */
  function nextDay() {
    if (!window.Curriculum) return null;
    var all = Curriculum.allDays();
    for (var i = 0; i < all.length; i++) {
      if (!isDayDone(all[i].id)) return all[i];
    }
    return all[all.length - 1];
  }

  function badgeList() {
    return Object.keys(data.badges).map(function (id) {
      return Object.assign({ id: id }, data.badges[id]);
    }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }

  function lockedMilestones() {
    return MILESTONES.filter(function (m) { return !data.badges[m.id]; });
  }

  function reset() {
    data = {
      name: data.name, days: {}, stations: {}, log: [], badges: {},
      streak: { count: 0, best: 0, last: null },
      totals: { stars: 0, gems: 0, wordsSpoken: 0, sessions: 0 }
    };
    save();
  }

  return {
    get data() { return data; },
    save: save, today: today, weekKey: weekKey, monthKey: monthKey,
    weekProgress: weekProgress, monthProgress: monthProgress,
    logEvent: logEvent, completeStation: completeStation, stationDone: stationDone,
    dayStationsDone: dayStationsDone, completeDay: completeDay, isDayDone: isDayDone,
    countDone: countDone, nextDay: nextDay, badgeList: badgeList,
    lockedMilestones: lockedMilestones, checkBadges: checkBadges, reset: reset,
    setName: function (n) { data.name = n || 'Chance'; save(); }
  };
})();
