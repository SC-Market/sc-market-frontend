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

/** The rendering request (server) or the current page (browser). */
export function useRequestContext(): RequestContextValue {
  const value = useContext(RequestContext)
  if (value) return value
  if (typeof window === "undefined") {
    throw new Error("useRequestContext: no request context on the server")
  }
  return {
    host: window.location.hostname,
    lng: document.documentElement.lang || "en",
    theme: "system",
    url: window.location.href,
  }
}
