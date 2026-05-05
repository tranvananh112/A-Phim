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
        /*
        if (!document.getElementById('instant-page-script')) {
            ...
        }
        */

        // B. Xử lý đồng bộ thay thế Avatar chống nháy (FOUC)
        var userStr = localStorage.getItem('cinestream_user'); // STORAGE_KEYS.USER
        if (userStr) {
            var userObj = JSON.parse(userStr);
            if (userObj) {
                // Chặn hiển thị nút login bằng CSS cứng để tuyệt đối ko flash
                var authStyle = document.createElement('style');
                authStyle.innerHTML = 'a[href="login.html"] { display: none !important; opacity: 0 !important; visibility: hidden !important; }';
                document.head.appendChild(authStyle);
                
                // Cài đặc vụ ngầm theo dõi lúc trình duyệt Parse HTML
                var authObserver = new MutationObserver(function() {
                    var loginBtn = document.querySelector('a[href="login.html"]');
                    if (loginBtn && !loginBtn.dataset.authReplaced) {
                        loginBtn.dataset.authReplaced = 'true';
                        
                        var avatarUrl = userObj.avatar;
                        var avatarHtml = avatarUrl 
                            ? '<img src="' + avatarUrl + '" class="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)] hover:shadow-[0_0_20px_rgba(242,242,13,0.6)] transition-all" alt="User" />'
                            : '<div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold border-2 border-primary shadow-[0_0_12px_rgba(242,242,13,0.4)]">' + (userObj.name ? userObj.name.charAt(0).toUpperCase() : 'U') + '</div>';

                        var div = document.createElement('div');
                        div.className = 'flex items-center gap-4';
                        div.innerHTML = '<a href="profile.html" class="flex items-center gap-2 hover:text-primary transition-colors group">' + avatarHtml + '<span class="hidden md:inline text-sm font-semibold group-hover:text-primary">' + (userObj.name || '') + '</span></a>';
                        
                        loginBtn.parentNode.replaceChild(div, loginBtn);
                        authObserver.disconnect(); // Tắt theo dõi sau khi hoàn thành
                    }
                });
                authObserver.observe(document.documentElement, { childList: true, subtree: true });
            }
        }
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
