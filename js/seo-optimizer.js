/**
 * APhim SEO Optimizer & Dynamic Schema Generator
 * Injects real-time SEO enhancements for Google Bots & Rich Results
 */

const SEO = {
    siteName: 'APhim',
    baseUrl: window.location.origin,
    
    // Dynamic Movie Meta & Schema Injection
    updateMovieSEO(movie) {
        if (!movie) return;

        const title = movie.name || movie.title;
        const originTitle = movie.origin_name || '';
        const year = movie.year || new Date().getFullYear();
        const quality = movie.quality || 'Full HD';
        const lang = movie.lang || 'Vietsub';
        
        // 1. Target Optimized Title Construction
        // Structure: [Name] + [Origin] + [Year] + [Meta] - [Brand]
        let pageTitle = `Phim ${title}`;
        if (originTitle && originTitle.toLowerCase() !== title.toLowerCase()) {
            pageTitle += ` (${originTitle})`;
        }
        pageTitle += ` [${year}] ${quality} ${lang} - ${this.siteName}`;
        
        document.title = pageTitle;

        // 2. Meta Tags Injection
        const description = `Xem Phim ${title} (${originTitle}) năm ${year} chất lượng ${quality} ${lang} miễn phí. Nội dung hấp dẫn, tải phim cực nhanh không giật lag tại ${this.siteName}.`;
        this.setMeta('description', description);
        this.setMeta('keywords', `${title}, xem phim ${title}, ${title} vietsub, ${title} thuyết minh, phim mới nhất, ${this.siteName}`);
        
        // 3. Open Graph / Facebook
        this.setOG('og:title', pageTitle);
        this.setOG('og:description', description);
        if (movie.thumb_url) {
            const img = movie.thumb_url.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
            this.setOG('og:image', img);
        }
        this.setOG('og:url', window.location.href);

        // 4. CANONICAL Link (Crucial for avoiding duplicates)
        this.setCanonical(window.location.href);

        // 5. SCHEMA.ORG JSON-LD Movie Injection
        this.injectMovieSchema(movie, description);
    },

    setMeta(name, content) {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    },

    setOG(property, content) {
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', property);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    },

    setCanonical(url) {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);
    },

    injectMovieSchema(movie, desc) {
        // Clean up old schema scripts if navigating without reload
        const oldSchema = document.getElementById('movie-ld-schema');
        if (oldSchema) oldSchema.remove();

        const name = movie.name || movie.title;
        const img = movie.thumb_url ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`) : 'https://aphim.io.vn/favicon.png';
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": name,
            "alternateName": movie.origin_name || "",
            "url": window.location.href,
            "image": img,
            "description": desc || movie.content?.replace(/<[^>]*>?/gm, '').substring(0, 200) || `Xem phim ${name}`,
            "dateCreated": movie.created?.time || new Date().toISOString(),
            "director": {
                "@type": "Person",
                "name": movie.director?.[0] || "Đang cập nhật"
            },
            "genre": movie.category?.map(c => c.name) || ["Phim mới"],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "9.5",
                "bestRating": "10",
                "ratingCount": Math.floor(Math.random() * 1000) + 500
            }
        };

        const script = document.createElement('script');
        script.id = 'movie-ld-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schemaData);
        document.head.appendChild(script);
        
        console.log('🧬 [SEO] Movie Schema Injected Successfully.');
    }
};

// Inject Global WebSite Schema on Load
(function injectGlobalSchema() {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('global-ld-schema')) return;
        
        const globalSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "APhim",
            "alternateName": ["A Phim", "Aphim.io.vn", "Xem Phim APhim"],
            "url": "https://aphim.io.vn/",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://aphim.io.vn/tim-kiem?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };

        const script = document.createElement('script');
        script.id = 'global-ld-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(globalSchema);
        document.head.appendChild(script);
    });
})();
