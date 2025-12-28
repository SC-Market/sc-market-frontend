import { createTheme, responsiveFontSizes, ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
} from "../Theme"

export const medrunnerThemeOptions: ThemeOptions = {
  palette: {
    // 27354a
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "rgb(155, 0, 2)",
        // light: '#b000cc',
        // contrastText: '#89348c'
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "rgb(40, 217, 199)",
        contrastText: "#FFF",
        // light: '#79018C'
      },
    }),
    background: {
      // default: "linear-gradient(45deg, #cb5cff, #9c61f8)",
      default: "#eeeff2",
      // default: "url(https://wallpaperaccess.com/download/dark-minimalist-568180)",
      // default: "url(https://wallpaperaccess.com/download/minimalist-space-1145565)",
      paper: "#FFFFFF",
      sidebar: "#FFFFFF",
      navbar: "transparent",
    },
    common: {
      subheader: "rgba(155, 0, 2, 0.7)", // Dark red for subheaders
      focus: "rgb(155, 0, 2)",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 8,
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 8,
      },
    },
  },
}

export const MEDRUNNER_theme = responsiveFontSizes(
  createTheme(
    themeBase,
    mainThemeOptions,
    lightThemeOptions,
    medrunnerThemeOptions,
  ),
)
