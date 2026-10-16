// node .preview/gatetest.mjs outdir — every modelled entrance gate (gates.ts) in the running game: shut while the walker
// is far, open when they come near, still open nearby and while they are in that building's room, closed again after
// they leave; and in a shared ride, kept open (never swung through) while another person on foot stands near it
import { chromium } from 'playwright';
const [, , out] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=evandy&e=0&back=10`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
const log = (k, v) => console.log(k, JSON.stringify(v));
await page.waitForTimeout(1500);
log('getDown', await page.evaluate(() => { game.walkAllowed = true; return game.getDown(); }));
const list = await page.evaluate(() => gates['list'].map((g) => ({ id: g.id, b: g.buildingId, hinge: g.hinge, dir: g.dir, length: g.length })));
log('gates', list.map((g) => g.id));
// gate state stepped directly (software GL draws a few frames a second): update(dt, walker, bike, others) as the game does
const run = (g, foot, others, secs) => page.evaluate(([id, foot, others, secs]) => { for (let i = 0; i < secs * 20; i++) gates.update(0.05, foot, undefined, others); return gates.all.find((x) => x.id === id).open; }, [g.id, foot, others, secs]);
const mid = (g, d) => { const nx = -g.dir[1], nz = g.dir[0]; return { x: g.hinge[0] + g.dir[0] * g.length / 2 + nx * d, z: g.hinge[1] + g.dir[1] * g.length / 2 + nz * d }; };
const blocked = (g) => page.evaluate((g) => gates.blocked(g.hinge[0] + g.dir[0] * g.length / 2, g.hinge[1] + g.dir[1] * g.length / 2), g);
for (const g of list) {
  const r = {};
  r.far = await run(g, mid(g, 40), [], 3); r.farBlocked = await blocked(g);
  r.near = await run(g, mid(g, 4), [], 3); r.nearBlocked = await blocked(g);
  r.at15 = await run(g, mid(g, 15), [], 3);
  r.left = await run(g, mid(g, 45), [], 4); r.leftBlocked = await blocked(g);
  // shared ride: the walker opens it and leaves while another person stands in the gateway
  await run(g, mid(g, 4), [], 3);
  r.otherInGateway = await run(g, mid(g, 45), [mid(g, 0.5)], 4);
  r.otherGone = await run(g, mid(g, 45), [], 4);
  log('gate', { id: g.id, ...r });
  // a picture of the open gate from the walker's side
  if (!process.env.NOSHOT) {
    await run(g, mid(g, 4), [], 3);
    await page.evaluate((p) => { const f = game['foot']; f.x = p.x; f.z = p.z; f.yaw = Math.atan2(-(p.hx - p.x), -(p.hz - p.z)); game['snapCam'] = true; }, { ...mid(g, 7), hx: mid(g, 0).x, hz: mid(g, 0).z });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/gate_${g.id.replace(/[^a-z0-9]+/gi, '_')}_open.png`, timeout: 600000 });
    await run(g, mid(g, 45), [], 4);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/gate_${g.id.replace(/[^a-z0-9]+/gi, '_')}_closed.png`, timeout: 600000 });
  }
}
await browser.close();
