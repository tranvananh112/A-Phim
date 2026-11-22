// ================================================================
// A PHIM – Hero Banner & Desktop Spotlight Engine v12
// Full Support: Custom Logos + TMDB Transparent Logos + 4K Backdrops
// + Auto-Slide (3s - 10s configurable) + LocalStorage Sync
// ================================================================

// -- Default Curated Spotlight & Thumbnails Data ------------------
// SET CỨNG (2026-11-18): 8 phim Hero Showcase mới nhất do Admin cấu hình
const DEFAULT_HERO_SLIDES = [
    {
        "imdb": {
            "vote_average": 8.1
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Cẩm Nguyệt Như Ca",
        "slug": "cam-nguyet-nhu-ca",
        "tmdb": {
            "vote_average": 8.1
        },
        "year": "2025",
        "content": "Phim được chuyển thể từ tiểu thuyết nổi tiếng \"Trùng Sinh: Nữ Tướng Tinh\". Để bảo vệ tước vị gia tộc, trưởng nữ Hà gia là Hà Yến buộc phải đeo mặt nạ, giả làm đích trưởng tử Hà gia - Hà Như Phi. Thời thiếu niên, Hà Yến lần đầu gặp công tử cao quý Tiêu Giác ở Hiền Xương Quán. Sau này, để thoát khỏi vận mệnh gia tộc, cô kiên quyết rời học quán, ra sa trường. Nhiều năm sau, Hà Yến vinh quang trở về quê nhà, nhưng lại bị gia tộc hãm hại vì huynh trưởng Hà Như Phi quay về. Sau khi thoát chết, Hà Yến đổi thân phận, hóa thân thành Hòa Yến, con gái của thành môn hiệu úy. Cô giả nam, đến Dịch Châu tòng quân, quyết tâm lấy lại tất cả những gì thuộc về mình. Hòa Yến kết giao với Sở Chiêu hòa nhã dịu dàng, cũng một lần nữa gặp lại Tiêu Giác. Nhưng Tiêu Giác nghi ngờ Hòa Yến là gian tế, liên tục thăm dò, làm khó đủ đường. Hòa Yến bám chặt lấy Tiêu Giác, đồng thời dùng thành tích đứng đầu Dịch Châu Vệ để chứng minh năng lực của mình. Hai người cùng trải qua sự kiện Tôn gia, sự kiện vương nữ Quý Dương, trận chiến bảo vệ thành Nhuận Đô, nhiều lần đối mặt sinh tử, dần dần nảy sinh tình cảm với nhau.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/tBrO0gV9yWqEVzm8CidpxnQTKlj.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/mwiG510fVcOrzWUSDSV7B5tRMrb.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/mwiG510fVcOrzWUSDSV7B5tRMrb.jpg",
        "movieSlug": "cam-nguyet-nhu-ca",
        "posterUrl": "https://phimimg.com/upload/vod/20250806-1/eaa856bf1bf6e28c17ebafdc2283f8ad.jpg",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/mwiG510fVcOrzWUSDSV7B5tRMrb.jpg",
        "originName": "Legend Of The Female General",
        "poster_url": "https://phimimg.com/upload/vod/20250806-1/eaa856bf1bf6e28c17ebafdc2283f8ad.jpg",
        "origin_name": "Legend Of The Female General",
        "episodeCurrent": "Hoàn Tất (36/36)",
        "episode_current": "Hoàn Tất (36/36)"
    },
    {
        "imdb": {
            "vote_average": 9
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Thập Vạn Cuồng Hoa Nhập Mộng Lai",
        "slug": "thap-van-cuong-hoa-nhap-mong-lai",
        "tmdb": {
            "vote_average": 9
        },
        "year": "2026",
        "content": "Ma đầu Kỳ Phượng Ân \"nguồn gốc vạn điều ác\" tình cờ gặp cô gái Áp Mao mang thể chất \"thịt Đường Tăng\", hai con người bị cưỡng ép ràng buộc này vừa chán ghét nhau mà cũng cứu rỗi lẫn nhau. Trải qua sáu vụ án kì quái: bộ xương khô tóc dài, sáng làm người tối làm yêu, thuồng luồng hóa rồng, bể máu trả hồn, hồng nhan moi tim và pháo hoa cá vàng, họ phá giải các âm mưu phía sau, cuối cùng giúp nhau rửa sạch tiếng xấu, trả lại tự do cho thế gian, giúp những người có tình được về bên nhau.",
        "logoUrl": "/images/logos/thap-van-cuong-hoa-nhap-mong-lai.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/8nqLbfvduuLQtzALe3ZjxiHtgLt.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/8nqLbfvduuLQtzALe3ZjxiHtgLt.jpg",
        "movieSlug": "thap-van-cuong-hoa-nhap-mong-lai",
        "posterUrl": "https://phimimg.com/uploads/movies/20261117/thap-van-cuong-hoa-nhap-mong-lai-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/8nqLbfvduuLQtzALe3ZjxiHtgLt.jpg",
        "originName": "Blossom in Darkness",
        "poster_url": "https://phimimg.com/uploads/movies/20261117/thap-van-cuong-hoa-nhap-mong-lai-poster.webp",
        "origin_name": "Blossom in Darkness",
        "episodeCurrent": "Tập 9",
        "episode_current": "Tập 9"
    },
    {
        "imdb": {
            "vote_average": 9
        },
        "lang": "Vietsub",
        "name": "Bác Sĩ X",
        "slug": "bac-si-x",
        "tmdb": {
            "vote_average": 9
        },
        "year": "2026",
        "content": "Ở một bệnh viện nơi cái tôi và tham nhũng lộng hành, một bác sĩ phẫu thuật bí ẩn nhưng tài năng xuất hiện – nhận những ca tưởng chừng bất khả thi bất chấp sự phản đối quyết liệt.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/x8Xw8Wa0HUlRySJjYn8udIy7Mun.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/f0JkNBCO5WuCI63F0iM0Xs32k9C.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/f0JkNBCO5WuCI63F0iM0Xs32k9C.jpg",
        "movieSlug": "bac-si-x",
        "posterUrl": "https://phimimg.com/uploads/movies/20261010/bac-si-x-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/f0JkNBCO5WuCI63F0iM0Xs32k9C.jpg",
        "originName": "Doctor X: Mafia in White",
        "poster_url": "https://phimimg.com/uploads/movies/20261010/bac-si-x-poster.webp",
        "origin_name": "Doctor X: Mafia in White",
        "episodeCurrent": "Tập 1",
        "episode_current": "Tập 1"
    },
    {
        "imdb": {
            "vote_average": 9.5
        },
        "lang": "Vietsub",
        "name": "100 Ngày Lừa Dối",
        "slug": "100-ngay-lua-doi",
        "tmdb": {
            "vote_average": 9.5
        },
        "year": "2026",
        "content": "Khao khát tự do, cô nàng móc túi số một của Gyeongseong thâm nhập vào chính quyền thực dân Nhật để đánh cắp bí mật, nhưng lại phải lòng con trai của mục tiêu.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/hP32NrFGeACEoXkZn1MzB13UHKG.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/3SvKCITqMtjgPIhFBjRc4yTAc4H.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/3SvKCITqMtjgPIhFBjRc4yTAc4H.jpg",
        "movieSlug": "100-ngay-lua-doi",
        "posterUrl": "https://phimimg.com/uploads/movies/20261011/100-ngay-lua-doi-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/3SvKCITqMtjgPIhFBjRc4yTAc4H.jpg",
        "originName": "100 Days Of Deception",
        "poster_url": "https://phimimg.com/uploads/movies/20261011/100-ngay-lua-doi-poster.webp",
        "origin_name": "100 Days Of Deception",
        "episodeCurrent": "Tập 2",
        "episode_current": "Tập 2"
    },
    {
        "imdb": {
            "vote_average": 9.5
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Tình Yêu Độc Nhất",
        "slug": "tinh-yeu-doc-nhat",
        "tmdb": {
            "vote_average": 9.5
        },
        "year": "2026",
        "content": "Giữa cuộc sống chật vật và những giấc mơ dang dở, Gong Yu Il bất ngờ bước vào thế giới của ngôi sao Tak Mu I – người đang sống trong nỗi sợ hãi vì bị bám đuôi. Khi trở thành quản lý của anh, Yu Il phát hiện cuốn tiểu thuyết mình từng viết chính là ánh sáng đã nâng đỡ Mu I trong những ngày tăm tối. Từ những tổn thương giấu kín, hai trái tim dần tìm thấy nhau, viết nên một tình yêu vừa mong manh, vừa duy nhất.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/flSN0asy52nuiG04Lo8AuwME7tU.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/v6OPylktx8YY8uF0AWCK9LyAUSr.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/v6OPylktx8YY8uF0AWCK9LyAUSr.jpg",
        "movieSlug": "tinh-yeu-doc-nhat",
        "posterUrl": "https://phimimg.com/uploads/movies/20261111/tinh-yeu-doc-nhat-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/v6OPylktx8YY8uF0AWCK9LyAUSr.jpg",
        "originName": "One Of A Kind Romance",
        "poster_url": "https://phimimg.com/uploads/movies/20261111/tinh-yeu-doc-nhat-poster.webp",
        "origin_name": "One Of A Kind Romance",
        "episodeCurrent": "Tập 2",
        "episode_current": "Tập 2"
    },
    {
        "imdb": {
            "vote_average": 1
        },
        "lang": "Vietsub",
        "name": "Tình Yêu Trong Vỏ Bọc / Tình Yêu Ngụy Trang",
        "slug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
        "tmdb": {
            "vote_average": 1
        },
        "year": "2026",
        "content": "Tình Yêu Trong Vỏ Bọc (Love in Disguise) là một bộ phim truyền hình hài lãng mạn công sở của Hàn Quốc, với sự tham gia của các diễn viên Yim Si-wan, Seol In-ah, Kim Jung-hyun và Yeonwoo. Dựa trên tiểu thuyết mạng \"Tại Sao Bạn Không Biết Đó Là Con Gái?\"",
        "logoUrl": "https://image.tmdb.org/t/p/w500/e4PFz0r4GlFX4WOhFm0RpI9CgdM.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/32g5MD6eHPAZ5NAgkNAURb4eupm.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/32g5MD6eHPAZ5NAgkNAURb4eupm.jpg",
        "movieSlug": "tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang",
        "posterUrl": "https://phimimg.com/uploads/movies/20261020/tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/32g5MD6eHPAZ5NAgkNAURb4eupm.jpg",
        "originName": "Love in Disguise",
        "poster_url": "https://phimimg.com/uploads/movies/20261020/tinh-yeu-trong-vo-boc-tinh-yeu-nguy-trang-poster.webp",
        "origin_name": "Love in Disguise",
        "episodeCurrent": "Tập 7",
        "episode_current": "Tập 7"
    },
    {
        "imdb": {
            "vote_average": 9
        },
        "lang": "Vietsub + Thuyết Minh",
        "name": "Gấp Ánh Trăng",
        "slug": "gap-anh-trang",
        "tmdb": {
            "vote_average": 9
        },
        "year": "2026",
        "content": "Vân Li, cô gái mắc chứng sợ giao tiếp nghiêm trọng, đến Nam Vu học cao học để chứng minh mình có thể sống tự lập và tình cờ gặp lại Phó Thức Tắc, chàng trai cô thầm mến từ thời trung học.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/2V8taZ4kwRbcOb6dlAQqViXeki8.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/Al5cft7sYLo46rhSKc9VUm125md.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/Al5cft7sYLo46rhSKc9VUm125md.jpg",
        "movieSlug": "gap-anh-trang",
        "posterUrl": "https://phimimg.com/uploads/movies/20261105/gap-anh-trang-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/Al5cft7sYLo46rhSKc9VUm125md.jpg",
        "originName": "When I Meet The Moon",
        "poster_url": "https://phimimg.com/uploads/movies/20261105/gap-anh-trang-poster.webp",
        "origin_name": "When I Meet The Moon",
        "episodeCurrent": "Tập 8",
        "episode_current": "Tập 8"
    },
    {
        "imdb": {
            "vote_average": 8.3
        },
        "lang": "Vietsub",
        "name": "Hoàng Hậu Tái Hôn",
        "slug": "hoang-hau-tai-hon",
        "tmdb": {
            "vote_average": 8.3
        },
        "year": "2026",
        "content": "Hoàng hậu Navier là người đứng đầu hoàn hảo của Đông Đế Quốc, cai trị đất nước cùng chồng là Hoàng đế Sovieshu. Tuy nhiên, cuộc sống và ngai vị của cô đảo lộn khi Sovieshu mang về cô hầu gái trốn chạy tên Rashta và sủng ái cô ta đến mức đòi ly hôn Navier. Thay vì gục ngã hay bi lụy, Navier đồng ý ly hôn với một điều kiện: cô được phép tái hôn với Hoàng tử Heinrey quyền lực của Tây Vương Quốc, từ đó bắt đầu hành động lật ngược thế cờ và làm chủ vận mệnh mới của mình.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/tfsYQser4eLq4npTdf6tHNKet5q.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
        "movieSlug": "hoang-hau-tai-hon",
        "posterUrl": "https://phimimg.com/uploads/movies/20261105/hoang-hau-tai-hon-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
        "originName": "The Remarried Empress",
        "poster_url": "https://phimimg.com/uploads/movies/20261105/hoang-hau-tai-hon-poster.webp",
        "origin_name": "The Remarried Empress",
        "episodeCurrent": "Tập 4",
        "episode_current": "Tập 4"
    },
    {
        "imdb": {
            "vote_average": 7.6
        },
        "lang": "Vietsub",
        "name": "Việc Ma, Lương Quái",
        "slug": "viec-ma-luong-quai",
        "tmdb": {
            "vote_average": 7.6
        },
        "year": "2026",
        "content": "Chìm trong nợ nần, chàng trai trẻ nhận những công việc làm thêm béo bở từ một công ty môi giới việc làm bí ẩn – nhưng rồi nhận ra cuộc sống mưu sinh dần biến thành ác mộng.",
        "logoUrl": "https://image.tmdb.org/t/p/w500/xurPYmj6xwd09XSceRIDRXYfYvc.png",
        "quality": "FHD",
        "category": [],
        "imageUrl": "https://image.tmdb.org/t/p/w1280/thJ4Pu7Nrvpj1ZInP8rZtNEFU6D.jpg",
        "thumbUrl": "https://image.tmdb.org/t/p/w1280/thJ4Pu7Nrvpj1ZInP8rZtNEFU6D.jpg",
        "movieSlug": "viec-ma-luong-quai",
        "posterUrl": "https://phimimg.com/uploads/movies/20261031/viec-ma-luong-quai-poster.webp",
        "thumb_url": "https://image.tmdb.org/t/p/w1280/thJ4Pu7Nrvpj1ZInP8rZtNEFU6D.jpg",
        "originName": "Dead-End Job",
        "poster_url": "https://phimimg.com/uploads/movies/20261031/viec-ma-luong-quai-poster.webp",
        "origin_name": "Dead-End Job",
        "episodeCurrent": "Hoàn Tất (8/8)",
        "episode_current": "Hoàn Tất (8/8)"
    }
];

// -- State Variables ---------------------------------------------
let currentAdminBanner = DEFAULT_HERO_SLIDES[0];
let heroSlides = DEFAULT_HERO_SLIDES.map(m => ({ ...m }));
let currentSlideIndex = 0;
let isTransitioning = false;

// -- Auto-Slide State --------------------------------------------
let autoSlideConfig = {
    enabled: true,
    interval: 6 // Giới hạn 3s - 10s
};
let autoSlideTimer = null;
let isUserHoldingOrDragging = false;
let lastAutoSlideConfigHash = '';

// -- Entry Point -------------------------------------------------
async function loadHeroBanner() {
    if (window.innerWidth < 1024) return;

    // 1. INSTANT: Render dữ liệu set cứng mẫu ngay lập tức (0ms) - không phụ thuộc backend
    renderHeroBannerContent(currentAdminBanner, true);
    renderThumbnails(heroSlides);
    updateThumbnailActive(0);
    initHeroAutoSlide();
    attachSwipeHandler();
    preloadSlideImages(heroSlides);

    // 2. Kiểm tra cache LocalStorage nếu có cấu hình Admin tùy chỉnh hợp lệ
    try {
        const cacheVersion = localStorage.getItem('aphim_hero_version');
        if (cacheVersion !== 'v20261118_v4') {
            localStorage.removeItem('aphim_hero_autoslide_config');
            localStorage.removeItem('aphim_hero_desktop_config');
            localStorage.setItem('aphim_hero_version', 'v20261118_v4');
        }
        const desktopHeroConfig = localStorage.getItem('aphim_hero_desktop_config');
        if (desktopHeroConfig) {
            const parsedList = JSON.parse(desktopHeroConfig);
            if (Array.isArray(parsedList) && parsedList.length > 0 && parsedList[0]?.slug) {
                heroSlides = parsedList.map(convertBannerToMovie);
                currentAdminBanner = heroSlides[0];
                renderHeroBannerContent(currentAdminBanner, true);
                renderThumbnails(heroSlides);
                updateThumbnailActive(0);
                preloadSlideImages(heroSlides);
            }
        }
    } catch (e) { console.warn('Hero cache read error:', e); }

    // 3. BACKGROUND (NON-BLOCKING): Chỉ cập nhật ngầm nếu backend online, timeout cực nhanh 1.5s
    try {
        const apiUrl = (typeof getBackendBaseURL === 'function') ? window.getBackendBaseURL() : '';
        if (apiUrl) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${apiUrl}/api/settings/desktop-hero-showcase?t=` + Date.now(), {
                signal: controller.signal
            }).then(r => r.json()).catch(() => null);
            clearTimeout(timeoutId);

            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                localStorage.setItem('aphim_hero_desktop_config', JSON.stringify(res.data));
                heroSlides = res.data.map(convertBannerToMovie);
                currentAdminBanner = heroSlides[0];
                renderHeroBannerContent(currentAdminBanner, false);
                renderThumbnails(heroSlides);
                updateThumbnailActive(0);
                preloadSlideImages(heroSlides);
            }
        }
    } catch (err) {
        // Silent fail - đã có dữ liệu set cứng hoạt động độc lập
    }
}

// -- Convert Banner API / Storage format -> Standard Movie format -
function convertBannerToMovie(banner) {
    if (!banner) return null;
    const landscape = banner.imageUrl || banner.bannerUrl || banner.image || banner.thumb_url || banner.thumbUrl || '';
    const portrait = banner.posterUrl || banner.poster_url || banner.thumbUrl || banner.thumb_url || landscape;
    return {
        slug: banner.movieSlug || banner.slug || '',
        name: banner.name || '',
        origin_name: banner.originName || banner.origin_name || '',
        thumb_url: landscape,
        poster_url: portrait,
        content: banner.content || '',
        year: banner.year || '2026',
        quality: banner.quality || 'FHD',
        age: banner.age || 'T13',
        lang: banner.lang || 'Vietsub',
        episode_current: banner.episodeCurrent || banner.episode_current || 'Full',
        category: banner.category || [{ name: 'Phim Hot', slug: 'phim-hot' }],
        tmdb: banner.tmdb || {},
        imdb: banner.imdb || {},
        logoUrl: banner.logoUrl || ''
    };
}

// -- URL Image Selector (Optimized) -------------------------------
function getHeroImageUrl(movie) {
    if (!movie) return '';
    if (movie.thumb_url) {
        return movie.thumb_url.startsWith('http') 
            ? movie.thumb_url 
            : `https://phimimg.com/${movie.thumb_url.startsWith('uploads/') ? '' : 'uploads/movies/'}${movie.thumb_url}`;
    }
    if (movie.poster_url) {
        return movie.poster_url.startsWith('http')
            ? movie.poster_url
            : `https://phimimg.com/${movie.poster_url.startsWith('uploads/') ? '' : 'uploads/movies/'}${movie.poster_url}`;
    }
    return '';
}

function buildImageUrl(rawUrl, width) {
    if (!rawUrl) return '';
    if (rawUrl.includes('tmdb.org')) return rawUrl;
    if (typeof movieAPI !== 'undefined' && movieAPI.getImageURL) {
        return movieAPI.getImageURL(rawUrl, width, 90, true);
    }
    return rawUrl.startsWith('http')
        ? rawUrl
        : `https://phimimg.com/${rawUrl.startsWith('uploads/') ? '' : 'uploads/movies/'}${rawUrl}`;
}

// -- TMDB & Custom Transparent Logo Engine -----------------------
let currentLogoLoadId = 0;
const logoCache = new Map();

try {
    const _s = localStorage.getItem('aphim_logo_cache_v2');
    if (_s) Object.entries(JSON.parse(_s)).forEach(([k, v]) => logoCache.set(k, v));
} catch (e) {}

function _persistLogoCache() {
    try {
        const obj = {};
        logoCache.forEach((v, k) => { if (v && v !== 'TEXT_ONLY') obj[k] = v; });
        localStorage.setItem('aphim_logo_cache_v2', JSON.stringify(obj));
    } catch (e) {}
}

async function loadHeroLogo(movie) {
    const heroTitle = document.getElementById('heroTitle');
    if (!heroTitle) return;

    const loadId = ++currentLogoLoadId;
    document.querySelectorAll('#heroTitleImg').forEach(el => el.remove());

    if (!movie) {
        heroTitle.style.display = 'block';
        return;
    }

    function applyLogoToDOM(url) {
        if (loadId !== currentLogoLoadId) return;
        document.querySelectorAll('#heroTitleImg').forEach(el => el.remove());

        heroTitle.style.display = 'none';

        const img = new Image();
        img.id = 'heroTitleImg';
        img.src = url;
        img.alt = movie.name || '';
        img.className = 'w-auto h-auto max-h-[75px] md:max-h-[110px] lg:max-h-[130px] object-contain drop-shadow-2xl transition-opacity duration-300 opacity-0';
        img.style.filter = 'drop-shadow(0px 4px 10px rgba(0,0,0,0.85))';
        img.fetchPriority = 'high';
        img.loading = 'eager';

        img.onload = () => {
            if (loadId !== currentLogoLoadId) return;
            document.querySelectorAll('#heroTitleImg').forEach(el => el.remove());
            if (heroTitle.parentNode) {
                heroTitle.parentNode.insertBefore(img, heroTitle);
                heroTitle.style.display = 'none';
                setTimeout(() => {
                    if (loadId === currentLogoLoadId) img.classList.remove('opacity-0');
                }, 20);
            }
        };
        img.onerror = () => {
            if (loadId === currentLogoLoadId) {
                document.querySelectorAll('#heroTitleImg').forEach(el => el.remove());
                heroTitle.style.display = 'block';
            }
        };

        if (img.complete && img.naturalWidth > 0) {
            document.querySelectorAll('#heroTitleImg').forEach(el => el.remove());
            if (heroTitle.parentNode) {
                heroTitle.parentNode.insertBefore(img, heroTitle);
                heroTitle.style.display = 'none';
                img.classList.remove('opacity-0');
            }
        }
    }

    // 1. Ưu tiên Custom Logo URL do Admin thiết lập
    if (movie.logoUrl && movie.logoUrl.trim() !== '') {
        applyLogoToDOM(movie.logoUrl.trim());
        return;
    }

    // 2. Kiểm tra Cache
    const cacheKey = movie.slug || movie.name;
    if (logoCache.has(cacheKey)) {
        const cachedUrl = logoCache.get(cacheKey);
        if (cachedUrl && cachedUrl !== 'TEXT_ONLY') {
            applyLogoToDOM(cachedUrl);
        } else {
            heroTitle.style.display = 'block';
        }
        return;
    }

    // Hiển thị text tạm thời
    heroTitle.style.display = 'block';

    // 3. Tìm logo chính thức từ TMDB
    const API_KEY = '5fb3c8d9ad2ca4cd2029836befcc3ab5';

    async function secureFetch(target) {
        try {
            const r = await fetch(target, { signal: AbortSignal.timeout(3000) });
            if (r.ok) return r;
        } catch (e) {}
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(target)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`
        ];
        for (const p of proxies) {
            try {
                const r = await fetch(p, { signal: AbortSignal.timeout(3500) });
                if (r.ok) return r;
            } catch (e) {}
        }
        return null;
    }

    try {
        let tmdbId = movie.tmdb?.id;
        let type = movie.tmdb?.type === 'tv' ? 'tv' : 'movie';

        if (!tmdbId) {
            const query = encodeURIComponent(movie.origin_name || movie.name);
            const searchUrl = `https://api.tmdb.org/3/search/multi?api_key=${API_KEY}&query=${query}`;
            const searchRes = await secureFetch(searchUrl);
            if (loadId !== currentLogoLoadId) return;

            if (searchRes) {
                const searchData = await searchRes.json();
                if (searchData.results && searchData.results.length > 0) {
                    const bestResult = searchData.results.find(r => r.media_type === 'tv' || r.media_type === 'movie') || searchData.results[0];
                    if (bestResult && bestResult.id) {
                        tmdbId = bestResult.id;
                        type = bestResult.media_type || 'movie';
                    }
                }
            }
        }

        if (loadId !== currentLogoLoadId) return;
        if (!tmdbId) {
            logoCache.set(cacheKey, 'TEXT_ONLY');
            return;
        }

        const url = `https://api.tmdb.org/3/${type}/${tmdbId}/images?api_key=${API_KEY}`;
        const res = await secureFetch(url);
        if (loadId !== currentLogoLoadId || !res) {
            logoCache.set(cacheKey, 'TEXT_ONLY');
            return;
        }

        const data = await res.json();
        if (loadId !== currentLogoLoadId) return;

        if (data.logos && data.logos.length > 0) {
            const viLogo = data.logos.find(l => l.iso_639_1 === 'vi');
            const enLogo = data.logos.find(l => l.iso_639_1 === 'en');
            const bestLogo = viLogo || enLogo || data.logos[0];

            if (bestLogo && bestLogo.file_path) {
                const imgUrl = `https://image.tmdb.org/t/p/w500${bestLogo.file_path}`;
                logoCache.set(cacheKey, imgUrl);
                _persistLogoCache();
                applyLogoToDOM(imgUrl);
                return;
            }
        }
        logoCache.set(cacheKey, 'TEXT_ONLY');
    } catch (e) {
        if (loadId === currentLogoLoadId) {
            logoCache.set(cacheKey, 'TEXT_ONLY');
        }
    }
}

// ================================================================
// SLIDE SWITCHING – Dual-Layer 60fps Cinema Slide & Crossfade
// (Mượt mà uyển chuyển, ảnh lướt từ phải vào, chữ lướt từ trái vào)
// ================================================================
let currentLayerName = 'A';
let transitionTimer = null;

function switchHeroSlide(newIndex, explicitDirection, isAutoReturn) {
    if (!heroSlides || heroSlides.length === 0) return;
    if (newIndex < 0) newIndex = heroSlides.length - 1;
    if (newIndex >= heroSlides.length) newIndex = 0;
    if (newIndex === currentSlideIndex && !isTransitioning) return;

    const prevIndex = currentSlideIndex;
    currentSlideIndex = newIndex;

    if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
    }
    isTransitioning = true;
    clearAutoSlideTimer();

    const movie = heroSlides[newIndex];
    if (!movie) {
        isTransitioning = false;
        return;
    }

    // Xác định chiều chuyển động: 1: Lướt sang phải (Next), -1: Lướt sang trái (Prev)
    let direction = explicitDirection !== undefined ? explicitDirection : 1;
    if (explicitDirection === undefined) {
        if (newIndex < prevIndex) direction = -1;
        if (prevIndex === heroSlides.length - 1 && newIndex === 0) direction = 1;
        if (prevIndex === 0 && newIndex === heroSlides.length - 1) direction = -1;
    }

    // 1. Cập nhật ngay trạng thái active của Thumbnail (chuyển viền sáng lập tức 0ms)
    updateThumbnailActive(newIndex);

    // 2. Lấy link ảnh chất lượng cao
    const rawUrl = getHeroImageUrl(movie);
    const optUrl = (typeof buildImageUrl === 'function') ? buildImageUrl(rawUrl, 1400) : rawUrl;

    const layerA = document.getElementById('heroImageLayerA');
    const layerB = document.getElementById('heroImageLayerB');
    const heroInfoCol = document.querySelector('.hero-info-col') || document.getElementById('heroContent');

    const currentLayer = currentLayerName === 'A' ? layerA : layerB;
    const nextLayer = currentLayerName === 'A' ? layerB : layerA;

    // 3. PHASE 1: Cập nhật dữ liệu phim & Chuẩn bị vị trí xuất phát cho cả 2 bên
    updateHeroBannerText(movie);
    updateHeroButtons(movie);
    setupHeroActions(movie);
    fetchLatestEpisodeCount(movie);

    // Chuẩn bị lớp ảnh nền tiếp theo (Lướt từ bên phải vào)
    if (nextLayer && currentLayer) {
        nextLayer.src = optUrl || rawUrl;
        nextLayer.style.transition = 'none';
        nextLayer.style.transform = `translateZ(0) translateX(${direction * 48}px) scale(1.03)`;
        nextLayer.style.opacity = '0';
        nextLayer.style.zIndex = '2';
        currentLayer.style.zIndex = '1';
        nextLayer.offsetHeight; // Trigger reflow
    }

    // Chuẩn bị khung nội dung bên trái (Lướt nhẹ nhàng đồng bộ từ bên trái vào)
    if (heroInfoCol) {
        heroInfoCol.style.transition = 'none';
        heroInfoCol.style.opacity = '0';
        heroInfoCol.style.transform = `translateZ(0) translateX(${-direction * 45}px)`;
        heroInfoCol.offsetHeight; // Trigger reflow
    }

    // 4. PHASE 2: Kích hoạt đồng thời hiệu ứng lướt êm ái cho CẢ 2 BÊN (Cùng 0.68s, cùng gia tốc chuẩn điện ảnh)
    requestAnimationFrame(() => {
        // Ảnh lớn lướt từ phải vào giữa
        if (nextLayer && currentLayer) {
            nextLayer.style.transition = 'opacity 0.68s cubic-bezier(0.25, 1, 0.5, 1), transform 0.78s cubic-bezier(0.16, 1, 0.3, 1)';
            nextLayer.style.opacity = '1';
            nextLayer.style.transform = 'translateZ(0) translateX(0) scale(1)';

            currentLayer.style.transition = 'opacity 0.68s cubic-bezier(0.25, 1, 0.5, 1), transform 0.78s cubic-bezier(0.16, 1, 0.3, 1)';
            currentLayer.style.opacity = '0';
            currentLayer.style.transform = `translateZ(0) translateX(${-direction * 45}px) scale(1.02)`;
        }

        // Khung chữ / nội dung lướt nhẹ nhàng từ trái vào giữa (Đồng bộ 100% với ảnh nền)
        if (heroInfoCol) {
            heroInfoCol.style.transition = 'opacity 0.68s cubic-bezier(0.25, 1, 0.5, 1), transform 0.78s cubic-bezier(0.16, 1, 0.3, 1)';
            heroInfoCol.style.opacity = '1';
            heroInfoCol.style.transform = 'translateZ(0) translateX(0)';
        }
    });

    // 5. PHASE 3: Hoàn tất chu kỳ chuyển cảnh & mở khóa thao tác nhanh
    transitionTimer = setTimeout(() => {
        currentLayerName = currentLayerName === 'A' ? 'B' : 'A';
        isTransitioning = false;
        transitionTimer = null;
        startAutoSlideTimer();
    }, 350);
}

// -- Update Text & Badges on DOM ----------------------------------
function updateHeroBannerText(movie) {
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroBadges = document.getElementById('heroBadges');
    const heroGenres = document.getElementById('heroGenres');
    const heroDescription = document.getElementById('heroDescription');

    if (heroTitle) {
        heroTitle.textContent = movie.name || '';
        const cacheKeyCheck = movie.slug || movie.name;
        const hasLogoReady = (movie.logoUrl && movie.logoUrl.trim() !== '') ||
                             (logoCache.has(cacheKeyCheck) && logoCache.get(cacheKeyCheck) !== 'TEXT_ONLY');
        heroTitle.style.display = hasLogoReady ? 'none' : 'block';
    }
    if (heroSubtitle) heroSubtitle.textContent = movie.origin_name || '';

    // Async Logo
    loadHeroLogo(movie);

    if (heroBadges) {
        let epText = movie.episode_current || movie.episode || '';
        if (epText) {
            const lcText = epText.toLowerCase().trim();
            if (lcText === 'tập' || lcText === 'tập ' || lcText.includes('hoàn tất') || lcText.includes('full')) {
                epText = 'Hoàn Tất (Full)';
            } else if (!epText.toLowerCase().includes('tập') && !isNaN(epText)) {
                epText = `Tập ${epText}`;
            }
        }

        const quality = movie.quality || 'FHD';
        const year = movie.year || '2026';
        const imdbScore = (movie.imdb && movie.imdb.vote_average) 
            ? Number(movie.imdb.vote_average).toFixed(1) 
            : ((movie.tmdb && movie.tmdb.vote_average) ? Number(movie.tmdb.vote_average).toFixed(1) : '9.5');
        const ageTag = movie.age || 'T13';

        heroBadges.innerHTML = `
            ${epText ? `
            <span class="hero-badge-ep" data-ep-badge>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${epText}</span>
            </span>` : ''}
            <span class="hero-badge-year">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x1="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                <span>${year}</span>
            </span>
            <span class="hero-badge-imdb">
                <span class="hero-badge-imdb-label">IMDb</span> <span class="hero-badge-imdb-val">${imdbScore}</span>
            </span>
            <div class="hero-feature-ribbon">
                <span class="hero-ribbon-seg hero-seg-vs" title="Phụ đề Vietsub">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z"/></svg>
                    <span>VS</span>
                </span>
                <span class="hero-ribbon-seg hero-seg-age" title="Độ tuổi">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 5h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
                    <span>${ageTag}</span>
                </span>
                <span class="hero-ribbon-seg hero-seg-tm" title="Thuyết minh / Lồng tiếng">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    <span>TM</span>
                </span>
                <span class="hero-ribbon-seg hero-seg-fhd" title="Chất lượng Full HD">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    <span>${quality}</span>
                </span>
            </div>
        `;
    }

    if (heroGenres) {
        let genreHtml = '';
        if (movie.category && Array.isArray(movie.category) && movie.category.length > 0) {
            genreHtml = movie.category.slice(0, 2).map(cat => {
                const cName = cat.name || cat;
                const cSlug = cat.slug || 'phim-hot';
                return `<a href="categories.html?category=${cSlug}" class="hero-genre-pill">${cName}</a>`;
            }).join('');
        } else {
            genreHtml = `<a href="categories.html?category=chinh-kich" class="hero-genre-pill">Phim hot</a>`;
        }
        heroGenres.innerHTML = genreHtml;
        heroGenres.style.display = 'flex';
    }

    if (heroDescription) {
        if (movie.content && movie.content.trim() !== '') {
            const clean = movie.content.replace(/<[^>]*>/g, '').trim();
            heroDescription.textContent = clean.length > 220 ? clean.substring(0, 220) + '...' : clean;
        } else {
            heroDescription.textContent = 'Đang tải thông tin phim...';
        }
    }
}

function updateHeroButtons(movie) {
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    const heroInfoBtn = document.getElementById('heroInfoBtn');
    if (heroPlayBtn) heroPlayBtn.href = `watch.html?slug=${movie.slug}`;
    if (heroInfoBtn) heroInfoBtn.href = `movie-detail.html?slug=${movie.slug}`;
}

// -- Render Thumbnails Rail ---------------------------------------
function renderThumbnails(movies) {
    const container = document.getElementById('heroThumbnails');
    if (!container || !Array.isArray(movies) || movies.length === 0) return;

    container.innerHTML = movies.map((movie, i) => {
        const rawUrl = movie.thumb_url || movie.poster_url || '';
        const imgSrc = (typeof imageOptimizer !== 'undefined')
            ? imageOptimizer.optimizeImageUrl(rawUrl, 300, 75)
            : (typeof buildImageUrl === 'function' ? buildImageUrl(rawUrl, 300) : rawUrl);

        return `
        <div class="hero-thumb-item flex-shrink-0 snap-start ${i === currentSlideIndex ? 'active hero-thumb-active' : ''}"
             data-slide-index="${i}"
             role="button"
             tabindex="0"
             title="${(movie.name || '').replace(/"/g, '&quot;')}"
             onclick="selectHeroThumbnail(${i})">
            <div class="hero-thumb-poster responsive-thumb-width aspect-video rounded-md overflow-hidden bg-gray-900">
                <img
                    alt="${(movie.name || '').replace(/"/g, '&quot;')}"
                    class="w-full h-full object-cover object-center"
                    src="${imgSrc || 'https://placehold.co/300x170?text=No+Image'}"
                    data-src="${imgSrc}"
                    data-tmdb-slug="${movie.slug}"
                    data-tmdb-id="${movie.tmdb?.id || ''}"
                    data-tmdb-name="${(movie.name || '').replace(/"/g, '&quot;')}"
                    data-tmdb-year="${movie.year || ''}"
                    data-tmdb-type="backdrop"
                    onerror="this.onerror=null; if(window.autoHealMovieImage) { window.autoHealMovieImage(this, '${movie.slug}', '${(movie.name || '').replace(/'/g, "\\'")}'); } else { this.src='https://placehold.co/300x170?text=No+Image'; }"
                     />
            </div>
            <div class="hero-thumb-glow"></div>
        </div>`;
    }).join('');

    // Keyboard navigation
    container.querySelectorAll('.hero-thumb-item').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectHeroThumbnail(parseInt(el.getAttribute('data-slide-index')));
            }
        });
    });
}

