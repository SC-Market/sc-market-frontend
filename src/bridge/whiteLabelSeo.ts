/**
 * robots.txt and sitemap.xml on an org's white-label host (the SSR `host`
 * variant, docs/ssr-worker.md): served by the sitemap route
 * (functions/[sitemap].ts), the existing Function, not a new one.
 *
 * - robots.txt: the main site's rules (public/robots.txt), pointing at the
 *   host's own sitemap. A members-only or internal domain disallows
 *   everything (its pages are behind a sign-in).
 * - sitemap.xml: the org's own pages on the host, which are self-canonical
 *   there (src/seo/pageHead.ts whiteLabelPageHead): the org page, its
 *   active shops and its publicly listed listings. No section files.
 * - An unknown host, or the variant switched off: not handled (null), so
 *   the static files answer as before.
 * - Edge-cached for an hour per host and file; an API failure is a 503 with
 *   Retry-After (never cached).
 *
 * Anonymous GETs of public endpoints only, like the SSR renders.
 */
import type { BridgeContext } from "./handler"
import type { SitemapRuntime } from "./sitemapProxy"
import { whiteLabelHostServed, type SsrSwitchEnv } from "../ssr/variants"
import { MARKET_PATHS, ORG_PATHS, SHOP_PATHS } from "../routes/paths"

/** Edge-cache lifetime of a white-label robots.txt or sitemap.xml. */
export const WHITE_LABEL_SEO_TTL_SECONDS = 60 * 60
/** Listings search pages read for the sitemap (100 each). */
export const WHITE_LABEL_SITEMAP_LISTING_PAGES = 10
const LISTING_PAGE_SIZE = 100
const API_TIMEOUT_MS = 5_000

export type WhiteLabelSeoContext = Omit<BridgeContext, "env"> & {
  env: BridgeContext["env"] & SsrSwitchEnv
}

/** The domain lookup's answer (GET /api/domain/:hostname). */
interface DomainAnswer {
  spectrum_id?: string
  focus_mode?: string
  require_membership?: boolean
}

class ApiUnavailable extends Error {}

function textResponse(
  body: string,
  status: number,
  contentType: string,
  extra: Record<string, string> = {},
): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": contentType,
      "X-SCM-Bridge": "white-label",
      ...extra,
    },
  })
}

function unavailable(): Response {
  return textResponse(
    "Temporarily unavailable",
    503,
    "text/plain; charset=utf-8",
    { "Retry-After": "600" },
  )
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function getJson<T>(
  runtime: SitemapRuntime,
  url: string,
  notFound: T,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await runtime.fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
    if (response.status === 404) return notFound
    if (!response.ok) throw new ApiUnavailable(`${response.status}`)
    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiUnavailable) throw error
    throw new ApiUnavailable(String(error))
  } finally {
    clearTimeout(timer)
  }
}

/** The robots.txt of a public white-label host: the site's, its own sitemap. */
export function whiteLabelRobots(siteRobots: string, origin: string): string {
  const sitemap = `Sitemap: ${origin}/sitemap.xml`
  return /^Sitemap:.*$/m.test(siteRobots)
    ? siteRobots.replace(/^Sitemap:.*$/gm, () => sitemap)
    : `${siteRobots.trimEnd()}\n\n${sitemap}\n`
}

/** robots.txt of a members-only or internal domain. */
export const PRIVATE_ROBOTS = "User-agent: *\nDisallow: /\n"

/** A sitemap <urlset> of the given absolute URLs. */
export function urlsetXml(urls: readonly string[]): string {
  const entries = urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n")
}

