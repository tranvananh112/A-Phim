/**
 * A PHIM — Mobile Bottom Navigation Bar JS
 * 5 Tabs: Khám phá — Lịch chiếu — [Trang chủ Floating Center] — Tài khoản — Thêm
 * Khung lượn sóng cắt lõm viền cong (Curved Notch SVG) & Nút Trang chủ nổi bật
 */
(function () {
    'use strict';

    /* ────────────────────────────────────────────
       DATA: Danh mục nội dung cho Sheet "Thêm"
    ──────────────────────────────────────────── */
    const MOVIE_TYPES = [
        { href: 'danh-sach.html?list=phim-moi', label: 'Phim Mới' },
        { href: 'danh-sach.html?list=phim-bo', label: 'Phim Bộ' },
        { href: 'danh-sach.html?list=phim-le', label: 'Phim Lẻ' },
        { href: 'danh-sach.html?list=tv-shows', label: 'TV Shows' },
        { href: 'danh-sach.html?list=hoat-hinh', label: 'Hoạt Hình' },
        { href: 'danh-sach.html?list=phim-chieu-rap', label: 'Chiếu Rạp' },
        { href: 'danh-sach.html?list=phim-vietsub', label: 'Vietsub' },
        { href: 'danh-sach.html?list=phim-thuyet-minh', label: 'Thuyết Minh' },
        { href: 'danh-sach.html?list=phim-long-tien', label: 'Lồng Tiếng' },
        { href: 'danh-sach.html?list=phim-bo-dang-chieu', label: 'Đang Chiếu' },
        { href: 'danh-sach.html?list=phim-bo-hoan-thanh', label: 'Đã Xong' },
        { href: 'danh-sach.html?list=phim-sap-chieu', label: 'Sắp Chiếu' },
    ];

    const CATEGORIES = [
        { slug: 'hanh-dong', name: 'Hành Động' }, { slug: 'tinh-cam', name: 'Tình Cảm' },
        { slug: 'hai-huoc', name: 'Hài Hước' }, { slug: 'co-trang', name: 'Cổ Trang' },
        { slug: 'tam-ly', name: 'Tâm Lý' }, { slug: 'hinh-su', name: 'Hình Sự' },
        { slug: 'chien-tranh', name: 'Chiến Tranh' }, { slug: 'vien-tuong', name: 'Viễn Tưởng' },
        { slug: 'kinh-di', name: 'Kinh Dị' }, { slug: 'vo-thuat', name: 'Võ Thuật' },
        { slug: 'than-thoai', name: 'Thần Thoại' }, { slug: 'phieu-luu', name: 'Phiêu Lưu' },
        { slug: 'khoa-hoc', name: 'Khoa Học' }, { slug: 'am-nhac', name: 'Âm Nhạc' },
        { slug: 'tai-lieu', name: 'Tài Liệu' }, { slug: 'gia-dinh', name: 'Gia Đình' },
        { slug: 'the-thao', name: 'Thể Thao' }, { slug: 'chinh-kich', name: 'Chính Kịch' },
        { slug: 'bi-an', name: 'Bí Ẩn' }, { slug: 'hoc-duong', name: 'Học Đường' },
        { slug: 'kinh-dien', name: 'Kinh Điển' }, { slug: 'short-drama', name: 'Short Drama' },
    ];

    const COUNTRIES = [
        { slug: 'viet-nam', name: 'Việt Nam', code: 'vn' },
        { slug: 'han-quoc', name: 'Hàn Quốc', code: 'kr' },
        { slug: 'trung-quoc', name: 'Trung Quốc', code: 'cn' },
        { slug: 'nhat-ban', name: 'Nhật Bản', code: 'jp' },
        { slug: 'au-my', name: 'Âu Mỹ', code: 'us' },
        { slug: 'thai-lan', name: 'Thái Lan', code: 'th' },
        { slug: 'dai-loan', name: 'Đài Loan', code: 'tw' },
        { slug: 'hong-kong', name: 'Hồng Kông', code: 'hk' },
        { slug: 'an-do', name: 'Ấn Độ', code: 'in' },
        { slug: 'anh', name: 'Anh', code: 'gb' },
        { slug: 'phap', name: 'Pháp', code: 'fr' },
        { slug: 'canada', name: 'Canada', code: 'ca' },
        { slug: 'duc', name: 'Đức', code: 'de' },
        { slug: 'tho-nhi-ky', name: 'Thổ Nhĩ Kỳ', code: 'tr' },
        { slug: 'nga', name: 'Nga', code: 'ru' },
        { slug: 'indonesia', name: 'Indonesia', code: 'id' },
        { slug: 'uc', name: 'Úc', code: 'au' },
        { slug: 'malaysia', name: 'Malaysia', code: 'my' },
        { slug: 'philippines', name: 'Philippines', code: 'ph' },
    ];

    /* ────────────────────────────────────────────
       HELPERS
    ──────────────────────────────────────────── */
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    function getCurrentUser() {
        try {
            if (typeof authService !== 'undefined' && authService && typeof authService.getCurrentUser === 'function') {
                const u = authService.getCurrentUser();
                if (u) return u;
            }
            const stored = localStorage.getItem('cinestream_user') || localStorage.getItem('currentUser');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return null;
    }

    // Xác định tab active
    function getActiveTab() {
        const path = window.location.pathname.toLowerCase();
        
        if (path === '/' || path.includes('index') || path === '') {
            return 'home';
        }
        if (path.includes('search') || path.includes('categories') || path.includes('the-loai')) {
            return 'search';
        }
        if (path.includes('lich-chieu')) {
            return 'calendar';
        }
        if (path.includes('profile') || path.includes('tai-khoan') || path.includes('login') || path.includes('register')) {
            return 'account';
        }
        
        return '';
    }

    /* ────────────────────────────────────────────
       BUILD BOTTOM NAV DOCK
    ──────────────────────────────────────────── */
    function buildDock() {
        const active = getActiveTab();
        const existing = document.getElementById('bottom-nav-dock');
        if (existing) existing.remove();

        const user = getCurrentUser();
        const dock = document.createElement('nav');
        dock.id = 'bottom-nav-dock';
        dock.setAttribute('aria-label', 'Bottom Navigation');

        dock.innerHTML = `
            <!-- SVG Background with Deep Wide Curved Notch & Glassmorphism Fill -->
            <svg class="bn-bg-svg" viewBox="0 0 375 68" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="bn-glass-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="rgba(30, 41, 65, 0.78)"></stop>
                        <stop offset="100%" stop-color="rgba(15, 22, 38, 0.90)"></stop>
                    </linearGradient>
                    <linearGradient id="bn-glass-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.32)"></stop>
                        <stop offset="50%" stop-color="rgba(252, 213, 118, 0.65)"></stop>
                        <stop offset="100%" stop-color="rgba(255, 255, 255, 0.32)"></stop>
                    </linearGradient>
                </defs>
                <path d="M 0,0 L 132,0 C 154,0 160,36 187.5,36 C 215,36 221,0 243,0 L 375,0 L 375,68 L 0,68 Z" fill="url(#bn-glass-fill)" stroke="url(#bn-glass-stroke)" stroke-width="1.2"></path>
            </svg>

            <div class="bn-tabs-container">
                <!-- 1. Khám phá (Grid icon - Chuyển ngẫu nhiên đến trang khám phá bất kỳ) -->
                <a href="/danh-sach" class="bn-tab ${active === 'search' ? 'active' : ''}" id="bn-tab-search" aria-label="Khám phá" onclick="return handleExploreRandomClick(event)">
                    <svg class="bn-tab-icon" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/>
                    </svg>
                    <span class="bn-tab-label">Khám phá</span>
                </a>

                <!-- 2. Lịch chiếu (Calendar icon) -->
                <a href="/lich-chieu" class="bn-tab ${active === 'calendar' ? 'active' : ''}" id="bn-tab-calendar" aria-label="Lịch chiếu">
                    <svg class="bn-tab-icon" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" stroke-width="1.6"/>
                        <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="1.6"/>
                        <line x1="8" y1="2" x2="8" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        <line x1="16" y1="2" x2="16" y2="5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                    <span class="bn-tab-label">Lịch chiếu</span>
                </a>

                <!-- 3. Trang chủ Floating Center Button (Bold Gold Glowing Circle) -->
                <a href="/" class="bn-tab-center ${active === 'home' ? 'active' : ''}" id="bn-tab-home" aria-label="Trang chủ">
                    <div class="bn-center-circle">
                        <svg class="bn-center-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="#0d0f1a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </a>

                <!-- 4. Tài khoản (Person icon) -->
                <a href="/profile" class="bn-tab ${active === 'account' ? 'active' : ''}" id="bn-tab-account" aria-label="Tài khoản" onclick="return handleAccountTabClick(event)">
                    <svg class="bn-tab-icon" id="bn-account-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="bn-tab-label">Tài khoản</span>
                </a>

                <!-- 5. Thêm (Menu 3 lines icon - Drawer Sheet) -->
                <button type="button" class="bn-tab bn-tab-more" id="bn-tab-more" aria-label="Thêm">
                    <svg class="bn-tab-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="bn-tab-label">Thêm</span>
                </button>
            </div>
        `;

        document.body.appendChild(dock);
        document.getElementById('bn-tab-more')?.addEventListener('click', toggleSheet);
    }

    /* ────────────────────────────────────────────
       EXPLORE RANDOM CLICK (Chuyển trang bất kỳ)
    ──────────────────────────────────────────── */
    const EXPLORE_RANDOM_ROUTES = [
        '/danh-sach',
        '/search',
        '/lich-chieu',
        '/categories?category=hanh-dong',
        '/categories?category=tinh-cam',
        '/categories?category=hai-huoc',
        '/categories?category=co-trang',
        '/categories?category=tam-ly',
        '/categories?category=khoa-hoc',
        '/categories?category=kinh-di',
        '/categories?category=vo-thuat',
        '/categories?category=vien-tuong',
        '/categories?category=hoat-hinh',
        '/categories?category=hoc-duong',
        '/categories?category=short-drama',
        '/phim-theo-quoc-gia?country=han-quoc',
        '/phim-theo-quoc-gia?country=trung-quoc',
        '/phim-theo-quoc-gia?country=au-my',
        '/phim-theo-quoc-gia?country=nhat-ban',
        '/phim-theo-quoc-gia?country=thai-lan',
        '/danh-sach?list=phim-moi',
        '/danh-sach?list=phim-bo',
        '/danh-sach?list=phim-le',
        '/danh-sach?list=phim-chieu-rap',
        '/danh-sach?list=tv-shows',
        '/danh-sach?list=hoat-hinh',
        '/danh-sach?list=phim-vietsub',
        '/danh-sach?list=phim-thuyet-minh'
    ];

    window.handleExploreRandomClick = function (e) {
        if (e) e.preventDefault();
        const currentPath = window.location.pathname + window.location.search;
        const pool = EXPLORE_RANDOM_ROUTES.filter(r => r !== currentPath && r !== window.location.pathname);
        const randomTarget = pool[Math.floor(Math.random() * pool.length)] || '/danh-sach';
        window.location.href = randomTarget;
        return false;
    };

    /* ────────────────────────────────────────────
       ACCOUNT TAB CLICK
    ──────────────────────────────────────────── */
    window.handleAccountTabClick = function (e) {
        const user = getCurrentUser();
        if (!user && window.showAuthModal) {
            if (e) e.preventDefault();
            window.showAuthModal('login');
            return false;
        }
        if (window.location.pathname.startsWith('/profile')) {
            if (e) e.preventDefault();
            if (window.innerWidth < 1024 && typeof window.showMobileProfileHub === 'function') {
                window.showMobileProfileHub();
            } else if (typeof switchTab === 'function') {
                switchTab('account');
            }
            return false;
        }
        return true;
    };

    /* ────────────────────────────────────────────
       UPDATE ACCOUNT ICON / AVATAR
    ──────────────────────────────────────────── */
    function updateAccountIcon() {
        const user = getCurrentUser();
        const icon = document.getElementById('bn-account-icon');
        if (!icon || !user) return;
        const userId = user._id || user.id || user.email;
        const avatarKey = userId ? `avatar_${userId}` : 'user_avatar';
        const avatar = localStorage.getItem(avatarKey) || user.avatar || user.photoURL;
        if (avatar) {
            icon.outerHTML = `<img src="${esc(avatar)}" id="bn-account-icon" class="bn-tab-icon"
                style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(252,213,118,0.8);"
                onerror="this.outerHTML='<svg class=\\'bn-tab-icon\\' id=\\'bn-account-icon\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\'><path d=\\'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\\' stroke=\\'currentColor\\' stroke-width=\\'1.6\\' stroke-linecap=\\'round\\'/><circle cx=\\'12\\' cy=\\'7\\' r=\\'4\\' stroke=\\'currentColor\\' stroke-width=\\'1.6\\'/></svg>'"
                alt="avatar">`;
        }
    }

    /* ────────────────────────────────────────────
       BUILD BOTTOM SHEET (Quick Drawer Modal)
    ──────────────────────────────────────────── */
    function buildSheet() {
        document.getElementById('bn-sheet-overlay')?.remove();
        document.getElementById('bn-sheet')?.remove();

        const user = getCurrentUser();
        const userHref = user ? '/profile' : '#';

        const movieTypesHtml = MOVIE_TYPES.map(t =>
            `<a href="${t.href}" class="bn-sub-item">${esc(t.label)}</a>`
        ).join('');

        const categoriesHtml = CATEGORIES.map(c =>
            `<a href="/categories?category=${c.slug}" class="bn-sub-item">${esc(c.name)}</a>`
        ).join('');

        const countriesHtml = COUNTRIES.map(c =>
            `<a href="/phim-theo-quoc-gia?country=${c.slug}" class="bn-sub-item">
                <img src="https://flagcdn.com/16x12/${c.code}.png" alt="${c.code}" width="16" height="12" style="margin-right:6px;border-radius:2px;">
                ${esc(c.name)}
            </a>`
        ).join('');

        const authHtml = user
            ? `<div class="bn-auth-footer">
                 <button class="bn-auth-btn logout" onclick="try{authService.logout();window.location.reload()}catch(e){window.location.href='login.html'}">
                     <span class="material-icons-round" style="font-size:18px;">logout</span>Đăng xuất
                 </button>
               </div>`
            : `<div class="bn-auth-footer">
                 <a href="/login" onclick="if(window.showAuthModal){event.preventDefault();window.closeBnSheet&&window.closeBnSheet();window.showAuthModal('login');return false;}"
                    class="bn-auth-btn login">
                     <span class="material-icons-round" style="font-size:18px;">login</span>Đăng nhập
                 </a>
               </div>`;

        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'bn-sheet-overlay';
        overlay.addEventListener('click', closeSheet);
        document.body.appendChild(overlay);

        // Sheet
        const sheet = document.createElement('div');
        sheet.id = 'bn-sheet';
        sheet.innerHTML = `
            <div id="bn-sheet-handle"></div>

            <div class="bn-sheet-sf-header">
                <div class="bn-sheet-sf-title">Khám phá nhanh</div>
                <button class="bn-sheet-sf-close" id="bn-sheet-close-btn" aria-label="Đóng">
                    <span class="material-icons-round">close</span>
                </button>
            </div>

            <div id="bn-sheet-scroll">
                <!-- Quick Nav Grid 5 ô -->
                <div class="bn-sf-quick-nav">
                    <a href="/" class="bn-sf-quick-btn">
                        <span class="material-icons-round">home</span>
                        <span>Trang chủ</span>
                    </a>
                    <a href="/danh-sach" class="bn-sf-quick-btn">
                        <span class="material-icons-round">view_list</span>
                        <span>Lọc phim</span>
                    </a>
                    <a href="/search" class="bn-sf-quick-btn">
                        <span class="material-icons-round">explore</span>
                        <span>Khám phá</span>
                    </a>
                    <a href="/lich-chieu" class="bn-sf-quick-btn">
                        <span class="material-icons-round">event_note</span>
                        <span>Lịch chiếu</span>
                    </a>
                    <a href="${esc(userHref)}" class="bn-sf-quick-btn" onclick="return handleAccountTabClick(event)">
                        <span class="material-icons-round">person_outline</span>
                        <span>Tài khoản</span>
                    </a>
                </div>

                <div class="bn-sf-menu-list">
                    <!-- Loại Phim Accordion -->
                    <div class="bn-sf-accordion">
                        <div class="bn-sf-list-item bn-sf-accordion-header" onclick="this.parentElement.classList.toggle('active')">
                            <div class="bn-sf-list-left">
                                <div class="bn-sf-icon-wrap"><span class="material-icons-round">grid_view</span></div>
                                <span>Loại Phim</span>
                            </div>
                            <span class="material-icons-round bn-sf-list-arrow">chevron_right</span>
                        </div>
                        <div class="bn-sf-accordion-body">
                            <div class="bn-sf-sub-grid">${movieTypesHtml}</div>
                        </div>
                    </div>

                    <!-- Thể Loại Accordion -->
                    <div class="bn-sf-accordion">
                        <div class="bn-sf-list-item bn-sf-accordion-header" onclick="this.parentElement.classList.toggle('active')">
                            <div class="bn-sf-list-left">
                                <div class="bn-sf-icon-wrap"><span class="material-icons-round">category</span></div>
                                <span>Thể Loại</span>
                            </div>
                            <span class="material-icons-round bn-sf-list-arrow">chevron_right</span>
                        </div>
                        <div class="bn-sf-accordion-body">
                            <div class="bn-sf-sub-grid">${categoriesHtml}</div>
                        </div>
                    </div>

                    <!-- Quốc Gia Accordion -->
                    <div class="bn-sf-accordion">
                        <div class="bn-sf-list-item bn-sf-accordion-header" onclick="this.parentElement.classList.toggle('active')">
                            <div class="bn-sf-list-left">
                                <div class="bn-sf-icon-wrap"><span class="material-icons-round">public</span></div>
                                <span>Quốc Gia</span>
                            </div>
                            <span class="material-icons-round bn-sf-list-arrow">chevron_right</span>
                        </div>
                        <div class="bn-sf-accordion-body">
                            <div class="bn-sf-sub-grid">${countriesHtml}</div>
                        </div>
                    </div>
                </div>

                <!-- VIP Banner -->
                <div class="bn-upgrade-card">
                    <div class="bn-upgrade-title">
                        <span class="material-icons-round" style="color:#FFD700;font-size:20px;">stars</span>
                        Nâng cấp trải nghiệm
                    </div>
                    <div class="bn-upgrade-desc">Xem phim không quảng cáo, chất lượng HD và tốc độ tải nhanh hơn.</div>
                    <a href="/pricing" class="bn-upgrade-btn">NÂNG CẤP NGAY</a>
                </div>

                ${authHtml}
            </div>
        `;

        document.body.appendChild(sheet);
        document.getElementById('bn-sheet-close-btn')?.addEventListener('click', closeSheet);
        setupSheetSwipe(sheet);
    }

    /* ────────────────────────────────────────────
       SHEET OPEN / CLOSE / TOGGLE
    ──────────────────────────────────────────── */
    let _sheetBuilt = false;
    let _sheetOpen = false;

    function ensureSheetBuilt() {
        if (!_sheetBuilt) { buildSheet(); _sheetBuilt = true; }
    }

    function openSheet() {
        ensureSheetBuilt();
        requestAnimationFrame(() => {
            document.getElementById('bn-sheet-overlay')?.classList.add('open');
            document.getElementById('bn-sheet')?.classList.add('open');
            document.body.style.overflow = 'hidden';
            document.getElementById('bn-tab-more')?.classList.add('sheet-open');
        });
        _sheetOpen = true;
    }

    function closeSheet() {
        document.getElementById('bn-sheet-overlay')?.classList.remove('open');
        document.getElementById('bn-sheet')?.classList.remove('open');
        document.body.style.overflow = '';
        document.getElementById('bn-tab-more')?.classList.remove('sheet-open');
        _sheetOpen = false;
    }

    function toggleSheet() {
        if (_sheetOpen) closeSheet(); else openSheet();
    }

    window.closeBnSheet = closeSheet;
    window.openBnSheet = openSheet;

    /* ────────────────────────────────────────────
       SWIPE DOWN TO CLOSE SHEET
    ──────────────────────────────────────────── */
    function setupSheetSwipe(sheet) {
        let startY = 0, isDragging = false;
        sheet.addEventListener('touchstart', (e) => {
            const scrollEl = document.getElementById('bn-sheet-scroll');
            if (scrollEl && scrollEl.scrollTop > 0) return;
            startY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });
        sheet.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dy = e.touches[0].clientY - startY;
            if (dy > 0) {
                sheet.style.transform = `translateY(${dy}px)`;
                sheet.style.transition = 'none';
            }
        }, { passive: true });
        sheet.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const dy = e.changedTouches[0].clientY - startY;
            sheet.style.transition = '';
            sheet.style.transform = '';
            if (dy > 120) closeSheet();
        }, { passive: true });
    }

    /* ────────────────────────────────────────────
       KEYBOARD
    ──────────────────────────────────────────── */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && _sheetOpen) closeSheet();
    });

    /* ────────────────────────────────────────────
       INIT & RESIZE OBSERVER
    ──────────────────────────────────────────── */
    function init() {
        if (window.innerWidth >= 1024) {
            const existing = document.getElementById('bottom-nav-dock');
            if (existing) existing.remove();
            return;
        }
        buildDock();
        updateAccountIcon();
        setTimeout(() => ensureSheetBuilt(), 600);
        
        document.addEventListener('auth:profileSynced', () => {
            if (window.rebuildBottomNav) window.rebuildBottomNav();
        });
        document.addEventListener('auth:logout', () => {
            if (window.rebuildBottomNav) window.rebuildBottomNav();
        });
        setTimeout(updateAccountIcon, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 150);
    });

    window.addEventListener('orientationchange', function () {
        setTimeout(init, 200);
    });

    window.rebuildBottomNav = function () {
        _sheetBuilt = false;
        document.getElementById('bottom-nav-dock')?.remove();
        document.getElementById('bn-sheet')?.remove();
        document.getElementById('bn-sheet-overlay')?.remove();
        init();
    };
})();
