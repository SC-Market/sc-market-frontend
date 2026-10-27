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
