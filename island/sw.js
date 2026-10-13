/* Island Dreams service worker.

   Keeps a copy of the app itself so it opens on the island even with
   no signal. It never touches the journal's data or photos: those come
   from Supabase (another address), which this worker leaves alone.

   Every request asks the server first, so a published fix shows up on
   the next open; the saved copy is used when the network is missing
   or slower than 4 seconds. */

const CACHE = 'island-dreams-v1.2.0';
const ASSETS = [
  './',
  './index.html',
  './app.css',
  './config.js',
  './js/app.js',
  './js/store.js',
  './js/photos.js',
  './vendor/supabase.js',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
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
        .filter((k) => k.startsWith('island-dreams-') && k !== CACHE)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const plain = url.origin + url.pathname; // ?v=1.1.0 and ?v=1.2.0 share one copy
    try {
      const resp = await Promise.race([
        fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })),
        new Promise((_, reject) => setTimeout(() => reject(new Error('slow network')), 4000))
      ]);
      if (resp && resp.ok && resp.type === 'basic') cache.put(plain, resp.clone()).catch(() => {});
      return resp;
    } catch (err) {
      return (await cache.match(plain)) ||
        (req.mode === 'navigate' ? await cache.match('./index.html') : undefined) ||
        Response.error();
    }
  })());
});
