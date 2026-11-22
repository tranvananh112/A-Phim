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

const DEFAULT_HARDCODED_INTERESTS = [
    {
        "id": "phim-bo",
        "link": "danh-sach.html?list=phim-bo",
        "title": "Phim Bộ",
        "color": "#8b5cf6",
        "gradient": "linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4338ca 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/w1280/tMQmL8rEZul6mfXrzcOYYflXWYX.jpg",
        "colorRgb": "139, 92, 246",
        "themeColor": "#8b5cf6",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"></path></svg>",
        "iconName": "flame",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "phim-moi",
        "link": "danh-sach.html?list=phim-moi-cap-nhat",
        "title": "Phim Mới",
        "color": "#ef4444",
        "gradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/w1280/ft4D3bgpJrJ4m4nhnwmKxr10FwY.jpg",
        "colorRgb": "239, 68, 68",
        "themeColor": "#ef4444",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 14c1.5 2 6.5 2 8 0\"></path><line x1=\"9\" y1=\"9\" x2=\"9.01\" y2=\"9\"></line><line x1=\"15\" y1=\"9\" x2=\"15.01\" y2=\"9\"></line></svg>",
        "iconName": "smile",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "hanh-dong",
        "link": "categories.html?category=hanh-dong",
        "title": "Hành Động",
        "color": "#f97316",
        "gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/w1280/hTPHK7Bjjvqjc17m4blrak4QhNe.jpg",
        "colorRgb": "249, 115, 22",
        "themeColor": "#f97316",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"></path></svg>",
        "iconName": "flame",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "tinh-cam",
        "link": "categories.html?category=tinh-cam",
        "title": "Tình Cảm",
        "color": "#ec4899",
        "gradient": "linear-gradient(135deg, #ec4899 0%, #db2777 55%, #be185d 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/w1280/d5XKPrSEeWMoQbzc6qNI5Ewjj9r.jpg",
        "colorRgb": "236, 72, 153",
        "themeColor": "#ec4899",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"></path></svg>",
        "iconName": "heart",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "hai-huoc",
        "link": "categories.html?category=hai-huoc",
        "title": "Hài Hước",
        "color": "#eab308",
        "gradient": "linear-gradient(135deg, #eab308 0%, #ca8a04 55%, #854d0e 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/w1280/ykYenWf8y5YqyZFkDdmVeKczTMl.jpg",
        "colorRgb": "234, 179, 8",
        "themeColor": "#eab308",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 14c1.5 2 6.5 2 8 0\"></path><line x1=\"9\" y1=\"9\" x2=\"9.01\" y2=\"9\"></line><line x1=\"15\" y1=\"9\" x2=\"15.01\" y2=\"9\"></line></svg>",
        "iconName": "smile",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "hoat-hinh",
        "link": "danh-sach.html?list=hoat-hinh",
        "title": "Hoạt Hình",
        "color": "#10b981",
        "gradient": "linear-gradient(135deg, #10b981 0%, #059669 55%, #065f46 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/w1280/qX1Krx6zWIkF6q72fcB7sNlTrri.jpg",
        "colorRgb": "16, 185, 129",
        "themeColor": "#10b981",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"3\"></rect><polyline points=\"17 2 12 7 7 2\"></polyline></svg>",
        "iconName": "tv",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    }
];

async function loadDynamicInterests() {
    const cards = document.querySelectorAll('.interest-card');
    if (!cards.length) return;

    // 0. INSTANT HARDCODED RENDER: Đảm bảo 6 thẻ có ảnh nền và màu sắc đẹp ngay lập tức 0ms
    applyFullInterestsConfigToDOM(cards, DEFAULT_HARDCODED_INTERESTS);

    const usedImages = new Set();
    let fullInterestsConfig = null;
    let customBgs = {};

    // 1. INSTANT: Đọc cache LocalStorage nếu có
    try {
        if (localStorage.getItem('aphim_interests_version') !== 'v20261118_super_v1') {
            localStorage.removeItem('aphim_interests_config');
            localStorage.removeItem('cinestream_category_backgrounds');
            localStorage.setItem('aphim_interests_version', 'v20261118_super_v1');
        }
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

    // 2. BACKGROUND: Tải cấu hình mới nhất từ Backend API (timeout ngắn 1.5s không chặn UI)
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
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500);
                const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json()).catch(() => null);
                clearTimeout(timeoutId);
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
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1500);
                    const pubRes = await fetch(`${base}/api/settings/public?t=` + Date.now(), { signal: controller.signal }).then(r => r.json()).catch(() => null);
                    clearTimeout(timeoutId);
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
