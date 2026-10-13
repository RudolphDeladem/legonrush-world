// Recognisable shapes for a few campus landmarks, placed at their real spots.
// First drafts from descriptions; they get refined once there are photos.
import * as THREE from 'three';
import { placeByName, roadAt } from './campusmap';
import { labelTexture } from './textures';
import { facadeBox, hipRoof } from './facades';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { nightHooks } from './life';
import { applyRelief } from './relief';

const white = new THREE.MeshStandardMaterial({ color: '#f1ece2', roughness: 0.85 });
const cream = new THREE.MeshStandardMaterial({ color: '#e3d6bd', roughness: 0.9 });
const tile = new THREE.MeshStandardMaterial({ color: '#9c4a2c', roughness: 0.8 });
const dark = new THREE.MeshStandardMaterial({ color: '#2b2f3a', roughness: 0.7 });

/** many small coloured parts merged into one mesh (one draw call) */
const detailMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 });
function detail(parts: [THREE.BufferGeometry, string][]) {
  const geos = parts.map(([g, c]) => {
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k);
    const col = new THREE.Color(c);
    const arr = new Float32Array(n.attributes.position.count * 3);
    for (let i = 0; i < arr.length; i += 3) { arr[i] = col.r; arr[i + 1] = col.g; arr[i + 2] = col.b; }
    n.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return n;
  });
  const m = new THREE.Mesh(mergeGeometries(geos), detailMat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
const B = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
/** lamp globes and lit clock faces glow after dark */
const nightGlow = new THREE.MeshStandardMaterial({ color: '#f4efe0', emissive: '#ffd98a', emissiveIntensity: 0, roughness: 0.4 });
nightHooks.push((on) => { nightGlow.emissiveIntensity = on ? 2.2 : 0; });

const box = (w: number, h: number, d: number, mat: THREE.Material, y = h / 2) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.y = y;
  m.castShadow = m.receiveShadow = true;
  return m;
};
const at = (m: THREE.Object3D, x: number, y: number, z: number) => {
  m.position.set(x, y, z);
  return m;
};
/** a tiled hipped roof with eaves and overhang, covering about w x w, rising h from y */
const tiledHip = (w: number, h: number, y: number) => hipRoof(w - 1.2, w - 1.2, y, '#ad4f2d', 0.6, h / (w / 2));
/** a four-sided hipped roof */
const hip = (w: number, h: number, y: number) => {
  const m = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, h, 4), tile);
  m.rotation.y = Math.PI / 4;
  m.position.y = y + h / 2;
  m.castShadow = true;
  return m;
};

/**
 * Main entrance: two big rendered pillars with recessed panels and lamps, a beam
 * with the university's name and motto, a crest disc, guard booths and boom barriers.
 */
