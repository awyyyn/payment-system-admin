import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import path from 'node:path';
import { createRequire } from 'node:module';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const require = createRequire(import.meta.url);
const standardFontsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts');


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
         targets: [
           {
             src: standardFontsDir,
             dest: '',
           },
         ],
       }),
  ],
})

