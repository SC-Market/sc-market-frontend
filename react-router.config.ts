import type { Config } from "@react-router/dev/config"

/**
 * React Router framework mode, SPA (docs/ssr-migration-design.md, Phase 2).
 *
 * `ssr: false`: no server at runtime. `react-router build` renders the root
 * route once to build/client/index.html, the HTML shell Cloudflare Pages
 * serves for every app path (public/_redirects). scripts/build/finalize.ts
 * then lays build/client out as dist/, which is what Pages deploys.
 */
export default {
  appDirectory: "src",
  buildDirectory: "build",
  ssr: false,
} satisfies Config
