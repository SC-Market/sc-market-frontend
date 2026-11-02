/**
 * The request a page is rendered for: host, language, theme and URL.
 *
 * On the server (SSR Pages Function) these come from the request (Host,
 * `?lng`, the `theme` cookie), never from `window`. Components that need
 * them during render read useRequestContext() instead of window.location /
 * document.cookie, so the server render and the browser's hydrating render
 * agree. In the browser, the provider is absent and the hook reads the
 * same values from the page.
 */
import { createContext, useContext, type ReactNode } from "react"
import type { RequestContextValue } from "./protocol"

export type { RequestContextValue }

const RequestContext = createContext<RequestContextValue | null>(null)

export function RequestContextProvider({
  value,
  children,
}: {
  value: RequestContextValue
  children: ReactNode
}) {
  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  )
}

/** Rendered without a request (the build-time prerender): the default. */
const BUILD_TIME: RequestContextValue = {
  host: "",
  lng: "en",
  theme: "system",
  url: "",
  whiteLabel: null,
}

/**
 * The variant the server HTML was rendered in, as the SSR Function marks it
 * on <html> (renderDocument): prerendered pages and the SPA shell carry no
 * marks, which means the default (main site, English, "system"). `host` is
 * the white-label hostname it was rendered for ("" for the main site).
 */
export function renderedVariant(): Pick<
  RequestContextValue,
  "lng" | "theme"
> & {
  host: string
} {
  const html = document.documentElement
  return {
    lng: html.getAttribute("data-ssr-lng") || "en",
    theme: html.getAttribute("data-ssr-theme") === "light" ? "light" : "system",
    host: html.getAttribute("data-ssr-host") || "",
  }
}

/**
 * The rendering request (server) or the current page (browser). In the
 * browser `whiteLabel` is null: the org's domain and theme come from their
 * caches, which entry.client seeded from the server's answer
 * (src/ssr/whiteLabel.ts).
 */
export function useRequestContext(): RequestContextValue {
  const value = useContext(RequestContext)
  if (value) return value
  if (typeof window === "undefined") return BUILD_TIME
  const { lng, theme } = renderedVariant()
  return {
    host: window.location.hostname,
    lng,
    theme,
    url: window.location.href,
    whiteLabel: null,
  }
}
