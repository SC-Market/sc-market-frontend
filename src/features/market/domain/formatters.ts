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
    // Component attribute filters - parse comma-separated strings to arrays
    component_size: getParam("component_size")
      ? (getParam("component_size") ?? "")
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n))
      : undefined,
    component_grade: getParam("component_grade")
      ? (getParam("component_grade") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    component_class: getParam("component_class")
      ? (getParam("component_class") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    manufacturer: getParam("manufacturer")
      ? (getParam("manufacturer") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    component_type: getParam("component_type")
      ? (getParam("component_type") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    armor_class: getParam("armor_class")
      ? (getParam("armor_class") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    color: getParam("color")
      ? (getParam("color") ?? "")
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
    // Component attribute filters - serialize arrays as comma-separated strings
    ...(state.component_size && state.component_size.length > 0
      ? { component_size: state.component_size.map(String).join(",") }
      : {}),
    ...(state.component_grade && state.component_grade.length > 0
      ? { component_grade: state.component_grade.join(",") }
      : {}),
    ...(state.component_class && state.component_class.length > 0
      ? { component_class: state.component_class.join(",") }
      : {}),
    ...(state.manufacturer && state.manufacturer.length > 0
      ? { manufacturer: state.manufacturer.join(",") }
      : {}),
    ...(state.component_type && state.component_type.length > 0
      ? { component_type: state.component_type.join(",") }
      : {}),
    ...(state.armor_class && state.armor_class.length > 0
      ? { armor_class: state.armor_class.join(",") }
      : {}),
    ...(state.color && state.color.length > 0
      ? { color: state.color.join(",") }
      : {}),
  }
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  )
}

/**
 * Convert MarketSearchState to API query parameters.
 * Serializes array fields properly for the backend API.
 * Used when calling searchMarketListings endpoint.
 */
export function searchStateToApiParams(
  state: MarketSearchState,
): Record<string, string | string[] | number | undefined> {
  return {
    ...(state.query ? { query: state.query } : {}),
    ...(state.sale_type && state.sale_type !== "any"
      ? { sale_type: state.sale_type }
      : {}),
    ...(state.item_type && state.item_type !== "any"
      ? { item_type: state.item_type }
      : {}),
    ...(state.quantityAvailable !== undefined
      ? { quantityAvailable: state.quantityAvailable }
      : {}),
    ...(state.minCost !== undefined ? { minCost: state.minCost } : {}),
    ...(state.maxCost !== undefined && state.maxCost !== null
      ? { maxCost: state.maxCost }
      : {}),
    ...(state.sort ? { sort: state.sort } : {}),
    ...(state.statuses ? { statuses: state.statuses } : {}),
    ...(state.index !== undefined ? { index: state.index } : {}),
    ...(state.page_size !== undefined ? { page_size: state.page_size } : {}),
    ...(state.language_codes && state.language_codes.length > 0
      ? { language_codes: state.language_codes.join(",") }
      : {}),
    // Component attribute filters - serialize arrays as comma-separated strings
    ...(state.component_size && state.component_size.length > 0
      ? { component_size: state.component_size.map(String).join(",") }
      : {}),
    ...(state.component_grade && state.component_grade.length > 0
      ? { component_grade: state.component_grade.join(",") }
      : {}),
    ...(state.component_class && state.component_class.length > 0
      ? { component_class: state.component_class.join(",") }
      : {}),
    ...(state.manufacturer && state.manufacturer.length > 0
      ? { manufacturer: state.manufacturer.join(",") }
      : {}),
    ...(state.component_type && state.component_type.length > 0
      ? { component_type: state.component_type.join(",") }
      : {}),
    ...(state.armor_class && state.armor_class.length > 0
      ? { armor_class: state.armor_class.join(",") }
      : {}),
    ...(state.color && state.color.length > 0
      ? { color: state.color.join(",") }
      : {}),
  }
}
