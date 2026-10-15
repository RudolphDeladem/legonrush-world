// children breakdown of a named function in a startup CPU profile: node .preview/prof2.mjs fnName file seconds
import { chromium } from 'playwright';
const [, , fn, file, secs] = process.argv;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
const cdp = await page.context().newCDPSession(page);
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdp.send('Profiler.start');
await page.goto('http://localhost:5299/play/', { timeout: 600000 });
await page.waitForTimeout(+secs * 1000);
const { profile } = await cdp.send('Profiler.stop');
const byId = new Map(profile.nodes.map((n) => [n.id, n])), self = new Map();
let i = 0; for (const s of profile.samples) self.set(s, (self.get(s) ?? 0) + (profile.timeDeltas[i++] ?? 0));
const incl = (id) => (self.get(id) ?? 0) + (byId.get(id).children ?? []).reduce((a, c) => a + incl(c), 0);
const agg = new Map();
const walk = (id, inside) => { const n = byId.get(id), f = n.callFrame, isT = f.functionName === fn && f.url.includes(file);
  if (inside && !isT) { const k = `${f.functionName || '(anon)'} ${f.url.split('/').pop().split('?')[0]}:${f.lineNumber}`; agg.set(k, (agg.get(k) ?? 0) + (self.get(id) ?? 0)); }
  for (const c of n.children ?? []) walk(c, inside || isT); };
walk(profile.nodes[0].id, false);
console.log([...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${(v / 1000).toFixed(0).padStart(6)} ms ${k}`).join('\n'));
await browser.close();
