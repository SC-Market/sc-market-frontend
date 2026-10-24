/**
 * Edge bridge: a route-scoped Cloudflare Pages Function that serves the
 * static SPA shell with real per-page <title>, meta/OG, canonical, JSON-LD
 * and a visible plain-text summary, so crawlers and link previews that
 * don't run JS see the page. Every visitor (human or bot) gets the same
 * response; humans then run the SPA exactly as today.
 *
 * - Data: anonymous GETs to the public API (VITE_BACKEND_URL). No visitor
 *   cookies or headers are forwarded; Workers' fetch has no cookie jar.
 * - Unknown entity (API 404, or 400 from v1): shell + robots noindex, 404.
 * - Anything else going wrong (timeout, 5xx, bad JSON, a builder throwing,
 *   missing config): the unmodified shell (fail open), never an error page.
 * - The rendered HTML is not cached (it embeds the current deploy's hashed
 *   asset URLs); the API JSON is edge-cached per URL with the Cache API.
 */
import { BRIDGE_PAGES, type ApiRequest, type BridgeDocument } from "./pages"
import { matchBridgeRoute } from "./routes"
import { rewriteShell, type HtmlRewriterConstructor } from "./render"
import { DEFAULT_FRONTEND_URL } from "../seo/constants"
import { isMainSiteHostname } from "../util/mainSiteHost"

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
    return { kind: "error", reason: error instanceof Error ? error.name : "fetch failed" }
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

export type PageOutcome =
  | { kind: "page"; doc: BridgeDocument }
  | { kind: "notFound" }
  | { kind: "passthrough"; reason: string }

/** Resolve a request path to what the bridge should serve. Never throws. */
export async function resolvePage(
  url: URL,
  env: BridgeEnv,
  runtime: BridgeRuntime,
  waitUntil: (promise: Promise<unknown>) => void,
): Promise<PageOutcome> {
  const match = matchBridgeRoute(url.pathname)
  if (!match) return { kind: "passthrough", reason: "no route" }

  const page = BRIDGE_PAGES[match.route.kind]
  const primaryRequest = page.primary?.(match.params)
  const secondaryRequest = page.secondary?.(match.params)

  let primaryJson: unknown = undefined
  let secondaryJson: unknown = undefined
  if (primaryRequest) {
    const apiBase = env.VITE_BACKEND_URL?.replace(/\/+$/, "")
    if (!apiBase) return { kind: "passthrough", reason: "VITE_BACKEND_URL not set" }

    const [primary, secondary] = await Promise.all([
      fetchApi(`${apiBase}${primaryRequest.path}`, primaryRequest, runtime, waitUntil),
      secondaryRequest
        ? fetchApi(`${apiBase}${secondaryRequest.path}`, secondaryRequest, runtime, waitUntil)
        : undefined,
    ])

    if (primary.kind === "notFound") return { kind: "notFound" }
    if (primary.kind === "error") return { kind: "passthrough", reason: primary.reason }
    primaryJson = primary.json
    secondaryJson = secondary?.kind === "ok" ? secondary.json : undefined
  }

  try {
    const doc = page.build(primaryJson, secondaryJson, {
      params: match.params,
      origin: (env.VITE_FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, ""),
      pathname: url.pathname,
    })
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
 * Response headers. Function responses don't get public/_headers, so this
 * replicates what _headers gives the shell: `Cache-Control: no-cache` (the
 * /index.html rule — always revalidate so it references current hashed
 * chunks), the `/*` CORS pair, and for "/" the `Link` header.
 */
function shellHeaders(
  shell: Response,
  outcome: PageOutcome["kind"],
  pathname: string,
): Headers {
  const headers = new Headers({
    "Content-Type": shell.headers.get("Content-Type") || "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "https://api.sc-market.space",
    "Access-Control-Allow-Credentials": "true",
    "X-SCM-Bridge": outcome,
  })
  // The `/` rule's Link header (agent/tooling entry points).
  if (pathname === "/") headers.set("Link", HOME_LINK_HEADER)
  return headers
}

export async function handleBridgeRequest(
  ctx: BridgeContext,
  runtime: BridgeRuntime,
): Promise<Response> {
  const { request, env } = ctx
  if (request.method !== "GET" && request.method !== "HEAD") return ctx.next()

  const url = new URL(request.url)
  if (!matchBridgeRoute(url.pathname)) return ctx.next()
  // White-label org domains are served by the same deployment; their pages
  // must never get SC Market's head or summary injected.
  if (!isMainSiteHostname(url.hostname)) return ctx.next()

  // The pretty path: Pages redirects /index.html → /. A fresh Request so no
  // visitor conditional headers turn the shell into a bodiless 304.
  const shell = await env.ASSETS.fetch(new Request(new URL("/", url), { method: "GET" }))
  if (!shell.ok || !shell.body) return ctx.next()

  const outcome = await resolvePage(url, env, runtime, ctx.waitUntil)
  if (outcome.kind === "passthrough" && outcome.reason !== "no route") {
    console.warn(`bridge fail-open for ${url.pathname}: ${outcome.reason}`)
  }

  const headers = shellHeaders(shell, outcome.kind, url.pathname)
  const status = outcome.kind === "notFound" ? 404 : 200
  const html =
    outcome.kind === "passthrough"
      ? shell
      : rewriteShell(
          shell,
          outcome.kind === "page" ? { kind: "page", doc: outcome.doc } : { kind: "notFound" },
          runtime.HTMLRewriter,
        )

  return new Response(request.method === "HEAD" ? null : html.body, { status, headers })
}
