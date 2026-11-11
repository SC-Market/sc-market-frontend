/**
 * SSR Pages Function (Phase 4, docs/ssr-worker.md): renders the public
 * entity pages (listings, shops, orgs, users) at request time from the
 * app's server build, edge-cached, and falls back to the edge bridge
 * (src/bridge/pagesFunction.ts) whenever it doesn't render: switched off,
 * a prefix rolled back, an error, a timeout. The bridge itself fails open
 * to the static SPA shell, and passThroughOnException() serves the static
 * shell if the Function dies (exceptions, CPU limit).
 *
 * The functions/ route files of the server-rendered prefixes re-export
 * this; public/_routes.json limits which paths invoke it at all (never the
 * prerendered hubs, assets or other static files).
 *
 * Every render is anonymous: the visitor's cookies and headers are never
 * forwarded (src/ssr/apiFetch.ts). The theme and language cookies and
 * Accept-Language are only read to pick the page variant (protocol.ts
 * requestContextFrom), among the variants SSR_VARIANTS switches on; each
 * variant has its own cache entry (variantKey).
 */
import { createRequestHandler, type ServerBuild } from "react-router"
import { onRequest as bridge } from "../bridge/pagesFunction"
import { documentHeaders, type BridgeEnv } from "../bridge/handler"
import { matchBridgeRoute, type BridgePageKind } from "../bridge/routes"
import { inlineStylesheets } from "../../scripts/vite/inlineEntryCssPlugin"
import { isMainSiteHostname } from "../util/mainSiteHost"
import { hasPageQuery } from "../document/pageQuery"
import {
  isPrivateWhiteLabel,
  PRIVATE_WHITE_LABEL_ROBOTS,
} from "../seo/pageHead"
import { createApiFetch, type ApiFetch } from "./apiFetch"
import {
  requestContextFrom,
  SSR_FAILURE_HEADER,
  SSR_OUTCOME_HEADER,
  SSR_PARTIAL_HEADER,
  variantKey,
  type RequestContextValue,
  type SsrEntryModule,
  type SsrWhiteLabel,
} from "./protocol"
import { SSR_BUILD_VERSION } from "./buildVersion"
import {
  isWhiteLabelCandidate,
  ssrSwitchedOn,
  ssrVariants,
  whiteLabelHostServed,
} from "./variants"
import {
  isMainSiteOnlyPath,
  mainSiteUrl,
} from "../features/storefront/whiteLabelRoutes"

export { isWhiteLabelCandidate, ssrSwitchedOn, ssrVariants } from "./variants"

declare const caches: { default: Cache }

export interface SsrEnv extends BridgeEnv {
  /**
   * Kill switch: "false" never renders, "true" renders. Unset: renders on
   * preview deployments and localhost only (see ssrSwitchedOn).
   */
  SSR_ENABLED?: string
  /**
   * Comma-separated page kinds to render (listing, shop, org, user), for a
   * per-prefix rollback without a code change. Unset: all of them.
   */
  SSR_KINDS?: string
  /**
   * Comma-separated page variants to render besides the default (main
   * site, dark, English): `theme` (light), `locale` (the visitor's
   * language), `host` (orgs' white-label domains); "none" for none. Unset:
   * all of them on preview deployments and localhost, none in production
   * (see ssrVariants). A visitor whose variant is off gets the default
   * HTML, which the browser renders from scratch instead of hydrating.
   */
  SSR_VARIANTS?: string
}

interface PagesContext {
  request: Request
  env: SsrEnv
  next(): Promise<Response>
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException?(): void
}

/** The page kinds this Function renders (src/bridge/routes.ts kinds). */
export const SSR_KINDS: ReadonlySet<BridgePageKind> = new Set([
  "listing",
  "shop",
  "org",
  "user",
  ...GAME_DATA_KINDS(),
])

/**
 * Game-data detail pages: their HTML is cached per LIVE game version (a
 * game-data import starts a new key), so it can be kept much longer.
 */
