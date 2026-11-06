import { createTheme, type ThemeOptions } from "@mui/material"

export const mainOutline = "rgb(45,55,72)"

/**
 * The neutral control colour (`palette.neutral`): bright text on dark
 * themes, dark ink on light ones. 11.93:1 on the dark paper, 10.41:1 on
 * white.
 */
export const NEUTRAL_DARK = "#d0d4dc"
export const NEUTRAL_LIGHT = "#3a404c"

export const refTheme = createTheme()

export type ExtendedThemeOptions = ThemeOptions

const defaultLayoutSpacing: NonNullable<ExtendedThemeOptions["layoutSpacing"]> =
  {
    layout: 1,
    component: 1.5,
    text: 1,
    compact: 0.5,
  }

const defaultBorderRadius: NonNullable<ExtendedThemeOptions["borderRadius"]> = {
  topLevel: 0.375,
  image: 0.375,
  button: 1,
  input: 0.5,
  chip: 0.5,
  minimal: 0,
}

const defaultBorderWidth: NonNullable<ExtendedThemeOptions["borderWidth"]> = {
  hairline: 1,
  emphasis: 2,
  focus: 2,
}

export const breakpointsValues = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  xxl: 1900,
  xxxl: 2200,
} as const

export const MISSING_IMAGE_URL =
  "https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp"

export { defaultLayoutSpacing, defaultBorderRadius, defaultBorderWidth }
