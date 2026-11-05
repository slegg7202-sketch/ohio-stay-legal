/* BRAND: "Ohio Stay Legal" — working name, verification pending.
   Service worker: cache-first for this site's own pages and assets,
   so the packet keeps working offline after the app is installed.
   Bump CACHE_VERSION whenever a site file changes. */

var CACHE_VERSION = 'site-v2';
var CACHE_NAME = 'ohiostaylegal-' + CACHE_VERSION;

var CORE_FILES = [
  './',
  './index.html',
  './packet.html',
  './style.css',
  './checklist.js',
  './manifest.webmanifest'
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
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(function (response) {
        if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
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