function GAME_DATA_KINDS(): BridgePageKind[] {
  return [
    "item",
    "commodity",
    "resource",
    "ship",
    "ore",
    "miningLocation",
    "blueprint",
    "mission",
  ]
}
export const GAME_DATA_KIND_SET: ReadonlySet<BridgePageKind> = new Set(
  GAME_DATA_KINDS(),
)

/**
 * Request header that switches SSR off for that request (any value): set
 * by a zone Request Header Transform Rule, it is the instant kill switch
 * (all paths or per prefix, no deploy). A visitor sending it only gets the
 * bridge's page.
 */
export const SSR_OFF_HEADER = "X-SCM-SSR-Off"

/**
 * On a bridge answer for an SSR path: why the Function didn't serve its own
 * render ("deadline", "failed: primary 429", "off", "query", ...), so a curl
 * shows it without the Function's logs.
 */
export const SSR_FALLBACK_HEADER = "X-SCM-SSR-Fallback"

/** Wall-clock budget for loaders + render; past it, the bridge answers. */
export const SSR_DEADLINE_MS = 2500
/** Per API call (loaders and head). */
const API_TIMEOUT_MS = 1500
/** API JSON edge-cache lifetime (as the bridge's ENTITY_TTL). */
const API_TTL_SECONDS = 60
/** Rendered HTML: fresh for 60 s, then served stale while re-rendering. */
export const HTML_FRESH_SECONDS = 60
export const HTML_STALE_SECONDS = 600
/**
 * Crawlers get cached HTML up to a day old without a re-render: most crawl
 * a URL at most daily, so with the visitors' 11 minutes every crawler hit
 * would be a render. Five crawlers on one URL a day = one render a day.
 */
export const CRAWLER_STALE_SECONDS = 24 * 60 * 60

const CRAWLER_UA =
  /bot\b|bot\/|crawler|spider|slurp|facebookexternalhit|embedly|preview|bingpreview|mediapartners/i

export function isCrawler(userAgent: string | null): boolean {
  return !!userAgent && CRAWLER_UA.test(userAgent)
}

/** How long a cached page is fresh, served stale, and good for crawlers. */
export interface CachePolicy {
  fresh: number
  stale: number
  crawler: number
}

/** Listings, shops, orgs, users: s-maxage=60, stale-while-revalidate=600. */
export const ENTITY_POLICY: CachePolicy = {
  fresh: HTML_FRESH_SECONDS,
  stale: HTML_STALE_SECONDS,
  crawler: CRAWLER_STALE_SECONDS,
}
/** Game data (per game version): changes only with an import. */
export const GAME_DATA_POLICY: CachePolicy = {
  fresh: 6 * 60 * 60,
  stale: 7 * 24 * 60 * 60,
  crawler: 7 * 24 * 60 * 60,
}
/** Items and commodities also show live market prices and listings. */
export const MARKET_GAME_DATA_POLICY: CachePolicy = {
  fresh: 10 * 60,
  stale: 6 * 60 * 60,
  crawler: 24 * 60 * 60,
}

export function cachePolicy(kind: BridgePageKind): CachePolicy {
  if (kind === "item" || kind === "commodity") return MARKET_GAME_DATA_POLICY
  if (GAME_DATA_KIND_SET.has(kind)) return GAME_DATA_POLICY
  return ENTITY_POLICY
}

export type CacheUse =
  /** Serve it. */
  | "hit"
  /** Serve it and re-render in the background. */
  | "stale"
  /** Too old for this visitor: render. */
  | "expired"

/** What a cached page of `ageSeconds` is good for; pure (tested). */
export function cacheUse(
  ageSeconds: number,
  crawler: boolean,
  policy: CachePolicy = ENTITY_POLICY,
): CacheUse {
  if (!(ageSeconds >= 0)) return "expired"
  if (ageSeconds <= policy.fresh) return "hit"
  if (ageSeconds <= policy.fresh + policy.stale) return "stale"
  if (crawler && ageSeconds <= policy.crawler) return "hit"
  return "expired"
}

const RENDERED_AT_HEADER = "x-ssr-rendered-at"

export function kindEnabled(env: SsrEnv, kind: BridgePageKind): boolean {
  if (!SSR_KINDS.has(kind)) return false
  const list = env.SSR_KINDS?.trim()
  if (!list) return true
  return list
    .split(",")
    .map((k) => k.trim())
    .includes(kind)
}

