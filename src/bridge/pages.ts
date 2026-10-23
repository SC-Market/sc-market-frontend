/**
 * Per-route data sources and document builders for the edge bridge.
 *
 * Each page fetches at most ONE public, anonymous API GET (orgs add one
 * optional lookup so their JSON-LD matches the SPA's; the homepage, /wiki
 * and /wiki/locations need none) and turns the JSON into the same PageHead
 * the SPA page renders, plus a short visible plain-text summary for #root.
 * Hub pages add a bounded list of links to their top entries so crawlers
 * can walk from hubs to detail pages. URLs and response types mirror the generated clients
 * in src/store/api/** (types only; nothing here imports RTK or the browser).
 */
import type {
  BlueprintDetailResponse,
  BrowseShopsApiResponse,
  GetCommoditiesApiResponse,
  GetGameItemListingsResponse,
  GetListingDetailResponse,
  GetShipsApiResponse,
  LocationDetailResponse,
  MissionDetailResponse,
  OreDetailResponse,
  ResourceDetailResponse,
  SearchBlueprintsResponse,
  SearchListingsResponse,
  SearchLocationsResponse,
  SearchMissionsResponse,
  SearchOresResponse,
  SearchResourcesResponse,
  SearchWikiItemsResponse,
  ShopPublicResponse,
  WikiItemDetail,
  WikiManufacturerDetail,
  WikiManufacturerSearchResult,
  WikiShipDetail,
} from "../store/api/v2/market"
import type {
  GetContractorApiResponse,
  GetContractorsApiResponse,
} from "../store/api/contractors"
import type {
  GetRecruitingPostByIdApiResponse,
  GetRecruitingPostsApiResponse,
} from "../store/api/recruiting"
import {
  GAME_DATA_PATHS,
  MARKET_PATHS,
  ORG_PATHS,
  PATHS,
  SHOP_PATHS,
  WIKI_PATHS,
} from "../routes/paths"
import type { User } from "../datatypes/User"
import {
  buildBlueprintHead,
  buildCommodityHead,
  buildItemHead,
  buildMiningLocationHead,
  buildMissionHead,
  buildOreHead,
  buildResourceHead,
  buildShipHead,
  blueprintItemName,
  buildManufacturerHead,
  manufacturerDisplayName,
  miningDisplayName,
} from "../seo/gameDataHeads"
import {
  aggregateSeoDescription,
  buildAggregateHead,
  buildBundleHead,
  buildListingHead,
  buildOrgHead,
  buildRecruitingPostHead,
  buildShopHead,
  buildUserHead,
  orgPageTitle,
  shopSeoDescription,
  userPageTitle,
} from "../seo/entityHeads"
import {
  applyTitleTemplate,
  faqPageJsonLd,
  headDescription,
  PageHead,
} from "../seo/pageHead"
import {
  AnswerContent,
  buildCommodityAnswers,
  buildItemSummary,
  buildOreAnswers,
  buildShipSummary,
} from "../util/answerContent"
import {
  buildHomeHead,
  landingFaqs,
  MAIN_HUB_LINKS,
  type SeoLink,
} from "../seo/siteHeads"
import {
  blueprintsSeoText,
  buildHubHead,
  buildMarketSearchHead,
  contractorsSeoText,
  type HubCrumb,
  manufacturersSeoText,
  MAX_HUB_LINKS,
  MINING_CRUMB,
  miningSeoText,
  missionsSeoText,
  recruitingSeoText,
  resourcesSeoText,
  type SeoText,
  shopDirectorySeoText,
  WIKI_CRUMB,
  WIKI_HUB_SECTIONS,
  wikiCommoditiesSeoText,
  wikiHubSeoText,
  wikiItemsSeoText,
  wikiLocationsSeoText,
  wikiShipsSeoText,
} from "../seo/hubHeads"
import { englishT } from "./englishT"
import type { BridgePageKind } from "./routes"

/**
 * Visible summary block. Text is always inserted as escaped text; a "ul" is
 * a list of site-relative links (render.ts validates and bounds them).
 */
