import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 400, height: 300 } });
await p.goto('http://localhost:5299/.preview/halls.html?cam=1000,300,-660,1000,0,-660.01,55', { timeout: 600000 });
await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
console.log(JSON.stringify(await p.evaluate(() => { const bad = []; let n = 0, ev = 0;
  window.__scene.traverse((m) => { if (!m.isMesh) return; n++; let q = m; while (q) { if (/UGBS/.test(q.name)) { ev++; break; } q = q.parent; }
    const a = m.geometry.attributes.position.array; for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) { bad.push(m.name || m.parent?.name); break; } });
  return { meshes: n, ugMeshes: ev, bad }; })));
await b.close();
