// ================================================================
// A PHIM — Auto Post Trending Collection (Style 2)
// - Ghép ảnh 4 phim thành 1 collage dọc chuẩn Facebook
// - Spintax caption không trùng lặp
// - Anti-duplicate 14 ngày
// - Tự comment link dưới bài sau khi đăng
// - Hỗ trợ FB_PAGE_TOKEN trực tiếp + Composio fallback
// ================================================================

const axios   = require('axios');
const Jimp    = require('jimp');
const fs      = require('fs');
const path    = require('path');
const FormData = require('form-data');

// ── Config ──────────────────────────────────────────────────────
const FB_PAGE_TOKEN   = process.env.FB_PAGE_TOKEN;
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const SITE_URL        = 'https://aphim.io.vn';
const HISTORY_FILE    = 'posted-collections.json';
const TEMP_IMAGE      = '/tmp/aphim-collage.jpg';

// ── Helpers ──────────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));
const stripHtml = html => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

/** Bỏ dấu Tiếng Việt → Jimp font ASCII không bị lỗi ? */
function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D')
              .replace(/[^\x00-\x7F]/g, ''); // fallback: strip bất kỳ ký tự non-ASCII
}

// ── Spintax Engine ───────────────────────────────────────────────
// Mỗi lần chạy bốc ngẫu nhiên 1 mẫu → bài không bao giờ trùng nhau

const OPENING_LINES = [
    "Đang tụt mood thì vô tình va phải 4 siêu phẩm này, cày bánh cuốn thực sự mọi người ạ! 🔥",
    "Lưu ngay BXH 4 bộ phim đang làm mưa làm gió tuần này. Chê thì chịu chứ tui là tui ghiền rồi đó. 😍",
    "Góc cứu rỗi những ngày chán nản: TOP 4 phim kịch bản cuốn không dứt ra được! Không xem hơi phí nhé! 🍿",
    "Ai đam mê cày phim thì bơi hết vào đây! Tuyển tập 4 bộ vừa lên sóng đang chiếm top trending toàn mạng. 🚀",
    "Khỏi mắc công lướt tìm kiếm, đây là 4 tựa phim đáng đồng tiền bát gạo nhất hôm nay. 💎",
    "Cứ cuối tuần là lại không biết xem gì đúng không? Đây, mang 4 bộ đỉnh nhất tuần này đến tặng nè! 🎬",
    "Cảnh báo: 4 bộ phim dưới đây có nguy cơ cao làm bạn thức đến 3-4 giờ sáng. Xem là không ngủ được đâu! ⚠️😂",
    "Ghim ngay list này lại nha, mấy bộ này đang hot rần rần mà bỏ qua thì uổng lắm mọi người ơi! 📌",
    "Hội cày phim ơi, tui vừa tổng hợp được 4 bộ cực xịn đang gây sốt khắp nơi. Tối nay kéo ngay thôi! 🌙",
    "Gợi ý phim cuối tuần chất lượng cao: 4 bộ này đang được xem nhiều nhất trên A Phim tuần này! 🏆",
];

const CLOSING_LINES = [
    "Link xem miễn phí Full HD Vietsub tui để sẵn dưới phần bình luận cho anh em rồi nhé 👇👇",
    "Phim đang chiếu hoàn toàn miễn phí tại A Phim. Check ngay dưới comment để lấy link nha cả nhà!",
    "Xem ngay kẻo lỡ! Link chuẩn HD không giật lag ở ngay bình luận đầu tiên. 🍿",
    "Tag ngay hội bạn thân vào cày chung cho nóng nào. Link xem phim ở dưới bình luận nhé! 😆",
    "Cả 4 bộ đều xem FREE không quảng cáo, không cần đăng ký. Link mình để ở comment đầu tiên luôn nha! 🔥",
    "Bộ nào hóng nhất thì rep vào đây, link xem full HD Vietsub tui drop dưới comment rồi! 👇",
];

