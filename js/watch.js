// Watch Page Script
let currentMovie = null;
let currentEpisode = null;
let player = null;

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const episodeSlug = urlParams.get('episode');

    if (!slug) {
        window.location.href = 'index.html';
        return;
    }

    await loadMovieAndPlay(slug, episodeSlug);
    setupVideoPlayer();
    loadRecommendations();
});

// Load movie and play
async function loadMovieAndPlay(slug, episodeSlug) {
    try {
        console.log('🎬 Loading movie:', slug);
        const response = await movieAPI.getMovieDetail(slug);
        console.log('📦 API Response:', response);

        if (response && response.status === 'success' && response.data) {
            currentMovie = response.data.item;
            console.log('✅ Movie loaded:', currentMovie.name);
            console.log('📺 Episodes:', currentMovie.episodes);

            // Find episode
            if (currentMovie.episodes && currentMovie.episodes.length > 0) {
                const serverData = currentMovie.episodes[0].server_data;
                console.log('📋 Server data:', serverData);

                currentEpisode = episodeSlug
                    ? serverData.find(ep => ep.slug === episodeSlug)
                    : serverData[0];

                if (!currentEpisode) currentEpisode = serverData[0];

                console.log('▶️ Current episode:', currentEpisode);
                console.log('🔗 Video URL:', currentEpisode.link_m3u8);
            }

            renderMovieInfo(currentMovie, currentEpisode);
            renderEpisodeList(currentMovie.episodes);
            renderPlayerPlaceholder(currentEpisode); // 🛡️ Anti-Bot Gate: Render interactive placeholder first
            setupActionButtons();

            // Add to watch history
            userService.addToHistory(currentMovie, currentEpisode?.name);
        } else {
            console.error('❌ Invalid response:', response);
            showError('Không thể tải thông tin phim');
        }
    } catch (error) {
        console.error('❌ Error loading movie:', error);
        showError('Đã xảy ra lỗi khi tải phim: ' + error.message);
    }
}

// Render movie info
function renderMovieInfo(movie, episode) {
    // 🚀 INJECT DYNAMIC SEO - Overrides meta & title immediately
    if (typeof SEO !== 'undefined') {
        SEO.updateMovieSEO(movie);
    } else {
        document.title = `${movie.name} - ${episode?.name || ''} - APhim`;
    }

    const titleElement = document.querySelector('h1');
    if (titleElement) {
        titleElement.textContent = movie.name;
    }

    // Populate new Netflix-style inline meta badges under player
    const metaYearBadge = document.getElementById('meta-year-badge');
    if (metaYearBadge) metaYearBadge.textContent = movie.year;

    const metaRatingVal = document.getElementById('meta-rating-val');
    if (metaRatingVal) {
        const avgRating = ratingService.getAverageRating(movie.slug);
        metaRatingVal.textContent = avgRating;
    }

    const metaGenre = document.getElementById('meta-genre');
    if (metaGenre && movie.category) {
        metaGenre.textContent = movie.category.map(c => c.name).join(', ');
    }

    const metaDuration = document.getElementById('meta-duration');
    if (metaDuration) metaDuration.textContent = movie.time || '-- phút';

    // 🌟 Render Sidebar Premium Movie Card Details
    const sidebarPoster = document.getElementById('sidebar-poster');
    if (sidebarPoster) {
        sidebarPoster.src = movieAPI.getImageURL(movie.poster_url || movie.thumb_url, 300, 85, true);
        sidebarPoster.alt = movie.name;
    }

    const sidebarName = document.getElementById('sidebar-movie-name');
    if (sidebarName) sidebarName.textContent = movie.name;

    const sidebarOrigin = document.getElementById('sidebar-movie-origin');
    if (sidebarOrigin) sidebarOrigin.textContent = `${movie.origin_name} (${movie.year})`;

    const sidebarQuality = document.getElementById('sidebar-quality');
    if (sidebarQuality) sidebarQuality.textContent = movie.quality || 'HD';

    const sidebarLang = document.getElementById('sidebar-lang');
    if (sidebarLang) sidebarLang.textContent = movie.lang || 'Vietsub';

    const sidebarRatingVal = document.getElementById('sidebar-rating-val');
    if (sidebarRatingVal) {
        const avgRating = ratingService.getAverageRating(movie.slug);
        sidebarRatingVal.textContent = avgRating;
    }

    const sidebarDuration = document.getElementById('sidebar-duration');
    if (sidebarDuration) sidebarDuration.textContent = movie.time || '-- phút';

    const sidebarGenres = document.getElementById('sidebar-genres');
    if (sidebarGenres && movie.category) {
        sidebarGenres.innerHTML = movie.category.map(cat => `
            <span class="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-200 hover:border-primary hover:text-primary transition-colors cursor-pointer font-semibold">
                ${cat.name}
            </span>
        `).join('');
    }

    // 🎭 Render Cast (Diễn viên) circular avatars in sidebar (limit to max 5-6)
    const sidebarCastSection = document.getElementById('sidebar-cast-section');
    const sidebarCast = document.getElementById('sidebar-cast');
    if (sidebarCast && movie.actor && movie.actor.length > 0) {
        if (sidebarCastSection) sidebarCastSection.classList.remove('hidden');
        
        sidebarCast.innerHTML = movie.actor.slice(0, 6).map((actor, index) => {
            const colors = ['from-red-500 to-red-700', 'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-yellow-500 to-yellow-700', 'from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700'];
            const colorClass = colors[index % colors.length];
            const initial = actor.charAt(0).toUpperCase();

            return `
                <div class="flex-shrink-0 w-16 text-center group cursor-pointer" data-actor-name="${actor}">
                    <div class="relative mb-1.5">
                        <div class="actor-avatar-container w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-black border border-white/10 group-hover:border-primary transition-all duration-300 group-hover:scale-105 overflow-hidden shadow-lg">
                            ${initial}
                        </div>
                    </div>
                    <p class="text-gray-300 text-[11px] font-semibold truncate w-16 group-hover:text-primary transition-colors leading-tight">${actor}</p>
                </div>
            `;
        }).join('');

        // Trigger TMDB actor avatar loading in the background
        if (typeof loadActorImagesFromTMDB === 'function') {
            setTimeout(() => {
                const actorElements = document.querySelectorAll('[data-actor-name]');
                if (actorElements.length > 0) {
                    loadActorImagesFromTMDB(movie).catch(err => {
                        console.warn('⚠️ Failed to load actor images:', err);
                    });
                }
            }, 500);
        }
    } else if (sidebarCastSection) {
        sidebarCastSection.classList.add('hidden');
    }
}

