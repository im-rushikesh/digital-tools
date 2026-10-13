import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        apps: resolve(__dirname, 'apps/index.html'),
        attendy: resolve(__dirname, 'apps/attendy/index.html'),
        sudoku: resolve(__dirname, 'apps/sudoku-master-pro/index.html'),
        legal: resolve(__dirname, 'legal/index.html'),
        deletion: resolve(__dirname, 'legal/deletion/index.html'),
      },
    },
  },
});