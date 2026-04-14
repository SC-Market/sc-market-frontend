import type { Theme } from "@mui/material"

export type ExtendedTheme = Theme

/**
 * Contrast text for icons/typography on the app navbar background.
 * MUI's getContrastText throws (production error #9) for transparent, gradients, and url() backgrounds.
 */
export function getNavbarContrastText(theme: Theme): string {
  const nav = theme.palette.background.navbar
  if (typeof nav !== "string") {
    return theme.palette.text.primary
  }
  const s = nav.trim().toLowerCase()
  if (
    s === "transparent" ||
    s.startsWith("linear-gradient") ||
    s.startsWith("radial-gradient") ||
    s.startsWith("url(")
  ) {
    return theme.palette.getContrastText(theme.palette.background.default)
  }
  return theme.palette.getContrastText(nav)
}

export const makeCut = (radius: string, _theme?: ExtendedTheme) => ({
  clipPath: `polygon(${radius} 0, 100% 0, 100% calc(100% - ${radius}), calc(100% - ${radius}) 100%, 0 100%, 0 ${radius})`,
})

export const makeReverseCut = (radius: string, theme?: ExtendedTheme) => ({
  clipPath: `polygon(${radius} 0, 100% 0, 100% calc(100% - ${radius}), calc(100% - ${radius}) 100%, 0 100%, 0 ${radius})`,
  boxSizing: "border-box" as const,
  filter: `drop-shadow( 0px  1px 0 ${theme?.palette?.outline?.main}) drop-shadow( 0px -1px 0 ${theme?.palette?.outline?.main}) drop-shadow( 1px  0px 0 ${theme?.palette?.outline?.main}) drop-shadow(-1px  0px 0 ${theme?.palette?.outline?.main})`,
})
