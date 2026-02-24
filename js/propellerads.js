/**
 * PropellerAds Integration - Direct Link + Push Notifications
 * Quản lý quảng cáo từ PropellerAds
 */

class PropellerAdsManager {
    constructor(config = {}) {
        // Direct Link
        this.directLinkId = config.directLinkId || '10647261';
        this.directLinkUrl = config.directLinkUrl || `//rm358.com/4/${this.directLinkId}`;
        this.directLinkEnabled = config.directLinkEnabled !== false;
        this.triggerOnClick = config.triggerOnClick !== false;
        this.maxPerSession = config.maxPerSession || 2;
        this.storageKey = 'propeller_directlink_count';

        // Push Notifications
        this.pushId = config.pushId || '10647059';
        this.pushEnabled = config.pushEnabled !== false;

        if (this.directLinkEnabled || this.pushEnabled) {
            this.init();
        }
    }

    init() {
        // Load Push Notifications
        if (this.pushEnabled) {
            this.loadPushNotifications();
        }

        // Setup Direct Link
        if (this.directLinkEnabled) {
            console.log('PropellerAds Direct Link initialized:', this.directLinkUrl);
            if (this.triggerOnClick) {
                this.setupClickTrigger();
            }
        }
    }

    // Load Push Notifications
    loadPushNotifications() {
        console.log('PropellerAds Push Notifications initialized:', this.pushId);

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://cdn.propellerads.com/push/${this.pushId}.js`;
        script.onerror = () => {
            console.error('PropellerAds: Failed to load push notifications');
        };
        document.head.appendChild(script);
    }

    // Setup trigger khi user click vào trang
    setupClickTrigger() {
        let clickCount = 0;
        const maxClicks = this.maxPerSession;

        // Lấy số lần đã click trong session
        const sessionCount = sessionStorage.getItem(this.storageKey);
        if (sessionCount) {
            clickCount = parseInt(sessionCount);
        }

        // Lắng nghe click event
        document.addEventListener('click', (e) => {
            // Bỏ qua nếu đã đạt giới hạn
            if (clickCount >= maxClicks) {
                return;
            }

            // Bỏ qua click vào link, button, input
            if (e.target.tagName === 'A' ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'INPUT') {
                return;
            }

            // Trigger direct link
            this.openDirectLink();
            clickCount++;
            sessionStorage.setItem(this.storageKey, clickCount.toString());

            console.log(`PropellerAds: Direct link opened (${clickCount}/${maxClicks})`);
        }, { once: false });
    }

    // Mở Direct Link
    openDirectLink(sourceId = '') {
        const url = sourceId ?
            `${this.directLinkUrl}?var=${sourceId}` :
            this.directLinkUrl;

        // Mở trong tab mới
        const win = window.open(url, '_blank');
        if (win) {
            win.focus();
        }
    }

    // Tạo link Direct Link để dùng trong HTML
    getDirectLinkUrl(sourceId = '') {
        return sourceId ?
            `${this.directLinkUrl}?var=${sourceId}` :
            this.directLinkUrl;
    }

    // Disable tạm thời
    disable() {
        this.directLinkEnabled = false;
        this.pushEnabled = false;
        console.log('PropellerAds: Disabled');
    }

    // Enable lại
    enable() {
        this.directLinkEnabled = true;
        this.pushEnabled = true;
        this.init();
    }

    // Reset counter
    resetCounter() {
        sessionStorage.removeItem(this.storageKey);
        console.log('PropellerAds: Counter reset');
    }

    // Lấy thống kê
    getStats() {
        const count = parseInt(sessionStorage.getItem(this.storageKey) || '0');
        return {
            clickedToday: count,
            maxPerSession: this.maxPerSession,
            remaining: Math.max(0, this.maxPerSession - count),
            canShow: count < this.maxPerSession
        };
    }
}

// Export
window.PropellerAdsManager = PropellerAdsManager;

// Khởi tạo mặc định với cả Direct Link và Push Notifications
window.propellerAdsManager = new PropellerAdsManager({
    // Direct Link
    directLinkId: '10647261',
    directLinkUrl: '//rm358.com/4/10647261',
    directLinkEnabled: true,
    triggerOnClick: true,
    maxPerSession: 2,

    // Push Notifications
    pushId: '10647059',
    pushEnabled: true
});

console.log('PropellerAds Manager initialized (Direct Link + Push Notifications)');
