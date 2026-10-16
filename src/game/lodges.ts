// The porter's lodges (the owner's Volume A sections 12-15, Volume B pages 69-73): one fixed structural template per
// family, the same for every member of the family, placed at each residential entrance just inside it and to one side
// of the route, its counter facing the arrival path. L01 (the five Diaspora-group halls) is photo-led and indoor: a
// long vertical-timber counter with a right return, a dark-framed glazed screen and key cubbies; it is built as the
// reception the player sees on entering such a hall (lobbyScene), not as an outdoor pavilion. L02-L13 are the
// authorised designed families. Evandy's existing gatehouse is reused as its reception (no second structure over it).
// Placement is computed from the entrance and checked against building outlines, roads and solids; entrances where no
// place fits are reported, never forced.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { box, canvas, merge, type Part } from './modelkit';
import { concrete } from './concrete';
import { SOLIDS } from './solids';
import { groundHeight as gh } from './relief';
import { buildingNear } from './campusmap';
import { roadClearance } from './life';
import { RESIDENCES, type Entrance, type LodgeFamily, type Residence } from './residence';
import { ROOM_ORIGIN } from './roomkit';
import { COURT_HALLS } from './gateways';

/** a family's template: parts in local metres, the counter facing local +z (toward the route), footprint half sizes */
interface Template { build(c: Part[]): void; hx: number; hz: number; signY: number }
const CREAM = '#efe6d2', TERRA = '#b4552f', DARK = '#2f3236', GLASS = '#6f8a99', TIMBER = '#8a5a34', GREY = '#9a9d9f', WHITE = '#f4f2ec';
const pitched = (c: Part[], hx: number, hz: number, h: number, rise: number, col: string, over = 0.35) => {
  // a gable roof ridged along x: two sloping slabs
  const L = Math.hypot(hz + over, rise), a = Math.atan2(rise, hz + over);
  for (const s of [-1, 1]) c.push([new THREE.BoxGeometry(2 * (hx + over), 0.08, L).rotateX(s * a).translate(0, h + rise / 2, (s * -(hz + over)) / 2), col]);
};
const hipped = (c: Part[], hx: number, hz: number, h: number, rise: number, col: string) => {
  const g = new THREE.ConeGeometry(Math.SQRT2, rise, 4, 1).rotateY(Math.PI / 4).scale(hx + 0.4, 1, hz + 0.4).translate(0, h + rise / 2, 0);
  c.push([g, col]);
};
const hatch = (c: Part[], x0: number, x1: number, z: number, y0 = 0.95, y1 = 1.9) => {
  c.push([box(x0, x1, y0 - 0.05, y0, z - 0.05, z + 0.35), WHITE], [box(x0 + 0.04, x1 - 0.04, y0, y1, z - 0.02, z + 0.005), DARK]);
  c.push([box(x0 - 0.04, x0 + 0.04, y0, y1, z - 0.03, z + 0.03), DARK], [box(x1 - 0.04, x1 + 0.04, y0, y1, z - 0.03, z + 0.03), DARK], [box(x0 - 0.04, x1 + 0.04, y1, y1 + 0.06, z - 0.03, z + 0.03), DARK]);
};
const door = (c: Part[], x: number, z: number, axis: 'x' | 'z' = 'x') => c.push([axis === 'x' ? box(x - 0.45, x + 0.45, 0, 2.05, z - 0.02, z + 0.02) : box(z - 0.02, z + 0.02, 0, 2.05, x - 0.45, x + 0.45), '#5a3a26']);

