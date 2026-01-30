// Load MUI theme augmentations so ExtendedTheme and palette extensions are available
import "./themeAugmentation"

export {
  mainOutline,
  refTheme,
  breakpointsValues,
  MISSING_IMAGE_URL,
  defaultLayoutSpacing,
  defaultBorderRadius,
} from "./constants"
export type { ExtendedThemeOptions } from "./constants"

export type { ExtendedTheme } from "./utils"
export { makeCut, makeReverseCut } from "./utils"

export { themeBase } from "./baseTheme"
export { getBaseComponentOverrides } from "./baseComponentOverrides"

export { mainThemeOptions, mainTheme } from "./mainTheme"
export { lightThemeOptions, lightTheme } from "./lightTheme"
