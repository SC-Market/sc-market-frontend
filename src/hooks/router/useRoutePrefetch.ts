import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { prefetchRoutesForPath } from "../../router/routePrefetch"
import { prefetchComponentsForPath } from "../../router/componentPrefetch"

/**
 * Hook to automatically prefetch routes and components based on current location
 * Uses the ROUTE_PREFETCH_MAP and COMPONENT_PREFETCH_MAP to determine what to prefetch
 */
export function useRoutePrefetch(): void {
  const location = useLocation()

  useEffect(() => {
    // Prefetch routes for the current path
    prefetchRoutesForPath(location.pathname)

    // Prefetch components (tabs, lazy sections) for the current path
    prefetchComponentsForPath(location.pathname)
  }, [location.pathname])
}
