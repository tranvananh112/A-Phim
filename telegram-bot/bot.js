require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Hàm chuyển tên phim thành slug
function convertToSlug(text) {
    // Bảng chuyển đổi ký tự có dấu sang không dấu
    const vietnameseMap = {
        'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
        'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
        'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
        'Đ': 'D'
    };

    // Chuyển thành chữ thường
    let slug = text.toLowerCase();

    // Bỏ dấu tiếng Việt
    slug = slug.split('').map(char => vietnameseMap[char] || char).join('');

    // Xóa ký tự đặc biệt, chỉ giữ chữ cái, số và khoảng trắng
    slug = slug.replace(/[^a-z0-9\s-]/g, '');

    // Thay khoảng trắng bằng dấu gạch ngang
    slug = slug.replace(/\s+/g, '-');

    // Xóa dấu gạch ngang thừa
    slug = slug.replace(/-+/g, '-');

    // Xóa dấu gạch ngang ở đầu và cuối
    slug = slug.replace(/^-+|-+$/g, '');

    return slug;
}

// Hàm tìm kiếm phim từ API
async function searchMovies(keyword) {
    try {
        const searchUrl = `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        console.log(`🔍 Tìm kiếm: ${searchUrl}`);

        const response = await axios.get(searchUrl, {
            timeout: 5000,
            headers: { 'accept': 'application/json' }
        });

        if (response.data && response.data.data && response.data.data.items) {
            return response.data.data.items;
        }

        return [];
    } catch (error) {
        console.log(`⚠️ Lỗi search API: ${error.message}`);
        return [];
    }
}

// Hàm lấy thông tin phim từ API
async function getMovieInfo(slug) {
    try {
        // Gọi API ophim1.com để lấy thông tin phim
        const movieApiUrl = `https://ophim1.com/v1/api/phim/${slug}`;
        console.log(`🔍 Gọi API: ${movieApiUrl}`);

        const movieResponse = await axios.get(movieApiUrl, {
            timeout: 5000,
            headers: { 'accept': 'application/json' }
        });

        if (movieResponse.data && movieResponse.data.data && movieResponse.data.data.item) {
            const movie = movieResponse.data.data.item;
            // Ưu tiên thumb_url vì nhẹ hơn, phù hợp cho Telegram
            const posterFileName = movie.thumb_url || movie.poster_url;

            let posterUrl = null;
            if (posterFileName) {
                posterUrl = `https://img.ophim.live/uploads/movies/${posterFileName}`;
                console.log(`🖼️ Poster URL: ${posterUrl}`);
            }

            // Kiểm tra trang aphim.io.vn có tồn tại không
            const pageUrl = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
            const pageCheck = await axios.head(pageUrl, { timeout: 5000 });

            if (pageCheck.status === 200) {
                return {
                    exists: true,
                    posterUrl: posterUrl
                };
            }
        }

        // Nếu không tìm thấy phim, kiểm tra trang có tồn tại không
        const pageUrl = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
        const pageCheck = await axios.head(pageUrl, { timeout: 5000 });

        if (pageCheck.status === 200) {
            return {
                exists: true,
                posterUrl: null
            };
        }

        return { exists: false };
    } catch (error) {
        console.log(`⚠️ Lỗi API: ${error.message}`);
        // Nếu API lỗi, thử kiểm tra trang có tồn tại không
        try {
            const pageUrl = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
            const pageCheck = await axios.head(pageUrl, { timeout: 5000 });

            if (pageCheck.status === 200) {
                return {
                    exists: true,
                    posterUrl: null
                };
            }
        } catch (err) {
            return { exists: false };
        }

        return { exists: false };
    }
}

