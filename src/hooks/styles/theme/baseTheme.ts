import {
  defaultLayoutSpacing,
  defaultBorderRadius,
  defaultBorderWidth,
  breakpointsValues,
  type ExtendedThemeOptions,
} from "./constants"
import { getBaseComponentOverrides } from "./baseComponentOverrides"
import { FONT_FAMILY_BODY, FONT_FAMILY_HEADING } from "./fonts"

// Headings get the heading font. h1 and h2 are 400 rather than MUI's 300:
// Electrolize had no light weight, so 400 is how they have always looked.
const heading = { fontFamily: FONT_FAMILY_HEADING }

export const themeBase: ExtendedThemeOptions = {
  layoutSpacing: defaultLayoutSpacing,
  borderRadius: defaultBorderRadius,
  borderWidth: defaultBorderWidth,
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
    // Body text (Sofia Sans, src/fonts.css). Headings and buttons (and,
    // through them, tabs and toggle buttons) take the heading font (Exo 2).
    fontFamily: FONT_FAMILY_BODY,
    fontFamilyBody: FONT_FAMILY_BODY,
    fontFamilyHeading: FONT_FAMILY_HEADING,
    h1: { ...heading, fontWeight: 400 },
    h2: { ...heading, fontWeight: 400 },
    h3: heading,
    h4: heading,
    h5: heading,
    h6: heading,
    button: heading,
  },
  components: getBaseComponentOverrides(),
  breakpoints: {
    values: breakpointsValues,
  },
}
