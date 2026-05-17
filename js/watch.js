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
        titleElement.textContent = `${movie.name} (${movie.year})`;
    }

    const infoElement = document.getElementById('movie-info') || document.querySelector('.flex.flex-wrap.items-center.gap-4.text-sm');
    if (infoElement) {
        const avgRating = ratingService.getAverageRating(movie.slug);
        infoElement.innerHTML = `
            <span class="flex items-center text-primary font-bold">
                <span class="material-icons-round text-base mr-1">star</span> ${avgRating}
            </span>
            <span>${movie.year}</span>
            <span class="border border-gray-700 px-2 py-0.5 rounded text-xs uppercase">${movie.quality}</span>
            <span>${movie.time}</span>
            <span class="text-gray-500 px-1">•</span>
            <span>${movie.category?.map(c => c.name).join(', ')}</span>
        `;
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
            
            <!-- Background Image with Cinematic Ambient Blur -->
            <div class="absolute inset-0 bg-cover bg-center bg-no-repeat transform-gpu scale-105 transition-all duration-[1.5s] ease-out group-hover/overlay:scale-112" 
                 style="background-image: url('${posterUrl}'); filter: brightness(0.55) blur(1.5px) contrast(1.05); border-radius: 12px; overflow: hidden;"></div>
            
            <!-- Netflix/Disney+ Premium Double Gradients -->
            <!-- Top Gradient (Fade out header backdrop) -->
            <div class="absolute inset-0 bg-gradient-to-b from-black/95 via-black/30 to-transparent opacity-95" style="border-radius: 12px;"></div>
            <!-- Bottom Gradient (Fade out text backdrop - cinematic) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent opacity-95" style="border-radius: 12px;"></div>
            
            <!-- Central Play Button (Dead Centered - Absolute Horizontal & Vertical Center) -->
            <div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div id="play-btn" style="width: 80px; height: 80px; cursor: pointer;" class="pointer-events-auto transition-transform duration-500 transform group-hover/overlay:scale-110 filter drop-shadow-[0_10px_35px_rgba(252,211,77,0.35)]"></div>
            </div>
            
            <!-- Netflix-Style Bottom-Left Cinematic Movie Info & Meta -->
            <div class="absolute z-20 flex flex-col gap-2 transition-all duration-500 transform group-hover/overlay:translate-x-1"
                 style="position: absolute !important; bottom: 24px !important; left: 24px !important; top: auto !important; right: auto !important; pointer-events: none; -webkit-user-select: none; user-select: none;">
                
                <!-- Badges / Tags -->
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 shadow-lg">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#fcd576] shadow-[0_0_5px_#fcd576]"></div>
                        <span class="text-[9px] md:text-[10px] font-black text-white uppercase tracking-wider">
                            ${quality} • ${lang}
                        </span>
                    </div>
                    <span class="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">APhim Studio</span>
                </div>

                <!-- Movie Title & Episode Name (Premium layout) -->
                <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <h3 class="text-white font-extrabold text-xl sm:text-2xl md:text-3xl tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] max-w-[90vw] sm:max-w-[450px] md:max-w-[600px] truncate leading-tight">
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

    container.innerHTML = serverData.map(ep => {
        const isActive = currentEpisode && ep.slug === currentEpisode.slug;
        return `
            <button onclick="changeEpisode('${ep.slug}')"
                class="${isActive ? 'bg-[#fcd576] text-black font-bold border-transparent' : 'bg-[#323447] hover:bg-white/10 text-gray-300 border-white/5'} px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border whitespace-nowrap shadow-lg">
                <span class="material-icons-round text-[18px]">${isActive ? 'play_arrow' : 'play_arrow'}</span>
                ${ep.name}
            </button>
        `;
    }).join('');
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

// Change episode
window.changeEpisode = function (episodeSlug) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('episode', episodeSlug);
    window.location.search = urlParams.toString();
};

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
            movies = data.data.items.slice(0, 4);
        } else if (data && data.items) {
            movies = data.items.slice(0, 4);
        } else if (Array.isArray(data)) {
            movies = data.slice(0, 4);
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
    container.innerHTML = movies.map(movie => `
        <a class="group bg-[#282a3a] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all flex flex-col h-full" 
           href="movie-detail.html?slug=${movie.slug}">
            <div class="relative w-full aspect-[2/3] flex-shrink-0">
                <img src="${movieAPI.getImageURL(movie.thumb_url)}" 
                     alt="Xem Phim ${movie.name} (${movie.year}) Vietsub Full HD"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     onerror="this.src='https://via.placeholder.com/150x225?text=No+Image'" />
                <span class="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                    ${movie.quality || 'HD'}
                </span>
            </div>
            <div class="p-3 flex flex-col flex-grow">
                <h4 class="font-bold text-sm md:text-base text-gray-200 group-hover:text-primary line-clamp-2 mb-1">
                    ${movie.name}
                </h4>
                <div class="mt-auto pt-2">
                    <span class="text-xs text-gray-500 mb-1 block">${movie.year}</span>
                    <div class="flex items-center text-xs text-yellow-500 gap-1">
                        <span class="material-icons-round text-[14px]">star</span>
                        <span class="text-gray-300 font-medium">${movie.tmdb?.vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </a>
    `).join('');
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
    const saveBtn = document.getElementById('saveMovieBtn');
    const favBtn = document.getElementById('favoriteMovieBtn');

    // Find share button
    const buttons = document.querySelectorAll('button');
    let shareBtn = null;
    buttons.forEach(btn => {
        const text = btn.textContent.trim();
        if (text.includes('Chia sẻ') || text.includes('share')) {
            shareBtn = btn;
        }
    });

    // Setup share button
    if (shareBtn) {
        shareBtn.addEventListener('click', () => shareMovie());
        console.log('✅ Share button setup');
    }

    // Setup save button
    if (saveBtn && currentMovie) {
        updateSaveButton(saveBtn);
        saveBtn.addEventListener('click', () => toggleSaveMovie(saveBtn));
        console.log('✅ Save button setup');
    }

    // Setup favorite button
    if (favBtn && currentMovie) {
        updateFavoriteButton(favBtn);
        favBtn.addEventListener('click', () => toggleFavoriteMovie(favBtn));
        console.log('✅ Favorite button setup');
    }
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

    updateFavoriteButton(button);
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
        videoContainer.classList.add('lg:col-span-9');
        cinemaModeBadge.textContent = 'OFF';
        cinemaModeBadge.classList.replace('text-primary', 'text-gray-400');
        cinemaModeBadge.classList.replace('border-primary', 'border-gray-500');
    } else {
        // Turn ON Cinema
        sidebarCol.classList.add('hidden');
        sidebarCol.classList.remove('lg:block');
        videoContainer.classList.remove('lg:col-span-9');
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
