import { vi } from "vitest"
import { describe, it, expect, beforeEach, afterEach } from "vitest"

// Mock the route registry to avoid importing actual modules
vi.mock("../routeRegistry", () => {
  const mockRegistry: Record<string, ReturnType<typeof vi.fn>> = {
    "/market": vi.fn(() => Promise.resolve({ default: {} })),
    "/contractors": vi.fn(() => Promise.resolve({ default: {} })),
    "/dashboard": vi.fn(() => Promise.resolve({ default: {} })),
    "/market/cart": vi.fn(() => Promise.resolve({ default: {} })),
    "/market/create": vi.fn(() => Promise.resolve({ default: {} })),
  }

  return {
    routeRegistry: mockRegistry,
  }
})

// Mock requestIdleCallback — runs the callback synchronously.
globalThis.requestIdleCallback = vi.fn((callback: IdleRequestCallback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 })
  return 0
})

import {
  prefetchRoute,
  prefetchRoutes,
  prefetchRoutesForPath,
  prefetchRouteForUrl,
  clearPrefetchCache,
} from "../routePrefetch"
import { routeRegistry } from "../routeRegistry"
import { GRACE_MS, resetIdlePrefetchQueue } from "../idlePrefetchQueue"

describe("routePrefetch", () => {
  beforeEach(() => {
    clearPrefetchCache()
    vi.clearAllMocks()
  })

  describe("prefetchRoute", () => {
    it("should prefetch a route successfully", async () => {
      await prefetchRoute("/market")

      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalledTimes(1)
    })

    it("should not prefetch the same route twice", async () => {
      await prefetchRoute("/market")
      await prefetchRoute("/market")

      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalledTimes(1)
    })

    it("should handle non-existent routes gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})

      await prefetchRoute("/non-existent")

      expect(consoleSpy).toHaveBeenCalledWith(
        "No import function found for route: /non-existent",
      )

      consoleSpy.mockRestore()
    })

    it("should handle prefetch errors gracefully", async () => {
      const errorRoute = "/error-route"
      const mockError = new Error("Import failed")

      // Add a failing route to the registry
      routeRegistry[errorRoute] = vi.fn(() => Promise.reject(mockError))

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      await prefetchRoute(errorRoute)

      expect(consoleSpy).toHaveBeenCalledWith(
        `Failed to prefetch route ${errorRoute}:`,
        mockError,
      )

      consoleSpy.mockRestore()
    })
  })

  describe("prefetchRoutes", () => {
    it("should prefetch multiple routes", async () => {
      await prefetchRoutes(["/market", "/contractors", "/dashboard"])

      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalledTimes(1)
      expect(vi.mocked(routeRegistry["/contractors"])).toHaveBeenCalledTimes(1)
      expect(vi.mocked(routeRegistry["/dashboard"])).toHaveBeenCalledTimes(1)
    })

    it("should handle mixed valid and invalid routes", async () => {
      await prefetchRoutes(["/market", "/non-existent", "/contractors"])

      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalledTimes(1)
      expect(vi.mocked(routeRegistry["/contractors"])).toHaveBeenCalledTimes(1)
    })
  })

  describe("prefetchRoutesForPath", () => {
    beforeEach(() => {
      resetIdlePrefetchQueue()
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it("queues the page's likely-next routes and loads them after the grace period", async () => {
      prefetchRoutesForPath("/")
      expect(vi.mocked(routeRegistry["/market"])).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(GRACE_MS + 100)
      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalledTimes(1)
      expect(vi.mocked(routeRegistry["/contractors"])).toHaveBeenCalledTimes(1)
    })

    it("does nothing for a path with no prefetch map entry", async () => {
      prefetchRoutesForPath("/unknown-path")
      await vi.advanceTimersByTimeAsync(GRACE_MS + 100)
      expect(vi.mocked(routeRegistry["/market"])).not.toHaveBeenCalled()
    })
  })

  describe("prefetchRouteForUrl", () => {
    it("warms the route chunk for a concrete link target, ignoring the query", async () => {
      prefetchRouteForUrl("/market/cart?ref=nav")
      await Promise.resolve()
      expect(vi.mocked(routeRegistry["/market/cart"])).toHaveBeenCalledTimes(1)
    })

    it("is a silent no-op for unknown targets", () => {
      const debug = vi.spyOn(console, "debug").mockImplementation(() => {})
      prefetchRouteForUrl("/no-such-page")
      expect(debug).not.toHaveBeenCalled()
      debug.mockRestore()
    })
  })

  describe("clearPrefetchCache", () => {
    it("should clear the prefetch cache", async () => {
      await prefetchRoute("/market")
      clearPrefetchCache()
      await prefetchRoute("/market")

      // Should be called twice since cache was cleared
      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalledTimes(2)
    })
  })
})
