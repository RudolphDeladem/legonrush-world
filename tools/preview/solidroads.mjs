// lists round solids that stand on a road or path (inside its half width) in the given boxes
import { chromium } from 'playwright';
const boxes = JSON.parse(process.argv[2]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
await page.goto('http://localhost:5299/.preview/halls.html?view=pair01', { timeout: 300000 });
await page.waitForFunction(() => window.__done, null, { timeout: 300000 });
const out = await page.evaluate(async (boxes) => {
  const { SOLIDS } = await import('/src/game/solids.ts');
  const cm = await import('/src/game/campusmap.ts');
  const W = [9, 7.4, 6.2, 4.6, 2.6], segs = [];
  cm.ROADS.forEach((r, ri) => { for (let k = 0; k < r.nodes.length - 1; k++) { const a = r.nodes[k], b = r.nodes[k + 1]; segs.push([cm.NODE_XZ[a * 2], cm.NODE_XZ[a * 2 + 1], cm.NODE_XZ[b * 2], cm.NODE_XZ[b * 2 + 1], W[r.cls] / 2, ri, r.cls]); } });
  const hits = [];
  for (const cell of SOLIDS.cells.values()) for (const [x, z, r] of cell) {
    if (!boxes.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1)) continue;
    for (const [ax, az, bx, bz, h, ri, cls] of segs) {
      const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
      const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
      if (d < h + r * 0.5) { hits.push([+x.toFixed(1), +z.toFixed(1), r, ri, cls, +(d - h).toFixed(2)]); break; }
    }
  }
  return hits;
}, boxes);
console.log(JSON.stringify(out));
await browser.close();
