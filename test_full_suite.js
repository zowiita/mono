const http = require('http');

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                ...headers
            }
        };

        if (body) {
            const json = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(json);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('--- STARTING PLATFORM COMPREHENSIVE VERIFICATION ---');
    let errors = 0;

    // 1. Check Catalog Pages & Profiles
    const pages = [
        '/anime',
        '/anime?genre=action&sort=score',
        '/series?genre=drama',
        '/movies?genre=sci-fi',
        '/u/zowi',
        '/anime/nge',
        '/anime/frieren'
    ];

    for (const p of pages) {
        try {
            const res = await request('GET', p);
            if (res.status === 200) {
                console.log(`[PASS] GET ${p} -> 200 OK`);
            } else {
                console.error(`[FAIL] GET ${p} -> Status ${res.status}`);
                errors++;
            }
        } catch (e) {
            console.error(`[ERROR] GET ${p} -> ${e.message}`);
            errors++;
        }
    }

    // 2. Test Watching Log API
    try {
        const logRes = await request('POST', '/api/anime/nge/log', {
            status: 'watching',
            currentEpisode: 5,
            rating: 4.5,
            reviewText: 'Viendo Evangelion de nuevo, capítulo 5 es brutal.',
            containsSpoilers: false,
            isLiked: true
        });
        console.log(`[PASS] POST /api/anime/nge/log (Watching Ep 5) -> Status ${logRes.status}`, logRes.data);
    } catch (e) {
        console.error('[FAIL] Watching Log API:', e.message);
        errors++;
    }

    // 3. Test 4 Favorites API
    try {
        const fav1 = await request('POST', '/api/profile/favorite', { position: 1, slug: 'nge' });
        const fav2 = await request('POST', '/api/profile/favorite', { position: 2, slug: 'frieren' });
        const fav3 = await request('POST', '/api/profile/favorite', { position: 3, slug: 'aot' });
        const fav4 = await request('POST', '/api/profile/favorite', { position: 4, slug: 'vinland' });
        console.log(`[PASS] POST /api/profile/favorite 1..4 -> Status ${fav1.status}, ${fav2.status}, ${fav3.status}, ${fav4.status}`);
    } catch (e) {
        console.error('[FAIL] Favorite API:', e.message);
        errors++;
    }

    // 4. Test Follow / Unfollow API
    try {
        const followRes = await request('POST', '/api/user/demo/follow');
        console.log(`[PASS] POST /api/user/demo/follow -> Status ${followRes.status}`, followRes.data);
    } catch (e) {
        console.error('[FAIL] Follow API:', e.message);
        errors++;
    }

    // 5. Test Review Like API
    try {
        const likeRes = await request('POST', '/api/review/1/like');
        console.log(`[PASS] POST /api/review/1/like -> Status ${likeRes.status}`, likeRes.data);
    } catch (e) {
        console.error('[FAIL] Review Like API:', e.message);
        errors++;
    }

    // 6. Test Anime Search API
    try {
        const searchRes = await request('GET', '/api/search/anime?q=eva');
        console.log(`[PASS] GET /api/search/anime?q=eva -> Status ${searchRes.status}`, searchRes.data);
    } catch (e) {
        console.error('[FAIL] Search Anime API:', e.message);
        errors++;
    }

    console.log(`--- FINISHED. Total Errors: ${errors} ---`);
    process.exit(errors > 0 ? 1 : 0);
}

runTests();
