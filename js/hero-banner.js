// Hero Banner Dynamic Content - MongoDB API Version
let currentHeroMovie = null;
let vietnamMoviesForThumbnails = [];

async function loadHeroBanner() {
    let isInitialLoad = true;

    // 1. NGAY LẬP TỨC: Load từ cache LocalStorage để hiện ngay trong chớp mắt
    try {
        const cachedBanner = localStorage.getItem('cinestream_active_banner');
        if (cachedBanner) {
            const activeCached = JSON.parse(cachedBanner);
            currentHeroMovie = convertBannerToMovie(activeCached);
            // Render tức thì từ cache
            renderHeroBanner(currentHeroMovie, true);
        } else {
            console.log('Chờ Backend MongoDB nạp banner...');
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }

    // 2. BACKGROUND: Load từ API Backend
    try {
        const apiUrl = (typeof getBackendBaseURL === 'function') ? window.getBackendBaseURL() : '';
        if (!apiUrl) throw new Error('API Base URL not defined');
        
        const response = await fetch(`${apiUrl}/api/banners/active`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const activeBanner = data.data;
            localStorage.setItem('cinestream_active_banner', JSON.stringify(activeBanner));
            
            const newMovie = convertBannerToMovie(activeBanner);
            if (!currentHeroMovie || currentHeroMovie.slug !== newMovie.slug) {
                currentHeroMovie = newMovie;
                renderHeroBanner(currentHeroMovie, false);
            }
        } else {
            // Không có banner nào được kích hoạt
            localStorage.removeItem('cinestream_active_banner');
            if (!currentHeroMovie) await loadFallbackBanner();
        }
    } catch (error) {
        console.error('Lỗi khi fetch active banner từ backend:', error);
        if (!currentHeroMovie) await loadFallbackBanner();
    }

    // Load thumbnail movies cho dải phim nhỏ, chạy ngầm
    setTimeout(loadThumbnailMovies, 100);
}

// Fallback: Load từ API nếu không có banner trong DB
async function loadFallbackBanner() {
    try {
        const response = await fetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items && data.data.items.length > 0) {
            currentHeroMovie = data.data.items[0];
            renderHeroBanner(currentHeroMovie, false);
        } else {
            if (!currentHeroMovie) showHeroContent();
        }
    } catch (error) {
        console.error('Error loading fallback banner:', error);
        if (!currentHeroMovie) showHeroContent();
    }
}

// Convert banner from backend API format to movie format
function convertBannerToMovie(banner) {
    return {
        slug: banner.movieSlug || banner.slug,
        name: banner.name,
        origin_name: banner.originName || banner.origin_name,
        thumb_url: banner.thumbUrl || banner.thumb_url,
        poster_url: banner.posterUrl || banner.poster_url,
        content: banner.content,
        year: banner.year,
        quality: banner.quality,
        lang: banner.lang,
        episode_current: banner.episodeCurrent || banner.episode_current,
        category: banner.category || [],
        tmdb: banner.tmdb || {},
        imdb: banner.imdb || {}
    };
}

async function loadThumbnailMovies() {
    // 1. Instant render từ cache để tránh màn hình trắng
    try {
        const cached = localStorage.getItem('cinestream_thumbnail_movies');
        if (cached) {
            const movies = JSON.parse(cached);
            if (Array.isArray(movies) && movies.length > 0) {
                renderThumbnails(convertThumbnailsFromAPI(movies));
            }
        }
    } catch (e) {}

    // 2. Fetch fresh từ backend
    try {
        const apiUrl = (typeof getBackendBaseURL === 'function') ? window.getBackendBaseURL() : '';
        if (!apiUrl) throw new Error('API Base URL not defined');
                    
        const res = await fetch(`${apiUrl}/api/banners/thumbnails`);
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
            const movies = convertThumbnailsFromAPI(data.data);
            localStorage.setItem('cinestream_thumbnail_movies', JSON.stringify(data.data));
            renderThumbnails(movies);
            return;
        }
    } catch (error) {
        console.warn('Không thể tải thumbnail từ API, dùng fallback VN:', error);
    }

    // 3. Fallback: 10 phim Việt Nam nếu admin chưa cấu hình
    loadVietnameseThumbnailsFallback();
}

