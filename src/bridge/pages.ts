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
  ActiveVersionsResponse,
  GameVersion,
  MissionBlueprintReward,
  BlueprintDetailResponse,
  BrowseShopsApiResponse,
  GetCommoditiesApiResponse,
  GetGameItemListingsResponse,
  GetListingDetailResponse,
  GetShipsApiResponse,
  ItemAcquisitionDocument,
  LocationDetailResponse,
  MissionDetailResponse,
  MissionHubDetailResponse,
  MissionHubKind,
  MissionHubsResponse,
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
  formatAuecShort,
  listingPriceLabel,
  listingPriceRange,
  listingQuantity,
  orgPageTitle,
  sellerRatingLabel,
  shopSeoDescription,
  userPageTitle,
} from "../seo/entityHeads"
import { pagedPath } from "../seo/queryIndexing"
import {
  acquisitionBlueprintPath,
  acquisitionMissionPath,
  acquisitionSections,
  blueprintFacts,
  blueprintLabel,
  formatAmount,
  hasAcquisitionInfo,
  ingredientAmount,
  ingredientPath,
  locationLines,
  missionLine,
  resourceMethods,
} from "../seo/itemAcquisition"
import {
  dropPercent,
  formatPercent,
  freshnessStamp,
  gameDataDateModified,
  missionGiver,
  missionRewardRange,
  missionsCapabilityText,
  missionSummaryLine,
  missionTitle,
  missionType,
  readableMissionText,
} from "../seo/missionText"
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
import {
  buildMissionHubHead,
  buildMissionHubIndexHead,
  MISSION_HUB_KINDS,
  MISSION_HUB_PAGE_SIZE,
  missionCountText,
  missionHubCrumbs,
  missionHubIndexText,
  missionHubIntro,
  missionHubKindLabel,
  missionHubLink,
  missionHubMissionLink,
  missionHubText,
} from "../seo/missionHubs"
import { englishT } from "./englishT"
import { MAX_SUMMARY_LINKS } from "./render"
import type { BridgePageKind } from "./routes"
import { CONTENT_PAGES } from "./contentPages"

/**
 * Visible summary block. Text is always inserted as escaped text; a "ul" is
 * a list of site-relative links (render.ts validates and bounds them).
 */
export type SummaryBlock =
  | { tag: "h1" | "h2" | "h3" | "p"; text: string }
  /** One link to an allowlisted off-site URL (render.ts checks it: SC Orgs, the open-data feed). */
  | { tag: "external"; href: string; text: string }
  | { tag: "ul"; links: SummaryLink[] }
  /** Plain-text list items (guide steps and bullet lists). */
  | { tag: "ol" | "ul-text"; items: string[] }

/** A summary link; `rel` marks a hub's previous/next page. */
export type SummaryLink = SeoLink & { rel?: "prev" | "next" }

/** What the bridge injects into the shell for one page. */
export interface BridgeDocument {
  /** Final <title> (titleTemplate applied). */
  title: string
  canonical: string
  head: PageHead
  summary: SummaryBlock[]
  /**
   * The entity exists but isn't a page anyone should land on: 404 (sold,
   * expired, inactive, an unknown tab, a hub page past the end) or 410
   * (cancelled: the seller deleted it). Served like an unknown entity: the
   * shell with robots noindex, no summary.
   */
  status?: 404 | 410
}

export interface PageContext {
  params: Record<string, string>
  /** Frontend origin (FRONTEND_URL). */
  origin: string
  /** Request path, for pages whose canonical is the current path. */
  pathname: string
  /** `?page=N` of a paginated hub (1 when absent; only `paginated` pages see N > 1). */
  pageNumber: number
  /**
   * The page's `related` lookups that succeeded, by key. Missing keys failed
   * (timeout, 5xx, 404) or weren't requested: builders must work without them.
   */
  related: Record<string, unknown>
}

/** One API GET a page depends on. */
export interface ApiRequest {
  /** Path on the API origin, already encoded. */
  path: string
  /** Another public API's origin (related lookups only), e.g. SC Orgs. */
  origin?: string
  /** Upstream statuses that mean "this entity doesn't exist". */
  notFoundStatuses: readonly number[]
  /** Edge-cache lifetime for the JSON, seconds. */
  ttlSeconds: number
}

/** Follow-up lookups that depend on earlier answers, by key (null/undefined: skip). */
export type RelatedStage = (
  primary: unknown,
  secondary: unknown,
  related: Record<string, unknown>,
  params: Record<string, string>,
) => Record<string, ApiRequest | null | undefined>

export interface BridgePage {
  /**
   * The page's API call; omitted for static pages (build gets undefined).
   * `pageNumber` is the hub page (always 1 unless `paginated`).
   */
  primary?: (params: Record<string, string>, pageNumber?: number) => ApiRequest
  /** Optional extra lookup; failures are ignored (value is undefined). */
  secondary?: (params: Record<string, string>) => ApiRequest
  /**
   * Instead of `primary`: a static JSON file of this deployment (read through
   * env.ASSETS), passed to build as `primary`. A missing file, or `null` here
   * (params that can't name a file), means "doesn't exist".
   */
  asset?: (params: Record<string, string>) => string | null
  /**
   * Extra lookups (related listings, the seller's other listings...), run in
   * order after primary/secondary; each stage sees the earlier answers. Every
   * one is edge-cached and fails open: a failed lookup is just missing from
   * ctx.related.
   */
  related?: RelatedStage[]
  /** Serves `?page=N` (N >= 2) as its own self-canonical page. */
  paginated?: boolean
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
function page<P, S = never, R extends Record<string, unknown> = Record<string, never>>(def: {
  primary: (params: Record<string, string>, pageNumber?: number) => ApiRequest
  secondary?: (params: Record<string, string>) => ApiRequest
  related?: ((
    primary: P,
    secondary: S | undefined,
    related: Partial<R>,
    params: Record<string, string>,
  ) => { [K in keyof R]?: ApiRequest | null })[]
  paginated?: boolean
  build: (
    primary: P,
    secondary: S | undefined,
    ctx: PageContext & { related: Partial<R> },
  ) => BridgeDocument
}): BridgePage {
  return {
    primary: def.primary,
    secondary: def.secondary,
    paginated: def.paginated,
    related: def.related?.map(
      (stage): RelatedStage =>
        (primary, secondary, related, params) =>
          stage(primary as P, secondary as S | undefined, related as Partial<R>, params) as Record<
            string,
            ApiRequest | null | undefined
          >,
    ),
    build: (primary, secondary, ctx) =>
      def.build(primary as P, secondary as S | undefined, ctx as PageContext & { related: Partial<R> }),
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
    /** Blocks after the links, e.g. a sister-site pointer. */
    after?: SummaryBlock[]
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
      ...(opts.after ?? []),
    ],
  }
}


/** An API array, or [] when a lookup answered with something else. */
function arr<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

/** Total pages of a hub list. */
function hubPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
}

/**
 * Crawlable pagination for a hub: previous/next (rel), the first and last
 * page, the pages around this one and a spread of the rest, so every page is
 * a few hops from the hub.
 */
function paginationBlocks(path: string, pageNumber: number, totalPages: number): SummaryBlock[] {
  if (totalPages <= 1) return []
  const links: SummaryLink[] = []
  if (pageNumber > 1) {
    links.push({ href: pagedPath(path, pageNumber - 1), text: `Previous page (${pageNumber - 1})`, rel: "prev" })
  }
  if (pageNumber < totalPages) {
    links.push({ href: pagedPath(path, pageNumber + 1), text: `Next page (${pageNumber + 1})`, rel: "next" })
  }
  const pages = new Set<number>([1, totalPages])
  for (let n = pageNumber - 5; n <= pageNumber + 5; n++) {
    if (n >= 1 && n <= totalPages) pages.add(n)
  }
  const step = Math.max(10, Math.ceil(totalPages / 20))
  for (let n = step; n < totalPages; n += step) pages.add(n)
  for (const n of [...pages].sort((a, b) => a - b)) {
    if (n !== pageNumber) links.push({ href: pagedPath(path, n), text: `Page ${n}` })
  }
  return [{ tag: "h2", text: `Page ${pageNumber} of ${totalPages}` }, { tag: "ul", links }]
}

