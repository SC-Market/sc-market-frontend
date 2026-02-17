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

// Mock requestIdleCallback
;(globalThis as any).requestIdleCallback = vi.fn((callback) => {
  callback({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline)
  return 0
}) as any

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

      expect((routeRegistry as any)["/market"]).toHaveBeenCalledTimes(1)
    })

    it("should not prefetch the same route twice", async () => {
      await prefetchRoute("/market")
      await prefetchRoute("/market")

      expect((routeRegistry as any)["/market"]).toHaveBeenCalledTimes(1)
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
      ;(routeRegistry as any)[errorRoute] = vi.fn(() => Promise.reject(mockError))

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

      expect((routeRegistry as any)["/market"]).toHaveBeenCalledTimes(1)
      expect((routeRegistry as any)["/contractors"]).toHaveBeenCalledTimes(1)
      expect((routeRegistry as any)["/dashboard"]).toHaveBeenCalledTimes(1)
    })

    it("should handle mixed valid and invalid routes", async () => {
      await prefetchRoutes(["/market", "/non-existent", "/contractors"])

      expect((routeRegistry as any)["/market"]).toHaveBeenCalledTimes(1)
      expect((routeRegistry as any)["/contractors"]).toHaveBeenCalledTimes(1)
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
      delete (globalThis as any).requestIdleCallback

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
      expect((routeRegistry as any)["/market"]).toHaveBeenCalledTimes(2)
    })
  })
})
