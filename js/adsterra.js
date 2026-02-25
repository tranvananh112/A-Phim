// AdsTerra Popunder Integration - UX Optimized
(function () {
    'use strict';

    const CONFIG = {
        enabled: true,
        excludePages: ['/login.html', '/register.html', '/payment.html'],
        maxPopsPerSession: 3, // Giảm xuống 3 lần/session để ít phiền hơn
        minTimeBetweenPops: 300000, // 5 phút giữa các pops (tăng từ 3 phút)
        initialDelay: 15000, // Đợi 15 giây sau khi vào trang
        requireInteraction: true, // YÊU CẦU user phải click/scroll trước
        storageKey: 'adsterra_popunder'
    };

    let isReady = false;
    let hasInteracted = false;

    function shouldLoadAds() {
        const currentPath = window.location.pathname;

        // Check excluded pages
        for (let excludePath of CONFIG.excludePages) {
            if (currentPath.includes(excludePath)) {
                console.log('[AdsTerra] ⏭️ Skipped on excluded page:', currentPath);
                return false;
            }
        }

        // QUAN TRỌNG: Yêu cầu user phải tương tác trước
        if (CONFIG.requireInteraction && !hasInteracted) {
            console.log('[AdsTerra] ⏳ Waiting for user interaction (click/scroll)...');
            return false;
        }

        // Check session limit
        const popCount = parseInt(sessionStorage.getItem(CONFIG.storageKey + '_count') || '0');
        if (popCount >= CONFIG.maxPopsPerSession) {
            console.log('[AdsTerra] ⛔ Max pops reached:', popCount, '/', CONFIG.maxPopsPerSession);
            return false;
        }

        // Check time between pops
        const lastPopTime = sessionStorage.getItem(CONFIG.storageKey + '_time');
        if (lastPopTime) {
            const timeSince = Date.now() - parseInt(lastPopTime);
            if (timeSince < CONFIG.minTimeBetweenPops) {
                const waitMinutes = Math.ceil((CONFIG.minTimeBetweenPops - timeSince) / 60000);
                console.log('[AdsTerra] ⏰ Wait', waitMinutes, 'minutes before next pop');
                return false;
            }
        }

        return true;
    }

    function loadPopunder() {
        if (!CONFIG.enabled || !isReady || !shouldLoadAds()) {
            return;
        }

        // Update counters
        const popCount = parseInt(sessionStorage.getItem(CONFIG.storageKey + '_count') || '0');
        sessionStorage.setItem(CONFIG.storageKey + '_count', (popCount + 1).toString());
        sessionStorage.setItem(CONFIG.storageKey + '_time', Date.now().toString());

        const script = document.createElement('script');
        script.src = 'https://pl28791542.effectivegatecpm.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js';
        script.async = true;
        document.head.appendChild(script);

        const nextWait = Math.ceil(CONFIG.minTimeBetweenPops / 60000);
        console.log('[AdsTerra] ✅ Popunder loaded - Pop', popCount + 1, '/', CONFIG.maxPopsPerSession, '| Next in', nextWait, 'minutes');
    }

    // Track user interaction (click, scroll, touch)
    function trackInteraction() {
        if (!hasInteracted) {
            hasInteracted = true;
            console.log('[AdsTerra] 👆 User interaction detected');

            // Đợi thêm 3 giây sau interaction đầu tiên
            setTimeout(() => {
                console.log('[AdsTerra] 🎯 Ready to trigger popunder');
                loadPopunder();
            }, 3000);
        }
    }

    // Setup listeners for user interactions
    function setupInteractionListeners() {
        const events = ['click', 'scroll', 'touchstart', 'keydown'];

        events.forEach(event => {
            document.addEventListener(event, trackInteraction, {
                once: true,  // Chỉ lắng nghe 1 lần
                passive: true  // Không block performance
            });
        });

        console.log('[AdsTerra] 👂 Listening for user interaction...');
    }

    // Initialize after initial delay
    function initialize() {
        console.log('[AdsTerra] ⏳ Initializing in', CONFIG.initialDelay / 1000, 'seconds...');

        setTimeout(() => {
            isReady = true;
            console.log('[AdsTerra] ✅ Ready');

            if (CONFIG.requireInteraction) {
                setupInteractionListeners();
            } else {
                // Nếu không yêu cầu interaction, trigger luôn
                loadPopunder();
            }
        }, CONFIG.initialDelay);
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
