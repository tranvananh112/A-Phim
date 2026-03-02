// Smartlink Integration - ID: 28724969
// Desktop: 2 lần/phiên (XEM NGAY + Chọn tập), cách 5 phút
// Mobile: 1 lần/phiên (Đăng nhập)

(function () {
    'use strict';

    const CONFIG = {
        smartlinkUrl: 'https://encyclopediainsoluble.com/cymf7jzj?key=4e5b8afe200c9075f14db00783c40f51',
        smartlinkId: '28724969',

        // Desktop: 2 pops, cách 5 phút
        desktop: {
            maxPops: 2,
            minTimeBetween: 300000, // 5 phút
        },

        // Mobile: 1 pop duy nhất
        mobile: {
            maxPops: 1,
        },

        storageKey: 'smartlink_session'
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Kiểm tra có thể trigger không
    function canTrigger() {
        const session = JSON.parse(sessionStorage.getItem(CONFIG.storageKey) || '{}');
        const maxPops = isMobile ? CONFIG.mobile.maxPops : CONFIG.desktop.maxPops;

        // Kiểm tra số lần đã pop
        const popCount = session.count || 0;
        if (popCount >= maxPops) {
            console.log('[Smartlink] Max pops reached:', popCount, '/', maxPops);
            return false;
        }

        // Desktop: Kiểm tra thời gian giữa các lần pop
        if (!isMobile && session.lastTime) {
            const timeSince = Date.now() - session.lastTime;
            if (timeSince < CONFIG.desktop.minTimeBetween) {
                const waitMinutes = Math.ceil((CONFIG.desktop.minTimeBetween - timeSince) / 60000);
                console.log('[Smartlink] Wait', waitMinutes, 'minutes before next pop');
                return false;
            }
        }

        return true;
    }

    // Trigger smartlink
    function triggerSmartlink(source) {
        if (!canTrigger()) return;

        // Update session
        const session = JSON.parse(sessionStorage.getItem(CONFIG.storageKey) || '{}');
        session.count = (session.count || 0) + 1;
        session.lastTime = Date.now();
        sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(session));

        // Open smartlink
        window.open(CONFIG.smartlinkUrl, '_blank');

        const device = isMobile ? 'Mobile' : 'Desktop';
        const maxPops = isMobile ? CONFIG.mobile.maxPops : CONFIG.desktop.maxPops;
        console.log('[Smartlink]', device, 'triggered from:', source, '| Pop', session.count, '/', maxPops);
    }

    // Setup triggers cho movie-detail.html
    function setupMovieDetailTriggers() {
        if (!window.location.pathname.includes('movie-detail.html')) return;

        // Desktop: Trigger 1 - Nút "XEM NGAY"
        if (!isMobile) {
            const checkWatchButton = setInterval(() => {
                // Tìm nút có text "XEM NGAY"
                const buttons = document.querySelectorAll('a, button');
                buttons.forEach(btn => {
                    const hasText = btn.textContent.includes('XEM NGAY');

                    if (hasText && !btn.dataset.smartlinkAttached) {
                        btn.dataset.smartlinkAttached = 'true';
                        btn.addEventListener('click', () => {
                            triggerSmartlink('XEM NGAY Button (Desktop)');
                        });
                        console.log('[Smartlink] Desktop - Listening on XEM NGAY button');
                        clearInterval(checkWatchButton);
                    }
                });
            }, 500);

            setTimeout(() => clearInterval(checkWatchButton), 10000);
        }
    }

    // Setup triggers cho watch.html
    function setupWatchPageTriggers() {
        if (!window.location.pathname.includes('watch.html')) return;

        // Desktop: Trigger 2 - Chọn tập phim
        if (!isMobile) {
            const checkEpisodeButtons = setInterval(() => {
                // Tìm các nút có text "Tập"
                const buttons = document.querySelectorAll('button');
                const episodeButtons = Array.from(buttons).filter(btn =>
                    btn.textContent.includes('Tập') || btn.textContent.includes('Episode')
                );

                if (episodeButtons.length > 0) {
                    episodeButtons.forEach(btn => {
                        if (!btn.dataset.smartlinkAttached) {
                            btn.dataset.smartlinkAttached = 'true';
                            btn.addEventListener('click', () => {
                                triggerSmartlink('Episode Button (Desktop)');
                            });
                        }
                    });
                    console.log('[Smartlink] Desktop - Listening on', episodeButtons.length, 'episode buttons');
                    clearInterval(checkEpisodeButtons);
                }
            }, 500);

            setTimeout(() => clearInterval(checkEpisodeButtons), 10000);
        }
    }

    // Setup triggers cho login.html
    function setupLoginTriggers() {
        if (!window.location.pathname.includes('login.html')) return;

        // Mobile: Trigger duy nhất - Nút đăng nhập
        if (isMobile) {
            const checkLoginButton = setInterval(() => {
                // Tìm nút submit có text "ĐĂNG NHẬP"
                const buttons = document.querySelectorAll('button[type="submit"]');

                buttons.forEach(btn => {
                    if (btn.textContent.includes('ĐĂNG NHẬP') && !btn.dataset.smartlinkAttached) {
                        btn.dataset.smartlinkAttached = 'true';
                        btn.addEventListener('click', () => {
                            triggerSmartlink('Login Button (Mobile)');
                        });
                        console.log('[Smartlink] Mobile - Listening on login button');
                        clearInterval(checkLoginButton);
                    }
                });
            }, 500);

            setTimeout(() => clearInterval(checkLoginButton), 10000);
        }
    }

    // Initialize
    function init() {
        const device = isMobile ? 'Mobile' : 'Desktop';
        const maxPops = isMobile ? CONFIG.mobile.maxPops : CONFIG.desktop.maxPops;
        console.log('[Smartlink] Initialized -', device, '| Max pops:', maxPops);

        setupMovieDetailTriggers();
        setupWatchPageTriggers();
        setupLoginTriggers();
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
