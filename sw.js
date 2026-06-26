/* Service Worker — Audiobook Modelos Atômicos (PWA offline + auto-update) */
const CACHE = 'audiobook-atomos-b20260626182243'; /* BUILD — carimbado automaticamente pelo git hook */

/* App shell pré-cacheado para funcionar offline. */
const SHELL = [
  './',
  './index.html',
  './audiobook_modelos_atomicos.html',
  './manifest.webmanifest',
  './three.min.js',
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
  './audio/dialogo1.5.mp3',
  './audio/dialogo1.6A.mp3',
  './audio/dialogo1.6B.mp3',
  './audio/dialogo1.7.mp3',
  './audio/dialogo1.7A.mp3',
  './audio/dialogo1.7B.mp3',
  './audio/dialogo1.7C.mp3',
  './audio/dialogo2.0.mp3',
  './audio/dialogo2.mp3',
  './audio/dialogo2.1.mp3',
  './audio/dialogo2.2.mp3',
  './audio/dialogo2.3.mp3',
  './audio/dialogo2.3.1.mp3',
  './audio/dialogo2.4.mp3',
  './audio/dialogo2.4.1.mp3',
  './audio/dialogo2.5.mp3',
  './audio/dialogo2.5.0.mp3',
  './audio/dialogo2.5.1.mp3',
  './audio/dialogo2.5.2.mp3',
  './audio/dialogo2.5.3.mp3',
  './audio/dialogo2.5.4.mp3',
  './audio/dialogo2.5.1A.mp3',
  './audio/dialogo2.5.1B.mp3',
  './audio/dialogo2.5.1C.mp3',
  './audio/dialogo2.5.1D.mp3',
  './audio/dialogo2.5.1E.mp3',
  './audio/dialogo2.6.mp3',
  './audio/dialogo2.6.1.mp3',
  './audio/dialogo2.6.2.mp3',
  './audio/dialogo2.6.2A.mp3',
  './audio/dialogo2.6.2B.mp3',
  './audio/dialogo2.6.3.mp3',
  './audio/dialogo2.6.4.mp3',
  './audio/dialogo2.6.4A.mp3',
  './audio/dialogo2.7.mp3',
  './audio/dialogo2.7.1.mp3',
  './audio/dialogo3A.mp3',
  './audio/dialogo3.mp3',
  './audio/dialogo3.1.mp3',
  './audio/dialogo3.2.mp3',
  './audio/dialogo3.3.mp3',
  './audio/dialogo3.3A.mp3',
  './audio/dialogo3.3B.mp3',
  './audio/dialogo3.4.mp3',
  './audio/dialogo3.4.1.mp3',
  './audio/proxima.mp3',
  './audio/maisessa.mp3',
  './audio/applause.mp3',
  './audio/yes.mp3',
  './audio/lowscore.mp3',
  './audio/ball_out.mp3',
  './audio/ball_in.mp3',
  './audio/right.mp3',
  './audio/error.mp3',
  './videos/john_dalton_1.mp4',
  './videos/john_dalton2.mp4',
  './videos/lab_dalton.mp4',
  './videos/tales_ambar.mp4',
  './videos/dalton_annoyed.mp4',
  './images/img1.jpg',
  './images/img2.jpg',
  './images/img3.jpg',
  './images/img4.jpg',
  './images/img5.jpg',
  './images/img6.jpg',
  './images/img7.jpg',
  './images/john_dalton.jpeg',
  './images/john_dalton_2.jpeg',
  './images/dalton_symbols.jpeg',
  './images/john_dalton3.png',
  './images/dalton_elements.jpg',
  './images/tabela_periodica.jpg',
  './images/metal_cold.png',
  './images/rock_transparent.jpeg',
  './images/water_cup.jpg',
  './images/berzelius.jpeg',
  './images/light_energy.png',
  './images/estado-solido.svg',
  './images/estado-liquido.svg',
  './images/estado-gas.svg',
  './images/apple.svg',
  './images/apple-piece.svg',
  './images/quiz-atomo.svg',
  './images/quiz-blocos.svg',
  './images/co2.svg',
  './images/amonia.png',
  './images/etanol.png',
  './images/ambar.png',
  './images/du_fay.jpeg',
  './images/benjamin.jpeg'
];

/* Instala: pré-cacheia o shell (cada item tolerante a falha individual). */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

/* Ativa: remove caches antigos (de builds anteriores) e aquece o áudio. */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
      .then(function () { return warmAudio(); }) /* garante todo o áudio no cache p/ saltos instantâneos/offline */
  );
});

/* Aquece o cache de áudio de forma RESILIENTE: ao contrário do pré-cache do
   install (que falha em silêncio), aqui cada mp3 é tentado várias vezes com
   intervalo, de modo que uma oscilação de rede não deixe um arquivo de fora.
   É isso que faz um salto direto (ex.: marcador "A ideia do átomo" ->
   dialogo1.3.mp3, o maior arquivo) tocar na hora em vez de bufferizar. */
function warmAudio() {
  var AUDIO = SHELL.filter(function (u) { return /\.mp3$/.test(u); });
  return caches.open(CACHE).then(function (c) {
    function ensure(u, tries) {
      return c.match(u, { ignoreSearch: true }).then(function (hit) {
        if (hit) return; /* já está no cache */
        return fetch(u, { cache: 'reload' }).then(function (res) {
          if (res && (res.ok || res.type === 'opaque')) { return c.put(u, res.clone()); }
          throw new Error('bad-response');
        }).catch(function () {
          if (tries > 0) {
            return new Promise(function (r) { setTimeout(r, 1500); })
              .then(function () { return ensure(u, tries - 1); });
          }
        });
      });
    }
    return Promise.all(AUDIO.map(function (u) { return ensure(u, 4); }));
  });
}

/* Permite que a página peça o aquecimento (cobre SWs já instalados, que não
   disparam 'activate' de novo). */
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'warm-audio') { e.waitUntil(warmAudio()); }
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

  /* Mídia com Range (áudio/vídeo): monta um 206 Partial Content a partir do
     arquivo INTEIRO no cache. Sem isso, iOS/Safari (e às vezes Chrome) recusam
     a resposta 200 e a mídia simplesmente não toca OFFLINE. */
  if (req.headers.get('range')) {
    e.respondWith(abRangeResponse(req));
    return;
  }

  /* Demais assets (áudio sem range, imagens, ícones, fontes): stale-while-revalidate —
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

/* Responde um pedido com cabeçalho Range: usa o arquivo inteiro do cache e
   devolve só a fatia pedida como 206. Se não estiver no cache, vai pra rede. */
function abRangeResponse(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (cached) {
    if (cached) {
      return cached.arrayBuffer().then(function (buf) {
        return abBuildPartial(buf, req.headers.get('range'), cached.headers.get('Content-Type'));
      });
    }
    return fetch(req).catch(function () { return new Response('', { status: 504 }); });
  });
}

function abBuildPartial(buffer, rangeHeader, contentType) {
  var total = buffer.byteLength;
  var m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || '');
  var start = m && m[1] ? parseInt(m[1], 10) : 0;
  var end = m && m[2] ? parseInt(m[2], 10) : total - 1;
  if (isNaN(start) || start < 0) start = 0;
  if (isNaN(end) || end >= total) end = total - 1;
  if (start > end) start = 0;
  var chunk = buffer.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': contentType || 'application/octet-stream',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Content-Length': String(chunk.byteLength),
      'Accept-Ranges': 'bytes'
    }
  });
}
