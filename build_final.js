const fs = require('fs');

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

let h = '';
h += '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
h += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">\n';
h += '<title>Untitled \u2014 Track, Review & Discover Anime</title>\n';
h += '<link rel="preconnect" href="https://api.fontshare.com">\n';
h += '<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">\n';
h += '<style>\n';
h += ':root{\n';
h += '  --blue:#280DC2;--blue-soft:#E8E4FF;--blue-mid:#C4BEFF;\n';
h += '  --white:#FDF8F4;--orange:#F37510;--orange-soft:#FDEBD8;\n';
h += '  --ink:#222224;--cream:#F0EAE3;--cream-dk:#E4DDD5;--muted:#9B9593;\n';
h += '  --t-xs:11px;--t-sm:13px;--t-base:15px;--t-md:16px;--t-lg:20px;\n';
h += '  --t-xl:28px;--t-2xl:38px;\n';
h += '  --r-xs:3px;--r-sm:5px;--r-md:8px;--r-lg:10px;\n';
h += '  --sh-sm:0 1px 3px rgba(34,34,36,.07),0 1px 5px rgba(34,34,36,.04);\n';
h += '  --sh-md:0 3px 12px rgba(34,34,36,.09),0 1px 4px rgba(34,34,36,.05);\n';
h += '  --sh-lg:0 6px 24px rgba(34,34,36,.12),0 2px 8px rgba(34,34,36,.06);\n';
h += '  --sh-blue:0 4px 16px rgba(40,13,194,.32);\n';
h += '}\n';
h += '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n';
h += 'html{scroll-behavior:smooth;}\n';
h += 'body{font-family:"Satoshi",-apple-system,sans-serif;background:var(--white);color:var(--ink);font-size:var(--t-base);line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;}\n';
h += 'a{text-decoration:none;color:inherit;}\n';
h += 'button{font-family:inherit;cursor:pointer;border:none;background:none;}\n';
h += 'ul{list-style:none;}\n';
h += 'img{display:block;}\n';
h += '.wrap{max-width:1200px;margin:0 auto;padding:0 40px;}\n';

// NAV
h += '/* NAV */\n';
h += '.nav{position:sticky;top:0;z-index:200;height:56px;background:rgba(253,248,244,.94);backdrop-filter:blur(18px);border-bottom:1px solid var(--cream);}\n';
h += '.nav-in{height:100%;display:flex;align-items:center;}\n';
h += '.logo{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--blue);letter-spacing:-.5px;flex-shrink:0;}\n';
h += '.logo-sq{width:20px;height:20px;border-radius:4px;background:var(--blue);display:flex;align-items:center;justify-content:center;}\n';
h += '.logo-dot{width:5px;height:5px;border-radius:50%;background:var(--orange);display:block;}\n';
h += '.nav-mid{flex:1;display:flex;justify-content:center;}\n';
h += '.nav-links{display:flex;gap:2px;}\n';
h += '.nav-links a{font-size:13px;font-weight:500;color:var(--ink);padding:5px 12px;border-radius:5px;opacity:.6;transition:opacity .15s,background .15s;}\n';
h += '.nav-links a:hover{opacity:1;background:var(--cream);}\n';
h += '.nav-links a.active{opacity:1;color:var(--blue);background:var(--blue-soft);font-weight:600;}\n';
h += '.nav-end{flex-shrink:0;display:flex;align-items:center;gap:10px;}\n';
h += '.nav-btn-icon{width:32px;height:32px;border-radius:5px;display:flex;align-items:center;justify-content:center;opacity:.5;transition:opacity .15s,background .15s;}\n';
h += '.nav-btn-icon:hover{opacity:1;background:var(--cream);}\n';
h += '.btn-log{display:flex;align-items:center;gap:5px;background:var(--blue);color:#fff;font-size:13px;font-weight:600;padding:7px 15px;border-radius:6px;transition:transform .15s,box-shadow .15s;}\n';
h += '.btn-log:hover{transform:translateY(-1px);box-shadow:var(--sh-blue);}\n';
h += '.btn-log .plus{display:inline-flex;transition:transform .2s cubic-bezier(.34,1.56,.64,1);}\n';
h += '.btn-log:hover .plus{transform:rotate(45deg);}\n';
h += '.nav-av{width:30px;height:30px;border-radius:50%;border:2px solid var(--cream-dk);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;overflow:hidden;flex-shrink:0;}\n';

// SECTION STRUCTURE
h += '/* SECTION */\n';
h += '.main{padding:48px 0 96px;}\n';
h += '.sec{margin-bottom:64px;}\n';
h += '.sec-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;gap:16px;}\n';
h += '.sec-label{display:flex;align-items:center;gap:10px;}\n';
h += '.sec-bar{width:4px;height:24px;background:var(--orange);border-radius:2px;flex-shrink:0;}\n';
h += '.sec-title{font-size:var(--t-xl);font-weight:700;letter-spacing:-.6px;line-height:1;}\n';
h += '.sec-right{display:flex;align-items:center;gap:16px;flex-shrink:0;}\n';
h += '.see-all{font-size:13px;font-weight:600;color:var(--blue);opacity:.7;transition:opacity .15s;}\n';
h += '.see-all:hover{opacity:1;}\n';

// TOGGLE
h += '.tog{display:inline-flex;background:var(--cream);border-radius:5px;padding:3px;gap:2px;}\n';
h += '.tog button{font-size:13px;font-weight:500;color:var(--ink);opacity:.55;padding:4px 12px;border-radius:4px;transition:all .18s;white-space:nowrap;}\n';
h += '.tog button.on{background:#fff;opacity:1;color:var(--blue);font-weight:600;box-shadow:0 1px 3px rgba(34,34,36,.10);}\n';

