// PopAds Integration - Optimized for Revenue
// Tích hợp PopAds tối ưu cho doanh thu

(function () {
    'use strict';

    // Cấu hình - CÂN BẰNG giữa doanh thu và trải nghiệm
    const CONFIG = {
        enabled: true,
        delayOnFirstVisit: 5000, // 5 giây - để user xem nội dung trước
        delayOnReturn: 10000, // 10 giây - ít phiền hơn
        excludePages: ['/login.html', '/register.html', '/payment.html'], // Không chạy ở các trang này
        maxPopsPerSession: 2, // CHỈ 2 pops/session - ít phiền
        maxPopsPerDay: 4, // Tối đa 4 pops/ngày cho mỗi user
        minTimeBetweenPops: 30000, // 30 giây giữa các lần pop
        resetAfterHours: 24 // Reset sau 24 giờ
    };

    // Kiểm tra và reset dữ liệu cũ
    function checkAndResetOldData() {
        const lastResetTime = localStorage.getItem('popads_last_reset');
        const now = Date.now();

        if (lastResetTime) {
            const hoursSinceReset = (now - parseInt(lastResetTime)) / (1000 * 60 * 60);

            if (hoursSinceReset >= CONFIG.resetAfterHours) {
                // Reset sau 24 giờ
                localStorage.removeItem('popads_daily_count');
                localStorage.removeItem('popads_visited');
                localStorage.setItem('popads_last_reset', now.toString());
                console.log('[PopAds] Data reset after', CONFIG.resetAfterHours, 'hours');
                return true;
            }
        } else {
            // Lần đầu tiên
            localStorage.setItem('popads_last_reset', now.toString());
        }

        return false;
    }

    // Kiểm tra xem có nên load PopAds không
    function shouldLoadPopAds() {
        // Reset dữ liệu cũ nếu cần
        checkAndResetOldData();

        // Kiểm tra trang hiện tại
        const currentPath = window.location.pathname;
        for (let excludePath of CONFIG.excludePages) {
            if (currentPath.includes(excludePath)) {
                console.log('[PopAds] Skipped on excluded page:', currentPath);
                return false;
            }
        }

        // Kiểm tra số lần pop trong ngày (localStorage - theo user)
        let dailyCount = localStorage.getItem('popads_daily_count') || 0;
        dailyCount = parseInt(dailyCount);

        if (dailyCount >= CONFIG.maxPopsPerDay) {
            console.log('[PopAds] Max pops per day reached:', dailyCount);
            return false;
        }

        // Kiểm tra số lần pop trong session
        let popCount = sessionStorage.getItem('popads_count') || 0;
        popCount = parseInt(popCount);

        if (popCount >= CONFIG.maxPopsPerSession) {
            console.log('[PopAds] Max pops per session reached:', popCount);
            return false;
        }

        // Kiểm tra thời gian giữa các lần pop
        const lastPopTime = sessionStorage.getItem('popads_last_time');
        if (lastPopTime) {
            const timeSinceLastPop = Date.now() - parseInt(lastPopTime);
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

        // Tăng counter session
        let popCount = sessionStorage.getItem('popads_count') || 0;
        sessionStorage.setItem('popads_count', parseInt(popCount) + 1);
        sessionStorage.setItem('popads_last_time', Date.now().toString());

        // Tăng counter daily (localStorage - theo user)
        let dailyCount = localStorage.getItem('popads_daily_count') || 0;
        localStorage.setItem('popads_daily_count', parseInt(dailyCount) + 1);

        // Xác định delay
        const isFirstVisit = !localStorage.getItem('popads_visited');
        const delay = isFirstVisit ? CONFIG.delayOnFirstVisit : CONFIG.delayOnReturn;

        // Đánh dấu đã visit
        localStorage.setItem('popads_visited', 'true');

        const sessionCount = parseInt(popCount) + 1;
        const totalDailyCount = parseInt(dailyCount) + 1;
        console.log('[PopAds] Will load in', delay / 1000, 'seconds. Session:', sessionCount, '| Daily:', totalDailyCount);

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
