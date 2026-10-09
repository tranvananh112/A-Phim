require('dotenv').config({ quiet: true }); // Load .env local (nếu có), bỏ qua nếu không tìm thấy
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

process.on('uncaughtException', err => console.error('⚠️ UncaughtException:', err.message));
process.on('unhandledRejection', reason => console.error('⚠️ UnhandledRejection:', reason));

// ===== VIEW ENGINE: EJS =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== STATIC FILES: Serve từ thư mục gốc =====
// No-cache middleware for HTML files to avoid stale UI
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/' || req.path.startsWith('/watch') || req.path.startsWith('/xem-phim')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

app.use(express.static(__dirname, {
    setHeaders: (res, p) => {
        if (p.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// ===== STATIC: Serve icons/ ra đường dẫn root (để Lottie load /icon-*.json) =====
// VD: GET /icon-phim-bo.json → f:\Wesite Xem Phim Node\icons\icon-phim-bo.json
app.use(express.static(path.join(__dirname, 'icons')));

// ===== CACHE for API proxies =====
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút
function getCached(key) {
    const entry = apiCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
}
function setCache(key, data) {
    apiCache.set(key, { data, ts: Date.now() });
}
let apiQueue = Promise.resolve();
function queuedFetch(url, options) {
    apiQueue = apiQueue.then(() =>
        fetch(url, options).then(async r => ({ status: r.status, text: await r.text() }))
    );
    return apiQueue;
}

// ==========================================
// ROUTES: PAGES (Phục vụ file HTML trực tiếp theo kiến trúc Static HTML)
// ==========================================

// Trang chủ
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Trang chi tiết phim (Hỗ trợ cả /phim/:slug và /movie-detail)
app.get(['/phim/:slug', '/movie-detail', '/movie-detail.html', '/phim.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'movie-detail.html'));
});

// Trang xem phim: /xem-phim, /xem-phim/*, /watch, /watch.html
app.get(['/xem-phim', '/xem-phim/*', '/watch', '/watch.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'watch.html'));
});

// Các trang danh sách, thể loại, quốc gia, tìm kiếm
app.get(['/danh-sach', '/danh-sach.html'], (req, res) => res.sendFile(path.join(__dirname, 'danh-sach.html')));
app.get(['/categories', '/categories.html', '/the-loai', '/the-loai/*'], (req, res) => res.sendFile(path.join(__dirname, 'categories.html')));
app.get(['/phim-theo-quoc-gia', '/phim-theo-quoc-gia.html', '/countries', '/countries.html', '/quoc-gia', '/quoc-gia/*'], (req, res) => res.sendFile(path.join(__dirname, 'phim-theo-quoc-gia.html')));
app.get(['/search', '/search.html', '/tim-kiem'], (req, res) => res.sendFile(path.join(__dirname, 'search.html')));
app.get(['/pricing', '/pricing.html', '/vip'], (req, res) => res.sendFile(path.join(__dirname, 'pricing.html')));
app.get(['/login', '/login.html'], (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get(['/register', '/register.html'], (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get(['/profile', '/profile.html', '/thanh-vien'], (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));
app.get(['/filter', '/filter.html'], (req, res) => res.sendFile(path.join(__dirname, 'filter.html')));
app.get(['/support', '/support.html'], (req, res) => res.sendFile(path.join(__dirname, 'support.html')));
app.get(['/partner', '/partner.html'], (req, res) => res.sendFile(path.join(__dirname, 'partner.html')));
app.get(['/payment', '/payment.html'], (req, res) => res.sendFile(path.join(__dirname, 'payment.html')));


app.get('/tiktok5pgXUVWzUxAifGnSg4nsTciyOtz2bvpK.txt', (req, res) => {
    res.send('tiktok-developers-site-verification=5pgXUVWzUxAifGnSg4nsTciyOtz2bvpK');
});

app.get(['/the-thao', '/the-thao.html'], (req, res) => {
    res.redirect(301, '/pricing');
});

// Admin routes (vẫn dùng HTML tĩnh)
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});
app.get('/admin/movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'movies.html'));
});
app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'users.html'));
});
app.get('/admin/payments', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'payments.html'));
});

// ==========================================
// SITEMAP
// ==========================================
let sitemapCache = { xml: null, timestamp: 0 };
const SITEMAP_TTL = 6 * 60 * 60 * 1000; // 6 giờ

