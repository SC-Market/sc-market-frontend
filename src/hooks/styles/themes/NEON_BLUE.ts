import { ThemeOptions } from "@mui/material"
import { mainThemeOptions, refTheme, themeBase, createAppTheme } from "../Theme"

export const neonBlueThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#00D4FF",
        contrastText: "#020B18",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: {
        main: "#0066FF",
        contrastText: "#FFFFFF",
      },
    }),
    // Two-tone on purpose: the second hue stays on neutral (secondary-role)
    // controls and marks the buy side (green-only accent, 2026-11).
    neutral: refTheme.palette.augmentColor({ color: { main: "#3D8BFF" } }),
    demand: refTheme.palette.augmentColor({ color: { main: "#3D8BFF" } }),
    text: {
      primary: "#C0E8FF",
      secondary: "#6CB4E0",
      disabled: "#2A4A6B",
    },
    background: {
      default: "#020B18",
      paper: "#081828",
      sidebar: "#061220",
      navbar: "#061220",
      light: "#FFFFFF",
      overlay: "rgba(0, 212, 255, 0.15)",
      overlayDark: "rgba(0, 212, 255, 0.3)",
      imageOverlay: "rgba(2, 11, 24, 0.85)",
      imageOverlayHover: "rgba(2, 11, 24, 0.95)",
    },
    outline: {
      main: "rgba(0, 212, 255, 0.4)",
    },
    divider: "rgba(0, 212, 255, 0.4)",
    action: {
      hover: "rgba(0, 212, 255, 0.15)",
    },
    common: {
      subheader: "#00D4FF",
      focus: "#00D4FF",
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
          border: "1px solid rgba(0, 212, 255, 0.4)",
          boxShadow:
            "0 0 12px rgba(0, 212, 255, 0.2), inset 0 0 12px rgba(0, 212, 255, 0.03)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          border: "1px solid rgba(0, 212, 255, 0.4)",
          boxShadow: "0 0 12px rgba(0, 212, 255, 0.2)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: "rgba(0, 212, 255, 0.4)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(0, 212, 255, 0.25)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: "rgba(0, 212, 255, 0.5)",
          "&:hover": {
            borderColor: "#00D4FF",
            boxShadow: "0 0 8px rgba(0, 212, 255, 0.4)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: "rgba(0, 212, 255, 0.4)",
        },
      },
    },
  },
}

export const NEON_BLUE_theme = createAppTheme(
  themeBase,
  mainThemeOptions,
  neonBlueThemeOptions,
)
