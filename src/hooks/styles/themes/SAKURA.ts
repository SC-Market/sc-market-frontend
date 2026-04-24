import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { lightThemeOptions, mainThemeOptions, refTheme, themeBase } from "../Theme"

export const sakuraThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({ color: { main: "#D4618C", contrastText: "#FFFFFF" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#A0466A", contrastText: "#FFFFFF" } }),
    text: { primary: "#2A1A20", secondary: "#6E4A56", disabled: "#C0A0B0" },
    background: { default: "#F0E4E8", paper: "#FFFFFF", sidebar: "#ECDCE2", navbar: "#FFFFFF", light: "#FFFFFF", overlay: "rgba(212,97,140,0.15)", overlayDark: "rgba(212,97,140,0.3)", imageOverlay: "rgba(212,97,140,0.4)", imageOverlayHover: "rgba(212,97,140,0.6)" },
    outline: { main: "rgba(212,97,140,0.3)" },
    divider: "rgba(212,97,140,0.3)",
    action: { hover: "rgba(212,97,140,0.1)" },
    common: { subheader: "#A0466A", focus: "#D4618C", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(212,97,140,0.3)", boxShadow: "rgba(212,97,140,0.08) 0px 0px 2px 0px, rgba(212,97,140,0.06) 0px 12px 24px -4px" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(212,97,140,0.3)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(212,97,140,0.2)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(212,97,140,0.2)" } } },
  },
}

export const SAKURA_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, lightThemeOptions, sakuraThemeOptions))
