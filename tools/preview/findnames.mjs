import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const M = await server.ssrLoadModule('/src/game/campusmap.ts');
  const re = new RegExp(process.argv[2], 'i');
  M.BUILDINGS.forEach((b, i) => { if (b.name && re.test(b.name)) { const p = b.pts; let cx=0,cz=0,n=p.length/2; for(let j=0;j<p.length;j+=2){cx+=p[j];cz+=p[j+1];} console.log('B', i, b.name, (cx/n).toFixed(1), (cz/n).toFixed(1), b.levels ?? '', b.h ?? ''); } });
  for (const k of Object.keys(M)) if (Array.isArray(M[k]) && k !== 'BUILDINGS') { M[k].forEach((o) => { if (o && typeof o === 'object' && o.name && re.test(o.name)) console.log(k, o.name, JSON.stringify(o).slice(0, 160)); }); }
} finally { await server.close(); }
