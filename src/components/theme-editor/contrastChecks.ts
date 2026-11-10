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
 * roles.ts): text at 4.5:1 (1.4.3), borders and the focus ring at 3:1
 * (1.4.11). The editor shows each as a pass/fail badge, offers the nearest
 * passing colour, and asks before saving a failing theme.
 */
export interface ContrastCheck {
  key: string
  labelKey: string
  fallback: string
  /** "text": 4.5:1, "ui": 3:1 */
  kind: "text" | "ui"
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

interface Pair {
  key: string
  labelKey: string
  fallback: string
  kind: "text" | "ui"
  path: string[]
  /** The token as it renders */
  value: (theme: Theme) => string
  /** The backgrounds it sits on (solid) */
  backgrounds: (theme: Theme, page: string, paper: string) => string[]
  /** The token is the background (a hover fill): swap them for display */
  isBackground?: boolean
}

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
      const pass = ratio >= min
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
