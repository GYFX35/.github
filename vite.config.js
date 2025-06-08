import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'Octocat.png', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Global Health Social Network',
        short_name: 'HealthNet',
        description: 'A social network for global health and wellbeing promotion.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'Octocat.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any maskable'
         }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
