const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ✅ Strict rate limiter for auth routes (login/forgot password)
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10, // Tối đa 10 lần/15 phút/IP
    message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút'
    },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});

// ✅ SUPER STRICT rate limiter for REGISTER only (chặn bot đăng ký hàng loạt)
exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 3, // Tối đa 3 tài khoản/giờ/IP
    message: {
        success: false,
        message: 'Bạn đã đăng ký quá nhiều tài khoản. Vui lòng thử lại sau 1 giờ.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`[BOT BLOCK] Register rate limit hit: IP=${req.ip}, UA=${req.headers['user-agent']}`);
        res.status(429).json({
            success: false,
            message: 'Bạn đã đăng ký quá nhiều tài khoản. Vui lòng thử lại sau 1 giờ.'
        });
    }
});

// Payment rate limiter
exports.paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau'
    }
});

