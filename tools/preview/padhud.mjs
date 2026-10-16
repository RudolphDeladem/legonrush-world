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
// the controller on the ride's screens: Options opens the pause menu, the D-pad moves its highlight to "Get down and
// walk", Cross chooses it; then on foot the D-pad pointer reaches the "Ride bicycle" button and Cross presses it
const hold = async (i, n = 3) => { await page.evaluate((i) => __padSet(i, true), i); await frames(n); await page.evaluate((i) => __padSet(i, false), i); await frames(3); };
await shot('p0-before');
log('state', await page.evaluate(() => ({ riding: __game.isRiding, phase: __game.phase, paused: __game.paused, mode: __pad.mode, overlay: !!document.querySelector('#pauseOverlay, .overlay') })));
for (let k = 0; k < 4 && !(await page.$('#pauseOverlay [data-p="walk"]')); k++) { await hold(9, 4); await frames(6); }
await page.waitForSelector('#pauseOverlay [data-p="walk"]', { timeout: 120000 });
log('pause', await page.evaluate(() => document.activeElement?.textContent?.trim()));
for (let k = 0; k < 8; k++) {
  const f = await page.evaluate(() => document.activeElement?.getAttribute('data-p'));
  if (f === 'walk') break;
  await hold(13);
}
log('focused', await page.evaluate(() => document.activeElement?.textContent?.trim()));
await hold(0);
await page.waitForFunction(() => __game.walking, null, { timeout: 120000 }).then(() => log('walking', true)).catch(() => log('walking', false));
await shot('p1-walking');
// the pointer: move with the D-pad toward the ride-bicycle button, then Cross
const target = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /ride bicycle|get on/i.test(x.textContent ?? '') && x.offsetParent); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, b.textContent.trim()]; });
log('target', target);
if (target) {
  await hold(14, 2); // show the pointer
  for (let k = 0; k < 40; k++) {
    const p = await page.evaluate(() => { const t = document.querySelector('.pad-pointer').style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/); return [+t[1] + 4, +t[2] + 2]; });
    const dx = target[0] - p[0], dy = target[1] - p[1];
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) break;
    const btn = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 15 : 14) : (dy > 0 ? 13 : 12);
    await hold(btn, Math.abs(dx) + Math.abs(dy) > 200 ? 3 : 1);
  }
  await hold(0);
  await page.waitForFunction(() => !__game.walking, null, { timeout: 60000 }).then(() => log('rodeAgain', true)).catch(() => log('rodeAgain', false));
  await shot('p2-after');
}
await browser.close();
