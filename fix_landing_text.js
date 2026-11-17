const fs = require('fs');
let code = fs.readFileSync('views/landing.ejs', 'utf8');

const regex = /<div style="position: absolute; top: 20px; left: 50%; transform: translateX\(-50%\); z-index: 5; pointer-events: none;">[\s\S]*?<\/div>/;
code = code.replace(regex, '');

fs.writeFileSync('views/landing.ejs', code);
console.log('Fixed text in landing');
