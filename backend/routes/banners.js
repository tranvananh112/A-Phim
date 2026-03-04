const express = require('express');
const router = express.Router();
const {
    getAllBanners,
    getActiveBanner,
    loadMoviesFromAPI,
    addBanner,
    updateBanner,
    deleteBanner
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', getActiveBanner);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllBanners);
router.post('/load-movies', loadMoviesFromAPI);
router.post('/', addBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
