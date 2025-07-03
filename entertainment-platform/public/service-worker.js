const CACHE_NAME = 'entertainment-platform-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/videos.html',
    '/music.html',
    '/games.html',
    '/news.html',
    '/community.html',
    '/about.html',
    '/contact.html',
    '/video-detail-1.html',
    '/album-detail-1.html',
    '/game-detail-1.html',
    '/style.css',
    '/manifest.json',
    '/src/index.js',
    // Add paths to icons once they are available
    // '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png'
];

// Install a service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
            )
    );
});

// Update a service worker
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