function updateThumbnailActive(slideIndex) {
    const thumbItems = document.querySelectorAll('.hero-thumb-item');
    thumbItems.forEach((el, i) => {
        if (i === slideIndex) {
            el.classList.add('hero-thumb-active', 'active');
        } else {
            el.classList.remove('hero-thumb-active', 'active');
        }
    });
}

// ================================================================
// AUTO-SLIDE TIMER (3s - 10s Configurable)
// ================================================================
function initHeroAutoSlide() {
    try {
        const savedCfg = localStorage.getItem('aphim_hero_autoslide_config');
        if (savedCfg) {
            const parsed = JSON.parse(savedCfg);
            if (parsed && typeof parsed === 'object') {
                applyAutoSlideConfig(parsed, true);
            }
        }
    } catch (e) {}

    // Gắn sự kiện tạm dừng khi nhấn giữ / kéo lướt
    const heroEl = document.getElementById('desktopHeroShowcase') || document.querySelector('.desktop-hero-showcase');
    if (heroEl && !heroEl._hasAutoSlideEvents) {
        heroEl._hasAutoSlideEvents = true;

        const onUserHoldStart = () => {
            isUserHoldingOrDragging = true;
            clearAutoSlideTimer();
        };

        const onUserHoldEnd = () => {
            if (isUserHoldingOrDragging) {
                isUserHoldingOrDragging = false;
                if (autoSlideConfig.enabled) {
                    startAutoSlideTimer();
                }
            }
        };

        heroEl.addEventListener('pointerdown', onUserHoldStart, { passive: true });
        heroEl.addEventListener('touchstart', onUserHoldStart, { passive: true });
        heroEl.addEventListener('mousedown', onUserHoldStart, { passive: true });

        window.addEventListener('pointerup', onUserHoldEnd, { passive: true });
        window.addEventListener('pointercancel', onUserHoldEnd, { passive: true });
        window.addEventListener('touchend', onUserHoldEnd, { passive: true });
        window.addEventListener('mouseup', onUserHoldEnd, { passive: true });
    }

    startAutoSlideTimer();
}

