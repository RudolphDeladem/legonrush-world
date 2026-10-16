// The ground's soil and grass as one surface (the owner's revised soil and grass correction order, R-1 to R-14, and
// SOIL-01 to SOIL-08: "soil is the ground beneath and between grass; no brown overlays on turf; no soil on pavements").
//
// Ownership, as the order's R-6 defines it:
//   P = protected hardscape: every mapped road, lane and footway at its drawn width (and the N4's widened carriageways),
//       plus whatever paving a site keeps out of its own region;
//   U = the region a site's soil function owns, minus P;
//   E = exposed-soil coverage in U, 0..1, a smooth field (never a stamp);
//   visible soil = U * E, grass = U * (1 - E).
// A soil mesh lies on the terrain (its vertices on the ground height, a couple of centimetres up with the terrain's own
// depth offset) and draws the terrain's own grass where E is low, from the very same texture, world mapping and large
// patches as the campus ground: where E is 0 it is indistinguishable from the ground round it, so it has no edge, rim or
// sheet of its own. Where E rises the soil shows through, its boundary set by E and a world-space break-up, with the
// grass texture's darker blades persisting over the soil's margin. No soil vertex is ever placed on P.
import * as THREE from 'three';
import { grassMacroTexture, grassTexture } from './textures';
import { drapeAt } from './kuffourgarden';
import { NODE_XZ, ROADS } from './campusmap';
import { N4_WIDE, halfOf } from './lbplan';
import { vnoise } from './enkit';

const TILE = 200;
let shared: { map: THREE.Texture; macro: THREE.Texture } | null = null;
/** the campus ground's grass texture (8 m repeat over 200 m tiles) and its large-patch texture: one instance of each,
 *  shared by the terrain and every soil mesh so the two match exactly */
export function campusGrass() {
  if (shared) return shared;
  const map = grassTexture();
  map.repeat.set(TILE / 8, TILE / 8);
  const macro = grassMacroTexture();
  macro.colorSpace = THREE.NoColorSpace;
  return (shared = { map, macro });
}

/** the terrain grass's shading: large light, dark and dry patches over the fine texture (one extra lookup); with
 *  `soil`, the soil coverage blend on top */
function patch(mat: THREE.MeshStandardMaterial, soil: boolean) {
  const { macro } = campusGrass();
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.grassMacro = { value: macro };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec2 vGrassW;${soil ? '\nattribute float soil;\nvarying float vSoil;' : ''}`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>\nvGrassW = (modelMatrix * vec4(transformed, 1.0)).xz;${soil ? '\nvSoil = soil;' : ''}`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec2 vGrassW;\nuniform sampler2D grassMacro;${soil ? '\nvarying float vSoil;' : ''}`)
      // (the vertex colours are the soil's colour, not a tint over the grass)
      .replace('#include <color_fragment>', '')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        vec2 gm = texture2D(grassMacro, vGrassW / 260.0).rg + texture2D(grassMacro, vGrassW / 71.0 + 0.37).rg - 1.0;
        diffuseColor.rgb *= 1.0 + gm.r * 0.8;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.18, 1.05, 0.62), clamp(gm.g * 2.2, 0.0, 0.5));
        ${soil ? `{
          // the soil boundary: the coverage broken up at two world scales, so it wanders (no grid, no straight cut)
          float b1 = texture2D(grassMacro, vGrassW / 13.0 + 0.11).r, b2 = texture2D(grassMacro, vGrassW / 3.7 + 0.53).g;
          // the soil's own grain: grit and clods at a few decimetres, a broader mottle
          float g1 = texture2D(grassMacro, vGrassW / 0.9 + 0.7).r, g2 = texture2D(grassMacro, vGrassW / 6.0 + 0.3).g;
          float c1 = texture2D(grassMacro, vGrassW / 1.6 + 0.29).r;
          // partly bare ground is a mix: clumps of grass in the soil and bare spots in the grass, finer the barer it is;
          // only ground that is fully bare is plain soil
          float e = vSoil + (b1 - 0.5) * 0.42 + (b2 - 0.5) * 0.34 + (c1 - 0.5) * 0.36 * (1.0 - vSoil * vSoil);
          // the grass's darker blades hold on a little longer over the soil's margin
          float lum = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
          float k = smoothstep(0.4, 0.66, e + (0.16 - lum) * 0.9);
          vec3 soilC = vColor.rgb * (0.86 + g1 * 0.18 + (g2 - 0.5) * 0.12);
          diffuseColor.rgb = mix(diffuseColor.rgb, soilC, k);
        }` : ''}`,
      );
  };
  mat.customProgramCacheKey = () => (soil ? 'legon-soil' : 'legon-grass');
  return mat;
}

