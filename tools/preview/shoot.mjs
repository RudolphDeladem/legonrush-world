import { chromium } from 'playwright';
const [, , out, ...views] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
for (const v of views) {
  await page.goto(`http://localhost:5299/.preview/halls.html?${v}`);
  await page.waitForFunction(() => window.__done, null, { timeout: 240000 });
  const name = v.replace(/[^a-z0-9]+/gi, '_');
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('shot', name);
}
if (errs.length) console.log('errors:', errs.slice(0, 5).join('\n'));
await browser.close();
