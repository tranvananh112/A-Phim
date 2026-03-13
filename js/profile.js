// Profile Page Script
let loadedTabs = new Set(); // Track which tabs have been loaded

document.addEventListener('DOMContentLoaded', function () {
    // Check if logged in
    if (!authService.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Load basic user info for sidebar only
    loadBasicUserInfo();
    setupProfileForm();
    setupPasswordForm();

    // Don't load detailed info until user clicks on tabs
    // loadSubscriptionInfo();
    // loadFavorites();
    // loadHistory();
});

// Load basic user info for sidebar
function loadBasicUserInfo() {
    const user = authService.getCurrentUser();
    if (!user) return;

    // Update sidebar only
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
}

// Load detailed user profile for form
function loadUserProfile() {
    const user = authService.getCurrentUser();
    if (!user) return;

    // Update form
    document.getElementById('profileName').value = user.name;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone || '';
}

// Setup profile form
function setupProfileForm() {
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('profileName').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();

        const result = authService.updateProfile({ name, phone });

        if (result.success) {
            showMessage('Cập nhật thông tin thành công!', 'success');
            loadUserProfile();
        } else {
            showMessage(result.message, 'error');
        }
    });
}

// Setup password form
function setupPasswordForm() {
    const form = document.getElementById('passwordForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        if (newPassword.length < 6) {
            showMessage('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
            return;
        }

        const result = authService.changePassword(oldPassword, newPassword);

        if (result.success) {
            showMessage('Đổi mật khẩu thành công!', 'success');
            form.reset();
        } else {
            showMessage(result.message, 'error');
        }
    });
}

// Load subscription info
function loadSubscriptionInfo() {
    const container = document.getElementById('subscriptionInfo');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="bg-black/30 border border-white/5 rounded-lg p-6">
            <div class="animate-pulse">
                <div class="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div class="space-y-2">
                    <div class="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div class="h-4 bg-gray-700 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    `;

    // Simulate loading delay
    setTimeout(() => {
        const subscription = userService.getSubscription();
        const expiresDate = subscription.expiresAt
            ? new Date(subscription.expiresAt).toLocaleDateString('vi-VN')
            : 'N/A';

        container.innerHTML = `
            <div class="bg-black/30 border border-white/5 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">Gói ${subscription.name}</h3>
                    <span class="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-bold">
                        ${subscription.price === 0 ? 'Miễn phí' : subscription.price.toLocaleString('vi-VN') + 'đ'}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-300">
                    <p>Chất lượng: <span class="text-white font-semibold">${subscription.quality}</span></p>
                    <p>Số thiết bị: <span class="text-white font-semibold">${subscription.devices}</span></p>
                    ${subscription.expiresAt ? `<p>Hết hạn: <span class="text-white font-semibold">${expiresDate}</span></p>` : ''}
                </div>
            </div>
        `;
    }, 500);
}

// Load favorites
function loadFavorites() {
    const container = document.getElementById('favoritesList');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span class="ml-3 text-gray-400">Đang tải phim yêu thích...</span>
        </div>
    `;

    // Simulate loading delay
    setTimeout(() => {
        const favorites = userService.getFavorites();

        if (favorites.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-400 py-8">Chưa có phim yêu thích</p>';
            return;
        }

        container.innerHTML = favorites.map(movie => `
            <div class="group relative rounded-xl overflow-hidden bg-black border border-white/5 hover:border-primary/50 transition-all">
                <a href="movie-detail.html?slug=${movie.slug}" class="block aspect-[2/3] relative">
                    <img src="${movieAPI.getImageURL(movie.thumb_url)}" 
                         alt="${movie.name}"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'" />
                </a>
                <div class="p-3">
                    <h4 class="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                        ${movie.name}
                    </h4>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-gray-400">${movie.year}</span>
                        <button onclick="removeFavorite('${movie.slug}')" 
                            class="text-red-400 hover:text-red-300 transition-colors">
                            <span class="material-icons-round text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }, 300);
}

// Remove favorite
window.removeFavorite = function (slug) {
    if (confirm('Bạn có chắc muốn xóa phim này khỏi danh sách yêu thích?')) {
        userService.removeFromFavorites(slug);
        loadFavorites();
        showMessage('Đã xóa khỏi danh sách yêu thích', 'success');
    }
};

// Load history
function loadHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span class="ml-3 text-gray-400">Đang tải lịch sử xem...</span>
        </div>
    `;

    // Simulate loading delay
    setTimeout(() => {
        const history = userService.getWatchHistory();

        if (history.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400 py-8">Chưa có lịch sử xem</p>';
            return;
        }

        container.innerHTML = history.map(movie => {
            const watchedDate = new Date(movie.watchedAt).toLocaleDateString('vi-VN');
            const progress = userService.getWatchProgress(movie.slug, movie.episode);
            const progressPercent = progress.percentage || 0;

            return `
                <a href="movie-detail.html?slug=${movie.slug}" 
                   class="flex gap-4 p-4 bg-black/30 border border-white/5 rounded-lg hover:border-primary/50 transition-all group">
                    <div class="w-24 aspect-[2/3] flex-shrink-0 rounded-md overflow-hidden">
                        <img src="${movieAPI.getImageURL(movie.thumb_url)}" 
                             alt="${movie.name}"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                             onerror="this.src='https://via.placeholder.com/100x150?text=No+Image'" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-white group-hover:text-primary transition-colors truncate">
                            ${movie.name}
                        </h4>
                        <p class="text-sm text-gray-400 mt-1">
                            ${movie.episode ? `Tập ${movie.episode} • ` : ''}${movie.year}
                        </p>
                        <p class="text-xs text-gray-500 mt-2">Xem lúc: ${watchedDate}</p>
                        ${progressPercent > 0 ? `
                        <div class="mt-3">
                            <div class="w-full bg-gray-700 rounded-full h-1.5">
                                <div class="bg-primary h-1.5 rounded-full" style="width: ${progressPercent}%"></div>
                            </div>
                            <p class="text-xs text-gray-400 mt-1">${Math.round(progressPercent)}% hoàn thành</p>
                        </div>
                        ` : ''}
                    </div>
                </a>
            `;
        }).join('');
    }, 400);
}

// Clear history
window.clearHistory = function () {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử xem?')) {
        userService.clearHistory();
        loadHistory();
        showMessage('Đã xóa lịch sử xem', 'success');
    }
};

// Show tab
window.showTab = function (tabName) {
    // Hide all tab-content elements (including welcomeTab)
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-primary', 'bg-white/10');
        btn.classList.add('text-gray-300');
        btn.style.color = '';
        btn.style.backgroundColor = '';
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    // Add active class to the button matching this tab
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"], .tab-btn[onclick*="'${tabName}'"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = '#f2f20d';
        activeBtn.style.backgroundColor = 'rgba(255,255,255,0.1)';
    }

    // Load data based on selected tab (only if not loaded before)
    if (!loadedTabs.has(tabName)) {
        switch (tabName) {
            case 'profile':
                loadUserProfile();
                break;
            case 'subscription':
                loadSubscriptionInfo();
                break;
            case 'favorites':
                loadFavorites();
                break;
            case 'history':
                loadHistory();
                break;
        }
        loadedTabs.add(tabName);
    }
};

// Show message
function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[200] px-6 py-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        } text-white font-medium`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