// 🛡️ PHASE 1: RENDER INTERACTIVE PLAYER PLACEHOLDER (Anti-DMCA Gate)
function renderPlayerPlaceholder(episode) {
    const playerContainer = document.querySelector('.aspect-video');
    if (!playerContainer) return;

    const posterUrl = currentMovie ? movieAPI.getImageURL(currentMovie.poster_url || currentMovie.thumb_url, 1200, 90, true) : '';
    const movieName = currentMovie ? currentMovie.name : 'Đang tải...';
    
    // Thông minh hóa tên tập: Nếu là số thì thêm chữ "Tập", nếu là chữ (Full, Trailer...) thì giữ nguyên
    let epName = 'Full HD';
    if (episode && episode.name) {
        if (episode.name.toLowerCase().includes('tập')) {
            epName = episode.name;
        } else if (!isNaN(episode.name)) {
            epName = `Tập ${episode.name}`;
        } else {
            epName = episode.name;
        }
    }
    
    const quality = currentMovie ? currentMovie.quality : 'Full HD';
    const lang = currentMovie ? currentMovie.lang : 'Vietsub';
    
    playerContainer.innerHTML = `
        <div id="playerPlaceholder" class="absolute inset-0 w-full h-full cursor-pointer overflow-hidden rounded-xl group/overlay" 
             style="transform: translate3d(0,0,0); -webkit-transform: translate3d(0,0,0); border-radius: 12px;"
             onclick="window.startActualPlayback()">
            <!-- Background Layer 1: Cinematic Ambient Blur (Covers everything with soft colors) -->
            <div class="absolute inset-0 bg-cover bg-center bg-no-repeat transform-gpu scale-105" 
                 style="background-image: url('${posterUrl}'); filter: brightness(0.25) blur(15px); border-radius: 12px; overflow: hidden;"></div>
            
            <!-- Background Layer 2: Sharp Centered Image (Contain - displays the ENTIRE uncropped poster/backdrop) -->
            <div class="absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-[1.5s] ease-out group-hover/overlay:scale-103" 
                 style="background-image: url('${posterUrl}'); filter: brightness(0.6) contrast(1.05); border-radius: 12px; overflow: hidden;"></div>
            
            <!-- Netflix/Disney+ Premium Double Gradients -->
            <!-- Top Gradient (Fade out header backdrop) -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/95 via-black/30 to-transparent opacity-95" style="border-radius: 12px;"></div>
            <!-- Bottom Gradient (Fade out text backdrop - cinematic) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent opacity-95" style="border-radius: 12px;"></div>
            
            <!-- Central Play Button (Dead Centered - Absolute Horizontal & Vertical Center) -->
            <div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div id="play-btn" class="w-[55px] h-[55px] sm:w-[80px] sm:h-[80px] pointer-events-auto transition-transform duration-500 transform group-hover/overlay:scale-110 filter drop-shadow-[0_10px_35px_rgba(252,211,77,0.35)]" style="cursor: pointer;"></div>
            </div>
            
            <!-- Netflix-Style Bottom-Left Cinematic Movie Info & Meta -->
            <div class="absolute z-20 flex flex-col gap-2.5 sm:gap-3.5 transition-all duration-500 transform group-hover/overlay:translate-x-1 bottom-3 left-4 sm:bottom-6 sm:left-6"
                 style="position: absolute !important; top: auto !important; right: auto !important; pointer-events: none; -webkit-user-select: none; user-select: none;">
                
                <!-- Badges / Tags (Stacked on Mobile, Horizontal on Desktop - Perfectly Left-Aligned & Spacious) -->
                <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                    <span class="text-[10px] md:text-[11px] text-[#fcd576] font-black uppercase tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">APhim Studio</span>
                    <span class="hidden sm:inline text-white/40 text-xs">|</span>
                    <div class="flex items-center gap-1.5">
                        <div class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                        <span class="text-[9px] md:text-[10px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            ${quality} • ${lang}
                        </span>
                    </div>
                </div>

                <!-- Movie Title & Episode Name (Premium layout with extra top margin) -->
                <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mt-1.5">
                    <h3 class="text-white font-extrabold text-base sm:text-2xl md:text-3xl tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] max-w-[65vw] sm:max-w-[450px] md:max-w-[600px] truncate leading-tight">
                        ${movieName}
                    </h3>
                    <span class="text-[#fcd576] font-bold text-xs sm:text-sm md:text-base tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] whitespace-nowrap">
                        ${epName}
                    </span>
                </div>
            </div>
        </div>
    `;

    // 🎬 Step 4 — Initialize Lottie Animation (Load from /icons/play.json)
    if (typeof lottie !== 'undefined') {
        const anim = lottie.loadAnimation({
            container: document.getElementById('play-btn'),
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: '/icons/play.json'
        });

        const placeholder = document.getElementById('playerPlaceholder');
        if (placeholder) {
            placeholder.addEventListener('mouseenter', () => anim.play());
            placeholder.addEventListener('mouseleave', () => anim.stop());
        }
    }
}

// Global callback to start playback on click
window.startActualPlayback = function() {
    console.log('⚡ User interaction verified. Deferring stream load to complete touch lifecycle...');
    // Defer by 100ms so that the click/touch event lifecycle completes fully on the placeholder,
    // allowing the browser to cleanly transfer focus and future gestures to the new video element.
    setTimeout(() => {
        initializePlayer(currentEpisode);
    }, 100);
};