const COMMENT_INTRO_LINES = [
    "🎬 Link xem Full HD Vietsub MIỄN PHÍ đây nha cả nhà:\n",
    "🍿 Đây nè ae, vào xem ngay kẻo lag:\n",
    "🔥 Link xem từng bộ FREE HD, không quảng cáo:\n",
    "👇 Tổng hợp link cho cả nhà tiện theo dõi:\n",
];

// ── Icon Pools (xoay vòng, mỗi bài đều khác nhau) ──────────────────
// Mỗi SET gồm 4 icon → gán cho 4 bộ phim trong 1 bài
const MOVIE_ICON_SETS = [
    ['🔥', '⚡', '🌟', '💫'],
    ['🎯', '🎭', '🎬', '🎦'],
    ['👑', '💎', '🚀', '✨'],
    ['🏆', '💥', '🌙', '⭐'],
    ['🎪', '🎠', '🎡', '🎢'],
    ['🍿', '🎥', '📽️', '🎞️'],
    ['🌈', '💖', '🌺', '🦋'],
    ['🤩', '😍', '🥹', '😮'],
    ['🦁', '🐉', '🦊', '🐺'],
    ['🌊', '🔮', '⚔️', '🛡️'],
    ['🎸', '🎷', '🥁', '🎻'],
    ['🏔️', '🌋', '🏝️', '🌃'],
];

// Icon dòng mô tả phim (xoay vòng ngẫu nhiên mỗi phim)
const DESC_ICONS = ['💬', '📝', '💡', '🔍', '📖', '✍️', '💭', '🗒️', '🎙️', '🖊️', '📌', '🔎'];

// ── Fetch & Select Movies ────────────────────────────────────────
async function fetchMovies() {
    console.log("📥 Fetching movies from API...");
    const r = await axios.get('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1', { timeout: 15000 });
    let items = (r.data?.data?.items || []).filter(m => m.poster_url && m.slug);

    // Load lịch sử đã đăng để tránh trùng
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
        try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) {}
    }

    // Tìm 4 phim chưa từng xuất hiện trong 14 ngày gần nhất
    const blacklist = new Set(history.slice(-56)); // 14 ngày × 4 phim/ngày = 56
    let fresh = items.filter(m => !blacklist.has(m.slug));

    // Nếu không đủ, lấy tiếp các phim cũ hơn
    if (fresh.length < 4) fresh = items;

    // Bốc ngẫu nhiên 4 trong 15 phim đầu để không bao giờ trùng thứ tự
    const pool = fresh.slice(0, 15);
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    console.log(`✅ Selected ${selected.length} movies.`);
    return selected;
}

// ── Fetch Movie Detail ────────────────────────────────────────────
async function fetchDetail(slug) {
    try {
        const r = await axios.get(`https://ophim1.com/phim/${slug}`, { timeout: 10000 });
        return r.data?.movie || null;
    } catch { return null; }
}

// ── Build Image URL ───────────────────────────────────────────────
function buildImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://img.ophim.live/uploads/movies/${url}`;
}

