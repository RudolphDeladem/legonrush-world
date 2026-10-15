import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const m = await server.ssrLoadModule('/src/game/relief.ts');
const f = m.groundHeight ?? m.heightAt ?? m.reliefAt;
console.log(Object.keys(m).join(','));
for (const [x,z] of process.argv.slice(2).map(s=>s.split(',').map(Number))) console.log(x,z, f ? f(x,z) : 'n/a');
await server.close();
