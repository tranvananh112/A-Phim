// Sticky Navigation with scroll effects and auto-hide
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 10; // Ngưỡng scroll để kích hoạt ẩn/hiện
    const hideThreshold = 100; // Scroll xuống bao nhiêu px thì bắt đầu ẩn

    function updateNavOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop;

        // Nếu ở đầu trang (scrollTop < 50), luôn hiện nav và trong suốt
        if (scrollTop < 50) {
            nav.classList.remove('scrolled', 'nav-hidden');
            nav.classList.add('nav-visible');
        }
        // Nếu scroll xuống và đã scroll qua ngưỡng - ẨN thanh nav
        else if (scrollDelta > scrollThreshold && scrollTop > hideThreshold) {
            nav.classList.add('scrolled', 'nav-hidden');
            nav.classList.remove('nav-visible');
        }
        // Nếu đã scroll xuống nhưng không di chuyển - VẪN ẨN
        else if (scrollTop > 50) {
            nav.classList.add('scrolled', 'nav-hidden');
            nav.classList.remove('nav-visible');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        ticking = false;
    }

    // Use requestAnimationFrame for better performance
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateNavOnScroll);
            ticking = true;
        }
    }

    // Listen to scroll events
    window.addEventListener('scroll', requestTick, { passive: true });

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