export type SummaryBlock =
  | { tag: "h1" | "h2" | "h3" | "p"; text: string }
  | { tag: "ul"; links: SeoLink[] }

/** What the bridge injects into the shell for one page. */
export interface BridgeDocument {
  /** Final <title> (titleTemplate applied). */
  title: string
  canonical: string
  head: PageHead
  summary: SummaryBlock[]
}

export interface PageContext {
  params: Record<string, string>
  /** Frontend origin (FRONTEND_URL). */
  origin: string
  /** Request path, for pages whose canonical is the current path. */
  pathname: string
}

/** One API GET a page depends on. */
export interface ApiRequest {
  /** Path on the API origin, already encoded. */
  path: string
  /** Upstream statuses that mean "this entity doesn't exist". */
  notFoundStatuses: readonly number[]
  /** Edge-cache lifetime for the JSON, seconds. */
  ttlSeconds: number
}

export interface BridgePage {
  /** The page's API call; omitted for static pages (build gets undefined). */
  primary?: (params: Record<string, string>) => ApiRequest
  /** Optional extra lookup; failures are ignored (value is undefined). */
  secondary?: (params: Record<string, string>) => ApiRequest
  build: (primary: unknown, secondary: unknown, ctx: PageContext) => BridgeDocument
}

/** v2 returns 404 for unknown entities. */
const V2_NOT_FOUND = [404] as const
/** v1 returns 400 ("Invalid user"/"Invalid contractor") or 404. */
const V1_NOT_FOUND = [400, 404] as const

/** Game data only changes on a patch import. */
const STATIC_GAME_DATA_TTL = 60 * 60
/** Game data pages that also carry live market prices / listing counts. */
const MARKET_GAME_DATA_TTL = 10 * 60
/** User-generated entities (listings, shops, orgs, users, posts). */
const ENTITY_TTL = 60

const SUMMARY_TEXT_MAX = 500

function enc(value: string): string {
  return encodeURIComponent(value)
}

function v2(path: string, ttlSeconds: number): ApiRequest {
  return { path: `/api/v2${path}`, notFoundStatuses: V2_NOT_FOUND, ttlSeconds }
}

function v1(path: string, ttlSeconds: number): ApiRequest {
  return { path, notFoundStatuses: V1_NOT_FOUND, ttlSeconds }
}