/** "Title | SC Market" → "Title — Page 3 | SC Market". */
function pageTitle(title: string, pageNumber: number): string {
  const suffix = ` — Page ${pageNumber}`
  return / \| SC Market$/.test(title)
    ? title.replace(/ \| SC Market$/, `${suffix} | SC Market`)
    : `${title}${suffix}`
}

/**
 * Page `ctx.pageNumber` of a paginated hub: page 1 is the hub as is (plus
 * the page links); page N is self-canonical (`?page=N`) with "Page N" in its
 * title; a page past the end is a 404.
 */
function paginate(
  doc: BridgeDocument,
  opts: { path: string; total: number; pageSize: number },
  ctx: PageContext,
): BridgeDocument {
  const totalPages = hubPageCount(opts.total, opts.pageSize)
  const n = ctx.pageNumber
  if (n > totalPages) return { ...doc, status: 404 }
  const summary = [...doc.summary, ...paginationBlocks(opts.path, n, totalPages)]
  if (n === 1) return { ...doc, summary }
  const oldCanonical = doc.canonical
  const canonical = `${ctx.origin}${pagedPath(opts.path, n)}`
  const title = pageTitle(doc.head.title ?? doc.title, n)
  const meta = doc.head.meta.map((m) => {
    const key = m.name ?? m.property
    if (key === "og:url" || key === "twitter:url") return { ...m, content: canonical }
    if (key === "og:title" || key === "twitter:title") return { ...m, content: pageTitle(m.content, n) }
    if (key === "description" || key === "og:description" || key === "twitter:description") {
      return { ...m, content: `${m.content} Page ${n} of ${totalPages}.` }
    }
    return m
  })
  const jsonLd = doc.head.jsonLd.map((data) =>
    "url" in data && data.url === oldCanonical ? { ...data, url: canonical } : data,
  )
  return {
    ...doc,
    title: applyTitleTemplate(title),
    canonical,
    head: { ...doc.head, title, canonical, meta, jsonLd },
    summary,
  }
}

/** A listing link with its price and seller, for related/seller lists. */
function listingLink(l: {
  listing_id: string
  title: string
  price_min?: number | null
  shop_name?: string | null
}): SeoLink {
  return {
    href: MARKET_PATHS.listing(l.listing_id, l.title),
    text: [l.title, aUEC(Number(l.price_min)), l.shop_name].filter(Boolean).join(" — "),
  }
}

/** Listing links from a search answer, minus `exclude` (by listing id). */
function searchLinks(
  listings: SearchListingsResponse["listings"] | undefined,
  exclude: ReadonlySet<string>,
  max: number,
): SeoLink[] {
  return (Array.isArray(listings) ? listings : [])
    .filter((l) => !exclude.has(l.listing_id))
    .slice(0, max)
    .map(listingLink)
}

/** Public listings search: active, in stock. */
function listingSearch(params: Record<string, string | number>, ttl = ENTITY_LIST_TTL): ApiRequest {
  const query = new URLSearchParams({ page: "1", quantity_min: "1" })
  for (const [key, value] of Object.entries(params)) query.set(key, String(value))
  return v2List(`/listings/search?${query.toString()}`, ttl)
}

/** "30 Oct 2026" (UTC), null for a missing or bad date. */
function shortDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
}

/** "Key: value" facts, dropping empty values. */
function facts(entries: [string, string | number | null | undefined][]): string[] {
  return entries
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
}

/** Listings section of a game item's page (wiki item, ship, commodity). */
function itemListingBlocks(name: string, gameItemId: string, listings: SearchListingsResponse | undefined): SummaryBlock[] {
  const links = searchLinks(listings?.listings, new Set(), 20)
  const total = listings?.total ?? 0
  return [
    { tag: "h2", text: `${name} for sale` },
    {
      tag: "p",
      text:
        total > 0
          ? `${total} player listing${total === 1 ? "" : "s"} on SC Market right now.`
          : `No player listings right now. Set a price alert or post a buy order on SC Market.`,
    },
    {
      tag: "ul",
      links: [
        ...links,
        { href: MARKET_PATHS.aggregate(gameItemId, name), text: `Compare all ${name} listings and prices` },
      ],
    },
  ]
}

/** SC Orgs' public API and site (our sister site for org management). */
const SC_ORGS_API = "https://api.sc-orgs.space"
export const SC_ORGS_SITE = "https://sc-orgs.space"

/**
 * The org's SC Orgs page, when SC Orgs has it (matched by spectrum ID). An
 * off-site link, so it's a paragraph's absolute URL rather than a summary
 * link (those are site-relative only).
 */
function scOrgsBlocks(name: string, sid: string | undefined): SummaryBlock[] {
  if (!sid || !/^[A-Za-z0-9_-]{1,32}$/.test(sid)) return []
  return [{ tag: "external", href: `${SC_ORGS_SITE}/communities/${encodeURIComponent(sid)}`, text: `${name} on SC Orgs: members, events and recruiting` }]
}

/** Valid tab names per profile kind (the SPA's useShopTab/useOrgTab/useProfileTab). */
const SHOP_TABS: ReadonlySet<string> = new Set(["listings", "services", "reviews", "about", "order"])
const ORG_TABS: ReadonlySet<string> = new Set(["store", "about", "order", "members", "recruiting", "reviews"])
const USER_TABS: ReadonlySet<string> = new Set(["store", "about", "order", "reviews"])

/** An unknown `:tab` would render the default tab under another URL: a 404. */
function unknownTab(params: Record<string, string>, tabs: ReadonlySet<string>): boolean {
  return params.tab !== undefined && !tabs.has(params.tab.toLowerCase())
}

/** Page sizes of the SPA hubs that read ?page (so ?page=N shows the same entries). */
const MARKET_PAGE_SIZE = 48
const SHOPS_PAGE_SIZE = 24
const WIKI_ITEMS_PAGE_SIZE = 24
const WIKI_SHIPS_PAGE_SIZE = 24
const WIKI_COMMODITIES_PAGE_SIZE = 50

/** dateModified (the game data import) on a game-data page's main JSON-LD node. */
function withDateModified(head: PageHead, version: GameVersion | null): PageHead {
  const dateModified = gameDataDateModified(version)
  if (!dateModified || head.jsonLd.length === 0) return head
  const [main, ...rest] = head.jsonLd
  return { ...head, jsonLd: [{ ...main, dateModified }, ...rest] }
}

interface MissionRelated extends Record<string, unknown> {
  versions: ActiveVersionsResponse
  giverMissions: SearchMissionsResponse
  similarMissions: SearchMissionsResponse
}

/**
 * "How to get <item>" (the SPA's ItemAcquisitionSection, same helpers and
 * strings): player listings, missions, blueprints and their ingredients,
 * in-game shops and resource info, each with links, then the data's
 * CC BY 4.0 attribution and its JSON. Empty subsections are left out; no
 * document (the lookup failed) leaves the whole section out.
 */
