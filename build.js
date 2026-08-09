const fs = require('fs');

// Use real image extensions if they exist, fallback to png
const getImg = (name) => {
    if (fs.existsSync('images/' + name + '.jpg')) return 'images/' + name + '.jpg';
    if (fs.existsSync('images/' + name + '.png')) return 'images/' + name + '.png';
    return null;
};

const frieren = getImg('frieren');
const aot = getImg('aot');
const violet = getImg('violet');
const nge = getImg('nge');
const vinland = getImg('vinland');
const dandadan = getImg('dandadan');
const dungeon = getImg('dungeon');
const mushishi = getImg('mushishi');
const chainsaw = getImg('chainsaw');
const mob = getImg('mob');
const banner = getImg('banner');

// Rewrite the whole HTML to be safe and clean
let html = '';

html += '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
html += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">\n';
html += '<title>Untitled \u2014 Track, Review & Discover Anime</title>\n';
html += '<link rel="preconnect" href="https://api.fontshare.com">\n';
html += '<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">\n';
html += '<style>\n';
html += ':root{\n';
html += '  --blue:#280DC2;--blue-soft:#E8E4FF;--blue-mid:#C4BEFF;\n';
html += '  --white:#14181C; /* Dark theme inspired by letterboxd */\n';
html += '  --orange:#00E054; /* Green accent */\n';
html += '  --orange-soft:rgba(0, 224, 84, 0.2);\n';
html += '  --ink:#899AA9; /* Text color */\n';
html += '  --cream:#2C3440; /* Card bg */\n';
html += '  --cream-dk:#445566;\n';
html += '  --muted:#677b8c;\n';
html += '  --t-xs:11px;--t-sm:13px;--t-base:15px;--t-md:16px;--t-lg:20px;\n';
html += '  --t-xl:24px;--t-2xl:32px;\n';
html += '  --r-xs:2px;--r-sm:3px;--r-md:4px;--r-lg:6px; /* Squarer radius */\n';
html += '  --sh-sm:0 1px 3px rgba(0,0,0,.3);\n';
html += '  --sh-md:0 3px 12px rgba(0,0,0,.4);\n';
html += '  --sh-lg:0 6px 24px rgba(0,0,0,.5);\n';
html += '}\n';
html += '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n';
html += 'html{scroll-behavior:smooth;}\n';
html += 'body{font-family:"Satoshi",-apple-system,sans-serif;background:var(--white);color:var(--ink);font-size:var(--t-base);line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;}\n';
html += 'a{text-decoration:none;color:inherit;}\n';
html += 'button{font-family:inherit;cursor:pointer;border:none;background:none;}\n';
html += 'ul{list-style:none;}\n';
html += 'img{display:block;}\n';
html += '.wrap{max-width:980px;margin:0 auto;padding:0 20px;}\n';

// NAV
html += '/* NAV */\n';
html += '.nav{position:sticky;top:0;z-index:200;height:60px;background:#14181C;border-bottom:1px solid #2C3440;}\n';
html += '.nav-in{height:100%;display:flex;align-items:center;}\n';
html += '.logo{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:700;color:#fff;letter-spacing:-.5px;flex-shrink:0;}\n';
html += '.nav-mid{flex:1;display:flex;justify-content:center;}\n';
html += '.nav-links{display:flex;gap:12px;}\n';
html += '.nav-links a{font-size:13px;font-weight:700;color:#fff;padding:6px 12px;border-radius:3px;text-transform:uppercase;letter-spacing:1px;opacity:.8;transition:opacity .15s;}\n';
html += '.nav-links a:hover{opacity:1;}\n';
html += '.nav-end{flex-shrink:0;display:flex;align-items:center;gap:12px;}\n';
html += '.btn-log{display:flex;align-items:center;gap:5px;background:#00E054;color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:3px;text-transform:uppercase;letter-spacing:1px;}\n';
html += '.btn-log:hover{background:#00c048;}\n';

// SECTION STRUCTURE
html += '/* SECTION */\n';
html += '.main{padding:0 0 64px;}\n';
html += '.sec{margin-bottom:48px;}\n';
html += '.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid #456;padding-bottom:6px;}\n';
html += '.sec-title{font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;color:#899AA9;}\n';
html += '.see-all{font-size:11px;font-weight:500;color:#899AA9;letter-spacing:1px;text-transform:uppercase;opacity:.8;transition:color .15s;}\n';
html += '.see-all:hover{color:#fff;}\n';

// SCROLLABLE STRIP
html += '.strip{display:flex;gap:10px;overflow-x:auto;padding-bottom:10px;scrollbar-width:thin;scrollbar-color:var(--cream-dk) transparent;}\n';
html += '.strip::-webkit-scrollbar{height:6px;} .strip::-webkit-scrollbar-thumb{background:#456;border-radius:3px;}\n';

