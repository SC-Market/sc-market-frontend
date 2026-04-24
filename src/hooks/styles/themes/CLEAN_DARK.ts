import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const cleanDarkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#FFFFFF", contrastText: "#050505" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#0d9c6c", contrastText: "#FFFFFF" } }),
    text: { primary: "#E0E0E0", secondary: "#808080", disabled: "#404040" },
    background: { default: "#050505", paper: "#0E0E0E", sidebar: "#050505", navbar: "#050505", light: "#FFFFFF", overlay: "rgba(13,156,108,0.1)", overlayDark: "rgba(13,156,108,0.2)", imageOverlay: "rgba(5,5,5,0.85)", imageOverlayHover: "rgba(5,5,5,0.95)" },
    outline: { main: "rgba(255,255,255,0.15)" },
    divider: "rgba(255,255,255,0.15)",
    action: { hover: "rgba(255,255,255,0.06)" },
    common: { subheader: "#0d9c6c", focus: "#0d9c6c", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(255,255,255,0.12)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(255,255,255,0.12)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(255,255,255,0.12)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(255,255,255,0.08)" } } },
  },
}

export const CLEAN_DARK_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, cleanDarkThemeOptions))
