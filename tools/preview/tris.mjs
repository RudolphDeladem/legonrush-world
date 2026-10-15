// triangles and draw calls the renderer reports for named views (and the scrub lands' counts): node .preview/tris.mjs view...
import { chromium } from 'playwright';
const [, , ...views] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 640, height: 380 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(`http://localhost:5299/.preview/halls.html?${views[0].startsWith('cam=') ? views[0] : 'view=' + views[0]}`, { timeout: 600000 });
await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
console.log(await page.evaluate(() => { let g; window.__scene.traverse((o) => { if (o.name === 'scrub-lands') g = o; }); return g ? `crowns ${g.userData.crowns} tufts ${g.userData.tufts} overlays ${g.userData.cullMeshes.length}` : 'no scrub'; }));
for (const v of views) {
  const res = await page.evaluate((n) => {
    // as in the game by day: fog from 70 to 340 m (the far cull reads it), no preview-sized shadow pass
    const s = window.__scene, r = window.__r;
    s.fog = { isFog: true, color: s.background.clone(), near: 70, far: 340, name: '' };
    r.shadowMap.enabled = false;
    window.__view(n); r.info.autoReset = false; r.info.reset(); r.render(s, window.__cam);
    return `${r.info.render.triangles} tris, ${r.info.render.calls} calls`;
  }, v);
  console.log(v, res);
}
await browser.close();
