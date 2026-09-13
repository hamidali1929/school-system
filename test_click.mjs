import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const baseUrl = 'https://pioneers.netlify.app';
  
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('edunova_current_user', JSON.stringify({ id: 'admin', name: 'Super Admin', role: 'admin' }));
  });
  await page.reload({ waitUntil: 'networkidle2' });

  await page.setViewport({ width: 1400, height: 900, isMobile: false, hasTouch: false });
  await new Promise(r => setTimeout(r, 1500));
  
  const text = 'All Students';
  const clicked = await page.evaluate((t) => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    const target = btns.find(b => b.textContent && b.textContent.includes(t));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, text);

  console.log('Clicked?', clicked);
  
  await new Promise(r => setTimeout(r, 1500));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 1500));
  
  await page.screenshot({ path: 'test_click.png' });
  await browser.close();
})();
