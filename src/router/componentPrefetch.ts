/**
 * Component-level prefetch registry for lazy-loaded components within pages
 * This enables prefetching of tab components and other lazy-loaded sections
 */

export type ComponentImportFunction = () => Promise<any>

/**
 * Registry of component imports by identifier
 */
export const componentRegistry: Record<string, ComponentImportFunction> = {
  // ViewOrder tab components
  "order:details": () => import("../views/orders/OrderDetailsArea"),
  "order:messages": () => import("../views/orders/OrderDetailsArea"),
  "order:review": () => import("../views/orders/OrderReviewArea"),
  "order:reviewView": () => import("../views/orders/OrderReviewView"),
  "order:marketListings": () => import("../views/offers/OfferMarketListings"),
  "order:service": () => import("../views/offers/OfferServiceArea"),
  "order:allocation": () => import("../features/market/components/allocation"),
  "order:availability": () => import("../views/orders/OrderAvailabilityArea"),

  // ViewOfferPage tab components (internal tabs, not route-based)
  "offer:details": () => import("../views/offers/OfferDetailsArea"),
  "offer:messages": () => import("../views/offers/OfferDetailsArea"),
  "offer:marketListings": () => import("../views/offers/OfferMarketListings"),
  "offer:service": () => import("../views/offers/OfferServiceArea"),
  "offer:availability": () => import("../views/orders/OrderAvailabilityArea"),

  // ViewPublicContract tab components
  "contract:details": () => import("../views/contracts/ContractDetailsArea"),
  "contract:offer": () => import("../views/contracts/ContractOfferForm"),

  // ViewOrg tab components
  "org:info": () => import("../views/contractor/OrgInfo"),
  "org:members": () => import("../views/contractor/OrgMembers"),
  "org:reviews": () => import("../views/contractor/OrgReviews"),

  // OrgManage tab components
  "orgManage:settings": () => import("../views/contractor/OrgSettings"),
  "orgManage:roles": () => import("../views/contractor/OrgRoles"),
  "orgManage:invites": () => import("../views/contractor/OrgInvite"),
  "orgManage:auditLogs": () => import("../views/contractor/OrgAuditLogs"),

  // SettingsPage components
  "settings:privacy": () => import("../views/settings/PrivacySettings"),
  "settings:profile": () => import("../views/settings/ProfileSettings"),
  "settings:discord": () =>
    import("../views/settings/DiscordIntegrationSettings"),
  "settings:market": () => import("../views/settings/MarketSettings"),
  "settings:contractors": () => import("../views/settings/ContractorsSettings"),
  "settings:blocklist": () => import("../views/settings/BlocklistSettings"),

  // MarketCreate tab components - all from MarketListingForm
  "marketCreate:listing": () =>
    import("../features/market/components/MarketListingForm"),

  // MyMarketListings tab components
  "myListings:views": () => import("../features/market/views/ItemListings"),

  // Fleet tab components
  "fleet:ships": () => import("../views/fleet/Ships"),
  "fleet:deliveries": () => import("../views/fleet/ActiveDeliveries"),

  // AdminOrderStats tab components
  "adminOrders:analytics": () => import("../views/orders/OrderAnalytics"),
  "adminOrders:recent": () => import("../views/orders/RecentOrders"),

  // MarketPage tab components
  "market:items": () => import("../features/market/components/ItemMarketView"),
  "market:services": () => import("../views/services/ServiceMarketView"),
  "market:serviceActions": () => import("../views/services/ServiceActions"),
  "market:contractActions": () => import("../views/contracts/ContractActions"),
  "market:contractListings": () =>
    import("../views/contracts/ContractListings"),

  // Contracts page tab components
  "contracts:items": () =>
    import("../features/market/components/ItemMarketView"),
  "contracts:services": () => import("../views/services/ServiceMarketView"),
  "contracts:marketActions": () =>
    import("../features/market/components/MarketActions"),
  "contracts:serviceActions": () => import("../views/services/ServiceActions"),
  "contracts:contractActions": () =>
    import("../views/contracts/ContractActions"),
}

