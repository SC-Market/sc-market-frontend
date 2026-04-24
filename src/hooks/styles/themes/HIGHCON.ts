import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const highconThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#FFFF00", contrastText: "#000000" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#00FF00", contrastText: "#000000" } }),
    text: { primary: "#FFFFFF", secondary: "#FFFF00", disabled: "#666600" },
    background: { default: "#000000", paper: "#0A0A0A", sidebar: "#000000", navbar: "#000000", light: "#FFFFFF", overlay: "rgba(255,255,0,0.15)", overlayDark: "rgba(255,255,0,0.3)", imageOverlay: "rgba(0,0,0,0.9)", imageOverlayHover: "rgba(0,0,0,0.95)" },
    outline: { main: "rgba(255,255,255,0.5)" },
    divider: "rgba(255,255,255,0.5)",
    action: { hover: "rgba(255,255,0,0.15)" },
    common: { subheader: "#FFFF00", focus: "#FFFF00", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "2px solid rgba(255,255,255,0.5)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "2px solid rgba(255,255,255,0.5)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(255,255,255,0.5)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(255,255,255,0.3)" } } },
  },
}

export const HIGHCON_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, highconThemeOptions))
