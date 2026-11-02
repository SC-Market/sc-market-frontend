import {
  createTheme,
  responsiveFontSizes,
  type Theme,
  type ThemeOptions,
} from "@mui/material"
import { deepmerge } from "@mui/utils"
import { applyContrastFloors } from "./contrast"

/**
 * Build a theme from layered options (base, then main/light, then a theme's
 * own). Every theme goes through here.
 *
 * MUI's createTheme(options, ...args) builds the palette from the first
 * argument only and deep-merges the rest into the finished theme. Our
 * `mode: "dark"` lives in a later layer, so it never reached createPalette
 * and dark themes kept the light-mode action (black disabled/active/selected/
 * focus), error, warning, info and success colours. Merging the layers first
 * lets MUI derive the whole palette for the final mode.
 */
export function createAppTheme(...layers: (ThemeOptions | undefined)[]): Theme {
  const options = layers.reduce<ThemeOptions>(
    (merged, layer) => (layer ? deepmerge(merged, layer) : merged),
    {},
  )
  return responsiveFontSizes(applyContrastFloors(createTheme(options)))
}
