const CACHE_NAME = 'aphim-v1';
const RUNTIME_CACHE = 'aphim-runtime';

// Files to cache immediately
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/navigation-smooth.css',
    '/css/skeleton-loading.css',
    '/js/auth.js',
    '/js/api.js',
    '/logo_aphim1.png',
    '/favicon.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Network first strategy for API calls
    if (url.pathname.includes('/api/') || url.hostname.includes('ophim')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache first strategy for static assets
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });

                    return response;
                });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
