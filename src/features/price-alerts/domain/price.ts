/** Highest target price the backend stores (int4). */
export const MAX_TARGET_PRICE = 2_147_483_647

/** An exact aUEC amount, e.g. "25,000 aUEC" (target prices aren't abbreviated). */
export function formatAuec(amount: number): string {
  return `${amount.toLocaleString("en-US")} aUEC`
}

/**
 * A typed target price, or null when it isn't a whole number above 1 aUEC
 * (1 aUEC listings are placeholders and never alert).
 */
export function parseTargetPrice(value: string): number | null {
  const trimmed = value.trim().replace(/[,\s]/g, "")
  if (!/^\d+$/.test(trimmed)) return null
  const price = Number(trimmed)
  if (!Number.isSafeInteger(price) || price <= 1 || price > MAX_TARGET_PRICE)
    return null
  return price
}
