import { blue, common, green, grey, orange, purple } from "@mui/material/colors"
import { QUALITY_DARK_TEXT } from "../hooks/styles/fixedColors"

/**
 * The one quality colour scheme for the site (tiers 1-5 and values 0-1000).
 *
 * Each background is paired with the text colour that reads on it at WCAG AA
 * (>= 4.5:1). White text only works on the grey and purple steps; the green,
 * blue and gold steps need dark text. `qualityColor.test.ts` checks every pair,
 * so a new colour here can't ship unreadable.
 *
 * Ladder: 1 grey, 2 green, 3 blue, 4 purple, 5 gold.
 */
export interface QualityColor {
  /** Chip/badge background. */
  bg: string
  /** Text colour on `bg`, >= 4.5:1. */
  fg: string
}

const LIGHT_TEXT = common.white
/** The paper colour of the dark theme, so dark text matches the surface. */
const DARK_TEXT = QUALITY_DARK_TEXT

export const QUALITY_TIER_COLORS: Record<1 | 2 | 3 | 4 | 5, QualityColor> = {
  1: { bg: grey[600], fg: LIGHT_TEXT }, // grey    4.61:1
  2: { bg: green[500], fg: DARK_TEXT }, // green   6.37:1
  3: { bg: blue[500], fg: DARK_TEXT }, // blue    5.67:1
  4: { bg: purple[500], fg: LIGHT_TEXT }, // purple  6.30:1
  5: { bg: orange[500], fg: DARK_TEXT }, // gold    8.22:1
}

/** Colour for a quality tier (1-5). Out-of-range tiers get the tier-1 grey. */
export function qualityTierColor(tier: number): QualityColor {
  return (
    QUALITY_TIER_COLORS[tier as keyof typeof QUALITY_TIER_COLORS] ??
    QUALITY_TIER_COLORS[1]
  )
}

/** Colour for a quality value (0-1000): every 200 points is one tier step. */
export function qualityValueColor(value: number): QualityColor {
  if (value >= 800) return QUALITY_TIER_COLORS[5]
  if (value >= 600) return QUALITY_TIER_COLORS[4]
  if (value >= 400) return QUALITY_TIER_COLORS[3]
  if (value >= 200) return QUALITY_TIER_COLORS[2]
  return QUALITY_TIER_COLORS[1]
}

/** `sx` fragment for a filled chip in a quality colour. */
export function qualityChipSx(color: QualityColor) {
  return { bgcolor: color.bg, color: color.fg }
}

type Q = number | null | undefined

/** The quality fields a listing search result carries. */
export interface QualityRange {
  quality_value_min?: Q
  quality_value_max?: Q
  quality_tier_min?: Q
  quality_tier_max?: Q
}

/**
 * Label and colour for a listing's quality chip. Prefers the value (0-1000)
 * over the tier (1-5); the colour follows the top of the range.
 */
export function qualityRangeChip(
  listing: QualityRange,
): { label: string; color: QualityColor } | null {
  if (listing.quality_value_min != null) {
    const min = listing.quality_value_min
    const max = listing.quality_value_max ?? min
    const label = min === max ? `${min}` : `${min}–${max}`
    return { label, color: qualityValueColor(max) }
  }
  if (listing.quality_tier_min != null) {
    const min = listing.quality_tier_min
    const max = listing.quality_tier_max ?? min
    const label = min === max ? `Q${min}` : `Q${min}–${max}`
    return { label, color: qualityTierColor(max) }
  }
  return null
}
