import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: './public',
  build: {
    outDir: '../public',
  },
  plugins: [react()],
});
