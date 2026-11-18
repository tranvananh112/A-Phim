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
                userAvatar: u.avatarUrl || u.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name || 'User') + '&background=random&color=fff'),
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
                    "userName": "Admin APhim",
                    "userAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
                    "badge": "ADMIN TOP 1",
                    "nameColor": "color_gold",
                    "isAdmin": true,
                    "isVip": true,
                    "level": 99,
                    "reactionsCount": 188,
                    "timeAgo": "Vừa xong",
                    "movieSlug": "thap-van-cuong-hoa-nhap-mong-lai",
                    "movieName": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
                    "content": "Đã lên sóng full Vietsub & Thuyết Minh tập mới nhất rồi nha mn! Tối nay chúc cả nhà cày phim vui vẻ 🍿✨"
          },
          {
                    "userName": "Thảo My 🌸",
                    "userAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0e839cd79500e7b68e2bbbed54790c28.png?size=240&passthrough=true",
                    "badge": "CÀY PHIM",
                    "nameColor": "color_pink",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 28,
                    "reactionsCount": 64,
                    "timeAgo": "12 phút trước",
                    "movieSlug": "cam-nguyet-nhu-ca",
                    "movieName": "Cẩm Nguyệt Như Ca",
                    "content": "Hà Yến với Tiêu Giác chemistry đỉnh xỉu luôn á chùi ui, đoạn gặp lại nhau ở Dịch Châu coi mà rung rinh tim 🥺💖"
          },
          {
                    "userName": "Quang Huy ⚡",
                    "userAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_001e956faa73bd0410c455234c62818f.png?size=240&passthrough=true",
                    "badge": "VIP PRO",
                    "nameColor": "color_cyan",
                    "isAdmin": false,
                    "isVip": true,
                    "level": 52,
                    "reactionsCount": 89,
                    "timeAgo": "28 phút trước",
                    "movieSlug": "thap-van-cuong-hoa-nhap-mong-lai",
                    "movieName": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
                    "content": "Vụ án bể máu trả hồn cuốn dã man, tạo hình ma đầu Kỳ Phượng Ân ngầu đét, nhạc nền nghe sởn gai ốc thật sự 🔥"
          },
          {
                    "userName": "Ngọc Huyền 🎀",
                    "userAvatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_1acbe609daec21fa5b866df9e5a42cb7.png?size=240&passthrough=true",
                    "badge": "FAN CỨNG",
                    "nameColor": "color_pink",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 34,
                    "reactionsCount": 47,
                    "timeAgo": "45 phút trước",
                    "movieSlug": "100-ngay-lua-doi",
                    "movieName": "100 Ngày Lừa Dối",
                    "content": "Plot twist mấy tập gần đây quay xe khét lẹt luôn mn ơi, không ngờ ông viện trưởng lại là trùm cuối 😱"
          },
          {
                    "userName": "Hoàng Nam 🩺",
                    "userAvatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_3c97a2d37f433a7913a1c7b7a735d000.png?size=240&passthrough=true",
                    "badge": "VIP PRO",
                    "nameColor": "color_green",
                    "isAdmin": false,
                    "isVip": true,
                    "level": 46,
                    "reactionsCount": 53,
                    "timeAgo": "1 giờ trước",
                    "movieSlug": "bac-si-x",
                    "movieName": "Bác Sĩ X",
                    "content": "Pha mổ tim ở cuối tập căng như dây đàn, bác sĩ Daimon ra tay dứt khoát đỉnh nóc kịch trần luôn 💯"
          },
          {
                    "userName": "Khánh Linh ✨",
                    "userAvatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_777b7aa8e77a569766e4a2e2bf656f4e.png?size=240&passthrough=true",
                    "badge": "CÀY PHIM",
                    "nameColor": "color_pink",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 22,
                    "reactionsCount": 38,
                    "timeAgo": "2 giờ trước",
                    "movieSlug": "tinh-yeu-doc-nhat",
                    "movieName": "Tình Yêu Độc Nhất",
                    "content": "Cặp đôi chính dễ thương xỉu, coi cảnh hậu trường với cảnh tỏ tình mà cười tủm tỉm quắn quéo cả người 🙈❤️"
          },
          {
                    "userName": "Tuấn Kiệt 🎬",
                    "userAvatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
                    "badge": "FAN CỨNG",
                    "nameColor": "color_cyan",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 39,
                    "reactionsCount": 71,
                    "timeAgo": "3 giờ trước",
                    "movieSlug": "deadpool-va-wolverine",
                    "movieName": "Deadpool & Wolverine",
                    "content": "Xem lại lần 3 vẫn cười sặc sụa với mấy quả cameo chất chơi người dơi, quả nhạc Madonna đánh combat thì đỉnh nóc luôn!"
          },
          {
                    "userName": "Bảo Trâm 🌸",
                    "userAvatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0e839cd79500e7b68e2bbbed54790c28.png?size=240&passthrough=true",
                    "badge": "VIP PRO",
                    "nameColor": "color_gold",
                    "isAdmin": false,
                    "isVip": true,
                    "level": 60,
                    "reactionsCount": 95,
                    "timeAgo": "4 giờ trước",
                    "movieSlug": "tham-tu-lung-danh-conan-ngoi-sao-5-canh-1-trieu-do",
                    "movieName": "Thám Tử Lừng Danh Conan",
                    "content": "Kid với Heiji phối hợp out trình phản diện, khúc cuối lộ thân phận họ hàng của Kid với Shinichi sốc ngang ngửa =)))"
          },
          {
                    "userName": "Minh Đức ☕",
                    "userAvatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_001e956faa73bd0410c455234c62818f.png?size=240&passthrough=true",
                    "badge": "THÀNH VIÊN",
                    "nameColor": "color_default",
                    "isAdmin": false,
                    "isVip": false,
                    "level": 15,
                    "reactionsCount": 19,
                    "timeAgo": "5 giờ trước",
                    "movieSlug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
                    "movieName": "Tình Yêu Trong Vỏ Bọc",
                    "content": "Phim hài công sở nhẹ nhàng xả stress cực tốt, nữ chính giả trai đáng yêu ghê á!"
          },
          {
                    "userName": "Admin APhim",
                    "userAvatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                    "equippedFrameUrl": "https://cdn.discordapp.com/avatar-decoration-presets/a_0c0eeb351ae2cf48c6e1eee2cae49d40.png?size=240&passthrough=true",
                    "badge": "ADMIN TOP 1",
                    "nameColor": "color_gold",
                    "isAdmin": true,
                    "isVip": true,
                    "level": 99,
                    "reactionsCount": 142,
                    "timeAgo": "7 giờ trước",
                    "movieSlug": "cam-nguyet-nhu-ca",
                    "movieName": "Cẩm Nguyệt Như Ca",
                    "content": "Ad vừa tối ưu xong máy chủ VIP tốc độ cao cho tập mới rồi nhé, mn vào xem mượt mà không lo nghẽn mạng nha 🚀"
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
