const fs = require('fs');
const path = require('path');

function checkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) checkDir(full);
        else if (e.name.endsWith('.ejs') || e.name.endsWith('.css')) {
            const code = fs.readFileSync(full, 'utf8');
            const lines = code.split('\n');
            lines.forEach((line, idx) => {
                if (line.includes('search-icon') || line.includes('search-box') || line.includes('filter-search') || line.includes('name="q"') || line.includes('type="search"')) {
                    console.log(`${full}:${idx+1} -> ${line.trim()}`);
                }
            });
        }
    }
}

checkDir('./views');
checkDir('./public');