function truncate(text: string, max = SUMMARY_TEXT_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

function paragraphs(...texts: (string | null | undefined)[]): SummaryBlock[] {
  return texts
    .filter((t): t is string => !!t && t.trim() !== "")
    .map((text) => ({ tag: "p" as const, text: truncate(text) }))
}

function faqBlocks(answers: AnswerContent): SummaryBlock[] {
  if (answers.faqs.length === 0) return []
  return [
    { tag: "h2", text: englishT("seoAnswers.faqTitle", "Common questions") },
    ...answers.faqs.flatMap((faq): SummaryBlock[] => [
      { tag: "h3", text: faq.question },
      { tag: "p", text: faq.answer },
    ]),
  ]
}

/** A head from a page that sets its own <title> and canonical. */
function fromHead(
  head: PageHead,
  heading: string,
  body: SummaryBlock[],
  ctx: PageContext,
): BridgeDocument {
  return {
    title: applyTitleTemplate(head.title),
    canonical: head.canonical ?? `${ctx.origin}${ctx.pathname}`,
    head,
    summary: [{ tag: "h1", text: heading }, ...body],
  }
}

/** Adds the FAQPage JSON-LD the SPA's <AnswerFaqs> emits. */
function withFaqJsonLd(head: PageHead, answers: AnswerContent): PageHead {
  if (answers.faqs.length === 0) return head
  return { ...head, jsonLd: [...head.jsonLd, faqPageJsonLd(answers.faqs)] }
}

/**
 * Typed page definition. The API JSON is trusted to match the generated
 * response type, exactly as the SPA's RTK Query hooks trust it.
 */
function page<P, S = never>(def: {
  primary: (params: Record<string, string>) => ApiRequest
  secondary?: (params: Record<string, string>) => ApiRequest
  build: (primary: P, secondary: S | undefined, ctx: PageContext) => BridgeDocument
}): BridgePage {
  return {
    primary: def.primary,
    secondary: def.secondary,
    build: (primary, secondary, ctx) =>
      def.build(primary as P, secondary as S | undefined, ctx),
  }
}

const LANG = "en"

/** User-generated lists (market, shops, posts, orgs): short-lived. */
const ENTITY_LIST_TTL = 5 * 60

/** A hub's list call: no "not found" status (any non-200 fails open). */
function v2List(path: string, ttlSeconds: number): ApiRequest {
  return { path: `/api/v2${path}`, notFoundStatuses: [], ttlSeconds }
}

function v1List(path: string, ttlSeconds: number): ApiRequest {
  return { path, notFoundStatuses: [], ttlSeconds }
}

/** v1 wraps every body in `data` (see GetContractorApiResponse). */
type V1<T> = { data: T }

/** Bounded, de-duplicated link list (by href). */
function linkList(links: SeoLink[]): SeoLink[] {
  const seen = new Set<string>()
  const out: SeoLink[] = []
  for (const link of links) {
    if (!link.text || seen.has(link.href)) continue
    seen.add(link.href)
    out.push({ href: link.href, text: truncate(link.text, 120) })
    if (out.length >= MAX_HUB_LINKS) break
  }
  return out
}

function linkBlocks(heading: string, links: SeoLink[]): SummaryBlock[] {
  return links.length > 0 ? [{ tag: "h2", text: heading }, { tag: "ul", links }] : []
}

function aUEC(value: number | null | undefined): string | null {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value).toLocaleString("en-US")} aUEC`
    : null
}

/** A hub page: shared SPA title/description + bridge-only JSON-LD and links. */
function hubDoc(
  opts: {
    text: SeoText
    path: string
    name: string
    parents?: HubCrumb[]
    intro?: (string | null | undefined)[]
    linksHeading?: string
    links?: SeoLink[]
  },
  ctx: PageContext,
): BridgeDocument {
  const links = linkList(opts.links ?? [])
  const head = buildHubHead(
    { text: opts.text, path: opts.path, name: opts.name, parents: opts.parents, links },
    ctx.origin,
  )
  return {
    title: applyTitleTemplate(head.title),
    canonical: head.canonical ?? `${ctx.origin}${opts.path}`,
    head,
    summary: [
      { tag: "h1", text: opts.name },
      ...paragraphs(opts.text.description, ...(opts.intro ?? [])),
      ...linkBlocks(opts.linksHeading ?? "Browse", links),
    ],
  }
}

/** Pages with no API call: build gets `undefined`. */
function staticPage(build: (ctx: PageContext) => BridgeDocument): BridgePage {
  return { build: (_p, _s, ctx) => build(ctx) }
}

const HUB_PAGES: Record<
  | "home"
  | "market"
  | "shops"
  | "wikiHub"
  | "wikiItems"
  | "wikiShips"
  | "wikiCommodities"
  | "wikiLocations"
  | "wikiManufacturers"
  | "miningOres"
  | "miningLocations"
  | "blueprints"
  | "missions"
  | "resources"
  | "recruiting"
  | "contractors",
  BridgePage
> = {
  home: staticPage((ctx) => {
    const head = buildHomeHead(englishT, ctx.origin)
    const faqs = landingFaqs(englishT)
    return {
      title: applyTitleTemplate(head.title),
      canonical: head.canonical ?? `${ctx.origin}/`,
      head,
      summary: [
        { tag: "h1", text: "SC Market — the Star Citizen marketplace" },
        ...paragraphs(headDescription(head)),
        ...linkBlocks("Browse SC Market", [...MAIN_HUB_LINKS]),
        { tag: "h2", text: englishT("landing.faqTitle", "Your questions, answered") },
        ...faqs.flatMap((faq): SummaryBlock[] => [
          { tag: "h3", text: faq.question },
          { tag: "p", text: faq.answer },
        ]),
      ],
    }
  }),

  // ListingSearchV2's default query (page 1, quantity_min 1); its head is
  // the shared builder's, so it matches the SPA's (incl. og:/twitter:).
  market: page<SearchListingsResponse>({
    primary: () =>
      v2List(`/listings/search?page=1&page_size=${MAX_HUB_LINKS}&quantity_min=1`, ENTITY_LIST_TTL),
    build: (data, _s, ctx) => {
      const head = buildMarketSearchHead({ total: data.total }, ctx.origin)
      const links = linkList(
        data.listings.map((l) => ({
          href: MARKET_PATHS.listing(l.listing_id, l.title),
          text: [l.title, aUEC(l.price_min), l.shop_name].filter(Boolean).join(" — "),
        })),
      )
      return {
        title: applyTitleTemplate(head.title),
        canonical: head.canonical ?? `${ctx.origin}${MARKET_PATHS.search}`,
        head: {
          ...head,
          jsonLd: buildHubHead(
            { text: { title: head.title ?? "", description: headDescription(head) }, path: MARKET_PATHS.search, name: "Market", links },
            ctx.origin,
          ).jsonLd,
        },
        summary: [
          { tag: "h1", text: "Star Citizen Marketplace" },
          ...paragraphs(headDescription(head)),
          ...linkBlocks("Latest listings", links),
        ],
      }
    },
  }),

  shops: page<BrowseShopsApiResponse>({
    primary: () =>
      v2List(`/shops?page=1&page_size=${MAX_HUB_LINKS}&sort_by=rating&sort_order=desc`, ENTITY_LIST_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: shopDirectorySeoText(null, data.total),
          path: MARKET_PATHS.shops,
          name: "Browse Shops",
          linksHeading: "Top rated shops",
          links: data.shops.map((shop) => ({
            href: SHOP_PATHS.profile(enc(shop.slug)),
            text: shop.name,
          })),
        },
        ctx,
      ),
  }),

  wikiHub: staticPage((ctx) => {
    const text = wikiHubSeoText(englishT)
    return hubDoc(
      {
        text,
        path: WIKI_PATHS.hub,
        name: text.header,
        linksHeading: "Sections",
        links: WIKI_HUB_SECTIONS.map((section) => ({
          href: section.route,
          text: englishT(section.labelKey, section.label),
        })),
      },
      ctx,
    )
  }),

  wikiItems: page<SearchWikiItemsResponse>({
    primary: () =>
      v2List(`/game-data/wiki/items?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: wikiItemsSeoText(null, data.total),
          path: WIKI_PATHS.items,
          name: "Game Items Database",
          parents: [WIKI_CRUMB],
          linksHeading: "Items",
          links: data.items.map((item) => ({
            href: WIKI_PATHS.item(item.id, item.name),
            text: [item.name, item.type].filter(Boolean).join(" — "),
          })),
        },
        ctx,
      ),
  }),

  wikiShips: page<GetShipsApiResponse>({
    primary: () =>
      v2List(`/game-data/wiki/ships?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: wikiShipsSeoText(null, data.total),
          path: WIKI_PATHS.ships,
          name: "Ships & Vehicles",
          parents: [WIKI_CRUMB],
          linksHeading: "Ships and vehicles",
          links: data.ships.map((ship) => ({
            href: WIKI_PATHS.ship(ship.id, ship.name),
            // ship.manufacturer is a short code ("aegs"); the name says it.
            text: ship.name,
          })),
        },
        ctx,
      ),
  }),

  wikiCommodities: page<GetCommoditiesApiResponse>({
    primary: () =>
      v2List(`/game-data/wiki/commodities?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: wikiCommoditiesSeoText(null, data.total),
          path: WIKI_PATHS.commodities,
          name: "Commodities",
          parents: [WIKI_CRUMB],
          linksHeading: "Commodities",
          links: data.commodities.map((c) => ({
            href: WIKI_PATHS.commodity(c.resource_id, c.name),
            text: [c.name, c.resource_category].filter(Boolean).join(" — "),
          })),
        },
        ctx,
      ),
  }),

  // The location tree is shown inline (no per-location wiki route), so this
  // hub links to the mining locations instead of making an API call.
  wikiLocations: staticPage((ctx) =>
    hubDoc(
      {
        text: wikiLocationsSeoText(englishT),
        path: WIKI_PATHS.locations,
        name: englishT("wiki.locations.title", "Star Map & Locations"),
        parents: [WIKI_CRUMB],
        intro: ["Systems, planets, moons, stations and their amenities in Star Citizen."],
        linksHeading: "Related",
        links: [
          { href: GAME_DATA_PATHS.miningLocations, text: "Mining locations" },
          { href: WIKI_PATHS.hub, text: "Game database" },
        ],
      },
      ctx,
    ),
  ),

  // The list includes paint/livery codes with 1 item; the most prolific
  // manufacturers first keeps the links meaningful.
  wikiManufacturers: page<WikiManufacturerSearchResult[]>({
    primary: () => v2List(`/game-data/wiki/manufacturers`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: manufacturersSeoText(englishT),
          path: WIKI_PATHS.manufacturers,
          name: englishT("wiki.manufacturers.title", "Manufacturers"),
          parents: [WIKI_CRUMB],
          intro: [`${data.length} manufacturers in the Star Citizen game database.`],
          linksHeading: "Manufacturers",
          links: [...data]
            .sort((a, b) => b.item_count - a.item_count)
            .slice(0, MAX_HUB_LINKS)
            .map((m) => ({
              href: WIKI_PATHS.manufacturer(enc(m.manufacturer)),
              text: `${manufacturerDisplayName(m)} — ${m.item_count} items`,
            })),
        },
        ctx,
      ),
  }),

  miningOres: page<SearchOresResponse>({
    primary: () =>
      v2List(`/game-data/mining/ores?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: miningSeoText(englishT),
          path: GAME_DATA_PATHS.mining,
          name: englishT("mining.title", "Mining Database"),
          intro: [`${data.total} minable ores in Star Citizen: locations, rarity and market prices.`],
          linksHeading: "Ores",
          links: [
            ...data.ores.map((ore) => ({
              href: GAME_DATA_PATHS.miningOre(enc(ore.name)),
              text: miningDisplayName(ore.displayName, ore.name),
            })),
            { href: GAME_DATA_PATHS.miningLocations, text: "Mining locations" },
          ],
        },
        ctx,
      ),
  }),

  miningLocations: page<SearchLocationsResponse>({
    primary: () =>
      v2List(`/game-data/mining/locations?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: miningSeoText(englishT),
          path: GAME_DATA_PATHS.miningLocations,
          name: "Mining Locations",
          parents: [MINING_CRUMB],
          intro: [`${data.total} mining locations in Star Citizen and the ores found there.`],
          linksHeading: "Locations",
          links: data.locations.map((loc) => ({
            href: GAME_DATA_PATHS.miningLocation(enc(loc.name)),
            text: [miningDisplayName(loc.displayName, loc.name), loc.system].filter(Boolean).join(" — "),
          })),
        },
        ctx,
      ),
  }),

  blueprints: page<SearchBlueprintsResponse>({
    primary: () =>
      v2List(`/game-data/blueprints/search?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: blueprintsSeoText(null, data.total),
          path: GAME_DATA_PATHS.blueprints,
          name: "Crafting Blueprints",
          linksHeading: "Blueprints",
          links: data.blueprints.map((bp) => ({
            href: GAME_DATA_PATHS.blueprint(enc(bp.blueprint_code)),
            text: bp.output_item_name || bp.blueprint_name,
          })),
        },
        ctx,
      ),
  }),

  missions: page<SearchMissionsResponse>({
    primary: () =>
      v2List(`/game-data/missions/search?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: missionsSeoText(null, data.total),
          path: GAME_DATA_PATHS.missions,
          name: "Missions",
          linksHeading: "Missions",
          links: data.missions.map((m) => ({
            href: GAME_DATA_PATHS.mission(enc(m.mission_code)),
            // category is a translation key ("missiontype.delivery").
            text: m.mission_name,
          })),
        },
        ctx,
      ),
  }),

  resources: page<SearchResourcesResponse>({
    primary: () =>
      v2List(`/game-data/resources/search?page=1&page_size=${MAX_HUB_LINKS}`, MARKET_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      hubDoc(
        {
          text: resourcesSeoText(englishT),
          path: GAME_DATA_PATHS.resources,
          name: englishT("resources.title", "Resources"),
          intro: [`${data.total} Star Citizen resources: where to mine, buy, salvage or loot them.`],
          linksHeading: "Resources",
          links: data.resources.map((r) => ({
            href: GAME_DATA_PATHS.resource(r.resource_id, r.resource_name),
            text: [r.resource_name, r.resource_category].filter(Boolean).join(" — "),
          })),
        },
        ctx,
      ),
  }),

  // Recruiting's default sort ("activity"), first page.
  recruiting: page<V1<GetRecruitingPostsApiResponse>>({
    primary: () =>
      v1List(`/api/recruiting/posts?index=0&pageSize=${MAX_HUB_LINKS}&sorting=activity`, ENTITY_LIST_TTL),
    build: ({ data }, _s, ctx) =>
      hubDoc(
        {
          text: recruitingSeoText(),
          path: PATHS.recruiting,
          name: "Recruiting Orgs",
          linksHeading: "Recruiting posts",
          links: data.items.map((post) => ({
            href: `/recruiting/post/${enc(post.post_id)}`,
            text: [post.title, post.contractor?.name].filter(Boolean).join(" — "),
          })),
        },
        ctx,
      ),
  }),

  // Contractors' default sort ("date-reverse"), first page.
  contractors: page<V1<GetContractorsApiResponse>>({
    primary: () =>
      v1List(`/api/contractors?index=0&pageSize=${MAX_HUB_LINKS}&sorting=date-reverse`, ENTITY_LIST_TTL),
    build: ({ data }, _s, ctx) =>
      hubDoc(
        {
          text: contractorsSeoText(englishT),
          path: PATHS.contractors,
          name: englishT("contractorsPage.title", "Contractors"),
          intro: [`${Number(data.total)} Star Citizen organizations and contractors on SC Market.`],
          linksHeading: "Organizations",
          links: data.items.map((c) => ({
            href: ORG_PATHS.profile(enc(c.spectrum_id)),
            text: c.name,
          })),
        },
        ctx,
      ),
  }),
}

