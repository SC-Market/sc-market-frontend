import { ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
  createAppTheme,
} from "../Theme"

export const originThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: { main: "#C8A84E", contrastText: "#FFFFFF" },
    }),
    // One accent. `demand` marks the buy side: the old second accent
    // #8A7030, moved to reach AA as text. The neutral (secondary) comes
    // from the base theme.
    demand: refTheme.palette.augmentColor({ color: { main: "#75602A" } }),
    premium: refTheme.palette.augmentColor({ color: { main: "#75602A" } }),
    text: { primary: "#2A2418", secondary: "#6A5E40", disabled: "#B0A880" },
    background: {
      default: "#FFFDF6",
      paper: "#F0ECE2",
      sidebar: "#E8E2D4",
      navbar: "#E8E2D4",
      light: "#FFFFFF",
      overlay: "rgba(200,168,78,0.15)",
      overlayDark: "rgba(200,168,78,0.3)",
      imageOverlay: "rgba(200,168,78,0.4)",
      imageOverlayHover: "rgba(200,168,78,0.6)",
    },
    outline: { main: "rgba(200,168,78,0.3)" },
    divider: "rgba(200,168,78,0.3)",
    action: { hover: "rgba(200,168,78,0.1)" },
    common: {
      subheader: "#8A7030",
      // 3:1 or better on paper and the page (the accent itself is lighter)
      focus: "#75602A",
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
          border: "1px solid rgba(200,168,78,0.3)",
          boxShadow:
            "rgba(60,40,0,0.06) 0px 0px 2px 0px, rgba(60,40,0,0.04) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { border: "1px solid rgba(200,168,78,0.3)" } },
    },
    MuiDivider: {
      styleOverrides: { light: { backgroundColor: "rgba(200,168,78,0.2)" } },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderBottomColor: "rgba(200,168,78,0.2)" } },
    },
  },
}

export const ORIGIN_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  lightThemeOptions,
  originThemeOptions,
)
