const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/movie-detail', (req, res) => {
    res.sendFile(path.join(__dirname, 'movie-detail.html'));
});

app.get('/watch', (req, res) => {
    res.sendFile(path.join(__dirname, 'watch.html'));
});

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/the-thao', (req, res) => {
    res.sendFile(path.join(__dirname, 'the-thao.html'));
});



// ===== PROXY: Sport Radar Live Score =====
app.get('/api/sportradar/live-score', async (req, res) => {
    try {
        const { event_id } = req.query;
        if (!event_id) return res.status(400).json({ error: 'event_id is required' });
        const url = `https://sport-radar-api.p.rapidapi.com/live/score-ui?event_id=${event_id}`;
        const response = await fetch(url, {
            headers: {
                'x-rapidapi-key': '8e131041e5msheef9200c98e9712p109669jsn30145b3c501d',
                'x-rapidapi-host': 'sport-radar-api.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== CACHE: 5 phút để tránh 429 rate limit =====
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

// Queue để tránh gọi đồng thời nhiều request
let apiQueue = Promise.resolve();
function queuedFetch(url, options) {
    apiQueue = apiQueue.then(() =>
        fetch(url, options).then(async r => ({ status: r.status, text: await r.text() }))
    );
    return apiQueue;
}

// Proxy lấy dữ liệu trận đấu (Dùng RapidAPI)
app.get('/api/sofascore/*', async (req, res) => {
  try {
    const targetPath = req.params[0]; // VD: api/v1/sport/football/events/live
    const cacheKey = targetPath;

    // 1. Kiểm tra Cache
    const cached = getCached(cacheKey);
    if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).send(cached);
    } // Trả trực tiếp text từ cache

    // 2. Gọi RapidAPI qua hàng đợi
    const url = `https://sportapi7.p.rapidapi.com/${targetPath}`;
    const result = await queuedFetch(url, {
        headers: {
            'x-rapidapi-key': '8e131041e5msheef9200c98e9712p109669jsn30145b3c501d', // KEY MOI
            'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
            'Accept': 'application/json'
        }
    });

    // 3. Xử lý kết quả
    if (result.status === 200 && result.text) {
        setCache(cacheKey, result.text); // Lưu cache 5 phút
        res.setHeader('X-Cache', 'MISS');
        res.status(200).send(result.text);
    } else {
        console.error(`RapidAPI Error ${result.status}:`, result.text);
        res.status(200).json({ events: [] }); // Tránh crash
    }
  } catch (error) {
    console.error("RapidAPI Proxy Error:", error.message);
    res.status(200).json({ events: [] }); 
  }
});

// Proxy lấy ảnh (Logo đội bóng)
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

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'search.html'));
});

// Admin routes
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

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Không tìm thấy trang</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center min-h-screen">
            <div class="text-center">
                <h1 class="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                <p class="text-xl mb-8">Không tìm thấy trang</p>
                <a href="/" class="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                    Về trang chủ
                </a>
            </div>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎬 CineStream Server đang chạy!                        ║
║                                                           ║
║   🌐 URL: http://localhost:${PORT}                        ║
║   📁 Thư mục: ${__dirname}                    
║                                                           ║
║   📄 Các trang có sẵn:                                   ║
║   • http://localhost:${PORT}/                             ║
║   • http://localhost:${PORT}/login                        ║
║   • http://localhost:${PORT}/movie-detail                 ║
║   • http://localhost:${PORT}/watch                        ║
║   • http://localhost:${PORT}/pricing                      ║
║   • http://localhost:${PORT}/profile                      ║
║   • http://localhost:${PORT}/search                       ║
║   • http://localhost:${PORT}/admin/dashboard              ║
║                                                           ║
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
