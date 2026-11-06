import { describe, expect, it } from "vitest"
import { getContrastRatio } from "@mui/material/styles"
import {
  QUALITY_TIER_COLORS,
  qualityTierColor,
  qualityValueColor,
} from "../qualityColor"

// WCAG 2.x contrast ratio of two colours (any CSS colour format).
const contrast = getContrastRatio

describe("qualityColor", () => {
  it.each(Object.entries(QUALITY_TIER_COLORS))(
    "tier %s text meets WCAG AA (4.5:1) on its background",
    (_tier, { bg, fg }) => {
      expect(contrast(bg, fg)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it("maps values onto the same ladder as tiers, 200 points per step", () => {
    expect(qualityValueColor(0)).toBe(qualityTierColor(1))
    expect(qualityValueColor(199)).toBe(qualityTierColor(1))
    expect(qualityValueColor(200)).toBe(qualityTierColor(2))
    expect(qualityValueColor(400)).toBe(qualityTierColor(3))
    expect(qualityValueColor(600)).toBe(qualityTierColor(4))
    expect(qualityValueColor(800)).toBe(qualityTierColor(5))
    expect(qualityValueColor(1000)).toBe(qualityTierColor(5))
  })

  it("falls back to tier 1 for out-of-range tiers", () => {
    expect(qualityTierColor(0)).toBe(QUALITY_TIER_COLORS[1])
    expect(qualityTierColor(9)).toBe(QUALITY_TIER_COLORS[1])
  })
})