// Render episode list
function renderEpisodeList(episodes) {
    if (!episodes || episodes.length === 0) return;

    const container = document.getElementById('episode-list') || document.querySelector('.grid.grid-cols-2');
    if (!container) return;

    const serverData = episodes[0].server_data;

    // Update dynamic episode count indicator
    const episodeCountEl = document.getElementById('episode-count');
    if (episodeCountEl) {
        episodeCountEl.textContent = `(${serverData.length} tập)`;
    }

    container.innerHTML = serverData.map(ep => {
        const isActive = currentEpisode && ep.slug === currentEpisode.slug;
        const name = ep.name.trim();
        let displayEpName = name;
        if (/^\d+$/.test(name)) {
            displayEpName = `Tập ${name.padStart(2, '0')}`;
        } else {
            displayEpName = name.startsWith('Tập') ? name : `Tập ${name}`;
        }

        return `
            <button onclick="changeEpisode('${ep.slug}')"
                class="${isActive ? 'bg-[#fcd576] text-black font-bold border-transparent shadow-[0_4px_12px_rgba(252,211,77,0.3)] scale-105 active' : 'bg-[#131314] hover:bg-white/5 text-gray-400 border border-white/5 hover:text-white'} transition-all duration-300 rounded-lg w-full py-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer active:scale-95 text-center">
                ${displayEpName}
            </button>
        `;
    }).join('');

    // Dynamically update under-player control bar navigation buttons
    if (typeof updateEpisodeNavButtons === 'function') {
        updateEpisodeNavButtons();
    }

    // Automatically scroll the active episode into view inside the scrollable container
    setTimeout(() => {
        const activeBtn = container.querySelector('button.active');
        if (activeBtn) {
            activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, 100);
}

// Initialize video player
function initializePlayer(episode) {
    console.log('🎥 Initializing player with episode:', episode);

    if (!episode) {
        console.error('❌ No episode provided');
        showError('Không tìm thấy tập phim');
        return;
    }

    // Check if admin has set a custom link in localStorage
    const movieLinks = JSON.parse(localStorage.getItem('movieLinks') || '{}');
    const customLink = movieLinks[currentMovie.slug];

    let videoUrl = customLink || episode.link_m3u8 || episode.link_embed;

    if (!videoUrl) {
        console.error('❌ No video link found in episode:', episode);
        showError('Không tìm thấy link phim. Vui lòng liên hệ admin để cập nhật link.');
        return;
    }

    console.log('🔗 Video URL:', videoUrl);
    if (customLink) {
        console.log('✅ Using custom link from admin');
    }

    const playerContainer = document.querySelector('.aspect-video');
    if (!playerContainer) {
        console.error('❌ Player container not found');
        return;
    }

    // Load watch progress
    const progress = userService.getWatchProgress(currentMovie.slug, episode.slug);

    playerContainer.innerHTML = `
        <video id="videoPlayer" 
            class="w-full h-full bg-black" 
            controls 
            preload="auto"
            controlsList="nodownload"
            poster="${movieAPI.getImageURL(currentMovie.thumb_url, 1200, 90, true)}">
            Trình duyệt của bạn không hỗ trợ video.
        </video>
    `;

    player = document.getElementById('videoPlayer');

    // Register mobile touch double-tap handler directly on the video element
    let lastTap = 0;
    player.addEventListener('touchend', (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTap < DOUBLE_TAP_DELAY) {
            e.preventDefault(); // Stop native double-tap-to-zoom
            
            // Calculate relative touch coordinate to find which side was tapped
            const rect = player.getBoundingClientRect();
            const touch = e.changedTouches[0] || e.touches[0];
            if (touch) {
                const tapX = touch.clientX - rect.left;
                const isRightSide = tapX > (rect.width / 2);
                
                if (isRightSide) {
                    player.currentTime = Math.min(player.duration, player.currentTime + 10);
                    showSeekOverlay('+10s', true);
                } else {
                    player.currentTime = Math.max(0, player.currentTime - 10);
                    showSeekOverlay('-10s', false);
                }
            }
            lastTap = 0; // Reset tap tracking
        } else {
            lastTap = now;
        }
    });

    // Register keyboard shortcuts (Space to toggle, ArrowRight/ArrowLeft to seek 10s)
    if (window._watchKeydownHandler) {
        document.removeEventListener('keydown', window._watchKeydownHandler, true);
    }
    
    window._watchKeydownHandler = function (e) {
        const active = document.activeElement;
        // Skip hotkeys if typing in inputs/textareas
        if (active && (
            active.tagName === 'INPUT' || 
            active.tagName === 'TEXTAREA' || 
            active.isContentEditable
        )) {
            return;
        }
        
        if (e.code === 'Space') {
            e.preventDefault();
            if (player.paused) {
                player.play().catch(err => console.log(err));
            } else {
                player.pause();
            }
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            player.currentTime = Math.min(player.duration, player.currentTime + 10);
            showSeekOverlay('+10s', true);
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            player.currentTime = Math.max(0, player.currentTime - 10);
            showSeekOverlay('-10s', false);
        }
    };
    
    document.addEventListener('keydown', window._watchKeydownHandler, true);

    // Prefer native HLS on iOS and Safari for better stability and performance
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const preferNativeHLS = (isIOS || isSafari) && player.canPlayType('application/vnd.apple.mpegurl');

    let isTimeRestored = false; // CỜ CHẶN: Chỉ cho phép khôi phục thời gian DUY NHẤT 1 LẦN, tránh bị kẹt tua phim

    if (preferNativeHLS) {
        // Native HLS support (Safari/iOS)
        console.log('✅ Using native HLS support (Safari/iOS)');
        player.src = videoUrl;
        
        // FIX CỰC MẠNH CHO MOBILE: Chờ 'canplay' và thêm độ trễ nhỏ để trình duyệt ổn định thanh tua
        player.addEventListener('canplay', () => {
            if (!isTimeRestored && progress.currentTime > 0) {
                isTimeRestored = true; 
                setTimeout(() => {
                    console.log('⏪ [SafeRestore-Delay] Resumed on Mobile:', progress.currentTime);
                    player.currentTime = progress.currentTime;
                    // Force playback resume after mutating currentTime to prevent mobile freeze
                    player.play().catch(e => console.log('iOS play after restore prevented:', e));
                }, 200); // Độ trễ 200ms đảm bảo trình duyệt đã ổn định Buffer, không bị treo Touch
            }
        }, { once: true }); // Chỉ chạy 1 lần duy nhất

        player.addEventListener('loadedmetadata', () => {
            console.log('✅ Video metadata loaded');
            player.play().catch(e => console.log('Auto-play prevented:', e));
        });
    } else if (Hls.isSupported()) {
        console.log('✅ HLS.js is supported');
        const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false, // Priority to aggressive buffer over ultra-low latency
            maxBufferLength: 60, // Keep up to 60 seconds of video preloaded in buffer in advance
            maxMaxBufferLength: 120, // Preload up to 120 seconds of stream segments
            preload: true,
            startLevel: -1,
            capLevelToPlayerSize: true
        });

        console.log('📡 Loading source:', videoUrl);
        hls.loadSource(videoUrl);
        hls.attachMedia(player);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            console.log('✅ Video manifest parsed - ready to play');
            // Bổ sung delay nhỏ cho HLS.js để ổn định thanh timeline trước khi tua
            if (!isTimeRestored && progress.currentTime > 0) {
                isTimeRestored = true; 
                setTimeout(() => {
                    console.log('⏪ [SafeRestore-HLS] Resumed with Delay:', progress.currentTime);
                    player.currentTime = progress.currentTime;
                    // Force playback resume after mutating currentTime to prevent HLS.js freeze
                    player.play().catch(e => console.log('HLS play after restore prevented:', e));
                }, 150); 
            } else {
                player.play().catch(e => console.log('Auto-play prevented:', e));
            }
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            console.error('❌ HLS Error:', data);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.log('🔄 Network error, trying to recover...');
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log('🔄 Media error, trying to recover...');
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error('💥 Fatal error, cannot recover');
                        showError('Không thể phát video. Vui lòng thử lại sau.');
                        hls.destroy();
                        break;
                }
            }
        });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback for other browsers that support native HLS
        console.log('✅ Using native HLS support (Fallback)');
        player.src = videoUrl;
        player.addEventListener('canplay', () => {
            if (!isTimeRestored && progress.currentTime > 0) {
                isTimeRestored = true;
                setTimeout(() => {
                     player.currentTime = progress.currentTime;
                }, 200);
            }
        }, { once: true });
    } else {
        console.error('❌ HLS not supported');
        showError('Trình duyệt của bạn không hỗ trợ phát video HLS');
        return;
    }

    // Hàm hỗ trợ lưu tiến độ tức thời
    function doSaveProgress() {
        if (player && player.currentTime > 0 && player.duration > 0 && currentMovie) {
            userService.saveWatchProgress(
                currentMovie.slug,
                player.currentTime,
                player.duration,
                episode ? episode.slug : null
            );
        }
    }

    // Save progress periodically
    let progressInterval = null;
    player.addEventListener('play', () => {
        console.log('▶️ Video playing');
        if (progressInterval) clearInterval(progressInterval); // Dọn dẹp interval cũ nếu có
        progressInterval = setInterval(doSaveProgress, 5000); // Cập nhật mỗi 5 giây
    });

    player.addEventListener('pause', () => {
        console.log('⏸️ Video paused');
        if (progressInterval) clearInterval(progressInterval);
        doSaveProgress(); // Lưu luôn khi bấm tạm dừng
    });

    // Bổ sung: Lưu TỨC THỜI khi người dùng tua phim đến vị trí mới
    player.addEventListener('seeked', () => {
        console.log('⏩ User seeked - Instant save');
        doSaveProgress();
    });

    // Bổ sung: Lưu TỨC THỜI khi chuẩn bị tắt tab / tải lại trang
    window.addEventListener('beforeunload', () => {
        doSaveProgress();
    });

    // Auto play next episode
    player.addEventListener('ended', () => {
        console.log('✅ Video ended');
        clearInterval(progressInterval);
        autoPlayNext();
    });

    player.addEventListener('error', (e) => {
        console.error('❌ Video element error:', e);
    });
}