/** the campus ground's grass material */
export function terrainGrass() {
  // a touch less saturated than the texture: sun-bleached Legon grass, not a football pitch
  return patch(new THREE.MeshStandardMaterial({ map: campusGrass().map, roughness: 1, color: '#e4e0cc' }), false);
}

let soilMat: THREE.MeshStandardMaterial | null = null;
/** the soil meshes' material: the terrain's grass and, by the soil attribute, the soil */
export const soilGround = () =>
  (soilMat ??= patch(new THREE.MeshStandardMaterial({ map: campusGrass().map, vertexColors: true, roughness: 1, color: '#e4e0cc', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }), true));

// every mapped road, lane and footway at its drawn half width, and the N4's widening, on a 20 m grid (built on first use)
const SG = 20;
let grid: Map<number, [number, number, number, number, number][]> | null = null;
const key = (i: number, j: number) => (i + 4096) * 8192 + (j + 4096);
function segGrid() {
  if (grid) return grid;
  const g = new Map<number, [number, number, number, number, number][]>();
  const put = (s: [number, number, number, number, number]) => {
    const [ax, az, bx, bz, h] = s;
    for (let i = Math.floor((Math.min(ax, bx) - h) / SG); i <= Math.floor((Math.max(ax, bx) + h) / SG); i++)
      for (let j = Math.floor((Math.min(az, bz) - h) / SG); j <= Math.floor((Math.max(az, bz) + h) / SG); j++) {
        const k = key(i, j); let l = g.get(k); if (!l) g.set(k, (l = [])); l.push(s);
      }
  };
  for (const r of ROADS) for (let i = 0; i < r.nodes.length - 1; i++)
    put([NODE_XZ[r.nodes[i] * 2], NODE_XZ[r.nodes[i] * 2 + 1], NODE_XZ[r.nodes[i + 1] * 2], NODE_XZ[r.nodes[i + 1] * 2 + 1], halfOf(r)]);
  for (const w of N4_WIDE) put(w);
  return (grid = g);
}
/** distance from (x, z) to the nearest road, lane or footway edge (negative on one) */
export function hardClearance(x: number, z: number) {
  let best = Infinity;
  for (const [ax, az, bx, bz, h] of segGrid().get(key(Math.floor(x / SG), Math.floor(z / SG))) ?? []) {
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(ax + dx * t - x, az + dz * t - z) - h);
  }
  return best;
}
/** P: on (or within `pad` of) a mapped road, lane or footway, the N4's widened carriageways included */
export const onHardscape = (x: number, z: number, pad = 0.05) => hardClearance(x, z) < pad;

type RGB = [number, number, number];
/** the default soil: the muted dusty red-brown of the corridor's bare ground, with a little local variation */
export const dustySoil = (x: number, z: number): RGB => {
  const m = vnoise(x * 0.7, z * 0.7), n = vnoise(x * 0.12 + 5, z * 0.12);
  return [0.52 + m * 0.05 - n * 0.03, 0.41 + m * 0.04, 0.32 + m * 0.02 + n * 0.02];
};
/** a smooth step for the coverage fields */
export const ramp = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * One soil region as part of the ground: `e` gives the exposed-soil coverage (0..1) over the region the site owns, or
 * null outside it; `tone` the soil's colour there. Cells are cut along the region's true edge and along P's (drapeAt),
 * so nothing reaches a kerb, a road or a footway; the coverage should fade to 0 where the region meets plain lawn so
 * that edge shows no seam.
 */
export function soilMesh(org: [number, number], x0: number, x1: number, z0: number, z1: number, cell: number, e: (x: number, z: number) => number | null, tone: (x: number, z: number) => RGB = dustySoil) {
  const own = (x: number, z: number) => (onHardscape(x, z) ? null : e(x, z));
  const geo = drapeAt(org, x0, x1, z0, z1, cell, 0.025, (x, z) => (own(x, z) === null ? null : tone(x, z)));
  const p = geo.attributes.position, n = p.count, soil = new Float32Array(n), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const wx = p.getX(i) + org[0], wz = p.getZ(i) + org[1];
    // (a vertex on the region's cut edge: its coverage just inside)
    const v = own(wx, wz) ?? 0;
    soil[i] = Math.min(1, Math.max(0, v));
    // the terrain's own mapping: 200 m tiles, the texture repeating 25 times across one
    uv[i * 2] = wx / TILE; uv[i * 2 + 1] = -wz / TILE;
  }
  geo.setAttribute('soil', new THREE.Float32BufferAttribute(soil, 1));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return Object.assign(new THREE.Mesh(geo, soilGround()), { receiveShadow: true, userData: { noCollide: true } });
}
