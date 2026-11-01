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
 * The page variant to render for a request: `?lng` or the i18next cookie
 * (the browser's detection order, minus localStorage and the browser
 * language, which the server can't see), and the theme cookie. Cookies are
 * only read here, never forwarded.
 */
export function requestContextFrom(request: Request): RequestContextValue {
  const url = new URL(request.url)
  const cookies = request.headers.get("Cookie") ?? ""
  const theme = cookieValue(cookies, "theme") === "light" ? "light" : "system"
  const requested =
    url.searchParams.get("lng") || cookieValue(cookies, "i18next") || "en"
  return {
    host: url.hostname,
    lng: toSupportedLocale(requested),
    theme,
    url: url.href,
  }
}

/**
 * The cache-key suffix of a rendered variant: empty for the default (dark,
 * English), so most visitors and every crawler share one entry per path.
 */
export function variantKey(context: RequestContextValue): string {
  const parts: string[] = []
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
