// rebuilds the service worker of dist/ with a changed precached file (the update test's build B)
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const v = process.argv[2];
const body = `<svg xmlns="http://www.w3.org/2000/svg"><!--${v}--></svg>`;
writeFileSync('dist/_stamp.svg', body);
const rev = createHash('md5').update(body).digest('hex');
let sw = readFileSync('dist/sw.js', 'utf8');
sw = /_stamp\.svg/.test(sw) ? sw.replace(/\{url:"_stamp\.svg",revision:"[0-9a-f]+"\}/, `{url:"_stamp.svg",revision:"${rev}"}`) : sw.replace(/\[\{url:/, `[{url:"_stamp.svg",revision:"${rev}"},{url:`);
writeFileSync('dist/sw.js', sw);
