/**
 * The stock manager's inline row edit (status, price, quantity) turned into
 * API requests. Pure: the hook (useSaveStockRow) sends them.
 */
import type {
  CreateListingRequest,
  MyListingItem,
  UpdateListingRequest,
} from "../../../store/api/v2/market"

/** What the row editor holds for a listing (new or existing). */
export interface StockRowDraft {
  game_item_id?: string | null
  game_item_name?: string | null
  status?: "active" | "inactive"
  price?: number
  quantity_available?: number
}

export interface StockRowChanges {
  /** Listing fields that changed, or null when none did. */
  listingPatch: UpdateListingRequest | null
  /** How much the listed quantity changed (0: unchanged). */
  quantityDelta: number
}

/** What changed between the listing and the edited row. */
export function stockRowChanges(
  existing: Pick<MyListingItem, "status" | "price_min" | "quantity_available">,
  draft: StockRowDraft,
): StockRowChanges {
  const patch: UpdateListingRequest = {}
  if (draft.status !== undefined && draft.status !== existing.status) {
    patch.status = draft.status
  }
  if (draft.price !== undefined && draft.price !== existing.price_min) {
    patch.base_price = draft.price
  }
  const quantityDelta =
    draft.quantity_available !== undefined
      ? draft.quantity_available - existing.quantity_available
      : 0
  return {
    listingPatch: Object.keys(patch).length > 0 ? patch : null,
    quantityDelta,
  }
}

/**
 * A quantity change lands on one listed lot. Its new total, or null when
 * there is no lot or the change would take it below zero (then the user
 * edits quantities per lot on the Stock page).
 */
export function lotTotalAfterDelta(
  lotTotal: number | undefined,
  delta: number,
): number | null {
  if (lotTotal === undefined || lotTotal + delta < 0) return null
  return lotTotal + delta
}

/**
 * A new listing from a new row: unified price, one lot. Null without a
 * game item. The fallbacks (title, price 1, quantity 1) are the row's
 * defaults when a field was left empty.
 */
export function newStockRowRequest(
  draft: StockRowDraft,
  shopId: string,
  fallbackTitle: string,
): CreateListingRequest | null {
  if (!draft.game_item_id) return null
  return {
    title: draft.game_item_name || fallbackTitle,
    game_item_id: draft.game_item_id,
    pricing_mode: "unified",
    base_price: draft.price || 1,
    lots: [{ quantity: draft.quantity_available || 1, variant_attributes: {} }],
    shop_id: shopId,
  }
}
