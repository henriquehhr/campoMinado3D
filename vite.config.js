import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    polyfillDynamicImport: false,
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.ts',
    },
  },
});