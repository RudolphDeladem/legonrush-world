import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(`http://localhost:5299/.preview/halls.html?cam=150,300,2100,150,0,2099.9,60`, { timeout: 600000 });
await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
const [X0, X1, Z0, Z1] = process.argv[2].split(',').map(Number);
const out = await page.evaluate(async ([X0, X1, Z0, Z1]) => {
  const mc = await import('/src/game/meshcollide.ts'), so = await import('/src/game/solids.ts'), cm = await import('/src/game/campusmap.ts');
  const res = [];
  cm.ROADS.forEach((r, i) => { const p = r.nodes.map((n) => [cm.NODE_XZ[n * 2], cm.NODE_XZ[n * 2 + 1]]);
    for (let j = 1; j < p.length; j++) { const L = Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]);
      for (let t = 0; t <= L; t += 0.5) { const x = p[j - 1][0] + (p[j][0] - p[j - 1][0]) * t / L, z = p[j - 1][1] + (p[j][1] - p[j - 1][1]) * t / L;
        if (x < X0 || x > X1 || z < Z0 || z > Z1) continue;
        if (so.solidAt(x, z, 0.3) || mc.meshBlocked(x, z)) res.push([i, +x.toFixed(1), +z.toFixed(1), so.solidAt(x, z, 0.3) ? 'solid' : 'mesh']); } } });
  return res;
}, [X0, X1, Z0, Z1]);
console.log(JSON.stringify(out));
await browser.close();
