// meshes with a vertex near a point: node .preview/findmesh.mjs x z r
import { chromium } from 'playwright';
const [, , X, Z, R = '1.5'] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 200, height: 120 } });
await page.goto(`http://localhost:${process.env.PORT ?? 5298}/.preview/halls.html?cam=0,300,0,0,0,-0.1,60`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
const out = await page.evaluate(([x, z, r]) => {
  const res = [], v = new window.__THREE.Vector3();
  window.__scene.traverse((o) => {
    if (!o.isMesh || !o.geometry?.attributes?.position?.array) return;
    const p = o.geometry.attributes.position; let n = 0, ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (Math.hypot(v.x - x, v.z - z) < r) { n++; ymin = Math.min(ymin, v.y); ymax = Math.max(ymax, v.y); } }
    if (n) { let path = []; for (let q = o; q; q = q.parent) path.push(q.name || q.type); res.push([n, ymin.toFixed(2), ymax.toFixed(2), o.material?.name || o.material?.type, path.slice(0, 4).join(' < ')]); }
  });
  return res;
}, [+X, +Z, +R]);
for (const r of out) console.log(JSON.stringify(r));
await browser.close();
