/**
 * Coming Soon Movies Section - Top 10 Style
 * Load movies from "phim-sap-chieu" and sort by highest rating
 */

(function () {
    'use strict';

    // Load coming soon movies
    async function loadComingSoonMovies() {
        const loading = document.getElementById('comingSoonLoading');
        const container = document.getElementById('comingSoonContainer');

        if (!loading || !container) {
            console.warn('Coming soon section elements not found');
            return;
        }

        try {
            console.log('Loading coming soon movies...');

            // Fetch from phim-sap-chieu API
            const response = await fetch('https://ophim1.com/v1/api/danh-sach/phim-sap-chieu?page=1', {
                method: 'GET',
                headers: { 'accept': 'application/json' }
            });

            const data = await response.json();
            console.log('Coming soon movies data:', data);

            if (data.status === 'success' && data.data && data.data.items) {
                let movies = data.data.items;

                // Sort by rating (highest first)
                movies.sort((a, b) => {
                    const ratingA = a.tmdb?.vote_average || 0;
                    const ratingB = b.tmdb?.vote_average || 0;
                    return ratingB - ratingA;
                });

                // Get top 20
                movies = movies.slice(0, 20);

                renderComingSoonMovies(movies);
            } else {
                loading.innerHTML = '<p class="text-gray-400">Không thể tải phim sắp chiếu</p>';
            }
        } catch (error) {
            console.error('Error loading coming soon movies:', error);
            loading.innerHTML = '<p class="text-red-400">Lỗi khi tải phim sắp chiếu</p>';
        }
    }

    function renderComingSoonMovies(movies) {
        const loading = document.getElementById('comingSoonLoading');
        const container = document.getElementById('comingSoonContainer');
        const scrollContainer = container.querySelector('.flex');

        if (!scrollContainer) return;

        loading.classList.add('hidden');
        container.classList.remove('hidden');

        // Get movie links from localStorage
        const movieLinks = JSON.parse(localStorage.getItem('movieLinks') || '{}');

        scrollContainer.innerHTML = movies.map((movie, index) => {
            const rank = index + 1;
            const hasCustomLink = !!movieLinks[movie.slug];
            const linkUrl = hasCustomLink ? `watch-simple.html?slug=${movie.slug}` : `movie-detail.html?slug=${movie.slug}`;
            const rating = movie.tmdb?.vote_average || 0;
            const posterUrl = `https://img.ophim.live/uploads/movies/${movie.poster_url || movie.thumb_url}`;

            return `
                <article class="cs-top10-card">
                    <!-- Poster with Perspective -->
                    <div class="cs-poster-perspective">
                        <a href="${linkUrl}">
                            <div class="cs-poster-container">
                                <!-- Poster Image -->
                                <img src="${posterUrl}" 
                                     alt="${movie.name}"
                                     onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'" />
                                
                                <!-- Badges on Poster -->
                                <div class="cs-badges-container">
                                    ${movie.episode_current ? `
                                        <span class="cs-badge cs-badge-episode">PĐ. ${movie.episode_current.replace(/[^0-9]/g, '')}</span>
                                    ` : ''}
                                    ${movie.lang ? `
                                        <span class="cs-badge ${movie.lang.includes('Thuyết Minh') || movie.lang.includes('TM') ? 'cs-badge-quality' : 'cs-badge-lang'}">
                                            ${movie.lang.includes('Thuyết Minh') ? 'TM' : movie.lang.includes('Lồng Tiếng') ? 'LT' : movie.lang}
                                        </span>
                                    ` : ''}
                                </div>
                                
                                <!-- Play Overlay -->
                                <div class="cs-play-overlay">
                                    <div class="cs-play-icon">
                                        <span class="material-icons-round">play_arrow</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                    
                    <!-- Movie Info with Rank Number -->
                    <div class="cs-movie-info-container">
                        <span class="cs-rank-number">${rank}</span>
                        <div class="cs-movie-info">
                            <a href="${linkUrl}">
                                <h3 class="cs-movie-title">${movie.name}</h3>
                            </a>
                            <p class="cs-movie-subtitle">${movie.origin_name || movie.name}</p>
                            <div class="cs-movie-meta">
                                ${movie.quality ? `<span class="cs-age-rating">${movie.quality}</span>` : ''}
                                ${movie.year ? `<span>• ${movie.year}</span>` : ''}
                                ${movie.episode_current ? `<span>• ${movie.episode_current}</span>` : ''}
                                ${rating > 0 ? `
                                    <span>•</span>
                                    <div class="cs-rating">
                                        <span class="material-icons-round">star</span>
                                        <span>${rating.toFixed(1)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Setup scroll buttons
        setupScrollButtons();
    }

    function setupScrollButtons() {
        const container = document.getElementById('comingSoonContainer');
        const scrollContainer = container?.querySelector('.flex');
        const leftBtn = document.getElementById('comingSoonScrollLeft');
        const rightBtn = document.getElementById('comingSoonScrollRight');

        if (!scrollContainer || !leftBtn || !rightBtn) return;

        leftBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -180, behavior: 'smooth' });
        });

        rightBtn.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 180, behavior: 'smooth' });
        });

        // Update button visibility based on scroll position
        function updateButtonVisibility() {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

            if (scrollLeft <= 0) {
                leftBtn.style.opacity = '0';
                leftBtn.style.pointerEvents = 'none';
            } else {
                leftBtn.style.pointerEvents = 'auto';
            }

            if (scrollLeft + clientWidth >= scrollWidth - 10) {
                rightBtn.style.opacity = '0';
                rightBtn.style.pointerEvents = 'none';
            } else {
                rightBtn.style.pointerEvents = 'auto';
            }
        }

        scrollContainer.addEventListener('scroll', updateButtonVisibility);
        updateButtonVisibility();
    }

    // Load on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadComingSoonMovies);
    } else {
        loadComingSoonMovies();
    }
})();
