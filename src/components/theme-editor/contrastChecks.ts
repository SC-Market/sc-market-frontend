import type { Theme } from "@mui/material"
import { buildOrgTheme } from "../../hooks/styles/themeCache"
import {
  AA_TEXT,
  AA_UI,
  contrast,
  flatten,
  nudgeToContrast,
  surfaces,
  toHex,
} from "../../hooks/styles/theme/contrast"
import { primaryFill } from "../../hooks/styles/theme/roles"
import { sanitizeThemeData } from "./sanitizeThemeData"
import { getNestedValue, type ThemeModeData } from "./themeEditorFields"

/**
 * The colour pairs a theme has to get right for WCAG 2.2 AA, measured on the
 * theme as it renders (derived tokens included, ../../hooks/styles/theme/
 * roles.ts): text at 4.5:1 (1.4.3), borders, the focus ring and the
 * selected indicator at 3:1 (1.4.11). Disabled text is exempt from AA but
 * held to 3:1 so it stays legible ("disabled"). The editor shows each as a
 * pass/fail badge, offers the nearest passing colour, and asks before
 * saving a failing theme.
 */
export interface ContrastCheck {
  key: string
  labelKey: string
  fallback: string
  /** "text": 4.5:1, "ui": 3:1, "disabled": 3:1 (legibility, not AA) */
  kind: CheckKind
  min: number
  /** The pair as shown: text (or border) colour, and the background it
   * does worst on */
  fg: string
  bg: string
  ratio: number
  pass: boolean
  /** The saved token the auto-fix writes */
  path: string[]
  /** The theme leaves the token out: it is derived or inherited */
  auto: boolean
  /** The nearest passing value of the token, when the pair fails */
  fix: string | null
}

type CheckKind = "text" | "ui" | "disabled"

interface Pair {
  key: string
  labelKey: string
  fallback: string
  kind: CheckKind
  path: string[]
  /** The token as it renders */
  value: (theme: Theme) => string
  /** The backgrounds it sits on (solid) */
  backgrounds: (theme: Theme, page: string, paper: string) => string[]
  /** The token is the background (a hover fill): swap them for display */
  isBackground?: boolean
  /** The pair passes some other way (the selected fill itself stands 3:1
   * off the hover fill), whatever its own ratio */
  passesAnyway?: (theme: Theme, page: string, paper: string) => boolean
}

const selectedFills = (t: Theme, page: string, paper: string) => [
  flatten(t.palette.action.selected, paper),
  flatten(t.palette.action.selected, page),
]
const hoverFills = (t: Theme, page: string, paper: string) => [
  flatten(t.palette.action.hover, paper),
  flatten(t.palette.action.hover, page),
]

const onSurfaces: Pair["backgrounds"] = (_t, page, paper) => [paper, page]