const TEMPLATES: Record<Exclude<LodgeFamily, 'L01'>, Template> = {
  // L02 Commonwealth, Sarbah main, Volta main: cream masonry, terracotta pitched roof, shaded hatch
  L02: { hx: 1.8, hz: 1.4, signY: 2.45, build(c) { c.push([box(-1.8, 1.8, 0, 2.6, -1.4, 1.4), CREAM], [box(-1.85, 1.85, 0, 0.3, -1.45, 1.45), '#d8cdb5']); pitched(c, 1.8, 1.4, 2.6, 1.0, TERRA); c.push([box(-0.9, 0.9, 2.05, 2.12, 1.4, 2.1), TERRA]); hatch(c, -0.8, 0.8, 1.4); door(c, -1.8, 0.3, 'z'); } },
  // L03 Akuafo main, Legon main: L-shaped reception and veranda, hipped roof, inset corner counter
  L03: { hx: 2.2, hz: 1.8, signY: 2.5, build(c) { c.push([box(-2.2, 0.4, 0, 2.7, -1.8, 0.2), CREAM], [box(0.4, 2.2, 0, 2.7, -1.8, -0.4), CREAM]); hipped(c, 2.2, 1.8, 2.7, 1.2, '#9a4a2c'); for (const [x, z] of [[2.1, 1.7], [0.5, 1.7], [-2.1, 1.7]]) c.push([box(x - 0.1, x + 0.1, 0, 2.7, z - 0.1, z + 0.1), WHITE]); c.push([box(0.45, 2.15, 0, 1.05, -0.35, 0.25), TIMBER], [box(0.4, 2.2, 1.05, 1.12, -0.4, 0.3), '#6b4426']); hatch(c, -1.6, -0.2, 0.2); } },
  // L04 New Pent: glazed-front rectangle, thin flat canopy, framed hatch
  L04: { hx: 1.9, hz: 1.3, signY: 2.75, build(c) { c.push([box(-1.9, 1.9, 0, 2.8, -1.3, 1.1), '#e9ecee'], [box(-1.95, 1.95, 2.8, 2.9, -1.35, 1.15), '#c9ced2']); for (let x = -1.8; x <= 1.81; x += 0.6) c.push([box(x - 0.03, x + 0.03, 0, 2.8, 1.1, 1.16), DARK]); c.push([box(-1.8, 1.8, 0.2, 2.7, 1.12, 1.14), GLASS], [box(-2.2, 2.2, 2.55, 2.6, 1.1, 2.3), '#cfd3d6']); hatch(c, -0.6, 0.6, 1.17, 0.95, 1.75); } },
  // L05 Old Pent: heavier masonry, gabled roof, sheltered side access
  L05: { hx: 2.0, hz: 1.5, signY: 2.4, build(c) { c.push([box(-2.0, 2.0, 0, 2.5, -1.5, 1.5), '#d9cdb4'], [box(-2.05, 2.05, 0, 0.6, -1.55, 1.55), '#a89a80']); pitched(c, 2.0, 1.5, 2.5, 1.1, '#8f3f27', 0.25); c.push([box(2.0, 3.1, 2.3, 2.4, -1.4, 0.6), '#8f3f27'], [box(3.0, 3.12, 0, 2.3, 0.45, 0.6), '#a89a80'], [box(3.0, 3.12, 0, 2.3, -1.4, -1.25), '#a89a80']); door(c, 2.0, -0.4, 'z'); hatch(c, -1.2, 0.4, 1.5, 1.0, 1.8); } },
  // L06 Evandy: the existing gatehouse (evandy.ts) is the reception; no new structure
  L06: { hx: 0, hz: 0, signY: 0, build() { /* reused */ } },
  // L07 Bani: narrow rectangle, mono-pitched roof, wide hatch
  L07: { hx: 2.4, hz: 1.0, signY: 2.6, build(c) { c.push([box(-2.4, 2.4, 0, 2.6, -1.0, 1.0), '#e4ecf2']); c.push([new THREE.BoxGeometry(5.3, 0.08, 2.7).rotateX(-0.22).translate(0, 3.0, 0.2), '#5d6f7d']); hatch(c, -1.9, 1.9, 1.0, 0.95, 1.85); door(c, -2.4, 0, 'z'); } },
  // L08 TF / James Topp Nelson Yankah: elongated, stepped flat roof, two front openings
  L08: { hx: 2.8, hz: 1.2, signY: 2.95, build(c) { c.push([box(-2.8, 0.2, 0, 2.6, -1.2, 1.2), '#e3ddd2'], [box(0.2, 2.8, 0, 3.1, -1.2, 1.2), '#d6cfc2'], [box(-2.9, 0.25, 2.6, 2.72, -1.3, 1.3), '#9a948a'], [box(0.15, 2.9, 3.1, 3.22, -1.3, 1.3), '#9a948a']); hatch(c, -2.2, -0.9, 1.2); hatch(c, 0.9, 2.2, 1.2); } },
  // L09 ISH 1 and ISH 2: balanced two-window front, central counter bay, low hipped roof
  L09: { hx: 2.4, hz: 1.4, signY: 2.4, build(c) { c.push([box(-2.4, 2.4, 0, 2.5, -1.4, 1.4), CREAM], [box(-0.8, 0.8, 0, 2.5, 1.4, 1.9), '#e6dcc5']); hipped(c, 2.4, 1.4, 2.5, 0.75, '#7c3f2a'); for (const x of [-1.6, 1.6]) c.push([box(x - 0.45, x + 0.45, 1.0, 1.9, 1.39, 1.43), GLASS], [box(x - 0.5, x + 0.5, 0.95, 1.0, 1.4, 1.5), WHITE]); hatch(c, -0.6, 0.6, 1.9); } },
  // L10 Jubilee Hall: faceted reception front, small faceted canopy
  L10: { hx: 2.0, hz: 1.6, signY: 2.6, build(c) { c.push([new THREE.CylinderGeometry(2.0, 2.0, 2.7, 6, 1, false, -Math.PI / 2, Math.PI).translate(0, 1.35, 0), '#ece3cf'], [box(-2.0, 2.0, 0, 2.7, -1.6, 0), '#ece3cf'], [new THREE.CylinderGeometry(2.5, 2.5, 0.1, 6, 1, false, -Math.PI / 2, Math.PI).translate(0, 2.75, 0), '#7a4e33']); hatch(c, -0.6, 0.6, 1.75); } },
  // L11 Valco Trust phases: paired volumes joined by one canopy, one arrival counter
  L11: { hx: 2.9, hz: 1.3, signY: 2.95, build(c) { for (const x of [-1.9, 1.9]) c.push([box(x - 1.0, x + 1.0, 0, 2.6, -1.3, 1.3), '#e8e8e2'], [box(x - 1.05, x + 1.05, 2.6, 2.7, -1.35, 1.35), GREY]); c.push([box(-3.0, 3.0, 2.9, 2.98, -1.1, 1.9), '#c2c6c9'], [box(-0.9, 0.9, 0, 1.05, -0.3, 0.6), TIMBER], [box(-0.95, 0.95, 1.05, 1.12, -0.35, 0.65), '#6b4426']); for (const x of [-2.9, 2.9]) c.push([box(x - 0.06, x + 0.06, 0, 2.9, 1.8, 1.9), GREY]); } },
  // L12 Vikings: angular section, asymmetric canopy, corner glazing
  L12: { hx: 2.0, hz: 1.4, signY: 2.6, build(c) { c.push([box(-2.0, 2.0, 0, 2.7, -1.4, 1.0), '#ebe6dd'], [new THREE.CylinderGeometry(0.6, 0.6, 2.7, 3).rotateY(0.3).translate(-1.6, 1.35, 0.8), '#ebe6dd']); c.push([new THREE.BoxGeometry(5.0, 0.09, 2.0).rotateZ(0.16).translate(0.6, 3.05, 1.2), '#3a4048'], [box(1.5, 2.02, 0.4, 2.5, 0.4, 1.02), GLASS], [box(1.98, 2.02, 0.4, 2.5, -0.9, 1.0), GLASS]); hatch(c, -1.4, 0.2, 1.0); } },
  // L13 Akuafo, Sarbah and Legon annexes: square modular section, flat roof, protected hatch
  L13: { hx: 1.6, hz: 1.6, signY: 2.5, build(c) { c.push([box(-1.6, 1.6, 0, 2.6, -1.6, 1.6), '#e6e2d8'], [box(-1.7, 1.7, 2.6, 2.75, -1.7, 1.7), GREY]); for (const x of [-1.6, 1.6]) for (const z of [-1.6, 1.6]) c.push([box(x - 0.08, x + 0.08, 0, 2.6, z - 0.08, z + 0.08), '#b9b4a8']); c.push([box(-0.8, 0.8, 2.0, 2.06, 1.6, 2.15), GREY], [box(-0.84, -0.78, 1.3, 2.06, 1.6, 2.15), GREY], [box(0.78, 0.84, 1.3, 2.06, 1.6, 2.15), GREY]); hatch(c, -0.7, 0.7, 1.6); } },
};

