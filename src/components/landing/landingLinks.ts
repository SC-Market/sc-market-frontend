import { MARKET_PATHS, PATHS } from "../../routes/paths"
import type { SearchListingsApiArg } from "../../store/api/v2/market"

/**
 * A link to a signed-in-only page: the page itself when signed in. Signed
 * out (or not known yet) it goes through the login page with a redirect,
 * the same URL LoggedInRoute would send them to, so the label and layout
 * never change with the session.
 */
export function loginGatedHref(path: string, signedIn: boolean): string {
  return signedIn ? path : `${PATHS.login}?redirect=${encodeURIComponent(path)}`
}

/** "Sell" / "Create listing": the create-listing page, via login when signed out. */
export function landingSellHref(signedIn: boolean): string {
  return loginGatedHref(MARKET_PATHS.create, signedIn)
}

/** Rows in the hero's "Latest listings" table. */
export const LATEST_LISTINGS_COUNT = 6

/**
 * The hero's listing query (the table and the "live listings" total).
 * The homepage is a shop window: an out-of-stock listing is a dead end for
 * a first-time visitor, so only listings they can buy.
 */
export const LATEST_LISTINGS_ARGS: SearchListingsApiArg = {
  page: 1,
  pageSize: LATEST_LISTINGS_COUNT,
  status: "active",
  inStock: true,
  sortBy: "created_at",
  sortOrder: "desc",
}

/**
 * The hero's category chips: the /shops tag set, each a market text search
 * except Services, which has its own page.
 */
export const LANDING_CATEGORIES = [
  { key: "weapons", to: `${MARKET_PATHS.search}?text=weapons` },
  { key: "armor", to: `${MARKET_PATHS.search}?text=armor` },
  { key: "components", to: `${MARKET_PATHS.search}?text=components` },
  { key: "cargo", to: `${MARKET_PATHS.search}?text=cargo` },
  { key: "mining", to: `${MARKET_PATHS.search}?text=mining` },
  { key: "salvage", to: `${MARKET_PATHS.search}?text=salvage` },
  { key: "medical", to: `${MARKET_PATHS.search}?text=medical` },
  { key: "vehicles", to: `${MARKET_PATHS.search}?text=vehicles` },
  { key: "services", to: MARKET_PATHS.services },
] as const
