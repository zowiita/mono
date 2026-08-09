const fs = require('fs');

const getImg = (name) => {
    if (fs.existsSync('images/' + name + '.jpg')) return 'images/' + name + '.jpg';
    if (fs.existsSync('images/' + name + '.png')) return 'images/' + name + '.png';
    return null;
};

const banner = getImg('banner');

let h = '';
h += '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
h += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">\n';
h += '<title>Miwazoe\'s Profile \u2014 Untitled</title>\n';
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
h += '}\n';
h += '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n';
h += 'html{scroll-behavior:smooth;}\n';
h += 'body{font-family:"Satoshi",-apple-system,sans-serif;background:var(--white);color:var(--ink);font-size:var(--t-base);line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;}\n';
h += 'a{text-decoration:none;color:inherit;}\n';
h += 'button{font-family:inherit;cursor:pointer;border:none;background:none;}\n';
h += 'ul{list-style:none;}\n';
h += 'img{display:block;}\n';
h += '.wrap{max-width:1100px;margin:0 auto;padding:0 40px;}\n';

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
h += '.nav-av{width:30px;height:30px;border-radius:50%;border:2px solid var(--cream-dk);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;overflow:hidden;flex-shrink:0;}\n';

// GRADIENTS
h += '.g1{background:linear-gradient(155deg,#0d1b2a,#1b3a5c,#2a6494);}\n';
h += '.g2{background:linear-gradient(155deg,#1a0608,#4a1018,#8b2030);}\n';
h += '.g3{background:linear-gradient(155deg,#1c1008,#3d2210,#6e3c18);}\n';
h += '.g4{background:linear-gradient(155deg,#080a1c,#14183c,#1e2862);}\n';
h += '.av1{background:linear-gradient(135deg,#280DC2,#5030D8);}\n';

// PROFILE HEADER
h += '/* PROFILE HEADER */\n';
h += '.ph{margin-bottom:48px;}\n';
h += '.ph-banner{width:100%;height:260px;background:var(--cream);border-radius:0 0 var(--r-lg) var(--r-lg);overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;}\n';
h += '.ph-banner-empty{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px;cursor:pointer;transition:color .15s;}\n';
h += '.ph-banner-empty:hover{color:var(--ink);}\n';
h += '.ph-main{position:relative;margin-top:-60px;display:flex;align-items:flex-end;gap:24px;padding:0 24px;margin-bottom:24px;}\n';
h += '.ph-av{width:140px;height:140px;border-radius:50%;border:4px solid var(--white);background:var(--cream);overflow:hidden;position:relative;z-index:10;box-shadow:var(--sh-md);flex-shrink:0;cursor:pointer;}\n';
h += '.ph-av img{width:100%;height:100%;object-fit:cover;}\n';
h += '.ph-av-hover{position:absolute;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:600;opacity:0;transition:opacity .15s;}\n';
h += '.ph-av:hover .ph-av-hover{opacity:1;}\n';
h += '.ph-info{flex:1;padding-bottom:12px;}\n';
h += '.ph-name{font-size:32px;font-weight:700;color:var(--ink);line-height:1.1;letter-spacing:-1px;}\n';
h += '.ph-actions{padding-bottom:12px;flex-shrink:0;display:flex;gap:12px;}\n';
h += '.ph-btn{background:var(--blue);color:#fff;font-size:13px;font-weight:600;padding:8px 20px;border-radius:6px;transition:background .15s;}\n';
h += '.ph-btn:hover{background:var(--blue-mid);}\n';

// PROFILE NAV
h += '.pn{display:flex;gap:24px;border-bottom:1px solid var(--cream-dk);padding:0 24px;}\n';
h += '.pn a{font-size:14px;font-weight:600;color:var(--muted);padding-bottom:12px;position:relative;transition:color .15s;}\n';
h += '.pn a:hover{color:var(--ink);}\n';
h += '.pn a.active{color:var(--ink);}\n';
h += '.pn a.active::after{content:"";position:absolute;bottom:-1px;left:0;right:0;height:3px;background:var(--orange);border-radius:3px 3px 0 0;}\n';

