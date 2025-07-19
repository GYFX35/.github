import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update PWA when new content is available
      injectRegister: 'auto', // or 'script' or 'inline' or null
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'], // Cache these file types
        runtimeCaching: [ // Example: Cache API calls (if any) - adjust as needed
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openai-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 1 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'AI Video Content Generator',
        short_name: 'AIVidGen',
        description: 'An AI-powered application to generate scripts for educational videos.',
        theme_color: '#ffffff', // Example: white
        background_color: '#ffffff', // Example: white
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png', // For maskable icon
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
      },
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
