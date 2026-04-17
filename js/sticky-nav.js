// Sticky Navigation with scroll effects
// Desktop: Always visible, only background changes
// Mobile: Auto-hide on scroll down, show on scroll up
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollTop = 0;
    let ticking = false;
    // Giảm threshold để scroll nhạy hơn (vuốt 5px là ẩn ngay)
    const scrollThreshold = 5;
    const hideThreshold = 80; // Hạ thấp ngưỡng ẩn cho nhạy hơn

    // Check if device is mobile/tablet
    function isMobileDevice() {
        return window.innerWidth < 1024; // lg breakpoint
    }

    function updateNavOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop;
        const isMobile = isMobileDevice();

        // DESKTOP: Luôn hiện, chỉ thay đổi background (CODE CŨ)
        if (!isMobile) {
            if (scrollTop > 50) {
                nav.classList.add('scrolled');
                nav.classList.remove('nav-hidden');
                nav.classList.add('nav-visible');
            } else {
                nav.classList.remove('scrolled');
                nav.classList.remove('nav-hidden');
                nav.classList.add('nav-visible');
            }
        }
        // MOBILE: Auto-hide khi scroll xuống
        else {
            // Ở đầu trang (nhỏ hơn 5px) - luôn hiện rõ
            if (scrollTop <= 5) {
                nav.classList.remove('scrolled', 'nav-hidden');
                nav.classList.add('nav-visible');
            }
            // Vuốt xuống dù chỉ 1px - ẨN LẬP TỨC
            else if (scrollTop > lastScrollTop) {
                nav.classList.add('scrolled', 'nav-hidden');
                nav.classList.remove('nav-visible');
            }
            // Vuốt lên - HIỆN (debounce nhẹ 2px để mượt)
            else if (scrollTop < lastScrollTop - 2) {
                nav.classList.add('scrolled', 'nav-visible');
                nav.classList.remove('nav-hidden');
            }
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavOnScroll);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });

    // Re-check on resize
    window.addEventListener('resize', () => {
        updateNavOnScroll();
    }, { passive: true });

    // Initial check
    updateNavOnScroll();

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');

        if (mobileMenu && mobileMenuBtn &&
            !mobileMenu.contains(event.target) &&
            !mobileMenuBtn.contains(event.target) &&
            !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Prevent body scroll when mobile menu is open
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
})();
