// Login Page Script
document.addEventListener('DOMContentLoaded', function () {
    // Allow users to access login page even if logged in
    // They can logout manually if needed

    setupLoginForm();
    setupRegisterForm();
    setupForgotPassword();
});

// Setup login form
function setupLoginForm() {
    const form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage('Vui lòng nhập đầy đủ thông tin', 'error');
            return;
        }

        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng nhập...';

        try {
            const result = await authService.login(email, password);

            if (result.success) {
                showMessage('Đăng nhập thành công!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            showMessage('Lỗi đăng nhập: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Setup register form (if on register page)
function setupRegisterForm() {
    // Add register link handler
    const registerLink = document.querySelector('a[href="#"]');
    if (registerLink && registerLink.textContent.includes('Đăng ký')) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterModal();
        });
    }
}

// Show register modal
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-surface-dark border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 relative">
            <button onclick="this.closest('.fixed').remove()" 
                class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <span class="material-icons-outlined">close</span>
            </button>
            
            <h2 class="text-2xl font-bold text-white mb-6">Đăng ký tài khoản</h2>
            
            <form id="registerForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Họ và tên</label>
                    <input type="text" id="regName" required
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="Nguyễn Văn A" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input type="email" id="regEmail" required
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="email@example.com" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Số điện thoại (tùy chọn)</label>
                    <input type="tel" id="regPhone"
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="0123456789" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
                    <input type="password" id="regPassword" required minlength="6"
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="••••••••" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Xác nhận mật khẩu</label>
                    <input type="password" id="regPasswordConfirm" required minlength="6"
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="••••••••" />
                </div>
                
                <button type="submit"
                    class="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    ĐĂNG KÝ
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-sm text-gray-400">
                    Đã có tài khoản? 
                    <button onclick="this.closest('.fixed').remove()" class="text-primary hover:underline">Đăng nhập</button>
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup register form submit
    document.getElementById('registerForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        if (password !== passwordConfirm) {
            showMessage('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng ký...';

        try {
            const result = await authService.register(email, password, name, phone);

            if (result.success) {
                showMessage('Đăng ký thành công!', 'success');
                modal.remove();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            showMessage('Lỗi đăng ký: ' + error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Setup forgot password
function setupForgotPassword() {
    const forgotLink = document.querySelector('a[href="#"]');
    if (forgotLink && forgotLink.textContent.includes('Quên mật khẩu')) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
}

// Show forgot password modal
function showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-surface-dark border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 relative">
            <button onclick="this.closest('.fixed').remove()" 
                class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <span class="material-icons-outlined">close</span>
            </button>
            
            <h2 class="text-2xl font-bold text-white mb-4">Quên mật khẩu</h2>
            <p class="text-gray-400 mb-6">Nhập email của bạn để nhận mã OTP</p>
            
            <form id="forgotForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input type="email" id="forgotEmail" required
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="email@example.com" />
                </div>
                
                <button type="submit"
                    class="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    GỬI MÃ OTP
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('forgotForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('forgotEmail').value.trim();
        const result = authService.requestPasswordReset(email);

        if (result.success) {
            showMessage('Mã OTP đã được gửi đến email của bạn', 'success');
            modal.remove();
            showResetPasswordModal(email, result.otp);
        } else {
            showMessage(result.message, 'error');
        }
    });
}

// Show reset password modal
function showResetPasswordModal(email, otp) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-surface-dark border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 relative">
            <button onclick="this.closest('.fixed').remove()" 
                class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <span class="material-icons-outlined">close</span>
            </button>
            
            <h2 class="text-2xl font-bold text-white mb-4">Đặt lại mật khẩu</h2>
            <p class="text-gray-400 mb-2">Mã OTP đã được gửi đến email của bạn</p>
            <p class="text-sm text-primary mb-6">Demo: ${otp}</p>
            
            <form id="resetForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Mã OTP</label>
                    <input type="text" id="otpCode" required
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="123456" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Mật khẩu mới</label>
                    <input type="password" id="newPassword" required minlength="6"
                        class="w-full px-4 py-3 bg-background-dark/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                        placeholder="••••••••" />
                </div>
                
                <button type="submit"
                    class="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    ĐẶT LẠI MẬT KHẨU
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('resetForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const otpCode = document.getElementById('otpCode').value.trim();
        const newPassword = document.getElementById('newPassword').value;

        const result = authService.resetPassword(email, otpCode, newPassword);

        if (result.success) {
            showMessage('Đặt lại mật khẩu thành công!', 'success');
            modal.remove();
        } else {
            showMessage(result.message, 'error');
        }
    });
}

// Show message
function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[200] px-6 py-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        } text-white font-medium animate-fade-in`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Social login handlers
function loginWithGoogle() {
    showMessage('Hiện tại chưa hỗ trợ đăng nhập bằng Google. Vui lòng đăng ký tài khoản thủ công.', 'error');
    // Redirect to register page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'register.html?highlight=true';
    }, 1500);
}

function loginWithFacebook() {
    showMessage('Hiện tại chưa hỗ trợ đăng nhập bằng Facebook. Vui lòng đăng ký tài khoản thủ công.', 'error');
    // Redirect to register page after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'register.html?highlight=true';
    }, 1500);
}
