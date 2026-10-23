/**
 * Head (title/meta/canonical/JSON-LD) builders for game-data detail pages.
 * Used by the pages (via <SeoHead>) and by the edge bridge, so the SPA and
 * the crawler-facing HTML can't drift. Pure: no React, no browser globals.
 *
 * `origin` is the frontend origin (FRONTEND_URL in the SPA).
 */
import type {
  BlueprintDetailResponse,
  BlueprintIngredient,
  LocationDetailResponse,
  MissionDetailResponse,
  OreDetailResponse,
  ResourceDetailResponse,
  WikiItemDetail,
  WikiManufacturerDetail,
  WikiShipDetail,
} from "../store/api/v2/market"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../routes/paths"
import { PageHead, socialMeta } from "./pageHead"

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

/** /wiki/items/:id (WikiItemDetail). */
export function buildItemHead(item: WikiItemDetail, origin: string): PageHead {
  const title = `${item.name} — Star Citizen Item | SC Market`
  const description = `${item.name} — ${item.type || "equipment"} item${item.manufacturer ? " by " + item.manufacturer : ""}. View stats, market price, crafting uses, and locations in Star Citizen.`.slice(0, 160)
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
        ...(item.manufacturer && {
          manufacturer: { "@type": "Organization", name: item.manufacturer },
        }),
      },
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

/** /missions/:slug (MissionDetail, the full-page variant). */
export function buildMissionHead(
  data: MissionDetailResponse,
  routeSlug: string,
  origin: string,
): PageHead {
  const m = data.mission
  const title = `${m.mission_name} — Star Citizen Mission | SC Market`
  const description = `${m.mission_name} — ${m.category || ""} mission${m.star_system ? " in " + m.star_system : ""}. Rewards, objectives, and walkthrough in Star Citizen.`.slice(0, 160)
  const canonical = `${origin}${GAME_DATA_PATHS.mission(routeSlug)}`

  return {
    title,
    canonical,
    meta: [
      { name: "description", content: description },
      ...socialMeta({
        title,
        description,
        ogDescription:
          m.mission_description?.slice(0, 160) ||
          `${m.mission_name} — Star Citizen mission`,
        url: canonical,
        ogType: "article",
        twitterCard: "summary",
      }),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: m.mission_name,
        description: m.mission_description || description,
        ...(m.credit_reward_max && {
          estimatedCost: {
            "@type": "MonetaryAmount",
            currency: "aUEC",
            value: m.credit_reward_max,
          },
        }),
        ...(m.star_system && {
          location: { "@type": "Place", name: m.star_system },
        }),
      },
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
