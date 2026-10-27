/**
 * Whether the order page shows the Stock Allocation tab. Mirrors who the V2
 * allocation endpoints let in (the seller side): manage_orders in the selling
 * org, the order's assigned seller, or a manager of the order's shop (its
 * owner, or manage_market in the owning org). Only orders with V2 items have
 * stock to allocate.
 */
export function canManageOrderStock(o: {
  hasV2Items: boolean
  orgOrderManager: boolean
  assigned: boolean
  shopId: string | undefined
  myShops:
    | ReadonlyArray<{ shop_id: string; permissions?: { can_manage: boolean } }>
    | undefined
}): boolean {
  if (!o.hasV2Items) return false
  if (o.orgOrderManager || o.assigned) return true
  return (
    !!o.shopId &&
    !!o.myShops?.some(
      (s) => s.shop_id === o.shopId && s.permissions?.can_manage,
    )
  )
}
