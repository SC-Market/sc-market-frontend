import { vi } from "vitest"
import { describe, it, expect, beforeEach } from "vitest"

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
  clearPrefetchCache,
  prefetchHighPriorityRoutes,
} from "../routePrefetch"
import { routeRegistry } from "../routeRegistry"

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
    it("should prefetch routes based on current path", () => {
      prefetchRoutesForPath("/")

      // Should trigger requestIdleCallback
      expect(globalThis.requestIdleCallback).toHaveBeenCalled()
    })

    it("should not prefetch if no routes configured for path", () => {
      prefetchRoutesForPath("/unknown-path")

      // Should not trigger requestIdleCallback for unknown paths
      // (it returns early before calling requestIdleCallback)
    })

    it("should use setTimeout fallback when requestIdleCallback unavailable", () => {
      const originalRequestIdleCallback = globalThis.requestIdleCallback
      Reflect.deleteProperty(globalThis, "requestIdleCallback")

      const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")

      prefetchRoutesForPath("/")

      expect(setTimeoutSpy).toHaveBeenCalled()

      // Restore
      globalThis.requestIdleCallback = originalRequestIdleCallback
      setTimeoutSpy.mockRestore()
    })
  })

  describe("prefetchHighPriorityRoutes", () => {
    it("should prefetch high-priority routes", () => {
      prefetchHighPriorityRoutes()

      expect(globalThis.requestIdleCallback).toHaveBeenCalled()
    })

    it("warms /dashboard only for a returning signed-in visitor", async () => {
      localStorage.removeItem("cached_user_profile")
      prefetchHighPriorityRoutes()
      await new Promise((r) => setTimeout(r, 0))
      expect(vi.mocked(routeRegistry["/market"])).toHaveBeenCalled()
      expect(vi.mocked(routeRegistry["/dashboard"])).not.toHaveBeenCalled()

      localStorage.setItem(
        "cached_user_profile",
        JSON.stringify({ username: "someone" }),
      )
      prefetchHighPriorityRoutes()
      await new Promise((r) => setTimeout(r, 0))
      expect(vi.mocked(routeRegistry["/dashboard"])).toHaveBeenCalledTimes(1)
      localStorage.removeItem("cached_user_profile")
    })

    it("should skip prefetch on slow connections", () => {
      // Mock slow connection
      Object.defineProperty(navigator, "connection", {
        value: {
          effectiveType: "2g",
        },
        configurable: true,
      })

      const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})

      prefetchHighPriorityRoutes()

      expect(consoleSpy).toHaveBeenCalledWith(
        "Skipping route prefetch due to network conditions",
      )

      consoleSpy.mockRestore()
    })

    it("should skip prefetch when data saver is enabled", () => {
      // Mock data saver
      Object.defineProperty(navigator, "connection", {
        value: {
          saveData: true,
        },
        configurable: true,
      })

      const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})

      prefetchHighPriorityRoutes()

      expect(consoleSpy).toHaveBeenCalledWith(
        "Skipping route prefetch due to network conditions",
      )

      consoleSpy.mockRestore()
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
