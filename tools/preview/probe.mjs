import { chromium } from 'playwright';
const [cx, cz] = process.argv[2].split(',').map(Number), pts = JSON.parse(process.argv[3]);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 400, height: 300 } });
await p.goto(`http://localhost:5299/.preview/halls.html?cam=${cx},200,${cz},${cx},0,${cz + 0.01},45`, { timeout: 600000 });
await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
console.log(JSON.stringify(await p.evaluate(async (pts) => {
  const THREE = await import('/node_modules/.vite/deps/three.js');
  const rc = new THREE.Raycaster(); const out = [];
  window.__scene.updateMatrixWorld(true);
  for (const [x, z] of pts) { rc.set(new THREE.Vector3(x, 30, z), new THREE.Vector3(0, -1, 0));
    const hits = rc.intersectObject(window.__scene, true).filter((h) => h.object.visible).slice(0, 4).map((h) => { const names = []; let q = h.object; while (q) { if (q.name) names.push(q.name); q = q.parent; } return h.point.y.toFixed(2) + ':' + names.slice(0, 3).join('<'); });
    out.push([x, z, hits]); }
  return out; }, pts)));
await b.close();
