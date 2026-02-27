// Danh Sách Page Script

const LIST_NAMES = {
    'phim-moi': 'Phim Mới',
    'phim-bo': 'Phim Bộ',
    'phim-le': 'Phim Lẻ',
    'tv-shows': 'TV Shows',
    'hoat-hinh': 'Hoạt Hình',
    'phim-vietsub': 'Phim Vietsub',
    'phim-thuyet-minh': 'Phim Thuyết Minh',
    'phim-long-tien': 'Phim Lồng Tiếng',
    'phim-bo-dang-chieu': 'Phim Bộ Đang Chiếu',
    'phim-bo-hoan-thanh': 'Phim Bộ Đã Hoàn Thành',
    'phim-sap-chieu': 'Phim Sắp Chiếu',
    'subteam': 'Subteam',
    'phim-chieu-rap': 'Phim Chiếu Rạp'
};

let currentList = null;
let currentPage = 1;
let totalPages = 1;

const loading = document.getElementById('loading');
const moviesTable = document.getElementById('moviesTable');
const moviesTableBody = document.getElementById('moviesTableBody');
const pagination = document.getElementById('pagination');
const error = document.getElementById('error');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Get URL params
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        list: params.get('list'),
        page: parseInt(params.get('page')) || 1
    };
}

// Load movies by list
async function loadMoviesList(listSlug, page = 1) {
    currentList = listSlug;
    currentPage = page;

    const listName = LIST_NAMES[listSlug] || listSlug;
    pageTitle.textContent = listName;
    pageSubtitle.textContent = 'Đang tải danh sách phim...';

    loading.classList.remove('hidden');
    moviesTable.classList.add('hidden');
    error.classList.add('hidden');

    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        // Use correct API endpoint: /v1/api/danh-sach/[slug]
        const apiUrl = `https://ophim1.com/v1/api/danh-sach/${listSlug}?page=${page}&limit=24`;
        console.log(`Fetching: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.status === 'success' && data.data) {
            const movies = data.data.items || [];
            const params = data.data.params || data.params || {};
            const pagination_data = params.pagination || data.data.pagination || {};

            const totalItems = pagination_data.totalItems || pagination_data.total || movies.length;
            const totalPages_api = pagination_data.totalPages || Math.ceil(totalItems / 24) || 1;
            totalPages = totalPages_api;

            // Move page info to bottom, will be shown in pagination
            pageSubtitle.textContent = `Đang hiển thị ${movies.length} phim`;

            if (movies.length > 0) {
                renderMoviesTable(movies);
                // Always render pagination with proper data
                renderPagination({
                    currentPage: currentPage,
                    totalPages: totalPages_api,
                    totalItems: totalItems
                });
            } else {
                throw new Error('No movies found');
            }
        } else {
            throw new Error('Invalid data format');
        }
    } catch (err) {
        console.error('Error loading movies list:', err);
        console.error('Error details:', err.message);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        error.innerHTML = `
            <span class="material-icons-round text-6xl text-red-400 mb-4">error_outline</span>
            <p class="text-red-400 text-lg">Không thể tải dữ liệu</p>
            <p class="text-gray-400 text-sm mt-2">${err.message}</p>
        `;
    }
}

// Render movies table
function renderMoviesTable(movies) {
    loading.classList.add('hidden');
    moviesTable.classList.remove('hidden');

    let tableHTML = '';

    movies.forEach((movie) => {
        const thumbUrl = movie.thumb_url || movie.poster_url || '';
        const posterUrl = thumbUrl ? `https://img.ophim.live/uploads/movies/${thumbUrl}` : 'https://via.placeholder.com/100x150?text=No+Image';
        const year = movie.year || 'N/A';
        const quality = movie.quality || movie.lang || '';
        const episodeCurrent = movie.episode_current || 'N/A';
        const tmdbRating = movie.tmdb?.vote_average || 'N/A';
        const imdbRating = movie.imdb?.rating || 'N/A';
        const countries = movie.country?.map(c => c.name).join(', ') || 'N/A';
        const modifiedTime = movie.modified?.time || 'N/A';

        // Get country flags
        let countryFlags = '';
        if (movie.country && movie.country.length > 0) {
            const flagMap = {
                'Việt Nam': '🇻🇳',
                'Trung Quốc': '🇨🇳',
                'Hàn Quốc': '🇰🇷',
                'Nhật Bản': '🇯🇵',
                'Thái Lan': '🇹🇭',
                'Mỹ': '🇺🇸',
                'Anh': '🇬🇧',
                'Pháp': '🇫🇷',
                'Đức': '🇩🇪',
                'Ý': '🇮🇹',
                'Tây Ban Nha': '🇪🇸',
                'Nga': '🇷🇺',
                'Ấn Độ': '🇮🇳',
                'Indonesia': '🇮🇩',
                'Philippines': '🇵🇭',
                'Hồng Kông': '🇭🇰',
                'Đài Loan': '🇹🇼'
            };
            countryFlags = movie.country.map(c => flagMap[c.name] || '🌍').join(' ');
        }

        tableHTML += `
            <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td class="px-4 py-4">
                    <a href="movie-detail.html?slug=${movie.slug}" class="flex items-center gap-4 group">
                        <img src="${posterUrl}" 
                             alt="${movie.name}"
                             class="w-16 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                             onerror="this.src='https://via.placeholder.com/100x150?text=No+Image'">
                        <div class="flex-1">
                            <h3 class="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                ${movie.name}
                            </h3>
                            <p class="text-gray-400 text-xs line-clamp-1">${movie.origin_name || ''}</p>
                            ${quality ? `<span class="inline-block mt-1 px-2 py-0.5 bg-primary text-black text-xs font-bold rounded">${quality}</span>` : ''}
                        </div>
                    </a>
                </td>
                <td class="px-4 py-4 text-center text-white text-sm">${year}</td>
                <td class="px-4 py-4 text-center">
                    <span class="inline-block px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        ${episodeCurrent}
                    </span>
                </td>
                <td class="px-4 py-4 text-center">
                    <div class="flex items-center justify-center gap-1 text-primary text-sm">
                        <span class="material-icons-round text-sm">star</span>
                        <span>${tmdbRating}</span>
                    </div>
                </td>
                <td class="px-4 py-4 text-center">
                    <div class="flex items-center justify-center gap-1 text-yellow-400 text-sm">
                        <span class="material-icons-round text-sm">star</span>
                        <span>${imdbRating}</span>
                    </div>
                </td>
                <td class="px-4 py-4 text-center text-white text-sm">${quality || 'N/A'}</td>
                <td class="px-4 py-4 text-center text-2xl">${countryFlags || countries}</td>
                <td class="px-4 py-4 text-center text-gray-400 text-xs">${modifiedTime}</td>
            </tr>
        `;
    });

    moviesTableBody.innerHTML = tableHTML;

    // Render mobile card view
    renderMoviesCardView(movies);
}

