// Service Worker for AI Marketer Agent PWA - Phase 1

const CACHE_NAME = 'ai-marketer-cache-v1'; // Increment version to force update
const OFFLINE_FALLBACK_PAGE = '/offline.html'; // Will be created as a Flask template

// List of URLs to cache during the install phase
// Includes core static assets and main app routes.
const urlsToCache = [
  '/', // Home page
  '/affiliate-marketing',
  '/ads-optimization',
  '/offline.html', // The offline fallback page itself
  '/static/css/style.css',
  '/static/manifest.json', // Cache the manifest itself
  // Add paths to icons - ensure these match manifest.json and actual files
  '/static/icons/icon-144x144.png',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  // Add other critical JS files if any, e.g., if we had a global app.js
  // For now, assuming most JS is inline or part of Flask templates rendering.
];

// Install event: open cache and add core assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Opened cache:', CACHE_NAME);
        // Add all URLs to cache. If any request fails, the SW installation will fail.
        return cache.addAll(urlsToCache)
          .then(() => console.log('[ServiceWorker] All core assets cached successfully.'))
          .catch(error => {
            console.error('[ServiceWorker] Failed to cache one or more assets during install:', error);
            // Optional: throw error to indicate install failure if critical assets missing
          });
      })
      .catch(error => {
        console.error('[ServiceWorker] Failed to open cache during install:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients.');
      return self.clients.claim(); // Take control of currently open clients
    })
  );
});

// Fetch event: serve assets from cache or network, with offline fallback
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests for caching
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache hit - return response from cache
        if (cachedResponse) {
          console.log(`[ServiceWorker] Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }

        // Not in cache - try to fetch from network
        console.log(`[ServiceWorker] Fetching from network: ${event.request.url}`);
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // If the request is for navigation (HTML page) and fails, show offline page.
              // Otherwise, just return the failed response (e.g. for an image that's missing)
              if (event.request.mode === 'navigate') {
                 console.log('[ServiceWorker] Network fetch failed for navigation, serving offline page.');
                 return caches.match(OFFLINE_FALLBACK_PAGE);
              }
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            // If the request is for one of our app's pages or static assets, try to cache it dynamically.
            // Be careful with what you cache dynamically to avoid filling up storage.
            // For Phase 1, we primarily rely on the initial cache.
            // We could add logic here to cache other successful GET requests if desired.
            /*
            if (urlsToCache.includes(event.request.url) || event.request.url.startsWith(self.location.origin + "/static/")) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log(`[ServiceWorker] Caching new resource: ${event.request.url}`);
                  cache.put(event.request, responseToCache);
                });
            }
            */

            return networkResponse;
          }
        ).catch((error) => {
          // Network request failed (e.g., user is offline)
          console.log(`[ServiceWorker] Network fetch failed for ${event.request.url}:`, error);
          // If the request was for navigation (an HTML page), try to serve the offline fallback page.
          if (event.request.mode === 'navigate') {
            console.log('[ServiceWorker] Serving offline fallback page.');
            return caches.match(OFFLINE_FALLBACK_PAGE);
          }
          // For other types of requests (e.g. images, CSS), we don't have a specific fallback,
          // so the browser's default error will be shown.
        });
      })
  );
});
