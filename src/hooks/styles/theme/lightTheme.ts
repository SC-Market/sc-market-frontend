import { alpha } from "@mui/material/styles"
import { refTheme, NEUTRAL_LIGHT } from "./constants"
import { themeBase } from "./baseTheme"
import { createAppTheme } from "./createAppTheme"
import { ON_ACCENT_DARK } from "./contrast"
import type { ExtendedThemeOptions } from "./constants"

export const lightThemeOptions: ExtendedThemeOptions = {
  palette: {
    mode: "light",
    primary: refTheme.palette.augmentColor({
      color: {
        main: "#10b881",
      },
    }),
    secondary: refTheme.palette.augmentColor({
      color: { main: NEUTRAL_LIGHT },
    }),
    neutral: refTheme.palette.augmentColor({
      color: { main: NEUTRAL_LIGHT },
    }),
    // The buy side on white: 6.62:1 (the dark theme's #7a7efe is 3.1:1 here)
    demand: refTheme.palette.augmentColor({
      color: { main: "#4e36f5" },
    }),
    premium: refTheme.palette.augmentColor({
      color: { main: "#4e36f5" },
    }),
    // Light-mode shades (mainThemeOptions sets the dark-mode ones). Orange
    // takes dark text (6.15:1); white stays on red, where dark can't reach AA.
    error: refTheme.palette.augmentColor({ color: { main: "#d32f2f" } }),
    warning: refTheme.palette.augmentColor({
      color: { main: "#ed6c02", contrastText: ON_ACCENT_DARK },
    }),
    outline: {
      main: "rgba(0, 0, 0, 0.12)",
      // 5.74:1 on white
      strong: "#58677e",
    },
    divider: "rgba(0, 0, 0, 0.12)",
    text: {
      primary: "#000000AA",
      secondary: "#000000",
      disabled: "#EEEEEEC0",
      subtle: "rgba(0, 0, 0, 0.4)",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
      navbar: "#101827",
      sidebar: "#101827",
      overlay: "rgba(0, 0, 0, 0.5)",
      overlayDark: "rgba(0, 0, 0, 0.7)",
      imageOverlay: "rgba(0, 0, 0, 0.6)",
      imageOverlayHover: "rgba(0, 0, 0, 0.8)",
      subtleDivider: "rgba(0, 0, 0, 0.11)",
      subtleHover: "#f5f5f5",
    },
    action: {
      hover: "rgba(0, 0, 0, 0.04)",
    },
    common: {
      subheader: "rgba(0, 0, 0, 0.6)",
      // A darker green: #10b881 is 2.56:1 on white, this is 5.34:1
      focus: "#0b7a56",
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
          boxShadow:
            "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        // MUI Card accepts outlined variant at runtime; types are incomplete
        // @ts-expect-error - outlined variant style override
        outlined: {
          boxShadow:
            "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    // Links take the accent. On white the bright green is 2.56:1, so light
    // themes use its dark shade for link text (#10b881 -> 4.9:1).
    MuiLink: {
      styleOverrides: {
        root: ({ theme, ownerState }) =>
          (ownerState.color ?? "primary") === "primary"
            ? {
                color: theme.palette.primary.dark,
                textDecorationColor: alpha(theme.palette.primary.dark, 0.4),
              }
            : {},
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          bgcolor: "rgba(0, 0, 0, 0.12)",
          "&::before, &::after": {
            borderColor: "rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        // mainThemeOptions paints html with the dark background (deep-merged
        // into every theme). Light themes leave html transparent so the
        // body's background.default fills the canvas (overscroll and short
        // pages included) instead of a dark strip.
        html: { backgroundColor: "transparent" },
      },
    },
  },
}

export const lightTheme = createAppTheme(themeBase, lightThemeOptions)
