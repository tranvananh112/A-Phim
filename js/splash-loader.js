// Splash Screen Loader - Show beautiful loading screen while page loads
(function () {
    'use strict';

    // Create splash screen HTML
    const splashHTML = `
        <div id="splashLoader">
            <!-- Particles background -->
            <div class="splash-particles">
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
            </div>

            <!-- Logo with animated rings -->
            <div class="splash-logo-container">
                <div class="splash-ring"></div>
                <div class="splash-ring"></div>
                <div class="splash-ring"></div>
                <img src="/favicon.png" alt="A Phim Logo" class="splash-logo">
            </div>

            <!-- Brand name -->
            <div class="splash-brand">
                A <span class="highlight">Phim</span>
            </div>

            <!-- Tagline -->
            <div class="splash-tagline">Cinema</div>

            <!-- Loading bar -->
            <div class="splash-loading-bar">
                <div class="splash-loading-fill"></div>
            </div>

            <!-- Loading text -->
            <div class="splash-loading-text">Đang tải trải nghiệm điện ảnh...</div>
        </div>
    `;

    // Insert splash screen at the beginning of body
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', splashHTML);
        document.body.classList.add('splash-ready');
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertAdjacentHTML('afterbegin', splashHTML);
            document.body.classList.add('splash-ready');
        });
    }

    // Hide splash screen when page is fully loaded or DOM is ready
    function hideSplashScreen() {
        const splash = document.getElementById('splashLoader');
        if (splash && !splash.classList.contains('hidden')) {
            // Reduce minimum display time for instant feeling
            const minDisplayTime = 50;
            const startTime = window.splashStartTime || Date.now();
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

            setTimeout(() => {
                if (splash) {
                    splash.classList.add('hidden');
                    // Remove from DOM after transition
                    setTimeout(() => {
                        if (splash && splash.parentNode) {
                            splash.parentNode.removeChild(splash);
                        }
                    }, 400);
                }
            }, remainingTime);
        }
    }

    // Record start time
    window.splashStartTime = Date.now();

    // Hide splash when DOM is ready rather than waiting for all images/resources to load fully
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        hideSplashScreen();
    } else {
        document.addEventListener('DOMContentLoaded', hideSplashScreen);
        window.addEventListener('load', hideSplashScreen);
    }

    // Fallback: hide after 1.2 seconds max (reduced from 5s)
    setTimeout(hideSplashScreen, 1200);

})();
