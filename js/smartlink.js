// Smartlink Integration - ID: 28724969
// Desktop: 2 lần/phiên (Lưu phim + Chọn tập), cách 5 phút
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
            triggers: {
                saveMovie: true,      // Lưu phim
                selectEpisode: true   // Chọn tập
            }
        },

        // Mobile: 1 pop duy nhất
        mobile: {
            maxPops: 1,
            triggers: {
                login: true  // Đăng nhập
            }
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

        // Desktop: Trigger 1 - Nút "Lưu phim" / "Bookmark"
        if (!isMobile && CONFIG.desktop.triggers.saveMovie) {
            const checkSaveButton = setInterval(() => {
                // Tìm nút có icon bookmark hoặc text "Lưu"
                const buttons = document.querySelectorAll('button, a');
                buttons.forEach(btn => {
                    const hasBookmarkIcon = btn.querySelector('[class*="bookmark"]') ||
                        btn.innerHTML.includes('bookmark');
                    const hasText = btn.textContent.includes('Lưu') ||
                        btn.textContent.includes('Save');

                    if ((hasBookmarkIcon || hasText) && !btn.dataset.smartlinkAttached) {
                        btn.dataset.smartlinkAttached = 'true';
                        btn.addEventListener('click', () => {
                            triggerSmartlink('Save Movie Button');
                        });
                        console.log('[Smartlink] Listening on Save Movie button');
                        clearInterval(checkSaveButton);
                    }
                });
            }, 500);

            setTimeout(() => clearInterval(checkSaveButton), 10000);
        }
    }

    // Setup triggers cho watch.html
    function setupWatchPageTriggers() {
        if (!window.location.pathname.includes('watch.html')) return;

        // Desktop: Trigger 2 - Chọn tập phim
        if (!isMobile && CONFIG.desktop.triggers.selectEpisode) {
            const checkEpisodeButtons = setInterval(() => {
                // Tìm các nút tập phim
                const episodeButtons = document.querySelectorAll('[class*="episode"], [class*="tap-phim"], button[data-episode]');

                if (episodeButtons.length > 0) {
                    episodeButtons.forEach(btn => {
                        if (!btn.dataset.smartlinkAttached) {
                            btn.dataset.smartlinkAttached = 'true';
                            btn.addEventListener('click', () => {
                                triggerSmartlink('Select Episode');
                            });
                        }
                    });
                    console.log('[Smartlink] Listening on', episodeButtons.length, 'episode buttons');
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
        if (isMobile && CONFIG.mobile.triggers.login) {
            const checkLoginButton = setInterval(() => {
                const loginButtons = document.querySelectorAll('button[type="submit"], button[class*="login"], button[class*="dang-nhap"]');

                if (loginButtons.length > 0) {
                    loginButtons.forEach(btn => {
                        if (!btn.dataset.smartlinkAttached) {
                            btn.dataset.smartlinkAttached = 'true';
                            btn.addEventListener('click', () => {
                                triggerSmartlink('Login Button');
                            });
                        }
                    });
                    console.log('[Smartlink] Mobile - Listening on login button');
                    clearInterval(checkLoginButton);
                }
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
