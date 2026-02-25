// PopAds Integration - Mỗi lần vào = 2 pops
// Tích hợp PopAds: 2 pops mỗi lần vào, cách nhau 5 phút

(function () {
    'use strict';

    // Cấu hình - DISABLED - Chuyển sang AdsTerra
    const CONFIG = {
        enabled: false, // TẮT PopAds, dùng AdsTerra
        delayOnFirstVisit: 2000, // 2 giây - nhanh hơn
        delayOnReturn: 2000, // 2 giây
        excludePages: ['/login.html', '/register.html', '/payment.html'],
        maxPopsPerSession: 5, // 5 pops mỗi session - tăng doanh thu
        minTimeBetweenSessions: 120000, // 2 phút cooldown - nhanh hơn
        minTimeBetweenPops: 15000 // 15 giây giữa các pops - nhanh hơn
    };

    // Kiểm tra xem có nên load PopAds không
    function shouldLoadPopAds() {
        // Kiểm tra trang hiện tại
        const currentPath = window.location.pathname;
        for (let excludePath of CONFIG.excludePages) {
            if (currentPath.includes(excludePath)) {
                console.log('[PopAds] Skipped on excluded page:', currentPath);
                return false;
            }
        }

        // Kiểm tra thời gian từ lần vào trước (localStorage)
        const lastSessionTime = localStorage.getItem('popads_last_session');
        const now = Date.now();

        if (lastSessionTime) {
            const timeSinceLastSession = now - parseInt(lastSessionTime);

            if (timeSinceLastSession < CONFIG.minTimeBetweenSessions) {
                const waitMinutes = Math.round((CONFIG.minTimeBetweenSessions - timeSinceLastSession) / 60000);
                console.log('[PopAds] Too soon since last session. Wait', waitMinutes, 'minutes');
                return false;
            }
        }

        // Kiểm tra số lần pop trong session hiện tại
        let popCount = sessionStorage.getItem('popads_count') || 0;
        popCount = parseInt(popCount);

        if (popCount >= CONFIG.maxPopsPerSession) {
            console.log('[PopAds] Max pops per session reached:', popCount);
            return false;
        }

        // Kiểm tra thời gian giữa các lần pop trong cùng session
        const lastPopTime = sessionStorage.getItem('popads_last_time');
        if (lastPopTime) {
            const timeSinceLastPop = now - parseInt(lastPopTime);
            if (timeSinceLastPop < CONFIG.minTimeBetweenPops) {
                console.log('[PopAds] Too soon since last pop. Wait', Math.round((CONFIG.minTimeBetweenPops - timeSinceLastPop) / 1000), 'seconds');
                return false;
            }
        }

        return true;
    }

    // Load PopAds script
    function loadPopAds() {
        if (!CONFIG.enabled || !shouldLoadPopAds()) {
            return;
        }

        const now = Date.now();

        // Tăng counter session
        let popCount = sessionStorage.getItem('popads_count') || 0;
        sessionStorage.setItem('popads_count', parseInt(popCount) + 1);
        sessionStorage.setItem('popads_last_time', now.toString());

        // Lưu thời gian session (localStorage)
        // Chỉ lưu khi pop đầu tiên của session
        if (parseInt(popCount) === 0) {
            localStorage.setItem('popads_last_session', now.toString());
        }

        // Xác định delay
        const isFirstVisit = !localStorage.getItem('popads_visited');
        const delay = isFirstVisit ? CONFIG.delayOnFirstVisit : CONFIG.delayOnReturn;

        // Đánh dấu đã visit
        localStorage.setItem('popads_visited', 'true');

        const sessionCount = parseInt(popCount) + 1;
        console.log('[PopAds] Will load in', delay / 1000, 'seconds. Pop', sessionCount, 'of', CONFIG.maxPopsPerSession);

        // Load sau delay
        setTimeout(function () {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.setAttribute('data-cfasync', 'false');
            script.innerHTML = `/*<![CDATA[/* */(function(){var p=window,r="af9fbcfa4a8705d83a443d8ef461c8d7",y=[["siteId",865-402-248-351*667+5513743],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],t=["d3d3LmNkbjRhZHMuY29tL2FqcXVlcnkuanNjcm9sbC5taW4uY3Nz","ZDNnNW92Zm5nanc5YncuY2xvdWRmcm9udC5uZXQvZ3lUSC9obWF0cml4Lm1pbi5qcw=="],d=-1,i,e,l=function(){clearTimeout(e);d++;if(t[d]&&!(1797928011000<(new Date).getTime()&&1<d)){i=p.document.createElement("script");i.type="text/javascript";i.async=!0;var w=p.document.getElementsByTagName("script")[0];i.src="https://"+atob(t[d]);i.crossOrigin="anonymous";i.onerror=l;i.onload=function(){clearTimeout(e);p[r.slice(0,16)+r.slice(0,16)]||l()};e=setTimeout(l,5E3);w.parentNode.insertBefore(i,w)}};if(!p[r]){try{Object.freeze(p[r]=y)}catch(e){}l()}})();/*]]>/* */`;

            document.head.appendChild(script);
            console.log('[PopAds] Script loaded successfully with NEW code');
        }, delay);
    }

    // Khởi động khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPopAds);
    } else {
        loadPopAds();
    }

})();
