// The selected character on foot (the owner's Volume A section 2): the same look as the rider (skin, body, outfit and
// colour, hair or helmet, backpack), standing and walking, as one figure the game moves while the bike stays parked.
import * as THREE from 'three';
import type { RiderLook } from './models';

export interface WalkerFigure {
  root: THREE.Group;
  setLook(look: RiderLook): void;
  /** phase: radians of the stride; amount 0 (standing) .. 1 (walking) */
  pose(phase: number, amount: number): void;
}

export function buildWalker(): WalkerFigure {
  const root = new THREE.Group();
  root.name = 'walker';
  const m = (color: string, rough = 0.65) => new THREE.MeshStandardMaterial({ color, roughness: rough });
  const skin = m('#7a4b2e', 0.55), shirt = m('#c8102e', 0.6), shorts = m('#1c2433'), shoe = m('#22252b'), hair = m('#15100d', 0.95), helmet = m('#f5c518', 0.3), pack = m('#2c3440');
  const mesh = (g: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = root) => { const o = new THREE.Mesh(g, mat); o.castShadow = true; parent.add(o); return o; };
  // the body faces -z, as the rider does
  const torso = mesh(new THREE.CapsuleGeometry(0.17, 0.42, 6, 14).translate(0, 1.22, 0), shirt);
  const neck = mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 10).translate(0, 1.58, 0), skin);
  const head = mesh(new THREE.SphereGeometry(0.115, 16, 12).scale(1, 1.12, 1.05).translate(0, 1.72, 0), skin);
  const hairCap = mesh(new THREE.SphereGeometry(0.12, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55).translate(0, 1.74, 0.005), hair);
  const bun = mesh(new THREE.SphereGeometry(0.06, 10, 8).translate(0, 1.79, 0.11), hair);
  const helm = mesh(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.9, 1.15).translate(0, 1.76, 0.01), helmet);
  const bag = mesh(new THREE.BoxGeometry(0.3, 0.36, 0.14).translate(0, 1.25, 0.22), pack);
  // hips and shorts
  mesh(new THREE.CapsuleGeometry(0.16, 0.08, 4, 12).scale(1, 0.8, 0.85).translate(0, 0.94, 0), shorts);
  const legs: THREE.Group[] = [], arms: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.09, 0.92, 0); root.add(hip);
    mesh(new THREE.CapsuleGeometry(0.07, 0.24, 4, 10).translate(0, -0.18, 0), shorts, hip);
    mesh(new THREE.CapsuleGeometry(0.055, 0.36, 4, 10).translate(0, -0.6, 0), skin, hip);
    mesh(new THREE.BoxGeometry(0.1, 0.07, 0.24).translate(0, -0.88, -0.04), shoe, hip);
    legs.push(hip);
    const sh = new THREE.Group(); sh.position.set(s * 0.22, 1.45, 0); root.add(sh);
    mesh(new THREE.CapsuleGeometry(0.055, 0.14, 4, 10).translate(0, -0.1, 0), shirt, sh);
    mesh(new THREE.CapsuleGeometry(0.042, 0.42, 4, 10).translate(0, -0.42, 0), skin, sh);
    arms.push(sh);
  }
  const fig: WalkerFigure = {
    root,
    setLook(l) {
      skin.color.set(l.skin);
      shirt.color.set(l.outfit === 'kente' ? '#d6a21e' : l.jersey);
      const w = { slim: 0.9, regular: 1, broad: 1.15 }[l.body] * (l.gender === 'female' ? 0.94 : 1);
      torso.scale.set(w, 1, w);
      const has = (a: string) => l.accessories.includes(a);
      helm.visible = has('helmet'); helmet.color.set(l.helmet);
      hairCap.visible = !has('helmet');
      bun.visible = l.gender === 'female' && !has('helmet');
      bag.visible = has('backpack');
      void neck; void head;
    },
    pose(phase, amount) {
      const a = Math.sin(phase) * 0.5 * amount;
      legs[0].rotation.x = a; legs[1].rotation.x = -a;
      arms[0].rotation.x = -a * 0.8; arms[1].rotation.x = a * 0.8;
      root.children[0].position.y = Math.abs(Math.cos(phase)) * 0.025 * amount;
    },
  };
  return fig;
}
