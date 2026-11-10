// Load MUI theme augmentations so ExtendedTheme and palette extensions are available
import "./themeAugmentation"

export {
  mainOutline,
  refTheme,
  breakpointsValues,
  MISSING_IMAGE_URL,
  defaultLayoutSpacing,
  defaultBorderRadius,
  defaultBorderWidth,
} from "./constants"
export type { ExtendedThemeOptions } from "./constants"

export type { ExtendedTheme } from "./utils"
export { makeCut, makeReverseCut, getNavbarContrastText } from "./utils"
export {
  cardFadeGradient,
  bannerFadeGradient,
  linkColor,
  navbarShadow,
} from "./themeUtils"

export { themeBase } from "./baseTheme"
export { FONT_FAMILY_BODY, FONT_FAMILY_HEADING, NUMERIC_SX } from "./fonts"
export { getBaseComponentOverrides } from "./baseComponentOverrides"

export { mainThemeOptions, mainTheme } from "./mainTheme"
export { lightThemeOptions, lightTheme } from "./lightTheme"
export { createAppTheme } from "./createAppTheme"
export { primaryFill, primaryFillHover } from "./roles"
export { TAG_HUES, TAG_MEANINGS, TAG_TONES, getTagPalette } from "./tagPalette"
export type {
  TagColor,
  TagHue,
  TagMeaning,
  TagPalette,
  TagTone,
} from "./tagPalette"
