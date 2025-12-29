import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import viteTsconfigPaths from "vite-tsconfig-paths"
import svgrPlugin from "vite-plugin-svgr"
import { visualizer } from "rollup-plugin-visualizer"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    VitePWA({
      registerType: "prompt", // Use prompt so we can handle registration manually for better control
      injectRegister: false, // Disable auto-injection since we're handling registration manually
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "homepage-preview.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ],
      manifest: {
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
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Market",
            short_name: "Market",
            description: "Browse market listings",
            url: "/market",
            icons: [
              { src: "/android-chrome-192x192.png", sizes: "192x192" },
            ],
          },
          {
            name: "Contracts",
            short_name: "Contracts",
            description: "View contracts",
            url: "/contracts",
            icons: [
              { src: "/android-chrome-192x192.png", sizes: "192x192" },
            ],
          },
        ],
        categories: ["games", "shopping", "social"],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff,ttf}"],
        // In dev mode, don't precache to avoid issues with Vite's HMR
        ...(import.meta.env.DEV
          ? {
              // Skip precaching in dev - let Vite handle it
              globIgnores: ["**/*"],
            }
          : {}),
        runtimeCaching: [
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
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600, // 1 hour
              },
              networkTimeoutSeconds: 10,
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
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        // Only use offline fallback in production
        // In dev mode, don't intercept navigation - let Vite handle it
        navigateFallback: import.meta.env.DEV ? undefined : "/offline.html",
        navigateFallbackDenylist: [/^\/api/, /^\/_/, /^\/sw\.js/, /^\/dev-sw/, /^\/vite/, /^\/@/],
      },
      devOptions: {
        enabled: false, // Disable in dev to prevent offline page from showing
        // Set to true only when you specifically want to test PWA features
        type: "module",
        navigateFallback: undefined,
        suppressWarnings: true,
        disableDevLogs: true,
      },
    }),
    // Only enable bundle visualizer when ANALYZE_BUNDLE env var is set
    ...(process.env.ANALYZE_BUNDLE === "true"
      ? [
          visualizer({
            open: true,
            filename: "dist/stats.html",
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // 1MB limit
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          // Redux toolkit
          redux: ["@reduxjs/toolkit", "react-redux"],
          // Utility libraries
          utils: ["moment", "lodash"],
          // Data grid
          dataGrid: ["@mui/x-data-grid"],
          // Chart libraries
          charts: ["react-apexcharts", "apexcharts", "klinecharts"],
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
})
