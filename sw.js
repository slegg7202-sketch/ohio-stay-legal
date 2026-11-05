/* BRAND: "Ohio Stay Legal" — name decided by Stephen Legg on 2026-11-04 (state-file cross-check clean; historical registry portal blocked, residual risk accepted by him).
   Service worker: page visits load from the network first, so the
   packet always opens; the cache is only an offline backup and a
   speed-up for static files (style, scripts, icons).
   Bump CACHE_VERSION whenever a site file changes.

   v5 fix (2026-11-04): the host redirects /packet.html to /packet.
   v1–v4 cached that redirected response and served it back to page
   navigations, which browsers refuse — the packet page failed with
   ERR_FAILED for every returning visitor. Navigations are now
   network-first, the cache stores the canonical /packet address,
   and redirected responses are never stored or served to a page. */

var CACHE_VERSION = 'site-v5';
var CACHE_NAME = 'ohiostaylegal-' + CACHE_VERSION;

var CORE_FILES = [
  './',
  './packet',
  './style.css',
  './checklist.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        if (name !== CACHE_NAME) {
          return caches.delete(name);
        }
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') {
    return;
  }

  /* Page visits: network first. A cached copy is used only when the
     network is unreachable, and only a copy that is not a redirect. */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.ok && !response.redirected) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          if (cached && !cached.redirected) {
            return cached;
          }
          if (event.request.url.indexOf('packet') !== -1) {
            return caches.match('./packet');
          }
          return caches.match('./');
        });
      })
    );
    return;
  }

  /* Static files: cache first, then network. */
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached && !cached.redirected) {
        return cached;
      }
      return fetch(event.request).then(function (response) {
        if (response && response.ok && !response.redirected && new URL(event.request.url).origin === self.location.origin) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      });
    })
  );
});