// BADGES
h += '.bdg{display:inline-flex;align-items:center;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:2px 6px;border-radius:3px;line-height:1;}\n';
h += '.bdg-tv{background:var(--blue-soft);color:var(--blue);}\n';
h += '.bdg-film{background:var(--orange-soft);color:var(--orange);}\n';
h += '.bdg-new{background:var(--orange);color:#fff;}\n';
h += '.bdg-dark{background:rgba(0,0,0,.65);color:#fff;backdrop-filter:blur(4px);}\n';
h += '.rot-p{transform:rotate(1.5deg);}.rot-n{transform:rotate(-1.5deg);}\n';

// SCROLLABLE STRIP
h += '.strip{display:flex;gap:14px;overflow-x:auto;padding-bottom:14px;scrollbar-width:thin;scrollbar-color:var(--cream-dk) transparent;}\n';
h += '.strip::-webkit-scrollbar{height:4px;} .strip::-webkit-scrollbar-thumb{background:var(--cream-dk);border-radius:2px;}\n';

// ANIME POSTER CARD
h += '.pc{flex-shrink:0;width:148px;cursor:pointer;}\n';
h += '.pc-img{position:relative;width:148px;height:212px;border-radius:var(--r-md);overflow:hidden;background:var(--cream);box-shadow:var(--sh-sm);transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s;}\n';
h += '.pc:hover .pc-img{transform:translateY(-5px);box-shadow:var(--sh-lg);}\n';
h += '.pc-img img,.pc-img .pc-fill{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;}\n';
h += '.pc-rank{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;z-index:2;}\n';
h += '.pc-badge{position:absolute;bottom:8px;right:8px;z-index:2;}\n';
h += '.pc-grad{position:absolute;bottom:0;left:0;right:0;height:64px;background:linear-gradient(to top,rgba(0,0,0,.8),transparent);z-index:1;}\n';
h += '.pc-info{margin-top:8px;}\n';
h += '.pc-title{font-size:13px;font-weight:600;line-height:1.3;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}\n';
h += '.pc-meta{display:flex;align-items:center;justify-content:space-between;margin-top:4px;}\n';
h += '.pc-yr{font-size:11px;font-weight:500;color:var(--muted);}\n';
h += '.pc-rat{display:flex;align-items:center;gap:3px;font-size:11px;font-weight:700;color:var(--blue);}\n';
h += '.pc-rat svg{width:11px;height:11px;fill:var(--blue);}\n';

h += '.g1{background:linear-gradient(155deg,#0d1b2a,#1b3a5c,#2a6494);}\n';
h += '.g2{background:linear-gradient(155deg,#1a0608,#4a1018,#8b2030);}\n';
h += '.g3{background:linear-gradient(155deg,#1c1008,#3d2210,#6e3c18);}\n';
h += '.g4{background:linear-gradient(155deg,#080a1c,#14183c,#1e2862);}\n';
h += '.g5{background:linear-gradient(155deg,#0c0808,#241010,#3c1818);}\n';
h += '.g6{background:linear-gradient(155deg,#081c18,#143830,#1e5848);}\n';
h += '.g7{background:linear-gradient(155deg,#18080a,#38121a,#581e28);}\n';
h += '.g8{background:linear-gradient(155deg,#141408,#303018,#585830);}\n';

// PROMO BANNER
h += '/* PROMO BANNER */\n';
h += '.promo{position:relative;width:100%;height:320px;border-radius:var(--r-lg);overflow:hidden;margin-bottom:0;cursor:pointer;box-shadow:var(--sh-md);transition:box-shadow .2s;}\n';
h += '.promo:hover{box-shadow:var(--sh-lg);}\n';
h += '.promo-img{width:100%;height:100%;object-fit:cover;object-position:center 35%;display:block;}\n';
h += '.promo-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(10,8,20,.92) 0%,rgba(10,8,20,.7) 40%,rgba(10,8,20,.15) 70%,transparent 100%);}\n';
h += '.promo-body{position:absolute;top:0;left:0;bottom:0;display:flex;flex-direction:column;justify-content:center;padding:32px 40px;max-width:560px;z-index:2;}\n';
h += '.promo-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:12px;}\n';
h += '.promo-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--orange);}\n';
h += '.promo-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.4);flex-shrink:0;}\n';
h += '.promo-status{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:rgba(255,255,255,.6);}\n';
h += '.promo-title{font-size:32px;font-weight:700;color:#fff;letter-spacing:-.6px;line-height:1.1;margin-bottom:12px;}\n';
h += '.promo-desc{font-size:13px;color:rgba(255,255,255,.72);line-height:1.6;margin-bottom:20px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}\n';
h += '.promo-actions{display:flex;align-items:center;gap:12px;}\n';
h += '.promo-btn-primary{display:flex;align-items:center;gap:6px;background:#fff;color:var(--ink);font-size:13px;font-weight:700;padding:10px 20px;border-radius:6px;transition:background .15s;}\n';
h += '.promo-btn-primary:hover{background:rgba(255,255,255,.88);}\n';
h += '.promo-btn-secondary{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.9);font-size:13px;font-weight:600;padding:10px 18px;border-radius:6px;backdrop-filter:blur(4px);transition:background .15s;}\n';
h += '.promo-btn-secondary:hover{background:rgba(255,255,255,.18);}\n';
h += '.promo-score{position:absolute;bottom:24px;right:32px;text-align:right;z-index:2;}\n';
h += '.promo-score-num{font-size:36px;font-weight:700;color:#fff;letter-spacing:-1px;line-height:1;}\n';
h += '.promo-score-label{font-size:11px;font-weight:600;color:rgba(255,255,255,.5);margin-top:2px;}\n';
h += '.promo-stars{display:flex;gap:2px;justify-content:flex-end;margin-top:4px;}\n';
h += '.promo-stars svg{width:13px;height:13px;fill:var(--orange);}\n';

