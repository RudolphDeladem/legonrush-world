import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 320, height: 200 } });
await p.goto('http://localhost:5299/.preview/halls.html?cam=300,300,2000,300,0,1999.9,60', { timeout: 600000 });
await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
const pts = process.argv.slice(2).map((s) => s.split(',').map(Number));
console.log(JSON.stringify(await p.evaluate(async (pts) => {
  const T = await import('/node_modules/.vite/deps/three.js');
  const out = [];
  for (const [x, z] of pts) {
    const rc = new T.Raycaster(new T.Vector3(x - 3, 0.8, z), new T.Vector3(1, 0, 0), 0, 6);
    const h = rc.intersectObjects(window.__scene.children, true).filter((i) => i.object.isMesh || i.object.isInstancedMesh).slice(0, 3);
    out.push([x, z, h.map((i) => { let o = i.object, n = []; while (o && n.length < 4) { if (o.name) n.push(o.name); o = o.parent; } return [+(i.point.x).toFixed(1), n.join('<')]; })]);
  }
  return out;
}, pts)));
await b.close();
