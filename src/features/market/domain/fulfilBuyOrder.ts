/**
 * Rules for filling a standing buy order from one of the seller's listings,
 * shared by every "Fulfill" button.
 *
 * Mirrors POST /buy-orders/{id}/fulfill (BuyOrdersV2Controller.fulfillBuyOrder):
 * - a listing and variant are required, and must be one the backend accepts
 *   (GET /buy-orders/{id}/fulfillment-options reports a `problem` otherwise);
 * - the quantity is a whole number from 1 to what is still wanted, and no
 *   more than that listing variant's listed stock;
 * - the price is always the listing's price. There is no agreed price.
 */
import { remainingQuantity, type BuyOrderQuantities } from "./buyOrders"

export interface FulfilOption {
  listing_id: string
  variant_id: string
  available: number
  problem?: string | null
}

export type FulfilError =
  /** No listing variant picked. */
  | "no_listing"
  /** The picked listing variant is one the backend rejects. */
  | "listing_unusable"
  /** Quantity outside 1..fulfilMaxQuantity. */
  | "quantity_range"

/** Options the backend accepts, in the order it ranked them. */
export function usableFulfilOptions<T extends FulfilOption>(
  options: readonly T[],
): T[] {
  return options.filter((o) => o.problem == null)
}

/** The most units that can be filled from `option` (or at all, if none). */
export function fulfilMaxQuantity(
  buyOrder: BuyOrderQuantities,
  option?: Pick<FulfilOption, "available"> | null,
): number {
  const remaining = remainingQuantity(buyOrder)
  return option ? Math.max(0, Math.min(remaining, option.available)) : remaining
}

export function validateFulfil({
  buyOrder,
  option,
  quantity,
}: {
  buyOrder: BuyOrderQuantities
  option?: FulfilOption | null
  quantity: number
}): FulfilError | null {
  if (!option) return "no_listing"
  if (option.problem != null) return "listing_unusable"
  const max = fulfilMaxQuantity(buyOrder, option)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) {
    return "quantity_range"
  }
  return null
}
