/* Chance Academy service worker.

   Keeps a copy of the whole curriculum so the app works with no
   signal — in the truck, at the creek, at Grandpa's house.

   HOW IT FETCHES, AND WHY IT CHANGED
   Version 1.5 and earlier served the saved copy first. That made the
   app fast offline, but it also meant a published fix could sit
   unseen on the iPad, and worse: when a new version installed, it
   filled its fresh cache through the browser's own short-term cache
   (GitHub Pages lets browsers keep files for 10 minutes). So the
   iPad could end up labelled 1.5 while still running 1.4 code —
   which is exactly how the old first-grade words survived an update.

   Now:
   - Installing always goes to the server (cache: 'reload'), never to
     the browser's short-term copy.
   - Every request asks the server first ('no-cache' means "check
     with the server, use a stored copy only if the server says it
     has not changed"), so whatever is published is what runs.
   - If the network is missing or slower than 4 seconds, the saved
     copy is used, so a lesson never stalls.

   The text-recognition files under vendor/ (about 6 MB) are not
   pre-cached on install; they are saved the first time a homework
   photo is read. */

const CACHE = 'chance-academy-v1.6.0';
const ASSETS = [
  './',
  './index.html',
  './app.css',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './data/curriculum.js',
  './data/unit1-space.js',
  './data/unit2-woods.js',
  './data/unit3-forces.js',
  './js/phonics.js',
  './js/updater.js',
  './js/homework.js',
  './js/scan.js',
  './js/recordings.js',
  './js/voice.js',
  './js/evaluate.js',
  './js/progress.js',
  './js/rewards.js',
  './js/stations.js',
  './js/grownup.js',
  './js/studio.js',
  './js/hwui.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k.startsWith('chance-academy-') && k !== CACHE)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // the update check always asks the server and is never stored
  if (url.pathname.endsWith('/version.json')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => new Response('{}', {
      status: 503, headers: { 'Content-Type': 'application/json' }
    })));
    return;
  }

  // the text reader never changes between versions: saved copy first,
  // and no 4-second cut-off, since 6 MB can take longer on slow wifi
  if (url.pathname.includes('/vendor/')) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const resp = await fetch(req);
      if (resp && resp.ok && resp.type === 'basic') cache.put(url.origin + url.pathname, resp.clone()).catch(() => {});
      return resp;
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = async () =>
      (await cache.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    try {
      const resp = await Promise.race([
        fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })),
        new Promise((_, reject) => setTimeout(() => reject(new Error('slow network')), 4000))
      ]);
      if (resp && resp.ok && resp.type === 'basic') {
        // store it under the plain address too, so ?v=1.6.0 and a later
        // ?v=1.7.0 both find the offline copy
        const plain = url.origin + url.pathname;
        cache.put(plain, resp.clone()).catch(() => {});
      }
      return resp;
    } catch (err) {
      return (await saved()) || Response.error();
    }
  })());
});
