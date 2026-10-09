const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getPublicSettings,
    getPaymentPublic,
    getDesktopInterests,
    updateDesktopInterests,
    getDesktopHeroShowcase,
    updateDesktopHeroShowcase,
    getDesktopHeroAutoSlide,
    updateDesktopHeroAutoSlide,
    getMobile3DShowcase,
    updateMobile3DShowcase,
    getMovieBackdrops
} = require('../controllers/settingController');

const { protect, authorize } = require('../middleware/auth');

// Public route for frontend fetching configurations dynamically
router.get('/public', getPublicSettings);

// Public route for pricing page (prices + bank info, no sensitive keys)
router.get('/payment-public', getPaymentPublic);

// TMDB Posters, Backdrops & Logos Helper for Hero & Mobile 3D Admin
router.get('/movie-backdrops', getMovieBackdrops);

// Desktop Hero Showcase & Auto-Slide Endpoints
router.get('/desktop-hero-showcase', getDesktopHeroShowcase);
router.put('/desktop-hero-showcase', protect, authorize('admin'), updateDesktopHeroShowcase);

router.get('/desktop-hero-autoslide', getDesktopHeroAutoSlide);
router.put('/desktop-hero-autoslide', protect, authorize('admin'), updateDesktopHeroAutoSlide);

// Desktop 6 Interests Cards ("Bạn đang quan tâm gì?") Endpoints
router.get('/desktop-interests', getDesktopInterests);
router.put('/desktop-interests', protect, authorize('admin'), updateDesktopInterests);

// Mobile 3D Coverflow Showcase Endpoints
router.get('/mobile-3d-showcase', getMobile3DShowcase);
router.put('/mobile-3d-showcase', protect, authorize('admin'), updateMobile3DShowcase);

// Protected routes for Admin Dashboard
router.route('/')
    .get(protect, authorize('admin'), getSettings)
    .put(protect, authorize('admin'), updateSettings);

module.exports = router;
