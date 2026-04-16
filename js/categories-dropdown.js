// Load categories for dropdown menu
async function loadCategoriesDropdown() {
    try {
        const response = await fetch('https://ophim1.com/v1/api/the-loai', {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });
        const data = await response.json();

        if (data.status === 'success' && data.data && data.data.items) {
            const categories = data.data.items;
            const dropdown = document.getElementById('categoryDropdown');
            if (dropdown && categories.length > 0) {
                // Tính toán số ô bị thiếu để grid đầy đủ (đang dùng 4 cột)
                const totalCells = Math.ceil(categories.length / 4) * 4;
                const missingCells = totalCells - categories.length;

                // Render as grid 4 columns
                let gridHTML = '<div class="grid grid-cols-4 gap-0">';
                
                gridHTML += categories.map((cat, index) => {
                    const isLastRow = index >= totalCells - 4;
                    const isRightEdge = (index + 1) % 4 === 0;
                    const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-white/5`;

                    return `
                        <a href="categories.html?category=${cat.slug}" 
                           class="block px-4 py-3 text-gray-300 hover:text-primary hover:bg-white/5 transition-all ${borderClasses}">
                            ${cat.name}
                        </a>
                    `;
                }).join('');

                // Render các ô trống để lấp đầy grid vớt border chuẩn (cho đủ cái trống lưới do user yêu cầu)
                for (let i = 0; i < missingCells; i++) {
                    const index = categories.length + i;
                    const isLastRow = true; // Chắc chắn ở hàng cuối
                    const isRightEdge = (index + 1) % 4 === 0;
                    const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-white/5`;
                    
                    gridHTML += `<div class="block px-4 py-3 pointer-events-none ${borderClasses}"></div>`;
                }

                gridHTML += '</div>';
                dropdown.innerHTML = gridHTML;
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        const dropdown = document.getElementById('categoryDropdown');
        if (dropdown) {
            dropdown.innerHTML = '<div class="p-4 text-center text-red-400">Không thể tải thể loại</div>';
        }
    }
}

// Load categories on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCategoriesDropdown);
} else {
    loadCategoriesDropdown();
}
