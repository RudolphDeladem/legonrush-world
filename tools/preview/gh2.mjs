import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const r = await server.ssrLoadModule('/src/game/relief.ts');
const [x0,x1,z0,z1,st] = process.argv.slice(2).map(Number);
for (let z=z0; z<=z1; z+=st) { const row=[]; for (let x=x0;x<=x1;x+=st) row.push(r.groundHeight(x,z).toFixed(1)); console.log(String(z).padStart(5), row.join(' ')); }
await server.close();
