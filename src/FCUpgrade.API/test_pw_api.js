const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Intercept all requests
  page.on('request', req => {
      const url = req.url();
      if (url.includes('api') || url.includes('ajax') || url.includes('fo4db')) {
          console.log(`[REQ] ${req.method()} ${url}`);
      }
  });

  page.on('response', async res => {
      const url = res.url();
      if (url.includes('api') || url.includes('ajax') || url.includes('fo4db')) {
          console.log(`[RES] ${res.status()} ${url}`);
          // if it's the players api, try to read json
          if (url.includes('api/fo4/players')) {
              try {
                  const text = await res.text();
                  console.log(`[RES BODY] ${text.substring(0, 100)}`);
              } catch (e) {
                  console.log(`[RES BODY ERROR] ${e.message}`);
              }
          }
      }
  });

  console.log("Navigating...");
  await page.goto('https://en.fifaaddict.com/fo4db', { waitUntil: 'domcontentloaded' });
  console.log("Page loaded. Waiting 5s for any background requests...");
  await page.waitForTimeout(5000);
  
  console.log("Clicking pagination link...");
  try {
      const links = await page.$$('a.page-link');
      for (const link of links) {
          const text = await link.textContent();
          if (text.includes('2')) {
              await link.click();
              console.log("Clicked 2!");
              break;
          }
      }
  } catch(e) {
      console.log("Could not click", e);
  }

  await page.waitForTimeout(5000);
  console.log("Done");
  await browser.close();
})();
