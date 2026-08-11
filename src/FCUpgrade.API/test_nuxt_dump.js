const https = require('https');

https.get('https://en.fifaaddict.com/fo4db?page=1', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/window\.__NUXT__=(.+?);[\s]*<\/script>/s);
        if (match) {
            const jsCode = match[1];
            // Evaluate in a safe-ish way
            const fn = new Function('window', `window.__NUXT__ = ${jsCode}; return window.__NUXT__;`);
            const nuxt = fn({});
            if (nuxt.data && nuxt.data[0] && nuxt.data[0].items) {
                const item = nuxt.data[0].items[0];
                console.log(item);
            }
        }
    });
});
