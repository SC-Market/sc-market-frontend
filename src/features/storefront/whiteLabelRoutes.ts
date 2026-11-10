/**
 * Which pages an org's white-label domain serves. On the org's domain a
 * visitor sees the org's storefront, shops, listings, services and pages,
 * plus the account and checkout flows; the SC Market-wide pages below
 * (every buyer's buy orders, the shop and storefront directories, other
 * orgs' pages, game data and the wiki, whose item pages list every seller)
 * are not linked there, and visiting one hands the visitor to sc-market.space
 * (WhiteLabelRouteGuard). So do the tabs the org turned off (Sidebar Tabs,
 * features/contractor/domain/whiteLabelTabs.ts). Framework-free.
 */
import {
  GAME_DATA_PATHS,
  MARKET_PATHS,
  ORDER_PATHS,
  ORG_PATHS,
  PATHS,
  USER_PATHS,
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
  // Users' profiles: their shops, listings and reviews everywhere
  USER_PATHS.profile("").slice(0, -1),
]

/**
 * The visitor's own account pages that list everything they do on SC
 * Market (chats with every seller, every notification): served only on
 * sc-market.space, but still linked on the org's domain, where the link
 * opens them on sc-market.space.
 */
const MAIN_SITE_ACCOUNT_SECTIONS: readonly string[] = [
  PATHS.messages,
  PATHS.notifications,
]

/** Directory pages served only on sc-market.space (their children are not). */
const MAIN_SITE_ONLY_PAGES: readonly string[] = [MARKET_PATHS.shops]

const ORG_PROFILE_PREFIX = ORG_PATHS.profile("")

/** The pages of each toggleable tab: `pages` exactly, `sections` with everything under them. */
const TAB_PAGES: Record<
  string,
  { pages?: readonly string[]; sections?: readonly string[] }
> = {
  market: {
    pages: [MARKET_PATHS.search],
    sections: [MARKET_PATHS.category("").slice(0, -1)],
  },
  services: { pages: [MARKET_PATHS.services, "/services"] },
  contracts: {
    pages: [PATHS.contracts, PATHS.contractsCreate],
    sections: [ORDER_PATHS.publicContract("").slice(0, -1)],
  },
  recruiting: { sections: [PATHS.recruiting] },
  contractors: { pages: [PATHS.contractors] },
}

function inSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`)
}

/** `pathname` without its query, hash and trailing slash. */
function barePath(pathname: string): string {
  const bare = pathname.split(/[?#]/)[0]
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare
}

/**
 * Whether `pathname` is one of the visitor's account pages served only on
 * sc-market.space (messages, notifications) that the org's domain still
 * links: the link opens it there.
 */
export function isMainSiteAccountPath(pathname: string): boolean {
  const path = barePath(pathname)
  return MAIN_SITE_ACCOUNT_SECTIONS.some((s) => inSection(path, s))
}

/**
 * Whether `pathname` is a page the white-label domain of `customOrg` does not
 * serve: an SC Market-wide page, another org's profile, or a page of a tab
 * in `hiddenTabs` (the org turned it off).
 */
export function isMainSiteOnlyPath(
  pathname: string,
  customOrg: string | undefined,
  hiddenTabs: ReadonlySet<string> = new Set(),
): boolean {
  const path = barePath(pathname)
  for (const tab of hiddenTabs) {
    const pages = TAB_PAGES[tab]
    if (!pages) continue
    if (pages.pages?.includes(path)) return true
    if (pages.sections?.some((s) => inSection(path, s))) return true
  }
  if (MAIN_SITE_ONLY_PAGES.includes(path)) return true
  if (MAIN_SITE_ONLY_SECTIONS.some((s) => inSection(path, s))) return true
  if (isMainSiteAccountPath(path)) return true
  if (customOrg && path.startsWith(ORG_PROFILE_PREFIX)) {
    const orgId = decodeURIComponent(
      path.slice(ORG_PROFILE_PREFIX.length).split("/")[0],
    )
    return orgId.toLowerCase() !== customOrg.toLowerCase()
  }
  return false
}

/**
 * Whether a page of an org-or-user-owned thing (a listing, a shop, a cart
 * item) belongs on the white-label domain of `customOrg`: only the org's own.
 * `ownerSpectrumId` is the owning org's spectrum_id, null for a user seller.
 */
export function isOrgOwned(
  ownerSpectrumId: string | null,
  customOrg: string,
): boolean {
  return (
    !!ownerSpectrumId &&
    ownerSpectrumId.toLowerCase() === customOrg.toLowerCase()
  )
}

/** The same page (path, query and hash) on sc-market.space. */
export function mainSiteUrl(pathWithSearch: string): string {
  return `${DEFAULT_FRONTEND_URL}${pathWithSearch}`
}