let signMat: THREE.MeshStandardMaterial | null = null;
const lodgeSign = () => (signMat ??= new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvas(256, 48, (g) => { g.fillStyle = '#16365f'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#ffffff'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText("PORTER'S LODGE", 128, 25); }) }));

export interface LodgePlacement { residence: string; entrance: string; family: LodgeFamily | null; status: 'built' | 'in the gateway' | 'indoor reception (L01)' | 'existing gatehouse reused' | 'served by another lodge' | 'no clear place'; servedBy?: string; at?: [number, number]; side?: 'left' | 'right'; inside?: boolean }
export const LODGE_PLACEMENTS: LodgePlacement[] = [];

/**
 * A place just inside the entrance (else just outside it) and to one side of the route, clear of buildings, roads and
 * solids: the nearest clear spot on a widening search, preferring inside the gate and close to the route.
 */
function place(e: Entrance, t: Template, roadGap = 0.4): { x: number; z: number; yaw: number; side: 'left' | 'right'; inside: boolean } | null {
  const b = (e.facing * Math.PI) / 180, ux = Math.sin(b), uz = -Math.cos(b), nx = Math.cos(b), nz = Math.sin(b);
  const free = (x: number, z: number) => !buildingNear(x, z, 0.4) && roadClearance(x, z, 6, -1, true) > roadGap && !SOLIDS.at(x, z, 0.3);
  let best: { x: number; z: number; yaw: number; side: 'left' | 'right'; inside: boolean; score: number } | null = null;
  // (the owner, 2026-10-16: the lodge is inside, after the gate, on the right going in; never outside before the gate)
  for (let along = 2; along <= 16; along += 1) for (const side of [1, -1]) for (let off = t.hx + 1.4; off <= t.hx + 9; off += 1) {
    const score = along + (off - t.hx) * 1.2 + (side > 0 ? 0 : 8);
    if (best && score >= best.score) continue;
    const x = along * ux + side * off * nx + e.at[0], z = along * uz + side * off * nz + e.at[1];
    // the corners of the footprint (counter toward the route) all clear, the ground nearly level
    const yaw = Math.atan2(-side * nx, -side * nz);
    const cs = Math.cos(yaw), sn = Math.sin(yaw), pts = [[-t.hx, -t.hz], [t.hx, -t.hz], [-t.hx, t.hz + 0.4], [t.hx, t.hz + 0.4], [0, 0]].map(([a, c]) => [x + a * cs + c * sn, z - a * sn + c * cs]);
    if (!pts.every(([px, pz]) => free(px, pz))) continue;
    const hs = pts.map(([px, pz]) => gh(px, pz));
    if (Math.max(...hs) - Math.min(...hs) > 0.8) continue;
    best = { x, z, yaw, side: side > 0 ? 'right' : 'left', inside: along > 0, score };
  }
  return best && { x: best.x, z: best.z, yaw: best.yaw, side: best.side, inside: best.inside };
}

/** every lodge, built once with the campus */
export function buildLodges(): THREE.Group {
  const group = new THREE.Group();
  group.name = "porter's lodges";
  LODGE_PLACEMENTS.length = 0;
  const parts: Part[] = [], signs: THREE.BufferGeometry[] = [];
  for (const r of RESIDENCES as Residence[]) for (const e of r.entrances) {
    const rec: LodgePlacement = { residence: r.id, entrance: e.id, family: r.lodge, status: 'built' };
    LODGE_PLACEMENTS.push(rec);
    // (the Volta annex: Volta Hall's lodge at the main hall's main entrance serves it; nothing is built at the annex)
    if (!r.lodge) { rec.status = 'served by another lodge'; rec.servedBy = r.lodgeAt; continue; }
    if (r.lodge === 'L01') { rec.status = 'indoor reception (L01)'; continue; }
    if (r.lodge === 'L06' || r.existingLodge) { rec.status = 'existing gatehouse reused'; continue; }
    // (the halls built round courts: the lodge is a room in the gateway's side wall, inside the gate: gateways.ts)
    if (COURT_HALLS.has(r.id)) { rec.status = 'in the gateway'; rec.inside = true; rec.side = r.id === 'limann' || r.id === 'sey' ? 'left' : 'right'; continue; }
    // (a tight frontage: the lodge may stand right at the kerb)
    const t = TEMPLATES[r.lodge], p = place(e, t) ?? place(e, t, 0.05);
    if (!p) { rec.status = 'no clear place'; continue; }
    Object.assign(rec, { at: [+p.x.toFixed(1), +p.z.toFixed(1)], side: p.side, inside: p.inside });
    const c: Part[] = [];
    t.build(c);
    const y = Math.min(gh(p.x, p.z), ...[[-t.hx, -t.hz], [t.hx, t.hz]].map(([a, b2]) => gh(p.x + a, p.z + b2))) - 0.05;
    const m = new THREE.Matrix4().makeRotationY(p.yaw).setPosition(p.x, y, p.z);
    for (const [g, col] of c) parts.push([g.applyMatrix4(m), col]);
    // a plinth so the lodge sits on sloping ground
    parts.push([box(-t.hx - 0.1, t.hx + 0.1, -0.4, 0.06, -t.hz - 0.1, t.hz + 0.1).applyMatrix4(m), '#c9c2b2']);
    signs.push(new THREE.PlaneGeometry(1.6, 0.3).translate(0, t.signY, t.hz + 0.06).applyMatrix4(m));
    for (const [a, b2] of [[0, 0], [-t.hx * 0.6, 0], [t.hx * 0.6, 0]]) { const v = new THREE.Vector3(a, 0, b2).applyMatrix4(m); SOLIDS.add(v.x, v.z, Math.min(t.hx, t.hz) + 0.2); }
  }
  if (parts.length) { const mesh = new THREE.Mesh(merge(parts), concrete(0.25)); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); }
  if (signs.length) group.add(new THREE.Mesh(mergeGeometries(signs), lodgeSign()));
  return group;
}

/** the L01 reception, photo-led (Volume B pages 13, 69): seen on entering a Diaspora-group hall. Built away from the
 *  campus like the rooms; a lobby wall behind the visitor, the counter ahead. */
export function lobbyScene(): { group: THREE.Group; cam: THREE.Vector3; look: THREE.Vector3 } {
  const O = ROOM_ORIGIN.clone().add(new THREE.Vector3(60, 0, 0));
  const c: Part[] = [];
  const W = 7, D = 6, H = 3.2;
  c.push([box(0, W, -0.05, 0, 0, D), '#d7b79a'], [box(0, W, H, H + 0.05, 0, D), '#f4f2ec']);
  c.push([box(-0.1, 0, 0, H, 0, D), '#efe7d4'], [box(W, W + 0.1, 0, H, 0, D), '#efe7d4'], [box(0, W, 0, H, D, D + 0.1), '#f3eee4'], [box(0, W, 0, H, -0.1, 0), '#efe7d4']);
  c.push([box(0, 0.6, 0, H, D - 0.6, D), '#e7dcc4']);
  // the counter: 4.2 m front run, 0.65 deep, 1.0 high, vertical timber panels, the 1.4 m return on the right
  const x0 = 1.0, x1 = 5.2, z = 3.4;
  c.push([box(x0, x1, 0, 1.0, z, z + 0.65), '#a2622f'], [box(x0 - 0.05, x1 + 0.05, 1.0, 1.06, z - 0.08, z + 0.7), '#7c4523']);
  for (let x = x0 + 0.08; x < x1; x += 0.16) c.push([box(x - 0.012, x + 0.012, 0.03, 0.98, z - 0.012, z), '#7c4523']);
  c.push([box(x1 - 0.65, x1, 0, 1.0, z - 1.4, z), '#a2622f'], [box(x1 - 0.7, x1 + 0.05, 1.0, 1.06, z - 1.45, z), '#7c4523']);
  for (let zz = z - 1.32; zz < z; zz += 0.16) c.push([box(x1 - 0.66, x1 - 0.64, 0.03, 0.98, zz - 0.012, zz + 0.012), '#7c4523']);
  // the glazed screen in dark timber frames, with transaction openings
  for (let x = x0; x <= x1 + 0.01; x += 1.05) c.push([box(x - 0.04, x + 0.04, 1.06, 2.1, z + 0.28, z + 0.36), '#4a2b1a']);
  c.push([box(x0, x1, 2.06, 2.12, z + 0.26, z + 0.38), '#4a2b1a'], [box(x0, x1, 1.06, 1.1, z + 0.26, z + 0.38), '#4a2b1a']);
  // the key and mail cubbies on the back wall, the staff workspace
  for (let x = 1.4; x < 5.0; x += 0.24) for (let y = 1.1; y < 2.3; y += 0.22) c.push([box(x, x + 0.21, y, y + 0.19, D - 0.12, D - 0.02), '#5a3a26']);
  c.push([box(1.6, 3.2, 0, 0.74, D - 0.9, D - 0.3), '#8a6a4a']);
  const group = new THREE.Group();
  group.name = 'L01 reception';
  const mesh = new THREE.Mesh(merge(c), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }));
  group.add(mesh);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 - 0.1, 0.94, 0.02).translate((x0 + x1) / 2, 1.58, z + 0.32), new THREE.MeshStandardMaterial({ color: '#cfe2ea', transparent: true, opacity: 0.25, roughness: 0.05 }));
  group.add(glass);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.34).translate((x0 + x1) / 2, 2.45, z + 0.4), lodgeSign());
  group.add(sign);
  for (const [lx, lz] of [[2, 2], [5, 2], [3.5, 4.8]]) { const l = new THREE.PointLight('#fff4e0', 6, 9, 1.6); l.position.set(lx, H - 0.3, lz); group.add(l); }
  group.add(new THREE.AmbientLight('#ffffff', 0.6));
  group.position.copy(O);
  return { group, cam: O.clone().add(new THREE.Vector3(2.4, 1.6, 0.6)), look: O.clone().add(new THREE.Vector3(3.3, 1.3, 3.6)) };
}
