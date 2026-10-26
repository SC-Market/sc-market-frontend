// Prefetching utilities for proactive chunk loading

// Cache to track which modules have been prefetched
const prefetchedModules = new Set<string>()

// Generic prefetch function
export async function prefetchModule(
  importFn: () => Promise<unknown>,
  moduleKey: string,
): Promise<void> {
  if (prefetchedModules.has(moduleKey)) {
    return // Already prefetched
  }

  try {
    await importFn()
    prefetchedModules.add(moduleKey)
    console.debug(`Prefetched module: ${moduleKey}`)
  } catch (error) {
    console.warn(`Failed to prefetch module ${moduleKey}:`, error)
  }
}

// Prefetch market-related components
export async function prefetchMarketComponents(): Promise<void> {
  const prefetchPromises = [
    prefetchModule(
      () => import("../views/services/ServiceMarketView"),
      "ServiceMarketView",
    ),
    prefetchModule(
      () => import("../views/services/ServiceActions"),
      "ServiceActions",
    ),
  ]

  await Promise.allSettled(prefetchPromises)
}

// Prefetch common heavy components
export async function prefetchCommonComponents(): Promise<void> {
  const prefetchPromises = [
    prefetchModule(
      () => import("../views/contracts/ServiceListings"),
      "ServiceListings",
    ),
  ]

  await Promise.allSettled(prefetchPromises)
}

// Not prefetched in the background: the chart libraries (@mui/x-charts,
// klinecharts), chart views (AllUsers, OrderTrend) and locale JSON. A dynamic
// import() also EXECUTES the chunk, so warming ~1 MB of chart code and JSON
// 2 s after every page load cost every visitor main-thread time (and input
// delay) for pages most never open. Charts load on demand behind Suspense;
// locales are warmed by util/i18n.ts.

// Check if we should prefetch based on network conditions
function shouldPrefetch(): boolean {
  // Check if user has data saver enabled
  if ("connection" in navigator) {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection
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

// Main prefetch orchestrator
export async function startBackgroundPrefetch(): Promise<void> {
  if (!shouldPrefetch()) {
    console.debug("Skipping background prefetch due to network conditions")
    return
  }

  // Start prefetching after a short delay to not interfere with initial page load
  setTimeout(async () => {
    console.debug("Starting background prefetch...")

    // Prefetch in priority order
    await prefetchMarketComponents()
    await prefetchCommonComponents()

    console.debug("Background prefetch completed")
  }, 2000) // 2 second delay
}

// Prefetch on user interaction (hover, focus, etc.)
export function prefetchOnInteraction(
  element: HTMLElement,
  prefetchFn: () => Promise<void>,
  event: string = "mouseenter",
): () => void {
  const handleInteraction = () => {
    prefetchFn()
    element.removeEventListener(event, handleInteraction)
  }

  element.addEventListener(event, handleInteraction, { once: true })

  return () => element.removeEventListener(event, handleInteraction)
}