function startHeroAutoSlide() {
    initHeroAutoSlide();
}

function applyAutoSlideConfig(cfg, forceRestart = false) {
    if (!cfg || typeof cfg !== 'object') return;
    const isEnabled = typeof cfg.enabled === 'boolean' ? cfg.enabled : false;
    const intervalSec = parseInt(cfg.interval, 10);
    const cleanInterval = Math.min(10, Math.max(3, !isNaN(intervalSec) ? intervalSec : 6));

    const newHash = `${isEnabled}_${cleanInterval}`;
    if (!forceRestart && newHash === lastAutoSlideConfigHash && autoSlideTimer !== null) {
        return;
    }
    lastAutoSlideConfigHash = newHash;

    autoSlideConfig.enabled = isEnabled;
    autoSlideConfig.interval = cleanInterval;

    if (autoSlideConfig.enabled) {
        startAutoSlideTimer();
    } else {
        clearAutoSlideTimer();
    }
}

function startAutoSlideTimer() {
    clearAutoSlideTimer();
    if (!autoSlideConfig.enabled || !heroSlides || heroSlides.length <= 1) return;
    if (isUserHoldingOrDragging) return;

    const delayMs = Math.min(10, Math.max(3, Number(autoSlideConfig.interval) || 6)) * 1000;
    autoSlideTimer = setTimeout(() => {
        if (!isUserHoldingOrDragging && autoSlideConfig.enabled && heroSlides.length > 1 && !isTransitioning) {
            const nextIdx = (currentSlideIndex + 1) % heroSlides.length;
            switchHeroSlide(nextIdx, false, true);
            return;
        }
        startAutoSlideTimer();
    }, delayMs);
}

