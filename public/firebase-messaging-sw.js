// Firebase Cloud Messaging Background Service Worker
// Automatically registered by Firebase Web SDK if needed
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "emergent-hall-ssjh2",
  appId: "1:429766421634:web:63ab0fa100e8ed0a69d89b",
  apiKey: "AIzaSyBjCTnJPmVZQIiee4_2MZ0M58banIBvh2k",
  messagingSenderId: "429766421634"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM Background ServiceWorker] Received background push message:', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || '🔥 ¡Nuevo Pedido en RestoBot!';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Comanda registrada en tiempo real en la PWA.',
      icon: payload.notification?.icon || '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: payload.data?.tag || `fcm-bg-${Date.now()}`,
      vibrate: [200, 100, 200, 100, 300],
      data: payload.data || {},
      actions: [
        { action: 'open_kds', title: '👨‍🍳 Ver en KDS' },
        { action: 'open_kanban', title: '📋 Ver Comanda' }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('[FCM SW] Firebase compat initialization skipped in offline mode:', e);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  let targetUrl = notifData.clickActionUrl || '/#kds_cocina';

  if (event.action === 'open_kds') {
    targetUrl = '/#kds_cocina';
  } else if (event.action === 'open_kanban') {
    targetUrl = '/#kanban_pedidos';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_NAVIGATE',
            url: targetUrl,
            data: notifData
          });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
