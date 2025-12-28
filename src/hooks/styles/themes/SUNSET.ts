import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
} from "../Theme"

export const sunsetThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#FF6F00", // Warm orange
        contrastText: "#FFFFFF",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#E91E63", // Pink
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#5D4037", // Brown-gray
      secondary: "#8D6E63",
      disabled: "#BCAAA4",
    },
    background: {
      default: "#FFF3E0", // Warm cream
      paper: "#FFFFFF",
      sidebar: "#FFE0B2", // Light orange
      navbar: "#FFFFFF",
      light: "#FFFFFF",
      overlay: "rgba(255, 111, 0, 0.4)",
      overlayDark: "rgba(255, 111, 0, 0.6)",
      imageOverlay: "rgba(255, 111, 0, 0.5)",
      imageOverlayHover: "rgba(255, 111, 0, 0.7)",
    },
    outline: {
      main: "rgba(255, 111, 0, 0.3)", // Orange outline
    },
    action: {
      hover: "rgba(255, 111, 0, 0.1)", // Light orange hover
    },
    common: {
      subheader: "#E64A19", // Deep orange-red for subheaders
      focus: "#FF6F00",
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
          border: "1px solid rgba(255, 111, 0, 0.3)",
          boxShadow:
            "rgba(255, 111, 0, 0.1) 0px 0px 2px 0px, rgba(255, 111, 0, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 111, 0, 0.3)",
          boxShadow:
            "rgba(255, 111, 0, 0.1) 0px 0px 2px 0px, rgba(255, 111, 0, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(255, 111, 0, 0.2)",
          "&::before, &::after": {
            borderColor: "rgba(255, 111, 0, 0.2)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(255, 111, 0, 0.2)",
        },
      },
    },
  },
}

export const SUNSET_theme = responsiveFontSizes(
  createTheme(
    themeBase,
    mainThemeOptions,
    lightThemeOptions,
    sunsetThemeOptions,
  ),
)
