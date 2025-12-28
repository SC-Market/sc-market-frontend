import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const bwinThemeOptions: ThemeOptions = {
  palette: {
    // 27354a
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "rgb(209, 54, 60)",
        // light: '#b000cc',
        // contrastText: '#89348c'
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#60071f",
        contrastText: "#FFF",
        // light: '#79018C'
      },
    }),
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "rgb(30, 30, 30)",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "rgb(20, 20, 20)",
      sidebar: "rgb(20, 20, 20)",
      navbar: "rgb(20, 20, 20)",
    },
    common: {
      subheader: "#D13624", // Red-tinted gray for subheaders
      focus: "#D13624",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  navKind: "outlined",
}

export const BWINCORP_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, bwinThemeOptions),
)
