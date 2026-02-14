const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder for comments routes
router.get('/:movieId', (req, res) => {
    res.json({ success: true, data: [] });
});

router.post('/:movieId', protect, (req, res) => {
    res.json({ success: true, message: 'Comment added' });
});

module.exports = router;