function clearAutoSlideTimer() {
    if (autoSlideTimer) {
        clearTimeout(autoSlideTimer);
        autoSlideTimer = null;
    }
}

// ================================================================
// SWIPE / DRAG TOUCH HANDLER
// ================================================================
function attachSwipeHandler() {
    const heroEl = document.getElementById('desktopHeroShowcase') || document.querySelector('.desktop-hero-showcase');
    if (!heroEl || heroEl._hasSwipeAttached) return;
    heroEl._hasSwipeAttached = true;

    let startX = 0;
    let startY = 0;
    let isDragging = false;
    const SWIPE_THRESHOLD = 45;

    heroEl.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, button, .hero-thumb-item, .interests-section, input')) return;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
        clearAutoSlideTimer();
    });

    heroEl.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx) * 0.85) {
            startAutoSlideTimer();
            return;
        }

        if (dx < 0) {
            switchHeroSlide((currentSlideIndex + 1) % heroSlides.length);
        } else {
            switchHeroSlide((currentSlideIndex - 1 + heroSlides.length) % heroSlides.length);
        }
    });

    heroEl.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            startAutoSlideTimer();
        }
    });
}

// -- Preload Images -----------------------------------------------
function preloadSlideImages(movies) {
    if (!Array.isArray(movies)) return;
    setTimeout(() => {
        movies.forEach((movie) => {
            const rawUrl = getHeroImageUrl(movie);
            if (rawUrl) {
                const url = buildImageUrl(rawUrl, 1400);
                if (url) {
                    const img = new Image();
                    img.src = url;
                }
            }
        });
    }, 400);
}

