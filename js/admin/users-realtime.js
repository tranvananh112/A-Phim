// Admin Users Management - Real-time MongoDB Connection (Fixed for Tracking Prevention)
// Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://a-phim-production.up.railway.app/api';
let currentPage = 1;
let itemsPerPage = 10;
let allUsers = [];
let filteredUsers = [];
let selectedUsers = [];
let autoRefreshInterval = null;

// Filters
let filters = {
    search: '',
    plan: '',
    status: ''
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Users page loaded - Real-time MongoDB mode');
    checkAdminAuth();
    loadUsers();
    setupEventListeners();
    startAutoRefresh();
});

// Get token with fallback for tracking prevention
function getAdminToken() {
    // Try sessionStorage first (less likely to be blocked)
    try {
        const token = sessionStorage.getItem('admin_token');
        if (token) {
            console.log('✅ Token found in sessionStorage');
            return token;
        }
    } catch (e) {
        console.warn('SessionStorage blocked:', e);
    }

    // Try localStorage
    try {
        const token = localStorage.getItem('admin_token');
        if (token) {
            console.log('✅ Token found in localStorage');
            // Save to sessionStorage for next time
            try {
                sessionStorage.setItem('admin_token', token);
            } catch (e) { }
            return token;
        }
    } catch (e) {
        console.warn('LocalStorage blocked:', e);
    }

    console.warn('❌ No token found');
    return null;
}

// Save token with fallback
function saveAdminToken(token) {
    try {
        sessionStorage.setItem('admin_token', token);
        console.log('✅ Token saved to sessionStorage');
    } catch (e) {
        console.warn('SessionStorage blocked');
    }

    try {
        localStorage.setItem('admin_token', token);
        console.log('✅ Token saved to localStorage');
    } catch (e) {
        console.warn('LocalStorage blocked');
    }
}

// Check admin authentication
function checkAdminAuth() {
    const token = getAdminToken();
    if (!token) {
        console.warn('⚠️ No admin token found, redirecting to login...');
        showToast('Vui lòng đăng nhập', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    console.log('✅ Admin authenticated');
    return true;
}

// Start auto refresh
function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing users...');
        loadUsers(true);
    }, 30000);
}

// Stop auto refresh
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Load all users from MongoDB via API
async function loadUsers(silent = false) {
    if (!silent) {
        showLoadingState();
        console.log('📡 Loading users from MongoDB...');
    }

    const token = getAdminToken();
    if (!token) {
        showToast('Vui lòng đăng nhập lại', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Unauthorized - Token invalid');
                // Clear tokens
                try { sessionStorage.removeItem('admin_token'); } catch (e) { }
                try { localStorage.removeItem('admin_token'); } catch (e) { }

                showToast('Token không hợp lệ. Đang chuyển đến trang đăng nhập...', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📊 API Response:', data);

        if (data.success) {
            // Transform MongoDB data to frontend format
            allUsers = data.data.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
                subscription: user.subscription || { plan: 'FREE' },
                status: user.isBlocked ? 'blocked' : 'active',
                isActive: user.isActive,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                lastActive: user.lastLogin || user.updatedAt,
                role: user.role
            }));

            filteredUsers = [...allUsers];
            renderUsers();

            const message = `✅ Đã tải ${allUsers.length} người dùng từ MongoDB`;
            console.log(message);
            if (!silent) {
                showToast(message, 'success');
            }
        } else {
            throw new Error(data.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('❌ Error loading users from MongoDB:', error);

        const errorMessage = `Lỗi kết nối MongoDB: ${error.message}`;
        showToast(errorMessage, 'error');

        // Show error in table
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center">
                        <div class="text-red-400 mb-4">
                            <span class="material-icons-outlined text-4xl">error</span>
                        </div>
                        <p class="text-white font-semibold mb-2">Không thể tải dữ liệu từ MongoDB</p>
                        <p class="text-gray-400 text-sm mb-4">${error.message}</p>
                        <button onclick="loadUsers()" class="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90">
                            Thử lại
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filters.search = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateSelectedUsers();
        });
    }
}

