import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const natureDarkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#81C784", // Light green for dark nature theme
        contrastText: "#000000",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#66BB6A", // Medium green
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#E8F5E9", // Very light green-tinted white
      secondary: "#C8E6C9", // Light green-gray
      disabled: "#81C784",
    },
    background: {
      default: "#1B2E1F", // Deep forest green
      paper: "#263829", // Slightly lighter forest green
      sidebar: "#233326", // Medium dark green
      navbar: "#233326",
      light: "#FFFFFF",
      overlay: "rgba(0, 0, 0, 0.6)",
      overlayDark: "rgba(0, 0, 0, 0.8)",
      imageOverlay: "rgba(0, 0, 0, 0.85)",
      imageOverlayHover: "rgba(0, 0, 0, 0.95)",
    },
    outline: {
      main: "rgba(129, 199, 132, 0.3)", // Light green outline
    },
    action: {
      hover: "rgba(129, 199, 132, 0.15)", // Light green hover
    },
    common: {
      subheader: "#81C784",
      focus: "#81C784",
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
          border: "1px solid rgba(129, 199, 132, 0.3)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(129, 199, 132, 0.3)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: "rgba(129, 199, 132, 0.3)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(129, 199, 132, 0.3)",
        },
      },
    },
  },
}

export const NATURE_DARK_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, natureDarkThemeOptions),
)
