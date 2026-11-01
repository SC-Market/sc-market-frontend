/**
 * Head (title/meta/canonical/JSON-LD) builders for game-data detail pages.
 * Used by the pages (via <SeoHead>) and by the edge bridge, so the SPA and
 * the crawler-facing HTML can't drift. Pure: no React, no browser globals.
 *
 * `origin` is the frontend origin (FRONTEND_URL in the SPA).
 */
import type {
  BlueprintDetailResponse,
  GameVersion,
  BlueprintIngredient,
  ItemAcquisitionDocument,
  LocationDetailResponse,
  MissionDetailResponse,
  OreDetailResponse,
  ResourceDetailResponse,
  WikiItemDetail,
  WikiManufacturerDetail,
  WikiShipDetail,
} from "../store/api/v2/market"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../routes/paths"
import { breadcrumbJsonLd, PageHead, socialMeta } from "./pageHead"
import { gameDataDateModified, missionGiver, missionSummaryLine, missionTitle, readableMissionText } from "./missionText"
import { itemSeoDescription, itemSeoTitle } from "./itemAcquisition"

/** "gold_ore" → "Gold Ore": mining pages' name before/without displayName. */
export function friendlyMiningName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Display name the mining detail pages use for an ore or location. */
export function miningDisplayName(
  displayName: string | null | undefined,
  routeName: string | undefined,
): string {
  return displayName || friendlyMiningName(routeName || "")
}

/** /wiki/commodities/:id (WikiCommodityDetail). */
export function buildCommodityHead(
  data: ResourceDetailResponse,
  origin: string,
): PageHead {
  const r = data.resource
  const acquisitionMethods = [
    r.can_be_mined && "Mining",
    r.can_be_purchased && "Purchase",
    r.can_be_salvaged && "Salvage",
    r.can_be_looted && "Looting",
  ]
    .filter(Boolean)
    .join(", ")

  const title = `${r.resource_name} — Star Citizen Commodity | SC Market`
  const description = `${r.resource_name} — ${r.resource_category} commodity. ${acquisitionMethods || "Various acquisition methods"}. View mining locations, market price, and quality tiers.`.slice(0, 160)
  // Built from the *resolved* resource, not the raw path param: the same page
  // is reachable by full UUID or by short slug, and the sitemap only ever
  // lists the slug form.
  const canonical = `${origin}${WIKI_PATHS.commodity(r.resource_id, r.resource_name)}`
  const image = r.resource_icon || `${origin}/logo512.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "product",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: r.resource_name,
        description,
        ...(r.resource_icon && { image: r.resource_icon }),
        url: canonical,
        category: r.resource_category,
      },
    ],
  }
}

/** /resources/:resource_id (ResourceDetail); canonical is the wiki route. */
export function buildResourceHead(
  data: ResourceDetailResponse,
  origin: string,
): PageHead {
  const resource = data.resource
  const title = `${resource.resource_name} — Star Citizen Resource | SC Market`
  const description = `${resource.resource_name} — ${resource.resource_category} resource. Base value: ${resource.base_value ? resource.base_value.toLocaleString() + " aUEC" : "N/A"}. Quality tiers and market availability.`.slice(0, 160)
  // /resources/:id and /wiki/commodities/:id render the same entity, so this
  // page deliberately points its canonical at the wiki route.
  const canonical = `${origin}${WIKI_PATHS.commodity(resource.resource_id, resource.resource_name)}`
  const image = `${origin}/scmarket-logo.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "product",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: resource.resource_name,
        description,
        url: canonical,
        category: resource.resource_category,
      },
    ],
  }
}

/**
 * /wiki/items/:id (WikiItemDetail). Title and description answer "how to
 * get <item>": with the acquisition document (`acquisition`, when loaded)
 * the description names the ways and their numbers. JSON-LD: a Product
 * without offers (aUEC is not an ISO 4217 currency) and the breadcrumbs.
 */