// Apply filters
function applyFilters() {
    const planFilter = document.getElementById('planFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (planFilter) filters.plan = planFilter.value;
    if (statusFilter) filters.status = statusFilter.value;

    filteredUsers = allUsers.filter(user => {
        if (filters.search) {
            const searchMatch = user.name.toLowerCase().includes(filters.search) ||
                user.email.toLowerCase().includes(filters.search);
            if (!searchMatch) return false;
        }

        if (filters.plan && user.subscription.plan !== filters.plan) {
            return false;
        }

        if (filters.status && user.status !== filters.status) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    renderUsers();
}

// Reset filters
function resetFilters() {
    filters = { search: '', plan: '', status: '' };

    const searchInput = document.getElementById('searchInput');
    const planFilter = document.getElementById('planFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) searchInput.value = '';
    if (planFilter) planFilter.value = '';
    if (statusFilter) statusFilter.value = '';

    filteredUsers = [...allUsers];
    currentPage = 1;
    renderUsers();
}

// Show loading state
function showLoadingState() {
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="p-8 text-center">
                    <div class="flex items-center justify-center gap-3">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span class="text-gray-400">Đang tải dữ liệu từ MongoDB...</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Render users table
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('emptyState');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalCountEl = document.getElementById('totalCount');

    if (!tbody) {
        console.error('❌ usersTableBody not found');
        return;
    }

    // Update total count
    if (totalUsersEl) totalUsersEl.textContent = allUsers.length;
    if (totalCountEl) totalCountEl.textContent = filteredUsers.length;

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
    const pageUsers = filteredUsers.slice(startIndex, endIndex);

    // Update showing count
    const showingFrom = document.getElementById('showingFrom');
    const showingTo = document.getElementById('showingTo');
    if (showingFrom) showingFrom.textContent = filteredUsers.length > 0 ? startIndex + 1 : 0;
    if (showingTo) showingTo.textContent = endIndex;

    if (pageUsers.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = pageUsers.map(user => {
        const planBadge = getPlanBadge(user.subscription.plan);
        const statusBadge = getStatusBadge(user.status);
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);

        return `
            <tr class="hover:bg-white/5 transition-colors ${user.status === 'blocked' ? 'opacity-60' : ''}">
                <td class="p-4">
                    <input type="checkbox" class="user-checkbox rounded border-gray-600 text-primary focus:ring-primary" data-user-id="${user.id}" />
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            ${initials}
                        </div>
                        <div>
                            <p class="font-medium text-white">${user.name}</p>
                            <p class="text-xs text-gray-400">${user.email}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">${planBadge}</td>
                <td class="p-4 text-gray-400">${formatDate(user.createdAt)}</td>
                <td class="p-4 text-gray-400">${formatRelativeTime(user.lastActive)}</td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="viewUserDetail('${user.id}')" class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Xem chi tiết">
                            <span class="material-icons-outlined text-lg">visibility</span>
                        </button>
                        <button onclick="toggleUserStatus('${user.id}')" class="p-2 ${user.status === 'active' ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'} hover:text-white rounded-lg transition-colors" title="${user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}">
                            <span class="material-icons-outlined text-lg">${user.status === 'active' ? 'block' : 'check_circle'}</span>
                        </button>
                        <button onclick="sendNotificationToUser('${user.id}')" class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Gửi thông báo">
                            <span class="material-icons-outlined text-lg">notifications</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Add event listeners to checkboxes
    document.querySelectorAll('.user-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSelectedUsers);
    });

    renderPagination();
}

// Get plan badge HTML
function getPlanBadge(plan) {
    const badges = {
        'FREE': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">Free</span>',
        'PREMIUM': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-black">Premium</span>',
        'FAMILY': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500 text-white">Family</span>'
    };
    return badges[plan] || badges['FREE'];
}

// Get status badge HTML
function getStatusBadge(status) {
    if (status === 'active') {
        return `
            <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                <span class="text-green-500 font-medium text-xs">Hoạt động</span>
            </div>
        `;
    } else {
        return `
            <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span class="text-red-500 font-medium text-xs">Bị khóa</span>
            </div>
        `;
    }
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

// Format relative time
function formatRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    return formatDate(dateStr);
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const pagination = document.getElementById('pagination');

    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    if (currentPage > 1) {
        html += `<button onclick="goToPage(${currentPage - 1})" class="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors">
            <span class="material-icons-outlined text-sm">chevron_left</span>
        </button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button onclick="goToPage(${i})" class="px-3 py-1.5 ${i === currentPage ? 'bg-primary text-black font-bold' : 'bg-white/5 text-gray-300'} rounded-lg hover:bg-primary/80 transition-colors">
                ${i}
            </button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2 text-gray-500">...</span>`;
        }
    }

    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})" class="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors">
            <span class="material-icons-outlined text-sm">chevron_right</span>
        </button>`;
    }

    pagination.innerHTML = html;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    renderUsers();
}

// Update selected users
function updateSelectedUsers() {
    selectedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked'))
        .map(cb => cb.dataset.userId);
}

// View user detail
function viewUserDetail(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    showModal(`
        <div class="bg-surface-dark border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                        ${user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">${user.name}</h2>
                        <p class="text-gray-400">${user.email}</p>
                        <p class="text-gray-400 text-sm">${user.phone || 'Chưa có SĐT'}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white">
                    <span class="material-icons-outlined">close</span>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-white/5 rounded-lg p-4">
                    <p class="text-gray-400 text-sm mb-1">Gói dịch vụ</p>
                    <p class="text-white font-bold">${user.subscription.plan}</p>
                </div>
                <div class="bg-white/5 rounded-lg p-4">
                    <p class="text-gray-400 text-sm mb-1">Trạng thái</p>
                    <p class="text-white font-bold">${user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</p>
                </div>
                <div class="bg-white/5 rounded-lg p-4">
                    <p class="text-gray-400 text-sm mb-1">Ngày đăng ký</p>
                    <p class="text-white font-bold">${formatDate(user.createdAt)}</p>
                </div>
                <div class="bg-white/5 rounded-lg p-4">
                    <p class="text-gray-400 text-sm mb-1">Lần cuối hoạt động</p>
                    <p class="text-white font-bold">${formatRelativeTime(user.lastActive)}</p>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button onclick="toggleUserStatus('${userId}')" class="flex-1 py-2.5 ${user.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-semibold rounded-lg transition-colors">
                    ${user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                </button>
                <button onclick="sendNotificationToUser('${userId}')" class="flex-1 py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                    Gửi thông báo
                </button>
            </div>
        </div>
    `);
}

// Toggle user status - Update MongoDB
async function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'khóa' : 'mở khóa';

    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name}"?`)) {
        return;
    }

    const token = getAdminToken();
    if (!token) {
        showToast('Vui lòng đăng nhập lại', 'error');
        return;
    }

    try {
        console.log(`🔄 ${action} user ${userId}...`);

        const response = await fetch(`${API_URL}/users/${userId}/block`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isBlocked: newStatus === 'blocked'
            })
        });

        const data = await response.json();
        console.log('📊 Toggle response:', data);

        if (data.success) {
            user.status = newStatus;
            user.isBlocked = newStatus === 'blocked';
            renderUsers();
            closeModal();
            showToast(`✅ Đã ${action} tài khoản thành công`, 'success');

            // Reload to sync with database
            setTimeout(() => loadUsers(true), 1000);
        } else {
            throw new Error(data.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('❌ Error toggling user status:', error);
        showToast(`Lỗi: ${error.message}`, 'error');
    }
}

// Send notification to user
function sendNotificationToUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    closeModal();

    showModal(`
        <div class="bg-surface-dark border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">Gửi thông báo</h2>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white">
                    <span class="material-icons-outlined">close</span>
                </button>
            </div>
            
            <p class="text-gray-400 mb-4">Gửi đến: <span class="text-white font-semibold">${user.name}</span></p>
            
            <form onsubmit="sendNotification(event, '${userId}')">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Tiêu đề</label>
                        <input type="text" id="notifTitle" required class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary" placeholder="Nhập tiêu đề..." />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-2">Nội dung</label>
                        <textarea id="notifMessage" required rows="4" class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-primary" placeholder="Nhập nội dung thông báo..."></textarea>
                    </div>
                    <button type="submit" class="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                        Gửi thông báo
                    </button>
                </div>
            </form>
        </div>
    `);
}

