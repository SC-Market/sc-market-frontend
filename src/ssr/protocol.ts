/**
 * What the SSR Pages Function (pagesFunction.ts, bundled by Cloudflare from
 * source) and the app's server build (entry.server.tsx, bundled by Vite)
 * share. Plain TypeScript only: the Function can't import app modules
 * directly (Vite-only imports such as images and `?raw`), so it reaches
 * the app through the server build's entry module (`build.entry.module`).
 */
import type { ContentSource } from "../server/contentSource"
import { toSupportedLocale } from "../util/locales"

/** Header on entry.server's answer: "page" | "not-found" | "redirect" | "route-error" | "failed". */
export const SSR_OUTCOME_HEADER = "X-SCM-SSR-Outcome"

/** Why entry.server answered "failed" (logged by the Function). */
export const SSR_FAILURE_HEADER = "X-SCM-SSR-Failure"

/**
 * On a "page" answer: the render is complete but some of its data failed
 * transiently (a 429, a 5xx, a timeout), so it is served but not cached. The
 * value says which queries (logged, and sent to the visitor as
 * `X-SCM-SSR-Partial`).
 */
export const SSR_PARTIAL_HEADER = "X-SCM-SSR-Partial"

/**
 * The page variants the SSR Function can render besides the default (main
 * site, dark, English), each behind its own switch (`SSR_VARIANTS`,
 * pagesFunction.ts):
 * - `theme`: the light theme (the `theme` cookie, or the `scm_scheme`
 *   cookie the pre-theme script writes when the theme follows the OS).
 * - `locale`: the visitor's language (`?lng`, the `i18next` cookie, then
 *   Accept-Language on a first visit).
 * - `host`: an org's white-label domain, with its branding and theme.
 */
export type SsrVariant = "theme" | "locale" | "host"
export const ALL_SSR_VARIANTS: readonly SsrVariant[] = [
  "theme",
  "locale",
  "host",
]

/** An org's white-label domain as the server resolved it for the render. */
export interface SsrWhiteLabel {
  /** The request's hostname (lowercase). */
  hostname: string
  /** GET /api/domain/:hostname (the browser caches the same answer). */
  domain: {
    spectrum_id: string
    contractor_id: string
    name: string
    focus_mode: "public" | "internal"
    homepage_path: string | null
    require_membership: boolean
  }
  /** GET /api/contractors/:sid/theme; null when the org has none (404). */
  theme: {
    theme_data: {
      light: Record<string, unknown>
      dark: Record<string, unknown>
    }
    favicon_url: string | null
    updated_at: string
  } | null
}

export interface RequestContextValue {
  /** Request hostname (white-label domains render a different shell). */
  host: string
  /** Language the page is rendered in (a shipped locale, "en" by default). */
  lng: string
  /**
   * Theme the page is rendered in: "light" when the visitor's theme cookie
   * says so, otherwise "system" (rendered dark, like a prerendered page).
   */
  theme: "light" | "system"
  /** The full request URL. */
  url: string
  /**
   * The white-label org the page is rendered for (the `host` variant);
   * null on the main site, and wherever it isn't rendered.
   */
  whiteLabel: SsrWhiteLabel | null
}

function cookieValue(cookies: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(cookies)
  if (!match) return undefined
  try {
    return decodeURIComponent(match[1]).trim()
  } catch {
    return undefined
  }
}

/**
 * The theme a page is rendered in, from the cookies: light for the `theme`
 * cookie "light", and for a theme that follows the OS ("system", or no
 * cookie) when the pre-theme script last saw a light OS (`scm_scheme`,
 * src/document/document.html). Everything else (dark, the custom themes)
 * is rendered dark. Pure (tested).
 */
export function themeFromCookies(cookies: string): "light" | "system" {
  const theme = cookieValue(cookies, "theme")
  if (theme === "light") return "light"
  if (
    (theme === undefined || theme === "" || theme === "system") &&
    cookieValue(cookies, "scm_scheme") === "light"
  ) {
    return "light"
  }
  return "system"
}

