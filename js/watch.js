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
            initializePlayer(currentEpisode);

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
    document.title = `${movie.name} - ${episode?.name || ''} - CineStream`;

    const titleElement = document.querySelector('h1');
    if (titleElement) {
        titleElement.textContent = `${movie.name} (${movie.year})`;
    }

    const infoElement = document.querySelector('.flex.flex-wrap.items-center.gap-4.text-sm');
    if (infoElement) {
        const avgRating = ratingService.getAverageRating(movie.slug);
        infoElement.innerHTML = `
            <span class="flex items-center text-primary font-bold">
                <span class="material-icons-round text-base mr-1">star</span> ${avgRating}
            </span>
            <span>${movie.year}</span>
            <span class="border border-gray-700 px-2 py-0.5 rounded text-xs uppercase">${movie.quality}</span>
            <span>${movie.time}</span>
            <span class="text-gray-500">|</span>
            <span>${movie.category?.map(c => c.name).join(', ')}</span>
        `;
    }
}

// Render episode list
function renderEpisodeList(episodes) {
    if (!episodes || episodes.length === 0) return;

    const container = document.querySelector('.grid.grid-cols-2');
    if (!container) return;

    const serverData = episodes[0].server_data;

    container.innerHTML = serverData.map(ep => {
        const isActive = currentEpisode && ep.slug === currentEpisode.slug;
        return `
            <button onclick="changeEpisode('${ep.slug}')"
                class="${isActive ? 'bg-primary text-black' : 'bg-black/40 hover:bg-gray-700 hover:text-primary text-gray-300'} font-medium py-3 rounded-lg border ${isActive ? 'border-primary shadow-[0_0_15px_rgba(242,242,13,0.3)]' : 'border-gray-700'} transition-colors">
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
            controlsList="nodownload"
            poster="${movieAPI.getImageURL(currentMovie.thumb_url)}">
            Trình duyệt của bạn không hỗ trợ video.
        </video>
    `;

    player = document.getElementById('videoPlayer');

    // Initialize HLS.js
    if (Hls.isSupported()) {
        console.log('✅ HLS.js is supported');
        const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
        });

        console.log('📡 Loading source:', videoUrl);
        hls.loadSource(videoUrl);
        hls.attachMedia(player);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            console.log('✅ Video manifest parsed - ready to play');
            // Set initial time from progress
            if (progress.currentTime > 0) {
                player.currentTime = progress.currentTime;
                console.log('⏩ Resuming from:', progress.currentTime);
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
        // Native HLS support (Safari)
        console.log('✅ Using native HLS support (Safari)');
        player.src = videoUrl;
        player.addEventListener('loadedmetadata', () => {
            console.log('✅ Video metadata loaded');
            if (progress.currentTime > 0) {
                player.currentTime = progress.currentTime;
            }
        });
    } else {
        console.error('❌ HLS not supported');
        showError('Trình duyệt của bạn không hỗ trợ phát video HLS');
        return;
    }

    // Save progress periodically
    let progressInterval;
    player.addEventListener('play', () => {
        console.log('▶️ Video playing');
        progressInterval = setInterval(() => {
            if (player.currentTime > 0 && player.duration > 0) {
                userService.saveWatchProgress(
                    currentMovie.slug,
                    player.currentTime,
                    player.duration,
                    episode.slug
                );
            }
        }, 5000);
    });

    player.addEventListener('pause', () => {
        console.log('⏸️ Video paused');
        clearInterval(progressInterval);
        userService.saveWatchProgress(
            currentMovie.slug,
            player.currentTime,
            player.duration,
            episode.slug
        );
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
    const sidebar = document.querySelector('aside .space-y-4');
    if (!sidebar) return;

    try {
        const data = await movieAPI.getMovieList(1);
        if (data && data.data && data.data.items) {
            const movies = data.data.items.slice(0, 5);
            renderRecommendations(movies, sidebar);
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Render recommendations
function renderRecommendations(movies, container) {
    container.innerHTML = movies.map(movie => `
        <a class="group flex gap-3 p-2 rounded-lg hover:bg-surface-dark transition-colors" 
           href="movie-detail.html?slug=${movie.slug}">
            <div class="relative w-24 aspect-[2/3] flex-shrink-0 rounded-md overflow-hidden">
                <img src="${movieAPI.getImageURL(movie.thumb_url)}" 
                     alt="${movie.name}"
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/100x150?text=No+Image'" />
                <span class="absolute top-1 left-1 bg-primary text-black text-[10px] font-bold px-1.5 rounded">
                    ${movie.quality || 'HD'}
                </span>
            </div>
            <div class="flex flex-col justify-center">
                <h4 class="font-bold text-sm text-gray-200 group-hover:text-primary line-clamp-2 mb-1">
                    ${movie.name}
                </h4>
                <span class="text-xs text-gray-500 mb-2">${movie.year}</span>
                <div class="flex items-center text-xs text-yellow-500 gap-1">
                    <span class="material-icons-round text-[14px]">star</span>
                    <span class="text-gray-300">${movie.tmdb?.vote_average?.toFixed(1) || 'N/A'}</span>
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
    // Find all buttons
    const buttons = document.querySelectorAll('button');
    let shareBtn = null;
    let saveBtn = null;

    buttons.forEach(btn => {
        const text = btn.textContent.trim();
        if (text.includes('Chia sẻ') || text.includes('share')) {
            shareBtn = btn;
        } else if (text.includes('Lưu phim') || text.includes('bookmark')) {
            saveBtn = btn;
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

// Toggle save movie
function toggleSaveMovie(button) {
    if (!currentMovie) return;

    // Check if user is logged in
    if (!authService.isLoggedIn()) {
        if (confirm('Bạn cần đăng nhập để lưu phim. Chuyển đến trang đăng nhập?')) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }
        return;
    }

    if (userService.isFavorite(currentMovie.slug)) {
        userService.removeFromFavorites(currentMovie.slug);
        alert('❌ Đã xóa khỏi danh sách yêu thích');
    } else {
        if (userService.addToFavorites(currentMovie)) {
            alert('✅ Đã lưu vào danh sách yêu thích');
        }
    }

    updateSaveButton(button);
}

// Update save button UI
function updateSaveButton(button) {
    if (!currentMovie) return;

    const isSaved = userService.isFavorite(currentMovie.slug);
    const icon = button.querySelector('.material-icons-outlined');
    const text = button.childNodes[button.childNodes.length - 1];

    if (isSaved) {
        icon.textContent = 'bookmark';
        text.textContent = ' Đã lưu';
        button.classList.add('bg-primary', 'text-black');
        button.classList.remove('bg-surface-dark', 'text-white');
    } else {
        icon.textContent = 'bookmark_add';
        text.textContent = ' Lưu phim';
        button.classList.remove('bg-primary', 'text-black');
        button.classList.add('bg-surface-dark', 'text-white');
    }
}

// Call setupActionButtons after movie is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Wait for movie to load
    setTimeout(() => {
        setupActionButtons();
    }, 1000);
});
