// Material Icons Font Loader
(function () {
    'use strict';

    // Check if Material Icons font is loaded
    function checkFontLoaded() {
        if (document.fonts && document.fonts.check) {
            // Modern browsers with Font Loading API
            return document.fonts.check('24px "Material Icons Round"') ||
                document.fonts.check('24px "Material Icons"');
        }
        return false;
    }

    // Add loaded class to all material icons
    function markIconsAsLoaded() {
        const icons = document.querySelectorAll('.material-icons-round, .material-icons, .material-icons-outlined, .material-symbols-outlined');
        icons.forEach(icon => {
            icon.classList.add('material-icons-loaded');
        });
    }

    // Wait for fonts to load
    function waitForFonts() {
        if (checkFontLoaded()) {
            markIconsAsLoaded();
            return;
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                markIconsAsLoaded();
            }).catch(() => {
                // Fallback: mark as loaded after timeout
                setTimeout(markIconsAsLoaded, 2000);
            });
        } else {
            // Fallback for older browsers
            setTimeout(() => {
                markIconsAsLoaded();
            }, 1500);
        }
    }

    // Observer for dynamically added icons
    function observeNewIcons() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is an icon
                        if (node.classList && (
                            node.classList.contains('material-icons-round') ||
                            node.classList.contains('material-icons') ||
                            node.classList.contains('material-icons-outlined') ||
                            node.classList.contains('material-symbols-outlined')
                        )) {
                            if (checkFontLoaded()) {
                                node.classList.add('material-icons-loaded');
                            }
                        }

                        // Check for icon children
                        const icons = node.querySelectorAll && node.querySelectorAll('.material-icons-round, .material-icons, .material-icons-outlined, .material-symbols-outlined');
                        if (icons && icons.length > 0 && checkFontLoaded()) {
                            icons.forEach(icon => icon.classList.add('material-icons-loaded'));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForFonts();
            observeNewIcons();
        });
    } else {
        waitForFonts();
        observeNewIcons();
    }

    // Also check on window load as a fallback
    window.addEventListener('load', () => {
        setTimeout(markIconsAsLoaded, 500);
    });
})();
