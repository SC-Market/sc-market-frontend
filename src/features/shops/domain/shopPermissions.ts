import type { ShopResponse } from "../../../store/api/v2/market"
import { PATHS, SHOP_PATHS } from "../../../routes/paths"

/**
 * What the signed-in user may do in a shop, from its `permissions` (only
 * sent by GET /api/v2/shops/mine: the user's own shops and those of orgs
 * they belong to). Named for what they allow, mirroring the backend checks
 * (services/shops/shop-permissions.service.ts, v1 services controller):
 *
 * | helper                | owner | Manage Market | Manage Stock | Manage Orders | member | outsider |
 * | --------------------- | ----- | ------------- | ------------ | ------------- | ------ | -------- |
 * | canViewShopPrivate    | yes   | yes           | yes          | yes           | yes    | no       |
 * | canEditShopListings   | yes   | yes           | no           | no            | no     | no       |
 * | canEditShopStockLots  | yes   | yes           | yes          | no            | no     | no       |
 * | canHandleShopOrders   | yes   | yes           | no           | yes           | no     | no       |
 * | canManageShopServices | yes   | no (*)        | no           | yes           | no     | no       |
 * | canViewShopCustomers  | yes   | yes           | no           | no            | no     | no       |
 * | canEditShopDashboard  | yes   | yes           | no           | no            | no     | no       |
 * | canOpenShopSettings   | yes   | yes           | no           | no            | no     | no       |
 *
 * (*) The services endpoints check the org's Manage Orders, not Manage Market.
 * Owner: the owning user (all four flags true); an org's owner role carries
 * every permission. Transfer is stricter still (the owning user or the org's
 * owner role) and is checked by ShopTransferSection.
 *
 * A shop without `permissions` (someone else's shop) allows none.
 */
type ShopWithPermissions = Pick<ShopResponse, "permissions">

/**
 * See the shop's private pages (its listings and stock read-only, its
 * dashboard): backend canViewShopPrivate, any member of the owning org. Any
 * shop in /shops/mine qualifies.
 */
export function canViewShopPrivate(shop: ShopWithPermissions): boolean {
  return shop.permissions != null
}

/**
 * Open the shop's Settings page and save it: the backend's update-shop,
 * webhook, blocklist, storefront and order-settings endpoints all check
 * canManageShop (the owning user, or an org member with Manage Market),
 * which /shops/mine reports as `can_manage`.
 */
export function canOpenShopSettings(shop: ShopWithPermissions): boolean {
  return shop.permissions?.can_manage === true
}

/**
 * Create, edit, renew and remove the shop's listings (backend canManageShop:
 * `can_manage`).
 */
export function canEditShopListings(shop: ShopWithPermissions): boolean {
  return shop.permissions?.can_manage === true
}

/**
 * Add, edit and delete the shop's stock lots (backend canManageShopStock):
 * everyone who can edit its listings, plus org members with Manage Stock.
 */
export function canEditShopStockLots(shop: ShopWithPermissions): boolean {
  return canEditShopListings(shop) || shop.permissions?.manage_stock === true
}

/**
 * See and handle the shop's orders as its seller (backend
 * canManageShopOrders): the owner, Manage Market or Manage Orders.
 */
export function canHandleShopOrders(shop: ShopWithPermissions): boolean {
  return canEditShopListings(shop) || shop.permissions?.manage_orders === true
}

/**
 * Create and edit the shop owner's services: the owning user, or for an org
 * shop the org's Manage Orders (the v1 services endpoints check exactly that).
 */
export function canManageShopServices(shop: ShopWithPermissions): boolean {
  return shop.permissions?.manage_orders === true
}

/** The shop's customer list (backend GET /shops/{id}/customers: canManageShop). */
export function canViewShopCustomers(shop: ShopWithPermissions): boolean {
  return canEditShopListings(shop)
}

/** Edit the shop's shared dashboard (dashboard.service: canManageShop). */
export function canEditShopDashboard(shop: ShopWithPermissions): boolean {
  return canEditShopListings(shop)
}

/** The management pages under /shop/:shopSlug/. */
export type ShopSection =
  | "listings"
  | "create"
  | "stock"
  | "orders"
  | "dashboard"
  | "services"
  | "customers"
  | "settings"

/**
 * Who may open each management page. Listings, stock and the dashboard open
 * read-only for every member (their edit actions are hidden); the others
 * need the permission their actions need.
 */
const SECTION_ACCESS: Record<
  ShopSection,
  (shop: ShopWithPermissions) => boolean
> = {
  listings: canViewShopPrivate,
  stock: canViewShopPrivate,
  dashboard: canViewShopPrivate,
  create: canEditShopListings,
  orders: canHandleShopOrders,
  services: canManageShopServices,
  customers: canViewShopCustomers,
  settings: canOpenShopSettings,
}

export function canOpenShopSection(
  shop: ShopWithPermissions,
  section: ShopSection,
): boolean {
  return SECTION_ACCESS[section](shop)
}

/**
 * Where opening a shop lands (the sidebar's context switcher, the dashboard
 * route with the dashboard flag off): the first page, in this order, that the
 * user may open and do their job on.
 *
 * 1. orders   - who handles orders (owner, Manage Market, Manage Orders)
 * 2. stock    - who edits stock lots but not orders (Manage Stock)
 * 3. listings - everyone else in the shop's org (read-only)
 *
 * | role          | lands on |
 * | ------------- | -------- |
 * | owner         | orders   |
 * | Manage Market | orders   |
 * | Manage Orders | orders   |
 * | Manage Stock  | stock    |
 * | member        | listings |
 * | outsider      | none     |
 *
 * Each step also checks canOpenShopSection, so the landing page can never be
 * one that shows NoShopPermission.
 */
const SHOP_LANDING: ReadonlyArray<{
  section: ShopSection
  worksHere: (shop: ShopWithPermissions) => boolean
}> = [
  { section: "orders", worksHere: canHandleShopOrders },
  { section: "stock", worksHere: canEditShopStockLots },
  { section: "listings", worksHere: canViewShopPrivate },
]

/** The section opening the shop lands on; null for a shop the user isn't in. */
export function shopLandingSection(
  shop: ShopWithPermissions,
): ShopSection | null {
  return (
    SHOP_LANDING.find(
      ({ section, worksHere }) =>
        canOpenShopSection(shop, section) && worksHere(shop),
    )?.section ?? null
  )
}

/**
 * The path opening the shop lands on (shopLandingSection). A shop the user
 * isn't in goes to My Shops, as ShopContextFromRoute sends it.
 */
export function shopLandingPath(
  shop: ShopWithPermissions & Pick<ShopResponse, "slug">,
): string {
  const section = shopLandingSection(shop)
  return section ? SHOP_PATHS[section](shop.slug) : PATHS.dashboardShops
}

const PATH_SECTIONS: Record<string, ShopSection> = {
  listings: "listings",
  "listings/create": "create",
  stock: "stock",
  orders: "orders",
  dashboard: "dashboard",
  services: "services",
  customers: "customers",
  settings: "settings",
}

/**
 * The section a /shop/:shopSlug/... path opens, or null for the shop root
 * (which redirects to listings) and paths that are not a section.
 */
export function shopSectionOfPath(pathname: string): ShopSection | null {
  const rest = /^\/shop\/[^/]+\/(.+?)\/?$/.exec(pathname)?.[1]
  return rest ? (PATH_SECTIONS[rest] ?? null) : null
}