// STATS
h += '.st-row{display:flex;gap:40px;padding:24px 24px 0;}\n';
h += '.st-item{display:flex;flex-direction:column;opacity:0.4;}\n';
h += '.st-num{font-size:24px;font-weight:700;color:var(--ink);line-height:1;}\n';
h += '.st-lbl{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:4px;}\n';

// LAYOUT GRID
h += '/* LAYOUT GRID */\n';
h += '.pg{display:grid;grid-template-columns:260px 1fr;gap:48px;padding:24px 24px 64px;}\n';
h += '.col-l{display:flex;flex-direction:column;gap:40px;}\n';
h += '.col-r{display:flex;flex-direction:column;gap:56px;}\n';

// SIDEBAR
h += '.sb-sec{}\n';
h += '.sb-title{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--cream-dk);display:flex;justify-content:space-between;align-items:flex-end;}\n';
h += '.sb-title .sb-cnt{color:var(--ink);font-weight:600;}\n';

// EMPTY STATES
h += '.empty-msg{font-size:13px;color:var(--muted);line-height:1.5;background:var(--cream);padding:16px;border-radius:var(--r-md);border:1px dashed var(--cream-dk);text-align:center;}\n';
h += '.empty-msg-btn{display:inline-block;margin-top:8px;font-size:12px;font-weight:600;color:var(--blue);cursor:pointer;}\n';

// MAIN CONTENT SECTIONS
h += '.main-sec{}\n';
h += '.main-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--cream-dk);}\n';
h += '.main-title{font-size:20px;font-weight:700;color:var(--ink);letter-spacing:-.5px;}\n';

// EMPTY FAVORITES
h += '.fav-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}\n';
h += '.fav-empty{aspect-ratio:2/3;border-radius:var(--r-md);background:var(--cream);border:2px dashed var(--cream-dk);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:border-color .15s, background .15s;}\n';
h += '.fav-empty:hover{border-color:var(--blue-mid);background:var(--white);}\n';
h += '.fav-empty svg{width:24px;height:24px;fill:none;stroke:var(--muted);stroke-width:2;margin-bottom:8px;}\n';
h += '.fav-empty span{font-size:12px;font-weight:600;color:var(--muted);}\n';

h += '</style></head><body>\n';

const plusIcon = '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

// NAV HTML
h += '<nav class="nav">\n<div class="wrap nav-in">\n';
h += '<a href="/" class="logo"><div class="logo-sq"><span class="logo-dot"></span></div>untitled</a>\n';
h += '<div class="nav-mid"><ul class="nav-links">';
['Home','Series','Movies','Profile'].forEach((t,i)=>{ h += `<li><a href="${i===0?'/':(i===3?'/profile.html':'/'+t.toLowerCase())}" ${i===3?'class="active"':''}>${t}</a></li>`; });
h += '</ul></div>\n';
h += '<div class="nav-end">';
h += '<button class="nav-btn-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>';
h += '<button class="btn-log"><span class="plus"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span>Log</button>';
h += '<div class="nav-av av1">M</div>';
h += '</div>\n</div>\n</nav>\n';

h += '<div class="wrap" style="max-width:1100px;padding-top:32px;">\n';
h += '<div class="ph">\n';
h += '  <div class="ph-banner">\n';
h += '    <span class="ph-banner-empty">+ Add header image</span>\n';
h += '  </div>\n';
h += '  <div class="ph-main">\n';
h += '    <div class="ph-av"><div class="av1" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;color:#fff;font-weight:700;">M</div><div class="ph-av-hover">Change Avatar</div></div>\n';
h += '    <div class="ph-info"><h1 class="ph-name">Miwazoe</h1></div>\n';
h += '    <div class="ph-actions"><button class="ph-btn">Edit profile</button></div>\n';
h += '  </div>\n';
h += '  <div class="pn">\n';
['Profile','Anime','Lists','Reviews','Likes','Network'].forEach((l,i)=>{
    h += `    <a href="#" ${i===0?'class="active"':''}>${l}</a>\n`;
});
h += '  </div>\n';
h += '  <div class="st-row">\n';
const stats = [['0','Anime watched'],['0','This year'],['0','Followers'],['0','Following']];
stats.forEach(s => {
    h += `    <div class="st-item"><span class="st-num">${s[0]}</span><span class="st-lbl">${s[1]}</span></div>\n`;
});
h += '  </div>\n';
h += '</div>\n'; // end ph

