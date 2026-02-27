// Simple Mobile Menu (No Dropdowns) - Inject into all pages
// Mobile menu chỉ có link trực tiếp, không có dropdown

function injectSimpleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (!mobileMenu) return;

    // Get current page to highlight active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const menuHTML = `
        <div class="container mx-auto px-6 py-4">
            <a href="index.html" class="block py-3 ${currentPage === 'index.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                🏠 Trang chủ
            </a>
            <a href="phim-viet-nam.html" class="flex items-center py-3 ${currentPage === 'phim-viet-nam.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="20" fill="#DA251D"/>
                    <polygon points="15,4 16.5,9 21.5,9 17.5,12 19,17 15,14 11,17 12.5,12 8.5,9 13.5,9" fill="#FFFF00"/>
                </svg>
                Phim Việt Nam
            </a>
            <a href="danh-sach.html" class="block py-3 ${currentPage === 'danh-sach.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                📋 Danh Sách
            </a>
            <a href="categories.html" class="block py-3 ${currentPage === 'categories.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                🎬 Thể Loại
            </a>
            <a href="search.html" class="block py-3 ${currentPage === 'search.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                🔍 Khám phá
            </a>
            <a href="pricing.html" class="block py-3 ${currentPage === 'pricing.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                💎 Gói cước
            </a>
            <a href="support.html" class="block py-3 ${currentPage === 'support.html' ? 'text-primary font-bold' : 'text-gray-300 hover:text-primary'} transition-colors">
                ❤️ Nuôi APhim
            </a>
        </div>
    `;

    mobileMenu.innerHTML = menuHTML;
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSimpleMobileMenu);
} else {
    injectSimpleMobileMenu();
}
