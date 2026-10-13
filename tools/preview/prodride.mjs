// production startup: node .preview/prodride.mjs [url]
import { chromium } from 'playwright';
const url = process.argv[2] ?? 'http://localhost:4180/play/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.addInitScript(() => { window.__long = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true }); });
const t0 = Date.now(), at = (s) => console.log(s, ((Date.now() - t0) / 1000).toFixed(1), 's');
await page.goto(url);
await page.click('#guest', { timeout: 120000 }); at('menu / guest clicked'); await page.waitForTimeout(20000); if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT }); console.log('bar', await page.evaluate(() => document.querySelector('.splash-bar div')?.style.width));
await page.waitForFunction(() => performance.getEntriesByName('legonrush:world-ready').length, null, { timeout: 900000, polling: 500 }); at('world ready');
console.log(await page.evaluate(() => 'longest tasks so far ms: ' + window.__long.slice().sort((a, b) => b - a).slice(0, 8).join(', ')));
await page.waitForSelector('#dist', { timeout: 900000 }); at('ride on screen');
await page.waitForFunction(() => Number(document.querySelector('#dist')?.textContent) >= 0.03, null, { timeout: 300000, polling: 1000 }); at('rode 30 m');
console.log(await page.evaluate(() => 'longest tasks ms: ' + window.__long.sort((a, b) => b - a).slice(0, 8).join(', ')));
await browser.close();
