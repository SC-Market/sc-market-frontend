/**
 * Tag type -> colour, for the whole site. A tag type always has the same
 * colour wherever it appears (blueprints, missions, wiki, mining, listings),
 * so colour helps people scan and means something.
 *
 * - Hues come from the theme's categorical palette (`palette.tag`, derived
 *   per theme so every pair passes AA; see hooks/styles/theme/tagPalette).
 * - Meaning colours keep their meaning: owned is green (`positive`), illegal
 *   is red (`negative`), rarity keeps the quality scale (filled chip).
 * - Manufacturer stays neutral: it is on nearly every item and would be noise.
 *
 * Two hues are shared by types that never appear on the same surface
 * (orange: mission giver / listing discount; slate: source / mission trait).
 *
 * Call sites pass a tag type (TagChip `tag`, or tagSx); they never pick a
 * colour themselves.
 */

import type { Theme } from "@mui/material"
import type { SystemStyleObject } from "@mui/system"
import {
  getTagPalette,
  type TagColor,
  type TagTone,
} from "../../hooks/styles/theme/tagPalette"
import { rarityColor, type QualityColor } from "../../util/qualityColor"

export type TagType =
  | "owned"
  | "reward"
  | "illegal"
  | "rarity"
  | "category"
  | "tier"
  | "modifier"
  | "location"
  | "faction"
  | "event"
  | "size"
  | "source"
  | "trait"
  | "discount"
  | "manufacturer"

/** Where a tag type's colour comes from. */
export type TagColorSource =
  | { kind: "tone"; tone: TagTone }
  | { kind: "quality" }
  | { kind: "neutral" }

const tone = (t: TagTone): TagColorSource => ({ kind: "tone", tone: t })

/** The one mapping. Change a type's colour here and it changes everywhere. */
export const TAG_TYPE_COLORS: Record<TagType, TagColorSource> = {
  /** Owned / default blueprints: the accent's green. */
  owned: tone("positive"),
  /** Mission blueprint rewards: something you gain, so green too. */
  reward: tone("positive"),
  /** Illegal missions: red. */
  illegal: tone("negative"),
  /** Rarity (Common..Legendary): the quality scale, filled. */
  rarity: { kind: "quality" },
  /** Item category, mission type, wiki item type, location type. */
  category: tone("blue"),
  /** Tier, grade, difficulty, blueprint tier: a level. */
  tier: tone("amber"),
  /** Quality modifiers ("quality affects" properties). */
  modifier: tone("magenta"),
  /** Star system, location. */
  location: tone("cyan"),
  /** Mission giver / faction. */
  faction: tone("orange"),
  /** Live events. */
  event: tone("pink"),
  /** Item size (S1, S2...). */
  size: tone("lime"),
  /** How it's obtained: default blueprint, acquisition method, crafted source. */
  source: tone("slate"),
  /** Mission traits (unique, chain, starter, shareable) and amenities. */
  trait: tone("slate"),
  /** Listing bulk discount. */
  discount: tone("orange"),
  /** Manufacturer: neutral (outlined), on purpose. */
  manufacturer: { kind: "neutral" },
}

/** The theme colour for a tone. */
export function tagTone(theme: Theme, t: TagTone): TagColor {
  return getTagPalette(theme)[t]
}

/** The tag colour (soft tint, coloured text, 1px border) as chip styles. */
export function tagToneSx(c: TagColor) {
  return {
    backgroundColor: c.tint,
    color: c.text,
    border: `1px solid ${c.border}`,
    "& .MuiChip-icon, & .MuiChip-avatar": { color: c.text },
    "& .MuiChip-deleteIcon": { color: c.text },
    "&.MuiChip-clickable:hover, &.Mui-focusVisible": {
      backgroundColor: c.hover,
    },
  }
}

/** A quality-scale colour as chip styles (filled, with a matching border). */
export function qualityTagSx(c: QualityColor) {
  return {
    backgroundColor: c.bg,
    color: c.fg,
    border: `1px solid ${c.bg}`,
    "& .MuiChip-icon": { color: c.fg },
    // The fill stays (its text pair is the checked one); hover underlines.
    "&.MuiChip-clickable:hover, &.Mui-focusVisible": {
      backgroundColor: c.bg,
      textDecoration: "underline",
    },
  }
}

/**
 * Chip `sx` for a tag type. `rarity` needs the rarity name; a name that isn't
 * on the quality ladder gets no colour (the chip stays neutral).
 */
export type TagSx =
  | SystemStyleObject<Theme>
  | ((theme: Theme) => SystemStyleObject<Theme>)

export function tagSx(type: TagType, rarity?: string): TagSx {
  const source = TAG_TYPE_COLORS[type]
  if (source.kind === "tone") {
    return (theme: Theme) => tagToneSx(tagTone(theme, source.tone))
  }
  if (source.kind === "quality") {
    const c = rarity ? rarityColor(rarity) : null
    return c ? qualityTagSx(c) : {}
  }
  return {}
}

/** Whether a tag type (and rarity) is drawn as the neutral outlined chip. */
export function isNeutralTag(type: TagType, rarity?: string): boolean {
  const source = TAG_TYPE_COLORS[type]
  if (source.kind === "neutral") return true
  if (source.kind === "quality") return !(rarity && rarityColor(rarity))
  return false
}
