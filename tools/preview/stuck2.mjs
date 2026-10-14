import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(`http://localhost:5299/.preview/halls.html?cam=300,300,2000,300,0,1999.9,60`, { timeout: 600000 });
await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
const [X0, X1, Z0, Z1] = (process.argv[2] ?? "-1100,-150,-120,320").split(",").map(Number);
const out = await page.evaluate(async ([X0, X1, Z0, Z1]) => {
  const mc = await import('/src/game/meshcollide.ts'), so = await import('/src/game/solids.ts'), cm = await import('/src/game/campusmap.ts'), life = await import('/src/game/life.ts'), rel = await import('/src/game/relief.ts');
  const res = [];
  const lots = cm.AREAS.filter((a) => a.kind === 'parking' && a.pts.some((v, i) => (i % 2 ? v > Z0 - 50 && v < Z1 + 50 : v > X0 - 50 && v < X1 + 50)));
  const inP = (p, x, z) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };
  for (let x = X0; x < X1; x += 1) for (let z = Z0; z < Z1; z += 1) {
    const c = life.roadClearance(x, z, 6, -1, false);
    if (c < 0.2 || c > 3) continue; // grass just beside a road
    if (cm.buildingNear(x, z, 0.5) || so.solidAt(x, z, 0.3) || rel.inStairs(x, z)) continue;
    if (lots.some((a) => inP(a.pts, x, z))) continue; // parked cars in the car parks
    if (mc.meshBlocked(x, z)) res.push([x, z]);
  }
  return res;
}, [X0, X1, Z0, Z1]);
// cluster
const cl = [];
for (const [x, z] of out) { const c = cl.find((k) => Math.abs(k.x - x) < 6 && Math.abs(k.z - z) < 6); if (c) { c.n++; } else cl.push({ x, z, n: 1 }); }
console.log(out.length, JSON.stringify(cl.filter((c) => c.n >= 3).slice(0, 80)));
await browser.close();
