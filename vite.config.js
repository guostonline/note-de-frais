import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ command }) => {
  const isSingleFile = process.env.SINGLE_FILE === 'true';

  return {
    base: command === 'build' ? './' : '/',
    plugins: [
      react(),
      ...(command === 'build' && isSingleFile ? [viteSingleFile()] : [])
    ],
    server: {
      port: 3000,
      open: true
    }
  };
});

