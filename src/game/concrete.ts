// Old painted concrete for the block-modelled buildings (mathstat.ts, issercs.ts): a stain map laid in world
// metres (rain streaks, mottling, mildew), grime for facade canvases, breeze-block screens and thin railings.
import * as THREE from 'three';
import { canvas, merge, rnd, speckle } from './modelkit';
import type { Kit } from './blocks';
import { groundShade } from './shading';

// ---------- weathering ----------
/** grime on a facade canvas: streaks running down from the window sills and slab lines, blotches, mildew */
export function aged(g: CanvasRenderingContext2D, sills: number[]) {
  for (let i = 0; i < 26; i++) {
    const x = rnd() * 256, y = sills[(rnd() * sills.length) | 0], len = 30 + rnd() * 120, w = 2 + rnd() * 7;
    const gr = g.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, `rgba(80,78,70,${0.12 + rnd() * 0.25})`); gr.addColorStop(1, 'rgba(80,78,70,0)');
    g.fillStyle = gr; g.fillRect(x, y, w, len);
  }
  for (let i = 0; i < 18; i++) {
    const x = rnd() * 256, y = rnd() * 512, r = 8 + rnd() * 40;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(110,106,96,${0.06 + rnd() * 0.12})`); gr.addColorStop(1, 'rgba(110,106,96,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  const foot = g.createLinearGradient(0, 470, 0, 512);
  foot.addColorStop(0, 'rgba(60,62,50,0)'); foot.addColorStop(1, 'rgba(60,62,50,0.35)');
  g.fillStyle = foot; g.fillRect(0, 470, 256, 42);
  speckle(g, 0, 0, 256, 512, 900, ['rgba(70,70,64,0.35)', 'rgba(120,116,104,0.3)']);
}
export const wall = (g: CanvasRenderingContext2D, c: string) => { g.fillStyle = c; g.fillRect(0, 0, 256, 512); speckle(g, 0, 0, 256, 512, 2500, ['#d9d6cc', '#e9e6de', '#cfccc2']); };
export const pane = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cols = 2) => {
  g.fillStyle = '#3b3b38'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const gl = g.createLinearGradient(0, y, 0, y + h);
  gl.addColorStop(0, '#4a535a'); gl.addColorStop(1, '#1d2126');
  g.fillStyle = gl; g.fillRect(x, y, w, h);
  g.fillStyle = '#3b3b38';
  for (let i = 1; i < cols; i++) g.fillRect(x + (w * i) / cols - 2, y, 4, h);
};
export const door = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = '#4a2d21') => {
  g.fillStyle = '#2e2622'; g.fillRect(x - 3, y - 3, w + 6, h + 3);
  g.fillStyle = color; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + w / 2 - 1, y, 2, h);
};
/** the stain map for the concrete parts: mottling, rain streaks hanging from random heights, mildew specks */
function stains() {
  return canvas(512, 512, (g) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 160; i++) {
      const x = rnd() * 512, y = rnd() * 512, r = 10 + rnd() * 70;
      for (const [ox, oy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        const a = 0.04 + rnd() * 0.1;
        gr.addColorStop(0, `rgba(118,116,106,${a})`); gr.addColorStop(1, 'rgba(118,116,106,0)');
        g.fillStyle = gr; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
      }
    }
    for (let i = 0; i < 170; i++) {
      const x = rnd() * 512, y = rnd() * 512, len = 30 + rnd() * 200, w = 2 + rnd() * 8;
      const a = 0.04 + rnd() * 0.14;
      for (const oy of [0, -512]) {
        const gr = g.createLinearGradient(0, y + oy, 0, y + oy + len);
        gr.addColorStop(0, `rgba(82,80,72,${a})`); gr.addColorStop(1, 'rgba(82,80,72,0)');
        g.fillStyle = gr; g.fillRect(x, y + oy, w, len);
      }
    }
    speckle(g, 0, 0, 512, 512, 2500, ['rgba(60,62,56,0.25)', 'rgba(100,98,90,0.2)', 'rgba(150,146,134,0.2)']);
  });
}
/** weathered concrete: vertex colours times the stain map, laid in world metres on every face; `strength` scales the
 *  grime (1 = old paint gone grey, below 1 fresher paint, above 1 paint washed out and peeling) */
const concreteMats = new Map<number, THREE.MeshStandardMaterial>();
let stainTex: THREE.Texture | null = null;
export function concrete(strength = 1) {
  let m = concreteMats.get(strength);
  if (m) return m;
  const tex = (stainTex ??= stains());
  m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.msTex = { value: tex };
    sh.uniforms.msStrength = { value: strength };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMsP;\nvarying vec3 vMsN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMsP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvMsN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMsP;\nvarying vec3 vMsN;\nuniform sampler2D msTex;\nuniform float msStrength;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 msA = abs(vMsN);
  vec2 msUv = msA.y > 0.6 ? vMsP.xz / 7.0 : vec2((msA.x > msA.z ? vMsP.z : vMsP.x) / 7.0, vMsP.y / 7.0);
  diffuseColor.rgb *= clamp(mix(vec3(1.0), texture2D(msTex, msUv).rgb, msStrength), 0.0, 1.0);`);
  };
  // one shader program for every strength (a uniform): a program per value compiled mid-ride, the first time each
  // site came into view, and made the guided ride stutter
  m.customProgramCacheKey = () => 'old-concrete';
  m = groundShade(m, 2.2, 0.3, 'wall');
  concreteMats.set(strength, m);
  return m;
}

