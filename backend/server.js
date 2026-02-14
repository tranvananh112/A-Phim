require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimit');

// Connect to database (commented out for demo without MongoDB)
// connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies.simple')); // Using simple version without MongoDB
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));

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
            users: '/api/users'
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
║   💾 Database: Demo mode (no MongoDB required)                            ║
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
