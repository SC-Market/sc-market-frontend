import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import viteTsconfigPaths from "vite-tsconfig-paths"
import svgrPlugin from "vite-plugin-svgr"
import { visualizer } from "rollup-plugin-visualizer"
import { VitePWA } from "vite-plugin-pwa"
import circularDependency from "vite-plugin-circular-dependency"
import { contentPlugin } from "./scripts/vite/contentPlugin"
import { cfasyncPlugin } from "./scripts/vite/cfasyncPlugin"
import { inlineEntryCssPlugin } from "./scripts/vite/inlineEntryCssPlugin"

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
    // Inline the small entry stylesheet (no render-blocking request)
    inlineEntryCssPlugin(),
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
        // Function form, not the object form: an object entry pulls the
        // listed package AND every not-yet-assigned dependency into its chunk.
        // That put ~100 KB of shared @mui/material code into "mui-data" (via
        // @mui/x-data-grid) and some shared code into "charts-mui", so the entry
        // statically imported both and every page preloaded and executed the
        // DataGrid (508 KB) and x-charts (351 KB) chunks. Here each package is
        // named explicitly; anything unlisted (e.g. @mui/icons-material) goes
        // with the chunks that use it.
        manualChunks(id: string) {
          const m = id.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)\//)
          if (!m) return undefined
          const pkg = m[1]
          if (
            /^(react|react-dom|scheduler|react-router|react-router-dom|use-sync-external-store)$/.test(
              pkg,
            )
          )
            return "react-core"
          // MUI styling engine (used everywhere). Never imports @mui/material,
          // so mui-common -> mui-core is one-way (no chunk cycle). Small
          // helpers shared by the entry AND the lazy x-* chunks live here too:
          // Rollup moves an unassigned dependency of a manual chunk INTO that
          // chunk, and the entry then has to import (and preload) e.g. the
          // whole DataGrid chunk just to reach @babel/runtime.
          if (
            /^(@emotion\/.+|@mui\/(system|utils|styled-engine|private-theming|x-internals)|stylis|clsx|prop-types|react-is|hoist-non-react-statics|@babel\/runtime)$/.test(
              pkg,
            )
          )
            return "mui-core"
          // All of @mui/material: ~90% of it is on every page's critical path
          // anyway, and keeping it in one chunk avoids cycles between chunks.
          if (
            /^(@mui\/material|react-transition-group|@popperjs\/core)$/.test(
              pkg,
            )
          )
            return "mui-common"
          // MUI data grid (lazy routes only)
          if (/^@mui\/(x-data-grid|x-virtualizer)$/.test(pkg)) return "mui-data"
          // State management
          if (
            /^(@reduxjs\/toolkit|react-redux|redux|redux-thunk|reselect|immer)$/.test(
              pkg,
            )
          )
            return "redux"
          // Chart libraries (lazy loaded only when needed)
          if (
            /^(@mui\/x-charts|@mui\/x-internal-gestures|d3-.+|internmap|bezier-easing|flatqueue)$/.test(
              pkg,
            )
          )
            return "charts-mui"
          if (pkg === "klinecharts") return "charts-kline"
          // Utility libraries
          if (pkg === "lodash-es") return "utils"
          return undefined
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