// ANIME POSTER CARD
html += '.pc{flex-shrink:0;width:150px;cursor:pointer;position:relative;}\n';
html += '.pc-img{width:150px;height:225px;border-radius:4px;border:1px solid rgba(255,255,255,.15);overflow:hidden;background:#2C3440;box-shadow:0 2px 8px rgba(0,0,0,.5);transition:border-color .15s;}\n';
html += '.pc:hover .pc-img{border-color:#00E054;}\n';
html += '.pc-img img,.pc-img .pc-fill{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;}\n';
html += '.g1{background:linear-gradient(155deg,#0d1b2a,#1b3a5c,#2a6494);}\n';
html += '.g2{background:linear-gradient(155deg,#1a0608,#4a1018,#8b2030);}\n';

// PROMO BANNER
html += '/* PROMO BANNER */\n';
html += '.promo{position:relative;width:100%;height:450px;margin-bottom:48px;overflow:hidden;}\n';
html += '.promo-img{width:100%;height:100%;object-fit:cover;object-position:center 20%;display:block;}\n';
html += '.promo-overlay{position:absolute;inset:0;background:linear-gradient(to top, #14181C 0%, transparent 60%);}\n';

// REVIEWS GRID (Letterboxd style)
html += '/* REVIEWS */\n';
html += '.rgrid{display:grid;grid-template-columns:1fr 1fr;gap:24px;}\n';
html += '.rc{display:flex;gap:12px;padding-bottom:24px;border-bottom:1px solid #2C3440;}\n';
html += '.rc:nth-last-child(-n+2){border-bottom:none;padding-bottom:0;}\n';
html += '.rc-th{width:70px;height:105px;border-radius:3px;border:1px solid rgba(255,255,255,.2);overflow:hidden;flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,.4);}\n';
html += '.rc-th img{width:100%;height:100%;object-fit:cover;}\n';
html += '.rc-body{flex:1;}\n';
html += '.rc-meta{display:flex;align-items:center;gap:6px;margin-bottom:6px;}\n';
html += '.rc-av{width:20px;height:20px;border-radius:50%;background:#456;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;overflow:hidden;}\n';
html += '.rc-av img {width:100%;height:100%;object-fit:cover;}\n';
html += '.rc-user{font-size:12px;font-weight:600;color:#fff;}\n';
html += '.rc-title{font-size:18px;font-weight:700;color:#fff;line-height:1.2;margin-bottom:4px;font-family:Georgia, serif;}\n';
html += '.rc-yr{font-size:14px;font-weight:400;color:#899AA9;font-family:sans-serif;}\n';
html += '.rc-stars{display:flex;align-items:center;gap:2px;margin-bottom:12px;}\n';
html += '.si{width:14px;height:14px;fill:#00E054;}\n';
html += '.rc-txt{font-size:14px;line-height:1.5;color:#899AA9;font-family:Georgia, serif;}\n';
html += '.rc-foot{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:#899AA9;}\n';
html += '.rc-like{display:flex;align-items:center;gap:4px;color:#899AA9;cursor:pointer;transition:color .15s;}\n';
html += '.rc-like:hover{color:#fff;}\n';
html += '.rc-like svg{width:12px;height:12px;fill:currentColor;}\n';

// LISTS (Overlapping covers)
html += '/* LISTS */\n';
html += '.lgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}\n';
html += '.lc{cursor:pointer;}\n';
html += '.lc-coll{display:flex;position:relative;height:140px;width:100%;overflow:hidden;margin-bottom:12px;padding-left:12px;}\n';
html += '.lc-cell{width:90px;height:135px;position:absolute;border:1px solid rgba(255,255,255,.2);border-radius:4px;overflow:hidden;box-shadow:-2px 0 10px rgba(0,0,0,.5);transition:transform .15s;background:#2C3440;}\n';
html += '.lc-cell img{width:100%;height:100%;object-fit:cover;}\n';
html += '.lc-cell:nth-child(1){left:0;z-index:5;}\n';
html += '.lc-cell:nth-child(2){left:40px;z-index:4;}\n';
html += '.lc-cell:nth-child(3){left:80px;z-index:3;}\n';
html += '.lc-cell:nth-child(4){left:120px;z-index:2;}\n';
html += '.lc-cell:nth-child(5){left:160px;z-index:1;}\n';
html += '.lc:hover .lc-cell:nth-child(1){transform:translateX(-4px);border-color:#00E054;}\n';
html += '.lc-title{font-size:16px;font-weight:700;color:#fff;line-height:1.2;margin-bottom:4px;font-family:sans-serif;}\n';
html += '.lc-meta{display:flex;align-items:center;gap:6px;font-size:12px;color:#899AA9;}\n';
html += '.lc-av{width:16px;height:16px;border-radius:50%;background:#456;display:inline-block;overflow:hidden;}\n';
html += '.lc-av img{width:100%;height:100%;object-fit:cover;}\n';
html += '.lc-stats{margin-top:4px;font-size:12px;color:#899AA9;display:flex;align-items:center;gap:8px;}\n';

html += '</style></head><body>\n';

