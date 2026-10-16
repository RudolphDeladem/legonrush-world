// node .preview/roomcampus.mjs outdir building category [block] — in the running game (production bundle of walk.html):
// get down at the residence, enter the allocated room, and from inside: the louvres or curtains closed and open with the
// campus behind them, the balcony (open the door, walk out, look out, walk back), the pose of the room in its building
import { chromium } from 'playwright';
const [, , out, b = 'vikings', cat = 'vk-2', block = ''] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=${b}&e=0&back=6`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
const log = (k, v) => console.log(k, JSON.stringify(v));
const shot = (n) => page.screenshot({ path: `${out}/${b}_${cat}_${n}.png`, timeout: 600000 });
await page.waitForTimeout(1500);
log('getDown', await page.evaluate(() => { game.walkAllowed = true; return game.getDown(); }));
const acc = await page.evaluate(([b, c, k]) => allocate('campus-test', b, c, k || undefined), [b, cat, block]);
log('acc', acc);
log('enter', await page.evaluate((a) => game.enterRoom(a, [{ bed: 0, kind: 'you', name: 'You' }, { bed: 1, kind: 'npc', name: 'Kofi' }, { bed: 2, kind: 'npc', name: 'Ama' }, { bed: 3, kind: 'npc', name: 'Yaw' }].slice(0, 8)), acc));
const info = await page.evaluate(() => game.roomInfo);
log('room', { layout: info.layout, pose: info.pose, balcony: info.balcony, windows: info.windows, parts: info.parts, occupants: info.occupants });
await page.waitForTimeout(2000);
await shot('1-arrive');
// to each window: stand clear of furniture, within reach, facing it; closed, then open
const play = (f, a) => page.evaluate(f, a);
const wins = info.parts.filter((p) => p.kind === 'louvres' || p.kind === 'curtains');
let i = 0;
for (const w of wins) {
  const r = await play((id) => {
    const room = game['room'], p = room.play, it = room.built.interactables.find((x) => x.id === id);
    let ok = false;
    for (let d = 0.6; d < 2.6 && !ok; d += 0.05) for (const s of [0, -0.5, 0.5, -0.9, 0.9]) {
      const x = it.at.x + it.normal[0] * d + it.normal[1] * s, z = it.at.z + it.normal[1] * d - it.normal[0] * s;
      if (p.free(x, z)) { p.x = x; p.z = z; ok = true; break; }
    }
    p.yaw = Math.atan2(it.at.x - p.x, it.at.z - p.z); p.pitch = -0.02;
    return { id, ok, at: [+p.x.toFixed(2), +p.z.toFixed(2)] };
  }, w.id);
  await page.waitForTimeout(1500);
  log('window', { ...r, focus: (await page.evaluate(() => game.roomInfo.focus)) });
  await shot(`2-${w.id}-${++i}-closed`);
  log('use', await page.evaluate(() => game.roomInteract()));
  await page.waitForTimeout(6000);
  await shot(`2-${w.id}-${i}-open`);
}
if (info.balcony) {
  log('balcony', await play(() => {
    const room = game['room'], p = room.play, it = room.built.interactables.find((x) => x.id === 'balcony-door');
    if (!it.open) it.toggle();
    for (let k = 0; k < 120; k++) it.update(1 / 30);
    p.x = it.at.x + it.normal[0] * 0.8; p.z = it.at.z + it.normal[1] * 0.8; p.yaw = Math.atan2(-it.normal[0], -it.normal[1]); p.pitch = -0.2;
    for (let k = 0; k < 80; k++) p.update(1 / 30, 1, 0, 0, 0, 0);
    return { at: [p.x, p.z], onBalcony: game.roomInfo.onBalcony };
  }));
  await page.waitForTimeout(2500);
  await shot('3-balcony-out');
  await play(() => { const p = game['room'].play; p.yaw += 0.9; p.pitch = -0.35; });
  await page.waitForTimeout(2500);
  await shot('4-balcony-down');
  log('backIn', await play(() => { const room = game['room'], p = room.play, it = room.built.interactables.find((x) => x.id === 'balcony-door'); p.yaw = Math.atan2(it.at.x - p.x, it.at.z - p.z); for (let k = 0; k < 150; k++) p.update(1 / 30, 1, 0, 0, 0, 0); return { onBalcony: game.roomInfo.onBalcony, at: [p.x, p.z] }; }));
}
// the roommates from the room
await play(() => { const p = game['room'].play, s = game['room'].built.spawn; p.x = s.x - 30000; p.z = s.z - 30000; p.yaw = 0; p.pitch = -0.2; });
await page.waitForTimeout(1500);
await shot('5-roommates');
log('leave', await page.evaluate(() => { game.leaveRoom(); return { inRoom: game.inRoom, walking: game.walking }; }));
await page.waitForTimeout(2500);
await shot('6-left');
await browser.close();
