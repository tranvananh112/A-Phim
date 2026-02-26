// Search Page Script
let currentPage = 1;
let currentKeyword = '';
let currentFilters = {
    type: '',
    category: '',
    country: '',
    year: '',
    sort: 'latest'
};

document.addEventListener('DOMContentLoaded', function () {
    // Get search keyword from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentKeyword = urlParams.get('q') || '';

    // Get type and category from URL
    const type = urlParams.get('type');
    const category = urlParams.get('category');

    if (type) {
        currentFilters.type = type;
    }

    if (category) {
        currentFilters.category = category;
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput && currentKeyword) {
        searchInput.value = currentKeyword;
    }

    // Load categories and countries in parallel
    Promise.all([
        loadCategories(),
        loadCountries()
    ]).then(() => {
        console.log('✓ Categories and countries loaded');
    }).catch(err => {
        console.error('Error loading filters:', err);
    });

    setupSearch();
    setupFilters();
    performSearch();
});

// Setup search input
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        currentKeyword = e.target.value.trim();

        if (currentKeyword.length < 2) {
            if (currentKeyword.length === 0) {
                loadAllMovies();
            }
            return;
        }

        searchTimeout = setTimeout(() => {
            currentPage = 1;
            performSearch();
        }, 500);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            currentPage = 1;
            performSearch();
        }
    });
}

// Setup filters
function setupFilters() {
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
    });

    document.getElementById('countryFilter').addEventListener('change', (e) => {
        currentFilters.country = e.target.value;
    });

    document.getElementById('yearFilter').addEventListener('change', (e) => {
        currentFilters.year = e.target.value;
    });

    document.getElementById('sortFilter').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
    });
}

