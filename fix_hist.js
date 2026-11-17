const fs = require('fs');
let code = fs.readFileSync('views/anime-detail.ejs', 'utf8');
code = code.replace(/background:var\(--blue-soft\);/g, 'background:rgba(255, 85, 0, 0.25);');
fs.writeFileSync('views/anime-detail.ejs', code);
console.log('Hist fixed');
