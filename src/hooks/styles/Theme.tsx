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
  MISSING_IMAGE_URL,
  cardFadeGradient,
  bannerFadeGradient,
  radialGlowGradient,
  navbarShadow,
} from "./theme/index"

export type { ExtendedTheme } from "./theme/index"
