const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    logout,
    refreshToken
} = require('../controllers/authController'); // Using MongoDB version

const { protect } = require('../middleware/auth'); // Using real auth
const { authLimiter, registerLimiter } = require('../middleware/rateLimit');

// Public routes
router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);

module.exports = router;
