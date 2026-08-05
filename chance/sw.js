/* Chance Academy service worker.

   Caches the whole curriculum on the first visit so the app works
   with no signal — in the truck, at the creek, at Grandpa's house.
   Speech synthesis is built into iOS and works offline too; only
   the microphone check needs a connection on some devices. */

const CACHE = 'chance-academy-v1';
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
  './js/recordings.js',
  './js/voice.js',
  './js/evaluate.js',
  './js/progress.js',
  './js/rewards.js',
  './js/stations.js',
  './js/grownup.js',
  './js/studio.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('chance-academy-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first so a lesson never stalls waiting on a network, with a
// background refresh so edits to the curriculum show up next launch.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});
