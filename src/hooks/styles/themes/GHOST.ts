import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const ghostThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#F0F0F0", contrastText: "#050505" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#888888", contrastText: "#050505" } }),
    text: { primary: "#E0E0E0", secondary: "#808080", disabled: "#404040" },
    background: { default: "#050505", paper: "#0E0E0E", sidebar: "#080808", navbar: "#080808", light: "#FFFFFF", overlay: "rgba(240,240,240,0.08)", overlayDark: "rgba(240,240,240,0.15)", imageOverlay: "rgba(5,5,5,0.85)", imageOverlayHover: "rgba(5,5,5,0.95)" },
    outline: { main: "rgba(240,240,240,0.2)" },
    divider: "rgba(240,240,240,0.2)",
    action: { hover: "rgba(240,240,240,0.08)" },
    common: { subheader: "#F0F0F0", focus: "#F0F0F0", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(240,240,240,0.15)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(240,240,240,0.15)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(240,240,240,0.15)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(240,240,240,0.1)" } } },
  },
}

export const GHOST_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, ghostThemeOptions))
