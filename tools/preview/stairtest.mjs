// node .preview/stairtest.mjs outdir — walking up and down modelled stairs in the running game: Commonwealth Hall's
// flights up Legon Hill and between its courts (relief.ts stairways), and a Diaspora hall's entrance steps (walksurf.ts);
// the walk is stepped with the game's own walking (updateWalk), the height and the eased height logged along it
import { chromium } from 'playwright';
const [, , out] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 900, height: 560 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack));
await page.goto(`${process.env.HOST ?? 'http://localhost:4199/'}.preview/walk.html?b=commonwealth&e=0&back=8`, { timeout: 1500000 });
await page.waitForFunction(() => window.__done, null, { timeout: 1500000 });
const log = (k, v) => console.log(k, JSON.stringify(v));
await page.waitForTimeout(1500);
log('getDown', await page.evaluate(() => { game.walkAllowed = true; return game.getDown(); }));
const stairs = await page.evaluate(() => window.STAIRS());
log('stairways', stairs.length);
// a walk along a stairway's middle line, up then back down; heights sampled every half second of walking
const climb = async (s, name, shots, line = 0.5) => {
  const r = await page.evaluate(([s, line]) => {
    const f = game['foot'], mid = s.z0 + (s.z1 - s.z0) * line, dir = Math.sign(s.x1 - s.x0);
    if (s.alongZ) return null;
    f.x = s.x0 - dir * 1.5; f.z = mid; f.y = s.foot; f.ys = undefined;
    // facing up the flight (the walker's forward is -sin, -cos of its yaw)
    f.yaw = Math.atan2(-dir, 0);
    game.walkInput.fwd = 1;
    const up = [];
    for (let i = 0; i < 2000; i++) { game['updateWalk'](0.05); if (i % 10 === 0) up.push([+f.x.toFixed(1), +f.y.toFixed(2), +f.ys.toFixed(2)]); if (dir * (f.x - s.x1) > 1) break; }
    return { up, end: [f.x, f.y], reachedTop: dir * (f.x - s.x1) > 0.5, top: s.top, foot: s.foot };
  }, [s, line]);
  if (!r) return;
  // the biggest single jump of the eased height between samples (a smooth climb has none)
  let jump = 0; for (let i = 1; i < r.up.length; i++) jump = Math.max(jump, Math.abs(r.up[i][2] - r.up[i - 1][2]));
  log(name + ' up', { reachedTop: r.reachedTop, rise: +(r.top - r.foot).toFixed(2), samples: r.up.length, maxEasedJumpPerHalfSecond: +jump.toFixed(2), first: r.up.slice(0, 3), last: r.up.slice(-2) });
  if (shots) {
    // a picture part way up
    await page.evaluate((s) => { const f = game['foot'], dir = Math.sign(s.x1 - s.x0); f.x = s.x0 + (s.x1 - s.x0) * 0.35; f.z = (s.z0 + s.z1) / 2; f.yaw = Math.atan2(-dir, 0); for (let i = 0; i < 20; i++) game['updateWalk'](0.05); game.walkInput.fwd = 0; game['snapCam'] = true; }, s);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/stairs_${name}_up.png`, timeout: 600000 });
  }
  const d = await page.evaluate((s) => {
    const f = game['foot'], dir = Math.sign(s.x1 - s.x0);
    f.yaw = Math.atan2(dir, 0); game.walkInput.fwd = 1;
    for (let i = 0; i < 2000; i++) { game['updateWalk'](0.05); if (dir * (f.x - s.x0) < -1) break; }
    game.walkInput.fwd = 0;
    return { reachedFoot: dir * (f.x - s.x0) < -0.5, y: f.y };
  }, s);
  log(name + ' down', d);
  if (shots) {
    await page.evaluate((s) => { const f = game['foot'], dir = Math.sign(s.x1 - s.x0); f.x = s.x0 + (s.x1 - s.x0) * 0.6; f.z = (s.z0 + s.z1) / 2; f.yaw = Math.atan2(dir, 0); game.walkInput.fwd = 1; for (let i = 0; i < 20; i++) game['updateWalk'](0.05); game.walkInput.fwd = 0; game['snapCam'] = true; }, s);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/stairs_${name}_down.png`, timeout: 600000 });
  }
};
// Commonwealth: the hill stairway (index 1) and the first court flight (index 2)
// the hill: up the middle through the gateway between the gate houses, then along the north side of the building
// that stands in the top flights (the walker is steered, as a player would)
const path = async (pts, name) => page.evaluate(([pts]) => {
  const f = game['foot'], log = [];
  f.x = pts[0][0]; f.z = pts[0][1]; f.ys = undefined;
  game.walkInput.fwd = 1;
  for (const [tx, tz] of pts.slice(1)) {
    for (let i = 0; i < 1500; i++) {
      const dx = tx - f.x, dz = tz - f.z; if (Math.hypot(dx, dz) < 0.4) break;
      f.yaw = Math.atan2(-dx, -dz); game['updateWalk'](0.05);
      if (i % 10 === 0) log.push([+f.x.toFixed(1), +f.z.toFixed(1), +f.y.toFixed(2), +f.ys.toFixed(2)]);
    }
  }
  game.walkInput.fwd = 0;
  return { end: [+f.x.toFixed(1), +f.z.toFixed(1), +f.y.toFixed(2)], samples: log.length, log: log.filter((_, i) => i % 6 === 0) };
}, [pts]);
const up = await path([[-370.5, 128], [-444, 128], [-446, 121], [-468, 121]], 'hill');
log('commonwealth-hill up (steered)', up);
const down = await path([[up.end[0], up.end[1]], [-446, 121], [-444, 128], [-370, 128]], 'hill');
log('commonwealth-hill down (steered)', { end: down.end, samples: down.samples });
await page.evaluate(() => { const f = game['foot']; f.x = -420; f.z = 128; f.yaw = Math.atan2(1, 0); game.walkInput.fwd = 1; for (let i = 0; i < 10; i++) game['updateWalk'](0.05); game.walkInput.fwd = 0; game['snapCam'] = true; });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/stairs_commonwealth-hill_up.png`, timeout: 600000 });
await climb(stairs[2], 'commonwealth-court', true);
await browser.close();
