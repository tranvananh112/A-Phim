const axios = require('axios');
const fs = require('fs');

(async () => {
    const allMovies = [];
    const pages = [1,2,3,4,5,6,7,8,9,10];
    
    await Promise.all(pages.map(async (page) => {
        try {
            const r = await axios.get('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=' + page, { timeout: 8000 });
            if (r.data && r.data.data && r.data.data.items) {
                allMovies.push(...r.data.data.items);
                console.log('Page ' + page + ': ' + r.data.data.items.length + ' phim');
            }
        } catch(e) { console.log('Page ' + page + ' failed:', e.message); }
    }));

    const urlEntries = allMovies.map(function(movie) {
        const slug = movie.slug || '';
        const name = (movie.name || '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
        const pageUrl = 'https://aphim.io.vn/movie-detail.html?slug=' + slug;
        const thumb = movie.thumb_url
            ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : 'https://img.ophim.live/uploads/movies/' + movie.thumb_url)
            : '';
        const poster = movie.poster_url
            ? (movie.poster_url.startsWith('http') ? movie.poster_url : 'https://img.ophim.live/uploads/movies/' + movie.poster_url)
            : '';
        
        let imgs = '';
        if (thumb) {
            imgs += '\n        <image:image><image:loc>' + thumb + '</image:loc><image:title>' + name + '</image:title></image:image>';
        }
        if (poster && poster !== thumb) {
            imgs += '\n        <image:image><image:loc>' + poster + '</image:loc><image:title>' + name + ' - Poster</image:title></image:image>';
        }
        if (!imgs) return '';
        return '\n    <url>\n        <loc>' + pageUrl + '</loc>' + imgs + '\n    </url>';
    }).filter(Boolean).join('');

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        + '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
        + urlEntries
        + '\n</urlset>';
    
    fs.writeFileSync('sitemap-images.xml', xml, 'utf-8');
    console.log('Done! Tong: ' + allMovies.length + ' phim, file size: ' + Math.round(xml.length/1024) + ' KB');
})();
