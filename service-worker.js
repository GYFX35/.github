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
  '/js/camera-culture.js'
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
