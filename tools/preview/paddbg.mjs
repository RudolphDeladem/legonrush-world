import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.stack?.slice(0, 300)));
await page.addInitScript(() => {
  const btn = () => Array.from({ length: 18 }, () => ({ pressed: false, value: 0, touched: false }));
  window.__fakePad = { id: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: btn(), timestamp: 0 };
  navigator.getGamepads = () => [window.__fakePad];
});
await page.goto('http://localhost:4300/play/?fakelive', { timeout: 600000 });
await page.waitForFunction(() => window.__game && window.__pad, null, { timeout: 600000 });
await page.evaluate(() => { __fakePad.axes[0] = 0.9; });
await page.waitForTimeout(500);
console.log(JSON.stringify(await page.evaluate(() => ({ mode: __pad.mode, id: __pad.activeId, pads: __pad.pads().length, gp: navigator.getGamepads().length }))));
await browser.close();
