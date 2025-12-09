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
        runtimeCaching: [
          // Priority 1: Optimized images via weserv.nl (our CDN proxy)
          {
            urlPattern: /^https:\/\/images\.weserv\.nl\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'weserv-optimized-images',
              expiration: {
                maxEntries: 50, // Reduced: 50 games × ~200KB each = ~10MB
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days (longer since optimized)
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Priority 2: SteamGridDB (original covers - only cache small thumbs)
          {
            urlPattern: /^https:\/\/cdn\.steamgriddb\.com\/.*/i,
            handler: 'NetworkFirst', // Prefer network to avoid stale data
            options: {
              cacheName: 'steamgrid-images',
              expiration: {
                maxEntries: 20, // Reduced from 100
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days (short cache)
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Priority 3: RAWG (metadata images - low priority)
          {
            urlPattern: /^https:\/\/media\.rawg\.io\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rawg-images',
              expiration: {
                maxEntries: 10, // Reduced from 100
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
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
