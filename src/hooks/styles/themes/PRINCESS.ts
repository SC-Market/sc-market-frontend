import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { lightThemeOptions, mainThemeOptions, refTheme, themeBase } from "../Theme"

export const princessThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({ color: { main: "#F48FB1", contrastText: "#FFFFFF" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#80CBC4", contrastText: "#2A1A28" } }),
    text: { primary: "#2A1A28", secondary: "#6E4A6E", disabled: "#C0A0C0" },
    background: { default: "#F6F2FB", paper: "#FFF5F9", sidebar: "#DDE8F4", navbar: "#FFF5F9", light: "#FFFFFF", overlay: "rgba(244,143,177,0.15)", overlayDark: "rgba(244,143,177,0.3)", imageOverlay: "rgba(244,143,177,0.4)", imageOverlayHover: "rgba(244,143,177,0.6)" },
    outline: { main: "rgba(184,212,232,0.5)" },
    divider: "rgba(184,212,232,0.5)",
    action: { hover: "rgba(244,143,177,0.1)" },
    common: { subheader: "#6E4A6E", focus: "#F48FB1", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(184,212,232,0.5)", boxShadow: "rgba(200,140,200,0.06) 0px 0px 2px 0px, rgba(200,140,200,0.04) 0px 12px 24px -4px" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(184,212,232,0.5)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(184,212,232,0.3)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(184,212,232,0.3)" } } },
  },
}

export const PRINCESS_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, lightThemeOptions, princessThemeOptions))
