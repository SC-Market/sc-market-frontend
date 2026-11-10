/**
 * Which pages an org's white-label domain serves. On the org's domain a
 * visitor sees the org's storefront, shops, listings, services and pages,
 * plus the account and checkout flows; the SC Market-wide pages below
 * (every buyer's buy orders, the shop and storefront directories, other
 * orgs' pages, game data and the wiki, whose item pages list every seller)
 * are not linked there, and visiting one hands the visitor to sc-market.space
 * (WhiteLabelRouteGuard). Framework-free.
 */
import {
  GAME_DATA_PATHS,
  MARKET_PATHS,
  ORG_PATHS,
  PATHS,
  WIKI_PATHS,
} from "../../routes/paths"
import { DEFAULT_FRONTEND_URL } from "../../seo/constants"

/** Pages served only on sc-market.space, with everything under them. */
const MAIN_SITE_ONLY_SECTIONS: readonly string[] = [
  MARKET_PATHS.buyOrders,
  // /buyorder/create and /buyorder/:id
  "/buyorder",
  MARKET_PATHS.bulk,
  // /market/aggregate/:id: every seller of one item
  MARKET_PATHS.aggregate("").slice(0, -1),
  PATHS.storefronts,
  PATHS.shoppingLists,
  GAME_DATA_PATHS.missions,
  GAME_DATA_PATHS.mining,
  GAME_DATA_PATHS.blueprints,
  GAME_DATA_PATHS.resources,
  // /crafting/calculator and /crafting/history
  "/crafting",
  WIKI_PATHS.hub,
]

/** Directory pages served only on sc-market.space (their children are not). */
const MAIN_SITE_ONLY_PAGES: readonly string[] = [MARKET_PATHS.shops]

const ORG_PROFILE_PREFIX = ORG_PATHS.profile("")

function inSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`)
}

/**
 * Whether `pathname` is a page the white-label domain of `customOrg` does not
 * serve: an SC Market-wide page, or another org's profile.
 */
export function isMainSiteOnlyPath(
  pathname: string,
  customOrg: string | undefined,
): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
  if (MAIN_SITE_ONLY_PAGES.includes(path)) return true
  if (MAIN_SITE_ONLY_SECTIONS.some((s) => inSection(path, s))) return true
  if (customOrg && path.startsWith(ORG_PROFILE_PREFIX)) {
    const orgId = decodeURIComponent(
      path.slice(ORG_PROFILE_PREFIX.length).split("/")[0],
    )
    return orgId.toLowerCase() !== customOrg.toLowerCase()
  }
  return false
}

/** The same page (path, query and hash) on sc-market.space. */
export function mainSiteUrl(pathWithSearch: string): string {
  return `${DEFAULT_FRONTEND_URL}${pathWithSearch}`
}
