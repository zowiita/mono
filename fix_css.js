const fs = require('fs');
let css = fs.readFileSync('public/css/style.css', 'utf8');
css = css.replace('--blue: #280DC2;', '--blue: #8B7CFF;');
css = css.replace('--blue-hover: #1F089E;', '--blue-hover: #7A69EE;');
css = css.replace('--blue-soft: rgba(40, 13, 194, 0.25);', '--blue-soft: rgba(139, 124, 255, 0.25);');
fs.writeFileSync('public/css/style.css', css);
console.log('CSS Fixed');
