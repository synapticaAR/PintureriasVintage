// Simple SW para cache estático + imágenes en runtime
const CACHE = 'pv-v6';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js?v=6',
  './assets/logo.svg',
  './assets/brand-sinteplast.svg',
  './assets/brand-sherwin.svg',
  './assets/brand-tersuave.svg',
  './assets/brand-pattex.svg',
  './assets/brand-3m.svg',
];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event)=>{
  const req = event.request;
  // imágenes: network-first + cache fallback
  if (req.destination === 'image') {
    event.respondWith((async ()=>{
      try {
        const net = await fetch(req, {cache:'no-cache'});
        const c = await caches.open(CACHE);
        c.put(req, net.clone());
        return net;
      } catch(e){
        const hit = await caches.match(req);
        return hit || Response.error();
      }
    })());
    return;
  }
  // resto: cache-first
  event.respondWith((async ()=>{
    const hit = await caches.match(req);
    return hit || fetch(req);
  })());
});
