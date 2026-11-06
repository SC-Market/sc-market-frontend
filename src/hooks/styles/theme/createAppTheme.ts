import {
  createTheme,
  responsiveFontSizes,
  type Theme,
  type ThemeOptions,
} from "@mui/material"
import { deepmerge } from "@mui/utils"
import { applyContrastFloors } from "./contrast"
import { applyTagPalette } from "./tagPalette"

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
  return responsiveFontSizes(
    applyTagPalette(applyFocusRing(applyContrastFloors(createTheme(options)))),
  )
}

/**
 * The 2px focus ring (src/index.css, and the theme's `*:focus` rule) reads
 * `--mui-palette-common-focus`. The app doesn't use MUI's CSS variables, so
 * nothing defined it and every theme showed the fallback blue. Each built
 * theme now sets it from its own `common.focus`.
 */
function applyFocusRing(theme: Theme): Theme {
  const baseline = theme.components?.MuiCssBaseline
  const overrides = baseline?.styleOverrides
  if (overrides !== undefined && typeof overrides !== "object") return theme
  theme.components = {
    ...theme.components,
    MuiCssBaseline: {
      ...baseline,
      styleOverrides: {
        ...overrides,
        ":root": {
          "--mui-palette-common-focus": theme.palette.common.focus,
        },
      },
    },
  }
  return theme
}
