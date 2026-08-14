const fs = require('fs');

const files = [
    'F:/Wesite Xem Phim/index.html',
    'F:/Wesite Xem Phim Mới/index.html',
    'F:/Wesite Xem Phim Node/views/index.ejs'
];

let updated = 0;

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    const regex = /<div class=\"flex items-center justify-center gap-3 md:gap-4 mb-2\">[\s\S]*?<!-- Tagline -->/i;
    
    const replacement = `<div class=\"flex items-center justify-center mb-4\">
                <img src=\"/logo-aphim1.png\" alt=\"A Phim Logo\" class=\"object-contain drop-shadow-[0_0_40px_rgba(242,242,13,0.5)] h-24 md:h-32 w-auto animate-pulse\" />
            </div>
            
            <!-- Tagline -->`;
            
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(file, content, 'utf8');
        updated++;
        console.log('Updated ' + file);
    } else {
        console.log('Regex did not match ' + file);
    }
}
console.log('Total updated files: ' + updated);