export function buildItemHead(
  item: WikiItemDetail,
  origin: string,
  acquisition?: ItemAcquisitionDocument | null,
): PageHead {
  const title = itemSeoTitle(item.name)
  const description = itemSeoDescription(item, acquisition)
  // Built from the resolved item, not the raw path param (UUID vs short slug).
  const canonical = `${origin}${WIKI_PATHS.item(item.id, item.name)}`
  const image = item.image_url || `${origin}/logo512.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "product",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: item.name,
        description,
        ...(item.image_url && { image: item.image_url }),
        url: canonical,
        ...(item.type && { category: item.type }),
        ...(item.manufacturer && {
          manufacturer: { "@type": "Organization", name: item.manufacturer },
        }),
      },
      breadcrumbJsonLd([
        { name: "SC Market", url: `${origin}/` },
        { name: "Wiki", url: `${origin}${WIKI_PATHS.hub}` },
        { name: "Items", url: `${origin}${WIKI_PATHS.items}` },
        { name: item.name, url: canonical },
      ]),
    ],
  }
}

/** /wiki/ships/:id (WikiShipDetail, the full-page variant). */
export function buildShipHead(ship: WikiShipDetail, origin: string): PageHead {
  const title = `${ship.name} — Star Citizen Ship | SC Market`
  const description = `${ship.name}${ship.manufacturer ? " by " + ship.manufacturer : ""} — ${ship.focus || ship.role || "spacecraft"}. Specs, loadout, and market availability in Star Citizen.`.slice(0, 160)
  // Built from the resolved ship, not the raw path param (UUID vs short slug).
  const canonical = `${origin}${WIKI_PATHS.ship(ship.id, ship.name)}`
  const image = ship.image_url || `${origin}/logo512.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "product",
        twitterCard: "summary_large_image",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: ship.name,
        description: ship.description || description,
        image: ship.image_url || undefined,
        url: canonical,
        ...(ship.manufacturer && {
          manufacturer: { "@type": "Organization", name: ship.manufacturer },
        }),
        category: [ship.career, ship.role, ship.focus].filter(Boolean).join(" / "),
        additionalProperty: [
          ...(ship.crew_size
            ? [{ "@type": "PropertyValue", name: "Crew Size", value: ship.crew_size }]
            : []),
          ...(ship.length_m
            ? [{ "@type": "PropertyValue", name: "Length", value: `${ship.length_m}m` }]
            : []),
        ],
      },
    ],
  }
}

/** Ore page title/description; the page also uses them while loading. */
export function oreSeoText(displayName: string): { title: string; description: string } {
  return {
    title: `${displayName} — Star Citizen Mining Ore | SC Market`,
    description: `${displayName} — minable ore in Star Citizen. Mining stats, locations, and market price.`,
  }
}

/** /mining/ores/:name (MiningOreDetailPage). */
export function buildOreHead(
  ore: OreDetailResponse,
  routeName: string,
  origin: string,
): PageHead {
  const displayName = miningDisplayName(ore.displayName, routeName)
  const { title, description } = oreSeoText(displayName)
  const canonical = `${origin}/mining/ores/${routeName}`
  const image = `${origin}/scmarket-logo.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "product",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: displayName,
        description,
        url: canonical,
      },
    ],
  }
}

/** Mining location title/description; also used while loading. */
export function miningLocationSeoText(displayName: string): {
  title: string
  description: string
} {
  return {
    title: `${displayName} — Star Citizen Mining Location | SC Market`,
    description: `${displayName} — mining location in Star Citizen. Available ores and mining guide.`,
  }
}

/** /mining/locations/:name (MiningLocationDetailPage). */
export function buildMiningLocationHead(
  loc: LocationDetailResponse,
  routeName: string,
  origin: string,
): PageHead {
  const displayName = miningDisplayName(loc.displayName, routeName)
  const { title, description } = miningLocationSeoText(displayName)
  const canonical = `${origin}/mining/locations/${routeName}`
  const image = `${origin}/scmarket-logo.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "place",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Place",
        name: displayName,
        description,
        url: canonical,
        ...(loc.system && {
          containedInPlace: { "@type": "Place", name: loc.system },
        }),
      },
    ],
  }
}

/** Name the blueprint pages show: the crafted item, else the blueprint. */
export function blueprintItemName(
  data: Pick<BlueprintDetailResponse, "blueprint" | "output_item"> | undefined,
): string {
  return data?.output_item?.name || data?.blueprint?.blueprint_name || "Blueprint"
}