// TRAILERS
h += '/* TRAILERS */\n';
h += '.tc{flex-shrink:0;width:270px;cursor:pointer;}\n';
h += '.tc-thumb{position:relative;width:270px;height:152px;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--sh-sm);transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s;}\n';
h += '.tc:hover .tc-thumb{transform:translateY(-3px);box-shadow:var(--sh-lg);}\n';
h += '.tc-fill{position:absolute;inset:0;width:100%;height:100%;}\n';
h += '.tc-dark{position:absolute;inset:0;background:rgba(0,0,0,.32);display:flex;align-items:center;justify-content:center;transition:background .2s;}\n';
h += '.tc:hover .tc-dark{background:rgba(0,0,0,.18);}\n';
h += '.tc-play{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.94);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;box-shadow:0 2px 12px rgba(0,0,0,.25);}\n';
h += '.tc:hover .tc-play{transform:scale(1.1);box-shadow:0 4px 20px rgba(0,0,0,.3);}\n';
h += '.tc-dur{position:absolute;bottom:7px;right:8px;background:rgba(0,0,0,.75);color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:3px;}\n';
h += '.tc-top{position:absolute;top:8px;left:8px;display:flex;gap:4px;}\n';
h += '.tc-info{margin-top:9px;}\n';
h += '.tc-title{font-size:13px;font-weight:700;color:var(--ink);line-height:1.3;}\n';
h += '.tc-meta{font-size:11px;color:var(--muted);font-weight:500;margin-top:3px;}\n';
h += '.v1{background:linear-gradient(155deg,#0d1b2a,#1b3a5c,#2a5080);}\n';
h += '.v2{background:linear-gradient(155deg,#1a0608,#5a1020,#8b2030);}\n';
h += '.v3{background:linear-gradient(155deg,#100818,#2a1040,#5b2090);}\n';
h += '.v4{background:linear-gradient(155deg,#1c1008,#4d2810,#7e4018);}\n';
h += '.v5{background:linear-gradient(155deg,#0a1c10,#1a4030,#2d6440);}\n';

// SEASON GRID
h += '/* SEASON */\n';
h += '.sg{display:grid;grid-template-columns:repeat(7,1fr);gap:12px;}\n';
h += '.day-h{font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}\n';
h += '.day-h.td{color:var(--blue);}\n';
h += '.ep{position:relative;background:#fff;border:1px solid var(--cream);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--sh-sm);cursor:pointer;transition:transform .15s,box-shadow .15s;}\n';
h += '.ep:hover{transform:translateY(-2px);box-shadow:var(--sh-md);}\n';
h += '.ep-cov{width:100%;aspect-ratio:2/3;position:relative;overflow:hidden;}\n';
h += '.ep-cov-fill,.ep-cov img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s;}\n';
h += '.ep:hover .ep-cov-fill,.ep:hover .ep-cov img{transform:scale(1.05);}\n';
h += '.ep.wd .ep-cov::after{content:"";position:absolute;inset:0;background:rgba(40,13,194,.12);}\n';
h += '.ep.na .ep-cov{filter:grayscale(40%) opacity(.72);}\n';
h += '.ep-chk{position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;z-index:3;}\n';
h += '.ep-body{padding:6px 7px 8px;}\n';
h += '.ep-name{font-size:10px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}\n';
h += '.ep-time{font-size:10px;font-weight:500;color:var(--muted);margin-top:2px;}\n';
h += '.ep-time.up{color:var(--orange);}\n';
h += '.ep-btn{display:flex;align-items:center;justify-content:center;gap:3px;width:100%;margin-top:5px;padding:4px;font-size:10px;font-weight:600;color:var(--blue);background:var(--blue-soft);border-radius:4px;transition:background .15s;}\n';
h += '.ep-btn:hover{background:var(--blue-mid);}\n';

// RECENTLY LOGGED
h += '/* LOGGED */\n';
h += '.rl-live{display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:10px 14px;background:var(--cream);border-radius:var(--r-sm);}\n';
h += '.rl-pulse{width:7px;height:7px;border-radius:50%;background:#E03535;animation:pulse 1.8s ease infinite;flex-shrink:0;}\n';
h += '@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.45;transform:scale(.8);}}\n';
h += '.rl-txt{font-size:12px;font-weight:600;color:var(--ink);}\n';
h += '.rl-cnt{font-size:12px;font-weight:700;color:var(--blue);}\n';
h += '.rl-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:8px;}\n';
h += '.rl-item{position:relative;border-radius:var(--r-sm);overflow:hidden;aspect-ratio:2/3;cursor:pointer;box-shadow:var(--sh-sm);transition:transform .15s;}\n';
h += '.rl-item:hover{transform:scale(1.05);z-index:2;}\n';
h += '.rl-item-fill{width:100%;height:100%;}\n';
h += '.rl-av{position:absolute;bottom:4px;left:4px;width:16px;height:16px;border-radius:50%;border:1.5px solid rgba(255,255,255,.9);font-size:7px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;z-index:2;}\n';
h += '.rl-rating{position:absolute;top:3px;right:4px;background:rgba(0,0,0,.68);color:var(--orange);font-size:8px;font-weight:700;padding:1px 4px;border-radius:3px;z-index:2;}\n';

