const fs = require('fs');
const path = require('path');

const views = [
    'landing.ejs', 'search.ejs', 'series.ejs', 'movies.ejs',
    'anime-detail.ejs', 'anime-reviews.ejs', 'character.ejs', 
    'person.ejs', 'review.ejs', 'list.ejs',
    'profile-anime.ejs', 'profile-lists.ejs', 'profile-reviews.ejs'
];

const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Untitled Anime Platform</title>
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">
<style>
:root { --ink:#222224; --cream:#F0EAE3; --cream-dk:#E4DDD5; --muted:#9B9593; --blue:#280DC2; }
body { font-family: "Satoshi", sans-serif; color: var(--ink); margin: 0; padding: 0; background: #FDF8F4; }
.wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
h1 { font-size: 32px; letter-spacing: -1px; margin-bottom: 16px; }
p { font-size: 15px; color: var(--muted); }
</style>
</head>
<body>
    <%- include('partials/nav') %>
    <div class="wrap">
        <h1>Work in Progress</h1>
        <p>This page is currently under construction.</p>
    </div>
</body>
</html>`;

views.forEach(view => {
    const filePath = path.join(__dirname, 'views', view);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, template);
        console.log('Created:', view);
    }
});