/**
 * The shipped locale an Accept-Language header asks for, the way i18next's
 * browser detector picks from navigator.languages: the tags by preference
 * (q), the first one we ship (regional tags count: "de-AT" -> "de"). Null
 * when none is shipped, or the header is missing. Pure (tested).
 */
export function localeFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null
  const tags = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
      const weight = q ? Number(q.slice(2)) : 1
      return {
        tag: tag.trim(),
        weight: Number.isFinite(weight) ? weight : 0,
        index,
      }
    })
    .filter((t) => t.tag && t.tag !== "*" && t.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
  for (const { tag } of tags) {
    if (isShippedLocale(tag)) return toSupportedLocale(tag)
  }
  return null
}

/** Whether a language tag maps onto a locale we ship (not the "en" fallback). */
function isShippedLocale(tag: string): boolean {
  const locale = toSupportedLocale(tag)
  return locale !== "en" || tag.toLowerCase().split("-")[0] === "en"
}

/** Which variants this request may get (pagesFunction.ts ssrVariants). */
export interface VariantOptions {
  enabled: ReadonlySet<SsrVariant>
  /**
   * A crawler (pagesFunction.ts isCrawler): always the default theme and
   * English, whatever it sends. Locale isn't in the URL, so the indexed
   * page is the English one (docs/ssr-worker.md, "Variants and SEO").
   */
  crawler: boolean
}

/**
 * The page variant to render for a request, among the enabled ones.
 * Language: `?lng`, the i18next cookie, then Accept-Language (a first
 * visit: what the browser's language detection will pick too), else
 * English: the browser's detection order, minus localStorage, which the
 * server can't see (a visitor whose stored language differs gets the page
 * rendered from scratch, entry.client.tsx renderFresh). Theme:
 * themeFromCookies. Cookies are only read here, never forwarded.
 * `whiteLabel` is filled in by the Function once it has resolved the host.
 */
export function requestContextFrom(
  request: Request,
  options: VariantOptions,
): RequestContextValue {
  const url = new URL(request.url)
  const cookies = request.headers.get("Cookie") ?? ""
  const personal = !options.crawler
  const theme =
    personal && options.enabled.has("theme")
      ? themeFromCookies(cookies)
      : "system"
  let lng = "en"
  if (personal && options.enabled.has("locale")) {
    const requested =
      url.searchParams.get("lng") || cookieValue(cookies, "i18next")
    lng = requested
      ? toSupportedLocale(requested)
      : (localeFromAcceptLanguage(request.headers.get("Accept-Language")) ??
        "en")
  }
  return {
    host: url.hostname.toLowerCase(),
    lng,
    theme,
    url: url.href,
    whiteLabel: null,
  }
}

/**
 * The cache-key suffix of a rendered variant: empty for the default (main
 * site, dark, English), so most visitors and every crawler share one entry
 * per path. Variants never share an entry: the host (white-label), theme and
 * language are all in the key when they aren't the default.
 */
export function variantKey(context: RequestContextValue): string {
  const parts: string[] = []
  if (context.whiteLabel) parts.push(`host=${context.whiteLabel.hostname}`)
  if (context.theme === "light") parts.push("theme=light")
  if (context.lng !== "en") parts.push(`lng=${context.lng}`)
  return parts.length > 0 ? `~${parts.join("~")}` : ""
}

/** What the Function passes to the server build's createSsrRequest(). */
export interface SsrRequestOptions {
  requestContext: RequestContextValue
  /** The API fetch for this request (apiFetch.ts). */
  api: import("./apiFetch").ApiFetch
  assets: ContentSource
  env: { VITE_BACKEND_URL?: string; VITE_FRONTEND_URL?: string }
  waitUntil: (promise: Promise<unknown>) => void
}

/** The extra exports of entry.server.tsx the Function uses. */
export interface SsrEntryModule {
  /** The load context for one request (`{ ssr }`, see context.ts). */
  createSsrLoadContext(options: SsrRequestOptions): Record<string, unknown>
}
