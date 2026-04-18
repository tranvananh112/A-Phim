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

    const userId = user._id || user.id || user.email;
    const avatarContainer = document.getElementById('userAvatar');

    // Helper: render avatar
    function renderAvatar(url) {
        if (url) {
            avatarContainer.innerHTML = `<img src="${url}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML=user.name.charAt(0).toUpperCase()" />`;
        } else {
            avatarContainer.innerHTML = user.name.charAt(0).toUpperCase();
        }
    }

    // 1. Render backend avatar instantly (from localStorage user object)
    renderAvatar(user.avatar);

    // 2. Use avatarService to load per-user avatar (local then Firestore sync)
    if (typeof avatarService !== 'undefined') {
        avatarService.loadAvatar(userId, function(avatarUrl) {
            renderAvatar(avatarUrl);
            // Sync back into user object so auth module stays consistent
            if (avatarUrl && user.avatar !== avatarUrl) {
                user.avatar = avatarUrl;
                try { localStorage.setItem('cinestream_user', JSON.stringify(user)); } catch(e) {}
            }
        });
    }

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

// ─── Premium Toast Notification ──────────────────────────────────────────
const TOAST_ICONS = {
    success : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error   : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>`,
    warning : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

// Inject toast styles once
(function injectToastCSS() {
    if (document.getElementById('ap-toast-css')) return;
    const s = document.createElement('style');
    s.id = 'ap-toast-css';
    s.textContent = `
        #ap-toast-stack {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .ap-toast {
            pointer-events: all;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 14px;
            min-width: 260px;
            max-width: 360px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            font-family: 'Be Vietnam Pro','Space Grotesk',sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            cursor: pointer;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .ap-toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        .ap-toast::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            height: 3px;
            width: 100%;
            background: rgba(255,255,255,0.4);
            animation: ap-toast-bar var(--toast-duration, 3s) linear forwards;
            transform-origin: left;
        }
        @keyframes ap-toast-bar {
            from { transform: scaleX(1); }
            to   { transform: scaleX(0); }
        }
        .ap-toast-success { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
        .ap-toast-error   { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
        .ap-toast-info    { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); }
        .ap-toast-warning { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
        .ap-toast-icon {
            flex-shrink: 0;
            width: 22px; height: 22px;
            display: flex; align-items: center; justify-content: center;
        }
        .ap-toast-icon svg { width: 100%; height: 100%; }
        .ap-toast-close {
            margin-left: auto;
            flex-shrink: 0;
            width: 20px; height: 20px;
            opacity: 0.6;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%;
            transition: opacity 0.2s, background 0.2s;
        }
        .ap-toast-close:hover { opacity: 1; background: rgba(255,255,255,0.2); }
        .ap-toast-close svg { width: 14px; height: 14px; }
        @media (max-width: 480px) {
            #ap-toast-stack { top: auto; bottom: 80px; right: 10px; left: 10px; }
            .ap-toast { min-width: unset; max-width: unset; width: 100%; }
        }
    `;
    document.head.appendChild(s);
})();

function getToastStack() {
    let stack = document.getElementById('ap-toast-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.id = 'ap-toast-stack';
        document.body.appendChild(stack);
    }
    return stack;
}

function showMessage(message, type = 'info', duration = 3500) {
    const stack = getToastStack();
    const icon = TOAST_ICONS[type] || TOAST_ICONS.info;
    const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    const toast = document.createElement('div');
    toast.className = `ap-toast ap-toast-${type}`;
    toast.style.setProperty('--toast-duration', duration + 'ms');
    toast.innerHTML = `
        <span class="ap-toast-icon">${icon}</span>
        <span style="flex:1;line-height:1.4">${message}</span>
        <span class="ap-toast-close" onclick="this.closest('.ap-toast')._dismiss()">${closeIcon}</span>
    `;

    const dismiss = () => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 350);
    };
    toast._dismiss = dismiss;
    toast.addEventListener('click', dismiss);

    stack.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

    setTimeout(dismiss, duration);
}


// Avatar selection for profile
const PROFILE_AVATAR_LIST = [
    "https://i.ex-cdn.com/giadinhmoi.vn/files/content/2024/12/13/470107535_1156674079362932_3220600486106282952_n-0953.jpg",
    "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/07/anh-son-tung-2.jpg",
    "https://cdn2.fptshop.com.vn/unsafe/800x0/anh_lisa_6_d83ab4e404.jpg",
    "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482756agE/anh-mo-ta.png",
    "https://tophinhanh.net/wp-content/uploads/2023/12/anh-kim-jisoo-cute-1.jpg",
    "https://i.pinimg.com/736x/3c/d7/24/3cd724dd754d0b42bd6599efe18ceff0.jpg"
];

function toggleAvatarSelect(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const dropdown = document.getElementById('avatarSelectDropdown');
    if (!dropdown) return;

    if (dropdown.classList.contains('hidden')) {
        // Initialize avatars UI if empty
        const grid = document.getElementById('avatarGrid');
        if (grid && grid.children.length === 0) {
            let html = '';
            PROFILE_AVATAR_LIST.forEach(url => {
                html += `<img src="${url}" class="relative w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-[1.35] hover:z-50 transition-all duration-300 hover:border-primary border-2 border-transparent shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(242,242,13,0.5)]" onclick="selectAvatar(event, '${url}')">`;
            });
            grid.innerHTML = html;
        }
        dropdown.classList.remove('hidden');
        
        // Hide when clicking outside
        const outsideClickListener = (event) => {
            if (!event.target.closest('#profileAvatarSection')) {
                dropdown.classList.add('hidden');
                document.removeEventListener('click', outsideClickListener);
            }
        };
        setTimeout(() => document.addEventListener('click', outsideClickListener), 10);
    } else {
        dropdown.classList.add('hidden');
    }
}

async function selectAvatar(e, url) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    document.getElementById('avatarSelectDropdown').classList.add('hidden');

    if (!authService.isLoggedIn()) {
        showMessage('Vui lòng đăng nhập để thay đổi hình đại diện', 'error');
        return;
    }

    const user    = authService.getCurrentUser();
    const userId  = user._id || user.id || user.email;
    const userAvatar = document.getElementById('userAvatar');

    // Optimistic UI: show chosen avatar immediately
    if (userAvatar) {
        userAvatar.innerHTML = `<img src="${url}" class="w-full h-full object-cover" />`;
    }
    // Show saving indicator
    showMessage('Đang lưu hình đại diện...', 'info');

    try {
        // Use dual-storage avatarService (local + Firestore + backend)
        let result;
        if (typeof avatarService !== 'undefined') {
            result = await avatarService.saveAvatar(userId, url);
        } else {
            // Fallback: only backend + legacy localStorage
            result = await authService.updateProfile({ avatar: url });
            if (result.success) {
                localStorage.setItem('ap_chosen_avatar', url);
            }
        }

        if (result && result.success) {
            showMessage('Cập nhật hình đại diện thành công!', 'success');

            // Refresh UI with final state
            loadBasicUserInfo();
            if (typeof updateUserUI === 'function') setTimeout(updateUserUI, 100);
        } else {
            showMessage('⚠️ ' + (result && result.message ? result.message : 'Cập nhật thất bại'), 'error');
            loadBasicUserInfo(); // revert
        }
    } catch (error) {
        console.error('[profile] selectAvatar error:', error);
        showMessage('Lỗi kết nối', 'error');
        loadBasicUserInfo(); // revert
    }
}
