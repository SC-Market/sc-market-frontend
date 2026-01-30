/**
 * Market search: URL params ↔ UI state mapping.
 * Keeps mapping/formatting in domain; hooks use these and handle orchestration.
 */

import type { MarketSearchState, SaleType } from "./types"

/** Read URL params via a simple getter (e.g. URLSearchParams from react-router). */
export type ParamsGetter = (key: string) => string | null

/**
 * Build MarketSearchState from URL params.
 * Used by useMarketSearch to derive state from the URL.
 */
export function paramsToSearchState(
  getParam: ParamsGetter,
  defaultPageSize: number,
): MarketSearchState {
  return {
    sort: getParam("sort") || "activity",
    sale_type: (getParam("kind") as SaleType) || undefined,
    item_type: getParam("type") || undefined,
    quantityAvailable:
      getParam("quantityAvailable") !== null
        ? +(getParam("quantityAvailable") ?? 0)
        : 1,
    minCost: +(getParam("minCost") ?? 0) || 0,
    maxCost: getParam("maxCost") ? +(getParam("maxCost") ?? 0) : undefined,
    query: getParam("query") || "",
    statuses: getParam("statuses") || "active",
    index: getParam("index") ? +(getParam("index") ?? 0) : undefined,
    page_size: getParam("page_size")
      ? +(getParam("page_size") ?? 0)
      : defaultPageSize,
    language_codes: getParam("language_codes")
      ? (getParam("language_codes") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
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
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  )
}
