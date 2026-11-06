import type {} from "@mui/x-data-grid/themeAugmentation"

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

  /** Borders: `main` is the hairline, `strong` the 3:1 control border. */
  interface OutlineColor {
    main: string
    strong: string
  }

  interface Palette {
    discord: Palette["primary"]
    outline: OutlineColor
    /** The buy side (bids, buy orders). Not an accent. */
    demand: Palette["primary"]
    /** Neutral controls: secondary buttons, outlined chips. */
    neutral: Palette["primary"]
    /** Premium and supporter badges. Same value as demand, its own meaning. */
    premium: Palette["primary"]
  }

  interface PaletteOptions {
    discord?: PaletteOptions["primary"]
    outline?: Partial<OutlineColor>
    demand?: PaletteOptions["primary"]
    neutral?: PaletteOptions["primary"]
    premium?: PaletteOptions["primary"]
  }

  interface ThemeOptions {
    navKind?: "elevation" | "outlined"
    layoutSpacing?: Partial<LayoutSpacing>
    borderRadius?: Partial<BorderRadius>
  }

  interface Theme {
    navKind?: "elevation" | "outlined"
    layoutSpacing: LayoutSpacing
    borderRadius: BorderRadius
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    discord: true
    neutral: true
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    demand: true
    premium: true
  }
}
