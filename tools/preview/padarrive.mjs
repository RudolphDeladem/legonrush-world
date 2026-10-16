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
// the arrival card: shown as the ride shows it on arrival; the D-pad moves its highlight to Drone view, Cross chooses it
// (the pointer, if the D-pad moved it before, rests on nothing it can press)
const shown = await page.evaluate(() => { for (let i = 12; i >= 0; i--) { try { __game.onGuide(i); } catch { continue; } const c = document.querySelector('#guideCard'); if (c && !c.hidden && c.classList.contains('arrived')) return i; } return -1; });
log('arrivedCard', shown);
await frames(4);
for (let k = 0; k < 8; k++) {
  const id = await page.evaluate(() => document.activeElement?.id);
  if (id === 'gcDrone') break;
  await hold(k < 1 ? 13 : 14);
  if ((await page.evaluate(() => document.activeElement?.id)) === 'gcDrone') break;
  await hold(15);
}
log('focused', await page.evaluate(() => document.activeElement?.id));
await hold(0);
await frames(6);
log('droning', await page.evaluate(() => __game.droning));
await shot('a1-drone');
// Done by Cross: the highlight back to Done
await page.evaluate(() => document.querySelector('#gcGo')?.focus());
await hold(0); await frames(6);
log('afterDone', await page.evaluate(() => ({ cardHidden: document.querySelector('#guideCard')?.hidden })));
await browser.close();
