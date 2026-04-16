// =====================================================
// A Phim Service Worker — v5
// Chiến lược:
//   HTML / CSS / JS  → Network-First (luôn lấy mới nhất)
//   Ảnh / Media       → Cache-First (ít thay đổi)
//   Fonts Google      → Cache-First (bất biến)
//   API OPhim         → Stale-While-Revalidate
// =====================================================

const CACHE_VERSION  = 'aphim-v5';
const FONT_CACHE     = 'aphim-fonts-v1';
const IMAGE_CACHE    = 'aphim-images-v5';
const API_CACHE      = 'aphim-api-v2';

const ALL_CACHES = [CACHE_VERSION, FONT_CACHE, IMAGE_CACHE, API_CACHE];

// ── Install ──────────────────────────────────────────
self.addEventListener('install', event => {
    // Kích hoạt ngay, không chờ tab cũ đóng
    self.skipWaiting();
});

// ── Activate: xóa TOÀN BỘ cache cũ ──────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => !ALL_CACHES.includes(k))
                    .map(k => {
                        console.log('[SW] Xóa cache cũ:', k);
                        return caches.delete(k);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Bỏ qua non-GET
    if (request.method !== 'GET') return;

    // Bỏ qua phim-x (cross-origin embeds)
    if (url.pathname.includes('phim-x')) return;

    // ── 1. Google Fonts — Cache First (bất biến) ──────
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request, FONT_CACHE));
        return;
    }

    // ── 2. OPhim API — Stale-While-Revalidate ─────────
    if (url.hostname.includes('ophim') || url.hostname.includes('img.ophim')) {
        event.respondWith(staleWhileRevalidate(request, API_CACHE));
        return;
    }

    // ── 3. Cross-origin (ads, analytics...) — bỏ qua ─
    if (url.origin !== location.origin) return;

    // ── 4. Ảnh gốc — Cache First (ít thay đổi) ────────
    if (/\.(webp|png|jpg|jpeg|gif|svg|ico)(\?.*)?$/.test(url.pathname)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // ── 5. HTML / CSS / JS — Network First ────────────
    // Luôn lấy từ mạng để nhận bản cập nhật mới nhất.
    // Nếu offline → dùng cache dự phòng.
    event.respondWith(networkFirst(request, CACHE_VERSION));
});

// ─────────────────────────────────────────────────────
// Các hàm chiến lược cache
// ─────────────────────────────────────────────────────

/** Network First: thử mạng → cache nếu offline */
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

/** Cache First: trả cache ngay → nếu không có thì fetch và lưu */
async function cacheFirst(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

/** Stale-While-Revalidate: trả cache ngay & cập nhật ngầm */
async function staleWhileRevalidate(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);

    const networkFetch = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);

    return cached || await networkFetch || new Response(
        JSON.stringify({ error: 'Network failure' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
}

// ── Nhận lệnh từ client ───────────────────────────────
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data?.type === 'CLEAR_CACHE') {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
    }
});
