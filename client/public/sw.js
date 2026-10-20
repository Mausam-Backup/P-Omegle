// Service Worker for Omegle Next PWA (Progressive Web App)
const CACHE_NAME = 'omegle-next-v2';

const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Bypass non-GET, API, WebSocket, and external backend requests
  if (
    request.method !== 'GET' ||
    request.url.includes('/ws') ||
    request.url.includes('/api/') ||
    request.url.includes('onrender.com') ||
    request.url.startsWith('chrome-extension:')
  ) {
    return;
  }

  // CRITICAL FIX FOR VERCEL BLANK SCREEN:
  // For HTML navigation requests, ALWAYS fetch from Network first!
  // This guarantees users always get the latest index.html with current Vite chunk hashes.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cached version ONLY if completely offline
          return caches.match(request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // For static assets (JS, CSS, images): Network first for JS/CSS chunks to avoid 404s after new builds
  if (request.url.includes('/assets/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Other static assets (images, icons): Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && request.url.startsWith(self.location.origin)) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkResponse;
        })
      );
    })
  );
});
