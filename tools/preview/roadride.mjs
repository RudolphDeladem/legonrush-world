// rides every road's centre line both ways with the free-ridden bike's own rule (Game.ts updateFree: what blocks, and a
// bank steeper than 0.4 m in 0.6 m), and lists where a bike would be stopped
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
await page.goto(`http://localhost:${process.env.PORT ?? 5298}/.preview/halls.html?cam=0,300,0,0,0,-0.1,60`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
const res = await page.evaluate(() => {
  const { blockedWhy, groundFrom, deckAt, ROADS, NODE_XZ } = window.__ride;
  const out = [];
  ROADS.forEach((r, ri) => {
    const half = [9, 7.4, 6.2, 4.6, 2.6][r.cls] / 2;
    const pts = r.nodes.map((n) => [NODE_XZ[n * 2], NODE_XZ[n * 2 + 1]]);
    for (const dir of [1, -1]) {
      const P = dir > 0 ? pts : pts.slice().reverse();
      let g = groundFrom(P[0][0], P[0][1], 50), hit = null;
      for (let i = 0; i < P.length - 1 && !hit; i++) {
        const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az);
        if (L < 0.01) continue;
        const fx = (bx - ax) / L, fz = (bz - az) / L;
        for (let t = 0; t < L; t += 0.5) {
          const x = ax + fx * t, z = az + fz * t;
          const g0 = groundFrom(x, z, g);
          const up = (qx, qz) => { const d = deckAt(qx, qz); return !!d && g0 > d.h - 2.5; };
          const why = (qx, qz) => (up(qx, qz) ? null : blockedWhy(qx, qz, false));
          // across the road's width: blocked only when every lane across it is (no way through)
          const o = Math.max(0, half - 0.5);
          let open = false, first = null;
          for (let l = -o; l <= o + 1e-6 && !open; l += 0.5) {
            const qx = x - fz * l, qz = z + fx * l;
            const w = why(qx + fx * 0.7, qz + fz * 0.7) ?? why(qx, qz);
            const slope = Math.abs(groundFrom(qx + fx * 0.6, qz + fz * 0.6, g0) - groundFrom(qx, qz, g0));
            if (!w && slope < 0.4) open = true; else if (!first) first = w ?? `slope ${slope.toFixed(2)}`;
          }
          if (!open) { hit = [ri, r.name ?? '', r.cls, dir, +x.toFixed(1), +z.toFixed(1), first]; break; }
          g = g0;
        }
      }
      if (hit) out.push(hit);
    }
  });
  return out;
});
console.log('blocked roads', res.length);
for (const r of res) console.log(JSON.stringify(r));
await browser.close();
