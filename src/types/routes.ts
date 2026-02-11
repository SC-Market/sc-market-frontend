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
}
