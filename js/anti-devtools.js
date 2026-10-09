/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          APHIM - ANTI DEVTOOLS & F12 PROTECTION v3.0         ║
 * ║   Bảo vệ website khỏi Inspect Element & Console Access     ║
 * ║   Tự động chuyển hướng YouTube khi cố tình F12             ║
 * ║   Miễn nhiễm 100% cho thiết bị Di Động / Mobile / Tablet   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ⚠️  LƯU Ý QUAN TRỌNG:
 *  - Script này bảo vệ frontend, chặn F12 / DevTools trên Desktop và tự động redirect sang YouTube.
 *  - Tối ưu 100% cho Mobile: Tránh tuyệt đối lỗi nhận diện nhầm do bàn phím ảo, xoay màn hình hay thanh địa chỉ URL.
 */

(function () {
    'use strict';

    // ══════════════════════════════════════════════════════
    // 0. CHỈ KÍCH HOẠT TRÊN PRODUCTION — BỎ QUA LOCALHOST
    // ══════════════════════════════════════════════════════
    const _host = window.location.hostname;

    // Danh sách môi trường DEV hoặc Admin Whitelist — script sẽ TẮT hoàn toàn
    const _devHosts = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '',           // file:// protocol
    ];

    // Cho phép bật chế độ Debug bằng tham số ?debug=1 hoặc qua localStorage
    const _isDebug = window.location.search.includes('debug=1') ||
                     (typeof localStorage !== 'undefined' && localStorage.getItem('aphim_debug') === 'true');

    // Nếu đang chạy local hoặc đang ở chế độ Debug → thoát ngay, không làm gì cả
    if (_isDebug || _devHosts.includes(_host) || _host.startsWith('192.168.') || _host.startsWith('10.')) {
        console.log('%c[APhim Dev Mode] Anti-DevTools TẮT trên localhost / Debug Mode ✓', 'color:#4ade80;font-weight:bold;font-size:13px;');
        return; // ← Thoát IIFE ngay lập tức
    }

    // ══════════════════════════════════════════════════════
    // 1. NHẬN DIỆN THIẾT BỊ DI ĐỘNG CHÍNH XÁC (MOBILE IMMUNITY)
    // ══════════════════════════════════════════════════════
    function isMobileDevice() {
        // A. User Agent tiêu chuẩn (Android, iPhone, iPad, Samsung Browser, Zalo, FB in-app browser, v.v.)
        const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'iemobile',
            'opera mini', 'mobile', 'crios', 'fxios', 'tablet', 'samsungbrowser',
            'huaweibrowser', 'miuibrowser', 'ucbrowser', 'zalo', 'fban', 'fbav'
        ];
        if (mobileKeywords.some(keyword => ua.includes(keyword))) {
            return true;
        }

        // B. Thiết bị hỗ trợ cảm ứng đa điểm với màn hình nhỏ/vừa (bao gồm iPad Pro, Foldables)
        const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
        const screenW = Math.min(window.screen.width || 9999, window.innerWidth || 9999);
        if (hasTouch && screenW <= 1180) {
            return true;
        }

        // C. Match Media Pointer Coarse (Đặc trưng màn hình cảm ứng)
        if (window.matchMedia && (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches)) {
            if (screenW <= 1180) return true;
        }

        return false;
    }

    // ══════════════════════════════════════════════════════
    // 2. HÀM CHUYỂN HƯỚNG HOẶC CẢNH BÁO
    // ══════════════════════════════════════════════════════
    const TARGET_REDIRECT_URL = 'https://www.youtube.com/';
    let _isRedirecting = false;

    function _redirectToYouTube() {
        // Tuyệt đối không chuyển hướng nếu đang ở chế độ an toàn hoặc mobile
        if (isMobileDevice() || _isDebug) return;
        // Hiển thị toast cảnh báo thay vì phá hủy DOM gây sập web
        _showWarningToast();
    }

    // ══════════════════════════════════════════════════════
    // 3. BẢO VỆ CONSOLE (Giữ nguyên console.error và console.warn để không che giấu lỗi hệ thống)
    // ══════════════════════════════════════════════════════
    const _noop = () => {};
    ['debug', 'dir', 'table'].forEach(method => {
        try { console[method] = _noop; } catch (e) {}
    });

    // ══════════════════════════════════════════════════════
    // 4. CHẶN PHÍM TẮT MỞ DEVTOOLS & VIEW-SOURCE TRÊN DESKTOP
    // ══════════════════════════════════════════════════════
    document.addEventListener('keydown', function (e) {
        if (isMobileDevice() || _isDebug) return; // Bỏ qua trên mobile & debug

        const key = e.key || '';
        const keyCode = e.keyCode || e.which;

        const blockedKeys = [
            // F12
            key === 'F12' || keyCode === 123,
            // Ctrl+Shift+I (Inspect)
            e.ctrlKey && e.shiftKey && (key === 'I' || key === 'i' || keyCode === 73),
            // Ctrl+Shift+J (Console)
            e.ctrlKey && e.shiftKey && (key === 'J' || key === 'j' || keyCode === 74),
            // Ctrl+Shift+C (Element picker)
            e.ctrlKey && e.shiftKey && (key === 'C' || key === 'c' || keyCode === 67),
            // Ctrl+U (View source)
            e.ctrlKey && (key === 'u' || key === 'U' || keyCode === 85),
            // Ctrl+S (Save page)
            e.ctrlKey && (key === 's' || key === 'S' || keyCode === 83),
            // Mac shortcuts
            e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c' || key === 'u'),
        ];

        if (blockedKeys.some(Boolean)) {
            e.preventDefault();
            e.stopPropagation();
            _showWarningToast();
            return false;
        }
    }, true);

    // ══════════════════════════════════════════════════════
    // 5. VÔ HIỆU HÓA CHUỘT PHẢI (Right-click) TRÊN DESKTOP
    // ══════════════════════════════════════════════════════
    document.addEventListener('contextmenu', function (e) {
        if (isMobileDevice() || _isDebug) return; // Cho phép thao tác chạm giữ bình thường trên mobile

        const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        _showWarningToast();
        return false;
    }, true);

    // ══════════════════════════════════════════════════════
    // 6. PHÁT HIỆN DEVTOOLS ĐANG MỞ (Kỹ thuật đo kích thước an toàn)
    // ══════════════════════════════════════════════════════
    let _devToolsOpen = false;
    let _overlayShownThisSession = false;
    let _consecutiveTriggers = 0;
    // Ngưỡng phát hiện an toàn 260px (tránh false positive do thanh bookmark / DPI scaling)
    const _THRESHOLD = 260;

    function _detectDevTools() {
        if (isMobileDevice() || _isDebug) return;

        // Bỏ qua nếu cửa sổ desktop bị thu nhỏ dưới 1024px để tránh nhầm khi chia đôi màn hình
        if (window.outerWidth < 1024 && window.outerHeight < 650) return;

        const widthThreshold  = (window.outerWidth  - window.innerWidth)  > _THRESHOLD;
        const heightThreshold = (window.outerHeight - window.innerHeight) > _THRESHOLD;

        if (widthThreshold || heightThreshold) {
            _consecutiveTriggers++;
            if (_consecutiveTriggers >= 4) { // Cần ít nhất 4 lần liên tiếp (2 giây)
                if (!_devToolsOpen) {
                    _devToolsOpen = true;
                    _onDevToolsOpen();
                }
            }
        } else {
            _consecutiveTriggers = 0;
            if (_devToolsOpen) {
                _devToolsOpen = false;
                _onDevToolsClosed();
            }
        }
    }

    // ══════════════════════════════════════════════════════
    // 7. XỬ LÝ KHI DEVTOOLS MỞ / ĐÓNG
    // ══════════════════════════════════════════════════════
    let _overlayAutoHideTimer = null;
    const _OVERLAY_DISPLAY_DURATION = 3000; // ms — hiện 3 giây

    function _onDevToolsOpen() {
        if (_overlayShownThisSession) return;
        _overlayShownThisSession = true;

        // Hiện overlay cảnh báo
        _showDevToolsOverlay();

        // Xóa console liên tục khi đang mở
        _startConsoleCleaner();

        // Tự ẩn sau _OVERLAY_DISPLAY_DURATION ms hoặc chuyển hướng YouTube
        clearTimeout(_overlayAutoHideTimer);
        _overlayAutoHideTimer = setTimeout(() => {
            _hideDevToolsOverlay();
            _redirectToYouTube();
        }, _OVERLAY_DISPLAY_DURATION);
    }

    function _onDevToolsClosed() {
        clearTimeout(_overlayAutoHideTimer);
        _hideDevToolsOverlay();
        _stopConsoleCleaner();
    }

    // ══════════════════════════════════════════════════════
    // 8. XÓA CONSOLE LIÊN TỤC KHI DEVTOOLS ĐANG MỞ
    // ══════════════════════════════════════════════════════
    let _consoleCleanerInterval = null;

    function _startConsoleCleaner() {
        if (_consoleCleanerInterval) return;
        _consoleCleanerInterval = setInterval(() => {
            try { window.console.clear(); } catch(e) {}
        }, 100);
    }

    function _stopConsoleCleaner() {
        if (_consoleCleanerInterval) {
            clearInterval(_consoleCleanerInterval);
            _consoleCleanerInterval = null;
        }
    }

    // ══════════════════════════════════════════════════════
    // 9. OVERLAY CẢNH BÁO (UI ĐẸP MẮT KHI PHÁT HIỆN DEVTOOLS)
    // ══════════════════════════════════════════════════════
    let _overlayEl = null;

    function _createOverlay() {
        if (_overlayEl) return;

        _overlayEl = document.createElement('div');
        _overlayEl.id = 'aphim-devtools-overlay';

        _overlayEl.setAttribute('style', [
            'position:fixed',
            'top:0', 'left:0', 'right:0', 'bottom:0',
            'z-index:2147483647',
            'background:rgba(0,0,0,0.94)',
            'display:flex',
            'flex-direction:column',
            'align-items:center',
            'justify-content:center',
            'font-family:Segoe UI,Arial,sans-serif',
            'color:white',
            'text-align:center',
            'padding:40px',
            'backdrop-filter:blur(20px)',
            '-webkit-backdrop-filter:blur(20px)',
            'opacity:0',
            'visibility:visible',
            'pointer-events:none',
            'transition:opacity 0.4s ease',
            'will-change:opacity'
        ].join(';'));

        _overlayEl.innerHTML = `
            <div id="_aphim_overlay_card" style="
                background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
                border:1px solid rgba(229,9,20,0.4);
                border-radius:20px;
                padding:50px 60px;
                max-width:500px;
                box-shadow:0 0 60px rgba(229,9,20,0.2),0 30px 60px rgba(0,0,0,0.5);
                transform:scale(0.9);
                transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
            ">
                <div style="font-size:72px;margin-bottom:20px;">🛡️</div>
                <h1 style="font-size:28px;font-weight:800;color:#e50914;margin:0 0 12px;letter-spacing:-0.5px;">
                    Khu Vực Được Bảo Vệ
                </h1>
                <p style="font-size:16px;color:rgba(255,255,255,0.7);margin:0 0 20px;line-height:1.6;">
                    Nội dung trang được bảo vệ bản quyền.<br>
                    <strong style="color:white;">Developer Tools</strong> đã bị phát hiện.
                </p>
                <div id="_aphim_countdown" style="
                    background: rgba(229, 9, 20, 0.15);
                    border: 1px solid rgba(229, 9, 20, 0.4);
                    border-radius: 10px;
                    padding: 12px 20px;
                    font-size: 14px;
                    color: rgba(255,255,255,0.85);
                    font-weight: 600;
                ">Thông báo sẽ tự đóng sau 3 giây...</div>
            </div>
        `;
        const parent = document.body || document.documentElement;
        if (parent) {
            parent.appendChild(_overlayEl);
            void _overlayEl.offsetHeight;
        }
    }

    function _showDevToolsOverlay() {
        if (isMobileDevice() || _isDebug) return;

        _createOverlay();
        if (!_overlayEl) return;

        _overlayEl.classList.add('is-visible');
        _overlayEl.style.opacity = '1';
        _overlayEl.style.pointerEvents = 'auto';
        const card = document.getElementById('_aphim_overlay_card');
        if (card) card.style.transform = 'scale(1)';

        let secs = Math.round(_OVERLAY_DISPLAY_DURATION / 1000);
        const countdownEl = document.getElementById('_aphim_countdown');
        const tick = setInterval(() => {
            secs--;
            if (countdownEl && secs > 0) {
                countdownEl.textContent = 'Thông báo sẽ tự đóng sau ' + secs + ' giây...';
            } else {
                clearInterval(tick);
            }
        }, 1000);
    }

    function _hideDevToolsOverlay() {
        if (!_overlayEl) return;
        _overlayEl.classList.remove('is-visible');
        _overlayEl.style.opacity = '0';
        _overlayEl.style.pointerEvents = 'none';
        const card = document.getElementById('_aphim_overlay_card');
        if (card) card.style.transform = 'scale(0.9)';
    }

    // ══════════════════════════════════════════════════════
    // 10. TOAST CẢNH BÁO NHỎ (khi nhấn phím bị chặn)
    // ══════════════════════════════════════════════════════
    let _toastTimeout = null;
    let _toastEl = null;

    function _createToast() {
        if (_toastEl) return;
        _toastEl = document.createElement('div');
        _toastEl.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(120px);
            opacity: 0;
            z-index: 2147483646;
            background: linear-gradient(135deg, #e50914, #c1121f);
            color: white;
            padding: 14px 28px;
            border-radius: 50px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(229, 9, 20, 0.4);
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                        opacity 0.25s ease;
            pointer-events: none;
            white-space: nowrap;
            will-change: transform, opacity;
        `;
        _toastEl.textContent = '🔒 Tính năng này bị vô hiệu hóa';
        const parent = document.body || document.documentElement;
        if (parent) {
            parent.appendChild(_toastEl);
            void _toastEl.offsetHeight;
        }
    }

    function _showWarningToast() {
        if (isMobileDevice()) return;

        _createToast();
        clearTimeout(_toastTimeout);

        requestAnimationFrame(() => {
            _toastEl.style.transform = 'translateX(-50%) translateY(0)';
            _toastEl.style.opacity   = '1';
        });

        _toastTimeout = setTimeout(() => {
            _toastEl.style.transform = 'translateX(-50%) translateY(120px)';
            _toastEl.style.opacity   = '0';
        }, 1200);
    }

    // ══════════════════════════════════════════════════════
    // 11. KHỞI ĐỘNG GIÁM SÁT ĐỊNH KỲ
    // ══════════════════════════════════════════════════════
    setInterval(_detectDevTools, 500);
    window.addEventListener('load', _detectDevTools);
    window.addEventListener('resize', _detectDevTools);

    // ══════════════════════════════════════════════════════
    // 12. XÓA SOURCE MAP REFERENCES (Tránh lộ code gốc)
    // ══════════════════════════════════════════════════════
    if (Error.prepareStackTrace) {
        Error.prepareStackTrace = (err, stack) => err.toString();
    }

    // ══════════════════════════════════════════════════════
    // 13. CHẶN DRAG & DROP & IN TRANG
    // ══════════════════════════════════════════════════════
    document.addEventListener('dragstart', function (e) {
        if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO')) {
            e.preventDefault();
        }
    });

    window.addEventListener('beforeprint', function (e) {
        if (!isMobileDevice()) {
            e.preventDefault();
            _redirectToYouTube();
        }
    });

})();




