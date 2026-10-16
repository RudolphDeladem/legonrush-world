// node .preview/lodgeshot.mjs outdir  — one load, the lodge placements logged and one view per lodge family
import { chromium } from 'playwright';
import fs from 'fs';
const [, , out] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
const errs = [];
page.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERROR', e.message); });
await page.goto(`${process.env.HOST ?? "http://localhost:5299/"}.preview/walk.html?b=commonwealth&e=0&back=14`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
const lodges = await page.evaluate(() => window.LODGES);
fs.writeFileSync(`${out}/lodges.json`, JSON.stringify(lodges, null, 1));
const seen = new Set();
for (const l of lodges) {
  if (!l.at || seen.has(l.family)) continue;
  seen.add(l.family);
  // stand the stopped bike 14 m out from the lodge on the entrance side, facing it
  await page.evaluate((l) => {
    const e = window.RES(l.residence).entrances.find((x) => x.id === l.entrance);
    const b = (e.facing * Math.PI) / 180, ux = Math.sin(b), uz = -Math.cos(b);
    const f = game.free; f.x = e.at[0] - ux * 12; f.z = e.at[1] - uz * 12;
    const dx = l.at[0] - f.x, dz = l.at[1] - f.z; f.yaw = Math.atan2(-dx, -dz); f.v = 0;
  }, l);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/lodge_${l.family}_${l.residence}.png` });
  console.log('shot', l.family, l.residence, l.status, l.side, l.inside);
}
if (errs.length) console.log('ERRORS', errs.slice(0, 5));
await browser.close();