// -- Initial Render -----------------------------------------------
function renderHeroBannerContent(movie, isInstant) {
    updateHeroBannerText(movie);
    updateHeroButtons(movie);
    setupHeroActions(movie);
    fetchLatestEpisodeCount(movie);

    const layerA = document.getElementById('heroImageLayerA');
    const layerB = document.getElementById('heroImageLayerB');
    const heroImage = document.getElementById('heroImage');
    const placeholder = document.getElementById('heroPlaceholder') || document.querySelector('.hero-placeholder-mask');

    if (placeholder && movie) {
        const rawPlaceholderUrl = getHeroImageUrl(movie);
        const optPlaceholderUrl = buildImageUrl(rawPlaceholderUrl, 600);
        if (optPlaceholderUrl) {
            placeholder.style.backgroundImage = `url('${optPlaceholderUrl}')`;
            placeholder.style.opacity = '0.35';
        }
    }

    const rawUrl = getHeroImageUrl(movie);
    const optUrl = buildImageUrl(rawUrl, 1400);

    const finalUrl = optUrl || rawUrl;
    if (layerA) {
        if (finalUrl) layerA.src = finalUrl;
        layerA.style.opacity = '1';
        layerA.style.transform = 'translateZ(0) scale(1)';
    }
    if (layerB) {
        layerB.style.opacity = '0';
    }

    if (heroImage) {
        heroImage.fetchPriority = 'high';
        heroImage.loading = 'eager';
        heroImage.decoding = 'async';
        heroImage.onerror = () => {
            const fallbackUrl = rawUrl.startsWith('http') ? rawUrl : `https://phimimg.com/${rawUrl.startsWith('uploads/') ? '' : 'uploads/movies/'}${rawUrl}`;
            if (heroImage.src !== fallbackUrl) heroImage.src = fallbackUrl;
        };
        if (optUrl) {
            heroImage.setAttribute('data-current-src', optUrl);
            heroImage.src = optUrl;
        } else if (rawUrl) {
            heroImage.src = rawUrl;
        }
    }
}

