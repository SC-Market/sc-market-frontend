import type { Theme, ThemeOptions } from "@mui/material"
import { alpha } from "@mui/material/styles"
import {
  AA_TEXT,
  AA_UI,
  ON_ACCENT_DARK,
  contrast,
  flatten,
  mix,
  nudgeToContrast,
  pickReadable,
  surfaces,
  toHex,
  worst,
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
 * | Selected fill (rows, menu    | action.selected        | -                 |
 * | items, toggles)              |                        |                   |
 * | Selected label & indicator   | text.selected          | 4.5:1 on the fill |
 * | (rail, tab underline, ring)  |                        | and surfaces; 3:1 |
 * |                              |                        | against hover     |
 * | Disabled text and icons      | text.disabled,         | ~3:1, under body  |
 * |                              | action.disabled        | text              |
 * | Disabled fill                | action.disabledBg...   | -                 |
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
    applySelectedTokens(theme, set, accent)
    applyDisabledTokens(theme, set)
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

type IsSet = (group: string, key: string) => boolean

/** How strong the derived selected tint is, per mode. */
const SELECTED_ALPHA = { dark: 0.2, light: 0.12 } as const

/**
 * Selected state: a tint of the accent (action.selected) and a label and
 * indicator colour (text.selected).
 *
 * - action.selected: text.accent at 20% (dark) / 12% (light), so it reads
 *   as the accent's colour on any surface.
 * - text.selected: text.accent moved just far enough to reach 4.5:1 on the
 *   tint and the bare surfaces (so its rail or underline is also over 3:1
 *   on the background). A hovered row must not pass for a selected one:
 *   when the tint isn't 3:1 away from the hover fill, the label is moved on
 *   until it is 3:1 from the hover fill too, if that keeps the 4.5:1.
 */
function applySelectedTokens(theme: Theme, set: IsSet, accent: string) {
  const { palette } = theme
  const text = palette.text
  // Paper and the page. The sidebar can be a different shade altogether
  // (the site's light theme has a dark one): its rows check the label
  // against their own surface (components/sidebar/sidebarStyles.ts).
  const { paper, page } = surfaces(theme)
  const rest = [paper, page]
  if (!set("action", "selected")) {
    palette.action.selected = alpha(accent, SELECTED_ALPHA[palette.mode])
  }
  if (set("text", "selected")) return
  const fills = rest.map((bg) => flatten(palette.action.selected, bg))
  const hovers = rest.map((bg) => flatten(palette.action.hover, bg))
  const onSelected = [...fills, ...rest]
  let label = nudgeToContrast(accent, onSelected, AA_TEXT)
  const fillDistinct = fills.every(
    (fill, i) => contrast(fill, hovers[i]) >= AA_UI,
  )
  if (!fillDistinct && worst(label, hovers) < AA_UI) {
    const further = nudgeToContrast(label, hovers, AA_UI)
    if (worst(further, onSelected) >= AA_TEXT) label = further
  }
  text.selected = label
}

/**
 * Disabled state. Disabled controls are exempt from WCAG's minimums, but
 * the label still has to be legible and look switched off:
 *
 * - action.disabledBackground: body text at 12% over Paper (disabled
 *   button and chip fills).
 * - text.disabled: body text at 30% over Paper (well under the body text,
 *   so it reads as off), raised to 3:1 on Paper and the page. Labels on the
 *   disabled fill (buttons, chips) are kept at 3:1 on it by disabledButton
 *   (./contrast.ts).
 * - action.disabled (disabled icons, checkbox and switch marks): the same
 *   colour as the disabled label.
 */
function applyDisabledTokens(theme: Theme, set: IsSet) {
  const { palette } = theme
  const { paper, page } = surfaces(theme)
  const body = flatten(palette.text.primary, paper)
  if (!set("action", "disabledBackground")) {
    palette.action.disabledBackground = toHex(mix(paper, body, 0.12))
  }
  if (!set("text", "disabled")) {
    palette.text.disabled = nudgeToContrast(
      toHex(mix(paper, body, 0.3)),
      [paper, page],
      AA_UI,
    )
  }
  if (!set("action", "disabled")) {
    palette.action.disabled = palette.text.disabled
  }
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
