import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { lightThemeOptions, mainThemeOptions, refTheme, themeBase } from "../Theme"

export const inkThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({ color: { main: "#1A1A1A", contrastText: "#FFFFFF" } }),
    secondary: refTheme.palette.augmentColor({ color: { main: "#555555", contrastText: "#FFFFFF" } }),
    text: { primary: "#1A1A1A", secondary: "#666666", disabled: "#AAAAAA" },
    background: { default: "#FFFFFF", paper: "#F0F0F0", sidebar: "#FFFFFF", navbar: "#FFFFFF", light: "#FFFFFF", overlay: "rgba(26,26,26,0.1)", overlayDark: "rgba(26,26,26,0.2)", imageOverlay: "rgba(26,26,26,0.4)", imageOverlayHover: "rgba(26,26,26,0.6)" },
    outline: { main: "rgba(0,0,0,0.2)" },
    divider: "rgba(0,0,0,0.2)",
    action: { hover: "rgba(0,0,0,0.06)" },
    common: { subheader: "#1A1A1A", focus: "#1A1A1A", badge: { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32", purple: "#9C27B0" } },
  },
  navKind: "outlined",
  components: {
    MuiPaper: { defaultProps: { variant: "outlined" }, styleOverrides: { outlined: { border: "1px solid rgba(0,0,0,0.2)" } } },
    MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { border: "1px solid rgba(0,0,0,0.2)" } } },
    MuiDivider: { styleOverrides: { light: { backgroundColor: "rgba(0,0,0,0.15)" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: "rgba(0,0,0,0.15)" } } },
  },
}

export const INK_theme = responsiveFontSizes(createTheme(themeBase, mainThemeOptions, lightThemeOptions, inkThemeOptions))
