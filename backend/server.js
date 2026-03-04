require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimit');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://aphim.ddns.net',
    'https://aphim.io.vn', // Production domain
    'http://aphim.io.vn',  // HTTP version
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches CORS_ORIGIN env
        if (allowedOrigins.includes(origin) ||
            (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').includes(origin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies')); // Use MongoDB version
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/supporters', require('./routes/supporters'));
app.use('/api/banners', require('./routes/banners'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to CineStream API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            movies: '/api/movies',
            ratings: '/api/ratings',
            comments: '/api/comments',
            payments: '/api/payments',
            users: '/api/users',
            supporters: '/api/supporters'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎬 CineStream Backend API                              ║
║                                                           ║
║   🌐 Server: http://localhost:${PORT}                     ║
║   📊 Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   💾 Database: MongoDB Connected                         ║
║                                                           ║
║   📄 API Endpoints:                                      ║
║   • POST   /api/auth/register                           ║
║   • POST   /api/auth/login                              ║
║   • GET    /api/movies                                  ║
║   • GET    /api/movies/:slug                            ║
║   • GET    /api/movies/search?q=keyword                 ║
║   • POST   /api/movies/sync/:slug (Admin)              ║
║   • GET    /api/movies/:slug/stream/:episode            ║
║                                                           ║
║   📚 Documentation: /api/docs                           ║
║   ❤️  Health Check: /health                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = app;
