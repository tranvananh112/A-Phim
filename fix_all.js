const fs = require('fs');

const files = ['index.html', 'linh-mieu.html', 'pricing.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // 1. Xóa style block đầu file nếu có
        content = content.replace(/<style id="sequential-layout-fix">[\s\S]*?<\/style>\r?\n?/, '');

        // 2. Sửa hero-thumbnails-container
        content = content.replace(/<div class="hero-thumbnails-container absolute z-30 left-0 right-0 pointer-events-none"[^>]*>/, '<div class="hero-thumbnails-container relative z-30 pointer-events-none">');

        // 3. Xóa style block bên trong hero-thumbnails-container
        content = content.replace(/<style>\s*@media \(min-width: 768px\) \{[\s\S]*?<\/style>\r?\n?/, '');

        // 4. Sửa mobile-thumb-wrapper
        content = content.replace(/<div class="w-full max-w-\[1600px\] mx-auto px-4 md:px-6 lg:px-8 mobile-thumb-wrapper"[^>]*>/, '<div class="w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 mobile-thumb-wrapper">');

        // 5. Sửa interests-section
        content = content.replace(/<section class="interests-section absolute left-0 right-0 z-40 bg-transparent pt-4 pb-0 mb-0"[^>]*>/, '<section class="interests-section relative z-40 bg-transparent pt-4 pb-0 mb-0">');

        // 6. Xóa bg-void margin âm
        content = content.replace(/\.bg-void\s*\{\s*margin-top:\s*-60px\s*!important;\s*position:\s*relative\s*!important;\s*z-index:\s*50\s*!important;\s*\}/g, 
            '.bg-void { margin-top: 0px !important; position: relative !important; z-index: 50 !important; padding-top: 24px !important; }');
        content = content.replace(/\.bg-void::before\s*\{[\s\S]*?z-index:\s*-1;\s*\}/g, '.bg-void::before { display: none !important; }');

        // 7. Gỡ scroll-snap cứng
        content = content.replace(/scroll-snap-type:\s*x\s*mandatory;?/g, '');

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});

// Vô hiệu hóa section-swipe.js
if (fs.existsSync('js/section-swipe.js')) {
    fs.writeFileSync('js/section-swipe.js', '// Disabled to allow native smooth scrolling', 'utf8');
    console.log('Disabled section-swipe.js');
}

// Xóa scroll-snap từ touch-speed.css
if (fs.existsSync('css/touch-speed.css')) {
    let css = fs.readFileSync('css/touch-speed.css', 'utf8');
    css = css.replace(/scroll-snap-type:\s*x\s*(proximity|mandatory)\s*!important;/g, '');
    fs.writeFileSync('css/touch-speed.css', css, 'utf8');
    console.log('Removed snap from touch-speed.css');
}
