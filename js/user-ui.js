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
            <div class="relative group nav-profile-dropdown" style="padding: 10px 0;">
                <a href="profile.html?tab=profile" class="flex items-center gap-2 hover:text-primary transition-colors group cursor-pointer" style="text-decoration:none;">
                    ${avatarHtml}
                    <span class="hidden md:inline text-sm font-semibold text-white group-hover:text-primary" style="white-space:nowrap; max-width:100px; overflow:hidden; text-overflow:ellipsis;">${user.name}</span>
                </a>
                
                <!-- Dropdown Menu -->
                <div class="absolute right-0 top-[100%] w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] transform origin-top-right scale-95 group-hover:scale-100 bg-surface-elevated border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col" style="background-color: #1a1b2e;">
                    <a href="profile.html?tab=profile" class="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors" style="text-decoration:none;">
                        <span class="material-icons-round text-lg">person</span>
                        <span class="text-sm font-medium">Trang cá nhân</span>
                    </a>
                    <a href="profile.html?tab=subscription" class="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors" style="text-decoration:none;">
                        <span class="material-icons-round text-lg">card_membership</span>
                        <span class="text-sm font-medium">Gói thành viên</span>
                    </a>
                    <a href="profile.html?tab=favorites" class="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors" style="text-decoration:none;">
                        <span class="material-icons-round text-lg">favorite</span>
                        <span class="text-sm font-medium">Phim yêu thích</span>
                    </a>
                    <a href="profile.html?tab=history" class="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors" style="text-decoration:none;">
                        <span class="material-icons-round text-lg">history</span>
                        <span class="text-sm font-medium">Lịch sử xem</span>
                    </a>
                    <div class="h-px bg-white/10 my-1"></div>
                    <button onclick="if(window.authService){authService.logout();}else{localStorage.removeItem('cinestream_user');window.location.reload();}" class="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full text-left" style="background:none; border:none; cursor:pointer;">
                        <span class="material-icons-round text-lg">logout</span>
                        <span class="text-sm font-medium">Đăng xuất</span>
                    </button>
                </div>
            </div>
        `;

        // Tìm nút đăng nhập cũ để thay thế, giữ lại các thành phần khác (như mobileMenuBtn)
        const loginBtn = authContainer.querySelector('a[href="login.html"]');
        if (loginBtn) {
            loginBtn.outerHTML = profileLink;
        } else {
            // Nếu không tìm thấy, xóa nội dung hiện tại (có thể là nút profile cũ) và chèn vào
            const existingProfile = authContainer.querySelector('.nav-profile-dropdown, a[href^="profile.html"]');
            if (existingProfile) {
                existingProfile.outerHTML = profileLink;
            } else {
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
