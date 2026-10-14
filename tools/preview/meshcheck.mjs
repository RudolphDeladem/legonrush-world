// lists the meshes of a named model node with their vertex counts and any NaN in their positions: node .preview/meshcheck.mjs "<node name>"
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 400, height: 300 } });
await p.goto('http://localhost:5299/.preview/halls.html?cam=130,330,2110,130,0,2109.99,55', { timeout: 600000 });
await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
console.log(JSON.stringify(await p.evaluate((name) => {
  const out = [];
  window.__scene.traverse((o) => { if (o.name === name) o.traverse((m) => { if (!m.isMesh) return; const a = m.geometry.attributes.position.array; let nan = 0; for (const v of a) if (!Number.isFinite(v)) nan++; m.geometry.computeBoundingSphere(); out.push({ type: m.material.type, n: a.length / 3, nan, r: m.geometry.boundingSphere?.radius, vis: m.visible }); }); });
  return out;
}, process.argv[2]), null, 0));
await b.close();
