const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const requests = [];
  page.on('request', request => {
    requests.push(request.url());
  });

  await page.goto('https://en.fifaaddict.com/fo4db');
  
  // wait for the page to load
  await page.waitForTimeout(2000);
  
  // Click on the page 2 link or next button
  // the pagination links usually have href="?page=2"
  const page2Link = await page.$('a[href*="?page=2"]');
  if (page2Link) {
      await page2Link.click();
      await page.waitForTimeout(2000);
  } else {
      console.log("Could not find page 2 link");
  }

  // Print all API/AJAX requests
  console.log("Network requests:");
  requests.filter(r => r.includes('api') || r.includes('ajax') || r.includes('fo4db')).forEach(r => {
      console.log(r);
  });

  await browser.close();
})();
