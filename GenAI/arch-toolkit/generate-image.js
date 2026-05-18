// Usage:
//   node generate-image.js                                  (uses defaults below)
//   node generate-image.js MY_PROJECT_IMAGE.html MY_OUTPUT.png
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const htmlFile = process.argv[2] || 'ENTERPRISE_INTEGRATION_IMAGE.html';
const pngFile  = process.argv[3] || htmlFile.replace(/\.html$/i, '.png');

const OUT_W = 1920, OUT_H = 1080;

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({ width: OUT_W, height: OUT_H, deviceScaleFactor: 1 });

  const htmlPath = path.resolve(process.cwd(), htmlFile);
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const pngPath = path.resolve(process.cwd(), pngFile);
  await page.screenshot({
    path: pngPath,
    clip: { x: 0, y: 0, width: OUT_W, height: OUT_H },
    type: 'png'
  });

  await browser.close();

  const stat = fs.statSync(pngPath);
  console.log(`Image generated: ${pngFile} (${OUT_W}x${OUT_H} px, ${(stat.size/1024).toFixed(0)} KB)`);
})();
