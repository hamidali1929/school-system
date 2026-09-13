import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true }, 
    args: ['--ignore-certificate-errors'] 
  });
  const page = await browser.newPage();
  const baseUrl = 'https://localhost:5173';
  
  const outDir = '../school_management_system_prototype/app_screenshots';
  if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
  }

  // 3. Student Pages
  console.log('Injecting STUDENT auth token...');
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('edunova_current_user', JSON.stringify({ id: 'STU-123', name: 'Ali Raza', role: 'student' }));
  });

  const studentRoutes = [
    { name: '15_student_academic', path: '#/academic' },
    { name: '16_student_attendance', path: '#/attendance_log' },
    { name: '17_student_fees', path: '#/fees_ledger' },
    { name: '18_student_communication', path: '#/communication' },
  ];

  for (const route of studentRoutes) {
    console.log('Screenshotting ' + route.name);
    await page.goto(baseUrl + '/' + route.path, { waitUntil: 'networkidle2' });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `${outDir}/${route.name}.png`, fullPage: true });
  }

  await browser.close();
  console.log('Done!');
})();
