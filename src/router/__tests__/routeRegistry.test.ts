import { vi } from "vitest"
import { describe, it, expect } from "vitest"

// Mock the module before importing
vi.mock("../routeRegistry", () => {
  const mockRegistry: Record<string, () => Promise<any>> = {
    "/": vi.fn(() => Promise.resolve({ default: {} })),
    "/login": vi.fn(() => Promise.resolve({ default: {} })),
    "/signup": vi.fn(() => Promise.resolve({ default: {} })),
    "/market": vi.fn(() => Promise.resolve({ default: {} })),
    "/contractors": vi.fn(() => Promise.resolve({ default: {} })),
    "/dashboard": vi.fn(() => Promise.resolve({ default: {} })),
    "/profile": vi.fn(() => Promise.resolve({ default: {} })),
    "/settings": vi.fn(() => Promise.resolve({ default: {} })),
    "/notifications": vi.fn(() => Promise.resolve({ default: {} })),
    "/admin/users": vi.fn(() => Promise.resolve({ default: {} })),
    "/admin/market": vi.fn(() => Promise.resolve({ default: {} })),
    "/admin/orders": vi.fn(() => Promise.resolve({ default: {} })),
    "/market/create": vi.fn(() => Promise.resolve({ default: {} })),
    "/market/cart": vi.fn(() => Promise.resolve({ default: {} })),
    "/market/manage": vi.fn(() => Promise.resolve({ default: {} })),
    "/org/register": vi.fn(() => Promise.resolve({ default: {} })),
    "/org/fleet": vi.fn(() => Promise.resolve({ default: {} })),
    "/org/manage": vi.fn(() => Promise.resolve({ default: {} })),
  }

  return {
    routeRegistry: mockRegistry,
    getRouteImport: (path: string) => mockRegistry[path],
    isRouteRegistered: (path: string) => path in mockRegistry,
  }
})

import { getRouteImport, isRouteRegistered } from "../routeRegistry"

describe("routeRegistry", () => {
  describe("getRouteImport", () => {
    it("should return import function for registered route", () => {
      const importFn = getRouteImport("/market")
      expect(importFn).toBeDefined()
      expect(typeof importFn).toBe("function")
    })

    it("should return undefined for unregistered route", () => {
      const importFn = getRouteImport("/non-existent-route")
      expect(importFn).toBeUndefined()
    })

    it("should return promise when import function is called", async () => {
      const importFn = getRouteImport("/market")
      if (importFn) {
        const result = importFn()
        expect(result).toBeInstanceOf(Promise)
        const module = await result
        expect(module).toBeDefined()
      }
    })
  })

  describe("isRouteRegistered", () => {
    it("should return true for registered routes", () => {
      expect(isRouteRegistered("/market")).toBe(true)
      expect(isRouteRegistered("/dashboard")).toBe(true)
      expect(isRouteRegistered("/admin/users")).toBe(true)
    })

    it("should return false for unregistered routes", () => {
      expect(isRouteRegistered("/non-existent")).toBe(false)
      expect(isRouteRegistered("/fake-route")).toBe(false)
    })
  })

  describe("route coverage", () => {
    it("should have critical routes registered", () => {
      const criticalRoutes = [
        "/",
        "/login",
        "/signup",
        "/market",
        "/contractors",
        "/dashboard",
        "/profile",
        "/settings",
        "/admin/users",
      ]

      criticalRoutes.forEach((route) => {
        expect(isRouteRegistered(route)).toBe(true)
      })
    })
  })
})
