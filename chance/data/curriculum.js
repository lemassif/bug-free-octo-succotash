/* ============================================================
   curriculum.js — the shape of the course, and the helpers the
   three unit files use to add days.

   60 mission days = 3 units x 4 weeks x 5 days. One day is
   5-10 minutes and always has the same three stops, because a
   predictable shape lets a 7-year-old spend his attention on the
   content instead of on figuring out the app:

     🔭 DISCOVER  a science idea, read aloud, one reasoning check
     🔢 NUMBERS   three real-world problems (time/distance/speed,
                  geometry, algebra, physics, groups-of)
     📖 READ & SAY a phonics word set he says out loud, a sentence,
                  and one comprehension question about the science

   Unit 1 opens on the solar system on purpose. That is the hook
   that worked in July summer school, so we start where his
   attention already is and pull the math and reading through it.

   ---------------------------------------------------------------
   AUTHORING NOTES (for whoever edits this next — hi, Grandpa)

   Every WRONG choice must carry a tag naming the thinking error
   that leads a kid to it. The tag is what makes the real-time
   evaluation work — see js/evaluate.js for the full list. Never
   write a throwaway wrong answer; each one should be a mistake a
   real second-grader would actually make.

     C('the right one', 1)                  <- correct choice
     C('the tempting one', 'bigger-number-bias')   <- tagged error

   `hint` is spoken on the second try. `show` is the worked
   reasoning revealed after he gets it right, so the lesson lands
   even when the answer came easily. Mark a problem multiStep:1
   when it needs two thoughts — the evaluator then treats a
   sub-second correct answer as a possible lucky guess and asks
   him to explain.
   ============================================================ */

