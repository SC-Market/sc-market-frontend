/**
 * useHoverPrefetch — prefetch a route component on hover with debounce.
 * Attaches mouseenter/mouseleave to a ref'd element.
 * Only prefetches once per route, respects network conditions.
 */
import { useRef, useCallback } from "react"
import { prefetchRoute } from "../../router/routePrefetch"

const prefetched = new Set<string>()

export function useHoverPrefetch(routePath: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = useCallback(() => {
    if (prefetched.has(routePath)) return
    timerRef.current = setTimeout(() => {
      prefetchRoute(routePath)
      prefetched.add(routePath)
    }, 150)
  }, [routePath])

  const onMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { onMouseEnter, onMouseLeave }
}
