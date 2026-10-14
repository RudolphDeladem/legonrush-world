// the Engineering grounds' crown count and the preview load time: node .preview/count.mjs
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 640, height: 400 } });
const t0 = Date.now();
await p.goto('http://localhost:5299/.preview/halls.html?cam=453,20,-350,453,0,-420', { timeout: 600000 });
await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
console.log('load s', (Date.now() - t0) / 1000, await p.evaluate(() => { let n = null; window.__scene.traverse((o) => { if (o.name === 'engineering-grounds') n = o.userData.crowns; }); return n; }));
await b.close();
