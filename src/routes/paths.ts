/**
 * Centralized URL path constants — single source of truth for all frontend routes.
 *
 * All navigation (Link `to=`, `navigate()`, `href=`) MUST use these helpers
 * instead of hardcoding path strings, so routes can be changed in one place.
 *
 * Grouped by domain. Static routes are plain strings; parameterized routes are
 * functions taking typed params.
 */

import { formatShortSlug } from "../features/market/domain/urls"

/** Top-level / static routes that take no parameters. */
export const PATHS = {
  home: "/",
  login: "/login",
  signup: "/signup",
  onboarding: "/onboarding",
  profile: "/profile",
  settings: "/settings",
  notifications: "/notifications",
  dashboard: "/dashboard",
  dashboardShops: "/dashboard/shops",
  inventory: "/inventory",
  availability: "/availability",
  messages: "/messages",
  myOrders: "/orders",
  ordersAssigned: "/orders/assigned",
  contracts: "/contracts",
  contractsCreate: "/contracts/create",
  contractors: "/contractors",
  recruiting: "/recruiting",
  myOrgs: "/my-orgs",
  orgRegister: "/org/register",
  myFleet: "/myfleet",
  myFleetImport: "/myfleet/import",
  shoppingLists: "/shopping-lists",
} as const

export const AUTH_PATHS = {
  // login/signup live in PATHS (canonical) — use PATHS.login / PATHS.signup
  accountLink: "/accountlink",
  emailVerify: "/email/verify",
  emailVerifyToken: (token: string) => `/email/verify/${token}`,
  emailUnsubscribe: "/email/unsubscribe",
  emailUnsubscribeToken: (token: string) => `/email/unsubscribe/${token}`,
} as const

export const SHOP_PATHS = {
  root: (slug: string) => `/shop/${slug}`,
  listings: (slug: string) => `/shop/${slug}/listings`,
  create: (slug: string) => `/shop/${slug}/listings/create`,
  stock: (slug: string) => `/shop/${slug}/stock`,
  orders: (slug: string) => `/shop/${slug}/orders`,
  services: (slug: string) => `/shop/${slug}/services`,
  settings: (slug: string) => `/shop/${slug}/settings`,
  analytics: (slug: string) => `/shop/${slug}/analytics`,
  customers: (slug: string) => `/shop/${slug}/customers`,
  /** Public shop profile */
  profile: (slug: string) => `/shops/${slug}`,
  profileTab: (slug: string, tab: string) => `/shops/${slug}/${tab}`,
  createShop: "/shops/create",
} as const

export const ORG_PATHS = {
  root: (spectrumId: string) => `/org/${spectrumId}`,
  manage: (spectrumId: string) => `/org/${spectrumId}/manage`,
  manageAbout: (spectrumId: string) => `/org/${spectrumId}/manage/about`,
  manageRoles: (spectrumId: string) => `/org/${spectrumId}/manage/roles`,
  manageInvites: (spectrumId: string) => `/org/${spectrumId}/manage/invites`,
  manageDiscord: (spectrumId: string) => `/org/${spectrumId}/manage/discord`,
  manageMarket: (spectrumId: string) => `/org/${spectrumId}/manage/market`,
  manageSettings: (spectrumId: string) => `/org/${spectrumId}/manage/settings`,
  manageBlocklist: (spectrumId: string) => `/org/${spectrumId}/manage/blocklist`,
  manageAudit: (spectrumId: string) => `/org/${spectrumId}/manage/audit`,
  manageCustomers: (spectrumId: string) => `/org/${spectrumId}/manage/customers`,
  manageTheme: (spectrumId: string) => `/org/${spectrumId}/manage/theme`,
  members: (spectrumId: string) => `/org/${spectrumId}/members`,
  orders: (spectrumId: string) => `/org/${spectrumId}/orders`,
  money: (spectrumId: string) => `/org/${spectrumId}/money`,
  fleet: (spectrumId: string) => `/org/${spectrumId}/fleet`,
  send: (spectrumId: string) => `/org/${spectrumId}/send`,
  dashboard: (spectrumId: string) => `/org/${spectrumId}/dashboard`,
  // register lives in PATHS.orgRegister (canonical)
  /** Public org profile */
  profile: (spectrumId: string) => `/contractor/${spectrumId}`,
  profileTab: (spectrumId: string, tab: string) => `/contractor/${spectrumId}/${tab}`,
} as const

