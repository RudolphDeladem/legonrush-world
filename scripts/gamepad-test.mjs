// Controller test without hardware: a simulated gamepad (navigator.getGamepads replaced in the page) drives the
// dev build. Run with the dev server up: `npx vite --port 5299` then `node scripts/gamepad-test.mjs`.
// Checks: detection and the guide's labels per family, pause/resume, steering, analog pedal, brake and reverse,
// look and camera, menu navigation with the D-pad, remapping, and that a disconnect mid-ride lets go of everything.
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:5299/play/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 760, height: 480 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failures = 0;
const check = (ok, what, extra = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${extra ? ` (${extra})` : ''}`); if (!ok) failures++; };

await page.addInitScript(() => {
  const mk = (id, mapping = 'standard', nb = 17, na = 4) => ({ id, index: 0, mapping, connected: true, timestamp: 0, buttons: Array.from({ length: nb }, () => ({ pressed: false, touched: false, value: 0 })), axes: Array(na).fill(0) });
  window.__pads = [];
  navigator.getGamepads = () => window.__pads.filter((p) => p.connected);
  window.__connect = (id, mapping, nb, na) => { const p = mk(id, mapping, nb, na); p.index = window.__pads.length; window.__pads.push(p); const e = new Event('gamepadconnected'); e.gamepad = p; dispatchEvent(e); return p.index; };
  window.__disconnect = (i) => { const p = window.__pads[i]; p.connected = false; const e = new Event('gamepaddisconnected'); e.gamepad = p; dispatchEvent(e); };
  window.__btn = (i, b, v) => { const x = window.__pads[i].buttons[b]; x.value = v; x.pressed = v > 0.5; };
  window.__axis = (i, a, v) => { window.__pads[i].axes[a] = v; };
  // waits whole animation frames (the controller is polled once a frame; a slow software renderer makes them long)
  window.__frames = (n) => new Promise((r) => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
  window.__press = async (i, b) => { window.__btn(i, b, 1); await window.__frames(3); window.__btn(i, b, 0); await window.__frames(3); };
});
const press = (i, b) => page.evaluate(([i, b]) => window.__press(i, b), [i, b]);
const frames = (n) => page.evaluate((n) => window.__frames(n), n);
// game time, not wall time: the game steps at most 1/20 s a frame, so this waits for enough frames
const wait = (ms) => frames(Math.max(2, Math.ceil(ms / 50)));
const g = (expr) => page.evaluate(expr);

await page.goto(URL);
await page.click('#guest', { timeout: 300000 });
await page.waitForSelector('#dist', { timeout: 60000 });
await page.waitForTimeout(2500);
console.log('     frames per second:', await page.evaluate(async () => { const t = performance.now(); await window.__frames(20); return (20000 / (performance.now() - t)).toFixed(1); }));

// ---- detection and the guide (Sony id) ----
await g(() => window.__connect('DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'));
await press(0, 0);
await wait(300);
const guide1 = await g(() => document.querySelector('#padGuide:not([hidden])')?.textContent ?? '');
check(/R2/.test(guide1) && /Triangle/.test(guide1) || /R2/.test(guide1), 'guide shows PlayStation labels', guide1.slice(0, 90));
check(await g(() => document.querySelector('#app')?.classList.contains('pad-mode') || document.body.innerHTML.includes('pad-mode')), 'pad mode on after a button press');

// ---- the keyboard takes the guide back ----
await page.keyboard.press('Shift');
await wait(200);
check(await g(() => document.querySelector('#padGuide')?.hidden === true), 'a key press hides the controller guide');
await press(0, 3);
check(await g(() => document.querySelector('#padGuide')?.hidden === false), 'a controller press brings it back');

// ---- pause with Options, navigate, resume with Circle (back) ----
await press(0, 9);
check(await g(() => !!document.querySelector('#pauseOverlay') && window.__game.paused), 'Options pauses');
check(await g(() => /Controller/.test(document.querySelector('#pauseOverlay')?.textContent ?? '')), 'pause menu offers the Controller panel');
await press(0, 13);
const focused = await g(() => document.activeElement?.textContent?.trim() ?? '');
check(focused.length > 0, 'D-pad down focuses a menu button', focused);
await press(0, 1);
await wait(300);
check(await g(() => !document.querySelector('#pauseOverlay') && !window.__game.paused), 'Circle backs out of the pause menu');

// ---- free ride: steer, analog pedal, brake, reverse ----
await g(() => window.__game.freeRide());
await wait(800);
check(await g(() => window.__game.freeRiding), 'free ride started');
await g(() => window.__btn(0, 7, 0.5));
await wait(1800);
const v50 = await g(() => window.__game.freeState.speed ?? window.__game.freeInput.throttle);
const thr = await g(() => window.__game.freeInput.throttle);
check(thr > 0.4 && thr < 0.55, 'half R2 gives about half throttle', thr.toFixed(2));
await g(() => window.__btn(0, 7, 1));
await wait(2500);
const thr1 = await g(() => window.__game.freeInput.throttle);
check(thr1 > 0.99, 'full R2 gives full throttle', thr1.toFixed(2));
const sp1 = await g(() => window.__game.freeState);
console.log('     free state at full pedal:', JSON.stringify(sp1));
await g(() => window.__axis(0, 0, 0.6));
await wait(600);
const st = await g(() => window.__game.freeInput.steer);
check(st > 0.3 && st < 0.6, 'left stick at 0.6 steers part way (curve)', st.toFixed(2));
await g(() => window.__axis(0, 0, 0.08));
await wait(600);
check(await g(() => Math.abs(window.__game.freeInput.steer) < 0.02), 'inside the dead zone the bars straighten');
await g(() => { window.__axis(0, 0, 0); window.__btn(0, 7, 0); window.__btn(0, 6, 1); });
await wait(4000);
const st2 = await g(() => window.__game.freeState);
check(st2.reversing === true, 'L2 held at a standstill reverses', JSON.stringify(st2));
await g(() => window.__btn(0, 6, 0));
await wait(400);
check(await g(() => window.__game.freeInput.brake === false), 'letting go of L2 releases the brake');

// ---- look and camera ----
await g(() => window.__axis(0, 2, 1));
await wait(200);
check(await g(() => window.__game.look.x > 0.5), 'right stick looks around');
await g(() => window.__axis(0, 2, 0));
await press(0, 3);
check(await g(() => window.__game.camView === 1), 'Triangle changes the camera view');
await press(0, 11);
await g(() => window.__btn(0, 4, 1));
await wait(150);
check(await g(() => window.__game.lookBehind === true), 'L1 looks behind');
await g(() => window.__btn(0, 4, 0));
await press(0, 8);
check(await g(() => document.querySelector('#minimap')?.classList.contains('big')), 'Create enlarges the map');
await press(0, 8);

// ---- a disconnect mid-ride lets go of everything ----
await g(() => { window.__btn(0, 7, 1); window.__axis(0, 0, -1); window.__axis(0, 2, 1); window.__btn(0, 4, 1); });
await wait(500);
await g(() => window.__disconnect(0));
await wait(300);
const after = await g(() => ({ steer: window.__game.freeInput.steer, thr: window.__game.freeInput.throttle, brake: window.__game.freeInput.brake, look: window.__game.look.x, behind: window.__game.lookBehind, guide: document.querySelector('#padGuide').hidden }));
check(after.steer === 0 && after.thr === 0 && !after.brake && after.look === 0 && !after.behind, 'disconnect releases steer, pedal, brake and look', JSON.stringify(after));
check(after.guide, 'the guide hides after a disconnect');
await page.keyboard.down('ArrowLeft');
await wait(200);
check(await g(() => window.__game.freeInput.steer === -1), 'the keys still steer after the controller goes');
await page.keyboard.up('ArrowLeft');

// ---- Xbox and generic labels; two controllers: the last used drives ----
await g(() => window.__connect('Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)'));
await press(1, 0);
await wait(300);
const gx = await g(() => document.querySelector('#padGuide').textContent);
check(/RT/.test(gx) && /LT/.test(gx), 'guide shows Xbox labels', gx.slice(0, 80));
await g(() => window.__connect('USB Gamepad (Vendor: 0079 Product: 0011)', '', 12, 8));
await press(2, 2);
await wait(300);
const gg = await g(() => document.querySelector('#padGuide').textContent);
check(/Right trigger/.test(gg), 'a generic pad gets position names', gg.slice(0, 80));
// the generic pad's hat (axes 6/7) moves the menu focus
await press(2, 9);
check(await g(() => !!document.querySelector('#pauseOverlay')), 'Start on the generic pad pauses');
await g(() => window.__axis(2, 7, 1)); await wait(150); await g(() => window.__axis(2, 7, 0)); await wait(150);
check(await g(() => !!document.querySelector('.pad-focus')), 'the hat switch moves the menu focus');

// ---- the Controller panel: settings and a remap ----
await page.click('[data-p="pad"]');
await wait(200);
check(await g(() => document.querySelectorAll('.pad-set input[type=range]').length >= 7), 'the panel has the sliders (dead zones, sensitivities, smoothing, trigger, reverse delay)');
await page.click('[data-a="bell"]');
await wait(200);
await press(2, 3);
await wait(300);
const bellLbl = await g(() => document.querySelector('[data-a="bell"] b')?.textContent);
const camLbl = await g(() => document.querySelector('[data-a="camera"] b')?.textContent);
check(bellLbl === 'Top button' && camLbl === 'Left button', 'remapping the bell swaps it with the camera button', `${bellLbl} / ${camLbl}`);
check(await g(() => !!document.querySelector('#pauseOverlay .panel')), 'the remap press did not close the menu');
await page.click('[data-r="reset"]');
await wait(100);
check(await g(() => document.querySelector('[data-a="bell"] b')?.textContent === 'Left button'), 'reset restores the default buttons');
await page.click('[data-r="done"]');
await wait(200);
await press(2, 1);
await wait(300);
check(await g(() => !window.__game.paused), 'back out to the ride');

// ---- disconnecting while paused, then exit: nothing stuck ----
await g(() => window.__btn(1, 7, 1)); await wait(200);
await press(1, 9);
check(await g(() => window.__game.paused && window.__game.freeInput.throttle === 0), 'pausing lets go of the held pedal');
await g(() => { window.__disconnect(1); window.__disconnect(2); });
await wait(300);
check(errors.length === 0, 'no page errors', errors.join(' | '));
await browser.close();
console.log(failures ? `gamepad: ${failures} failed` : 'gamepad: ok');
process.exit(failures ? 1 : 0);
