// flyover.mjs outdir: renders the gate screen's aerial loop (4 sweeps x 30 frames) at 480x128
import { chromium } from 'playwright';
const out = process.argv[2];
const SHOTS = [
  // [target x, z, radius, height, angle from, angle to (deg), look height]
  [6, -28, 120, 60, 200, 230, 8],       // the Balme Library and its fountain
  [-604, 118, 115, 55, 150, 185, 6],    // Commonwealth Hall
  [-1010, 128, 120, 60, 110, 140, 10],  // the Great Hall
  [156, 2068, 170, 75, 230, 260, 6],    // the University of Ghana Medical Centre
];
const N = 30;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 480, height: 128 } });
const cam = (s, t) => { const [x, z, r, h, a0, a1, lh] = s, a = ((a0 + (a1 - a0) * t) * Math.PI) / 180; return `cam=${(x + Math.cos(a) * r).toFixed(1)},${h},${(z + Math.sin(a) * r).toFixed(1)},${x},${lh},${z},38`; };
await page.goto(`http://localhost:5299/.preview/halls.html?${cam(SHOTS[0], 0)}`, { timeout: 900000 });
await page.waitForFunction(() => window.__done, null, { timeout: 900000 });
let f = 0;
for (const s of SHOTS) for (let i = 0; i < N; i++) {
  await page.evaluate((c) => window.__view(c), cam(s, i / (N - 1)));
  await page.screenshot({ path: `${out}/f${String(f++).padStart(4, '0')}.png` });
}
console.log('frames', f);
await browser.close();
