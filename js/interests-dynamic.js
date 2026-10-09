/**
 * Dynamic Interests Section — Static HTML Version with Admin Configuration Support
 * 
 * Luồng đồng bộ từ Admin (admin/banners.html) qua:
 *  - Đọc cache localStorage aphim_interests_config để hiển thị tức thì.
 *  - Đồng bộ màu sắc ánh xạ điện ảnh (--card-color, --card-rgb), icon SVG/Lottie, ảnh nền (imageUrl / bgUrl), link và tiêu đề.
 *  - Gọi API backend /api/settings/desktop-interests để cập nhật dữ liệu mới nhất.
 *  - Tự động fallback lấy ảnh từ Ophim API nếu chưa cấu hình.
 */

function hexToRgbString(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

function applyFullInterestsConfigToDOM(cards, configList) {
    if (!cards || !Array.isArray(configList) || !configList.length) return;

    cards.forEach((card, idx) => {
        const cfg = configList[idx];
        if (!cfg) return;

        const bgImgEl = card.querySelector('.interest-bg-img');
        const titleEl = card.querySelector('.interest-title');
        const lottieCircle = card.querySelector('.interest-lottie-circle');

        // 1. Ánh xạ màu (Aura & Color theme)
        const colorVal = cfg.color || cfg.themeColor || cfg.gradient;
        if (cfg.noAura === true || colorVal === 'none') {
            card.classList.add('no-aura');
            card.style.removeProperty('--card-color');
            card.style.removeProperty('--card-rgb');
        } else {
            card.classList.remove('no-aura');
            if (colorVal && colorVal !== 'none') {
                card.style.setProperty('--card-color', colorVal);
                const rgb = cfg.colorRgb || hexToRgbString(colorVal);
                if (rgb) {
                    card.style.setProperty('--card-rgb', rgb);
                }
            }
        }

        // 2. Tiêu đề (Title) & Màu chữ
        if (cfg.title && titleEl) {
            titleEl.textContent = cfg.title;
        }
        if (cfg.textColor && titleEl) {
            titleEl.style.color = cfg.textColor;
        }

        // 3. Đường dẫn chuyển hướng (Link / Onclick)
        if (cfg.link) {
            card.setAttribute('onclick', `location.href = '${cfg.link}'`);
        }

        // 4. Icon SVG / Biểu tượng
        if (cfg.iconSvg && lottieCircle) {
            lottieCircle.innerHTML = cfg.iconSvg;
            if (cfg.iconColor) {
                const svg = lottieCircle.querySelector('svg');
                if (svg) {
                    svg.style.stroke = cfg.iconColor;
                    svg.style.color = cfg.iconColor;
                }
            }
        }

        // 5. Cập nhật ảnh nền (Image URL) - Xử lý cả imageUrl, bgUrl, image, thumbnail, posterUrl
        const rawImg = cfg.imageUrl || cfg.bgUrl || cfg.image || cfg.thumbnail || cfg.posterUrl;
        if (rawImg && typeof rawImg === 'string' && rawImg.trim() !== '' && bgImgEl) {
            const cleanImg = rawImg.trim();
            const finalUrl = (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('/') || cleanImg.startsWith('data:'))
                ? cleanImg 
                : `https://phimimg.com/${cleanImg.startsWith('uploads/') ? '' : 'uploads/movies/'}${cleanImg}`;
            bgImgEl.style.backgroundImage = `url('${finalUrl}')`;
            bgImgEl.style.opacity = '1';
            card.setAttribute('data-has-custom-img', 'true');
        }
    });
}

function applyCustomBackgroundsToDOM(cards, customBgs) {
    if (!cards || !customBgs) return;
    cards.forEach(card => {
        // Không ghi đè nếu thẻ đã được cấu hình ảnh riêng từ admin
        if (card.getAttribute('data-has-custom-img') === 'true') return;

        const apiPath = card.getAttribute('data-api');
        const bgImgEl = card.querySelector('.interest-bg-img');
        if (!apiPath || !bgImgEl) return;

        const customUrl = customBgs[apiPath];
        if (customUrl && typeof customUrl === 'string' && customUrl.trim() !== '') {
            const cleanImg = customUrl.trim();
            const finalUrl = (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('/') || cleanImg.startsWith('data:'))
                ? cleanImg
                : `https://phimimg.com/${cleanImg.startsWith('uploads/') ? '' : 'uploads/movies/'}${cleanImg}`;
            
            bgImgEl.style.backgroundImage = `url('${finalUrl}')`;
            bgImgEl.style.opacity = '1';
            card.setAttribute('data-has-custom-img', 'true');
        }
    });
}

async function loadDynamicInterests() {
    const cards = document.querySelectorAll('.interest-card');
    if (!cards.length) return;

    const usedImages = new Set();
    let fullInterestsConfig = null;
    let customBgs = {};

    // 1. INSTANT: Đọc cache LocalStorage để hiển thị ngay lập tức
    try {
        const cachedInterests = localStorage.getItem('aphim_interests_config');
        if (cachedInterests) {
            fullInterestsConfig = JSON.parse(cachedInterests);
            if (Array.isArray(fullInterestsConfig) && fullInterestsConfig.length > 0) {
                applyFullInterestsConfigToDOM(cards, fullInterestsConfig);
            }
        }

        // Chỉ fallback đọc cinestream_category_backgrounds nếu chưa có aphim_interests_config
        if (!fullInterestsConfig || !fullInterestsConfig.length) {
            const cachedBgs = localStorage.getItem('cinestream_category_backgrounds');
            if (cachedBgs) {
                customBgs = JSON.parse(cachedBgs) || {};
                applyCustomBackgroundsToDOM(cards, customBgs);
            }
        }
    } catch (e) {
        console.warn('[Interests] LocalStorage error:', e);
    }

    // 2. BACKGROUND: Tải cấu hình mới nhất từ Backend API
    try {
        const baseUrls = [];
        if (typeof window.getBackendBaseURL === 'function') {
            const u = window.getBackendBaseURL();
            if (u && !baseUrls.includes(u)) baseUrls.push(u);
        }
        if (window.API_URL && !baseUrls.includes(window.API_URL)) {
            baseUrls.push(window.API_URL);
        }
        if (!baseUrls.includes('')) {
            baseUrls.push('');
        }

        let loadedFromApi = false;
        for (const base of baseUrls) {
            try {
                const endpoint = `${base}/api/settings/desktop-interests?t=` + Date.now();
                const res = await fetch(endpoint).then(r => r.json()).catch(() => null);
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    fullInterestsConfig = res.data;
                    localStorage.setItem('aphim_interests_config', JSON.stringify(fullInterestsConfig));
                    applyFullInterestsConfigToDOM(cards, fullInterestsConfig);
                    loadedFromApi = true;
                    break;
                }
            } catch (err) {}
        }

        // Fallback sang /api/settings/public nếu desktop-interests chưa có dữ liệu và local chưa có
        if (!loadedFromApi && (!fullInterestsConfig || !fullInterestsConfig.length)) {
            for (const base of baseUrls) {
                try {
                    const pubRes = await fetch(`${base}/api/settings/public?t=` + Date.now()).then(r => r.json()).catch(() => null);
                    if (pubRes && pubRes.success && pubRes.data?.content?.categoryBackgrounds) {
                        customBgs = pubRes.data.content.categoryBackgrounds;
                        localStorage.setItem('cinestream_category_backgrounds', JSON.stringify(customBgs));
                        applyCustomBackgroundsToDOM(cards, customBgs);
                        break;
                    }
                } catch (err) {}
            }
        }
    } catch (e) {
        console.warn('[Interests] Backend sync:', e);
    }

    // 3. Fallback Ophim API cho các thẻ chưa có ảnh nền cấu hình
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

    cards.forEach((card, index) => {
        if (card.getAttribute('data-has-custom-img') === 'true') return;
        const apiPath = card.getAttribute('data-api');
        const bgImgEl = card.querySelector('.interest-bg-img');
        if (!apiPath || !bgImgEl) return;

        const currentBg = bgImgEl.style.backgroundImage;
        if (!currentBg || currentBg === 'none' || currentBg.includes('url("")')) {
            loadAutoFromOphim(apiPath, bgImgEl, index);
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
    if (e.key === 'aphim_interests_config' || e.key === 'cinestream_category_backgrounds') {
        loadDynamicInterests();
    }
});

window.addEventListener('aphim:interests_updated', () => {
    loadDynamicInterests();
});

window.loadDynamicInterests = loadDynamicInterests;
