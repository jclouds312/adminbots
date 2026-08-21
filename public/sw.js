// RestoBot IA Service Worker for PWA Offline Resilience & Firestore Sync
const CACHE_NAME = 'restobot-pwa-v2-resilient';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Allow API routes to be handled by network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-First with Cache fallback for navigation and static assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for offline support
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Listen to messages from clients (sync triggers, offline status broadcast)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_TRIGGER') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_FLUSH_REQUEST', timestamp: Date.now() });
      });
    });
  }
});

// Background Sync listener if supported by browser
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders-firestore') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BG_SYNC_FIRED', timestamp: Date.now() });
        });
      })
    );
  }
});

