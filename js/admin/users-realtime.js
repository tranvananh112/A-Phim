// Admin Users Management - Real-time MongoDB Connection (Fixed for Tracking Prevention)
// Auto-detect environment
const API_URL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BACKEND_URL) 
    ? API_CONFIG.BACKEND_URL 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://a-phim-production-c87b.up.railway.app/api');
let currentPage = 1;
let itemsPerPage = 50;
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
        const token = sessionStorage.getItem('cinestream_admin_token');
        if (token) {
            console.log('✅ Token found in sessionStorage');
            return token;
        }
    } catch (e) {
        console.warn('SessionStorage blocked:', e);
    }

    // Try localStorage
    try {
        const token = localStorage.getItem('cinestream_admin_token');
        if (token) {
            console.log('✅ Token found in localStorage');
            // Save to sessionStorage for next time
            try {
                sessionStorage.setItem('cinestream_admin_token', token);
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
        sessionStorage.setItem('cinestream_admin_token', token);
        console.log('✅ Token saved to sessionStorage');
    } catch (e) {
        console.warn('SessionStorage blocked');
    }

    try {
        localStorage.setItem('cinestream_admin_token', token);
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
                // Clear tokens with correct keys
                try { sessionStorage.removeItem('cinestream_admin_token'); } catch (e) { }
                try { localStorage.removeItem('cinestream_admin_token'); } catch (e) { }

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
            updateStats();
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
                    <td colspan="8" class="p-8 text-center">
                        <div class="text-danger mb-4">
                            <i data-lucide="alert-circle" style="width: 2.5rem; height: 2.5rem;"></i>
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
                <td colspan="8" class="p-8 text-center">
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
                <td class="p-4">
                    <span class="text-gray-300">${user.phone || '<span class="text-gray-500 italic">Chưa có</span>'}</span>
                </td>
                <td class="p-4">${planBadge}</td>
                <td class="p-4 text-gray-400">${formatDate(user.createdAt)}</td>
                <td class="p-4 text-gray-400">${formatRelativeTime(user.lastActive)}</td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="viewUserDetail('${user.id}')" class="btn btn-secondary btn-icon btn-sm" title="Xem chi tiết">
                            <i data-lucide="eye"></i>
                        </button>
                        <button onclick="toggleUserStatus('${user.id}')" class="btn btn-icon btn-sm ${user.status === 'active' ? 'btn-danger' : 'btn-success'}" title="${user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}">
                            <i data-lucide="${user.status === 'active' ? 'ban' : 'check-circle'}"></i>
                        </button>
                        <button onclick="sendNotificationToUser('${user.id}')" class="btn btn-secondary btn-icon btn-sm" title="Gửi thông báo">
                            <i data-lucide="bell"></i>
                        </button>
                        <button onclick="deleteUser('${user.id}')" class="btn btn-secondary btn-sm btn-icon hover:bg-danger hover:text-white" title="Xóa tài khoản">
                            <i data-lucide="trash-2"></i>
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
        html += `<button onclick="goToPage(${currentPage - 1})" class="page-btn">
            <i data-lucide="chevron-left" style="width: 1.25rem; height: 1.25rem;"></i>
        </button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button onclick="goToPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">
                ${i}
            </button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2 text-gray-500">...</span>`;
        }
    }

    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})" class="page-btn">
            <i data-lucide="chevron-right" style="width: 1.25rem; height: 1.25rem;"></i>
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
        <div class="modal-box modal-box-lg">
            <div class="modal-header">
                <h3>Chi tiết người dùng</h3>
                <button onclick="closeModal()" class="modal-close"><i data-lucide="x"></i></button>
            </div>
            
            <div class="modal-body">
                <div style="display: flex; align-items: start; gap: 16px; margin-bottom: 24px;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; flex-shrink: 0;">
                        ${user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                        <h2 style="font-size: 24px; font-weight: bold; color: var(--text-primary); margin:0;">${user.name}</h2>
                        <p style="color: var(--text-muted); margin: 4px 0;">${user.email}</p>
                        <p style="font-size: 14px; color: var(--text-muted); margin:0;">${user.phone || 'Chưa có SĐT'}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                        <p style="color: var(--text-muted); font-size: 12px; margin: 0 0 4px 0;">Gói dịch vụ</p>
                        <p style="color: var(--text-primary); font-weight: bold; margin:0;">${user.subscription.plan}</p>
                    </div>
                    <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                        <p style="color: var(--text-muted); font-size: 12px; margin: 0 0 4px 0;">Trạng thái</p>
                        <p style="color: var(--text-primary); font-weight: bold; margin:0;">${user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</p>
                    </div>
                    <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                        <p style="color: var(--text-muted); font-size: 12px; margin: 0 0 4px 0;">Ngày đăng ký</p>
                        <p style="color: var(--text-primary); font-weight: bold; margin:0;">${formatDate(user.createdAt)}</p>
                    </div>
                    <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                        <p style="color: var(--text-muted); font-size: 12px; margin: 0 0 4px 0;">Lần cuối hoạt động</p>
                        <p style="color: var(--text-primary); font-weight: bold; margin:0;">${formatRelativeTime(user.lastActive)}</p>
                    </div>
                </div>
            </div>

            <div class="modal-footer" style="flex-wrap: wrap;">
                <button onclick="toggleUserStatus('${userId}')" class="btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}">
                    ${user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                </button>
                <button onclick="sendNotificationToUser('${userId}')" class="btn btn-primary">
                    Gửi thông báo
                </button>
                <button onclick="deleteUser('${userId}')" class="btn btn-secondary" style="border-color: var(--danger); color: var(--danger); width: 100%; margin-top: 8px;">
                    Xóa vĩnh viễn tài khoản
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

// Delete user from MongoDB
async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (!confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.name}" không?\nHành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu của người dùng này trên cơ sở dữ liệu MongoDB.`)) {
        return;
    }

    const token = getAdminToken();
    if (!token) {
        showToast('Vui lòng đăng nhập lại', 'error');
        return;
    }

    try {
        console.log(`🗑️ Deleting user ${userId}...`);

        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // The endpoint may return 204 No Content, in which case we shouldn't attempt to parse JSON.
        // Let's handle generic HTTP errors.
        if (!response.ok) {
            let errorMsg = 'Lỗi không xác định';
            try {
                const data = await response.json();
                if (data.message) errorMsg = data.message;
            } catch(e) {}
            throw new Error(errorMsg);
        }
        
        let data = { success: true };
        try {
            data = await response.json();
        } catch(e) {} // Ignore if no json body

        if (data.success || response.status === 200 || response.status === 204 || response.status === 201) {
            closeModal();
            showToast(`✅ Đã xóa tài khoản thành công`, 'success');

            // Reload to sync with database
            setTimeout(() => loadUsers(true), 1000);
        } else {
            throw new Error(data.message || 'Lỗi không xác định');
        }
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        showToast(`Lỗi xóa tài khoản: ${error.message}`, 'error');
    }
}

// Send notification to user
function sendNotificationToUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    closeModal();

    showModal(`
        <div class="modal-box">
            <div class="modal-header">
                <h3>Gửi thông báo</h3>
                <button onclick="closeModal()" class="modal-close"><i data-lucide="x"></i></button>
            </div>
            
            <form onsubmit="sendNotification(event, '${userId}')">
                <div class="modal-body">
                    <p style="color: var(--text-muted); margin-bottom: 16px;">Gửi đến: <span style="color: var(--text-primary); font-weight: bold;">${user.name}</span></p>
                    
                    <div style="margin-bottom: 16px;">
                        <label class="form-label" style="display:block; margin-bottom: 8px;">Tiêu đề</label>
                        <input type="text" id="notifTitle" required class="form-control-dark" placeholder="Nhập tiêu đề..." />
                    </div>
                    <div>
                        <label class="form-label" style="display:block; margin-bottom: 8px;">Nội dung</label>
                        <textarea id="notifMessage" required rows="4" class="form-control-dark" placeholder="Nhập nội dung thông báo..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
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
    modal.className = 'modal-overlay show';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    if (window.lucide) {
        lucide.createIcons();
    }
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

// Update stat cards
function updateStats() {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    
    const total = allUsers.length;
    const free = allUsers.filter(u => !u.subscription || !u.subscription.plan || u.subscription.plan.toUpperCase() === 'FREE').length;
    const premium = allUsers.filter(u => u.subscription && (u.subscription.plan.toUpperCase() === 'PREMIUM' || u.subscription.plan.toUpperCase() === 'FAMILY')).length;
    const blocked = allUsers.filter(u => u.status === 'blocked').length;

    el('statTotalUsers', total);
    el('statFreeUsers', free);
    el('statPremiumUsers', premium);
    el('statBlockedUsers', blocked);
}

// Logout
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        try { sessionStorage.removeItem('cinestream_admin_token'); } catch (e) { }
        try { localStorage.removeItem('cinestream_admin_token'); } catch (e) { }
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
window.deleteUser = deleteUser;
window.sendNotificationToUser = sendNotificationToUser;
window.sendNotification = sendNotification;
window.closeModal = closeModal;
window.logout = logout;
