// The open galleries on the outward faces of Legon Hall and Akuafo Hall (owner's photos and marked aerial): the upper
// floor stands back behind a solid parapet flush with the wall below, square pillars rise from it to a deep beam under
// the eaves, and the gallery's back wall has a dark door to each room over a painted base (Legon blue, Akuafo light
// green). Below, the ground floor's windows are covered by black wooden burglar-proofing. The roof runs out over the
// gallery to the outer face as before.
import { box } from './modelkit';
import { BAND, OV, PL, render, type Block, type Face, type Kit, type Style } from './blocks';

/** how far the gallery's back wall stands behind the outer face */
export const GAL_DEPTH = 1.9;

export interface GalleryLook {
  /** the outer walls' paint and how weathered they are */
  wall: string; grime: number;
  /** the base painted along the foot of the gallery's back wall (owner: Legon blue, Akuafo light green) */
  base: string;
  /** the ground floor's base band (Legon cream, Akuafo light green) */
  foot: string;
  /** the burglar-proofing: a wooden fret (Legon) or bars (Akuafo) */
  fret: boolean;
}
export const LEGON_GALLERY: GalleryLook = { wall: '#f1efe8', grime: 0.1, base: '#2f6f9f', foot: '#e4d5b2', fret: true };
export const AKUAFO_GALLERY: GalleryLook = { wall: '#e9e7e0', grime: 0.2, base: '#a6d2b8', foot: '#a6d2b8', fret: false };

const grime = (g: CanvasRenderingContext2D, y0: number, h: number, a: number) => {
  for (let i = 0; i < 16; i++) {
    const x = (i * 37 + 11) % 252, gr = g.createLinearGradient(0, y0, 0, y0 + h * (0.4 + (i % 4) * 0.15));
    gr.addColorStop(0, `rgba(96,90,80,${a * (0.8 + (i % 3) * 0.3)})`); gr.addColorStop(1, 'rgba(96,90,80,0)');
    g.fillStyle = gr; g.fillRect(x, y0, 2 + (i % 3) * 2, h);
  }
};
/** the ground floor of an outward face: windows behind black wooden burglar-proofing, a base band */
export function burglarWall(look: GalleryLook): Style {
  const W = [70, 256 + 96, 116, 92] as const;
  return {
    bay: 3.4, up: [], ground: [W],
    draw: (g) => {
      render(g, look.wall);
      grime(g, 256, 256, look.grime);
      g.fillStyle = look.foot; g.fillRect(0, 512 - 30, 256, 30);
      g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(0, 512 - 32, 256, 2);
      const [x, y, w, h] = W;
      // the window behind: dim glass and curtains, the black frame, the burglar-proofing over it
      g.fillStyle = 'rgba(90,82,70,0.4)'; g.fillRect(x - 7, y - 6, w + 14, h + 14);
      g.fillStyle = '#4c5258'; g.fillRect(x, y, w, h);
      g.fillStyle = '#6d5a48'; g.fillRect(x + 6, y + 6, w / 2 - 8, h - 12); g.fillStyle = '#5b6d78'; g.fillRect(x + w / 2 + 2, y + 6, w / 2 - 8, h - 12);
      g.fillStyle = '#141311'; g.fillRect(x - 4, y - 4, w + 8, 6); g.fillRect(x - 4, y + h - 2, w + 8, 6); g.fillRect(x - 4, y - 4, 6, h + 8); g.fillRect(x + w - 2, y - 4, 6, h + 8);
      if (look.fret) {
        // a wooden fret of squares and crosses (Legon, owner's photo)
        for (let i = 1; i < 4; i++) { g.fillRect(x + (w * i) / 4 - 2, y, 4, h); g.fillRect(x, y + (h * i) / 4 - 2, w, 4); }
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx = x + (w * (i + 0.5)) / 4, cy = y + (h * (j + 0.5)) / 4; g.fillRect(cx - 6, cy - 1.5, 12, 3); g.fillRect(cx - 1.5, cy - 6, 3, 12); }
      } else {
        // upright bars and two rails (Akuafo, owner's photo)
        for (let bx = x + 8; bx < x + w - 4; bx += 9) g.fillRect(bx, y, 3, h);
        g.fillRect(x, y + h * 0.33, w, 3); g.fillRect(x, y + h * 0.66, w, 3);
      }
      g.fillStyle = '#d9d6cd'; g.fillRect(x - 8, y + h + 4, w + 16, 5);
    },
  };
}
/** the gallery's back wall: a dark door to each room, the painted base along its foot, shade under the ceiling */
export function galleryBack(look: GalleryLook): Style {
  const D = [72, 512 - 30 - 186, 112, 186] as const;
  return {
    bay: 2.4, up: [], ground: [D],
    draw: (g) => {
      render(g, '#efede6');
      grime(g, 256, 140, look.grime * 0.6);
      // the base: up to a little over the parapet (the gallery floor is 30 px above the bottom; 71 px a metre)
      g.fillStyle = look.base; g.fillRect(0, 512 - 30 - 96, 256, 96);
      g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(0, 512 - 30 - 98, 256, 2);
      const [x, y, w, h] = D;
      g.fillStyle = '#d9d6cd'; g.fillRect(x - 8, y - 8, w + 16, h + 8);
      g.fillStyle = '#211c18'; g.fillRect(x, y, w, h);
      g.fillStyle = '#342b24'; g.fillRect(x + 8, y + 40, w / 2 - 12, h - 44); g.fillRect(x + w / 2 + 4, y + 40, w / 2 - 12, h - 44);
      // the fanlight over the door
      g.fillStyle = '#16130f'; g.fillRect(x + 6, y + 6, w - 12, 28); g.fillStyle = '#2d2a27'; for (let i = 1; i < 4; i++) g.fillRect(x + 6 + ((w - 12) * i) / 4 - 1, y + 6, 3, 28);
      const sh = g.createLinearGradient(0, 256, 0, 340); sh.addColorStop(0, 'rgba(50,46,40,0.45)'); sh.addColorStop(1, 'rgba(50,46,40,0)');
      g.fillStyle = sh; g.fillRect(0, 256, 256, 84);
    },
  };
}
/** a hall's wall style moved to the ground half of its canvas, for a block holding only the upper storey */
export function upperOnly(st: Style): Style {
  return {
    bay: st.bay, up: [], ground: st.up.map(([x, y, w, h]) => [x, y + 256, w, h] as const),
    draw: (g) => { st.draw(g); g.drawImage(g.canvas, 0, 0, 256, 256, 0, 256, 256, 256); },
  };
}

