// node .preview/walkprobe.mjs outdir building entranceIdx d1,d2,...  — the walker placed d metres out from the entrance
import { chromium } from 'playwright';
const [, , out, b = 'jean-nelson', ei = '0', ds = '1.5,3,5'] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=${b}&e=${ei}`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
await page.waitForTimeout(1500);
console.log('getDown', JSON.stringify(await page.evaluate(() => game.getDown())));
for (const d of ds.split(',').map(Number)) {
  await page.evaluate((d) => { const e = window.__entrance, b = (e.facing * Math.PI) / 180; const f = game['foot']; f.x = e.at[0] - Math.sin(b) * d; f.z = e.at[1] + Math.cos(b) * d; game['snapCam'] = true; }, d);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${b}_probe_${d}.png`, timeout: 600000 });
  console.log('shot', d, JSON.stringify(await page.evaluate(() => ({ foot: game.footXZ, y: game['foot'].y, surf: walkSurfaceAt(game.footXZ[0], game.footXZ[1], 0), n: walkSurfaces().length }))));
}
await browser.close();
