const fs = require('fs');
let code = fs.readFileSync('views/landing.ejs', 'utf8');

if (!code.includes('<link rel="stylesheet" href="/css/style.css">')) {
    code = code.replace('<style>', '<link rel="stylesheet" href="/css/style.css">\n  <style>');
}

fs.writeFileSync('views/landing.ejs', code);
console.log('Fixed CSS link');