// REVIEWS
h += '/* REVIEWS */\n';
h += '.rfeed{display:grid;grid-template-columns:1fr 1fr;gap:24px;}\n';
h += '.rc{display:flex;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--cream);}\n';
h += '.rc:nth-last-child(-n+2){border-bottom:none;padding-bottom:0;}\n';
h += '.rc-th{width:85px;height:125px;border-radius:var(--r-sm);overflow:hidden;flex-shrink:0;box-shadow:var(--sh-sm);border:1px solid var(--cream-dk);}\n';
h += '.rc-th img{width:100%;height:100%;object-fit:cover;display:block;}\n';
h += '.rc-body{flex:1;}\n';
h += '.rc-meta{display:flex;align-items:center;gap:8px;margin-bottom:6px;}\n';
h += '.rc-av{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;}\n';
h += '.rc-user{font-size:13px;font-weight:700;color:var(--ink);}\n';
h += '.rc-title{font-size:18px;font-weight:700;color:var(--ink);line-height:1.2;margin-bottom:2px;}\n';
h += '.rc-yr{font-size:13px;font-weight:500;color:var(--muted);margin-left:4px;}\n';
h += '.rc-stars{display:flex;align-items:center;gap:2px;margin-bottom:10px;}\n';
h += '.si{width:14px;height:14px;} .sf{fill:var(--orange);} .sh{fill:var(--orange);opacity:.5;} .se{fill:var(--cream-dk);}\n';
h += '.rc-score{font-size:12px;font-weight:700;color:var(--orange);margin-left:6px;}\n';
h += '.rc-txt{font-size:13px;line-height:1.55;color:var(--ink);opacity:.9;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}\n';
h += '.rc-foot{display:flex;align-items:center;gap:16px;margin-top:12px;}\n';
h += '.rc-like{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:color .15s;}\n';
h += '.rc-like:hover{color:var(--ink);}\n';
h += '.rc-like svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;}\n';
h += '.rc-like.lkd{color:#E03535;} .rc-like.lkd svg{fill:currentColor;stroke:none;}\n';
h += '.rc-comments{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--muted);}\n';
h += '.rc-comments svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;}\n';

// LISTS
h += '/* LISTS */\n';
h += '.lgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}\n';
h += '.lc{cursor:pointer;}\n';
h += '.lc-coll{display:flex;position:relative;height:150px;width:100%;overflow:hidden;margin-bottom:12px;padding-left:15px;}\n';
h += '.lc-cell{width:100px;height:150px;position:absolute;border:1px solid rgba(255,255,255,.4);border-radius:var(--r-sm);overflow:hidden;box-shadow:-4px 0 12px rgba(0,0,0,.15);transition:transform .2s cubic-bezier(.4,0,.2,1);background:var(--cream);}\n';
h += '.lc-cell img{width:100%;height:100%;object-fit:cover;display:block;}\n';
h += '.lc-cell:nth-child(1){left:0;z-index:5;}\n';
h += '.lc-cell:nth-child(2){left:35px;z-index:4;}\n';
h += '.lc-cell:nth-child(3){left:70px;z-index:3;}\n';
h += '.lc-cell:nth-child(4){left:105px;z-index:2;}\n';
h += '.lc-cell:nth-child(5){left:140px;z-index:1;}\n';
h += '.lc:hover .lc-cell:nth-child(1){transform:translateX(-6px);}\n';
h += '.lc:hover .lc-cell:nth-child(2){transform:translateX(-3px);}\n';
h += '.lc-title{font-size:15px;font-weight:700;color:var(--ink);line-height:1.25;margin-bottom:6px;}\n';
h += '.lc-auth{display:flex;align-items:center;gap:6px;margin-bottom:6px;}\n';
h += '.lc-av{width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;}\n';
h += '.lc-an{font-size:12px;font-weight:600;color:var(--ink);}\n';
h += '.lc-stats{display:flex;align-items:center;gap:12px;font-size:11px;font-weight:600;color:var(--muted);}\n';
h += '.lc-stat{display:flex;align-items:center;gap:3px;} .lc-stat svg{width:12px;height:12px;fill:currentColor;}\n';
h += '.lc-stat.lk{fill:none;stroke:currentColor;stroke-width:2;}\n';

// NEWS
h += '/* NEWS */\n';
h += '.nws-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}\n';
h += '.nc{cursor:pointer;}\n';
h += '.nc-img{position:relative;width:100%;aspect-ratio:16/9;border-radius:var(--r-md);overflow:hidden;box-shadow:var(--sh-sm);transition:transform .2s, box-shadow .2s;margin-bottom:12px;}\n';
h += '.nc:hover .nc-img{transform:translateY(-2px);box-shadow:var(--sh-md);}\n';
h += '.nc-img img{width:100%;height:100%;object-fit:cover;}\n';
h += '.nc-cat{font-size:10px;font-weight:700;color:var(--blue);letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px;}\n';
h += '.nc-title{font-size:14px;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}\n';
h += '.nc-date{font-size:11px;font-weight:500;color:var(--muted);}\n';

