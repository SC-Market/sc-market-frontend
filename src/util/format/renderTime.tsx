/**
 * "Now" and the time zone for rendering, so a server render (the SSR Pages
 * Function, the build-time prerender) and the browser hydrating its HTML
 * produce the same text.
 *
 * - RenderTimeProvider / useNow(): the render's time. The server renders
 *   with its own clock and ships that time with the page
 *   (PrerenderedData.renderedAt); a cached page can be served minutes (SSR)
 *   or days (prerender) later, so while the browser hydrates it uses that
 *   time, and the real clock afterwards.
 * - useRenderTimeZone(): the server knows no visitor time zone and renders
 *   dates in UTC (times labelled "UTC"); hydration renders the same, then
 *   the visitor's own zone.
 *
 * A page the browser renders itself (no server HTML) is "hydrated" from its
 * first render (useHydrated), so it never shows the server's variant.
 * Same pattern as SC Orgs (frontend/src/lib/hydration.tsx).
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useHydrated } from "../../hooks/ssr/useHydrated"

const RenderTimeContext = createContext<number | null>(null)

/** `now`: the server render's time (ms since epoch); null in a browser-only render. */
export function RenderTimeProvider({
  now,
  children,
}: {
  now: number | null
  children: ReactNode
}) {
  return (
    <RenderTimeContext.Provider value={now}>{children}</RenderTimeContext.Provider>
  )
}

/**
 * "Now" (ms since epoch) for render logic: relative times, "New" badges,
 * countdowns. The server render's time on the server and while hydrating
 * its HTML, then the clock. With `refreshMs`, re-renders on that interval
 * (a ticking countdown) once hydrated.
 */
export function useNow(refreshMs?: number): number {
  const hydrated = useHydrated()
  const renderedAt = useContext(RenderTimeContext)
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!hydrated || !refreshMs) return
    const id = setInterval(() => setTick((n) => n + 1), refreshMs)
    return () => clearInterval(id)
  }, [hydrated, refreshMs])
  return !hydrated && renderedAt !== null ? renderedAt : Date.now()
}

/** The time zone to format dates in: UTC on the server and while hydrating, then the visitor's (undefined). */
export function useRenderTimeZone(): "UTC" | undefined {
  return useHydrated() ? undefined : "UTC"
}
