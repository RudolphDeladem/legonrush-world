// node .preview/walktest.mjs outdir building [entranceIndex] [category] [block]
import { chromium } from 'playwright';
const [, , out, b = 'jean-nelson', ei = '0', cat = 'dia-4', block = ''] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
const errs = [];
page.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERROR', e.stack); });
await page.goto(`${process.env.HOST ?? "http://localhost:5299/"}.preview/walk.html?b=${b}&e=${ei}`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await wait(900); await page.screenshot({ path: `${out}/${b}_${n}.png`, timeout: 600000 }); };
const log = (k, v) => console.log(k, JSON.stringify(v));
await wait(1500);
await shot('1-riding');
log('getDown', await page.evaluate(() => game.getDown()));
log('walking', await page.evaluate(() => ({ walking: game.walking, foot: game.footXZ, bike: game.bikeXZ })));
await shot('2-on-foot');
// walk toward the entrance for a few seconds
await page.evaluate(() => { game.walkInput.fwd = 1; });
await wait(4500);
await page.evaluate(() => { game.walkInput.fwd = 0; });
log('walked', await page.evaluate(() => game.footXZ));
// software GL draws a few frames a second (each step capped at 1/20 s), so the rest of the approach is placed directly
await page.evaluate(() => { const e = window.__entrance, b = (e.facing * Math.PI) / 180; const f = game['foot']; f.x = e.at[0] - Math.sin(b) * 3; f.z = e.at[1] + Math.cos(b) * 3; });
await wait(3000);
log('afterWalk', await page.evaluate(() => { const p = game.footXZ, e = window.__entrance.at; const c = game.camera.position, w = game['walker']?.root; return { foot: p, dist: Math.hypot(p[0] - e[0], p[1] - e[1]), gates: gates.all, cam: [c.x, c.y, c.z], walker: w && [w.position.x, w.position.y, w.position.z, w.visible, !!w.parent], entrance: e }; }));
await shot('3-at-entrance');
log('camAfter', await page.evaluate(() => { const c = game.camera.position, d = new game.camera.position.constructor(); game.camera.getWorldDirection(d); return { cam: [c.x, c.y, c.z], dir: [d.x, d.y, d.z], fov: game.camera.fov, gy: game['foot'].y }; }));
log('rideFar', await page.evaluate(() => game.rideBike()));
const acc = await page.evaluate(([b, c, k]) => allocate('test-rider', b, c, k || undefined), [b, cat, block]);
log('acc', acc);
log('enter', await page.evaluate((a) => game.enterRoom(a), acc));
log('room', await page.evaluate(() => game.roomInfo));
await shot('4-room');
await page.evaluate(() => game.turnRoom(Math.PI, 0)); await shot('5-room-turned');
await page.evaluate(() => game.turnRoom(Math.PI / 2, 0.4)); await shot('6-room-up');
const again = await page.evaluate((a) => game.enterRoom(a), acc); log('enterTwice', again);
await page.evaluate(() => game.leaveRoom());
log('afterLeave', await page.evaluate(() => ({ inRoom: game.inRoom, walking: game.walking, foot: game.footXZ })));
await shot('7-left-room');
// walk back to the bike and ride
await page.evaluate(() => { const g = game.bikeXZ; const f = game['foot']; f.x = g[0] + 1.2; f.z = g[1]; });
await wait(1500);
await page.evaluate(() => { game.walkInput.fwd = 0; });
log('rideBack', await page.evaluate(() => game.rideBike()));
log('final', await page.evaluate(() => ({ walking: game.walking, free: game.freeRiding })));
await shot('8-riding-again');
if (errs.length) console.log('ERRORS', errs.slice(0, 5));
await browser.close();