// -- Fetch Real Episodes ------------------------------------------
async function fetchLatestEpisodeCount(movie) {
    if (!movie?.slug) return;
    try {
        const ophimRes = await fetch(`https://phimapi.com/phim/${movie.slug}`);
        if (ophimRes.ok) {
            const ophimData = await ophimRes.json();
            const item = ophimData?.movie || ophimData?.data?.item;
            const eps = ophimData?.episodes || item?.episodes;
            if (!item) return;

            const rawContent = item.content || item.description || '';
            if (rawContent) {
                const cleanContent = rawContent.replace(/<[^>]*>/g, '').trim();
                const heroDescription = document.getElementById('heroDescription');
                if (heroDescription && cleanContent) {
                    heroDescription.textContent = cleanContent.length > 220 
                        ? cleanContent.substring(0, 220) + '...'
                        : cleanContent;
                }
            }

            let latestEpLabel = item.episode_current || '';
            if (Array.isArray(eps) && eps.length > 0) {
                const serverData = eps[0]?.server_data;
                if (Array.isArray(serverData) && serverData.length > 0) {
                    const count = serverData.length;
                    const lcLabel = (latestEpLabel || '').toLowerCase().trim();
                    if (item.type === 'single' || lcLabel.includes('full') || lcLabel.includes('hoàn tất')) {
                        latestEpLabel = 'Full';
                    } else {
                        latestEpLabel = `Tập ${count}`;
                    }
                }
            }
            if (latestEpLabel) {
                const badge = document.querySelector('#heroBadges [data-ep-badge] span');
                if (badge) {
                    badge.textContent = latestEpLabel.toLowerCase().includes('tập') || latestEpLabel.toLowerCase().includes('full') 
                        ? latestEpLabel 
                        : `Tập ${latestEpLabel}`;
                }
            }
        }
    } catch (e) {}
}

