const https = require('https');

https.get('https://en.fifaaddict.com/fo4db', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/window\.__NUXT__=(.+?);[\s]*<\/script>/s);
        if (match) {
            const jsCode = match[1];
            const fn = new Function('window', `window.__NUXT__ = ${jsCode}; return window.__NUXT__;`);
            const nuxt = fn({});
            console.log(Object.keys(nuxt.data[0].foMeta));
            if (nuxt.data[0].foMeta.classes) {
                console.log(`Classes count: ${nuxt.data[0].foMeta.classes.length}`);
            }
        }
    });
});
