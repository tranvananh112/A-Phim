/**
 * Google Analytics Tracking cho Phim X
 * Tracking chi tiết mọi hành động của người dùng
 */

// Track page view khi load trang
function trackPhimXPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': 'Phim X - Dual Server',
            'page_category': 'Adult Content',
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
        console.log('✅ GA: Page view tracked');
    }
}

// Track khi chọn server
function trackServerSelection(serverNum, serverName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'select_server', {
            'event_category': 'Phim X',
            'event_label': serverName,
            'server_number': serverNum,
            'page_location': window.location.href
        });
        console.log(`✅ GA: Server ${serverNum} selected - ${serverName}`);
    }
}

// Track khi tìm kiếm
function trackPhimXSearch(query, serverNum, resultsCount) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            'search_term': query,
            'event_category': 'Phim X',
            'event_label': `Server ${serverNum}`,
            'server_number': serverNum,
            'results_count': resultsCount || 0,
            'page_location': window.location.href
        });
        console.log(`✅ GA: Search tracked - "${query}" on Server ${serverNum}`);
    }
}

// Track khi click vào video card
function trackVideoCardClick(videoTitle, videoId, serverNum, position) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'select_content', {
            'content_type': 'video_card',
            'event_category': 'Phim X',
            'event_label': videoTitle,
            'video_id': videoId,
            'server_number': serverNum,
            'position': position,
            'page_location': window.location.href
        });
        console.log(`✅ GA: Video card clicked - ${videoTitle}`);
    }
}

// Track khi phát video
function trackVideoPlay(videoTitle, videoId, serverNum, serverName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'play_video', {
            'event_category': 'Phim X',
            'event_label': videoTitle,
            'video_id': videoId,
            'server_number': serverNum,
            'server_name': serverName,
            'page_location': window.location.href
        });
        console.log(`✅ GA: Video play tracked - ${videoTitle} on ${serverName}`);
    }
}

// Track khi video load thành công
function trackVideoLoadSuccess(videoTitle, videoId, serverNum) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'video_load_success', {
            'event_category': 'Phim X',
            'event_label': videoTitle,
            'video_id': videoId,
            'server_number': serverNum,
            'page_location': window.location.href
        });
        console.log(`✅ GA: Video loaded successfully - ${videoTitle}`);
    }
}

// Track khi video load thất bại
function trackVideoLoadError(videoTitle, videoId, serverNum, errorMessage) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'video_load_error', {
            'event_category': 'Phim X',
            'event_label': videoTitle,
            'video_id': videoId,
            'server_number': serverNum,
            'error_message': errorMessage,
            'page_location': window.location.href
        });
        console.log(`❌ GA: Video load error - ${videoTitle}: ${errorMessage}`);
    }
}

// Track khi mở link external
function trackExternalLink(videoTitle, videoUrl, serverNum) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'Phim X',
            'event_label': 'Open External Link',
            'video_title': videoTitle,
            'video_url': videoUrl,
            'server_number': serverNum,
            'page_location': window.location.href
        });
        console.log(`✅ GA: External link clicked - ${videoTitle}`);
    }
}

// Track scroll depth
let phimXScrollTracked = {
    '25': false,
    '50': false,
    '75': false,
    '100': false
};

function trackPhimXScroll() {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);

    Object.keys(phimXScrollTracked).forEach(threshold => {
        if (scrollPercent >= parseInt(threshold) && !phimXScrollTracked[threshold]) {
            phimXScrollTracked[threshold] = true;
            if (typeof gtag !== 'undefined') {
                gtag('event', 'scroll', {
                    'event_category': 'Phim X',
                    'event_label': `${threshold}% scrolled`,
                    'percent_scrolled': parseInt(threshold),
                    'page_location': window.location.href
                });
                console.log(`✅ GA: Scroll ${threshold}% tracked`);
            }
        }
    });
}

// Track time on page
let phimXStartTime = Date.now();

function trackPhimXTimeOnPage() {
    const timeSpent = Math.round((Date.now() - phimXStartTime) / 1000);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            'name': 'time_on_page',
            'value': timeSpent,
            'event_category': 'Phim X',
            'event_label': 'Page Engagement',
            'page_location': window.location.href
        });
        console.log(`✅ GA: Time on page tracked - ${timeSpent}s`);
    }
}

// Track khi người dùng rời trang
window.addEventListener('beforeunload', trackPhimXTimeOnPage);

// Track scroll
window.addEventListener('scroll', trackPhimXScroll);

// Export functions
window.trackPhimXPageView = trackPhimXPageView;
window.trackServerSelection = trackServerSelection;
window.trackPhimXSearch = trackPhimXSearch;
window.trackVideoCardClick = trackVideoCardClick;
window.trackVideoPlay = trackVideoPlay;
window.trackVideoLoadSuccess = trackVideoLoadSuccess;
window.trackVideoLoadError = trackVideoLoadError;
window.trackExternalLink = trackExternalLink;

console.log('🎬 Phim X Analytics loaded');
