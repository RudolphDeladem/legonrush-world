import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://localhost:5299/play/', { timeout: 600000, waitUntil: 'load' });
await page.waitForFunction(() => window.__game, null, { timeout: 600000 });
console.log(await page.evaluate(() => {
  const g = window.__game, seen = new Set(), by = new Map(), tex = new Set();
  const top = (o) => { let p = o; const chain = []; while (p && p.parent) { chain.push(p.name || p.type); p = p.parent; } return chain.reverse().slice(0, 3).join('/'); };
  g.scene.traverse((o) => {
    if (o.geometry) { let b = 0; for (const a of Object.values(o.geometry.attributes)) { const arr = a.array ?? a.data?.array; if (arr && !seen.has(arr)) { seen.add(arr); b += arr.byteLength; } } if (o.geometry.index && !seen.has(o.geometry.index.array)) { seen.add(o.geometry.index.array); b += o.geometry.index.array.byteLength; }
      if (o.isInstancedMesh && !seen.has(o.instanceMatrix.array)) { seen.add(o.instanceMatrix.array); b += o.instanceMatrix.array.byteLength; }
      const k = top(o); by.set(k, (by.get(k) ?? 0) + b); }
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) for (const v of Object.values(m)) if (v && v.isTexture) tex.add(v);
  });
  let tb = 0; for (const t of tex) { const im = t.image; if (im && im.width) tb += im.width * im.height * 4 * 1.33; }
  const list = [...by.entries()].sort((a, b) => b[1] - a[1]);
  const tot = list.reduce((a, [, v]) => a + v, 0);
  return `geometry arrays ${(tot / 1e6).toFixed(0)} MB, textures ~${(tb / 1e6).toFixed(0)} MB (${tex.size})\n` + list.slice(0, 30).map(([k, v]) => `${(v / 1e6).toFixed(1).padStart(7)} MB ${k}`).join('\n') + `\nheap ${(performance.memory.usedJSHeapSize / 1e6).toFixed(0)} MB`;
}));
await browser.close();