/** Blueprint title/description; the page also uses them while loading. */
export function blueprintSeoText(
  data: BlueprintDetailResponse | undefined,
): { title: string; description: string } {
  const bp = data?.blueprint
  const itemName = blueprintItemName(data)
  const ingredients = data?.ingredients || []
  return {
    title: `${itemName} — Star Citizen Blueprint | SC Market`,
    description: `How to craft ${itemName}. ${ingredients.length} ingredients, ${bp?.crafting_time_seconds ? Math.round(bp.crafting_time_seconds) + "s craft time" : "craft time varies"}. ${bp?.tier ? "Tier " + bp.tier : ""}${bp?.rarity ? ", " + bp.rarity + " rarity" : ""}.`.slice(0, 160),
  }
}

/** /blueprints/:slug (BlueprintDetail, the full-page variant). */
export function buildBlueprintHead(
  data: BlueprintDetailResponse,
  routeSlug: string,
  origin: string,
): PageHead {
  const bp = data.blueprint
  const outputItem = data.output_item
  const itemName = blueprintItemName(data)
  const ingredients = data.ingredients || []

  const { title, description } = blueprintSeoText(data)
  const canonical = `${origin}${GAME_DATA_PATHS.blueprint(routeSlug)}`
  const image = outputItem?.icon_url || bp?.icon_url || `${origin}/logo512.png`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        url: canonical,
        image,
        ogType: "article",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: itemName,
        description,
        image: outputItem?.icon_url || bp.icon_url || undefined,
        url: canonical,
        recipeIngredient: ingredients
          .map((ing: BlueprintIngredient) => ing.game_item?.name || ing.slot_name)
          .filter(Boolean),
        ...(bp.crafting_time_seconds && {
          totalTime: `PT${Math.round(bp.crafting_time_seconds)}S`,
        }),
        recipeYield: itemName,
      },
    ],
  }
}

/**
 * /missions/:slug (MissionDetail, the full-page variant, and the bridge).
 * Title: the readable name plus giver, rank and system, so same-named
 * missions get distinct titles. Description: the one-line summary. JSON-LD:
 * a WebPage about the mission (dateModified: the game data import) and the
 * breadcrumbs; no HowTo (there are no steps to give).
 */
export function buildMissionHead(
  data: MissionDetailResponse,
  routeSlug: string,
  origin: string,
  version?: GameVersion | null,
): PageHead {
  const m = data.mission
  const giver = missionGiver(m)
  const name = readableMissionText(m.mission_name, giver) || "Unknown mission"
  const title = `${missionTitle(m)} · Star Citizen Mission | SC Market`
  const summary = missionSummaryLine(m, data.blueprint_rewards)
  const description = summary.length > 160 ? `${summary.slice(0, 159).trimEnd()}…` : summary
  const canonical = `${origin}${GAME_DATA_PATHS.mission(routeSlug)}`
  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title: missionTitle(m),
        description,
        url: canonical,
        ogType: "article",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: missionTitle(m),
        description: summary,
        url: canonical,
        ...(gameDataDateModified(version) && { dateModified: gameDataDateModified(version) }),
        about: {
          "@type": "Thing",
          name,
          ...(m.mission_description && { description: readableMissionText(m.mission_description, giver).slice(0, 500) }),
        },
        isPartOf: { "@type": "WebSite", name: "SC Market", url: `${origin}/` },
      },
      breadcrumbJsonLd([
        { name: "SC Market", url: `${origin}/` },
        // No giver/faction step until those hubs exist (a filter URL is a
        // noindex variant, not a breadcrumb target).
        { name: "Missions", url: `${origin}${GAME_DATA_PATHS.missions}` },
        { name, url: canonical },
      ]),
    ],
  }
}

/** Name the manufacturer page shows: the display name, else the code. */
export function manufacturerDisplayName(
  m: Pick<WikiManufacturerDetail, "manufacturer" | "display_name">,
): string {
  return m.display_name || m.manufacturer
}

/**
 * /wiki/manufacturers/:id (WikiManufacturerPage). The canonical uses the
 * route param, as the page does.
 */
export function buildManufacturerHead(
  m: Pick<WikiManufacturerDetail, "manufacturer" | "display_name" | "item_count">,
  routeId: string,
  origin: string,
): PageHead {
  const name = manufacturerDisplayName(m)
  const title = `${name} — Star Citizen Manufacturer | SC Market`
  const description = `${name} manufactures ${m.item_count} items in Star Citizen. Browse their full product catalog on SC Market.`.slice(0, 160)
  const canonical = `${origin}${WIKI_PATHS.manufacturer(routeId)}`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
    ],
    jsonLd: [],
  }
}
