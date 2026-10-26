import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import viteTsconfigPaths from "vite-tsconfig-paths"
import svgrPlugin from "vite-plugin-svgr"
import { visualizer } from "rollup-plugin-visualizer"
import { VitePWA } from "vite-plugin-pwa"
import circularDependency from "vite-plugin-circular-dependency"
import Beasties from "beasties"
import { contentPlugin } from "./scripts/vite/contentPlugin"
import { cfasyncPlugin } from "./scripts/vite/cfasyncPlugin"

// Critical CSS extraction plugin using Beasties
function beastiesPlugin() {
  return {
    name: "vite-plugin-beasties",
    enforce: "post" as const,
    async transformIndexHtml(html: string) {
      if (process.env.NODE_ENV !== "production") return html
      const beasties = new Beasties({
        inline: true,
        width: 1920,
        height: 1080,
        preload: "media",
        inlineThreshold: 10240,
        pruneSource: false,
        mergeStylesheets: true,
        compress: true,
        logLevel: "warn",
      })
      try {
        return await beasties.process(html)
      } catch (error) {
        console.warn("Beasties failed to process HTML:", error)
        return html
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Help & Guides Markdown (/content) → lazy chunks + bridge/sitemap JSON.
    contentPlugin(),
    // Keep Cloudflare Rocket Loader off our scripts (see the plugin).
    cfasyncPlugin(),
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
        // The SW is intentionally minimal (push + install only) and precaches
        // NOTHING — see src/sw.ts. We inject the smallest possible manifest just
        // to satisfy injectManifest's token requirement; sw.ts filters it to
        // empty. Keeping this to a single tiny file avoids generating a large
        // unused manifest on every build.
        globPatterns: ["favicon.ico"],
        globIgnores: ["**/*.html", "**/*.js", "**/*.css"],
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
      // NOTE: no `workbox` block. `workbox` config only applies to the
      // `generateSW` strategy; with `injectManifest` (above) Vite-PWA ships
      // src/sw.ts verbatim and ignores it entirely. The SW is deliberately
      // asset-transparent (no runtime caching, no navigation cache) — see the
      // header comment in src/sw.ts for why. HTTP caching is handled by
      // public/_headers instead.
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
        manualChunks: {
          // Core framework chunk
          "react-core": ["react", "react-dom", "react-router-dom"],

          // MUI base chunk (styles and system - used everywhere)
          "mui-core": [
            "@mui/material/styles",
            "@mui/system",
            "@emotion/react",
            "@emotion/styled",
          ],

          // MUI common components (frequently used across the app)
          "mui-common": [
            "@mui/material/Button",
            "@mui/material/TextField",
            "@mui/material/Box",
            "@mui/material/Typography",
            "@mui/material/Container",
            "@mui/material/Grid",
            "@mui/material/Paper",
            "@mui/material/Card",
            "@mui/material/CardContent",
            "@mui/material/CardActions",
            "@mui/material/Dialog",
            "@mui/material/DialogTitle",
            "@mui/material/DialogContent",
            "@mui/material/DialogActions",
            "@mui/material/IconButton",
            "@mui/material/Tooltip",
            "@mui/material/CircularProgress",
            "@mui/material/Alert",
            "@mui/material/Snackbar",
          ],

          // MUI data components (data grid and related)
          "mui-data": ["@mui/x-data-grid"],

          // MUI icons (separate chunk for tree-shaking)
          "mui-icons": ["@mui/icons-material"],

          // State management
          redux: ["@reduxjs/toolkit", "react-redux"],

          // Chart libraries (lazy loaded only when needed)
          "charts-mui": ["@mui/x-charts"],
          "charts-kline": ["klinecharts"],

          // Utility libraries
          utils: ["lodash-es"],
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
