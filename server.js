const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
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