// Load categories from API
async function loadCategories() {
    try {
        const categories = await movieAPI.getCategories();
        const categoryFilter = document.getElementById('categoryFilter');

        console.log('Categories received in search.js:', categories);

        if (categories && categories.length > 0) {
            // Keep "Tất cả" option
            const currentHTML = '<option value="">Tất cả</option>';

            // Add categories from API with safety checks
            const optionsHTML = categories
                .filter(cat => cat && cat.slug && cat.name) // Filter out invalid items
                .map(cat => `<option value="${cat.slug}">${cat.name}</option>`)
                .join('');

            categoryFilter.innerHTML = currentHTML + optionsHTML;

            // Set selected value if from URL
            if (currentFilters.category) {
                categoryFilter.value = currentFilters.category;
            }

            console.log(`Loaded ${categories.length} categories`);
        } else {
            console.warn('No categories loaded or empty array');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load countries from API
async function loadCountries() {
    try {
        const countries = await movieAPI.getCountries();
        const countryFilter = document.getElementById('countryFilter');

        console.log('Countries received in search.js:', countries);

        if (countries && countries.length > 0) {
            // Keep "Tất cả" option
            const currentHTML = '<option value="">Tất cả</option>';

            // Add countries from API with safety checks
            const optionsHTML = countries
                .filter(country => country && country.slug && country.name) // Filter out invalid items
                .map(country => `<option value="${country.slug}">${country.name}</option>`)
                .join('');

            countryFilter.innerHTML = currentHTML + optionsHTML;

            // Set selected value if from URL
            if (currentFilters.country) {
                countryFilter.value = currentFilters.country;
            }

            console.log(`Loaded ${countries.length} countries`);
        } else {
            console.warn('No countries loaded or empty array');
        }
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

// Apply filters
window.applyFilters = function () {
    currentPage = 1;
    performSearch();
};

// Reset filters
window.resetFilters = function () {
    currentFilters = {
        category: '',
        country: '',
        year: '',
        sort: 'latest'
    };

    document.getElementById('categoryFilter').value = '';
    document.getElementById('countryFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('sortFilter').value = 'latest';

    currentPage = 1;
    performSearch();
};

// Perform search
async function performSearch() {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');

    // Show loading
    resultsGrid.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p class="text-gray-400 mt-4">Đang tìm kiếm...</p>
        </div>
    `;

    try {
        let data;

        if (currentKeyword) {
            // Search by keyword
            console.log('Searching with keyword:', currentKeyword);
            data = await movieAPI.searchMovies(currentKeyword, currentPage);
            resultsTitle.textContent = `Kết quả tìm kiếm: "${currentKeyword}"`;
        } else if (currentFilters.type) {
            // Filter by type (series/single) - use multiple sources
            const typeMap = {
                'series': 'phim-bo',
                'single': 'phim-le'
            };
            const typeSlug = typeMap[currentFilters.type] || currentFilters.type;
            console.log('Loading movies by type from multiple sources:', typeSlug);
            data = await movieAPI.getMoviesFromMultipleSources(currentPage, typeSlug);
            console.log('Type data received:', data);
            resultsTitle.textContent = currentFilters.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ';
        } else if (currentFilters.category) {
            // Filter by category - use multiple sources
            console.log('Loading movies by category from multiple sources:', currentFilters.category);
            data = await movieAPI.getMoviesFromMultipleSources(currentPage, currentFilters.category);
            resultsTitle.textContent = 'Phim theo thể loại';
        } else if (currentFilters.country) {
            // Filter by country
            console.log('Loading movies by country:', currentFilters.country);
            data = await movieAPI.getMoviesByCountry(currentFilters.country, currentPage);
            resultsTitle.textContent = 'Phim theo quốc gia';
        } else {
            // Load all movies - use simple getMovieList instead
            console.log('Loading all movies');
            data = await movieAPI.getMovieList(currentPage);
            resultsTitle.textContent = 'Khám phá - Tất cả phim';
        }

        console.log('Search data received:', data);

        if (data && data.status === 'success' && data.data) {
            let movies = data.data.items || [];
            console.log('Movies array:', movies.length, 'items');

            // Apply client-side filters
            movies = applyClientFilters(movies);
            console.log('After filters:', movies.length, 'items');

            if (movies.length > 0) {
                renderResults(movies);
                resultsCount.textContent = `Trang ${currentPage}: ${movies.length} phim`;

                // Render pagination - pass the whole data object
                renderPagination(data.data);
            } else {
                console.warn('No movies after filtering');
                showNoResults();
            }
        } else {
            console.error('Invalid data structure:', data);
            showNoResults();
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <span class="material-icons-round text-6xl text-red-400 mb-4">error_outline</span>
                <p class="text-red-400">Đã xảy ra lỗi khi tìm kiếm</p>
            </div>
        `;
    }
}

// Apply client-side filters
function applyClientFilters(movies) {
    let filtered = [...movies];

    // Filter by year
    if (currentFilters.year) {
        filtered = filtered.filter(m => m.year == currentFilters.year);
    }

    // Sort
    switch (currentFilters.sort) {
        case 'rating':
            filtered.sort((a, b) => {
                const ratingA = a.tmdb?.vote_average || 0;
                const ratingB = b.tmdb?.vote_average || 0;
                return ratingB - ratingA;
            });
            break;
        case 'year':
            filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'views':
            filtered.sort((a, b) => (b.view || 0) - (a.view || 0));
            break;
        // 'latest' is default from API
    }

    return filtered;
}

// Load all movies
async function loadAllMovies() {
    currentKeyword = '';
    currentPage = 1;
    performSearch();
}

// Render results
function renderResults(movies) {
    const resultsGrid = document.getElementById('resultsGrid');

    resultsGrid.innerHTML = movies.map(movie => `
        <a href="movie-detail.html?slug=${movie.slug}"
            class="group relative block rounded-xl overflow-hidden bg-surface-dark border border-white/5 hover:border-primary/50 transition-all duration-300">
            <div class="aspect-[2/3] w-full overflow-hidden relative">
                <img alt="${movie.name}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src="${movieAPI.getImageURL(movie.thumb_url)}"
                    onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'" />
                <div class="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">
                    ${movie.quality || 'HD'}
                </div>
                ${movie.episode_current ? `
                <div class="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    ${movie.episode_current}
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
    `).join('');
}

// Show no results
function showNoResults() {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');

    resultsGrid.innerHTML = `
        <div class="col-span-full text-center py-20">
            <span class="material-icons-round text-6xl text-gray-600 mb-4">search_off</span>
            <p class="text-gray-400 text-lg">Không tìm thấy kết quả phù hợp</p>
            <p class="text-gray-500 text-sm mt-2">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
        </div>
    `;

    resultsCount.textContent = 'Không có kết quả';
}

// Render pagination
function renderPagination(params) {
    const pagination = document.getElementById('pagination');

    // Get pagination info from API response
    const totalItems = params.pagination?.totalItems || params.params?.pagination?.totalItems || 0;
    const totalItemsPerPage = params.pagination?.totalItemsPerPage || params.params?.pagination?.totalItemsPerPage || 24;
    const currentPageNum = params.pagination?.currentPage || params.params?.pagination?.currentPage || currentPage;
    const totalPages = params.pagination?.totalPages || params.params?.pagination?.totalPages || Math.ceil(totalItems / totalItemsPerPage);

    console.log('Pagination info:', { totalItems, totalItemsPerPage, currentPageNum, totalPages });

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // First page button
    if (currentPageNum > 1) {
        paginationHTML += `
            <button onclick="goToPage(1)" 
                class="px-4 py-2 bg-surface-dark border border-white/10 rounded-lg hover:border-primary hover:text-primary transition-colors">
                <span class="material-icons-round text-sm">first_page</span>
            </button>
        `;
    }

    // Previous button
    if (currentPageNum > 1) {
        paginationHTML += `
            <button onclick="goToPage(${currentPageNum - 1})" 
                class="px-4 py-2 bg-surface-dark border border-white/10 rounded-lg hover:border-primary hover:text-primary transition-colors">
                <span class="material-icons-round text-sm">chevron_left</span>
            </button>
        `;
    }

    // Page numbers with smart display
    const maxPages = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    // Show first page if not in range
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="goToPage(1)" 
                class="px-4 py-2 bg-surface-dark text-gray-300 border border-white/10 rounded-lg hover:border-primary transition-colors font-medium">
                1
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="px-2 text-gray-500">...</span>`;
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="goToPage(${i})" 
                class="px-4 py-2 ${i === currentPageNum ? 'bg-primary text-black font-bold' : 'bg-surface-dark text-gray-300'} border border-white/10 rounded-lg hover:border-primary transition-colors font-medium">
                ${i}
            </button>
        `;
    }

    // Show last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-2 text-gray-500">...</span>`;
        }
        paginationHTML += `
            <button onclick="goToPage(${totalPages})" 
                class="px-4 py-2 bg-surface-dark text-gray-300 border border-white/10 rounded-lg hover:border-primary transition-colors font-medium">
                ${totalPages}
            </button>
        `;
    }

    // Next button
    if (currentPageNum < totalPages) {
        paginationHTML += `
            <button onclick="goToPage(${currentPageNum + 1})" 
                class="px-4 py-2 bg-surface-dark border border-white/10 rounded-lg hover:border-primary hover:text-primary transition-colors">
                <span class="material-icons-round text-sm">chevron_right</span>
            </button>
        `;
    }

    // Last page button
    if (currentPageNum < totalPages) {
        paginationHTML += `
            <button onclick="goToPage(${totalPages})" 
                class="px-4 py-2 bg-surface-dark border border-white/10 rounded-lg hover:border-primary hover:text-primary transition-colors">
                <span class="material-icons-round text-sm">last_page</span>
            </button>
        `;
    }

    // Page info
    paginationHTML += `
        <div class="px-4 py-2 text-gray-400 text-sm">
            Trang ${currentPageNum} / ${totalPages}
        </div>
    `;

    pagination.innerHTML = paginationHTML;
}

// Go to page
window.goToPage = function (page) {
    currentPage = page;
    performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
