// the bowl slope's top edge inside the main-gate ring, along z: node .preview/bowl.mjs
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const C = await server.ssrLoadModule('/src/game/cutplan.ts');
  for (let z = 100; z <= 152; z += 2) {
    const w = C.wallW(z); let top = null, first = null;
    for (let x = w - 12; x <= w + 0.5; x += 0.1) { const d = C.cutDrop(x, z); if (d > 0.05 && first === null) first = x; }
    console.log(z, 'wallW', w.toFixed(2), 'slopeTop', first && first.toFixed(2), 'onSlope', C.onBowlSlope(w - 0.6, z), 'deck', !!C.deckAt(w - 1, z), 'drop@w-0.6', C.cutDrop(w - 0.6, z).toFixed(2));
  }
} finally { await server.close(); }
