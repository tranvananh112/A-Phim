/**
 * Google Analytics Enhanced Tracking
 * Theo dõi hành vi người dùng và navigation
 */

// Track navigation clicks
function trackNavigation(navItem, destination) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'navigation_click', {
            'event_category': 'Navigation',
            'event_label': navItem,
            'destination_url': destination,
            'page_location': window.location.href
        });
    }
}

// Track page views with custom dimensions
function trackPageView(pageTitle, pageCategory) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': pageTitle,
            'page_category': pageCategory,
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
    }
}

// Track user interactions
function trackUserAction(action, category, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    }
}

// Track movie views
function trackMovieView(movieSlug, movieName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'view_movie', {
            'event_category': 'Movie',
            'event_label': movieName,
            'movie_slug': movieSlug
        });
    }
}

// Track search queries
function trackSearch(searchQuery, resultsCount) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            'search_term': searchQuery,
            'results_count': resultsCount
        });
    }
}

// Track support/donation clicks
function trackSupportClick(supportType) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'support_click', {
            'event_category': 'Support',
            'event_label': supportType,
            'page_location': window.location.href
        });
    }
}

// Track pricing plan selection
function trackPricingPlan(planName, planPrice) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'select_plan', {
            'event_category': 'Pricing',
            'event_label': planName,
            'value': planPrice
        });
    }
}

// Initialize navigation tracking when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Track all navigation links
    const navLinks = document.querySelectorAll('nav a, .nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const navText = this.textContent.trim();
            const destination = this.getAttribute('href');

            if (destination && !destination.startsWith('#')) {
                trackNavigation(navText, destination);
            }
        });
    });

    // Track mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            trackUserAction('mobile_menu_toggle', 'UI', 'Mobile Menu', 1);
        });
    }

    // Track dropdown interactions
    const dropdowns = document.querySelectorAll('.group button');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function () {
            const dropdownText = this.textContent.trim();
            trackUserAction('dropdown_open', 'Navigation', dropdownText, 1);
        });
    });

    // Track support page link specifically
    const supportLinks = document.querySelectorAll('a[href="support.html"]');
    supportLinks.forEach(link => {
        link.addEventListener('click', function () {
            trackSupportClick('navigation_menu');
        });
    });

    // Track pricing page links
    const pricingLinks = document.querySelectorAll('a[href="pricing.html"]');
    pricingLinks.forEach(link => {
        link.addEventListener('click', function () {
            trackUserAction('pricing_page_click', 'Navigation', 'Pricing Menu', 1);
        });
    });

    // Track login button clicks
    const loginButtons = document.querySelectorAll('a[href="login.html"]');
    loginButtons.forEach(button => {
        button.addEventListener('click', function () {
            trackUserAction('login_click', 'Authentication', 'Login Button', 1);
        });
    });

    // Track search icon clicks
    const searchIcons = document.querySelectorAll('a[href="search.html"]');
    searchIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            trackUserAction('search_click', 'Navigation', 'Search Icon', 1);
        });
    });
});

// Track scroll depth
let scrollTracked = {
    '25': false,
    '50': false,
    '75': false,
    '100': false
};

window.addEventListener('scroll', function () {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);

    Object.keys(scrollTracked).forEach(threshold => {
        if (scrollPercent >= parseInt(threshold) && !scrollTracked[threshold]) {
            scrollTracked[threshold] = true;
            trackUserAction('scroll_depth', 'Engagement', `${threshold}%`, parseInt(threshold));
        }
    });
});

// Track time on page
let startTime = Date.now();
window.addEventListener('beforeunload', function () {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'time_on_page', {
            'event_category': 'Engagement',
            'event_label': document.title,
            'value': timeSpent
        });
    }
});

// Export functions for use in other scripts
window.trackNavigation = trackNavigation;
window.trackPageView = trackPageView;
window.trackUserAction = trackUserAction;
window.trackMovieView = trackMovieView;
window.trackSearch = trackSearch;
window.trackSupportClick = trackSupportClick;
window.trackPricingPlan = trackPricingPlan;
