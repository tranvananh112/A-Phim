// Movie Detail Page Script
let currentMovie = null;

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'index.html';
        return;
    }

    await loadMovieDetail(slug);
});

// Load movie detail from API
async function loadMovieDetail(slug) {
    try {
        const response = await movieAPI.getMovieDetail(slug);

        if (response && response.status === 'success' && response.data) {
            currentMovie = response.data.item;
            renderMovieDetail(currentMovie);
            renderEpisodes(currentMovie.episodes);
            setupFavoriteButton();
            setupRatingSystem();
            loadRatingsAndComments(slug);
        } else {
            showError('Không thể tải thông tin phim');
        }
    } catch (error) {
        console.error('Error loading movie detail:', error);
        showError('Đã xảy ra lỗi khi tải thông tin phim');
    }
}

// Render movie detail
function renderMovieDetail(movie) {
    // Update page title
    document.title = `${movie.name} - CineStream`;

    // Update poster
    const posterImg = document.querySelector('.aspect-\\[2\\/3\\] img');
    if (posterImg) {
        posterImg.src = movieAPI.getImageURL(movie.poster_url || movie.thumb_url);
        posterImg.alt = movie.name;
    }

    // Update background
    const bgImg = document.querySelector('.absolute.top-0 img');
    if (bgImg) {
        bgImg.src = movieAPI.getImageURL(movie.thumb_url);
    }

    // Update title
    const titleElement = document.querySelector('h1');
    if (titleElement) {
        // Vietnamese name larger, English name smaller and on one line
        titleElement.className = 'font-extrabold text-white mb-4 leading-tight tracking-tight';
        titleElement.innerHTML = `
            <span class="block text-3xl md:text-5xl lg:text-7xl">${movie.name}</span>
            <span class="block text-xl md:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400 whitespace-nowrap overflow-hidden text-ellipsis">
                ${movie.origin_name}
            </span>
        `;
    }

    // Update info
    const infoContainer = document.querySelector('.movie-info-container') || document.querySelector('.flex.flex-wrap.items-center.gap-4.mb-8');
    if (infoContainer) {
        // Change to flex-wrap for mobile so it drops to next line instead of scrolling
        infoContainer.className = 'movie-info-container flex flex-wrap justify-center lg:justify-start items-center gap-y-2 gap-x-3 md:gap-4 mb-6 md:mb-8 text-sm md:text-base';

        const avgRating = ratingService.getAverageRating(movie.slug);
        const ratings = ratingService.getRatings(movie.slug);

        infoContainer.innerHTML = `
            <span class="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 backdrop-blur-sm flex-shrink-0 whitespace-nowrap">
                <span class="material-icons-round text-lg">star</span>
                ${avgRating}/10 (${ratings.length} đánh giá)
            </span>
            <span class="text-gray-500 flex-shrink-0">•</span>
            <span class="text-gray-300 font-medium flex-shrink-0 whitespace-nowrap">${movie.year}</span>
            <span class="text-gray-500 flex-shrink-0">•</span>
            <span class="text-gray-300 font-medium flex-shrink-0 whitespace-nowrap">${movie.time || 'N/A'}</span>
            <span class="text-gray-500 flex-shrink-0">•</span>
            <span class="text-gray-300 font-medium flex-shrink-0 whitespace-nowrap">${movie.quality} - ${movie.lang}</span>
        `;
    }

    // Update description
    const descElement = document.querySelector('.mb-10.max-w-4xl p');
    if (descElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = movie.content;
        descElement.textContent = tempDiv.textContent || 'Chưa có mô tả';
    }

    // Update categories and actors
    addMovieMetadata(movie);

    // Update watch button
    const watchBtn = document.querySelector('a[href="watch.html"]');
    if (watchBtn) {
        // Check if admin has set a custom link
        const movieLinks = JSON.parse(localStorage.getItem('movieLinks') || '{}');
        const customLink = movieLinks[movie.slug];

        if (customLink) {
            // Admin đã set link, cho phép xem
            watchBtn.href = `watch.html?slug=${movie.slug}`;
            watchBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            console.log('✅ Custom link found for movie:', movie.slug);
        } else if (movie.episodes && movie.episodes.length > 0) {
            // Có episodes từ API
            const firstEpisode = movie.episodes[0].server_data[0];
            watchBtn.href = `watch.html?slug=${movie.slug}&episode=${firstEpisode.slug}`;
        } else {
            // Không có link
            watchBtn.classList.add('opacity-50', 'cursor-not-allowed');
            watchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Phim chưa có link xem. Vui lòng quay lại sau!');
            });
        }
    }

    // Setup trailer button
    const trailerBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.includes('Xem Trailer') || btn.textContent.includes('Trailer')
    );

    if (trailerBtn && movie.trailer_url) {
        trailerBtn.addEventListener('click', () => {
            showTrailerModal(movie.trailer_url, movie.name);
        });
    } else if (trailerBtn) {
        trailerBtn.classList.add('opacity-50', 'cursor-not-allowed');
        trailerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Phim chưa có trailer');
        });
    }
}

