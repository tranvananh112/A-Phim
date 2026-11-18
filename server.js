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
                // Fallback realistic community comments
        return res.json({
            success: true,
            data: [
          {
                    "userName": "Admin APhim",
                    "userAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
                    "badge": "ADMIN TOP 1",
                    "nameColor": "color_gold",
                    "isAdmin": true,
                    "isVip": true,
                    "level": 99,
                    "reactionsCount": 188,
                    "timeAgo": "Vừa xong",
                    "movieSlug": "thap-van-cuong-hoa-nhap-mong-lai",
                    "movieName": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
                    "content": "Đã lên sóng full Vietsub & Thuyết Minh tập mới nhất rồi nha mn! Tối nay chúc cả nhà cày phim vui vẻ 🍿✨"
          },
          {
                    "userName": "Thảo My 🌸",
                    "userAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0e839cd79500e7b68e2bbbed54790c28.png?size=240&passthrough=true",
                    "badge": "CÀY PHIM",
                    "nameColor": "color_pink",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 28,
                    "reactionsCount": 64,
                    "timeAgo": "12 phút trước",
                    "movieSlug": "cam-nguyet-nhu-ca",
                    "movieName": "Cẩm Nguyệt Như Ca",
                    "content": "Hà Yến với Tiêu Giác chemistry đỉnh xỉu luôn á chùi ui, đoạn gặp lại nhau ở Dịch Châu coi mà rung rinh tim 🥺💖"
          },
          {
                    "userName": "Quang Huy ⚡",
                    "userAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_001e956faa73bd0410c455234c62818f.png?size=240&passthrough=true",
                    "badge": "VIP PRO",
                    "nameColor": "color_cyan",
                    "isAdmin": false,
                    "isVip": true,
                    "level": 52,
                    "reactionsCount": 89,
                    "timeAgo": "28 phút trước",
                    "movieSlug": "thap-van-cuong-hoa-nhap-mong-lai",
                    "movieName": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
                    "content": "Vụ án bể máu trả hồn cuốn dã man, tạo hình ma đầu Kỳ Phượng Ân ngầu đét, nhạc nền nghe sởn gai ốc thật sự 🔥"
          },
          {
                    "userName": "Ngọc Huyền 🎀",
                    "userAvatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_1acbe609daec21fa5b866df9e5a42cb7.png?size=240&passthrough=true",
                    "badge": "FAN CỨNG",
                    "nameColor": "color_pink",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 34,
                    "reactionsCount": 47,
                    "timeAgo": "45 phút trước",
                    "movieSlug": "100-ngay-lua-doi",
                    "movieName": "100 Ngày Lừa Dối",
                    "content": "Plot twist mấy tập gần đây quay xe khét lẹt luôn mn ơi, không ngờ ông viện trưởng lại là trùm cuối 😱"
          },
          {
                    "userName": "Hoàng Nam 🩺",
                    "userAvatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_3c97a2d37f433a7913a1c7b7a735d000.png?size=240&passthrough=true",
                    "badge": "VIP PRO",
                    "nameColor": "color_green",
                    "isAdmin": false,
                    "isVip": true,
                    "level": 46,
                    "reactionsCount": 53,
                    "timeAgo": "1 giờ trước",
                    "movieSlug": "bac-si-x",
                    "movieName": "Bác Sĩ X",
                    "content": "Pha mổ tim ở cuối tập căng như dây đàn, bác sĩ Daimon ra tay dứt khoát đỉnh nóc kịch trần luôn 💯"
          },
          {
                    "userName": "Khánh Linh ✨",
                    "userAvatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_777b7aa8e77a569766e4a2e2bf656f4e.png?size=240&passthrough=true",
                    "badge": "CÀY PHIM",
                    "nameColor": "color_pink",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 22,
                    "reactionsCount": 38,
                    "timeAgo": "2 giờ trước",
                    "movieSlug": "tinh-yeu-doc-nhat",
                    "movieName": "Tình Yêu Độc Nhất",
                    "content": "Cặp đôi chính dễ thương xỉu, coi cảnh hậu trường với cảnh tỏ tình mà cười tủm tỉm quắn quéo cả người 🙈❤️"
          },
          {
                    "userName": "Tuấn Kiệt 🎬",
                    "userAvatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
                    "badge": "FAN CỨNG",
                    "nameColor": "color_cyan",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 39,
                    "reactionsCount": 71,
                    "timeAgo": "3 giờ trước",
                    "movieSlug": "deadpool-va-wolverine",
                    "movieName": "Deadpool & Wolverine",
                    "content": "Xem lại lần 3 vẫn cười sặc sụa với mấy quả cameo chất chơi người dơi, quả nhạc Madonna đánh combat thì đỉnh nóc luôn!"
          },
          {
                    "userName": "Bảo Trâm 🌸",
                    "userAvatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0e839cd79500e7b68e2bbbed54790c28.png?size=240&passthrough=true",
                    "badge": "VIP PRO",
                    "nameColor": "color_gold",
                    "isAdmin": false,
                    "isVip": true,
                    "level": 60,
                    "reactionsCount": 95,
                    "timeAgo": "4 giờ trước",
                    "movieSlug": "tham-tu-lung-danh-conan-ngoi-sao-5-canh-1-trieu-do",
                    "movieName": "Thám Tử Lừng Danh Conan",
                    "content": "Kid với Heiji phối hợp out trình phản diện, khúc cuối lộ thân phận họ hàng của Kid với Shinichi sốc ngang ngửa =)))"
          },
          {
                    "userName": "Minh Đức ☕",
                    "userAvatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_001e956faa73bd0410c455234c62818f.png?size=240&passthrough=true",
                    "badge": "THÀNH VIÊN",
                    "nameColor": "color_default",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 15,
                    "reactionsCount": 19,
                    "timeAgo": "5 giờ trước",
                    "movieSlug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
                    "movieName": "Tình Yêu Trong Vỏ Bọc",
                    "content": "Phim hài công sở nhẹ nhàng xả stress cực tốt, nữ chính giả trai đáng yêu ghê á!"
          },
          {
                    "userName": "Admin APhim",
                    "userAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
                    "badge": "ADMIN TOP 1",
                    "nameColor": "color_gold",
                    "isAdmin": true,
                    "isVip": true,
                    "level": 99,
                    "reactionsCount": 142,
                    "timeAgo": "7 giờ trước",
                    "movieSlug": "cam-nguyet-nhu-ca",
                    "movieName": "Cẩm Nguyệt Như Ca",
                    "content": "Ad vừa tối ưu xong máy chủ VIP tốc độ cao cho tập mới rồi nhé, mn vào xem mượt mà không lo nghẽn mạng nha 🚀"
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

// Autoslide settings
let autoSlideStateConfig = { enabled: false, interval: 10, pauseOnHover: true };
app.get('/api/settings/desktop-hero-autoslide', (req, res) => {
    return res.json({ success: true, data: autoSlideStateConfig });
});
app.put('/api/settings/desktop-hero-autoslide', async (req, res) => {
    try {
        const { enabled, interval, pauseOnHover } = req.body;
        autoSlideStateConfig = {
            enabled: enabled === true || enabled === 'true',
            interval: parseInt(interval, 10) || 10,
            pauseOnHover: pauseOnHover !== false
        };
        try {
            const mongoose = require('f:/Wesite Xem Phim/backend/node_modules/mongoose');
            const mongoUri = 'mongodb+srv://cinestream_admin:%23Anh0937010123@cluster0.cc4bua2.mongodb.net/cinestream?retryWrites=true&w=majority';
            if (mongoose.connection.readyState !== 1) await mongoose.connect(mongoUri);
            const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));
            await Setting.findOneAndUpdate({}, { $set: { desktop_hero_autoslide: autoSlideStateConfig } }, { new: true });
        } catch(e) {}
    } catch(err) {}
    res.json({ success: true, message: 'Đã lưu cấu hình tự động chuyển banner thành công!', data: autoSlideStateConfig });
});

// Direct handler for desktop interests ("Bạn đang quan tâm gì?") fallback

// Direct PUT handler for desktop interests
app.put('/api/settings/desktop-interests', async (req, res) => {
    try {
        const { items } = req.body;
        if (Array.isArray(items) && items.length > 0) {
            defaultInterests.length = 0;
            items.forEach(it => defaultInterests.push(it));
            // Update MongoDB Atlas in background
            try {
                const mongoose = require('f:/Wesite Xem Phim/backend/node_modules/mongoose');
                const mongoUri = 'mongodb+srv://cinestream_admin:%23Anh0937010123@cluster0.cc4bua2.mongodb.net/cinestream?retryWrites=true&w=majority';
                if (mongoose.connection.readyState !== 1) await mongoose.connect(mongoUri);
                const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));
                await Setting.findOneAndUpdate({}, { $set: { desktop_interests: items } }, { new: true });
            } catch (errDb) {
                console.warn('[MongoDB Interests Update Warning]', errDb.message);
            }
            return res.json({ success: true, message: 'Đã lưu cấu hình danh mục thành công!', data: items });
        }
    } catch(err) {}
    res.json({ success: true, message: 'Đã lưu cấu hình danh mục thành công!' });
});

