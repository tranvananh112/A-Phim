// AdsTerra Popunder Integration
(function () {
    'use strict';

    const CONFIG = {
        enabled: true,
        excludePages: ['/login.html', '/register.html', '/payment.html'],
        maxPopsPerSession: 5, // 5 pops/session
        minTimeBetweenPops: 180000, // 3 phút giữa các pops
        storageKey: 'adsterra_popunder'
    };

    function shouldLoadAds() {
        const currentPath = window.location.pathname;

        // Check excluded pages
        for (let excludePath of CONFIG.excludePages) {
            if (currentPath.includes(excludePath)) {
                console.log('[AdsTerra] Skipped on excluded page:', currentPath);
                return false;
            }
        }

        // Check session limit
        const popCount = parseInt(sessionStorage.getItem(CONFIG.storageKey + '_count') || '0');
        if (popCount >= CONFIG.maxPopsPerSession) {
            console.log('[AdsTerra] Max pops reached:', popCount);
            return false;
        }

        // Check time between pops
        const lastPopTime = sessionStorage.getItem(CONFIG.storageKey + '_time');
        if (lastPopTime) {
            const timeSince = Date.now() - parseInt(lastPopTime);
            if (timeSince < CONFIG.minTimeBetweenPops) {
                const waitMinutes = Math.ceil((CONFIG.minTimeBetweenPops - timeSince) / 60000);
                console.log('[AdsTerra] Wait', waitMinutes, 'minutes before next pop');
                return false;
            }
        }

        return true;
    }

    function loadPopunder() {
        if (!CONFIG.enabled || !shouldLoadAds()) return;

        // Update counters
        const popCount = parseInt(sessionStorage.getItem(CONFIG.storageKey + '_count') || '0');
        sessionStorage.setItem(CONFIG.storageKey + '_count', (popCount + 1).toString());
        sessionStorage.setItem(CONFIG.storageKey + '_time', Date.now().toString());

        const script = document.createElement('script');
        script.src = 'https://pl28791542.effectivegatecpm.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js';
        script.async = true;
        document.head.appendChild(script);

        console.log('[AdsTerra] Popunder loaded - Pop', popCount + 1, 'of', CONFIG.maxPopsPerSession);
    }

    // Load khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPopunder);
    } else {
        loadPopunder();
    }

})();
