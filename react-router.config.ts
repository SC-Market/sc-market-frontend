import path from "node:path"
import type { Config } from "@react-router/dev/config"
import { GAME_DATA_HUB_PATHS, HOME_PATH } from "./src/prerender/paths"
import { contentPathsFromDisk } from "./src/prerender/contentPaths.node"

/**
 * React Router framework mode (docs/ssr-migration-design.md, Phases 2–3).
 *
 * `ssr: false`: no server at runtime. `react-router build` renders the root
 * route once to build/client/__spa-fallback.html, the HTML shell Cloudflare
 * Pages serves for every other app path (public/_redirects), and prerenders
 * the pages in src/prerender/paths.ts to static HTML (/ → index.html). scripts/build/finalize.ts then lays
 * build/client out as dist/, which is what Pages deploys.
 */
export default {
  appDirectory: "src",
  buildDirectory: "build",
  ssr: false,
  prerender: () => [
    HOME_PATH,
    ...GAME_DATA_HUB_PATHS,
    ...contentPathsFromDisk(path.resolve(import.meta.dirname, "content")),
  ],
} satisfies Config
