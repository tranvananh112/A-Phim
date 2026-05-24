const axios = require('axios');
const fs = require('fs');
const { Composio } = require('composio-core');

// Constants
const POSTED_MOVIES_FILE = 'posted-movies.json';
const API_URL = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1';
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;

// Delay function for rate limit safety
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    if (!COMPOSIO_API_KEY) {
        console.error('Missing COMPOSIO_API_KEY. Exiting...');
        process.exit(1);
    }

    // 1. Load previously posted movies
    let postedMovies = [];
    if (fs.existsSync(POSTED_MOVIES_FILE)) {
        try {
            postedMovies = JSON.parse(fs.readFileSync(POSTED_MOVIES_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading posted-movies.json:', e.message);
        }
    }

    // 2. Fetch new movies from API
    let newMovies = [];
    try {
        console.log('Fetching new movies...');
        const r = await axios.get(API_URL, { timeout: 15000 });
        if (r.data && r.data.data && r.data.data.items) {
            newMovies = r.data.data.items;
        }
    } catch (e) {
        console.error('Error fetching movies:', e.message);
        process.exit(1);
    }

    // Reverse to post the oldest of the "new" ones first (chronological order)
    newMovies.reverse();

    // 3. Initialize Composio
    const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
    let fbConnection = null;

    try {
        // Retrieve the Facebook connection set up via Composio Dashboard
        fbConnection = await composio.getConnection('facebook');
    } catch (e) {
        console.error('Failed to connect to Facebook via Composio:', e.message);
        process.exit(1);
    }

    let postedCount = 0;

    // Helper to strip HTML tags
    const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
    const toHashtag = (str) => '#' + str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').replace(/[^a-zA-Z0-9#]/g, '');

    // 4. Process and post new movies
    for (const movie of newMovies) {
        const slug = movie.slug;
        if (postedMovies.includes(slug)) {
            continue; // Already posted, skip
        }

        try {
            console.log(`Fetching details for: ${slug}...`);
            // Fetch detailed movie info to get content and categories
            const detailRes = await axios.get(`https://ophim1.com/phim/${slug}`, { timeout: 10000 });
            const mDetail = detailRes.data.movie;
            
            const name = mDetail.name || mDetail.origin_name;
            const year = mDetail.year ? ` (${mDetail.year})` : '';
            const url = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
            
            // Generate clean description snippet (max 300 chars)
            let desc = stripHtml(mDetail.content);
            if (desc.length > 300) desc = desc.substring(0, 300) + '...';
            if (!desc) desc = 'Cùng khám phá những bí mật và tình tiết hấp dẫn trong siêu phẩm này!';

            // Generate hashtags
            let hashtags = ['#APhim', '#XemPhimOnline', '#PhimMoi', '#FullHD'];
            if (mDetail.category) {
                mDetail.category.forEach(c => hashtags.push(toHashtag(c.name)));
            }
            if (mDetail.country) {
                mDetail.country.forEach(c => hashtags.push(toHashtag(c.name)));
            }
            // Add movie name as hashtag
            hashtags.push(toHashtag(name));
            
            // Deduplicate hashtags and join
            hashtags = [...new Set(hashtags)].join(' ');

            // Construct the Facebook post message
            const message = `🎬 [PHIM MỚI CẬP NHẬT] - ${name}${year}\n\n👑 ${desc}\n\n👉 Xem ngay Full HD Vietsub tại: ${url}\n\n${hashtags}`;

            console.log(`Posting to Facebook: ${name}...`);
            // Execute the Facebook post action via Composio
            await fbConnection.executeAction('FACEBOOK_CREATE_POST', {
                message: message
            });
            
            console.log(`✅ Successfully posted: ${slug}`);
            postedMovies.push(slug);
            postedCount++;

            // Wait 5 seconds to avoid rate limiting
            await delay(5000);
        } catch (e) {
            console.error(`❌ Failed to process/post ${slug}:`, e.message);
        }
    }

    // 5. Save the updated list of posted movies
    if (postedCount > 0) {
        // Keep only the last 5000 records to prevent the file from growing indefinitely
        if (postedMovies.length > 5000) {
            postedMovies = postedMovies.slice(postedMovies.length - 5000);
        }
        
        fs.writeFileSync(POSTED_MOVIES_FILE, JSON.stringify(postedMovies, null, 2), 'utf8');
        console.log(`Finished! Posted ${postedCount} new movies.`);
    } else {
        console.log('No new movies to post.');
    }
})();
