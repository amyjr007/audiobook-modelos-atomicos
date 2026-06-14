/* Service Worker — Audiobook Modelos Atômicos (PWA offline) */
const CACHE = 'audiobook-atomos-v1.0.5';

/* App shell pré-cacheado para funcionar offline. */
const SHELL = [
  './',
  './index.html',
  './audiobook_modelos_atomicos.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './apple-touch-icon.png',
  './audio/dialogo0.mp3',
  './audio/dialogo0.1.mp3',
  './audio/dialogo1.mp3',
  './audio/dialogo1.0.mp3',
  './audio/dialogo1.1.mp3',
  './audio/dialogo1.2.mp3',
  './audio/dialogo1.3.mp3',
  './images/img1.jpg',
  './images/img2.jpg',
  './images/img3.jpg',
  './images/img4.jpg',
  './images/img5.jpg',
  './images/img6.jpg'
];

/* Instala: pré-cacheia o shell (cada item tolerante a falha individual). */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

/* Ativa: remove caches antigos. */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

/* Busca: cache-first (ignorando ?v=...), com fallback de rede que também
   popula o cache em tempo de execução (fontes do Google, etc.). */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put(req, copy); } catch (_) {} });
        return res;
      }).catch(function () { return cached; });
    })
  );
});
