const fs = require('fs');
const content = fs.readFileSync('F:/Wesite Xem Phim Mới/index.html', 'utf8');
const lines = content.split('\n');
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('id="splashLoader"') && !lines[i].includes('{')) {
        console.log(lines.slice(i, i+30).join('\n'));
        break;
    }
}
