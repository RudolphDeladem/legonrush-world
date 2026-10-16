// node .preview/entranceshot.mjs outdir id1,id2 — residence entrances in the running game: from 10 m with the gate shut,
// then from 4 m with it open (the gate system stepped directly), and the lodge side
import { chromium } from 'playwright';
const [, , out, ids = 'vikings,valco-1,valco-2'] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=${ids.split(',')[0]}&e=0&back=14`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
await page.waitForTimeout(1500);
console.log('getDown', await page.evaluate(() => { game.walkAllowed = true; return JSON.stringify(game.getDown()); }));
const frames = (n = 3) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
for (const id of ids.split(',')) {
  const place = (d, side = 0) => page.evaluate(([id, d, side]) => {
    const e = window.RES(id).entrances[0], b = (e.facing * Math.PI) / 180, ux = Math.sin(b), uz = -Math.cos(b);
    const f = game['foot']; f.x = e.at[0] - ux * d + uz * side; f.z = e.at[1] - uz * d - ux * side;
    const tx = e.at[0] - f.x, tz = e.at[1] - f.z; f.yaw = Math.atan2(-tx, -tz); game['snapCam'] = true;
    return { at: [f.x, f.z] };
  }, [id, d, side]);
  const step = (near) => page.evaluate(([id, near]) => { const e = window.RES(id).entrances[0]; for (let i = 0; i < 80; i++) gates.update(0.05, near ? { x: e.at[0], z: e.at[1] } : { x: e.at[0] + 80, z: e.at[1] + 80 }); return gates.all.filter((g) => g.buildingId === id); }, [id, near]);
  await place(11); console.log(id, 'closed', JSON.stringify(await step(false)));
  await frames(); await page.screenshot({ path: `${out}/entrance_${id}_1-closed.png`, timeout: 600000 });
  await place(5); console.log(id, 'open', JSON.stringify(await step(true)));
  await frames(); await page.screenshot({ path: `${out}/entrance_${id}_2-open.png`, timeout: 600000 });
  await step(false);
  await place(7, -4); await step(false);
  await frames(); await page.screenshot({ path: `${out}/entrance_${id}_3-side.png`, timeout: 600000 });
}
console.log('lodges', JSON.stringify(await page.evaluate((ids) => window.LODGES.filter((l) => ids.includes(l.residence)), ids.split(','))));
await browser.close();
