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

    // Update Favorite & Info buttons logic
    setupHeroActions(movie);

    // Hiển thị chữ ngay lập tức, không chờ ảnh
    showHeroText();

    // Fetch số tập mới nhất từ API chi tiết (chạy ngầm, không block UI)
    fetchLatestEpisodeCount(movie);

    if (heroImage) {
        // Use optimized image URL (1200px width for hero)
        const rawImageUrl = movie.poster_url || movie.thumb_url;
        const optimizedUrl = movieAPI.getImageURL(rawImageUrl, 1200, 90, true);

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

// Setup logic for Favorite & Info buttons on Hero Banner
function setupHeroActions(movie) {
    const favBtn = document.getElementById('heroFavBtn');
    const infoBtn = document.getElementById('heroInfoBtn');
    
    if (!movie) return;

    // 1. Setup Info Button Link
    if (infoBtn) {
        infoBtn.href = `movie-detail.html?slug=${movie.slug}`;
    }

    // 2. Setup Favorite Button Logic
    if (favBtn && typeof userService !== 'undefined') {
        const icon = favBtn.querySelector('span');
        
        // Initial state update
        const updateFavUI = () => {
            const isFav = userService.isFavorite(movie.slug);
            if (icon) {
                icon.textContent = isFav ? 'favorite' : 'favorite_border';
                if (isFav) {
                    icon.classList.add('text-red-500');
                    icon.classList.remove('text-white/90');
                } else {
                    icon.classList.remove('text-red-500');
                    icon.classList.add('text-white/90');
                }
            }
        };

        updateFavUI();

        // Handle Click
        favBtn.onclick = (e) => {
            e.preventDefault();
            
            // Check login first
            if (typeof authService !== 'undefined' && !authService.isLoggedIn()) {
                if (typeof showAuthModal === 'function') {
                    showAuthModal('login');
                } else {
                    alert('Vui lòng đăng nhập để lưu phim');
                }
                return;
            }

            if (userService.isFavorite(movie.slug)) {
                userService.removeFromFavorites(movie.slug);
                if (typeof showNotification === 'function') {
                    showNotification('Đã xóa khỏi danh sách yêu thích', 'info');
                }
            } else {
                userService.addToFavorites({
                    slug: movie.slug,
                    name: movie.name,
                    thumb_url: movie.thumb_url,
                    year: movie.year || movie.release_date || ''
                });
                if (typeof showNotification === 'function') {
                    showNotification('Đã thêm vào danh sách yêu thích', 'success');
                }
            }
            
            updateFavUI();
        };
    }
}

function renderThumbnails(movies) {
    const thumbnailsContainer = document.getElementById('heroThumbnails');
    if (!thumbnailsContainer || !Array.isArray(movies) || movies.length === 0) return;

    thumbnailsContainer.innerHTML = movies.map((movie, index) => `
        <div class="relative flex-shrink-0 group cursor-pointer ${index === 0 ? 'active-hero-thumb' : 'opacity-60'} hover:opacity-100 transition-all duration-300 snap-start">
            <a href="movie-detail.html?slug=${movie.slug}" class="block">
                <div class="w-14 md:w-16 lg:w-20 aspect-[2/3] rounded-lg overflow-hidden 
                    ${index === 0 ? 'scale-105' : ''} 
                    transition-all duration-300 bg-gray-900">
                    <img alt="${movie.name}"
                        class="w-full h-full object-cover object-center transition-transform duration-500"
                        src="${typeof imageOptimizer !== 'undefined' ? imageOptimizer.optimizeImageUrl(movie.thumb_url || movie.poster_url, 300, 70) : `https://img.ophim.live/uploads/movies/${movie.thumb_url || movie.poster_url}`}"
                        onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'"
                        loading="lazy" />
                </div>
            </a>
        </div>
    `).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHeroBanner();
});
