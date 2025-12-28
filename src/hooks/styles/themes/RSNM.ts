import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase } from "../Theme"

export const rsnmThemeOptions: ThemeOptions = {
  palette: {
    // 27354a
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#b7301A",
        // light: '#b000cc',
        // contrastText: '#89348c'
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#D8B45A",
        // contrastText: '#000',
        // light: '#79018C'
      },
    }),
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "#000000",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "#000000",
      sidebar: "#000000",
      navbar: "#000000",
    },
    common: {
      subheader: "#D8B45A", // Gold for subheaders
      focus: "#b7301A",
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

export const RSNM_theme = responsiveFontSizes(
  createTheme(themeBase, mainThemeOptions, rsnmThemeOptions),
)
