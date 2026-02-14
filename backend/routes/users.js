const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Admin only - get all users
router.get('/', protect, authorize('admin'), async (req, res) => {
    res.json({ success: true, data: [] });
});

module.exports = router;
