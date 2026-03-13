// Sticky Navigation with scroll effects
// Desktop: Always visible, only background changes
// Mobile: Auto-hide on scroll down, show on scroll up
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 10;
    const hideThreshold = 100;

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
            // Ở đầu trang - luôn hiện
            if (scrollTop < 50) {
                nav.classList.remove('scrolled', 'nav-hidden');
                nav.classList.add('nav-visible');
            }
            // Scroll xuống - ẨN
            else if (scrollDelta > scrollThreshold && scrollTop > hideThreshold) {
                nav.classList.add('scrolled', 'nav-hidden');
                nav.classList.remove('nav-visible');
            }
            // Scroll lên - HIỆN
            else if (scrollDelta < -scrollThreshold) {
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
