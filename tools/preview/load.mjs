// startup check: node .preview/load.mjs [url] [ua]
import { chromium } from 'playwright';
const url = process.argv[2] ?? 'http://localhost:5299/play/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...(process.argv[3] ? { userAgent: process.argv[3] } : {}) });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('[T]')) console.log('CONSOLE', m.text().slice(0, 200)); });
await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true });
});
const t0 = Date.now();
await page.goto(url, { timeout: 600000, waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => document.getElementById('app')?.firstElementChild, null, { timeout: 600000 });
console.log('first screen at', (Date.now() - t0) / 1000, 's');
await page.waitForFunction(() => window.__game?.isReady, null, { timeout: 900000, polling: 1000 });
console.log('world ready at', (Date.now() - t0) / 1000, 's');
await page.waitForTimeout(5000);
console.log(await page.evaluate(() => { window.gc?.(); const l = window.__long.sort((a, b) => b - a); return `longest tasks ms: ${l.slice(0, 8).join(', ')} (count ${l.length}); heap ${(performance.memory.usedJSHeapSize / 1e6).toFixed(0)} MB, freed attrs ${(() => { let a = 0, f = 0; window.__game.scene.traverse((o) => { if (o.geometry) for (const x of Object.values(o.geometry.attributes)) { a++; if (x.array === null) f++; } }); return f + '/' + a; })()}`; }));
console.log(await page.evaluate(() => { const r = window.__game.renderer; const seen = new Set(); let b = 0; window.__game.scene.traverse((o) => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) for (const v of Object.values(m)) if (v?.isTexture && !seen.has(v)) { seen.add(v); const i = v.image; if (i?.width) b += i.width * i.height * 4 * (v.generateMipmaps ? 1.33 : 1); } }); return 'texture MB ' + (b / 1e6).toFixed(0) + ', programs ' + r.info.programs.length + ', geometries ' + r.info.memory.geometries + ', textures ' + r.info.memory.textures; }));
await browser.close();
