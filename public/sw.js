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

// ----------------------------------------------------------------------
// FIREBASE CLOUD MESSAGING (FCM) & WEB PUSH BACKGROUND HANDLERS
// ----------------------------------------------------------------------

// Listen for incoming Push events when PWA is in background or closed
self.addEventListener('push', (event) => {
  console.log('[SW Push] Push notification event received:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'RestoBot IA', body: event.data.text() };
    }
  }

  const notificationTitle = data.notification?.title || data.title || '🔥 ¡Nuevo Pedido en RestoBot!';
  const notificationBody = data.notification?.body || data.body || 'Comanda recibida en tiempo real desde WhatsApp.';
  const notificationCategory = data.data?.category || data.category || 'new_order';
  const orderId = data.data?.orderId || data.orderId || '';
  const clickUrl = data.data?.clickActionUrl || data.clickActionUrl || '/#kds_cocina';

  const notificationOptions = {
    body: notificationBody,
    icon: data.notification?.icon || data.icon || '/icon-192.svg',
    badge: data.badge || '/icon-192.svg',
    tag: data.tag || `restobot-notif-${notificationCategory}-${orderId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 300],
    data: {
      url: clickUrl,
      orderId: orderId,
      category: notificationCategory,
      timestamp: Date.now(),
      payload: data
    },
    actions: [
      { action: 'open_kds', title: '👨‍🍳 Ver en KDS' },
      { action: 'open_kanban', title: '📋 Ver Comanda' }
    ]
  };

  event.waitUntil(
    Promise.all([
      // 1. Show system notification
      self.registration.showNotification(notificationTitle, notificationOptions),
      // 2. Notify any open client windows
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_RECEIVED',
            payload: {
              title: notificationTitle,
              body: notificationBody,
              category: notificationCategory,
              orderId,
              timestamp: new Date().toISOString(),
              data
            }
          });
        });
      })
    ])
  );
});

// Handle User Click on Notification in OS tray or lockscreen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  console.log('[SW Push] Notification clicked:', event.action, event.notification.data);

  const action = event.action;
  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/';

  if (action === 'open_kds') {
    targetUrl = '/#kds_cocina';
  } else if (action === 'open_kanban') {
    targetUrl = '/#kanban_pedidos';
  }

  // Focus existing open tab or open a new window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_NAVIGATE',
            url: targetUrl,
            orderId: notifData.orderId,
            category: notifData.category
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});


