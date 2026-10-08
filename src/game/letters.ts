// Raised letters for the block-modelled buildings (nightmarket.ts: SUPERMART; enclave.ts: INNOVATION ENCLAVE and UG):
// each letter a few straight strokes, boxes standing out from a wall.
import * as THREE from 'three';
import type { Kit } from './blocks';

type Stroke = [number, number, number, number];
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 8): Stroke[] => {
  const out: Stroke[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n, t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    out.push([cx + r * Math.cos(t0), cy + r * Math.sin(t0), cx + r * Math.cos(t1), cy + r * Math.sin(t1)]);
  }
  return out;
};
const D = Math.PI / 180;
/** a plain sans-serif in strokes, letters 1 wide and 1.4 high */
const GLYPHS: Record<string, Stroke[]> = {
  S: [...arc(0.5, 1.05, 0.35, 20 * D, 270 * D), ...arc(0.5, 0.35, 0.35, 90 * D, -160 * D)],
  U: [[0, 1.4, 0, 0.45], ...arc(0.5, 0.45, 0.5, 180 * D, 360 * D), [1, 0.45, 1, 1.4]],
  P: [[0, 0, 0, 1.4], [0, 1.4, 0.6, 1.4], ...arc(0.6, 1.05, 0.35, 90 * D, -90 * D, 6), [0.6, 0.7, 0, 0.7]],
  E: [[0, 0, 0, 1.4], [0, 1.4, 0.9, 1.4], [0, 0.7, 0.75, 0.7], [0, 0, 0.9, 0]],
  R: [[0, 0, 0, 1.4], [0, 1.4, 0.6, 1.4], ...arc(0.6, 1.05, 0.35, 90 * D, -90 * D, 6), [0.6, 0.7, 0, 0.7], [0.45, 0.7, 1, 0]],
  M: [[0, 0, 0, 1.4], [0, 1.4, 0.5, 0.55], [0.5, 0.55, 1, 1.4], [1, 1.4, 1, 0]],
  A: [[0, 0, 0.5, 1.4], [0.5, 1.4, 1, 0], [0.2, 0.5, 0.8, 0.5]],
  T: [[0, 1.4, 1, 1.4], [0.5, 1.4, 0.5, 0]],
  I: [[0.5, 0, 0.5, 1.4]],
  N: [[0, 0, 0, 1.4], [0, 1.4, 1, 0], [1, 0, 1, 1.4]],
  O: [...arc(0.5, 0.95, 0.45, 0, 180 * D, 6), [0.05, 0.95, 0.05, 0.45], ...arc(0.5, 0.45, 0.45, 180 * D, 360 * D, 6), [0.95, 0.45, 0.95, 0.95]],
  V: [[0, 1.4, 0.5, 0], [0.5, 0, 1, 1.4]],
  C: [...arc(0.55, 0.95, 0.45, 25 * D, 180 * D, 6), [0.1, 0.95, 0.1, 0.45], ...arc(0.55, 0.45, 0.45, 180 * D, 335 * D, 6)],
  L: [[0, 1.4, 0, 0], [0, 0, 0.9, 0]],
  H: [[0, 0, 0, 1.4], [1, 0, 1, 1.4], [0, 0.7, 1, 0.7]],
  F: [[0, 0, 0, 1.4], [0, 1.4, 0.9, 1.4], [0, 0.7, 0.75, 0.7]],
  D: [[0, 0, 0, 1.4], [0, 1.4, 0.45, 1.4], [0, 0, 0.45, 0], ...arc(0.45, 0.85, 0.55, 90 * D, 0, 4), [1, 0.85, 1, 0.55], ...arc(0.45, 0.55, 0.55, 0, -90 * D, 4)],
  ',': [[0.5, 0.12, 0.3, -0.25]],
  G: [...arc(0.55, 0.95, 0.45, 25 * D, 180 * D, 6), [0.1, 0.95, 0.1, 0.45], ...arc(0.55, 0.45, 0.45, 180 * D, 360 * D, 6), [1, 0.45, 1, 0.7], [1, 0.7, 0.6, 0.7]],
};
/**
 * Raised letters standing out from a wall: centred on (x, y, z), letters h high and `depth` deep, the face of the
 * wall turned toward `face` (radians about y; 0 faces +z). `wide` narrows the letters (1: as wide as 1/1.4 of their
 * height), `gap` is the space between them and `stroke` the stroke weight, both in letter widths.
 */
export function letters(k: Kit, text: string, x: number, y: number, z: number, face: number, h: number, depth: number, color: string, { wide = 1, gap = 0.5, stroke = 0.2 } = {}) {
  const s = h / 1.4, w = stroke;
  const width = text.length * (wide + gap) - gap;
  [...text].forEach((ch, i) => {
    const u0 = (i * (wide + gap) - width / 2) * s;
    for (const [ax, y0, bx, y1] of GLYPHS[ch] ?? []) {
      const x0 = ax * wide, x1 = bx * wide;
      const len = Math.hypot(x1 - x0, y1 - y0) * s;
      const geo = new THREE.BoxGeometry(len + w * s, w * s, depth)
        .rotateZ(Math.atan2(y1 - y0, x1 - x0))
        .translate(u0 + ((x0 + x1) / 2) * s, ((y0 + y1) / 2) * s - h / 2, depth / 2)
        .rotateY(face)
        .translate(x, y, z);
      k.plain.push([geo, color]);
    }
  });
}