// Chuyển format thumbnail từ API (Banner model) sang format phim Ophim
function convertThumbnailsFromAPI(banners) {
    return banners.map(b => ({
        slug: b.movieSlug,
        name: b.name,
        origin_name: b.originName,
        thumb_url: b.thumbUrl,
        poster_url: b.posterUrl,
        year: b.year,
        tmdb: b.tmdb || {}
    }));
}

async function loadVietnameseThumbnailsFallback() {
    try {
        const response = await fetch('https://ophim1.com/v1/api/quoc-gia/viet-nam?page=1', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items) {
            renderThumbnails(data.data.items.slice(0, 10));
        }
    } catch (error) {
        console.error('Error loading Vietnamese movies fallback:', error);
    }
}

function showHeroText() {
    const heroContent = document.getElementById('heroContent');
    if (heroContent) {
        heroContent.style.opacity = '1';
    }
}

function showHeroImage() {
    const heroImage = document.getElementById('heroImage');
    const skeleton = document.getElementById('heroImageSkeleton');
    if (heroImage) {
        heroImage.style.opacity = '1';
    }
    if (skeleton) {
        setTimeout(() => {
            skeleton.style.display = 'none';
        }, 300);
    }
}

function renderHeroBanner(movie, isInstant = false) {
    const heroImage = document.getElementById('heroImage');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroBadges = document.getElementById('heroBadges');
    const heroGenres = document.getElementById('heroGenres');
    const heroDescription = document.getElementById('heroDescription');
    const heroPlayBtn = document.getElementById('heroPlayBtn');

    // Update text content immediately
    if (heroTitle) heroTitle.textContent = movie.name;
    if (heroSubtitle) heroSubtitle.textContent = movie.origin_name || '';

    if (heroBadges) {
        const rating = movie.tmdb?.vote_average ? movie.tmdb.vote_average.toFixed(1) : 'N/A';
        heroBadges.innerHTML = `
            <span class="border border-primary text-primary px-3 py-1 rounded bg-black/40 backdrop-blur-sm font-semibold">IMDb ${rating}</span>
            <span class="border border-white/30 px-3 py-1 rounded bg-black/20 backdrop-blur-sm">${movie.year || '2024'}</span>
            ${movie.episode_current ? `<span data-ep-badge class="border border-white/30 px-3 py-1 rounded bg-black/20 backdrop-blur-sm">${movie.episode_current}</span>` : '<span data-ep-badge class="border border-white/30 px-3 py-1 rounded bg-black/20 backdrop-blur-sm"></span>'}
            <span class="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs uppercase ml-2">${movie.quality || 'HD'}</span>
        `;
    }

    if (heroGenres && movie.category) {
        heroGenres.innerHTML = movie.category.slice(0, 5).map(cat => `
            <button class="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm text-gray-200 transition-colors border border-white/10">
                ${cat.name}
            </button>
        `).join('');
    }

    if (heroDescription) {
        heroDescription.textContent = movie.content ?
            movie.content.replace(/<[^>]*>/g, '').substring(0, 250) + '...' :
            'Khám phá bộ phim đặc sắc này ngay hôm nay!';
    }

    if (heroPlayBtn) heroPlayBtn.href = `movie-detail.html?slug=${movie.slug}`;

    // Hiển thị chữ ngay lập tức, không chờ ảnh
    showHeroText();

    // Fetch số tập mới nhất từ API chi tiết (chạy ngầm, không block UI)
    fetchLatestEpisodeCount(movie);

    if (heroImage) {
        // Use optimized image URL (1200px width for hero)
        const rawImageUrl = movie.poster_url || movie.thumb_url;
        const optimizedUrl = typeof imageOptimizer !== 'undefined' ? 
            imageOptimizer.optimizeImageUrl(rawImageUrl, 1200, 85) : 
            `https://img.ophim.live/uploads/movies/${rawImageUrl}`;

        if (heroImage.src !== optimizedUrl) {
            // Set priority high for current hero image
            heroImage.fetchPriority = 'high';
            
            // Set source immediately to start loading ASAP
            // We keep the old image until next one is ready to avoid flash,
            // or show skeleton if it's the first load
            if (isInstant) {
                heroImage.src = optimizedUrl;
                heroImage.onload = () => showHeroImage();
            } else {
                heroImage.style.opacity = '0.3'; // Subtle fade while switching
                const transitionImg = new Image();
                transitionImg.onload = () => {
                    heroImage.src = optimizedUrl;
                    showHeroImage();
                };
                transitionImg.src = optimizedUrl;
            }
        } else {
            showHeroImage();
        }
    }
}