export interface GalleryJob { rect: [number, number, number, number]; side: Face; a: number; b: number; storey: number; hip: boolean }
/**
 * Split a two-storey block for a gallery along `side` (model frame), over [a, b] along that face (default: all of
 * it): the ground floor whole, with the burglar-proofed face; the upper floor standing back GAL_DEPTH behind the face
 * over the gallery, full depth beyond it. The roof (hip: an engine-style hip over the whole block) and the gallery
 * itself are added by `galleryParts`.
 */
export function galleryBlocks(b: Block, side: Face, storey: number, look: GalleryLook, upper: Style, range?: [number, number], hip = true): { blocks: Block[]; job: GalleryJob } {
  const alongX = side === 'z0' || side === 'z1';
  const [lo, hi] = alongX ? [b.x0, b.x1] : [b.z0, b.z1];
  const a = Math.max(lo, range?.[0] ?? lo), e = Math.min(hi, range?.[1] ?? hi);
  const D = GAL_DEPTH, UP = upperOnly(upper), back = galleryBack(look);
  const ground: Block = { ...b, floors: 1, roof: 'none', faces: { ...b.faces, [side]: burglarWall(look) } };
  const all = { x0: UP, x1: UP, z0: UP, z1: UP };
  const up = (x0: number, x1: number, z0: number, z1: number, faces: Partial<Record<Face, Style>>): Block => ({ x0, x1, z0, z1, floors: 1, roof: 'none', y: (b.y ?? 0) + storey, faces: { ...all, ...faces } });
  const blocks: Block[] = [ground];
  if (side === 'x0') blocks.push(up(b.x0 + D, b.x1, b.z0, b.z1, { x0: back }));
  if (side === 'x1') blocks.push(up(b.x0, b.x1 - D, b.z0, b.z1, { x1: back }));
  if (side === 'z0') blocks.push(up(b.x0, b.x1, b.z0 + D, b.z1, { z0: back }));
  if (side === 'z1') blocks.push(up(b.x0, b.x1, b.z0, b.z1 - D, { z1: back }));
  // the upper floor's full depth beyond the gallery's ends
  for (const [s, t] of [[lo, a], [e, hi]]) {
    if (t - s < 0.3) continue;
    if (side === 'x0') blocks.push(up(b.x0, b.x0 + D, s, t, {}));
    if (side === 'x1') blocks.push(up(b.x1 - D, b.x1, s, t, {}));
    if (side === 'z0') blocks.push(up(s, t, b.z0, b.z0 + D, {}));
    if (side === 'z1') blocks.push(up(s, t, b.z1 - D, b.z1, {}));
  }
  return { blocks, job: { rect: [b.x0, b.x1, b.z0, b.z1], side, a, b: e, storey, hip } };
}

