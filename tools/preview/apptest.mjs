// node .preview/apptest.mjs outdir kind — the real app (a development build: npx vite build --mode development with
// NODE_ENV=development into .preview/appdev, served on 4300): onboard as a guest, start an Explore ride, a Vibe Ride
// (fake live channel) or a race through the dev-only __rideTest hook, open the pause menu and try "Get down and walk"
import { chromium } from 'playwright';
const [, , out, kind0 = 'explore'] = process.argv;
const kind = kind0 === 'room' ? 'explore' : kind0;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
const log = (k, v) => console.log(k, JSON.stringify(v));
const shot = (n) => page.screenshot({ path: `${out}/app_${kind}_${n}.png`, timeout: 600000 });
await page.goto(`${process.env.HOST ?? 'http://localhost:4300/'}play/?fakelive`, { timeout: 600000 });
await page.waitForFunction(() => window.__game && window.__obNext, null, { timeout: 600000 });
for (let i = 0; i < 12; i++) { const done = await page.evaluate(() => { if (window.__game.phase === "riding" || window.__game.phase === "countdown") return true; try { window.__obNext(); } catch { /* the step moved on */ } return false; }); if (done) break; await page.waitForTimeout(700); }
await page.waitForFunction(() => window.__game.phase === 'riding' || window.__game.phase === 'countdown', null, { timeout: 1500000 }).catch(() => {});
const shotK = (n) => page.screenshot({ path: `${out}/app_${kind0}_${n}.png`, timeout: 600000 });
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
  if (kind0 === 'room') {
    const frames = (n = 3) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
    // to Vikings Hall's entrance (2 m out from it), facing it
    await page.evaluate(() => { const f = __game['foot']; f.x = 160.7; f.z = 842.5; f.yaw = Math.atan2(0.12, 0.99); __game['snapCam'] = true; });
    await page.waitForSelector('#wPop:not([hidden])', { timeout: 300000 });
    log('popup', await page.textContent('#wPopT'));
    await frames(); await shotK('4-popup');
    await page.click('#wPopGo');
    await page.waitForSelector('#wHall:not([hidden])', { timeout: 60000 });
    await frames(); await shotK('5-hall');
    await page.click('#hSet');
    await page.waitForSelector('#acB', { timeout: 60000 });
    await page.selectOption('#acB', 'vikings');
    await page.click('#acC [data-v="vk-2"]');
    await frames(); await shotK('6-accommodation');
    await page.click('#acSave');
    await page.waitForSelector('#hRoom', { timeout: 60000 });
    log('hall', await page.textContent('#wHall'));
    await page.click('#hRoom');
    await page.waitForSelector('#wRoom:not([hidden]) #rLeave', { timeout: 300000 });
    await page.waitForTimeout(1500); await frames(4);
    log('room', await page.evaluate(() => { const i = __game.roomInfo; return { layout: i.layout, occupants: i.occupants, pose: i.pose, balcony: i.balcony }; }));
    log('roomHud', await page.textContent('#wRoom .wr-top'));
    await shotK('7-room');
    // walk with the keys toward the balcony door side, turn, look
    await page.keyboard.down('KeyW'); await page.waitForTimeout(3000); await page.keyboard.up('KeyW');
    log('walked', await page.evaluate(() => __game.roomInfo.at));
    // stand at the balcony door and use it with E
    await page.evaluate(() => { const r = __game['room'], it = r.built.interactables.find((x) => x.id === 'balcony-door'), p = r.play; p.x = it.at.x + it.normal[0] * 0.8; p.z = it.at.z + it.normal[1] * 0.8; p.yaw = Math.atan2(-it.normal[0], -it.normal[1]); p.pitch = -0.05; p.update(0, 0, 0, 0, 0, 0); });
    await frames(4);
    log('actButton', await page.evaluate(() => { const b = document.querySelector('#rAct'); return b && !b.hidden ? b.textContent : null; }));
    await shotK('8-door-prompt');
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(3000); await frames(4);
    log('afterE', await page.evaluate(() => __game.roomInfo.parts.find((p) => p.id === 'balcony-door')));
    await page.keyboard.down('KeyW'); await page.waitForTimeout(4000); await page.keyboard.up('KeyW');
    log('onBalcony', await page.evaluate(() => __game.roomInfo.onBalcony));
    await frames(4); await shotK('9-balcony');
    await page.click('#rLeave');
    await page.waitForSelector('#wHall:not([hidden])', { timeout: 60000 });
    await page.click('#hLeave');
    // back to the bike and ride
    await page.evaluate(() => { const b = __game.bikeXZ, f = __game['foot']; f.x = b[0] + 1.2; f.z = b[1]; __game['snapCam'] = true; });
    await frames(3);
    await page.click('#wRide');
    await page.waitForTimeout(2500); await frames(3);
    log('rode', await page.evaluate(() => ({ walking: __game.walking, free: __game.freeRiding })));
    await shotK('10-riding-again');
  }
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
// (kind "room") continues in the real interface: walk to Vikings Hall's entrance, the popup, the hall panel, set the
// accommodation (Vikings, two in a room, no AC), enter the room, walk in it, use a window, leave, ride again
