/**
 * Title/description text for hub and list pages (/market, /shops, /wiki/*,
 * /mining, /blueprints, /missions, /recruiting, /contractors, /resources),
 * shared by the SPA pages and the edge bridge so the two can't drift, plus
 * the bridge's full hub head (canonical, og:/twitter:, BreadcrumbList and
 * CollectionPage/ItemList JSON-LD). Pure: no React, no browser globals.
 *
 * `total` is the list endpoint's total (the SPA renders "" while loading).
 */
import { GAME_DATA_PATHS, MARKET_PATHS, PATHS, WIKI_PATHS } from "../routes/paths"
import {
  breadcrumbJsonLd,
  layoutDescription,
  PageHead,
  socialMeta,
} from "./pageHead"
import { SeoLink, SeoTranslate, WEBSITE_JSON_LD_ID } from "./siteHeads"

export interface SeoText {
  title: string
  description: string
}

/** A layout title whose description is StandardPageLayout's generic one. */
function layoutText(title: string, description?: string): SeoText {
  return { title, description: layoutDescription(title, description) }
}

function count(total: number | undefined): string {
  return `${total ?? ""}`
}

/** /market (ListingSearchV2). */
export function marketSearchSeoText(opts: {
  text?: string
  itemType?: string
  total?: number
}): SeoText {
  const parts = [opts.text, opts.itemType].filter((p): p is string => !!p)
  const title =
    parts.length === 0
      ? "Star Citizen Marketplace — SC Market"
      : `${parts.join(" ")} for Sale — Star Citizen | SC Market`
  const type = opts.itemType || "items"
  return {
    title,
    description: `Browse ${opts.total || ""} ${type} for sale on SC Market. Compare prices from verified Star Citizen sellers.`,
  }
}

/** /market head as ListingSearchV2 renders it (minus rel=prev/next). */
export function buildMarketSearchHead(
  opts: { text?: string; itemType?: string; total?: number },
  origin: string,
): PageHead {
  const { title, description } = marketSearchSeoText(opts)
  const url = `${origin}${MARKET_PATHS.search}`
  return {
    title,
    canonical: url,
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    jsonLd: [],
  }
}

/** /shops (ShopDirectory). */
export function shopDirectorySeoText(tag: string | null | undefined, total?: number): SeoText {
  return {
    title: `${tag || "All"} Shops — Star Citizen Marketplace | SC Market`,
    description: `Browse ${count(total)} verified Star Citizen shops. Compare ratings, listings, and specialties.`,
  }
}

/** /wiki/items (WikiItemBrowser). */
export function wikiItemsSeoText(type: string | null | undefined, total?: number): SeoText {
  return {
    title: `${type || "All"} Items — Star Citizen Game Database | SC Market`,
    description: `Browse ${count(total)} ${type || "Star Citizen"} items. Stats, prices, crafting uses, and locations.`,
  }
}

/** /wiki/commodities (WikiCommodityBrowser). */
export function wikiCommoditiesSeoText(category: string | null | undefined, total?: number): SeoText {
  return {
    title: `${category || "All"} Commodities — Star Citizen | SC Market`,
    description: `Browse ${count(total)} Star Citizen commodities. Mining locations, market prices, and quality tiers.`,
  }
}

/** /wiki/ships (WikiShipBrowser); `shipCount` is the filtered vehicle count. */
export function wikiShipsSeoText(manufacturer: string | null | undefined, shipCount: number): SeoText {
  return {
    title: `${manufacturer || "All"} Ships — Star Citizen Ship Database | SC Market`,
    description: `Browse ${shipCount} Star Citizen ships and vehicles. Specs, loadouts, and market availability.`,
  }
}

/** /blueprints (BlueprintBrowser). */
export function blueprintsSeoText(category: string | null | undefined, total?: number): SeoText {
  return {
    title: `${category || "All"} Blueprints — Star Citizen Crafting | SC Market`,
    description: `Browse ${count(total)} Star Citizen crafting blueprints. Ingredients, craft time, and profit analysis.`,
  }
}

/** /missions (MissionSearch). */
export function missionsSeoText(category: string | null | undefined, total?: number): SeoText {
  return {
    title: `${category || "All"} Missions — Star Citizen Mission Database | SC Market`,
    description: `Browse ${count(total)} Star Citizen missions. Rewards, locations, and difficulty ratings.`,
  }
}

/** /recruiting (Recruiting). */
export function recruitingSeoText(): SeoText {
  return {
    title: "Star Citizen Recruiting — Find Organizations | SC Market",
    description: "Browse recruiting posts from Star Citizen organizations. Find your next crew.",
  }
}

/** /contractors (Contractors). */
export function contractorsSeoText(t: SeoTranslate): SeoText {
  return layoutText(t("contractorsPage.title", "Contractors"))
}

