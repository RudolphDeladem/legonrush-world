import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
await page.goto('http://localhost:5299/play/', { timeout: 600000, waitUntil: 'load' });
await page.waitForFunction(() => window.__game, null, { timeout: 600000 });
console.log(await page.evaluate(() => {
  const g = window.__game; let tot = 0, green = 0, roots = 0;
  g.scene.traverse((o) => { if (o.name === 'campus-life' || o.name === 'diaspora-halls' || (o.parent && o.parent.parent === g.scene && o.userData.cullMeshes && o.name !== 'campus-life')) roots++; });
  // all non-instanced meshes that are not noCollide and have colour
  g.scene.traverse((o) => { if (!o.isMesh || o.isInstancedMesh || o.userData.noCollide) return; const ge = o.geometry, col = ge.attributes.color, n = (ge.index ? ge.index.count : ge.attributes.position.count) / 3; tot += n;
    if (col) for (let t = 0; t < n; t++) { const i0 = ge.index ? ge.index.getX(t * 3) : t * 3; const r = col.getX(i0), gg = col.getY(i0), b = col.getZ(i0); if (gg > r * 1.08 && gg > b * 1.12) green++; } });
  return `tris ${tot} green ${green} roots ${roots}`;
}));
await browser.close();
