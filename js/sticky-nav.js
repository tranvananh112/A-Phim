// Sticky Navigation with scroll effects
(function () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollTop = 0;
    let ticking = false;

    function updateNavOnScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add 'scrolled' class when scrolled down
        if (scrollTop > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
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
