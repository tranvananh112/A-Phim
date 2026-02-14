// Profile Page Script
document.addEventListener('DOMContentLoaded', function () {
    // Check if logged in
    if (!authService.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    loadUserProfile();
    setupProfileForm();
    setupPasswordForm();
    loadSubscriptionInfo();
    loadFavorites();
    loadHistory();
});

// Load user profile
function loadUserProfile() {
    const user = authService.getCurrentUser();
    if (!user) return;

    // Update sidebar
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;

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
    const subscription = userService.getSubscription();
    const container = document.getElementById('subscriptionInfo');

    if (!container) return;

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
}

// Load favorites
function loadFavorites() {
    const favorites = userService.getFavorites();
    const container = document.getElementById('favoritesList');

    if (!container) return;

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
    const history = userService.getWatchHistory();
    const container = document.getElementById('historyList');

    if (!container) return;

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
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-primary', 'bg-white/10');
        btn.classList.add('text-gray-300');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    // Add active class to clicked button
    event.target.closest('.tab-btn').classList.add('text-primary', 'bg-white/10');
    event.target.closest('.tab-btn').classList.remove('text-gray-300');
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
