import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const r = await server.ssrLoadModule('/src/game/relief.ts');
for (const z of [-110,-100,-90.6,-80,-70,-60,-55.4,-45,-35,-28]) console.log(z, [-660,-650,-638.7,-622.6,-600,-587,-570.5,-560,-545].map(x=>r.groundHeight(x,z).toFixed(2)).join(' '));
await server.close();
