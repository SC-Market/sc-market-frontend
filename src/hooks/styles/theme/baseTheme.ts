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
    // The one Discord colour: official blurple. White text is 4.61:1 on
    // main and 6.42:1 on the hover (dark) shade.
    discord: {
      main: "#5865F2",
      light: "#7983F5",
      dark: "#4752C4",
      contrastText: "#FFFFFF",
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
