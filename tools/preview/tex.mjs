import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
await page.goto('http://localhost:5299/play/', { timeout: 600000, waitUntil: 'load' });
await page.waitForFunction(() => window.__game, null, { timeout: 600000 });
console.log(await page.evaluate(() => {
  const g = window.__game, tex = new Map();
  const top = (o) => { let p = o; const chain = []; while (p && p.parent) { chain.push(p.name || p.type); p = p.parent; } return chain.reverse().slice(0, 2).join('/'); };
  g.scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const [k, v] of Object.entries(m)) if (v && v.isTexture && !tex.has(v)) tex.set(v, top(o) + ' .' + k); });
  const bySize = new Map(), byOwner = new Map();
  for (const [t, own] of tex) { const im = t.image; if (!im || !im.width) continue; const b = im.width * im.height * 4 * (t.generateMipmaps !== false ? 1.33 : 1); const k = `${im.width}x${im.height}`; const e = bySize.get(k) ?? [0, 0]; e[0]++; e[1] += b; bySize.set(k, e); const o = own.split(' .')[0]; const f = byOwner.get(o) ?? [0, 0]; f[0]++; f[1] += b; byOwner.set(o, f); }
  const s = (m) => [...m.entries()].sort((a, b) => b[1][1] - a[1][1]).slice(0, 25).map(([k, [n, b]]) => `${(b / 1e6).toFixed(1).padStart(7)} MB ${String(n).padStart(4)} x ${k}`).join('\n');
  return s(bySize) + '\n---\n' + s(byOwner);
}));
await browser.close();
