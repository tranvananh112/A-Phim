// Hero Banner Dynamic Content
let currentHeroMovie = null;
let vietnamMoviesForThumbnails = [];

async function loadHeroBanner() {
    try {
        // Load phim hot từ API
        const response = await fetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items && data.data.items.length > 0) {
            // Lấy phim đầu tiên làm hero
            currentHeroMovie = data.data.items[0];
            renderHeroBanner(currentHeroMovie);
        }
    } catch (error) {
        console.error('Error loading hero banner:', error);
        // Show content even if API fails
        showHeroContent();
    }

    // Load phim Việt Nam cho thumbnails
    loadVietnameseThumbnails();
}

async function loadVietnameseThumbnails() {
    try {
        const response = await fetch('https://ophim1.com/v1/api/quoc-gia/viet-nam?page=1', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items) {
            vietnamMoviesForThumbnails = data.data.items.slice(0, 10);
            renderThumbnails();
        }
    } catch (error) {
        console.error('Error loading Vietnamese movies:', error);
    }
}

function showHeroContent() {
    // Fade in content
    const heroContent = document.getElementById('heroContent');
    if (heroContent) {
        heroContent.style.opacity = '1';
    }

    // Fade in image and hide skeleton
    const heroImage = document.getElementById('heroImage');
    const skeleton = document.getElementById('heroImageSkeleton');
    if (heroImage) {
        heroImage.style.opacity = '1';
    }
    if (skeleton) {
        setTimeout(() => {
            skeleton.style.display = 'none';
        }, 700);
    }
}

function renderHeroBanner(movie) {
    const heroImage = document.getElementById('heroImage');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroBadges = document.getElementById('heroBadges');
    const heroGenres = document.getElementById('heroGenres');
    const heroDescription = document.getElementById('heroDescription');
    const heroPlayBtn = document.getElementById('heroPlayBtn');

    // Update title first (instant)
    if (heroTitle) {
        heroTitle.textContent = movie.name;
    }

    // Update subtitle (origin name)
    if (heroSubtitle) {
        heroSubtitle.textContent = movie.origin_name || '';
    }

    // Update badges
    if (heroBadges) {
        const rating = movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : 'N/A';
        heroBadges.innerHTML = `
            <span class="border border-primary text-primary px-3 py-1 rounded bg-black/40 backdrop-blur-sm font-semibold">IMDb ${rating}</span>
            <span class="border border-white/30 px-3 py-1 rounded bg-black/20 backdrop-blur-sm">${movie.year || '2024'}</span>
            ${movie.episode_current ? `<span class="border border-white/30 px-3 py-1 rounded bg-black/20 backdrop-blur-sm">${movie.episode_current}</span>` : ''}
            <span class="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs uppercase ml-2">${movie.quality || 'HD'}</span>
        `;
    }

    // Update genres
    if (heroGenres && movie.category) {
        heroGenres.innerHTML = movie.category.slice(0, 5).map(cat => `
            <button class="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm text-gray-200 transition-colors border border-white/10">
                ${cat.name}
            </button>
        `).join('');
    }

    // Update description
    if (heroDescription) {
        heroDescription.textContent = movie.content ?
            movie.content.replace(/<[^>]*>/g, '').substring(0, 250) + '...' :
            'Khám phá bộ phim đặc sắc này ngay hôm nay!';
    }

    // Update play button link
    if (heroPlayBtn) {
        heroPlayBtn.href = `movie-detail.html?slug=${movie.slug}`;
    }

    // Preload image and wait for it to load before showing
    if (heroImage) {
        const newImageUrl = `https://img.ophim.live/uploads/movies/${movie.poster_url || movie.thumb_url}`;

        // Create a new image to preload
        const img = new Image();
        img.onload = () => {
            // Image loaded successfully, now update and show
            heroImage.src = newImageUrl;
            showHeroContent();
        };
        img.onerror = () => {
            // If image fails to load, still show content with fallback
            heroImage.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920';
            showHeroContent();
        };
        // Start loading the image
        img.src = newImageUrl;
    } else {
        // No image element, just show content
        showHeroContent();
    }
}

function renderThumbnails() {
    const thumbnailsContainer = document.getElementById('heroThumbnails');
    if (!thumbnailsContainer || vietnamMoviesForThumbnails.length === 0) return;

    thumbnailsContainer.innerHTML = vietnamMoviesForThumbnails.map((movie, index) => `
        <div class="relative flex-shrink-0 w-32 sm:w-36 md:w-40 group cursor-pointer ${index === 0 ? 'opacity-100' : 'opacity-70'} hover:opacity-100 transition-all hover:scale-105 snap-start">
            <a href="movie-detail.html?slug=${movie.slug}">
                <div class="aspect-video rounded-md md:rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-primary shadow-[0_0_15px_rgba(252,211,77,0.3)]' : 'border-white/20'} bg-gray-800 relative">
                    <img alt="${movie.name}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src="https://img.ophim.live/uploads/movies/${movie.thumb_url}"
                        onerror="this.src='https://via.placeholder.com/320x180?text=No+Image'" />
                    ${index === 0 ? `
                    <!-- Trailer Badge -->
                    <div class="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-primary text-black text-[9px] md:text-[11px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded shadow-lg z-20 uppercase tracking-wider">
                        Trailer
                    </div>
                    <!-- Play Icon -->
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span class="material-icons-round text-white text-3xl md:text-4xl opacity-80">play_circle</span>
                    </div>
                    ` : ''}
                    <!-- Movie Title -->
                    <div class="absolute bottom-0 left-0 w-full p-1.5 md:p-2 bg-gradient-to-t from-black/90 to-transparent">
                        <p class="text-[9px] md:text-[10px] text-white font-medium truncate">${movie.name}</p>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHeroBanner();
});
