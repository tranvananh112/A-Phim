const ADMIN_STORAGE_KEYS = {
    ADMIN_TOKEN: 'cinestream_admin_token',
    ADMIN_USER:  'cinestream_admin_user'
};

const ADMIN_CONFIG = {
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'admin123'
    }
};

// API Configuration
// ─── DYNAMIC AUTO-FAILOVER BACKEND RESOLVER ───
// Fixes old backend expiring tomorrow by auto-detecting and promoting the new one
const BACKEND_OPTIONS = {
    NEW: 'https://a-phim-production-523d.up.railway.app',
    OLD: 'https://a-phim-production-c87b.up.railway.app'
};

// Retrieve active backend. Defaults to OLD until NEW is responsive, or OLD dies.
let chosenBackend = localStorage.getItem('cinestream_active_backend') || BACKEND_OPTIONS.OLD;

if (localStorage.getItem('cinestream_new_backend_active') === 'true') {
    chosenBackend = BACKEND_OPTIONS.NEW;
}

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    chosenBackend = 'http://localhost:5000';
}

// Default Fallback configuration
const API_CONFIG = {
    // Backend API - Auto-detect environment
    BACKEND_URL: chosenBackend + '/api',

    // Default Ophim API (primary)
    OPHIM_URL: 'https://ophim1.com/v1/api',

    // Default Ophim17 API (secondary - more movies)
    OPHIM17_URL: 'https://ophim17.cc',

    ENDPOINTS: {
        MOVIE_LIST: '/danh-sach/phim-moi-cap-nhat',
        MOVIE_DETAIL: '/phim',
        SEARCH: '/tim-kiem',
        CATEGORY: '/the-loai',
        COUNTRY: '/quoc-gia'
    },
    IMAGE_BASE: 'https://img.ophim.live/uploads/movies/',
    STREAM_BASE: 'https://vip.opstream13.com',

    // Use backend or direct Ophim FOR MOVIES
    USE_BACKEND_FOR_MOVIES: false,
    USE_BACKEND_FOR_AUTH: true,
    USE_MULTIPLE_SOURCES: false
};

// ─ ─Dynamic Configuration Override ─ 
// Apply cached config immediately for fast render
try {
    const cachedConfigStr = localStorage.getItem('cinestream_public_settings');
    if (cachedConfigStr) {
        const cachedContent = JSON.parse(cachedConfigStr);
        if (cachedContent.apiBase) API_CONFIG.OPHIM_URL = cachedContent.apiBase;
        if (cachedContent.apiSecondary) API_CONFIG.OPHIM17_URL = cachedContent.apiSecondary;
        if (typeof cachedContent.enableMultipleSources === 'boolean') API_CONFIG.USE_MULTIPLE_SOURCES = cachedContent.enableMultipleSources;
        if (cachedContent.watermarkUrl) API_CONFIG.WATERMARK_URL = cachedContent.watermarkUrl;
        if (typeof cachedContent.enableWatermark === 'boolean') API_CONFIG.ENABLE_WATERMARK = cachedContent.enableWatermark;
        if (typeof cachedContent.enablePhimX === 'boolean') API_CONFIG.ENABLE_PHIM_X = cachedContent.enablePhimX;
        if (typeof cachedContent.maintenanceMode === 'boolean') API_CONFIG.MAINTENANCE_MODE = cachedContent.maintenanceMode;
        if (typeof cachedContent.allowRegister === 'boolean') API_CONFIG.ALLOW_REGISTER = cachedContent.allowRegister;
        if (typeof cachedContent.allowComments === 'boolean') API_CONFIG.ALLOW_COMMENTS = cachedContent.allowComments;
    }
} catch (e) { console.error('Cache config read error:', e); }

