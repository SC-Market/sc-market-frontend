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
      // Roboto with Arial fallback (similar metrics) for minimal CLS during font swap
      fontFamily: `"Roboto", Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
    },
  },
  components: getBaseComponentOverrides(),
  breakpoints: {
    values: breakpointsValues,
  },
}
