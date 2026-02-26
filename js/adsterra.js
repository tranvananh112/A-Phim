// AdsTerra Popunder Integration - Revenue Optimized
(function () {
    'use strict';

    const CONFIG = {
        enabled: true,
        excludePages: ['/login.html', '/register.html', '/payment.html'],
        maxPopsPerSession: 4, // Tổng 4 pops cho cả session
        minTimeBetweenPops: 180000, // 3 phút giữa các pops
        firstPopDelay: 5000, // 5 giây cho lần đầu
        initialDelay: 3000, // 3 giây sau khi vào trang
        interactionDelay: 1000, // 1 giây sau interaction
        requireInteraction: true,
        storageKey: 'adsterra_popunder', // Dùng session storage
        watchButtonStorageKey: 'adsterra_watch_button',
        scriptUrl: 'https://pl28791542.effectivegatecpm.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js',
        resetOnPageChange: false // KHÔNG reset mỗi trang - giữ counter cho cả session
    };

    let isReady = false;
    let hasInteracted = false;
    let preloadedScript = null;

    // Preload script để giảm độ trễ
    function preloadPopunderScript() {
        if (preloadedScript) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = CONFIG.scriptUrl;
        document.head.appendChild(link);

        console.log('[AdsTerra] 📦 Preloading popunder script...');
    }

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
            console.log('[AdsTerra] ⛔ Max pops reached for this session:', popCount, '/', CONFIG.maxPopsPerSession);
            return false;
        }

        // Check time between pops
        const lastPopTime = sessionStorage.getItem(CONFIG.storageKey + '_time');
        if (lastPopTime) {
            const timeSince = Date.now() - parseInt(lastPopTime);
            const isFirstPopDone = sessionStorage.getItem(CONFIG.storageKey + '_first_done');

            // Lần đầu tiên chỉ cần đợi 10 giây
            const requiredDelay = isFirstPopDone ? CONFIG.minTimeBetweenPops : CONFIG.firstPopDelay;

            if (timeSince < requiredDelay) {
                const waitMinutes = Math.ceil((requiredDelay - timeSince) / 60000);
                const waitSeconds = Math.ceil((requiredDelay - timeSince) / 1000);
                console.log('[AdsTerra] ⏰ Wait', waitSeconds < 60 ? waitSeconds + ' seconds' : waitMinutes + ' minutes', 'before next pop');
                return false;
            }
        }

        return true;
    }

    function loadPopunder(source = 'auto') {
        if (!CONFIG.enabled || !isReady || !shouldLoadAds()) {
            return;
        }

        // Update counters
        const popCount = parseInt(sessionStorage.getItem(CONFIG.storageKey + '_count') || '0');
        sessionStorage.setItem(CONFIG.storageKey + '_count', (popCount + 1).toString());
        sessionStorage.setItem(CONFIG.storageKey + '_time', Date.now().toString());

        // Đánh dấu lần đầu đã xong
        if (popCount === 0) {
            sessionStorage.setItem(CONFIG.storageKey + '_first_done', 'true');
        }

        const script = document.createElement('script');
        script.src = CONFIG.scriptUrl;
        script.async = true;
        document.head.appendChild(script);

        const nextWait = popCount === 0 ? '5 seconds' : Math.ceil(CONFIG.minTimeBetweenPops / 60000) + ' minutes';
        console.log('[AdsTerra] ✅ Popunder loaded (' + source + ') - Pop', popCount + 1, '/', CONFIG.maxPopsPerSession, '| Next in', nextWait);
    }

    // Special function for "XEM NGAY" button pop - INSTANT trigger
    function loadWatchButtonPop() {
        // Check if already popped for watch button in this session
        const hasPopped = sessionStorage.getItem(CONFIG.watchButtonStorageKey);
        if (hasPopped) {
            console.log('[AdsTerra] ⏭️ Watch button pop already triggered this session');
            return;
        }

        // Mark as popped IMMEDIATELY
        sessionStorage.setItem(CONFIG.watchButtonStorageKey, 'true');

        // Load popunder INSTANTLY - no delay
        const script = document.createElement('script');
        script.src = CONFIG.scriptUrl;
        script.async = false; // Load synchronously for faster execution
        document.head.appendChild(script);

        console.log('[AdsTerra] 🎬 Watch button popunder loaded INSTANTLY (1 time per session)');
    }

    // Setup watch button listener on movie detail pages
    function setupWatchButtonListener() {
        // Check if we're on movie-detail page
        if (!window.location.pathname.includes('movie-detail.html')) {
            return;
        }

        // Wait for button to be available
        const checkButton = setInterval(() => {
            const watchButtons = document.querySelectorAll('button, a');

            watchButtons.forEach(button => {
                const textSpan = button.querySelector('span.text-lg.tracking-wide');
                if (textSpan && textSpan.textContent.trim() === 'XEM NGAY') {
                    // Found the button
                    clearInterval(checkButton);

                    button.addEventListener('click', function (e) {
                        console.log('[AdsTerra] 🎯 "XEM NGAY" button clicked');
                        loadWatchButtonPop();
                    }, { once: true }); // Only trigger once

                    console.log('[AdsTerra] 👂 Listening for "XEM NGAY" button click');
                }
            });
        }, 500);

        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkButton), 10000);
    }

    // Track user interaction (click, scroll, touch)
    function trackInteraction() {
        if (!hasInteracted) {
            hasInteracted = true;
            console.log('[AdsTerra] 👆 User interaction detected');

            // Giảm delay xuống 1 giây để pop nhanh hơn
            setTimeout(() => {
                console.log('[AdsTerra] 🎯 Ready to trigger popunder');
                loadPopunder('interaction');
            }, CONFIG.interactionDelay);
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

        // Preload script ngay lập tức để giảm độ trễ
        preloadPopunderScript();

        setTimeout(() => {
            isReady = true;
            console.log('[AdsTerra] ✅ Ready');

            if (CONFIG.requireInteraction) {
                setupInteractionListeners();
            } else {
                // Nếu không yêu cầu interaction, trigger luôn
                loadPopunder('auto');
            }

            // Setup watch button listener for movie detail pages
            setupWatchButtonListener();
        }, CONFIG.initialDelay);
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose function globally for manual triggering if needed
    window.triggerWatchButtonPop = loadWatchButtonPop;

})();
