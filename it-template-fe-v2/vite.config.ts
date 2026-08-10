import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// ----------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 80,
    host: true,
  },
});
