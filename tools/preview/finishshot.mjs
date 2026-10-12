// rider's-camera views of a ride's end: node .preview/finishshot.mjs outdir [from to]
// an explore ride from `from` to `to` (its destination banner), then the race Limann to Great Hall (its FINISH banner),
// the rider parked at several distances before the line
import { chromium } from 'playwright';
const [, , out, from = 'Volta Hall', to = 'Commonwealth Hall'] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.addInitScript(() => {
  if (sessionStorage.getItem('seeded')) return;
  sessionStorage.setItem('seeded', '1');
  localStorage.setItem('legonrush.profile.v1', JSON.stringify({ name: 'Tester', guest: true, tutorialDone: true, hall: 'none' }));
  localStorage.setItem('legonrush.settings.v1', JSON.stringify({ onboarded: true }));
});
await page.goto('http://localhost:5299/play/', { timeout: 300000 });
await page.waitForTimeout(4000);
await page.locator('button', { hasText: 'Discover campus' }).first().click({ timeout: 120000 });
await page.fill('#from', from); await page.keyboard.press('Enter');
await page.fill('#to', to); await page.keyboard.press('Enter');
await page.waitForTimeout(500);
await page.click('#go');
await page.waitForSelector('#dist', { timeout: 300000 });
await page.waitForTimeout(3000);
const hideUi = () => page.addStyleTag({ content: 'body > *:not(canvas):not(#app), .hud, #hud, .toast, .xp-card { visibility: hidden !important; }' });
const park = async (back) => {
  // the rider's eye, `back` metres before the line on the route, looking down the road past it
  await page.evaluate(async (back) => {
    const g = window.__game, { groundHeight } = await import('/src/game/relief.ts');
    const f = g.route.lead + g.route.length, p = g.track.pose(f - back), q = g.track.pose(f + 6);
    g.d = Math.max(0, g.route.length - back - 3); g.speed = 0; g.cruiseSpeed = 0;
    g.phase = 'cinematic';
    g.cine.pos.set(p.x, groundHeight(p.x, p.z) + 1.9, p.z);
    g.cine.look.set(q.x, groundHeight(q.x, q.z) + 3.2, q.z);
  }, back);
  await page.waitForTimeout(2500);
};
await hideUi();
for (const back of [60, 25]) { await park(back); await page.screenshot({ path: `${out}/dest_${back}.png`, timeout: 300000 }); console.log('dest', back); }
// the race
await page.evaluate(async () => { const R = await import('/src/game/routes.ts'); window.__game.setRoute(R.CAMPUS_LOOP); });
await page.waitForTimeout(2500);
for (const back of [60, 25, 8]) { await park(back); await page.screenshot({ path: `${out}/race_${back}.png`, timeout: 300000 }); console.log('race', back); }
console.log('phase', await page.evaluate(() => window.__game.phase));
if (errs.length) console.log('errors:', errs.slice(0, 5));
await browser.close();