// Fetch fresh config in background
(async function syncServerConfig() {
    try {
        const res = await fetch(`${API_CONFIG.BACKEND_URL}/settings/public`);
        const data = await res.json();
        if (data && data.success && data.data) {
            const { content, general } = data.data;
            let configMap = {
                apiBase: content?.apiBase,
                apiSecondary: content?.apiSecondary,
                enableMultipleSources: content?.enableMultipleSources,
                enableWatermark: content?.enableWatermark,
                watermarkUrl: content?.watermarkUrl,
                enablePhimX: content?.enablePhimX,
                autoplayDelay: content?.autoplayDelay,
                defaultServer: content?.defaultServer,
                logoUrl: general?.logoUrl,
                maintenanceMode: general?.maintenanceMode,
                allowRegister: general?.allowRegister,
                allowComments: general?.allowComments,
                siteName: general?.siteName
            };
            
            // Check diff
            const oldStr = localStorage.getItem('cinestream_public_settings');
            const newStr = JSON.stringify(configMap);
            
            if (oldStr !== newStr) {
                localStorage.setItem('cinestream_public_settings', newStr);
                // Dispatch event — pages listen to update UI live
                window.dispatchEvent(new CustomEvent('configSynced', { detail: configMap }));
                
                // Override runtime values
                if (configMap.apiBase) API_CONFIG.OPHIM_URL = configMap.apiBase;
                if (configMap.apiSecondary) API_CONFIG.OPHIM17_URL = configMap.apiSecondary;
                if (typeof configMap.enableMultipleSources === 'boolean') API_CONFIG.USE_MULTIPLE_SOURCES = configMap.enableMultipleSources;
                if (configMap.watermarkUrl) API_CONFIG.WATERMARK_URL = configMap.watermarkUrl;
                if (typeof configMap.enableWatermark === 'boolean') API_CONFIG.ENABLE_WATERMARK = configMap.enableWatermark;
                if (typeof configMap.enablePhimX === 'boolean') API_CONFIG.ENABLE_PHIM_X = configMap.enablePhimX;
                if (typeof configMap.maintenanceMode === 'boolean') API_CONFIG.MAINTENANCE_MODE = configMap.maintenanceMode;
                if (typeof configMap.allowRegister === 'boolean') API_CONFIG.ALLOW_REGISTER = configMap.allowRegister;
                if (typeof configMap.allowComments === 'boolean') API_CONFIG.ALLOW_COMMENTS = configMap.allowComments;
            }
        }
    } catch (e) {
        console.warn('Silent fail: could not load public settings', e);
    }
})();

// App Configuration
const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    VIDEO_QUALITIES: ['360p', '480p', '720p', '1080p', '4K'],
    PLAYBACK_SPEEDS: [0.5, 0.75, 1, 1.25, 1.5, 2],
    SUBSCRIPTION_PLANS: {
        FREE: {
            id: 'FREE',
            name: 'Cơ bản',
            price: 0,
            features: ['Xem phim miễn phí', 'Chất lượng SD', 'Có quảng cáo'],
            quality: 'SD', devices: 1,
            ads: true,
            coinsReward: 0
        },
        PREMIUM: {
            id: 'PREMIUM',
            name: 'Cao cấp',
            price: 69000,
            features: ['Không quảng cáo', 'Chất lượng Full HD', 'Tải phim offline', 'Tặng 5.000 Xu'],
            quality: 'FHD', devices: 3,
            ads: false,
            coinsReward: 5000
        },
        FAMILY: {
            id: 'FAMILY',
            name: 'Gia đình',
            price: 699000,
            features: ['Không quảng cáo', 'Chất lượng 4K', 'Tải phim offline', 'Chia sẻ 5 màn hình', 'Tặng 50.000 Xu'],
            quality: '4K', devices: 5,
            ads: false,
            yearly: true,
            coinsReward: 50000
        }
    }
};

// Backward compatibility and Global Helper
const API_BASE_URL = chosenBackend;

// Global helper to get base URL without /api suffix
window.getBackendBaseURL = function() {
    if (window.API_CONFIG && window.API_CONFIG.BACKEND_URL) {
        return window.API_CONFIG.BACKEND_URL.replace(/\/api$/, '');
    }
    return API_BASE_URL;
};

// Global Sync for Hidden Movies
// We dispatch 'hiddenMoviesSynced' event when done
window.is_hidden_movies_synced = false;

(async function syncHiddenMovies() {
    try {
        const res = await fetch(`${API_CONFIG.BACKEND_URL}/movies/hidden/list`);
        const data = await res.json();
        if (data && data.success) {
            localStorage.setItem('cinestream_hidden_movies', JSON.stringify(data.data));
            window.is_hidden_movies_synced = true;
            window.dispatchEvent(new CustomEvent('hiddenMoviesSynced', { detail: data.data }));
        }
    } catch (e) {
        console.warn('Could not connect to backend for hidden movies sync:', e);
        // Ensure flag is set even on failure to avoid infinite waiting
        window.is_hidden_movies_synced = true;
    }
})();

// Real-time synchronization for hidden movies across different origins/tabs
setInterval(async () => {
    // Only poll if the tab is currently active/visible to save resources
    if (document.hidden) return;
    
    try {
        const res = await fetch(`${API_CONFIG.BACKEND_URL}/movies/hidden/list`);
        const data = await res.json();
        if (data && data.success) {
            const currentDataStr = localStorage.getItem('cinestream_hidden_movies');
            const newDataStr = JSON.stringify(data.data);
            
            // Only dispatch event if data has actually changed
            if (currentDataStr !== newDataStr) {
                localStorage.setItem('cinestream_hidden_movies', newDataStr);
                window.is_hidden_movies_synced = true;
                window.dispatchEvent(new CustomEvent('hiddenMoviesSynced', { detail: data.data }));
            }
        }
    } catch (e) {
        // Silently fail during polling if backend is unreachable
    }
}, 3000); // Polling every 3 seconds

