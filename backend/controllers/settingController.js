const Setting = require('../models/Setting');
const cache = require('../utils/cache');

// Helper to ensure a single settings document exists
const getOrCreateSettings = async () => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create({});
    }
    return settings;
};

// @desc    Get full admin settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
    try {
        const cachedSettings = cache.get('public_settings');
        if (cachedSettings) return res.json({ success: true, data: cachedSettings });

        const settings = await getOrCreateSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update admin settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
    try {
        const updateFields = {};
        const allowed = ['general', 'payment', 'content', 'security', 'notifications', 'desktop_interests', 'desktop_hero_showcase', 'desktop_hero_autoslide', 'mobile_3d_showcase'];
        for (const section of allowed) {
            if (req.body[section] !== undefined) {
                if (typeof req.body[section] === 'object' && !Array.isArray(req.body[section])) {
                    for (const [key, val] of Object.entries(req.body[section])) {
                        updateFields[`${section}.${key}`] = val;
                    }
                } else {
                    updateFields[section] = req.body[section];
                }
            }
        }

        const settings = await Setting.findOneAndUpdate(
            {},
            { $set: updateFields },
            { new: true, upsert: true, runValidators: true }
        );

        cache.del('public_settings');
        res.json({ success: true, data: settings, message: 'Lưu cấu hình thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get public settings for frontend rendering
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res) => {
    const defaults = {
        general: {
            siteName: 'A Phim',
            siteDesc: 'Nền tảng xem phim trực tuyến hàng đầu Việt Nam',
            siteDomain: 'APhim.vn',
            logoUrl: '../apple-touch-icon.png',
            faviconUrl: '../apple-touch-icon.png',
            maintenanceMode: false
        },
        content: {
            enablePhimX: false,
            enableWatermark: true,
            watermarkUrl: '',
            apiBase: 'https://phimapi.com/v1/api',
            apiSecondary: 'https://phimapi.com',
            enableMultipleSources: false,
            defaultServer: 'Server #1 (OPhim)',
            autoplayDelay: '5 giây',
            categoryBackgrounds: {
                "danh-sach/phim-bo": "",
                "danh-sach/phim-moi-cap-nhat": "",
                "the-loai/hanh-dong": "",
                "the-loai/tinh-cam": "",
                "the-loai/hai-huoc": "",
                "danh-sach/hoat-hinh": ""
            }
        }
    };

    try {
        const cachedSettings = cache.get('public_settings');
        if (cachedSettings) {
            return res.json({ success: true, data: cachedSettings });
        }

        const settings = await getOrCreateSettings();

        const publicData = {
            general: {
                siteName:        settings.general?.siteName        ?? defaults.general.siteName,
                siteDesc:        settings.general?.siteDesc        ?? defaults.general.siteDesc,
                siteDomain:      settings.general?.siteDomain      ?? defaults.general.siteDomain,
                logoUrl:         settings.general?.logoUrl         ?? defaults.general.logoUrl,
                faviconUrl:      settings.general?.faviconUrl      ?? defaults.general.faviconUrl,
                maintenanceMode: settings.general?.maintenanceMode ?? false,
                allowRegister:   settings.general?.allowRegister   ?? true,
                allowComments:   settings.general?.allowComments   ?? true
            },
            content: {
                enablePhimX:          settings.content?.enablePhimX          ?? false,
                enableWatermark:      settings.content?.enableWatermark      ?? true,
                watermarkUrl:         settings.content?.watermarkUrl         ?? '',
                apiBase:              settings.content?.apiBase              ?? defaults.content.apiBase,
                apiSecondary:         settings.content?.apiSecondary         ?? defaults.content.apiSecondary,
                enableMultipleSources:settings.content?.enableMultipleSources ?? false,
                defaultServer:        settings.content?.defaultServer        ?? defaults.content.defaultServer,
                autoplayDelay:        settings.content?.autoplayDelay        ?? defaults.content.autoplayDelay,
                categoryBackgrounds:  settings.content?.categoryBackgrounds  ?? defaults.content.categoryBackgrounds,
                heroThumbnails:       settings.content?.heroThumbnails       ?? []
            }
        };

        cache.set('public_settings', publicData, 300);
        res.json({ success: true, data: publicData });
    } catch (error) {
        console.error('Settings/public fetch error - returning defaults:', error.message);
        res.json({ success: true, data: defaults });
    }
};

// @desc    Get public payment info (prices + basic bank info) for pricing page
// @route   GET /api/settings/payment-public
// @access  Public
exports.getPaymentPublic = async (req, res) => {
    const defaults = {
        pricePremium:     69000,
        priceStandard:    220000,
        priceBasic:       109000,
        pricePremiumYear: 699000,
        bankName:         'MB Bank',
        bankOwner:        'TRAN VAN ANH',
        bankAccount:      '048889019999',
        momoPhone:        ''
    };

    try {
        const settings = await getOrCreateSettings();
        const p = settings.payment || {};

        res.json({
            success: true,
            data: {
                pricePremium:     p.pricePremium     ?? defaults.pricePremium,
                priceStandard:    p.priceStandard     ?? defaults.priceStandard,
                priceBasic:       p.priceBasic        ?? defaults.priceBasic,
                pricePremiumYear: p.pricePremiumYear  ?? defaults.pricePremiumYear,
                bankName:         p.bankName          ?? defaults.bankName,
                bankOwner:        p.bankOwner         ?? defaults.bankOwner,
                bankAccount:      p.bankAccount       ?? defaults.bankAccount,
                momoPhone:        p.momoPhone         ?? defaults.momoPhone
            }
        });
    } catch (error) {
        console.error('Payment/public fetch error - returning defaults:', error.message);
        res.json({ success: true, data: defaults });
    }
};

// @desc    Get desktop interests ("Bạn đang quan tâm gì?")
// @route   GET /api/settings/desktop-interests
// @access  Public
exports.getDesktopInterests = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (Array.isArray(settings.desktop_interests) && settings.desktop_interests.length > 0) {
            return res.json({ success: true, data: settings.desktop_interests });
        }

        const defaultInterests = [
            {
                id: 'phim-bo',
                title: 'Phim Bộ',
                actionText: 'XEM NGAY',
                link: 'danh-sach.html?list=phim-bo',
                color: '#8b5cf6',
                gradient: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4338ca 100%)',
                imageUrl: 'https://phimimg.com/upload/vod/20260620-1/00083387b890aaac69f0490b3fda8c13.jpg',
                iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>'
            },
            {
                id: 'phim-moi',
                title: 'Phim Mới',
                actionText: 'XEM NGAY',
                link: 'danh-sach.html?list=phim-moi-cap-nhat',
                color: '#ef4444',
                gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 55%, #991b1b 100%)',
                imageUrl: 'https://phimimg.com/upload/vod/20250530-1/fdf11774cff47f0ffc9c2dbe2e02d0ca.jpg',
                iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>'
            },
            {
                id: 'hanh-dong',
                title: 'Hành Động',
                actionText: 'XEM NGAY',
                link: 'categories.html?category=hanh-dong',
                color: '#f97316',
                gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 55%, #c2410c 100%)',
                imageUrl: 'https://phimimg.com/upload/vod/20250821-1/1ec414f82adc729512410edd1b083996.jpg',
                iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
            },
            {
                id: 'tinh-cam',
                title: 'Tình Cảm',
                actionText: 'XEM NGAY',
                link: 'categories.html?category=tinh-cam',
                color: '#ec4899',
                gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 55%, #be185d 100%)',
                imageUrl: 'https://phimimg.com/upload/vod/20250901-1/377ca3402a12c55372f0145f49c0e4a5.jpg',
                iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>'
            },
            {
                id: 'hai-huoc',
                title: 'Hài Hước',
                actionText: 'XEM NGAY',
                link: 'categories.html?category=hai-huoc',
                color: '#eab308',
                gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 55%, #854d0e 100%)',
                imageUrl: 'https://phimimg.com/upload/vod/20241118-1/3b9d2f3c9a5cf65d15a23db8d0c870ac.jpg',
                iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M8 14c1.5 2 6.5 2 8 0M9 9h.01M15 9h.01"></path></svg>'
            },
            {
                id: 'hoat-hinh',
                title: 'Hoạt Hình',
                actionText: 'XEM NGAY',
                link: 'danh-sach.html?list=hoat-hinh',
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 55%, #065f46 100%)',
                imageUrl: 'https://phimimg.com/upload/vod/20241229-1/309e1f1623755fa993140a83167f577b.jpg',
                iconSvg: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
            }
        ];
        return res.json({ success: true, data: defaultInterests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update desktop interests ("Bạn đang quan tâm gì?")
// @route   PUT /api/settings/desktop-interests
// @access  Private/Admin
exports.updateDesktopInterests = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu items phải là mảng danh sách thẻ.' });
        }
        const settings = await Setting.findOneAndUpdate(
            {},
            { $set: { desktop_interests: items } },
            { new: true, upsert: true, runValidators: true }
        );
        cache.del('public_settings');
        res.json({ success: true, message: 'Đã lưu cấu hình "Bạn đang quan tâm gì?" thành công!', data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get desktop hero showcase slides
// @route   GET /api/settings/desktop-hero-showcase
// @access  Public
exports.getDesktopHeroShowcase = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (Array.isArray(settings.desktop_hero_showcase) && settings.desktop_hero_showcase.length > 0) {
            return res.json({ success: true, data: settings.desktop_hero_showcase });
        }
        return res.json({ success: true, data: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update desktop hero showcase slides
// @route   PUT /api/settings/desktop-hero-showcase
// @access  Private/Admin
exports.updateDesktopHeroShowcase = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu items phải là mảng danh sách slide.' });
        }
        const settings = await Setting.findOneAndUpdate(
            {},
            { $set: { desktop_hero_showcase: items } },
            { new: true, upsert: true, runValidators: true }
        );
        cache.del('public_settings');
        res.json({ success: true, message: 'Đã lưu cấu hình Hero Showcase thành công!', data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get desktop hero autoslide config
// @route   GET /api/settings/desktop-hero-autoslide
// @access  Public
exports.getDesktopHeroAutoSlide = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        const conf = settings.desktop_hero_autoslide || { enabled: true, interval: 6, pauseOnHover: true };
        res.json({ success: true, data: conf });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update desktop hero autoslide config
// @route   PUT /api/settings/desktop-hero-autoslide
// @access  Private/Admin
exports.updateDesktopHeroAutoSlide = async (req, res) => {
    try {
        const { enabled, interval, pauseOnHover } = req.body;
        const parsedInterval = parseInt(interval, 10);
        const cleanInterval = Math.min(10, Math.max(3, !isNaN(parsedInterval) ? parsedInterval : 6));
        const cleanConfig = {
            enabled: enabled === true || enabled === 'true' || enabled === 1,
            interval: cleanInterval,
            pauseOnHover: pauseOnHover !== false && pauseOnHover !== 'false' && pauseOnHover !== 0
        };
        const settings = await Setting.findOneAndUpdate(
            {},
            { $set: { desktop_hero_autoslide: cleanConfig } },
            { new: true, upsert: true, runValidators: true }
        );
        cache.del('public_settings');
        res.json({ success: true, message: 'Đã lưu cấu hình tự động chuyển slide thành công!', data: cleanConfig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get mobile 3D showcase slides
// @route   GET /api/settings/mobile-3d-showcase
// @access  Public
exports.getMobile3DShowcase = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (Array.isArray(settings.mobile_3d_showcase) && settings.mobile_3d_showcase.length > 0) {
            return res.json({ success: true, data: settings.mobile_3d_showcase });
        }

        const defaultShowcase = [
            {
                slug: 'doraemon-nobita-va-lau-dai-duoi-day-bien-phien-ban-moi',
                name: 'Doraemon: Nobita và Lâu Đài Dưới Đáy Biển (Phiên Bản Mới)',
                origin_name: 'Doraemon the Movie: New Nobita and the Castle of the Undersea Devil',
                poster_url: 'https://phimimg.com/uploads/movies/20260829/doraemon-nobita-va-lau-dai-duoi-day-bien-phien-ban-moi-poster.webp',
                thumb_url: 'https://phimimg.com/uploads/movies/20260829/doraemon-nobita-va-lau-dai-duoi-day-bien-phien-ban-moi-thumb.webp',
                quality: 'FHD',
                year: '2026',
                lang: 'Vietsub + Lồng Tiếng',
                content: '"Doraemon: Nobita và Lâu đài dưới đáy biển" là một trong những tác phẩm kinh điển thuộc loạt truyện dài Doraemon. Chuyến thám hiểm đáy đại dương kỳ vĩ và hấp dẫn của nhóm bạn Nobita.'
            },
            {
                slug: 'quat-mo-trung-ma',
                name: 'Quật Mộ Trùng Ma',
                origin_name: 'Exhuma',
                poster_url: 'https://phimimg.com/upload/vod/20250530-1/759df554cc21bf9d6805966dc3fe2b67.jpg',
                thumb_url: 'https://phimimg.com/upload/vod/20250530-1/fdf11774cff47f0ffc9c2dbe2e02d0ca.jpg',
                quality: 'FHD',
                year: '2024',
                lang: 'Vietsub Full',
                content: 'Hai pháp sư, một thầy phong thuỷ và một chuyên gia khâm liệm cùng hợp lực khai quật ngôi mộ bí ẩn của một gia tộc giàu có, mở ra chuỗi sự kiện kinh dị tâm linh rùng rợn.'
            },
            {
                slug: 'tham-tu-lung-danh-conan-ngoi-sao-5-canh-1-trieu-do',
                name: 'Thám Tử Lừng Danh Conan: Ngôi Sao 5 Cánh 1 Triệu Đô',
                origin_name: 'Detective Conan Movie 27: The Million Dollar Pentagram',
                poster_url: 'https://phimimg.com/upload/vod/20241229-1/01a129f40195c588ebc3d00c225fa33c.jpg',
                thumb_url: 'https://phimimg.com/upload/vod/20241229-1/309e1f1623755fa993140a83167f577b.jpg',
                quality: 'FHD',
                year: '2024',
                lang: 'Vietsub + Lồng Tiếng',
                content: 'Cuộc đối đầu kịch tính giữa Siêu trộm Kaito Kid, Thám tử miền Tây Hattori Heiji và Conan tại Hakodate xoay quanh thanh kiếm Nhật cổ chứa đựng bí mật lịch sử chấn động.'
            },
            {
                slug: 'deadpool-va-wolverine',
                name: 'Deadpool Và Wolverine',
                origin_name: 'Deadpool & Wolverine',
                poster_url: 'https://phimimg.com/upload/vod/20250821-1/45b6b9aad03ae0aa2aceb5d73419831a.jpg',
                thumb_url: 'https://phimimg.com/upload/vod/20250821-1/1ec414f82adc729512410edd1b083996.jpg',
                quality: 'FHD',
                year: '2024',
                lang: 'Vietsub + Thuyết Minh',
                content: 'Bom tấn siêu anh hùng Marvel với màn hợp tác đầy bùng nổ, hài hước và mãn nhãn giữa hai nhân vật bất trị Deadpool và Wolverine để giải cứu đa vũ trụ.'
            },
            {
                slug: 'do-anh-cong-duoc-toi',
                name: 'Đố Anh Còng Được Tôi',
                origin_name: 'I, The Executioner',
                poster_url: 'https://phimimg.com/upload/vod/20241118-1/9f929fc12384573847849f8786f16ae2.jpg',
                thumb_url: 'https://phimimg.com/upload/vod/20241118-1/3b9d2f3c9a5cf65d15a23db8d0c870ac.jpg',
                quality: 'FHD',
                year: '2024',
                lang: 'Vietsub Full',
                content: 'Thám tử lão làng Seo Do-cheol cùng tân binh trẻ tài năng đối đầu với tên sát nhân hàng loạt nguy hiểm trong một cuộc rượt đuổi nghẹt thở đầy gay cấn.'
            }
        ];
        return res.json({ success: true, data: defaultShowcase });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update mobile 3D showcase slides
// @route   PUT /api/settings/mobile-3d-showcase
// @access  Private/Admin
exports.updateMobile3DShowcase = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu items phải là mảng danh sách phim.' });
        }
        const settings = await Setting.findOneAndUpdate(
            {},
            { $set: { mobile_3d_showcase: items } },
            { new: true, upsert: true, runValidators: true }
        );
        cache.del('public_settings');
        res.json({ success: true, message: 'Đã lưu cấu hình Showcase 3D Mobile thành công!', data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get TMDB Posters, Backdrops and Logos for movie
// @route   GET /api/settings/movie-backdrops
// @access  Public
exports.getMovieBackdrops = async (req, res) => {
    try {
        const { query = '', name = '', origin_name = '', tmdbId, mediaType, slug = '' } = req.query;
        const TMDB_KEY = process.env.TMDB_API_KEY || '5fb3c8d9ad2ca4cd2029836befcc3ab5';

        let targetId = tmdbId ? parseInt(tmdbId, 10) : null;
        let targetType = mediaType || null;
        let movieDetail = null;

        // 1. If slug exists, fetch details from PhimAPI to extract exact TMDB ID
        if (slug) {
            try {
                const pRes = await fetch(`https://phimapi.com/phim/${encodeURIComponent(slug)}`);
                const pData = await pRes.json();
                if (pData.status === true && pData.movie) {
                    movieDetail = pData.movie;
                    if (!targetId && movieDetail.tmdb && movieDetail.tmdb.id) {
                        targetId = parseInt(movieDetail.tmdb.id, 10);
                        targetType = movieDetail.tmdb.type || (movieDetail.type === 'series' || movieDetail.type === 'hoathinh' || movieDetail.type === 'tvshows' ? 'tv' : 'movie');
                    }
                }
            } catch (e) {}

            if (!targetId && !movieDetail) {
                try {
                    const ophimRes = await fetch(`https://ophim1.com/phim/${encodeURIComponent(slug)}`);
                    const ophimData = await ophimRes.json();
                    if (ophimData.status === 'success' && ophimData.data?.item) {
                        movieDetail = ophimData.data.item;
                        if (movieDetail.tmdb && movieDetail.tmdb.id) {
                            targetId = parseInt(movieDetail.tmdb.id, 10);
                            targetType = movieDetail.tmdb.type || (movieDetail.type === 'series' ? 'tv' : 'movie');
                        }
                    }
                } catch (e) {}
            }
        }

        // 2. Search TMDB Multi Search if still no targetId
        if (!targetId) {
            const searchTerms = [origin_name, name, query, slug.replace(/-/g, ' ')].filter(Boolean);
            for (const term of searchTerms) {
                if (targetId) break;
                try {
                    const multiRes = await fetch(`https://api.tmdb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(term)}&include_adult=false`);
                    const multiData = await multiRes.json();
                    if (multiData.results && multiData.results.length > 0) {
                        const validResults = multiData.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
                        if (validResults.length > 0) {
                            const bestMatch = validResults.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];
                            targetId = bestMatch.id;
                            targetType = bestMatch.media_type;
                            break;
                        }
                    }
                } catch (e) {}
            }
        }

        if (!targetType) {
            targetType = 'movie';
        }

        const backdrops = [];
        const posters = [];
        const logos = [];

        // 3. Fetch images from TMDB
        if (targetId) {
            try {
                let imgRes = await fetch(`https://api.tmdb.org/3/${targetType}/${targetId}/images?api_key=${TMDB_KEY}&include_image_language=vi,en,zh,ja,ko,null`);
                let imgData = await imgRes.json();

                if ((!imgData.posters || !imgData.posters.length) && (!imgData.backdrops || !imgData.backdrops.length) && (!imgData.logos || !imgData.logos.length)) {
                    const altType = targetType === 'tv' ? 'movie' : 'tv';
                    const altRes = await fetch(`https://api.tmdb.org/3/${altType}/${targetId}/images?api_key=${TMDB_KEY}&include_image_language=vi,en,zh,ja,ko,null`);
                    const altData = await altRes.json();
                    if ((altData.posters && altData.posters.length) || (altData.backdrops && altData.backdrops.length) || (altData.logos && altData.logos.length)) {
                        targetType = altType;
                        imgData = altData;
                    }
                }

                if (imgData.posters && Array.isArray(imgData.posters)) {
                    imgData.posters
                        .slice(0, 24)
                        .forEach(p => {
                            posters.push({
                                url: `https://image.tmdb.org/t/p/original${p.file_path}`,
                                previewUrl: `https://image.tmdb.org/t/p/w500${p.file_path}`,
                                width: p.width,
                                height: p.height,
                                aspectRatio: p.aspect_ratio,
                                voteAverage: p.vote_average
                            });
                        });
                }

                if (imgData.backdrops && Array.isArray(imgData.backdrops)) {
                    imgData.backdrops
                        .filter(b => (!b.aspect_ratio || b.aspect_ratio >= 1.2) && (!b.width || !b.height || b.width > b.height))
                        .slice(0, 24)
                        .forEach(b => {
                            backdrops.push({
                                url: `https://image.tmdb.org/t/p/original${b.file_path}`,
                                previewUrl: `https://image.tmdb.org/t/p/w780${b.file_path}`,
                                width: b.width,
                                height: b.height,
                                aspectRatio: b.aspect_ratio,
                                voteAverage: b.vote_average
                            });
                        });
                }

                if (imgData.logos && Array.isArray(imgData.logos)) {
                    imgData.logos.slice(0, 20).forEach(l => {
                        logos.push({
                            url: `https://image.tmdb.org/t/p/w500${l.file_path}`,
                            previewUrl: `https://image.tmdb.org/t/p/w300${l.file_path}`,
                            lang: l.iso_639_1 || 'en',
                            aspectRatio: l.aspect_ratio
                        });
                    });
                }
            } catch (e) {
                console.warn('[TMDB Image Fetch Warning]', e);
            }
        }

        // 4. Complement with movieDetail poster/thumb if available
        if (movieDetail) {
            if (movieDetail.poster_url) {
                const fullPoster = movieDetail.poster_url.startsWith('http') ? movieDetail.poster_url : `https://phimimg.com/${movieDetail.poster_url.replace(/^\//, '')}`;
                if (!posters.some(p => p.url === fullPoster)) {
                    posters.unshift({
                        url: fullPoster,
                        previewUrl: fullPoster,
                        width: 800,
                        height: 1200,
                        isPrimary: true
                    });
                }
            }
            if (movieDetail.thumb_url) {
                const fullThumb = movieDetail.thumb_url.startsWith('http') ? movieDetail.thumb_url : `https://phimimg.com/${movieDetail.thumb_url.replace(/^\//, '')}`;
                if (!backdrops.some(b => b.url === fullThumb)) {
                    backdrops.unshift({
                        url: fullThumb,
                        previewUrl: fullThumb,
                        width: 1920,
                        height: 1080,
                        isPrimary: true
                    });
                }
            }
        }

        return res.json({
            success: true,
            tmdbId: targetId,
            mediaType: targetType,
            posters,
            backdrops,
            logos
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, posters: [], backdrops: [], logos: [] });
    }
};
