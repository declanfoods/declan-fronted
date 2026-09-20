import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(), 
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        navigateFallback: '/index.html',
      },
    }),
  ],
  server: {
    port: 5173,
  },
});