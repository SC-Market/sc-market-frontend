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
  // en-US digits, like the abbreviations above and formatExactPrice: the
  // browser's own locale would differ from the server render's.
  return `${amount.toLocaleString("en-US")} aUEC`
}

/**
 * The exact price, "50,000,000 aUEC" (en-US digits, so the server render
 * and the browser agree): the hover title of an abbreviated price, and what
 * the page's HTML says for crawlers (as the edge bridge's summary does).
 */
export function formatExactPrice(amount: number | null | undefined): string | undefined {
  // The v2 API sends prices as numeric strings ("50000000") despite the
  // generated type, so coerce before checking.
  const value = Number(amount)
  if (amount == null || !Number.isFinite(value) || value === 0) return undefined
  return `${Math.round(value).toLocaleString("en-US")} aUEC`
}

/** Format a price range. Uses abbreviation for large numbers. */
export function formatPriceRange(min: number, max: number): string {
  if (min === max || !max) return formatPrice(min)
  return `${formatPrice(min).replace(" aUEC", "")} – ${formatPrice(max)}`
}