function acquisitionBlocks(name: string, doc: ItemAcquisitionDocument | undefined): SummaryBlock[] {
  if (!doc || typeof doc !== "object" || !doc.listings || !doc.missions) return []
  const t = englishT
  const sections = acquisitionSections(doc)
  const price = (value: number) => t("itemAcquisition.priceUnit", { defaultValue: "{{price}} aUEC", price: formatAmount(value) })
  const blocks: SummaryBlock[] = [
    { tag: "h2", text: t("itemAcquisition.title", { defaultValue: "How to get {{name}}", name }) },
  ]
  if (!hasAcquisitionInfo(doc)) {
    blocks.push({
      tag: "p",
      text: t("itemAcquisition.noSources", {
        defaultValue: "No player listings, missions, blueprints or in-game shops for {{name}} yet.",
        name,
      }),
    })
    return blocks
  }
  if (sections.buy) {
    const l = doc.listings
    const current = doc.price.current
    const median = current.confidence === "medium" || current.confidence === "high" ? current.median_ask : null
    blocks.push(
      { tag: "h3", text: t("itemAcquisition.buyTitle", "Buy from players") },
      {
        tag: "ul-text",
        items: facts([
          [t("itemAcquisition.lowestAsk", "Lowest ask"), typeof l.lowest_ask === "number" ? price(l.lowest_ask) : null],
          [t("itemAcquisition.medianAsk", "Median ask"), typeof median === "number" ? price(median) : null],
          [t("itemAcquisition.sellers", "Sellers"), formatAmount(l.seller_count)],
          [t("itemAcquisition.listings", "Listings"), formatAmount(l.count)],
          [t("itemAcquisition.inStock", "In stock"), formatAmount(l.quantity_available)],
        ]),
      },
      ...paragraphs(typeof median === "number" ? doc.price.summary : null),
      {
        tag: "ul",
        links: [
          ...l.top.map((listing) => ({
            href: MARKET_PATHS.listing(listing.listing_id, listing.title),
            text: [
              listing.title,
              typeof listing.price === "number" ? price(listing.price) : null,
              t("itemAcquisition.inStockCount", { defaultValue: "{{quantity}} in stock", quantity: formatAmount(listing.quantity_available) }),
            ]
              .filter(Boolean)
              .join(" — "),
          })),
          {
            href: MARKET_PATHS.aggregate(doc.item.id, doc.item.name),
            text: t("itemAcquisition.compareAll", { defaultValue: "Compare all {{name}} listings", name }),
          },
        ],
      },
    )
  }
  if (sections.missions) {
    blocks.push(
      { tag: "h3", text: t("itemAcquisition.missionsTitle", "Missions that reward it") },
      { tag: "ul", links: doc.missions.top.map((m) => ({ href: acquisitionMissionPath(m), text: missionLine(m, t) })) },
      ...paragraphs(
        doc.missions.total > doc.missions.top.length
          ? t("itemAcquisition.showingMissions", {
              defaultValue: "Showing {{shown}} of {{total}} missions",
              shown: doc.missions.top.length,
              total: doc.missions.total,
            })
          : null,
      ),
    )
  }
  if (sections.blueprints) {
    blocks.push({ tag: "h3", text: t("itemAcquisition.craftTitle", "Craft it") })
    for (const bp of doc.blueprints.items) {
      blocks.push({
        tag: "ul",
        links: [
          { href: acquisitionBlueprintPath(bp), text: [blueprintLabel(name, t), ...blueprintFacts(bp, t)].join(" — ") },
          ...bp.ingredients.map((ing) => ({
            href: ingredientPath(ing),
            text: `${ing.name} — ${ingredientAmount(ing, t)}`,
          })),
        ],
      })
    }
  }
  if (sections.shops) {
    blocks.push(
      { tag: "h3", text: t("itemAcquisition.shopsTitle", "In-game shops") },
      {
        tag: "ul-text",
        items: doc.in_game_shops.shops.map((shop) =>
          [
            [shop.name, shop.location].filter(Boolean).join(", "),
            typeof shop.buy_price === "number" ? `${t("itemAcquisition.columnBuyPrice", "Buy price")}: ${price(shop.buy_price)}` : null,
            typeof shop.sell_price === "number" ? `${t("itemAcquisition.columnSellPrice", "Sell price")}: ${price(shop.sell_price)}` : null,
          ]
            .filter(Boolean)
            .join(" — "),
        ),
      },
    )
  }
  if (sections.resource && doc.resource) {
    const mining = locationLines(doc.resource.mining_locations)
    const buying = locationLines(doc.resource.purchase_locations)
    blocks.push(
      { tag: "h3", text: t("itemAcquisition.resourceTitle", "Mining, salvage and loot") },
      { tag: "ul-text", items: resourceMethods(doc, t) },
      ...(mining.length ? [{ tag: "p" as const, text: t("itemAcquisition.miningLocations", "Where to mine it") }, { tag: "ul-text" as const, items: mining }] : []),
      ...(buying.length ? [{ tag: "p" as const, text: t("itemAcquisition.purchaseLocations", "Where to buy it") }, { tag: "ul-text" as const, items: buying }] : []),
    )
  }
  blocks.push(
    {
      tag: "p",
      text: t("itemAcquisition.attribution", "Data: SC Market (sc-market.space), CC BY 4.0. Game data © Cloud Imperium Games."),
    },
    { tag: "external", href: doc.links.json, text: `${t("itemAcquisition.jsonData", "JSON data")}: ${name}` },
    { tag: "external", href: doc.feed.license.url, text: t("itemAcquisition.license", "CC BY 4.0") },
  )
  return blocks
}

/** Every blueprint a mission can reward, de-duplicated, best chance first. */
function missionBlueprints(data: MissionDetailResponse): MissionBlueprintReward[] {
  const byId = new Map<string, MissionBlueprintReward>()
  for (const pool of data.blueprint_rewards ?? []) {
    for (const bp of pool.blueprints ?? []) {
      const seen = byId.get(bp.blueprint_id)
      if (!seen || Number(bp.drop_probability) > Number(seen.drop_probability)) byId.set(bp.blueprint_id, bp)
    }
  }
  return [...byId.values()].sort(
    (a, b) => Number(b.is_guaranteed) - Number(a.is_guaranteed) || Number(b.drop_probability) - Number(a.drop_probability),
  )
}

