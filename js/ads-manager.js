/**
 * ads-manager.js
 * Production Ad System — Kiểu phimmoii.so
 * Mọi click đều chuyển sang https://dt086.com/
 * Ưu tiên file GIF, responsive Desktop/Mobile
 */
(function () {
    const DEST = "https://dt086.com/";
    
    // === ASSET MAP ===
    // Mỗi chiến dịch có đủ kích cỡ: leaderboard (970x90), tablet (728x90),
    // mobile small (320x50), mobile medium (320x100), skyscraper (300x600)
    const CAMPAIGNS = [
        {
            base: "quangcao/n%E1%BB%99i%20dung%201/",
            lg:  "Th%C3%A0nh-vi%C3%AAn-m%E1%BB%9Bi-t%E1%BA%B7ng-10USDT-970x90.gif",
            md:  "Th%C3%A0nh-vi%C3%AAn-m%E1%BB%9Bi-t%E1%BA%B7ng-10USDT-728x90p.gif",
            sm:  "Th%C3%A0nh-vi%C3%AAn-m%E1%BB%9Bi-t%E1%BA%B7ng-10USDT-320x50.gif",
            smr: "Th%C3%A0nh-vi%C3%AAn-m%E1%BB%9Bi-t%E1%BA%B7ng-10USDT---320x100.gif",
            sky: "Th%C3%A0nh-vi%C3%AAn-m%E1%BB%9Bi-t%E1%BA%B7ng-10USDT-300x600.gif"
        },
        {
            base: "quangcao/n%E1%BB%99i%20dung%202/",
            lg:  "2-N%E1%BA%A1p-%C4%91%E1%BA%A7u-100T-t%E1%BA%B7ng-100T-970x90p.gif",
            md:  "2-N%E1%BA%A1p-%C4%91%E1%BA%A7u-100T-t%E1%BA%B7ng-100T-728x90.gif",
            sm:  "2-N%E1%BA%A1p-%C4%91%E1%BA%A7u-100T-t%E1%BA%B7ng-100T-320x50.gif",
            smr: "2-N%E1%BA%A1p-%C4%91%E1%BA%A7u-100T-t%E1%BA%B7ng-100T-320x100.gif",
            sky: "2-N%E1%BA%A1p-%C4%91%E1%BA%A7u-100T-t%E1%BA%B7ng-100T-300x600.gif"
        },
        {
            base: "quangcao/n%E1%BB%99i%20dung%203/",
            lg:  "3-N%E1%BA%A1p-%C4%91%E1%BA%A7u-10-t%E1%BA%B7ng-15T-970x90.gif",
            md:  "3-N%E1%BA%A1p-%C4%91%E1%BA%A7u-10-t%E1%BA%B7ng-15T-728x90.gif",
            sm:  "3-N%E1%BA%A1p-%C4%91%E1%BA%A7u-10-t%E1%BA%B7ng-15T-320x50.gif",
            smr: "3-N%E1%BA%A1p-%C4%91%E1%BA%A7u-10-t%E1%BA%B7ng-15T-320x100.gif",
            sky: "3-N%E1%BA%A1p-%C4%91%E1%BA%A7u-10-t%E1%BA%B7ng-15T-300x600.gif"
        }
    ];

    function pick() { return CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)]; }
    function img(c, key, extraStyle) {
        return `<img src="${c.base}${c[key]}" loading="lazy" style="display:block;width:100%;height:auto;${extraStyle||''}">`;
    }
    function link(inner) {
        return `<a href="${DEST}" target="_blank" rel="noopener nofollow" style="display:block;">${inner}</a>`;
    }

    // === STYLES ===
    const CSS = `
    .adm-reset { margin:0; padding:0; box-sizing:border-box; }

    /* Popup */
    #adm-popup-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,.82);
        z-index:100000; display:flex; align-items:center; justify-content:center;
        padding:12px; opacity:0; transition:opacity .3s; pointer-events:none;
    }
    #adm-popup-overlay.show { opacity:1; pointer-events:auto; }
    #adm-popup-box { position:relative; max-width:340px; width:100%; }
    #adm-popup-close {
        position:absolute; top:-40px; right:0;
        background:#e53935; color:#fff; font:bold 13px/1 sans-serif;
        padding:8px 16px; border-radius:6px; cursor:pointer;
        box-shadow:0 4px 14px rgba(229,57,53,.55);
    }
    #adm-popup-close:hover { background:#c62828; }

    /* Top Leaderboard Bar */
    #adm-top {
        width:100%; text-align:center;
        background:#0f111a; position:relative;
        padding:6px 0 28px;
    }
    #adm-top-inner { display:inline-block; max-width:970px; width:100%; }
    #adm-top-close {
        position:absolute; bottom:-1px; left:50%; transform:translateX(-50%);
        background:#e53935; color:#fff; font:bold 11px/1 sans-serif;
        padding:5px 18px; border-radius:0 0 8px 8px; cursor:pointer;
        box-shadow:0 3px 8px rgba(0,0,0,.4);
    }
    #adm-top-close:hover { background:#c62828; }

    /* Catfish (2×2 grid sticky bottom) */
    #adm-catfish {
        position:fixed; bottom:0; left:0; width:100%; z-index:99999;
        background:#111; transform:translateY(110%);
        transition:transform .45s cubic-bezier(.2,.8,.2,1);
    }
    #adm-catfish.show { transform:translateY(0); }
    #adm-catfish-close {
        position:absolute; top:-32px; left:50%; transform:translateX(-50%);
        background:#e53935; color:#fff; font:bold 11px/1 sans-serif;
        padding:5px 20px; border-radius:8px 8px 0 0; cursor:pointer;
        box-shadow:0 -3px 8px rgba(0,0,0,.4);
    }
    #adm-catfish-close:hover { background:#c62828; }
    #adm-catfish-grid {
        display:grid; grid-template-columns:1fr 1fr;
        max-width:970px; margin:0 auto; gap:2px;
    }

    /* In-Feed 2×2 block */
    .adm-infeed { width:100%; max-width:970px; margin:20px auto; padding:0 12px; }
    .adm-infeed-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px; }
    .adm-single { width:100%; max-width:970px; margin:20px auto; padding:0 12px; text-align:center; }

    /* Mobile */
    .adm-desktop { display:block!important; }
    .adm-mobile  { display:none!important; }
    @media(max-width:639px) {
        .adm-desktop { display:none!important; }
        .adm-mobile  { display:block!important; }
        #adm-catfish-grid { grid-template-columns:1fr 1fr; }
        #adm-popup-box { max-width:290px; }
    }
    `;

    // === BUILD 2×2 tile from 4 random campaigns ===
    function twoByTwo() {
        const cells = [pick(), pick(), pick(), pick()];
        return cells.map(c => `
            <div>
                ${link(`
                    <span class="adm-desktop">${img(c, 'md')}</span>
                    <span class="adm-mobile">${img(c, 'smr')}</span>
                `)}
            </div>
        `).join('');
    }

    function init() {
        // Inject CSS
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        // ─── 1. POPUP MODAL ───────────────────────────────────────────
        const popupC = pick();
        const overlay = document.createElement('div');
        overlay.id = 'adm-popup-overlay';
        overlay.innerHTML = `
            <div id="adm-popup-box">
                <div id="adm-popup-close">Đóng QC ✕</div>
                ${link(`<span class="adm-desktop">${img(popupC, 'sky')}</span>
                         <span class="adm-mobile">${img(popupC, 'sky')}</span>`)}
            </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('show'), 700);
        overlay.querySelector('#adm-popup-close').onclick = () => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 350);
        };

        // ─── 2. TOP LEADERBOARD ───────────────────────────────────────
        const topC = pick();
        const topBar = document.createElement('div');
        topBar.id = 'adm-top';
        topBar.innerHTML = `
            <div id="adm-top-inner">
                ${link(`<span class="adm-desktop">${img(topC, 'lg')}</span>
                         <span class="adm-mobile">${img(topC, 'smr')}</span>`)}
            </div>
            <div id="adm-top-close">Tắt QC ✕</div>`;
        // Insert right after <header> or <nav> or at top of body
        const anchor = document.querySelector('header') || document.querySelector('nav');
        if (anchor) {
            anchor.parentNode.insertBefore(topBar, anchor.nextSibling);
        } else {
            document.body.prepend(topBar);
        }
        topBar.querySelector('#adm-top-close').onclick = () => {
            topBar.style.display = 'none';
        };

        // ─── 3. CATFISH 2×2 STICKY BOTTOM ────────────────────────────
        const catfish = document.createElement('div');
        catfish.id = 'adm-catfish';
        catfish.innerHTML = `
            <div id="adm-catfish-close">Tắt QC ✕</div>
            <div id="adm-catfish-grid">${twoByTwo()}</div>`;
        document.body.appendChild(catfish);
        setTimeout(() => catfish.classList.add('show'), 1500);
        catfish.querySelector('#adm-catfish-close').onclick = () => {
            catfish.classList.remove('show');
            setTimeout(() => catfish.remove(), 450);
        };

        // ─── 4. IN-FEED ADS (chèn giữa các hàng phim) ────────────────
        // Kiểu phimmoii.so: sau mỗi khối danh sách phim, thả 1 block 2×2
        function makeInFeed() {
            const w = document.createElement('div');
            w.className = 'adm-infeed';
            w.innerHTML = `<div class="adm-infeed-grid">${twoByTwo()}</div>`;
            return w;
        }
        function makeSingle() {
            const c = pick();
            const w = document.createElement('div');
            w.className = 'adm-single';
            w.innerHTML = link(`
                <span class="adm-desktop">${img(c, 'lg', 'max-width:970px;border-radius:6px;')}</span>
                <span class="adm-mobile">${img(c, 'smr', 'border-radius:6px;')}</span>`);
            return w;
        }

        // Target: sections / movie grids / phân trang / player block
        const allSections = Array.from(document.querySelectorAll(
            'section, #dynamicSections > div, .movie-section, .grid-section, [data-section]'
        ));

        // Sau mỗi 2 section, chèn 1 khối infeed
        allSections.forEach((sec, i) => {
            if ((i + 1) % 2 === 0 && sec.parentNode) {
                sec.parentNode.insertBefore(makeInFeed(), sec.nextSibling);
            }
        });

        // Dưới player (trang xem phim)
        const player = document.getElementById('playerContainer') 
                     || document.querySelector('.player-wrapper')
                     || document.querySelector('.aspect-video');
        if (player && player.parentNode) {
            player.parentNode.insertBefore(makeInFeed(), player.nextSibling);
        }

        // Trên phân trang (danh sách/tìm kiếm)
        const pagination = document.getElementById('pagination') 
                         || document.querySelector('[id*="pagination"]');
        if (pagination && pagination.parentNode) {
            pagination.parentNode.insertBefore(makeSingle(), pagination);
        }

        // Cuối main — bao giờ cũng có ít nhất 1 block dưới cùng
        const mainEnd = document.querySelector('main') || document.querySelector('#app') || document.body;
        if (mainEnd) mainEnd.appendChild(makeSingle());
    }

    // ─── BOOT ─────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
