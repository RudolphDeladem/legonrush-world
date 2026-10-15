import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(`http://localhost:5299/.preview/halls.html?cam=-350,120,95,-350,0,94.9,60`, { timeout: 600000 });
await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
const out = await page.evaluate(async () => {
  const mc = await import('/src/game/meshcollide.ts'), so = await import('/src/game/solids.ts'), cm = await import('/src/game/campusmap.ts'), life = await import('/src/game/life.ts'), rel = await import('/src/game/relief.ts');
  const res = [];
  for (let x = -1100; x < -150; x += 1) for (let z = -120; z < 320; z += 1) {
    const c = life.roadClearance(x, z, 6, -1, false);
    if (c < 0.2 || c > 3) continue; // grass just beside a road
    if (cm.buildingNear(x, z, 0.5) || so.solidAt(x, z, 0.3) || rel.inStairs(x, z)) continue;
    if (mc.meshBlocked(x, z)) res.push([x, z]);
  }
  return res;
});
// cluster
const cl = [];
for (const [x, z] of out) { const c = cl.find((k) => Math.abs(k.x - x) < 6 && Math.abs(k.z - z) < 6); if (c) { c.n++; } else cl.push({ x, z, n: 1 }); }
console.log(out.length, JSON.stringify(cl.filter((c) => c.n >= 3).slice(0, 80)));
await browser.close();
