// Horror Section - Load phim kinh dị từ API (giống search.html)
console.log('[Horror] Script loaded!');

(function () {
    'use strict';

    async function loadHorrorMovies() {
        console.log('[Horror] loadHorrorMovies() called');

        const container = document.getElementById('horrorBannerContainer');

        if (!container) {
            console.error('[Horror] Container NOT FOUND!');
            return;
        }

        console.log('[Horror] Container found!');

        try {
            // Sử dụng movieAPI.getMoviesFromMultipleSources() giống search.html
            console.log('[Horror] Loading horror movies using movieAPI...');

            const data = await movieAPI.getMoviesFromMultipleSources(1, 'kinh-di');
            console.log('[Horror] Data received:', data);

            if (data && data.status === 'success' && data.data && data.data.items) {
                const movies = data.data.items.slice(0, 15);
                console.log('[Horror] Found', movies.length, 'horror movies');
                console.log('[Horror] First movie:', movies[0]);
                renderHorrorBanner(movies[0], movies);
            } else {
                console.error('[Horror] Invalid data structure:', data);
                showError();
            }
        } catch (error) {
            console.error('[Horror] Error:', error);
            showError();
        }
    }

    let currentActiveIndex = 0; // Track active thumbnail

    function renderHorrorBanner(mainMovie, allMovies, activeIndex = 0) {
        console.log('[Horror] renderHorrorBanner() called');
        currentActiveIndex = activeIndex;

        const container = document.getElementById('horrorBannerContainer');
        if (!container) {
            console.error('[Horror] Container not found in render');
            return;
        }

        const posterUrl = mainMovie.poster_url
            ? (mainMovie.poster_url.startsWith('http') ? mainMovie.poster_url : 'https://img.ophim.live/uploads/movies/' + mainMovie.poster_url)
            : (mainMovie.thumb_url
                ? (mainMovie.thumb_url.startsWith('http') ? mainMovie.thumb_url : 'https://img.ophim.live/uploads/movies/' + mainMovie.thumb_url)
                : 'https://via.placeholder.com/1920x1080?text=No+Image');
        const title = mainMovie.name || 'Phim Kinh Dị';
        const originName = mainMovie.origin_name || '';
        const year = mainMovie.year || '2024';
        const quality = mainMovie.quality || 'HD';
        const lang = mainMovie.lang || 'Vietsub';
        const description = mainMovie.content || 'Một bộ phim kinh dị đầy ám ảnh...';

        const html = `
            <section class="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl bg-slate-800">
                <img 
                    alt="${title}" 
                    class="absolute inset-0 w-full h-full object-cover object-center scale-105" 
                    src="${posterUrl}"
                    onerror="this.src='https://via.placeholder.com/1920x1080?text=No+Image'"
                />
                
                <div class="absolute inset-0 horror-banner-gradient"></div>
                <div class="absolute inset-0 horror-banner-overlay"></div>
                
                <div class="relative z-10 h-full flex flex-col justify-end px-8 md:px-16 max-w-4xl pb-56 md:pb-60">
                    <h2 class="font-cursive text-3xl md:text-5xl text-white mb-2 drop-shadow-lg">${title}</h2>
                    ${originName ? `<h3 class="text-primary text-base md:text-lg font-semibold mb-3 uppercase tracking-wider">${originName}</h3>` : ''}
                    
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="horror-glass-tag px-2 py-1 rounded text-xs font-bold text-primary">${quality}</span>
                        <span class="horror-glass-tag px-2 py-1 rounded text-xs font-medium border border-white/20">${year}</span>
                        <span class="horror-glass-tag px-2 py-1 rounded text-xs font-medium border border-white/20">${lang}</span>
                    </div>
                    
                    <p class="text-slate-200 text-xs md:text-sm leading-relaxed line-clamp-2 mb-4 max-w-2xl">
                        ${stripHtml(description).substring(0, 150)}...
                    </p>
                    
                    <div class="flex items-center gap-3">
                        <a href="movie-detail.html?slug=${mainMovie.slug}" 
                           class="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                            <span class="material-icons text-black text-2xl ml-1">play_arrow</span>
                        </a>
                        <a href="movie-detail.html?slug=${mainMovie.slug}"
                           class="w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <span class="material-icons text-white text-lg">info_outline</span>
                        </a>
                    </div>
                </div>
                
                <div class="absolute bottom-6 left-0 right-0 px-8 md:px-16 horror-thumbnails-container">
                    <div class="flex items-center gap-3 horror-thumbnail-scroll pb-2">
                        ${allMovies.map((movie, index) => {
            let movieThumb = movie.thumb_url || movie.poster_url || '';
            // Thêm base URL nếu chưa có
            if (movieThumb && !movieThumb.startsWith('http')) {
                movieThumb = 'https://img.ophim.live/uploads/movies/' + movieThumb;
            }
            if (!movieThumb) {
                movieThumb = 'https://via.placeholder.com/300x450?text=No+Image';
            }
            const isActive = index === activeIndex;
            return `
                                <div class="flex-shrink-0 ${isActive ? 'w-24 h-32 md:w-28 md:h-40 horror-thumbnail-active' : 'w-20 h-28 md:w-24 md:h-36 opacity-60'} rounded-xl overflow-hidden horror-thumbnail cursor-pointer transition-all duration-300"
                                     data-movie-index="${index}">
                                    <img 
                                        alt="${movie.name || 'Phim'}" 
                                        class="w-full h-full object-cover" 
                                        src="${movieThumb}"
                                        onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"
                                    />
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        console.log('[Horror] Banner rendered!');

        setupThumbnailHandlers(allMovies);
    }

    function setupThumbnailHandlers(movies) {
        const thumbnails = document.querySelectorAll('.horror-thumbnail');
        console.log('[Horror] Setting up', thumbnails.length, 'thumbnail handlers');

        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                console.log('[Horror] Clicked thumbnail', index);
                renderHorrorBanner(movies[index], movies, index);
            });
        });
    }

    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function showError() {
        const container = document.getElementById('horrorBannerContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-20 bg-slate-900/50 rounded-3xl">
                <span class="material-icons text-red-500 text-6xl mb-4">error_outline</span>
                <p class="text-red-500 mb-4 text-lg">Không thể tải phim kinh dị</p>
                <p class="text-gray-400 mb-6 text-sm">Vui lòng thử lại sau</p>
                <button onclick="location.reload()" class="px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors font-semibold">
                    Thử lại
                </button>
            </div>
        `;
    }

    // Initialize - đợi movieAPI load xong
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Đợi một chút để movieAPI được khởi tạo
            setTimeout(loadHorrorMovies, 500);
        });
    } else {
        setTimeout(loadHorrorMovies, 500);
    }

})();
