// Categories Page Script

document.addEventListener('DOMContentLoaded', async function () {
    await loadAllCategories();
});

// Load all categories from API
async function loadAllCategories() {
    const container = document.getElementById('categoriesGrid');

    if (!container) {
        console.error('Categories grid not found');
        return;
    }

    // Show loading
    container.innerHTML = `
        <div class="col-span-full text-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p class="text-gray-400 mt-4">Đang tải thể loại...</p>
        </div>
    `;

    try {
        const categories = await movieAPI.getCategories();

        if (categories && categories.length > 0) {
            renderCategories(categories);
        } else {
            container.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-400">Không thể tải danh sách thể loại</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-red-400">Đã xảy ra lỗi khi tải thể loại</p>
            </div>
        `;
    }
}

// Render categories grid
function renderCategories(categories) {
    const container = document.getElementById('categoriesGrid');

    // Category icons mapping
    const categoryIcons = {
        'hanh-dong': '💥',
        'tinh-cam': '❤️',
        'hai-huoc': '😂',
        'kinh-di': '👻',
        'phieu-luu': '🗺️',
        'khoa-hoc-vien-tuong': '🚀',
        'tam-ly': '🧠',
        'hinh-su': '🔍',
        'chien-tranh': '⚔️',
        'than-thoai': '🐉',
        'gia-dinh': '👨‍👩‍👧‍👦',
        'hoat-hinh': '🎨',
        'tai-lieu': '📚',
        'am-nhac': '🎵',
        'the-thao': '⚽',
        'vo-thuat': '🥋',
        'co-trang': '👑',
        'chinh-kich': '🎭',
        'bi-an': '🔮',
        'phim-18': '🔞'
    };

    const html = categories.map(category => {
        const icon = categoryIcons[category.slug] || '🎬';

        return `
            <a href="search.html?category=${category.slug}"
                class="group relative block rounded-xl overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                <div class="p-8 text-center">
                    <div class="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        ${icon}
                    </div>
                    <h3 class="text-xl font-bold text-white group-hover:text-primary transition-colors">
                        ${category.name}
                    </h3>
                    <p class="text-sm text-gray-400 mt-2">Khám phá ngay</p>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
        `;
    }).join('');

    container.innerHTML = html;
}