// -- Favorite Action ----------------------------------------------
function setupHeroActions(movie) {
    const favBtn = document.getElementById('heroFavBtn');
    const infoBtn = document.getElementById('heroInfoBtn');

    if (!movie) return;
    if (infoBtn) infoBtn.href = `movie-detail.html?slug=${movie.slug}`;

    if (favBtn && typeof userService !== 'undefined') {
        const updateFavUI = () => {
            const isFav = userService.isFavorite(movie.slug);
            const svg = favBtn.querySelector('svg');
            const path = favBtn.querySelector('path');
            if (svg && path) {
                if (isFav) {
                    svg.setAttribute('fill', '#ef4444');
                    svg.style.color = '#ef4444';
                    path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
                } else {
                    svg.setAttribute('fill', 'none');
                    svg.style.color = '#ffffff';
                    path.setAttribute('d', 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z');
                }
            }
        };

        updateFavUI();

        favBtn.onclick = (e) => {
            e.preventDefault();
            if (typeof authService !== 'undefined' && !authService.isLoggedIn()) {
                if (typeof showAuthModal === 'function') showAuthModal('login');
                else alert('Vui lòng đăng nhập để lưu phim yêu thích');
                return;
            }
            if (userService.isFavorite(movie.slug)) {
                userService.removeFromFavorites(movie.slug);
                if (typeof showNotification === 'function') showNotification('Đã xóa khỏi danh sách yêu thích', 'info');
            } else {
                userService.addToFavorites({ slug: movie.slug, name: movie.name, thumb_url: movie.thumb_url, year: movie.year || '' });
                if (typeof showNotification === 'function') showNotification('Đã thêm vào danh sách yêu thích', 'success');
            }
            updateFavUI();
        };
    }
}

// -- Global Window Exports ----------------------------------------
window.selectHeroThumbnail = function(idx) {
    switchHeroSlide(idx);
};
window.switchHeroSlide = switchHeroSlide;
window.loadHeroBanner = loadHeroBanner;

// -- Boot ---------------------------------------------------------
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeroBanner);
} else {
    loadHeroBanner();
}

window.addEventListener('storage', (e) => {
    if (e.key === 'aphim_hero_desktop_config' || e.key === 'cinestream_active_banner' || e.key === 'aphim_hero_autoslide_config') {
        loadHeroBanner();
    }
});
