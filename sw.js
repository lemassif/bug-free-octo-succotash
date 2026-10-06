/* Retro Arcade service worker — caches the whole arcade for offline play. */
const CACHE = 'arcade-v10';
const ASSETS = [
  './',
  './index.html',
  './cubert.html',
  './miner.html',
  './ferrow-light.html',
  './golf.html',
  './giraffe.html',
  './decathlon.html',
  './decathlon-engine.js',
  './casino.html',
  './casino.css',
  './casino-core.js',
  './craps.html',
  './craps-engine.js',
  './blackjack.html',
  './blackjack-engine.js',
  './roulette.html',
  './roulette-engine.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: always show the newest version when online (asking the server whether
// each file changed), and fall back to the saved copy when offline or the network is slow.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const fromCache = async () => (await cache.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? cache.match('./index.html') : undefined) || Response.error();
    try {
      const resp = await Promise.race([
        fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })),
        new Promise((_, reject) => setTimeout(() => reject(new Error('slow network')), 4000))
      ]);
      if (resp && resp.ok && resp.type === 'basic') cache.put(req, resp.clone()).catch(() => {});
      return resp;
    } catch (err) {
      return (await fromCache()) || Response.error();
    }
  })());
});
