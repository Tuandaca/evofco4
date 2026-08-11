const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const getPlayers = async (url) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const players = await page.evaluate(() => {
          if (window.__NUXT__ && window.__NUXT__.data && window.__NUXT__.data[0] && window.__NUXT__.data[0].items) {
              return window.__NUXT__.data[0].items.map(i => i.name);
          }
          return [];
      });
      return players;
  };

  const p1 = await getPlayers('https://en.fifaaddict.com/fo4db?page=1');
  console.log("Page 1 players (first 5):", p1.slice(0, 5));
  
  const p2 = await getPlayers('https://en.fifaaddict.com/fo4db?page=2');
  console.log("Page 2 players (first 5):", p2.slice(0, 5));
  
  let common = 0;
  for (const name of p1) {
      if (p2.includes(name)) common++;
  }
  console.log(`Common players: ${common}/${p1.length}`);

  await browser.close();
})();
