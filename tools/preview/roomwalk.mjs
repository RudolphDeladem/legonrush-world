// node .preview/roomwalk.mjs outdir "b=..&c=..[&block=..][&real=n]" — the production room play in the light scene:
// arrival view, a walk into the furniture and walls (collision), each working part from within reach before and after
// using it, and for a balcony: open the door, walk out, look out, walk back in
import { chromium } from 'playwright';
const [, , out, qs] = process.argv;
const name = qs.replace(/[^a-z0-9]+/gi, '_');
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/roomplay.html?${qs}`, { timeout: 300000 });
await page.waitForFunction(() => window.__done, null, { timeout: 300000 });
const log = (k, v) => console.log(k, JSON.stringify(v));
const shot = async (n) => page.screenshot({ path: `${out}/${name}_${n}.png`, timeout: 300000 });
const info = await page.evaluate(() => window.info);
log('info', info);
log('arrive', await page.evaluate(() => window.draw()));
await shot('0-arrive');
// collision: walk straight ahead for 8 s (it must stop at furniture or a wall, inside the room)
log('walk8s', await page.evaluate(() => { window.step(240, 1); const p = window.play; return { at: [+p.x.toFixed(2), +p.z.toFixed(2)], free: p.free(p.x, p.z) }; }));
// sideways along the far wall for 8 s, then try to walk through the window wall
log('strafe8s', await page.evaluate(() => { window.step(240, 0, 1); window.step(240, 1); const p = window.play, r = window.built.walk.rects; return { at: [+p.x.toFixed(2), +p.z.toFixed(2)], inside: r.some(([a, b, c, d]) => p.x >= a - 0.07 && p.x <= c + 0.07 && p.z >= b - 0.07 && p.z <= d + 0.07) }; }));
// each working part from just in front of it
let i = 0;
for (const [id, kind] of info.parts) {
  if (kind === 'fan') continue;
  const r = await page.evaluate((id) => {
    const p = window.play, it = window.built.interactables.find((x) => x.id === id);
    // stand 0.75 m out from it on the room side, facing it; settle any open state
    let d = 0.75;
    for (; d < 2.4; d += 0.05) { const x = it.at.x + it.normal[0] * d, z = it.at.z + it.normal[1] * d; if (p.free(x, z)) { p.x = x; p.z = z; break; } }
    p.yaw = Math.atan2(it.at.x - p.x, it.at.z - p.z); p.pitch = it.kind === 'cupboard' ? -0.15 : 0.0;
    const before = window.draw();
    return { id, before, d: +d.toFixed(2) };
  }, id);
  log('part', r);
  await shot(`${String(++i).padStart(2, '0')}-${id}-closed`);
  log('use', await page.evaluate(() => { const l = window.play.interact(); window.settle(3); return { label: l, now: window.draw() }; }));
  await shot(`${String(i).padStart(2, '0')}-${id}-open`);
  if (kind !== 'door') { log('useAgain', await page.evaluate(() => { const l = window.play.interact(); window.settle(3); return { label: l }; })); }
  if (i >= 4 && kind !== 'door') continue;
}
if (info.balcony) {
  // out through the open balcony door and back
  const r = await page.evaluate(() => {
    const p = window.play, it = window.built.interactables.find((x) => x.id === 'balcony-door');
    if (!it.open) it.toggle();
    window.settle(3);
    p.x = it.at.x + it.normal[0] * 0.8; p.z = it.at.z + it.normal[1] * 0.8; p.yaw = Math.atan2(-it.normal[0], -it.normal[1]); p.pitch = 0;
    window.step(90, 1);
    const b = window.built.walk.rects.at(-1), on = p.x > b[0] && p.x < b[2] && p.z > b[1] && p.z < b[3];
    // walk on toward the parapet: it must hold
    window.step(150, 1);
    const held = p.x > b[0] - 0.05 && p.x < b[2] + 0.05 && p.z > b[1] - 0.05 && p.z < b[3] + 0.05;
    return { onBalcony: on, heldByParapet: held, at: [+p.x.toFixed(2), +p.z.toFixed(2)] };
  });
  log('balcony', r);
  await page.evaluate(() => { const p = window.play; p.pitch = -0.25; window.draw(); });
  await shot('20-balcony-out');
  await page.evaluate(() => { const p = window.play; p.yaw += Math.PI * 0.6; p.pitch = -0.05; window.draw(); });
  await shot('21-balcony-along');
  log('back', await page.evaluate(() => { const p = window.play; const it = window.built.interactables.find((x) => x.id === 'balcony-door'); p.yaw = Math.atan2(it.at.x - p.x, it.at.z - p.z); window.step(200, 1); const r = window.built.walk.rects[0]; return { inside: p.x > r[0] && p.x < r[2] && p.z > r[1] && p.z < r[3], at: [+p.x.toFixed(2), +p.z.toFixed(2)] }; }));
  log('closeDoorThenTry', await page.evaluate(() => { const p = window.play, it = window.built.interactables.find((x) => x.id === 'balcony-door'); p.x = it.at.x + it.normal[0] * 0.8; p.z = it.at.z + it.normal[1] * 0.8; p.yaw = Math.atan2(-it.normal[0], -it.normal[1]); window.draw(); window.play.interact(); window.settle(3); window.step(150, 1); const b = window.built.walk.rects.at(-1); return { doorOpen: it.open, gotOut: p.x > b[0] && p.x < b[2] && p.z > b[1] && p.z < b[3] }; }));
}
// the occupants seen from the entry
await page.evaluate(() => { const p = window.play, s = window.info.spawn; p.x = s[0]; p.z = s[1]; p.yaw = 0; p.pitch = -0.2; window.draw(); });
await shot('30-occupants');
await browser.close();
