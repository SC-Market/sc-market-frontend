/**
 * The sitemap on the main host: sc-market.space/sitemap.xml and its
 * sections (/sitemap-<section>-<n>.xml) are proxied from the API, which
 * builds them (sc-market-backend src/services/sitemap). Serving them here
 * puts the sitemap on the same host as the pages it lists, so it matches the
 * Search Console property and robots.txt can point at it.
 *
 * - Only these file names; anything else goes to Pages (ctx.next()).
 * - On an org's white-label host (the SSR `host` variant), its own
 *   robots.txt and sitemap.xml instead (src/bridge/whiteLabelSeo.ts).
 * - The index's section URLs are rewritten to this host.
 * - Edge-cached for an hour per URL (the API rebuilds every 6 hours).
 * - The API's Last-Modified (the file's <lastmod>) is passed through; the
 *   index's per-section <lastmod>s come through the host rewrite unchanged.
 * - An unknown section is a 404; an API failure is a 503 with Retry-After
 *   (never cached), so a crawler retries instead of dropping the sitemap.
 */
import { isMainSiteHostname } from "../util/mainSiteHost"
import {
  handleWhiteLabelSeoFile,
  type WhiteLabelSeoContext,
} from "./whiteLabelSeo"

/** /sitemap.xml or /sitemap-<section>-<n>.xml (sections may be hyphenated: missions-hubs) */
export const SITEMAP_PATH = /^\/sitemap(-[a-z]+(?:-[a-z]+)*-[0-9]{1,3})?\.xml$/

/** Edge-cache lifetime of a proxied sitemap file. */
export const SITEMAP_TTL_SECONDS = 60 * 60
/** Upstream budget: a cold API rebuild can take a few seconds. */
export const SITEMAP_TIMEOUT_MS = 15_000

export interface SitemapRuntime {
  cache?: Cache
  fetch: typeof fetch
}

function xmlResponse(
  body: string | null,
  status: number,
  extra: Record<string, string> = {},
): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type":
        status === 200
          ? "application/xml; charset=utf-8"
          : "text/plain; charset=utf-8",
      "X-SCM-Bridge": "sitemap",
      ...extra,
    },
  })
}

export async function handleSitemapRequest(
  ctx: WhiteLabelSeoContext,
  runtime: SitemapRuntime,
): Promise<Response> {
  const whiteLabel = await handleWhiteLabelSeoFile(ctx, runtime, (path) =>
    SITEMAP_PATH.test(path),
  )
  if (whiteLabel) return whiteLabel
  const { request, env } = ctx
  if (request.method !== "GET" && request.method !== "HEAD") return ctx.next()
  const url = new URL(request.url)
  if (!SITEMAP_PATH.test(url.pathname) || !isMainSiteHostname(url.hostname))
    return ctx.next()
  const apiBase = env.VITE_BACKEND_URL?.replace(/\/+$/, "")
  if (!apiBase)
    return xmlResponse("Sitemap unavailable", 503, { "Retry-After": "600" })

  const cacheKey = new Request(`${url.origin}${url.pathname}`, {
    method: "GET",
  })
  const cached = await runtime.cache?.match(cacheKey)
  if (cached)
    return request.method === "HEAD"
      ? new Response(null, { status: cached.status, headers: cached.headers })
      : cached

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SITEMAP_TIMEOUT_MS)
  let upstream: Response
  let body: string
  try {
    upstream = await runtime.fetch(`${apiBase}${url.pathname}`, {
      method: "GET",
      headers: { Accept: "application/xml" },
      redirect: "manual",
      signal: controller.signal,
    })
    body = await upstream.text()
  } catch {
    return xmlResponse("Sitemap temporarily unavailable", 503, {
      "Retry-After": "600",
    })
  } finally {
    clearTimeout(timer)
  }
  if (upstream.status === 404)
    return xmlResponse("Sitemap not found", 404, {
      "Cache-Control": "public, max-age=300",
    })
  if (upstream.status !== 200 || !body.trimStart().startsWith("<?xml")) {
    return xmlResponse("Sitemap temporarily unavailable", 503, {
      "Retry-After": "600",
    })
  }

  // The index lists the sections on the API host: list them on this one.
  const xml =
    url.pathname === "/sitemap.xml"
      ? body.split(`${apiBase}/sitemap-`).join(`${url.origin}/sitemap-`)
      : body
  const lastModified = upstream.headers.get("Last-Modified")
  const response = xmlResponse(xml, 200, {
    "Cache-Control": `public, max-age=${SITEMAP_TTL_SECONDS}`,
    ...(lastModified ? { "Last-Modified": lastModified } : {}),
  })
  if (runtime.cache)
    ctx.waitUntil(runtime.cache.put(cacheKey, response.clone()))
  return request.method === "HEAD"
    ? new Response(null, { status: 200, headers: response.headers })
    : response
}