// ── Create Collage ────────────────────────────────────────────────
async function createCollage(movies) {
    console.log("🎨 Creating collage image...");

    const PANEL_W  = 800;
    const PANEL_H  = 310;   // 4 panels × 310 = 1240px → tỷ lệ 800:1240 ≈ hiển thị full trên Facebook
    const CANVAS_H = PANEL_H * 4;

    const canvas = new Jimp(PANEL_W, CANVAS_H, 0x111111FF);

    // Preload fonts
    const fontBig1   = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const fontBig2   = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    const fontBadge  = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    for (let i = 0; i < 4; i++) {
        const movie = movies[i];
        const yOff  = i * PANEL_H;

        console.log(`  [${i+1}/4] ${movie.name}`);

        try {
            // ── 1. Backdrop Background ──
            const bgUrl = buildImageUrl(movie.thumb_url || movie.poster_url);
            let bg = await Jimp.read(bgUrl);
            bg.cover(PANEL_W, PANEL_H);
            bg.blur(2);
            bg.color([{ apply: 'darken', params: [25] }]);
            canvas.composite(bg, 0, yOff);

            // ── 2. Dark gradient overlay vùng trái (nơi đặt số) ──
            const overlayW = 185;
            for (let px = 0; px < overlayW; px++) {
                const alpha = Math.round(210 * (1 - (px / overlayW) ** 0.55));
                for (let py = 0; py < PANEL_H; py++) {
                    canvas.setPixelColor(
                        Jimp.rgbaToInt(0, 0, 0, alpha),
                        px, yOff + py
                    );
                }
            }

            // ── 3. Separator line (vàng kim loại) ──
            if (i > 0) {
                const sep = new Jimp(PANEL_W, 3, 0x1A1A1AFF);
                canvas.composite(sep, 0, yOff);
                const accent = new Jimp(100, 2, 0xFCD34DFF);
                canvas.composite(accent, 0, yOff + 1);
            }

            // ── 4. Số thứ tự ULTRA BOLD — shadow 16 lớp ──
            const numStr = `${i + 1}`;
            const numX = 6;
            const numY = yOff + 55;   // Căn lại cho panel 310px
            const shadowOffsets = [
                [-5,0],[5,0],[0,-5],[0,5],
                [-4,-4],[4,-4],[-4,4],[4,4],
                [-6,0],[6,0],[0,-6],[0,6],
                [-5,-5],[5,-5],[-5,5],[5,5],
            ];
            for (const [dx, dy] of shadowOffsets) {
                canvas.print(fontBig2, numX + dx, numY + dy, numStr);
            }
            canvas.print(fontBig1, numX, numY, numStr);

            // ── 5. Poster TO HƠN — chiếm ~90% chiều cao panel ──
            // PANEL_H = 310 → poster cao 276px → từ yOff+12 đến yOff+300
            const POSTER_H   = 276;
            const POSTER_W   = 210;
            const POSTER_TOP = yOff + 14;

            const postUrl = buildImageUrl(movie.poster_url || movie.thumb_url);
            let poster = await Jimp.read(postUrl);
            poster.cover(POSTER_W, POSTER_H);

            // Viền trắng mỏng 2px
            const whiteBorder = new Jimp(POSTER_W + 4, POSTER_H + 4, 0xFFFFFFFF);
            whiteBorder.composite(poster, 2, 2);

            // Viền vàng ngoài 3px
            const goldBorder = new Jimp(POSTER_W + 10, POSTER_H + 10, 0xFCD34DFF);
            goldBorder.composite(whiteBorder, 3, 3);

            // Đặt poster: bắt đầu từ x=150 để không che số
            canvas.composite(goldBorder, 148, POSTER_TOP);

            // ── 6. Badge đè lên đáy poster, màu đa dạng ──
            const rawEp  = movie.episode_current || 'Full HD';
            const epText = removeAccents(rawEp);
            const bW     = Math.max(120, epText.length * 12 + 30);
            const BADGE_COLORS = [0xE50914FF, 0x1D4ED8FF, 0x15803DFF, 0xEA580CFF];
            const badge = new Jimp(bW, 38, BADGE_COLORS[i % 4]);
            badge.print(fontBadge, 14, 10, epText);
            // Đặt badge đè lên phần đáy poster (overlap 8px từ dưới lên)
            const bX = 148 + Math.floor((POSTER_W + 10 - bW) / 2);
            canvas.composite(badge, bX, POSTER_TOP + POSTER_H - 10);

        } catch (err) {
            console.warn(`  ⚠️ Panel ${i+1} image error: ${err.message}`);
            canvas.print(fontBig1, 8, yOff + 75, `${i+1}`);
        }

    }

    const outPath = process.env.GITHUB_ACTIONS ? '/tmp/aphim-collage.jpg' : 'temp-collage.jpg';
    await canvas.quality(88).writeAsync(outPath);
    console.log(`💾 Collage saved: ${outPath}`);
    return outPath;
}

