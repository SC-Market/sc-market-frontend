/**
 * The small overlay chips on market cards (ListingCardV2, the buy-order
 * card). Kept apart from ListingSearchV2 so a card can use them without
 * pulling in the whole market search page.
 */

/** Shared visual style for the small overlay chips on a listing card. */
export const CARD_CHIP_SX = {
  textTransform: "uppercase" as const,
  fontWeight: "bold" as const,
  fontSize: "0.65rem",
  height: 18,
} as const

/**
 * Absolute-positioned flex column for one card corner. Stacking chips in a
 * container (instead of pinning each chip with its own top/left and manually
 * offsetting for siblings) means any combination of chips lays out without
 * overlapping.
 */
export function cardChipStackSx(corner: "top-left" | "top-right") {
  return {
    position: "absolute" as const,
    top: 4,
    ...(corner === "top-left" ? { left: 4 } : { right: 4 }),
    zIndex: 5,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: corner === "top-left" ? "flex-start" : "flex-end",
    gap: 0.5,
    // Never cover the card's own click target.
    pointerEvents: "none" as const,
    maxWidth: "calc(50% - 8px)",
  }
}
