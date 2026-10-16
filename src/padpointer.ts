// An on-screen pointer for controllers (the owner, 2026-10-16): any button on the screen can be reached and pressed with
// a controller, as with a mouse.
// - The D-pad moves the pointer (gently at first, faster while held) whenever no menu has the D-pad for its own
//   highlight (padmenu.ts). The bottom face button (Cross / A) presses what is under the pointer while the pointer
//   is showing; held, it holds a button (the walking buttons).
// - On a PlayStation pad (DualSense, DualShock 4) the touchpad moves the pointer like a laptop's touchpad and pressing
//   it clicks. Browsers do not pass the touchpad's finger position through the Gamepad API, so the pointer reads it
//   over WebHID once the player allows it (the Controller panel's "Use the touchpad as a mouse"; Chrome and Edge).
//   The touchpad's press works without that (button 17 on the standard mapping).
// The pointer hides itself after a few seconds unused, and the face button then goes back to the game (jump, hop).
import { pad } from './gamepad';

const TOUCH_BUTTON = 17;
const HIDE_AFTER = 6;

class PadPointer {
  x = innerWidth / 2;
  y = innerHeight / 2;
  private el: HTMLDivElement | null = null;
  /** when the pointer was last used (performance.now(), ms) */
  private usedAt = -Infinity;
  private speed = 0;
  private downEl: Element | null = null;
  private touchWas = false;
  /** whether a menu has the D-pad for its highlight right now (set by main.ts) */
  menuActive: () => boolean = () => false;
  /** showing and recently used: the bottom face button presses what is under it */
  get active() { return performance.now() - this.usedAt < HIDE_AFTER * 1000; }

  constructor() {
    if (typeof window === 'undefined') return;
    pad.onFrame((f, dt) => {
      if (!f || pad.capturing) { this.release(); return; }
      let dx = 0, dy = 0;
      const menu = this.menuActive();
      if (!menu) {
        if (f.held('left')) dx -= 1;
        if (f.held('right')) dx += 1;
        if (f.held('up')) dy -= 1;
        if (f.held('down')) dy += 1;
      }
      if (dx || dy) {
        this.speed = Math.min(1400, Math.max(260, this.speed + 1300 * dt));
        const l = Math.hypot(dx, dy);
        this.move((dx / l) * this.speed * dt, (dy / l) * this.speed * dt);
      } else this.speed = 0;
      // the touchpad's press (standard mapping, button 17) clicks; it shows the pointer first if hidden
      const p = pad.active;
      const touch = !!p?.buttons[TOUCH_BUTTON]?.pressed;
      if (touch && !this.touchWas) { this.show(); this.press(); }
      if (!touch && this.touchWas && this.downEl) this.lift();
      this.touchWas = touch;
      // the bottom face button: pressed and held like a mouse button while the pointer shows (a menu's highlight then
      // leaves it to the pointer)
      if (this.active) {
        if (f.pressed('south')) this.press();
        if (f.released('south')) this.lift();
      } else if (this.downEl && f.released('south')) this.lift();
      if (this.el) this.el.style.opacity = this.active ? '1' : '0';
    });
  }

