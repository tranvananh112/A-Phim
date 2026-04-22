// Kịch bản để load động Dropdown danh sách các quốc gia (Menu Phim)
async function loadCountriesDropdown() {
    try {
        const dropdown = document.getElementById('countryDropdown');
        if (!dropdown) return;

        // Hardcode danh sách quốc gia để không phụ thuộc vào thứ tự load của api.js
        const countriesData = [
            { slug: 'viet-nam', name: 'Việt Nam' }, { slug: 'trung-quoc', name: 'Trung Quốc' },
            { slug: 'han-quoc', name: 'Hàn Quốc' }, { slug: 'nhat-ban', name: 'Nhật Bản' },
            { slug: 'thai-lan', name: 'Thái Lan' }, { slug: 'au-my', name: 'Âu Mỹ' },
            { slug: 'dai-loan', name: 'Đài Loan' }, { slug: 'hong-kong', name: 'Hồng Kông' },
            { slug: 'an-do', name: 'Ấn Độ' }, { slug: 'anh', name: 'Anh' },
            { slug: 'phap', name: 'Pháp' }, { slug: 'canada', name: 'Canada' },
            { slug: 'duc', name: 'Đức' }, { slug: 'tay-ban-nha', name: 'Tây Ban Nha' },
            { slug: 'tho-nhi-ky', name: 'Thổ Nhĩ Kỳ' }, { slug: 'ha-lan', name: 'Hà Lan' },
            { slug: 'indonesia', name: 'Indonesia' }, { slug: 'nga', name: 'Nga' },
            { slug: 'mexico', name: 'Mexico' }, { slug: 'ba-lan', name: 'Ba Lan' },
            { slug: 'uc', name: 'Úc' }, { slug: 'thuy-dien', name: 'Thụy Điển' },
            { slug: 'malaysia', name: 'Malaysia' }, { slug: 'brazil', name: 'Brazil' },
            { slug: 'philippines', name: 'Philippines' }, { slug: 'bo-dao-nha', name: 'Bồ Đào Nha' },
            { slug: 'y', name: 'Ý' }, { slug: 'dan-mach', name: 'Đan Mạch' },
            { slug: 'uae', name: 'UAE' }, { slug: 'na-uy', name: 'Na Uy' },
            { slug: 'thuy-si', name: 'Thụy Sĩ' }, { slug: 'chau-phi', name: 'Châu Phi' },
            { slug: 'nam-phi', name: 'Nam Phi' }, { slug: 'ukraina', name: 'Ukraina' },
            { slug: 'a-rap-xe-ut', name: 'Ả Rập Xê Út' }
        ];

        // Gộp mục Tất Cả vào chung 1 lưới thiết kế để không vỡ khung grid-cols-4
        const countries = [{ slug: 'all', name: 'Tất Cả Quốc Gia' }, ...countriesData];

        // Map mã ISO lấy cờ từ FlagCDN (Vì Window PC không hỗ trợ hiển thị Emoji quốc gia 🇻🇳)
        const flags = {
            'viet-nam': 'vn', 'trung-quoc': 'cn', 'han-quoc': 'kr', 'nhat-ban': 'jp',
            'thai-lan': 'th', 'au-my': 'us', 'dai-loan': 'tw', 'hong-kong': 'hk',
            'an-do': 'in', 'anh': 'gb', 'phap': 'fr', 'canada': 'ca', 'duc': 'de',
            'tay-ban-nha': 'es', 'tho-nhi-ky': 'tr', 'ha-lan': 'nl', 'indonesia': 'id',
            'nga': 'ru', 'mexico': 'mx', 'ba-lan': 'pl', 'uc': 'au', 'thuy-dien': 'se',
            'malaysia': 'my', 'brazil': 'br', 'philippines': 'ph', 'bo-dao-nha': 'pt',
            'y': 'it', 'dan-mach': 'dk', 'uae': 'ae', 'na-uy': 'no', 'thuy-si': 'ch',
            'chau-phi': 'globe', 'nam-phi': 'za', 'ukraina': 'ua', 'a-rap-xe-ut': 'sa',
            'all': 'globe'
        };

        // Tính toán số ô bị thiếu để grid đầy đủ viền (đang dùng 4 cột)
        const totalCells = Math.ceil(countries.length / 4) * 4;
        const missingCells = totalCells - countries.length;

        // Render as grid 4 columns
        let gridHTML = '<div class="grid grid-cols-4 gap-0">';
        
        gridHTML += countries.map((country, index) => {
            const isLastRow = index >= totalCells - 4;
            const isRightEdge = (index + 1) % 4 === 0;
            const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-white/5`;
            
            const code = flags[country.slug] || 'globe';
            
            // Nếu là icon dùng Emoji địa cầu nguyên thủy, nếu là quốc gia dùng cờ img
            const iconHtml = (code === 'globe') 
                ? `<span class="mr-2" style="font-size:16px;">🌍</span>`
                : `<img src="https://flagcdn.com/16x12/${code}.png" alt="${code}" class="mr-2 rounded-sm" style="width:16px;height:12px;object-fit:cover;">`;

            // Link URL
            const url = (country.slug === 'all') 
                ? 'phim-theo-quoc-gia.html' 
                : `phim-theo-quoc-gia.html?country=${country.slug}`;

            // Highlight mục Tất Cả
            const textClass = (country.slug === 'all') ? 'font-bold' : '';

            return `
                <a href="${url}" 
                   class="flex items-center px-4 py-3 text-gray-300 hover:text-primary hover:bg-white/5 transition-all text-sm whitespace-nowrap ${borderClasses} ${textClass}">
                    ${iconHtml} <span class="truncate">${country.name}</span>
                </a>
            `;
        }).join('');

        // Render các ô trống để lấp đầy grid với border chuẩn
        for (let i = 0; i < missingCells; i++) {
            const index = countries.length + i;
            const isLastRow = true; // Chắc chắn ở hàng cuối
            const isRightEdge = (index + 1) % 4 === 0;
            const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-white/5`;
            
            gridHTML += `<div class="block px-4 py-3 pointer-events-none ${borderClasses}"></div>`;
        }

        gridHTML += '</div>';
        dropdown.innerHTML = gridHTML;
        
    } catch (error) {
        console.error('Error loading countries dropdown:', error);
        const dropdown = document.getElementById('countryDropdown');
        if (dropdown) {
            dropdown.innerHTML = '<div class="p-4 text-center text-red-400">Không thể tải danh sách</div>';
        }
    }
}

// Load dropdown on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCountriesDropdown);
} else {
    loadCountriesDropdown();
}
