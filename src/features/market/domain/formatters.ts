/**
 * Market search: URL params ↔ UI state mapping.
 * Keeps mapping/formatting in domain; hooks use these and handle orchestration.
 */

import type { MarketSearchState, SaleType } from "./types"

/** Read URL params via a simple getter (e.g. URLSearchParams from react-router). */
export type ParamsGetter = (key: string) => string | null

/** Extended params getter that also provides access to all keys */
export type ExtendedParamsGetter = {
  get: (key: string) => string | null
  keys: () => IterableIterator<string>
}

/**
 * Build MarketSearchState from URL params.
 * Used by useMarketSearch to derive state from the URL.
 */
export function paramsToSearchState(
  getParam: ParamsGetter | ExtendedParamsGetter,
  defaultPageSize: number,
): MarketSearchState {
  // Parse attribute parameters from URL
  // Format: ?attr_size=4,5&attr_class=Military
  const attributes: Record<string, string[]> = {}

  // Check if we have the extended getter with keys() method
  if (typeof getParam === "object" && "keys" in getParam && "get" in getParam) {
    // Iterate through all params to find attr_* parameters
    for (const key of getParam.keys()) {
      if (key.startsWith("attr_")) {
        const attrName = key.substring(5) // Remove 'attr_' prefix
        const value = getParam.get(key)
        if (value) {
          attributes[attrName] = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        }
      }
    }
  }

  // Support both getter function and extended getter object.
  // Use a wrapper so URLSearchParams.get is called with correct 'this' (don't extract .get).
  const get = (key: string): string | null =>
    typeof getParam === "function" ? getParam(key) : getParam.get(key)

  return {
    sort: get("sort") || "activity",
    sale_type: (get("kind") as SaleType) || undefined,
    item_type: get("type") || undefined,
    quantityAvailable:
      get("quantityAvailable") !== null ? +(get("quantityAvailable") ?? 0) : 1,
    minCost: +(get("minCost") ?? 0) || 0,
    maxCost: get("maxCost") ? +(get("maxCost") ?? 0) : undefined,
    query: get("query") || "",
    statuses: get("statuses") || "active",
    index: get("index") ? +(get("index") ?? 0) : undefined,
    page_size: get("page_size") ? +(get("page_size") ?? 0) : defaultPageSize,
    language_codes: get("language_codes")
      ? (get("language_codes") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  } as MarketSearchState
}

/**
 * Build URL params object from MarketSearchState (omits defaults).
 * Used by useMarketSearch when applying filters; only defined keys are set.
 */
export function searchStateToParams(
  state: MarketSearchState,
  defaultPageSize: number,
): Record<string, string> {
  const obj: Record<string, string> = {
    ...(state.query ? { query: state.query } : {}),
    ...(state.sale_type && state.sale_type !== "any"
      ? { kind: state.sale_type }
      : {}),
    ...(state.item_type && state.item_type !== "any"
      ? { type: state.item_type }
      : {}),
    ...(state.quantityAvailable !== undefined && state.quantityAvailable !== 1
      ? { quantityAvailable: String(state.quantityAvailable) }
      : {}),
    ...(state.minCost ? { minCost: String(state.minCost) } : {}),
    ...(state.maxCost != null ? { maxCost: String(state.maxCost) } : {}),
    ...(state.sort && state.sort !== "activity" ? { sort: state.sort } : {}),
    ...(state.statuses && state.statuses !== "active"
      ? { statuses: state.statuses }
      : {}),
    ...(state.index !== undefined && state.index !== 0
      ? { index: String(state.index) }
      : {}),
    ...(state.page_size !== undefined && state.page_size !== defaultPageSize
      ? { page_size: String(state.page_size) }
      : {}),
    ...(state.language_codes && state.language_codes.length > 0
      ? { language_codes: state.language_codes.join(",") }
      : {}),
  }

  // Serialize attributes to JSON for backend
  // Backend expects: ?attributes=[{"name":"size","values":["4","5"]}]
  if (state.attributes && Object.keys(state.attributes).length > 0) {
    const attributesArray = Object.entries(state.attributes)
      .filter(([_, values]) => values && values.length > 0)
      .map(([name, values]) => ({ name, values }))

    if (attributesArray.length > 0) {
      obj.attributes = JSON.stringify(attributesArray)
    }
  }

  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  )
}
