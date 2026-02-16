const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    getUser,
    updateUser,
    blockUser,
    deleteUser,
    updateSubscription,
    getUserStats
} = require('../controllers/userController');

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getUserStats);
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.put('/:id/block', blockUser);
router.put('/:id/subscription', updateSubscription);
router.delete('/:id', deleteUser);

module.exports = router;

