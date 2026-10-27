import { routeRegistry, RouteImportFunction } from "./routeRegistry"
import { ROUTE_PREFETCH_MAP } from "../types/routes"
import { enqueueIdlePrefetch } from "./idlePrefetchQueue"

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
      // A failed prefetch (e.g. stale chunk after a deploy) is swallowed here:
      // the user never navigated, so it must not reload or show an error. A
      // navigation to the same route goes through retryDynamicImport instead.
      console.warn(`Failed to prefetch route ${path}:`, error)
    } finally {
      prefetchingRoutes.delete(path)
    }
  })()

  prefetchingRoutes.set(path, prefetchPromise)
  return prefetchPromise
}

const patternCache = new Map<string, RegExp>()
function patternRegex(pattern: string): RegExp {
  let re = patternCache.get(pattern)
  if (!re) {
    re = new RegExp(
      "^" +
        pattern
          .split("/")
          .map((seg) =>
            seg.startsWith(":")
              ? "[^/]+"
              : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          )
          .join("/") +
        "/?$",
    )
    patternCache.set(pattern, re)
  }
  return re
}

/**
 * Intent prefetch for a concrete link target ("/market?type=x",
 * "/contractor/foo"): finds its routeRegistry entry (exact, else the first
 * matching ":param" pattern) and warms that chunk. Unknown targets are a
 * silent no-op. For hover / focus / touchstart on links.
 */
export function prefetchRouteForUrl(url: string): void {
  const path = url.split(/[?#]/)[0] || "/"
  const key =
    path in routeRegistry
      ? path
      : Object.keys(routeRegistry).find(
          (pattern) =>
            pattern.includes(":") && patternRegex(pattern).test(path),
        )
  if (key) void prefetchRoute(key)
}

const HOVER_INTENT_MS = 100

function internalHref(target: EventTarget | null): string | null {
  const el = target instanceof Element ? target.closest("a[href]") : null
  if (!el) return null
  const href = el.getAttribute("href") || ""
  // Same-origin app paths only ("/market", not "//cdn", "https://", "#x")
  if (!href.startsWith("/") || href.startsWith("//")) return null
  if (el.getAttribute("target") === "_blank" || el.hasAttribute("download"))
    return null
  return href
}

let linkIntentInstalled = false

/**
 * One document-level listener that warms a link's route chunk on intent:
 * pointerdown / touchstart (the press lands ~100 ms before the click), focus,
 * and on desktop a hover that lasts HOVER_INTENT_MS. Covers every internal
 * <a href="/..."> (nav, cards, landing links) without per-component handlers,
 * and replaces the blanket idle prefetch of "high-priority" routes.
 */
export function installLinkIntentPrefetch(doc: Document = document): void {
  if (linkIntentInstalled) return
  linkIntentInstalled = true
  const now = (e: Event) => {
    const href = internalHref(e.target)
    if (href) prefetchRouteForUrl(href)
  }
  let hoverTimer: ReturnType<typeof setTimeout> | undefined
  let hovered: string | null = null
  const over = (e: Event) => {
    const href = internalHref(e.target)
    if (href === hovered) return
    hovered = href
    clearTimeout(hoverTimer)
    if (href)
      hoverTimer = setTimeout(() => prefetchRouteForUrl(href), HOVER_INTENT_MS)
  }
  const opts = { capture: true, passive: true } as const
  doc.addEventListener("pointerdown", now, opts)
  doc.addEventListener("touchstart", now, opts)
  doc.addEventListener("focusin", now, opts)
  doc.addEventListener("mouseover", over, opts)
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

  // One at a time, in idle slices, after the page has settled
  // (see idlePrefetchQueue.ts)
  for (const path of routesToPrefetch) {
    enqueueIdlePrefetch(`route:${path}`, () => prefetchRoute(path))
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
 * Clear prefetch cache (useful for testing)
 */
export function clearPrefetchCache(): void {
  prefetchedRoutes.clear()
  prefetchingRoutes.clear()
}
