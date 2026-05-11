/**
 * REAL-TIME USER DATA SYNC MODULE
 * Automatically listens to backend updates via Socket.IO and instantly refreshes UI
 */

class RealtimeSync {
    constructor() {
        this.socket = null;
        this.backendUrl = (typeof API_CONFIG !== 'undefined' && API_CONFIG.BACKEND_URL) 
            ? API_CONFIG.BACKEND_URL.replace(/\/api$/, '') 
            : 'http://localhost:5000';
        
        console.log('🚀 [Realtime] Module starting...');
        
        // Use a more robust initialization sequence to avoid race conditions with authService
        if (document.readyState === 'complete') {
            this.delayedInit();
        } else {
            window.addEventListener('load', () => this.delayedInit());
        }
    }

    async delayedInit() {
        // Wait for authService to be available and stable
        let attempts = 0;
        while (typeof authService === 'undefined' && attempts < 15) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }

        if (typeof authService !== 'undefined' && authService.isLoggedIn()) {
            this.init();
        } else {
            console.log('ℹ️ [Realtime] User not logged in, socket connection deferred.');
        }
    }

    async init() {
        // 1. Dynamically load Socket.io Client if not present
        if (typeof io === 'undefined') {
            try {
                await this.loadScript('https://cdn.socket.io/4.7.2/socket.io.min.js');
            } catch (e) {
                console.error('❌ [Realtime] Socket.io script load failed:', e);
                return;
            }
        }

        const user = authService.getCurrentUser();
        // Robust ID check - MongoDB uses _id, some legacy code might use id
        const userId = user._id || user.id;
        
        if (!userId) {
            console.warn('⚠️ [Realtime] userId missing from auth record. Cannot listen for updates.');
            return;
        }

        console.log(`📡 [Realtime] Connecting to ${this.backendUrl} (User: ${userId})...`);

        // 2. Connect Socket
        this.socket = io(this.backendUrl, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            timeout: 10000
        });

        this.socket.on('connect', () => {
            console.log('✅ [Realtime] Connection established! ID:', this.socket.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error('❌ [Realtime] Connection error:', err.message);
        });

        // 3. LISTEN FOR ACCOUNT UPDATES (Xu, XP, Inventory)
        this.socket.on(`USER_UPDATE_${userId}`, async (data) => {
            console.warn('⚡ [Realtime] ACCOUNT UPDATE RECEIVED:', data);
            
            // Show visible feedback
            if (typeof showToast === 'function') {
                showToast('🚀 Tài khoản của bạn vừa được cập nhật!', 'success');
            } else if (typeof showMessage === 'function') {
                showMessage('🚀 Tài khoản của bạn vừa được cập nhật!', 'success');
            }
            
            const oldUser = authService.getCurrentUser();
            const oldCoins = oldUser ? (oldUser.coins || oldUser.xu || 0) : 0;

            // Trigger data re-fetch from /api/auth/me to sync localStorage
            await authService.syncProfile();
            
            const newUser = authService.getCurrentUser();
            const newCoins = newUser ? (newUser.coins || newUser.xu || 0) : (data.coins !== undefined ? data.coins : oldCoins);

            // Trigger global UI updates (Selectors like navbar, sidebar, etc.)
            this.updateGlobalSelectors(data);

            // Trigger specific page functions if they exist (AFTER sync is done)
            if (typeof updateJourneyUI === 'function') {
                console.log('[Realtime] Refreshing Journey UI...');
                updateJourneyUI();
            }
            if (typeof refreshAllUI === 'function') {
                console.log('[Realtime] Refreshing Profile UI...');
                refreshAllUI();
            }
            if (typeof updateBalanceDisplay === 'function') {
                console.log('[Realtime] Refreshing Balance Displays...');
                updateBalanceDisplay();
            }
            
            // Show notifications
            const displayMsg = data.message || 'Hệ thống đã cập nhật tài khoản của bạn';
            
            // Sync persistent notifications from backend
            if (typeof window.syncNotifications === 'function') {
                window.syncNotifications();
            }

            // Show popup toast
            if (data.coins !== undefined && typeof showCoinChange === 'function') {
                const diff = newCoins - oldCoins;
                if (diff !== 0) showCoinChange(diff, displayMsg);
            } else if (typeof showMessage === 'function') {
                showMessage(displayMsg, 'success');
            }
        });

        // 4. LISTEN FOR SYSTEM BROADCASTS
        this.socket.on('SYSTEM_NOTIFICATION', (data) => {
            console.log('📢 [Realtime] System broadcast:', data);
            if (typeof window.syncNotifications === 'function') {
                window.syncNotifications();
            }
            if (typeof showMessage === 'function') {
                showMessage(data.message, 'info', 6000);
            }
        });
    }

    updateGlobalSelectors(data) {
        // --- 1. COINS (Xu) ---
        if (data.coins !== undefined) {
            const coinValue = Number(data.coins);
            const coinIds = [
                'sidebarXuBalance', 
                'shopBalance', 
                'xuModalBalance', 
                'userCoinsText', 
                'heroXuBalance', 
                'navXuText',
                'heroCoinPill'
            ];
            
            coinIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    el.style.transform = 'scale(1.4)';
                    el.style.color = '#4ade80';
                    
                    // Simple text update
                    el.textContent = coinValue.toLocaleString('vi-VN');

                    setTimeout(() => {
                        el.style.transform = 'scale(1)';
                        el.style.color = '';
                    }, 1500);
                }
            });
        }

        // --- 2. XP & LEVEL ---
        if (data.xp !== undefined) {
            const currentXP = Number(data.xp);
            const level = Math.floor(currentXP / 30) + 1;
            const currentXPInLevel = currentXP % 30;
            const nextLevel = level + 1;

            const xpIds = ['currentXP', 'statXP', 'heroXPText'];
            const lvlIds = ['statLevel', 'currentLevelLabel', 'heroLevelPill', 'navLevelText', 'nextLevel'];
            const neededXPIds = ['neededXP', 'xpToNextLv'];

            xpIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = currentXP;
                    el.style.transform = 'scale(1.2)';
                    setTimeout(() => { el.style.transform = 'scale(1)'; }, 500);
                }
            });

            lvlIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (id === 'heroLevelPill') el.textContent = `Cấp ${level}`;
                    else if (id === 'nextLevel') el.textContent = nextLevel;
                    else el.textContent = level;
                }
            });

            neededXPIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (id === 'neededXP') el.textContent = `${currentXPInLevel}/30`;
                    else el.textContent = 30 - currentXPInLevel;
                }
            });

            // Update Progress Bar
            const xpBar = document.getElementById('xpProgressBar');
            if (xpBar) {
                const pct = (currentXPInLevel / 30) * 100;
                xpBar.style.width = `${pct}%`;
            }
        }

        // --- 3. SUBSCRIPTION (New) ---
        if (data.subscription) {
            const plan = data.subscription.plan || 'FREE';
            const subIds = ['heroPlanBadge', 'sidebarPlanLabel', 'epPlanBadge'];
            
            subIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = plan === 'FREE' ? 'Khán Giả' : plan;
                    el.style.animation = 'pulse-gold 1.5s infinite';
                }
            });
            
            // Auto-refresh subscription tab if visible
            if (typeof loadSubscriptionInfo === 'function') {
                loadSubscriptionInfo();
            }
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src; s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.rtSync = new RealtimeSync();
});
