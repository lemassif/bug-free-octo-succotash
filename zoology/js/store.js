/* ============================================================
   store.js — everything Katie does lives in her browser.

   One JSON blob in localStorage, saved on every change. Nothing is
   sent anywhere. Because it is per-browser, the Settings page can
   export the whole thing to a file and import it on another device.
   ============================================================ */
window.Store = (function () {
  var KEY = 'katie.fieldstation.v1';
  var data = defaults();
  var listeners = [];

  function defaults() {
    return {
      version: 1,
      created: new Date().toISOString(),
      settings: { name: 'Katie', collector: 'K. Collector', theme: 'auto' },
      species: {},      // speciesId -> { done, date, tries, label }
      cabinet: [],      // order species were pinned (ids)
      lessons: {},      // lessonId -> true
      quizzes: {},      // quizId -> best score
      studio: {},       // insect studio completions by order
      owls: {},         // owl lab completions
      badges: {},       // badgeId -> date
      days: {},         // yyyy-mm-dd -> true (days with activity)
      plan: {},         // placeId -> { status, note }
      colleges: {},     // collegeId -> { rating, notes, visited }
      journal: [],      // field notes
      dissect: {},      // specimenId -> { step, at, cuts, ids, best }
      custom: [],       // species Katie added herself (My Own Finds)
      lastSpecimen: null
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var d = defaults();
        Object.keys(parsed).forEach(function (k) { if (parsed[k] !== undefined && parsed[k] !== null) d[k] = parsed[k]; });
        d.settings = Object.assign(defaults().settings, parsed.settings || {});
        data = d;
      }
    } catch (e) { data = defaults(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    listeners.forEach(function (fn) { try { fn(data); } catch (e) {} });
  }
  load();

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function touch() { data.days[today()] = true; }

  function streak() {
    var n = 0, d = new Date();
    for (;;) {
      var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (!data.days[k]) { if (n === 0 && d.getTime() === new Date().getTime()) {} break; }
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  }

  return {
    get data() { return data; },
    save: save,
    touch: touch,
    today: today,
    streak: streak,
    onChange: function (fn) { listeners.push(fn); },
    set: function (path, value) {
      var parts = path.split('.'), o = data;
      for (var i = 0; i < parts.length - 1; i++) { if (o[parts[i]] === undefined || o[parts[i]] === null) o[parts[i]] = {}; o = o[parts[i]]; }
      o[parts[parts.length - 1]] = value; touch(); save();
    },
    get: function (path, dflt) {
      var parts = path.split('.'), o = data;
      for (var i = 0; i < parts.length; i++) { if (o === undefined || o === null) return dflt; o = o[parts[i]]; }
      return o === undefined ? dflt : o;
    },
    award: function (badgeId) {
      if (!data.badges[badgeId]) { data.badges[badgeId] = today(); save(); return true; }
      return false;
    },
    exportJSON: function () { return JSON.stringify(data, null, 2); },
    importJSON: function (text) {
      var parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.species) throw new Error('Not a Field Station backup');
      localStorage.setItem(KEY, JSON.stringify(parsed)); load(); save();
    },
    reset: function () { data = defaults(); save(); }
  };
})();
