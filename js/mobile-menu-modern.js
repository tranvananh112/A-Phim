/**
 * A PHIM - Modern Mobile Menu JS (theo thiết kế Stitch)
 * Right-side cinematic drawer - dùng material-icons-round (đã có sẵn trên tất cả trang)
 */
(function () {
    'use strict';

    const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';

    function getCurrentUser() {
        try {
            if (typeof authService !== 'undefined') {
                return authService.getCurrentUser();
            }
        } catch (e) {}
        return null;
    }

    function icon(name, style) {
        return `<span class="material-icons-round" style="${style || ''}">${name}</span>`;
    }

    /* ── BUILD DRAWER ── */
    function buildDrawer() {
        document.querySelectorAll('#mm-overlay, #mm-drawer').forEach(el => el.remove());

        const user = getCurrentUser();

        const overlay = document.createElement('div');
        overlay.id = 'mm-overlay';
        overlay.addEventListener('click', closeMenu);
        document.body.appendChild(overlay);

        const drawer = document.createElement('div');
        drawer.id = 'mm-drawer';

        const userAvatar = user ? (user.avatar || user.photoURL) : null;
        const avatarHtml = user
            ? (userAvatar
                ? `<img src="${escHtml(userAvatar)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`
                : escHtml((user.name || user.email || 'U').charAt(0).toUpperCase()))
            : icon('person', 'font-size:26px;color:rgba(255,255,255,0.3)');

        const userName  = user ? escHtml(user.name || user.email || 'Người dùng') : 'Khách';
        const userBadge = user ? 'Thành viên Vàng' : 'Chưa đăng nhập';
        const userHref  = user ? 'profile.html' : 'login.html';

        drawer.innerHTML = `
        <!-- TOP USER -->
        <div class="mm-top">
            <a href="${userHref}" class="mm-user-wrap">
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
                ${icon('close', 'font-size:20px;')}
            </button>
        </div>

        <!-- SCROLL AREA -->
        <div id="mm-drawer-scroll">

            <!-- 1. Trang Chủ -->
            <a href="index.html" class="mm-nav-full mm-glass ${CURRENT_PAGE === 'index.html' ? 'mm-active' : ''}">
                ${icon('home', CURRENT_PAGE === 'index.html' ? 'color:#FFD700;font-size:24px;' : 'font-size:24px;color:#aaabad;')}
                <span class="mm-nav-full-text">Trang Chủ</span>
                <div style="margin-left:auto;">${icon('chevron_right', 'font-size:18px;color:rgba(255,215,0,0.4);')}</div>
            </a>

            <!-- 2. Phim dropdown -->
            <button class="mm-nav-full mm-glass mm-phim-btn" id="mmPhimBtn">
                ${icon('movie', 'font-size:24px;color:#aaabad;')}
                <span class="mm-nav-full-text">Phim</span>
                <div style="margin-left:auto;">${icon('expand_more', 'font-size:22px;color:rgba(255,255,255,0.3);transition:transform 0.25s;' )}</div>
            </button>
            <div id="mmPhimDrop" style="display:none;padding:0 4px 4px;">
                <div class="mm-grid-2">
                    <a href="phim-theo-quoc-gia.html" class="mm-card-item mm-glass">
                        ${icon('public', 'font-size:24px;color:#aaabad;')}
                        <span class="mm-card-label">Tất Cả</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=viet-nam" class="mm-card-item mm-glass">
                        <img src="https://flagcdn.com/32x24/vn.png" alt="VN" style="width:32px;height:24px;border-radius:3px;object-fit:cover;">
                        <span class="mm-card-label">Việt Nam</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=han-quoc" class="mm-card-item mm-glass">
                        <img src="https://flagcdn.com/32x24/kr.png" alt="KR" style="width:32px;height:24px;border-radius:3px;object-fit:cover;">
                        <span class="mm-card-label">Hàn Quốc</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=trung-quoc" class="mm-card-item mm-glass">
                        <img src="https://flagcdn.com/32x24/cn.png" alt="CN" style="width:32px;height:24px;border-radius:3px;object-fit:cover;">
                        <span class="mm-card-label">Trung Quốc</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=nhat-ban" class="mm-card-item mm-glass">
                        <img src="https://flagcdn.com/32x24/jp.png" alt="JP" style="width:32px;height:24px;border-radius:3px;object-fit:cover;">
                        <span class="mm-card-label">Nhật Bản</span>
                    </a>
                    <a href="phim-theo-quoc-gia.html?country=au-my" class="mm-card-item mm-glass">
                        <img src="https://flagcdn.com/32x24/us.png" alt="US" style="width:32px;height:24px;border-radius:3px;object-fit:cover;">
                        <span class="mm-card-label">Âu Mỹ</span>
                    </a>
                </div>
            </div>

            <!-- 3-6. Grid 2 cột -->
            <div class="mm-grid-2">
                <a href="danh-sach.html" class="mm-card-item mm-glass color-blue">
                    ${icon('view_list', 'font-size:22px;')}
                    <span class="mm-card-label">Danh Sách</span>
                </a>
                <a href="categories.html" class="mm-card-item mm-glass color-purple">
                    ${icon('theaters', 'font-size:22px;')}
                    <span class="mm-card-label">Thể Loại</span>
                </a>
                <a href="search.html" class="mm-card-item mm-glass color-green" style="position:relative;">
                    <div class="mm-badge-new">Mới</div>
                    ${icon('explore', 'font-size:22px;')}
                    <span class="mm-card-label">Khám Phá</span>
                </a>
                <a href="pricing.html" class="mm-card-item mm-glass color-orange">
                    ${icon('payments', 'font-size:22px;')}
                    <span class="mm-card-label">Gói Cước</span>
                </a>
            </div>

            <!-- 7. Phim X -->
            <a href="phim-x.html" class="mm-nav-full mm-nav-filmx" style="gap:16px;">
                <div class="mm-filmx-icon-wrap">
                    ${icon('18_up_rating', 'font-size:20px;color:#ff7351;')}
                </div>
                <span style="font-family:inherit;font-size:18px;font-weight:700;color:rgba(255,115,81,0.9);">Phim X</span>
            </a>

            <!-- UPGRADE BANNER -->
            <div class="mm-upgrade-banner mm-glass">
                <div class="mm-upgrade-glow"></div>
                <div style="position:relative;z-index:1;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                        ${icon('stars', 'color:#FFD700;font-size:22px;')}
                        <span class="mm-upgrade-title">Nâng cấp trải nghiệm</span>
                    </div>
                    <p class="mm-upgrade-desc">Xem phim không quảng cáo, chất lượng HD và tốc độ tải nhanh hơn.</p>
                    <a href="pricing.html" class="mm-upgrade-btn" style="display:block; text-align:center; text-decoration:none; box-sizing:border-box;">NÂNG CẤP NGAY</a>
                </div>
            </div>

        </div>

        <!-- FOOTER -->
        <div class="mm-footer">
            <div class="mm-footer-div"></div>
            <div class="mm-footer-row">
                <span class="mm-footer-version">A Phim</span>
                <div class="mm-footer-links">
                    <a href="profile.html" class="mm-footer-link">
                        ${icon('settings', 'font-size:16px;')} Cài đặt
                    </a>
                    ${user 
                        ? `<button class="mm-footer-link danger" onclick="try{authService.logout()}catch(e){window.location.href='login.html'}">
                               ${icon('logout', 'font-size:16px;')} Đăng xuất
                           </button>`
                        : `<a href="login.html" class="mm-footer-link" style="color:#FFD700;">
                               ${icon('login', 'font-size:16px;')} Đăng nhập
                           </a>`
                    }
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(drawer);

        document.getElementById('mmCloseBtn').addEventListener('click', closeMenu);

        // Phim dropdown
        const phimBtn     = document.getElementById('mmPhimBtn');
        const phimDrop    = document.getElementById('mmPhimDrop');
        const expandIcon  = phimBtn.querySelector('.material-icons-round:last-of-type');
        let phimOpen = false;
        phimBtn.addEventListener('click', () => {
            phimOpen = !phimOpen;
            phimDrop.style.display = phimOpen ? 'block' : 'none';
            if (expandIcon) expandIcon.style.transform = phimOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }

    /* ── OPEN / CLOSE ── */
    function openMenu() {
        // Chỉ cho phép mở trên mobile (< 1024px = Tailwind lg breakpoint)
        if (window.innerWidth >= 1024) return;

        buildDrawer();
        requestAnimationFrame(() => {
            document.getElementById('mm-overlay')?.classList.add('open');
            setTimeout(() => document.getElementById('mm-drawer')?.classList.add('open'), 10);
        });

        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top      = `-${scrollY}px`;
        document.body.style.width    = '100%';
        document.body.dataset.scrollY = scrollY;

        const burger = document.querySelector('.mm-burger-btn');
        if (burger) burger.classList.add('open');
    }

    function closeMenu() {
        document.getElementById('mm-overlay')?.classList.remove('open');
        document.getElementById('mm-drawer')?.classList.remove('open');

        const scrollY = parseInt(document.body.dataset.scrollY || '0');
        document.body.style.position = '';
        document.body.style.top      = '';
        document.body.style.width    = '';
        window.scrollTo(0, scrollY);

        const burger = document.querySelector('.mm-burger-btn');
        if (burger) burger.classList.remove('open');

        setTimeout(() => {
            document.getElementById('mm-overlay')?.remove();
            document.getElementById('mm-drawer')?.remove();
        }, 350);
    }

    /* ── SETUP BUTTON ── */
    function setupBtn() {
        const oldBtn = document.getElementById('mobileMenuBtn');
        if (!oldBtn) return;

        const btn = document.createElement('button');
        // Giữ lg:hidden để ẩn trên desktop, chỉ hiện trên mobile
        btn.className = 'mm-burger-btn lg:hidden';
        btn.id = 'mobileMenuBtn';
        btn.setAttribute('aria-label', 'Mở menu');
        btn.innerHTML = `<div class="mm-burger-lines"><span></span><span></span><span></span></div>`;
        btn.addEventListener('click', openMenu);
        oldBtn.replaceWith(btn);
    }

    /* ── SUPPRESS OLD MENU ── */
    function suppressOldMenu() {
        const oldMenu = document.getElementById('mobileMenu');
        if (!oldMenu) return;
        oldMenu.style.cssText = 'display:none!important;visibility:hidden!important;';
        oldMenu.classList.add('hidden');
        oldMenu.innerHTML = '';
        new MutationObserver(() => {
            if (!oldMenu.classList.contains('hidden') || oldMenu.style.display !== 'none') {
                oldMenu.style.cssText = 'display:none!important;visibility:hidden!important;';
                oldMenu.classList.add('hidden');
            }
        }).observe(oldMenu, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    function escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    /* ── INIT ── */
    function init() {
        suppressOldMenu();
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
