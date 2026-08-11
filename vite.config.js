import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react(), ...(command === 'build' ? [viteSingleFile()] : [])],
  server: {
    port: 3000,
    open: true
  }
}));
