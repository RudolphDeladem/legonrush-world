// draw calls by top-level group at a camera (render list counted with onBeforeRender): node .preview/callsby.mjs port cam
import { chromium } from 'playwright';
const [, , port, cam] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
await p.goto(`http://localhost:${port}/.preview/halls.html?${cam}`, { timeout: 900000 });
await p.waitForFunction(() => window.__done, null, { timeout: 900000 });
console.log(JSON.stringify(await p.evaluate(() => {
  const counts = {}, sc = window.__scene;
  const top = (o) => { let t = o; while (t.parent && t.parent !== sc) t = t.parent; let n = t.name || t.type; if (t.children.length && o.parent && o.parent !== t) n += '/' + (o.parent.name || ''); return n; };
  sc.traverse((o) => { if (o.isMesh || o.isInstancedMesh) { const prev = o.onBeforeRender; o.onBeforeRender = function (...a) { const k = top(o); counts[k] = (counts[k] || 0) + 1; if (prev) prev.apply(this, a); }; } });
  window.__r.render(sc, window.__cam);
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25);
})));
await b.close();