// Direct PUT handler for desktop hero showcase
app.put('/api/settings/desktop-hero-showcase', async (req, res) => {
    try {
        const { items } = req.body;
        if (Array.isArray(items) && items.length > 0) {
            defaultHeroSlides.length = 0;
            items.forEach(it => defaultHeroSlides.push(it));
            // Update MongoDB Atlas in background
            try {
                const mongoose = require('f:/Wesite Xem Phim/backend/node_modules/mongoose');
                const mongoUri = 'mongodb+srv://cinestream_admin:%23Anh0937010123@cluster0.cc4bua2.mongodb.net/cinestream?retryWrites=true&w=majority';
                if (mongoose.connection.readyState !== 1) await mongoose.connect(mongoUri);
                const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));
                await Setting.findOneAndUpdate({}, { $set: { desktop_hero_showcase: items } }, { new: true });
            } catch (errDb) {
                console.warn('[MongoDB Hero Update Warning]', errDb.message);
            }
            return res.json({ success: true, message: 'Đã lưu cấu hình Hero Showcase thành công!', data: items });
        }
    } catch(err) {}
    res.json({ success: true, message: 'Đã lưu cấu hình Hero Showcase thành công!' });
});

app.get('/api/settings/desktop-interests', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/desktop-interests`, { timeout: 2500 });
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            return res.json(response.data);
        }
    } catch (e) {}

    const defaultInterests = [
    {
        "id": "phim-bo",
        "link": "danh-sach.html?list=phim-bo",
        "title": "Phim Bộ",
        "color": "#8b5cf6",
        "gradient": "linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4338ca 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/original/tMQmL8rEZul6mfXrzcOYYflXWYX.jpg",
        "colorRgb": "139, 92, 246",
        "themeColor": "#8b5cf6",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"></path></svg>",
        "iconName": "flame",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "phim-moi",
        "link": "danh-sach.html?list=phim-moi-cap-nhat",
        "title": "Phim Mới",
        "color": "#ef4444",
        "gradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/original/ft4D3bgpJrJ4m4nhnwmKxr10FwY.jpg",
        "colorRgb": "239, 68, 68",
        "themeColor": "#ef4444",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 14c1.5 2 6.5 2 8 0\"></path><line x1=\"9\" y1=\"9\" x2=\"9.01\" y2=\"9\"></line><line x1=\"15\" y1=\"9\" x2=\"15.01\" y2=\"9\"></line></svg>",
        "iconName": "smile",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "hanh-dong",
        "link": "categories.html?category=hanh-dong",
        "title": "Hành Động",
        "color": "#f97316",
        "gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/original/hTPHK7Bjjvqjc17m4blrak4QhNe.jpg",
        "colorRgb": "249, 115, 22",
        "themeColor": "#f97316",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"></path></svg>",
        "iconName": "flame",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "tinh-cam",
        "link": "categories.html?category=tinh-cam",
        "title": "Tình Cảm",
        "color": "#ec4899",
        "gradient": "linear-gradient(135deg, #ec4899 0%, #db2777 55%, #be185d 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/original/d5XKPrSEeWMoQbzc6qNI5Ewjj9r.jpg",
        "colorRgb": "236, 72, 153",
        "themeColor": "#ec4899",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"></path></svg>",
        "iconName": "heart",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "hai-huoc",
        "link": "categories.html?category=hai-huoc",
        "title": "Hài Hước",
        "color": "#eab308",
        "gradient": "linear-gradient(135deg, #eab308 0%, #ca8a04 55%, #854d0e 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/original/ykYenWf8y5YqyZFkDdmVeKczTMl.jpg",
        "colorRgb": "234, 179, 8",
        "themeColor": "#eab308",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 14c1.5 2 6.5 2 8 0\"></path><line x1=\"9\" y1=\"9\" x2=\"9.01\" y2=\"9\"></line><line x1=\"15\" y1=\"9\" x2=\"15.01\" y2=\"9\"></line></svg>",
        "iconName": "smile",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    },
    {
        "id": "hoat-hinh",
        "link": "danh-sach.html?list=hoat-hinh",
        "title": "Hoạt Hình",
        "color": "#10b981",
        "gradient": "linear-gradient(135deg, #10b981 0%, #059669 55%, #065f46 100%)",
        "imageUrl": "https://image.tmdb.org/t/p/original/qX1Krx6zWIkF6q72fcB7sNlTrri.jpg",
        "colorRgb": "16, 185, 129",
        "themeColor": "#10b981",
        "iconSvg": "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"3\"></rect><polyline points=\"17 2 12 7 7 2\"></polyline></svg>",
        "iconName": "tv",
        "iconColor": "#ffffff",
        "textColor": "#ffffff",
        "actionText": "XEM NGAY"
    }
];
    return res.json({ success: true, data: defaultInterests });
});

// Fallback endpoint cho desktop hero showcase khi backend expired
app.get('/api/settings/desktop-hero-showcase', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/desktop-hero-showcase`, { timeout: 1500 });
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            return res.json(response.data);
        }
    } catch (e) {}

    const defaultHeroSlides = [
    {
        "imdb": {
            "vote_average": 8.1
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Cẩm Nguyệt Như Ca",
        "slug": "cam-nguyet-nhu-ca",
        "tmdb": {
            "vote_average": 8.1
        },
        "year": "2025",
        "content": "Phim được chuyển thể từ tiểu thuyết nổi tiếng \"Trùng Sinh: Nữ Tướng Tinh\". Để bảo vệ tước vị gia tộc, trưởng nữ Hà gia là Hà Yến buộc phải đeo mặt nạ, giả làm đích trưởng tử Hà gia - Hà Như Phi. Thời thiếu niên, Hà Yến lần đầu gặp công tử cao quý Tiêu Giác ở Hiền Xương Quán. Sau này, để thoát khỏi vận mệnh gia tộc, cô kiên quyết rời học quán, ra sa trường. Nhiều năm sau, Hà Yến vinh quang trở về quê nhà, nhưng lại bị gia tộc hãm hại vì huynh trưởng Hà Như Phi quay về. Sau khi thoát chết, Hà Yến đổi thân phận, hóa thân thành Hòa Yến, con gái của thành môn hiệu úy. Cô giả nam, đến Dịch Châu tòng quân, quyết tâm lấy lại tất cả những gì thuộc về mình. Hòa Yến kết giao với Sở Chiêu hòa nhã dịu dàng, cũng một lần nữa gặp lại Tiêu Giác. Nhưng Tiêu Giác nghi ngờ Hòa Yến là gian tế, liên tục thăm dò, làm khó đủ đường. Hòa Yến bám chặt lấy Tiêu Giác, đồng thời dùng thành tích đứng đầu Dịch Châu Vệ để chứng minh năng lực của mình. Hai người cùng trải qua sự kiện Tôn gia, sự kiện vương nữ Quý Dương, trận chiến bảo vệ thành Nhuận Đô, nhiều lần đối mặt sinh tử, dần dần nảy sinh tình cảm với nhau.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/tBrO0gV9yWqEVzm8CidpxnQTKlj.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/mwiG510fVcOrzWUSDSV7B5tRMrb.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/mwiG510fVcOrzWUSDSV7B5tRMrb.jpg",
        "movieSlug": "cam-nguyet-nhu-ca",
        "posterUrl": "https://phimimg.com/upload/vod/20250806-1/eaa856bf1bf6e28c17ebafdc2283f8ad.jpg",
        "thumb_url": "https://image.tmdb.org/t/p/original/mwiG510fVcOrzWUSDSV7B5tRMrb.jpg",
        "originName": "Legend Of The Female General",
        "poster_url": "https://phimimg.com/upload/vod/20250806-1/eaa856bf1bf6e28c17ebafdc2283f8ad.jpg",
        "origin_name": "Legend Of The Female General",
        "episodeCurrent": "Hoàn Tất (36/36)",
        "episode_current": "Hoàn Tất (36/36)"
    },
    {
        "imdb": {
            "vote_average": 9
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
        "slug": "thap-van-cuong-hoa-nhap-mong-lai",
        "tmdb": {
            "vote_average": 9
        },
        "year": "2026",
        "content": "Ma đầu Kỳ Phượng Ân \"nguồn gốc vạn điều ác\" tình cờ gặp cô gái Áp Mao mang thể chất \"thịt Đường Tăng\", hai con người bị cưỡng ép ràng buộc này vừa chán ghét nhau mà cũng cứu rỗi lẫn nhau. Trải qua sáu vụ án kì quái: bộ xương khô tóc dài, sáng làm người tối làm yêu, thuồng luồng hóa rồng, bể máu trả hồn, hồng nhan moi tim và pháo hoa cá vàng, họ phá giải các âm mưu phía sau, cuối cùng giúp nhau rửa sạch tiếng xấu, trả lại tự do cho thế gian, giúp những người có tình được về bên nhau.",
        "logoUrl": "/images/logos/thap-van-cuong-hoa-nhap-mong-lai.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/8nqLbfvduuLQtzALe3ZjxiHtgLt.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/8nqLbfvduuLQtzALe3ZjxiHtgLt.jpg",
        "movieSlug": "thap-van-cuong-hoa-nhap-mong-lai",
        "posterUrl": "https://phimimg.com/uploads/movies/20261117/thap-van-cuong-hoa-nhap-mong-lai-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/8nqLbfvduuLQtzALe3ZjxiHtgLt.jpg",
        "originName": "Blossom in Darkness",
        "poster_url": "https://phimimg.com/uploads/movies/20261117/thap-van-cuong-hoa-nhap-mong-lai-poster.webp",
        "origin_name": "Blossom in Darkness",
        "episodeCurrent": "Tập 9",
        "episode_current": "Tập 9"
    },
    {
        "imdb": {
            "vote_average": 9
        },
        "lang": "Vietsub",
        "name": "Bác Sĩ X",
        "slug": "bac-si-x",
        "tmdb": {
            "vote_average": 9
        },
        "year": "2026",
        "content": "Ở một bệnh viện nơi cái tôi và tham nhũng lộng hành, một bác sĩ phẫu thuật bí ẩn nhưng tài năng xuất hiện – nhận những ca tưởng chừng bất khả thi bất chấp sự phản đối quyết liệt.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/x8Xw8Wa0HUlRySJjYn8udIy7Mun.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/f0JkNBCO5WuCI63F0iM0Xs32k9C.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/f0JkNBCO5WuCI63F0iM0Xs32k9C.jpg",
        "movieSlug": "bac-si-x",
        "posterUrl": "https://phimimg.com/uploads/movies/20261010/bac-si-x-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/f0JkNBCO5WuCI63F0iM0Xs32k9C.jpg",
        "originName": "Doctor X: Mafia in White",
        "poster_url": "https://phimimg.com/uploads/movies/20261010/bac-si-x-poster.webp",
        "origin_name": "Doctor X: Mafia in White",
        "episodeCurrent": "Tập 1",
        "episode_current": "Tập 1"
    },
    {
        "imdb": {
            "vote_average": 9.5
        },
        "lang": "Vietsub",
        "name": "100 Ngày Lừa Dối",
        "slug": "100-ngay-lua-doi",
        "tmdb": {
            "vote_average": 9.5
        },
        "year": "2026",
        "content": "Khao khát tự do, cô nàng móc túi số một của Gyeongseong thâm nhập vào chính quyền thực dân Nhật để đánh cắp bí mật, nhưng lại phải lòng con trai của mục tiêu.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/hP32NrFGeACEoXkZn1MzB13UHKG.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/3SvKCITqMtjgPIhFBjRc4yTAc4H.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/3SvKCITqMtjgPIhFBjRc4yTAc4H.jpg",
        "movieSlug": "100-ngay-lua-doi",
        "posterUrl": "https://phimimg.com/uploads/movies/20261011/100-ngay-lua-doi-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/3SvKCITqMtjgPIhFBjRc4yTAc4H.jpg",
        "originName": "100 Days Of Deception",
        "poster_url": "https://phimimg.com/uploads/movies/20261011/100-ngay-lua-doi-poster.webp",
        "origin_name": "100 Days Of Deception",
        "episodeCurrent": "Tập 2",
        "episode_current": "Tập 2"
    },
    {
        "imdb": {
            "vote_average": 9.5
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Tình Yêu Độc Nhất",
        "slug": "tinh-yeu-doc-nhat",
        "tmdb": {
            "vote_average": 9.5
        },
        "year": "2026",
        "content": "Giữa cuộc sống chật vật và những giấc mơ dang dở, Gong Yu Il bất ngờ bước vào thế giới của ngôi sao Tak Mu I – người đang sống trong nỗi sợ hãi vì bị bám đuôi. Khi trở thành quản lý của anh, Yu Il phát hiện cuốn tiểu thuyết mình từng viết chính là ánh sáng đã nâng đỡ Mu I trong những ngày tăm tối. Từ những tổn thương giấu kín, hai trái tim dần tìm thấy nhau, viết nên một tình yêu vừa mong manh, vừa duy nhất.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/flSN0asy52nuiG04Lo8AuwME7tU.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/v6OPylktx8YY8uF0AWCK9LyAUSr.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/v6OPylktx8YY8uF0AWCK9LyAUSr.jpg",
        "movieSlug": "tinh-yeu-doc-nhat",
        "posterUrl": "https://phimimg.com/uploads/movies/20261111/tinh-yeu-doc-nhat-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/v6OPylktx8YY8uF0AWCK9LyAUSr.jpg",
        "originName": "One Of A Kind Romance",
        "poster_url": "https://phimimg.com/uploads/movies/20261111/tinh-yeu-doc-nhat-poster.webp",
        "origin_name": "One Of A Kind Romance",
        "episodeCurrent": "Tập 2",
        "episode_current": "Tập 2"
    },
    {
        "imdb": {
            "vote_average": 1
        },
        "lang": "Vietsub",
        "name": "Tình Yêu Trong Vỏ Bọc / Tình Yêu Ngụy Trang",
        "slug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
        "tmdb": {
            "vote_average": 1
        },
        "year": "2026",
        "content": "Tình Yêu Trong Vỏ Bọc (Love in Disguise) là một bộ phim truyền hình hài lãng mạn công sở của Hàn Quốc, với sự tham gia của các diễn viên Yim Si-wan, Seol In-ah, Kim Jung-hyun và Yeonwoo. Dựa trên tiểu thuyết mạng \"Tại Sao Bạn Không Biết Đó Là Con Gái?\"",
        "logoUrl": "https://image.tmdb.org/t/p/w500/e4PFz0r4GlFX4WOhFm0RpI9CgdM.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/32g5MD6eHPAZ5NAgkNAURb4eupm.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/32g5MD6eHPAZ5NAgkNAURb4eupm.jpg",
        "movieSlug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
        "posterUrl": "https://phimimg.com/uploads/movies/20261020/tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/32g5MD6eHPAZ5NAgkNAURb4eupm.jpg",
        "originName": "Love in Disguise",
        "poster_url": "https://phimimg.com/uploads/movies/20261020/tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang-poster.webp",
        "origin_name": "Love in Disguise",
        "episodeCurrent": "Tập 7",
        "episode_current": "Tập 7"
    },
    {
        "imdb": {
            "vote_average": 9
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Gấp Ánh Trăng",
        "slug": "gap-anh-trang",
        "tmdb": {
            "vote_average": 9
        },
        "year": "2026",
        "content": "Vân Li, cô gái mắc chứng sợ giao tiếp nghiêm trọng, đến Nam Vu học cao học để chứng minh mình có thể sống tự lập và tình cờ gặp lại Phó Thức Tắc, chàng trai cô thầm mến từ thời trung học.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/2V8taZ4kwRbcOb6dlAQqViXeki8.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/Al5cft7sYLo46rhSKc9VUm125md.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/Al5cft7sYLo46rhSKc9VUm125md.jpg",
        "movieSlug": "gap-anh-trang",
        "posterUrl": "https://phimimg.com/uploads/movies/20261105/gap-anh-trang-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/Al5cft7sYLo46rhSKc9VUm125md.jpg",
        "originName": "When I Meet The Moon",
        "poster_url": "https://phimimg.com/uploads/movies/20261105/gap-anh-trang-poster.webp",
        "origin_name": "When I Meet The Moon",
        "episodeCurrent": "Tập 8",
        "episode_current": "Tập 8"
    },
    {
        "imdb": {
            "vote_average": 8.3
        },
        "lang": "Vietsub",
        "name": "Hoàng Hậu Tái Hôn",
        "slug": "hoang-hau-tai-hon",
        "tmdb": {
            "vote_average": 8.3
        },
        "year": "2026",
        "content": "Hoàng hậu Navier là người đứng đầu hoàn hảo của Đông Đế Quốc, cai trị đất nước cùng chồng là Hoàng đế Sovieshu. Tuy nhiên, cuộc sống và ngai vị của cô đảo lộn khi Sovieshu mang về cô hầu gái trốn chạy tên Rashta và sủng ái cô ta đến mức đòi ly hôn Navier. Thay vì gục ngã hay bi lụy, Navier đồng ý ly hôn với một điều kiện: cô được phép tái hôn với Hoàng tử Heinrey quyền lực của Tây Vương Quốc, từ đó bắt đầu hành động lật ngược thế cờ và làm chủ vận mệnh mới của mình.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/tfsYQser4eLq4npTdf6tHNKet5q.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
        "movieSlug": "hoang-hau-tai-hon",
        "posterUrl": "https://phimimg.com/uploads/movies/20261105/hoang-hau-tai-hon-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
        "originName": "The Remarried Empress",
        "poster_url": "https://phimimg.com/uploads/movies/20261105/hoang-hau-tai-hon-poster.webp",
        "origin_name": "The Remarried Empress",
        "episodeCurrent": "Tập 4",
        "episode_current": "Tập 4"
    },
    {
        "imdb": {
            "vote_average": 7.6
        },
        "lang": "Vietsub",
        "name": "Việc Ma, Lương Quái",
        "slug": "viec-ma-luong-quai",
        "tmdb": {
            "vote_average": 7.6
        },
        "year": "2026",
        "content": "Chìm trong nợ nần, chàng trai trẻ nhận những công việc làm thêm béo bở từ một công ty môi giới việc làm bí ẩn – nhưng rồi nhận ra cuộc sống mưu sinh dần biến thành ác mộng.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/xurPYmj6xwd09XSceRIDRXYfYvc.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/original/thJ4Pu7Nrvpj1ZInP8rZtNEFU6D.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/original/thJ4Pu7Nrvpj1ZInP8rZtNEFU6D.jpg",
        "movieSlug": "viec-ma-luong-quai",
        "posterUrl": "https://phimimg.com/uploads/movies/20261031/viec-ma-luong-quai-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/original/thJ4Pu7Nrvpj1ZInP8rZtNEFU6D.jpg",
        "originName": "Dead-End Job",
        "poster_url": "https://phimimg.com/uploads/movies/20261031/viec-ma-luong-quai-poster.webp",
        "origin_name": "Dead-End Job",
        "episodeCurrent": "Hoàn Tất (8/8)",
        "episode_current": "Hoàn Tất (8/8)"
    }
];
    return res.json({ success: true, data: defaultHeroSlides });
});

// Fallback endpoint cho mobile 3D showcase
app.get('/api/settings/mobile-3d-showcase', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/mobile-3d-showcase`, { timeout: 1500 });
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            return res.json(response.data);
        }
    } catch (e) {}

    const defaultMobileShowcase = [
    {
        "lang": "Vietsub + Thuyết Minh",
        "name": "Cẩm Nguyệt Như Ca",
        "slug": "cam-nguyet-nhu-ca",
        "year": "2025",
        "content": "Phim được chuyển thể từ tiểu thuyết nổi tiếng \"Trùng Sinh: Nữ Tướng Tinh\". Để bảo vệ tước vị gia tộc, trưởng nữ Hà gia là Hà Yến buộc phải đeo mặt nạ, giả làm đích trưởng tử Hà gia - Hà Như Phi. Thời thiếu niên, Hà Yến lần đầu gặp công tử cao quý Tiêu Giác ở Hiền Xương Quán. Sau này, để thoát khỏi vận mệnh gia tộc, cô kiên quyết rời học quán, ra sa trường. Nhiều năm sau, Hà Yến vinh quang trở về quê nhà, nhưng lại bị gia tộc hãm hại vì huynh trưởng Hà Như Phi quay về. Sau khi thoát chết, Hà Yến đổi thân phận, hóa thân thành Hòa Yến, con gái của thành môn hiệu úy. Cô giả nam, đến Dịch Châu tòng quân, quyết tâm lấy lại tất cả những gì thuộc về mình. Hòa Yến kết giao với Sở Chiêu hòa nhã dịu dàng, cũng một lần nữa gặp lại Tiêu Giác. Nhưng Tiêu Giác nghi ngờ Hòa Yến là gian tế, liên tục thăm dò, làm khó đủ đường. Hòa Yến bám chặt lấy Tiêu Giác, đồng thời dùng thành tích đứng đầu Dịch Châu Vệ để chứng minh năng lực của mình. Hai người cùng trải qua sự kiện Tôn gia, sự kiện vương nữ Quý Dương, trận chiến bảo vệ thành Nhuận Đô, nhiều lần đối mặt sinh tử, dần dần nảy sinh tình cảm với nhau.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/2mX9UXEX2icbNfXbf3fWqvQXcdc.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/2mX9UXEX2icbNfXbf3fWqvQXcdc.jpg",
        "origin_name": "Legend Of The Female General"
    },
    {
        "lang": "Vietsub + Thuyết Minh",
        "name": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
        "slug": "thap-van-cuong-hoa-nhap-mong-lai",
        "year": "2026",
        "content": "Ma đầu Kỳ Phượng Ân \"nguồn gốc vạn điều ác\" tình cờ gặp cô gái Áp Mao mang thể chất \"thịt Đường Tăng\", hai con người bị cưỡng ép ràng buộc này vừa chán ghét nhau mà cũng cứu rỗi lẫn nhau. Trải qua sáu vụ án kì quái: bộ xương khô tóc dài, sáng làm người tối làm yêu, thuồng luồng hóa rồng, bể máu trả hồn, hồng nhan moi tim và pháo hoa cá vàng, họ phá giải các âm mưu phía sau, cuối cùng giúp nhau rửa sạch tiếng xấu, trả lại tự do cho thế gian, giúp những người có tình được về bên nhau.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/vElJ9ZIr0DAJ7liAW81HByGBA5u.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/vElJ9ZIr0DAJ7liAW81HByGBA5u.jpg",
        "origin_name": "Blossom in Darkness"
    },
    {
        "lang": "Vietsub",
        "name": "Tình Yêu Trong Vỏ Bọc / Tình Yêu Ngụy Trang",
        "slug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
        "year": "2026",
        "content": "Tình Yêu Trong Vỏ Bọc (Love in Disguise) là một bộ phim truyền hình hài lãng mạn công sở của Hàn Quốc, với sự tham gia của các diễn viên Yim Si-wan, Seol In-ah, Kim Jung-hyun và Yeonwoo. Dựa trên tiểu thuyết mạng \"Tại Sao Bạn Không Biết Đó Là Con Gái?\"",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/c9DEtqCDZBPL9i06WmbDrcndrBy.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/c9DEtqCDZBPL9i06WmbDrcndrBy.jpg",
        "origin_name": "Love in Disguise"
    },
    {
        "lang": "Vietsub + Thuyết Minh",
        "name": "Tình Yêu Độc Nhất",
        "slug": "tinh-yeu-doc-nhat",
        "year": "2026",
        "content": "Giữa cuộc sống chật vật và những giấc mơ dang dở, Gong Yu Il bất ngờ bước vào thế giới của ngôi sao Tak Mu I – người đang sống trong nỗi sợ hãi vì bị bám đuôi. Khi trở thành quản lý của anh, Yu Il phát hiện cuốn tiểu thuyết mình từng viết chính là ánh sáng đã nâng đỡ Mu I trong những ngày tăm tối. Từ những tổn thương giấu kín, hai trái tim dần tìm thấy nhau, viết nên một tình yêu vừa mong manh, vừa duy nhất.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/i4dsGTeyt0p6aEdxKEMslpMJrOE.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/i4dsGTeyt0p6aEdxKEMslpMJrOE.jpg",
        "origin_name": "One Of A Kind Romance"
    },
    {
        "lang": "Vietsub",
        "name": "Chào Mẹ, Tạm Biệt!",
        "slug": "chao-me-tam-biet",
        "year": "2020",
        "content": "Chào Mẹ, Tạm Biệt là bộ phim kể về cuộc đời của Cha Yoo Ri (Kim Tae Hee), một người phụ nữ hóa thành hồn ma sau khi qua đời 5 năm trước. Cô ra đi đột ngột, để lại nỗi xót thương trong lòng Jo Kang Hwa (Lee Kyu Hyung) và đứa con. Để có thể hồi sinh, Cha Yoo Ri phải thực hiện các thử thách trong vòng 49 ngày.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/hrYPAnRJx8NlhweFSzRhrYDGqA6.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/hrYPAnRJx8NlhweFSzRhrYDGqA6.jpg",
        "origin_name": "Hi Bye, Mama!"
    },
    {
        "lang": "Vietsub",
        "name": "100 Ngày Lừa Dối",
        "slug": "100-ngay-lua-doi",
        "year": "2026",
        "content": "Khao khát tự do, cô nàng móc túi số một của Gyeongseong thâm nhập vào chính quyền thực dân Nhật để đánh cắp bí mật, nhưng lại phải lòng con trai của mục tiêu.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/yukp2lBvw4ENQvdLN1slneX6jxN.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/yukp2lBvw4ENQvdLN1slneX6jxN.jpg",
        "origin_name": "100 Days Of Deception"
    },
    {
        "lang": "Vietsub + Thuyết Minh",
        "name": "Gấp Ánh Trăng",
        "slug": "gap-anh-trang",
        "year": "2026",
        "content": "Vân Li, cô gái mắc chứng sợ giao tiếp nghiêm trọng, đến Nam Vu học cao học để chứng minh mình có thể sống tự lập và tình cờ gặp lại Phó Thức Tắc, chàng trai cô thầm mến từ thời trung học.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/3RrrTbz5zYmv8nZEj4PDXX47axi.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/3RrrTbz5zYmv8nZEj4PDXX47axi.jpg",
        "origin_name": "When I Meet The Moon"
    },
    {
        "lang": "Vietsub",
        "name": "Hoàng Hậu Tái Hôn",
        "slug": "hoang-hau-tai-hon",
        "year": "2026",
        "content": "Hoàng hậu Navier là người đứng đầu hoàn hảo của Đông Đế Quốc, cai trị đất nước cùng chồng là Hoàng đế Sovieshu. Tuy nhiên, cuộc sống và ngai vị của cô đảo lộn khi Sovieshu mang về cô hầu gái trốn chạy tên Rashta và sủng ái cô ta đến mức đòi ly hôn Navier. Thay vì gục ngã hay bi lụy, Navier đồng ý ly hôn với một điều kiện: cô được phép tái hôn với Hoàng tử Heinrey quyền lực của Tây Vương Quốc, từ đó bắt đầu hành động lật ngược thế cờ và làm chủ vận mệnh mới của mình.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/nWuOUzOHrn4VB7zRrrcZQHcB5Vx.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/nWuOUzOHrn4VB7zRrrcZQHcB5Vx.jpg",
        "origin_name": "The Remarried Empress"
    },
    {
        "lang": "Vietsub",
        "name": "Bác Sĩ X",
        "slug": "bac-si-x",
        "year": "2026",
        "content": "Ở một bệnh viện nơi cái tôi và tham nhũng lộng hành, một bác sĩ phẫu thuật bí ẩn nhưng tài năng xuất hiện – nhận những ca tưởng chừng bất khả thi bất chấp sự phản đối quyết liệt.",
        "quality": "FHD",
        "thumb_url": "https://image.tmdb.org/t/p/original/1R1fjtoNFylF4JpJE3ThCIbepvf.jpg",
        "poster_url": "https://image.tmdb.org/t/p/original/1R1fjtoNFylF4JpJE3ThCIbepvf.jpg",
        "origin_name": "Doctor X: Mafia in White"
    },
    {
        "lang": "Vietsub",
        "name": "Việc Ma, Lương Quái",
        "slug": "viec-ma-luong-quai",
        "year": "2026",
        "content": "Chìm trong nợ nần, chàng trai trẻ nhận những công việc làm thêm béo bở từ một công ty môi giới việc làm bí ẩn – nhưng rồi nhận ra cuộc sống mưu sinh dần biến thành ác mộng.",
        "quality": "FHD",
        "thumb_url": "https://phimimg.com/uploads/movies/20261031/viec-ma-luong-quai-poster.webp",
        "poster_url": "https://phimimg.com/uploads/movies/20261031/viec-ma-luong-quai-poster.webp",
        "origin_name": "Dead-End Job"
    }
];
    return res.json({ success: true, data: defaultMobileShowcase });
});

// Fallback endpoint cho public settings
app.get('/api/settings/public', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/settings/public`, { timeout: 1500 });
        if (response.data && response.data.success && response.data.data) {
            return res.json(response.data);
        }
    } catch (e) {}

    return res.json({
        success: true,
        data: {
            general: {
                siteName: "A Phim",
                siteDesc: "Nền tảng xem phim trực tuyến hàng đầu Việt Nam",
                siteDomain: "APhim.vn",
                logoUrl: "../favicon.png",
                faviconUrl: "../favicon.png",
                maintenanceMode: false,
                allowRegister: true,
                allowComments: true
            },
            content: {
                enablePhimX: false,
                enableWatermark: false,
                apiBase: "https://ophim1.com/v1/api",
                apiSecondary: "https://ophim1.com",
                enableMultipleSources: false,
                defaultServer: "Server #1 (OPhim)",
                categoryBackgrounds: {
                    "danh-sach/phim-bo": "https://phimimg.com/upload/vod/20260620-1/00083387b890aaac69f0490b3fda8c13.jpg",
                    "danh-sach/phim-moi-cap-nhat": "https://phimimg.com/upload/vod/20250530-1/fdf11774cff47f0ffc9c2dbe2e02d0ca.jpg",
                    "the-loai/hanh-dong": "https://phimimg.com/upload/vod/20250821-1/1ec414f82adc729512410edd1b083996.jpg",
                    "the-loai/tinh-cam": "https://phimimg.com/uploads/movies/20260810/co-nang-manh-me-do-bong-soon-thumb.webp",
                    "the-loai/hai-huoc": "https://phimimg.com/upload/vod/20241118-1/3b9d2f3c9a5cf65d15a23db8d0c870ac.jpg",
                    "danh-sach/hoat-hinh": "https://phimimg.com/upload/vod/20241229-1/309e1f1623755fa993140a83167f577b.jpg"
                },
                heroThumbnails: [
                    {
                        movieSlug: "van-tu-hanh",
                        name: "The Legend of Rosy Clouds",
                        originName: "The Legend Of Rosy Clouds",
                        thumbUrl: "https://phimimg.com/upload/vod/20260620-1/00083387b890aaac69f0490b3fda8c13.jpg",
                        posterUrl: "https://phimimg.com/upload/vod/20260620-1/6b7cf552ac9b66e18a5382c922d2bd0d.jpg",
                        year: 2026
                    },
                    {
                        movieSlug: "quat-mo-trung-ma",
                        name: "Quật Mộ Trùng Ma",
                        originName: "Exhuma",
                        thumbUrl: "https://phimimg.com/upload/vod/20250530-1/fdf11774cff47f0ffc9c2dbe2e02d0ca.jpg",
                        posterUrl: "https://phimimg.com/upload/vod/20250530-1/759df554cc21bf9d6805966dc3fe2b67.jpg",
                        year: 2024
                    },
                    {
                        movieSlug: "tham-tu-lung-danh-conan",
                        name: "Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh 1 Triệu Đô",
                        originName: "Detective Conan: The Million-Dollar Pentagram",
                        thumbUrl: "https://phimimg.com/upload/vod/20241229-1/309e1f1623755fa993140a83167f577b.jpg",
                        posterUrl: "https://phimimg.com/upload/vod/20240310-1/025424cf62248b9a7b54279ef5416e26.jpg",
                        year: 2024
                    },
                    {
                        movieSlug: "deadpool-va-wolverine",
                        name: "Deadpool & Wolverine",
                        originName: "Deadpool & Wolverine",
                        thumbUrl: "https://phimimg.com/upload/vod/20250821-1/1ec414f82adc729512410edd1b083996.jpg",
                        posterUrl: "https://phimimg.com/upload/vod/20250821-1/45b6b9aad03ae0aa2aceb5d73419831a.jpg",
                        year: 2024
                    },
                    {
                        movieSlug: "do-anh-cong-duoc-toi",
                        name: "Đố Anh Còng Được Tôi",
                        originName: "I, the Executioner",
                        thumbUrl: "https://phimimg.com/upload/vod/20241118-1/3b9d2f3c9a5cf65d15a23db8d0c870ac.jpg",
                        posterUrl: "https://phimimg.com/upload/vod/20241118-1/9f929fc12384573847849f8786f16ae2.jpg",
                        year: 2024
                    }
                ]
            }
        }
    });
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
