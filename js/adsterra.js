// AdsTerra Popunder Integration - Professional & Balanced
// Cấu hình tối ưu: Tăng doanh thu nhưng không làm phiền người dùng
(function () {
    'use strict';

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const CONFIG = {
        enabled: true, // BẬT kiểm soát chuyên nghiệp
        excludePages: ['/payment.html', '/pricing.html'], // Chỉ loại trừ trang thanh toán

        // CHIẾN LƯỢC TĂNG DOANH THU DESKTOP:
        // Desktop: 6 pops/session, mỗi 2 phút - Tăng gấp đôi để tăng doanh thu
        // Mobile: 3 pops/session, mỗi 5 phút - Tăng nhẹ
        maxPopsPerSession: isMobile ? 3 : 6,
        minTimeBetweenPops: isMobile ? 300000 : 120000, // Mobile: 5 phút, Desktop: 2 phút

        // GRACE PERIOD: Giảm xuống để trigger nhanh hơn
        gracePeriod: 20000, // 20 giây - trigger nhanh hơn
        firstVisitKey: 'adsterra_first_visit',

        // Delay lần đầu: Giảm để trigger nhanh hơn
        firstPopDelay: isMobile ? 10000 : 5000, // Mobile: 10s, Desktop: 5s

        initialDelay: 3000, // 3 giây để trang load xong
        interactionDelay: 1000, // 1 giây sau tương tác - trigger nhanh hơn
        requireInteraction: true, // BẮT BUỘC phải có tương tác
        storageKey: 'adsterra_popunder',
        scriptUrl: 'https://encyclopediainsoluble.com/bd/33/6d/bd336d4948e946b0e4a42348436b9f13.js',
        resetOnPageChange: false, // Giữ counter qua các trang

        // PRELOAD NAVIGATION: Load trang đích trước khi popunder xuất hiện
        preloadNavigation: true, // BẬT preload navigation
        preloadDelay: 300 // 300ms để trang bắt đầu load trước khi popunder trigger
    };

    let isReady = false;
    let hasInteracted = false;
    let preloadedScript = null;
    let pendingNavigation = null; // Lưu navigation đang chờ

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

    // Intercept navigation để preload trang trước khi popunder xuất hiện
    function setupNavigationInterceptor() {
        if (!CONFIG.preloadNavigation) return;

        // Intercept tất cả clicks vào links
        document.addEventListener('click', function (e) {
            // Tìm link gần nhất
            const link = e.target.closest('a');
            if (!link || !link.href) return;

            // Chỉ intercept internal links
            const url = new URL(link.href);
            if (url.origin !== window.location.origin) return;

            // Bỏ qua links có target="_blank" hoặc download
            if (link.target === '_blank' || link.hasAttribute('download')) return;

            // Kiểm tra xem có nên trigger popunder không
            if (!shouldLoadAds()) return;

            // Prevent default navigation
            e.preventDefault();

            const targetUrl = link.href;
            console.log('[AdsTerra] 🔗 Navigation intercepted:', targetUrl);

            // Bước 1: Bắt đầu preload trang đích (fetch HTML)
            console.log('[AdsTerra] ⏳ Preloading target page...');
            fetch(targetUrl)
                .then(response => response.text())
                .then(html => {
                    console.log('[AdsTerra] ✅ Target page preloaded');

                    // Bước 2: Trigger popunder NGAY SAU KHI preload xong
                    loadPopunder('navigation');

                    // Bước 3: Navigate đến trang đích sau delay ngắn
                    setTimeout(() => {
                        console.log('[AdsTerra] 🚀 Navigating to:', targetUrl);
                        window.location.href = targetUrl;
                    }, CONFIG.preloadDelay);
                })
                .catch(err => {
                    // Nếu preload fail, navigate bình thường
                    console.log('[AdsTerra] ⚠️ Preload failed, navigating normally');
                    window.location.href = targetUrl;
                });
        }, true); // useCapture = true để catch trước các handlers khác

        console.log('[AdsTerra] 🔗 Navigation interceptor active');
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

        // GRACE PERIOD: Người dùng mới vào, cho thời gian làm quen
        const now = Date.now();
        let firstVisitTime = sessionStorage.getItem(CONFIG.firstVisitKey);
        if (!firstVisitTime) {
            sessionStorage.setItem(CONFIG.firstVisitKey, now.toString());
            firstVisitTime = now;
        }

        const timeSinceFirstVisit = now - parseInt(firstVisitTime);
        if (timeSinceFirstVisit < CONFIG.gracePeriod) {
            const waitSeconds = Math.ceil((CONFIG.gracePeriod - timeSinceFirstVisit) / 1000);
            console.log('[AdsTerra] 🛡️ Grace period active. Wait', waitSeconds, 'seconds (let user browse first)');
            return false;
        }

        // Yêu cầu tương tác trước
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
            const timeSince = now - parseInt(lastPopTime);
            const isFirstPopDone = sessionStorage.getItem(CONFIG.storageKey + '_first_done');

            // Lần đầu tiên delay ngắn hơn
            const requiredDelay = isFirstPopDone ? CONFIG.minTimeBetweenPops : CONFIG.firstPopDelay;

            if (timeSince < requiredDelay) {
                const waitMinutes = Math.ceil((requiredDelay - timeSince) / 60000);
                const waitSeconds = Math.ceil((requiredDelay - timeSince) / 1000);
                const displayTime = waitSeconds < 60 ? waitSeconds + ' seconds' : waitMinutes + ' minutes';
                console.log('[AdsTerra] ⏰ Wait', displayTime, 'before next pop');
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
        script.setAttribute('data-cfasync', 'false');
        document.head.appendChild(script);

        const nextWait = popCount === 0
            ? Math.ceil(CONFIG.firstPopDelay / 1000) + ' seconds'
            : Math.ceil(CONFIG.minTimeBetweenPops / 60000) + ' minutes';

        const device = isMobile ? 'Mobile' : 'Desktop';
        console.log('[AdsTerra] ✅ Popunder loaded (' + source + ') - ' + device + ' - Pop', popCount + 1, '/', CONFIG.maxPopsPerSession, '| Next in', nextWait);
    }

    // Track user interaction (click, scroll, touch)
    function trackInteraction() {
        if (!hasInteracted) {
            hasInteracted = true;
            console.log('[AdsTerra] 👆 User interaction detected');

            // Delay để không trigger ngay lập tức
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
        if (!CONFIG.enabled) {
            console.log('[AdsTerra] ⏭️ Disabled by config');
            return;
        }

        const device = isMobile ? 'Mobile' : 'Desktop';
        const maxPops = CONFIG.maxPopsPerSession;
        const minTime = Math.ceil(CONFIG.minTimeBetweenPops / 60000);
        const gracePeriod = Math.ceil(CONFIG.gracePeriod / 1000);

        console.log('[AdsTerra] ⏳ Initializing in', CONFIG.initialDelay / 1000, 'seconds...');
        console.log('[AdsTerra] 📱 Device:', device, '| Max pops:', maxPops, '| Min time:', minTime, 'min | Grace period:', gracePeriod, 's');
        console.log('[AdsTerra] 🔗 Navigation preload:', CONFIG.preloadNavigation ? 'ENABLED' : 'DISABLED');

        // Preload script ngay lập tức để giảm độ trễ
        preloadPopunderScript();

        // Setup navigation interceptor
        setupNavigationInterceptor();

        setTimeout(() => {
            isReady = true;
            console.log('[AdsTerra] ✅ Ready');

            if (CONFIG.requireInteraction) {
                setupInteractionListeners();
            } else {
                // Nếu không yêu cầu interaction, trigger luôn
                loadPopunder('auto');
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
