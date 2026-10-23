/**
 * Per-route data sources and document builders for the edge bridge.
 *
 * Each page fetches ONE public, anonymous API GET (orgs add one optional
 * lookup so their JSON-LD matches the SPA's) and turns the JSON into the
 * same PageHead the SPA page renders, plus a short visible plain-text
 * summary for #root. URLs and response types mirror the generated clients
 * in src/store/api/** (types only; nothing here imports RTK or the browser).
 */
import type {
  BlueprintDetailResponse,
  GetListingDetailResponse,
  LocationDetailResponse,
  MissionDetailResponse,
  OreDetailResponse,
  ResourceDetailResponse,
  ShopPublicResponse,
  WikiItemDetail,
  WikiShipDetail,
} from "../store/api/v2/market"
import type { GetContractorApiResponse } from "../store/api/contractors"
import type { GetRecruitingPostByIdApiResponse } from "../store/api/recruiting"
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
  miningDisplayName,
} from "../seo/gameDataHeads"
import {
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
import { englishT } from "./englishT"
import type { BridgePageKind } from "./routes"

/** Visible summary block; text is always inserted as escaped text. */
export interface SummaryBlock {
  tag: "h1" | "h2" | "h3" | "p"
  text: string
}

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
  primary: (params: Record<string, string>) => ApiRequest
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
}
