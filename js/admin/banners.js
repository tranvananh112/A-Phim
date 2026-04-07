// Banner Management Script - localStorage Version

let loadedMovies = [];

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    // Use adminAuthService to check auth
    adminAuthService.checkAuth();

    // Listen to Firebase for Realtime Updates from other admins
    import('/js/firebase-banners.js').then(fb => {
        fb.listenToBanners((remoteBanners) => {
            if (remoteBanners) {
                localStorage.setItem('cinestream_banners', JSON.stringify(remoteBanners));
                loadBanners();
                loadActiveBanner();
            }
        });
    }).catch(e => console.log('Không tải được firebase-banners', e));

    // Initial load from local
    loadBanners();
    loadActiveBanner();
});

// Helper to save to local and sync to cloud
function saveBanners(banners) {
    localStorage.setItem('cinestream_banners', JSON.stringify(banners));
    import('/js/firebase-banners.js').then(fb => {
        fb.syncBannersToFirebase(banners);
    }).catch(e => console.log('Lỗi sync firebase:', e));
}

// Load all banners from localStorage
function loadBanners() {
    const loading = document.getElementById('bannersLoading');
    const table = document.getElementById('bannersTable');
    const tbody = document.getElementById('bannersTableBody');

    try {
        // Get banners from localStorage
        const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');

        loading.classList.add('hidden');
        table.classList.remove('hidden');

        if (banners.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">Chưa có banner nào. Click "Tải Phim Mới" để thêm.</td></tr>';
            return;
        }

        tbody.innerHTML = banners.map(banner => `
            <tr class="border-b border-white/5 hover:bg-white/5">
                <td class="py-3 px-4">
                    <img src="https://img.ophim.live/uploads/movies/${banner.thumb_url}" 
                         alt="${banner.name}"
                         class="w-16 h-24 object-cover rounded"
                         onerror="this.src='https://via.placeholder.com/100x150?text=No+Image'">
                </td>
                <td class="py-3 px-4">
                    <div class="font-semibold text-white">${banner.name}</div>
                    <div class="text-sm text-gray-400">${banner.origin_name || ''}</div>
                </td>
                <td class="py-3 px-4 text-gray-300">${banner.year || 'N/A'}</td>
                <td class="py-3 px-4">
                    ${banner.isActive
                ? '<span class="px-2 py-1 bg-green-500/20 text-green-500 rounded text-sm font-semibold">Đang hiển thị</span>'
                : '<span class="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">Không hiển thị</span>'
            }
                </td>
                <td class="py-3 px-4 text-gray-300">${banner.priority || 0}</td>
                <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${!banner.isActive
                ? `<button onclick="activateBanner('${banner.slug}')" 
                                 class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                                 Kích hoạt
                               </button>`
                : `<button onclick="deactivateBanner('${banner.slug}')" 
                                 class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                                 Tắt
                               </button>`
            }
                        <button onclick="deleteBanner('${banner.slug}')" 
                                class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                            Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading banners:', error);
        loading.innerHTML = '<p class="text-red-400">Không thể tải danh sách banner</p>';
    }
}

// Load active banner from localStorage
function loadActiveBanner() {
    const content = document.getElementById('activeBannerContent');

    try {
        const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');
        const activeBanner = banners.find(b => b.isActive);

        if (activeBanner) {
            content.innerHTML = `
                <div class="flex gap-6">
                    <img src="https://img.ophim.live/uploads/movies/${activeBanner.thumb_url}" 
                         alt="${activeBanner.name}"
                         class="w-32 h-48 object-cover rounded-lg"
                         onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
                    <div class="flex-1">
                        <h4 class="text-2xl font-bold text-white mb-2">${activeBanner.name}</h4>
                        <p class="text-gray-400 mb-4">${activeBanner.origin_name || ''}</p>
                        <div class="flex gap-4 text-sm">
                            <span class="text-gray-300">Năm: ${activeBanner.year || 'N/A'}</span>
                            <span class="text-gray-300">Chất lượng: ${activeBanner.quality || 'HD'}</span>
                            <span class="text-gray-300">Ngôn ngữ: ${activeBanner.lang || 'Vietsub'}</span>
                        </div>
                        <p class="text-gray-400 mt-4 line-clamp-3">${activeBanner.content || 'Không có mô tả'}</p>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = '<p class="text-gray-400">Chưa có banner nào được kích hoạt</p>';
        }
    } catch (error) {
        console.error('Error loading active banner:', error);
        content.innerHTML = '<p class="text-red-400">Không thể tải banner đang hiển thị</p>';
    }
}

// Thêm event listener cho ô tìm kiếm với debounce 600ms
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchBannerInput');
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                loadMoviesFromOphim(e.target.value.trim());
            }, 600);
        });
    }
});

