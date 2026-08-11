const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://en.fifaaddict.com/fo4db', { waitUntil: 'domcontentloaded' });
  const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText, href: a.href })).filter(a => a.href.includes('page=') || a.text === '2' || a.text.includes('Next') || a.text === '>'));
  console.log(links);

  await browser.close();
})();
