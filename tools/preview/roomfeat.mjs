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
// the controller: a flick right changes lane on the guided ride, Cross jumps
await page.evaluate(() => { __fakePad.axes[0] = 0; });
const lane0 = await page.evaluate(() => __game.lane);
await page.evaluate(() => { __fakePad.axes[0] = 0.9; }); await frames(3); await page.evaluate(() => { __fakePad.axes[0] = 0; }); await frames(3);
await tap(0);
log('explorePad', await page.evaluate((l0) => ({ lane0: l0, lane: __game.lane, y: __game.y, mode: __pad.mode }), lane0));
await page.click('#pause', { force: true, timeout: 600000 }); await wait(800);
await page.click('#pauseOverlay [data-p="walk"]', { force: true, timeout: 600000 }); await wait(5000);
// walking backwards with the left stick pulled down
const p0 = await page.evaluate(() => ({ xz: __game.footXZ, yaw: __game.footYaw }));
await page.evaluate(() => { __fakePad.axes[1] = 1; }); await frames(12); await page.evaluate(() => { __fakePad.axes[1] = 0; }); await frames(2);
const p1 = await page.evaluate(() => __game.footXZ);
const fx = -Math.sin(p0.yaw), fz = -Math.cos(p0.yaw);
log('walkBack', { along: (p1[0] - p0.xz[0]) * fx + (p1[1] - p0.xz[1]) * fz });
// the D-pad pointer
await page.evaluate(() => __padSet(15, true)); await frames(6); await page.evaluate(() => __padSet(15, false)); await frames(2);
log('pointer', await page.evaluate(() => { const e = document.querySelector('.pad-pointer'); return e ? { op: e.style.opacity, t: e.style.transform } : null; }));
await shot('1-pointer');
// to Vikings' entrance: the popup, Cross enters, the hall's choices
await page.evaluate(() => { const f = __game['foot']; f.x = 160.7; f.z = 842.5; f.yaw = Math.atan2(0.12, 0.99); __game['snapCam'] = true; });
await page.waitForSelector('#wPop:not([hidden])', { timeout: 300000 });
await page.waitForFunction(() => document.querySelector('.pad-pointer')?.style.opacity !== '1', null, { timeout: 120000 }); // (the pointer hides itself)
await tap(0);
await page.waitForSelector('#wHall:not([hidden])', { timeout: 60000 });
log('hall', await page.evaluate(() => [...document.querySelectorAll('#wHall button, #wHall option')].map((b) => b.textContent.trim())));
await shot('2-hall');
await tap(0);
await page.waitForFunction(() => __game.inRoom, null, { timeout: 120000 });
await wait(2500);
await shot('3-room-eye');
await tap(3); await frames(3);
log('view', await page.evaluate(() => __game.roomView));
await shot('4-room-character');
const info = await page.evaluate(() => { const p = __game['room'].play; return { places: p.built.places.map((q) => [q.x, q.z, q.upper]), spots: p.built.spots.map((q) => [q.kind, q.x, q.z]), acts: [...p.activities] }; });
log('room', info);
// to a bed: sleep
await page.evaluate(() => { const p = __game['room'].play, pl = p.built.places.find((q) => !q.upper && !p.occupants.some((o) => o.kind !== 'you' && o.bed === q.bed)) ?? p.built.places[0]; for (let r = 0.6; r < 1.5; r += 0.1) for (let a = 0; a < 6.3; a += 0.3) { const x = pl.x + Math.cos(a) * r, z = pl.z + Math.sin(a) * r; if (p.free(x, z)) { p.x = x; p.z = z; return; } } });
await page.waitForFunction(() => !!__game.roomAction, null, { timeout: 60000 }).catch(() => {});
log('action', await page.evaluate(() => __game.roomAction?.label ?? null));
await page.keyboard.press('KeyF'); await wait(2500);
await shot('5-sleep');
await page.click('#rsWake').catch(() => {}); await wait(800);
if (await page.$('#rsDone')) { await page.waitForSelector('#rsDone:not([disabled])', { timeout: 120000 }).catch(() => {}); await page.click('#rsDone').catch(() => {}); await wait(800); }
// to a desk: study
await page.evaluate(() => { const p = __game['room'].play, d = p.built.spots.find((q) => q.kind === 'chair') ?? p.built.spots.find((q) => q.kind === 'desk'); if (!d) return; for (let r = 0.4; r < 1.2; r += 0.1) for (let a = 0; a < 6.3; a += 0.3) { const x = d.x + d.w / 2 + Math.cos(a) * r, z = d.z + d.d / 2 + Math.sin(a) * r; if (p.free(x, z)) { p.x = x; p.z = z; return; } } });
await page.waitForFunction(() => __game.roomAction?.kind === 'study', null, { timeout: 60000 }).catch(() => {});
log('action2', await page.evaluate(() => __game.roomAction?.label ?? null));
await page.keyboard.press('KeyF'); await wait(600);
await page.waitForSelector('.lp-icon', { timeout: 120000 }).catch(() => {});
await shot('6-sitting');
await wait(1500);
await page.click('.lp-icon >> nth=0').catch((e) => console.log('noicon', e.message.slice(0, 80)));
await wait(800);
await shot('7-laptop');
await page.click('#lpOff').catch(() => {}); await wait(2500);
log('afterLaptop', await page.evaluate(() => ({ doing: __game.roomDoing, screen: !!document.querySelector('.room-screen') })));
await shot('8-after');
await browser.close();
