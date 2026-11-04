/**
 * The mission hub pages to prerender (Node only: react-router.config.ts):
 * every hub of GET /api/v2/game-data/missions/hubs, the same list the
 * backend's sitemap has.
 *
 * - No real backend (VITE_BACKEND_URL unset or on localhost: local builds,
 *   the CI and E2E builds, whose mock API isn't running at build time): no
 *   hub pages, no fetch. Like the other prerendered game-data lists, the
 *   build never fails for want of the game data API.
 * - A real backend on a Cloudflare Pages build (CF_PAGES=1, every deploy):
 *   an API that still fails after a few tries fails the build, so a deploy
 *   never ships without its hub pages (the previous deployment stays live).
 * - A real backend anywhere else: a failure is logged and no hub page is
 *   prerendered.
 *
 * The hub routes always have their placeholders (src/prerender/paths.ts
 * MISSION_HUB_ROUTE_PLACEHOLDERS, deleted by scripts/build/finalize.ts), so
 * their `loader` is legal with no hub prerendered.
 */
import { missionHubPaths } from "./paths"

const ATTEMPTS = 3

/** A backend the build can reach for real game data (not a local or CI mock). */
export function isRealBackend(
  backendUrl: string | undefined,
): backendUrl is string {
  if (!backendUrl) return false
  try {
    const { hostname } = new URL(backendUrl)
    return !["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(hostname)
  } catch {
    return false
  }
}

export async function missionHubPathsFromApi(
  backendUrl: string | undefined,
  env: Record<string, string | undefined> = process.env,
): Promise<string[]> {
  if (!isRealBackend(backendUrl)) {
    console.warn(
      `prerender: no real backend (VITE_BACKEND_URL=${backendUrl ?? ""}), so no mission hub pages are prerendered`,
    )
    return []
  }
  const url = `${backendUrl.replace(/\/+$/, "")}/api/v2/game-data/missions/hubs`
  let lastError: unknown
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const paths = missionHubPaths(await response.json())
      console.log(`prerender: ${paths.length} mission hub pages`)
      return paths
    } catch (error) {
      lastError = error
      if (attempt < ATTEMPTS)
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
    }
  }
  const message = `prerender: could not fetch the mission hubs from ${url}: ${String(lastError)}`
  if (env.CF_PAGES === "1") throw new Error(message)
  console.warn(`${message} (not a Pages build: no mission hub pages)`)
  return []
}
