const http = require('http');

const routes = [
    '/',
    '/anime',
    '/series',
    '/movies',
    '/lists',
    '/list/1',
    '/list/new',
    '/anime/top10',
    '/anime/trending',
    '/anime/nge',
    '/anime/frieren',
    '/anime/aot',
    '/anime/nge/reviews',
    '/review/1',
    '/u/demo',
    '/u/demo/anime',
    '/u/demo/lists',
    '/u/demo/reviews',
    '/search?q=evangelion',
    '/api/search/global?q=eva',
    '/api/user/lists',
    '/api/notifications',
    '/settings',
    '/login',
    '/register'
];

async function checkRoute(path) {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ path, status: res.statusCode, ok: res.statusCode === 200 || res.statusCode === 302 });
            });
        }).on('error', (err) => {
            resolve({ path, status: 'ERROR', error: err.message, ok: false });
        });
    });
}

async function run() {
    console.log('Testing all platform routes...');
    let failed = 0;
    for (const r of routes) {
        const res = await checkRoute(r);
        console.log(`[${res.status}] ${res.path} -> ${res.ok ? '✓ PASS' : '✗ FAIL'}`);
        if (!res.ok) failed++;
    }
    if (failed === 0) {
        console.log('\n🎉 ALL 25 ROUTES PASSED VERIFICATION WITH 200/302 OK!');
    } else {
        console.error(`\n❌ ${failed} routes failed!`);
        process.exit(1);
    }
}

run();
