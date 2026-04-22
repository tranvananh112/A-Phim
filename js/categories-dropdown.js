// Load categories for dropdown menu (Zero-latency version)
function loadCategoriesDropdown() {
    try {
        const dropdown = document.getElementById('categoryDropdown');
        if (!dropdown) return;

        // Hardcode categories to bypass API delay completely
        const categoriesData = [
            { slug: 'hanh-dong', name: 'Hành Động' }, { slug: 'tinh-cam', name: 'Tình Cảm' },
            { slug: 'hai-huoc', name: 'Hài Hước' }, { slug: 'co-trang', name: 'Cổ Trang' },
            { slug: 'tam-ly', name: 'Tâm Lý' }, { slug: 'hinh-su', name: 'Hình Sự' },
            { slug: 'chien-tranh', name: 'Chiến Tranh' }, { slug: 'the-thao', name: 'Thể Thao' },
            { slug: 'vo-thuat', name: 'Võ Thuật' }, { slug: 'vien-tuong', name: 'Viễn Tưởng' },
            { slug: 'phieu-luu', name: 'Phiêu Lưu' }, { slug: 'khoa-hoc', name: 'Khoa Học' },
            { slug: 'kinh-di', name: 'Kinh Dị' }, { slug: 'am-nhac', name: 'Âm Nhạc' },
            { slug: 'than-thoai', name: 'Thần Thoại' }, { slug: 'tai-lieu', name: 'Tài Liệu' },
            { slug: 'gia-dinh', name: 'Gia Đình' }, { slug: 'chinh-kich', name: 'Chính kịch' },
            { slug: 'bi-an', name: 'Bí ẩn' }, { slug: 'hoc-duong', name: 'Học Đường' },
            { slug: 'kinh-dien', name: 'Kinh Điển' }, { slug: 'phim-18', name: 'Phim 18+' },
            { slug: 'short-drama', name: 'Short Drama' }
        ];

        // Gộp mục Tất Cả vào chung 1 lưới thiết kế để không vỡ khung grid-cols-4
        const categories = [{ slug: 'all', name: 'Tất Cả Thể Loại' }, ...categoriesData];

        // Tính toán số ô bị thiếu để grid đầy đủ viền (đang dùng 4 cột)
        const totalCells = Math.ceil(categories.length / 4) * 4;
        const missingCells = totalCells - categories.length;

        // Render as grid 4 columns
        let gridHTML = '<div class="grid grid-cols-4 gap-0">';
        
        gridHTML += categories.map((cat, index) => {
            const isLastRow = index >= totalCells - 4;
            const isRightEdge = (index + 1) % 4 === 0;
            const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-white/5`;
            
            // Link URL
            const url = (cat.slug === 'all') 
                ? 'categories.html' 
                : `categories.html?category=${cat.slug}`;

            // Highlight mục Tất Cả
            const textClass = (cat.slug === 'all') ? 'font-bold' : '';

            return `
                <a href="${url}" 
                   class="flex items-center px-4 py-3 text-gray-300 hover:text-primary hover:bg-white/5 transition-all text-sm whitespace-nowrap ${borderClasses} ${textClass}">
                    <span class="truncate">${cat.name}</span>
                </a>
            `;
        }).join('');

        // Render các ô trống để lấp đầy grid với border chuẩn
        for (let i = 0; i < missingCells; i++) {
            const index = categories.length + i;
            const isLastRow = true; // Chắc chắn ở hàng cuối
            const isRightEdge = (index + 1) % 4 === 0;
            const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-white/5`;
            
            gridHTML += `<div class="block px-4 py-3 pointer-events-none ${borderClasses}"></div>`;
        }

        gridHTML += '</div>';
        dropdown.innerHTML = gridHTML;
        
    } catch (error) {
        console.error('Error loading categories dropdown:', error);
        const dropdown = document.getElementById('categoryDropdown');
        if (dropdown) {
            dropdown.innerHTML = '<div class="p-4 text-center text-red-400">Không thể tải thể loại</div>';
        }
    }
}

// Load dropdown on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCategoriesDropdown);
} else {
    loadCategoriesDropdown();
}
