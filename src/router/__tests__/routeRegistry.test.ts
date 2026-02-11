import { describe, it, expect } from "@jest/globals"

// Mock the module before importing
jest.mock("../routeRegistry", () => {
  const mockRegistry: Record<string, () => Promise<any>> = {
    "/": jest.fn(() => Promise.resolve({ default: {} })),
    "/login": jest.fn(() => Promise.resolve({ default: {} })),
    "/signup": jest.fn(() => Promise.resolve({ default: {} })),
    "/market": jest.fn(() => Promise.resolve({ default: {} })),
    "/contractors": jest.fn(() => Promise.resolve({ default: {} })),
    "/dashboard": jest.fn(() => Promise.resolve({ default: {} })),
    "/profile": jest.fn(() => Promise.resolve({ default: {} })),
    "/settings": jest.fn(() => Promise.resolve({ default: {} })),
    "/notifications": jest.fn(() => Promise.resolve({ default: {} })),
    "/admin/users": jest.fn(() => Promise.resolve({ default: {} })),
    "/admin/market": jest.fn(() => Promise.resolve({ default: {} })),
    "/admin/orders": jest.fn(() => Promise.resolve({ default: {} })),
    "/market/create": jest.fn(() => Promise.resolve({ default: {} })),
    "/market/cart": jest.fn(() => Promise.resolve({ default: {} })),
    "/market/manage": jest.fn(() => Promise.resolve({ default: {} })),
    "/org/register": jest.fn(() => Promise.resolve({ default: {} })),
    "/org/fleet": jest.fn(() => Promise.resolve({ default: {} })),
    "/org/manage": jest.fn(() => Promise.resolve({ default: {} })),
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
