const CACHE_NAME = 'global-connect-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/culture.html',
  '/interaction.html',
  '/partnership.html',
  '/css/style.css',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/js/main.js',
  '/js/camera.js',
  '/js/camera-culture.js',
  '/js/notifications.js',
  '/js/sharing.js',
  '/dashboard.html',
  '/games/placeholder_game1/index.html',
  '/games/placeholder_game2/index.html',
  '/games/placeholder_game3/index.html',
  '/js/culture-submission.js',
  '/profile.html',
  '/js/profile.js'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

// Listener for incoming push messages
self.addEventListener('push', event => {
  console.log('Service Worker: Push Received.');
  let data = {};
  if (event.data) {
    try {
      data = event.data.json(); // Assuming push data is sent as JSON
      console.log('Service Worker: Push data: ', data);
    } catch (e) {
      console.log('Service Worker: Push data was not JSON, treating as text.');
      data = { title: 'FindMe', body: event.data.text() };
    }
  } else {
    console.log('Service Worker: Push event but no data');
    // Default notification if no data is sent with the push
    data = { title: 'FindMe Update', body: 'You have a new message from FindMe!' };
  }

  const title = data.title || 'FindMe';
  const options = {
    body: data.body || 'New content available.',
    icon: 'images/icons/icon-192x192.png', // Default icon
    badge: 'images/icons/icon-192x192.png', // Icon for notification tray (Android specific)
    // tag: 'findme-notification-tag', // Optional: use a tag to prevent multiple similar notifications
    // data: { url: data.url || '/' } // Optional: pass data to notificationclick handler
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Listener for notification click
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close(); // Close the notification

  // This looks for an existing FindMe tab and focuses it, otherwise opens a new one.
  // You can customize the URL to open based on notification data.
  // const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  const urlToOpen = '/index.html'; // Default to home page

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        // If a FindMe window/tab is already open, focus it.
        // You might need a more specific check if your app can have multiple distinct windows.
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no FindMe window/tab is open, open a new one.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete, now controlling client.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: Found in cache:', event.request.url);
          return response; // Serve from cache
        }
        console.log('Service Worker: Not in cache, fetching from network:', event.request.url);
        return fetch(event.request); // Fetch from network
      })
      .catch(error => {
        console.error('Service Worker: Fetch failed:', error);
        // Optionally, return a fallback page for offline if not found in cache
        // if (event.request.mode === 'navigate') {
        //   return caches.match('/offline.html'); // You would need to create and cache an offline.html
        // }
      })
  );
});