// NAV HTML
html += '<nav class="nav">\n<div class="wrap nav-in">\n';
html += '<a href="/" class="logo">untitled</a>\n';
html += '<div class="nav-mid"><ul class="nav-links">';
['Films','Series','Lists','Members'].forEach((t)=>{ html += `<li><a href="#">${t}</a></li>`; });
html += '</ul></div>\n';
html += '<div class="nav-end">';
html += '<button class="btn-log">+ Log</button>';
html += '</div>\n</div>\n</nav>\n';

html += '<main class="main">\n';

// PROMO BANNER (NO TITLES/SUBTITLES)
html += '<div class="promo">\n';
if(banner) html += `<img src="${banner}" class="promo-img">\n`;
else html += `<div class="promo-img g1"></div>\n`;
html += '<div class="promo-overlay"></div>\n';
html += '</div>\n';

// POPULAR
html += '<section class="sec"><div class="wrap">\n';
html += '<div class="sec-head"><h2 class="sec-title">Popular Right Now</h2></div>\n';
html += '<div class="strip">\n';
const pop = [frieren, aot, violet, nge, vinland, dandadan, dungeon, mushishi, chainsaw, mob];
pop.forEach((img, i) => {
    html += `<article class="pc">`;
    html += `<div class="pc-img">`;
    if(img) html += `<img src="${img}">`;
    else html += `<div class="pc-fill g1"></div>`;
    html += `</div></article>\n`;
});
html += '</div>\n</div></section>\n';

// REVIEWS
const star = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
html += '<section class="sec"><div class="wrap">\n';
html += '<div class="sec-head"><h2 class="sec-title">Popular Reviews This Week</h2><a href="#" class="see-all">More</a></div>\n';
html += '<div class="rgrid">\n';

const revs = [
    {img:frieren, u:'-_mak_-', t:'Frieren', y:'2023', s:['sf','sf','sf','sf'], txt:'this is an incredibly beautiful meditation on the passage of time. every frame is a painting.', l:'64,763'},
    {img:aot, u:'seeta', t:'Attack on Titan', y:'2023', s:['sf','sf','sf','sf','sf'], txt:'this happened to my close personal friend eren once', l:'68,374'},
    {img:violet, u:'Dex', t:'Violet Evergarden', y:'2018', s:['sf','sf','sf','sf'], txt:'I hope kyoto animation is happy with this adaptation because i certainly am.', l:'63,530'},
    {img:nge, u:'JoshuaCaine', t:'Neon Genesis Evangelion', y:'1995', s:['sf','sf','sf','sf','sf'], txt:'Mecha: My Dad\'s Coming Home', l:'49,680'}
];
revs.forEach(r => {
    html += `<article class="rc">\n`;
    html += `<div class="rc-th">`;
    if(r.img) html += `<img src="${r.img}">`;
    else html += `<div class="g1" style="width:100%;height:100%"></div>`;
    html += `</div>\n`;
    html += `<div class="rc-body">\n`;
    html += `<div class="rc-meta"><span class="rc-av">${r.u[0]}</span><span class="rc-user">${r.u}</span></div>\n`;
    html += `<h3 class="rc-title">${r.t} <span class="rc-yr">${r.y}</span></h3>\n`;
    html += `<div class="rc-stars">`;
    r.s.forEach(s => { html += `<svg class="si" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`; });
    html += `</div>\n`;
    html += `<p class="rc-txt">${r.txt}</p>\n`;
    html += `<div class="rc-foot"><span class="rc-like"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Like review</span> ${r.l} likes</div>\n`;
    html += `</div>\n</article>\n`;
});
html += '</div>\n</div></section>\n';

// POPULAR LISTS
html += '<section class="sec"><div class="wrap">\n';
html += '<div class="sec-head"><h2 class="sec-title">Popular Lists</h2></div>\n';
html += '<div class="lgrid">\n';

const listData = [
    {imgs:[frieren, aot, nge, violet, vinland], title:'Letterboxd\'s Top 500 Anime', user:'Official Lists', f:'500', l:'405K'},
    {imgs:[mushishi, chainsaw, mob, dandadan, dungeon], title:'Animation That Broke The Internet', user:'sakugabooru', f:'120', l:'102K'},
    {imgs:[nge, violet, frieren, aot, vinland], title:'Existential Dread and Beautiful Scenery', user:'doomer_kun', f:'45', l:'89K'}
];
listData.forEach(l => {
    html += `<article class="lc">\n`;
    html += `<div class="lc-coll">`;
    l.imgs.forEach((img, idx) => {
        html += `<div class="lc-cell">`;
        if(img) html += `<img src="${img}">`;
        else html += `<div class="g1" style="width:100%;height:100%"></div>`;
        html += `</div>`;
    });
    html += `</div>\n`;
    html += `<h3 class="lc-title">${l.title}</h3>\n`;
    html += `<div class="lc-meta"><span class="lc-av"></span> <span style="font-weight:600;color:#fff">${l.user}</span></div>\n`;
    html += `<div class="lc-stats">${l.f} anime &nbsp;&hearts; ${l.l}</div>\n`;
    html += `</article>\n`;
});

html += '</div>\n</div></section>\n';

html += '</main></body></html>';
fs.writeFileSync('index.html', html, 'utf8');
console.log('HTML rewritten. Done.');