const MARKET_DETAIL_PAGES: Record<"aggregate" | "bundle" | "manufacturer", BridgePage> = {
  // Title and canonical come from the page layout (the request path).
  aggregate: page<GetGameItemListingsResponse>({
    primary: (p) => v2(`/game-items/${enc(p.id)}/listings`, ENTITY_TTL),
    build: (data, _s, ctx) => {
      const item = data.game_item
      const head = buildAggregateHead({ ...item, description: "" }, data.listings.length, ctx.origin)
      const prices = data.listings.map((l) => l.price).filter((p) => Number.isFinite(p))
      const shops = new Set(data.listings.map((l) => l.shop_slug)).size
      return {
        title: applyTitleTemplate(head.title),
        canonical: `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: item.name },
          ...paragraphs(
            aggregateSeoDescription(item.name),
            prices.length > 0
              ? `${data.total} listings from ${shops} shops, ${aUEC(Math.min(...prices))} to ${aUEC(Math.max(...prices))}.`
              : "No active listings right now.",
          ),
          ...linkBlocks(
            "Listings",
            linkList(
              data.listings.map((l) => ({
                href: MARKET_PATHS.listing(l.listing_id, l.title),
                text: [l.title, aUEC(l.price), l.shop_name].filter(Boolean).join(" — "),
              })),
            ),
          ),
        ],
      }
    },
  }),

  // Same endpoint as /market/:id; title and canonical come from the layout.
  bundle: page<GetListingDetailResponse>({
    primary: (p) => v2(`/listings/${enc(p.id)}`, ENTITY_TTL),
    build: (data, _s, ctx) => {
      const head = buildBundleHead(data, ctx.origin)
      const items = data.items.map((i) => i.game_item.name).filter(Boolean)
      return {
        title: applyTitleTemplate(data.listing.title || "Bundle Listing"),
        canonical: `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: data.listing.title },
          ...paragraphs(
            data.listing.description,
            items.length > 0 ? `Includes: ${items.join(", ")}.` : null,
            `Sold by ${data.seller.name} on SC Market.`,
          ),
          ...linkBlocks("Seller", [
            { href: SHOP_PATHS.profile(enc(data.seller.slug)), text: data.seller.name },
          ]),
        ],
      }
    },
  }),

  manufacturer: page<WikiManufacturerDetail>({
    primary: (p) => v2(`/game-data/wiki/manufacturers/${enc(p.id)}`, STATIC_GAME_DATA_TTL),
    build: (m, _s, ctx) => {
      const head = buildManufacturerHead(m, ctx.params.id, ctx.origin)
      return fromHead(
        head,
        manufacturerDisplayName(m),
        [
          ...paragraphs(m.description?.replace(/\\n/g, " ") || headDescription(head)),
          ...linkBlocks(
            "Products",
            linkList(
              m.items.map((item) => ({
                href: WIKI_PATHS.item(item.id, item.name),
                text: [item.name, item.type].filter(Boolean).join(" — "),
              })),
            ),
          ),
        ],
        ctx,
      )
    },
  }),
}


