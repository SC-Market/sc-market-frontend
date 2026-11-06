import { ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase, createAppTheme } from "../Theme"

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
    // One accent. `demand` (the buy side) keeps the default violet, which
    // is AA here; the neutral (secondary) comes from the base theme.
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "rgb(30, 30, 30)",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "rgb(20, 20, 20)",
      sidebar: "rgb(20, 20, 20)",
      navbar: "rgb(20, 20, 20)",
    },
    // control borders, 3:1 on paper and the page
    outline: { strong: "#6e6e6e" },
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

export const BWINCORP_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  bwinThemeOptions,
)
