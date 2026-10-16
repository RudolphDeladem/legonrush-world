import { chromium } from 'playwright';
const [, , out] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
await page.goto('http://localhost:4199/.preview/walk.html?b=volta&e=0&back=14', { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => { game.walkAllowed = true; return JSON.stringify(game.getDown()); }));
console.log(JSON.stringify(await page.evaluate(() => window.LODGES.filter((l) => /volta/.test(l.residence)))));
for (const id of ['volta', 'volta-annex']) {
  await page.evaluate((id) => { const e = window.RES(id).entrances[0], b = (e.facing * Math.PI) / 180, ux = Math.sin(b), uz = -Math.cos(b); const f = game['foot']; f.x = e.at[0] - ux * 9; f.z = e.at[1] - uz * 9; f.yaw = Math.atan2(-ux, -uz); game['snapCam'] = true; }, id);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${out}/${id}_entrance.png`, timeout: 600000 });
}
await browser.close();