// ── Generate Caption ─────────────────────────────────────────────
async function generateCaption(movies, details) {
    console.log("✍️ Generating caption...");

    const opening = rand(OPENING_LINES);
    const closing = rand(CLOSING_LINES);

    // Bốc ngẫu nhiên 1 bộ icon cho lần chạy này → mỗi bài đều khác nhau
    const iconSet = rand(MOVIE_ICON_SETS);

    let body = '';
    for (let i = 0; i < 4; i++) {
        const m   = movies[i];
        const det = details[i];
        const movieIcon = iconSet[i];        // icon khác nhau cho mỗi phim
        const descIcon  = rand(DESC_ICONS);  // icon mô tả ngẫu nhiên mỗi dòng

        let desc = det?.content ? stripHtml(det.content) : '';
        if (!desc) desc = 'Kịch bản hấp dẫn, không thể bỏ qua!';
        if (desc.length > 130) desc = desc.substring(0, 130) + '...';

        const ep = m.episode_current ? ` | ${m.episode_current}` : '';
        body += `\n${movieIcon} ${i+1}. ${m.name} (${m.year || ''})${ep}\n${descIcon} ${desc}\n`;
    }

    // Hashtag xoay vòng — thêm 2 hashtag ngẫu nhiên mỗi bài để đa dạng
    const extraHashtags = rand([
        '#PhimChieuRap #PhimBo',
        '#PhimHan #PhimTrung',
        '#PhimMy #PhimNhat',
        '#AnhEmCayPhim #TuiThich',
        '#PhimHot2025 #MustWatch',
        '#PhimLe #PhimRomance',
        '#PhimHanhDong #PhimKinhDi',
        '#PhimCayDem #TopPhim',
        '#GocPhim #CayPhimCung',
        '#PhimVietsub #FreeHD',
    ]);
    const hashtags = `#APhim #ReviewPhim #PhimHay #TrendingPhim #PhimMoi #XemPhimOnline #PhimHD ${extraHashtags}`;

    return `${opening}\n${body}\n${closing}\n\n${hashtags}`;
}

// ── Generate Auto-Comment with Links ─────────────────────────────
function generateComment(movies) {
    const intro = rand(COMMENT_INTRO_LINES);
    let links = '';
    movies.forEach((m, i) => {
        links += `${i+1}️⃣ ${m.name}\n🔗 ${SITE_URL}/movie-detail.html?slug=${m.slug}\n\n`;
    });
    return `${intro}${links}📌 Xem thêm hàng nghìn phim miễn phí tại: ${SITE_URL}`;
}

// ── Get Facebook Token ────────────────────────────────────────────
async function getFbCredentials() {
    // Ưu tiên FB_PAGE_TOKEN trực tiếp
    if (FB_PAGE_TOKEN) {
        try {
            const v = await axios.get(`https://graph.facebook.com/v19.0/me?access_token=${FB_PAGE_TOKEN}`);
            console.log(`✅ FB Token OK → Page: ${v.data.name} (${v.data.id})`);
            return { token: FB_PAGE_TOKEN, pageId: v.data.id };
        } catch (e) {
            console.warn('⚠️ FB_PAGE_TOKEN invalid, trying Composio...');
        }
    }

    // Fallback: Composio
    if (COMPOSIO_API_KEY) {
        const accountsRes = await axios.get('https://backend.composio.dev/api/v3/connected_accounts', {
            headers: { 'x-api-key': COMPOSIO_API_KEY }
        });
        const accountsList = accountsRes.data?.items || accountsRes.data?.data || [];
        const fbAcc = accountsList.find(a => {
            const name = (a.toolkit_name || a.appName || '').toLowerCase();
            return name.includes('facebook') && (a.status === 'ACTIVE' || a.status === 'active');
        });
        if (!fbAcc) throw new Error('No active Facebook Composio account found!');

        const proxyRes = await axios.post('https://backend.composio.dev/api/v2/actions/proxy', {
            connectedAccountId: fbAcc.id,
            method: 'GET',
            endpoint: 'https://graph.facebook.com/v19.0/me/accounts'
        }, { headers: { 'x-api-key': COMPOSIO_API_KEY } });

        const page = proxyRes.data?.data?.data?.[0];
        if (!page) throw new Error('No Facebook Page found via Composio!');
        console.log(`✅ Composio FB OK → Page: ${page.name} (${page.id})`);
        return { token: page.access_token, pageId: page.id };
    }

    throw new Error('No valid Facebook credentials! Set FB_PAGE_TOKEN or COMPOSIO_API_KEY.');
}

