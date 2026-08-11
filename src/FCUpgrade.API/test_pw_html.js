const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://en.fifaaddict.com/fo4db', { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('fo4db_page1.html', html);
  console.log("Written HTML");
  await browser.close();
})();
