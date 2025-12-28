import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const spaceThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#7B1FA2", // Deep purple
        contrastText: "#FFFFFF",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#1976D2", // Deep blue
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#E1BEE7", // Light purple
      secondary: "#B39DDB",
      disabled: "#9575CD",
    },
    background: {
      default: "#0D0D1A", // Very dark blue-purple
      paper: "#1A1A2E", // Dark purple-blue
      sidebar: "#16213E", // Dark blue
      navbar: "#16213E",
      light: "#FFFFFF",
      overlay: "rgba(0, 0, 0, 0.6)",
      overlayDark: "rgba(0, 0, 0, 0.8)",
      imageOverlay: "rgba(0, 0, 0, 0.85)",
      imageOverlayHover: "rgba(0, 0, 0, 0.95)",
    },
    outline: {
      main: "rgba(123, 31, 162, 0.4)", // Purple outline
    },
    action: {
      hover: "rgba(123, 31, 162, 0.2)", // Purple hover
    },
    common: {
      subheader: "#BA68C8", // Medium purple for subheaders
      focus: "#7B1FA2",
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
          border: "1px solid rgba(123, 31, 162, 0.4)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(123, 31, 162, 0.4)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: "rgba(123, 31, 162, 0.4)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(123, 31, 162, 0.4)",
        },
      },
    },
  },
}

export const SPACE_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, spaceThemeOptions),
)
