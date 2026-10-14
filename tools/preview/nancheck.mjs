// for a named model node, the colours and index ranges of the vertices whose positions are not finite: node .preview/nancheck.mjs "<name>"
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 400, height: 300 } });
await p.goto('http://localhost:5299/.preview/halls.html?cam=130,330,2110,130,0,2109.99,55', { timeout: 600000 });
await p.waitForFunction(() => window.__done, null, { timeout: 600000 });
console.log(JSON.stringify(await p.evaluate((name) => {
  const out = [];
  window.__scene.traverse((o) => { if (o.name === name) o.traverse((m) => { if (!m.isMesh || !m.geometry.attributes.color) return; const a = m.geometry.attributes.position.array, c = m.geometry.attributes.color.array; let run = null;
    for (let i = 0; i < a.length / 3; i++) { const bad = !Number.isFinite(a[i * 3]) || !Number.isFinite(a[i * 3 + 1]) || !Number.isFinite(a[i * 3 + 2]);
      if (bad && !run) run = { from: i, col: [c[i * 3], c[i * 3 + 1], c[i * 3 + 2]].map((v) => Math.round(v * 255)), prev: Array.from(a.slice(Math.max(0, i - 3) * 3, i * 3)).map((v) => +v.toFixed(2)) };
      if (!bad && run) { run.to = i; out.push(run); run = null; } }
    if (run) out.push(run); }); });
  return out;
}, process.argv[2])));
await b.close();
