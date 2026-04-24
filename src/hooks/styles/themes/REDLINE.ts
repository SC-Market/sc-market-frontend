import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const redlineThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#CC2222", contrastText: "#FFFFFF" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#FF4444", contrastText: "#FFFFFF" } }),
    text: { primary: "#E0D0D0", secondary: "#A08080", disabled: "#503030" },
    background: { default: "#050202", paper: "#140808", sidebar: "#0A0404", navbar: "#0A0404", light: "#FFFFFF", overlay: "rgba(204,34,34,0.15)", overlayDark: "rgba(204,34,34,0.3)", imageOverlay: "rgba(5,2,2,0.85)", imageOverlayHover: "rgba(5,2,2,0.95)" },
    outline: { main: "rgba(204,34,34,0.4)" },
    divider: "rgba(204,34,34,0.4)",
    action: { hover: "rgba(204,34,34,0.15)" },
    common: { subheader: "#FF4444", focus: "#CC2222", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(204,34,34,0.4)", boxShadow: "0 0 10px rgba(204,34,34,0.15)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(204,34,34,0.4)", boxShadow: "0 0 10px rgba(204,34,34,0.15)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(204,34,34,0.4)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(204,34,34,0.25)" } } },
  },
}

export const REDLINE_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, redlineThemeOptions))