// Setup video player controls
function setupVideoPlayer() {
    // Add custom controls if needed
    addQualitySelector();
    addSpeedControl();
    addFullscreenButton();
}

// Add quality selector
function addQualitySelector() {
    // Quality selector implementation
    const qualities = APP_CONFIG.VIDEO_QUALITIES;
    // Add UI for quality selection
}

// Add speed control
function addSpeedControl() {
    if (!player) return;

    const speeds = APP_CONFIG.PLAYBACK_SPEEDS;
    // Add UI for playback speed
}

// Add fullscreen button
function addFullscreenButton() {
    if (!player) return;

    // Fullscreen functionality
    player.addEventListener('dblclick', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            player.requestFullscreen();
        }
    });
}

// Change episode is defined globally as an instant transition helper below

// Auto play next episode
function autoPlayNext() {
    if (!currentMovie.episodes || currentMovie.episodes.length === 0) return;

    const serverData = currentMovie.episodes[0].server_data;
    const currentIndex = serverData.findIndex(ep => ep.slug === currentEpisode.slug);

    if (currentIndex < serverData.length - 1) {
        const nextEpisode = serverData[currentIndex + 1];
        setTimeout(() => {
            if (confirm(`Tự động phát ${nextEpisode.name}?`)) {
                changeEpisode(nextEpisode.slug);
            }
        }, 3000);
    }
}

