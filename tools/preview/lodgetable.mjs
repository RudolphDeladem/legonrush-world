// the porter's lodges and gateways as built, a Markdown table: node .preview/lodgetable.mjs
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 200, height: 120 } });
await page.goto(`http://localhost:${process.env.PORT ?? 5298}/.preview/halls.html?cam=0,300,0,0,0,-0.1,60`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
const rows = await page.evaluate(() => window.__lplist.map((l) => ({ l, g: window.__gwlist.find((g) => g.entrance === l.entrance), r: window.__wg.RES.find((r) => r.id === l.residence) })));
console.log('| Residence | Entrance | Gate | Lodge |\n|---|---|---|---|');
for (const { l, g, r } of rows) {
  const gate = !g ? '' : g.kind === 'passage' ? `passage to the court (${g.depth} m), ${g.make} gate` : g.kind === 'driveway' ? `driveway gate (${g.make}), opens for the bike too` : g.kind === 'standalone' ? `free-standing gate (${g.make})` : g.kind === 'open passage' ? 'open passage' : (g.note ?? '');
  const lodge = l.status === 'built' ? `${l.family}, ${l.side} of the route, inside the gate` : l.status === 'in the gateway' ? `in the gateway's ${l.side} wall, inside the gate` : l.status === 'served by another lodge' ? "served by Volta Hall's lodge" : l.status;
  console.log(`| ${r.name} | ${l.entrance.split(':')[1].replace(/-/g, ' ')} | ${gate}${g?.note && g.kind !== 'none' ? ` (${g.note})` : ''} | ${lodge} |`);
}
await browser.close();
