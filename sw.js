// Service Worker raíz (todo vive junto a index.html)
const CACHE = 'pv-v10';
const ASSETS = [
  './', './index.html', './styles.css', './app.js?v=10',
  './login.html', './auth.js',
  './logo.svg',
  './brand-sinteplast.svg','./brand-sherwin.svg','./brand-tersuave.svg','./brand-pattex.svg','./brand-3m.svg',
  './icon-192.png','./icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.destination === 'image') {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-cache' });
        const c = await caches.open(CACHE);
        c.put(req, net.clone());
        return net;
      } catch (e) {
        const hit = await caches.match(req);
        return hit || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const hit = await caches.match(req);
    return hit || fetch(req);
  })());
});