app.get('/sitemap-images.xml', async (req, res) => {
    try {
        const now = Date.now();
        if (sitemapCache.xml && (now - sitemapCache.timestamp < SITEMAP_TTL)) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            return res.send(sitemapCache.xml);
        }

        const pages = [1, 2, 3, 4, 5];
        const allMovies = [];

        await Promise.all(pages.map(async (page) => {
            try {
                const r = await axios.get('https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=' + page, { timeout: 6000 });
                if (r.data && r.data.data && r.data.data.items) {
                    allMovies.push(...r.data.data.items);
                }
            } catch (e) { /* bỏ qua trang lỗi */ }
        }));

        const urlEntries = allMovies.map(function (movie) {
            const slug = movie.slug || '';
            const name = (movie.name || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
            const pageUrl = 'https://aphim.top/phim/' + slug;
            const thumb = movie.thumb_url
                ? (movie.thumb_url.startsWith('http') ? movie.thumb_url : 'https://phimimg.com/' + (movie.thumb_url.startsWith('uploads/') ? '' : 'uploads/movies/') + movie.thumb_url)
                : '';
            const poster = movie.poster_url
                ? (movie.poster_url.startsWith('http') ? movie.poster_url : 'https://phimimg.com/' + (movie.poster_url.startsWith('uploads/') ? '' : 'uploads/movies/') + movie.poster_url)
                : '';

            let imageEntries = '';
            if (thumb) {
                imageEntries += '\n        <image:image>\n            <image:loc>' + thumb + '</image:loc>\n            <image:title>' + name + '</image:title>\n        </image:image>';
            }
            if (poster && poster !== thumb) {
                imageEntries += '\n        <image:image>\n            <image:loc>' + poster + '</image:loc>\n            <image:title>' + name + ' - Poster</image:title>\n        </image:image>';
            }

            if (!imageEntries) return '';

            return '\n    <url>\n        <loc>' + pageUrl + '</loc>' + imageEntries + '\n    </url>';
        }).filter(Boolean).join('');

        const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
            + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
            + '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
            + urlEntries
            + '\n</urlset>';

        sitemapCache = { xml: xml, timestamp: now };

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=21600');
        res.send(xml);
    } catch (e) {
        console.error('[Sitemap] Error:', e.message);
        res.status(500).send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

app.get('/sitemap.xml', (req, res) => {
    try {
        const sitemapPath = path.join(__dirname, 'sitemap.xml');
        const xml = fs.readFileSync(sitemapPath, 'utf8');
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.send(xml);
    } catch (e) {
        res.status(500).send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

// ==========================================
// API PROXY CHO OPHIM (cho client-side JS)
// ==========================================
app.use('/v1/api', async (req, res) => {
    let cleanPath = req.path || '/';
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    const targets = [
        `https://phimapi.com/v1/api${cleanPath}`,
        `https://phimapi.com${cleanPath}`,
        `https://ophim1.com/v1/api${cleanPath}`,
        `https://ophim1.com${cleanPath}`
    ];

    if (cleanPath.includes('phim-moi-cap-nhat')) {
        targets.unshift(`https://phimapi.com/danh-sach/phim-moi-cap-nhat`);
        targets.unshift(`https://phimapi.com/v1/api/danh-sach/phim-moi-cap-nhat`);
    }

    for (const targetUrl of targets) {
        try {
            const response = await axios({
                method: req.method,
                url: targetUrl,
                params: req.query,
                data: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
                timeout: 6000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                responseType: 'json'
            });

            if (response.status === 200 && response.data) {
                return res.status(200).json(response.data);
            }
        } catch (error) {
            // Silently try next mirror
        }
    }

    res.status(500).json({ status: false, message: 'All API proxy mirrors failed' });
});

// ==========================================
// API PROXIES (giữ nguyên từ server cũ)
// ==========================================

// iSports API
const ISPORTS_API_KEY = 'R86CxN79bK1lrAC0';
let cacheLivescores = { data: null, timestamp: 0 };
let cacheChanges = { data: null, timestamp: 0 };
const ISPORTS_CACHE_TTL = 30000; // 30 seconds

app.get(['/api/isports/livescores', '/v1/api/isports/livescores'], async (req, res) => {
    try {
        const now = Date.now();
        if (cacheLivescores.data && (now - cacheLivescores.timestamp < ISPORTS_CACHE_TTL)) {
            return res.status(200).json(cacheLivescores.data);
        }
        const url = `http://api.isportsapi.com/sport/football/livescores?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);
        if (response.data && response.data.code === 2) {
            console.warn("iSports Limit Reached!");
            return res.status(200).json({ code: 2, message: "API iSports (Trial 200) đã hết hạn mức ngày hôm nay. Vui lòng cung cấp Key mới.", data: [] });
        }
        cacheLivescores = { data: response.data, timestamp: now };
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Livescores Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch from iSports' });
    }
});

app.get(['/api/isports/schedule', '/v1/api/isports/schedule'], async (req, res) => {
    try {
        const date = req.query.date || '';
        const url = `http://api.isportsapi.com/sport/football/schedule?api_key=${ISPORTS_API_KEY}&date=${date}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Schedule Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch schedule from iSports' });
    }
});

// ==========================================
// VSMOV PROXY: Fetch episodes từ nguồn phụ (server-side, tránh CORS)
// GET /api/vsmov/:slug → thử ophim1.com, nguonc.com, rồi ophim1.com
// ==========================================
const vsmovCache = new Map();
const VSMOV_CACHE_TTL = 5 * 60 * 1000; // 5 phút

app.get('/api/vsmov/:slug', async (req, res) => {
    const slug = req.params.slug;
    if (!slug || slug.length > 200) {
        return res.status(400).json({ status: false, message: 'Invalid slug' });
    }

    const cacheEntry = vsmovCache.get(slug);
    if (cacheEntry && Date.now() - cacheEntry.ts < VSMOV_CACHE_TTL) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cacheEntry.data);
    }

    const mirrors = [
        {
            url: `https://ophim1.com/phim/${slug}`,
            parse: d => ({
                episodes: d?.episodes,
                movie: d?.movie
            })
        },
        {
            url: `https://phim.nguonc.com/api/film/${slug}`,
            parse: d => {
                if (!d || !d.movie || !d.movie.episodes) return null;
                const mappedEps = d.movie.episodes.map(s => ({
                    server_name: s.server_name || 'Vietsub',
                    server_data: (s.items || []).map(it => ({
                        name: it.name && !it.name.toLowerCase().includes('tập') ? `Tập ${it.name}` : (it.name || 'Tập 1'),
                        slug: it.slug || `tap-${it.name}`,
                        link_embed: it.embed || '',
                        link_m3u8: it.m3u8 || ''
                    }))
                }));
                return {
                    episodes: mappedEps,
                    movie: {
                        name: d.movie.name,
                        origin_name: d.movie.original_name,
                        thumb_url: d.movie.thumb_url,
                        poster_url: d.movie.poster_url,
                        content: d.movie.description,
                        quality: d.movie.quality,
                        lang: d.movie.language,
                        year: d.movie.created ? new Date(d.movie.created).getFullYear() : ''
                    }
                };
            }
        },
        {
            url: `https://ophim1.com/phim/${slug}`,
            parse: d => ({
                episodes: d?.data?.item?.episodes || d?.movie?.episodes,
                movie: d?.data?.item || d?.movie
            })
        }
    ];

    for (const { url, parse } of mirrors) {
        try {
            const response = await axios.get(url, {
                timeout: 8000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const parsed = parse(response.data);
            const episodes = parsed?.episodes;

            if (episodes && Array.isArray(episodes) && episodes.length > 0) {
                const movieMeta = parsed?.movie || null;
                const result = { status: true, source: url, episodes, movie: movieMeta };
                vsmovCache.set(slug, { data: result, ts: Date.now() });
                res.setHeader('X-Cache', 'MISS');
                return res.json(result);
            }
        } catch (err) {
            console.warn(`[VSMOV] Lỗi fetch ${url}:`, err.message);
        }
    }

    res.status(200).json({ status: false, episodes: [], message: 'Không tìm thấy nguồn phim phụ' });
});

app.get(['/api/isports/livetext', '/v1/api/isports/livetext'], async (req, res) => {
    try {
        const url = `http://api.isportsapi.com/sport/football/livetext/list?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports LiveText Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch livetext from iSports' });
    }
});

app.get(['/api/isports/changes', '/v1/api/isports/changes'], async (req, res) => {
    try {
        const now = Date.now();
        if (cacheChanges.data && (now - cacheChanges.timestamp < 10000)) {
            return res.status(200).json(cacheChanges.data);
        }
        const url = `http://api.isportsapi.com/sport/football/livescores/changes?api_key=${ISPORTS_API_KEY}`;
        const response = await axios.get(url);
        if (response.data && response.data.code === 2) {
            if (cacheChanges.data) return res.status(200).json(cacheChanges.data);
        } else {
            cacheChanges = { data: response.data, timestamp: now };
        }
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Changes Error:", error.message);
        if (cacheChanges.data) return res.status(200).json(cacheChanges.data);
        res.status(500).json({ error: 'Failed to fetch changes from iSports' });
    }
});

app.get(['/api/isports/team/:teamId', '/v1/api/isports/team/:teamId'], async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const url = `http://api.isportsapi.com/sport/football/team?api_key=${ISPORTS_API_KEY}&teamId=${teamId}`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("iSports Team Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch team from iSports' });
    }
});

const isportsLogoCache = {};
app.get(['/api/isports/image/:teamId', '/v1/api/isports/image/:teamId'], async (req, res) => {
    try {
        const teamId = req.params.teamId;
        let logoUrl = isportsLogoCache[teamId];
        if (!logoUrl) {
            const url = `http://api.isportsapi.com/sport/football/team?api_key=${ISPORTS_API_KEY}&teamId=${teamId}`;
            const response = await axios.get(url);
            if (response.data && response.data.data && response.data.data[0] && response.data.data[0].logo) {
                logoUrl = response.data.data[0].logo;
                isportsLogoCache[teamId] = logoUrl;
            }
        }
        if (logoUrl) {
            const imgParams = {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive'
                }
            };
            const imgResult = await axios.get(logoUrl, imgParams);
            res.set('Content-Type', 'image/png');
            res.set('Cache-Control', 'public, max-age=86400');
            res.send(imgResult.data);
        } else {
            res.status(404).send('No logo');
        }
    } catch (e) {
        res.status(404).send('Error fetching proxy image');
    }
});

// Sportmonks API
const SPORTMONKS_TOKEN = 'x8HmVIpZZd9bz5AqazZIeygXWXnNsqLIPNokCI1M5lQ4LTzMOGTp3i8ePBCk';
const FOOTBALL_DATA_TOKEN = '693024976693480792fe9c97125c68ca';

const fdAxios = axios.create({
    baseURL: 'https://api.football-data.org/v4/',
    headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN }
});

app.get(['/api/fd/standings/:league', '/v1/api/fd/standings/:league'], async (req, res) => {
    try {
        const { league } = req.params;
        const response = await fdAxios.get(`competitions/${league}/standings`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("FD Standings Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed' });
    }
});

app.get(['/api/fd/scorers/:league', '/v1/api/fd/scorers/:league'], async (req, res) => {
    try {
        const { league } = req.params;
        const response = await fdAxios.get(`competitions/${league}/scorers?limit=10`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("FD Scorers Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed' });
    }
});

app.get(['/api/fd/matches', '/v1/api/fd/matches'], async (req, res) => {
    try {
        const response = await fdAxios.get(`matches`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("FD Matches Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed' });
    }
});

app.get(['/api/sportmonks/livescores', '/v1/api/sportmonks/livescores'], async (req, res) => {
    try {
        const url = `https://api.sportmonks.com/v3/football/livescores/inplay?api_token=${SPORTMONKS_TOKEN}&include=participants;scores;periods;events;league.country;round`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Sportmonks Proxy Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch from Sportmonks' });
    }
});

app.get(['/api/sportmonks/h2h/:t1/:t2', '/v1/api/sportmonks/h2h/:t1/:t2'], async (req, res) => {
    try {
        const { t1, t2 } = req.params;
        const url = `https://api.sportmonks.com/v3/football/fixtures/head-to-head/${t1}/${t2}?api_token=${SPORTMONKS_TOKEN}&include=participants;league;scores;state;venue;events`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Sportmonks H2H Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch H2H from Sportmonks' });
    }
});

app.get(['/api/sportmonks/fixture/:id', '/v1/api/sportmonks/fixture/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        const url = `https://api.sportmonks.com/v3/football/fixtures/${id}?api_token=${SPORTMONKS_TOKEN}&include=participants;league;venue;state;scores;lineups.player;lineups.type;lineups.details.type;metadata.type;coaches`;
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Sportmonks Fixture Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch fixture from Sportmonks' });
    }
});

// RapidAPI Sofascore proxy
app.get(['/api/sofascore/*', '/v1/api/sofascore/*'], async (req, res) => {
    try {
        const targetPath = req.params[0];
        const cacheKey = targetPath;
        const cached = getCached(cacheKey);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).send(cached);
        }
        const url = `https://sportapi7.p.rapidapi.com/${targetPath}`;
        console.log(`[Proxy] Fetching: ${url}`);
        const result = await queuedFetch(url, {
            headers: {
                'x-rapidapi-key': '8e131041e5msheef9200c98e9712p109669jsn30145b3c501d',
                'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
                'Accept': 'application/json'
            }
        });
        if (result.status === 200 && result.text) {
            setCache(cacheKey, result.text);
            res.setHeader('X-Cache', 'MISS');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result.text);
        } else {
            console.error(`[Proxy] Error ${result.status}:`, result.text);
            res.status(result.status || 500).json({ error: 'Upstream Error', details: result.text });
        }
    } catch (error) {
        console.error("RapidAPI Proxy Error:", error.message);
        res.status(200).json({ events: [] });
    }
});

// Sofascore team image proxy
app.get('/api/image/team/:id', async (req, res) => {
    try {
        const teamId = req.params.id;
        const imageUrl = `https://api.sofascore.app/api/v1/team/${teamId}/image`;
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            validateStatus: () => true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.sofascore.com/',
                'Origin': 'https://www.sofascore.com',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        if (response.status === 200) {
            res.set('Content-Type', 'image/png');
            res.send(response.data);
        } else {
            res.status(404).send('Not Found');
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch team image' });
    }
});

// ==========================================
// BACKEND API PROXY & FALLBACK (Forward /api to backend port 5000)
// ==========================================
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || `http://127.0.0.1:${BACKEND_PORT}`;

// Direct handler for home showcase comments fallback
app.get('/api/comments/home-showcase', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/comments/home-showcase`, { timeout: 2500 });
        if (response.data) return res.json(response.data);
    } catch (e) {
        // Fallback default comments
        return res.json({
            success: true,
            data: [
                {
                    userName: 'Admin APhim',
                    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminAPhim',
                    badge: 'ADMIN TOP 1',
                    isAdmin: true,
                    isVip: true,
                    content: 'Chào mừng các bạn đến với APhim Cinema! Chúc các bạn xem phim vui vẻ.',
                    movieSlug: 'trung-so-doc-dac-van-phai-di-lam',
                    movieName: 'Trúng Số Độc Đắc Vẫn Phải Đi Làm',
                    timeAgo: 'Vừa xong'
                },
                {
                    userName: 'Minh Hoàng',
                    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MinhHoang',
                    badge: 'VIP PRO',
                    isVip: true,
                    content: 'Phim âm thanh đỉnh cao luôn, xem mượt mà không bị giật lag chút nào!',
                    movieSlug: 'van-tu-hanh',
                    movieName: 'Vân Tú Hành',
                    timeAgo: '15 phút trước'
                },
                {
                    userName: 'Thu Trang',
                    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThuTrang',
                    badge: 'CÀY PHIM',
                    content: 'Kid và Hattori ngầu dã man, đồ họa sắc nét quá chừng.',
                    movieSlug: 'conan-ngoi-sao-5-canh-1-trieu-do',
                    movieName: 'Thám Tử Lừng Danh Conan',
                    timeAgo: '1 giờ trước'
                },
                {
                    userName: 'Gia Bảo',
                    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GiaBao',
                    badge: 'FAN CỨNG',
                    content: 'Đoạn combat cuối phim nhạc dính ghê, xem cuốn từ đầu tới cuối.',
                    movieSlug: 'deadpool-va-wolverine',
                    movieName: 'Deadpool & Wolverine',
                    timeAgo: '2 giờ trước'
                }
            ]
        });
    }
});

// Direct handler for gamification leaderboard fallback
app.get('/api/gamification/leaderboard', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/gamification/leaderboard`, { params: req.query, timeout: 2500 });
        if (response.data) return res.json(response.data);
    } catch (e) {
        const fallbackMe = {
            id: req.query.userId || 'me',
            isMe: true,
            name: 'Thành viên',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThanhVien',
            xp: 100,
            hours: 2,
            rank: 'Tân Thủ',
            tier: 'bronze',
            level: 1,
            streak: 1,
            position: 1
        };
        return res.json({
            success: true,
            data: {
                timeframe: req.query.timeframe || 'weekly',
                top3: [fallbackMe],
                rest: [],
                myRank: 1,
                myEntry: fallbackMe,
                all: [fallbackMe]
            }
        });
    }
});

// Direct handler for desktop interests ("Bạn đang quan tâm gì?") fallback
app.get('/api/settings/desktop-interests', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/desktop-interests`, { timeout: 2500 });
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            return res.json(response.data);
        }
    } catch (e) {}

    const defaultInterests = [
        {
            id: 'phim-bo',
            title: 'Phim Bộ',
            actionText: 'XEM NGAY',
            link: 'danh-sach.html?list=phim-bo',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4338ca 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20260620-1/00083387b890aaac69f0490b3fda8c13.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
        },
        {
            id: 'phim-moi',
            title: 'Phim Mới',
            actionText: 'XEM NGAY',
            link: 'danh-sach.html?list=phim-moi-cap-nhat',
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20250530-1/fdf11774cff47f0ffc9c2dbe2e02d0ca.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>'
        },
        {
            id: 'hanh-dong',
            title: 'Hành Động',
            actionText: 'XEM NGAY',
            link: 'categories.html?category=hanh-dong',
            color: '#f97316',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20250821-1/1ec414f82adc729512410edd1b083996.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
        },
        {
            id: 'tinh-cam',
            title: 'Tình Cảm',
            actionText: 'XEM NGAY',
            link: 'categories.html?category=tinh-cam',
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 55%, #be185d 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20250901-1/377ca3402a12c55372f0145f49c0e4a5.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>'
        },
        {
            id: 'hai-huoc',
            title: 'Hài Hước',
            actionText: 'XEM NGAY',
            link: 'categories.html?category=hai-huoc',
            color: '#eab308',
            gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 55%, #854d0e 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20241118-1/3b9d2f3c9a5cf65d15a23db8d0c870ac.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M8 14c1.5 2 6.5 2 8 0M9 9h.01M15 9h.01"></path></svg>'
        },
        {
            id: 'hoat-hinh',
            title: 'Hoạt Hình',
            actionText: 'XEM NGAY',
            link: 'danh-sach.html?list=hoat-hinh',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 55%, #065f46 100%)',
            imageUrl: 'https://phimimg.com/upload/vod/20241229-1/309e1f1623755fa993140a83167f577b.jpg',
            iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        }
    ];
    return res.json({ success: true, data: defaultInterests });
});

// General proxy for all other /api/* routes
app.use('/api', async (req, res, next) => {
    try {
        const targetUrl = `${BACKEND_URL}/api${req.url}`;
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: {
                ...req.headers,
                host: `127.0.0.1:${BACKEND_PORT}`
            },
            data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
            params: req.query,
            validateStatus: () => true,
            timeout: 5000
        });

        res.status(response.status).set(response.headers).send(response.data);
    } catch (err) {
        // If backend is not available, return clean JSON
        res.status(502).json({ success: false, message: 'Backend service temporarily unavailable' });
    }
});

// ==========================================
// 404 HANDLER
// ==========================================
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// ==========================================
// START SERVER
// ==========================================
const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎬 APhim Server (Express + EJS) đang chạy!           ║
║                                                           ║
║   🌐 URL: http://localhost:${PORT}                        ║
║                                                           ║
║   📄 Trang chính (SSR):                                  ║
║   • http://localhost:${PORT}/                             ║
║   • http://localhost:${PORT}/phim/:slug                   ║
║   • http://localhost:${PORT}/xem-phim/:slug/:ep           ║
║   • http://localhost:${PORT}/search                       ║
║   • http://localhost:${PORT}/pricing                      ║
║   • http://localhost:${PORT}/danh-sach                    ║
║   • http://localhost:${PORT}/login                        ║
║   • http://localhost:${PORT}/profile                      ║
║   • http://localhost:${PORT}/admin/dashboard              ║
║   • http://localhost:${PORT}/sitemap.xml                  ║
║                                                           ║
║   🚀 SSR với EJS + Express                               ║
║   ⏹️  Nhấn Ctrl+C để dừng server                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
