import type { Theme, ThemeOptions } from "@mui/material"
import {
  AA_TEXT,
  AA_UI,
  ON_ACCENT_DARK,
  contrast,
  flatten,
  nudgeToContrast,
  pickReadable,
  surfaces,
} from "./contrast"

/**
 * Role tokens: one colour per job, so a brand colour that works as a button
 * fill but not as text on the page (a dark navy on a dark page) doesn't have
 * to do both.
 *
 * | Role                         | Token                  | Minimum           |
 * | ---------------------------- | ---------------------- | ----------------- |
 * | Button fill (the brand)      | primary.main (saved)   | -                 |
 * | Text on the fill             | primary.contrastText   | 4.5:1 on the fill |
 * | Accent text, links, tabs,    | text.accent            | 4.5:1 on Paper    |
 * | accent icons and indicators  |                        | and the page      |
 * | Keyboard focus ring          | common.focus           | 3:1               |
 * | Control borders (inputs,     | outline.strong         | 3:1               |
 * | outlined neutral controls)   |                        |                   |
 * | Body / emphasis text         | text.primary/secondary | 4.5:1             |
 *
 * A token the theme's own layer sets is used as it is: the theme editor
 * shows its contrast and offers a fix, but the org decides. A token it
 * leaves out is derived from the colour it would otherwise copy, moved just
 * far enough to pass (nudgeToContrast).
 *
 * After this runs, `palette.primary.main` is the accent-on-surface colour
 * (MUI and ~300 call sites paint text, icons, outlines and indicators with
 * it) and `palette.primary.fill` is the saved brand colour, which filled
 * controls use (baseComponentOverrides; `primaryFill` for custom code).
 * When the brand colour already reads at AA as text, the two are the same.
 */
export function applyRoleTokens(theme: Theme, layer?: ThemeOptions): Theme {
  try {
    const own = (layer?.palette ?? {}) as Record<
      string,
      Record<string, unknown> | undefined
    >
    const set = (group: string, key: string) =>
      typeof own[group]?.[key] === "string"
    const { paper, page } = surfaces(theme)
    const bgs = [paper, page]
    const { palette } = theme
    const brand = palette.primary.main
    const fill = flatten(brand, paper)

    const text = palette.text as Theme["palette"]["text"] & {
      accent?: string
    }
    const accent = set("text", "accent")
      ? (text.accent as string)
      : nudgeToContrast(brand, bgs, AA_TEXT)

    const onFill = set("primary", "contrastText")
      ? palette.primary.contrastText
      : pickReadable(
          [palette.primary.contrastText, "#ffffff", ON_ACCENT_DARK, "#000000"],
          [fill],
          AA_TEXT,
        )

    if (!set("common", "focus")) {
      // The brand colour when the layer sets one, else the inherited ring
      palette.common.focus = nudgeToContrast(
        set("primary", "main") ? brand : palette.common.focus,
        bgs,
        AA_UI,
      )
    }
    if (!set("outline", "strong")) {
      palette.outline.strong = nudgeToContrast(
        set("outline", "main") ? palette.outline.main : palette.outline.strong,
        bgs,
        AA_UI,
      )
    }
    // Text colours the layer leaves to the base, on surfaces it changed
    for (const key of ["primary", "secondary"] as const) {
      if (!set("text", key)) {
        text[key] = nudgeToContrast(text[key], bgs, AA_TEXT)
      }
    }

    text.accent = accent
    palette.primary = {
      ...palette.primary,
      main: accent,
      fill: brand,
      contrastText: onFill,
    }
  } catch {
    // Unreadable surface (gradient, url(), CSS variable): MUI's values stay
  }
  return theme
}

/** The filled-control colour: the brand, before the text role took `main`. */
export function primaryFill(theme: Theme): string {
  return theme.palette.primary.fill ?? theme.palette.primary.main
}

/**
 * Filled-primary hover: the palette's dark shade when the button text still
 * reads on it, else the fill itself.
 */
export function primaryFillHover(theme: Theme): string {
  const fill = primaryFill(theme)
  const { dark, contrastText } = theme.palette.primary
  try {
    const { paper } = surfaces(theme)
    return contrast(contrastText, flatten(dark, paper)) >= AA_TEXT ? dark : fill
  } catch {
    return dark
  }
}
