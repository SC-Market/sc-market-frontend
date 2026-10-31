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
import { createApiFetch } from "./apiFetch"
import {
  requestContextFrom,
  SSR_OUTCOME_HEADER,
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
])

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

export type CacheUse =
  /** Serve it. */
  | "hit"
  /** Serve it and re-render in the background. */
  | "stale"
  /** Too old for this visitor: render. */
  | "expired"

/** What a cached page of `ageSeconds` is good for; pure (tested). */
export function cacheUse(ageSeconds: number, crawler: boolean): CacheUse {
  if (!(ageSeconds >= 0)) return "expired"
  if (ageSeconds <= HTML_FRESH_SECONDS) return "hit"
  if (ageSeconds <= HTML_FRESH_SECONDS + HTML_STALE_SECONDS) return "stale"
  if (crawler && ageSeconds <= CRAWLER_STALE_SECONDS) return "hit"
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

function cacheKey(url: URL): Request {
  // One anonymous variant per path; the deploy's asset version keeps a
  // new deploy from serving HTML that references the previous chunks.
  return new Request(
    `https://ssr-cache.sc-market.internal/${SSR_BUILD_VERSION}${url.pathname.toLowerCase()}`,
    { method: "GET" },
  )
}

type Rendered =
  | { kind: "page"; html: string }
  | { kind: "notFound" }
  | { kind: "failed"; reason: string }

async function render(context: PagesContext, url: URL): Promise<Rendered> {
  const requestHandler = await loadHandler()
  const api = createApiFetch({
    fetch: (input, init) => fetch(input, init),
    cache: caches.default,
    waitUntil: (p) => context.waitUntil(p),
    timeoutMs: API_TIMEOUT_MS,
    ttlSeconds: API_TTL_SECONDS,
  })
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
): Response {
  const headers = documentHeaders(url, "text/html; charset=utf-8")
  // Browsers always revalidate the HTML (it references hashed chunks: the
  // stale-chunk recovery depends on it, docs/prerender.md). The edge cache
  // policy is the Function's own (below); CDN-Cache-Control states it for
  // any cache rule in front of the Function.
  headers.set(
    "CDN-Cache-Control",
    `max-age=${HTML_FRESH_SECONDS}, stale-while-revalidate=${HTML_STALE_SECONDS}`,
  )
  headers.set("X-SCM-SSR", cacheState)
  return new Response(request.method === "HEAD" ? null : html, {
    status: 200,
    headers,
  })
}

/**
 * Render and store in the edge cache. Concurrent requests for one path in
 * this isolate share one render.
 */
function renderAndStore(context: PagesContext, url: URL): Promise<Rendered> {
  const key = cacheKey(url).url
  const running = inFlight.get(key)
  if (running) return running
  const job = (async (): Promise<Rendered> => {
    const rendered = await withDeadline(render(context, url), SSR_DEADLINE_MS)
    if (rendered.kind === "page") {
      const entry = new Response(rendered.html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": `public, max-age=${CRAWLER_STALE_SECONDS}`,
          [RENDERED_AT_HEADER]: String(Date.now()),
        },
      })
      context.waitUntil(caches.default.put(key, entry).catch(() => {}))
    }
    return rendered
  })().finally(() => inFlight.delete(key))
  inFlight.set(key, job)
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
    // A cache hit never loads the app (no render, ~1 ms CPU).
    const cached = await caches.default.match(cacheKey(url))
    if (cached) {
      const age =
        (Date.now() - Number(cached.headers.get(RENDERED_AT_HEADER))) / 1000
      const use = cacheUse(
        age,
        isCrawler(context.request.headers.get("User-Agent")),
      )
      if (use === "stale") {
        context.waitUntil(
          renderAndStore(context, url).catch((error) =>
            console.warn(`ssr revalidate ${url.pathname}: ${String(error)}`),
          ),
        )
      }
      if (use !== "expired") {
        return pageResponse(context.request, await cached.text(), url, use)
      }
    }

    const rendered = await renderAndStore(context, url)
    if (rendered.kind === "page") {
      return pageResponse(context.request, rendered.html, url, "miss")
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
