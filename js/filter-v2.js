// Filter Page Script - Version 2 with better API handling
const API_BASE = 'https://ophim1.com/v1/api';

// State
let currentPage = 1;
let currentFilters = {
    list: '',
    category: '',
    country: '',
    year: ''
};

// DOM Elements
const filterList = document.getElementById('filterList');
const filterCategory = document.getElementById('filterCategory');
const filterCountry = document.getElementById('filterCountry');
const filterYear = document.getElementById('filterYear');
const applyFilterBtn = document.getElementById('applyFilter');
const resetFilterBtn = document.getElementById('resetFilter');
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const resultsInfo = document.getElementById('resultsInfo');
const totalResults = document.getElementById('totalResults');
const currentFilter = document.getElementById('currentFilter');
const pagination = document.getElementById('pagination');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadFilterOptions();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    applyFilterBtn.addEventListener('click', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
}

// Fetch API with better error handling
async function fetchAPI(endpoint, page = 1) {
    const url = `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}`;
    console.log('Fetching:', url);

    try {
        const response = await fetch(url, {
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
        return data;
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
}

// Parse API data to array
function parseDataToArray(data) {
    if (!data) return [];

    // If already array
    if (Array.isArray(data)) return data;

    // If has items property
    if (data.items && Array.isArray(data.items)) return data.items;

    // If object, convert to array
    if (typeof data === 'object') {
        const values = Object.values(data);
        // Filter out non-object values
        return values.filter(item => item && typeof item === 'object' && item.slug && item.name);
    }

    return [];
}

// Load Filter Options
async function loadFilterOptions() {
    try {
        // Load categories
        console.log('Loading categories...');
        const categoriesData = await fetchAPI('/the-loai');

        if (categoriesData.status === 'success' && categoriesData.data) {
            const categories = parseDataToArray(categoriesData.data);
            console.log('Categories parsed:', categories.length, 'items');

            if (categories.length > 0) {
                filterCategory.innerHTML = '<option value="">-- Chọn thể loại --</option>' +
                    categories.map(cat => `<option value="${cat.slug}">${cat.name}</option>`).join('');
            }
        }

        // Load countries - API không cung cấp danh sách, dùng danh sách cố định
        console.log('Loading countries...');
        const countries = [
            { slug: 'viet-nam', name: '🇻🇳 Việt Nam' },
            { slug: 'trung-quoc', name: '🇨🇳 Trung Quốc' },
            { slug: 'han-quoc', name: '🇰🇷 Hàn Quốc' },
            { slug: 'nhat-ban', name: '🇯🇵 Nhật Bản' },
            { slug: 'thai-lan', name: '🇹🇭 Thái Lan' },
            { slug: 'au-my', name: '🇺🇸 Âu Mỹ' },
            { slug: 'dai-loan', name: '🇹🇼 Đài Loan' },
            { slug: 'hong-kong', name: '🇭🇰 Hồng Kông' },
            { slug: 'an-do', name: '🇮🇳 Ấn Độ' },
            { slug: 'anh', name: '🇬🇧 Anh' },
            { slug: 'phap', name: '🇫🇷 Pháp' },
            { slug: 'canada', name: '🇨🇦 Canada' },
            { slug: 'duc', name: '🇩🇪 Đức' },
            { slug: 'tay-ban-nha', name: '🇪🇸 Tây Ban Nha' },
            { slug: 'tho-nhi-ky', name: '🇹🇷 Thổ Nhĩ Kỳ' },
            { slug: 'ha-lan', name: '🇳🇱 Hà Lan' },
            { slug: 'indonesia', name: '🇮🇩 Indonesia' },
            { slug: 'nga', name: '🇷🇺 Nga' },
            { slug: 'mexico', name: '🇲🇽 Mexico' },
            { slug: 'ba-lan', name: '🇵🇱 Ba Lan' },
            { slug: 'uc', name: '🇦🇺 Úc' },
            { slug: 'thuy-dien', name: '🇸🇪 Thụy Điển' },
            { slug: 'malaysia', name: '🇲🇾 Malaysia' },
            { slug: 'brazil', name: '🇧🇷 Brazil' },
            { slug: 'philippines', name: '🇵🇭 Philippines' },
            { slug: 'bo-dao-nha', name: '🇵🇹 Bồ Đào Nha' },
            { slug: 'y', name: '🇮🇹 Ý' },
            { slug: 'dan-mach', name: '🇩🇰 Đan Mạch' },
            { slug: 'uae', name: '🇦🇪 UAE' },
            { slug: 'na-uy', name: '🇳🇴 Na Uy' },
            { slug: 'thuy-si', name: '🇨🇭 Thụy Sĩ' },
            { slug: 'chau-phi', name: '🌍 Châu Phi' },
            { slug: 'nam-phi', name: '🇿🇦 Nam Phi' },
            { slug: 'ukraina', name: '🇺🇦 Ukraina' },
            { slug: 'a-rap-xe-ut', name: '🇸🇦 Ả Rập Xê Út' }
        ];

        filterCountry.innerHTML = '<option value="">-- Chọn quốc gia --</option>' +
            countries.map(country => `<option value="${country.slug}">${country.name}</option>`).join('');

        console.log('Countries loaded:', countries.length, 'items');

        // Load years (from current year to 1990)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1990; year--) {
            years.push(year);
        }
        filterYear.innerHTML = '<option value="">-- Chọn năm --</option>' +
            years.map(year => `<option value="${year}">${year}</option>`).join('');

        console.log('Filter options loaded successfully');
    } catch (err) {
        console.error('Error loading filter options:', err);
        showError('Không thể tải bộ lọc. Vui lòng tải lại trang.');
    }
}

// Apply Filters
async function applyFilters() {
    // Get selected values
    currentFilters.list = filterList.value;
    currentFilters.category = filterCategory.value;
    currentFilters.country = filterCountry.value;
    currentFilters.year = filterYear.value;

    // Check if at least one filter is selected
    if (!currentFilters.list && !currentFilters.category && !currentFilters.country && !currentFilters.year) {
        showError('Vui lòng chọn ít nhất một bộ lọc');
        return;
    }

    currentPage = 1;
    await loadMovies();
}

// Reset Filters
function resetFilters() {
    filterList.value = '';
    filterCategory.value = '';
    filterCountry.value = '';
    filterYear.value = '';

    currentFilters = {
        list: '',
        category: '',
        country: '',
        year: ''
    };

    currentPage = 1;
    moviesGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    resultsInfo.classList.add('hidden');
    pagination.classList.add('hidden');
    error.classList.add('hidden');
}

// Load Movies
async function loadMovies() {
    try {
        showLoading();

        let endpoint = '';
        let filterText = '';

        // Priority: list > category > country > year
        if (currentFilters.list) {
            endpoint = `/danh-sach/${currentFilters.list}`;
            filterText = `từ danh sách "${filterList.options[filterList.selectedIndex].text}"`;
        } else if (currentFilters.category) {
            endpoint = `/the-loai/${currentFilters.category}`;
            filterText = `thể loại "${filterCategory.options[filterCategory.selectedIndex].text}"`;
        } else if (currentFilters.country) {
            endpoint = `/quoc-gia/${currentFilters.country}`;
            filterText = `quốc gia "${filterCountry.options[filterCountry.selectedIndex].text}"`;
        } else if (currentFilters.year) {
            endpoint = `/nam-phat-hanh/${currentFilters.year}`;
            filterText = `năm ${currentFilters.year}`;
        }

        console.log('Loading movies from:', endpoint);
        const data = await fetchAPI(endpoint, currentPage);

        if (data.status === 'success' && data.data) {
            const movies = data.data.items || [];
            const paginationData = data.data.params?.pagination || {};

            console.log('Movies loaded:', movies.length);

            if (movies.length === 0) {
                showError('Không tìm thấy phim nào');
                return;
            }

            renderMovies(movies);
            updateResultsInfo(paginationData.totalItems || movies.length, filterText);
            renderPagination(paginationData);
            hideLoading();
        } else {
            throw new Error('Invalid data format');
        }
    } catch (err) {
        console.error('Error loading movies:', err);
        showError('Không thể tải danh sách phim. Vui lòng thử lại.');
    }
}

// Render Movies
function renderMovies(movies) {
    moviesGrid.innerHTML = movies.map(movie => {
        const posterUrl = movie.thumb_url || movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Image';
        const year = movie.year || 'N/A';
        const quality = movie.quality || movie.lang || '';

        return `
            <a href="movie-detail.html?slug=${movie.slug}" 
               class="group relative block rounded-xl overflow-hidden bg-surface-dark hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20">
                <div class="aspect-[2/3] relative overflow-hidden">
                    <img src="${posterUrl}" 
                         alt="${movie.name}"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    
                    <!-- Quality Badge -->
                    ${quality ? `
                        <div class="absolute top-2 left-2 bg-primary text-black text-xs font-bold px-2 py-1 rounded">
                            ${quality}
                        </div>
                    ` : ''}
                    
                    <!-- Year Badge -->
                    <div class="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                        ${year}
                    </div>
                    
                    <!-- Play Overlay -->
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span class="material-icons-round text-primary text-6xl">play_circle</span>
                    </div>
                </div>
                
                <div class="p-4">
                    <h3 class="font-bold text-white group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        ${movie.name}
                    </h3>
                    <p class="text-sm text-gray-400 line-clamp-1">
                        ${movie.origin_name || ''}
                    </p>
                </div>
            </a>
        `;
    }).join('');
}

// Update Results Info
function updateResultsInfo(total, filterText) {
    totalResults.textContent = total;
    currentFilter.textContent = filterText;
    resultsInfo.classList.remove('hidden');
}

// Render Pagination
function renderPagination(paginationData) {
    const totalPages = paginationData.totalPages || 1;
    const currentPageNum = paginationData.currentPage || currentPage;

    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }

    let paginationHTML = '';

    // Previous button
    if (currentPageNum > 1) {
        paginationHTML += `
            <button onclick="goToPage(${currentPageNum - 1})" 
                    class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-primary hover:text-black transition-colors">
                <span class="material-icons-round align-middle">chevron_left</span>
            </button>
        `;
    }

    // Page numbers
    const maxButtons = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        paginationHTML += `
            <button onclick="goToPage(1)" 
                    class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-primary hover:text-black transition-colors">
                1
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="px-2 text-gray-400">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPageNum;
        paginationHTML += `
            <button onclick="goToPage(${i})" 
                    class="px-4 py-2 ${isActive ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-primary hover:text-black'} rounded-lg transition-colors font-bold">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="px-2 text-gray-400">...</span>`;
        }
        paginationHTML += `
            <button onclick="goToPage(${totalPages})" 
                    class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-primary hover:text-black transition-colors">
                ${totalPages}
            </button>
        `;
    }

    // Next button
    if (currentPageNum < totalPages) {
        paginationHTML += `
            <button onclick="goToPage(${currentPageNum + 1})" 
                    class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-primary hover:text-black transition-colors">
                <span class="material-icons-round align-middle">chevron_right</span>
            </button>
        `;
    }

    pagination.innerHTML = paginationHTML;
    pagination.classList.remove('hidden');
}

// Go to Page
function goToPage(page) {
    currentPage = page;
    loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Loading
function showLoading() {
    loading.classList.remove('hidden');
    moviesGrid.innerHTML = '';
    emptyState.classList.add('hidden');
    error.classList.add('hidden');
    resultsInfo.classList.add('hidden');
    pagination.classList.add('hidden');
}

// Hide Loading
function hideLoading() {
    loading.classList.add('hidden');
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    error.classList.remove('hidden');
    loading.classList.add('hidden');
    moviesGrid.innerHTML = '';
    emptyState.classList.add('hidden');
    resultsInfo.classList.add('hidden');
    pagination.classList.add('hidden');
}
