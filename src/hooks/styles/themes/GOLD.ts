import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const goldThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({ color: { main: "#E2C036", contrastText: "#1A1A2E" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#C8A84E", contrastText: "#FFFFFF" } }),
    text: { primary: "#E2D8B0", secondary: "#A09060", disabled: "#504830" },
    background: { default: "#0E0C08", paper: "#1A1610", sidebar: "#141008", navbar: "#141008", light: "#FFFFFF", overlay: "rgba(226,192,54,0.15)", overlayDark: "rgba(226,192,54,0.3)", imageOverlay: "rgba(14,12,8,0.85)", imageOverlayHover: "rgba(14,12,8,0.95)" },
    outline: { main: "rgba(226,192,54,0.4)" },
    divider: "rgba(226,192,54,0.4)",
    action: { hover: "rgba(226,192,54,0.15)" },
    common: { subheader: "#E2C036", focus: "#E2C036", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(226,192,54,0.4)", boxShadow: "0 0 10px rgba(226,192,54,0.15)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(226,192,54,0.4)", boxShadow: "0 0 10px rgba(226,192,54,0.15)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(226,192,54,0.4)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(226,192,54,0.25)" } } },
  },
}

export const GOLD_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, goldThemeOptions))
