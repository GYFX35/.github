// public/service-worker.js

// Keep existing cache name and urlsToCache
const CACHE_NAME = 'customer-magazine-cache-v1'; // Or whatever it was
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/Octocat.png',
  // ... any other existing urlsToCache
];

// Keep existing 'install' event listener
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Keep existing 'activate' event listener
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Keep existing 'fetch' event listener
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(() => {
          // Optional: return a fallback page like an offline.html
        });
      })
  );
});


// --- NEW PUSH NOTIFICATION EVENT LISTENERS ---

// Listener for incoming push messages
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data ? event.data.text() : 'no data'}"`);

  let title = 'New Notification';
  let options = {
    body: 'Something new happened!',
    icon: '/logo192.png', // Default icon
    badge: '/logo192.png'  // Default badge (for Android)
  };

  if (event.data) {
    try {
      const data = event.data.json(); // Assuming server sends JSON payload
      title = data.title || title;
      options = {
        body: data.body || options.body,
        icon: data.icon || options.icon,
        badge: data.badge || options.badge,
        data: data.data || {} // Any custom data to pass to notificationclick
      };
    } catch (e) {
      // If data is not JSON, use it as body
      options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listener for notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close(); // Close the notification

  // Example: Open a specific URL or focus an existing window
  // You can pass data in the push message (and then in options.data) to customize this behavior
  const clickUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Check if the client's URL is the one we want to open/focus
        // You might need more sophisticated URL matching
        if (client.url === clickUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If no existing window is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});
