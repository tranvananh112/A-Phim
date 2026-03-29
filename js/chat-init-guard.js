/**
 * A PHIM - Chat Widget Guard v1.2
 * 
 * CHÈN VÀO ĐẦU TIÊN TRONG <head> CỦA MỌI TRANG
 */
(function () {
    'use strict';

    // 1. Khai báo Tawk_API ngay lập tức
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    // Luôn gọi hideWidget khi sẵn sàng
    window.Tawk_API.onLoad = function () {
        try { window.Tawk_API.hideWidget(); } catch (e) {}
    };

    // 2. CSS Guard Cực mạnh & Vĩnh viễn (Chỉ tạo nếu chưa có inline)
    if (!document.getElementById('aphim-tawk-hide-guard')) {
        var style = document.createElement('style');
        style.id = 'aphim-tawk-guard';
        style.innerHTML = [
            /* Ẩn triệt để Tawk.to */
            '#tawk-widget-layer, [id^="tawk-"], [class^="tawk-"], [class*=" tawk-"], [id*="tawkchat"], iframe[title*="chat widget" i], iframe[src*="tawk.to"], .tawk-min-container, .tawk-button {',
            '  display: none !important;',
            '  opacity: 0 !important;',
            '  visibility: hidden !important;',
            '  pointer-events: none !important;',
            '  width: 0 !important;',
            '  height: 0 !important;',
            '  z-index: -9999 !important;',
            '  position: fixed !important;',
            '  left: -9999px !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // 3. MutationObserver - Diệt tận gốc nếu nó tự mọc ra
    var observer = new MutationObserver(function(mutations) {
        var guard = document.getElementById('aphim-tawk-guard');
        if (!guard) return; // Đã bị gỡ để show Tawk.to

        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.id && node.id.indexOf('tawk') !== -1) {
                    node.style.display = 'none';
                }
                if (node.className && typeof node.className === 'string' && node.className.indexOf('tawk') !== -1) {
                    node.style.display = 'none';
                }
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 4. Hàm giải phóng
    window.showTawkTo = function() {
        console.log('Tawk.to Guard: Releasing...');
        observer.disconnect();
        var guard = document.getElementById('aphim-tawk-guard');
        if (guard) guard.remove();
        var inlineGuard = document.getElementById('aphim-tawk-hide-guard');
        if (inlineGuard) inlineGuard.remove();
        
        if (window.Tawk_API && window.Tawk_API.showWidget) {
            try {
                window.Tawk_API.showWidget();
                window.Tawk_API.maximize();
            } catch(e) {}
        }
    };

    // 5. Material Icons Fix
    function fixIcons() {
        var existing = Array.from(document.querySelectorAll('link[href*="googleapis.com/icon"]')).map(l => l.href).join('');
        if (existing.indexOf('Material+Icons') === -1 || existing.indexOf('Material+Icons+') !== -1 && existing.indexOf('Material+Icons|') === -1 && existing.indexOf('|Material+Icons') === -1) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
            document.head.appendChild(link);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixIcons);
    } else {
        fixIcons();
    }
})();
