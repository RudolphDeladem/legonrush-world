// the hall gateways: a view from the street at each, and one from inside the passage: node .preview/gwshot.mjs outdir id...
import { chromium } from 'playwright';
const [, , out, ...ids] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 680 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(`http://localhost:${process.env.PORT ?? 5298}/.preview/halls.html?cam=0,300,0,0,0,-0.1,60`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
const info = await page.evaluate(() => window.__gwlist.map((g) => JSON.stringify(g)));
console.log(info.join('\n'));
const ents = await page.evaluate(() => window.__wg.RES.flatMap((r) => r.entrances.map((e) => ({ r: r.id, at: e.at, f: e.facing, gh: window.__gh(e.at[0], e.at[1]) }))));
for (const id of ids) {
  const e = ents.find((x) => x.r === id); if (!e) continue;
  const f = (e.f * Math.PI) / 180, ux = Math.sin(f), uz = -Math.cos(f), nx = Math.cos(f), nz = Math.sin(f);
  const P = (a, b, y) => [e.at[0] + ux * a + nx * b, e.gh + y, e.at[1] + uz * a + nz * b].map((v) => v.toFixed(2));
  const views = { street: [P(-14, -4, 4), P(2, 0, 2)], inside: [P(-1.5, -0.6, 1.7), P(8, 0.4, 1.4)], court: [P(22, 2, 6), P(0, 0, 1.5)] };
  for (const [k, [eye, at]] of Object.entries(views)) {
    await page.evaluate((c) => window.__view(c), `cam=${eye.join(',')},${at.join(',')},60`);
    await page.screenshot({ path: `${out}/gw_${id}_${k}.png`, timeout: 600000 });
    console.log('shot', id, k);
  }
}
await browser.close();
