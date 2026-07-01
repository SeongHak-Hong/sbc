const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/news?tab=news', { waitUntil: 'networkidle2' });
  
  const visibility = await page.evaluate(() => {
    const wrapper = document.querySelector('[class*="pageWrapper"]');
    const title = document.querySelector('h1');
    const board = document.querySelector('[class*="boardContainer"]');
    
    return {
      wrapperHeight: wrapper ? wrapper.getBoundingClientRect().height : 0,
      titleOpacity: title ? window.getComputedStyle(title).opacity : 'none',
      boardHeight: board ? board.getBoundingClientRect().height : 0,
      boardOpacity: board ? window.getComputedStyle(board).opacity : 'none',
      htmlClass: document.documentElement.className,
      htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
      bodyOverflow: window.getComputedStyle(document.body).overflow,
    };
  });
  
  console.log(visibility);
  await browser.close();
})();