// AVATARS
h += '.av1{background:linear-gradient(135deg,#280DC2,#5030D8);}\n';
h += '.av2{background:linear-gradient(135deg,#F37510,#E05500);}\n';
h += '.av3{background:linear-gradient(135deg,#0a7060,#0d5548);}\n';
h += '.av4{background:linear-gradient(135deg,#8e24aa,#5c1891);}\n';
h += '.av5{background:linear-gradient(135deg,#b5451b,#8b2810);}\n';

// FOOTER
h += '/* FOOTER */\n';
h += '.ft{background:var(--cream);padding:64px 0 32px;margin-top:32px;}\n';
h += '.ft-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px;}\n';
h += '.ft-brand{display:flex;flex-direction:column;gap:12px;}\n';
h += '.ft-logo{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:700;color:var(--blue);letter-spacing:-.5px;}\n';
h += '.ft-desc{font-size:13px;color:var(--muted);line-height:1.6;max-width:280px;}\n';
h += '.ft-col-title{font-size:12px;font-weight:700;color:var(--ink);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;}\n';
h += '.ft-links{display:flex;flex-direction:column;gap:10px;}\n';
h += '.ft-links a{font-size:13px;font-weight:500;color:var(--muted);transition:color .15s;}\n';
h += '.ft-links a:hover{color:var(--blue);}\n';
h += '.ft-bottom{padding-top:24px;border-top:1px solid var(--cream-dk);display:flex;align-items:center;justify-content:space-between;}\n';
h += '.ft-copy{font-size:12px;font-weight:500;color:var(--muted);}\n';

h += '</style></head><body>\n';

const srSvg = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
const playIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="var(--blue)"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
const chk = '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
const mrk = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
const hrtF = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
const hrtL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
const msgSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

// NAV HTML
h += '<nav class="nav">\n<div class="wrap nav-in">\n';
h += '<a href="/" class="logo"><div class="logo-sq"><span class="logo-dot"></span></div>untitled</a>\n';
h += '<div class="nav-mid"><ul class="nav-links">';
['Home','Series','Movies','Profile'].forEach((t,i)=>{ h += `<li><a href="${i===0?'/':'/'+t.toLowerCase()}" ${i===0?'class="active"':''}>${t}</a></li>`; });
h += '</ul></div>\n';
h += '<div class="nav-end">';
h += '<button class="nav-btn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>';
h += '<button class="btn-log"><span class="plus"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>Log</button>';
h += '<div class="nav-av av1">M</div>';
h += '</div>\n</div>\n</nav>\n<main class="main">\n';

// POPULAR
h += '<section class="sec" style="margin-top:48px;"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">Popular Right Now</h2></div>';
h += '<div class="sec-right"><div class="tog" id="tp"><button class="on" onclick="tog(this,\'tp\')">This Season</button><button onclick="tog(this,\'tp\')">All Time</button></div><a href="/series?sort=popular" class="see-all">See all &rarr;</a></div>';
h += '</div>\n<div class="strip">\n';

const pop = [
  {img:frieren, title:"Frieren: Beyond Journey's End", yr:'2023', rat:'9.4', type:'TV', rot:'rot-n'},
  {img:aot, title:'Attack on Titan: Final Season', yr:'2023', rat:'9.2', type:'TV', rot:'rot-p'},
  {img:violet, title:'Violet Evergarden', yr:'2018', rat:'9.1', type:'TV', rot:'rot-n'},
  {img:nge, title:'Neon Genesis Evangelion', yr:'1995', rat:'9.0', type:'TV', rot:'rot-p'},
  {img:vinland, title:'Vinland Saga', yr:'2019', rat:'8.9', type:'TV', rot:'rot-n'},
  {img:mushishi, fill:'g3', title:'Mushishi', yr:'2005', rat:'8.8', type:'TV', rot:'rot-p'},
  {img:chainsaw, fill:'g5', title:'Chainsaw Man', yr:'2022', rat:'8.7', type:'TV', rot:'rot-n'},
  {img:mob, fill:'g4', title:'Mob Psycho 100', yr:'2016', rat:'8.7', type:'TV', rot:'rot-p'},
  {img:dandadan, fill:'g6', title:'Dandadan', yr:'2024', rat:'8.6', type:'TV', rot:'rot-n'},
  {img:dungeon, fill:'g7', title:'Delicious in Dungeon', yr:'2024', rat:'8.6', type:'TV', rot:'rot-p'},
];
pop.forEach((c, i) => {
  h += `<article class="pc">\n`;
  h += `<div class="pc-img">\n`;
  if (c.img) h += `<img src="${c.img}" loading="lazy">\n`;
  else h += `<div class="pc-fill ${c.fill}"></div>\n`;
  h += `<span class="pc-rank">#${i+1}</span>\n`;
  h += `<span class="pc-badge bdg bdg-tv ${c.rot}">${c.type}</span>\n`;
  h += `<div class="pc-grad"></div>\n`;
  h += `</div>\n`;
  h += `<div class="pc-info"><p class="pc-title">${c.title}</p>`;
  h += `<div class="pc-meta"><span class="pc-yr">${c.yr}</span><span class="pc-rat">${srSvg}${c.rat}</span></div></div>\n`;
  h += `</article>\n`;
});
h += '</div>\n</div></section>\n';