export type SsrDecision =
  | { render: true; kind: BridgePageKind }
  | { render: false; reason: string }

/** Whether this request is server-rendered; pure (tested). */
export function ssrDecision(request: Request, env: SsrEnv): SsrDecision {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return { render: false, reason: "method" }
  }
  const url = new URL(request.url)
  // React Router data requests: the clientLoaders never make them.
  if (url.pathname.endsWith(".data")) return { render: false, reason: ".data" }
  // "/market/x/": the bridge 301s it to the one URL without the slash.
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    return { render: false, reason: "trailing slash" }
  }
  const match = matchBridgeRoute(url.pathname)
  if (!match || !SSR_KINDS.has(match.route.kind)) {
    return { render: false, reason: "not an ssr page" }
  }
  if (request.headers.get(SSR_OFF_HEADER)) {
    return { render: false, reason: "off (header)" }
  }
  if (!ssrSwitchedOn(env, url.hostname)) return { render: false, reason: "off" }
  if (!kindEnabled(env, match.route.kind)) {
    return { render: false, reason: "kind off" }
  }
  // White-label domains: rendered only with the `host` variant on (the
  // domain itself is checked against the API in planFor); otherwise their
  // own shell (the bridge passes them through).
  if (!isMainSiteHostname(url.hostname)) {
    if (
      !ssrVariants(env, url.hostname).has("host") ||
      !isWhiteLabelCandidate(url.hostname.toLowerCase())
    ) {
      return { render: false, reason: "white-label" }
    }
  }
  // A filtered URL renders from scratch in the browser anyway, and the
  // bridge marks it noindex (src/seo/queryIndexing.ts).
  if (hasPageQuery(url.search)) return { render: false, reason: "query" }
  return { render: true, kind: match.route.kind }
}

/**
 * Whether this request is for a page an org's white-label domain doesn't
 * serve whichever org it is (features/storefront/whiteLabelRoutes.ts: SC
 * Market-wide pages, users' profiles), on a white-label host the edge
 * serves (`host` variant): answered with a 302 to the same page on
 * sc-market.space before any lookup or render. Another org's page needs
 * the host's org (onRequest, after planFor), another seller's listing or
 * shop its owner (the render: `handoff`). Pure (tested).
 */
export function isWhiteLabelHandoff(request: Request, env: SsrEnv): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false
  if (request.headers.get(SSR_OFF_HEADER)) return false
  const url = new URL(request.url)
  return (
    whiteLabelHostServed(env, url.hostname) &&
    isMainSiteOnlyPath(url.pathname, undefined)
  )
}

/**
 * The same page on sc-market.space: a 302 (the org may serve it one day,
 * e.g. a tab it turns on), briefly cacheable.
 */
export function handoffResponse(url: URL): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: mainSiteUrl(url.pathname + url.search),
      "Cache-Control": "public, max-age=300",
      "X-SCM-SSR": "handoff",
    },
  })
}

/** React Router's `build.prerender`, saying yes to every path (see below). */
class EveryPath extends Array<string> {
  override includes(): boolean {
    return true
  }
}

type Handler = (
  request: Request,
  context: Record<string, unknown>,
) => Promise<Response>

let handler: Handler | null = null
let entryModule: SsrEntryModule | null = null
let inlineCss: Record<string, string> = {}
/** Renders in flight in this isolate, by cache key (one per path). */
const inFlight = new Map<string, Promise<Rendered>>()

async function loadHandler() {
  if (handler) return handler
  const { serverBuild, inlineStylesheetsByHref } = await import("./serverBuild")
  // The build is `ssr: false`: React Router renders a path in full (route
  // loaders, then entry.server.tsx) only if it was prerendered, and the SPA
  // shell otherwise. Here every SSR path counts as prerendered, so the
  // browser gets exactly what a prerendered page gives it, rendered now.
  const build: ServerBuild = { ...serverBuild, prerender: new EveryPath("*") }
  const created = createRequestHandler(build, "production")
  handler = (request, context) => created(request, context)
  entryModule = serverBuild.entry.module as unknown as SsrEntryModule
  inlineCss = inlineStylesheetsByHref
  return handler!
}

