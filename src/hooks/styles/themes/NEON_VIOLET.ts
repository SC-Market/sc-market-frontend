import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const neonVioletThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#B44EFF", contrastText: "#060810" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#00E5FF", contrastText: "#060810" } }),
    text: { primary: "#C0D0F0", secondary: "#5068A0", disabled: "#2A3460" },
    background: { default: "#060810", paper: "#0A0E1A", sidebar: "#080C18", navbar: "#080C18", light: "#FFFFFF", overlay: "rgba(180,78,255,0.15)", overlayDark: "rgba(180,78,255,0.3)", imageOverlay: "rgba(6,8,16,0.85)", imageOverlayHover: "rgba(6,8,16,0.95)" },
    outline: { main: "rgba(180,78,255,0.4)" },
    divider: "rgba(180,78,255,0.4)",
    action: { hover: "rgba(180,78,255,0.15)" },
    common: { subheader: "#00E5FF", focus: "#B44EFF", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#B44EFF" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(180,78,255,0.4)", boxShadow: "0 0 12px rgba(180,78,255,0.2)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(180,78,255,0.4)", boxShadow: "0 0 12px rgba(180,78,255,0.2)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(180,78,255,0.4)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(180,78,255,0.25)" } } },
  },
}

export const NEON_VIOLET_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, neonVioletThemeOptions))
