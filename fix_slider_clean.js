const fs = require('fs');
let code = fs.readFileSync('views/anime-detail.ejs', 'utf8');

const regex = /<div class="list-title">Classic Masterpieces<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(regex, '');
fs.writeFileSync('views/anime-detail.ejs', code);
console.log('Cleaned up slider');