/** "1 h 30 min", "45 min", "30 s". */
function duration(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`
  if (m > 0) return `${m} min`
  return `${Math.round(seconds)} s`
}

/** A mission's giver, faction, type and system hubs (the API's `hubs`). */
function missionDetailHubLinks(data: MissionDetailResponse): SeoLink[] {
  const hubs = data.hubs
  if (!hubs) return []
  const entries: [MissionHubKind, (typeof hubs)["giver"]][] = [
    ["givers", hubs.giver],
    ["factions", hubs.faction],
    ["types", hubs.type],
    ["systems", hubs.system],
  ]
  return entries.flatMap(([kind, hub]) =>
    hub
      ? [{ href: missionHubLink(kind, hub).href, text: missionHubText({ kind, name: hub.name, mission_count: hub.mission_count }, englishT).heading }]
      : [],
  )
}

/**
 * /missions/:slug: the one-line summary, then giver, place, rewards and
 * reputation, rules, hauling orders, blueprint drops (linked to the
 * blueprint, the crafted item and its market page), item rewards (linked to
 * the item when the API resolved it), more missions from the giver, and
 * the data's freshness.
 */
function missionDoc(
  data: MissionDetailResponse,
  ctx: PageContext & { related: Partial<MissionRelated> },
): BridgeDocument {
  const m = data.mission
  const version = ctx.related.versions?.LIVE ?? null
  const head = buildMissionHead(data, ctx.params.slug, ctx.origin, version)
  const name = readableMissionText(m.mission_name, missionGiver(m)) || "Unknown mission"
  const giver = m.mission_giver_org || m.faction
  const place = [m.location_detail, m.planet_moon, m.star_system].filter(Boolean).join(", ")
  const rep = typeof m.reputation_reward === "number" && m.reputation_reward !== 0
    ? `${m.reputation_reward > 0 ? "+" : ""}${m.reputation_reward} reputation${m.reputation_reward_faction ? ` with ${m.reputation_reward_faction}` : ""}`
    : null
  const standing = [m.min_standing_display, m.max_standing_display].filter(Boolean)
  const legal = m.legal_status === "ILLEGAL" || m.is_illegal ? "Illegal" : m.legal_status === "LEGAL" || m.is_illegal === false ? "Legal" : null

  const blueprints = missionBlueprints(data)
  const blueprintLinks: SeoLink[] = blueprints.flatMap((bp) => {
    const chance = bp.is_guaranteed ? "guaranteed" : `${formatPercent(dropPercent(bp.drop_probability))} drop chance`
    const label = bp.output_item_name || bp.blueprint_name
    const name = bp.output_item_name
    return [
      { href: GAME_DATA_PATHS.blueprint(enc(bp.blueprint_name)), text: `${label} blueprint — ${chance}` },
      ...(bp.output_game_item_slug && name
        ? [
            { href: WIKI_PATHS.item(bp.output_game_item_slug), text: `${name}: how to get it` },
            { href: MARKET_PATHS.aggregate(bp.output_game_item_id, name), text: `${name} on the market` },
          ]
        : []),
    ]
  })
  const itemRewards = arr(m.item_rewards)
  const itemRewardLinks: SeoLink[] = itemRewards
    .filter((r) => r.game_item_slug)
    .map((r) => ({ href: WIKI_PATHS.item(r.game_item_slug!), text: `${r.name}: how to get it` }))
  const unlinkedItemRewards = itemRewards.filter((r) => !r.game_item_slug).map((r) => r.name)
  const hauling = arr(data.hauling_orders).map(
    (h) => `${h.resource_name}: ${h.min_scu === h.max_scu ? h.min_scu : `${h.min_scu}–${h.max_scu}`} SCU`,
  )
  const more = arr(ctx.related.giverMissions?.missions)
    .filter((other) => other.mission_code !== m.mission_code)
    .slice(0, 10)
    .map((other) => ({
      href: GAME_DATA_PATHS.mission(enc(other.mission_code)),
      text: [readableMissionText(other.mission_name), missionRewardRange(other)].filter(Boolean).join(" — "),
    }))
  const seen = new Set([m.mission_code, ...arr(ctx.related.giverMissions?.missions).map((o) => o.mission_code)])
  const similar = arr(ctx.related.similarMissions?.missions)
    .filter((other) => !seen.has(other.mission_code))
    .slice(0, Math.max(0, 10 - more.length))
    .map((other) => ({
      href: GAME_DATA_PATHS.mission(enc(other.mission_code)),
      text: [missionTitle(other), missionRewardRange(other)].filter(Boolean).join(" — "),
    }))
  const stamp = freshnessStamp(version)

  const body: SummaryBlock[] = [
    { tag: "p", text: missionSummaryLine(m, data.blueprint_rewards) },
    { tag: "h2", text: "Mission details" },
    {
      tag: "ul-text",
      items: facts([
        ["Mission giver", m.mission_giver_org],
        ["Faction", m.faction && m.faction !== m.mission_giver_org ? m.faction : null],
        ["Type", missionType(m)],
        ["Location", place || null],
        ["Pick up at", arr(m.accept_locations).slice(0, 8).join(", ") || null],
        ["Destinations", arr(m.destinations).slice(0, 8).join(", ") || null],
        ["Reward", missionRewardRange(m)],
        ["Reputation", rep],
        ["Required standing", standing.length ? standing.join(" to ") : null],
        ["Legality", legal],
        ["Max crimestat", typeof m.max_crimestat === "number" ? m.max_crimestat : null],
        ["Time limit", duration(m.deadline_seconds)],
        ["Cooldown", duration(m.personal_cooldown_time)],
        ["Cooldown after abandoning", duration(m.abandoned_cooldown_time)],
        ["Shareable", m.is_shareable ? "yes" : null],
        ["Community difficulty", m.community_difficulty_count > 0 && m.community_difficulty_avg ? `${Number(m.community_difficulty_avg.toFixed(1))}/5 from ${m.community_difficulty_count} ratings` : null],
      ]),
    },
    ...paragraphs(m.mission_description ? readableMissionText(m.mission_description, missionGiver(m)) : null),
    ...(hauling.length ? [{ tag: "h2" as const, text: "Hauling orders" }, { tag: "ul-text" as const, items: hauling }] : []),
    ...linkBlocks("Blueprint rewards", blueprintLinks),
    ...(itemRewards.length ? [{ tag: "h2" as const, text: "Item rewards" }] : []),
    ...(itemRewardLinks.length ? [{ tag: "ul" as const, links: itemRewardLinks }] : []),
    ...(unlinkedItemRewards.length ? [{ tag: "ul-text" as const, items: unlinkedItemRewards }] : []),
    ...linkBlocks(englishT("missionHubs.detailTitle", "Browse similar missions"), missionDetailHubLinks(data)),
    ...linkBlocks(giver ? `More missions from ${giver}` : "More missions", more),
    ...linkBlocks(`Similar ${missionType(m) ?? ""} missions${m.star_system ? ` in ${m.star_system}` : ""}`.replace(/\s+/g, " "), similar),
    ...linkBlocks("Browse", [
      { href: GAME_DATA_PATHS.missions, text: "All Star Citizen missions" },
      { href: GAME_DATA_PATHS.blueprints, text: "Crafting blueprints" },
      { href: MARKET_PATHS.search, text: "Player market" },
    ]),
    ...paragraphs(stamp),
  ]
  return fromHead(head, missionTitle(m), body, ctx)
}

interface ListingRelated extends Record<string, unknown> {
  shop: ShopPublicResponse
  sellerListings: SearchListingsResponse
  sameItem: SearchListingsResponse
  sameType: SearchListingsResponse
}

/** The game database page of a listing's item. */
function gameItemWikiPath(item: { id: string; name: string; type: string }): string {
  return item.type === "Ship for Sale/Rental" ? WIKI_PATHS.ship(item.id, item.name) : WIKI_PATHS.item(item.id, item.name)
}

/**
 * /market/:id: price, stock, seller and rating, dates, the variants, then
 * links to the item's price comparison and wiki page, the seller's shop and
 * other listings, and related listings. A listing that is no longer for sale
 * is a 404 (410 once the seller cancelled it).
 */
function listingDoc(
  data: GetListingDetailResponse,
  ctx: PageContext & { related: Partial<ListingRelated> },
): BridgeDocument {
  const { listing, seller } = data
  const items = data.items ?? []
  const head = buildListingHead(data, ctx.origin)
  const range = listingPriceRange(data)
  const quantity = listingQuantity(data)
  const unit = listing.quantity_unit === "scu" ? "SCU" : "unit"
  const shop = ctx.related.shop
  const rating = sellerRatingLabel(shop?.rating ?? seller.rating, shop?.rating_count) ?? "no reviews yet"
  const price = range
    ? range.max > range.min
      ? `${aUEC(range.min)} to ${aUEC(range.max)} per ${unit}, by variant`
      : `${aUEC(range.min)} per ${unit}`
    : null
  const gameItem = items.length === 1 ? items[0].game_item : undefined
  const variants = items.flatMap((item) =>
    (item.variants ?? []).map((v) =>
      [
        items.length > 1 ? item.game_item?.name : null,
        v.display_name,
        aUEC(Number(v.price || item.base_price)),
        Number(v.quantity) > 0 ? `${Number(v.quantity).toLocaleString("en-US")} available` : "out of stock",
        v.locations?.length ? `at ${v.locations.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" — "),
    ),
  )
  const exclude = new Set([listing.listing_id])
  const fromSeller = searchLinks(ctx.related.sellerListings?.listings, exclude, 10)
  for (const l of arr(ctx.related.sellerListings?.listings)) exclude.add(l.listing_id)
  const otherSellers = arr(ctx.related.sameItem?.listings).filter((l) => l.shop_slug !== seller.slug)
  const related = searchLinks(otherSellers, exclude, 10)
  for (const l of arr(ctx.related.sameItem?.listings)) exclude.add(l.listing_id)
  if (related.length < 10) related.push(...searchLinks(ctx.related.sameType?.listings, exclude, 10 - related.length))

  const doc = fromHead(
    head,
    listing.title,
    [
      ...paragraphs(
        [
          price ? `Price: ${price}.` : null,
          quantity > 0 ? `${quantity.toLocaleString("en-US")} ${unit === "SCU" ? "SCU" : quantity === 1 ? "unit" : "units"} available.` : "Out of stock.",
          listing.sale_type === "auction" ? "Auction." : listing.sale_type === "negotiable" ? "Price negotiable: make an offer." : null,
        ]
          .filter(Boolean)
          .join(" "),
        [
          `Sold by ${seller.name} (${rating}).`,
          seller.languages?.length ? `Seller languages: ${seller.languages.join(", ")}.` : null,
          listing.pickup_method ? `Delivery: ${listing.pickup_method === "any" ? "delivery or pickup" : listing.pickup_method}.` : null,
          shortDate(listing.created_at) ? `Listed ${shortDate(listing.created_at)}.` : null,
          listing.updated_at && listing.updated_at !== listing.created_at && shortDate(listing.updated_at)
            ? `Updated ${shortDate(listing.updated_at)}.`
            : null,
          typeof listing.view_count === "number" && listing.view_count > 0 ? `${listing.view_count} views.` : null,
        ]
          .filter(Boolean)
          .join(" "),
        listing.description && listing.description !== listing.title ? listing.description : null,
        "Prices are in aUEC, the Star Citizen in-game currency. Buy on SC Market to get order tracking, chat with the seller and a review after delivery.",
      ),
      ...(variants.length > 1 || items.length > 1 ? [{ tag: "h2" as const, text: "Variants" }, { tag: "ul-text" as const, items: variants }] : []),
      ...linkBlocks("Price check and item info", [
        ...items
          .filter((item) => item.game_item?.id && item.game_item.name)
          .slice(0, 5)
          .flatMap((item) => [
            { href: MARKET_PATHS.aggregate(item.game_item.id, item.game_item.name), text: `Compare all ${item.game_item.name} listings and prices` },
            { href: gameItemWikiPath(item.game_item), text: `${item.game_item.name} in the Star Citizen game database` },
          ]),
        { href: SHOP_PATHS.profile(enc(seller.slug)), text: `${seller.name}: shop, reviews and all listings` },
      ]),
      ...linkBlocks(`More from ${seller.name}`, fromSeller),
      ...linkBlocks(gameItem ? `More ${gameItem.name} and similar listings` : "Related listings", related),
      ...linkBlocks("Browse", [
        { href: MARKET_PATHS.search, text: "All Star Citizen market listings" },
        { href: MARKET_PATHS.shops, text: "All shops" },
      ]),
    ],
    ctx,
  )
  if (listing.status !== "active") return { ...doc, status: listing.status === "cancelled" ? 410 : 404 }
  return doc
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
        // The SPA homepage's copy, in its order: the hero's <h1> and intro,
        // the intent cards, how selling works, why SC Market, the FAQ.
        { tag: "h1", text: englishT("landing.heroTitle") },
        ...paragraphs(englishT("landing.heroText"), headDescription(head)),
        ...linkBlocks(englishT("landing.intentsLabel"), [
          {
            href: MARKET_PATHS.search,
            text: `${englishT("landing.intentBuyTitle")}: ${englishT("landing.intentBuyText")}`,
          },
          {
            href: MARKET_PATHS.services,
            text: `${englishT("landing.intentHireTitle")}: ${englishT("landing.intentHireText")}`,
          },
          {
            href: MARKET_PATHS.buyOrderCreate,
            text: `${englishT("landing.intentWantedTitle")}: ${englishT("landing.intentWantedText")}`,
          },
          {
            href: MARKET_PATHS.create,
            text: `${englishT("landing.intentSellTitle")}: ${englishT("landing.intentSellText")}`,
          },
        ]),
        ...linkBlocks("Browse SC Market", [...MAIN_HUB_LINKS]),
        { tag: "h2", text: englishT("landing.sellTitle") },
        ...paragraphs(englishT("landing.sellText")),
        {
          tag: "ol",
          items: ([1, 2, 3] as const).map(
            (n) =>
              `${englishT(`landing.sellStep${n}Title`)}: ${englishT(`landing.sellStep${n}Text`)}`,
          ),
        },
        { tag: "h2", text: englishT("landing.whyTitle") },
        ...(["Reviews", "Fees", "Alerts", "Orgs"] as const).flatMap(
          (point): SummaryBlock[] => [
            { tag: "h3", text: englishT(`landing.trust${point}Title`) },
            { tag: "p", text: englishT(`landing.trust${point}Text`) },
          ],
        ),
        { tag: "h2", text: englishT("landing.faqTitle", "Your questions, answered") },
        ...faqs.flatMap((faq): SummaryBlock[] => [
          { tag: "h3", text: faq.question },
          { tag: "p", text: faq.answer },
        ]),
      ],
    }
  }),

  // ListingSearchV2's default query (quantity_min 1, desktop page size); its
  // head is the shared builder's, so it matches the SPA's (incl. og:/twitter:).
  market: page<SearchListingsResponse>({
    paginated: true,
    primary: (_p, n = 1) =>
      v2List(`/listings/search?page=${n}&page_size=${MARKET_PAGE_SIZE}&quantity_min=1`, ENTITY_LIST_TTL),
    build: (data, _s, ctx) => {
      const head = buildMarketSearchHead({ total: data.total }, ctx.origin)
      const links = data.listings.slice(0, MAX_SUMMARY_LINKS).map(listingLink)
      return paginate(
        {
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
            ...linkBlocks(ctx.pageNumber > 1 ? "Listings" : "Latest listings", links),
          ],
        },
        { path: MARKET_PATHS.search, total: data.total, pageSize: MARKET_PAGE_SIZE },
        ctx,
      )
    },
  }),

  shops: page<BrowseShopsApiResponse>({
    paginated: true,
    primary: (_p, n = 1) =>
      v2List(`/shops?page=${n}&page_size=${SHOPS_PAGE_SIZE}&sort_by=rating&sort_order=desc`, ENTITY_LIST_TTL),
    build: (data, _s, ctx) =>
      paginate(
        hubDoc(
          {
            text: shopDirectorySeoText(null, data.total),
            path: MARKET_PATHS.shops,
            name: "Browse Shops",
            linksHeading: ctx.pageNumber > 1 ? "Shops" : "Top rated shops",
            links: data.shops.map((shop) => ({
              href: SHOP_PATHS.profile(enc(shop.slug)),
              text: shop.name,
            })),
          },
          ctx,
        ),
        { path: MARKET_PATHS.shops, total: data.total, pageSize: SHOPS_PAGE_SIZE },
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
    paginated: true,
    primary: (_p, n = 1) =>
      n > 1
        ? v2List(`/game-data/wiki/items?page=${n}&page_size=${WIKI_ITEMS_PAGE_SIZE}`, STATIC_GAME_DATA_TTL)
        : v2List(`/game-data/wiki/items?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      paginate(hubDoc(
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
      ), { path: WIKI_PATHS.items, total: data.total, pageSize: WIKI_ITEMS_PAGE_SIZE }, ctx),
  }),

  wikiShips: page<GetShipsApiResponse>({
    paginated: true,
    primary: (_p, n = 1) =>
      n > 1
        ? v2List(`/game-data/wiki/ships?page=${n}&page_size=${WIKI_SHIPS_PAGE_SIZE}`, STATIC_GAME_DATA_TTL)
        : v2List(`/game-data/wiki/ships?page=1&page_size=${MAX_HUB_LINKS}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      paginate(hubDoc(
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
      ), { path: WIKI_PATHS.ships, total: data.total, pageSize: WIKI_SHIPS_PAGE_SIZE }, ctx),
  }),

  wikiCommodities: page<GetCommoditiesApiResponse>({
    paginated: true,
    primary: (_p, n = 1) =>
      v2List(`/game-data/wiki/commodities?page=${n}&page_size=${WIKI_COMMODITIES_PAGE_SIZE}`, STATIC_GAME_DATA_TTL),
    build: (data, _s, ctx) =>
      paginate(hubDoc(
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
      ), { path: WIKI_PATHS.commodities, total: data.total, pageSize: WIKI_COMMODITIES_PAGE_SIZE }, ctx),
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

  // ~108 brands; the 50 most prolific first (display_name, else the code).
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
            // The detail route takes the blueprint name or id, not blueprint_code.
            href: GAME_DATA_PATHS.blueprint(enc(bp.blueprint_name)),
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
          intro: missionsCapabilityText(data.total),
          linksHeading: "Missions",
          links: data.missions.map((m) => ({
            href: GAME_DATA_PATHS.mission(enc(m.mission_code)),
            // category is a translation key ("missiontype.delivery").
            text: missionTitle(m),
          })),
          after: linkBlocks(englishT("missionHubs.browseBy", "Browse missions by"), missionHubIndexLinks(null)),
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
          // The SPA's ScOrgsNote: recruiters → SC Orgs, players → its Looking for Org board.
          after: [
            { tag: "external", href: `${SC_ORGS_SITE}/`, text: englishT("recruiting.scOrgsNote") },
            { tag: "external", href: `${SC_ORGS_SITE}/lfo`, text: englishT("recruiting.scOrgsLfoNote") },
          ],
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


/** The mission hub kind behind each hub bridge kind. */
const MISSION_HUB_INDEX_KINDS = {
  missionGivers: "givers",
  missionFactions: "factions",
  missionTypes: "types",
  missionSystems: "systems",
} as const satisfies Record<string, MissionHubKind>
const MISSION_HUB_DETAIL_KINDS = {
  missionGiver: "givers",
  missionFaction: "factions",
  missionType: "types",
  missionSystem: "systems",
} as const satisfies Record<string, MissionHubKind>

/** Links to the other hub indexes ("Browse missions by"). */
function missionHubIndexLinks(except: MissionHubKind | null): SeoLink[] {
  return MISSION_HUB_KINDS.filter((k) => k !== except).map((k) => ({
    href: GAME_DATA_PATHS.missionHubs(k),
    text: missionHubKindLabel(k, englishT),
  }))
}

interface MissionHubRelated extends Record<string, unknown> {
  versions: ActiveVersionsResponse
}

/** /missions/<kind>: every hub of the kind with its mission count. */
function missionHubIndexPage(kind: MissionHubKind): BridgePage {
  return page<MissionHubsResponse, never, MissionHubRelated>({
    primary: () => v2List(`/game-data/missions/hubs`, STATIC_GAME_DATA_TTL),
    related: [() => ({ versions: v2List(`/game-data/versions/active`, STATIC_GAME_DATA_TTL) })],
    build: (data, _s, ctx) => {
      const version = ctx.related.versions?.LIVE ?? null
      const head = buildMissionHubIndexHead(kind, data, ctx.origin, englishT, LANG, version)
      const text = missionHubIndexText(kind, data[kind], englishT, LANG)
      const stamp = freshnessStamp(version)
      return fromHead(
        head,
        text.heading,
        [
          ...paragraphs(text.description),
          ...linkBlocks(
            missionHubKindLabel(kind, englishT),
            data[kind].map((hub) => ({
              href: GAME_DATA_PATHS.missionHub(kind, hub.slug),
              text: `${hub.name} — ${missionCountText(hub.mission_count, englishT)}`,
            })),
          ),
          ...linkBlocks(englishT("missionHubs.browseBy", "Browse missions by"), [
            ...missionHubIndexLinks(kind),
            { href: GAME_DATA_PATHS.missions, text: "All Star Citizen missions" },
          ]),
          ...paragraphs(stamp),
        ],
        ctx,
      )
    },
  })
}

/**
 * /missions/<kind>/<slug>: the data-driven intro, this page of the hub's
 * missions (?page=N: 100 per page), the related hubs, freshness. An
 * unknown hub is a 404.
 */
function missionHubPage(kind: MissionHubKind): BridgePage {
  return page<MissionHubDetailResponse, never, MissionHubRelated>({
    paginated: true,
    primary: (p, n = 1) =>
      v2(
        `/game-data/missions/hubs/${kind}/${enc(p.slug)}?page=${n}&page_size=${MISSION_HUB_PAGE_SIZE}`,
        STATIC_GAME_DATA_TTL,
      ),
    related: [() => ({ versions: v2List(`/game-data/versions/active`, STATIC_GAME_DATA_TTL) })],
    build: (hub, _s, ctx) => {
      const version = ctx.related.versions?.LIVE ?? null
      const head = buildMissionHubHead(hub, ctx.origin, englishT, LANG, version)
      const text = missionHubText(hub, englishT)
      const path = GAME_DATA_PATHS.missionHub(kind, hub.slug)
      const related = MISSION_HUB_KINDS.filter((k) => k !== kind).flatMap((k) =>
        hub[k].slice(0, 12).map((other) => ({
          href: GAME_DATA_PATHS.missionHub(k, other.slug),
          text: `${missionHubKindLabel(k, englishT)}: ${other.name} (${other.mission_count})`,
        })),
      )
      const doc = fromHead(
        head,
        text.heading,
        [
          ...paragraphs(...missionHubIntro(hub, englishT, LANG)),
          ...linkBlocks(englishT("missionHubs.missionList", "Missions"), hub.missions.map(missionHubMissionLink)),
          ...linkBlocks(englishT("missionHubs.related", "Related mission hubs"), related),
          ...linkBlocks(englishT("missionHubs.browseBy", "Browse missions by"), [
            ...missionHubCrumbs(kind, englishT).slice(1).map((c) => ({ href: c.path, text: c.name })),
            ...missionHubIndexLinks(kind),
            { href: GAME_DATA_PATHS.missions, text: "All Star Citizen missions" },
          ]),
          ...paragraphs(freshnessStamp(version)),
        ],
        ctx,
      )
      return paginate(doc, { path, total: hub.mission_count, pageSize: MISSION_HUB_PAGE_SIZE }, ctx)
    },
  })
}

const MISSION_HUB_PAGES: Record<
  keyof typeof MISSION_HUB_INDEX_KINDS | keyof typeof MISSION_HUB_DETAIL_KINDS,
  BridgePage
> = {
  missionGivers: missionHubIndexPage(MISSION_HUB_INDEX_KINDS.missionGivers),
  missionFactions: missionHubIndexPage(MISSION_HUB_INDEX_KINDS.missionFactions),
  missionTypes: missionHubIndexPage(MISSION_HUB_INDEX_KINDS.missionTypes),
  missionSystems: missionHubIndexPage(MISSION_HUB_INDEX_KINDS.missionSystems),
  missionGiver: missionHubPage(MISSION_HUB_DETAIL_KINDS.missionGiver),
  missionFaction: missionHubPage(MISSION_HUB_DETAIL_KINDS.missionFaction),
  missionType: missionHubPage(MISSION_HUB_DETAIL_KINDS.missionType),
  missionSystem: missionHubPage(MISSION_HUB_DETAIL_KINDS.missionSystem),
}

export const BRIDGE_PAGES: Record<BridgePageKind, BridgePage> = {
  commodity: page<ResourceDetailResponse, never, { listings: SearchListingsResponse; similar: GetCommoditiesApiResponse }>({
    primary: (p) => v2(`/game-data/resources/${enc(p.id)}`, MARKET_GAME_DATA_TTL),
    related: [
      (data) => ({
        listings: data.resource.game_item_id
          ? listingSearch({ game_item_id: data.resource.game_item_id, page_size: 20, sort_by: "price", sort_order: "asc" }, MARKET_GAME_DATA_TTL)
          : null,
        similar: data.resource.resource_category
          ? v2List(`/game-data/wiki/commodities?page=1&page_size=31&category=${enc(data.resource.resource_category)}`, STATIC_GAME_DATA_TTL)
          : null,
      }),
    ],
    build: (data, _s, ctx) => {
      const r = data.resource
      const answers = buildCommodityAnswers(data, englishT, LANG)
      const head = withFaqJsonLd(buildCommodityHead(data, ctx.origin), answers)
      const place = (parts: (string | undefined)[]) => parts.filter(Boolean).join(", ")
      const mining = (r.mining_locations ?? [])
        .map((l) => [place([l.location_detail, l.planet_moon, l.star_system]), l.abundance].filter(Boolean).join(" — "))
        .filter(Boolean)
      const buying = (r.purchase_locations ?? [])
        .map((l) => [place([l.station, l.planet_moon, l.star_system]), aUEC(l.average_price)].filter(Boolean).join(" — "))
        .filter(Boolean)
      return fromHead(
        head,
        r.resource_name,
        [
          ...paragraphs(answers.summary),
          { tag: "h2", text: "Facts" },
          {
            tag: "ul-text",
            items: facts([
              ["Category", [r.resource_category, r.resource_subcategory].filter(Boolean).join(" / ")],
              ["Base value", aUEC(r.base_value)],
              ["Average price", aUEC(data.market_price?.average_price)],
              ["Price range", data.market_price?.min_price && data.market_price?.max_price ? `${aUEC(data.market_price.min_price)} to ${aUEC(data.market_price.max_price)}` : null],
              ["Max stack", r.max_stack_size],
              [
                "How to get it",
                [r.can_be_mined && "mining", r.can_be_purchased && "buying", r.can_be_salvaged && "salvage", r.can_be_looted && "loot"]
                  .filter(Boolean)
                  .join(", "),
              ],
            ]),
          },
          ...(mining.length > 0 ? [{ tag: "h2" as const, text: "Where to mine it" }, { tag: "ul-text" as const, items: mining }] : []),
          ...(buying.length > 0 ? [{ tag: "h2" as const, text: "Where to buy it" }, { tag: "ul-text" as const, items: buying }] : []),
          ...(r.game_item_id ? itemListingBlocks(r.resource_name, r.game_item_id, ctx.related.listings) : []),
          ...linkBlocks(
            "Used in crafting",
            (data.blueprints_requiring ?? []).map((bp) => ({
              href: GAME_DATA_PATHS.blueprint(enc(bp.blueprint_name || bp.blueprint_id)),
              text: `Blueprint: ${bp.blueprint_name}`,
            })),
          ),
          ...linkBlocks(
            `Other ${r.resource_category || ""} commodities`.replace(/\s+/g, " "),
            [
              ...arr(ctx.related.similar?.commodities)
                .filter((c) => c.resource_id !== r.resource_id)
                .slice(0, 30)
                .map((c) => ({ href: WIKI_PATHS.commodity(c.resource_id, c.name), text: c.name })),
              { href: WIKI_PATHS.commodities, text: "All commodities" },
            ],
          ),
          ...faqBlocks(answers),
        ],
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

  item: page<WikiItemDetail, never, { acquisition: ItemAcquisitionDocument; similar: SearchWikiItemsResponse; versions: ActiveVersionsResponse }>({
    primary: (p) => v2(`/game-data/wiki/items/${enc(p.id)}`, MARKET_GAME_DATA_TTL),
    related: [
      (item) => ({
        // How to get it (listings, missions, blueprints, shops): the SPA's
        // useGetAcquisitionQuery document.
        acquisition: v2(`/game-items/${enc(item.id)}/acquisition`, MARKET_GAME_DATA_TTL),
        similar: item.type
          ? v2List(`/game-data/wiki/items?page=1&page_size=21&type=${enc(item.type)}`, STATIC_GAME_DATA_TTL)
          : null,
        versions: v2List(`/game-data/versions/active`, STATIC_GAME_DATA_TTL),
      }),
    ],
    build: (item, _s, ctx) => {
      const attributes = Object.entries(item.attributes ?? {})
        .filter(([, v]) => typeof v === "string" && v.trim() !== "" && v.length <= 80)
        .slice(0, 20)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      const maker = item.manufacturer_name || item.manufacturer
      const version = ctx.related.versions?.LIVE ?? null
      const acquisition = ctx.related.acquisition
      return fromHead(
        withDateModified(buildItemHead(item, ctx.origin, acquisition), version),
        item.name,
        [
          ...paragraphs(buildItemSummary(item, englishT)),
          ...acquisitionBlocks(item.name, acquisition),
          { tag: "h2", text: "Specifications" },
          {
            tag: "ul-text",
            items: [
              ...facts([
                ["Type", item.type],
                ["Sub-type", item.sub_type && item.sub_type !== "UNDEFINED" ? item.sub_type : null],
                ["Size", item.size],
                ["Grade", item.grade],
                ["Manufacturer", maker],
              ]),
              ...attributes,
            ],
          },
          ...linkBlocks(
            "Related",
            [
              ...(item.manufacturer
                ? [{ href: WIKI_PATHS.manufacturer(enc(item.manufacturer)), text: `${maker}: all products` }]
                : []),
              ...arr(ctx.related.similar?.items)
                .filter((other) => other.id !== item.id)
                .slice(0, 20)
                .map((other) => ({
                  href: WIKI_PATHS.item(other.id, other.name),
                  text: [other.name, other.manufacturer_name].filter(Boolean).join(" — "),
                })),
              { href: WIKI_PATHS.items, text: "All game items" },
            ],
          ),
          ...paragraphs(freshnessStamp(version)),
        ],
        ctx,
      )
    },
  }),

  ship: page<WikiShipDetail, never, { listings: SearchListingsResponse; ships: GetShipsApiResponse }>({
    primary: (p) => v2(`/game-data/wiki/ships/${enc(p.id)}`, STATIC_GAME_DATA_TTL),
    related: [
      (ship) => ({
        listings: listingSearch({ game_item_id: ship.id, page_size: 20, sort_by: "price", sort_order: "asc" }, MARKET_GAME_DATA_TTL),
        // The ship browser's own list (all ships, cached for an hour).
        ships: v2List(`/game-data/wiki/ships?pageSize=500`, STATIC_GAME_DATA_TTL),
      }),
    ],
    build: (ship, _s, ctx) => {
      const maker = ship.manufacturer_name || ship.manufacturer
      const others = arr(ctx.related.ships?.ships).filter((s) => s.id !== ship.id)
      const sameMaker = ship.manufacturer ? others.filter((s) => s.manufacturer === ship.manufacturer) : []
      const sameCareer = ship.career ? others.filter((s) => s.career === ship.career && s.manufacturer !== ship.manufacturer) : []
      const dims = [ship.length_m, ship.width_m, ship.height_m].every((d) => typeof d === "number" && d > 0)
        ? `${ship.length_m} × ${ship.width_m} × ${ship.height_m} m`
        : null
      return fromHead(
        buildShipHead(ship, ctx.origin),
        ship.name,
        [
          ...paragraphs(buildShipSummary(ship, englishT), ship.description),
          { tag: "h2", text: "Specifications" },
          {
            tag: "ul-text",
            items: facts([
              ["Manufacturer", maker],
              ["Focus", ship.focus],
              ["Career", ship.career],
              ["Role", ship.role],
              ["Size", ship.size],
              ["Crew", ship.crew_size],
              ["Dimensions (L × W × H)", dims],
              ["Movement", ship.movement_class],
            ]),
          },
          ...itemListingBlocks(ship.name, ship.id, ctx.related.listings),
          ...linkBlocks(
            maker ? `More from ${maker}` : "Related ships",
            [
              ...(ship.manufacturer
                ? [{ href: WIKI_PATHS.manufacturer(enc(ship.manufacturer)), text: `${maker}: all ships and products` }]
                : []),
              ...sameMaker.slice(0, 15).map((s) => ({ href: WIKI_PATHS.ship(s.id, s.name), text: s.name })),
            ],
          ),
          ...linkBlocks(
            ship.career ? `Other ${ship.career} ships` : "Other ships",
            [
              ...sameCareer.slice(0, 15).map((s) => ({ href: WIKI_PATHS.ship(s.id, s.name), text: s.name })),
              { href: WIKI_PATHS.ships, text: "All ships and vehicles" },
            ],
          ),
        ],
        ctx,
      )
    },
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

  blueprint: page<BlueprintDetailResponse, never, { versions: ActiveVersionsResponse }>({
    primary: (p) => v2(`/game-data/blueprints/${enc(p.slug)}`, STATIC_GAME_DATA_TTL),
    related: [() => ({ versions: v2List(`/game-data/versions/active`, STATIC_GAME_DATA_TTL) })],
    build: (data, _s, ctx) => {
      const version = ctx.related.versions?.LIVE ?? null
      const head = withDateModified(buildBlueprintHead(data, ctx.params.slug, ctx.origin), version)
      const ingredients = (data.ingredients || [])
        .map((ing) => ing.game_item?.name || ing.slot_name)
        .filter(Boolean)
      const output = data.output_item
      const missions = [...arr(data.missions_rewarding)]
        .sort((a, b) => Number(b.drop_probability) - Number(a.drop_probability))
        .slice(0, 20)
        .map((m) => ({
          href: GAME_DATA_PATHS.mission(enc(m.mission_id)),
          text: [readableMissionText(m.mission_name), `${formatPercent(dropPercent(m.drop_probability))} drop chance`, m.star_system]
            .filter(Boolean)
            .join(" — "),
        }))
      return fromHead(
        head,
        blueprintItemName(data),
        [
          ...paragraphs(
            headDescription(head),
            ingredients.length > 0 ? `Ingredients: ${ingredients.join(", ")}.` : null,
          ),
          ...linkBlocks(
            "Crafted item",
            output?.game_item_id && output.name
              ? [
                  { href: WIKI_PATHS.item(output.game_item_id, output.name), text: `${output.name} in the game database` },
                  { href: MARKET_PATHS.aggregate(output.game_item_id, output.name), text: `${output.name} on the market` },
                ]
              : [],
          ),
          ...linkBlocks("Missions that reward this blueprint", missions),
          ...linkBlocks("Browse", [
            { href: GAME_DATA_PATHS.blueprints, text: "All crafting blueprints" },
            { href: GAME_DATA_PATHS.missions, text: "Mission database" },
          ]),
          ...paragraphs(freshnessStamp(version)),
        ],
        ctx,
      )
    },
  }),

  mission: page<MissionDetailResponse, never, MissionRelated>({
    primary: (p) => v2(`/game-data/missions/${enc(p.slug)}`, STATIC_GAME_DATA_TTL),
    related: [
      (data) => {
        const giver = data.mission.mission_giver_org || data.mission.faction
        return {
          versions: v2List(`/game-data/versions/active`, STATIC_GAME_DATA_TTL),
          giverMissions: giver
            ? v2List(`/game-data/missions/search?page=1&page_size=12&mission_giver_org=${enc(giver)}`, STATIC_GAME_DATA_TTL)
            : null,
        }
      },
      // A giver with few missions: add same-type missions in the same system.
      (data, _s, related) => {
        const others = arr(related.giverMissions?.missions).filter((o) => o.mission_code !== data.mission.mission_code)
        const m = data.mission
        if (others.length >= 10 || !m.category) return {}
        const query = new URLSearchParams({ page: "1", page_size: "15", category: m.category })
        if (m.star_system) query.set("star_system", m.star_system)
        return { similarMissions: v2List(`/game-data/missions/search?${query.toString()}`, STATIC_GAME_DATA_TTL) }
      },
    ],
    build: (data, _s, ctx) => missionDoc(data, ctx),
  }),

  listing: page<GetListingDetailResponse, never, ListingRelated>({
    primary: (p) => v2(`/listings/${enc(p.id)}`, ENTITY_TTL),
    related: [
      (data) => {
        const gameItem = data.items?.[0]?.game_item
        return {
          shop: v2(`/shops/${enc(data.seller.slug)}`, ENTITY_TTL),
          sellerListings: listingSearch({ shop_slug: data.seller.slug, page_size: 12 }),
          sameItem: gameItem?.id
            ? listingSearch({ game_item_id: gameItem.id, page_size: 12, sort_by: "price", sort_order: "asc" })
            : null,
        }
      },
      // Few other sellers of the exact item: widen to its category.
      (data, _s, related) => {
        const type = data.items?.[0]?.game_item?.type
        const others = arr(related.sameItem?.listings).filter(
          (l) => l.listing_id !== data.listing.listing_id && l.shop_slug !== data.seller.slug,
        )
        return { sameType: type && others.length < 6 ? listingSearch({ item_type: type, page_size: 12 }) : null }
      },
    ],
    build: (data, _s, ctx) => listingDoc(data, ctx),
  }),

  shop: page<ShopPublicResponse, never, { listings: SearchListingsResponse }>({
    primary: (p) => v2(`/shops/${enc(p.slug)}`, ENTITY_TTL),
    related: [(shop) => ({ listings: listingSearch({ shop_slug: shop.slug, page_size: MAX_SUMMARY_LINKS }) })],
    build: (shop, _s, ctx) => {
      const doc = fromHead(
        buildShopHead(shop, ctx.origin),
        shop.name,
        [
          ...paragraphs(
            shop.description || shopSeoDescription(shop),
            [
              sellerRatingLabel(shop.rating, shop.rating_count) ?? "No reviews yet",
              typeof shop.listing_count === "number" ? `${shop.listing_count} active listings` : null,
              typeof shop.total_sales === "number" && shop.total_sales > 0 ? `${shop.total_sales} sales` : null,
              shop.supported_languages?.length ? `Languages: ${shop.supported_languages.join(", ")}` : null,
              shortDate(shop.created_at) ? `On SC Market since ${shortDate(shop.created_at)}` : null,
            ]
              .filter(Boolean)
              .join(". ") + ".",
          ),
          ...linkBlocks(`Listings from ${shop.name}`, searchLinks(ctx.related.listings?.listings, new Set(), MAX_SUMMARY_LINKS)),
        ],
        ctx,
      )
      return unknownTab(ctx.params, SHOP_TABS) ? { ...doc, status: 404 } : doc
    },
  }),

  // Title and canonical come from the page layout (BannerPageLayout → Page):
  // orgPageTitle and the current path.
  org: page<GetContractorApiResponse, ShopPublicResponse[], { listings: SearchListingsResponse; scOrgs: { data?: { sid?: string } } }>({
    primary: (p) => v1(`/api/contractors/${enc(p.id)}`, ENTITY_TTL),
    // OrgMetaTags' useGetShopsByOwnerQuery, for the JSON-LD `owns` link.
    secondary: (p) =>
      v2(`/shops/by-owner?spectrum_id=${enc(p.id)}`, ENTITY_TTL),
    related: [
      (_o, shops, _r, params) => ({
        listings: arr(shops)[0]?.slug ? listingSearch({ shop_slug: arr(shops)[0].slug, page_size: 40 }) : null,
        // The same org on SC Orgs, by RSI spectrum ID (its public API; 404
        // when it isn't there, which just leaves the link out).
        scOrgs: { origin: SC_ORGS_API, path: `/api/v1/orgs/${enc(params.id)}`, notFoundStatuses: [404], ttlSeconds: 6 * 60 * 60 },
      }),
    ],
    build: ({ data: contractor }, shops, ctx) => {
      const head = buildOrgHead(contractor, shops?.[0], ctx.origin)
      if (unknownTab(ctx.params, ORG_TABS)) return { title: "", canonical: "", head, summary: [], status: 404 }
      return {
        title: applyTitleTemplate(
          orgPageTitle(contractor.name, englishT("org.orgTitle")),
        ),
        canonical: `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: contractor.name },
          ...paragraphs(contractor.description || headDescription(head)),
          ...linkBlocks(
            "Shop",
            arr(shops).map((shop) => ({ href: SHOP_PATHS.profile(enc(shop.slug)), text: shop.name })),
          ),
          ...linkBlocks("Listings", searchLinks(ctx.related.listings?.listings, new Set(), 40)),
          ...scOrgsBlocks(contractor.name, ctx.related.scOrgs?.data?.sid),
        ],
      }
    },
  }),

  // Same as org: title and canonical come from the layout.
  user: page<User, never, { shops: ShopPublicResponse[]; listings: SearchListingsResponse }>({
    primary: (p) => v1(`/api/profile/user/${enc(p.username)}`, ENTITY_TTL),
    related: [
      (user) => ({ shops: v2(`/shops/by-owner?username=${enc(user.username)}`, ENTITY_TTL) }),
      (_u, _s, related) => ({
        listings: arr(related.shops)[0]?.slug
          ? listingSearch({ shop_slug: arr(related.shops)[0].slug, page_size: 40 })
          : null,
      }),
    ],
    build: (user, _s, ctx) => {
      const head = buildUserHead(user, ctx.origin)
      if (unknownTab(ctx.params, USER_TABS)) return { title: "", canonical: "", head, summary: [], status: 404 }
      return {
        title: applyTitleTemplate(
          userPageTitle(user.display_name, englishT("viewProfile.store_tab")),
        ),
        canonical: `${ctx.origin}${ctx.pathname}`,
        head,
        summary: [
          { tag: "h1", text: user.display_name || user.username },
          ...paragraphs(user.profile_description || headDescription(head)),
          ...linkBlocks(
            "Shop",
            arr(ctx.related.shops).map((shop) => ({ href: SHOP_PATHS.profile(enc(shop.slug)), text: shop.name })),
          ),
          ...linkBlocks("Listings", searchLinks(ctx.related.listings?.listings, new Set(), 40)),
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
  ...MISSION_HUB_PAGES,
  ...HUB_PAGES,
  ...CONTENT_PAGES,
}
