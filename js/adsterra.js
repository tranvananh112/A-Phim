// AdsTerra Popunder Integration
(function () {
    'use strict';

    const CONFIG = {
        enabled: true,
        excludePages: ['/login.html', '/register.html', '/payment.html']
    };

    function shouldLoadAds() {
        const currentPath = window.location.pathname;
        for (let excludePath of CONFIG.excludePages) {
            if (currentPath.includes(excludePath)) {
                console.log('[AdsTerra] Skipped on excluded page:', currentPath);
                return false;
            }
        }
        return true;
    }

    function loadPopunder() {
        if (!CONFIG.enabled || !shouldLoadAds()) return;

        const script = document.createElement('script');
        script.src = 'https://pl28791542.effectivegatecpm.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js';
        script.async = true;
        document.head.appendChild(script);

        console.log('[AdsTerra] Popunder loaded');
    }

    // Load khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPopunder);
    } else {
        loadPopunder();
    }

})();
