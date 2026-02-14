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
    setupFavoriteButton();
    setupRatingSystem();
    setupCommentSystem();
});

// Load movie detail from API
async function loadMovieDetail(slug) {
    try {
        const response = await movieAPI.getMovieDetail(slug);

        if (response && response.status === 'success' && response.data) {
            currentMovie = response.data.item;
            renderMovieDetail(currentMovie);
            renderEpisodes(currentMovie.episodes);
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
        titleElement.innerHTML = `
            ${movie.name}<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                ${movie.origin_name}
            </span>
        `;
    }

    // Update info
    const infoContainer = document.querySelector('.flex.flex-wrap.items-center.gap-4.mb-8');
    if (infoContainer) {
        const avgRating = ratingService.getAverageRating(movie.slug);
        const ratings = ratingService.getRatings(movie.slug);

        infoContainer.innerHTML = `
            <span class="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 backdrop-blur-sm">
                <span class="material-icons-round text-lg">star</span>
                ${avgRating}/10 (${ratings.length} đánh giá)
            </span>
            <span class="text-gray-500">•</span>
            <span class="text-gray-300 font-medium">${movie.year}</span>
            <span class="text-gray-500">•</span>
            <span class="text-gray-300 font-medium">${movie.time || 'N/A'}</span>
            <span class="text-gray-500">•</span>
            <span class="text-gray-300 font-medium">${movie.quality} - ${movie.lang}</span>
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
}

// Add movie metadata (categories, actors, etc.)
function addMovieMetadata(movie) {
    const metadataContainer = document.querySelector('.lg\\:col-span-8');
    if (!metadataContainer) return;

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
            
            ${movie.actor && movie.actor.length > 0 ? `
            <div>
                <h4 class="text-sm font-bold text-gray-400 mb-2">Diễn viên</h4>
                <p class="text-gray-300">${movie.actor.slice(0, 5).join(', ')}</p>
            </div>
            ` : ''}
        </div>
    `;

    const descSection = metadataContainer.querySelector('.mb-10.max-w-4xl');
    if (descSection) {
        descSection.insertAdjacentHTML('afterend', metadataHTML);
    }
}

// Render episodes
function renderEpisodes(episodes) {
    if (!episodes || episodes.length === 0) return;

    const episodeContainer = document.querySelector('.flex.gap-4.overflow-x-auto');
    if (!episodeContainer) return;

    const serverData = episodes[0].server_data;

    episodeContainer.innerHTML = serverData.map((ep, index) => `
        <a href="watch.html?slug=${currentMovie.slug}&episode=${ep.slug}"
            class="flex-shrink-0 ${index === 0 ? 'bg-primary/20 border-primary text-white' : 'bg-surface-dark border-white/5 text-gray-400'} border px-6 py-4 rounded-xl font-bold min-w-[140px] text-center hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30 transition-all">
            ${ep.name}
        </a>
    `).join('');
}

// Setup favorite button
function setupFavoriteButton() {
    const buttonsContainer = document.querySelector('.flex.flex-wrap.items-center.gap-4.mb-10');
    if (!buttonsContainer || !currentMovie) return;

    const isFav = userService.isFavorite(currentMovie.slug);

    const favBtn = document.createElement('button');
    favBtn.className = 'px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-3';
    favBtn.innerHTML = `
        <span class="material-icons-round">${isFav ? 'favorite' : 'favorite_border'}</span>
        <span>${isFav ? 'Đã lưu' : 'Lưu phim'}</span>
    `;

    favBtn.addEventListener('click', () => {
        if (userService.isFavorite(currentMovie.slug)) {
            userService.removeFromFavorites(currentMovie.slug);
            favBtn.innerHTML = '<span class="material-icons-round">favorite_border</span><span>Lưu phim</span>';
        } else {
            if (userService.addToFavorites(currentMovie)) {
                favBtn.innerHTML = '<span class="material-icons-round">favorite</span><span>Đã lưu</span>';
            }
        }
    });

    buttonsContainer.appendChild(favBtn);
}

// Setup rating system
function setupRatingSystem() {
    // Add rating section after episodes
    const episodeSection = document.querySelector('.mt-16');
    if (!episodeSection || !currentMovie) return;

    const ratingHTML = `
        <div class="mt-16 bg-surface-dark/50 border border-white/5 rounded-xl p-8">
            <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
                <span class="w-1.5 h-8 bg-primary rounded-full"></span>
                Đánh giá phim
            </h3>
            
            ${authService.isLoggedIn() ? `
            <div class="mb-8 p-6 bg-black/30 rounded-lg border border-white/5">
                <div class="flex items-center gap-4 mb-4">
                    <span class="text-gray-300">Đánh giá của bạn:</span>
                    <div class="flex gap-2" id="ratingStars">
                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `
                            <button class="rating-star text-2xl text-gray-600 hover:text-yellow-400 transition-colors" data-rating="${i}">
                                <span class="material-icons-round">star</span>
                            </button>
                        `).join('')}
                    </div>
                    <span id="ratingValue" class="text-primary font-bold">0/10</span>
                </div>
                <textarea id="commentInput" 
                    class="w-full bg-background-dark border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                    rows="3" placeholder="Viết nhận xét của bạn..."></textarea>
                <button id="submitRating" 
                    class="mt-4 px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    Gửi đánh giá
                </button>
            </div>
            ` : `
            <div class="mb-8 p-6 bg-black/30 rounded-lg border border-white/5 text-center">
                <p class="text-gray-400 mb-4">Vui lòng đăng nhập để đánh giá phim</p>
                <a href="login.html" class="inline-block px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    Đăng nhập
                </a>
            </div>
            `}
            
            <div id="ratingsContainer"></div>
        </div>
    `;

    episodeSection.insertAdjacentHTML('afterend', ratingHTML);

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
