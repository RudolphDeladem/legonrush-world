// CPU profile of the game page's start: node .preview/prof.mjs [url] [seconds]
import { chromium } from 'playwright';
const url = process.argv[2] ?? 'http://localhost:5299/play/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdp.send('Profiler.start');
const t0 = Date.now();
page.on('console', (m) => { if (m.text().startsWith('[T]')) console.log(m.text()); });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto(url, { timeout: 600000, waitUntil: 'load' });
await page.waitForTimeout(+(process.argv[3] ?? 60) * 1000);
const { profile } = await cdp.send('Profiler.stop');
const heap = await page.evaluate(() => performance.memory ? (performance.memory.usedJSHeapSize / 1e6).toFixed(0) + ' MB' : '?');
console.log('heap', heap, 'elapsed', (Date.now() - t0) / 1000);
// self time by function
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas; let i = 0;
for (const s of profile.samples) { const n = byId.get(s); const f = n.callFrame; const key = `${f.functionName || '(anon)'} ${f.url.split('/').slice(-1)[0].split('?')[0]}:${f.lineNumber}`; self.set(key, (self.get(key) ?? 0) + (dt[i++] ?? 0)); }
const tot = [...self.values()].reduce((a, b) => a + b, 0);
console.log('total sampled ms', (tot / 1000).toFixed(0));
console.log([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${(v / 1000).toFixed(0).padStart(6)} ms  ${k}`).join('\n'));
// inclusive time for selected functions by name
const children = new Map(profile.nodes.map((n) => [n.id, n.children ?? []]));
const selfById = new Map(); i = 0; for (const s of profile.samples) { selfById.set(s, (selfById.get(s) ?? 0) + (dt[i++] ?? 0)); }
const incl = (id) => (selfById.get(id) ?? 0) + children.get(id).reduce((a, c) => a + incl(c), 0);
const agg = new Map();
for (const n of profile.nodes) { const nm = n.callFrame.functionName; if (!nm) continue; const k = `${nm} ${n.callFrame.url.split('/').slice(-1)[0].split('?')[0]}`; agg.set(k, Math.max(agg.get(k) ?? 0, 0) + incl(n.id)); }
console.log('--- boateng/churches ---'); console.log([...agg.entries()].filter(([k]) => /boateng|churches|drapeAt|clear |inside/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => `${(v / 1000).toFixed(0).padStart(6)} ms  ${k}`).join('\n'));
console.log('--- inclusive (summed over call sites) ---');
console.log([...agg.entries()].filter(([k]) => /build|Campus|Site|site|relief|Relief|Life|life|Overlay|crown|landmark|Game|compile|prewarm|warm|scrub|Halls|Buildings|Edges/i.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 45).map(([k, v]) => `${(v / 1000).toFixed(0).padStart(6)} ms  ${k}`).join('\n'));
await browser.close();
