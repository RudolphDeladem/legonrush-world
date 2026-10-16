import { defineConfig } from 'vite';
import { resolve } from 'node:path';
// a production bundle of the preview test pages (the dev server's thousands of modules are too slow in software GL)
export default defineConfig({
  base: '/',
  build: { outDir: resolve(process.cwd(), '.preview/dist'), emptyOutDir: true, chunkSizeWarningLimit: 9000, minify: false,
    rollupOptions: { input: { walk: resolve(process.cwd(), ".preview/walk.html") } } },
});
