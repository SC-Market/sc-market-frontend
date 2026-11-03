/**
 * Buy-order quantity rules, shared by every screen that shows how much of a
 * standing buy order is still wanted.
 *
 * Mirrors the backend (BuyOrdersV2Controller.fulfillBuyOrder): remaining is
 * the desired quantity minus what has been filled so far.
 */

export interface BuyOrderQuantities {
  quantity?: number | null
  quantity_fulfilled?: number | null
}

/** Units of a buy order still wanted. Never negative. */
export function remainingQuantity(order: BuyOrderQuantities): number {
  return Math.max(0, (order.quantity ?? 0) - (order.quantity_fulfilled ?? 0))
}

/** Units still wanted across several buy orders. */
export function totalRemainingQuantity(
  orders: readonly BuyOrderQuantities[],
): number {
  return orders.reduce((sum, o) => sum + remainingQuantity(o), 0)
}
