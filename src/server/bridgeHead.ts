/**
 * The head tags a server-rendered page gets: the edge bridge's own document
 * for the path (src/bridge/handler.ts resolvePage), built with the same
 * builders and the same public API, so crawlers get at least what the
 * bridge gives them (title, description, og:/twitter:, canonical, JSON-LD).
 * The page body is the real render instead of the bridge's summary.
 *
 * Used by the build-time prerender and the SSR Pages Function
 * (entry.server.tsx). Help & Guides pages read the content build's JSON
 * through a ContentSource (ASSETS on Cloudflare, build/client at build time).
 */
import { canonicalRedirect, resolvePage } from "../bridge/handler"
import { headMarkup, relatedLinksHtml, type HtmlRewriterConstructor } from "../bridge/render"
import { matchBridgeRoute } from "../bridge/routes"
import type { ContentSource } from "./contentSource"

/** The bridge never rewrites HTML here; it only builds the document. */
const noRewriter = class {
  on() {
    throw new Error("not used for server renders")
  }
} as unknown as HtmlRewriterConstructor

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export type BridgeHeadResult =
  /**
   * `relatedHtml`: the bridge summary's link lists (relatedLinksHtml), for
   * the end of a server-rendered #root ("" without links).
   */
  | { kind: "page"; tags: string; relatedHtml: string }
  /** Unknown entity, or one that is gone (sold, cancelled: 404 / 410). */
  | { kind: "notFound"; status: 404 | 410 }
  /** Not the canonical spelling of the page (bridge canonicalRedirect): 301 there. */
  | { kind: "redirect"; location: string }
  | { kind: "none"; reason: string }

export interface BridgeHeadOptions {
  env: { VITE_BACKEND_URL?: string; VITE_FRONTEND_URL?: string }
  assets: ContentSource
  /** The API fetch (the SSR Function passes its edge-cached one). */
  fetch?: typeof fetch
  /** Cloudflare's caches.default, for the bridge's API JSON cache. */
  cache?: Cache
  waitUntil?: (promise: Promise<unknown>) => void
}

/** `<title>` + meta/canonical/JSON-LD for `pathname`, as the bridge renders them. */
export async function bridgeHeadTags(
  pathname: string,
  origin: string,
  options: BridgeHeadOptions,
): Promise<BridgeHeadResult> {
  const fetchFn = options.fetch ?? ((input, init) => fetch(input, init))
  const url = new URL(pathname, origin)
  const match = matchBridgeRoute(url.pathname)
  const outcome = await resolvePage(
    url,
    { ASSETS: options.assets, ...options.env },
    { HTMLRewriter: noRewriter, fetch: fetchFn, cache: options.cache },
    options.waitUntil ?? (() => {}),
    match ?? undefined,
  )
  if (outcome.kind === "notFound") return { kind: "notFound", status: outcome.status ?? 404 }
  if (outcome.kind !== "page") return { kind: "none", reason: outcome.reason }
  const { doc } = outcome
  const redirect = match ? canonicalRedirect(url, match.route.kind, match.params, doc) : null
  if (redirect) return { kind: "redirect", location: redirect.toString() }
  return {
    kind: "page",
    tags: `<title>${escapeText(doc.title)}</title>${headMarkup(doc.head, doc.canonical, false)}`,
    relatedHtml: relatedLinksHtml(doc.summary),
  }
}
