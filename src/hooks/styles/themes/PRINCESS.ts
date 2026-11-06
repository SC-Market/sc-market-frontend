import { ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
  createAppTheme,
} from "../Theme"

export const princessThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: { main: "#F48FB1", contrastText: "#FFFFFF" },
    }),
    // One accent. `demand` marks the buy side: the old second accent
    // #80CBC4, moved to reach AA as text. The neutral (secondary) comes
    // from the base theme.
    demand: refTheme.palette.augmentColor({ color: { main: "#2A716B" } }),
    premium: refTheme.palette.augmentColor({ color: { main: "#2A716B" } }),
    text: { primary: "#2A1A28", secondary: "#6E4A6E", disabled: "#C0A0C0" },
    background: {
      default: "#FFF5F9",
      paper: "#F6F2FB",
      sidebar: "#DDE8F4",
      navbar: "#DDE8F4",
      light: "#FFFFFF",
      overlay: "rgba(244,143,177,0.15)",
      overlayDark: "rgba(244,143,177,0.3)",
      imageOverlay: "rgba(244,143,177,0.4)",
      imageOverlayHover: "rgba(244,143,177,0.6)",
    },
    outline: { main: "rgba(184,212,232,0.5)" },
    divider: "rgba(184,212,232,0.5)",
    action: { hover: "rgba(244,143,177,0.1)" },
    common: {
      subheader: "#6E4A6E",
      // 3:1 or better on paper and the page (the accent itself is lighter)
      focus: "#B0346A",
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
          border: "1px solid rgba(184,212,232,0.5)",
          boxShadow:
            "rgba(200,140,200,0.06) 0px 0px 2px 0px, rgba(200,140,200,0.04) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { border: "1px solid rgba(184,212,232,0.5)" } },
    },
    MuiDivider: {
      styleOverrides: { light: { backgroundColor: "rgba(184,212,232,0.3)" } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottomColor: "rgba(184,212,232,0.3)" } },
    },
  },
}

export const PRINCESS_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  lightThemeOptions,
  princessThemeOptions,
)
