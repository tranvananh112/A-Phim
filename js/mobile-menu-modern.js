/**
 * A PHIM - Modern Mobile Menu JS (theo thiết kế Stitch)
 * Right-side cinematic drawer
 */
(function () {
    'use strict';

    const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';

    function getCurrentUser() {
        try {
            if (typeof authService !== 'undefined' && authService.isLoggedIn()) {
                return authService.getCurrentUser();
            }
        } catch (e) {}
        return null;
    }

    /* ── BUILD DRAWER ── */
    function buildDrawer() {
        // Xóa cũ nếu có
        document.querySelectorAll('#mm-overlay, #mm-drawer').forEach(el => el.remove());

        const user = getCurrentUser();

        /* OVERLAY */
        const overlay = document.createElement('div');
        overlay.id = 'mm-overlay';
        overlay.addEventListener('click', closeMenu);
        document.body.appendChild(overlay);

        /* DRAWER */
        const drawer = document.createElement('div');
        drawer.id = 'mm-drawer';

        // Avatar/user display
        const avatarHtml = user
            ? (user.photoURL
                ? `<img src="${user.photoURL}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`
                : escHtml((user.name || user.email || 'U').charAt(0).toUpperCase()))
            : `<span class="material-symbols-outlined" style="font-size:26px;color:rgba(255,255,255,0.3)">person</span>`;

        const userName = user ? escHtml(user.name || user.email || 'Người dùng') : 'Khách';
        const userBadge = user ? 'Thành viên Vàng' : 'Chưa đăng nhập';
        const userHref = user ? 'profile.html' : 'login.html';

        drawer.innerHTML = `
        <!-- TOP: User -->
        <div class="mm-top">
            <a href="${userHref}" class="mm-user-wrap" style="text-decoration:none;">
                <div class="mm-avatar-wrap">
                    <div class="mm-avatar-glow"></div>
                    <div class="mm-avatar-img">${avatarHtml}</div>
                    ${user ? '<div class="mm-avatar-dot"></div>' : ''}
                </div>
                <div>
                    <div class="mm-user-name-text">${userName}</div>
                    <div class="mm-user-badge">${userBadge}</div>
                </div>
            </a>
            <button class="mm-close-btn" id="mmCloseBtn" aria-label="Đóng menu">
                <span class="material-symbols-outlined" style="font-size:20px;">close</span>
            </button>
        </div>

        <!-- NAV SCROLL AREA -->
        <div id="mm-drawer-scroll">

            <!-- 1. Trang Chủ (full row, active) -->
            <a href="index.html" class="mm-nav-full mm-glass ${CURRENT_PAGE === 'index.html' ? 'mm-active' : ''}">
                <span class="material-symbols-outlined mm-nav-icon" style="${CURRENT_PAGE === 'index.html' ? 'color:#FFD700' : ''}">home</span>
                <span class="mm-nav-full-text">Trang Chủ</span>
                <div style="margin-left:auto;">
                    <span class="material-symbols-outlined" style="font-size:18px;color:rgba(255,215,0,0.4);">chevron_right</span>
                </div>
            </a>

            <!-- 2. Phim (dropdown toggle) -->
            <button class="mm-nav-full mm-glass" id="mmPhimBtn" style="cursor:pointer;">
                <span class="material-symbols-outlined mm-nav-icon">movie</span>
                <span class="mm-nav-full-text">Phim</span>
                <div style="margin-left:auto;">
                    <span class="material-symbols-outlined" style="font-size:20px;color:rgba(255,255,255,0.3);transition:transform 0.25s;" id="mmPhimChevron">expand_more</span>
                </div>
            </button>

            <!-- Phim dropdown - quoc gia (ẩn mặc định) -->
            <div id="mmPhimDrop" style="display:none;">
                <div class="mm-grid-2" style="padding: 0 4px 4px;">
                    <a href="phim-theo-quoc-gia.html" class="mm-card-item mm-glass">
                        <span class="material-symbols-outlined mm-card-icon">public</span>
                        <span class="mm-card-label">Tất Cả</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=viet-nam" class="mm-card-item mm-glass">
                        <span style="font-size:24px;">🇻🇳</span>
                        <span class="mm-card-label">Việt Nam</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=han-quoc" class="mm-card-item mm-glass">
                        <span style="font-size:24px;">🇰🇷</span>
                        <span class="mm-card-label">Hàn Quốc</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=trung-quoc" class="mm-card-item mm-glass">
                        <span style="font-size:24px;">🇨🇳</span>
                        <span class="mm-card-label">Trung Quốc</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=nhat-ban" class="mm-card-item mm-glass">
                        <span style="font-size:24px;">🇯🇵</span>
                        <span class="mm-card-label">Nhật Bản</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=au-my" class="mm-card-item mm-glass">
                        <span style="font-size:24px;">🇺🇸</span>
                        <span class="mm-card-label">Âu Mỹ</span>
                    </a>
                </div>
            </div>

            <!-- 3-6. Grid 2 cột: Danh Sách, Thể Loại, Khám Phá, Thể Thao -->
            <div class="mm-grid-2">
                <a href="danh-sach.html" class="mm-card-item mm-glass">
                    <span class="material-symbols-outlined mm-card-icon">view_list</span>
                    <span class="mm-card-label">Danh Sách</span>
                </a>
                <a href="categories.html" class="mm-card-item mm-glass">
                    <span class="material-symbols-outlined mm-card-icon">theater_comedy</span>
                    <span class="mm-card-label">Thể Loại</span>
                </a>
                <a href="search.html" class="mm-card-item mm-glass" style="position:relative;">
                    <div class="mm-badge-new">Mới</div>
                    <span class="material-symbols-outlined mm-card-icon">explore</span>
                    <span class="mm-card-label">Khám Phá</span>
                </a>
                <a href="the-thao.html" class="mm-card-item mm-glass">
                    <span class="material-symbols-outlined mm-card-icon">sports_soccer</span>
                    <span class="mm-card-label">Thể Thao</span>
                </a>
            </div>

            <!-- 7. Phim X -->
            <a href="phim-x.html" class="mm-nav-full mm-nav-filmx" style="gap:16px;">
                <div class="mm-filmx-icon-wrap">
                    <span class="material-symbols-outlined" style="font-size:20px;color:#ff7351;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;">18_up_rating</span>
                </div>
                <span class="mm-nav-full-text" style="color:rgba(255,115,81,0.9);">Phim X</span>
            </a>

            <!-- UPGRADE BANNER -->
            <div class="mm-upgrade-banner mm-glass">
                <div class="mm-upgrade-glow"></div>
                <div style="position:relative;z-index:1;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                        <span class="material-symbols-outlined" style="color:#FFD700;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;font-size:22px;">stars</span>
                        <span class="mm-upgrade-title">Nâng cấp trải nghiệm</span>
                    </div>
                    <p class="mm-upgrade-desc">Xem phim không quảng cáo, chất lượng HD và tốc độ tải nhanh hơn.</p>
                    <button class="mm-upgrade-btn" onclick="window.showAuthModal && window.showAuthModal('register')">NÂNG CẤP NGAY</button>
                </div>
            </div>

        </div>

        <!-- FOOTER -->
        <div class="mm-footer">
            <div class="mm-footer-div"></div>
            <div class="mm-footer-row">
                <span class="mm-footer-version">v2.4.0 Cinematic</span>
                <div class="mm-footer-links">
                    <a href="profile.html" class="mm-footer-link">
                        <span class="material-symbols-outlined">settings</span> Cài đặt
                    </a>
                    <button class="mm-footer-link danger" onclick="try{authService.logout()}catch(e){window.location.href='login.html'}">
                        <span class="material-symbols-outlined">logout</span> Đăng xuất
                    </button>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(drawer);

        // Events
        document.getElementById('mmCloseBtn').addEventListener('click', closeMenu);

        // Phim dropdown toggle
        const phimBtn = document.getElementById('mmPhimBtn');
        const phimDrop = document.getElementById('mmPhimDrop');
        const phimChevron = document.getElementById('mmPhimChevron');
        let phimOpen = false;
        phimBtn.addEventListener('click', () => {
            phimOpen = !phimOpen;
            phimDrop.style.display = phimOpen ? 'block' : 'none';
            phimChevron.style.transform = phimOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }

    /* ── OPEN / CLOSE ── */
    function openMenu() {
        buildDrawer();
        requestAnimationFrame(() => {
            document.getElementById('mm-overlay')?.classList.add('open');
            setTimeout(() => {
                document.getElementById('mm-drawer')?.classList.add('open');
            }, 10);
        });

        // Khóa scroll body (iOS safe)
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.dataset.scrollY = scrollY;

        // Burger → X
        const burger = document.querySelector('.mm-burger-btn');
        if (burger) burger.classList.add('open');
    }

    function closeMenu() {
        const overlay = document.getElementById('mm-overlay');
        const drawer  = document.getElementById('mm-drawer');
        if (overlay) overlay.classList.remove('open');
        if (drawer)  drawer.classList.remove('open');

        // Khôi phục scroll
        const scrollY = parseInt(document.body.dataset.scrollY || '0');
        document.body.style.position = '';
        document.body.style.top      = '';
        document.body.style.width    = '';
        window.scrollTo(0, scrollY);

        // Burger ← X
        const burger = document.querySelector('.mm-burger-btn');
        if (burger) burger.classList.remove('open');

        setTimeout(() => {
            overlay?.remove();
            drawer?.remove();
        }, 350);
    }

    /* ── SETUP HAMBURGER BUTTON ── */
    function setupBtn() {
        const oldBtn = document.getElementById('mobileMenuBtn');
        if (!oldBtn) return;

        // Tạo nút mới thay thế
        const btn = document.createElement('button');
        btn.className = 'mm-burger-btn lg:hidden';
        btn.id = 'mobileMenuBtn';  // giữ ID để không xung đột script cũ
        btn.setAttribute('aria-label', 'Mở menu');
        btn.innerHTML = `
            <div class="mm-burger-lines">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        btn.addEventListener('click', openMenu);
        oldBtn.replaceWith(btn);
    }

    /* ── ESC KEY ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });

    /* ── HELPER ── */
    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    /* ── INIT ── */
    function init() {
        setupBtn();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.openMobileMenu  = openMenu;
    window.closeMobileMenu = closeMenu;

})();
