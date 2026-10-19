const CACHE_NAME = 'jr-importadora-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/logo.png',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Limpiar todas las cachés viejas inmediatamente
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Estrategia Network-First: Siempre intenta buscar la versión fresca del servidor/Live Server
self.addEventListener('fetch', (e) => {
  // En localhost o 127.0.0.1 (Live Server), ir directo a la red sin interceptar con caché
  const url = new URL(e.request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(e.request))
  );
});
