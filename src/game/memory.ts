// Keeping the campus inside a phone's memory (the owner: phones never opened the game, "A problem repeatedly occurred",
// and laptops showed "Page Unresponsive" while it loaded). Measured before: about 0.9 GB of vertex arrays held twice (in
// JavaScript and on the GPU) and 1,176 textures (about 0.5 GB), many of them identical facade pictures.
// - compactGeometry: normals as signed bytes and colours as unsigned bytes (normalised), not 32-bit floats: the same
//   pictures for a third of the memory per vertex attribute;
// - freeAfterUpload: once a buffer is on the GPU its JavaScript copy is dropped, except for what the bike's collision grid
//   still reads (meshcollide.ts); bounds are computed first (culling needs them). A lost GPU context reloads the page.
// - (textures: on phones every large procedural picture is kept at half size where it is drawn, lite.ts)
import * as THREE from 'three';
import { collisionGeometries } from './meshcollide';

const seen = new WeakMap<THREE.BufferAttribute, THREE.BufferAttribute>();
function compactAttr(a: THREE.BufferAttribute, kind: 'normal' | 'color') {
  const done = seen.get(a);
  if (done) return done;
  const src = a.array as Float32Array;
  if (!(src instanceof Float32Array) || a.itemSize < 3) return a;
  let out: THREE.BufferAttribute;
  if (kind === 'normal') {
    const q = new Int8Array(src.length);
    for (let i = 0; i < src.length; i++) q[i] = Math.max(-127, Math.min(127, Math.round(src[i] * 127)));
    out = new THREE.BufferAttribute(q, a.itemSize, true);
  } else {
    for (let i = 0; i < src.length; i++) if (src[i] < 0 || src[i] > 1.0001) return a; // (bright colours above 1 stay floats)
    const q = new Uint8Array(src.length);
    for (let i = 0; i < src.length; i++) q[i] = Math.round(src[i] * 255);
    out = new THREE.BufferAttribute(q, a.itemSize, true);
  }
  seen.set(a, out);
  return out;
}

/** normals and colours of every static mesh under `root` as bytes */
export function compactGeometry(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry || m.userData.dynamic) return;
    const g = m.geometry;
    for (const k of ['normal', 'color'] as const) {
      const a = g.getAttribute(k) as THREE.BufferAttribute | undefined;
      if (a && (a as THREE.BufferAttribute).isBufferAttribute && !(a as unknown as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute) {
        const c = compactAttr(a, k);
        if (c !== a) g.setAttribute(k, c);
      }
    }
  });
}

/** drop the JavaScript copy of each static buffer once the GPU has it (bounds kept; the collision grid's sources kept) */
export function freeAfterUpload(root: THREE.Object3D) {
  const keep = collisionGeometries();
  const drop = function (this: THREE.BufferAttribute) { (this as unknown as { array: unknown }).array = null; };
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry || m.userData.dynamic) return;
    const g = m.geometry;
    // (the collision grid reads only positions, colours and the index: the rest of its sources' buffers go too)
    if (keep.has(g)) {
      for (const k of ['normal', 'uv']) { const a = g.getAttribute(k) as THREE.BufferAttribute | undefined; if (a?.isBufferAttribute) a.onUpload(drop); }
      return;
    }
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (!g.boundingBox) g.computeBoundingBox();
    if ((m as THREE.InstancedMesh).isInstancedMesh) { const im = m as THREE.InstancedMesh; if (!im.boundingSphere) im.computeBoundingSphere(); return; }
    for (const a of Object.values(g.attributes)) if ((a as THREE.BufferAttribute).isBufferAttribute && !(a as THREE.BufferAttribute).onUploadCallback?.name?.includes('drop')) (a as THREE.BufferAttribute).onUpload(drop);
    if (g.index) g.index.onUpload(drop);
  });
}
