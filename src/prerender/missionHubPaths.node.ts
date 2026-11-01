/**
 * The mission hub pages to prerender (Node only: react-router.config.ts):
 * every hub of GET /api/v2/game-data/missions/hubs, the same list the
 * backend's sitemap has.
 *
 * - VITE_BACKEND_URL set (every deploy): the hubs are fetched; an API that
 *   still fails after a few tries fails the build, so a deploy never ships
 *   without its hub pages (the previous deployment stays live).
 * - No VITE_BACKEND_URL (a local build without the game data API): no hub
 *   pages, only the route placeholders React Router needs for the routes'
 *   loader (src/prerender/paths.ts MISSION_HUB_ROUTE_PLACEHOLDERS; deleted
 *   by scripts/build/finalize.ts).
 */
import { MISSION_HUB_ROUTE_PLACEHOLDERS, missionHubPaths } from "./paths"

const ATTEMPTS = 3

export async function missionHubPathsFromApi(backendUrl: string | undefined): Promise<string[]> {
  if (!backendUrl) {
    console.warn("prerender: VITE_BACKEND_URL is not set, so no mission hub pages are prerendered")
    return []
  }
  const url = `${backendUrl.replace(/\/+$/, "")}/api/v2/game-data/missions/hubs`
  let lastError: unknown
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const paths = missionHubPaths(await response.json())
      console.log(`prerender: ${paths.length} mission hub pages`)
      return paths
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
    }
  }
  throw new Error(`prerender: could not fetch the mission hubs from ${url}: ${String(lastError)}`)
}

/** Route placeholders: the hub routes always have a prerendered path (see paths.ts). */
export { MISSION_HUB_ROUTE_PLACEHOLDERS }