// Fetch số tập mới nhất từ API chi tiết phim để cập nhật badge
async function fetchLatestEpisodeCount(movie) {
    if (!movie || !movie.slug) return;
    try {
        const res = await fetch(`https://ophim1.com/v1/api/phim/${movie.slug}`, {
            headers: { 'accept': 'application/json' }
        });
        const data = await res.json();
        if (data.status !== 'success' || !data.data?.item) return;

        const item = data.data.item;

        let latestEpLabel = item.episode_current || '';
        const episodes = item.episodes;
        if (Array.isArray(episodes) && episodes.length > 0) {
            const serverData = episodes[0]?.server_data;
            if (Array.isArray(serverData) && serverData.length > 0) {
                const count = serverData.length;
                const match = latestEpLabel.match(/\d+/);
                const storedNum = match ? parseInt(match[0]) : 0;
                if (count > storedNum) {
                    latestEpLabel = `Tập ${count}`;
                }
            }
        }

        if (!latestEpLabel) return;

        const badge = document.querySelector('#heroBadges [data-ep-badge]');
        if (badge && badge.textContent !== latestEpLabel) {
            badge.textContent = latestEpLabel;
            badge.style.display = ''; 
        }
    } catch (e) {
        // Silent fail
    }
}

function renderThumbnails(movies) {
    const thumbnailsContainer = document.getElementById('heroThumbnails');
    if (!thumbnailsContainer || !Array.isArray(movies) || movies.length === 0) return;

    thumbnailsContainer.innerHTML = movies.map((movie, index) => `
        <div class="relative flex-shrink-0 group cursor-pointer ${index === 0 ? 'opacity-100' : 'opacity-70'} hover:opacity-100 transition-all hover:scale-105 snap-start">
            <a href="movie-detail.html?slug=${movie.slug}" class="flex items-center gap-2 md:gap-3">
                <!-- Poster Image -->
                <div class="flex-shrink-0 w-20 sm:w-24 md:w-28 aspect-[2/3] rounded-md md:rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-primary shadow-[0_0_15px_rgba(252,211,77,0.3)]' : 'border-white/20'} bg-gray-800 relative">
                    <img alt="${movie.name}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src="${typeof imageOptimizer !== 'undefined' ? imageOptimizer.optimizeImageUrl(movie.thumb_url, 300, 70) : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`}"
                        onerror="this.src='https://via.placeholder.com/320x180?text=No+Image'"
                        loading="lazy" />
                    ${index === 0 ? `
                    <!-- Trailer Badge -->
                    <div class="absolute top-1 left-1 md:top-1.5 md:left-1.5 bg-primary text-black text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded shadow-lg z-20 uppercase tracking-wider">
                        Trailer
                    </div>
                    <!-- Play Icon -->
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span class="material-icons-round text-white text-2xl md:text-3xl opacity-80">play_circle</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Movie Info next to poster -->
                <div class="flex flex-col justify-center min-w-0 pr-2">
                    <p class="text-[11px] md:text-xs text-white font-semibold truncate mb-0.5 max-w-[120px] md:max-w-[150px]">${movie.name}</p>
                    <p class="text-[9px] md:text-[10px] text-gray-400 truncate max-w-[120px] md:max-w-[150px]">${movie.origin_name || movie.name}</p>
                    <div class="flex items-center gap-1.5 mt-0.5 text-[9px] md:text-[10px] text-gray-300">
                        <span>${movie.year || 'N/A'}</span>
                        ${movie.tmdb?.vote_average ? `
                        <span>•</span>
                        <span class="flex items-center gap-0.5 text-yellow-500 font-bold">
                            <span class="material-icons-round text-[10px] md:text-xs">star</span>
                            ${movie.tmdb.vote_average.toFixed(1)}
                        </span>
                        ` : ''}
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
