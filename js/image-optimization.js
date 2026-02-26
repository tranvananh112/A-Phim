// Image Optimization & Lazy Loading
class ImageOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.loadingImages = new Set();
    }

    // Optimize image URL with CDN parameters
    optimizeImageUrl(url, width = 400, quality = 80) {
        if (!url) return 'https://via.placeholder.com/400x600?text=No+Image';
        if (!url.startsWith('http')) {
            url = `https://img.ophim.live/uploads/movies/${url}`;
        }

        // Add CDN optimization parameters if supported
        // Most CDNs support ?w=width&q=quality
        if (url.includes('ophim.live')) {
            return `${url}?w=${width}&q=${quality}`;
        }

        return url;
    }

    // Preload image
    preloadImage(url) {
        if (this.imageCache.has(url)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(url, true);
                resolve();
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    // Setup lazy loading for images
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;

                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px' // Start loading 50px before image enters viewport
            });

            // Observe all lazy-load images
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            return imageObserver;
        }
    }

    // Batch preload images
    async preloadImages(urls, batchSize = 5) {
        const batches = [];
        for (let i = 0; i < urls.length; i += batchSize) {
            batches.push(urls.slice(i, i + batchSize));
        }

        for (const batch of batches) {
            await Promise.allSettled(
                batch.map(url => this.preloadImage(url))
            );
        }
    }
}

// Initialize image optimizer
const imageOptimizer = new ImageOptimizer();

// Setup lazy loading on page load
document.addEventListener('DOMContentLoaded', () => {
    imageOptimizer.setupLazyLoading();
});

// Observe DOM changes for new images
const mutationObserver = new MutationObserver(() => {
    imageOptimizer.setupLazyLoading();
});

mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
});
