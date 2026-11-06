import { ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
  createAppTheme,
} from "../Theme"

export const cleanThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: { main: "#1A1A1A", contrastText: "#FFFFFF" },
    }),
    // One accent. `secondary` marks the buy side and premium; the neutral
    // comes from the base theme.
    secondary: refTheme.palette.augmentColor({ color: { main: "#432dd2" } }),
    text: { primary: "#1A1A1A", secondary: "#555555", disabled: "#AAAAAA" },
    background: {
      default: "#FFFFFF",
      paper: "#F4F4F5",
      sidebar: "#FFFFFF",
      navbar: "#FFFFFF",
      light: "#FFFFFF",
      overlay: "rgba(16,184,129,0.1)",
      overlayDark: "rgba(16,184,129,0.2)",
      imageOverlay: "rgba(0,0,0,0.4)",
      imageOverlayHover: "rgba(0,0,0,0.6)",
    },
    outline: { main: "rgba(0,0,0,0.15)" },
    divider: "rgba(0,0,0,0.15)",
    action: { hover: "rgba(0,0,0,0.04)" },
    common: {
      subheader: "#555555",
      // 3:1 or better on paper and the page (the accent itself is lighter)
      focus: "#0b7a56",
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
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        outlined: {
          border: "1px solid rgba(0,0,0,0.15)",
          boxShadow:
            "rgba(145,158,171,0.12) 0px 0px 2px 0px, rgba(145,158,171,0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { border: "1px solid rgba(0,0,0,0.15)" } },
    },
    MuiDivider: {
      styleOverrides: { light: { backgroundColor: "rgba(0,0,0,0.12)" } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottomColor: "rgba(0,0,0,0.12)" } },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        },
      },
    },
  },
}

export const CLEAN_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  lightThemeOptions,
  cleanThemeOptions,
)