  private ensure() {
    if (this.el) return this.el;
    const el = document.createElement('div');
    el.className = 'pad-pointer';
    el.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2l15 11-6.6 1.2L16 22l-3.2 1.4-3.6-7.9L4 20z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    el.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483000;pointer-events:none;transition:opacity .25s;opacity:0;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))';
    document.body.appendChild(el);
    this.el = el;
    return el;
  }
  private place() { const el = this.ensure(); el.style.transform = `translate(${this.x - 4}px, ${this.y - 2}px)`; }
  show() { this.usedAt = performance.now(); this.place(); }
  /** moves the pointer by a number of screen pixels (the D-pad, the touchpad) */
  move(dx: number, dy: number) {
    this.x = Math.max(0, Math.min(innerWidth - 2, this.x + dx));
    this.y = Math.max(0, Math.min(innerHeight - 2, this.y + dy));
    this.show();
    if (this.downEl) this.fire('pointermove', this.downEl);
  }
  private target() { this.el && (this.el.style.display = 'none'); const t = document.elementFromPoint(this.x, this.y); if (this.el) this.el.style.display = ''; return t; }
  private fire(type: string, el: Element) {
    const init = { bubbles: true, cancelable: true, clientX: this.x, clientY: this.y, pointerId: 77, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 };
    el.dispatchEvent(type.startsWith('pointer') ? new PointerEvent(type, init) : new MouseEvent(type, init));
  }
  private press() {
    const t = this.target();
    this.usedAt = performance.now();
    if (!t) return;
    this.downEl = t;
    this.fire('pointerdown', t);
    this.fire('mousedown', t);
    if (t instanceof HTMLElement && t.closest('input, select, textarea, button, a')) (t.closest('input, select, textarea, button, a') as HTMLElement).focus({ preventScroll: true });
  }
  private lift() {
    const t = this.downEl;
    this.downEl = null;
    if (!t) return;
    this.fire('pointerup', t);
    this.fire('mouseup', t);
    // a click when the press ends over the element it began on
    const now = this.target();
    if (now && (now === t || t.contains(now) || now.contains(t))) (t as HTMLElement).click?.();
  }
  private release() { if (this.downEl) this.lift(); }

  // ---------- the PlayStation touchpad over WebHID ----------
  private hid: { close: () => Promise<void> } | null = null;
  private last: [number, number] | null = null;
  /** whether the browser can read the touchpad (WebHID) */
  get canTouchpad() { return typeof navigator !== 'undefined' && 'hid' in navigator; }
  get touchpadOn() { return !!this.hid; }
  /** asks the player to allow the controller over WebHID (from a click), then reads its touchpad */
  async enableTouchpad(ask = true): Promise<boolean> {
    if (!this.canTouchpad || this.hid) return !!this.hid;
    type HidDev = { vendorId: number; productName?: string; opened: boolean; open: () => Promise<void>; close: () => Promise<void>; addEventListener: (t: string, f: (e: { reportId: number; data: DataView }) => void) => void };
    const hid = (navigator as unknown as { hid: { getDevices: () => Promise<HidDev[]>; requestDevice: (o: object) => Promise<HidDev[]> } }).hid;
    try {
      let dev = (await hid.getDevices()).find((d) => d.vendorId === 0x054c);
      if (!dev && ask) dev = (await hid.requestDevice({ filters: [{ vendorId: 0x054c }] }))[0];
      if (!dev) return false;
      if (!dev.opened) await dev.open();
      dev.addEventListener('inputreport', (e) => this.report(e.reportId, e.data));
      // (over Bluetooth a DualSense / DualShock 4 sends its short report, without the touchpad, until a feature report is
      // read: reading the calibration report (0x05) switches it to the full report that carries the fingers)
      try { await (dev as unknown as { receiveFeatureReport: (id: number) => Promise<DataView> }).receiveFeatureReport(0x05); } catch { /* USB: not needed */ }
      this.hid = dev;
      return true;
    } catch { return false; }
  }
  /** a DualSense / DualShock 4 input report: the first finger's position on the 1920 x 1080 (DS4: 1920 x 943) touchpad */
  private report(id: number, d: DataView) {
    // the touch block's offset: DualSense USB report 0x01 at 32, Bluetooth 0x31 at 33; DualShock 4 USB 0x01 at 34,
    // Bluetooth 0x11 at 36 (the data excludes the report id)
    const len = d.byteLength;
    const off = id === 0x31 ? 33 : id === 0x11 ? 36 : len >= 63 ? 32 : 34;
    if (off + 4 > len) return;
    const c = d.getUint8(off), touching = (c & 0x80) === 0;
    if (!touching) { this.last = null; return; }
    const b1 = d.getUint8(off + 1), b2 = d.getUint8(off + 2), b3 = d.getUint8(off + 3);
    const x = b1 | ((b2 & 0x0f) << 8), y = (b2 >> 4) | (b3 << 4);
    if (this.last) {
      const k = 1.5 * Math.max(innerWidth / 1920, 0.6);
      const dx = (x - this.last[0]) * k, dy = (y - this.last[1]) * k;
      if (Math.abs(dx) < 200 && Math.abs(dy) < 200 && (dx || dy)) this.move(dx, dy);
    }
    this.last = [x, y];
  }
}

/** the one on-screen pointer for the whole game */
export const padPointer = new PadPointer();
// (a controller allowed before: its touchpad works again without asking)
// (a PlayStation controller: its touchpad works at once if it was allowed before; if not, a bar offers to allow it. The
// browser lets a page reach the controller only from a real click, tap or key, not from the controller's own buttons)
let asked = false;
if (typeof window !== 'undefined') pad.onMode((m, fam) => {
  if (m !== 'pad' || fam !== 'playstation' || asked) return;
  void padPointer.enableTouchpad(false).then((on) => {
    if (on || asked || !padPointer.canTouchpad) return;
    asked = true;
    let dismissed = false;
    try { dismissed = localStorage.getItem('lr.touchpadAsk') === 'no'; } catch { /* storage blocked */ }
    if (dismissed) return;
    const bar = document.createElement('div');
    bar.className = 'touchpad-bar';
    bar.innerHTML = '<span>Use your controller\'s touchpad as a mouse? Choose Allow (with the mouse, a tap or Enter), then pick the controller in the browser\'s list.</span><button class="btn btn-primary btn-sm" data-t="yes">Allow</button><button class="btn btn-ghost btn-sm" data-t="no">Not now</button>';
    document.body.appendChild(bar);
    bar.querySelector('[data-t="yes"]')!.addEventListener('click', () => { void padPointer.enableTouchpad(true).then((ok) => { bar.remove(); if (ok) padPointer.show(); }); });
    bar.querySelector('[data-t="no"]')!.addEventListener('click', () => { bar.remove(); try { localStorage.setItem('lr.touchpadAsk', 'no'); } catch { /* ignore */ } });
    (bar.querySelector('[data-t="yes"]') as HTMLButtonElement).focus();
  });
});
