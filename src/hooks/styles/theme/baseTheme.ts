import {
  defaultLayoutSpacing,
  defaultBorderRadius,
  breakpointsValues,
  type ExtendedThemeOptions,
} from "./constants"
import { getBaseComponentOverrides } from "./baseComponentOverrides"

export const themeBase: ExtendedThemeOptions = {
  layoutSpacing: defaultLayoutSpacing,
  borderRadius: defaultBorderRadius,
  palette: {
    discord: {
      main: "#454FBF",
      contrastText: "#010202",
    },
  },
  typography: {
    allVariants: {
      // Electrolize, then metric-matched fallbacks (src/fonts.css) so its
      // font-display swap doesn't reflow the page
      fontFamily: `var(--sc-custom-font, "Electrolize"), "Electrolize Fallback", "Electrolize Fallback Roboto", "Roboto", Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
    },
  },
  components: getBaseComponentOverrides(),
  breakpoints: {
    values: breakpointsValues,
  },
}
