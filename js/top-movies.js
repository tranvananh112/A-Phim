// Top Movies Hot Section
async function loadTopMovies() {
    const loading = document.getElementById('topMoviesLoading');
    const container = document.getElementById('topMoviesContainer');

    try {
        // Lấy phim hot từ API - sử dụng phim mới cập nhật và sắp xếp theo view
        const response = await fetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items) {
            // Lấy 10 phim đầu tiên (giả định là hot nhất)
            const topMovies = data.data.items.slice(0, 10);
            renderTopMovies(topMovies);
        } else {
            loading.innerHTML = '<p class="text-gray-400">Không thể tải top phim</p>';
        }
    } catch (error) {
        console.error('Error loading top movies:', error);
        loading.innerHTML = '<p class="text-red-400">Lỗi khi tải top phim</p>';
    }
}

function renderTopMovies(movies) {
    const loading = document.getElementById('topMoviesLoading');
    const container = document.getElementById('topMoviesContainer');

    if (loading) loading.classList.add('hidden');
    if (container) container.classList.remove('hidden');

    if (!container) return;

    const movieLinks = JSON.parse(localStorage.getItem('movieLinks') || '{}');

    container.innerHTML = movies.map((movie, index) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;
        const hasCustomLink = !!movieLinks[movie.slug];
        const linkUrl = hasCustomLink ? `watch-simple.html?slug=${movie.slug}` : `movie-detail.html?slug=${movie.slug}`;

        // Xác định kích thước card - giảm kích thước để gần nhau hơn
        const cardWidth = isTop3 ? 'w-56' : 'w-48';
        const rankClass = isTop3 ? 'rank-number-top text-7xl' : 'rank-number text-5xl';
        const posterClass = isTop3 ? 'poster-top-glow' : 'border border-slate-800';
        const titleClass = isTop3 ? 'text-primary drop-shadow-[0_0_2px_rgba(255,215,0,0.5)]' : 'group-hover:text-primary';

        return `
            <div class="flex-none ${cardWidth} group snap-start relative transform hover:-translate-y-2 transition-transform duration-300">
                <a href="${linkUrl}">
                    <div class="relative aspect-[2/3] overflow-hidden rounded-xl mb-4 cursor-pointer ${posterClass}">
                        <img alt="${movie.name}" 
                            class="w-full h-full object-cover" 
                            src="https://img.ophim.live/uploads/movies/${movie.thumb_url}"
                            onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'" />
                        <div class="absolute inset-0 poster-overlay"></div>
                        
                        <!-- Top Badge -->
                        <div class="absolute top-0 right-0 ${isTop3 ? 'bg-primary' : 'bg-primary/80'} text-black font-black px-3 py-1 rounded-bl-xl text-base shadow-lg">
                            TOP ${rank}
                        </div>
                        
                        <!-- Episode Info -->
                        <div class="absolute bottom-3 left-3 flex gap-2">
                            ${movie.quality ? `
                            <span class="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border ${isTop3 ? 'border-primary/50 text-primary' : 'border-white/10'} uppercase">
                                ${movie.quality}
                            </span>` : ''}
                            ${movie.episode_current ? `
                            <span class="${isTop3 ? 'bg-primary/80 text-black' : 'bg-blue-500/80 text-white'} backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                ${movie.episode_current}
                            </span>` : ''}
                        </div>
                    </div>
                    
                    <!-- Movie Info -->
                    <div class="flex items-start gap-3 relative">
                        <span class="${rankClass} font-black italic ${isTop3 ? '' : 'text-slate-500/50'} leading-none absolute -left-5 ${isTop3 ? '-top-16' : '-top-14'} z-10 drop-shadow-xl">
                            ${rank}
                        </span>
                        <div class="space-y-1 ${isTop3 ? 'pl-10 pt-1' : 'pl-8'}">
                            <h3 class="font-bold ${isTop3 ? 'text-base' : 'text-sm'} line-clamp-1 ${titleClass} transition-colors">
                                ${movie.name}
                            </h3>
                            <p class="text-xs text-slate-300 line-clamp-1 italic">
                                ${movie.origin_name || ''}
                            </p>
                            <div class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase">
                                <span class="${isTop3 ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-slate-800 text-slate-300'} px-1.5 py-0.5 rounded">
                                    ${movie.lang || 'Vietsub'}
                                </span>
                                <span>• ${movie.year || 'N/A'}</span>
                                ${movie.tmdb?.vote_average ? `
                                <span class="flex items-center gap-0.5 text-yellow-500">
                                    <span class="material-icons-round text-[10px]">star</span>
                                    ${movie.tmdb.vote_average.toFixed(1)}
                                </span>` : ''}
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}

// Scroll buttons
function setupTopMoviesScroll() {
    const container = document.getElementById('topMoviesContainer');
    const leftBtn = document.getElementById('topMoviesScrollLeft');
    const rightBtn = document.getElementById('topMoviesScrollRight');

    if (!container || !leftBtn || !rightBtn) return;

    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -300, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTopMovies();
    setupTopMoviesScroll();
});
