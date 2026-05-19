// Splash Screen Loader - Show beautiful loading screen while page loads
(function () {
    'use strict';

    // Skip loader entirely on subsequent page loads in the same session to optimize navigation speed
    const hasLoadedThisSession = sessionStorage.getItem('splashLoaded');
    if (hasLoadedThisSession) {
        if (document.body) {
            document.body.classList.add('splash-ready');
        } else {
            const observer = new MutationObserver((mutations, obs) => {
                if (document.body) {
                    document.body.classList.add('splash-ready');
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
            document.addEventListener('DOMContentLoaded', function () {
                document.body.classList.add('splash-ready');
                observer.disconnect();
            });
        }
        return;
    }

    // Create splash screen HTML
    const splashHTML = `
        <div id="splashLoader">
            <!-- Background collage of posters -->
            <div class="splash-background-collage"></div>
            
            <!-- Dark premium overlay -->
            <div class="splash-background-overlay"></div>

            <!-- Particles background -->
            <div class="splash-particles" style="z-index: 3;">
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

            <!-- Logo with animated rings (elevated z-index) -->
            <div class="splash-content-container" style="position: relative; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div class="splash-logo-container">
                    <div class="splash-ring"></div>
                    <div class="splash-ring"></div>
                    <div class="splash-ring"></div>
                    <img src="/favicon.png" alt="A Phim Logo" class="splash-logo" style="opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity = '1'">
                </div>

                <!-- Brand name -->
                <div class="splash-brand">
                    A <span class="highlight">Phim</span>
                </div>

                <!-- Tagline -->
                <div class="splash-tagline">Cinema</div>

                <!-- Loading bar -->
                <div class="splash-loading-bar">
                    <div class="splash-loading-fill" style="width: 5%; animation: none !important; transition: width 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) !important;"></div>
                </div>

                <!-- Loading text -->
                <div class="splash-loading-text">Đang tải trải nghiệm điện ảnh...</div>
            </div>
        </div>
    `;

    // Insert splash screen at the beginning of body
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', splashHTML);
        document.body.classList.add('splash-ready');
        const logoImg = document.querySelector('#splashLoader .splash-logo');
        if (logoImg && logoImg.complete) {
            logoImg.style.opacity = '1';
        }
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertAdjacentHTML('afterbegin', splashHTML);
            document.body.classList.add('splash-ready');
            const logoImg = document.querySelector('#splashLoader .splash-logo');
            if (logoImg && logoImg.complete) {
                logoImg.style.opacity = '1';
            }
        });
    }

    // Record start time
    window.splashStartTime = Date.now();

    let isLoaded = false;
    let loaderActive = true;
    let lastProgress = 5;

    // Track active fetch requests (APIs)
    let fetchesStarted = 0;
    let fetchesCompleted = 0;

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        if (loaderActive) {
            fetchesStarted++;
            updateProgress();
        }
        return originalFetch.apply(this, args)
            .then(response => {
                if (loaderActive) {
                    fetchesCompleted++;
                    updateProgress();
                }
                return response;
            })
            .catch(error => {
                if (loaderActive) {
                    fetchesCompleted++;
                    updateProgress();
                }
                throw error;
            });
    };

    // Calculate real page load progress
    function getProgressPercentage() {
        // 1. DOM progress (up to 40%)
        let domProgress = 10;
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            domProgress = 40;
        }

        // 2. Resource progress (up to 40%)
        // Scan for stylesheets, scripts, and key images
        const resources = Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src], img:not([loading="lazy"])'));
        let resProgress = 0;
        if (resources.length > 0) {
            let loadedCount = 0;
            resources.forEach(res => {
                if (res.tagName === 'IMG') {
                    if (res.complete) loadedCount++;
                } else {
                    const url = res.href || res.src;
                    if (url && (performance.getEntriesByName(url).length > 0 || res.sheet)) {
                        loadedCount++;
                    }
                }
            });
            resProgress = (loadedCount / resources.length) * 40;
        } else {
            resProgress = 40;
        }

        // 3. API progress (up to 20%)
        let apiProgress = 20;
        if (fetchesStarted > 0) {
            apiProgress = (fetchesCompleted / fetchesStarted) * 20;
        }

        let total = domProgress + resProgress + apiProgress;

        // Don't reach 100% until window.onload fires
        if (total >= 95 && !isLoaded) {
            total = 95;
        }

        return Math.min(100, Math.round(total));
    }

    // Update DOM loading bar fill width
    function updateProgress() {
        if (!loaderActive) return;
        
        const currentProgress = getProgressPercentage();
        if (currentProgress > lastProgress) {
            lastProgress = currentProgress;
            const fillBar = document.querySelector('#splashLoader .splash-loading-fill');
            if (fillBar) {
                fillBar.style.width = currentProgress + '%';
            }
        }
    }

    // Set up a low-overhead interval to poll resource progress during load
    const progressInterval = setInterval(updateProgress, 150);

    // Default verified movie posters from Ophim CDN
    const defaultPosters = [
        'https://img.ophim.live/uploads/movies/trang-trai-dutton-thumb.jpg',
        'https://img.ophim.live/uploads/movies/biet-doi-tu-bao-short-drama-thumb.jpg',
        'https://img.ophim.live/uploads/movies/ngoc-trai-trong-suong-mu-thumb.jpg',
        'https://img.ophim.live/uploads/movies/k-everything-a-cnn-original-series-thumb.jpg',
        'https://img.ophim.live/uploads/movies/pinecone-thumb.jpg',
        'https://img.ophim.live/uploads/movies/cuoc-chien-sinh-tu-ii-thumb.jpg',
        'https://img.ophim.live/uploads/movies/troi-xanh-tren-may-thumb.jpg',
        'https://img.ophim.live/uploads/movies/luong-tran-my-cam-thumb.jpg',
        'https://img.ophim.live/uploads/movies/tuong-tu-ky-thumb.jpg',
        'https://img.ophim.live/uploads/movies/ga-vao-nha-quyen-quy-thumb.jpg',
        'https://img.ophim.live/uploads/movies/nguoi-giu-den-o-chua-ky-cot-thumb.jpg',
        'https://img.ophim.live/uploads/movies/tien-kiem-ky-hiep-truyen-3-thumb.jpg',
        'https://img.ophim.live/uploads/movies/bon-huyen-nha-la-phuc-tinh-thumb.jpg',
        'https://img.ophim.live/uploads/movies/luyen-khi-muoi-van-nam-thumb.jpg',
        'https://img.ophim.live/uploads/movies/van-gioi-doc-ton-thumb.jpg',
        'https://img.ophim.live/uploads/movies/vo-than-chua-te-thumb.jpg',
        'https://img.ophim.live/uploads/movies/tuyet-the-chien-hon-thumb.jpg',
        'https://img.ophim.live/uploads/movies/tinh-yeu-phan-boi-thumb.jpg',
        'https://img.ophim.live/uploads/movies/xuong-phep-thuat-thumb.jpg',
        'https://img.ophim.live/uploads/movies/che-nhao-kevin-hart-thumb.jpg',
        'https://img.ophim.live/uploads/movies/cay-co-thu-dieu-ky-thumb.jpg',
        'https://img.ophim.live/uploads/movies/dacoit-thumb.jpg',
        'https://img.ophim.live/uploads/movies/mot-minh-giua-bien-dem-thumb.jpg'
    ];

    // Build the collage
    function buildCollage() {
        const collageContainer = document.querySelector('.splash-background-collage');
        if (!collageContainer) return;

        // Populate with default high-quality posters immediately
        const totalPostersCount = 54; // 9 columns x 6 rows to fill the grid beautifully
        for (let i = 0; i < totalPostersCount; i++) {
            const posterDiv = document.createElement('div');
            posterDiv.className = 'splash-poster-item';
            
            const defaultUrl = defaultPosters[i % defaultPosters.length];
            const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(defaultUrl)}&w=150&h=225&fit=cover&q=50`;
            
            posterDiv.style.backgroundImage = `url('${optimizedUrl}')`;
            collageContainer.appendChild(posterDiv);
            
            // Staggered fade in animation (speed up stagger to 15ms for more elements)
            setTimeout(() => {
                posterDiv.style.opacity = '1';
            }, i * 15);
        }

        // Fetch dynamic posters from API and update in background
        originalFetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1')
            .then(res => res.json())
            .then(data => {
                if (data && data.data && data.data.items && data.data.items.length > 0) {
                    const posterDivs = collageContainer.querySelectorAll('.splash-poster-item');
                    data.data.items.slice(0, posterDivs.length).forEach((item, idx) => {
                        if (posterDivs[idx]) {
                            const posterUrl = `https://img.ophim.live/uploads/movies/${item.thumb_url}`;
                            // Optimize image loading using wsrv.nl
                            const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(posterUrl)}&w=150&h=225&fit=cover&q=50`;
                            
                            const img = new Image();
                            img.onload = function() {
                                posterDivs[idx].style.backgroundImage = `url('${optimizedUrl}')`;
                            };
                            img.src = optimizedUrl;
                        }
                    });
                }
            })
            .catch(err => console.log('Collage dynamic update skipped:', err));
    }

    // Trigger loader finish
    function triggerLoadComplete() {
        if (isLoaded) return;
        isLoaded = true;
        
        clearInterval(progressInterval);
        
        // Push progress bar to 100%
        const fillBar = document.querySelector('#splashLoader .splash-loading-fill');
        if (fillBar) {
            fillBar.style.width = '100%';
        }
        
        // Hide splash screen after a short delay so user sees full load
        setTimeout(hideSplashScreen, 350);
    }

    // Listen to load events
    if (document.readyState === 'complete') {
        triggerLoadComplete();
    } else {
        window.addEventListener('load', triggerLoadComplete);
    }

    // Fallback safety timeout (8 seconds)
    const safetyTimeout = setTimeout(() => {
        console.warn('Splash Loader: Safety timeout reached, forcing page display.');
        triggerLoadComplete();
    }, 8000);

    // Hide splash screen with smooth fade out
    function hideSplashScreen() {
        if (!loaderActive) return;
        loaderActive = false;
        
        clearInterval(progressInterval);
        clearTimeout(safetyTimeout);

        // Store loaded state in sessionStorage so we don't show the splash screen on subnavigation
        try {
            sessionStorage.setItem('splashLoaded', 'true');
        } catch (e) {
            console.warn('Failed to write to sessionStorage:', e);
        }

        const splash = document.getElementById('splashLoader');
        if (splash) {
            // Restore original fetch to cleanup
            window.fetch = originalFetch;

            // Trigger premium blur and scale fade out
            splash.classList.add('splash-fade-out');

            // Remove from DOM after smooth transition completes
            setTimeout(() => {
                if (splash && splash.parentNode) {
                    splash.parentNode.removeChild(splash);
                }
            }, 700); // Allow transition to complete fully
        }
    }

    // Initialize collage & base progress
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildCollage);
    } else {
        buildCollage();
    }
    setTimeout(updateProgress, 50);

})();
