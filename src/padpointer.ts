// An on-screen pointer for controllers (the owner, 2026-10-16): any button on the screen can be reached and pressed with
// a controller, as with a mouse.
// - The D-pad moves the pointer (gently at first, faster while held) whenever no menu has the D-pad for its own
//   highlight (padmenu.ts). The bottom face button (Cross / A) presses what is under the pointer while the pointer
//   is showing; held, it holds a button (the walking buttons).
// - On a PlayStation pad (DualSense, DualShock 4) pressing the touchpad clicks (button 17 on the standard mapping).
//   (Reading the finger on the touchpad needs WebHID, which takes the controller over from the Gamepad API: the other
//   buttons stopped working and the real mouse misbehaved. The owner, 2026-10-16: the D-pad pointer is the way; the
//   finger tracking was taken out.)
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
      if (this.active && (!this.menuActive() || this.overClickable())) {
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

  /** whether what is under the pointer can be pressed (a button, a link, a field, a laptop icon...) */
  overClickable() {
    if (!this.active) return false;
    const t = this.target();
    return !!(t instanceof Element && t.closest('button, a, input, select, textarea, summary, label, [role="button"], .lp-icon, .lp-task, [data-p], [data-r]'));
  }
}

/** the one on-screen pointer for the whole game */
export const padPointer = new PadPointer();
