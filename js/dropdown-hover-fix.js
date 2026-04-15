// Fix dropdown hover behavior - prevent dropdown from closing when moving mouse and prevent overlapping
(function () {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdownHover);
    } else {
        initDropdownHover();
    }

    function initDropdownHover() {
        // Find all dropdown groups
        const dropdownGroups = document.querySelectorAll('nav .relative.group');

        dropdownGroups.forEach(group => {
            const button = group.querySelector('button');
            const dropdown = group.querySelector('.absolute.top-full');

            if (!button || !dropdown) return;

            let hideTimeout;

            // Show dropdown on button hover
            button.addEventListener('mouseenter', () => {
                // Instantly hide ALL other dropdowns to prevent overlapping
                dropdownGroups.forEach(g => {
                    if (g !== group) {
                        const d = g.querySelector('.absolute.top-full');
                        if (d) {
                            d.classList.remove('opacity-100', 'visible');
                            d.classList.add('opacity-0', 'invisible');
                        }
                    }
                });

                clearTimeout(hideTimeout);
                dropdown.classList.remove('opacity-0', 'invisible');
                dropdown.classList.add('opacity-100', 'visible');
                // Ensure tailwind group-hover glitch doesn't flash black
                dropdown.style.background = 'linear-gradient(145deg, #3d5a96 0%, #25385e 100%)';
            });

            // Keep dropdown visible when hovering over it
            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
                dropdown.classList.remove('opacity-0', 'invisible');
                dropdown.classList.add('opacity-100', 'visible');
            });

            // Hide dropdown with delay when leaving button
            button.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                    dropdown.classList.remove('opacity-100', 'visible');
                    dropdown.classList.add('opacity-0', 'invisible');
                }, 150); // 150ms delay
            });

            // Hide dropdown with delay when leaving dropdown
            dropdown.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                    dropdown.classList.remove('opacity-100', 'visible');
                    dropdown.classList.add('opacity-0', 'invisible');
                }, 150); // 150ms delay
            });
        });

        console.log('✅ Dropdown hover behavior fixed + overlap resolved');
    }
})();
