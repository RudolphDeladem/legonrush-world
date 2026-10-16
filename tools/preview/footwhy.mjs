// the room features and the controller in the real app (dev build on 4300): node .preview/roomfeat.mjs outdir
import { chromium } from 'playwright';
const [, , out] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack?.slice(0, 400)));
await page.addInitScript(() => {
  const btn = () => Array.from({ length: 18 }, () => ({ pressed: false, value: 0, touched: false }));
  window.__fakePad = { id: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: btn(), timestamp: 0 };
  navigator.getGamepads = () => [window.__fakePad];
  window.__padSet = (i, on) => { window.__fakePad.buttons[i] = { pressed: on, value: on ? 1 : 0, touched: on }; };
});
const log = (k, v) => console.log(k, JSON.stringify(v));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png`, timeout: 600000 });
const wait = (ms) => page.waitForTimeout(ms);
// (software rendering runs at a frame or two a second: every press is held for several frames)
const frames = (n) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const tap = async (i) => { await page.evaluate((i) => __padSet(i, true), i); await frames(3); await page.evaluate((i) => __padSet(i, false), i); await frames(3); };
await page.goto('http://localhost:4300/play/?fakelive', { timeout: 600000 });
await page.waitForFunction(() => window.__game && window.__obNext, null, { timeout: 600000 });
for (let i = 0; i < 12; i++) { const done = await page.evaluate(() => { if (window.__game.phase === 'riding' || window.__game.phase === 'countdown') return true; try { window.__obNext(); } catch {} return false; }); if (done) break; await wait(700); }
await page.waitForFunction(() => window.__game.phase === 'riding' || window.__game.phase === 'countdown', null, { timeout: 1500000 }).catch(() => {});
await page.evaluate(() => { window.__oldRoute = window.__game.currentRoute; return window.__rideTest('explore'); });
await page.waitForFunction(() => window.__game.currentRoute !== window.__oldRoute && !document.querySelector('.loading') && document.querySelector('#pause') && window.__game.phase === 'riding', null, { timeout: 1500000, polling: 1000 });
await wait(6000);
await page.click('#pause', { force: true, timeout: 600000 }); await wait(800);
await page.click('#pauseOverlay [data-p="walk"]', { force: true, timeout: 600000 }); await wait(5000);
// what stops the walker between the open ground and the first Bani porch, every 0.25 m
const out2 = await page.evaluate(async () => {
  const f = __game['foot']; f.x = 791.9; f.z = -1252; __game['snapCam'] = true;
  await new Promise((r) => setTimeout(r, 3000));
  window.__walkgrid.warmWalk(791.9, -1250);
  const res = [];
  for (let z = -1253; z <= -1244; z += 0.5) res.push([z, JSON.stringify(window.__footWhy(791.9, z, 0)), window.__walkgrid.walkTopAt(791.9, z, 0.2)]);
  return res;
});
for (const r of out2) console.log(r.join(' '));
await browser.close();
