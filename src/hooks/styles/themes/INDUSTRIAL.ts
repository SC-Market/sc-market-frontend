import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const industrialThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#FFC107", // Vibrant yellow for industrial accents
        contrastText: "#000000",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#4A90E2", // Steel blue
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#E8E8E8",
      secondary: "#B8B8B8",
      disabled: "#666666",
    },
    background: {
      default: "#1A1A1A", // Deep charcoal
      paper: "#2A2A2A", // Slightly lighter charcoal
      sidebar: "#252525", // Medium gray
      navbar: "#252525",
      light: "#FFFFFF",
      overlay: "rgba(0, 0, 0, 0.6)",
      overlayDark: "rgba(0, 0, 0, 0.8)",
      imageOverlay: "rgba(0, 0, 0, 0.85)",
      imageOverlayHover: "rgba(0, 0, 0, 0.95)",
    },
    outline: {
      main: "rgba(255, 193, 7, 0.3)", // Yellow outline with transparency
    },
    action: {
      hover: "rgba(255, 193, 7, 0.15)", // Yellow hover with low opacity
    },
    common: {
      subheader: "#888888",
      focus: "#FFC107",
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
          border: "1px solid rgba(255, 193, 7, 0.3)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 193, 7, 0.3)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: "rgba(255, 193, 7, 0.3)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(255, 193, 7, 0.3)",
        },
      },
    },
  },
}

export const INDUSTRIAL_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, industrialThemeOptions),
)
