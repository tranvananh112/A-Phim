// Register Page Script
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        showMessage('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Email không hợp lệ', 'error');
        return;
    }

    if (!validatePhone(phone)) {
        showMessage('Số điện thoại không hợp lệ', 'error');
        return;
    }

    if (!validatePassword(password)) {
        showMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp', 'error');
        return;
    }

    if (!terms) {
        showMessage('Vui lòng đồng ý với điều khoản sử dụng', 'error');
        return;
    }

    // Register
    const result = await authService.register(email, password, name, phone);

    if (result.success) {
        showMessage('Đăng ký thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showMessage(result.message || 'Đăng ký thất bại', 'error');
    }
});

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');

    if (field.type === 'password') {
        field.type = 'text';
        icon.textContent = 'visibility';
    } else {
        field.type = 'password';
        icon.textContent = 'visibility_off';
    }
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone
function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
}

// Validate password
function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
}

// Show message
function showMessage(message, type = 'info') {
    // Remove existing message
    const existing = document.querySelector('.message-toast');
    if (existing) {
        existing.remove();
    }

    // Create message element
    const toast = document.createElement('div');
    toast.className = 'message-toast fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-lg backdrop-blur-md border transform transition-all duration-300';

    if (type === 'success') {
        toast.classList.add('bg-green-500/20', 'border-green-500/50', 'text-green-100');
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-green-400">check_circle</span>
                <span class="font-medium">${message}</span>
            </div>
        `;
    } else if (type === 'error') {
        toast.classList.add('bg-red-500/20', 'border-red-500/50', 'text-red-100');
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-red-400">error</span>
                <span class="font-medium">${message}</span>
            </div>
        `;
    } else {
        toast.classList.add('bg-blue-500/20', 'border-blue-500/50', 'text-blue-100');
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-icons-round text-blue-400">info</span>
                <span class="font-medium">${message}</span>
            </div>
        `;
    }

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Social login functions
function loginWithGoogle() {
    showMessage('Tính năng đăng nhập Google đang được phát triển', 'info');
    // TODO: Implement Google OAuth
    // window.location.href = 'YOUR_GOOGLE_OAUTH_URL';
}

function loginWithFacebook() {
    showMessage('Tính năng đăng nhập Facebook đang được phát triển', 'info');
    // TODO: Implement Facebook OAuth
    // window.location.href = 'YOUR_FACEBOOK_OAUTH_URL';
}

// Real-time validation feedback
document.getElementById('email').addEventListener('blur', function () {
    if (this.value && !validateEmail(this.value)) {
        this.classList.add('border-red-500');
    } else {
        this.classList.remove('border-red-500');
    }
});

document.getElementById('phone').addEventListener('blur', function () {
    if (this.value && !validatePhone(this.value)) {
        this.classList.add('border-red-500');
    } else {
        this.classList.remove('border-red-500');
    }
});

document.getElementById('password').addEventListener('input', function () {
    if (this.value && !validatePassword(this.value)) {
        this.classList.add('border-red-500');
    } else {
        this.classList.remove('border-red-500');
    }
});

document.getElementById('confirmPassword').addEventListener('input', function () {
    const password = document.getElementById('password').value;
    if (this.value && this.value !== password) {
        this.classList.add('border-red-500');
    } else {
        this.classList.remove('border-red-500');
    }
});