// PROMO BANNER (RESTORED TEXT/OVERLAY)
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="promo">\n';
if(banner) h += `<img src="${banner}" class="promo-img">\n`;
else h += `<div class="promo-img g1"></div>\n`;
h += '<div class="promo-overlay"></div>\n';
h += '<div class="promo-body">\n';
h += '  <div class="promo-eyebrow"><span class="promo-label">Sponsored</span><span class="promo-dot"></span><span class="promo-status">Currently Airing</span></div>\n';
h += '  <h3 class="promo-title">Frieren: Beyond<br>Journey\'s End</h3>\n';
h += '  <p class="promo-desc">An elven mage journeys through a world she once saved, reckoning with time, grief, and what it means to truly know another person.</p>\n';
h += '  <div class="promo-actions">\n';
h += '    <a href="/anime/frieren" class="promo-btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>View series</a>\n';
h += '    <button class="promo-btn-secondary"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add to list</button>\n';
h += '  </div>\n';
h += '</div>\n';
h += '<div class="promo-score">\n';
h += '  <div class="promo-score-num">9.4</div>\n';
h += '  <div class="promo-stars">';
for(let i=0;i<5;i++) h += '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
h += '</div>\n';
h += '  <div class="promo-score-label">Community score</div>\n';
h += '</div>\n';
h += '</div>\n</div></section>\n';


// TRAILERS
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">New Trailers</h2></div>';
h += '<a href="/trailers" class="see-all">See all &rarr;</a>';
h += '</div>\n<div class="strip">\n';

const trailers = [
  {fill:'v1', lbl:'TRAILER', dur:'1:32', title:"Frieren: Beyond Journey's End", meta:'Madhouse \u00b7 Fall 2023'},
  {fill:'v2', lbl:'TRAILER', dur:'2:01', title:'Attack on Titan: The Final Chapters', meta:'MAPPA \u00b7 2023'},
  {fill:'v3', lbl:'TEASER', dur:'0:45', title:'Vinland Saga Season 3', meta:'MAPPA \u00b7 Coming 2025'},
  {fill:'v4', lbl:'TRAILER', dur:'1:48', title:'Delicious in Dungeon S2', meta:'Trigger \u00b7 2025'},
  {fill:'v5', lbl:'PV', dur:'1:14', title:'Dandadan Season 2', meta:'Science SARU \u00b7 Announced'},
];
trailers.forEach(t => {
  h += `<article class="tc"><div class="tc-thumb"><div class="tc-fill ${t.fill}"></div>`;
  h += `<div class="tc-dark"><div class="tc-play">${playIcon}</div></div>`;
  h += `<div class="tc-top"><span class="bdg bdg-dark">${t.lbl}</span></div>`;
  h += `<span class="tc-dur">${t.dur}</span></div>`;
  h += `<div class="tc-info"><p class="tc-title">${t.title}</p><p class="tc-meta">${t.meta}</p></div></article>\n`;
});
h += '</div>\n</div></section>\n';

// THIS SEASON
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">This Season</h2></div>';
h += '<div class="sec-right"><div class="tog" id="ts"><button class="on" onclick="tog(this,\'ts\')">Weekly</button><button onclick="tog(this,\'ts\')">Full Season</button></div></div>';
h += '</div>\n<div class="sg">\n';
const days = [
  {lbl:'Mon', today:false, fill:'g8', img:frieren, name:'Spy x Family', ep:'Ep 28', time:'23:00', state:'available'},
  {lbl:'Tue', today:false, fill:'g1', img:dandadan, name:'Dandadan', ep:'Ep 14', time:'00:30', state:'watched'},
  {lbl:'Wed', today:true, fill:'g3', img:dungeon, name:'Delicious in Dungeon', ep:'Ep 22', time:'23:30', state:'available'},
  {lbl:'Thu', today:false, fill:'g2', img:frieren, name:'Frieren', ep:'Ep 27', time:'23:00', state:'available'},
  {lbl:'Fri', today:false, fill:null, img:vinland, name:'Vinland Saga S3', ep:'', time:'Fri \u00b7 24:00', state:'upcoming'},
  {lbl:'Sat', today:false, fill:'g4', img:mob, name:'Mob Psycho 100 S3', ep:'', time:'Sat \u00b7 23:30', state:'upcoming'},
  {lbl:'Sun', today:false, fill:'g7', img:null, name:'Bleach: TYBW', ep:'', time:'Sun \u00b7 17:30', state:'upcoming'},
];
days.forEach(d => {
  const cls = d.state === 'watched' ? 'ep wd' : d.state === 'upcoming' ? 'ep na' : 'ep';
  h += `<div>\n<p class="day-h${d.today?' td':''}">${d.lbl}</p>\n`;
  h += `<article class="${cls}">\n`;
  h += `<div class="ep-cov"${d.state==='watched'?' style="position:relative"':''}>\n`;
  if (d.img) { h += `<img src="${d.img}" loading="lazy">\n`; }
  else if (d.fill) { h += `<div class="ep-cov-fill ${d.fill}"></div>\n`; }
  if (d.state==='watched') h += `<div class="ep-chk">${chk}</div>\n`;
  h += `</div>\n<div class="ep-body">\n<p class="ep-name">${d.name}</p>\n`;
  const timeStr = d.ep ? `${d.ep} &middot; ${d.time}` : d.time;
  h += `<p class="ep-time${d.state==='upcoming'?' up':''}">${timeStr}</p>\n`;
  if (d.state === 'available') h += `<button class="ep-btn">${mrk}Mark watched</button>\n`;
  h += `</div>\n</article>\n</div>\n`;
});
h += '</div>\n</div></section>\n';

