/**
 * APhim — Nav Instant Search Suggestion  v2
 * ─────────────────────────────────────────────────────────────
 * • Desktop (.nav-search-v2): show up to 5 results in a panel
 * • Mobile (.mobile-inline-search-input): show 1 result card
 *
 * Logic:
 *  - Enter key / form submit → always goes to search.html?q=… (unchanged)
 *  - Clicking a suggestion → navigates directly to movie-detail.html?slug=…
 *  - Blur / Escape / click-outside → hides panel
 */
(function () {
    'use strict';

    // ── CSS ─────────────────────────────────────────────────────────────────────
    const STYLE = `
        /* ── Shared panel container ── */
        .ap-suggest-panel {
            position: fixed;
            z-index: 999999;
            background: rgba(10, 10, 16, 0.97);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            overflow: hidden;
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
            transform: translateY(-8px) scale(0.98);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s cubic-bezier(.4,0,.2,1),
                        transform 0.2s cubic-bezier(.4,0,.2,1);
        }
        .ap-suggest-panel.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        /* ── Each suggestion row ── */
        .ap-suggest-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 9px 14px;
            text-decoration: none;
            cursor: pointer;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            transition: background 0.15s ease;
        }
        .ap-suggest-row:last-child {
            border-bottom: none;
        }
        .ap-suggest-row:hover,
        .ap-suggest-row:focus {
            background: rgba(255,255,255,0.06);
            outline: none;
        }
        .ap-suggest-row:hover .ap-suggest-title {
            color: #f2f20d;
        }

        /* ── Thumbnail ── */
        .ap-suggest-thumb {
            width: 38px;
            height: 54px;
            border-radius: 7px;
            object-fit: cover;
            flex-shrink: 0;
            background: #1a1a24;
        }

        /* ── Text block ── */
        .ap-suggest-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .ap-suggest-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.15s;
        }
        .ap-suggest-en {
            font-size: 11.5px;
            color: rgba(255,255,255,0.35);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ap-suggest-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 20px;
            background: rgba(242,242,13,0.1);
            color: #f2f20d;
            border: 1px solid rgba(242,242,13,0.18);
            width: fit-content;
            margin-top: 1px;
        }

        /* ── "View all" footer row ── */
        .ap-suggest-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 9px 14px;
            font-size: 12px;
            font-weight: 700;
            color: rgba(255,255,255,0.3);
            letter-spacing: 0.04em;
            border-top: 1px solid rgba(255,255,255,0.06);
            text-decoration: none;
            cursor: pointer;
            transition: color 0.15s, background 0.15s;
        }
        .ap-suggest-footer:hover {
            color: #f2f20d;
            background: rgba(255,255,255,0.04);
        }

        /* ── Separator accent line at top ── */
        .ap-suggest-panel::before {
            content: '';
            display: block;
            height: 2px;
            background: linear-gradient(90deg, transparent 5%, rgba(242,242,13,0.35) 50%, transparent 95%);
        }
    `;

    function injectCSS() {
        if (document.getElementById('ap-nav-suggest-css')) return;
        const s = document.createElement('style');
        s.id = 'ap-nav-suggest-css';
        s.textContent = STYLE;
        document.head.appendChild(s);
    }

    // ── API ──────────────────────────────────────────────────────────────────────
    function getOphimBase() {
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG.OPHIM_URL) return API_CONFIG.OPHIM_URL;
        return 'https://ophim1.com/v1/api';
    }

    const IMG_CDN = 'https://img.ophim.live/uploads/movies/';

    // Proxy qua wsrv.nl để resize ngay về 38x54 WebP → tải cực nhanh
    function buildImgSrc(thumb) {
        if (!thumb) return '';
        const full = thumb.startsWith('http') ? thumb : IMG_CDN + thumb;
        return `https://wsrv.nl/?url=${encodeURIComponent(full)}&w=114&h=162&fit=cover&output=webp&q=100`;
    }

    async function fetchMovies(keyword, limit) {
        try {
            const base = getOphimBase();
            const url = `${base}/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=1`;
            const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = ctrl ? setTimeout(() => ctrl.abort(), 5000) : null;
            const res = await fetch(url, ctrl ? { signal: ctrl.signal } : {});
            if (timer) clearTimeout(timer);
            if (!res.ok) return [];
            const data = await res.json();
            return data?.data?.items || [];
        } catch {
            return [];
        }
    }

    // ── Determine how many results to show based on the input type ──────────────
    // isMobile = true  → 1 result
    // isMobile = false → 5 results
    function isMobileInput(input) {
        return input.classList.contains('mobile-inline-search-input') ||
               !!input.closest('.mobile-inline-search');
    }

    // ── Build one row HTML ───────────────────────────────────────────────────────
    function buildRow(movie) {
        const thumb = buildImgSrc(movie.thumb_url || movie.poster_url);
        const title = (movie.name || '').replace(/</g, '&lt;');
        const enTitle = (movie.origin_name || '').replace(/</g, '&lt;');
        const badge = movie.year || movie.episode_current || 'HD';
        const slug = encodeURIComponent(movie.slug || '');
        return `
            <a class="ap-suggest-row" href="movie-detail.html?slug=${slug}" tabindex="-1">
                <img class="ap-suggest-thumb"
                     src="${thumb}" alt="${title}"
                     loading="eager" fetchpriority="high" decoding="async"
                     onerror="this.src='https://placehold.co/38x54/111/444?text=?'">
                <div class="ap-suggest-info">
                    <div class="ap-suggest-title">${title}</div>
                    ${enTitle && enTitle !== title ? `<div class="ap-suggest-en">${enTitle}</div>` : ''}
                    <div class="ap-suggest-badge">${badge}</div>
                </div>
            </a>`;
    }

    // ── Per-input instance ───────────────────────────────────────────────────────
    function attachSuggest(input) {
        const mobile = isMobileInput(input);
        const maxResults = 5;

        // Panel is appended to BODY — escapes any overflow:hidden parent
        const panel = document.createElement('div');
        panel.className = 'ap-suggest-panel';
        document.body.appendChild(panel);

        function positionPanel() {
            const rect = input.getBoundingClientRect();
            panel.style.left   = rect.left + 'px';
            panel.style.top    = (rect.bottom + 6) + 'px';
            panel.style.width  = rect.width + 'px';
            panel.style.minWidth = Math.max(rect.width, 280) + 'px';
        }

        let debounceTimer = null;
        let hideTimer     = null;
        let lastKeyword   = '';
        let lastQ         = '';   // raw keyword for "View all" link

        function show(movies, keyword) {
            if (!movies.length) { hide(true); return; }
            lastQ = keyword;

            let html = movies.map(buildRow).join('');

            // "View all results" footer — navigates to search.html?q=…
            html += `<a class="ap-suggest-footer"
                        href="search.html?q=${encodeURIComponent(keyword)}"
                        tabindex="-1">
                        <span class="material-icons-round" style="font-size:14px;">search</span>
                        Xem tất cả kết quả cho "${keyword.length > 20 ? keyword.slice(0,20)+'…' : keyword}"
                    </a>`;

            panel.innerHTML = html;

            // Prevent mousedown from stealing focus from input
            panel.querySelectorAll('.ap-suggest-row, .ap-suggest-footer').forEach(el => {
                el.addEventListener('mousedown', e => e.preventDefault());
                el.addEventListener('click', () => { panel.classList.remove('visible'); });
            });

            positionPanel();
            requestAnimationFrame(() => panel.classList.add('visible'));
        }

        function hide(instant) {
            clearTimeout(hideTimer);
            if (instant) { panel.classList.remove('visible'); return; }
            hideTimer = setTimeout(() => panel.classList.remove('visible'), 180);
        }

        async function onKeyword(kw) {
            const trimmed = kw.trim();
            if (!trimmed || trimmed.length < 2) { hide(true); lastKeyword = ''; return; }
            if (trimmed === lastKeyword && panel.classList.contains('visible')) return;
            lastKeyword = trimmed;

            const movies = await fetchMovies(trimmed, maxResults);
            // Guard: only apply if the input value hasn't changed while fetching
            if (input.value.trim() === trimmed) {
                show(movies, trimmed);
            }
        }

        // ── Event listeners ──────────────────────────────────────────────────────
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const v = input.value.trim();
            if (!v || v.length < 2) { hide(true); lastKeyword = ''; return; }
            debounceTimer = setTimeout(() => onKeyword(v), 180);
        });

        input.addEventListener('focus', () => {
            if (input.value.trim().length >= 2 && panel.innerHTML) {
                clearTimeout(hideTimer);
                positionPanel();
                panel.classList.add('visible');
            }
        });

        input.addEventListener('blur', () => hide(false));

        // Enter / form submit → always go to search.html (DO NOT intercept)
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') { hide(true); input.blur(); }
            // Enter falls through to native form submit → search.html?q=…
        });

        // Click OR touch outside → hide panel + reset input completely
        function onOutside(e) {
            if (!panel.contains(e.target) && e.target !== input) {
                hide(true);
                input.value = '';
                lastKeyword = '';
            }
        }
        document.addEventListener('click', onOutside, true);
        document.addEventListener('touchstart', onOutside, { capture: true, passive: true });

        // Keep panel aligned on scroll / resize
        window.addEventListener('scroll',
            () => { if (panel.classList.contains('visible')) positionPanel(); },
            { passive: true });
        window.addEventListener('resize',
            () => { if (panel.classList.contains('visible')) positionPanel(); },
            { passive: true });
    }

    // ── Bootstrap ────────────────────────────────────────────────────────────────
    function init() {
        injectCSS();

        // Desktop search bar
        document.querySelectorAll('.nav-search-v2').forEach(form => {
            const inp = form.querySelector('input[type="text"], input:not([type])');
            if (inp && !inp.dataset.apSuggest) {
                inp.dataset.apSuggest = '1';
                attachSuggest(inp);
            }
        });

        // Mobile inline search bar
        document.querySelectorAll('.mobile-inline-search-input, .mobile-inline-search input').forEach(inp => {
            if (!inp.dataset.apSuggest) {
                inp.dataset.apSuggest = '1';
                attachSuggest(inp);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-init for late-injected navs
    window.addEventListener('load', () => {
        document.querySelectorAll(
            '.nav-search-v2 input:not([data-ap-suggest]), .mobile-inline-search-input:not([data-ap-suggest])'
        ).forEach(inp => {
            if (!inp.dataset.apSuggest) {
                inp.dataset.apSuggest = '1';
                attachSuggest(inp);
            }
        });
    });

    window.initNavInstantSuggest = init;
})();
