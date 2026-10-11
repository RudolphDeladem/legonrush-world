// The arrival card with a controller (simulated): the D-pad moves a visible highlight between Drone view, Ride it
// yourself, Learn more and Done, Cross presses the highlighted one, and a card that redraws keeps the highlight.
// Run with the dev server up: `npx vite --port 5299` then `node scripts/gamepad-card-test.mjs`.
import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:5299/play/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 760, height: 480 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failures = 0;
const check = (ok, what, extra = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${extra ? ` (${extra})` : ''}`); if (!ok) failures++; };
await page.addInitScript(() => {
  const p = { id: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)', index: 0, mapping: 'standard', connected: true, timestamp: 0, buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), axes: [0, 0, 0, 0] };
  navigator.getGamepads = () => [p];
  window.__frames = (n) => new Promise((r) => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); });
  window.__press = async (b) => { p.buttons[b].value = 1; p.buttons[b].pressed = true; await window.__frames(3); p.buttons[b].value = 0; p.buttons[b].pressed = false; await window.__frames(3); };
});
const press = (b) => page.evaluate((b) => window.__press(b), b);
const g = (fn, a) => page.evaluate(fn, a);
const focused = () => g(() => document.querySelector('.pad-focus')?.id ?? '');

await page.goto(URL);
await page.click('#guest', { timeout: 300000 });
await page.waitForSelector('#dist', { timeout: 120000 });
await page.waitForTimeout(2000);
// the arrival card as Explore draws it (same ids and classes); clicks are recorded
await g(() => {
  const gc = document.querySelector('#guideCard');
  window.__clicks = [];
  const draw = (droning) => {
    gc.innerHTML = droning
      ? '<p class="kicker">Drone view</p><div class="row gc-actions"><button class="btn btn-ghost" id="gcDrone">Back to street view</button><button class="btn btn-primary" id="gcGo">Done</button></div>'
      : '<p class="gc-arrived">Arrived</p><h2>Balme Library</h2><p>About it.</p><div class="row gc-actions"><button class="btn btn-ghost" id="gcMore">Learn more</button><button class="btn btn-ghost" id="gcDrone">Drone view</button><button class="btn btn-ghost" id="gcFree">Ride it yourself</button><button class="btn btn-primary" id="gcGo">Done</button></div>';
    for (const b of gc.querySelectorAll('button')) b.addEventListener('click', () => { window.__clicks.push(b.id); if (b.id === 'gcDrone') { window.__dr = !window.__dr; draw(window.__dr); } });
  };
  gc.classList.add('arrived');
  gc.hidden = false;
  draw(false);
});
await press(14); // D-pad left: the first press highlights the main button
check(await focused() === 'gcGo', 'first D-pad press highlights Done', await focused());
const ring = await g(() => { const s = getComputedStyle(document.querySelector('.pad-focus')); return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`; });
check(/solid 3px/.test(ring), 'the highlight is drawn', ring);
await press(14);
check(await focused() === 'gcFree', 'D-pad left moves to Ride it yourself', await focused());
await press(14);
check(await focused() === 'gcDrone', 'D-pad left again moves to Drone view', await focused());
await press(15);
check(await focused() === 'gcFree', 'D-pad right moves back', await focused());
await press(14);
await press(0);
check((await g(() => window.__clicks)).includes('gcDrone'), 'Cross presses Drone view');
check(await focused() === 'gcDrone', 'after the card redraws the highlight stays on that button (Back to street view)', await focused());
await press(0);
await press(15);
check(await focused() === 'gcFree', 'back on the full card, the D-pad reaches Ride it yourself', await focused());
await press(0);
check((await g(() => window.__clicks)).at(-1) === 'gcFree', 'Cross presses Ride it yourself');
await page.screenshot({ path: process.env.SHOT || 'card.png' });
check(errors.length === 0, 'no page errors', errors.join(' | '));
await browser.close();
console.log(failures ? `card: ${failures} failed` : 'card: ok');
process.exit(failures ? 1 : 0);
