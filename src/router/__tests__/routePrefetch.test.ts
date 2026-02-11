import { describe, it, expect, beforeEach } from "@jest/globals"

// Mock the route registry to avoid importing actual modules
jest.mock("../routeRegistry", () => {
  const mockRegistry: Record<string, jest.Mock> = {
    "/market": jest.fn(() => Promise.resolve({ default: {} })),
    "/contractors": jest.fn(() => Promise.resolve({ default: {} })),
    "/dashboard": jest.fn(() => Promise.resolve({ default: {} })),
    "/market/cart": jest.fn(() => Promise.resolve({ default: {} })),
    "/market/create": jest.fn(() => Promise.resolve({ default: {} })),
  }

  return {
    routeRegistry: mockRegistry,
  }
})

// Mock requestIdleCallback
global.requestIdleCallback = jest.fn((callback) => {
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

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';

describe("routePrefetch", () => {
  beforeEach(() => {
    clearPrefetchCache()
    jest.clearAllMocks()
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
      const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {})

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
      ;(routeRegistry as any)[errorRoute] = jest.fn(() => Promise.reject(mockError))

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {})

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
      expect(global.requestIdleCallback).toHaveBeenCalled()
    })

    it("should not prefetch if no routes configured for path", () => {
      prefetchRoutesForPath("/unknown-path")

      // Should not trigger requestIdleCallback for unknown paths
      // (it returns early before calling requestIdleCallback)
    })

    it("should use setTimeout fallback when requestIdleCallback unavailable", () => {
      const originalRequestIdleCallback = global.requestIdleCallback
      delete (global as any).requestIdleCallback

      const setTimeoutSpy = jest.spyOn(global, "setTimeout")

      prefetchRoutesForPath("/")

      expect(setTimeoutSpy).toHaveBeenCalled()

      // Restore
      global.requestIdleCallback = originalRequestIdleCallback
      setTimeoutSpy.mockRestore()
    })
  })

  describe("prefetchHighPriorityRoutes", () => {
    it("should prefetch high-priority routes", () => {
      prefetchHighPriorityRoutes()

      expect(global.requestIdleCallback).toHaveBeenCalled()
    })

    it("should skip prefetch on slow connections", () => {
      // Mock slow connection
      Object.defineProperty(navigator, "connection", {
        value: {
          effectiveType: "2g",
        },
        configurable: true,
      })

      const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {})

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

      const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {})

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