export function cacheKey(
  url: URL,
  variant: string,
  gameVersion: string,
): string {
  // One anonymous HTML per path and rendered variant (variantKey: empty for
  // the default, so most visitors and crawlers share one entry), plus the
  // LIVE game version for game-data pages; the deploy's asset version keeps
  // a new deploy from serving HTML that references the previous chunks.
  // The path as requested, case included: "/user/Bob" and "/user/bob" are
  // separate renders (each ships its own query args, and one may be a 404),
  // never one spelling's HTML served for the other.
  return `https://ssr-cache.sc-market.internal/${SSR_BUILD_VERSION}${url.pathname}${variant}${gameVersion}`
}

/** The LIVE game version as a cache-key part ("" when unknown). */
async function liveGameVersionKey(api: ApiFetch, env: SsrEnv): Promise<string> {
  const base = env.VITE_BACKEND_URL?.replace(/\/+$/, "")
  if (!base) return ""
  try {
    const response = await api.fetch(`${base}/api/v2/game-data/versions/active`)
    if (!response.ok) return ""
    const live = (
      (await response.json()) as {
        LIVE?: { version_id?: string; last_data_update?: string }
      }
    ).LIVE
    return live?.version_id
      ? `@${live.version_id}:${live.last_data_update ?? ""}`
      : ""
  } catch {
    return ""
  }
}

/** One request's cache plan: its key, policy, variant and API fetch. */
interface Plan {
  key: string
  /** False when the game version couldn't be read: render, don't cache. */
  cacheable: boolean
  policy: CachePolicy
  api: ApiFetch
  /** The variant rendered (and keyed) for this request. */
  requestContext: RequestContextValue
}

/** Why a white-label host isn't rendered (planFor falls back to the bridge). */
class WhiteLabelUnavailable extends Error {}

/** A members-only or internal domain: the bridge's answer, never indexed. */
class WhiteLabelPrivate extends WhiteLabelUnavailable {}

const ROBOTS_META_RE = /<meta\b[^>]*\bname="robots"[^>]*>/gi

/**
 * `response` (the static shell, from the bridge) for a members-only or
 * internal org domain: `X-Robots-Tag` and a robots meta of
 * PRIVATE_WHITE_LABEL_ROBOTS (replacing the page's own), so search engines
 * never index it, with or without running the page's JS. Pure (tested).
 */
export async function withPrivateRobots(response: Response): Promise<Response> {
  const headers = new Headers(response.headers)
  headers.set("X-Robots-Tag", PRIVATE_WHITE_LABEL_ROBOTS)
  const init = {
    status: response.status,
    statusText: response.statusText,
    headers,
  }
  if (
    !response.body ||
    !(headers.get("Content-Type") ?? "").includes("text/html")
  ) {
    return new Response(response.body, init)
  }
  const html = (await response.text())
    .replace(ROBOTS_META_RE, "")
    .replace(
      /<\/head>/i,
      `<meta name="robots" content="${PRIVATE_WHITE_LABEL_ROBOTS}"></head>`,
    )
  headers.delete("Content-Length")
  return new Response(html, init)
}

/**
 * The org whose white-label domain `hostname` is, as the browser resolves
 * it (HookProvider: GET /api/domain/:hostname, then the org's theme). Only
 * public storefronts: a members-only or internal domain shows a sign-in
 * gate, which is the browser's to render. Anonymous GETs of public
 * endpoints only (apiFetch), so nothing about the visitor is involved.
 */
