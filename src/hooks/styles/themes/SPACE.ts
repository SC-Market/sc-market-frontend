import { ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase, createAppTheme } from "../Theme"

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
    // Two-tone on purpose: the second hue stays on neutral (secondary-role)
    // controls and marks the buy side (green-only accent, 2026-11).
    neutral: refTheme.palette.augmentColor({ color: { main: "#4D9BE8" } }),
    demand: refTheme.palette.augmentColor({ color: { main: "#4D9BE8" } }),
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
      // control borders, 3:1 on paper and the page
      strong: "#7a6f9e",
    },
    divider: "rgba(123, 31, 162, 0.4)",
    action: {
      hover: "rgba(123, 31, 162, 0.2)", // Purple hover
    },
    common: {
      subheader: "#BA68C8", // Medium purple for subheaders
      // 3:1 or better on paper and the page (the accent itself is lighter)
      focus: "#B388FF",
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

export const SPACE_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  spaceThemeOptions,
)
