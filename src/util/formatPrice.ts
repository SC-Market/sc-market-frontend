/**
 * Format aUEC price for display. Abbreviates large numbers.
 * 15,000,000,000 → "15B aUEC"
 * 1,500,000 → "1.5M aUEC"
 * 150,000 → "150K aUEC"
 * 1,500 → "1,500 aUEC"
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "— aUEC"
  if (Math.abs(amount) >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B aUEC`
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M aUEC`
  if (Math.abs(amount) >= 100_000) return `${(amount / 1_000).toFixed(0)}K aUEC`
  return `${amount.toLocaleString()} aUEC`
}

/** Format a price range. Uses abbreviation for large numbers. */
export function formatPriceRange(min: number, max: number): string {
  if (min === max || !max) return formatPrice(min)
  return `${formatPrice(min).replace(" aUEC", "")} – ${formatPrice(max)}`
}