// Render movies card view for mobile
function renderMoviesCardView(movies) {
    const moviesCardView = document.getElementById('moviesCardView');
    if (!moviesCardView) return;

    let cardHTML = '';

    movies.forEach((movie) => {
        const thumbUrl = movie.thumb_url || movie.poster_url || '';
        const posterUrl = thumbUrl ? `https://img.ophim.live/uploads/movies/${thumbUrl}` : 'https://via.placeholder.com/100x150?text=No+Image';
        const year = movie.year || 'N/A';
        const quality = movie.quality || movie.lang || '';
        const episodeCurrent = movie.episode_current || 'N/A';
        const tmdbRating = movie.tmdb?.vote_average || 'N/A';
        const imdbRating = movie.imdb?.rating || 'N/A';

        cardHTML += `
            <a href="movie-detail.html?slug=${movie.slug}" 
               class="flex gap-4 bg-surface-dark rounded-lg overflow-hidden hover:bg-surface-dark/80 transition-all">
                <img src="${posterUrl}" 
                     alt="${movie.name}"
                     class="w-24 h-36 object-cover"
                     onerror="this.src='https://via.placeholder.com/100x150?text=No+Image'">
                <div class="flex-1 py-3 pr-3">
                    <h3 class="text-white font-bold text-base mb-1 line-clamp-2">${movie.name}</h3>
                    <p class="text-gray-400 text-sm mb-2">${movie.origin_name || ''}</p>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <span class="px-2 py-1 bg-primary/20 text-primary rounded">${year}</span>
                        ${quality ? `<span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">${quality}</span>` : ''}
                        <span class="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">${episodeCurrent}</span>
                    </div>
                    <div class="flex gap-3 mt-2 text-xs text-gray-400">
                        ${tmdbRating !== 'N/A' ? `<span>⭐ ${tmdbRating}</span>` : ''}
                        ${imdbRating !== 'N/A' ? `<span>🎬 ${imdbRating}</span>` : ''}
                    </div>
                </div>
            </a>
        `;
    });

    moviesCardView.innerHTML = cardHTML;
}

// Render pagination
function renderPagination(paginationData) {
    if (!paginationData || !paginationData.totalPages) {
        pagination.innerHTML = '';
        return;
    }

    const totalPages_api = paginationData.totalPages;
    const currentPage_api = paginationData.currentPage || currentPage;
    const totalItems = paginationData.totalItems || 0;

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage_api - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages_api, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    let paginationHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2 overflow-x-auto">
    `;

    // Previous button
    if (currentPage_api > 1) {
        paginationHTML += `
            <button onclick="goToPage(${currentPage_api - 1})" 
                    class="px-4 py-2 bg-surface-dark text-white rounded-lg hover:bg-primary hover:text-black transition-colors flex-shrink-0">
                <span class="material-icons-round text-sm">chevron_left</span>
            </button>
        `;
    }

    // First page
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="goToPage(1)" 
                    class="px-4 py-2 bg-surface-dark text-white rounded-lg hover:bg-primary hover:text-black transition-colors flex-shrink-0">
                1
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="text-gray-400 flex-shrink-0">...</span>`;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage_api) {
            paginationHTML += `
                <button class="px-4 py-2 bg-primary text-black font-bold rounded-lg flex-shrink-0 transition-all duration-300">
                    ${i}
                </button>
            `;
        } else {
            paginationHTML += `
                <button onclick="goToPage(${i})" 
                        class="px-4 py-2 bg-surface-dark text-white rounded-lg hover:bg-primary hover:text-black transition-all duration-300 flex-shrink-0">
                    ${i}
                </button>
            `;
        }
    }

    // Last page
    if (endPage < totalPages_api) {
        if (endPage < totalPages_api - 1) {
            paginationHTML += `<span class="text-gray-400 flex-shrink-0">...</span>`;
        }
        paginationHTML += `
            <button onclick="goToPage(${totalPages_api})" 
                    class="px-4 py-2 bg-surface-dark text-white rounded-lg hover:bg-primary hover:text-black transition-colors flex-shrink-0">
                ${totalPages_api}
            </button>
        `;
    }

    // Next button
    if (currentPage_api < totalPages_api) {
        paginationHTML += `
            <button onclick="goToPage(${currentPage_api + 1})" 
                    class="px-4 py-2 bg-surface-dark text-white rounded-lg hover:bg-primary hover:text-black transition-colors flex-shrink-0">
                <span class="material-icons-round text-sm">chevron_right</span>
            </button>
        `;
    }

    paginationHTML += `
            </div>
            <div class="text-gray-400 text-sm whitespace-nowrap">
                Trang ${currentPage_api}/${totalPages_api} | Tổng ${totalItems.toLocaleString()} kết quả
            </div>
        </div>
    `;

    pagination.innerHTML = paginationHTML;
}

// Go to page
function goToPage(page) {
    if (page < 1 || page > totalPages || !currentList) return;

    // Update UI immediately for smooth transition
    const allButtons = pagination.querySelectorAll('button');
    allButtons.forEach(btn => {
        const btnText = btn.textContent.trim();
        if (btnText === page.toString()) {
            // Highlight new page button
            btn.className = 'px-4 py-2 bg-primary text-black font-bold rounded-lg flex-shrink-0 transition-all duration-300';
        } else if (!btn.querySelector('.material-icons-round')) {
            // Reset other page buttons
            btn.className = 'px-4 py-2 bg-surface-dark text-white rounded-lg hover:bg-primary hover:text-black transition-colors flex-shrink-0';
        }
    });

    // Navigate to new page
    window.location.href = `?list=${currentList}&page=${page}`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const params = getUrlParams();
    const categoriesGrid = document.getElementById('categoriesGrid');

    if (params.list) {
        // Hide categories grid, show movies table
        if (categoriesGrid) categoriesGrid.classList.add('hidden');
        loadMoviesList(params.list, params.page);
    } else {
        // Show categories grid
        if (categoriesGrid) categoriesGrid.classList.remove('hidden');
        pageTitle.textContent = 'Danh Sách Phim';
        pageSubtitle.textContent = 'Khám phá phim ảnh từ 13 loại phim';
    }
});
