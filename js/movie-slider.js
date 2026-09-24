/**
 * Movie Slider - Drag to Scroll + Wheel to Horizontal
 * Works on all horizontal sliders across the site (Desktop + Mobile)
 * Supports:
 * - Mouse drag-to-scroll with natural inertia
 * - Wheel-to-horizontal scrolling (convert mouse wheel to horizontal scroll when hovering sliders)
 * - Touch swipe guard
 * - Intercepts clicks if user dragged to avoid unwanted page transitions
 * - Dynamic mutation observer to automatically attach to newly rendered slider cards
 */
(function() {
    'use strict';

    const DRAG_THRESHOLD = 8; // px - minimum distance to consider it a drag/swipe

    const SLIDER_SELECTORS = [
        '#slider-de-cu',
        '.de-cu-slider',
        '.interests-wrapper',
        '#homeCommentsTrack',
        '.home-comments-track',
        '#heroThumbnails',
        '.tc-featured-wrapper',
        '.overflow-x-auto',
        '.snap-x',
        '.scrollbar-hide',
        '.mobile-thumb-wrapper',
        '.cat-tab-container'
    ].join(', ');

    // -- DRAG & SWIPE & WHEEL TO SCROLL --
    function initSliderDrag(slider) {
        if (!slider || slider.dataset.sliderDragAttached) return;
        slider.dataset.sliderDragAttached = 'true';

        let isDown = false;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let hasDragged = false;
        let lockVertical = false;

        // Quán tính (Inertia)
        let lastX = 0;
        let lastTime = 0;
        let velocity = 0;
        let rafId = null;

        // --- MOUSE EVENTS (Desktop Drag-to-Scroll) ---
        slider.addEventListener('mousedown', function(e) {
            // Ignore if middle/right click
            if (e.button !== 0) return;
            // Ignore if clicked on navigation buttons or interactive controls
            if (e.target.closest('button, .home-comments-scroll-btn, .comment-switch')) return;

            isDown = true;
            hasDragged = false;
            lockVertical = false;
            slider.classList.add('active', 'is-dragging');

            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;

            lastX = e.pageX;
            lastTime = Date.now();
            velocity = 0;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });

        // Global mouseup to prevent stuck drag
        window.addEventListener('mouseup', function() {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('active', 'is-dragging');
            lockVertical = false;

            if (hasDragged) {
                slider.setAttribute('data-dragged', 'true');
                setTimeout(function() {
                    slider.removeAttribute('data-dragged');
                }, 300);

                // Thực hiện lướt quán tính mượt mà
                if (Math.abs(velocity) > 0.1) {
                    let tempVelocity = velocity;
                    const inertiaStep = function() {
                        if (isDown) return;

                        tempVelocity *= 0.93; // Hệ số ma sát
                        if (Math.abs(tempVelocity) < 0.08) return;

                        slider.scrollLeft -= tempVelocity * 14;
                        rafId = requestAnimationFrame(inertiaStep);
                    };
                    rafId = requestAnimationFrame(inertiaStep);
                }
            }
        });

        slider.addEventListener('mousemove', function(e) {
            if (!isDown) return;

            const xVal = e.pageX - slider.offsetLeft;
            const yVal = e.pageY - slider.offsetTop;
            const dx = Math.abs(xVal - startX);
            const dy = Math.abs(yVal - startY);

            // Phân biệt cuộn dọc vs kéo ngang trước khi xác nhận kéo slider
            if (!hasDragged) {
                if (dy > dx && dy > 5) {
                    isDown = false;
                    slider.classList.remove('active', 'is-dragging');
                    return;
                }
                if (dx >= DRAG_THRESHOLD) {
                    hasDragged = true;
                    lockVertical = true;
                } else {
                    return;
                }
            }

            e.preventDefault(); // Chặn chọn chữ / kéo ảnh

            // Di chuyển slider theo tay chuột
            const walk = (xVal - startX) * 1.3;
            slider.scrollLeft = scrollLeft - walk;

            // Tính vận tốc kéo cho quán tính
            const now = Date.now();
            const dt = now - lastTime;
            if (dt > 0) {
                const currentX = e.pageX;
                velocity = (currentX - lastX) / dt;
                lastX = currentX;
                lastTime = now;
            }
        });

        // Prevent native image/link dragging browser ghost image
        slider.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
        // Cuộn chuột dọc (mouse wheel up/down) được giữ tự nhiên cho trang cuộn dọc bình thường,
        // chỉ di chuyển các mục ngang khi người dùng nhấn giữ kéo chuột (drag) hoặc vuốt (swipe).

        // --- TOUCH EVENTS (Mobile Swipe Guard) ---
        let touchStartX = 0;
        let touchStartY = 0;
        let touchHasDragged = false;

        slider.addEventListener('touchstart', function(e) {
            if (!e.touches || e.touches.length === 0) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchHasDragged = false;

            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }, { passive: true });

        slider.addEventListener('touchmove', function(e) {
            if (!e.touches || e.touches.length === 0 || touchHasDragged) return;
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);

            if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                touchHasDragged = true;
            }
        }, { passive: true });

        slider.addEventListener('touchend', function() {
            if (touchHasDragged) {
                slider.setAttribute('data-dragged', 'true');
                setTimeout(function() {
                    slider.removeAttribute('data-dragged');
                }, 300);
            }
            touchHasDragged = false;
        }, { passive: true });

        // --- CLICK INTERCEPTOR (Capture Phase) ---
        slider.addEventListener('click', function(e) {
            if (slider.getAttribute('data-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true);
    }

    // -- INIT ALL SLIDERS --
    function init() {
        const sliders = document.querySelectorAll(SLIDER_SELECTORS);
        sliders.forEach(function(slider) {
            if (slider.classList.contains('justify-center') || slider.tagName === 'NAV') return;
            initSliderDrag(slider);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-init after dynamic content loads
    window.refreshMovieSliders = function() {
        init();
    };

    // Lightweight observer to catch dynamically rendered scrollers automatically
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function() {
            init();
        });
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
})();
