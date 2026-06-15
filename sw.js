/* Service Worker — Audiobook Modelos Atômicos (PWA offline + auto-update) */
const CACHE = 'audiobook-atomos-b20260615170050'; /* BUILD — carimbado automaticamente pelo git hook */

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
  './audio/dialogo1A.mp3',
  './audio/dialogo1.mp3',
  './audio/dialogo1.0.mp3',
  './audio/dialogo1.1.mp3',
  './audio/dialogo1.2.mp3',
  './audio/dialogo1.3.mp3',
  './audio/dialogo1.4.mp3',
  './audio/applause.mp3',
  './audio/yes.mp3',
  './images/img1.jpg',
  './images/img2.jpg',
  './images/img3.jpg',
  './images/img4.jpg',
  './images/img5.jpg',
  './images/img6.jpg',
  './images/img7.jpg',
  './images/rock_transparent.jpeg',
  './images/water_cup.jpg',
  './images/light_energy.png',
  './images/estado-solido.svg',
  './images/estado-liquido.svg',
  './images/estado-gas.svg'
];

/* Instala: pré-cacheia o shell (cada item tolerante a falha individual). */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

/* Ativa: remove caches antigos (de builds anteriores). */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

function abIsHTML(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  /* HTML (o app): network-first — sempre busca a versão mais nova quando online
     e cai para o cache quando offline. É isso que faz a PWA instalada se
     atualizar sozinha a cada deploy. */
  if (abIsHTML(req)) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put(req, copy); } catch (_) {} });
        return res;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (r) {
          return r || caches.match('./audiobook_modelos_atomicos.html');
        });
      })
    );
    return;
  }

  /* Demais assets (áudio, imagens, ícones, fontes): stale-while-revalidate —
     responde do cache na hora e atualiza em segundo plano. */
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      var network = fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { try { c.put(req, copy); } catch (_) {} });
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
