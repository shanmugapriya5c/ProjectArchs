// Usage:
//   node generate-pdf.js                              (uses defaults below)
//   node generate-pdf.js MY_ARCH.html MY_OUTPUT.pdf
const puppeteer = require('puppeteer');
const path = require('path');

const htmlFile = process.argv[2] || 'ENTERPRISE_INTEGRATION_ARCHITECTURE_PORTFOLIO.html';
const pdfFile  = process.argv[3] || htmlFile.replace(/\.html$/i, '.pdf');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // A4 content width (210mm - 15mm*2 margins) at 96dpi = 682px
  await page.setViewport({ width: 682, height: 1123, deviceScaleFactor: 1 });

  const htmlPath = path.resolve(process.cwd(), htmlFile);
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const pdfPath = path.resolve(process.cwd(), pdfFile);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
  });

  await browser.close();
  console.log(`PDF generated: ${pdfFile}`);
})();
