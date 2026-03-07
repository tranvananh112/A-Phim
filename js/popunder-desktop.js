// Popunder Desktop Only - Load script chỉ trên desktop
(function () {
    'use strict';

    // Kiểm tra xem có phải desktop không
    function isDesktop() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;

        // Chỉ load trên desktop (không phải mobile/tablet và màn hình >= 1024px)
        return !isMobile && !isTablet && screenWidth >= 1024;
    }

    // Load Popunder script chỉ trên desktop
    function loadPopunderScript() {
        if (!isDesktop()) {
            console.log('Popunder: Skipped on mobile/tablet');
            return;
        }

        console.log('Popunder: Loading on desktop');

        // Tạo script element
        const script = document.createElement('script');
        script.src = 'https://encyclopediainsoluble.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js';
        script.async = true;
        script.defer = true;

        // Thêm vào head
        document.head.appendChild(script);

        console.log('Popunder: Script loaded successfully');
    }

    // Load khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPopunderScript);
    } else {
        loadPopunderScript();
    }

    // Reload khi resize (nếu chuyển từ mobile sang desktop)
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // Chỉ reload nếu chưa có script và đang ở desktop
            if (isDesktop() && !document.querySelector('script[src*="bd336d4948e946b0e4a42348436b9f13"]')) {
                loadPopunderScript();
            }
        }, 250);
    });
})();