// Show load movies modal & auto fetch
function showLoadMoviesModal() {
    document.getElementById('loadMoviesModal').classList.remove('hidden');
    const searchInput = document.getElementById('searchBannerInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    // Auto load phim mới nhất khi mở lên
    loadMoviesFromOphim('');
}

// Close load movies modal
function closeLoadMoviesModal() {
    document.getElementById('loadMoviesModal').classList.add('hidden');
    document.getElementById('moviesGrid').classList.add('hidden');
    document.getElementById('loadingMovies').classList.add('hidden');
}

let isModalFullScreen = false;

// Toggle fullname screen modal
function toggleModalFullScreen() {
    const container = document.getElementById('loadMoviesModalContainer');
    const icon = document.getElementById('fullscreenIcon');
    const modalWrapper = document.getElementById('loadMoviesModal');
    
    isModalFullScreen = !isModalFullScreen;
    
    if (isModalFullScreen) {
        container.classList.remove('max-w-4xl', 'rounded-xl', 'max-h-[90vh]');
        container.classList.add('w-screen', 'h-screen', 'max-w-none', 'max-h-screen', 'rounded-none');
        modalWrapper.classList.remove('p-4');
        icon.textContent = 'fullscreen_exit';
    } else {
        container.classList.add('max-w-4xl', 'rounded-xl', 'max-h-[90vh]');
        container.classList.remove('w-screen', 'h-screen', 'max-w-none', 'max-h-screen', 'rounded-none');
        modalWrapper.classList.add('p-4');
        icon.textContent = 'fullscreen';
    }
}

let currentOphimSearchPage = 1;
let currentOphimSearchKeyword = '';
let currentOphimTotalPages = 1;

// Load / Search movies from Ophim API
async function loadMoviesFromOphim(keyword = '', isLoadMore = false) {
    const loadingDiv = document.getElementById('loadingMovies');
    const loadingText = document.getElementById('loadingText');
    const grid = document.getElementById('moviesGrid');
    const gridTitle = document.getElementById('gridTitle');
    const resultCount = document.getElementById('resultCount');
    const loadMoreSection = document.getElementById('loadMoreSection');
    const nextPageNum = document.getElementById('nextPageNum');

    if (!isLoadMore) {
        currentOphimSearchKeyword = keyword;
        currentOphimSearchPage = 1;
        // Reset view
        grid.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        if (loadMoreSection) loadMoreSection.classList.add('hidden');
    } else {
        currentOphimSearchPage++;
        const btn = document.getElementById('loadMoreBtn');
        if (btn) btn.innerHTML = `<span class="animate-spin material-icons-outlined">refresh</span> Đang tải...`;
    }
    
    let apiUrl = `https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${currentOphimSearchPage}`;
    if (currentOphimSearchKeyword !== '') {
        apiUrl = `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(currentOphimSearchKeyword)}&limit=24&page=${currentOphimSearchPage}`;
        if (!isLoadMore) {
            if (loadingText) loadingText.textContent = `Đang tìm "${currentOphimSearchKeyword}"...`;
            if (gridTitle) gridTitle.textContent = 'Kết quả tìm kiếm';
        }
    } else {
        if (!isLoadMore) {
            if (loadingText) loadingText.textContent = 'Đang tải danh sách phim mới...';
            if (gridTitle) gridTitle.textContent = 'Phim mới nổi bật';
        }
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });

        const data = await response.json();

        if (data.status === 'success' && data.data?.items) {
            let newMovies = data.data.items;
            
            const pagination = data.data.params?.pagination;
            const totalItems = pagination?.totalItems || 0;
            const perPage = pagination?.totalItemsPerPage || 24;
            
            currentOphimTotalPages = pagination?.totalPages || Math.ceil(totalItems / perPage) || 1;
            
            if (!isLoadMore) {
                loadedMovies = newMovies;
            } else {
                loadedMovies = [...loadedMovies, ...newMovies];
            }
            
            if (loadedMovies.length > 0) {
                displayMovies(loadedMovies);
                
                // Show result counts
                if (resultCount) {
                    if (data.data.params?.pagination?.totalItems) {
                        resultCount.textContent = `Hiển thị ${loadedMovies.length} / ${data.data.params.pagination.totalItems} kết quả`;
                    } else {
                        resultCount.textContent = `${loadedMovies.length} kết quả`;
                    }
                }
                
                // Show/hide load more button
                if (currentOphimSearchPage < currentOphimTotalPages) {
                    if (loadMoreSection) loadMoreSection.classList.remove('hidden');
                    if (nextPageNum) nextPageNum.textContent = currentOphimSearchPage + 1;
                    const btn = document.getElementById('loadMoreBtn');
                    if (btn) btn.innerHTML = `<span class="material-icons-outlined">expand_more</span> Tải Thêm (Trang <span id="nextPageNum">${currentOphimSearchPage + 1}</span>)`;
                } else {
                    if (loadMoreSection) loadMoreSection.classList.add('hidden');
                }

                if (!isLoadMore) {
                    loadingDiv.classList.add('hidden');
                    grid.classList.remove('hidden');
                }
            } else {
                if (!isLoadMore) throw new Error('Không tìm thấy phim nào phù hợp');
            }
        } else {
            if (!isLoadMore) throw new Error('Lỗi truy xuất API Ophim');
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        if (!isLoadMore) {
            loadingDiv.classList.add('hidden');
            grid.classList.remove('hidden');
            document.getElementById('moviesGridContent').innerHTML = `
                <div class="col-span-full py-8 text-center text-gray-400 border border-white/5 rounded-xl bg-black/20">
                    <span class="material-icons-outlined text-4xl mb-2 text-gray-500">search_off</span>
                    <p>Không tìm thấy dữ liệu hoặc có lỗi xảy ra.</p>
                </div>
            `;
            if (resultCount) resultCount.textContent = "0";
            if (loadMoreSection) loadMoreSection.classList.add('hidden');
        }
    }
}

