const http = require('http');

const urls = [
    '/',
    '/anime',
    '/anime/top10',
    '/anime/trending',
    '/series',
    '/movies',
    '/anime/nge',
    '/anime/nge/reviews',
    '/u/demo',
    '/u/demo/anime',
    '/u/demo/lists',
    '/u/demo/reviews',
    '/list/1',
    '/list/new',
    '/search?q=evangelion',
    '/settings',
    '/login',
    '/register'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        http.get('http://localhost:3000' + url, (res) => {
            console.log(`[${res.statusCode}] ${url}`);
            resolve(res.statusCode);
        }).on('error', (err) => {
            console.error(`[ERROR] ${url}:`, err.message);
            resolve(500);
        });
    });
}

async function run() {
    console.log('Testing all platform endpoints:');
    for (const url of urls) {
        await checkUrl(url);
    }
}

run();
