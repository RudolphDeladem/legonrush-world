// gatevid.mjs out: two shots of the gate's screen some seconds apart (the video plays)
import { chromium } from 'playwright';
const out = process.argv[2];
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const cam = 'cam=730,4,1236,705,5.6,1232.5,40';
await page.goto(`http://localhost:5299/.preview/halls.html?${cam}`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
for (const n of ['a', 'b', 'c']) {
  await page.waitForTimeout(2500);
  await page.evaluate((c) => window.__view(c), cam);
  await page.screenshot({ path: `${out}/screen-${n}.png` });
  console.log(n, await page.evaluate(() => { const v = document.querySelector('video'); return v ? [v.currentTime.toFixed(2), v.paused, v.readyState] : 'no video'; }));
}
await browser.close();
