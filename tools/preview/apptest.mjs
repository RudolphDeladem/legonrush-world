// node .preview/apptest.mjs outdir kind — the real app (a development build: npx vite build --mode development with
// NODE_ENV=development into .preview/appdev, served on 4300): onboard as a guest, start an Explore ride, a Vibe Ride
// (fake live channel) or a race through the dev-only __rideTest hook, open the pause menu and try "Get down and walk"
import { chromium } from 'playwright';
const [, , out, kind = 'explore'] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
const log = (k, v) => console.log(k, JSON.stringify(v));
const shot = (n) => page.screenshot({ path: `${out}/app_${kind}_${n}.png`, timeout: 600000 });
await page.goto(`${process.env.HOST ?? 'http://localhost:4300/'}play/?fakelive`, { timeout: 600000 });
await page.waitForFunction(() => window.__game && window.__obNext, null, { timeout: 600000 });
for (let i = 0; i < 12; i++) { const done = await page.evaluate(() => { if (window.__game.phase === "riding" || window.__game.phase === "countdown") return true; try { window.__obNext(); } catch { /* the step moved on */ } return false; }); if (done) break; await page.waitForTimeout(700); }
await page.waitForFunction(() => window.__game.phase === 'riding' || window.__game.phase === 'countdown', null, { timeout: 1500000 }).catch(() => {});
await page.evaluate((k) => { window.__oldRoute = window.__game.currentRoute; return window.__rideTest(k); }, kind);
// the new ride on screen (its loading screen gone, its HUD up) and its countdown over
await page.waitForFunction(() => window.__game.currentRoute !== window.__oldRoute && !document.querySelector('.loading') && document.querySelector('#pause') && window.__game.phase === 'riding', null, { timeout: 1500000, polling: 1000 });
await page.waitForTimeout(9000);
log('riding', await page.evaluate(() => ({ phase: __game.phase, walkAllowed: __game.walkAllowed, vibe: !!document.querySelector('#rideChat'), freeWalkBtn: !!document.querySelector('#fpWalk') })));
await shot('1-riding');
// the pause menu
await page.click('#pause');
await page.waitForTimeout(800);
log('pauseMenu', await page.evaluate(() => [...document.querySelectorAll('#pauseOverlay [data-p]')].map((b) => b.textContent.trim())));
await shot('2-pause');
const walkBtn = await page.$('#pauseOverlay [data-p="walk"]');
if (walkBtn) {
  await walkBtn.click();
  await page.waitForTimeout(6000);
  log('afterWalk', await page.evaluate(() => ({ walking: __game.walking, foot: __game.footXZ, ui: !!document.querySelector('.walk-ui'), vibe: !!document.querySelector('#rideChat') })));
  await shot('3-walking');
} else {
  await page.click('#pauseOverlay [data-p="continue"]');
  // the game itself refuses, whatever control asks (a key, a controller, a script)
  log('directGetDown', await page.evaluate(() => __game.getDown()));
  await page.keyboard.press('KeyW');
  log('stillRiding', await page.evaluate(() => ({ walking: __game.walking, phase: __game.phase })));
  await page.waitForTimeout(2000);
  await shot('3-race-no-walk');
}
await browser.close();
