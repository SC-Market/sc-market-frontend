import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const cyberpunkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#00FF41", // Neon green
        contrastText: "#000000",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#FF00FF", // Neon magenta
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#00FF41", // Neon green text
      secondary: "#00D9FF", // Cyan
      disabled: "#666666",
    },
    background: {
      default: "#0A0A0A", // Almost black
      paper: "#1A1A1A", // Dark gray
      sidebar: "#151515", // Slightly lighter
      navbar: "#151515",
      light: "#FFFFFF",
      overlay: "rgba(0, 255, 65, 0.2)",
      overlayDark: "rgba(0, 255, 65, 0.4)",
      imageOverlay: "rgba(0, 0, 0, 0.85)",
      imageOverlayHover: "rgba(0, 0, 0, 0.95)",
    },
    outline: {
      main: "rgba(0, 255, 65, 0.5)", // Neon green outline
    },
    action: {
      hover: "rgba(0, 255, 65, 0.2)", // Neon green hover
    },
    common: {
      subheader: "#00D9FF", // Cyan for subheaders
      focus: "#00FF41",
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
          border: "1px solid rgba(0, 255, 65, 0.5)",
          boxShadow: "0 0 10px rgba(0, 255, 65, 0.3)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(0, 255, 65, 0.5)",
          boxShadow: "0 0 10px rgba(0, 255, 65, 0.3)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: "rgba(0, 255, 65, 0.5)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(0, 255, 65, 0.5)",
        },
      },
    },
  },
}

export const CYBERPUNK_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, cyberpunkThemeOptions),
)