export const USER_PATHS = {
  profile: (username: string) => `/user/${username}`,
  profileTab: (username: string, tab: string) => `/user/${username}/${tab}`,
} as const

export const MARKET_PATHS = {
  search: "/market",
  services: "/market/services",
  bulk: "/bulk",
  buyOrders: "/buyorders",
  buyOrderCreate: "/buyorder/create",
  buyOrder: (id: string) => `/buyorder/${id}`,
  cart: "/market/cart",
  create: "/market/create",
  createTab: (tab: string) => `/market/create/${tab}`,
  edit: (id: string) => `/market_edit/${id}`,
  myListings: "/market/me",
  manage: "/market/manage",
  manageStock: "/market/manage-stock",
  stock: (listingId: string) => `/market/stock/${listingId}`,
  category: (name: string) => `/market/category/${name}`,
  multiple: (id: string) => `/market/multiple/${id}`,
  multipleEdit: (id: string) => `/market/multiple/${id}/edit`,
  listing: (id: string, title?: string) =>
    title ? `/market/${formatShortSlug(id, title)}` : `/market/${id}`,
  aggregate: (gameItemId: string, name?: string) =>
    name ? `/market/aggregate/${formatShortSlug(gameItemId, name)}` : `/market/aggregate/${gameItemId}`,
  shops: "/shops",
  // per-shop profile lives in SHOP_PATHS.profile (canonical)
} as const

export const ORDER_PATHS = {
  detail: (id: string) => `/order/${id}`,
  detailTab: (id: string, tab: string) => `/order/${id}/${tab}`,
  contract: (id: string) => `/contract/${id}`,
  contractTab: (id: string, tab: string) => `/contract/${id}/${tab}`,
  services: "/order/services",
  serviceCreate: "/order/service/create",
  service: (serviceId: string) => `/order/service/${serviceId}`,
  serviceEdit: (serviceId: string) => `/order/service/${serviceId}/edit`,
  offer: (id: string) => `/offer/${id}`,
  counterOffer: (id: string) => `/offer/${id}/counteroffer`,
  publicContract: (contractId: string) => `/contracts/public/${contractId}`,
  delivery: (deliveryId: string) => `/delivery/${deliveryId}`,
} as const

export const WIKI_PATHS = {
  hub: "/wiki",
  items: "/wiki/items",
  ships: "/wiki/ships",
  commodities: "/wiki/commodities",
  locations: "/wiki/locations",
  manufacturers: "/wiki/manufacturers",
  refinery: "/wiki/refinery",
  item: (id: string, name?: string) =>
    name ? `/wiki/items/${formatShortSlug(id, name)}` : `/wiki/items/${id}`,
  ship: (id: string, name?: string) =>
    name ? `/wiki/ships/${formatShortSlug(id, name)}` : `/wiki/ships/${id}`,
  commodity: (id: string, name?: string) =>
    name ? `/wiki/commodities/${formatShortSlug(id, name)}` : `/wiki/commodities/${id}`,
  manufacturer: (code: string) => `/wiki/manufacturers/${code}`,
} as const

export const GAME_DATA_PATHS = {
  missions: "/missions",
  mission: (slug: string) => `/missions/${slug}`,
  blueprints: "/blueprints",
  blueprint: (slug: string) => `/blueprints/${slug}`,
  blueprintInventory: "/blueprints/inventory",
  resources: "/resources",
  craftingCalculator: "/crafting/calculator",
  craftingHistory: "/crafting/history",
  mining: "/mining",
  miningLocations: "/mining/locations",
  miningLocation: (name: string) => `/mining/locations/${name}`,
  miningOre: (name: string) => `/mining/ores/${name}`,
} as const

export const ADMIN_PATHS = {
  orders: "/admin/orders",
  users: "/admin/users",
  market: "/admin/market",
  premium: "/admin/premium",
  alerts: "/admin/alerts",
  moderation: "/admin/moderation",
  featureFlags: "/admin/feature-flags",
  featureFlag: (flagName: string) => `/admin/feature-flags/${flagName}`,
  gameDataImport: "/admin/game-data-import",
  attributeDefinitions: "/admin/attribute-definitions",
  gameItemAttributes: "/admin/game-item-attributes",
  importMonitoring: "/admin/import-monitoring",
  auditLogs: "/admin/audit-logs",
  notificationTest: "/admin/notification-test",
  requisitions: "/admin/requisitions",
  supplierDashboard: "/admin/supplier-dashboard",
  supplierRoster: "/admin/supplier-roster",
} as const
