// Admin Authentication Service
class AdminAuthService {
    constructor() {
        this.checkAuth();
    }

    // Check if admin is logged in
    isLoggedIn() {
        const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN);
        return token !== null;
    }

    // Login admin
    login(username, password) {
        if (username === ADMIN_CONFIG.ADMIN_CREDENTIALS.username &&
            password === ADMIN_CONFIG.ADMIN_CREDENTIALS.password) {

            const token = btoa(JSON.stringify({
                username,
                timestamp: Date.now()
            }));

            localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN, token);
            return { success: true };
        }

        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }

    // Logout admin
    logout() {
        localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN);
        window.location.href = '/admin/login.html';
    }

    // Check authentication and redirect if needed
    checkAuth() {
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.includes('login.html');

        if (!this.isLoggedIn() && !isLoginPage) {
            window.location.href = '/admin/login.html';
        } else if (this.isLoggedIn() && isLoginPage) {
            window.location.href = '/admin/dashboard.html';
        }
    }

    // Get admin info
    getAdminInfo() {
        const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN);
        if (!token) return null;

        try {
            return JSON.parse(atob(token));
        } catch (e) {
            return null;
        }
    }
}

// Initialize Admin Auth Service
const adminAuthService = new AdminAuthService();
