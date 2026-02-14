// Admin Configuration
const ADMIN_CONFIG = {
    ADMIN_CREDENTIALS: {
        username: 'admin',
        password: 'admin123' // In production, use proper authentication
    },
    ITEMS_PER_PAGE: 20,
    CHART_COLORS: {
        primary: '#197fe6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
    }
};

// Admin Storage Keys
const ADMIN_STORAGE_KEYS = {
    ADMIN_TOKEN: 'cinestream_admin_token',
    MOVIES: 'cinestream_admin_movies',
    CATEGORIES: 'cinestream_admin_categories',
    COUNTRIES: 'cinestream_admin_countries',
    BANNERS: 'cinestream_admin_banners',
    SETTINGS: 'cinestream_admin_settings',
    NOTIFICATIONS: 'cinestream_admin_notifications'
};

// Initialize default data
function initializeAdminData() {
    // Initialize categories if not exists
    if (!localStorage.getItem(ADMIN_STORAGE_KEYS.CATEGORIES)) {
        const defaultCategories = [
            { id: '1', name: 'Hành động', slug: 'hanh-dong', count: 0 },
            { id: '2', name: 'Tình cảm', slug: 'tinh-cam', count: 0 },
            { id: '3', name: 'Hài hước', slug: 'hai-huoc', count: 0 },
            { id: '4', name: 'Kinh dị', slug: 'kinh-di', count: 0 },
            { id: '5', name: 'Khoa học viễn tưởng', slug: 'khoa-hoc-vien-tuong', count: 0 }
        ];
        localStorage.setItem(ADMIN_STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    }

    // Initialize countries if not exists
    if (!localStorage.getItem(ADMIN_STORAGE_KEYS.COUNTRIES)) {
        const defaultCountries = [
            { id: '1', name: 'Việt Nam', slug: 'viet-nam', count: 0 },
            { id: '2', name: 'Hàn Quốc', slug: 'han-quoc', count: 0 },
            { id: '3', name: 'Trung Quốc', slug: 'trung-quoc', count: 0 },
            { id: '4', name: 'Mỹ', slug: 'my', count: 0 },
            { id: '5', name: 'Nhật Bản', slug: 'nhat-ban', count: 0 }
        ];
        localStorage.setItem(ADMIN_STORAGE_KEYS.COUNTRIES, JSON.stringify(defaultCountries));
    }

    // Initialize settings if not exists
    if (!localStorage.getItem(ADMIN_STORAGE_KEYS.SETTINGS)) {
        const defaultSettings = {
            siteName: 'CineStream',
            siteDescription: 'Trải nghiệm điện ảnh đỉnh cao',
            logo: '',
            contactEmail: 'support@cinestream.vn',
            contactPhone: '1900-xxxx',
            seoTitle: 'CineStream - Xem phim online chất lượng cao',
            seoDescription: 'Website xem phim trực tuyến với hàng ngàn bộ phim bom tấn',
            seoKeywords: 'xem phim, phim online, phim hay, phim mới',
            paymentMomo: '',
            paymentZaloPay: '',
            paymentVNPay: ''
        };
        localStorage.setItem(ADMIN_STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
}

// Call initialization
initializeAdminData();
