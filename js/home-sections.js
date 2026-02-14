// Load and render all movie sections from home API

async function loadHomeMovies() {
    try {
        const response = await fetch('https://ophim1.com/v1/api/home', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();
        console.log('Home API data:', data);

        if (data.status === 'success' && data.data && data.data.items) {
            const sections = data.data.items;

            // Render all sections
            renderAllSections(sections);

            // Find and render Vietnamese movies section
            const vietnamSection = sections.find(section =>
                section.slug === 'viet-nam' ||
                section.name?.toLowerCase().includes('việt nam')
            );

            if (vietnamSection && vietnamSection.items) {
                renderVietnameseMovies(vietnamSection.items.slice(0, 10));
            } else {
                loadVietnameseMoviesHome();
            }
        }
    } catch (error) {
        console.error('Error loading home movies:', error);
        loadVietnameseMoviesHome();
    }
}

// Render all movie sections
function renderAllSections(sections) {
    const container = document.getElementById('dynamicSections');
    const loading = document.getElementById('sectionsLoading');

    if (!container) {
        console.error('dynamicSections container not found!');
        return;
    }

    console.log('Rendering sections:', sections.length);

    const movieLinks = JSON.parse(localStorage.getItem('movieLinks') || '{}');

    // Filter out Vietnam section (already displayed separately)
    // Lấy TẤT CẢ các sections có phim
    const filteredSections = sections.filter(section => {
        // Log để debug
        console.log('Checking section:', section.name, 'slug:', section.slug, 'has items:', !!section.items);

        // Bỏ qua section Việt Nam (đã hiển thị riêng)
        if (section.slug === 'viet-nam' || section.name?.toLowerCase().includes('việt nam')) {
            return false;
        }

        // Chỉ lấy sections có items
        return section.items && section.items.length > 0;
    });

    console.log('Filtered sections:', filteredSections.length, filteredSections.map(s => s.name));

    // Check if sections have items
    filteredSections.forEach((section, i) => {
        console.log(`Section ${i}: ${section.name}, items:`, section.items?.length || 0);
    });

    // Hide loading
    if (loading) {
        loading.style.display = 'none';
    }

    const html = filteredSections.map((section, index) => {
        const bgClass = index % 2 === 0 ? 'bg-background-dark' : 'bg-gradient-to-b from-background-dark to-surface-dark/30';

        return `
            <section class="py-20 ${bgClass}">
                <div class="container mx-auto px-6">
                    <div class="flex items-center justify-between mb-8">
                        <h2 class="text-3xl font-bold text-white flex items-center gap-3">
                            <span class="w-1.5 h-8 bg-primary rounded-full block shadow-[0_0_10px_rgba(242,242,13,0.5)]"></span>
                            ${section.name || 'Phim'}
                        </h2>
                        ${section.slug ? `
                        <a href="search.html?category=${section.slug}"
                            class="text-primary text-sm font-semibold hover:text-white transition-colors flex items-center gap-1 group">
                            Xem tất cả <span class="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                        ` : ''}
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        ${(section.items || []).slice(0, 10).map(movie => {
            const hasCustomLink = !!movieLinks[movie.slug];
            const linkUrl = hasCustomLink ? `watch-simple.html?slug=${movie.slug}` : `movie-detail.html?slug=${movie.slug}`;

            return `
                                <a href="${linkUrl}"
                                    class="group relative block rounded-xl overflow-hidden bg-surface-dark border border-white/5 hover:border-primary/50 transition-all duration-300">
                                    <div class="aspect-[2/3] w-full overflow-hidden relative">
                                        <img alt="${movie.name}"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            src="https://img.ophim.live/uploads/movies/${movie.thumb_url}"
                                            onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'" />
                                        <div class="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">
                                            ${movie.quality || 'HD'}
                                        </div>
                                        ${movie.episode_current ? `
                                        <div class="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                            ${movie.episode_current}
                                        </div>` : ''}
                                        ${hasCustomLink ? `
                                        <div class="absolute bottom-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                            <span class="material-icons-round text-[10px]">check_circle</span>
                                        </div>` : ''}
                                    </div>
                                    <div class="p-4">
                                        <h3 class="text-white font-semibold truncate group-hover:text-primary transition-colors">
                                            ${movie.name}
                                        </h3>
                                        <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
                                            <span>${movie.year || 'N/A'}</span>
                                            <span class="flex items-center gap-1 text-yellow-500 font-bold">
                                                <span class="material-icons-round text-[10px]">star</span> 
                                                ${movie.tmdb?.vote_average?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            `;
        }).join('')}
                    </div>
                </div>
            </section>
        `;
    }).join('');

    container.innerHTML = html;
    console.log('Sections rendered, HTML length:', html.length);
}

// Fallback function - load Vietnamese movies
async function loadVietnameseMoviesHome() {
    try {
        const response = await fetch('https://ophim1.com/v1/api/quoc-gia/viet-nam?page=1', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items) {
            const movies = data.data.items.slice(0, 10);
            renderVietnameseMovies(movies);
        }
    } catch (error) {
        console.error('Error loading Vietnamese movies:', error);
        const loading = document.getElementById('vietnamLoading');
        if (loading) {
            loading.innerHTML = `<p class="text-red-400">Không thể tải phim Việt Nam</p>`;
        }
    }
}

function renderVietnameseMovies(movies) {
    const loading = document.getElementById('vietnamLoading');
    const grid = document.getElementById('vietnamMoviesGrid');

    if (!loading || !grid) return;

    loading.classList.add('hidden');
    grid.classList.remove('hidden');

    const movieLinks = JSON.parse(localStorage.getItem('movieLinks') || '{}');

    grid.innerHTML = movies.map(movie => {
        const hasCustomLink = !!movieLinks[movie.slug];
        const linkUrl = hasCustomLink ? `watch-simple.html?slug=${movie.slug}` : `movie-detail.html?slug=${movie.slug}`;

        return `
        <a href="${linkUrl}"
            class="group relative block rounded-xl overflow-hidden bg-surface-dark border border-white/5 hover:border-primary/50 transition-all duration-300">
            <div class="aspect-[2/3] w-full overflow-hidden relative">
                <img alt="${movie.name}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src="https://img.ophim.live/uploads/movies/${movie.thumb_url}"
                    onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'" />
                <div class="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">
                    ${movie.quality || 'HD'}
                </div>
                ${movie.episode_current ? `
                <div class="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    ${movie.episode_current}
                </div>` : ''}
                ${hasCustomLink ? `
                <div class="absolute bottom-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span class="material-icons-round text-[10px]">check_circle</span> Có link
                </div>` : ''}
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div class="text-xs text-white/90">${movie.origin_name || ''}</div>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-white font-semibold truncate group-hover:text-primary transition-colors">
                    ${movie.name}
                </h3>
                <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>${movie.year || 'N/A'}</span>
                    <span class="flex items-center gap-1 text-yellow-500 font-bold">
                        <span class="material-icons-round text-[10px]">star</span> 
                        ${movie.tmdb?.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                </div>
            </div>
        </a>
    `;
    }).join('');
}

// Auto load on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomeMovies);
} else {
    loadHomeMovies();
}
