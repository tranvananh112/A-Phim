/**
 * User UI - Cập nhật giao diện nav theo trạng thái đăng nhập
 * - Đã đăng nhập: hiện avatar + tên user
 * - Chưa đăng nhập: hiện nút "Đăng nhập" → mở auth modal
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
        // ── Đã đăng nhập: hiện avatar + tên ──
        const savedAvatar = localStorage.getItem('user_avatar') || user.avatar || '';
        const initial = (user.name || 'U').charAt(0).toUpperCase();

        const avatarHtml = savedAvatar
            ? `<img src="${savedAvatar}" class="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)] hover:shadow-[0_0_20px_rgba(242,242,13,0.6)] transition-all" alt="Tài khoản" style="pointer-events:none" />`
            : `<div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)]">${initial}</div>`;

        authContainer.innerHTML = `
            <a href="profile.html" class="flex items-center gap-2 hover:text-primary transition-colors group">
                ${avatarHtml}
                <span class="hidden md:inline text-sm font-semibold text-white group-hover:text-primary">${user.name}</span>
            </a>
        `;
    } else {
        // ── Chưa đăng nhập: hiện nút Đăng nhập → mở modal ──
        authContainer.innerHTML = `
            <a href="login.html" id="navLoginBtn"
               class="px-6 py-2 bg-primary text-black font-bold rounded-full hover:bg-primary-dim transition-colors text-sm uppercase tracking-wide">
                Đăng nhập
            </a>
        `;

        // Gắn onclick trực tiếp phòng trường hợp auth-modal.js chưa intercept kịp
        const loginBtn = document.getElementById('navLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function (e) {
                if (window.showAuthModal) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    window.showAuthModal('login');
                }
            }, true); // capture phase
        }
    }
}

// Khởi chạy khi DOM ready
document.addEventListener('DOMContentLoaded', updateUserUI);

// Retry sau 300ms phòng auth.js load chậm
setTimeout(updateUserUI, 300);

// Export để các script khác gọi khi trạng thái thay đổi
window.updateUserUI = updateUserUI;
