import { createTheme, responsiveFontSizes } from "@mui/material"
import { refTheme } from "./constants"
import { themeBase } from "./baseTheme"
import type { ExtendedThemeOptions } from "./constants"

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
        main: "#4e36f5",
      },
    }),
    outline: {
      main: "rgba(0, 0, 0, 0.12)",
    },
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
        // MUI Card accepts outlined variant at runtime; types are incomplete
        // @ts-expect-error - outlined variant style override
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
        html: {},
      },
    },
  },
}

export const lightTheme = responsiveFontSizes(
  createTheme(themeBase, lightThemeOptions),
)
