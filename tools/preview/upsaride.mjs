// the UPSA Hostel to UPSA ride in the game itself: rider's-eye views along the route (cinematic camera parked on the track)
import { chromium } from 'playwright';
const [, , out] = process.argv;
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
await page.fill('#from', 'UPSA Hostel'); await page.keyboard.press('Enter');
await page.fill('#to', 'University of Professional Studies, Accra (UPSA)'); await page.keyboard.press('Enter');
await page.waitForTimeout(500);
await page.click('#go');
await page.waitForSelector('#dist', { timeout: 300000 });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => { const g = window.__game; return { name: g.route.name, length: g.route.length, kind: g.route.kind, steps: g.route.steps.map((s) => `${Math.round(s.d)} ${s.text}`) }; });
console.log(JSON.stringify(info));
await page.screenshot({ path: `${out}/ride_start_hud.png`, timeout: 300000 });
await page.addStyleTag({ content: 'body > *:not(canvas):not(#app), .hud, #hud, .toast, .xp-card { visibility: hidden !important; }' });
const L = info.length;
for (const d of [5, 120, 290, 330, 360, 470, 600, 680, 705, 760, 880, L - 30, L - 8]) {
  await page.evaluate(async (d) => {
    const g = window.__game, { groundHeight } = await import('/src/game/relief.ts');
    const p = g.track.pose(g.route.lead + d), q = g.track.pose(g.route.lead + d + 30);
    g.d = Math.max(0, d - 3); g.speed = 0; g.cruiseSpeed = 0; g.phase = 'cinematic';
    g.cine.pos.set(p.x, groundHeight(p.x, p.z) + 1.9, p.z);
    g.cine.look.set(q.x, groundHeight(q.x, q.z) + 2.6, q.z);
  }, d);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/ride_${String(Math.round(d)).padStart(4, '0')}.png`, timeout: 300000 });
  console.log('shot', d);
}
if (errs.length) console.log('errors:', errs.slice(0, 5));
await browser.close();
