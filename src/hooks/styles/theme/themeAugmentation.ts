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

  /** The theme's font families (./fonts.ts). */
  interface TypographyVariants {
    fontFamilyHeading: string
    fontFamilyBody: string
  }

  interface TypographyVariantsOptions {
    fontFamilyHeading?: string
    fontFamilyBody?: string
  }

  interface TypeText {
    subtle: string
    /**
     * Accent text on surfaces: links, tabs, accent icons and indicators.
     * Derived from the brand colour at 4.5:1 unless a theme sets it
     * (./roles.ts). At runtime `primary.main` carries the same colour.
     */
    accent: string
    /**
     * The label and indicator (rail, underline, ring) of a selected item:
     * nav and list rows, menu items, active tabs, toggled chips and
     * buttons, selected table rows. 4.5:1 on the selected fill
     * (action.selected) and the surfaces, and 3:1 against the hover fill
     * unless the selected fill already differs from it by 3:1. Derived from
     * text.accent unless a theme sets it (./roles.ts).
     */
    selected: string
  }

  interface PaletteColor {
    /**
     * The saved brand colour of a filled control (contained buttons, filled
     * chips, badges), when `main` was moved to reach AA as text
     * (./roles.ts). Read it through primaryFill().
     */
    fill?: string
  }

  interface SimplePaletteColorOptions {
    fill?: string
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
