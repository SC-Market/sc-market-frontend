/**
 * useHoverPrefetch — prefetch a route on hover with debounce.
 * Returns mouseenter/mouseleave handlers to attach to the hovered element.
 *
 * - `routePath`: routeRegistry key whose JS chunk to prefetch.
 * - `url`: the concrete link target; when given, the page's data is
 *   prefetched too (see src/router/dataPrefetchRegistry.ts).
 *
 * Only prefetches once per URL (or per route when no URL is given).
 */
import { useRef, useCallback } from "react"
import { useDispatch } from "react-redux"
import { prefetchRoute } from "../../router/routePrefetch"
import { prefetchDataForPath } from "../../router/dataPrefetchRegistry"
import type { PrefetchDispatch } from "../../router/dataPrefetch"

const prefetched = new Set<string>()

export function useHoverPrefetch(routePath: string | undefined, url?: string) {
  const dispatch = useDispatch<PrefetchDispatch>()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = useCallback(() => {
    const key = url ?? routePath
    if (!key || prefetched.has(key)) return
    timerRef.current = setTimeout(() => {
      if (routePath) prefetchRoute(routePath)
      if (url) prefetchDataForPath(dispatch, url)
      prefetched.add(key)
    }, 150)
  }, [routePath, url, dispatch])

  const onMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { onMouseEnter, onMouseLeave }
}
