import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        agriculture: resolve(__dirname, 'agriculture/index.html'),
        industrial: resolve(__dirname, 'industrial/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        apps: resolve(__dirname, 'apps/index.html'),
        attendy: resolve(__dirname, 'apps/attendy/index.html'),
        sudoku: resolve(__dirname, 'apps/sudoku-master-pro/index.html'),
        callassistant: resolve(__dirname, 'apps/call-assistant/index.html'),
      },
    },
  },
});