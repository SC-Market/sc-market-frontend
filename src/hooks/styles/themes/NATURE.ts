import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
} from "../Theme"

export const natureThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#2D5016", // Deep forest green
        contrastText: "#FFFFFF",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#6B8E23", // Olive green
        contrastText: "#FFFFFF",
      },
    }),
    text: {
      primary: "#2C3E1F", // Dark green-gray
      secondary: "#4A5D2E",
      disabled: "#A0A0A0",
    },
    background: {
      default: "#F5F7F0", // Very light green-tinted white
      paper: "#FFFFFF",
      sidebar: "#F0F4E8", // Light sage green
      navbar: "#FFFFFF",
      light: "#FFFFFF",
      overlay: "rgba(45, 80, 22, 0.4)", // Forest green overlay
      overlayDark: "rgba(45, 80, 22, 0.6)",
      imageOverlay: "rgba(45, 80, 22, 0.5)",
      imageOverlayHover: "rgba(45, 80, 22, 0.7)",
    },
    outline: {
      main: "rgba(107, 142, 35, 0.3)", // Olive green outline
    },
    action: {
      hover: "rgba(107, 142, 35, 0.1)", // Light olive hover
    },
    common: {
      subheader: "#6B7A4F", // Muted green-gray
      focus: "#2D5016",
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
          border: "1px solid rgba(107, 142, 35, 0.3)",
          boxShadow:
            "rgba(107, 142, 35, 0.1) 0px 0px 2px 0px, rgba(107, 142, 35, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(107, 142, 35, 0.3)",
          boxShadow:
            "rgba(107, 142, 35, 0.1) 0px 0px 2px 0px, rgba(107, 142, 35, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(107, 142, 35, 0.2)",
          "&::before, &::after": {
            borderColor: "rgba(107, 142, 35, 0.2)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(107, 142, 35, 0.2)",
        },
      },
    },
  },
}

export const NATURE_theme = responsiveFontSizes(
  createTheme(
    themeBase,
    mainThemeOptions,
    lightThemeOptions,
    natureThemeOptions,
  ),
)
