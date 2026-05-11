/**
 * A PHIM - Chat Widget Guard v1.2
 * 
 * CHÈN VÀO ĐẦU TIÊN TRONG <head> CỦA MỌI TRANG
 */
(function () {
    'use strict';

    // 0. TĂNG TỐC ĐỘ MPA (Giả SPA) VÀ AUTH GUARD CHỐNG CHỚP NHÁY
    try {
        // A. Instant Page đã bị loại bỏ để tránh lỗi 503 Service Unavailable do prefetch quá nhiều
        
        // B. Xử lý đồng bộ thay thế Avatar chống nháy (FOUC) - ĐÃ CHUYỂN SANG user-ui.js
        // Phần này trước đây thay thế nút Login bằng Avatar cũ, gây ra lỗi nhân bản Profile.
    } catch (e) {}

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
