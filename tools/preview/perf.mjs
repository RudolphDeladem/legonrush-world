// draw calls, triangles and a frame time at named cameras, on a given port: node .preview/perf.mjs 5299 '[{"name","cam"}]'
import { chromium } from 'playwright';
const [, , port, list] = process.argv, views = JSON.parse(list);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
await p.goto(`http://localhost:${port}/.preview/halls.html?${views[0].cam}`, { timeout: 900000 });
await p.waitForFunction(() => window.__done, null, { timeout: 900000 });
for (const v of views) {
  const r = await p.evaluate((cam) => {
    window.__view(cam);
    const R = window.__r; R.info.autoReset = false; R.info.reset();
    const t0 = performance.now(); for (let i = 0; i < 3; i++) R.render(window.__scene, window.__cam); const ms = (performance.now() - t0) / 3;
    return { calls: Math.round(R.info.render.calls / 3), tris: Math.round(R.info.render.triangles / 3), ms: Math.round(ms) };
  }, v.cam);
  console.log(v.name, JSON.stringify(r));
}
await b.close();