// ---------- screens and railings (alpha-tested textures on planes) ----------
let breezeMat: THREE.MeshStandardMaterial | null = null;
/** breeze blocks: a grid of square blocks, each pierced by a round opening, with small openings at the corners */
export const breeze = () => (breezeMat ??= (() => {
  const t = canvas(128, 128, (g) => {
    g.fillStyle = '#e1ded5'; g.fillRect(0, 0, 128, 128);
    speckle(g, 0, 0, 128, 128, 400, ['#cfccc2', '#bdb9ae']);
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(64, 64, 46, 0, Math.PI * 2); g.fill();
    for (const [x, y] of [[0, 0], [128, 0], [0, 128], [128, 128]]) { g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill(); }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = '#c8c4b8'; g.lineWidth = 4; g.strokeRect(2, 2, 124, 124);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.95 });
})());
let piercedMat: THREE.MeshStandardMaterial | null = null;
/** a white screen wall pierced all over by small square holes (the chemistry extension's west side, owner) */
export const pierced = () => (piercedMat ??= (() => {
  const t = canvas(128, 128, (g) => {
    g.fillStyle = '#ecebe5'; g.fillRect(0, 0, 128, 128);
    speckle(g, 0, 0, 128, 128, 300, ['#d9d6cc', '#cbc7bc']);
    g.globalCompositeOperation = 'destination-out';
    for (const x of [16, 80]) for (const y of [16, 80]) g.fillRect(x, y, 32, 32);
    g.globalCompositeOperation = 'source-over';
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.95 });
})());
let railMat: THREE.MeshStandardMaterial | null = null;
/** a thin dark railing: balusters 15 cm apart between a top and a bottom rail */
export const rails = () => (railMat ??= (() => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = '#2a2b2d'; g.fillRect(28, 0, 8, 64); g.fillRect(0, 0, 64, 6); g.fillRect(0, 56, 64, 6);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
})());
/** a textured plane from (ax, az) to (bx, bz) in world x/z (the model's origin O), between heights y0 and y1, the texture tiled every `tile` m */
export function panel(O: [number, number], k: Kit, mat: THREE.Material, ax: number, az: number, bx: number, bz: number, y0: number, y1: number, tile: number, tileY = tile) {
  const len = Math.hypot(bx - ax, bz - az), h = y1 - y0;
  const geo = new THREE.PlaneGeometry(len, h);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * len) / tile, (uv.getY(i) * h) / tileY);
  const m = new THREE.Mesh(geo, mat);
  m.position.set((ax + bx) / 2 - O[0], (y0 + y1) / 2, (az + bz) / 2 - O[1]);
  m.rotation.y = -Math.atan2(bz - az, bx - ax);
  m.castShadow = true;
  k.meshes.push(m);
}

