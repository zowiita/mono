const http = require('http');

function fetchPath(path) {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:3000' + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('Testing Statistics, Wrapped, and Pro endpoints...');
    
    // 1. Stats Page
    const statsRes = await fetchPath('/u/zowi/stats');
    console.log('GET /u/zowi/stats ->', statsRes.status, statsRes.data.includes('Statistics') ? 'OK' : 'FAIL');

    // 2. Wrapped Tab
    const wrappedTabRes = await fetchPath('/u/zowi/stats?tab=wrapped&year=2026');
    console.log('GET /u/zowi/stats?tab=wrapped ->', wrappedTabRes.status, wrappedTabRes.data.includes('Year in Review') ? 'OK' : 'FAIL');

    // 3. Monthly Tab
    const monthlyTabRes = await fetchPath('/u/zowi/stats?tab=monthly');
    console.log('GET /u/zowi/stats?tab=monthly ->', monthlyTabRes.status, monthlyTabRes.data.includes('Monthly Deep-Dive') ? 'OK' : 'FAIL');

    // 4. Immersive Wrapped Story
    const wrappedStoryRes = await fetchPath('/u/zowi/wrapped/2026');
    console.log('GET /u/zowi/wrapped/2026 ->', wrappedStoryRes.status, wrappedStoryRes.data.includes('Möno Wrapped') ? 'OK' : 'FAIL');

    // 5. Pro Pricing Page
    const proPageRes = await fetchPath('/pro');
    console.log('GET /pro ->', proPageRes.status, proPageRes.data.includes('Möno Pro') ? 'OK' : 'FAIL');

    console.log('All tests finished!');
}

runTests().catch(console.error);
