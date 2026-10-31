/**
 * What the SSR Pages Function (pagesFunction.ts, bundled by Cloudflare from
 * source) and the app's server build (entry.server.tsx, bundled by Vite)
 * share. Plain TypeScript only: the Function can't import app modules
 * directly (Vite-only imports such as images and `?raw`), so it reaches
 * the app through the server build's entry module (`build.entry.module`).
 */
import type { ContentSource } from "../server/contentSource"

/** Header on entry.server's answer: "page" | "not-found" | "route-error". */
export const SSR_OUTCOME_HEADER = "X-SCM-SSR-Outcome"

export interface RequestContextValue {
  /** Request hostname (white-label domains render a different shell). */
  host: string
  /** Language the page is rendered in (BCP-47). */
  lng: string
  /** "dark" | "light" | "system" ("system" when no cookie). */
  theme: string
  /** The full request URL. */
  url: string
}

/** Parse the request's context from a Request (server). */
export function requestContextFrom(request: Request): RequestContextValue {
  const url = new URL(request.url)
  const cookies = request.headers.get("Cookie") ?? ""
  const theme = /(?:^|;\s*)theme=([^;]+)/.exec(cookies)?.[1]?.trim() || "system"
  const lng = url.searchParams.get("lng") || "en"
  return { host: url.hostname, lng, theme, url: url.href }
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
