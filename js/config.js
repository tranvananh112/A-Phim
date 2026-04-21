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
// Default Fallback configuration
const API_CONFIG = {
    // Backend API - Auto-detect environment
    BACKEND_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : 'https://a-phim-production-c87b.up.railway.app/api',

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
    PLAYBACK_SPEEDS: [0.5, 0.75, 1, 1.25, 1.5, 2]
};

// Backward compatibility and Global Helper
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://a-phim-production-c87b.up.railway.app';

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
