/**
 * Edge bridge: a route-scoped Cloudflare Pages Function that serves the
 * static SPA shell with real per-page <title>, meta/OG, canonical, JSON-LD
 * and a visible plain-text summary, so crawlers and link previews that
 * don't run JS see the page. Every visitor (human or bot) gets the same
 * response; humans then run the SPA exactly as today.
 *
 * - Data: anonymous GETs to the public API (VITE_BACKEND_URL). No visitor
 *   cookies or headers are forwarded; Workers' fetch has no cookie jar.
 *   Help & Guides pages read the content build's static JSON (env.ASSETS)
 *   instead.
 * - Unknown entity (API 404, or 400 from v1): shell + robots noindex, 404.
 * - Anything else going wrong (timeout, 5xx, bad JSON, a builder throwing,
 *   missing config): the unmodified shell (fail open), never an error page.
 * - The rendered HTML is not cached (it embeds the current deploy's hashed
 *   asset URLs); the API JSON is edge-cached per URL with the Cache API.
 */
import { BRIDGE_PAGES, type ApiRequest, type BridgeDocument } from "./pages"
import {
  matchBridgeRoute,
  PRERENDERED_DYNAMIC_KINDS,
  PRERENDERED_KINDS,
  type BridgeMatch,
  type BridgePageKind,
} from "./routes"
import { queryIndexing } from "../seo/queryIndexing"
import { rewriteShell, type HtmlRewriterConstructor } from "./render"
import { DEFAULT_FRONTEND_URL } from "../seo/constants"
import { isMainSiteHostname } from "../util/mainSiteHost"
import { guideRedirectTarget } from "../features/help/domain/redirects"
import { isGuideLocale } from "../features/help/domain/locales"
import { toSupportedLocale } from "../util/locales"

export interface BridgeEnv {
  ASSETS: { fetch(input: Request | URL | string): Promise<Response> }
  /** Public API origin, e.g. https://api.sc-market.space (same var as the SPA build). */
  VITE_BACKEND_URL?: string
  /** Frontend origin for canonical URLs (same var and default as the SPA). */
  VITE_FRONTEND_URL?: string
}

export interface BridgeContext {
  request: Request
  env: BridgeEnv
  next(): Promise<Response>
  waitUntil(promise: Promise<unknown>): void
}

export interface BridgeRuntime {
  HTMLRewriter: HtmlRewriterConstructor
  /** Cloudflare's caches.default; omitted → no edge caching. */
  cache?: Cache
  fetch: typeof fetch
}

/** Upstream API budget per request; on timeout the shell is served as-is. */
export const API_TIMEOUT_MS = 1500
/**
 * The SPA shell, by its pretty path (Pages redirects /x.html → /x). Not "/":
 * that's the prerendered homepage.
 */
export const SHELL_PATH = "/__spa-fallback"
/** How long "entity doesn't exist" answers are cached. */
const NOT_FOUND_TTL_SECONDS = 60
/** public/_headers' `Link` for "/" (Function responses skip _headers). */
export const HOME_LINK_HEADER =
  '<https://api.sc-market.space/.well-known/api-catalog>; rel="api-catalog", <https://api.sc-market.space/api/v2/openapi.json>; rel="service-desc"; type="application/json", <https://api.sc-market.space/docs>; rel="service-doc"; type="text/html"'
/** Header carrying the upstream status on cached entries. */
const CACHED_STATUS_HEADER = "x-bridge-upstream-status"

export type ApiResult =
  | { kind: "ok"; json: unknown }
  | { kind: "notFound" }
  | { kind: "error"; reason: string }

