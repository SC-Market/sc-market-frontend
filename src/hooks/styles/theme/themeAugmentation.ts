import type {} from "@mui/x-data-grid/themeAugmentation"
import type { TagPalette } from "./tagPalette"

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    xxl: true
    xxxl: true
  }

  interface TypeBackground {
    navbar: string
    sidebar: string
    light: string
    overlay: string
    overlayDark: string
    imageOverlay: string
    imageOverlayHover: string
    subtleDivider: string
    subtleHover: string
  }

  interface TypeText {
    subtle: string
  }

  interface TypeAction {
    hover: string
  }

  interface CommonColors {
    subheader: string
    focus: string
    badge: {
      gold: string
      silver: string
      bronze: string
      purple: string
    }
  }

  interface LayoutSpacing {
    layout: number
    component: number
    text: number
    compact: number
  }

  interface BorderRadius {
    topLevel: number
    image: number
    button: number
    input: number
    chip: number
    minimal: number
  }

  /**
   * Border widths, in px. `hairline` is every resting border; `emphasis`
   * marks a selected or primary element; `focus` is the keyboard focus ring.
   * Nothing is heavier than 2px, except accent rails (a coloured left edge),
   * which are listed in scm-style/border-width (eslint.config.js).
   */
  interface BorderWidth {
    hairline: number
    emphasis: number
    focus: number
  }

  /** Borders: `main` is the hairline, `strong` the 3:1 control border. */
  interface OutlineColor {
    main: string
    strong: string
  }

  interface Palette {
    discord: Palette["primary"]
    outline: OutlineColor
    /** Neutral controls: secondary-role buttons, outlined chips. */
    neutral: Palette["primary"]
    /**
     * Categorical tag colours, derived per theme (./tagPalette). Read them
     * through components/tags/tagColors, never per call site.
     */
    tag: TagPalette
  }

  interface PaletteOptions {
    discord?: PaletteOptions["primary"]
    outline?: Partial<OutlineColor>
    neutral?: PaletteOptions["primary"]
  }

  interface ThemeOptions {
    navKind?: "elevation" | "outlined"
    layoutSpacing?: Partial<LayoutSpacing>
    borderRadius?: Partial<BorderRadius>
    borderWidth?: Partial<BorderWidth>
  }

  interface Theme {
    navKind?: "elevation" | "outlined"
    layoutSpacing: LayoutSpacing
    borderRadius: BorderRadius
    borderWidth: BorderWidth
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    discord: true
    neutral: true
  }
}
