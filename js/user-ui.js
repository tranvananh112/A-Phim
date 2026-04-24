/**
 * User UI - Cập nhật nav theo trạng thái đăng nhập
 * - Đã đăng nhập: thay #authContainer bằng avatar + tên
 * - Chưa đăng nhập: KHÔNG thay gì cả, để button gốc với onclick/auth-modal.js xử lý
 */

function updateUserUI() {
    if (typeof authService === 'undefined') {
        setTimeout(updateUserUI, 150);
        return;
    }

    const user = authService.getCurrentUser();
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (user) {
        // ── Đã đăng nhập: thay bằng avatar + tên ──
        const savedAvatar = localStorage.getItem('user_avatar') || user.avatar || '';
        const initial = (user.name || 'U').charAt(0).toUpperCase();

        const avatarHtml = savedAvatar
            ? `<img src="${savedAvatar}" class="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)] hover:shadow-[0_0_20px_rgba(242,242,13,0.6)] transition-all" alt="Tài khoản" style="pointer-events:none" />`
            : `<div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)]">${initial}</div>`;

        const profileLink = `
            <a href="profile.html" class="flex items-center gap-2 hover:text-primary transition-colors group">
                ${avatarHtml}
                <span class="hidden md:inline text-sm font-semibold text-white group-hover:text-primary">${user.name}</span>
            </a>
        `;

        // Tìm nút đăng nhập cũ để thay thế, giữ lại các thành phần khác (như mobileMenuBtn)
        const loginBtn = authContainer.querySelector('a[href="login.html"]');
        if (loginBtn) {
            loginBtn.outerHTML = profileLink;
        } else {
            // Nếu không tìm thấy (có thể đã được thay thế), nhưng muốn chắc chắn UI đúng
            // Kiểm tra xem đã có link profile chưa, nếu chưa mới chèn
            if (!authContainer.querySelector('a[href="profile.html"]')) {
                authContainer.insertAdjacentHTML('afterbegin', profileLink);
            }
        }
    }
    // Chưa đăng nhập: KHÔNG làm gì - button gốc html có onclick + auth-modal.js xử lý
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', updateUserUI);
setTimeout(updateUserUI, 300);

// Export để các script khác gọi sau khi login/logout
window.updateUserUI = updateUserUI;