window.Curriculum = (function () {

  var UNITS = [
    {
      n: 1, name: 'Space', em: '🚀',
      blurb: 'The solar system, the Sun and Moon, orbits and rockets.',
      weeks: [
        { n: 1,  em: '☀️', title: 'Sun, Earth and Shadows', badge: 'Sun Watcher',      phonics: 'short vowels in one-syllable words (sun, spin, rock)' },
        { n: 2,  em: '🌙', title: 'The Moon and Gravity',   badge: 'Moon Watcher',     phonics: 'magic-e long vowels (shape, side, globe)' },
        { n: 3,  em: '🪐', title: 'Planets and Orbits',     badge: 'Planet Ranger',    phonics: 'r-controlled vowels (orbit, star, Mars)' },
        { n: 4,  em: '🔭', title: 'Rockets and Telescopes', badge: 'Rocket Engineer',  phonics: 'vowel teams ee / ea (speed, deep, heat)' }
      ]
    },
    {
      n: 2, name: 'Woods & Water', em: '🦎',
      blurb: 'Salamanders, streams, fish, trees — the science of his own creek.',
      weeks: [
        { n: 5,  em: '🦎', title: 'Salamanders and Frogs',  badge: 'Salamander Scout', phonics: 'digraphs sh / ch / th (shed, hatch, moth)' },
        { n: 6,  em: '💧', title: 'Water and Streams',      badge: 'Stream Keeper',    phonics: 'endings -ing / -ed (soaking, floated)' },
        { n: 7,  em: '🎣', title: 'Fish and Food Webs',     badge: 'Angler Naturalist', phonics: 'oo / ou / ow (brook, trout, down)' },
        { n: 8,  em: '🌳', title: 'Trees, Leaves and Soil', badge: 'Forest Ranger',    phonics: 'soft c / soft g (cell, edge, ridge)' }
      ]
    },
    {
      n: 3, name: 'Forces & Machines', em: '⚙️',
      blurb: 'Push, pull, friction, levers, magnets, circuits, and building things that work.',
      weeks: [
        { n: 9,  em: '💪', title: 'Push, Pull and Friction', badge: 'Force Finder',    phonics: 'blends str / spl / scr (strong, splash, screw)' },
        { n: 10, em: '🔧', title: 'Simple Machines',         badge: 'Machine Builder', phonics: '-le and -er syllables (handle, lever, rudder)' },
        { n: 11, em: '🧲', title: 'Magnets, Light and Sound', badge: 'Energy Engineer', phonics: 'silent letters kn / wr / ph (knot, wrench, phone)' },
        { n: 12, em: '🏗️', title: 'Design and Build',        badge: 'Chief Engineer',  phonics: 'two-syllable compound words (footbridge, sunlight)' }
      ]
    }
  ];

  var days = [];   // flat, in teaching order

  /* --------------------------- helpers ---------------------------- */

  /* C('text', 1) correct  |  C('text', 'tag') tagged misconception */
  function C(t, x) {
    return x === 1 ? { t: t, correct: true } : { t: t, tag: x };
  }

  /* W('orbit', ['or','bit'], 'the path around something')

     `parts` are the SPELLING chunks he taps and decodes. How each
     chunk gets said out loud is not stored here — js/phonics.js
     owns that, keyed by the chunk itself, so "ar" is pronounced the
     same way in "far", "star" and "Mars" and only has to be right
     in one place. Do not invent phonetic spellings like 'fff' here;
     that is exactly what used to make the sound-out wrong. */
  function W(word, parts, mean) {
    return { w: word, parts: parts, mean: mean || '' };
  }

  function addDays(unitNo, list) {
    var unit = UNITS.filter(function (u) { return u.n === unitNo; })[0];
    list.forEach(function (d, i) {
      var weekIdx = Math.floor(i / 5);
      var wk = unit.weeks[weekIdx];
      var n = days.length + 1;
      days.push(Object.assign({
        id: 'd' + (n < 10 ? '0' + n : n),
        n: n,
        unit: unitNo,
        unitName: unit.name,
        week: wk.n,
        weekTitle: wk.title,
        weekEm: wk.em,
        dayOfWeek: (i % 5) + 1,
        phonicsFocus: wk.phonics
      }, d));
    });
  }

  /* --------------------------- lookups ---------------------------- */
  function allDays() { return days; }
  function day(id) { return days.filter(function (d) { return d.id === id; })[0] || null; }
  function dayByNumber(n) { return days[n - 1] || null; }
  function daysInUnit(n) { return days.filter(function (d) { return d.unit === n; }); }
  function daysInWeek(n) { return days.filter(function (d) { return d.week === n; }); }
  function units() { return UNITS; }
  function weekMeta(n) {
    for (var i = 0; i < UNITS.length; i++) {
      var w = UNITS[i].weeks.filter(function (x) { return x.n === n; })[0];
      if (w) return Object.assign({ unit: UNITS[i].n, unitName: UNITS[i].name }, w);
    }
    return null;
  }

  /* Name the weekly badge after the science he just finished, not the
     week he is about to start — so completing week 1 earns the Sun
     Watcher patch, not the Moon Watcher one. Falls back to the next
     unfinished day when nothing is done yet. */
  function weekBadgeForDate() {
    var wk = null;
    if (window.Progress) {
      var lastDone = null;
      for (var i = days.length - 1; i >= 0; i--) {
        if (Progress.isDayDone(days[i].id)) { lastDone = days[i]; break; }
      }
      var d = lastDone || Progress.nextDay();
      if (d) wk = weekMeta(d.week);
    }
    if (!wk) wk = weekMeta(1);
    return { em: wk ? wk.em : '🗓️', name: (wk ? wk.badge : 'Week') + ' Badge' };
  }

  /* Free-play picks: any day's single station, newest-unlocked first. */
  function stationPool(station) {
    return days.filter(function (d) { return d[station === 'discover' ? 'discover' : station]; });
  }

  function wordWall() {
    var out = [];
    days.forEach(function (d) {
      if (d.reading && d.reading.words) {
        d.reading.words.forEach(function (w) {
          out.push(Object.assign({ dayId: d.id, week: d.week, focus: d.phonicsFocus }, w));
        });
      }
    });
    return out;
  }

  return {
    C: C, W: W, addDays: addDays,
    allDays: allDays, day: day, dayByNumber: dayByNumber,
    daysInUnit: daysInUnit, daysInWeek: daysInWeek,
    units: units, weekMeta: weekMeta, weekBadgeForDate: weekBadgeForDate,
    stationPool: stationPool, wordWall: wordWall,
    get count() { return days.length; }
  };
})();
