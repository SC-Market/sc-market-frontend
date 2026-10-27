/**
 * What of the build-time render's RTK Query cache a prerendered page ships
 * (store/hydration.ts): fulfilled queries of game-data endpoints only.
 *
 * Game data changes with game patches, and the hubs are rebuilt with every
 * deploy, so build-time data is fresh enough to show before the app runs (and
 * the browser doesn't refetch it). Anything else the page asks for (market
 * listings and prices, shops, anything per-user) is not shipped: the
 * prerendered HTML shows its loading state and the browser fetches it, exactly
 * as before. See docs/prerender.md.
 */
import type { RootState } from "../store/store"
import type { PrerenderedApiState } from "../store/hydration"

/**
 * The game-data endpoints the prerendered hubs read (v2 /game-data/*,
 * /mining/*, /blueprints, /missions, /resources). Anything not listed is
 * fetched in the browser. Add an endpoint here only if its data changes
 * with game patches, not with user activity.
 */
export const PRERENDERABLE_ENDPOINTS: ReadonlySet<string> = new Set([
  "getActiveVersions",
  "getBlueprintCategories",
  "getCommodities",
  "getGameEvents",
  "getLocations",
  "getManufacturers",
  "getRefiningMethods",
  "getResourceCategories",
  "getShips",
  "searchBlueprints",
  "searchItems",
  "searchLocations",
  "searchMissions",
  "searchOres",
  "searchResources",
])

interface QueryEntry {
  status?: string
  endpointName?: string
}

interface ApiSliceState {
  queries?: Record<string, QueryEntry | undefined>
}

export function isPrerenderableQuery(entry: QueryEntry | undefined): boolean {
  return (
    !!entry &&
    entry.status === "fulfilled" &&
    !!entry.endpointName &&
    PRERENDERABLE_ENDPOINTS.has(entry.endpointName)
  )
}

/** `{ [reducerPath]: { queries } }` with only the shippable queries. */
export function prerenderableApiState(state: RootState): PrerenderedApiState {
  const out: PrerenderedApiState = {}
  for (const [reducerPath, slice] of Object.entries(state)) {
    const queries = (slice as ApiSliceState).queries ?? {}
    const kept = Object.fromEntries(
      Object.entries(queries).filter(([, entry]) =>
        isPrerenderableQuery(entry),
      ),
    )
    // RTK's rehydration also reads `mutations` and `provided`; ship none.
    if (Object.keys(kept).length > 0) {
      out[reducerPath] = {
        queries: kept,
        mutations: {},
        provided: { tags: {}, keys: {} },
      }
    }
  }
  return out
}

/** Every fulfilled endpoint name in the cache (build log, to review the allowlist). */
export function fulfilledEndpointNames(state: RootState): string[] {
  const names = new Set<string>()
  for (const slice of Object.values(state)) {
    for (const entry of Object.values((slice as ApiSliceState).queries ?? {})) {
      if (entry?.status === "fulfilled" && entry.endpointName)
        names.add(entry.endpointName)
    }
  }
  return [...names].sort()
}
