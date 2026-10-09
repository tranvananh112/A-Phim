const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    addComment,
    getMovieComments,
    getHomeShowcaseComments,
    getAdminComments,
    updateCommentStatus,
    deleteComment
} = require('../controllers/commentController');

// Public routes
router.get('/home-showcase', getHomeShowcaseComments);
router.get('/movie/:movieSlug', getMovieComments);

// Protected user routes
router.post('/', protect, addComment);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAdminComments);
router.put('/:id/status', protect, authorize('admin'), updateCommentStatus);
router.delete('/:id', protect, authorize('admin'), deleteComment);

module.exports = router;
