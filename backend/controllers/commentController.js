const Comment = require('../models/Comment');
const Movie = require('../models/Movie');
const socketUtil = require('../utils/socket');
const User = require('../models/User');

// @desc    Add a comment to a movie
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const { movieId, movieSlug, movieName, content, avatar, parentId } = req.body;

        if (!movieId || !movieSlug || !content) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đủ thông tin phim và nội dung bình luận'
            });
        }

        // Apply dynamic avatar change directly to User's profile if selected in comment box
        if (avatar) {
            await User.findByIdAndUpdate(req.user.id, { avatar: avatar });
        }

        // Handle case where frontend passes slug instead of ObjectId for movieId
        let validMovieId = null;
        let movie = null;
        const mongoose = require('mongoose');
        if (movieId && mongoose.Types.ObjectId.isValid(movieId) && movieId !== movieSlug) {
             validMovieId = movieId;
             // Optional: still find movie for name
             movie = await Movie.findById(movieId);
        } else {
             movie = await Movie.findOne({ slug: movieSlug });
             if (movie) {
                 validMovieId = movie._id;
             }
        }

        const comment = await Comment.create({
            user: req.user.id,
            movie: validMovieId,
            movieSlug: movieSlug,
            movieName: movieName || '',
            content: content,
            parent: parentId || null,
            isApproved: true // Auto approve comments for now
        });

        // Emit realtime activity
        socketUtil.emitEvent('new_activity', {
            type: 'comment',
            icon: 'message-square',
            color: 'amber',
            message: `Bình luận mới trên <strong>${movie ? movie.name : movieName}</strong>: "${content}"`,
            time: new Date(),
            user: { name: req.user.name }
        });

        // Populate user details so frontend can display immediately
        await comment.populate('user', 'name email avatar avatarUrl equippedFrameClass equippedFrameUrl');

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Get comments for a specific movie (Public API)
// @route   GET /api/comments/movie/:movieSlug
// @access  Public
exports.getMovieComments = async (req, res) => {
    try {
        const { movieSlug } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;

        const query = { movieSlug: movieSlug, isApproved: true };

        const total = await Comment.countDocuments(query);
        const comments = await Comment.find(query)
            .populate('user', 'name email avatar avatarUrl equippedFrameClass equippedFrameUrl')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.json({
            success: true,
            count: comments.length,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: comments
        });
    } catch (error) {
        console.error('Error getting movie comments:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Get all comments (Admin API)
// @route   GET /api/comments/admin
// @access  Private/Admin
exports.getAdminComments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;
        const status = req.query.status; // 'approved', 'pending', 'hidden'
        const search = req.query.search;

        let query = {};

        if (status === 'approved') query.isApproved = true;
        if (status === 'hidden') query.isApproved = false;
        // if pending is required we could use another field like isReviewed but let's stick to true/false

        if (search) {
            query.content = { $regex: search, $options: 'i' };
        }

        const totalComments = await Comment.countDocuments();
        const approvedComments = await Comment.countDocuments({ isApproved: true });
        const hiddenComments = await Comment.countDocuments({ isApproved: false });

        const totalFiltered = await Comment.countDocuments(query);
        
        const comments = await Comment.find(query)
            .populate('user', 'name email')
            .populate('movie', 'title name') 
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.json({
            success: true,
            stats: {
                total: totalComments,
                approved: approvedComments,
                pending: 0, // Mock pending since we auto approve
                hidden: hiddenComments
            },
            total: totalFiltered,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalFiltered / limit)
            },
            data: comments
        });
    } catch (error) {
        console.error('Error getting admin comments:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Update comment status
// @route   PUT /api/comments/:id/status
// @access  Private/Admin
exports.updateCommentStatus = async (req, res) => {
    try {
        const { isApproved } = req.body;
        
        const comment = await Comment.findByIdAndUpdate(
            req.params.id, 
            { isApproved }, 
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }

        res.json({ success: true, data: comment });
    } catch (error) {
        console.error('Error updating comment status:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });
        }

        await comment.remove();

        res.json({ success: true, message: 'Đã xóa bình luận' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Get showcase comments for homepage
// @route   GET /api/comments/home-showcase
// @access  Public
exports.getHomeShowcaseComments = async (req, res) => {
    try {
        const comments = await Comment.find({ isApproved: true })
            .populate('user', 'name email avatar avatarUrl equippedFrameClass equippedFrameUrl badge isVip role')
            .sort({ createdAt: -1 })
            .limit(20);

        const data = comments.map(c => {
            const u = c.user || {};
            return {
                id: c._id,
                userName: u.name || 'Thành viên',
                userAvatar: u.avatarUrl || u.avatar || ('https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(u.name || 'User')),
                equippedFrameUrl: u.equippedFrameUrl || '',
                badge: u.badge || (u.role === 'admin' ? 'ADMIN TOP 1' : (u.isVip ? 'VIP PRO' : '')),
                isAdmin: u.role === 'admin',
                isVip: !!u.isVip,
                content: c.content,
                movieSlug: c.movieSlug,
                movieName: c.movieName || c.movieSlug,
                timeAgo: 'Vừa xong'
            };
        });

        if (!data.length) {
            return res.json({
                success: true,
                data: [
                    {
                        userName: 'Admin APhim',
                        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminAPhim',
                        badge: 'ADMIN TOP 1',
                        isAdmin: true,
                        isVip: true,
                        content: 'Chào mừng các bạn đến với APhim Cinema! Chúc các bạn xem phim vui vẻ.',
                        movieSlug: 'trung-so-doc-dac-van-phai-di-lam',
                        movieName: 'Trúng Số Độc Đắc Vẫn Phải Đi Làm',
                        timeAgo: 'Vừa xong'
                    },
                    {
                        userName: 'Minh Hoàng',
                        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MinhHoang',
                        badge: 'VIP PRO',
                        isVip: true,
                        content: 'Phim âm thanh đỉnh cao luôn, xem mượt mà không bị giật lag chút nào!',
                        movieSlug: 'van-tu-hanh',
                        movieName: 'Vân Tú Hành',
                        timeAgo: '15 phút trước'
                    },
                    {
                        userName: 'Thu Trang',
                        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThuTrang',
                        badge: 'CÀY PHIM',
                        content: 'Kid và Hattori ngầu dã man, đồ họa sắc nét quá chừng.',
                        movieSlug: 'conan-ngoi-sao-5-canh-1-trieu-do',
                        movieName: 'Thám Tử Lừng Danh Conan',
                        timeAgo: '1 giờ trước'
                    },
                    {
                        userName: 'Gia Bảo',
                        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GiaBao',
                        badge: 'FAN CỨNG',
                        content: 'Đoạn combat cuối phim nhạc dính ghê, xem cuốn từ đầu tới cuối.',
                        movieSlug: 'deadpool-va-wolverine',
                        movieName: 'Deadpool & Wolverine',
                        timeAgo: '2 giờ trước'
                    }
                ]
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching home showcase comments:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
