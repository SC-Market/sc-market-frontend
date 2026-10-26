import { readdirSync } from "node:fs"
import path from "node:path"
import { defineConfig } from "vite"
import { reactRouter } from "@react-router/dev/vite"
import viteTsconfigPaths from "vite-tsconfig-paths"
import svgrPlugin from "vite-plugin-svgr"
import { visualizer } from "rollup-plugin-visualizer"
import circularDependency from "vite-plugin-circular-dependency"
import { contentPlugin } from "./scripts/vite/contentPlugin"

// React Router framework mode (react-router.config.ts): `react-router build`
// runs this config twice, for the client (build/client) and for the
// build-time server render (build/server). scripts/build/finalize.ts then
// lays build/client out as dist/ and builds the service worker.
//
// No PWA plugin: the service worker (src/sw.ts) is push-only and precaches
// nothing, so it is built on its own (scripts/build/finalize.ts) and the web
// manifest is a static file (public/manifest.webmanifest).
//
// Every route module (src/routes.ts) goes into ONE chunk. They're tiny, and
// entry.client.tsx imports all of them up front (React Router must never
// fetch a route module itself: src/routes/routeModules.ts), so one chunk
// instead of ~160 is one request on the first page load. The pages they load
// stay code-split.
const ROUTE_MODULES = new Set(
  ["layouts", "pages", "elements"].flatMap((dir) =>
    readdirSync(path.resolve(import.meta.dirname, "src/routes", dir))
      .filter((file) => file.endsWith(".tsx"))
      .map((file) =>
        path.resolve(import.meta.dirname, "src/routes", dir, file),
      ),
  ),
)

// https://vitejs.dev/config/
export default defineConfig(({ command, isSsrBuild }) => ({
  plugins: [
    // Help & Guides Markdown (/content) → lazy chunks + bridge/sitemap JSON.
    contentPlugin(),
    reactRouter(),
    viteTsconfigPaths(),
    svgrPlugin(),
    // Circular dependency detection - reports circular imports in build output
    // Note: Only enable when needed for analysis, as it can cause performance issues
    ...(process.env.CHECK_CIRCULAR === "true"
      ? [
          circularDependency({
            circleImportThrowErr: false, // Don't fail build, just warn
            outputFilePath: "./build/circular-dependencies.txt",
          }),
        ]
      : []),
    // Bundle analysis visualization of the client build (dist/stats.html).
    ...(isSsrBuild
      ? []
      : [
          visualizer({
            open: process.env.ANALYZE_BUNDLE === "true", // Only auto-open when explicitly requested
            filename: "build/stats.html",
            gzipSize: true,
            brotliSize: true,
            template: "treemap", // Use treemap for better visualization
          }),
        ]),
  ],
  build: isSsrBuild
    ? {}
    : {
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
              // The route modules (see ROUTE_MODULES).
              if (ROUTE_MODULES.has(id)) return "routes"
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
              if (/^@mui\/(x-data-grid|x-virtualizer)$/.test(pkg))
                return "mui-data"
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
  // The build-time render (entry.server.tsx) runs the server build on Node:
  // bundle every dependency into it instead of importing them from
  // node_modules, where some only resolve through a bundler (e.g.
  // "date-fns/locale", a directory import). The dev server's module runner
  // can't evaluate bundled CommonJS, so dev keeps Vite's default.
  ssr: command === "build" ? { noExternal: true } : {},
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
}))