// Lắng nghe tin nhắn
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Bỏ qua tin nhắn lệnh bot
    if (!text || text.startsWith('/')) {
        return;
    }

    console.log(`📩 Nhận tin nhắn: "${text}"`);

    // Tìm kiếm phim trên API
    const searchResults = await searchMovies(text);

    // Nếu tìm thấy nhiều kết quả (>1), hiển thị danh sách cho user chọn
    if (searchResults.length > 1) {
        console.log(`📋 Tìm thấy ${searchResults.length} kết quả`);

        // Giới hạn 5 kết quả đầu tiên
        const limitedResults = searchResults.slice(0, 5);

        // Tạo inline keyboard với các button
        const buttons = limitedResults.map(movie => {
            const movieName = movie.name || movie.origin_name;
            const year = movie.year ? ` (${movie.year})` : '';
            const movieUrl = `https://aphim.io.vn/movie-detail.html?slug=${movie.slug}`;

            return [{
                text: `${movieName}${year}`,
                url: movieUrl
            }];
        });

        const keyboard = {
            inline_keyboard: buttons
        };

        await bot.sendMessage(chatId, `🎬 Tìm thấy ${limitedResults.length} phim:\n\nChọn phim bạn muốn xem:`, {
            reply_markup: keyboard,
            reply_to_message_id: msg.message_id
        });

        console.log(`✅ Gửi danh sách ${limitedResults.length} phim`);
        return;
    }

    // Nếu chỉ có 1 kết quả hoặc không tìm thấy, dùng logic cũ
    const slug = searchResults.length === 1 ? searchResults[0].slug : convertToSlug(text);
    console.log(`🔄 Slug: ${slug}`);

    // Lấy thông tin phim
    const movieInfo = await getMovieInfo(slug);

    if (movieInfo.exists) {
        const movieUrl = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;

        // Tạo inline keyboard với button
        const keyboard = {
            inline_keyboard: [[
                {
                    text: '👉 Xem phim tại đây',
                    url: movieUrl
                }
            ]]
        };

        // Nếu có ảnh poster, gửi ảnh kèm button
        if (movieInfo.posterUrl) {
            try {
                await bot.sendPhoto(chatId, movieInfo.posterUrl, {
                    caption: `🎬 <b>${text}</b>`,
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                    reply_to_message_id: msg.message_id
                });
                console.log(`✅ Gửi ảnh và link: ${movieUrl}`);
            } catch (error) {
                // Nếu gửi ảnh lỗi, gửi text với button
                console.log(`⚠️ Không gửi được ảnh, gửi text thay thế`);
                await bot.sendMessage(chatId, `🎬 <b>${text}</b>`, {
                    parse_mode: 'HTML',
                    reply_markup: keyboard,
                    reply_to_message_id: msg.message_id
                });
            }
        } else {
            // Không có ảnh, chỉ gửi text với button
            await bot.sendMessage(chatId, `🎬 <b>${text}</b>`, {
                parse_mode: 'HTML',
                reply_markup: keyboard,
                reply_to_message_id: msg.message_id
            });
            console.log(`✅ Gửi link (không có ảnh): ${movieUrl}`);
        }
    } else {
        console.log(`❌ Link không tồn tại, bot im lặng`);
    }
});

// Lệnh /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 Xin chào! Gõ tên phim để tôi tìm link cho bạn.\n\nVí dụ: Quỷ Nhập Tràng 2');
});

// Chào mừng thành viên mới vào nhóm
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;

    newMembers.forEach((member) => {
        // Bỏ qua nếu là bot tự join
        if (member.is_bot) {
            return;
        }

        // Lấy tên người dùng
        const firstName = member.first_name || 'bạn';
        const username = member.username ? `@${member.username}` : firstName;

        // Tin nhắn chào mừng
        const welcomeMessage = `👋 Chào mừng ${firstName} đã tham gia nhóm A Phim!

🎬 Gõ tên phim vào nhóm, bot sẽ tự động gửi link cho bạn!
Ví dụ: Gõ Thỏ Ơi

🔗 Website: https://aphim.io.vn
Chúc bạn xem phim vui vẻ! 🍿`.trim();

        bot.sendMessage(chatId, welcomeMessage);
        console.log(`👋 Chào mừng thành viên mới: ${username}`);
    });
});

console.log('🤖 Bot đang chạy...');