h += '<div class="pg">\n';

// LEFT COLUMN
h += '<div class="col-l">\n';
// BIO EMPTY
h += '  <div class="sb-sec">\n';
h += '    <div class="sb-title">Bio</div>\n';
h += '    <div class="empty-msg">You haven\'t added a bio yet. <br><span class="empty-msg-btn">Write something about yourself</span></div>\n';
h += '  </div>\n';
// WATCHLIST EMPTY
h += '  <div class="sb-sec">\n';
h += '    <div class="sb-title">Watchlist <span class="sb-cnt" style="opacity:.4">0</span></div>\n';
h += '    <div class="empty-msg">Your watchlist is empty.<br><span class="empty-msg-btn">Browse popular anime</span></div>\n';
h += '  </div>\n';
// RATINGS EMPTY
h += '  <div class="sb-sec">\n';
h += '    <div class="sb-title">Ratings <span class="sb-cnt" style="opacity:.4">0</span></div>\n';
h += '    <div class="empty-msg" style="height:60px;display:flex;align-items:center;justify-content:center;">No ratings yet</div>\n';
h += '  </div>\n';
// LISTS EMPTY
h += '  <div class="sb-sec">\n';
h += '    <div class="sb-title">Lists</div>\n';
h += '    <div class="empty-msg">No lists created.<br><span class="empty-msg-btn">Create a list</span></div>\n';
h += '  </div>\n';
h += '</div>\n'; // end col-l

// RIGHT COLUMN
h += '<div class="col-r">\n';
// FAVORITES EMPTY
h += '  <div class="main-sec">\n';
h += '    <div class="main-head"><h2 class="main-title">Favorite Anime</h2></div>\n';
h += '    <div class="fav-grid">\n';
for(let i=0;i<4;i++) {
    h += `      <div class="fav-empty">${plusIcon}<span>Add favorite</span></div>\n`;
}
h += '    </div>\n';
h += '  </div>\n';

// RECENT ACTIVITY EMPTY
h += '  <div class="main-sec">\n';
h += '    <div class="main-head"><h2 class="main-title">Recent Activity</h2></div>\n';
h += '    <div class="empty-msg" style="padding:48px;">\n';
h += '      <div style="font-size:16px;font-weight:600;color:var(--ink);margin-bottom:4px;">No activity to show</div>\n';
h += '      <div style="font-size:13px;">Once you start logging anime or writing reviews, they will appear here.</div>\n';
h += '    </div>\n';
h += '  </div>\n';

// RECENT REVIEWS EMPTY
h += '  <div class="main-sec">\n';
h += '    <div class="main-head"><h2 class="main-title">Recent Reviews</h2></div>\n';
h += '    <div class="empty-msg" style="padding:48px;">\n';
h += '      <div style="font-size:16px;font-weight:600;color:var(--ink);margin-bottom:4px;">No reviews written</div>\n';
h += '      <div style="font-size:13px;margin-bottom:12px;">Share your thoughts on the anime you\'ve watched.</div>\n';
h += '      <button style="background:var(--cream-dk);color:var(--ink);padding:6px 16px;border-radius:4px;font-weight:600;font-size:12px;">Write a review</button>\n';
h += '    </div>\n';
h += '  </div>\n';

h += '</div>\n'; // end col-r
h += '</div>\n'; // end pg
h += '</div>\n'; // end wrap

h += '</body></html>';

fs.writeFileSync('profile.html', h, 'utf8');
console.log('Profile HTML written.');
