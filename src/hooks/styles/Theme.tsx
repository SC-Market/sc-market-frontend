import {
  createTheme,
  responsiveFontSizes,
  Theme,
  ThemeOptions,
  Paper,
  PaperProps,
} from "@mui/material"
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
    layout: number // Between top-level components (market listings, sections)
    component: number // Inside cards/papers (between form fields, content sections)
    text: number // Between text elements, small components
    compact: number // Very tight spacing (icon groups, badges)
  }

  interface BorderRadius {
    topLevel: number // Cards, Papers, major components
    image: number // Image previews, media containers
    button: number // Buttons, chips, interactive elements
    input: number // Text fields, inputs
    minimal: number // Dividers, minimal elements
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

export const makeCut = (radius: string, theme?: ExtendedTheme) => ({
  clipPath: `polygon(${radius} 0, 100% 0, 100% calc(100% - ${radius}), calc(100% - ${radius}) 100%, 0 100%, 0 ${radius})`,
  // boxSizing: 'border-box',
  // filter: `drop-shadow( 0px  1px 0 ${theme.palette.outline.main}) drop-shadow( 0px -1px 0 ${theme.palette.outline.main}) drop-shadow( 1px  0px 0 ${theme.palette.outline.main}) drop-shadow(-1px  0px 0 ${theme.palette.outline.main})`
})

export const makeReverseCut = (radius: string, theme?: ExtendedTheme) => ({
  clipPath: `polygon(${radius} 0, 100% 0, 100% calc(100% - ${radius}), calc(100% - ${radius}) 100%, 0 100%, 0 ${radius})`,
  boxSizing: "border-box" as const,
  filter: `drop-shadow( 0px  1px 0 ${theme?.palette?.outline?.main}) drop-shadow( 0px -1px 0 ${theme?.palette?.outline?.main}) drop-shadow( 1px  0px 0 ${theme?.palette?.outline?.main}) drop-shadow(-1px  0px 0 ${theme?.palette?.outline?.main})`,
})

export type ExtendedTheme = Theme

type ExtendedThemeOptions = ThemeOptions

const mainOutline = "rgb(45,55,72)"
export const refTheme = createTheme()

// Standardized spacing system
const defaultLayoutSpacing: ExtendedThemeOptions["layoutSpacing"] = {
  layout: 1, // Between top-level components (market listings, sections, major cards) - reduced from 2
  component: 1.5, // Inside cards/papers (between form fields, content sections)
  text: 1, // Between text elements, small components
  compact: 0.5, // Very tight spacing (icon groups, badges, chips)
}

// Standardized border radius system (values are spacing multipliers)
// Note: theme.spacing(0.375) = 3px (old borderRadius: 3), theme.spacing(1) = 8px
const defaultBorderRadius: ExtendedThemeOptions["borderRadius"] = {
  topLevel: 0.375, // Cards, Papers, major components - use theme.spacing(theme.borderRadius.topLevel) = 3px
  image: 0.375, // Image previews, media containers - use theme.spacing(theme.borderRadius.image) = 3px
  button: 1, // Buttons, chips, interactive elements - use theme.spacing(theme.borderRadius.button) = 8px
  input: 0.5, // Text fields, inputs - use theme.spacing(theme.borderRadius.input) = 4px
  minimal: 0, // Dividers, minimal elements - use theme.spacing(theme.borderRadius.minimal) = 0px
}

// @ts-ignore
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
      fontFamily: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
    },
  },
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        fontFamily: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            fontFamily: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
            borderRadius: theme.spacing(extTheme.borderRadius.button),
          }
        },
        text: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            fontFamily: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
            borderRadius: theme.spacing(extTheme.borderRadius.button),
          }
        },
        // same for other variants
        contained: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            borderRadius: theme.spacing(extTheme.borderRadius.button),
            // ...makeReverseCut('12px'),
            // ...makeCut('12px'),
          }
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // scrollbarColor: "#6b6b6b #2b2b2b",
          scrollbarGutter: "stable",
          "*::-webkit-scrollbar": {
            // width: '0.4em',
            // width: 'none',
            display: "none",
            scrollbarWidth: "none" /* Firefox */,
          },
          "*::-webkit-scrollbar-track": {
            WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(100,100,100,.2)",
            // outline: '1px solid slategrey'
          },
          "*::-webkit-scrollbar-corner": { backgroundColor: "transparent" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // borderColor: mainOutline,
          // '& fieldset': {
          //     borderColor: mainOutline,
          //     color: "rgba(255, 255, 255, 0.75)",
          // },
          // '& fieldset:disabled': {
          //     borderColor: mainOutline,
          //     color: "rgba(255, 255, 255, 0.75)",
          // },
          // '& input:disabled': {
          //     borderColor: mainOutline,
          //     color: "rgba(255, 255, 255, 0.75)",
          // },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          borderColor: "outline.main",
          color: "outline.main",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1900,
    },
  },
}

