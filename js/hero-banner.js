// Hero Banner Dynamic Content
let currentHeroMovie = null;
let vietnamMoviesForThumbnails = [];

async function loadHeroBanner() {
    let isInitialLoad = true;

    // 1. NGAY LẬP TỨC: Load từ cache LocalStorage để hiện ngay trong chớp mắt
    try {
        const cachedBanners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');
        const activeCached = cachedBanners.find(b => b.isActive);
        if (activeCached) {
            currentHeroMovie = convertBannerToMovie(activeCached);
            // Render tức thì không cần chờ mạng
            renderHeroBanner(currentHeroMovie, true);
        } else {
            // Nếu cache trống, gọi ngay fallback để trang không bị đơ chờ Firebase
            loadFallbackBanner();
        }
    } catch (e) {
        console.warn('Cache read error:', e);
        loadFallbackBanner();
    }

    // 2. BACKGROUND: Load Firebase và đồng bộ dữ liệu mới nhất (chạy ngầm)
    try {
        // Dùng dynamic import để kết nối Cấu hình Firebase
        const fb = await import('/js/firebase-banners.js');
        
        fb.listenToBanners(async (banners) => {
            // Lưu dữ liệu mới về bộ nhớ đệm
            if (banners && banners.length > 0) {
                localStorage.setItem('cinestream_banners', JSON.stringify(banners));
            }
            
            // Cập nhật giao diện nếu có thay đổi từ Firebase
            const activeBanner = banners?.find(b => b.isActive);
            if (activeBanner) {
                // Kiểm tra xem có khác với cái đã render (từ cache) không để tránh chớp giật
                const newMovie = convertBannerToMovie(activeBanner);
                if (!currentHeroMovie || currentHeroMovie.slug !== newMovie.slug) {
                    currentHeroMovie = newMovie;
                    renderHeroBanner(currentHeroMovie, false);
                }
            } else {
                // Không có banner được chọn, load fallback từ API
                if (isInitialLoad && !currentHeroMovie) await loadFallbackBanner();
            }
            isInitialLoad = false;
        });
    } catch (error) {
        console.error('Error with Firebase Banners, fallback to localStorage/API:', error);
        if (!currentHeroMovie) {
            await loadFallbackBanner();
        }
    }

    // Load phim Việt Nam cho thumbnails mượt mà chạy ngầm
    setTimeout(loadVietnameseThumbnails, 100);
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

// Convert banner from localStorage to movie format
function convertBannerToMovie(banner) {
    return {
        slug: banner.slug,
        name: banner.name,
        origin_name: banner.origin_name,
        thumb_url: banner.thumb_url,
        poster_url: banner.poster_url,
        content: banner.content,
        year: banner.year,
        quality: banner.quality,
        lang: banner.lang,
        episode_current: banner.episode_current,
        category: banner.category || [],
        tmdb: banner.tmdb || {},
        imdb: banner.imdb || {}
    };
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
        const newImageUrl = `https://img.ophim.live/uploads/movies/${movie.poster_url || movie.thumb_url}`;

        if (heroImage.src !== newImageUrl) {
            heroImage.style.opacity = '0'; // Chuẩn bị fade in
            
            if (isInstant) {
                // Nếu là load từ cache, gán link luôn (nếu ảnh đã có trong cache trình duyệt sẽ lên ngay)
                heroImage.src = newImageUrl;
                showHeroImage();
            } else {
                // Preload ảnh mới
                const img = new Image();
                img.onload = () => {
                    heroImage.src = newImageUrl;
                    showHeroImage();
                };
                img.onerror = () => {
                    heroImage.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920';
                    showHeroImage();
                };
                img.src = newImageUrl;
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

        // Lấy số tập thực tế từ danh sách tập (lấy server đầu tiên)
        let latestEpLabel = item.episode_current || '';
        const episodes = item.episodes;
        if (Array.isArray(episodes) && episodes.length > 0) {
            const serverData = episodes[0]?.server_data;
            if (Array.isArray(serverData) && serverData.length > 0) {
                const count = serverData.length;
                // Nếu API trả về số tập nhiều hơn episode_current → dùng số tập thực
                const match = latestEpLabel.match(/\d+/);
                const storedNum = match ? parseInt(match[0]) : 0;
                if (count > storedNum) {
                    latestEpLabel = `Tập ${count}`;
                }
            }
        }

        if (!latestEpLabel) return;

        // Cập nhật badge tập phim trực tiếp (không re-render toàn bộ)
        const badge = document.querySelector('#heroBadges [data-ep-badge]');
        if (badge && badge.textContent !== latestEpLabel) {
            badge.textContent = latestEpLabel;
            badge.style.display = ''; // Đảm bảo hiển thị
        }
    } catch (e) {
        // Silent fail — không ảnh hưởng giao diện
    }
}

function renderThumbnails() {
    const thumbnailsContainer = document.getElementById('heroThumbnails');
    if (!thumbnailsContainer || vietnamMoviesForThumbnails.length === 0) return;

    thumbnailsContainer.innerHTML = vietnamMoviesForThumbnails.map((movie, index) => `
        <div class="relative flex-shrink-0 group cursor-pointer ${index === 0 ? 'opacity-100' : 'opacity-70'} hover:opacity-100 transition-all hover:scale-105 snap-start">
            <a href="movie-detail.html?slug=${movie.slug}" class="flex items-center gap-2 md:gap-3">
                <!-- Poster Image -->
                <div class="flex-shrink-0 w-20 sm:w-24 md:w-28 aspect-[2/3] rounded-md md:rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-primary shadow-[0_0_15px_rgba(252,211,77,0.3)]' : 'border-white/20'} bg-gray-800 relative">
                    <img alt="${movie.name}"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src="https://img.ophim.live/uploads/movies/${movie.thumb_url}"
                        onerror="this.src='https://via.placeholder.com/320x180?text=No+Image'" />
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
