/** A stock lot's id and its current quantity_total. */
export interface LotQuantity {
  lot_id: string
  quantity_total: number
}

/**
 * The lot updates that change a variant's quantity by `delta`, given its
 * listed lots newest first (the order GET /stock-lots returns).
 *
 * Only the change is applied, never the variant's total: on a variant spread
 * over several lots, writing the total into one lot multiplied the stock. An
 * increase goes to the newest lot. A decrease is taken from the lots in
 * order, newest first, each down to zero at most.
 *
 * Returns null when it can't be done: no lots to put an increase in, or a
 * decrease larger than the lots hold. No change gives no updates.
 */
export function lotUpdatesForQuantityChange(
  lots: readonly LotQuantity[],
  delta: number,
): LotQuantity[] | null {
  if (delta === 0) return []
  if (delta > 0) {
    const newest = lots[0]
    if (!newest) return null
    return [
      { lot_id: newest.lot_id, quantity_total: newest.quantity_total + delta },
    ]
  }
  let remaining = -delta
  const updates: LotQuantity[] = []
  for (const lot of lots) {
    if (remaining === 0) break
    const take = Math.min(lot.quantity_total, remaining)
    if (take === 0) continue
    updates.push({
      lot_id: lot.lot_id,
      quantity_total: lot.quantity_total - take,
    })
    remaining -= take
  }
  return remaining === 0 ? updates : null
}
