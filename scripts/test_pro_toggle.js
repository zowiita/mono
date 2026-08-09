const http = require('http');

function postJson(path, body) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(body);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function testToggle() {
    console.log('Testing /api/user/toggle-pro...');
    const res1 = await postJson('/api/user/toggle-pro', { tier: 'pro' });
    console.log('Toggle 1 response:', res1);

    const res2 = await postJson('/api/user/toggle-pro', { tier: 'patron' });
    console.log('Toggle 2 response:', res2);

    const res3 = await postJson('/api/user/toggle-pro', { tier: 'pro' });
    console.log('Toggle 3 response (back to pro):', res3);
}

testToggle().catch(console.error);
