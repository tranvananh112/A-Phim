// Admin Dashboard Script - Real-time MongoDB Connection
// Auto-detect environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://a-phim-production.up.railway.app/api';
let statsRefreshInterval = null;

document.addEventListener('DOMContentLoaded', function () {
    checkAdminAuth();
    loadDashboardStats();
    loadRevenueChart();
    loadViewsChart();
    loadRecentActivities();
    startAutoRefresh();
});

// Check admin authentication
function checkAdminAuth() {
    // Check both backend token and local token
    const backendToken = localStorage.getItem('cinestream_admin_token');
    const localToken = localStorage.getItem('cinestream_admin_token');

    if (!backendToken && !localToken) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Start auto refresh every 30 seconds
function startAutoRefresh() {
    statsRefreshInterval = setInterval(() => {
        loadDashboardStats(true); // Silent refresh
    }, 30000);
}

// Load dashboard statistics from MongoDB
async function loadDashboardStats(silent = false) {
    try {
        const token = localStorage.getItem('cinestream_admin_token') || sessionStorage.getItem('cinestream_admin_token');

        // Fetch user stats
        const usersResponse = await fetch(`${API_URL}/users/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Fetch movies count
        const moviesResponse = await fetch(`${API_URL}/movies?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (usersResponse.ok && moviesResponse.ok) {
            const usersData = await usersResponse.json();
            const moviesData = await moviesResponse.json();

            if (usersData.success) {
                const stats = usersData.data;

                // Update UI with real data
                updateStatCard('totalUsers', stats.totalUsers || 0, '+12%');
                updateStatCard('totalMovies', moviesData.total || 0, '+8%');
                updateStatCard('totalViews', formatNumber((stats.activeUsers || 0) * 150), '+23%');

                // Calculate estimated revenue (Premium users * 99,000đ)
                const estimatedRevenue = (stats.premiumUsers || 0) * 99000;
                updateStatCard('totalRevenue', formatCurrency(estimatedRevenue), '+15%');

                if (!silent) {
                    console.log('Dashboard stats updated from MongoDB:', stats);
                }
            }
        } else {
            throw new Error('Failed to fetch stats');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);

        if (!silent) {
            // Fallback to demo data
            updateStatCard('totalUsers', 0, '+12%');
            updateStatCard('totalMovies', 0, '+8%');
            updateStatCard('totalViews', '0', '+23%');
            updateStatCard('totalRevenue', '0đ', '+15%');
        }
    }
}

// Update stat card
function updateStatCard(id, value, change) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }

    const changeElement = document.getElementById(id + 'Change');
    if (changeElement) {
        changeElement.textContent = change;
    }
}

// Load revenue chart
function loadRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Simulated data
    const data = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
            label: 'Doanh thu (triệu đồng)',
            data: [45, 52, 48, 65, 72, 68, 85, 92, 88, 95, 102, 110],
            borderColor: ADMIN_CONFIG.CHART_COLORS.primary,
            backgroundColor: ADMIN_CONFIG.CHART_COLORS.primary + '20',
            tension: 0.4,
            fill: true
        }]
    };

    // Simple chart rendering (you can use Chart.js for better charts)
    renderSimpleLineChart(ctx, data);
}

// Load views chart
function loadViewsChart() {
    const ctx = document.getElementById('viewsChart');
    if (!ctx) return;

    // Simulated data
    const data = {
        labels: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        datasets: [{
            label: 'Lượt xem',
            data: [12500, 15200, 14800, 16500, 18200, 17800, 19500],
            borderColor: ADMIN_CONFIG.CHART_COLORS.success,
            backgroundColor: ADMIN_CONFIG.CHART_COLORS.success + '20',
            tension: 0.4,
            fill: true
        }]
    };

    renderSimpleLineChart(ctx, data);
}

// Simple line chart renderer
function renderSimpleLineChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get max value
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const range = maxValue - minValue;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height - padding * 2) * i / 5;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = data.datasets[0].borderColor;
    ctx.fillStyle = data.datasets[0].backgroundColor;
    ctx.lineWidth = 2;

    const points = data.datasets[0].data.map((value, index) => {
        const x = padding + (width - padding * 2) * index / (data.datasets[0].data.length - 1);
        const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
        return { x, y };
    });

    // Fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();

    // Draw points
    ctx.fillStyle = data.datasets[0].borderColor;
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    data.labels.forEach((label, index) => {
        const x = padding + (width - padding * 2) * index / (data.labels.length - 1);
        ctx.fillText(label, x, height - padding + 20);
    });
}

// Load recent activities
function loadRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;

    // Get recent data
    const users = JSON.parse(localStorage.getItem('cinestream_all_users') || '[]');
    const payments = JSON.parse(localStorage.getItem('cinestream_payment_history') || '[]');
    const comments = JSON.parse(localStorage.getItem('cinestream_comments') || '{}');

    const activities = [];

    // Add recent users
    users.slice(-5).forEach(user => {
        activities.push({
            type: 'user',
            icon: 'person_add',
            color: 'text-blue-500',
            message: `Người dùng mới: ${user.name}`,
            time: new Date(user.createdAt).toLocaleString('vi-VN')
        });
    });

    // Add recent payments
    payments.slice(-5).forEach(payment => {
        activities.push({
            type: 'payment',
            icon: 'payments',
            color: 'text-green-500',
            message: `Thanh toán: ${formatCurrency(payment.amount)}`,
            time: new Date(payment.createdAt).toLocaleString('vi-VN')
        });
    });

    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Render
    container.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span class="material-icons-round ${activity.color} text-lg">${activity.icon}</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">${activity.message}</p>
                <p class="text-xs text-gray-500 mt-1">${activity.time}</p>
            </div>
        </div>
    `).join('');
}

// Format number
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
