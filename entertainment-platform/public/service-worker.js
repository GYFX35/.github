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
    '/camera.html',
    '/notifications.html',
    '/style.css',
    '/manifest.json',
    '/src/index.js',
    // Add paths to icons once they are available
    // '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png'
];

// Install a service worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
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

// Listen for push events
self.addEventListener('push', event => {
    console.log('Service Worker: Push event received.', event);
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.warn('Service Worker: Push event data is not JSON, treating as text.', e);
            data = { title: 'Push Notification', body: event.data.text() };
        }
    }

    const title = data.title || 'Push Notification';
    const options = {
        body: data.body || 'You have a new message.',
        icon: '/icons/icon-192x192.png', // Optional: Add an icon
        badge: '/icons/badge-72x72.png', // Optional: Add a badge for Android
        // other options like vibrate, actions etc. can be added here
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for messages from client (for test notification)
self.addEventListener('message', event => {
    console.log('Service Worker: Message received from client.', event.data);
    if (event.data && event.data.type === 'SHOW_TEST_NOTIFICATION') {
        const title = event.data.title || 'Test Notification';
        const body = event.data.body || 'This is a test notification shown via client message.';
        const options = {
            body: body,
            icon: '/icons/icon-192x192.png',
        };
        self.registration.showNotification(title, options)
            .then(() => console.log('Service Worker: Test notification shown.'))
            .catch(err => console.error('Service Worker: Error showing test notification:', err));
    }
});
