// Prefetching utilities for proactive chunk loading

// Cache to track which modules have been prefetched
const prefetchedModules = new Set<string>()

// Generic prefetch function
export async function prefetchModule(
  importFn: () => Promise<any>,
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
      () => import("../features/market/components/ItemMarketView"),
      "ItemMarketView",
    ),
    prefetchModule(
      () => import("../views/services/ServiceMarketView"),
      "ServiceMarketView",
    ),
    prefetchModule(
      () => import("../views/services/ServiceActions"),
      "ServiceActions",
    ),
    prefetchModule(
      () => import("../features/market/views/ItemListings"),
      "ItemListings",
    ),
  ]

  await Promise.allSettled(prefetchPromises)
}

// Prefetch common heavy components
export async function prefetchCommonComponents(): Promise<void> {
  const prefetchPromises = [
    prefetchModule(
      () => import("../features/market/views/MarketAggregateView"),
      "MarketAggregateView",
    ),
    prefetchModule(
      () => import("../features/market/views/MarketListingView"),
      "MarketListingView",
    ),
    prefetchModule(
      () => import("../views/contracts/ServiceListings"),
      "ServiceListings",
    ),
    prefetchModule(() => import("../views/people/AllUsers"), "AllUsers"),
    prefetchModule(() => import("../views/orders/OrderTrend"), "OrderTrend"),
  ]

  await Promise.allSettled(prefetchPromises)
}

// Prefetch chart libraries (heavy dependencies)
export async function prefetchChartLibraries(): Promise<void> {
  const prefetchPromises = [
    prefetchModule(() => import("@mui/x-charts"), "@mui/x-charts"),
    prefetchModule(() => import("klinecharts"), "klinecharts"),
  ]

  await Promise.allSettled(prefetchPromises)
}

// Prefetch locale files
export async function prefetchLocales(): Promise<void> {
  const prefetchPromises = [
    prefetchModule(() => import("../locales/uk/ukrainian.json"), "ukrainian"),
    prefetchModule(() => import("../locales/zh/zh_Hans.json"), "zh_Hans"),
  ]

  await Promise.allSettled(prefetchPromises)
}

// Check if we should prefetch based on network conditions
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
    await prefetchChartLibraries()
    await prefetchLocales()

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