/** Anonymous GET of one public API URL, edge-cached, with a hard timeout. */
export async function fetchApi(
  url: string,
  request: ApiRequest,
  runtime: BridgeRuntime,
  waitUntil: (promise: Promise<unknown>) => void,
): Promise<ApiResult> {
  const cacheKey = new Request(url, { method: "GET" })
  const cached = await runtime.cache?.match(cacheKey)
  if (cached) {
    const status = Number(cached.headers.get(CACHED_STATUS_HEADER))
    if (status === 200) return { kind: "ok", json: await cached.json() }
    if (request.notFoundStatuses.includes(status)) return { kind: "notFound" }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  let response: Response
  let body: string
  try {
    // A fresh request: only an Accept header, never the visitor's cookies,
    // auth or other headers. (Workers' fetch keeps no cookie jar, and does
    // not support the `credentials` option, so nothing is ever attached.)
    response = await runtime.fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "manual",
      signal: controller.signal,
    })
    body = await response.text()
  } catch (error) {
    return {
      kind: "error",
      reason: error instanceof Error ? error.name : "fetch failed",
    }
  } finally {
    clearTimeout(timer)
  }

  const store = (ttl: number) => {
    if (!runtime.cache) return
    waitUntil(
      runtime.cache.put(
        cacheKey,
        new Response(body, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${ttl}`,
            [CACHED_STATUS_HEADER]: String(response.status),
          },
        }),
      ),
    )
  }

  if (response.status === 200) {
    let json: unknown
    try {
      json = JSON.parse(body)
    } catch {
      return { kind: "error", reason: "invalid JSON" }
    }
    store(request.ttlSeconds)
    return { kind: "ok", json }
  }
  if (request.notFoundStatuses.includes(response.status)) {
    store(NOT_FOUND_TTL_SECONDS)
    return { kind: "notFound" }
  }
  return { kind: "error", reason: `upstream ${response.status}` }
}

/**
 * Read one of this deployment's static JSON files (the content build's
 * /content/bridge/*.json). A missing file is a 404, or, if the SPA fallback
 * ever catches it, index.html with a 200: anything that isn't JSON counts as
 * "doesn't exist".
 */
export async function fetchAsset(
  env: BridgeEnv,
  base: URL,
  path: string,
): Promise<ApiResult> {
  let response: Response
  try {
    response = await env.ASSETS.fetch(
      new Request(new URL(path, base), { method: "GET" }),
    )
  } catch (error) {
    return {
      kind: "error",
      reason: error instanceof Error ? error.name : "asset fetch failed",
    }
  }
  const type = response.headers.get("Content-Type") ?? ""
  if (
    response.status === 404 ||
    (response.ok && !type.includes("application/json"))
  ) {
    return { kind: "notFound" }
  }
  if (!response.ok) return { kind: "error", reason: `asset ${response.status}` }
  try {
    return { kind: "ok", json: await response.json() }
  } catch {
    return { kind: "error", reason: "invalid asset JSON" }
  }
}

export type PageOutcome =
  | { kind: "page"; doc: BridgeDocument }
  | { kind: "notFound"; status?: 404 | 410 }
  | { kind: "passthrough"; reason: string }

/** Run a page's `related` stages: every lookup in a stage in parallel, failures dropped. */
async function fetchRelated(
  stages: NonNullable<(typeof BRIDGE_PAGES)[BridgePageKind]["related"]>,
  apiBase: string,
  primary: unknown,
  secondary: unknown,
  params: Record<string, string>,
  runtime: BridgeRuntime,
  waitUntil: (promise: Promise<unknown>) => void,
): Promise<Record<string, unknown>> {
  const related: Record<string, unknown> = {}
  for (const stage of stages) {
    let requests: Record<string, ApiRequest | null | undefined>
    try {
      requests = stage(primary, secondary, related, params)
    } catch {
      continue
    }
    const entries = Object.entries(requests).filter(
      (entry): entry is [string, ApiRequest] => !!entry[1],
    )
    const results = await Promise.all(
      entries.map(([, request]) =>
        fetchApi(
          `${request.origin ?? apiBase}${request.path}`,
          request,
          runtime,
          waitUntil,
        ),
      ),
    )
    entries.forEach(([key], i) => {
      const result = results[i]
      if (result.kind === "ok") related[key] = result.json
    })
  }
  return related
}

/**
 * Resolve a request path to what the bridge should serve. Never throws.
 * `?page=N` reaches paginated hubs as ctx.pageNumber; other kinds always
 * build page 1.
 */
export async function resolvePage(
  url: URL,
  env: BridgeEnv,
  runtime: BridgeRuntime,
  waitUntil: (promise: Promise<unknown>) => void,
  matched?: BridgeMatch,
): Promise<PageOutcome> {
  const match = matched ?? matchBridgeRoute(url.pathname)
  if (!match) return { kind: "passthrough", reason: "no route" }

  const page = BRIDGE_PAGES[match.route.kind]
  const indexing = queryIndexing(url.searchParams)
  const pageNumber =
    page.paginated && indexing.pageNumber ? indexing.pageNumber : 1
  const primaryRequest = page.primary?.(match.params, pageNumber)
  const secondaryRequest = page.secondary?.(match.params)
  const apiBase = env.VITE_BACKEND_URL?.replace(/\/+$/, "")

  let primaryJson: unknown = undefined
  let secondaryJson: unknown = undefined
  if (page.asset) {
    const assetPath = page.asset(match.params)
    if (assetPath === null) return { kind: "notFound" }
    const result = await fetchAsset(env, url, assetPath)
    if (result.kind === "notFound") return { kind: "notFound" }
    if (result.kind === "error")
      return { kind: "passthrough", reason: result.reason }
    primaryJson = result.json
  } else if (primaryRequest) {
    if (!apiBase)
      return { kind: "passthrough", reason: "VITE_BACKEND_URL not set" }

    const [primary, secondary] = await Promise.all([
      fetchApi(
        `${apiBase}${primaryRequest.path}`,
        primaryRequest,
        runtime,
        waitUntil,
      ),
      secondaryRequest
        ? fetchApi(
            `${apiBase}${secondaryRequest.path}`,
            secondaryRequest,
            runtime,
            waitUntil,
          )
        : undefined,
    ])

    if (primary.kind === "notFound") return { kind: "notFound" }
    if (primary.kind === "error")
      return { kind: "passthrough", reason: primary.reason }
    primaryJson = primary.json
    secondaryJson = secondary?.kind === "ok" ? secondary.json : undefined
  }

  const related =
    page.related && apiBase
      ? await fetchRelated(
          page.related,
          apiBase,
          primaryJson,
          secondaryJson,
          match.params,
          runtime,
          waitUntil,
        )
      : {}

  try {
    const doc = page.build(primaryJson, secondaryJson, {
      params: match.params,
      origin: (env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(
        /\/+$/,
        "",
      ),
      pathname: url.pathname,
      pageNumber,
      related,
    })
    if (doc.status) return { kind: "notFound", status: doc.status }
    return { kind: "page", doc }
  } catch (error) {
    // Unexpected JSON shape: serve the plain shell rather than a broken page.
    return {
      kind: "passthrough",
      reason: `build failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Kinds whose canonical is the entity's own URL (short-slug form): any other
 * spelling of it (the bare UUID, a stale slug) 301s there, so Google sees one
 * URL per entity. Pages whose canonical is the request path (orgs, users,
 * aggregates, bundles) and shop tabs are left alone.
 */
const CANONICAL_REDIRECT_KINDS: ReadonlySet<BridgePageKind> = new Set([
  "listing",
  "item",
  "ship",
  "commodity",
  "shop",
])

/** The canonical URL to 301 to, or null when the request already is it. */
export function canonicalRedirect(
  url: URL,
  kind: BridgePageKind,
  params: Record<string, string>,
  doc: BridgeDocument,
): URL | null {
  if (!CANONICAL_REDIRECT_KINDS.has(kind) || params.tab !== undefined)
    return null
  let canonical: URL
  try {
    canonical = new URL(doc.canonical)
  } catch {
    return null
  }
  if (canonical.origin !== url.origin || canonical.pathname === url.pathname)
    return null
  canonical.search = url.search
  return canonical
}

/** A permanent redirect on the same host (trailing slash, canonical spelling). */
function permanentRedirect(location: URL): Response {
  return new Response(null, {
    status: 301,
    headers: {
      Location: location.toString(),
      "Cache-Control": "public, max-age=3600",
      "X-SCM-Bridge": "redirect",
    },
  })
}

/** robots noindex added to a page's head (query-param variants of a page). */
function withNoindex(doc: BridgeDocument): BridgeDocument {
  const meta = doc.head.meta.filter((m) => m.name !== "robots")
  return {
    ...doc,
    head: {
      ...doc.head,
      meta: [...meta, { name: "robots", content: "noindex" }],
    },
  }
}

/**
 * Response headers. Function responses don't get public/_headers, so this
 * replicates what _headers gives the shell: `Cache-Control: no-cache` (the
 * /index.html rule — always revalidate so it references current hashed
 * chunks), the `/*` CORS and security headers, and for "/" the `Link` header.
 */
/**
 * HSTS for the main site, mirroring the `https://sc-market.space/*` rules in
 * public/_headers. Not includeSubDomains: not every *.sc-market.space host is
 * known to serve https. Never sent on white-label custom domains (they are
 * served by the same deployment, but their TLS is the org's business).
 */
export const HSTS_HEADER = "max-age=31536000"

function shellHeaders(
  shell: Response,
  outcome: PageOutcome["kind"] | "noindex",
  url: URL,
): Headers {
  const headers = documentHeaders(
    url,
    shell.headers.get("Content-Type") || "text/html; charset=utf-8",
  )
  headers.set("X-SCM-Bridge", outcome)
  return headers
}

/**
 * What public/_headers gives an HTML document, for Function responses (the
 * bridge's and the SSR Function's, src/ssr/pagesFunction.ts).
 */
export function documentHeaders(url: URL, contentType: string): Headers {
  const pathname = url.pathname
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "https://api.sc-market.space",
    "Access-Control-Allow-Credentials": "true",
    "Content-Security-Policy": "frame-ancestors 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  })
  // The `/embed/*` rule: the read-only widgets may be framed by any site.
  if (pathname.startsWith("/embed/")) {
    headers.delete("Content-Security-Policy")
    headers.delete("X-Frame-Options")
    headers.set("X-Robots-Tag", "noindex")
  }
  // The `/` rule's Link header (agent/tooling entry points).
  if (pathname === "/") headers.set("Link", HOME_LINK_HEADER)
  if (
    url.protocol === "https:" &&
    (url.hostname === "sc-market.space" ||
      url.hostname === "www.sc-market.space")
  ) {
    headers.set("Strict-Transport-Security", HSTS_HEADER)
  }
  return headers
}

/** 301 to a moved guide's new path on the same host, keeping the query. */
function guideRedirect(url: URL, target: string): Response {
  const location = new URL(target, url)
  location.search = url.search
  return new Response(null, {
    status: 301,
    headers: {
      Location: location.toString(),
      "Cache-Control": "public, max-age=86400",
      "X-SCM-Bridge": "redirect",
    },
  })
}

export async function handleBridgeRequest(
  ctx: BridgeContext,
  runtime: BridgeRuntime,
): Promise<Response> {
  const { request, env } = ctx
  if (request.method !== "GET" && request.method !== "HEAD") return ctx.next()

  const url = new URL(request.url)
  // Moved Help & Guides pages. Here, not public/_redirects: Pages doesn't
  // apply _redirects to paths a Function serves.
  const moved = guideRedirectTarget(url.pathname)
  if (moved) return guideRedirect(url, moved)
  const route = matchBridgeRoute(url.pathname)
  if (!route) return ctx.next()
  // White-label org domains are served by the same deployment; their pages
  // must never get SC Market's head or summary injected.
  if (!isMainSiteHostname(url.hostname)) return ctx.next()
  // One URL per page: "/market/x/" → "/market/x" (canonicals and the
  // sitemap never have the slash).
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    const location = new URL(url)
    location.pathname = url.pathname.replace(/\/+$/, "") || "/"
    return permanentRedirect(location)
  }

  const indexing = queryIndexing(url.searchParams)
  const page = BRIDGE_PAGES[route.route.kind]
  const paginated = !!page.paginated && indexing.pageNumber !== null

  // A guide's published translation is its own page, on `?lng=<locale>`
  // (the language query the whole site reads). The prerendered file is the
  // English guide, so the shell gets the translation's head and text. No
  // translation (or a stale one): the English file below, whose canonical is
  // the clean URL.
  if (route.route.kind === "guide" && !indexing.hasQuery) {
    const locale = requestedGuideLocale(url)
    if (locale) {
      const translated = await serveTranslatedGuide(
        ctx,
        runtime,
        url,
        route,
        locale,
      )
      if (translated) return translated
    }
  }

  // Prerendered pages (src/prerender/paths.ts): the static file already has
  // this head (built with these same builders) and the real page body. A
  // clean URL is served as is; `?page=N` of a paginated hub gets that page's
  // head and links over the static file; any other query (filters, search)
  // gets robots noindex (the static file's canonical is the clean URL).
  if (PRERENDERED_KINDS.has(route.route.kind)) {
    if (!indexing.hasQuery && PRERENDERED_DYNAMIC_KINDS.has(route.route.kind)) {
      return servePrerenderedOrBridge(ctx, runtime, url, route)
    }
    if (!indexing.hasQuery) return ctx.next()
    const file = await ctx.next()
    if (
      !file.ok ||
      !file.body ||
      !(file.headers.get("Content-Type") ?? "").includes("text/html")
    )
      return file
    if (!paginated) {
      return htmlResponse(
        request,
        rewriteShell(file, { kind: "notFound" }, runtime.HTMLRewriter),
        200,
        "noindex",
        url,
        file,
      )
    }
    const outcome = await resolvePage(url, env, runtime, ctx.waitUntil, route)
    if (outcome.kind === "page") {
      return htmlResponse(
        request,
        rewriteShell(
          file,
          { kind: "page", doc: outcome.doc },
          runtime.HTMLRewriter,
        ),
        200,
        "page",
        url,
        file,
      )
    }
    if (outcome.kind === "notFound") {
      return htmlResponse(
        request,
        rewriteShell(file, { kind: "notFound" }, runtime.HTMLRewriter),
        outcome.status ?? 404,
        "notFound",
        url,
        file,
      )
    }
    console.warn(
      `bridge fail-open for ${url.pathname}${url.search}: ${outcome.reason}`,
    )
    return htmlResponse(
      request,
      rewriteShell(file, { kind: "notFound" }, runtime.HTMLRewriter),
      200,
      "noindex",
      url,
      file,
    )
  }

  // The pretty path: Pages redirects /index.html → /. A fresh Request so no
  // visitor conditional headers turn the shell into a bodiless 304.
  const shell = await env.ASSETS.fetch(
    new Request(new URL(SHELL_PATH, url), { method: "GET" }),
  )
  if (!shell.ok || !shell.body) return ctx.next()

  const outcome = await resolvePage(url, env, runtime, ctx.waitUntil, route)
  if (outcome.kind === "passthrough" && outcome.reason !== "no route") {
    console.warn(`bridge fail-open for ${url.pathname}: ${outcome.reason}`)
  }

  if (outcome.kind === "page") {
    const redirect = canonicalRedirect(
      url,
      route.route.kind,
      route.params,
      outcome.doc,
    )
    if (redirect) return permanentRedirect(redirect)
  }

  // Query-param variants (search, filters, sort) are noindex; their
  // canonical is already the clean URL. `?page=N` of a paginated hub is its
  // own indexable page.
  const doc =
    outcome.kind === "page" && indexing.hasQuery && !paginated
      ? withNoindex(outcome.doc)
      : outcome.kind === "page"
        ? outcome.doc
        : null
  const status = outcome.kind === "notFound" ? (outcome.status ?? 404) : 200
  const html =
    outcome.kind === "passthrough"
      ? shell
      : rewriteShell(
          shell,
          doc ? { kind: "page", doc } : { kind: "notFound" },
          runtime.HTMLRewriter,
        )

  return htmlResponse(request, html, status, outcome.kind, url, shell)
}

/** The translation locale a guide URL asks for (`?lng=de`, `?lng=de-AT`), if any. */
export function requestedGuideLocale(url: URL): string | null {
  const lng = url.searchParams.get("lng")
  if (!lng) return null
  const locale = toSupportedLocale(lng)
  return isGuideLocale(locale) ? locale : null
}

/**
 * A guide in another language: the SPA shell with the translation's head
 * (title, description, canonical `?lng=<locale>`, hreflang alternates,
 * `<html lang>`) and its text, or null when the guide has no published
 * translation in that language (the caller serves the English file).
 */
async function serveTranslatedGuide(
  ctx: BridgeContext,
  runtime: BridgeRuntime,
  url: URL,
  route: BridgeMatch,
  locale: string,
): Promise<Response | null> {
  const outcome = await resolvePage(url, ctx.env, runtime, ctx.waitUntil, {
    route: route.route,
    params: { ...route.params, lng: locale },
  })
  if (outcome.kind !== "page") {
    if (outcome.kind === "passthrough")
      console.warn(
        `bridge: translated guide ${url.pathname}${url.search}: ${outcome.reason}`,
      )
    return null
  }
  const shell = await ctx.env.ASSETS.fetch(
    new Request(new URL(SHELL_PATH, url), { method: "GET" }),
  )
  if (!shell.ok || !shell.body) return null
  return htmlResponse(
    ctx.request,
    rewriteShell(
      shell,
      { kind: "page", doc: outcome.doc },
      runtime.HTMLRewriter,
    ),
    200,
    "page",
    url,
    shell,
  )
}

/** The marker renderDocument puts on a prerendered page's #root (the SPA shell has none). */
const PRERENDERED_ROOT = '<div id="root" data-prerendered'

/**
 * A clean URL of a PRERENDERED_DYNAMIC_KINDS page: the prerendered file
 * when the build made one; otherwise (Pages answered with the SPA fallback)
 * the bridge's page from the API: its head and summary over the shell, or
 * 404 + noindex for an unknown one (the API's 404, edge-cached like every
 * bridge lookup). An API failure serves the shell as is (fail open).
 */
async function servePrerenderedOrBridge(
  ctx: BridgeContext,
  runtime: BridgeRuntime,
  url: URL,
  route: BridgeMatch,
): Promise<Response> {
  const { request, env } = ctx
  const file = await ctx.next()
  if (
    !file.ok ||
    !(file.headers.get("Content-Type") ?? "").includes("text/html")
  )
    return file
  const html = await file.text()
  if (html.includes(PRERENDERED_ROOT)) {
    return new Response(request.method === "HEAD" ? null : html, {
      status: file.status,
      headers: file.headers,
    })
  }
  const shell = () => new Response(html, { status: 200, headers: file.headers })
  const outcome = await resolvePage(url, env, runtime, ctx.waitUntil, route)
  if (outcome.kind === "page") {
    return htmlResponse(
      request,
      rewriteShell(
        shell(),
        { kind: "page", doc: outcome.doc },
        runtime.HTMLRewriter,
      ),
      200,
      "page",
      url,
      file,
    )
  }
  if (outcome.kind === "notFound") {
    return htmlResponse(
      request,
      rewriteShell(shell(), { kind: "notFound" }, runtime.HTMLRewriter),
      outcome.status ?? 404,
      "notFound",
      url,
      file,
    )
  }
  console.warn(`bridge fail-open for ${url.pathname}: ${outcome.reason}`)
  return new Response(request.method === "HEAD" ? null : html, {
    status: 200,
    headers: file.headers,
  })
}

function htmlResponse(
  request: Request,
  html: Response,
  status: number,
  outcome: PageOutcome["kind"] | "noindex",
  url: URL,
  source: Response,
): Response {
  const headers = shellHeaders(source, outcome, url)
  return new Response(request.method === "HEAD" ? null : html.body, {
    status,
    headers,
  })
}
