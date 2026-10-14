// marked views: draws a red outline round chosen building footprints and shoots each camera: node .preview/qshoot.mjs outdir '[{"name","cam","ids"}]'
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const out = process.argv[2];
const FP = {
  13: [2375.3,-1259.3,2379.6,-1258.9,2378.5,-1245,2374.2,-1245.3],
  3039: [2379.7,-1241,2381.1,-1256.8,2390.8,-1257.4,2389.6,-1240.2],
  3038: [2393.7,-1236.6,2393.8,-1255.2,2404.5,-1254.3,2403.7,-1235.9],
  116: [2409.6,-943.2,2419.4,-942.9,2420,-962.9,2422.4,-962.8,2422.3,-960,2429.9,-959.8,2429.1,-938,2409.5,-938.6],
  1896: [2448.8,-1196.2,2439.4,-1196.6,2440.4,-1218.8,2449.8,-1218.4],
};
const VIEWS = JSON.parse(process.argv[3]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
await page.goto(`http://localhost:5299/.preview/halls.html?${VIEWS[0].cam}`, { timeout: 600000 });
await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
const meta = {};
for (const v of VIEWS) {
  await page.evaluate((n) => window.__view(n), v.cam);
  const labels = await page.evaluate(async ({ FP, ids }) => {
    const T = await import('/node_modules/.vite/deps/three.js');
    const sc = window.__scene, cam = window.__cam;
    (window.__marks || []).forEach((m) => sc.remove(m));
    window.__marks = [];
    const rc = new T.Raycaster();
    const res = {};
    for (const id of ids) {
      const p = FP[id]; const n = p.length / 2;
      let cx = 0, cz = 0; for (let i = 0; i < n; i++) { cx += p[2 * i] / n; cz += p[2 * i + 1] / n; }
      rc.set(new T.Vector3(cx, 300, cz), new T.Vector3(0, -1, 0));
      const hits = rc.intersectObjects(sc.children, true).filter((h) => h.object.isMesh && h.object.visible);
      const top = hits.length ? hits[0].point.y : 0, ground = hits.length ? hits[hits.length - 1].point.y : 0;
      const mat = new T.MeshBasicMaterial({ color: 0xff1010, depthTest: false, transparent: true, opacity: 0.95 });
      const g = new T.Group(); g.renderOrder = 999;
      const bar = (a, b, r) => { const d = b.clone().sub(a); const m = new T.Mesh(new T.CylinderGeometry(r, r, d.length(), 6), mat);
        m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); m.renderOrder = 999; g.add(m); };
      const r = Math.max(0.12, cam.position.distanceTo(new T.Vector3(cx, top, cz)) * 0.0022);
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        for (const y of [ground + 0.2, top + 0.2]) bar(new T.Vector3(p[2 * i], y, p[2 * i + 1]), new T.Vector3(p[2 * j], y, p[2 * j + 1]), r);
        bar(new T.Vector3(p[2 * i], ground, p[2 * i + 1]), new T.Vector3(p[2 * i], top + 0.2, p[2 * i + 1]), r);
      }
      sc.add(g); window.__marks.push(g);
      const s = new T.Vector3(cx, top + 4, cz).project(cam);
      res[id] = { x: (s.x + 1) / 2 * innerWidth, y: (1 - s.y) / 2 * innerHeight, vis: s.z < 1 && Math.abs(s.x) < 1 && Math.abs(s.y) < 1, top: top - ground };
    }
    window.__r.render(sc, cam);
    return res;
  }, { FP, ids: v.ids });
  await page.screenshot({ path: `${out}/${v.name}.png`, timeout: 300000 });
  meta[v.name] = labels; console.log(v.name, JSON.stringify(labels));
}
writeFileSync(`${out}/meta.json`, JSON.stringify(meta));
await browser.close();
