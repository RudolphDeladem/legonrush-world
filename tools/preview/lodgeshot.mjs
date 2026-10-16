// node .preview/lodgeshot.mjs outdir  — one load; the placements logged; the walker stood 8 m from one lodge per
// family (ALL=1: every lodge), facing it, and the walking camera snapped behind them
import { chromium } from 'playwright';
import fs from 'fs';
const [, , out] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
const errs = [];
page.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERROR', e.stack); });
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=commonwealth&e=0&back=14`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
const lodges = await page.evaluate(() => window.LODGES);
fs.writeFileSync(`${out}/lodges.json`, JSON.stringify(lodges, null, 1));
await page.waitForTimeout(1500);
console.log('getDown', JSON.stringify(await page.evaluate(() => game.getDown())));
const seen = new Set();
for (const l of lodges) {
  if (!l.at || (seen.has(l.family) && !process.env.ALL)) continue;
  seen.add(l.family);
  await page.evaluate((l) => {
    const e = window.RES(l.residence).entrances.find((x) => x.id === l.entrance);
    // from the entrance route's outer side, a little off the lodge's corner, so the lodge and the gate both show
    let dx = e.at[0] - l.at[0], dz = e.at[1] - l.at[1];
    const b = (e.facing * Math.PI) / 180; dx -= Math.sin(b) * 8; dz += Math.cos(b) * 8;
    const d = Math.hypot(dx, dz) || 1, f = game['foot'];
    f.x = l.at[0] + (dx / d) * 9; f.z = l.at[1] + (dz / d) * 9; f.yaw = Math.atan2(dx / d, dz / d);
    game['snapCam'] = true;
  }, l);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/lodge_${l.family}_${l.residence}.png`, timeout: 600000 });
  console.log('shot', l.family, l.residence, l.status, l.side, l.inside);
}
if (errs.length) console.log('ERRORS', errs.slice(0, 5));
await browser.close();
