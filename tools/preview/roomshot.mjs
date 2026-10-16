// node .preview/roomshot.mjs outdir "b=..&c=..&v=.." ...
import { chromium } from 'playwright';
const [, , out, ...qs] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
page.on('pageerror', (e) => console.log('ERR', e.message));
for (const q of qs) {
  await page.goto(`http://localhost:5299/.preview/rooms.html?${q}`);
  await page.waitForFunction(() => window.__done, null, { timeout: 120000 });
  const info = await page.evaluate(() => window.__info);
  await page.screenshot({ path: `${out}/room_${q.replace(/[^a-z0-9]+/gi, '_')}.png` });
  console.log(q, JSON.stringify(info));
}
await browser.close();
