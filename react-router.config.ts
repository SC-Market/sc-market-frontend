import path from "node:path"
import type { Config } from "@react-router/dev/config"
import { GAME_DATA_HUB_PATHS, HOME_PATH } from "./src/prerender/paths"
import { contentPathsFromDisk } from "./src/prerender/contentPaths.node"
import { diskContentSource } from "./src/prerender/contentSource.node"
import { registerBuildContentSource } from "./src/server/contentSource"
import { SSR_ROUTE_PLACEHOLDERS } from "./src/ssr/routePlaceholders"
import {
  MISSION_HUB_ROUTE_PLACEHOLDERS,
  missionHubPathsFromApi,
} from "./src/prerender/missionHubPaths.node"

// The prerender reads the content build's JSON from disk (the server build
// itself has no node:fs: it also runs on Cloudflare, docs/ssr-worker.md).
registerBuildContentSource(
  diskContentSource(path.resolve(import.meta.dirname, "build/client")),
)

/**
 * React Router framework mode (docs/ssr-migration-design.md, Phases 2–3).
 *
 * `ssr: false`: no server at runtime. `react-router build` renders the root
 * route once to build/client/__spa-fallback.html, the HTML shell Cloudflare
 * Pages serves for every other app path (public/_redirects), and prerenders
 * the pages in src/prerender/paths.ts to static HTML (/ → index.html). scripts/build/finalize.ts then lays
 * build/client out as dist/, which is what Pages deploys.
 *
 * Entity pages (listings, shops, orgs, users) are rendered at request time
 * by the SSR Pages Function from the same server build (docs/ssr-worker.md).
 */
export default {
  appDirectory: "src",
  buildDirectory: "build",
  ssr: false,
  prerender: async () => [
    HOME_PATH,
    ...GAME_DATA_HUB_PATHS,
    // Every mission hub of the LIVE version (the game data API, at build time).
    ...(await missionHubPathsFromApi(process.env.VITE_BACKEND_URL)),
    ...contentPathsFromDisk(path.resolve(import.meta.dirname, "content")),
    // Not pages: lets the server-rendered routes export a loader
    // (src/ssr/routePlaceholders.ts); finalize.ts deletes their files.
    ...SSR_ROUTE_PLACEHOLDERS,
    ...MISSION_HUB_ROUTE_PLACEHOLDERS,
  ],
} satisfies Config