// Send notification
function sendNotification(event, userId) {
    event.preventDefault();

    const title = document.getElementById('notifTitle').value;
    const message = document.getElementById('notifMessage').value;

    // Save notification (try both storage methods)
    try {
        const notifications = JSON.parse(localStorage.getItem('cinestream_notifications') || '[]');
        notifications.push({
            id: Date.now().toString(),
            userId,
            title,
            message,
            createdAt: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('cinestream_notifications', JSON.stringify(notifications));
    } catch (e) {
        console.warn('Could not save to localStorage');
    }

    closeModal();
    showToast('Đã gửi thông báo thành công', 'success');
}

// Show modal
function showModal(html) {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.remove();
}

// Show toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[200] px-6 py-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        } text-white font-medium animate-fade-in`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        try { sessionStorage.removeItem('admin_token'); } catch (e) { }
        try { localStorage.removeItem('admin_token'); } catch (e) { }
        window.location.href = 'login.html';
    }
}

// Export functions for global access
window.loadUsers = loadUsers;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.goToPage = goToPage;
window.viewUserDetail = viewUserDetail;
window.toggleUserStatus = toggleUserStatus;
window.sendNotificationToUser = sendNotificationToUser;
window.sendNotification = sendNotification;
window.closeModal = closeModal;
window.logout = logout;
