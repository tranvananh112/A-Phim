// Notification Modal System with Multiple Options
(function () {
    const MODAL_STORAGE_KEY = 'aphim_notification_seen';
    const DONATION_CONFIRMED_KEY = 'aphim_donation_confirmed';
    const VISIT_COUNT_KEY = 'aphim_visit_count';

    // Configuration
    const CONFIG = {
        // Option 1: Time-based (days)
        showAfterDays: 7,

        // Option 2: Visit count-based
        showEveryNVisits: 5,

        // Option 3: Hide for N days after donation confirmation
        hideDaysAfterDonation: 4, // Random 3-5 days, using 4 as middle

        // Choose which method to use: 'time', 'visits', 'both', 'donation'
        method: 'both' // Will check both time and donation status
    };

    // Increment visit count
    function incrementVisitCount() {
        let visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1;
        localStorage.setItem(VISIT_COUNT_KEY, visits.toString());
        return visits;
    }

    // Check if user confirmed donation recently
    function hasRecentDonation() {
        const donationData = localStorage.getItem(DONATION_CONFIRMED_KEY);
        if (!donationData) return false;

        try {
            const data = JSON.parse(donationData);
            const daysSince = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);

            // Random between 3-5 days
            const hideDays = CONFIG.hideDaysAfterDonation + Math.random() - 0.5; // 3.5 to 4.5 days

            return daysSince < hideDays;
        } catch (e) {
            return false;
        }
    }

    // Check if modal should be shown based on time
    function shouldShowByTime() {
        const lastSeen = localStorage.getItem(MODAL_STORAGE_KEY);

        if (!lastSeen) {
            return true;
        }

        const lastSeenDate = new Date(parseInt(lastSeen));
        const now = new Date();
        const daysDiff = Math.floor((now - lastSeenDate) / (1000 * 60 * 60 * 24));

        return daysDiff >= CONFIG.showAfterDays;
    }

    // Check if modal should be shown based on visit count
    function shouldShowByVisits() {
        const visits = incrementVisitCount();
        return visits % CONFIG.showEveryNVisits === 0;
    }

    // Main check function
    function shouldShowModal() {
        // Priority 1: Check if user donated recently
        if (hasRecentDonation()) {
            console.log('Modal hidden: User donated recently');
            return false;
        }

        // Check based on configured method
        switch (CONFIG.method) {
            case 'time':
                return shouldShowByTime();

            case 'visits':
                return shouldShowByVisits();

            case 'both':
                // Show if EITHER condition is met
                return shouldShowByTime() || shouldShowByVisits();

            case 'donation':
                // Only show if no recent donation (already checked above)
                return true;

            default:
                return shouldShowByTime();
        }
    }

    // Create and show modal
    function createModal() {
        const modalHTML = `
            <div id="welcome-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" style="display: none;">
                <div class="relative w-full max-w-md sm:max-w-lg lg:max-w-2xl bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-[0_0_50px_rgba(236,19,19,0.15)] overflow-hidden group ring-1 ring-white/10 animate-fade-in max-h-[90vh] overflow-y-auto">
                    <div class="absolute -top-24 -right-24 w-64 h-64 bg-red-500/20 rounded-full blur-[100px] group-hover:bg-red-500/30 transition-colors duration-700"></div>
                    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] group-hover:bg-red-500/20 transition-colors duration-700"></div>
                    
                    <div class="relative z-10 flex flex-col items-center text-center">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/20 to-black rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-red-500/40 shadow-[0_0_30px_rgba(236,19,19,0.3)]">
                            <span class="material-symbols-outlined text-red-500 text-4xl sm:text-5xl font-light drop-shadow-[0_0_10px_rgba(236,19,19,0.8)]">favorite</span>
                        </div>
                        
                        <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-snug px-2">
                            CHÀO MỪNG BẠN ĐẾN VỚI <br/>
                            <span class="text-red-500 drop-shadow-[0_0_8px_rgba(236,19,19,0.8)]">APHIM.IO.VN</span>
                        </h2>
                        
                        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-inner">
                            <p class="text-gray-200 leading-relaxed text-sm sm:text-base lg:text-lg font-light text-justify">
                                Admin xin chào tất cả thành viên của trang APHIM.IO.VN. Để đảm bảo duy trì Server phục vụ cho mọi người xem phim không quảng cáo. Mình rất mong nhận được sự ủng hộ nho nhỏ của tất cả các thành viên. Mọi người có thể mua gói hoặc ủng hộ mình để có thể duy trì server website và một cộng đồng xem phim thật chất lượng mượt mà nhất. Rất cảm ơn tất cả mọi người.
                            </p>
                        </div>
                        
                        <div class="flex flex-col gap-3 w-full">
                            <a href="pricing.html" class="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-primary to-yellow-500 hover:from-yellow-500 hover:to-primary text-black font-bold rounded-xl shadow-[0_0_30px_rgba(242,242,13,0.5)] hover:shadow-[0_0_50px_rgba(242,242,13,0.7)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn w-full uppercase tracking-wider text-sm">
                                <span class="material-symbols-outlined">shopping_cart</span>
                                Mua Gói
                            </a>
                            <a href="support.html" class="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(236,19,19,0.5)] hover:shadow-[0_0_50px_rgba(236,19,19,0.7)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn w-full uppercase tracking-wider text-sm">
                                <span class="material-symbols-outlined animate-pulse">favorite</span>
                                Ủng Hộ Aphim
                            </a>
                            <button id="modal-close-btn" class="px-6 sm:px-8 py-3 sm:py-3.5 bg-transparent hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-xl border border-white/20 transition-all cursor-pointer text-center w-full tracking-wide text-sm uppercase">
                                Đã Hiểu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add Material Icons if not already present
        if (!document.querySelector('link[href*="Material+Symbols+Outlined"]')) {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fade-in {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);

        // Show modal
        const modal = document.getElementById('welcome-modal');
        modal.style.display = 'flex';

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Close button handler
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);

        // Close on backdrop click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById('welcome-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';

        // Save to localStorage
        localStorage.setItem(MODAL_STORAGE_KEY, Date.now().toString());
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        if (shouldShowModal()) {
            // Delay showing modal slightly for better UX
            setTimeout(createModal, 500);
        }
    });

    // Debug function (can be called from console)
    window.aphimDebugModal = function () {
        console.log('Modal Configuration:', CONFIG);
        console.log('Last seen:', localStorage.getItem(MODAL_STORAGE_KEY));
        console.log('Visit count:', localStorage.getItem(VISIT_COUNT_KEY));
        console.log('Donation confirmed:', localStorage.getItem(DONATION_CONFIRMED_KEY));
        console.log('Should show:', shouldShowModal());
        console.log('Has recent donation:', hasRecentDonation());
    };

    // Reset function for testing
    window.aphimResetModal = function () {
        localStorage.removeItem(MODAL_STORAGE_KEY);
        localStorage.removeItem(DONATION_CONFIRMED_KEY);
        localStorage.removeItem(VISIT_COUNT_KEY);
        console.log('Modal data reset. Reload page to see modal.');
    };
})();