// Utility helper: Trả về đối tượng CSS class & HTML badge
window.getHiddenMovieOverlay = function(slug) {
    const hidden = JSON.parse(localStorage.getItem('cinestream_hidden_movies') || '[]');
    if (hidden && Array.isArray(hidden) && hidden.includes(slug)) {
        return {
            badge: `<div class="absolute top-2 left-2 z-30 pointer-events-none">
                <div class="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl flex items-center gap-2 transform transition-transform group-hover:scale-105">
                    <div class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
                    <span class="text-white text-[10px] font-black uppercase tracking-[0.15em] drop-shadow-sm">Đang Ẩn</span>
                </div>
            </div>`,
            imgClass: 'grayscale brightness-[0.3] contrast-[0.8] blur-[1px] opacity-80 transition-all duration-700',
            containerClass: 'pointer-events-none select-none touch-none cursor-not-allowed filter-none' // Filter none to keep badge clear
        };
    }
    return { badge: '', imgClass: '', containerClass: '' };
};


// 🚀 AUTO-SWITCH ENGINE: Background Active Probe to Promote NEW Backend when online
(async function probeAndMigrateBackend() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;
    
    const checkUrl = `${BACKEND_OPTIONS.NEW}/api/settings/public`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
        const res = await fetch(checkUrl, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (res.ok) {
            console.log('🚀 [Backend Resolver] SUCCESS: New Railway backend is online! Setting as primary.');
            localStorage.setItem('cinestream_active_backend', BACKEND_OPTIONS.NEW);
            localStorage.setItem('cinestream_new_backend_active', 'true');
            API_CONFIG.BACKEND_URL = BACKEND_OPTIONS.NEW + '/api';
        } else {
            console.log('⚠️ [Backend Resolver] New Railway backend returned non-ok status:', res.status, '(Staying on fallback today)');
        }
    } catch (e) {
        console.warn('⚠️ [Backend Resolver] Probe on new backend failed (not fully booted yet):', e.message);
        
        // Auto-Failover: Check if OLD backend has expired completely
        try {
            const testOld = await fetch(`${BACKEND_OPTIONS.OLD}/api/settings/public`);
            if (!testOld.ok) {
                console.warn('🚨 [Backend Resolver] ALERT: Old backend is offline! Auto-promoting new backend to maintain continuity.');
                localStorage.setItem('cinestream_active_backend', BACKEND_OPTIONS.NEW);
                localStorage.setItem('cinestream_new_backend_active', 'true');
            }
        } catch (oldErr) {
            console.warn('🚨 [Backend Resolver] CRITICAL: Old backend is fully down! Auto-switching to new railway.');
            localStorage.setItem('cinestream_active_backend', BACKEND_OPTIONS.NEW);
            localStorage.setItem('cinestream_new_backend_active', 'true');
        }
    }
})();

// Initialize Global Lottie Search Icon (Replaces static search icon)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lottie === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.onload = () => {
            initLottieSearchGlobal();
        };
        document.head.appendChild(script);
    } else {
        initLottieSearchGlobal();
    }

    function initLottieSearchGlobal() {
        const icons = document.querySelectorAll('.material-icons, .material-icons-round, .material-icons-outlined');
        icons.forEach(icon => {
            if (icon.textContent.trim() === 'search' || icon.classList.contains('search-icon') || icon.classList.contains('mobile-inline-search-icon')) {
                if (icon.hasAttribute('data-lottie-initialized')) return;
                
                const lottieContainer = document.createElement('div');
                lottieContainer.className = icon.className;
                lottieContainer.classList.remove('material-icons-round', 'material-icons', 'material-icons-outlined', 'text-gray-500');
                lottieContainer.classList.add('search-lottie-icon');
                
                // Add specific styling - using content-box to keep padding outer bounds intact
                lottieContainer.style.setProperty('width', '24px', 'important');
                lottieContainer.style.setProperty('height', '24px', 'important');
                lottieContainer.style.setProperty('box-sizing', 'content-box', 'important');
                lottieContainer.style.setProperty('display', 'inline-flex', 'important');
                lottieContainer.style.setProperty('align-items', 'center', 'important');
                lottieContainer.style.setProperty('justify-content', 'center', 'important');
                lottieContainer.style.setProperty('cursor', 'pointer', 'important');
                lottieContainer.setAttribute('data-lottie-initialized', 'true');
                
                icon.parentNode.insertBefore(lottieContainer, icon);
                icon.remove();

                const anim = lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: false,
                    path: '/icons/search-zoom.json?v=3'
                });

                const triggerArea = lottieContainer.closest('form') || lottieContainer.parentNode;
                
                triggerArea.addEventListener('mouseenter', () => {
                    anim.play();
                });
                triggerArea.addEventListener('mouseleave', () => {
                    anim.stop();
                });

                lottieContainer.addEventListener('click', (e) => {
                    const input = triggerArea.querySelector('input');
                    if (input) {
                        e.preventDefault();
                        input.focus();
                    } else if (triggerArea.tagName === 'FORM') {
                        triggerArea.submit();
                    }
                });
            }
        });
    }
});

