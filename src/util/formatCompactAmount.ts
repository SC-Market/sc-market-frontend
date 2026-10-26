/**
 * A large amount in words, e.g. 1,677,981,402,101 → "1.6 trillion" (en).
 *
 * Rounds toward zero, so a stat never claims more than the real number
 * (plain rounding would show "1.7 trillion"). Under 1,000 the number is
 * printed in full. Browsers without Intl `roundingMode` (pre-2023) round to
 * nearest instead, which is at most one tenth of a unit high.
 */
export function formatCompactAmount(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "long",
    maximumFractionDigits: 1,
    roundingMode: "trunc",
  }).format(value)
}
