const https = require('https');

function fetchPage(page) {
    return new Promise((resolve) => {
        https.get(`https://en.fifaaddict.com/fo4db?page=${page}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/window\.__NUXT__=(.+?);[\s]*<\/script>/s);
                if (match) {
                    const jsCode = match[1];
                    const fn = new Function('window', `window.__NUXT__ = ${jsCode}; return window.__NUXT__;`);
                    const nuxt = fn({});
                    if (nuxt.data && nuxt.data[0] && nuxt.data[0].items) {
                        resolve(nuxt.data[0].items.map(i => i.uid));
                    } else {
                        resolve([]);
                    }
                } else resolve([]);
            });
        });
    });
}

async function run() {
    const page1 = await fetchPage(1);
    const page2 = await fetchPage(2);
    
    console.log(`Page 1 items count: ${page1.length}`);
    console.log(`Page 2 items count: ${page2.length}`);
    
    const intersection = page1.filter(uid => page2.includes(uid));
    console.log(`Common items between Page 1 and 2: ${intersection.length}`);
}

run();
