const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://en.fifaaddict.com/fo4db?page=1');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'page1.png' });
  
  await page.goto('https://en.fifaaddict.com/fo4db?page=2');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'page2.png' });

  await browser.close();
})();