// RECENTLY LOGGED
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">Recently Logged</h2></div>';
h += '<a href="/activity" class="see-all">See all &rarr;</a>';
h += '</div>\n';
h += '<div class="rl-live"><span class="rl-pulse"></span><span class="rl-txt">Live &nbsp;\u2014&nbsp;</span><span class="rl-cnt" id="cnt">2,847</span><span class="rl-txt">&nbsp;entries logged in the last hour</span></div>\n';
h += '<div class="rl-grid">\n';
const fills = ['g1','g3','g5','g2','g8','g7','g4','g6','v1','v2','v3','v4'];
const avCls = ['av1','av2','av3','av4','av5','av1','av2','av3','av4','av5','av1','av2'];
const avLbl = ['M','R','T','J','K','A','S','L','N','V','C','D'];
const rats = ['5.0','4.0','4.5','3.5','5.0','4.0','3.0','4.5','5.0','4.0','3.5','4.5'];
const imgs = [frieren, aot, violet, nge, vinland, dandadan, dungeon, mushishi, chainsaw, mob, null, null];
for(let i=0;i<12;i++){
  h += `<div class="rl-item">\n`;
  if(imgs[i]) h += `<img src="${imgs[i]}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;display:block;">\n`;
  else h += `<div class="rl-item-fill ${fills[i]}"></div>\n`;
  h += `<div class="rl-av ${avCls[i]}">${avLbl[i]}</div>\n`;
  h += `<span class="rl-rating">${rats[i]}</span>\n`;
  h += `</div>\n`;
}
h += '</div>\n</div></section>\n';

// REVIEWS
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">From People You Follow</h2></div>';
h += '<a href="/reviews/following" class="see-all">See all &rarr;</a>';
h += '</div>\n<div class="rfeed">\n';

const revs = [
  {av:'av1',avL:'M',fill:frieren,user:'maisie.watches',anime:"Frieren: Beyond Journey's End",yr:'2023',stars:['sf','sf','sf','sf','sf'],score:'5.0',text:"There is something quietly devastating about a story that measures time in centuries. Frieren does not mourn loudly \u2014 it lets grief accumulate the way sediment does, slowly and imperceptibly, until you realize the weight of it. The most emotionally honest anime I have seen in years.",likes:'142',comments:'18',liked:true},
  {av:'av2',avL:'R',fill:vinland,user:'reelhouse_rina',anime:'Vinland Saga Season 2',yr:'2023',stars:['sf','sf','sf','sf','se'],score:'4.0',text:"Season 2 asks you to sit with boredom on purpose \u2014 one of the bravest structural choices I have seen in anime. After the relentless violence of S1, watching Thorfinn work a field is almost confrontational. The show trusts you. Most people won\u2019t have the patience. That is their loss.",likes:'87',comments:'11',liked:false},
  {av:'av3',avL:'T',fill:aot,user:'tankobonista',anime:'Chainsaw Man',yr:'2022',stars:['sf','sf','sf','sf','sh'],score:'4.5',text:"MAPPA decided every episode would look like a feature film and they delivered. Chainsaw Man is cinema cosplaying as a seasonal anime. Fujimoto\u2019s nightmare logic translates better than anyone had the right to expect. The OP alone justifies a full tier list reconsideration.",likes:'63',comments:'7',liked:false},
  {av:'av4',avL:'J',fill:nge,user:'joshuacaine',anime:'Neon Genesis Evangelion',yr:'1995',stars:['sf','sf','sf','sf','sf'],score:'5.0',text:"Mecha: My Dad's Coming Home",likes:'204',comments:'45',liked:false}
];
revs.forEach(r => {
  h += `<article class="rc">\n`;
  h += `<div class="rc-th">`;
  if (r.fill) h += `<img src="${r.fill}" loading="lazy">`;
  else h += `<div class="g1" style="width:100%;height:100%"></div>`;
  h += `</div>\n`;
  h += `<div class="rc-body">\n`;
  h += `<div class="rc-meta"><div class="rc-av ${r.av}">${r.avL}</div><span class="rc-user">${r.user}</span></div>`;
  h += `<h3 class="rc-title">${r.anime} <span class="rc-yr">${r.yr}</span></h3>`;
  h += `<div class="rc-stars">${r.stars.map(s=>'<svg class="si '+s+'" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>').join('')}<span class="rc-score">${r.score}</span></div>\n`;
  h += `<p class="rc-txt">${r.text}</p>\n`;
  h += `<div class="rc-foot">`;
  h += `<button class="rc-like ${r.liked?'lkd':''}">${r.liked?hrtF:hrtL} <span>${r.liked?'Liked':'Like review'}</span> ${r.likes} likes</button>`;
  h += `<span class="rc-comments">${msgSvg} ${r.comments}</span>`;
  h += `</div>\n</div></article>\n`;
});
h += '</div>\n</div></section>\n';

// POPULAR LISTS 
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">Popular Lists</h2></div>';
h += '<a href="/lists" class="see-all">Browse all &rarr;</a>';
h += '</div>\n<div class="lgrid">\n';

const lists = [
  {imgs:[frieren,aot,vinland,nge,violet], av:'av1',avL:'M',user:'animelogger',title:'The definitive ranking of every MAPPA production (2011\u20132024)',count:'34',likes:'2.4k'},
  {imgs:[mushishi,chainsaw,mob,dandadan,dungeon], av:'av2',avL:'R',user:'reelhouse_rina',title:"Anime I'd recommend to people who hate anime",count:'12',likes:'1.8k'},
  {imgs:[nge,violet,frieren,aot,vinland], av:'av3',avL:'T',user:'tankobonista',title:'Films that made me pause and just stare at the ceiling',count:'19',likes:'1.1k'}
];

