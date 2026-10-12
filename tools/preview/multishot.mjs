// one campus build, many named views: node .preview/multishot.mjs outdir name1 name2 ...
import { chromium } from 'playwright';
const [, , out, ...views] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(`http://localhost:5299/.preview/halls.html?view=${views[0]}`, { timeout: 600000 });
await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
for (const v of views) {
  const ok = await page.evaluate((n) => window.__view(n), v);
  if (!ok) { console.log('no view', v); continue; }
  await page.screenshot({ path: `${out}/view_${v}.png`, timeout: 300000 });
  console.log('shot', v);
}
if (errs.length) console.log('errors:', errs.slice(0, 5).join('\n'));
await browser.close();
