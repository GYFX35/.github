const CACHE_NAME = 'ar-boxing-game-cache-v1';
const ASSETS_TO_CACHE = [
    '.', // Alias for index.html (start_url)
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
    // Add other static assets like game images or sounds here if any
];

// Install event: cache core application shell assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] All assets cached successfully.');
                return self.skipWaiting(); // Force the waiting service worker to become the active service worker
            })
            .catch((error) => {
                console.error('[ServiceWorker] Caching failed:', error);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[ServiceWorker] Old caches cleared.');
            return self.clients.claim(); // Take control of uncontrolled clients
        })
    );
});

// Fetch event: serve assets from cache or network
self.addEventListener('fetch', (event) => {
    // We only want to cache GET requests for our app shell assets
    if (event.request.method !== 'GET') {
        // For non-GET requests (like POST to API), just pass through to the network
        // console.log('[ServiceWorker] Fetch (non-GET, skipping cache):', event.request.url);
        event.respondWith(fetch(event.request));
        return;
    }

    // For API calls, we generally want to go network-first for live game data.
    // This example focuses on caching the app shell.
    // If the request is for an API endpoint, go to network.
    if (event.request.url.includes('/game/')) {
        // console.log('[ServiceWorker] Fetch (API request, network first):', event.request.url);
        event.respondWith(
            fetch(event.request).catch(() => {
                // Optional: Could return a generic "offline" JSON response for API calls if desired
                // For now, just let it fail if network is down, as game logic is server-side.
                console.warn('[ServiceWorker] API fetch failed, no offline fallback for API implemented.');
            })
        );
        return;
    }

    // For other GET requests (app shell assets)
    // console.log('[ServiceWorker] Fetch (app asset):', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // console.log('[ServiceWorker] Returning from cache:', event.request.url);
                    return cachedResponse;
                }
                // console.log('[ServiceWorker] Not in cache, fetching from network:', event.request.url);
                return fetch(event.request).then((networkResponse) => {
                    // Optional: Cache successfully fetched new assets if they are part of the app shell
                    // This is a bit redundant if ASSETS_TO_CACHE is comprehensive and versioned with CACHE_NAME
                    // but can be useful for assets not explicitly listed or for a "cache on demand" strategy.
                    // For simplicity, we rely on the initial caching during 'install'.
                    // If you want to cache new assets dynamically:
                    // if (networkResponse && networkResponse.status === 200 && ASSETS_TO_CACHE.includes(new URL(event.request.url).pathname.substring(1))) {
                    //    const responseToCache = networkResponse.clone();
                    //    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                    // }
                    return networkResponse;
                }).catch((error) => {
                    console.error('[ServiceWorker] Fetch failed, and not in cache:', error);
                    // Optional: return an offline fallback page for HTML requests
                    // if (event.request.mode === 'navigate') {
                    //     return caches.match('offline.html'); // You would need to create and cache offline.html
                    // }
                });
            })
    );
});
```