export const BRIDGE_PAGES: Record<BridgePageKind, BridgePage> = {
  commodity: page<ResourceDetailResponse>({
    primary: (p) => v2(`/game-data/resources/${enc(p.id)}`, MARKET_GAME_DATA_TTL),
    build: (data, _s, ctx) => {
      const answers = buildCommodityAnswers(data, englishT, LANG)
      const head = withFaqJsonLd(buildCommodityHead(data, ctx.origin), answers)
      return fromHead(
        head,
        data.resource.resource_name,
        [...paragraphs(answers.summary), ...faqBlocks(answers)],
        ctx,
      )
    },
  }),

  resource: page<ResourceDetailResponse>({
    primary: (p) =>
      v2(`/game-data/resources/${enc(p.resource_id)}`, MARKET_GAME_DATA_TTL),
    build: (data, _s, ctx) => {
      const answers = buildCommodityAnswers(data, englishT, LANG)
      return fromHead(
        buildResourceHead(data, ctx.origin),
        data.resource.resource_name,
        paragraphs(answers.summary),
        ctx,
      )
    },
  }),

  item: page<WikiItemDetail>({
    primary: (p) => v2(`/game-data/wiki/items/${enc(p.id)}`, MARKET_GAME_DATA_TTL),
    build: (item, _s, ctx) =>
      fromHead(
        buildItemHead(item, ctx.origin),
        item.name,
        paragraphs(buildItemSummary(item, englishT)),
        ctx,
      ),
  }),

  ship: page<WikiShipDetail>({
    primary: (p) => v2(`/game-data/wiki/ships/${enc(p.id)}`, STATIC_GAME_DATA_TTL),
    build: (ship, _s, ctx) =>
      fromHead(
        buildShipHead(ship, ctx.origin),
        ship.name,
        paragraphs(buildShipSummary(ship, englishT), ship.description),
        ctx,
      ),
  }),

  ore: page<OreDetailResponse>({
    primary: (p) => v2(`/game-data/mining/ores/${enc(p.name)}`, STATIC_GAME_DATA_TTL),
    build: (ore, _s, ctx) => {
      const answers = buildOreAnswers(ore, englishT, LANG)
      const head = withFaqJsonLd(buildOreHead(ore, ctx.params.name, ctx.origin), answers)
      return fromHead(
        head,
        miningDisplayName(ore.displayName, ctx.params.name),
        [...paragraphs(answers.summary), ...faqBlocks(answers)],
        ctx,
      )
    },
  }),

  miningLocation: page<LocationDetailResponse>({
    primary: (p) =>
      v2(`/game-data/mining/locations/${enc(p.name)}`, STATIC_GAME_DATA_TTL),
    build: (loc, _s, ctx) => {
      const head = buildMiningLocationHead(loc, ctx.params.name, ctx.origin)
      return fromHead(
        head,
        miningDisplayName(loc.displayName, ctx.params.name),
        paragraphs(headDescription(head)),
        ctx,
      )
    },
  }),

  blueprint: page<BlueprintDetailResponse>({
    primary: (p) => v2(`/game-data/blueprints/${enc(p.slug)}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) => {
      const head = buildBlueprintHead(data, ctx.params.slug, ctx.origin)
      const ingredients = (data.ingredients || [])
        .map((ing) => ing.game_item?.name || ing.slot_name)
        .filter(Boolean)
      return fromHead(
        head,
        blueprintItemName(data),
        paragraphs(
          headDescription(head),
          ingredients.length > 0 ? `Ingredients: ${ingredients.join(", ")}.` : null,
        ),
        ctx,
      )
    },
  }),

  mission: page<MissionDetailResponse>({
    primary: (p) => v2(`/game-data/missions/${enc(p.slug)}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) => {
      const head = buildMissionHead(data, ctx.params.slug, ctx.origin)
      return fromHead(
        head,
        data.mission.mission_name,
        paragraphs(data.mission.mission_description || headDescription(head)),
        ctx,
      )
    },
  }),

  listing: page<GetListingDetailResponse>({
    primary: (p) => v2(`/listings/${enc(p.id)}`, ENTITY_TTL),
    build: (data, _s, ctx) =>
      fromHead(
        buildListingHead(data, ctx.origin),
        data.listing.title,
        paragraphs(data.listing.description, `Sold by ${data.seller.name} on SC Market.`),
        ctx,
      ),
  }),

  shop: page<ShopPublicResponse>({
    primary: (p) => v2(`/shops/${enc(p.slug)}`, ENTITY_TTL),
    build: (shop, _s, ctx) =>
      fromHead(
        buildShopHead(shop, ctx.origin),
        shop.name,
        paragraphs(shop.description || shopSeoDescription(shop)),
        ctx,
      ),
  }),

  // Title and canonical come from the page layout (BannerPageLayout → Page):
  // orgPageTitle and the current path.
  org: page<GetContractorApiResponse, ShopPublicResponse[]>({
    primary: (p) => v1(`/api/contractors/${enc(p.id)}`, ENTITY_TTL),
    // OrgMetaTags' useGetShopsByOwnerQuery, for the JSON-LD `owns` link.
    secondary: (p) =>
      v2(`/shops/by-owner?spectrum_id=${enc(p.id)}`, ENTITY_TTL),
    build: ({ data: contractor }, shops, ctx) => {
      const head = buildOrgHead(contractor, shops?.[0], ctx.origin)
      return {
        title: applyTitleTemplate(
          orgPageTitle(contractor.name, englishT("org.orgTitle")),
        ),
        canonical: `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: contractor.name },
          ...paragraphs(contractor.description || headDescription(head)),
        ],
      }
    },
  }),

  // Same as org: title and canonical come from the layout.
  user: page<User>({
    primary: (p) => v1(`/api/profile/user/${enc(p.username)}`, ENTITY_TTL),
    build: (user, _s, ctx) => {
      const head = buildUserHead(user, ctx.origin)
      return {
        title: applyTitleTemplate(
          userPageTitle(user.display_name, englishT("viewProfile.store_tab")),
        ),
        canonical: `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: user.display_name || user.username },
          ...paragraphs(user.profile_description || headDescription(head)),
        ],
      }
    },
  }),

  recruitingPost: page<GetRecruitingPostByIdApiResponse>({
    primary: (p) => v1(`/api/recruiting/posts/${enc(p.post_id)}`, ENTITY_TTL),
    build: ({ data: post }, _s, ctx) =>
      fromHead(
        buildRecruitingPostHead(post, ctx.origin),
        post.title,
        paragraphs(
          post.body,
          post.contractor?.name ? `Posted by ${post.contractor.name}.` : null,
        ),
        ctx,
      ),
  }),

  ...MARKET_DETAIL_PAGES,
  ...HUB_PAGES,
}
