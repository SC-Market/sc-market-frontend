import { createTheme, responsiveFontSizes } from "@mui/material"
import { refTheme, mainOutline } from "./constants"
import { themeBase } from "./baseTheme"
import type { ExtendedTheme } from "./utils"
import type { ExtendedThemeOptions } from "./constants"

export const mainThemeOptions: ExtendedThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#10b881" } }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#7a7efe",
        contrastText: "#111828",
      },
    }),
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
      default: "#0b0f1a",
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
