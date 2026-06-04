// Service Worker SponsoMed — Web Push Handler
const APP_NAME = 'SponsoMed';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try { payload = event.data.json(); }
  catch { payload = { title: APP_NAME, body: event.data.text() }; }
  const { title, body, type = 'info', link = '/', icon } = payload;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/favicon.png',
      badge: '/favicon.png',
      tag: type,
      renotify: true,
      vibrate: [200, 100, 200],
      data: { link },
      actions: [
        { action: 'open',    title: 'Voir' },
        { action: 'dismiss', title: 'Ignorer' },
      ],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const link = event.notification.data?.link || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', link });
          return;
        }
      }
      return self.clients.openWindow(link);
    })
  );
});
