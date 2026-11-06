import { ThemeOptions } from "@mui/material"
import {
  lightThemeOptions,
  mainThemeOptions,
  refTheme,
  themeBase,
  createAppTheme,
} from "../Theme"

export const sunsetThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#FF6F00", // Warm orange
        contrastText: "#FFFFFF",
      },
    }),
    // One accent. `demand` marks the buy side: the old second accent
    // #E91E63, moved to reach AA as text. The neutral (secondary) comes
    // from the base theme.
    demand: refTheme.palette.augmentColor({ color: { main: "#C2185B" } }),
    text: {
      primary: "#5D4037", // Brown-gray
      secondary: "#8D6E63",
      disabled: "#BCAAA4",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFF3E0", // Warm cream
      sidebar: "#FFE0B2", // Light orange
      navbar: "#FFE0B2",
      light: "#FFFFFF",
      overlay: "rgba(255, 111, 0, 0.4)",
      overlayDark: "rgba(255, 111, 0, 0.6)",
      imageOverlay: "rgba(255, 111, 0, 0.5)",
      imageOverlayHover: "rgba(255, 111, 0, 0.7)",
    },
    outline: {
      main: "rgba(255, 111, 0, 0.3)", // Orange outline
    },
    divider: "rgba(255, 111, 0, 0.3)",
    action: {
      hover: "rgba(255, 111, 0, 0.1)", // Light orange hover
    },
    common: {
      subheader: "#E64A19", // Deep orange-red for subheaders
      // 3:1 or better on paper and the page (the accent itself is lighter)
      focus: "#B34E00",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  navKind: "outlined",
  components: {
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          border: "1px solid rgba(255, 111, 0, 0.3)",
          boxShadow:
            "rgba(255, 111, 0, 0.1) 0px 0px 2px 0px, rgba(255, 111, 0, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 111, 0, 0.3)",
          boxShadow:
            "rgba(255, 111, 0, 0.1) 0px 0px 2px 0px, rgba(255, 111, 0, 0.08) 0px 12px 24px -4px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(255, 111, 0, 0.2)",
          "&::before, &::after": {
            borderColor: "rgba(255, 111, 0, 0.2)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(255, 111, 0, 0.2)",
        },
      },
    },
  },
}

export const SUNSET_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  lightThemeOptions,
  sunsetThemeOptions,
)
