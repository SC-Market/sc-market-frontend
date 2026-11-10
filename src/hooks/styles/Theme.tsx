/**
 * Theme barrel – re-exports from the modular theme package.
 * Import from here for backward compatibility.
 */
export {
  makeCut,
  makeReverseCut,
  getNavbarContrastText,
  refTheme,
  themeBase,
  mainThemeOptions,
  mainTheme,
  lightThemeOptions,
  lightTheme,
  createAppTheme,
  MISSING_IMAGE_URL,
  cardFadeGradient,
  bannerFadeGradient,
  linkColor,
  navbarShadow,
  primaryFill,
  primaryFillHover,
} from "./theme/index"

export type { ExtendedTheme } from "./theme/index"