/** The org's own pages on its host: org page, active shops, listings. */
async function orgPageUrls(
  apiBase: string,
  spectrumId: string,
  origin: string,
  runtime: SitemapRuntime,
): Promise<string[]> {
  const sid = encodeURIComponent(spectrumId)
  const urls = [`${origin}${ORG_PATHS.profile(spectrumId)}`]
  const shops = await getJson<{ slug?: string; status?: string }[]>(
    runtime,
    `${apiBase}/api/v2/shops/by-owner?spectrum_id=${sid}`,
    [],
  )
  for (const shop of Array.isArray(shops) ? shops : []) {
    if (shop.slug && shop.status === "active") {
      urls.push(`${origin}${SHOP_PATHS.profile(shop.slug)}`)
    }
  }
  const seen = new Set<string>()
  for (let page = 1; page <= WHITE_LABEL_SITEMAP_LISTING_PAGES; page++) {
    const result = await getJson<{
      listings?: { listing_id: string; title: string }[]
      total?: number
    }>(
      runtime,
      `${apiBase}/api/v2/listings/search?org=${sid}&page=${page}&page_size=${LISTING_PAGE_SIZE}&quantity_min=1`,
      {},
    )
    const listings = Array.isArray(result.listings) ? result.listings : []
    for (const listing of listings) {
      // One row per listing item: a bundle appears once per item.
      if (seen.has(listing.listing_id)) continue
      seen.add(listing.listing_id)
      urls.push(
        `${origin}${MARKET_PATHS.listing(listing.listing_id, listing.title)}`,
      )
    }
    if (
      listings.length < LISTING_PAGE_SIZE ||
      page * LISTING_PAGE_SIZE >= (result.total ?? 0)
    ) {
      break
    }
  }
  return urls
}

/**
 * The white-label host's robots.txt or sitemap file, or null when this
 * request isn't one (not a served white-label host, another path, an
 * unknown host): the caller lets Pages answer.
 */
export async function handleWhiteLabelSeoFile(
  ctx: WhiteLabelSeoContext,
  runtime: SitemapRuntime,
  isSitemapPath: (pathname: string) => boolean,
): Promise<Response | null> {
  const { request, env } = ctx
  if (request.method !== "GET" && request.method !== "HEAD") return null
  const url = new URL(request.url)
  const hostname = url.hostname.toLowerCase()
  if (!whiteLabelHostServed(env, hostname)) return null
  const robots = url.pathname === "/robots.txt"
  if (!robots && !isSitemapPath(url.pathname)) return null
  const apiBase = env.VITE_BACKEND_URL?.replace(/\/+$/, "")
  if (!apiBase) return null
  const origin = `https://${hostname}`

  const cacheKey = new Request(
    `https://white-label-seo.sc-market.internal/${hostname}${url.pathname}`,
    { method: "GET" },
  )
  const cached = await runtime.cache?.match(cacheKey)
  const answer = async (response: Response): Promise<Response> =>
    request.method === "HEAD"
      ? new Response(null, {
          status: response.status,
          headers: response.headers,
        })
      : response
  if (cached) return answer(cached)

  let response: Response
  try {
    const domain = (
      await getJson<{ data?: DomainAnswer }>(
        runtime,
        `${apiBase}/api/domain/${encodeURIComponent(hostname)}`,
        {},
      )
    ).data
    if (!domain?.spectrum_id) return null
    const isPublic =
      (domain.focus_mode ?? "public") === "public" && !domain.require_membership
    const cacheControl = {
      "Cache-Control": `public, max-age=${WHITE_LABEL_SEO_TTL_SECONDS}`,
    }
    if (robots) {
      let body = PRIVATE_ROBOTS
      if (isPublic) {
        const site = await ctx.next()
        if (!site.ok) return unavailable()
        body = whiteLabelRobots(await site.text(), origin)
      }
      response = textResponse(
        body,
        200,
        "text/plain; charset=utf-8",
        cacheControl,
      )
    } else if (!isPublic || url.pathname !== "/sitemap.xml") {
      // No section files on a white-label host; nothing to list behind a sign-in.
      response = textResponse(
        "Sitemap not found",
        404,
        "text/plain; charset=utf-8",
        cacheControl,
      )
    } else {
      const urls = await orgPageUrls(
        apiBase,
        domain.spectrum_id,
        origin,
        runtime,
      )
      response = textResponse(
        urlsetXml(urls),
        200,
        "application/xml; charset=utf-8",
        cacheControl,
      )
    }
  } catch (error) {
    if (error instanceof ApiUnavailable) return unavailable()
    throw error
  }
  if (runtime.cache) {
    ctx.waitUntil(runtime.cache.put(cacheKey, response.clone()))
  }
  return answer(response)
}
