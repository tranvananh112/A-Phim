const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get Gamification Leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const { timeframe = 'weekly', userId } = req.query;

        // Fetch top users sorted by exp / points / level
        let topUsers = [];
        try {
            topUsers = await User.find({ role: { $ne: 'banned' } })
                .select('name displayName avatar avatarUrl exp xp level equippedFrameUrl badge isVip')
                .sort({ exp: -1, xp: -1, level: -1 })
                .limit(20)
                .lean();
        } catch (dbErr) {
            console.warn('[Gamification] DB fetch error:', dbErr.message);
        }

        const formattedAll = topUsers.map((u, idx) => {
            const rawXP = u.exp || u.xp || 100;
            const lvl = u.level || Math.max(1, Math.floor(Math.sqrt(rawXP / 100)));
            const myName = u.displayName || u.name || 'Thành viên';
            const myAvatar = u.avatarUrl || u.avatar || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(myName));

            return {
                id: String(u._id),
                isMe: userId && String(u._id) === String(userId),
                name: myName,
                avatar: myAvatar,
                frameUrl: u.equippedFrameUrl || '',
                xp: rawXP,
                hours: Math.max(0, Math.round(rawXP / 35)),
                rank: lvl >= 50 ? 'Chí Tôn' : (lvl >= 30 ? 'Tông Sư' : (lvl >= 15 ? 'Cao Thủ' : (lvl >= 5 ? 'Tập Sự' : 'Tân Thủ'))),
                tier: lvl >= 51 ? 'diamond' : (lvl >= 31 ? 'platinum' : (lvl >= 16 ? 'gold' : (lvl >= 6 ? 'silver' : 'bronze'))),
                level: lvl,
                badge: u.badge || (u.isVip ? 'VIP PRO' : ''),
                streak: 1,
                position: idx + 1
            };
        });

        // If no DB users found yet, provide fallback real user structure
        if (!formattedAll.length) {
            const fallbackMe = {
                id: userId || 'me',
                isMe: true,
                name: 'Thành viên',
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThanhVien',
                xp: 100,
                hours: 2,
                rank: 'Tân Thủ',
                tier: 'bronze',
                level: 1,
                streak: 1,
                position: 1
            };
            return res.json({
                success: true,
                data: {
                    timeframe,
                    top3: [fallbackMe],
                    rest: [],
                    myRank: 1,
                    myEntry: fallbackMe,
                    all: [fallbackMe]
                }
            });
        }

        const top3 = formattedAll.slice(0, 3);
        const rest = formattedAll.slice(3);
        let myEntry = formattedAll.find(x => x.isMe);
        let myRank = myEntry ? myEntry.position : 1;

        if (!myEntry) {
            myEntry = formattedAll[0];
        }

        res.json({
            success: true,
            data: {
                timeframe,
                top3,
                rest,
                myRank,
                myEntry,
                all: formattedAll
            }
        });
    } catch (err) {
        console.error('[Gamification] Leaderboard error:', err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
});

module.exports = router;
