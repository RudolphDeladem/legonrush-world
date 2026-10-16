// each residence entrance: walking in from 3 m outside along its facing, what stops a person (the drawn walls at body
// height above their floor, the building's outline), and whether open ground beyond (a court) is reached within 45 m
import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
await page.goto(`http://localhost:${process.env.PORT ?? 5298}/.preview/halls.html?cam=0,300,0,0,0,-0.1,60`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
const res = await page.evaluate(() => {
  const W = window.__wg, gh = window.__gh, out = [];
  for (const r of W.RES) for (const e of r.entrances) {
    const f = (e.facing * Math.PI) / 180, ux = Math.sin(f), uz = -Math.cos(f);
    let floor = gh(e.at[0] - ux * 3, e.at[1] - uz * 3), stop = null, inB = false, court = null;
    for (let t = -3; t <= 45; t += 0.35) {
      const x = e.at[0] + ux * t, z = e.at[1] + uz * t;
      W.W_warm(x, z);
      const g = gh(x, z), top = W.W_top(x, z, floor);
      const fl = Math.max(g, top ?? -Infinity);
      if (Math.abs(fl - floor) > 0.46 && !stop) stop = [t.toFixed(1), `step ${(fl - floor).toFixed(2)}`];
      if (!stop && W.W_blk(x, z, fl)) stop = [t.toFixed(1), 'wall'];
      const b = !!W.ba(x, z) || W.bn(x, z, 0.2);
      if (b) inB = true; else if (inB && !court) court = t.toFixed(1);
      floor = fl;
      if (stop && (court || t > 30)) break;
    }
    out.push([r.id, e.id.split(':')[1], stop, inB ? 'enters outline' : 'no outline', court ? `open ground at ${court}` : '-']);
  }
  return out;
});
for (const r of res) console.log(JSON.stringify(r));
await browser.close();
