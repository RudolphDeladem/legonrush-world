// node .preview/roomsuite.mjs outdir [roster.json] — one campus load, many allocated rooms in the running game: each
// entered from its residence, the arrival view, a window closed and open (louvres or curtains, the campus behind), the
// balcony where the category has one; then the roommate scenarios from the server's own rows (scripts/rooms-sql-test.sh
// ROSTER_OUT): two real players and two NPCs, a third player taking an NPC's bed, and the first player again after
// signing in once more (same room and bed)
import { chromium } from 'playwright';
import fs from 'fs';
const [, , out, rosterFile] = process.argv;
const ROOMS = (process.env.ROOMS ?? 'ish-1/ish-1/,tf/tf-4/,jubilee/jub-2-in-1/main,bani/bani-4-new/new,evandy/ev-1-med-balcony/main,jean-nelson/dia-4/,commonwealth/trad-4/').split(',').filter(Boolean).map((x) => x.split('/'));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=jean-nelson&e=0&back=6`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
const log = (k, v) => console.log(k, JSON.stringify(v));
const frames = (n = 2) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const shot = async (n) => { await frames(3); await page.screenshot({ path: `${out}/${n}.png`, timeout: 600000 }); };
await page.waitForTimeout(1500);
log('getDown', await page.evaluate(() => { game.walkAllowed = true; return game.getDown(); }));
const standAt = (id) => page.evaluate((id) => {
  const room = game['room'], p = room.play, it = room.built.interactables.find((x) => x.id === id);
  let ok = false;
  for (let d = 0.6; d < 2.6 && !ok; d += 0.05) for (const s of [0, -0.5, 0.5, -0.9, 0.9]) {
    const x = it.at.x + it.normal[0] * d + it.normal[1] * s, z = it.at.z + it.normal[1] * d - it.normal[0] * s;
    if (p.free(x, z)) { p.x = x; p.z = z; ok = true; break; }
  }
  p.yaw = Math.atan2(it.at.x - p.x, it.at.z - p.z); p.pitch = -0.03; p.update(0, 0, 0, 0, 0, 0);
  return { ok, focus: p.focus && p.focus.label() };
}, id);
const settle = () => page.evaluate(() => { const room = game['room']; for (let i = 0; i < 120; i++) for (const it of room.built.interactables) it.update(1 / 30); });
for (const [b, c, k] of ROOMS) {
  const acc = await page.evaluate(([b, c, k]) => allocate('suite-rider', b, c, k || undefined), [b, c, k]);
  const r = acc;
  const places = await page.evaluate((a) => { const res = game.enterRoom(a, [], `${a.buildingId}|${a.blockId ?? ''}|${a.roomId}`); const info = game.roomInfo; const occ = window.occupantsOf({ roomId: a.roomId, bed: 0, capacity: info.places, residents: [{ bed: 0, name: 'You', you: true }], source: 'local' }, 'k', 'You'); game.leaveRoom(); return { res, places: info.places, occ }; }, r);
  log('enter', { b, c, ...places.res, places: places.places });
  await page.evaluate(([a, occ]) => game.enterRoom(a, occ, `${a.buildingId}|${a.blockId ?? ''}|${a.roomId}`), [r, places.occ]);
  const info = await page.evaluate(() => { const i = game.roomInfo; return { layout: i.layout, paint: i.paint, wood: i.wood, singles: i.singles, bunks: i.bunks, balcony: i.balcony, windows: i.windows, pose: i.pose, parts: i.parts.map((p) => p.kind), occupants: i.occupants.map((o) => o.kind) }; });
  log('room', { b, c, ...info });
  await page.evaluate(() => { const p = game['room'].play; p.yaw = 0; p.pitch = -0.12; p.update(0, 0, 0, 0, 0, 0); });
  await shot(`${b}_${c}_1-arrive`);
  const win = await page.evaluate(() => game.roomInfo.parts.find((p) => p.kind === 'louvres' || p.kind === 'curtains')?.id);
  if (win) {
    log('window', await standAt(win));
    await shot(`${b}_${c}_2-window-closed`);
    log('use', await page.evaluate(() => game.roomInteract()));
    await settle();
    await shot(`${b}_${c}_3-window-open`);
    log('use again', await page.evaluate(() => game.roomInteract()));
    await settle();
  }
  if (info.balcony) {
    log('balcony', await page.evaluate(() => {
      const room = game['room'], p = room.play, it = room.built.interactables.find((x) => x.id === 'balcony-door');
      it.open = true; for (let i = 0; i < 120; i++) it.update(1 / 30);
      p.x = it.at.x + it.normal[0] * 0.8; p.z = it.at.z + it.normal[1] * 0.8; p.yaw = Math.atan2(-it.normal[0], -it.normal[1]); p.pitch = -0.15;
      for (let k = 0; k < 90; k++) p.update(1 / 30, 1, 0, 0, 0, 0);
      return { onBalcony: game.roomInfo.onBalcony };
    }));
    await shot(`${b}_${c}_4-balcony`);
  }
  await page.evaluate(() => game.leaveRoom());
}
// roommates from the server's rows
if (rosterFile) {
  const R = JSON.parse(fs.readFileSync(rosterFile, 'utf8'));
  for (const [name, rows] of [['two-real', R.twoReal], ['three-real', R.threeReal], ['after-reclaim', R.afterReclaim]]) {
    const r = await page.evaluate(([rows]) => {
      const me = rows.find((x) => x.you);
      const place = { roomId: me.room, bed: me.bed, capacity: me.capacity, residents: rows.map((x) => ({ bed: x.bed, name: x.name, you: x.you })), source: 'cloud' };
      const a = { buildingId: me.building, categoryId: me.category, roomId: me.room, bed: me.bed, shared: true, v: 1 };
      const key = `${a.buildingId}||${a.roomId}`, occ = window.occupantsOf(place, key, 'You');
      const res = game.enterRoom(a, occ, key);
      // from the middle of the room toward the window wall, looking a little down: the bunks either side
      const p = game['room'].play, r0 = game['room'].built.walk.rects[0];
      p.x = (r0[0] + r0[2]) / 2; p.z = r0[1] + (r0[3] - r0[1]) * 0.22; p.yaw = 0; p.pitch = -0.22; p.update(0, 0, 0, 0, 0, 0);
      return { res, room: me.room, bed: me.bed, occupants: game.roomInfo.occupants };
    }, [rows]);
    log('roster ' + name, r);
    await shot(`roommates_${name}`);
    await page.evaluate(() => { const p = game['room'].play; p.yaw = 0.75; p.pitch = 0.05; p.update(0, 0, 0, 0, 0, 0); });
    await shot(`roommates_${name}_left`);
    await page.evaluate(() => { const p = game['room'].play; p.yaw = -0.75; p.pitch = 0.05; p.update(0, 0, 0, 0, 0, 0); });
    await shot(`roommates_${name}_right`);
    await page.evaluate(() => game.leaveRoom());
  }
  log('reclaim', R.reclaim);
}
await browser.close();