/**
 * Map of route patterns to their component prefetch groups
 */
export const COMPONENT_PREFETCH_MAP: Record<string, string[]> = {
  "/contract/:id": [
    "order:details",
    "order:messages",
    "order:review",
    "order:reviewView",
    "order:marketListings",
    "order:service",
    "order:allocation",
    "order:availability",
  ],
  "/order/:id": [
    "order:details",
    "order:messages",
    "order:review",
    "order:reviewView",
    "order:marketListings",
    "order:service",
    "order:allocation",
    "order:availability",
  ],
  "/offer/:id": [
    "offer:details",
    "offer:messages",
    "offer:marketListings",
    "offer:service",
    "offer:availability",
  ],
  "/contracts/public/:contract_id": ["contract:details", "contract:offer"],
  "/contractor/:id": ["org:info", "org:members", "org:reviews"],
  "/myorg": ["org:info", "org:members", "org:reviews"],
  "/org/manage": [
    "orgManage:settings",
    "orgManage:roles",
    "orgManage:invites",
    "orgManage:auditLogs",
  ],
  "/settings": [
    "settings:privacy",
    "settings:profile",
    "settings:discord",
    "settings:market",
    "settings:contractors",
    "settings:blocklist",
  ],
  "/market/create": ["marketCreate:listing"],
  "/market/me": ["myListings:views"],
  "/org/fleet": ["fleet:ships", "fleet:deliveries"],
  "/myfleet": ["fleet:ships", "fleet:deliveries"],
  "/admin/orders": ["adminOrders:analytics", "adminOrders:recent"],
  "/market": [
    "market:items",
    "market:services",
    "market:serviceActions",
    "market:contractActions",
    "market:contractListings",
  ],
  "/contracts": [
    "contracts:items",
    "contracts:services",
    "contracts:marketActions",
    "contracts:serviceActions",
    "contracts:contractActions",
  ],
}

/**
 * Cache to track which components have been prefetched
 */
const prefetchedComponents = new Set<string>()

/**
 * Cache to track ongoing component prefetch operations
 */
const prefetchingComponents = new Map<string, Promise<void>>()

/**
 * Prefetch a single component by identifier
 */
export async function prefetchComponent(id: string): Promise<void> {
  if (prefetchedComponents.has(id)) {
    return
  }

  if (prefetchingComponents.has(id)) {
    return prefetchingComponents.get(id)
  }

  const importFn = componentRegistry[id]
  if (!importFn) {
    return
  }

  const prefetchPromise = (async () => {
    try {
      await importFn()
      prefetchedComponents.add(id)
    } catch (error) {
      console.warn(`Failed to prefetch component ${id}:`, error)
    } finally {
      prefetchingComponents.delete(id)
    }
  })()

  prefetchingComponents.set(id, prefetchPromise)
  return prefetchPromise
}

/**
 * Prefetch multiple components
 */
export async function prefetchComponents(ids: string[]): Promise<void> {
  await Promise.allSettled(ids.map(prefetchComponent))
}

/**
 * Prefetch components for a route path
 */
export function prefetchComponentsForPath(path: string): void {
  // Match path pattern (handle dynamic segments)
  const matchedPattern = Object.keys(COMPONENT_PREFETCH_MAP).find((pattern) => {
    const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$")
    return regex.test(path)
  })

  if (!matchedPattern) {
    return
  }

  const componentIds = COMPONENT_PREFETCH_MAP[matchedPattern]
  if (!componentIds || componentIds.length === 0) {
    return
  }

  // Use requestIdleCallback for non-blocking prefetch
  if ("requestIdleCallback" in window) {
    requestIdleCallback(
      () => {
        prefetchComponents(componentIds)
      },
      { timeout: 1000 },
    )
  } else {
    setTimeout(() => {
      prefetchComponents(componentIds)
    }, 50)
  }
}

/**
 * Clear component prefetch cache
 */
export function clearComponentPrefetchCache(): void {
  prefetchedComponents.clear()
  prefetchingComponents.clear()
}
