/**
 * What the SSR Pages Function (src/ssr/pagesFunction.ts) hands React
 * Router's loaders and entry.server.tsx for one request, as React Router's
 * load context (`context` in a loader, the 5th argument of handleRequest).
 * Absent at build time (the prerender): loaders then do nothing.
 */
import type { AppStore } from "../store/store"
import type { ContentSource } from "../server/contentSource"
import type { ApiFetch } from "./apiFetch"
import type { RequestContextValue } from "./protocol"

export interface SsrRequest {
  /** This request's store (per request, never shared). */
  store: AppStore
  /** Host, language, theme and URL of the request (requestContext.ts). */
  requestContext: RequestContextValue
  /** The API fetch the store's queries go through (apiFetch.ts). */
  api: ApiFetch
  /** This deployment's static files (Pages' ASSETS binding). */
  assets: ContentSource
  /** Public API and frontend origins (the SPA's build-time values). */
  env: { VITE_BACKEND_URL?: string; VITE_FRONTEND_URL?: string }
  waitUntil: (promise: Promise<unknown>) => void
  /** Set by the loaders: the route's entity doesn't exist. */
  notFound: boolean
  /**
   * Set by the loaders: the page's primary query failed for another reason
   * (429, 5xx, a timeout). The Function then fails open to the bridge, and
   * nothing is cached: an error page must never be stored as the page.
   */
  failed?: string
}

export interface SsrLoadContext {
  ssr?: SsrRequest
}

export function getSsrRequest(context: unknown): SsrRequest | undefined {
  return (context as SsrLoadContext | undefined)?.ssr
}