function mainGate(span: number) {
  const g = new THREE.Group();
  const px = span / 2 + 1.1;
  const parts: [THREE.BufferGeometry, string][] = [];
  for (const s of [-1, 1]) {
    const x = s * px;
    parts.push(
      [B(2.2, 9, 2.2, x, 4.5, 0), '#f3eee4'],
      [B(2.7, 0.9, 2.7, x, 0.45, 0), '#8f8476'],
      [B(2.5, 0.25, 2.5, x, 1.0, 0), '#d9d0c0'],
      [B(2.8, 0.6, 2.8, x, 9.3, 0), '#a24b2e'],
      [B(2.5, 0.25, 2.5, x, 8.85, 0), '#e6dfd2'],
      // recessed panels on the faces
      [B(1.3, 5.2, 0.06, x, 4.6, 1.11), '#ded6c8'], [B(1.3, 5.2, 0.06, x, 4.6, -1.11), '#ded6c8'],
      [B(0.06, 5.2, 1.3, x + 1.11 * s, 4.6, 0), '#ded6c8'],
      // planter at the foot with flowers
      [B(1.0, 0.6, 3.2, x + 1.9 * s, 0.3, 0), '#e8e2d4'],
      [B(0.8, 0.12, 3.0, x + 1.9 * s, 0.62, 0), '#4b3527'],
      ...[-1.1, -0.4, 0.3, 1.0].map((z, i) => [B(0.5, 0.35, 0.5, x + 1.9 * s, 0.8, z), ['#d81b60', '#f5c518', '#e53935', '#ff7043'][i]] as [THREE.BufferGeometry, string]),
      // lamp posts on top of the pillars
      [new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6).translate(x, 10.2, 0), '#2b2f3a'],
    );
    // guard booth outside each pillar, and a boom barrier across each lane
    const bx = x + 5 * s;
    parts.push(
      [B(2.4, 2.6, 2.4, bx, 1.3, 2.5), '#f1ece2'],
      [B(1.8, 0.9, 0.04, bx, 1.7, 3.71), '#22303c'], [B(1.8, 0.9, 0.04, bx, 1.7, 1.29), '#22303c'],
      [B(3.0, 0.2, 3.0, bx, 2.7, 2.5), '#a24b2e'],
      [B(0.4, 1.0, 0.4, x - 1.6 * s, 0.5, 2.2), '#c8c8c8'],
    );
    const arm = span / 2 - 1.8;
    for (let i = 0; i < 8; i++) {
      const len = arm / 8;
      parts.push([B(len, 0.12, 0.12, x - 1.6 * s - s * (i + 0.5) * len, 1.05, 2.2), i % 2 ? '#ffffff' : '#d32f2f']);
    }
  }
  // the beam, its cornice and a pediment with the crest
  parts.push(
    [B(span + 4.4, 1.8, 1.2, 0, 8.1, 0), '#f3eee4'],
    [B(span + 4.8, 0.25, 1.5, 0, 9.1, 0), '#e6dfd2'],
    [B(span + 4.6, 0.2, 1.4, 0, 7.15, 0), '#e6dfd2'],
    [B(4.4, 1.3, 1.0, 0, 9.85, 0), '#f3eee4'],
    [B(4.8, 0.2, 1.2, 0, 10.55, 0), '#a24b2e'],
  );
  for (const z of [0.51, -0.51]) {
    parts.push(
      [new THREE.CylinderGeometry(0.62, 0.62, 0.06, 20).rotateX(Math.PI / 2).translate(0, 9.85, z), '#c9a227'],
      [new THREE.CylinderGeometry(0.5, 0.5, 0.08, 20).rotateX(Math.PI / 2).translate(0, 9.85, z), '#1f3a93'],
      [B(0.36, 0.42, 0.1, 0, 9.88, z), '#f5f0e0'],
    );
  }
  g.add(detail(parts));
  for (const s of [-1, 1]) {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), nightGlow);
    globe.position.set(s * px, 11.1, 0);
    g.add(globe);
  }
  const { tex, aspect } = labelTexture('UNIVERSITY OF GHANA', '#f5c518');
  const signH = 1.4;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(span + 2, signH * aspect), signH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  sign.position.set(0, 8.1, 0.62);
  g.add(sign);
  const back = sign.clone();
  back.position.z = -0.62;
  back.rotation.y = Math.PI;
  g.add(back);
  const motto = labelTexture('INTEGRI PROCEDAMUS', '#1f3a93');
  const mh = 0.5;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(mh * motto.aspect, mh), new THREE.MeshBasicMaterial({ map: motto.tex, transparent: true, side: THREE.DoubleSide }));
  plate.position.set(0, 6.75, 0.5);
  g.add(plate);
  return g;
}

export function buildLandmarks() {
  const group = new THREE.Group();
  const put = (name: string, obj: THREE.Object3D, onRoad = false, dx = 0, dz = 0) => {
    const p = placeByName(name);
    if (!p) return;
    if (onRoad) {
      const r = roadAt(p.x, p.z);
      if (!r) return;
      obj.position.set(r.x, 0, r.z);
      obj.rotation.y = r.angle;
    } else obj.position.set(p.x + dx, 0, p.z + dz);
    group.add(obj);
  };
  // (the Great Hall's clock tower is modelled with the hall, greathall.ts: the owner's Great Hall correction brief has it a
  // rectangular shaft at the upper court's corner)
  // (the main gate is modelled from the owner's photos in gateprecinct.ts: a low through-building, not pillars)
  applyRelief(group);
  return group;
}
