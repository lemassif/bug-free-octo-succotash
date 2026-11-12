/* Katie's Field Station service worker. Caches the app itself so it
   opens with no signal; photographs, maps and videos still need a
   connection and are never cached here. Network-first, like the
   arcade's worker, so a published fix is what runs. */
const CACHE = 'fieldstation-v1.0.0';
const ASSETS = ['./', './index.html', './app.css', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  './data/species.js', './data/places.js', './data/videos.js',
  './js/store.js', './js/media.js', './js/app.js', './js/taxonomy.js', './js/tree3d.js', './js/insects.js', './js/monarch.js', './js/roosevelt.js', './js/owls.js', './js/explore.js', './js/college.js', './js/journal.js',
  '../three.module.min.js'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(ASSETS.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('fieldstation-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const resp = await Promise.race([fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000))]);
      if (resp && resp.ok && resp.type === 'basic') cache.put(req, resp.clone()).catch(() => {});
      return resp;
    } catch (err) {
      return (await cache.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? cache.match('./index.html') : undefined) || Response.error();
    }
  })());
});