async function resolveWhiteLabel(
  hostname: string,
  api: ApiFetch,
  env: SsrEnv,
): Promise<SsrWhiteLabel> {
  const base = env.VITE_BACKEND_URL?.replace(/\/+$/, "")
  if (!base) throw new WhiteLabelUnavailable("white-label: no backend")
  const domain = await api.fetch(
    `${base}/api/domain/${encodeURIComponent(hostname)}`,
  )
  if (domain.status === 404) {
    throw new WhiteLabelUnavailable("white-label: unknown host")
  }
  if (!domain.ok) {
    throw new WhiteLabelUnavailable(`white-label: domain ${domain.status}`)
  }
  const data = (
    (await domain.json()) as { data?: Partial<SsrWhiteLabel["domain"]> }
  ).data
  if (!data?.spectrum_id || !data.contractor_id) {
    throw new WhiteLabelUnavailable("white-label: unknown host")
  }
  if (isPrivateWhiteLabel(data)) {
    throw new WhiteLabelPrivate("white-label: members only")
  }
  const theme = await api.fetch(
    `${base}/api/contractors/${encodeURIComponent(data.spectrum_id)}/theme`,
  )
  if (!theme.ok && theme.status !== 404) {
    throw new WhiteLabelUnavailable(`white-label: theme ${theme.status}`)
  }
  return {
    hostname,
    domain: {
      spectrum_id: data.spectrum_id,
      contractor_id: data.contractor_id,
      name: data.name || data.spectrum_id,
      focus_mode: "public",
      homepage_path: data.homepage_path ?? null,
      require_membership: false,
    },
    theme: theme.ok
      ? ((await theme.json()) as { data: NonNullable<SsrWhiteLabel["theme"]> })
          .data
      : null,
  }
}

function newApiFetch(context: PagesContext): ApiFetch {
  return createApiFetch({
    fetch: (input, init) => fetch(input, init),
    cache: caches.default,
    waitUntil: (p) => context.waitUntil(p),
    timeoutMs: API_TIMEOUT_MS,
    ttlSeconds: API_TTL_SECONDS,
  })
}

async function planFor(
  context: PagesContext,
  url: URL,
  kind: BridgePageKind,
): Promise<Plan> {
  const api = newApiFetch(context)
  const requestContext = requestContextFrom(context.request, {
    enabled: ssrVariants(context.env, url.hostname),
    crawler: isCrawler(context.request.headers.get("User-Agent")),
  })
  if (!isMainSiteHostname(url.hostname)) {
    requestContext.whiteLabel = await resolveWhiteLabel(
      requestContext.host,
      api,
      context.env,
    )
  }
  const variant = variantKey(requestContext)
  if (!GAME_DATA_KIND_SET.has(kind)) {
    return {
      key: cacheKey(url, variant, ""),
      cacheable: true,
      policy: cachePolicy(kind),
      api,
      requestContext,
    }
  }
  const version = await liveGameVersionKey(api, context.env)
  return {
    key: cacheKey(url, variant, version),
    cacheable: version !== "",
    policy: cachePolicy(kind),
    api,
    requestContext,
  }
}

type Rendered =
  /** `partial`: some data failed transiently; served, never cached. */
  | { kind: "page"; html: string; partial?: string }
  | { kind: "notFound" }
  /** Not the canonical spelling: 301 (src/bridge/handler.ts canonicalRedirect). */
  | { kind: "redirect"; location: string }
  /** On a white-label host, a page it doesn't serve (another seller's): 302. */
  | { kind: "handoff" }
  | { kind: "failed"; reason: string }

async function render(
  context: PagesContext,
  url: URL,
  plan: Plan,
): Promise<Rendered> {
  const requestHandler = await loadHandler()
  const loadContext = entryModule!.createSsrLoadContext({
    // Each render reports its own hand-off (a background render must not
    // share a request's).
    requestContext: plan.requestContext.whiteLabel
      ? { ...plan.requestContext, handoff: { leaving: false } }
      : plan.requestContext,
    api: plan.api,
    assets: context.env.ASSETS,
    env: {
      VITE_BACKEND_URL: context.env.VITE_BACKEND_URL,
      VITE_FRONTEND_URL: context.env.VITE_FRONTEND_URL,
    },
    waitUntil: (p) => context.waitUntil(p),
  })
  // A clean GET of the page: no visitor headers reach React Router either.
  const response = await requestHandler(
    new Request(url.toString(), { method: "GET" }),
    loadContext,
  )
  const outcome = response.headers.get(SSR_OUTCOME_HEADER)
  if (outcome === "page" && response.status === 200) {
    const html = inlineStylesheets(
      await response.text(),
      (fileName) => inlineCss[`/${fileName}`],
    )
    const partial = response.headers.get(SSR_PARTIAL_HEADER) ?? undefined
    return { kind: "page", html, partial }
  }
  if (outcome === "not-found") return { kind: "notFound" }
  if (outcome === "handoff") return { kind: "handoff" }
  if (outcome === "failed") {
    return {
      kind: "failed",
      reason: `failed: ${response.headers.get(SSR_FAILURE_HEADER) ?? "unknown"}`,
    }
  }
  const location = response.headers.get("Location")
  if (outcome === "redirect" && location) return { kind: "redirect", location }
  return {
    kind: "failed",
    reason: `${outcome ?? "no outcome"} (${response.status})`,
  }
}

