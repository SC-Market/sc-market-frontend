import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
} from "../Theme"

export const oceanThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#0277BD", // Deep ocean blue
        contrastText: "#FFFFFF",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#00ACC1", // Cyan-teal
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#01579B", // Dark blue
      secondary: "#0277BD",
      disabled: "#90CAF9",
    },
    background: {
      default: "#E0F2F1", // Very light teal
      paper: "#FFFFFF",
      sidebar: "#B2DFDB", // Light teal
      navbar: "#FFFFFF",
      light: "#FFFFFF",
      overlay: "rgba(2, 119, 189, 0.4)",
      overlayDark: "rgba(2, 119, 189, 0.6)",
      imageOverlay: "rgba(2, 119, 189, 0.5)",
      imageOverlayHover: "rgba(2, 119, 189, 0.7)",
    },
    outline: {
      main: "rgba(0, 172, 193, 0.3)", // Cyan outline
    },
    action: {
      hover: "rgba(0, 172, 193, 0.1)", // Light cyan hover
    },
    common: {
      subheader: "#00838F", // Dark teal for subheaders
      focus: "#0277BD",
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
          border: "1px solid rgba(0, 172, 193, 0.3)",
          boxShadow:
            "rgba(0, 172, 193, 0.1) 0px 0px 2px 0px, rgba(0, 172, 193, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(0, 172, 193, 0.3)",
          boxShadow:
            "rgba(0, 172, 193, 0.1) 0px 0px 2px 0px, rgba(0, 172, 193, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(0, 172, 193, 0.2)",
          "&::before, &::after": {
            borderColor: "rgba(0, 172, 193, 0.2)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(0, 172, 193, 0.2)",
        },
      },
    },
  },
}

export const OCEAN_theme = responsiveFontSizes(
  createTheme(
    themeBase,
    mainThemeOptions,
    lightThemeOptions,
    oceanThemeOptions,
  ),
)
