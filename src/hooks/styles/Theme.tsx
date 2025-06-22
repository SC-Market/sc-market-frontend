import {
  createTheme,
  responsiveFontSizes,
  Theme,
  ThemeOptions,
} from "@mui/material"

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    xxl: true
  }

  interface Palette {
    discord: Palette["primary"]
    outline: Palette["primary"]
  }

  interface PaletteOptions {
    discord?: PaletteOptions["primary"]
    outline?: PaletteOptions["primary"]
  }

  interface TypeBackground {
    navbar: string
    sidebar: string
    light: string
  }

  interface ThemeOptions {
    navKind?: "elevation" | "outlined"
  }

  interface Theme {
    navKind?: "elevation" | "outlined"
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

// @ts-ignore
export const themeBase: ExtendedThemeOptions = {
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
        outlined: {
          fontFamily: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
        },
        text: {
          fontFamily: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
        },
        // same for other variants
        contained: {
          // ...makeReverseCut('12px'),
          // ...makeCut('12px'),
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
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "#0b0f1a",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "#111828",
      sidebar: "#111828",
      navbar: "#111828",
      light: "#FFF",
    },
    outline: {
      main: mainOutline,
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
          border: `1px solid ${mainOutline}`,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: `1px solid ${mainOutline}`,
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
      styleOverrides: {
        icon: {
          color: "inherit",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // scrollbarColor: "#6b6b6b #2b2b2b",
          backgroundColor: "#0b0f1a",
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
  "https://media.discordapp.net/attachments/690989503397101678/1072360279091978240/placeholder-image-square.jpeg"
