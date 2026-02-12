import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import viteTsconfigPaths from "vite-tsconfig-paths"
import svgrPlugin from "vite-plugin-svgr"
import { visualizer } from "rollup-plugin-visualizer"
import { VitePWA } from "vite-plugin-pwa"
import circularDependency from "vite-plugin-circular-dependency"
import Beasties from "beasties"

// Critical CSS extraction plugin using Beasties
function beastiesPlugin() {
  return {
    name: 'vite-plugin-beasties',
    enforce: 'post' as const,
    async transformIndexHtml(html: string) {
      if (process.env.NODE_ENV !== 'production') return html
      const beasties = new Beasties({
        inline: true,
        width: 1920,
        height: 1080,
        preload: 'media',
        inlineThreshold: 10240,
        pruneSource: false,
        mergeStylesheets: true,
        compress: true,
        logLevel: 'warn',
      })
      try {
        return await beasties.process(html)
      } catch (error) {
        console.warn('Beasties failed to process HTML:', error)
        return html
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    // Circular dependency detection - reports circular imports in build output
    // Note: Only enable when needed for analysis, as it can cause performance issues
    ...(process.env.CHECK_CIRCULAR === "true"
      ? [
          circularDependency({
            circleImportThrowErr: false, // Don't fail build, just warn
            outputFilePath: "./dist/circular-dependencies.txt",
          }),
        ]
      : []),
    VitePWA({
      registerType: "prompt", // Use prompt so we can handle registration manually for better control
      injectRegister: false, // Disable auto-injection since we're handling registration manually
      // Use injectManifest to allow custom push notification handlers
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts", // Our custom service worker file (TypeScript)
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}"],
        globIgnores: ["**/stats.html"], // Exclude bundle analysis report
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "homepage-preview.webp",
        "android-splash-1080x1920.webp",
        "android-chrome-192x192.png",
        "android-chrome-192x192-safe.png",
        "android-chrome-512x512.png",
        "android-chrome-512x512-safe.png",
        "android-chrome-512x512-maskable.png",
      ],
      manifest: {
        id: "space.sc-market.app",
        name: "SC Market - Star Citizen Marketplace",
        short_name: "SC Market",
        description:
          "Buy, sell, and trade Star Citizen items and services. Connect with players, manage contracts, and browse the marketplace.",
        theme_color: "#111828",
        background_color: "#111828",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        prefer_related_applications: false,
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-192x192-safe.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512-safe.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
        ],
        shortcuts: [
          {
            name: "Market",
            short_name: "Market",
            description: "Browse market listings",
            url: "/market",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Services",
            short_name: "Services",
            description: "Browse contractor services",
            url: "/market/services",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Messages",
            short_name: "Messages",
            description: "View messages",
            url: "/messages",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Contracts",
            short_name: "Contracts",
            description: "View contracts",
            url: "/contracts",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "My Orders",
            short_name: "Orders",
            description: "View my orders",
            url: "/orders",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "View dashboard",
            url: "/dashboard",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Recruiting",
            short_name: "Recruiting",
            description: "Browse recruiting posts",
            url: "/recruiting",
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
        ],
        categories: ["games", "shopping", "social"],
        // PWA Widgets - uses existing frontend routes
        widgets: [
          {
            name: "Recent Orders",
            short_name: "Orders",
            description: "View your recent orders",
            tag: "recent-orders",
            template: "/widget/orders", // Use existing frontend route
            ms_ac_template: "/widget/orders", // Windows-specific
            data: "/api/orders/user/data", // Use existing backend endpoint
            type: "application/json",
            update: 300000, // Update every 5 minutes
            icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}"],
        runtimeCaching: [
          // Cache navigation requests (page loads) with NetworkFirst
          // If network fails, serve from cache (if available) or let the request fail normally
          // Never show offline.html page
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-v1",
              expiration: {
                maxEntries: 100, // Increased from 50
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days (increased from 1 day)
                purgeOnQuotaError: true,
              },
              networkTimeoutSeconds: 3, // Faster timeout for better perceived performance
              cacheableResponse: {
                statuses: [0, 200], // Only cache successful responses
              },
            },
          },
          {
            // Cache API calls - match backend API domain and exclude sensitive endpoints
            urlPattern: ({ url }) => {
              const isApiCall =
                url.hostname.includes("sc-market.space") ||
                url.hostname.includes("localhost")
              const isApiPath = url.pathname.startsWith("/api/")
              const isExcluded =
                url.pathname.includes("/auth/") ||
                url.pathname.includes("/register") ||
                url.pathname.includes("/login") ||
                url.pathname.includes("/logout") ||
                url.pathname.includes("/ws") ||
                url.pathname.includes("/admin/") ||
                url.pathname.includes("/payment")

              // Allow http: in development (localhost) and https: in production
              const isSecure =
                url.protocol === "https:" ||
                (url.protocol === "http:" &&
                  (url.hostname === "localhost" ||
                    url.hostname === "127.0.0.1"))

              return isApiCall && isApiPath && !isExcluded && isSecure
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache-v1",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24,
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-v1",
              expiration: {
                maxEntries: 500, // Increased from 200
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days (increased from 7 days)
                purgeOnQuotaError: true,
              },
            },
          },
          {
            // Cache fonts aggressively (they rarely change)
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-v1",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                purgeOnQuotaError: true,
              },
            },
          },
          {
            // Cache CSS and JS with StaleWhileRevalidate for better updates
            urlPattern: /\.(?:css|js)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets-v1",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                purgeOnQuotaError: true,
              },
            },
          },
        ],
        // Completely disable navigateFallback - never show offline page
        navigateFallback: undefined,
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/_/,
          /^\/sw\.js/,
          /^\/dev-sw/,
          /^\/vite/,
          /^\/@/,
          /^\/manifest/,
          /^\/workbox/,
          /.*/, // Deny all paths - never use offline fallback
        ],
      },
      devOptions: {
        enabled: false, // Disable in dev to prevent offline page from showing
        // Set to true only when you specifically want to test PWA features
        type: "module",
        navigateFallback: undefined,
        suppressWarnings: true,
        disableDevLogs: true,
        // Use injectManifest in dev if needed for testing
        // For now, we'll use generateSW in dev and injectManifest in prod
      },
    }),
    // Bundle analysis visualization - always generate report
    visualizer({
      open: process.env.ANALYZE_BUNDLE === "true", // Only auto-open when explicitly requested
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // Use treemap for better visualization
    }),
    // Critical CSS extraction for production builds
    beastiesPlugin(),
  ],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 200, // 200KB limit for optimal HTTP/2 multiplexing
    rollupOptions: {
      output: {
        // Consistent chunk file naming with content hashes for optimal caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          // Vendor dependencies - split by library
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core'
            }
            // MUI utilities must be checked before @mui/material to avoid splitting
            if (id.includes('@mui/utils') || id.includes('@mui/base')) {
              return 'mui-core'
            }
            if (id.includes('@mui/material/styles') || id.includes('@mui/system') || 
                id.includes('@emotion')) {
              return 'mui-core'
            }
            if (id.includes('@mui/material')) {
              return 'mui-common'
            }
            if (id.includes('@mui/x-data-grid')) {
              return 'mui-data'
            }
            if (id.includes('@mui/x-date-pickers')) {
              return 'mui-date-pickers'
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons'
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux'
            }
            if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
              return 'charts-apex'
            }
            if (id.includes('klinecharts')) {
              return 'charts-kline'
            }
            if (id.includes('lodash-es')) {
              return 'utils'
            }
          }
          
          // Market features in separate bundle (code only, not dependencies)
          if (id.includes('/features/market/')) {
            // Market listings and forms
            if (id.includes('/listings/') || id.includes('ListingForm') || id.includes('ListingCard')) {
              return 'market-listings'
            }
            // Market stock management
            if (id.includes('/stock/') || id.includes('Stock')) {
              return 'market-stock'
            }
            // Market allocation
            if (id.includes('/allocation/')) {
              return 'market-allocation'
            }
            // Market search and filters
            if (id.includes('Search') || id.includes('Sidebar') || id.includes('Filter')) {
              return 'market-search'
            }
            // Everything else in market (API, types, hooks, smaller components)
            return 'market-core'
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
    ],
  },
  server: {
    host: "0.0.0.0", // Listen on all network interfaces
    port: 5173,
    watch: {
      ignored: ["**/node_modules/**"],
    },
  },
})