lists.forEach(l => {
  h += `<article class="lc">\n<div class="lc-coll">\n`;
  l.imgs.forEach((img, i) => {
    h += `<div class="lc-cell">`;
    if(img) h += `<img src="${img}" loading="lazy">`;
    else h += `<div class="g${i+1}" style="width:100%;height:100%"></div>`;
    h += `</div>\n`;
  });
  h += `</div>\n`;
  h += `<h3 class="lc-title">${l.title}</h3>`;
  h += `<div class="lc-auth"><div class="lc-av ${l.av}">${l.avL}</div><span class="lc-an">${l.user}</span></div>`;
  h += `<div class="lc-stats">`;
  h += `<span class="lc-stat"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>${l.count} titles</span>`;
  h += `<span class="lc-stat"><svg class="lk" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>${l.likes}</span>`;
  h += `</div>\n</article>\n`;
});
h += '</div>\n</div></section>\n';

// NEW SECTION: ANIME NEWS & UPDATES
h += '<section class="sec"><div class="wrap">\n';
h += '<div class="sec-head">';
h += '<div class="sec-label"><span class="sec-bar"></span><h2 class="sec-title">Anime News & Updates</h2></div>';
h += '<a href="/news" class="see-all">Read more &rarr;</a>';
h += '</div>\n<div class="nws-grid">\n';

const news = [
  {img:mushishi, cat:'Feature', title:'The Quiet Mastery of Mushishi: Why we still need slow anime in 2024', date:'Oct 12, 2024'},
  {img:chainsaw, cat:'Industry', title:'MAPPA announces major restructuring following Chainsaw Man production cycle', date:'Oct 10, 2024'},
  {img:mob, cat:'Review', title:'Looking back at Mob Psycho 100: A perfect trilogy of coming-of-age stories', date:'Oct 08, 2024'},
  {img:dungeon, cat:'Announcement', title:'Delicious in Dungeon Season 2 officially greenlit by Studio Trigger', date:'Oct 05, 2024'},
];

news.forEach(n => {
  h += `<article class="nc">\n`;
  h += `<div class="nc-img">`;
  if(n.img) h += `<img src="${n.img}" loading="lazy">`;
  else h += `<div class="g1" style="width:100%;height:100%"></div>`;
  h += `</div>\n`;
  h += `<div class="nc-cat">${n.cat}</div>\n`;
  h += `<h3 class="nc-title">${n.title}</h3>\n`;
  h += `<div class="nc-date">${n.date}</div>\n`;
  h += `</article>\n`;
});

h += '</div>\n</div></section>\n';


// FULL SITEMAP FOOTER
h += '</main>\n';
h += '<footer class="ft"><div class="wrap">\n';
h += '<div class="ft-grid">\n';
h += '  <div class="ft-brand">\n';
h += '    <div class="ft-logo"><div class="logo-sq"><span class="logo-dot"></span></div>untitled</div>\n';
h += '    <p class="ft-desc">The anime community for people who take watching seriously. Track your series, write reviews, and discover what is truly worth your time.</p>\n';
h += '  </div>\n';
h += '  <div>\n';
h += '    <h4 class="ft-col-title">Platform</h4>\n';
h += '    <div class="ft-links"><a href="#">About Us</a><a href="#">Features</a><a href="#">Pro Subscriptions</a><a href="#">API Documentation</a><a href="#">Contact</a></div>\n';
h += '  </div>\n';
h += '  <div>\n';
h += '    <h4 class="ft-col-title">Community</h4>\n';
h += '    <div class="ft-links"><a href="#">Guidelines</a><a href="#">Discussions</a><a href="#">Leaderboards</a><a href="#">Help Center</a></div>\n';
h += '  </div>\n';
h += '  <div>\n';
h += '    <h4 class="ft-col-title">Legal</h4>\n';
h += '    <div class="ft-links"><a href="#">Terms of Service</a><a href="#">Privacy Policy</a><a href="#">Cookie Policy</a></div>\n';
h += '  </div>\n';
h += '</div>\n';
h += '<div class="ft-bottom">\n';
h += '  <div class="ft-copy">&copy; 2026 Untitled Anime Platform. All rights reserved.</div>\n';
h += '  <div style="display:flex;gap:12px;color:var(--muted);">\n';
h += '    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>\n';
h += '    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>\n';
h += '  </div>\n';
h += '</div>\n';
h += '</div></footer>\n';

// SCRIPTS
h += '<script>\n';
h += 'function tog(btn,id){document.getElementById(id).querySelectorAll("button").forEach(b=>b.classList.remove("on"));btn.classList.add("on");}\n';
h += 'document.querySelectorAll(".ep-btn").forEach(b=>{b.addEventListener("click",function(e){e.stopPropagation();const card=this.closest(".ep");card.classList.add("wd");const cov=card.querySelector(".ep-cov");cov.style.position="relative";const chk=document.createElement("div");chk.className="ep-chk";chk.innerHTML=\'<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>\';cov.appendChild(chk);this.remove();});});\n';
h += 'document.querySelectorAll(".rc-like").forEach(b=>{b.addEventListener("click",function(){const wasLiked=this.classList.contains("lkd");this.classList.toggle("lkd");const span=this.querySelector("span");if(span)span.textContent=wasLiked?"Like review":"Liked";});});\n';
h += 'const cnt=document.getElementById("cnt");if(cnt){setInterval(()=>{const n=parseInt(cnt.textContent.replace(/,/g,""));cnt.textContent=(n+Math.floor(Math.random()*4+1)).toLocaleString();},3800);}\n';
h += '</script>\n</body></html>';

fs.writeFileSync('index.html', h, 'utf8');
console.log('HTML rewritten with news and footer. Done.');
