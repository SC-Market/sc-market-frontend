import { routeRegistry, RouteImportFunction } from "./routeRegistry"
import { ROUTE_PREFETCH_MAP } from "../types/routes"

/**
 * Cache to track which routes have been prefetched
 */
const prefetchedRoutes = new Set<string>()

/**
 * Cache to track ongoing prefetch operations
 */
const prefetchingRoutes = new Map<string, Promise<void>>()

/**
 * Prefetch a single route by path
 * @param path - Route path to prefetch
 * @returns Promise that resolves when prefetch completes
 */
export async function prefetchRoute(path: string): Promise<void> {
  // Check if already prefetched
  if (prefetchedRoutes.has(path)) {
    return
  }

  // Check if already prefetching
  if (prefetchingRoutes.has(path)) {
    return prefetchingRoutes.get(path)
  }

  // Get the import function for this route
  const importFn = routeRegistry[path]
  if (!importFn) {
    console.debug(`No import function found for route: ${path}`)
    return
  }

  // Start prefetching
  const prefetchPromise = (async () => {
    try {
      await importFn()
      prefetchedRoutes.add(path)
      console.debug(`Prefetched route: ${path}`)
    } catch (error) {
      console.warn(`Failed to prefetch route ${path}:`, error)
    } finally {
      prefetchingRoutes.delete(path)
    }
  })()

  prefetchingRoutes.set(path, prefetchPromise)
  return prefetchPromise
}

/**
 * Prefetch multiple routes
 * @param paths - Array of route paths to prefetch
 */
export async function prefetchRoutes(paths: string[]): Promise<void> {
  const prefetchPromises = paths.map((path) => prefetchRoute(path))
  await Promise.allSettled(prefetchPromises)
}

/**
 * Prefetch routes based on current route
 * Uses ROUTE_PREFETCH_MAP to determine which routes to prefetch
 * @param currentPath - Current route path
 */
export function prefetchRoutesForPath(currentPath: string): void {
  const routesToPrefetch = ROUTE_PREFETCH_MAP[currentPath]
  
  if (!routesToPrefetch || routesToPrefetch.length === 0) {
    return
  }

  // Use requestIdleCallback for non-blocking prefetch
  if ("requestIdleCallback" in window) {
    requestIdleCallback(
      () => {
        prefetchRoutes(routesToPrefetch)
      },
      { timeout: 2000 }, // Fallback to setTimeout after 2s
    )
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      prefetchRoutes(routesToPrefetch)
    }, 100)
  }
}

/**
 * Prefetch a route on user interaction (hover, focus)
 * @param path - Route path to prefetch
 * @param element - DOM element to attach listener to
 * @param event - Event type (default: 'mouseenter')
 * @returns Cleanup function to remove listener
 */
export function prefetchRouteOnInteraction(
  path: string,
  element: HTMLElement,
  event: string = "mouseenter",
): () => void {
  const handleInteraction = () => {
    prefetchRoute(path)
    element.removeEventListener(event, handleInteraction)
  }

  element.addEventListener(event, handleInteraction, { once: true })

  return () => element.removeEventListener(event, handleInteraction)
}

/**
 * Check if network conditions are suitable for prefetching
 */
function shouldPrefetch(): boolean {
  // Check if user has data saver enabled
  if ("connection" in navigator) {
    const connection = (navigator as any).connection
    if (connection?.saveData) {
      return false
    }

    // Don't prefetch on slow connections
    if (
      connection?.effectiveType &&
      ["slow-2g", "2g"].includes(connection.effectiveType)
    ) {
      return false
    }
  }

  return true
}

/**
 * Prefetch high-priority routes during idle time
 * These are routes that are commonly accessed
 */
export function prefetchHighPriorityRoutes(): void {
  if (!shouldPrefetch()) {
    console.debug("Skipping route prefetch due to network conditions")
    return
  }

  // High-priority routes to prefetch
  const highPriorityRoutes = [
    "/market",
    "/contractors",
    "/dashboard",
  ]

  // Use requestIdleCallback for non-blocking prefetch
  if ("requestIdleCallback" in window) {
    requestIdleCallback(
      () => {
        prefetchRoutes(highPriorityRoutes)
      },
      { timeout: 3000 },
    )
  } else {
    setTimeout(() => {
      prefetchRoutes(highPriorityRoutes)
    }, 2000)
  }
}

/**
 * Clear prefetch cache (useful for testing)
 */
export function clearPrefetchCache(): void {
  prefetchedRoutes.clear()
  prefetchingRoutes.clear()
}
