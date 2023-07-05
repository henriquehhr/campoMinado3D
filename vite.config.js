import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  build: {
    target: 'esnext'
  },
  esbuild: {
    supported: {
      'top-level-await': true
    },
  },
  plugins: [svelte()],
});