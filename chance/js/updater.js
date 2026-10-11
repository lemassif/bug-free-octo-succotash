/* ============================================================
   updater.js — "update the app" from inside the app

   Why this is needed at all: the service worker serves from cache
   first so a lesson never stalls waiting on a network. That is the
   right call at the creek with no signal, and the wrong one the day
   a fix is published — the iPad will happily keep running the old
   copy forever.

   So there is a command inside the app that goes and gets the new
   version:

     Grown-Ups -> ⬆️ Update the app

   It checks the server, says plainly whether anything is new, and
   on confirmation throws away every cache, drops the old service
   worker and reloads. Nothing he has earned is touched — stars,
   badges, recordings and homework all live in localStorage and
   IndexedDB, which this never clears.

   It also checks quietly once on launch (and only when online), so
   a new version announces itself rather than waiting to be found.
   ============================================================ */

window.Updater = (function () {

  /* Bumped by the build. Compared against the copy on the server to
     decide whether there is anything to get. */
  var VERSION = '1.5.0';
  var BUILT = '2026-10-11';

  function current() { return { version: VERSION, built: BUILT }; }

  function online() { return navigator.onLine !== false; }

  /* Ask the server what it has, bypassing every cache on the way. */
  function check() {
    if (!online()) return Promise.resolve({ ok: false, reason: 'offline' });
    var url = 'version.json?t=' + Date.now();
    return fetch(url, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (j) {
        return {
          ok: true,
          latest: j.version,
          built: j.built,
          notes: j.notes || '',
          newer: compare(j.version, VERSION) > 0
        };
      })
      .catch(function (e) {
        return { ok: false, reason: 'unreachable', detail: String(e.message || e) };
      });
  }

  /* 1.10.0 is newer than 1.9.0 — string comparison gets that wrong. */
  function compare(a, b) {
    var pa = String(a || '0').split('.').map(Number);
    var pb = String(b || '0').split('.').map(Number);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var x = pa[i] || 0, y = pb[i] || 0;
      if (x !== y) return x > y ? 1 : -1;
    }
    return 0;
  }

  /* The actual update: drop every cache this app owns, unregister
     the service worker so the next load fetches fresh, then reload.
     Deliberately does NOT touch localStorage or IndexedDB. */
  function install(onStep) {
    var step = onStep || function () {};
    step('Clearing the old copy…');
    return clearCaches()
      .then(function () {
        step('Letting go of the old version…');
        return unregister();
      })
      .then(function () {
        step('Loading the new one…');
        return new Promise(function (r) { setTimeout(r, 400); });
      })
      .then(function () {
        // cache-busted so the shell itself cannot come from cache
        var u = location.href.split('#')[0].split('?')[0];
        location.replace(u + '?updated=' + Date.now());
      });
  }

  function clearCaches() {
    if (!window.caches || !caches.keys) return Promise.resolve();
    return caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).catch(function () {});
  }

  function unregister() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return Promise.resolve();
    return navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all(regs.map(function (r) { return r.unregister(); }));
    }).catch(function () {});
  }

  /* A gentler nudge: ask the browser to re-fetch the worker. Enough
     when the worker itself changed, which is the usual case. */
  function refresh() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return Promise.resolve();
    return navigator.serviceWorker.getRegistrations().then(function (regs) {
      return Promise.all(regs.map(function (r) { return r.update(); }));
    }).catch(function () {});
  }

  /* Quiet check on launch. Resolves with the check result so the
     grown-up door can wear a dot when something is waiting. */
  var launchResult = null;
  function checkOnLaunch() {
    if (!online()) return Promise.resolve(null);
    return check().then(function (res) {
      launchResult = res;
      return res;
    });
  }
  function lastCheck() { return launchResult; }

  return {
    current: current, check: check, install: install, refresh: refresh,
    compare: compare, checkOnLaunch: checkOnLaunch, lastCheck: lastCheck,
    clearCaches: clearCaches
  };
})();
