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
    document.title = `${movie.name} - ${episode?.name || ''} - CineStream`;

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
                class="${isActive ? 'bg-[#fcd576] text-black font-bold border-transparent' : 'bg-[#1f2129] hover:bg-white/10 text-gray-300 border-white/5'} px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border whitespace-nowrap shadow-lg">
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
        <a class="group bg-[#181a20] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all flex flex-col h-full" 
           href="movie-detail.html?slug=${movie.slug}">
            <div class="relative w-full aspect-[2/3] flex-shrink-0">
                <img src="${movieAPI.getImageURL(movie.thumb_url)}" 
                     alt="${movie.name}"
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
    const icon = button.querySelector('.material-icons-outlined') || button.querySelector('.material-icons-round');
    const textSpan = button.querySelectorAll('span')[1];

    if (isSaved) {
        if(icon) icon.textContent = 'check';
        if(textSpan) textSpan.textContent = 'Đã thêm';
        button.classList.add('text-primary');
    } else {
        if(icon) icon.textContent = 'add';
        if(textSpan) textSpan.textContent = 'Thêm vào';
        button.classList.remove('text-primary');
    }
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
    if (!currentMovie) return;

    const isFav = userService.isFavorite(currentMovie.slug);
    const icon = button.querySelector('.material-icons-round') || button.querySelector('.material-icons-outlined');

    if (isFav) {
        if (icon) icon.textContent = 'favorite';
        button.classList.add('text-red-500');
        button.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                node.textContent = ' Đã thích';
            }
        });
    } else {
        if (icon) icon.textContent = 'favorite_border';
        button.classList.remove('text-red-500');
        button.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                node.textContent = ' Yêu thích';
            }
        });
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
