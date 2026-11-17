const fs = require('fs');
let code = fs.readFileSync('views/landing.ejs', 'utf8');

code = code.replace('32-jGohS7cK1e2j.jpg', 'n32-BH9yHJBQqeOa.jpg');

fs.writeFileSync('views/landing.ejs', code);
console.log('Fixed banner');
