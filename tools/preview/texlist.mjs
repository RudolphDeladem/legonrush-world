// biggest textures in the scene by size: node .preview/texlist.mjs [ua]
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 }, ...(process.argv[2] ? { userAgent: process.argv[2] } : {}) })).newPage();
await page.goto('http://localhost:5299/play/', { timeout: 600000 });
await page.waitForFunction(() => window.__game?.isReady, null, { timeout: 900000, polling: 1000 });
console.log(await page.evaluate(() => {
  const seen = new Map();
  window.__game.scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const [k, v] of Object.entries(m)) if (v?.isTexture && v.image?.width) { const e = seen.get(v) ?? { w: v.image.width, h: v.image.height, n: 0, k, name: o.name || o.parent?.name || '' }; e.n++; seen.set(v, e); } });
  const by = new Map();
  for (const e of seen.values()) { const key = `${e.w}x${e.h} ${e.k}`; const a = by.get(key) ?? { c: 0, mb: 0, names: new Set() }; a.c++; a.mb += e.w * e.h * 4 * 1.33 / 1e6; if (a.names.size < 4) a.names.add(e.name); by.set(key, a); }
  return [...by.entries()].sort((a, b) => b[1].mb - a[1].mb).slice(0, 25).map(([k, a]) => `${a.mb.toFixed(1)} MB  ${a.c} x ${k}  ${[...a.names].join(' | ')}`).join('\n');
}));
await browser.close();
