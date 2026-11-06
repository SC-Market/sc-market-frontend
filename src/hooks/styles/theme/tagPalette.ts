import type { Theme } from "@mui/material"
import {
  AA_TEXT,
  AA_UI,
  ensureContrast,
  flatten,
  mix,
  surfaces,
} from "./contrast"

/**
 * The categorical tag palette: eight hues that tell tag *types* apart on
 * tag-heavy surfaces (blueprints, missions, wiki items, mining). A hue never
 * means "good" or "bad"; that stays with the meaning colours:
 *
 * - green (the accent, `success`): owned / positive  -> `tag.positive`
 * - red (`error`): illegal                           -> `tag.negative`
 * - violet (`secondary`): the buy side and premium. Not used here.
 * - the quality scale (util/qualityColor): rarity and quality, filled chips.
 *
 * Teal is left out on purpose: next to the emerald accent it reads as
 * "owned". Which tag type takes which hue lives in components/tags/tagColors.
 */
export const TAG_HUES = [
  "blue",
  "cyan",
  "amber",
  "orange",
  "pink",
  "magenta",
  "lime",
  "slate",
] as const
export type TagHue = (typeof TAG_HUES)[number]

/** The two meaning colours drawn in the same tag style. */
export const TAG_MEANINGS = ["positive", "negative"] as const
export type TagMeaning = (typeof TAG_MEANINGS)[number]

export type TagTone = TagHue | TagMeaning
export const TAG_TONES: readonly TagTone[] = [...TAG_HUES, ...TAG_MEANINGS]

/** One tag colour: soft tint fill, coloured text, 1px border. */
export interface TagColor {
  /** Label and icon colour: >= 4.5:1 on tint, hover, paper and the page. */
  text: string
  /** 1px border: >= 3:1 on paper and the page. */
  border: string
  /** Resting fill (opaque, so it reads the same over images). */
  tint: string
  /** Fill for a clickable tag on hover / keyboard focus. */
  hover: string
}

export type TagPalette = Record<TagTone, TagColor>

/**
 * Seeds per mode: the hue a tag's text starts from. Dark themes start from a
 * light shade, light themes from a deep one; each theme then nudges the text
 * and border until they pass AA on its own surfaces (deriveTagPalette).
 */
const SEEDS: Record<"dark" | "light", Record<TagHue, string>> = {
  dark: {
    blue: "#74b4ff",
    cyan: "#4fd3ee",
    amber: "#f4c24d",
    orange: "#ff9a57",
    pink: "#ff8fc0",
    magenta: "#e58cf5",
    lime: "#b5dd4f",
    slate: "#a7b4c8",
  },
  light: {
    blue: "#1858b5",
    cyan: "#0b6f87",
    amber: "#8a5a00",
    orange: "#b2450c",
    pink: "#b8296e",
    magenta: "#9a2fae",
    lime: "#4d6b06",
    slate: "#4a5568",
  },
}

/** Tint and hover strength (share of the hue mixed into paper). */
const TINT = { dark: 0.16, light: 0.1 } as const
const HOVER = { dark: 0.26, light: 0.18 } as const
/** Where the border starts between paper and the hue, before the 3:1 floor. */
const BORDER = { dark: 0.6, light: 0.55 } as const

/** Surfaces used when a theme's own can't be read (gradients, url()). */
const FALLBACK_SURFACES = {
  dark: { paper: "#111828", page: "#0b0f1a" },
  light: { paper: "#ffffff", page: "#ffffff" },
} as const

function deriveOne(
  seed: string,
  mode: "dark" | "light",
  paper: string,
  page: string,
): TagColor {
  const tint = mix(paper, seed, TINT[mode])
  const hover = mix(paper, seed, HOVER[mode])
  const text = ensureContrast(seed, [tint, hover, paper, page], AA_TEXT)
  const border = ensureContrast(
    mix(paper, seed, BORDER[mode]),
    [paper, page],
    AA_UI,
  )
  return { text, border, tint, hover }
}

/** The tag palette for a mode on the given (solid) surfaces. */
export function deriveTagPalette(
  mode: "dark" | "light",
  paper: string,
  page: string,
  meanings: Record<TagMeaning, string>,
): TagPalette {
  const out = {} as TagPalette
  for (const hue of TAG_HUES) {
    out[hue] = deriveOne(SEEDS[mode][hue], mode, paper, page)
  }
  for (const m of TAG_MEANINGS) {
    out[m] = deriveOne(flatten(meanings[m], paper), mode, paper, page)
  }
  return out
}

function tagPaletteFor(theme: Theme): TagPalette {
  const mode = theme.palette.mode
  const meanings = {
    positive: theme.palette.success.main,
    negative: theme.palette.error.main,
  }
  let solid: { paper: string; page: string }
  try {
    solid = surfaces(theme)
  } catch {
    solid = FALLBACK_SURFACES[mode]
  }
  return deriveTagPalette(mode, solid.paper, solid.page, meanings)
}

/**
 * Set `palette.tag` on a built theme, derived from its own paper and page so
 * every preset (and org theme) passes AA. A theme whose surfaces can't be
 * read (gradients, url()) is derived against the base dark / light surfaces.
 */
export function applyTagPalette(theme: Theme): Theme {
  theme.palette.tag = tagPaletteFor(theme)
  return theme
}

const derived = new WeakMap<Theme, TagPalette>()

/**
 * The theme's tag palette. Themes built by createAppTheme carry it; a theme
 * built some other way (MUI's default theme outside a ThemeProvider, a
 * nested createTheme) gets the same derivation from its own surfaces.
 */
export function getTagPalette(theme: Theme): TagPalette {
  if (theme.palette.tag) return theme.palette.tag
  let palette = derived.get(theme)
  if (!palette) {
    palette = tagPaletteFor(theme)
    derived.set(theme, palette)
  }
  return palette
}
