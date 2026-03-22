const CACHE_NAME = 'aphim-v2';
const RUNTIME_CACHE = 'aphim-runtime-v2';

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

    // ─── BYPASS PHIM-X.HTML ───────────────────────────────────────────────────
    // Không cache phim-x.html vì có query params động và cross-origin embeds
    if (url.pathname.includes('phim-x')) {
        return; // Browser xử lý trực tiếp, không qua SW
    }

    // ─── CACHE GOOGLE FONTS (30 ngày) ───────────────────────────────────────
    // Font chữ không bao giờ thay đổi URL nên cache lâu là an toàn.
    // Lần đầu: tải từ Google. Lần sau: dùng cache → không cần mạng.
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.open('aphim-fonts-v1').then(cache =>
                cache.match(request).then(cached => {
                    if (cached) return cached; // Có cache → trả ngay
                    return fetch(request).then(response => {
                        if (response.ok) cache.put(request, response.clone());
                        return response;
                    });
                })
            )
        );
        return;
    }

    // ─── STALE-WHILE-REVALIDATE CHO API OPHIM ────────────────────────────────
    // Trả về cache ngay (nếu có) → người dùng thấy phim tức thì.
    // Đồng thời fetch mới ở background → lần sau có data mới hơn.
    if (url.hostname.includes('ophim')) {
        event.respondWith(
            caches.open('aphim-api-v1').then(cache =>
                cache.match(request).then(cached => {
                    // Background fetch để cập nhật cache
                    const networkFetch = fetch(request).then(response => {
                        if (response.ok) cache.put(request, response.clone());
                        return response;
                    }).catch(() => cached);

                    // Trả cache ngay nếu có, không thì chờ network
                    return cached || networkFetch;
                })
            )
        );
        return;
    }

    // Skip các cross-origin khác (quảng cáo, analytics...)
    if (url.origin !== location.origin) {
        return;
    }

    // Network first strategy for HTML pages and API calls
    if (request.mode === 'navigate' ||
        (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) ||
        url.pathname.includes('/api/') ||
        url.hostname.includes('ophim')) {
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
                }).catch(error => {
                    // Fetch failed, return cached or error response
                    console.log('⚠️ SW: Fetch failed for', request.url);
                    return cachedResponse || new Response('Network error', {
                        status: 408,
                        statusText: 'Request Timeout'
                    });
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