/** the gallery: its floor, the parapet, pillars, the beam and ceiling, walls closing its ends; the roof over the block */
export function galleryParts(k: Kit, j: GalleryJob, look: GalleryLook, roof: { pitch: number; fascia: string }) {
  const [x0, x1, z0, z1] = j.rect, D = GAL_DEPTH, st = j.storey;
  const G = PL + st + BAND, eave = PL + 2 * st + BAND;
  // the gallery strip as [across0, across1] measured from the outer face inward, and a box builder along the face
  const out = j.side === 'x0' ? x0 : j.side === 'x1' ? x1 : j.side === 'z0' ? z0 : z1, s = j.side === 'x0' || j.side === 'z0' ? 1 : -1;
  const alongX = j.side === 'z0' || j.side === 'z1';
  const B = (a0: number, a1: number, d0: number, d1: number, y0: number, y1: number) => {
    const c0 = out + s * d0, c1 = out + s * d1, [cl, ch] = c0 < c1 ? [c0, c1] : [c1, c0];
    return alongX ? box(a0, a1, y0, y1, cl, ch) : box(cl, ch, y0, y1, a0, a1);
  };
  const wall = look.wall, len = j.b - j.a;
  k.plain.push([B(j.a, j.b, 0, D, G - 0.18, G + 0.02), '#d6d2c8']);
  k.plain.push([B(j.a, j.b, 0, 0.22, G, G + 1.05), wall], [B(j.a - 0.02, j.b + 0.02, -0.03, 0.25, G + 1.05, G + 1.12), '#dedbd3']);
  const n = Math.max(1, Math.round(len / 4.2));
  for (let i = 1; i < n; i++) { const p = j.a + (len * i) / n; k.plain.push([B(p - 0.19, p + 0.19, 0, 0.38, G, eave - 0.5), wall]); }
  k.plain.push([B(j.a, j.b, -0.02, 0.3, eave - 0.55, eave), wall]);
  k.plain.push([B(j.a, j.b, 0.3, D, eave - 0.12, eave - 0.04), '#e6e3dc']);
  for (const p of [j.a, j.b]) k.plain.push([B(p - (p === j.a ? 0 : 0.25), p + (p === j.a ? 0.25 : 0), 0, D, G, eave), wall]);
  // a lamp under the ceiling every other bay
  for (let i = 0; i < n; i++) if (i % 2 === 0) { const p = j.a + (len * (i + 0.5)) / n; k.plain.push([B(p - 0.2, p + 0.2, D - 0.5, D - 0.2, eave - 0.4, eave - 0.32), '#fff3d0']); }
  if (!j.hip) return;
  // the hip roof over the whole block, as the block engine draws it
  const X0 = x0 - OV, X1 = x1 + OV, Z0 = z0 - OV, Z1 = z1 + OV, w = X1 - X0, d = Z1 - Z0, half = Math.min(w, d) / 2, top = eave + half * roof.pitch;
  if (w >= d) {
    const zm = (Z0 + Z1) / 2, r0 = [X0 + half, top, zm], r1 = [X1 - half, top, zm];
    k.roof.quad([X0, eave, Z0], [X1, eave, Z0], r1, r0); k.roof.quad([X1, eave, Z1], [X0, eave, Z1], r0, r1);
    k.roof.quad([X0, eave, Z1], [X0, eave, Z0], r0, r0); k.roof.quad([X1, eave, Z0], [X1, eave, Z1], r1, r1);
  } else {
    const xm = (X0 + X1) / 2, r0 = [xm, top, Z0 + half], r1 = [xm, top, Z1 - half];
    k.roof.quad([X1, eave, Z0], [X1, eave, Z1], r1, r0); k.roof.quad([X0, eave, Z1], [X0, eave, Z0], r0, r1);
    k.roof.quad([X0, eave, Z0], [X1, eave, Z0], r0, r0); k.roof.quad([X1, eave, Z1], [X0, eave, Z1], r1, r1);
  }
  const fc = roof.fascia;
  k.plain.push([box(X0, X1, eave - 0.3, eave + 0.03, Z0 - 0.06, Z0 + 0.06), fc], [box(X0, X1, eave - 0.3, eave + 0.03, Z1 - 0.06, Z1 + 0.06), fc]);
  k.plain.push([box(X0 - 0.06, X0 + 0.06, eave - 0.3, eave + 0.03, Z0, Z1), fc], [box(X1 - 0.06, X1 + 0.06, eave - 0.3, eave + 0.03, Z0, Z1), fc]);
  k.plain.push([box(X0, X1, eave - 0.32, eave - 0.28, Z0, Z1), '#d8cfbf']);
}
