import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { prefetchRoutesForPath } from "../../router/routePrefetch"

/**
 * Hook to automatically prefetch routes based on current location
 * Uses the ROUTE_PREFETCH_MAP to determine which routes to prefetch
 */
export function useRoutePrefetch(): void {
  const location = useLocation()

  useEffect(() => {
    // Prefetch routes for the current path
    prefetchRoutesForPath(location.pathname)
  }, [location.pathname])
}
