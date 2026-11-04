/**
 * Who may manage (edit, renew, remove, see the orders of) a listing. Pure:
 * no React, no store.
 *
 * The backend's rule (canModifyListing in v2/util/listing-permissions.ts):
 * canManageShop on the listing's shop, i.e. the shop's owner or, for an
 * org's shop, a member with Manage Market. GET /shops/mine reports exactly
 * that per shop as `permissions.can_manage`, so the answer is: the listing's
 * shop is one of my shops and I can manage it.
 *
 * (The backend also lets an acting site admin through on org shops; the
 * listing doesn't say whether its shop is an org's, so admins get the
 * button only for shops they manage, and use the admin tools otherwise.)
 */
import type { ShopResponse } from "../../../store/api/v2/market"
import { canEditShopListings } from "../../shops/domain/shopPermissions"

export function canManageListing(
  shopId: string | null | undefined,
  myShops:
    | ReadonlyArray<Pick<ShopResponse, "shop_id" | "permissions">>
    | null
    | undefined,
): boolean {
  if (!shopId || !myShops) return false
  const shop = myShops.find((s) => s.shop_id === shopId)
  return !!shop && canEditShopListings(shop)
}
