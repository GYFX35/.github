import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
      },
      manifest: {
        name: 'AI Model Development Assistant',
        short_name: 'AI Assistant',
        description: 'An AI assistant to help with developing and training AI models.',
        theme_color: '#000000',
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
         }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