function loadMoreOphimMovies() {
    loadMoviesFromOphim(currentOphimSearchKeyword, true);
}
// Display movies in grid
function displayMovies(movies) {
    const gridContent = document.getElementById('moviesGridContent');

    gridContent.innerHTML = movies.map(movie => `
        <div class="bg-background-dark rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all">
            <img src="https://img.ophim.live/uploads/movies/${movie.thumb_url}" 
                 alt="${movie.name}"
                 class="w-full h-48 object-cover"
                 onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
            <div class="p-3">
                <h5 class="text-white font-semibold text-sm mb-1 truncate">${movie.name}</h5>
                <p class="text-gray-400 text-xs mb-2 truncate">${movie.origin_name || ''}</p>
                <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>${movie.year || 'N/A'}</span>
                    <span>${movie.quality || 'HD'}</span>
                </div>
                <button onclick='addMovieToBanner(${JSON.stringify(movie).replace(/'/g, "&apos;")})' 
                        class="w-full px-3 py-2 bg-primary text-black font-semibold rounded hover:bg-primary/80 transition-colors text-sm">
                    Thêm vào Banner
                </button>
            </div>
        </div>
    `).join('');
}

// Add movie to banner
function addMovieToBanner(movie) {
    try {
        // Get existing banners
        const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');

        // Check if already exists
        if (banners.find(b => b.slug === movie.slug)) {
            alert('Phim này đã có trong danh sách banner!');
            return;
        }

        // Add new banner
        const newBanner = {
            slug: movie.slug,
            name: movie.name,
            origin_name: movie.origin_name,
            thumb_url: movie.thumb_url,
            poster_url: movie.poster_url,
            content: movie.content,
            year: movie.year,
            quality: movie.quality,
            lang: movie.lang,
            episode_current: movie.episode_current,
            category: movie.category,
            tmdb: movie.tmdb,
            imdb: movie.imdb,
            sourcePage: movie.sourcePage,
            isActive: false,
            priority: 0,
            addedAt: new Date().toISOString()
        };

        banners.push(newBanner);
        saveBanners(banners);

        alert('Đã thêm phim vào danh sách banner!');
        closeLoadMoviesModal();
        loadBanners();
    } catch (error) {
        console.error('Error adding banner:', error);
        alert('Không thể thêm banner: ' + error.message);
    }
}

// Activate banner
function activateBanner(slug) {
    if (!confirm('Kích hoạt banner này? Banner hiện tại sẽ bị tắt.')) return;

    try {
        const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');

        // Deactivate all, activate selected
        banners.forEach(b => {
            b.isActive = (b.slug === slug);
        });

        saveBanners(banners);

        alert('Đã kích hoạt banner!');
        loadBanners();
        loadActiveBanner();
    } catch (error) {
        console.error('Error activating banner:', error);
        alert('Không thể kích hoạt banner');
    }
}

// Deactivate banner
function deactivateBanner(slug) {
    if (!confirm('Tắt banner này?')) return;

    try {
        const banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');

        const banner = banners.find(b => b.slug === slug);
        if (banner) {
            banner.isActive = false;
        }

        saveBanners(banners);

        alert('Đã tắt banner!');
        loadBanners();
        loadActiveBanner();
    } catch (error) {
        console.error('Error deactivating banner:', error);
        alert('Không thể tắt banner');
    }
}

// Delete banner
function deleteBanner(slug) {
    if (!confirm('Xóa banner này?')) return;

    try {
        let banners = JSON.parse(localStorage.getItem('cinestream_banners') || '[]');

        banners = banners.filter(b => b.slug !== slug);
        saveBanners(banners);

        alert('Đã xóa banner!');
        loadBanners();
        loadActiveBanner();
    } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Không thể xóa banner');
    }
}
