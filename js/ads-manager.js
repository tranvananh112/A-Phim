/**
 * ads-manager.js  — Production Ad System
 * Inspired by phimmoii.so layout patterns
 * All clicks → https://dt086.com/
 */
(function () {
    const DEST = "https://dt086.com/";

    // Clean ASCII paths — 3 campaigns rotating randomly
    // sky: Đã thay từ banner-300x600.gif → banner-1920x1080.jpg
    const CAMPAIGNS = [
        { base: "quangcao/c1/", lg: "banner-970x90.gif", md: "banner-728x90.gif", sm: "banner-320x50.gif", smr: "banner-320x100.gif", sky: "banner-1920x1080.jpg" },
        { base: "quangcao/c2/", lg: "banner-970x90.gif", md: "banner-728x90.gif", sm: "banner-320x50.gif", smr: "banner-320x100.gif", sky: "banner-300x600.gif" },
        { base: "quangcao/c3/", lg: "banner-970x90.gif", md: "banner-728x90.gif", sm: "banner-320x50.gif", smr: "banner-320x100.gif", sky: "banner-300x600.gif" }
    ];

    function pick() { return CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)]; }

    function adLink(desktopSrc, mobileSrc, extraStyle) {
        return `<a href="${DEST}" target="_blank" rel="noopener nofollow" style="display:block;text-align:center;">
            <img src="${desktopSrc}" style="display:block;max-width:100%;height:auto;${extraStyle || ''}" class="adm-desktop">
            <img src="${mobileSrc}"  style="display:block;max-width:100%;height:auto;${extraStyle || ''}" class="adm-mobile">
        </a>`;
    }

    function tileCell(c) {
        return `<div style="overflow:hidden;">${adLink(c.base + c.md, c.base + c.smr)}</div>`;
    }

    function twoByTwo() {
        return `<div class="adm-2x2">${tileCell(pick())}${tileCell(pick())}${tileCell(pick())}${tileCell(pick())}</div>`;
    }

    // Custom 2x2 with specific campaign order: c3, c3, c1, c2
    function twoByTwoCustom() {
        return `<div class="adm-2x2">${tileCell(CAMPAIGNS[2])}${tileCell(CAMPAIGNS[2])}${tileCell(CAMPAIGNS[0])}${tileCell(CAMPAIGNS[1])}</div>`;
    }

    // ── CSS ─────────────────────────────────────────────────────────
    const CSS = `
        .adm-desktop { display:block !important; }
        .adm-mobile  { display:none  !important; }
        @media(max-width:639px){
            .adm-desktop { display:none  !important; }
            .adm-mobile  { display:block !important; }
        }
        .adm-2x2 {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:3px;
            width:100%;
            max-width:970px;
            margin:0 auto;
        }
        #adm-popup-overlay {
            position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:999999;
            display:flex; align-items:center; justify-content:center; padding:12px;
            opacity:0; transition:opacity .15s ease-out; pointer-events:none;
        }
        #adm-popup-overlay.show { opacity:1; pointer-events:auto; }
        #adm-popup-box { position:relative; max-width:320px; width:100%; }
        @media(min-width:640px){ #adm-popup-box { max-width:420px; } }
        #adm-popup-close {
            position:absolute; top:-42px; right:0;
            background:#e53935; color:#fff; font:bold 13px/1 sans-serif;
            padding:9px 20px; border-radius:8px; cursor:pointer;
            box-shadow:0 4px 14px rgba(229,57,53,.55); z-index:10;
        }
        #adm-catfish {
            position:fixed; bottom:0; left:50%;
            z-index:99998; background:transparent;
            width:fit-content;
            transform:translateX(-50%) translateY(120%);
            transition:transform .2s cubic-bezier(.2,.8,.2,1);
        }
        #adm-catfish.show { transform:translateX(-50%) translateY(0); }
        #adm-catfish-close {
            position:absolute; top:-32px; left:50%; transform:translateX(-50%);
            background:#e53935; color:#fff; font:bold 11px/1 sans-serif;
            padding:5px 22px; border-radius:8px 8px 0 0; cursor:pointer;
            white-space:nowrap; box-shadow:0 -3px 8px rgba(0,0,0,.4);
        }
        #adm-catfish-inner { width:fit-content; margin:0 auto; }
        .adm-infeed    { width:100%; max-width:970px; margin:18px auto; padding:0 10px; }
        .adm-leaderboard { width:100%; max-width:970px; margin:16px auto; padding:0 10px; text-align:center; }
    `;

    function init() {
        // Inject styles
        const s = document.createElement('style');
        s.textContent = CSS;
        document.head.appendChild(s);

        // ── 1. POPUP MODAL ──────────────────────────────────────────
        // Use the 1920x1080 landscape JPG from c1 — most impactful for full-screen overlay
        const overlay = document.createElement('div');
        overlay.id = 'adm-popup-overlay';
        overlay.innerHTML = `<div id="adm-popup-box">
            <div id="adm-popup-close">Đóng QC ✕</div>
            <a href="${DEST}" target="_blank" rel="noopener nofollow" style="display:block;">
                <img src="quangcao/c1/banner-1920x1080.jpg" style="display:block;width:100%;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.7);">
            </a>
        </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('show'), 200);
        overlay.querySelector('#adm-popup-close').onclick = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 150);
        };

        // ── 2. TOP LEADERBOARD BAR ──────────────────────────────────
        // ĐÃ XÓA: Banner 320x100 trên header theo yêu cầu

        // ── 3. CATFISH 2×2 STICKY BOTTOM ────────────────────────────
        const catfish = document.createElement('div');
        catfish.id = 'adm-catfish';
        catfish.innerHTML = `
            <div id="adm-catfish-close">Tắt QC ✕</div>
            <div id="adm-catfish-inner">${twoByTwo()}</div>`;
        document.body.appendChild(catfish);
        setTimeout(() => catfish.classList.add('show'), 400);
        catfish.querySelector('#adm-catfish-close').onclick = () => {
            catfish.style.transform = 'translateX(-50%) translateY(120%)';
            setTimeout(() => catfish.remove(), 200);
        };

        // ── 4. IN-FEED BLOCKS after every 2 major sections ─────────
        const sections = Array.from(document.querySelectorAll(
            'section, #dynamicSections > div, .movie-section, [data-section], .py-8, .py-12'
        ));
        sections.forEach((sec, i) => {
            // Skip inserting ad after "Top Bình Luận" section
            if (sec.id === 'top-comments-section') {
                return;
            }

            if ((i + 1) % 2 === 0 && sec.parentNode) {
                const block = document.createElement('div');
                block.className = 'adm-infeed';
                // Use custom order (c3, c3, c1, c2) for the first in-feed block
                block.innerHTML = (i === 1) ? twoByTwoCustom() : twoByTwo();
                sec.parentNode.insertBefore(block, sec.nextSibling);
            }
        });

        // ── 5. BELOW VIDEO PLAYER ────────────────────────────────────
        const player = document.getElementById('playerContainer')
            || document.querySelector('.player-wrapper')
            || document.querySelector('iframe[src*="player"]');
        if (player && player.parentNode) {
            const block = document.createElement('div');
            block.className = 'adm-infeed';
            block.innerHTML = twoByTwo();
            player.parentNode.insertBefore(block, player.nextSibling);
        }

        // ── 6. ABOVE PAGINATION ──────────────────────────────────────
        const pager = document.getElementById('pagination')
            || document.querySelector('[id*="pagination"]');
        if (pager && pager.parentNode) {
            const block = document.createElement('div');
            block.className = 'adm-leaderboard';
            const lc = pick();
            block.innerHTML = adLink(lc.base + lc.lg, lc.base + lc.sm, 'border-radius:6px;');
            pager.parentNode.insertBefore(block, pager);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
