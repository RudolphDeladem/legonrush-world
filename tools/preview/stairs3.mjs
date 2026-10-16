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
await page.click('#pause'); await wait(800);
await page.click('#pauseOverlay [data-p="walk"]'); await wait(5000);
// the Bani entrance porches: modelled tops 0.25-0.35 m above the ground, clustered; each tried from 3.2 m out
const C = await page.evaluate(async () => {
  const W = window.__walkgrid;
  const f = __game['foot']; f.x = 815.9; f.z = -1250; __game['snapCam'] = true;
  await new Promise((r) => setTimeout(r, 3000));
  for (let x = 770; x < 880; x += 30) for (let z = -1320; z < -1180; z += 30) W.warmWalk(x, z);
  const pts = [];
  for (let x = 770; x < 880; x += 0.35) for (let z = -1320; z < -1180; z += 0.35) {
    const t = W.walkTopAt(x, z, 0.2);
    if (t !== null && t > 0.22 && t < 0.38) pts.push([x, z]);
  }
  // clusters by 1.5 m linking
  const cl = [], seen = new Uint8Array(pts.length);
  for (let i = 0; i < pts.length; i++) { if (seen[i]) continue; const q = [i], c = []; seen[i] = 1;
    while (q.length) { const j = q.pop(); c.push(pts[j]); for (let k = 0; k < pts.length; k++) if (!seen[k] && Math.abs(pts[k][0] - pts[j][0]) < 0.5 && Math.abs(pts[k][1] - pts[j][1]) < 0.5) { seen[k] = 1; q.push(k); } }
    if (c.length > 40 && c.length < 400) cl.push(c); }
  return cl.map((c) => { const xs = c.map((p) => p[0]), zs = c.map((p) => p[1]); return [c.length, (Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)]; });
});
console.log('clusters', JSON.stringify(C.map((c) => c.map((v) => +v.toFixed(1)))));
let n = 0;
for (const [, px, pz, sx, sz] of C) {
  if (n++ >= 3) break;
  const start = await page.evaluate(([px, pz, sx, sz]) => {
    const W = window.__walkgrid;
    // from the long sides' outside, then the short ones
    const cand = sx > sz ? [[px, pz + sz / 2 + 2.5], [px, pz - sz / 2 - 2.5], [px + sx / 2 + 2.5, pz], [px - sx / 2 - 2.5, pz]] : [[px + sx / 2 + 2.5, pz], [px - sx / 2 - 2.5, pz], [px, pz + sz / 2 + 2.5], [px, pz - sz / 2 - 2.5]];
    for (const [x, z] of cand) if (W.walkTopAt(x, z, 0.1) === null && !W.walkBlocked(x, z, 0)) return [x, z, Math.atan2(-(px - x), -(pz - z))];
    return null;
  }, [px, pz, sx, sz]);
  if (!start) { console.log('cluster', px.toFixed(1), pz.toFixed(1), 'no start'); continue; }
  await page.evaluate(([x, z, yaw]) => { const f = __game['foot']; f.x = x; f.z = z; f.yaw = yaw; f.y = 0; __game['snapCam'] = true; }, start);
  await frames(4);
  await page.keyboard.down('KeyW'); await frames(22); await page.keyboard.up('KeyW');
  const r = await page.evaluate(() => ({ y: __game['foot'].y, xz: __game.footXZ }));
  console.log('climb', px.toFixed(1), pz.toFixed(1), JSON.stringify({ start, ...r }));
  await page.screenshot({ path: `${out}/stairs${n}.png`, timeout: 600000 });
}
await browser.close();