/** paint peeling off a facade canvas: ragged patches of the grey render under it, their edges darker */
export function peeling(g: CanvasRenderingContext2D, n: number) {
  for (let i = 0; i < n; i++) {
    const cx = rnd() * 256, cy = rnd() * 512, r = 3 + rnd() * 11, k = 7 + ((rnd() * 6) | 0);
    g.beginPath();
    for (let j = 0; j < k; j++) {
      const a = (j / k) * Math.PI * 2, rr = r * (0.45 + rnd() * 0.75);
      g[j ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr);
    }
    g.closePath();
    g.fillStyle = `rgba(150,146,134,${0.2 + rnd() * 0.2})`; g.fill();
    g.strokeStyle = 'rgba(85,82,74,0.3)'; g.lineWidth = 1; g.stroke();
  }
}
let grilleMat: THREE.MeshStandardMaterial | null = null;
/** a collapsible gate grille: a dark diamond lattice of flat bars, open between them */
export const grille = () => (grilleMat ??= (() => {
  const t = canvas(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = '#1e1f21'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 64); g.moveTo(64, 0); g.lineTo(0, 64); g.stroke();
    g.fillStyle = '#1e1f21'; g.fillRect(0, 0, 6, 64); g.fillRect(58, 0, 6, 64);
  });
  return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.5 });
})());

// ---------- rubble stone facing (low walls, plinths, kerbs: the owner's "stone-like" slabs) ----------
let rubbleMat: THREE.MeshStandardMaterial | null = null;
/** irregular stones in browns, buffs and greys with dark mortar, laid in world metres on every face (vertex colour
 *  white keeps the stones' own colours) */
export function rubble() {
  if (rubbleMat) return rubbleMat;
  let s = 11;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tex = canvas(256, 256, (g) => {
    g.fillStyle = '#5f5a52'; g.fillRect(0, 0, 256, 256);
    const cols = ['#b49a7a', '#a08868', '#c2ad8e', '#8f7a62', '#9c9384', '#b8a58a', '#c9a77f', '#a9a08f', '#d1bf9c'];
    for (let j = 0; j < 8; j++) for (let i = 0; i < 7; i++) {
      const cx = i * 37 + (j % 2) * 18 + r() * 8, cy = j * 32 + r() * 6, rx = 15 + r() * 6, ry = 11 + r() * 5, n = 6 + ((r() * 3) | 0);
      const col = cols[(r() * cols.length) | 0];
      for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
        g.beginPath();
        for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + r() * 0.3, f = 0.75 + r() * 0.3; g[k ? 'lineTo' : 'moveTo'](cx + ox + Math.cos(a) * rx * f, cy + oy + Math.sin(a) * ry * f); }
        g.closePath(); g.fillStyle = col; g.fill();
        g.strokeStyle = 'rgba(40,36,30,0.55)'; g.lineWidth = 2; g.stroke();
      }
    }
    speckle(g, 0, 0, 256, 256, 1200, ['rgba(50,46,40,0.25)', 'rgba(220,210,190,0.15)']);
  });
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.ruTex = { value: tex };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRuP;\nvarying vec3 vRuN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvRuP = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvRuN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRuP;\nvarying vec3 vRuN;\nuniform sampler2D ruTex;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec3 ruA = abs(vRuN);
  vec2 ruUv = ruA.y > 0.6 ? vRuP.xz / 1.6 : vec2((ruA.x > ruA.z ? vRuP.z : vRuP.x) / 1.6, vRuP.y / 1.6);
  diffuseColor.rgb *= texture2D(ruTex, ruUv).rgb;`);
  };
  m.customProgramCacheKey = () => 'rubble-stone-shared';
  return (rubbleMat = m);
}
/** stone-faced parts (white vertex colour) as one mesh in the kit */
export function stoneMesh(k: Kit, parts: [THREE.BufferGeometry, string][]) {
  if (!parts.length) return;
  const m = new THREE.Mesh(merge(parts), rubble());
  m.castShadow = true; m.receiveShadow = true;
  k.meshes.push(m);
}
