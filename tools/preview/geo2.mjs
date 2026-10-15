import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
await page.goto('http://localhost:5299/play/', { timeout: 600000, waitUntil: 'load' });
await page.waitForFunction(() => window.__game, null, { timeout: 600000 });
console.log(await page.evaluate(() => {
  const g = window.__game; const r = { leaf: [0, 0], other: [0, 0], indexed: 0, nonIndexed: 0, colorF32: 0, normF32: 0, inst: 0 };
  g.scene.traverse((o) => { if (!o.isMesh || !o.geometry?.attributes?.position) return; if (o.isInstancedMesh) { r.inst += o.count; return; }
    const ge = o.geometry, v = ge.attributes.position.count, b = Object.values(ge.attributes).reduce((a, x) => a + (x.array?.byteLength ?? 0), 0) + (ge.index?.array.byteLength ?? 0);
    const k = o.userData.noCollide ? 'leaf' : 'other'; r[k][0] += v; r[k][1] += b;
    if (ge.index) r.indexed += v; else r.nonIndexed += v;
    if (ge.attributes.color?.array instanceof Float32Array) r.colorF32 += ge.attributes.color.array.byteLength;
    if (ge.attributes.normal?.array instanceof Float32Array) r.normF32 += ge.attributes.normal.array.byteLength; });
  return JSON.stringify({ leafVerts: r.leaf[0], leafMB: (r.leaf[1] / 1e6) | 0, otherVerts: r.other[0], otherMB: (r.other[1] / 1e6) | 0, indexed: r.indexed, nonIndexed: r.nonIndexed, colorF32MB: (r.colorF32 / 1e6) | 0, normF32MB: (r.normF32 / 1e6) | 0, inst: r.inst });
}));
await browser.close();
