// /service-worker.js
const CACHE_NAME = 'app-shell-v2'; // bump to invalidate old assets
const ASSETS = [
  // Static assets that rarely change. Replace to match your build output:
  '/ck-forest-gardens-booking-app/manifest.json',
  '/ck-forest-gardens-booking-app/icons/icon-192.png',
  '/ck-forest-gardens-booking-app/icons/icon-512.png',
  // Add your compiled JS bundle path(s) below (example):
  // '/index.js'            // if you bundled to index.js
  // '/assets/index-abc123.js', '/assets/vendor-xyz456.js' // if using Vite
];

// Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Routing strategy:
// - HTML pages ("/" and "/index.html"): network-first (fresh UI), cache fallback offline.
// - API: network-first (real data), cache fallback if offline.
// - Everything else (static assets): cache-first (fast, reliable).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML = event.request.headers.get('accept')?.includes('text/html');

  // API network-first
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // HTML network-first to avoid stale UI
  if (isHTML || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        // Skip opaque/no-store responses
        const resClone = res.clone();
        const cacheControl = res.headers.get('Cache-Control') || '';
        if (res.ok && !cacheControl.includes('no-store')) {
          caches.open(CACHE_NAME).then((c) => c.put(event.request, resClone));
        }
        return res;
      });
    })
  );
});
