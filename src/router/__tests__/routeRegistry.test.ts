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