const PAIRS: Pair[] = [
  {
    key: "headingText",
    labelKey: "theme.contrastHeadingText",
    fallback: "Headings & emphasis text on the page and Paper",
    kind: "text",
    path: ["palette", "text", "secondary"],
    value: (t) => t.palette.text.secondary,
    backgrounds: onSurfaces,
  },
  {
    key: "bodyText",
    labelKey: "theme.contrastBodyText",
    fallback: "Body text on the page and Paper",
    kind: "text",
    path: ["palette", "text", "primary"],
    value: (t) => t.palette.text.primary,
    backgrounds: onSurfaces,
  },
  {
    key: "accentText",
    labelKey: "theme.contrastAccentText",
    fallback: "Accent text & links on the page and Paper",
    kind: "text",
    path: ["palette", "text", "accent"],
    value: (t) => t.palette.text.accent,
    backgrounds: onSurfaces,
  },
  {
    key: "buttonText",
    labelKey: "theme.contrastButtonText",
    fallback: "Button text on Primary",
    kind: "text",
    path: ["palette", "primary", "contrastText"],
    value: (t) => t.palette.primary.contrastText,
    backgrounds: (t, _page, paper) => [flatten(primaryFill(t), paper)],
  },
  {
    key: "secondary",
    labelKey: "theme.contrastSecondary",
    fallback: "Secondary on the page and Paper",
    kind: "text",
    path: ["palette", "secondary", "main"],
    value: (t) => t.palette.secondary.main,
    backgrounds: onSurfaces,
  },
  {
    key: "hoverText",
    labelKey: "theme.contrastHoverText",
    fallback: "Sidebar and menu text on Menu & list hover",
    kind: "text",
    path: ["palette", "action", "hover"],
    // The hover colour is the token here, measured against the row text
    isBackground: true,
    value: (t) => {
      const sidebar = flatten(t.palette.background.sidebar, surfaces(t).page)
      return flatten(t.palette.action.hover, sidebar)
    },
    backgrounds: (t, page) => {
      const sidebar = flatten(t.palette.background.sidebar, page)
      return [flatten(t.palette.getContrastText(sidebar), sidebar)]
    },
  },
  {
    key: "selectedText",
    labelKey: "theme.contrastSelectedText",
    fallback: "Selected text on Selected background",
    kind: "text",
    path: ["palette", "text", "selected"],
    value: (t) => t.palette.text.selected,
    backgrounds: (t, page, paper) => [
      ...selectedFills(t, page, paper),
      paper,
      page,
    ],
  },
  {
    key: "selectedVsHover",
    labelKey: "theme.contrastSelectedVsHover",
    fallback: "Selected indicator against Menu & list hover",
    kind: "ui",
    path: ["palette", "text", "selected"],
    value: (t) => t.palette.text.selected,
    backgrounds: hoverFills,
    // A selected row is told from a hovered one by its indicator, or by
    // its fill when that alone differs from the hover fill by 3:1
    passesAnyway: (t, page, paper) => {
      const hovers = hoverFills(t, page, paper)
      return selectedFills(t, page, paper).every(
        (fill, i) => contrast(fill, hovers[i]) >= AA_UI,
      )
    },
  },
  {
    key: "disabledText",
    labelKey: "theme.contrastDisabledText",
    fallback: "Disabled text on the page and Paper",
    kind: "disabled",
    path: ["palette", "text", "disabled"],
    value: (t) => t.palette.text.disabled,
    backgrounds: onSurfaces,
  },
  {
    key: "focus",
    labelKey: "theme.contrastFocus",
    fallback: "Focus ring on the page and Paper",
    kind: "ui",
    path: ["palette", "common", "focus"],
    value: (t) => t.palette.common.focus,
    backgrounds: onSurfaces,
  },
  {
    key: "controlBorder",
    labelKey: "theme.contrastControlBorder",
    fallback: "Control borders on the page and Paper",
    kind: "ui",
    path: ["palette", "outline", "strong"],
    value: (t) => t.palette.outline.strong,
    backgrounds: onSurfaces,
  },
]

/** The checks for one mode of an editor theme; [] when it can't be built. */
export function themeContrastChecks(
  modeData: ThemeModeData,
  mode: "light" | "dark",
): ContrastCheck[] {
  try {
    const sanitized = sanitizeThemeData(modeData) as ThemeModeData
    const theme = buildOrgTheme({ light: sanitized, dark: sanitized }, mode)
    const { page, paper } = surfaces(theme)
    return PAIRS.map((pair) => {
      const raw = pair.value(theme)
      const bgs = pair.backgrounds(theme, page, paper)
      const fg = flatten(raw, bgs[0])
      const ratios = bgs.map((bg) => contrast(fg, bg))
      const ratio = Math.min(...ratios)
      const min = pair.kind === "text" ? AA_TEXT : AA_UI
      const pass =
        ratio >= min || (pair.passesAnyway?.(theme, page, paper) ?? false)
      const worstBg = bgs[ratios.indexOf(ratio)]
      return {
        key: pair.key,
        labelKey: pair.labelKey,
        fallback: pair.fallback,
        kind: pair.kind,
        min,
        fg: toHex(pair.isBackground ? worstBg : fg),
        bg: toHex(pair.isBackground ? fg : worstBg),
        ratio,
        pass,
        path: pair.path,
        auto: getNestedValue(modeData, pair.path) === undefined,
        fix: pass ? null : nudgeToContrast(fg, bgs, min),
      }
    })
  } catch {
    return []
  }
}

/** Every failing check of both modes, for the save warning. */
export function failingContrastChecks(themeData: {
  light: ThemeModeData
  dark: ThemeModeData
}): { mode: "light" | "dark"; check: ContrastCheck }[] {
  return (["dark", "light"] as const).flatMap((mode) =>
    themeContrastChecks(themeData[mode], mode)
      .filter((check) => !check.pass)
      .map((check) => ({ mode, check })),
  )
}

/** A ratio as WCAG writes it, rounded down so 4.47 never shows as 4.5. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100) / 100).toFixed(2)
}
