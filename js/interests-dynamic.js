/**
 * Dynamic Interests Section — Static HTML Version with Admin Configuration Support
 * 
 * Luồng đồng bộ từ backend qua:
 *  - Đọc cache localStorage cinestream_category_backgrounds để hiển thị tức thì.
 *  - Gọi API backend /api/settings/public để cập nhật ảnh mới nhất do Admin cấu hình.
 *  - Nếu có cấu hình, sử dụng ảnh của Admin.
 *  - Nếu không có cấu hình hoặc ảnh lỗi, fallback tự động lấy ảnh ngẫu nhiên từ Ophim API.
 */
async function loadDynamicInterests() {
    const cards = document.querySelectorAll('.interest-card[data-api]');
    if (!cards.length) return;

    const usedImages = new Set();
    let customBgs = {};

    // 1. INSTANT: Đọc cache LocalStorage để đổi ngay lập tức
    try {
        const cached = localStorage.getItem('cinestream_category_backgrounds');
        if (cached) {
            customBgs = JSON.parse(cached) || {};
            applyCustomBackgroundsToDOM(cards, customBgs);
        }
    } catch (e) {}

    // 2. BACKGROUND: Tải cấu hình mới nhất từ Backend Admin
    try {
        const apiUrl = typeof window.getBackendBaseURL === 'function' ? window.getBackendBaseURL() : '';
        if (apiUrl) {
            const res = await fetch(`${apiUrl}/api/settings/public`);
            const data = await res.json();
            if (data.success && data.data?.content?.categoryBackgrounds) {
                customBgs = data.data.content.categoryBackgrounds;
                localStorage.setItem('cinestream_category_backgrounds', JSON.stringify(customBgs));
                applyCustomBackgroundsToDOM(cards, customBgs);
            }
        }
    } catch (e) {
        console.warn('[Interests] Could not load custom category backgrounds from backend:', e);
    }

    /**
     * Lấy ảnh thumbnail từ Ophim API cho một apiPath nhất định
     */
    const fetchImageFromOphim = async (apiPath, page = 1) => {
        try {
            if (typeof movieAPI === 'undefined') return null;
            const response = await movieAPI.fetchWithFallback(`/${apiPath}?page=${page}`);
            const rawData = await response.json();
            const data = movieAPI.normalizeResponse(rawData);

            const items = data?.data?.items || [];
            if (!items.length) return null;

            for (const movie of items) {
                const thumbUrl = movie.thumb_url || movie.poster_url;
                if (thumbUrl && !usedImages.has(thumbUrl)) {
                    return thumbUrl;
                }
            }

            return items[0]?.thumb_url || items[0]?.poster_url || null;
        } catch (e) {
            return null;
        }
    };

    /**
     * Tự động tải từ Ophim API (Fallback khi admin chưa cấu hình)
     */
    const loadAutoFromOphim = async (apiPath, bgImgEl, index) => {
        const page = (index % 3) + 1;
        let thumbUrl = await fetchImageFromOphim(apiPath, page);

        if (!thumbUrl || usedImages.has(thumbUrl)) {
            const altPage = page === 1 ? 2 : 1;
            thumbUrl = await fetchImageFromOphim(apiPath, altPage);
        }

        if (thumbUrl) {
            const finalUrl = thumbUrl.startsWith('http')
                ? thumbUrl
                : `https://phimimg.com/${thumbUrl.startsWith('uploads/') ? '' : 'uploads/movies/'}${thumbUrl}`;
            
            bgImgEl.style.backgroundImage = `url('${finalUrl}')`;
            bgImgEl.style.opacity = '1';
            usedImages.add(thumbUrl);
        }
    };

    // Xử lý fallback cho các card chưa có ảnh admin
    cards.forEach((card, index) => {
        const apiPath = card.getAttribute('data-api');
        const bgImgEl = card.querySelector('.interest-bg-img');
        if (!apiPath || !bgImgEl) return;

        if (!customBgs[apiPath] || customBgs[apiPath].trim() === '') {
            loadAutoFromOphim(apiPath, bgImgEl, index);
        }
    });
}

function applyCustomBackgroundsToDOM(cards, customBgs) {
    if (!cards || !customBgs) return;
    cards.forEach(card => {
        const apiPath = card.getAttribute('data-api');
        const bgImgEl = card.querySelector('.interest-bg-img');
        if (!apiPath || !bgImgEl) return;

        const customUrl = customBgs[apiPath];
        if (customUrl && customUrl.trim() !== '') {
            const finalUrl = customUrl.trim().startsWith('http')
                ? customUrl.trim()
                : `https://phimimg.com/${customUrl.trim().startsWith('uploads/') ? '' : 'uploads/movies/'}${customUrl.trim()}`;
            
            bgImgEl.style.backgroundImage = `url('${finalUrl}')`;
            bgImgEl.style.opacity = '1';
        }
    });
}

// -- Boot & Real-time cross-tab Sync --
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDynamicInterests);
} else {
    loadDynamicInterests();
}

window.addEventListener('storage', (e) => {
    if (e.key === 'cinestream_category_backgrounds') {
        loadDynamicInterests();
    }
});

window.loadDynamicInterests = loadDynamicInterests;

