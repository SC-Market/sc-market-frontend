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
 * forwarded (src/ssr/apiFetch.ts); the theme cookie is only read to pick
 * the page variant (requestContext.ts), and today every visitor gets the
 * same default variant.
 */
import { createRequestHandler, type ServerBuild } from "react-router"
import { onRequest as bridge } from "../bridge/pagesFunction"
import { documentHeaders, type BridgeEnv } from "../bridge/handler"
import { matchBridgeRoute, type BridgePageKind } from "../bridge/routes"
import { inlineStylesheets } from "../../scripts/vite/inlineEntryCssPlugin"
import { isMainSiteHostname } from "../util/mainSiteHost"
import { hasPageQuery } from "../document/pageQuery"
import { createApiFetch, type ApiFetch } from "./apiFetch"
import {
  requestContextFrom,
  SSR_OUTCOME_HEADER,
  variantKey,
  type SsrEntryModule,
} from "./protocol"
import { SSR_BUILD_VERSION } from "./buildVersion"

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

export function ssrSwitchedOn(env: SsrEnv, hostname: string): boolean {
  const flag = env.SSR_ENABLED?.trim().toLowerCase()
  if (flag === "false" || flag === "0" || flag === "off") return false
  if (flag === "true" || flag === "1" || flag === "on") return true
  // Unset: only where nobody depends on it (production needs "true").
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".sc-market-frontend.pages.dev")
  )
}

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
  // White-label domains: their own shell (the bridge passes them through).
  if (!isMainSiteHostname(url.hostname)) {
    return { render: false, reason: "white-label" }
  }
  // A filtered URL renders from scratch in the browser anyway.
  if (hasPageQuery(url.search)) return { render: false, reason: "query" }
  return { render: true, kind: match.route.kind }
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

function cacheKey(url: URL, variant: string, gameVersion: string): string {
  // One anonymous HTML per path and rendered variant (variantKey: empty for
  // the default, so most visitors and crawlers share one entry), plus the
  // LIVE game version for game-data pages; the deploy's asset version keeps
  // a new deploy from serving HTML that references the previous chunks.
  return `https://ssr-cache.sc-market.internal/${SSR_BUILD_VERSION}${url.pathname.toLowerCase()}${variant}${gameVersion}`
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

/** One request's cache plan: its key, policy and API fetch. */
interface Plan {
  key: string
  /** False when the game version couldn't be read: render, don't cache. */
  cacheable: boolean
  policy: CachePolicy
  api: ApiFetch
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
  const variant = variantKey(requestContextFrom(context.request))
  if (!GAME_DATA_KIND_SET.has(kind)) {
    return {
      key: cacheKey(url, variant, ""),
      cacheable: true,
      policy: cachePolicy(kind),
      api,
    }
  }
  const version = await liveGameVersionKey(api, context.env)
  return {
    key: cacheKey(url, variant, version),
    cacheable: version !== "",
    policy: cachePolicy(kind),
    api,
  }
}

type Rendered =
  | { kind: "page"; html: string }
  | { kind: "notFound" }
  | { kind: "failed"; reason: string }

async function render(
  context: PagesContext,
  url: URL,
  api: ApiFetch,
): Promise<Rendered> {
  const requestHandler = await loadHandler()
  const loadContext = entryModule!.createSsrLoadContext({
    requestContext: requestContextFrom(context.request),
    api,
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
    return { kind: "page", html }
  }
  if (outcome === "not-found") return { kind: "notFound" }
  return {
    kind: "failed",
    reason: `${outcome ?? "no outcome"} (${response.status})`,
  }
}

function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("ssr deadline")), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

function pageResponse(
  request: Request,
  html: string,
  url: URL,
  cacheState: string,
  policy: CachePolicy,
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
  return new Response(request.method === "HEAD" ? null : html, {
    status: 200,
    headers,
  })
}

/**
 * Render and store in the edge cache. Concurrent requests for one key in
 * this isolate share one render.
 */
function renderAndStore(
  context: PagesContext,
  url: URL,
  plan: Plan,
): Promise<Rendered> {
  const running = inFlight.get(plan.key)
  if (running) return running
  const job = (async (): Promise<Rendered> => {
    const rendered = await withDeadline(
      render(context, url, plan.api),
      SSR_DEADLINE_MS,
    )
    if (rendered.kind === "page" && plan.cacheable) {
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
    return rendered
  })().finally(() => inFlight.delete(plan.key))
  inFlight.set(plan.key, job)
  return job
}

export async function onRequest(context: PagesContext): Promise<Response> {
  // If the Function dies (an uncaught exception, the CPU limit), Pages
  // serves the static file for the path: the SPA shell.
  context.passThroughOnException?.()
  const decision = ssrDecision(context.request, context.env)
  if (!decision.render) return bridge(context)

  const url = new URL(context.request.url)
  try {
    const plan = await planFor(context, url, decision.kind)
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

    const rendered = await renderAndStore(context, url, plan)
    if (rendered.kind === "page") {
      return pageResponse(
        context.request,
        rendered.html,
        url,
        "miss",
        plan.policy,
      )
    }
    if (rendered.kind === "failed") {
      console.warn(`ssr fail-open ${url.pathname}: ${rendered.reason}`)
    }
    // Not found: the bridge answers 404 + noindex (its own API cache).
  } catch (error) {
    console.error(`ssr fail-open ${url.pathname}:`, error)
  }
  return bridge(context)
}
