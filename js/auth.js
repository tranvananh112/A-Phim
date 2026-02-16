// Authentication Service with Backend Integration
class AuthService {
    constructor() {
        this.backendURL = typeof API_CONFIG !== 'undefined' ? API_CONFIG.BACKEND_URL : 'http://localhost:5000/api';
        // Always use backend for authentication
        this.useBackend = typeof API_CONFIG !== 'undefined' ? API_CONFIG.USE_BACKEND_FOR_AUTH : true;
        this.currentUser = this.loadUser();

        console.log('🔐 AuthService initialized:', {
            backendURL: this.backendURL,
            useBackend: this.useBackend
        });
    }

    // Load user from localStorage
    loadUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Save user to localStorage
    saveUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        this.currentUser = user;
    }

    // Register new user
    async register(email, password, name, phone = '') {
        if (this.useBackend) {
            try {
                console.log('📝 Registering via backend:', email);
                const response = await fetch(`${this.backendURL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name, phone })
                });

                const data = await response.json();
                console.log('📊 Backend response:', data);

                if (data.success) {
                    this.saveUser(data.user);
                    this.saveToken(data.token);
                    console.log('✅ Registration successful');
                    return { success: true, user: data.user };
                }
                console.log('❌ Registration failed:', data.message);
                return { success: false, message: data.message };
            } catch (error) {
                console.error('❌ Register error:', error);
                return { success: false, message: 'Lỗi kết nối server. Vui lòng kiểm tra backend đang chạy.' };
            }
        }

        // If backend is disabled, show error
        return {
            success: false,
            message: 'Backend authentication is required. Please enable USE_BACKEND_FOR_AUTH in config.'
        };
    }

    // Login user
    async login(email, password) {
        if (this.useBackend) {
            try {
                console.log('🔐 Logging in via backend:', email);
                const response = await fetch(`${this.backendURL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('📊 Backend response:', data);

                if (data.success) {
                    this.saveUser(data.user);
                    this.saveToken(data.token);
                    console.log('✅ Login successful, token saved');
                    return { success: true, user: data.user };
                }
                console.log('❌ Login failed:', data.message);
                return { success: false, message: data.message };
            } catch (error) {
                console.error('❌ Login error:', error);
                return { success: false, message: 'Lỗi kết nối server. Vui lòng kiểm tra backend đang chạy.' };
            }
        }

        // If backend is disabled, show error
        return {
            success: false,
            message: 'Backend authentication is required. Please enable USE_BACKEND_FOR_AUTH in config.'
        };
    }

    // Logout
    logout() {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // Check if logged in
    isLoggedIn() {
        return this.currentUser !== null && localStorage.getItem(STORAGE_KEYS.TOKEN) !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update profile
    async updateProfile(updates) {
        if (!this.currentUser) return { success: false, message: 'Chưa đăng nhập' };

        if (this.useBackend) {
            try {
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                const response = await fetch(`${this.backendURL}/auth/updatedetails`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updates)
                });

                const data = await response.json();
                if (data.success) {
                    this.saveUser(data.data);
                    return { success: true, user: data.data };
                }
                return { success: false, message: data.message };
            } catch (error) {
                return { success: false, message: 'Lỗi kết nối server' };
            }
        }

        // Fallback
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('cinestream_all_users', JSON.stringify(users));
            this.saveUser(users[index]);
            return { success: true, user: users[index] };
        }
        return { success: false, message: 'Không tìm thấy người dùng' };
    }

    // Change password
    async changePassword(oldPassword, newPassword) {
        if (!this.currentUser) return { success: false, message: 'Chưa đăng nhập' };

        if (this.useBackend) {
            try {
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                const response = await fetch(`${this.backendURL}/auth/updatepassword`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ currentPassword: oldPassword, newPassword })
                });

                const data = await response.json();
                if (data.success) {
                    this.saveToken(data.token);
                    return { success: true };
                }
                return { success: false, message: data.message };
            } catch (error) {
                return { success: false, message: 'Lỗi kết nối server' };
            }
        }

        // Fallback
        if (this.currentUser.password !== btoa(oldPassword)) {
            return { success: false, message: 'Mật khẩu cũ không đúng' };
        }
        return this.updateProfile({ password: btoa(newPassword) });
    }

    // Helper methods
    getAllUsers() {
        const usersStr = localStorage.getItem('cinestream_all_users');
        return usersStr ? JSON.parse(usersStr) : [];
    }

    generateToken(user) {
        return btoa(JSON.stringify({ id: user.id, email: user.email, timestamp: Date.now() }));
    }

    saveToken(token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }

    // Social login
    socialLogin(provider, profile) {
        if (!profile || !profile.email) {
            return { success: false, message: 'Thông tin không hợp lệ' };
        }

        // Check if user exists
        const users = this.getAllUsers();
        let user = users.find(u => u.email === profile.email);

        if (!user) {
            // Create new user from social profile
            user = {
                id: Date.now().toString(),
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                phone: '',
                password: '', // No password for social login
                avatar: profile.picture || '',
                subscription: { plan: 'FREE' },
                socialProvider: provider,
                createdAt: new Date().toISOString()
            };

            users.push(user);
            localStorage.setItem('cinestream_all_users', JSON.stringify(users));
        }

        this.saveUser(user);
        this.saveToken(this.generateToken(user));

        return { success: true, user };
    }

    // Password reset
    async requestPasswordReset(email) {
        if (this.useBackend) {
            try {
                const response = await fetch(`${this.backendURL}/auth/forgotpassword`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                return await response.json();
            } catch (error) {
                return { success: false, message: 'Lỗi kết nối server' };
            }
        }

        // Fallback
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);
        if (!user) return { success: false, message: 'Email không tồn tại' };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('cinestream_reset_otp', JSON.stringify({ email, otp, expires: Date.now() + 300000 }));
        console.log('OTP:', otp);
        return { success: true, message: 'Mã OTP đã được gửi', otp };
    }

    resetPassword(email, otp, newPassword) {
        const resetData = localStorage.getItem('cinestream_reset_otp');
        if (!resetData) return { success: false, message: 'Không tìm thấy yêu cầu đặt lại mật khẩu' };

        const { email: savedEmail, otp: savedOtp, expires } = JSON.parse(resetData);
        if (email !== savedEmail || otp !== savedOtp) return { success: false, message: 'Mã OTP không đúng' };
        if (Date.now() > expires) return { success: false, message: 'Mã OTP đã hết hạn' };

        const users = this.getAllUsers();
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].password = btoa(newPassword);
            localStorage.setItem('cinestream_all_users', JSON.stringify(users));
            localStorage.removeItem('cinestream_reset_otp');
            return { success: true, message: 'Đặt lại mật khẩu thành công' };
        }
        return { success: false, message: 'Không tìm thấy người dùng' };
    }
}

// Initialize Auth Service
const authService = new AuthService();
