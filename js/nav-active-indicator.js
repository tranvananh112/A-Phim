/**
 * nav-active-indicator.js
 * Tự động xác định trang hiện tại, tìm nav item tương ứng
 * và hiển thị vùng vàng (indicator) đúng vị trí, đúng trung tâm.
 */
(function () {
    'use strict';

    // Map: pathname pattern -> index trong navLinks[]
    // Thứ tự navLinks: [0]=Trang chủ, [1]=Phim(btn), [2]=Danh Sách(btn), [3]=Thể Loại(btn), [4]=Khám phá, [5]=Gói cước, [6]=🔞 Phim X
    const PAGE_MAP = {
        'index.html': 0,
        '': 0,           // root
        'phim-theo-quoc-gia.html': 1, // Phim
        'phim-x.html': 6,
        'danh-sach.html': 2,
        'categories.html': 3,
        'search.html': 4,
        'pricing.html': 5,
        'support.html': 5,
        'watch.html': -1,       // -1 = không highlight item nào
        'movie-detail.html': -1,
        'login.html': -1,
        'register.html': -1,
        'profile.html': -1,
    };

    function initIndicator() {
        // Tìm div pill container (flex gap-1 bg-white/5...) bên trong desktop nav wrapper
        // Thử nhiều selector khác nhau vì Tailwind class dùng ký tự đặc biệt
        let navContainer = null;
        const selectors = [
            'nav .hidden.lg\\:flex > div',
            'nav [class*="hidden"][class*="lg"] > div',
        ];
        for (const sel of selectors) {
            try {
                const el = document.querySelector(sel);
                if (el && el.querySelectorAll('.nav-item').length > 0) {
                    navContainer = el;
                    break;
                }
            } catch (e) { /* ignore invalid selector */ }
        }
        // Fallback: tìm thủ công
        if (!navContainer) {
            const allDivs = document.querySelectorAll('nav div');
            for (const div of allDivs) {
                if (div.querySelectorAll('.nav-item').length >= 3 &&
                    window.getComputedStyle(div).display !== 'none') {
                    navContainer = div;
                    break;
                }
            }
        }
        if (!navContainer) return;

        const navLinks = navContainer.querySelectorAll('.nav-item');
        if (!navLinks || navLinks.length === 0) return;

        // Xác định trang hiện tại
        const pathname = window.location.pathname;
        const currentPage = pathname.split('/').pop() || '';

        let activeIndex = PAGE_MAP[currentPage];

        // Fallback: quét qua tên file
        if (activeIndex === undefined) {
            if (pathname.includes('danh-sach')) activeIndex = 2;
            else if (pathname.includes('categories')) activeIndex = 3;
            else if (pathname.includes('search')) activeIndex = 4;
            else if (pathname.includes('pricing')) activeIndex = 5;
            else if (pathname.includes('phim-theo-quoc-gia') || pathname.includes('hanh-dong') || pathname.includes('filter')) activeIndex = 1;
            else if (pathname.includes('phim-x')) activeIndex = 6;
            else if (pathname === '/' || pathname === '/index.html') activeIndex = 0;
            else activeIndex = -1;
        }

        // Không highlight gì nếu activeIndex = -1
        if (activeIndex === -1) return;

        // Clamp in case trang mới được thêm vào
        const activeLink = navLinks[Math.min(activeIndex, navLinks.length - 1)];
        if (!activeLink) return;

        // Tạo indicator nếu chưa có
        let indicator = navContainer.querySelector('.nav-slide-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'nav-slide-indicator absolute rounded-full pointer-events-none';
            indicator.style.cssText = [
                'background: rgba(242, 242, 13, 0.22)',
                'border: 1px solid rgba(242, 242, 13, 0.35)',
                'box-shadow: 0 0 14px rgba(242,242,13,0.18), inset 0 0 10px rgba(242,242,13,0.1)',
                'backdrop-filter: blur(8px)',
                'z-index: 0',
                'opacity: 0',
                'transition: left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
            ].join(';');
            navContainer.style.position = 'relative';
            navContainer.insertBefore(indicator, navContainer.firstChild);
        }

        // Đặt z-index cho nav items
        navLinks.forEach(link => {
            link.style.position = 'relative';
            link.style.zIndex = '1';
        });

        /**
         * Tính vị trí indicator bằng cách kết hợp getBoundingClientRect() và toán khử scale,
         * bảo đảm độ chính xác tới hàng thập phân (sub-pixel), giúp vùng vàng LUÔN vào đúng 
         * giữa chữ (centered) không bị lệch vì làm tròn số.
         */
        function placeIndicator(target, animate) {
            const rect = target.getBoundingClientRect();
            const containerRect = navContainer.getBoundingClientRect();
            
            // Lấy kích thước layout chưa scale của container
            const offsetWidth = navContainer.offsetWidth;
            const offsetHeight = navContainer.offsetHeight;
            
            // Kích thước visual (sau scale) chia kích thước layout => tìm ra hệ số scale thực tế
            const scaleX = offsetWidth > 0 ? (containerRect.width / offsetWidth) : 1;
            const scaleY = offsetHeight > 0 ? (containerRect.height / offsetHeight) : 1;
            
            // Khử scale cho mọi đại lượng, đưa về toạ độ pixel thực trong container
            const left = (rect.left - containerRect.left) / scaleX;
            const top = (rect.top - containerRect.top) / scaleY;
            const width = rect.width / scaleX;
            const height = rect.height / scaleY;
            
            // Container có thể có border (ví dụ 1px), cần offset thêm để left/top khớp hệ toạ độ padding-box
            const computedStyle = window.getComputedStyle(navContainer);
            const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
            const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;

            if (!animate) {
                indicator.style.transition = 'none';
            } else {
                indicator.style.transition = '';
            }

            indicator.style.width = width + 'px';
            indicator.style.height = height + 'px';
            indicator.style.left = (left - borderLeft) + 'px';
            indicator.style.top = (top - borderTop) + 'px';
            indicator.style.opacity = '1';

            if (!animate) {
                // Force reflow để huỷ transition tức thì
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        indicator.style.transition = '';
                    });
                });
            }
        }

        // Hover: di chuyển indicator theo chuột
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => placeIndicator(link, true));
        });

        // Khi chuột rời container: quay về active item
        navContainer.addEventListener('mouseleave', () => placeIndicator(activeLink, true));

        // Initial placement (no animation) - wait for layout
        function setInitial() {
            placeIndicator(activeLink, false);
        }

        // Chạy ngay
        requestAnimationFrame(setInitial);

        // Chạy lại sau khi font load xong (tránh bị lệch do font chưa render)
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => placeIndicator(activeLink, false));
        }

        // Chạy lại sau khi trang load hoàn tất
        window.addEventListener('load', () => requestAnimationFrame(() => placeIndicator(activeLink, false)));

        // Chạy lại khi resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => placeIndicator(activeLink, false), 100);
        });
    }

    // Khởi chạy
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIndicator);
    } else {
        initIndicator();
    }
})();