/** /mining and /mining/locations (MiningPage). */
export function miningSeoText(t: SeoTranslate): SeoText {
  return layoutText(t("mining.title", "Mining Database"))
}

/** /wiki/manufacturers (WikiManufacturerList). */
export function manufacturersSeoText(t: SeoTranslate): SeoText {
  return layoutText(t("wiki.manufacturers.title", "Manufacturers"))
}

/** /wiki/locations (WikiLocationBrowser). */
export function wikiLocationsSeoText(t: SeoTranslate): SeoText {
  return layoutText(t("wiki.locations.title", "Star Map & Locations"))
}

/** /resources (ResourceBrowser). */
export function resourcesSeoText(t: SeoTranslate): SeoText {
  return layoutText(t("resources.title", "Resources"))
}

/** /wiki (WikiHub). */
export function wikiHubSeoText(t: SeoTranslate): SeoText & { header: string } {
  return {
    title: t("wiki.hub.title", "Game Database — Star Citizen Items, Ships & More | SC Market"),
    description: t(
      "wiki.hub.description",
      "Browse the complete Star Citizen game database: items, ships, commodities, locations, manufacturers, blueprints, and mining resources.",
    ),
    header: t("wiki.hub.header", "Game Database"),
  }
}

/** The /wiki hub's section cards (WikiHub adds the icons). */
export const WIKI_HUB_SECTIONS: readonly { label: string; labelKey: string; route: string }[] = [
  { label: "Items", labelKey: "wiki.hub.sectionItems", route: WIKI_PATHS.items },
  { label: "Ships & Vehicles", labelKey: "wiki.hub.sectionShips", route: WIKI_PATHS.ships },
  { label: "Commodities", labelKey: "wiki.hub.sectionCommodities", route: WIKI_PATHS.commodities },
  { label: "Locations", labelKey: "wiki.hub.sectionLocations", route: WIKI_PATHS.locations },
  { label: "Manufacturers", labelKey: "wiki.hub.sectionManufacturers", route: WIKI_PATHS.manufacturers },
  { label: "Refinery", labelKey: "wiki.hub.sectionRefinery", route: WIKI_PATHS.refinery },
  { label: "Missions", labelKey: "wiki.hub.sectionMissions", route: GAME_DATA_PATHS.missions },
  { label: "Blueprints", labelKey: "wiki.hub.sectionBlueprints", route: GAME_DATA_PATHS.blueprints },
  { label: "Crafting Calculator", labelKey: "wiki.hub.sectionCraftingCalculator", route: GAME_DATA_PATHS.craftingCalculator },
  { label: "Resources", labelKey: "wiki.hub.sectionResources", route: GAME_DATA_PATHS.resources },
  { label: "Mining", labelKey: "wiki.hub.sectionMining", route: GAME_DATA_PATHS.mining },
]

/** Most links a hub lists (crawl discovery, kept bounded). */
export const MAX_HUB_LINKS = 50

/** A breadcrumb step above a hub ("Home" is implied). */
export interface HubCrumb {
  name: string
  path: string
}

export const WIKI_CRUMB: HubCrumb = { name: "Game Database", path: WIKI_PATHS.hub }
export const MARKET_CRUMB: HubCrumb = { name: "Market", path: MARKET_PATHS.search }
export const MINING_CRUMB: HubCrumb = { name: "Mining", path: GAME_DATA_PATHS.mining }
export const HOME_PATH = PATHS.home

/**
 * Full head for a hub page as the bridge serves it: the SPA's title and
 * description, a canonical on the hub path, social tags, and BreadcrumbList
 * + CollectionPage JSON-LD (with an ItemList of the linked entries).
 */
export function buildHubHead(
  opts: {
    text: SeoText
    /** Hub path, e.g. "/wiki/ships". */
    path: string
    /** Visible heading / breadcrumb name. */
    name: string
    parents?: HubCrumb[]
    links?: readonly SeoLink[]
  },
  origin: string,
): PageHead {
  const { title, description } = opts.text
  const canonical = `${origin}${opts.path}`
  const links = (opts.links ?? []).slice(0, MAX_HUB_LINKS)
  const crumbs = [
    { name: "SC Market", url: `${origin}/` },
    ...(opts.parents ?? []).map((p) => ({ name: p.name, url: `${origin}${p.path}` })),
    { name: opts.name, url: canonical },
  ]

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        ogType: "website",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      breadcrumbJsonLd(crumbs),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: opts.name,
        description,
        url: canonical,
        isPartOf: { "@id": WEBSITE_JSON_LD_ID },
        ...(links.length > 0 && {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: links.length,
            itemListElement: links.map((link, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: link.text,
              url: `${origin}${link.href}`,
            })),
          },
        }),
      },
    ],
  }
}