// ── Post to Facebook ─────────────────────────────────────────────
async function postToFacebook(imagePath, caption, movies) {
    const { token, pageId } = await getFbCredentials();

    console.log(`🚀 Posting to Facebook Page ${pageId}...`);

    const form = new FormData();
    form.append('source', fs.createReadStream(imagePath), {
        filename: 'aphim-collection.jpg',
        contentType: 'image/jpeg'
    });
    form.append('message', caption);
    form.append('access_token', token);

    const fbRes = await axios.post(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        form,
        { headers: { ...form.getHeaders() }, maxBodyLength: Infinity }
    );

    const postId = fbRes.data.post_id || fbRes.data.id;
    console.log(`✅ Posted! ID: ${postId}`);

    // Auto-comment with links
    if (postId) {
        console.log('💬 Adding link comment...');
        await delay(4000);
        const commentText = generateComment(movies);
        await axios.post(`https://graph.facebook.com/v19.0/${postId}/comments`, {
            message: commentText,
            access_token: token
        });
        console.log('✅ Comment added!');
    }

    return postId;
}

// ── Save History ──────────────────────────────────────────────────
function saveHistory(movies) {
    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
        try { history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch (e) {}
    }
    movies.forEach(m => history.push(m.slug));
    if (history.length > 200) history = history.slice(history.length - 200);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
    console.log(`📝 History saved (${history.length} total slugs).`);
}

// ── MAIN ──────────────────────────────────────────────────────────
(async () => {
    console.log('==========================================');
    console.log('🎬 A PHIM — TRENDING COLLECTION AUTO POST');
    console.log(`⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
    console.log('==========================================\n');

    const isDryRun = !FB_PAGE_TOKEN && !COMPOSIO_API_KEY;
    if (isDryRun) console.log('⚠️  DRY RUN MODE (No token) — Image will be generated but not posted.\n');

    try {
        // 1. Lấy phim
        const movies = await fetchMovies();
        if (movies.length < 4) {
            console.error('❌ Not enough movies. Abort.'); process.exit(1);
        }

        // 2. Lấy chi tiết nội dung song song
        console.log('📖 Fetching movie details...');
        const details = await Promise.all(movies.map(m => fetchDetail(m.slug)));

        // 3. Tạo ảnh ghép
        const imagePath = await createCollage(movies);

        // 4. Tạo caption
        const caption = await generateCaption(movies, details);
        console.log('\n────── CAPTION PREVIEW ──────');
        console.log(caption);
        console.log('─────────────────────────────\n');

        // 5. Đăng lên Facebook (hoặc dry-run)
        if (!isDryRun) {
            await postToFacebook(imagePath, caption, movies);
            saveHistory(movies);
        } else {
            console.log('ℹ️  Dry-run: skipping post. Open temp-collage.jpg to preview.');
        }

        console.log('\n🎉 Done!');
    } catch (err) {
        console.error('\n❌ FATAL:', err.message);
        process.exit(1);
    }
})();
