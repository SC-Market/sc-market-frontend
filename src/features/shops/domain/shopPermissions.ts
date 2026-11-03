import type { ShopResponse } from "../../../store/api/v2/market"

/**
 * What the signed-in user may do in a shop, from its `permissions` (only
 * sent by GET /api/v2/shops/mine). Named for what they allow, mirroring the
 * backend checks in shop-permissions.service.ts:
 *
 * | helper                  | owner | Manage Market | Manage Stock | Manage Orders |
 * | ----------------------- | ----- | ------------- | ------------ | ------------- |
 * | canOpenShopSettings     | yes   | yes           | no           | no            |
 * | canEditShopListings     | yes   | yes           | no           | no            |
 * | canEditShopStockLots    | yes   | yes           | yes          | no            |
 *
 * A shop without `permissions` (someone else's shop) allows neither.
 */
type ShopWithPermissions = Pick<ShopResponse, "permissions">

/**
 * Open the shop's Settings page and save it: the backend's update-shop,
 * webhook, blocklist and order-settings endpoints all check canManageShop
 * (the owning user, or an org member with Manage Market), which /shops/mine
 * reports as `can_manage`. The sidebar and the Settings route both use this.
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