/** What withDeadline resolves to when the time is up. */
export const SSR_DEADLINE: unique symbol = Symbol("ssr deadline")

/** The promise's value, or SSR_DEADLINE if it takes longer than `ms`. */
export function withDeadline<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | typeof SSR_DEADLINE> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    promise,
    new Promise<typeof SSR_DEADLINE>((resolve) => {
      timer = setTimeout(() => resolve(SSR_DEADLINE), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

function pageResponse(
  request: Request,
  html: string,
  url: URL,
  cacheState: string,
  policy: CachePolicy,
  partial?: string,
): Response {
  const headers = documentHeaders(url, "text/html; charset=utf-8")
  // Browsers always revalidate the HTML (it references hashed chunks: the
  // stale-chunk recovery depends on it, docs/prerender.md). The edge cache
  // policy is the Function's own (below); CDN-Cache-Control states it for
  // any cache rule in front of the Function.
  headers.set(
    "CDN-Cache-Control",
    `max-age=${policy.fresh}, stale-while-revalidate=${policy.stale}`,
  )
  headers.set("X-SCM-SSR", cacheState)
  if (partial) headers.set("X-SCM-SSR-Partial", partial)
  // The HTML depends on the theme and language cookies and Accept-Language
  // (the visitor's variant; crawlers always get the default one).
  headers.set("Vary", "Accept-Language, Cookie")
  return new Response(request.method === "HEAD" ? null : html, {
    status: 200,
    headers,
  })
}

/**
 * The bridge's 301 to a page's canonical URL (same host, the query kept),
 * for a request that isn't its canonical spelling.
 */
export function redirectResponse(location: URL, url: URL): Response {
  location.search = url.search
  return new Response(null, {
    status: 301,
    headers: {
      Location: location.toString(),
      "Cache-Control": "public, max-age=3600",
      "X-SCM-SSR": "redirect",
    },
  })
}

/**
 * Render and store in the edge cache. Concurrent requests for one key in
 * this isolate share one render. No deadline here: a request that stops
 * waiting (SSR_DEADLINE_MS) leaves the render running under waitUntil, so a
 * slow render still lands in the cache and the next request is a hit
 * instead of another slow render.
 */
function renderAndStore(
  context: PagesContext,
  url: URL,
  plan: Plan,
): Promise<Rendered> {
  const running = inFlight.get(plan.key)
  if (running) return running
  const job = (async (): Promise<Rendered> => {
    const rendered = await render(context, url, plan)
    if (rendered.kind === "page" && rendered.partial) {
      console.warn(
        `ssr partial ${url.pathname}: ${rendered.partial} (not cached)`,
      )
    }
    if (rendered.kind === "page" && plan.cacheable && !rendered.partial) {
      const { fresh, stale, crawler } = plan.policy
      const entry = new Response(rendered.html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": `public, max-age=${Math.max(fresh + stale, crawler)}`,
          [RENDERED_AT_HEADER]: String(Date.now()),
        },
      })
      context.waitUntil(caches.default.put(plan.key, entry).catch(() => {}))
    }
    if (
      (rendered.kind === "notFound" ||
        rendered.kind === "redirect" ||
        rendered.kind === "handoff") &&
      plan.cacheable
    ) {
      // Sold, cancelled, renamed since it was cached: drop the old page so
      // no later request (a crawler's day-old hit) serves it.
      context.waitUntil(caches.default.delete(plan.key).catch(() => false))
    }
    return rendered
  })().finally(() => inFlight.delete(plan.key))
  inFlight.set(plan.key, job)
  return job
}

export async function onRequest(context: PagesContext): Promise<Response> {
  // If the Function dies (an uncaught exception, the CPU limit), Pages
  // serves the static file for the path: the SPA shell.
  context.passThroughOnException?.()
  if (isWhiteLabelHandoff(context.request, context.env)) {
    return handoffResponse(new URL(context.request.url))
  }
  const decision = ssrDecision(context.request, context.env)
  if (!decision.render) {
    // Paths this Function never renders (hubs, aggregates) say nothing.
    if (decision.reason === "not an ssr page") return bridge(context)
    return fallback(context, decision.reason)
  }

  const url = new URL(context.request.url)
  let plan: Plan
  try {
    plan = await planFor(context, url, decision.kind)
  } catch (error) {
    if (error instanceof WhiteLabelPrivate) {
      return withPrivateRobots(await fallback(context, error.message))
    }
    if (error instanceof WhiteLabelUnavailable) {
      return fallback(context, error.message)
    }
    console.error(`ssr fail-open ${url.pathname}:`, error)
    return fallback(context, "error")
  }
  // Another org's page on this org's domain.
  const whiteLabel = plan.requestContext.whiteLabel
  if (
    whiteLabel &&
    isMainSiteOnlyPath(url.pathname, whiteLabel.domain.spectrum_id)
  ) {
    return handoffResponse(url)
  }
  try {
    // A cache hit never loads the app (no render, ~1 ms CPU).
    const cached = plan.cacheable
      ? await caches.default.match(plan.key)
      : undefined
    if (cached) {
      const age =
        (Date.now() - Number(cached.headers.get(RENDERED_AT_HEADER))) / 1000
      const use = cacheUse(
        age,
        isCrawler(context.request.headers.get("User-Agent")),
        plan.policy,
      )
      if (use === "stale") {
        // A fresh API fetch: the background render must not share this
        // request's (already used) one.
        const background = { ...plan, api: newApiFetch(context) }
        context.waitUntil(
          renderAndStore(context, url, background).catch((error) =>
            console.warn(`ssr revalidate ${url.pathname}: ${String(error)}`),
          ),
        )
      }
      if (use !== "expired") {
        return pageResponse(
          context.request,
          await cached.text(),
          url,
          use,
          plan.policy,
        )
      }
    }

    const job = renderAndStore(context, url, plan)
    // Keep the render alive past the deadline (it still fills the cache).
    context.waitUntil(job.catch(() => {}))
    const rendered = await withDeadline(job, SSR_DEADLINE_MS)
    if (rendered === SSR_DEADLINE) {
      console.warn(`ssr fail-open ${url.pathname}: deadline`)
      return fallback(context, "deadline")
    }
    if (rendered.kind === "page") {
      return pageResponse(
        context.request,
        rendered.html,
        url,
        "miss",
        plan.policy,
        rendered.partial,
      )
    }
    if (rendered.kind === "redirect") {
      return redirectResponse(new URL(rendered.location), url)
    }
    if (rendered.kind === "handoff") return handoffResponse(url)
    if (rendered.kind === "failed") {
      console.warn(`ssr fail-open ${url.pathname}: ${rendered.reason}`)
      return fallback(context, rendered.reason)
    }
    // Not found: the bridge answers 404 + noindex (its own API cache).
    return bridge(context)
  } catch (error) {
    console.error(`ssr fail-open ${url.pathname}:`, error)
    return fallback(context, "error")
  }
}

/** The bridge's answer, marked with why SSR didn't serve (SSR_FALLBACK_HEADER). */
async function fallback(
  context: PagesContext,
  reason: string,
): Promise<Response> {
  const response = await bridge(context)
  const marked = new Response(response.body, response)
  marked.headers.set(
    SSR_FALLBACK_HEADER,
    reason.replace(/[^\x20-\x7e]+/g, " ").slice(0, 200),
  )
  return marked
}
