import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'GameVault Library',
        short_name: 'GameVault',
        description: 'Personal Game Library Manager',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Smart caching: Only cache HIGH-RES covers of games in library
        // Excludes: blur placeholders, search thumbnails
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              // Only cache images.weserv.nl
              if (!url.hostname.includes('weserv.nl')) return false;

              // Exclude blur placeholders (blur=10 or w=40)
              const params = url.searchParams;
              if (params.has('blur') || params.get('w') === '40') return false;

              return true;
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'library-covers',
              expiration: {
                maxEntries: 30, // Last 30 viewed games (~6MB)
                maxAgeSeconds: 60 * 60 * 24 * 14 // 2 weeks
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill for libraries that expect Node.js global (like howlongtobeat)
    global: 'globalThis',
  },
}));
