const fs = require('fs');
let code = fs.readFileSync('views/landing.ejs', 'utf8');

// 1. Hero image
code = code.replace(
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/30-gEMoHHIqxDgN.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/banner/32-jGohS7cK1e2j.jpg'
);

// 2. Nav layout
code = code.replace(
    \<nav class="mono-nav-menu">
          <a href="/login" class="mono-nav-item">Sign In</a>
          <a href="/register" class="mono-nav-item highlight-link">Create Account</a>
          <a href="/anime" class="mono-nav-item">Films</a>
          <a href="/series" class="mono-nav-item">Series</a>
          <a href="/top100" class="mono-nav-item">Top 100</a>
          <a href="/lists" class="mono-nav-item">Lists</a>
          
          <div class="mono-nav-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search...">
          </div>
        </nav>\,
    \<nav class="mono-nav-menu">
          <a href="/anime" class="mono-nav-item">Films</a>
          <a href="/series" class="mono-nav-item">Series</a>
          <a href="/top100" class="mono-nav-item">Top 100</a>
          <a href="/lists" class="mono-nav-item">Lists</a>
          
          <div class="mono-nav-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search...">
          </div>
        </nav>
        
        <div style="display:flex; gap:22px; align-items:center;">
          <a href="/login" class="mono-nav-item">Sign In</a>
          <a href="/register" class="mono-nav-item highlight-link">Create Account</a>
        </div>\
);

// 3. PB cover
code = code.replace(
    'bx437-0xT47O0Xm51b.jpg',
    'bx437-69NMlXKFeuse.jpg'
);

// 4. FLCL cover and size
code = code.replace(
    'bento-archive-card wide reveal-scale delay-2',
    'bento-archive-card tall reveal-scale delay-2'
);
code = code.replace(
    'bx227-fI7w0H8vT8lF.jpg',
    'bx227-qOB9ZhVvNnqO.jpg'
);

// 5. Wrap CSS for footer
if (!code.includes('.wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }')) {
    code = code.replace(
        '</style>',
        '  .wrap { max-width: 960px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }\n    </style>'
    );
}

fs.writeFileSync('views/landing.ejs', code);
console.log('Landing fixed');
