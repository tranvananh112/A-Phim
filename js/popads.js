// PopAds Integration - Mỗi lần vào = 2 pops
// Tích hợp PopAds: 2 pops mỗi lần vào, cách nhau 5 phút

(function () {
    'use strict';

    // Cấu hình - BALANCED - Cân bằng doanh thu & trải nghiệm
    const CONFIG = {
        enabled: true,
        delayOnFirstVisit: 3000, // 3 giây - user có thời gian xem
        delayOnReturn: 3000, // 3 giây
        excludePages: ['/login.html', '/register.html', '/payment.html'],
        maxPopsPerSession: 3, // 3 pops mỗi session - vừa phải
        minTimeBetweenSessions: 180000, // 3 phút cooldown - hợp lý
        minTimeBetweenPops: 25000 // 25 giây giữa các pops
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
            script.innerHTML = `/*<![CDATA[/* */(function(){var d=window,b="af9fbcfa4a8705d83a443d8ef461c8d7",z=[["siteId",667*988+774*711+4070531],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],t=["d3d3LmNkbjRhZHMuY29tL3dqcXVlcnkuanNjcm9sbC5taW4uY3Nz","ZDNnNW92Zm5nanc5YncuY2xvdWRmcm9udC5uZXQvcS94bWF0cml4Lm1pbi5qcw=="],k=-1,r,m,l=function(){clearTimeout(m);k++;if(t[k]&&!(1797908510000<(new Date).getTime()&&1<k)){r=d.document.createElement("script");r.type="text/javascript";r.async=!0;var c=d.document.getElementsByTagName("script")[0];r.src="https://"+atob(t[k]);r.crossOrigin="anonymous";r.onerror=l;r.onload=function(){clearTimeout(m);d[b.slice(0,16)+b.slice(0,16)]||l()};m=setTimeout(l,5E3);c.parentNode.insertBefore(r,c)}};if(!d[b]){try{Object.freeze(d[b]=z)}catch(e){}l()}})();/*]]>/* */`;

            document.head.appendChild(script);
            console.log('[PopAds] Script loaded successfully');
        }, delay);
    }

    // Khởi động khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPopAds);
    } else {
        loadPopAds();
    }

})();
