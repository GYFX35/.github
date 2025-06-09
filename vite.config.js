import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Global Games Social Network',
        short_name: 'GamesNetwork',
        description: 'A social network for game developers, players, and researchers.',
        theme_color: '#ffffff',
        background_color: '#000000',
        icons: [
          {
            src: 'logo192.png', // Path relative to the public directory
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png', // Path relative to the public directory
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // Added this line
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkOnly', // Try network first
            options: {
              precacheFallback: {
                fallbackURL: 'offline.html' // Serve offline.html if network fails
              }
            }
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
