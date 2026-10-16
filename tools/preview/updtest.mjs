// the Update button: a page on build A sees build B, taps Update, and is running B after: node .preview/updtest.mjs
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
const stamp = (v) => writeFileSync('dist/_stamp.svg', `<svg xmlns="http://www.w3.org/2000/svg"><!--${v}--></svg>`);
const browser = await chromium.launch();
const page = await browser.newPage();
const swFile = async () => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.scriptURL);
const precacheHasStamp = async () => page.evaluate(async () => { for (const k of await caches.keys()) { const c = await caches.open(k); for (const r of await c.keys()) if (r.url.includes('_stamp')) return (await (await c.match(r)).text()); } return null; });
await page.goto('http://localhost:4400/play/', { timeout: 300000 });
await page.waitForFunction(async () => !!(await navigator.serviceWorker.ready), null, { timeout: 120000 });
await page.waitForTimeout(4000);
console.log('A stamp', await precacheHasStamp());
// build B: a changed precached file, a new service worker
execSync('node .preview/stampsw.mjs B');
await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
await page.waitForSelector('.update-bar:not([hidden])', { timeout: 120000 }).then(() => console.log('update bar shown')).catch(() => console.log('update bar NOT shown'));
const t0 = Date.now();
const nav = page.waitForEvent('framenavigated', { timeout: 30000 }).then(() => true).catch(() => false);
await page.click('#updateNow').catch((e) => console.log('click failed', e.message.slice(0, 80)));
console.log('reloaded', await nav, `${Date.now() - t0} ms`);
await page.waitForTimeout(5000);
console.log('B stamp', await precacheHasStamp(), 'bar hidden', await page.evaluate(() => document.querySelector('.update-bar')?.hidden));
await browser.close();
