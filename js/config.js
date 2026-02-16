// API Configuration
const API_CONFIG = {
    // Backend API - Auto-detect environment
    BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://aphim-api.ddns.net/api', // Replace with your actual backend URL

    // Ophim API (primary)
    OPHIM_URL: 'https://ophim1.com/v1/api',

    // Ophim17 API (secondary - more movies)
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
    USE_BACKEND_FOR_MOVIES: false, // Set to false to use Ophim API directly (faster)

    // Use backend FOR AUTHENTICATION (always true for user login/register)
    USE_BACKEND_FOR_AUTH: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1', // Only use backend locally

    // Use multiple sources for more movies
    USE_MULTIPLE_SOURCES: true
};

// App Configuration
const APP_CONFIG = {
    ITEMS_PER_PAGE: 20,
    VIDEO_QUALITIES: ['360p', '480p', '720p', '1080p', '4K'],
    PLAYBACK_SPEEDS: [0.5, 0.75, 1, 1.25, 1.5, 2],
    SUBSCRIPTION_PLANS: {
        FREE: { name: 'Miễn Phí', price: 0, quality: '480p', devices: 1 },
        PREMIUM: { name: 'Cao Cấp', price: 69000, quality: '4K', devices: 2 },
        FAMILY: { name: 'Gia Đình', price: 699000, quality: '4K', devices: 4, yearly: true }
    }
};

// Local Storage Keys
const STORAGE_KEYS = {
    USER: 'cinestream_user',
    TOKEN: 'cinestream_token',
    FAVORITES: 'cinestream_favorites',
    WATCH_HISTORY: 'cinestream_history',
    WATCH_PROGRESS: 'cinestream_progress',
    SUBSCRIPTION: 'cinestream_subscription'
};
