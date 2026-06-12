const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');

// Constants
const POSTED_REELS_FILE = 'posted-reels.json';
const API_URL = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1';
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Delay function
const delay = ms => new Promise(res => setTimeout(res, ms));

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

    // 2. Fetch new movies from API
    let newMovies = [];
    try {
        console.log('Fetching new movies...');
        const r = await axios.get(API_URL, { timeout: 15000 });
        if (r.data && r.data.data && r.data.data.items) {
            newMovies = r.data.data.items;
        }
    } catch (e) {
        console.error('❌ Error fetching movies:', e.message);
        process.exit(1);
    }

    // Reverse to check oldest first
    newMovies.reverse();

    // 3. Verify Facebook Token
    let pageId = 'me';
    let fallbackToken = FB_PAGE_TOKEN;
    let graphApiValid = false;

    if (FB_PAGE_TOKEN) {
        try {
            console.log('✅ Verifying Facebook Page Token...');
            const verifyRes = await axios.get('https://graph.facebook.com/v19.0/me?access_token=' + FB_PAGE_TOKEN);
            console.log(`✅ Ready to post to Fanpage: ${verifyRes.data.name} (${verifyRes.data.id})`);
            pageId = verifyRes.data.id;
            graphApiValid = true;
        } catch (error) {
            console.error('❌ Failed to verify Facebook Token:', error.response?.data || error.message);
        }
    }

    if (!graphApiValid && COMPOSIO_API_KEY) {
        try {
            console.log(`Fetching Composio Facebook accounts...`);
            const accountsReq = await axios.get('https://backend.composio.dev/api/v3/connected_accounts', {
                headers: { 'x-api-key': COMPOSIO_API_KEY }
            });
            const accountsList = accountsReq.data?.items || accountsReq.data?.data || accountsReq.data?.connectedAccounts || [];
            const fbAcc = accountsList.find(a => {
                const name = (a.toolkit_name || a.appName || a.providerId || '').toLowerCase();
                return name.includes('facebook') && a.status.toLowerCase() === 'active';
            });
            
            if (!fbAcc) throw new Error('No active Facebook connection in Composio');

            const proxyRes = await axios.post('https://backend.composio.dev/api/v2/actions/proxy', {
                connectedAccountId: fbAcc.id,
                method: 'GET',
                endpoint: 'https://graph.facebook.com/v19.0/me/accounts'
            }, { headers: { 'x-api-key': COMPOSIO_API_KEY } });

            const pages = proxyRes.data.data.data;
            if (!pages || pages.length === 0) throw new Error('No Pages found');
            
            fallbackToken = pages[0].access_token;
            pageId = pages[0].id;
            graphApiValid = true;
            console.log(`✅ Ready to post to Fanpage via Composio proxy: ${pages[0].name} (${pageId})`);
        } catch (e) {
            console.error('❌ Failed to get Facebook token via Composio:', e.message);
            process.exit(1);
        }
    }

    if (!graphApiValid) {
        console.error('❌ No valid posting method found. Exiting...');
        process.exit(1);
    }

    let postedCount = 0;

    // Helper functions
    const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
    
    // 4. Find a movie with a trailer
    for (const movie of newMovies) {
        const slug = movie.slug;
        if (postedReels.includes(slug)) continue;

        try {
            console.log(`\n🔍 Checking detail for: ${slug}...`);
            const detailRes = await axios.get(`https://ophim1.com/phim/${slug}`, { timeout: 10000 });
            const mDetail = detailRes.data.movie;
            
            const trailerUrl = mDetail.trailer_url;
            if (!trailerUrl || !trailerUrl.includes('youtube.com') && !trailerUrl.includes('youtu.be')) {
                console.log(`⏭️ Skipped (No YouTube trailer): ${slug}`);
                postedReels.push(slug); // Mark as skipped so we don't check again
                continue;
            }

            const name = mDetail.name || mDetail.origin_name;
            const year = mDetail.year ? ` (${mDetail.year})` : '';
            const webUrl = `https://aphim.io.vn/movie-detail.html?slug=${slug}`;
            const desc = stripHtml(mDetail.content).substring(0, 300) + '...';
            const categories = mDetail.category ? mDetail.category.map(c => c.name).join(', ') : '';

            console.log(`✅ Found suitable movie: ${name}. Generating content with Groq...`);

            // 5. Generate Caption with Groq
            const prompt = `You are an expert Social Media Manager for a movie streaming website named 'A Phim'.
Task: Write a short, viral, and highly engaging caption (under 150 words) for a Facebook Reel showing the trailer of the movie "${name}${year}".
Details:
- Genres: ${categories}
- Synopsis: ${desc}

Requirements:
- Make it sound natural, slightly dramatic or funny depending on the genre. DO NOT sound like an AI.
- Start with a hook (e.g., "Trời ơi tin được không...", "Siêu phẩm đã đổ bộ...").
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
                    temperature: 0.7,
                    max_tokens: 300
                }, {
                    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
                });
                caption = groqRes.data.choices[0].message.content.trim();
                console.log(`✍️ Groq generated caption:\n------------------\n${caption}\n------------------`);
            } catch (err) {
                console.error('❌ Groq API Error:', err.response?.data || err.message);
                continue; // Skip to next movie if Groq fails
            }

            // 6. Download YouTube Video using yt-dlp
            console.log(`⏳ Downloading trailer from YouTube...`);
            const videoFile = 'trailer.mp4';
            if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);
            
            // Download worst/lowest quality to keep file size small for fast upload, but good enough for mobile
            // Or just format 18 (mp4 360p) which is universally supported
            execSync(`yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4][height<=720]" -o "${videoFile}" "${trailerUrl}"`);
            
            if (!fs.existsSync(videoFile)) {
                console.error('❌ Failed to download video file.');
                continue;
            }

            console.log(`✅ Video downloaded. File size: ${fs.statSync(videoFile).size} bytes`);

            // 7. Upload to Facebook Reels
            console.log(`🚀 Uploading to Facebook Reels...`);
            
            // Phase 1: Start
            console.log('   - Phase 1: Start');
            const initRes = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/video_reels?upload_phase=start&access_token=${fallbackToken}`);
            const videoId = initRes.data.video_id;
            const uploadUrl = initRes.data.upload_url;

            // Phase 2: Upload
            console.log('   - Phase 2: Uploading file data...');
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

            // Phase 3: Finish & Publish
            console.log('   - Phase 3: Publish');
            await axios.post(`https://graph.facebook.com/v19.0/${pageId}/video_reels`, {
                upload_phase: 'finish',
                video_id: videoId,
                video_state: 'PUBLISHED',
                description: caption,
                access_token: fallbackToken
            });

            console.log(`✅ Successfully published Reel for: ${name}`);

            // Cleanup
            if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);

            // Mark as posted and break (only do 1 reel per run to avoid spamming)
            postedReels.push(slug);
            postedCount++;
            break;

        } catch (e) {
            console.error(`❌ Failed to process/post ${slug}:`, e.response?.data || e.message);
            // Cleanup on error
            if (fs.existsSync('trailer.mp4')) fs.unlinkSync('trailer.mp4');
        }
    }

    // 8. Save updated state
    if (postedReels.length > 5000) {
        postedReels = postedReels.slice(postedReels.length - 5000);
    }
    fs.writeFileSync(POSTED_REELS_FILE, JSON.stringify(postedReels, null, 2), 'utf8');
    
    if (postedCount > 0) {
        console.log(`🎉 Finished! Posted ${postedCount} Reel.`);
    } else {
        console.log('🤷 No new movies with trailers found to post.');
    }
})();
