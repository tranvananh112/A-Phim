const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

// Constants
const POSTED_REELS_FILE = 'posted-reels.json';
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper: Strip HTML
const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

(async () => {
    if (!FB_PAGE_TOKEN && !COMPOSIO_API_KEY) {
        console.error('❌ Missing FB_PAGE_TOKEN and COMPOSIO_API_KEY. Exiting...');
        process.exit(1);
    }
    if (!GROQ_API_KEY) {
        console.error('❌ Missing GROQ_API_KEY. Exiting...');
        process.exit(1);
    }

    // 1. Load previously posted reels
    let postedReels = [];
    if (fs.existsSync(POSTED_REELS_FILE)) {
        try {
            postedReels = JSON.parse(fs.readFileSync(POSTED_REELS_FILE, 'utf8'));
        } catch (e) {
            console.error('⚠️ Error reading posted-reels.json:', e.message);
        }
    }

    // 2. Lấy danh sách phim mới (Quét sâu từ Trang 1 đến 5)
    let newSlugs = [];
    try {
        console.log('🔍 Bước 1: Quét danh sách phim mới từ trang 1 đến 5...');
        for (let page = 1; page <= 5; page++) {
            const r = await axios.get(`https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`, { timeout: 15000 });
            if (r.data && r.data.data && r.data.data.items) {
                for (const item of r.data.data.items) {
                    if (!newSlugs.includes(item.slug)) {
                        newSlugs.push(item.slug);
                    }
                }
            }
        }
        console.log(`✅ Đã thu thập được ${newSlugs.length} phim cập nhật gần đây.`);
    } catch (e) {
        console.error('❌ Lỗi khi lấy danh sách phim:', e.message);
        process.exit(1);
    }

    // Lọc phim CHƯA ĐĂNG
    let unpostedSlugs = newSlugs.filter(slug => !postedReels.includes(slug));
    console.log(`✅ Tìm thấy ${unpostedSlugs.length} phim CHƯA ĐĂNG trên Reels.`);

    if (unpostedSlugs.length === 0) {
        console.log('🤷 Tất cả 5 trang đều đã được đăng sạch sẽ. Không có phim mới để đăng!');
        process.exit(0);
    }

    // 3. Phân tích IMDb & Views để xếp hạng (Lấy 25 phim đầu tiên để tối ưu tốc độ xử lý của Bot)
    unpostedSlugs = unpostedSlugs.slice(0, 25);
    let movieCandidates = [];
    
    console.log(`\n🔍 Bước 2: Phân tích chỉ số IMDb và Lượt Xem (Views) cho ${unpostedSlugs.length} phim để tìm TRENDING...`);
    for (const slug of unpostedSlugs) {
        try {
            const detailRes = await axios.get(`https://ophim1.com/phim/${slug}`, { timeout: 10000 });
            const m = detailRes.data.movie;
            const eps = detailRes.data.episodes;
            
            let hasTrailer = m.trailer_url && (m.trailer_url.includes('youtube.com') || m.trailer_url.includes('youtu.be'));
            let hasM3u8 = eps && eps.length > 0 && eps[0].server_data && eps[0].server_data.length > 0 && eps[0].server_data[0].link_m3u8;

            if (hasTrailer || hasM3u8) {
                let view = m.view || 0;
                let imdb = (m.imdb && m.imdb.vote_average) ? parseFloat(m.imdb.vote_average) : 5.0; // Mặc định 5.0 nếu không có điểm
                let score = view * imdb;
                
                movieCandidates.push({
                    slug: slug,
                    name: m.name || m.origin_name,
                    year: m.year,
                    content: stripHtml(m.content),
                    categories: m.category ? m.category.map(c => c.name).join(', ') : '',
                    trailerUrl: hasTrailer ? m.trailer_url : null,
                    m3u8Link: hasM3u8 ? eps[0].server_data[0].link_m3u8 : null,
                    view: view,
                    imdb: imdb,
                    score: score
                });
            } else {
                // Đánh dấu bỏ qua vĩnh viễn nếu phim này không có cả Trailer Youtube lẫn m3u8
                postedReels.push(slug);
            }
        } catch (e) {
            console.error(`⚠️ Lỗi khi lấy chi tiết phim ${slug}`);
        }
    }

    // Sắp xếp Ranking (Từ Điểm cao xuống thấp)
    movieCandidates.sort((a, b) => b.score - a.score);

    console.log(`\n🏆 BẢNG XẾP HẠNG TOP PHIM ĐÁNG ĐĂNG NHẤT HÔM NAY:`);
    movieCandidates.forEach((m, idx) => {
        console.log(`   #${idx+1}: ${m.name} | View: ${m.view} | IMDb: ${m.imdb} | Điểm: ${m.score.toFixed(2)}`);
    });

    if (movieCandidates.length === 0) {
        console.log('🤷 Rất tiếc, các phim mới này đều không có Video (Trailer/m3u8) để đăng.');
        fs.writeFileSync(POSTED_REELS_FILE, JSON.stringify(postedReels, null, 2), 'utf8');
        process.exit(0);
    }

    // 4. Verify Facebook Token
    let pageId = 'me';
    let fallbackToken = FB_PAGE_TOKEN;
    let graphApiValid = false;

    if (FB_PAGE_TOKEN) {
        try {
            console.log('\n✅ Đang xác thực Facebook Token...');
            const verifyRes = await axios.get('https://graph.facebook.com/v19.0/me?access_token=' + FB_PAGE_TOKEN);
            console.log(`✅ Sẵn sàng đăng lên Fanpage: ${verifyRes.data.name} (${verifyRes.data.id})`);
            pageId = verifyRes.data.id;
            graphApiValid = true;
        } catch (error) {
            console.error('❌ Lỗi xác thực Facebook Token (Có thể thiếu quyền publish_video):', error.response?.data || error.message);
        }
    }

    if (!graphApiValid && COMPOSIO_API_KEY) {
        // Fallback to composio ...
        try {
            const accountsReq = await axios.get('https://backend.composio.dev/api/v3/connected_accounts', { headers: { 'x-api-key': COMPOSIO_API_KEY } });
            const accountsList = accountsReq.data?.items || accountsReq.data?.data || accountsReq.data?.connectedAccounts || [];
            const fbAcc = accountsList.find(a => {
                const name = (a.toolkit_name || a.appName || a.providerId || '').toLowerCase();
                return name.includes('facebook') && a.status.toLowerCase() === 'active';
            });
            if (fbAcc) {
                const proxyRes = await axios.post('https://backend.composio.dev/api/v2/actions/proxy', {
                    connectedAccountId: fbAcc.id,
                    method: 'GET',
                    endpoint: 'https://graph.facebook.com/v19.0/me/accounts'
                }, { headers: { 'x-api-key': COMPOSIO_API_KEY } });
                const pages = proxyRes.data.data.data;
                if (pages && pages.length > 0) {
                    fallbackToken = pages[0].access_token;
                    pageId = pages[0].id;
                    graphApiValid = true;
                    console.log(`✅ Sẵn sàng đăng qua Composio proxy: ${pages[0].name}`);
                }
            }
        } catch (e) {
            console.log("Composio fallback failed.");
        }
    }

    if (!graphApiValid) {
        console.error('❌ KHÔNG THỂ ĐĂNG ĐƯỢC: Vui lòng kiểm tra lại FB_PAGE_TOKEN.');
        process.exit(1);
    }

    let postedCount = 0;

    // 5. CƠ CHẾ CỐ ĐẤM ĂN XÔI: Bắt đầu đăng từ Top 1 xuống, nếu lỗi thì đăng phim tiếp theo.
    for (const movie of movieCandidates) {
        const slug = movie.slug;
        const name = movie.name;
        const year = movie.year ? ` (${movie.year})` : '';
        const webUrl = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
        const desc = movie.content.substring(0, 300) + '...';
        
        console.log(`\n=============================================`);
        console.log(`🎬 BẮT ĐẦU ĐĂNG PHIM: ${name} (Top Trending)`);
        console.log(`=============================================`);

        // 5.1 Generate Caption with Groq
        const prompt = `You are an expert Social Media Manager for a movie streaming website named 'A Phim'.
Task: Write a short, viral, and highly engaging caption (under 150 words) for a Facebook Reel showing the trailer of the movie "${name}${year}".
Details:
- Genres: ${movie.categories}
- Synopsis: ${desc}

Requirements:
- Make it sound natural, slightly dramatic or funny depending on the genre. DO NOT sound like an AI.
- Start with a strong hook (e.g., "Trời ơi tin được không...", "Siêu phẩm đã đổ bộ...").
- Include emojis.
- End with a call to action directing them to watch the full movie here: ${webUrl}
- Include 3-4 relevant hashtags, always including #APhim.
- Write in Vietnamese.
- Output ONLY the caption text. No explanations.`;

        let caption = '';
        try {
            const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 300
            }, {
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
            });
            caption = groqRes.data.choices[0].message.content.trim();
            console.log(`✍️ Content AI đã viết xong:\n${caption}\n------------------`);
        } catch (err) {
            console.error('❌ Lỗi Groq API:', err.response?.data || err.message);
            continue; // Fail, try next movie
        }

        // 5.2 Download Video (YouTube or Fallback to m3u8)
        const videoFile = 'trailer.mp4';
        let downloadSuccess = false;
        if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);

        console.log(`⏳ Bước 1: Thử tải Trailer từ YouTube...`);
        if (movie.trailerUrl) {
            try {
                execSync(`yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]" -o "${videoFile}" "${movie.trailerUrl}"`, { stdio: 'ignore' });
                if (fs.existsSync(videoFile)) downloadSuccess = true;
            } catch (err) {
                console.error('⚠️ Tải YouTube thất bại (Do bị quét Bot).');
            }
        }

        if (!downloadSuccess && movie.m3u8Link) {
            console.log(`⏳ Bước 2: Bật dự phòng, trích xuất 60s từ luồng m3u8 gốc bằng ffmpeg...`);
            try {
                // Trích xuất 60 giây phim, bắt đầu từ phút thứ 10
                execSync(`ffmpeg -ss 00:10:00 -i "${movie.m3u8Link}" -t 60 -c copy -bsf:a aac_adtstoasc "${videoFile}"`, { stdio: 'ignore' });
                if (fs.existsSync(videoFile)) downloadSuccess = true;
            } catch (e) {
                console.error('⚠️ Cắt m3u8 phút 10 lỗi, thử cắt ở phút thứ 1...');
                try {
                    execSync(`ffmpeg -ss 00:01:00 -i "${movie.m3u8Link}" -t 60 -c copy -bsf:a aac_adtstoasc "${videoFile}"`, { stdio: 'ignore' });
                    if (fs.existsSync(videoFile)) downloadSuccess = true;
                } catch (e2) {
                    console.error('❌ Trích xuất m3u8 thất bại hoàn toàn.');
                }
            }
        }

        if (!downloadSuccess) {
            console.error(`❌ Không tải được Video cho phim này. Bỏ qua và đánh dấu lỗi để thử phim hạng tiếp theo!`);
            postedReels.push(slug); // Mark as skipped
            continue; // MOVE TO THE NEXT MOVIE IN RANKING!
        }

        // 5.3 Upload to Facebook Reels
        console.log(`🚀 Bước cuối: Bắn Video lên Facebook Reels...`);
        try {
            const initRes = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/video_reels?upload_phase=start&access_token=${fallbackToken}`);
            const videoId = initRes.data.video_id;
            const uploadUrl = initRes.data.upload_url;

            const fileData = fs.readFileSync(videoFile);
            await axios.post(uploadUrl, fileData, {
                headers: {
                    'Authorization': `OAuth ${fallbackToken}`,
                    'offset': '0',
                    'file_size': fileData.length.toString(),
                    'Content-Type': 'application/octet-stream'
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });

            await axios.post(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
                upload_phase: 'finish',
                video_id: videoId,
                video_state: 'PUBLISHED', // MUST HAVE publish_video PERMISSION
                description: caption,
                access_token: fallbackToken
            });

            console.log(`🎉 XUẤT BẢN THÀNH CÔNG THƯỚC PHIM: ${name} !`);

            // 5.4 AI Seeding Comment
            console.log(`⏳ Đang nhờ AI nghĩ Comment mồi...`);
            const commentPrompt = `Đóng vai một chuyên gia Social Media người Việt Nam, hãy viết một câu bình luận (comment) thật tự nhiên, thả thính cuốn hút (dưới 40 chữ) để ghim dưới video Facebook Reel của bộ phim "${name}". 
Yêu cầu:
- Ngôn ngữ: Tiếng Việt, văn phong trẻ trung, giống một bạn admin đang trò chuyện với fan.
- BẮT BUỘC phải chứa đường link xem phim này ở cuối câu: ${webUrl}
- Không dùng ngoặc kép, không giải thích. Chỉ in ra nội dung bình luận.`;

            let commentText = `Xem bản Full HD cực mượt tại đây nha cả nhà ơi: ${webUrl}`; // Fallback
            try {
                const groqCommentRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'user', content: commentPrompt }],
                    temperature: 0.9,
                    max_tokens: 150
                }, {
                    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
                });
                let aiText = groqCommentRes.data.choices[0].message.content.trim();
                // Ensure it doesn't have quotes and actually contains the link
                if (aiText.length > 5) commentText = aiText;
                if (!commentText.includes(webUrl)) commentText += `\nLink phim: ${webUrl}`;
                console.log(`💬 AI Comment: ${commentText}`);
            } catch (err) {
                console.log('⚠️ AI Groq bị lỗi khi nghĩ Comment, dùng câu mặc định.');
            }

            try {
                // Đợi 5 giây để Facebook xử lý xong Video rồi mới cmt
                await new Promise(r => setTimeout(r, 5000));
                await axios.post(`https://graph.facebook.com/v19.0/${videoId}/comments`, {
                    message: commentText,
                    access_token: fallbackToken
                });
                console.log(`✅ Đã rải Comment Seeding kéo traffic thành công!`);
            } catch (e) {
                console.error(`⚠️ Rải comment lỗi (có thể do video chưa process xong):`, e.response?.data || e.message);
            }

            postedReels.push(slug);
            postedCount++;
            
            if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);

            // THÀNH CÔNG RỒI THÌ DỪNG LẠI, KHÔNG ĐĂNG NỮA! (Chỉ đăng 1 reel/ngày)
            break;

        } catch (e) {
            console.error(`❌ Lỗi Facebook Graph API khi upload ${slug}:`, e.response?.data || e.message);
            // Vẫn tiếp tục vòng lặp để đăng thử bộ phim tiếp theo trong bảng xếp hạng!
        }
    }

    // 6. Lưu trạng thái
    if (postedReels.length > 5000) {
        postedReels = postedReels.slice(postedReels.length - 5000);
    }
    fs.writeFileSync(POSTED_REELS_FILE, JSON.stringify(postedReels, null, 2), 'utf8');
    
    if (postedCount > 0) {
        console.log(`\n✅ HOÀN TẤT CHIẾN DỊCH: Đã đăng xuất sắc ${postedCount} Thước phim!`);
    } else {
        console.log('\n❌ Rất tiếc, cả bảng xếp hạng đều đăng lỗi hoặc bị từ chối.');
    }
})();
