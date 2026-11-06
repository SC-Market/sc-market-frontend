import type { ThemeOptions } from "@mui/material"

export type ThemeModeData = ThemeOptions & Record<string, unknown>

export interface ColorField {
  key: string
  labelKey: string
  fallback: string
  path: string[]
  /** Short note under the control — where this token is used in the app */
  usageNoteKey?: string
  usageNoteFallback?: string
}

export const COLOR_FIELDS: ColorField[] = [
  {
    key: "primary",
    labelKey: "chromeUi.themeEditor.primary",
    fallback: "Primary",
    path: ["palette", "primary", "main"],
  },
  {
    key: "primaryContrast",
    labelKey: "chromeUi.themeEditor.primaryContrast",
    fallback: "Button Text",
    path: ["palette", "primary", "contrastText"],
  },
  {
    key: "primaryDark",
    labelKey: "chromeUi.themeEditor.primaryDark",
    fallback: "Primary hover (filled buttons)",
    path: ["palette", "primary", "dark"],
    usageNoteKey: "chromeUi.themeEditor.usagePrimaryDark",
    usageNoteFallback:
      "MUI uses this for contained primary buttons on hover, not the “Menu & list hover” color.",
  },
  {
    key: "secondary",
    labelKey: "chromeUi.themeEditor.secondary",
    fallback: "Secondary",
    path: ["palette", "secondary", "main"],
    usageNoteKey: "chromeUi.themeEditor.usageSecondary",
    usageNoteFallback:
      "The buy side and premium: buy order prices, top bids, the bid side of the price chart, and premium and supporter badges.",
  },
  {
    key: "bgDefault",
    labelKey: "chromeUi.themeEditor.bgDefault",
    fallback: "Background",
    path: ["palette", "background", "default"],
  },
  {
    key: "bgPaper",
    labelKey: "chromeUi.themeEditor.bgPaper",
    fallback: "Paper",
    path: ["palette", "background", "paper"],
  },
  {
    key: "bgSidebar",
    labelKey: "chromeUi.themeEditor.bgSidebar",
    fallback: "Sidebar",
    path: ["palette", "background", "sidebar"],
    usageNoteKey: "chromeUi.themeEditor.usageSidebar",
    usageNoteFallback:
      "Dark-mode listing thumbnails and photo-picker surfaces (e.g. SelectPhotosArea) fade toward this color.",
  },
  {
    key: "bgNavbar",
    labelKey: "chromeUi.themeEditor.bgNavbar",
    fallback: "Navbar",
    path: ["palette", "background", "navbar"],
  },
  {
    key: "textPrimary",
    labelKey: "chromeUi.themeEditor.textPrimary",
    fallback: "Text",
    path: ["palette", "text", "primary"],
  },
  {
    key: "textSecondary",
    labelKey: "chromeUi.themeEditor.textSecondary",
    fallback: "Text Secondary",
    path: ["palette", "text", "secondary"],
  },
  {
    key: "outline",
    labelKey: "chromeUi.themeEditor.outline",
    fallback: "Border Color",
    path: ["palette", "outline", "main"],
  },
  {
    key: "actionHover",
    labelKey: "chromeUi.themeEditor.actionHover",
    fallback: "Menu & list hover",
    path: ["palette", "action", "hover"],
    usageNoteKey: "chromeUi.themeEditor.usageActionHover",
    usageNoteFallback:
      "Sidebar rows, menus, autocomplete, and Skeleton “wave”. Not filled primary buttons.",
  },
]

export const BORDER_RADIUS_FIELDS = [
  {
    key: "topLevel",
    labelKey: "chromeUi.themeEditor.borderRadiusTopLevel",
    fallback: "Cards",
    path: ["borderRadius", "topLevel"],
  },
  {
    key: "button",
    labelKey: "chromeUi.themeEditor.borderRadiusButton",
    fallback: "Buttons",
    path: ["borderRadius", "button"],
  },
  {
    key: "chip",
    labelKey: "chromeUi.themeEditor.borderRadiusChip",
    fallback: "Chips",
    path: ["borderRadius", "chip"],
  },
  {
    key: "image",
    labelKey: "chromeUi.themeEditor.borderRadiusImage",
    fallback: "Images",
    path: ["borderRadius", "image"],
  },
]

export function getNestedValue(
  obj: Record<string, unknown>,
  path: string[],
): unknown {
  let current: unknown = obj
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export function setNestedValue(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  const result = { ...obj }
  let current: Record<string, unknown> = result
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = {
      ...((current[path[i]] as Record<string, unknown>) || {}),
    }
    current = current[path[i]] as Record<string, unknown>
  }
  current[path[path.length - 1]] = value
  return result
}

/** Scrim overlays use app defaults; strip so saved theme_data does not keep old custom overlay keys. */
export function stripBackgroundOverlayKeys(themeData: {
  light: Record<string, unknown>
  dark: Record<string, unknown>
}) {
  const clone = {
    light: structuredClone(themeData.light) as Record<string, unknown>,
    dark: structuredClone(themeData.dark) as Record<string, unknown>,
  }
  for (const mode of ["light", "dark"] as const) {
    const palette = clone[mode].palette as Record<string, unknown> | undefined
    if (!palette || typeof palette !== "object") continue
    const bg = palette.background as Record<string, unknown> | undefined
    if (!bg || typeof bg !== "object") continue
    delete bg.overlay
    delete bg.overlayDark
  }
  return clone
}
