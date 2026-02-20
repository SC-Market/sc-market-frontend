import { ComponentType, ReactElement } from "react"

/**
 * Route configuration interface for lazy loading and prefetching
 */
export interface RouteConfig {
  /** Route path */
  path: string

  /** Lazy-loaded component */
  component: () => Promise<{ default: ComponentType }>

  /** Whether to preload this route during idle time */
  preload?: boolean

  /** Routes from which this route should be prefetched */
  prefetchOn?: string[]

  /** Optional error element for this route */
  errorElement?: ReactElement

  /** Child routes */
  children?: RouteConfig[]
}

/**
 * Route prefetch configuration
 */
export interface RoutePrefetchConfig {
  /** Current route path */
  currentPath: string

  /** Routes to prefetch from this path */
  prefetchRoutes: string[]
}

/**
 * Map of route paths to their prefetch configurations
 */
export const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  // From landing page, prefetch market and contractors
  "/": ["/market", "/contractors"],

  // From market, prefetch cart and create listing
  "/market": ["/market/cart", "/market/create"],

  // From contractors, prefetch individual contractor view
  "/contractors": ["/contractor/:id"],

  // From login, prefetch dashboard
  "/login": ["/dashboard"],

  // From signup, prefetch dashboard
  "/signup": ["/dashboard"],

  // Contract/Order detail pages - prefetch all tab components
  "/contract/:id": ["/contract/:id/:tab"],
  "/order/:id": ["/order/:id/:tab"],

  // User profile pages - prefetch tab variants
  "/user/:username": ["/user/:username/:tab"],

  // Contractor/Org pages - prefetch tab variants
  "/contractor/:id": ["/contractor/:id/:tab"],

  // My profile - prefetch tab variants
  "/profile": ["/profile/:tab"],

  // Market listings management - prefetch related pages
  "/market/me": ["/market/manage", "/market/manage-stock"],
  "/market/manage": ["/market/manage-stock"],

  // Dashboard - prefetch common next actions
  "/dashboard": ["/orders", "/myfleet", "/market/cart"],

  // Settings and notifications
  "/settings": ["/notifications", "/profile"],
  "/notifications": ["/messages"],

  // Org management - prefetch related org pages
  "/myorg": ["/org/manage", "/org/fleet", "/org/orders"],
  "/org/manage": ["/org/members", "/org/money"],
  "/org/fleet": ["/myfleet"],
  "/org/orders": ["/orders"],

  // Market create - prefetch tab variants
  "/market/create": ["/market/create/:tab"],

  // Admin pages - prefetch related admin pages
  "/admin/users": ["/admin/market", "/admin/orders"],
  "/admin/market": ["/admin/orders", "/admin/moderation"],
  "/admin/orders": ["/admin/market", "/admin/users"],
}
