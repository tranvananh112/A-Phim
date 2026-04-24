// Country Sections - Load movies from different countries
// Phim Hàn Quốc, Phim Trung Quốc, Phim US-UK

const COUNTRY_CONFIGS = {
    korea: {
        id: 'korea',
        title: '<span class="text-pink-500">Phim Hàn Quốc Mới</span>',
        url: 'https://ophim1.com/v1/api/quoc-gia/han-quoc',
        linkUrl: 'phim-theo-quoc-gia.html?country=han-quoc',
        gradient: 'from-background-dark to-pink-900/5'
    },
    china: {
        id: 'china',
        title: '<span class="text-pink-400">Phim Trung Quốc mới</span>',
        url: 'https://ophim1.com/v1/api/quoc-gia/trung-quoc',
        linkUrl: 'phim-theo-quoc-gia.html?country=trung-quoc',
        gradient: 'from-background-dark to-pink-800/5'
    },
    usuk: {
        id: 'usuk',
        title: '<span class="text-yellow-400">Phim US-UK mới</span>',
        url: 'https://ophim1.com/v1/api/quoc-gia/au-my',
        linkUrl: 'phim-theo-quoc-gia.html?country=au-my',
        gradient: 'from-background-dark to-yellow-900/5'
    }
};

// Create section HTML
function createCountrySection(config, isFirst) {
    // isFirst: section đầu tiên sau hero nhận bridge class
    const bridgeClass = isFirst ? 'hero-to-content-bridge' : 'ambient-section';
    return `
        <section class="country-section py-6 md:py-10 ${bridgeClass}">
            <div class="container mx-auto px-6">
                <div class="country-section-container">
                    <div class="country-section-header">
                        <h2 class="country-section-title">
                            ${config.title}
                        </h2>
                        <a href="${config.linkUrl}" class="country-section-link">
                            Xem toàn bộ
                            <span class="material-icons-round">chevron_right</span>
                        </a>
                    </div>
                    
                    <div class="country-section-content">
                        <button class="country-scroll-btn" onclick="scrollCountrySection('${config.id}', 'right')">
                            <span class="material-icons-round">chevron_right</span>
                        </button>
                        
                        <div id="${config.id}Loading" class="text-center py-4">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p class="text-gray-400 text-xs">Đang tải...</p>
                        </div>
                        
                        <div id="${config.id}Container" class="country-section-scroll hidden">
                            <!-- Movies will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Create movie card HTML
function createMovieCard(movie) {
    const posterUrl = `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
    const detailUrl = `movie-detail.html?slug=${movie.slug}`;

    // Get episode info
    let episodeInfo = '';
    if (movie.episode_current) {
        episodeInfo = `<span>PĐ. ${movie.episode_current}</span>`;
    }

    return `
        <div class="country-movie-card">
            <div class="country-movie-poster" onclick="window.location.href='${detailUrl}'">
                <img src="${typeof imageOptimizer !== 'undefined' ? imageOptimizer.optimizeImageUrl(movie.thumb_url, 320, 70) : posterUrl}" 
                     alt="${movie.name}" 
                     onerror="this.src='https://via.placeholder.com/240x135?text=No+Image'"
                     loading="lazy" />
                ${episodeInfo ? `
                    <div class="country-movie-badge">
                        ${episodeInfo}
                    </div>
                ` : ''}
            </div>
            <div class="country-movie-info">
                <h3 class="country-movie-title" onclick="window.location.href='${detailUrl}'">${movie.name}</h3>
                <p class="country-movie-subtitle">${movie.origin_name || movie.name}</p>
            </div>
        </div>
    `;
}

// Load movies for a country
async function loadCountryMovies(config) {
    const loadingEl = document.getElementById(`${config.id}Loading`);
    const containerEl = document.getElementById(`${config.id}Container`);

    if (!loadingEl || !containerEl) return;

    try {
        const response = await fetch(config.url, {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items) {
            const movies = data.data.items.slice(0, 10); // Get first 10 movies

            if (movies.length > 0) {
                containerEl.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
                loadingEl.classList.add('hidden');
                containerEl.classList.remove('hidden');
            } else {
                loadingEl.innerHTML = '<p class="text-gray-400">Không có phim nào</p>';
            }
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error(`Error loading ${config.id} movies:`, error);
        loadingEl.innerHTML = '<p class="text-red-400">Không thể tải phim</p>';
    }
}

// Scroll function
function scrollCountrySection(sectionId, direction) {
    const container = document.getElementById(`${sectionId}Container`);
    if (!container) return;

    const scrollAmount = 260; // Card width + gap
    const currentScroll = container.scrollLeft;

    if (direction === 'right') {
        container.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    } else {
        container.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Initialize all country sections
function initCountrySections() {
    // Find the insertion point (before top movies section)
    const topMoviesSection = document.querySelector('section.top-movies-section');

    if (!topMoviesSection) {
        console.error('Top movies section not found');
        return;
    }

    // Create and insert all three sections BEFORE top movies
    const configs = Object.values(COUNTRY_CONFIGS);
    const sectionsHTML = configs
        .map((config, index) => createCountrySection(config, index === 0))
        .join('');

    topMoviesSection.insertAdjacentHTML('beforebegin', sectionsHTML);

    // Load movies for each section
    Object.values(COUNTRY_CONFIGS).forEach(config => {
        loadCountryMovies(config);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountrySections);
} else {
    initCountrySections();
}

// Export for use in other scripts
window.scrollCountrySection = scrollCountrySection;