// Add movie metadata (categories, actors, etc.)
function addMovieMetadata(movie) {
    const metadataContainer = document.querySelector('.lg\\:col-span-8');
    if (!metadataContainer) return;

    const descSection = metadataContainer.querySelector('.mb-10.max-w-4xl');
    if (!descSection) return;

    // Add cast section FIRST (before description)
    if (movie.actor && movie.actor.length > 0) {
        console.log('🎭 Rendering cast section for', movie.actor.length, 'actors:', movie.actor);

        const castHTML = `
            <div class="mt-0 mb-10" id="cast-section">
                <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span class="w-1.5 h-8 bg-primary rounded-full block shadow-[0_0_10px_rgba(236,19,19,0.5)]"></span>
                    Diễn viên
                </h3>
                <div class="relative">
                    <div id="cast-container" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style="scroll-behavior: smooth;">
                        ${movie.actor.slice(0, 10).map((actor, index) => {
            const colors = ['from-red-500 to-red-700', 'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-yellow-500 to-yellow-700', 'from-purple-500 to-purple-700', 'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700'];
            const colorClass = colors[index % colors.length];
            const initial = actor.charAt(0).toUpperCase();

            return `
                                <div class="flex-shrink-0 w-20 md:w-24 group cursor-pointer" data-actor-name="${actor}">
                                    <div class="relative mb-2">
                                        <div class="actor-avatar-container w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-2xl font-bold border-2 border-white/10 group-hover:border-primary transition-all duration-300 group-hover:scale-105 overflow-hidden">
                                            ${initial}
                                        </div>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-white font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">${actor}</p>
                                        <p class="text-gray-500 text-xs mt-1">Diễn viên</p>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        console.log('📝 Cast HTML length:', castHTML.length);
        // Insert BEFORE description section
        descSection.insertAdjacentHTML('beforebegin', castHTML);
        console.log('✅ Cast HTML inserted into DOM');

        // Load actor images from TMDB
        if (typeof loadActorImagesFromTMDB === 'function') {
            // Load async without blocking - use setTimeout to defer
            setTimeout(() => {
                console.log('🎬 Loading actor images in background...');

                const actorElements = document.querySelectorAll('[data-actor-name]');
                console.log('🎭 Actor elements found:', actorElements.length);

                if (actorElements.length > 0) {
                    loadActorImagesFromTMDB(movie).catch(err => {
                        console.warn('⚠️ Failed to load actor images:', err);
                    });
                }
            }, 500); // Delay 500ms to let page render first
        } else {
            console.warn('⚠️ loadActorImagesFromTMDB function not found');
        }
    }

    // Add metadata AFTER description
    const metadataHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-4xl">
            ${movie.category && movie.category.length > 0 ? `
            <div>
                <h4 class="text-sm font-bold text-gray-400 mb-2">Thể loại</h4>
                <div class="flex flex-wrap gap-2">
                    ${movie.category.map(cat => `
                        <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                            ${cat.name}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${movie.country && movie.country.length > 0 ? `
            <div>
                <h4 class="text-sm font-bold text-gray-400 mb-2">Quốc gia</h4>
                <div class="flex flex-wrap gap-2">
                    ${movie.country.map(c => `
                        <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                            ${c.name}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${movie.director && movie.director.length > 0 ? `
            <div>
                <h4 class="text-sm font-bold text-gray-400 mb-2">Đạo diễn</h4>
                <p class="text-gray-300">${movie.director.join(', ')}</p>
            </div>
            ` : ''}
        </div>
    `;

    descSection.insertAdjacentHTML('afterend', metadataHTML);
}

// Render episodes
function renderEpisodes(episodes) {
    if (!episodes || episodes.length === 0) return;

    const desktopContainer = document.getElementById('episodes-desktop');
    const mobileContainer = document.getElementById('episodes-mobile');

    if (!desktopContainer && !mobileContainer) {
        console.warn('⚠️ Episode containers not found');
        return;
    }

    const serverData = episodes[0].server_data;

    const html = serverData.map((ep, index) => {
        const isActive = index === 0;
        const btnClass = isActive 
            ? 'bg-primary/20 border border-primary text-white shadow-[0_0_10px_rgba(236,19,19,0.3)]' 
            : 'bg-[#1e2025] border border-white/5 text-gray-300 hover:bg-white/10 hover:text-white';
            
        return `
            <a href="watch.html?slug=${currentMovie.slug}&episode=${ep.slug}"
                class="flex items-center justify-center gap-1 sm:gap-2 ${btnClass} rounded-lg py-2.5 px-2 text-sm font-medium transition-all group">
                <span class="material-icons-round text-[16px] ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}">play_arrow</span>
                <span class="truncate">${ep.name}</span>
            </a>
        `;
    }).join('');

    if (desktopContainer) desktopContainer.innerHTML = html;
    if (mobileContainer) mobileContainer.innerHTML = html;
}

// Setup favorite button
function setupFavoriteButton() {
    const buttonsContainer = document.querySelector('.movie-actions-container');
    if (!buttonsContainer || !currentMovie) return;

    const isFav = userService.isFavorite(currentMovie.slug);

    const favBtn = document.createElement('button');
    favBtn.className = 'px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-2 md:gap-3 flex-none min-w-max';
    favBtn.innerHTML = `
        <span class="material-icons-round text-lg md:text-xl">${isFav ? 'favorite' : 'favorite_border'}</span>
        <span class="text-xs sm:text-sm md:text-base whitespace-nowrap">${isFav ? 'Đã lưu' : 'Lưu phim'}</span>
    `;

    favBtn.addEventListener('click', () => {
        if (userService.isFavorite(currentMovie.slug)) {
            userService.removeFromFavorites(currentMovie.slug);
            favBtn.innerHTML = '<span class="material-icons-round text-lg md:text-xl">favorite_border</span><span class="text-xs sm:text-sm md:text-base whitespace-nowrap">Lưu phim</span>';
        } else {
            if (userService.addToFavorites(currentMovie)) {
                favBtn.innerHTML = '<span class="material-icons-round text-lg md:text-xl">favorite</span><span class="text-xs sm:text-sm md:text-base whitespace-nowrap">Đã lưu</span>';
            }
        }
    });

    buttonsContainer.appendChild(favBtn);
}

// Setup rating system
function setupRatingSystem() {
    console.log("Setting up rating system...");
    // Comment section is now static in HTML
    const commentsSection = document.getElementById('comments-section') || document.querySelector('#comments-section');
    
    if (!commentsSection) {
        console.error("DOM Element #comments-section not found!");
        return;
    }
    
    if (!currentMovie) {
        console.warn("currentMovie is null, cannot setup rating.");
        return;
    }

    if (authService.isLoggedIn()) {
        setupRatingStars();
        setupRatingSubmit();
    }
}

// Setup rating stars
function setupRatingStars() {
    const stars = document.querySelectorAll('.rating-star');
    const ratingValue = document.getElementById('ratingValue');
    let selectedRating = 0;

    // Load user's existing rating
    const userRating = ratingService.getUserRating(currentMovie.slug);
    if (userRating) {
        selectedRating = userRating.rating;
        updateStars(selectedRating);
        document.getElementById('commentInput').value = userRating.comment || '';
    }

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            updateStars(selectedRating);
        });

        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            updateStars(rating, true);
        });
    });

    document.getElementById('ratingStars').addEventListener('mouseleave', () => {
        updateStars(selectedRating);
    });

    function updateStars(rating, isHover = false) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-600');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-600');
            }
        });
        ratingValue.textContent = `${rating}/10`;
        if (!isHover) selectedRating = rating;
    }
}

// Setup rating submit
function setupRatingSubmit() {
    const submitBtn = document.getElementById('submitRating');
    const commentInput = document.getElementById('commentInput');
    const ratingValue = document.getElementById('ratingValue');

    submitBtn.addEventListener('click', () => {
        const rating = parseInt(ratingValue.textContent.split('/')[0]);
        const comment = commentInput.value.trim();

        if (rating === 0) {
            alert('Vui lòng chọn số sao đánh giá');
            return;
        }

        const result = ratingService.addRating(currentMovie.slug, rating, comment);
        if (result.success) {
            alert('Đánh giá của bạn đã được gửi!');
            loadRatingsAndComments(currentMovie.slug);
        }
    });
}

// Setup comment system
function setupCommentSystem() {
    // Comments will be loaded in loadRatingsAndComments
}

// Load ratings and comments
function loadRatingsAndComments(slug) {
    const ratings = ratingService.getRatings(slug);
    const container = document.getElementById('ratingsContainer');

    if (!container) return;

    if (ratings.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Chưa có đánh giá nào</p>';
        return;
    }

    container.innerHTML = ratings.map(rating => `
        <div class="border-t border-white/5 pt-6 mt-6">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold flex-shrink-0">
                    ${rating.userName.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <h4 class="font-bold text-white">${rating.userName}</h4>
                            <div class="flex items-center gap-2 text-sm text-gray-400">
                                <span class="flex items-center gap-1 text-yellow-400 font-bold">
                                    <span class="material-icons-round text-sm">star</span>
                                    ${rating.rating}/10
                                </span>
                                <span>•</span>
                                <span>${new Date(rating.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                    ${rating.comment ? `<p class="text-gray-300 leading-relaxed">${rating.comment}</p>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Show error
function showError(message) {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div class="container mx-auto px-6 py-20 text-center">
                <h2 class="text-2xl font-bold text-red-400 mb-4">${message}</h2>
                <a href="index.html" class="inline-block px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    Về trang chủ
                </a>
            </div>
        `;
    }
}

// Show trailer modal
function showTrailerModal(trailerUrl, movieName) {
    // Extract YouTube video ID from URL
    let videoId = '';

    if (trailerUrl.includes('youtube.com/watch?v=')) {
        videoId = trailerUrl.split('v=')[1].split('&')[0];
    } else if (trailerUrl.includes('youtu.be/')) {
        videoId = trailerUrl.split('youtu.be/')[1].split('?')[0];
    } else if (trailerUrl.includes('youtube.com/embed/')) {
        videoId = trailerUrl.split('embed/')[1].split('?')[0];
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="relative w-full max-w-5xl mx-4">
            <button onclick="this.closest('.fixed').remove()" 
                class="absolute -top-12 right-0 text-white hover:text-primary transition-colors">
                <span class="material-icons-round text-4xl">close</span>
            </button>
            <div class="bg-surface-dark rounded-xl overflow-hidden border border-white/10">
                <div class="p-4 border-b border-white/10">
                    <h3 class="text-xl font-bold text-white">Trailer - ${movieName}</h3>
                </div>
                <div class="relative aspect-video">
                    ${videoId ? `
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                            class="w-full h-full"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    ` : `
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                            <p>Không thể phát trailer</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });

    document.body.appendChild(modal);
}
