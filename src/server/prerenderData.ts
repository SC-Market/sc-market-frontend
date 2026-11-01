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
  "getMissionHub",
  "getMissionHubs",
  "getRefiningMethods",
  "getResourceCategories",
  "getShips",
  // The Storefronts hub's list (org storefronts change slowly; the hub
  // revalidates it on mount) and the homepage row from the same query.
  "getStorefronts",
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
  error?: unknown
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
  return apiStateWhere(state, isPrerenderableQuery)
}

/**
 * Every fulfilled query, live data included: a request-time render (the SSR
 * Pages Function, src/ssr/render.tsx) ships what it rendered with, so the
 * browser hydrates against the same data. Its HTML is at most a minute old
 * (edge cache), unlike a prerendered page's.
 */
export function fulfilledApiState(state: RootState): PrerenderedApiState {
  return apiStateWhere(
    state,
    (entry) => entry?.status === "fulfilled" && !!entry.endpointName,
  )
}

function apiStateWhere(
  state: RootState,
  keep: (entry: QueryEntry | undefined) => boolean,
): PrerenderedApiState {
  const out: PrerenderedApiState = {}
  for (const [reducerPath, slice] of Object.entries(state)) {
    const queries = (slice as ApiSliceState).queries ?? {}
    const kept = Object.fromEntries(
      Object.entries(queries).filter(([, entry]) => keep(entry)),
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

/**
 * A query error that says nothing about the page (it may succeed a moment
 * later): rate limited, a 5xx, a network error or timeout. A 4xx other than
 * 408/429 is a real answer ("doesn't exist", "not allowed").
 */
export function isTransientQueryError(error: unknown): boolean {
  const status = (error as { status?: unknown } | undefined)?.status
  if (typeof status === "number") {
    return status === 408 || status === 429 || status >= 500
  }
  // fetchBaseQuery's FETCH_ERROR / TIMEOUT_ERROR / PARSING_ERROR.
  return typeof status === "string"
}

/**
 * The queries of a request-time render that failed transiently
 * (`endpointName(status)`): the page is served, but not cached
 * (src/ssr/render.tsx).
 */
export function transientQueryFailures(state: RootState): string[] {
  const failures: string[] = []
  for (const slice of Object.values(state)) {
    const queries = (slice as ApiSliceState).queries ?? {}
    for (const entry of Object.values(queries)) {
      if (entry?.status === "rejected" && isTransientQueryError(entry.error)) {
        const status = (entry.error as { status?: unknown }).status
        failures.push(`${entry.endpointName ?? "query"}(${String(status)})`)
      }
    }
  }
  return failures
}
