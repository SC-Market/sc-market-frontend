/**
 * Each tag type renders the colour tagColors maps it to, in a dark and a
 * light theme: palette hues as tint + text + 1px border, rarity on the
 * quality scale, manufacturer as the neutral outlined chip.
 */

import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ThemeProvider, type Theme } from "@mui/material"
import { decomposeColor } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/theme/mainTheme"
import { lightTheme } from "../../../hooks/styles/theme/lightTheme"
import { TagChip } from "../TagChip"
import { TAG_TYPE_COLORS, type TagType } from "../tagColors"
import { QUALITY_TIER_COLORS, RARITY_TIERS } from "../../../util/qualityColor"

/** Compare colours as rgb triples, whatever notation each side uses. */
function rgb(color: string): string {
  const { values } = decomposeColor(color)
  return values
    .slice(0, 3)
    .map((v) => Math.round(Number(v)))
    .join(",")
}

function renderTag(theme: Theme, tag: TagType, rarity?: string) {
  render(
    <ThemeProvider theme={theme}>
      <TagChip tag={tag} rarity={rarity} label={`tag-${tag}`} />
    </ThemeProvider>,
  )
  return screen.getByText(`tag-${tag}`).closest(".MuiChip-root") as Element
}

const TONED = (Object.keys(TAG_TYPE_COLORS) as TagType[]).filter(
  (t) => TAG_TYPE_COLORS[t].kind === "tone",
)

describe.each([
  ["dark", mainTheme],
  ["light", lightTheme],
] as const)("TagChip in the %s theme", (_name, theme) => {
  it.each(TONED)("%s renders its mapped hue", (tag) => {
    const source = TAG_TYPE_COLORS[tag]
    if (source.kind !== "tone") throw new Error("unreachable")
    const c = theme.palette.tag[source.tone]
    const chip = renderTag(theme, tag)
    const css = getComputedStyle(chip)
    expect(chip).toHaveAttribute("data-tag-type", tag)
    expect(rgb(css.backgroundColor)).toBe(rgb(c.tint))
    expect(rgb(css.color)).toBe(rgb(c.text))
    expect(rgb(css.borderTopColor || css.borderColor)).toBe(rgb(c.border))
    expect(css.borderTopWidth || "1px").toBe("1px")
  })

  it.each(Object.entries(RARITY_TIERS))(
    "rarity %s renders quality tier %i",
    (rarity, tier) => {
      const q = QUALITY_TIER_COLORS[tier as keyof typeof QUALITY_TIER_COLORS]
      const css = getComputedStyle(renderTag(theme, "rarity", rarity))
      expect(rgb(css.backgroundColor)).toBe(rgb(q.bg))
      expect(rgb(css.color)).toBe(rgb(q.fg))
    },
  )

  it("an unknown rarity and the manufacturer stay neutral (outlined)", () => {
    expect(renderTag(theme, "rarity", "Mythic")).toHaveClass("MuiChip-outlined")
    expect(renderTag(theme, "manufacturer")).toHaveClass("MuiChip-outlined")
  })
})

describe("tag type mapping", () => {
  it("keeps meaning colours on their meanings", () => {
    expect(TAG_TYPE_COLORS.owned).toEqual({ kind: "tone", tone: "positive" })
    expect(TAG_TYPE_COLORS.illegal).toEqual({ kind: "tone", tone: "negative" })
    expect(TAG_TYPE_COLORS.rarity).toEqual({ kind: "quality" })
    expect(TAG_TYPE_COLORS.manufacturer).toEqual({ kind: "neutral" })
  })

  it("gives no other tag type the meaning colours", () => {
    for (const [type, source] of Object.entries(TAG_TYPE_COLORS)) {
      if (source.kind !== "tone") continue
      if (type === "owned" || type === "reward" || type === "illegal") continue
      expect(["positive", "negative"]).not.toContain(source.tone)
    }
  })
})
