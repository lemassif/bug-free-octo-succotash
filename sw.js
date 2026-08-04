/* Retro Arcade service worker — caches the whole arcade for offline play. */
const CACHE = 'arcade-v2';
const ASSETS = [
  './',
  './index.html',
  './cubert.html',
  './miner.html',
  './ferrow-light.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];
/* Chance Academy lives under ./chance/ and ships its own service
   worker, which caches the curriculum with a narrower scope. This
   one only pre-caches its entry point so the menu link works
   offline; opening it once installs the rest. */
ASSETS.push('./chance/', './chance/index.html', './chance/app.css');

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // Only clear our own old versions. Chance Academy keeps its
      // curriculum in a 'chance-academy-*' cache under ./chance/ —
      // deleting that here would knock the learning app offline.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('arcade-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first: play fully offline once loaded; refresh the cache when online.
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
