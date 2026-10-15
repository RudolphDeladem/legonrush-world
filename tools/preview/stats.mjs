import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const g = await server.ssrLoadModule('/src/game/ghlplan.ts');
const cm = await server.ssrLoadModule('/src/game/campusmap.ts');
console.log('earth roads', g.EARTH_ROADS.length, g.EARTH_ROADS.map(i=>i+':c'+cm.ROADS[i].cls).join(' '));
const cnt=[0,0,0,0,0,0,0], q=[0,0,0,0]; let n=0;
for (let x=-1993;x<-400;x+=4) for (let z=-712;z<488;z+=4){ if(!g.inGhl(x+2,z+2)) continue; n++; const [c,d]=g.ghCover(x+2,z+2); cnt[c]++; q[d]++; }
console.log('cells', n, 'classes', cnt, 'densequarters', q, 'pale', !!g.PALE);
let t=[0,0,0,0,0,0,0]; for (let x=-744;x<-412;x+=2) for (let z=-248;z<60;z+=2){ t[g.tcCover(x+1,z+1)[0]]++; } console.log('tc', t);
await server.close();
