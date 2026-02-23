import type {} from "@mui/x-data-grid/themeAugmentation"

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    xxl: true
  }

  interface TypeBackground {
    navbar: string
    sidebar: string
    light: string
    overlay: string
    overlayDark: string
    imageOverlay: string
    imageOverlayHover: string
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
    minimal: number
  }

  interface Palette {
    discord: Palette["primary"]
    outline: Palette["primary"]
  }

  interface PaletteOptions {
    discord?: PaletteOptions["primary"]
    outline?: PaletteOptions["primary"]
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
  }
}