export const mainThemeOptions: ExtendedThemeOptions = {
  palette: {
    // 27354a
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#10b881" } }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#7a7efe",
        contrastText: "#111828",
        // light: '#79018C'
      },
    }),
    // error: {
    //     main: '#d54242'
    // },
    text: {
      primary: "#b7b7b7",
      secondary: "#e8e8e8",
      disabled: "#EEEEEEC0",
    },
    DataGrid: {
      bg: "transparent",
      pinnedBg: "transparent",
      headerBg: "transparent",
    },
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "#0b0f1a",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "#111828",
      sidebar: "#111828",
      navbar: "#111828",
      light: "#FFF",
      overlay: "rgba(0, 0, 0, 0.5)",
      overlayDark: "rgba(0, 0, 0, 0.7)",
      imageOverlay: "rgba(0, 0, 0, 0.8)",
      imageOverlayHover: "rgba(0, 0, 0, 0.9)",
    },
    outline: {
      main: mainOutline,
    },
    action: {
      hover: "rgba(36, 41, 58, 0.43)",
    },
    common: {
      subheader: "#929ca1",
      focus: "#1976d2",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  navKind: "outlined",
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          "--DataGrid-containerBackground":
            "var(--mui-palette-background-paper)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          border: `1px solid ${mainOutline}`,
        },
        root: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            borderRadius: theme.spacing(extTheme.borderRadius.topLevel),
          }
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            border: `1px solid ${mainOutline}`,
            borderRadius: theme.spacing(extTheme.borderRadius.topLevel),
          }
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: mainOutline,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: mainOutline,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiInputAdornment: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disablePortal: true,
        },
      },
      styleOverrides: {
        icon: {
          color: "inherit",
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        disablePortal: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // scrollbarColor: "#6b6b6b #2b2b2b",
          backgroundColor: "#0b0f1a",
        },
        "*:focus": {
          outlineColor: "var(--mui-palette-common-focus, #1976d2)",
        },
      },
    },
  },
}

export const mainTheme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions),
)

export const lightThemeOptions: ExtendedThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#10b881",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#4e36f5", // "#7a7efe",
      },
    }),
    outline: {
      main: "rgba(0, 0, 0, 0.12)",
    },
    // error: {
    //     main: '#d54242'
    // },
    text: {
      primary: "#000000AA",
      secondary: "#000000",
      disabled: "#EEEEEEC0",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
      navbar: "#FFFFFF",
      sidebar: "#101827",
      overlay: "rgba(0, 0, 0, 0.5)",
      overlayDark: "rgba(0, 0, 0, 0.7)",
      imageOverlay: "rgba(0, 0, 0, 0.6)",
      imageOverlayHover: "rgba(0, 0, 0, 0.8)",
    },
    action: {
      hover: "rgba(0, 0, 0, 0.04)",
    },
    common: {
      subheader: "rgba(0, 0, 0, 0.6)",
      focus: "#1976d2",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  navKind: "outlined",
  components: {
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          boxShadow:
            "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        // @ts-ignore
        outlined: {
          boxShadow:
            "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(0, 0, 0, 0.12)",
          "&::before, &::after": {
            borderColor: "rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // scrollbarColor: "#6b6b6b #2b2b2b",
          // backgroundColor: "#eeeff2",
        },
      },
    },
  },
}

export const lightTheme = responsiveFontSizes(
  createTheme(themeBase, lightThemeOptions),
)

export const MISSING_IMAGE_URL =
  "https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp"