// Load recommendations
async function loadRecommendations() {
    const sidebar = document.getElementById('recommendations-list') || document.querySelector('aside .space-y-4');
    if (!sidebar) return;

    try {
        const data = await movieAPI.getMovieList(1);
        let movies = [];
        
        if (data && data.data && data.data.items) {
            movies = data.data.items.slice(0, 6);
        } else if (data && data.items) {
            movies = data.items.slice(0, 6);
        } else if (Array.isArray(data)) {
            movies = data.slice(0, 6);
        }
        
        if (movies.length > 0) {
            renderRecommendations(movies, sidebar);
        } else {
            console.warn("No recommendation movies found. API Response:", data);
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Render recommendations
function renderRecommendations(movies, container) {
    container.innerHTML = movies.map(movie => {
        const rating = movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : (movie.imdb || '7.1');
        return `
            <a class="group bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-primary/40 hover:bg-[#222222] transition-all flex flex-col h-full shadow-lg cursor-pointer" 
               href="movie-detail.html?slug=${movie.slug}">
                <!-- Thumbnail Poster (Top) -->
                <div class="relative w-full aspect-[2/3] overflow-hidden bg-black flex-shrink-0">
                    <img src="${movieAPI.getImageURL(movie.thumb_url, 300, 85, true)}" 
                         alt="Xem Phim ${movie.name} (${movie.year}) Vietsub Full HD"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         onerror="this.src='https://via.placeholder.com/150x225?text=No+Image'" />
                    <!-- Badge HD top-left -->
                    <span class="absolute top-2 left-2 bg-[#fcd576] text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase shadow">
                        ${movie.quality || 'HD'}
                    </span>
                </div>
                <!-- Details below poster -->
                <div class="p-3 flex flex-col flex-grow">
                    <h4 class="font-bold text-[11px] sm:text-xs text-gray-200 group-hover:text-primary transition-colors line-clamp-1 leading-snug mb-1">
                        ${movie.name}
                    </h4>
                    <div class="mt-auto flex items-center justify-between text-[10px] text-gray-400">
                        <span>${movie.year}</span>
                        <div class="flex items-center text-yellow-500 gap-0.5">
                            <span class="material-icons-round text-[11px]">star</span>
                            <span class="text-gray-300 font-medium">${rating}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

// Show error
function showError(message) {
    const playerContainer = document.querySelector('.aspect-video');
    if (playerContainer) {
        playerContainer.innerHTML = `
            <div class="w-full h-full bg-black flex items-center justify-center">
                <div class="text-center">
                    <span class="material-icons-round text-6xl text-red-400 mb-4">error_outline</span>
                    <p class="text-white text-lg">${message}</p>
                </div>
            </div>
        `;
    }
}

// Setup Share and Save buttons
function setupActionButtons() {
    const saveBtns = [document.getElementById('saveMovieBtn'), document.getElementById('sidebarSaveMovieBtn')].filter(Boolean);
    const favBtns = [document.getElementById('favoriteMovieBtn'), document.getElementById('sidebarFavoriteMovieBtn')].filter(Boolean);

    // Setup save buttons
    saveBtns.forEach(btn => {
        if (currentMovie) {
            updateSaveButton(btn);
            btn.addEventListener('click', () => toggleSaveMovie(btn));
        }
    });

    // Setup favorite buttons
    favBtns.forEach(btn => {
        if (currentMovie) {
            updateFavoriteButton(btn);
            btn.addEventListener('click', () => toggleFavoriteMovie(btn));
        }
    });
}

// Share movie function
function shareMovie() {
    if (!currentMovie) return;

    const shareData = {
        title: currentMovie.name,
        text: `Xem phim ${currentMovie.name} (${currentMovie.year}) trên A Phim`,
        url: window.location.href
    };

    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('✅ Shared successfully'))
            .catch((error) => console.log('❌ Error sharing:', error));
    } else {
        // Fallback: Copy link to clipboard
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                alert('✅ Đã sao chép link phim vào clipboard!');
            })
            .catch(() => {
                // Show share modal with social media options
                showShareModal();
            });
    }
}

// Show share modal
function showShareModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-surface-dark rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">Chia sẻ phim</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                    <span class="material-icons-round">close</span>
                </button>
            </div>
            <div class="mb-4">
                <p class="text-gray-300 mb-2">${currentMovie.name}</p>
                <div class="flex items-center gap-2 bg-black/40 p-3 rounded-lg">
                    <input type="text" value="${window.location.href}" 
                        class="flex-1 bg-transparent text-gray-300 text-sm outline-none" readonly />
                    <button onclick="copyShareLink()" 
                        class="px-3 py-1 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors text-sm">
                        Sao chép
                    </button>
                </div>
            </div>
            <div class="grid grid-cols-4 gap-3">
                <button onclick="shareToFacebook()" 
                    class="flex flex-col items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <span class="text-2xl">📘</span>
                    <span class="text-xs text-white">Facebook</span>
                </button>
                <button onclick="shareToTwitter()" 
                    class="flex flex-col items-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors">
                    <span class="text-2xl">🐦</span>
                    <span class="text-xs text-white">Twitter</span>
                </button>
                <button onclick="shareToTelegram()" 
                    class="flex flex-col items-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                    <span class="text-2xl">✈️</span>
                    <span class="text-xs text-white">Telegram</span>
                </button>
                <button onclick="shareToZalo()" 
                    class="flex flex-col items-center gap-2 p-3 bg-blue-400 hover:bg-blue-500 rounded-lg transition-colors">
                    <span class="text-2xl">💬</span>
                    <span class="text-xs text-white">Zalo</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Copy share link
window.copyShareLink = function () {
    navigator.clipboard.writeText(window.location.href)
        .then(() => {
            alert('✅ Đã sao chép link!');
        });
};

// Share to social media
window.shareToFacebook = function () {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

window.shareToTwitter = function () {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Xem phim ${currentMovie.name} trên A Phim`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
};

window.shareToTelegram = function () {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Xem phim ${currentMovie.name}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
};

window.shareToZalo = function () {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://zalo.me/share?url=${url}`, '_blank');
};

// Toggle save movie (Launch Playlist Modal)
function toggleSaveMovie(button) {
    if (!currentMovie) return;

    // Check if user is logged in
    if (!authService.isLoggedIn()) {
        if (typeof window.showAuthModal === 'function') {
            window.showAuthModal('login');
        } else if (confirm('Bạn cần đăng nhập để thêm phim vào danh sách. Chuyển đến trang đăng nhập?')) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }
        return;
    }

    // Open standard playlist management modal
    if (typeof openPlaylistModal === 'function') {
        openPlaylistModal({
            slug: currentMovie.slug,
            name: currentMovie.name,
            thumb_url: currentMovie.thumb_url || currentMovie.poster_url,
            year: currentMovie.year
        });
    } else {
        console.error('❌ openPlaylistModal function not defined. Verify playlist-modal.js loading.');
    }
}

// Update save button UI
function updateSaveButton(button) {
    // For playlist modal, the button always triggers the prompt. 
    // Optional: we could dynamically check if it exists in ANY playlist.
    // Keeping it simple and functional as a prompt trigger.
    if (!currentMovie) return;
}

// setupActionButtons is now called directly in loadMovieAndPlay() after currentMovie is set

// Toggle favorite movie
function toggleFavoriteMovie(button) {
    if (!currentMovie) return;

    // Check if user is logged in
    if (!authService.isLoggedIn()) {
        if (confirm('Bạn cần đăng nhập để thêm vào yêu thích. Chuyển đến trang đăng nhập?')) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }
        return;
    }

    if (userService.isFavorite(currentMovie.slug)) {
        userService.removeFromFavorites(currentMovie.slug);
    } else {
        userService.addToFavorites(currentMovie);
    }

    // Synchronize both primary and sidebar favorite buttons
    const favBtns = [document.getElementById('favoriteMovieBtn'), document.getElementById('sidebarFavoriteMovieBtn')].filter(Boolean);
    favBtns.forEach(btn => updateFavoriteButton(btn));
}

// Update favorite button UI
function updateFavoriteButton(button) {
    if (!currentMovie || !button) return;

    const isFav = userService.isFavorite(currentMovie.slug);
    const icon = button.querySelector('.material-icons-round') || button.querySelector('.material-icons-outlined');
    const textSpan = button.querySelector('.whitespace-nowrap');

    if (isFav) {
        if (icon) {
            icon.textContent = 'favorite';
            icon.classList.remove('group-hover:text-red-400');
            icon.classList.add('text-red-500');
        }
        if (textSpan) textSpan.textContent = 'Đã thích';
        button.classList.add('text-red-500');
        button.classList.remove('text-gray-300');
    } else {
        if (icon) {
            icon.textContent = 'favorite_border';
            icon.classList.add('group-hover:text-red-400');
            icon.classList.remove('text-red-500');
        }
        if (textSpan) textSpan.textContent = 'Yêu thích';
        button.classList.remove('text-red-500');
        button.classList.add('text-gray-300');
    }
}


// Toggle Cinema Mode Function
window.toggleCinemaMode = function() {
    const videoContainer = document.getElementById('video-container');
    const sidebarCol = document.getElementById('sidebar-col');
    const cinemaModeBadge = document.getElementById('cinemaModeBadge');
    
    if (!videoContainer || !sidebarCol || !cinemaModeBadge) return;
    
    if (sidebarCol.classList.contains('hidden')) {
        // Turn OFF Cinema
        sidebarCol.classList.remove('hidden');
        sidebarCol.classList.add('lg:block'); 
        videoContainer.classList.remove('lg:col-span-12');
        videoContainer.classList.add('lg:col-span-8');
        cinemaModeBadge.textContent = 'OFF';
        cinemaModeBadge.classList.replace('text-primary', 'text-gray-400');
        cinemaModeBadge.classList.replace('border-primary', 'border-gray-500');
    } else {
        // Turn ON Cinema
        sidebarCol.classList.add('hidden');
        sidebarCol.classList.remove('lg:block');
        videoContainer.classList.remove('lg:col-span-8');
        videoContainer.classList.add('lg:col-span-12');
        cinemaModeBadge.textContent = 'ON';
        cinemaModeBadge.classList.replace('text-gray-400', 'text-primary');
        cinemaModeBadge.classList.replace('border-gray-500', 'border-primary');
    }
};

// Show YouTube/Netflix-style visual seek notification overlay
function showSeekOverlay(text, isRight) {
    const container = document.querySelector('.aspect-video');
    if (!container) return;
    
    // Remove existing seek indicators to avoid overlaps
    const oldIndicator = container.querySelector('.seek-indicator');
    if (oldIndicator) oldIndicator.remove();
    
    const indicator = document.createElement('div');
    indicator.className = `seek-indicator absolute z-30 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center bg-black/70 text-white rounded-full w-24 h-24 backdrop-blur-md transition-all duration-300 scale-75 opacity-0`;
    
    // Explicitly enforce horizontal positioning on correct side of the parent player container
    indicator.style.position = 'absolute';
    indicator.style.top = '50%';
    indicator.style.transform = 'translate(-50%, -50%)';
    if (isRight) {
        indicator.style.right = '20%';
        indicator.style.left = 'auto';
    } else {
        indicator.style.left = '20%';
        indicator.style.right = 'auto';
    }
    
    const icon = isRight ? 'fast_forward' : 'fast_rewind';
    indicator.innerHTML = `
        <span class="material-icons-round text-4xl mb-1.5 animate-pulse">${icon}</span>
        <span class="text-xs font-black tracking-wider">${text}</span>
    `;
    
    container.appendChild(indicator);
    
    // Smooth fade & scale entrance
    requestAnimationFrame(() => {
        indicator.classList.remove('scale-75', 'opacity-0');
        indicator.classList.add('scale-100', 'opacity-100');
    });
    
    // Fade out and self-destruct after 800ms
    setTimeout(() => {
        indicator.classList.add('scale-75', 'opacity-0');
        setTimeout(() => indicator.remove(), 300);
    }, 800);
}

// Global changeEpisode helper to update query string parameters and transition instantly
window.changeEpisode = function(episodeSlug) {
    if (!currentMovie || !currentMovie.episodes || currentMovie.episodes.length === 0) return;
    const serverData = currentMovie.episodes[0].server_data;
    const foundEp = serverData.find(ep => ep.slug === episodeSlug);
    if (!foundEp) return;

    // 1. Update active state variables
    currentEpisode = foundEp;

    // 2. Update URL query parameter cleanly without page reload
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('episode', episodeSlug);
    window.history.pushState({}, '', 'watch.html?' + urlParams.toString());

    // 3. Update document title
    document.title = `${currentMovie.name} - ${currentEpisode.name} - APhim`;

    // 4. Update play stream (Re-initialize player or switch stream)
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
        initializePlayer(currentEpisode);
    } else {
        renderPlayerPlaceholder(currentEpisode);
    }

    // 5. Update Watch History
    if (typeof userService !== 'undefined' && typeof userService.addToHistory === 'function') {
        userService.addToHistory(currentMovie, currentEpisode.name);
    }

    // 6. Rerender Episode List to update highlights
    renderEpisodeList(currentMovie.episodes);

    // 7. Update prev/next episode navigation buttons
    updateEpisodeNavButtons();
};

// Update under-player navigation skip buttons (opacity, clickability)
function updateEpisodeNavButtons() {
    if (!currentMovie || !currentMovie.episodes || currentMovie.episodes.length === 0 || !currentEpisode) return;
    const serverData = currentMovie.episodes[0].server_data;
    const currentIndex = serverData.findIndex(ep => ep.slug === currentEpisode.slug);
    
    const prevBtn = document.getElementById('btn-prev-episode');
    const nextBtn = document.getElementById('btn-next-episode');
    
    if (prevBtn) {
        if (currentIndex <= 0) {
            prevBtn.classList.add('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
            prevBtn.classList.remove('hover:text-primary');
        } else {
            prevBtn.classList.remove('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
            prevBtn.classList.add('hover:text-primary');
        }
    }
    
    if (nextBtn) {
        if (currentIndex >= serverData.length - 1) {
            nextBtn.classList.add('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
            nextBtn.classList.remove('hover:text-primary');
        } else {
            nextBtn.classList.remove('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
            nextBtn.classList.add('hover:text-primary');
        }
    }
}

// Navigation skip buttons action
function playPreviousEpisode() {
    if (!currentMovie || !currentMovie.episodes || currentMovie.episodes.length === 0 || !currentEpisode) return;
    const serverData = currentMovie.episodes[0].server_data;
    const currentIndex = serverData.findIndex(ep => ep.slug === currentEpisode.slug);
    if (currentIndex > 0) {
        window.changeEpisode(serverData[currentIndex - 1].slug);
    }
}

function playNextEpisode() {
    if (!currentMovie || !currentMovie.episodes || currentMovie.episodes.length === 0 || !currentEpisode) return;
    const serverData = currentMovie.episodes[0].server_data;
    const currentIndex = serverData.findIndex(ep => ep.slug === currentEpisode.slug);
    if (currentIndex < serverData.length - 1) {
        window.changeEpisode(serverData[currentIndex + 1].slug);
    }
}

// Autoplay next episode with a gorgeous Netflix-style countdown overlay
function autoPlayNext() {
    if (!currentMovie || !currentMovie.episodes || currentMovie.episodes.length === 0 || !currentEpisode) return;
    const serverData = currentMovie.episodes[0].server_data;
    const currentIndex = serverData.findIndex(ep => ep.slug === currentEpisode.slug);
    
    // If it's the last episode, do nothing
    if (currentIndex >= serverData.length - 1) return;
    
    const nextEpisode = serverData[currentIndex + 1];
    const playerContainer = document.querySelector('.aspect-video');
    if (!playerContainer) return;
    
    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.id = 'netflix-next-countdown';
    overlay.className = 'absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white z-[99] transition-opacity duration-300 opacity-0';
    overlay.style.borderRadius = '12px';
    
    let countdownVal = 10;
    
    overlay.innerHTML = `
        <div class="text-center p-6 space-y-4 max-w-sm select-none">
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">TẬP TIẾP THEO</p>
            <h4 class="text-lg md:text-2xl font-black text-[#fcd576] truncate max-w-[280px] md:max-w-xs mx-auto">${nextEpisode.name}</h4>
            
            <div class="relative w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center">
                <!-- Circular SVG Countdown Progress Bar -->
                <svg class="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="transparent" />
                    <circle id="countdown-progress-bar" cx="40" cy="40" r="34" stroke="#fcd576" stroke-width="4" fill="transparent" 
                            stroke-dasharray="213.6" stroke-dashoffset="0" style="transition: stroke-dashoffset 1s linear;" />
                </svg>
                <span id="countdown-number" class="absolute text-xl md:text-2xl font-black text-white">${countdownVal}</span>
            </div>
            
            <div class="flex items-center justify-center gap-3 pt-2">
                <button id="cancel-countdown-btn" class="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer active:scale-95">
                    Hủy
                </button>
                <button id="play-now-countdown-btn" class="px-4 py-1.5 bg-[#fcd576] hover:bg-white hover:text-black text-black rounded-lg font-bold text-xs transition-colors cursor-pointer active:scale-95">
                    Phát ngay
                </button>
            </div>
        </div>
    `;
    
    playerContainer.appendChild(overlay);
    
    // Force reflow and fade in
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
    });
    
    const progressCircle = document.getElementById('countdown-progress-bar');
    const countdownNumber = document.getElementById('countdown-number');
    const maxOffset = 213.6;
    
    // Set initial stroke-dashoffset logic
    if (progressCircle) {
        progressCircle.setAttribute('cx', playerContainer.clientWidth > 640 ? '40' : '32');
        progressCircle.setAttribute('cy', playerContainer.clientWidth > 640 ? '40' : '32');
    }
    
    const intervalId = setInterval(() => {
        countdownVal--;
        if (countdownNumber) countdownNumber.textContent = countdownVal;
        if (progressCircle) {
            const offset = maxOffset - (maxOffset * (10 - countdownVal) / 10);
            progressCircle.style.strokeDashoffset = offset;
        }
        
        if (countdownVal <= 0) {
            clearInterval(intervalId);
            window.changeEpisode(nextEpisode.slug);
        }
    }, 1000);
    
    // Wire up events
    document.getElementById('cancel-countdown-btn').onclick = () => {
        clearInterval(intervalId);
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.remove(), 300);
    };
    
    document.getElementById('play-now-countdown-btn').onclick = () => {
        clearInterval(intervalId);
        window.changeEpisode(nextEpisode.slug);
    };
}

// Cinema mode (Tắt đèn): Dim all surrounding elements for a true movie theater experience
let isCinemaModeActive = false;
let bodyClickCancelHandler = null;

window.toggleCinemaMode = function() {
    const targetElement = document.getElementById('player-and-controls');
    const cinemaBtn = document.getElementById('cinemaModeBtn');
    if (!targetElement) return;

    const elementsToDim = [
        document.querySelector('nav'),
        document.getElementById('sidebar-col'),
        document.getElementById('comments-section'),
        document.querySelector('footer'),
        document.getElementById('episode-list')?.parentElement
    ].filter(Boolean);

    isCinemaModeActive = !isCinemaModeActive;

    if (isCinemaModeActive) {
        // 1. Dim all surrounding elements with an elite blur and brightness reduction
        elementsToDim.forEach(el => {
            el.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            el.style.opacity = '0.08';
            el.style.filter = 'brightness(0.15) blur(1.5px)';
            el.style.pointerEvents = 'none';
        });

        // 2. Enhance active player wrapper with shadow and prominence
        targetElement.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        targetElement.style.boxShadow = '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 40px rgba(252, 211, 77, 0.05)';
        targetElement.style.transform = 'scale(1.01)';

        // 3. Update Cinema Button state
        if (cinemaBtn) {
            cinemaBtn.innerHTML = `
                <span class="material-icons-round text-sm sm:text-base text-[#fcd576]">lightbulb</span>
                <span class="text-[#fcd576]">Bật đèn</span>
            `;
        }

        // 4. Click backdrop (any dimmed area) to turn light back on
        bodyClickCancelHandler = function(e) {
            if (!targetElement.contains(e.target) && e.target !== cinemaBtn && !cinemaBtn.contains(e.target)) {
                window.toggleCinemaMode();
            }
        };
        // Use setTimeout to avoid immediate event execution in the same click loop
        setTimeout(() => {
            document.addEventListener('click', bodyClickCancelHandler);
        }, 50);

    } else {
        // 1. Restore all surrounding elements cleanly
        elementsToDim.forEach(el => {
            el.style.opacity = '';
            el.style.filter = '';
            el.style.pointerEvents = '';
        });

        // 2. Restore player styles
        targetElement.style.boxShadow = '';
        targetElement.style.transform = '';

        // 3. Update Cinema Button state
        if (cinemaBtn) {
            cinemaBtn.innerHTML = `
                <span class="material-icons-round text-sm sm:text-base">lightbulb</span>
                <span>Tắt đèn</span>
            `;
        }

        // 4. Clean up backdrop listener
        if (bodyClickCancelHandler) {
            document.removeEventListener('click', bodyClickCancelHandler);
            bodyClickCancelHandler = null;
        }
    }
    
    // Clean up old cinema-overlay if it exists from previous attempts
    const oldOverlay = document.getElementById('cinema-overlay');
    if (oldOverlay) oldOverlay.remove();
};

// Toggle browser Fullscreen API on player container
function toggleFullscreen() {
    const playerContainer = document.querySelector('.aspect-video');
    if (!playerContainer) return;
    
    const fsBtn = document.getElementById('fullscreenBtn');
    
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().then(() => {
            if (fsBtn) {
                fsBtn.innerHTML = `
                    <span class="material-icons-round text-sm sm:text-base">fullscreen_exit</span>
                    <span>Thu nhỏ</span>
                `;
            }
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen().then(() => {
            if (fsBtn) {
                fsBtn.innerHTML = `
                    <span class="material-icons-round text-sm sm:text-base">fullscreen</span>
                    <span>Toàn màn hình</span>
                `;
            }
        });
    }
}

// Sync fullscreen Escape exit
document.addEventListener('fullscreenchange', () => {
    const fsBtn = document.getElementById('fullscreenBtn');
    if (!fsBtn) return;
    if (document.fullscreenElement) {
        fsBtn.innerHTML = `
            <span class="material-icons-round text-sm sm:text-base">fullscreen_exit</span>
            <span>Thu nhỏ</span>
        `;
    } else {
        fsBtn.innerHTML = `
            <span class="material-icons-round text-sm sm:text-base">fullscreen</span>
            <span>Toàn màn hình</span>
        `;
    }
});

// Beautiful Premium Toast notification for reporting errors
function reportError() {
    let toast = document.getElementById('error-report-toast');
    if (toast) {
        toast.remove(); // Remove active instance to reset countdown
    }
    
    toast = document.createElement('div');
    toast.id = 'error-report-toast';
    // Style with ultra-premium glassmorphic styling
    toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 z-[10005] flex items-center gap-3 px-6 py-4 bg-[#1a1a1a]/95 backdrop-blur-md border border-[#fcd576]/30 text-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] transition-all duration-300 opacity-0 -translate-y-4 select-none pointer-events-none';
    
    toast.innerHTML = `
        <span class="material-icons-round text-[#fcd576] text-xl animate-bounce">check_circle</span>
        <span class="text-sm font-extrabold tracking-wide text-gray-200">Đã ghi nhận báo lỗi, cảm ơn bạn</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', '-translate-y-4');
        toast.classList.add('opacity-100', 'translate-y-0');
    });
    
    // Auto close after 3 seconds
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
